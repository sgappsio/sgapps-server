'use strict';

/*
 * Regression suite for:
 *  - multipart file upload crashing on `fileData.push` (fileData was null)
 *    » prototypes/server/extend/request-postdata.js
 *  - malformed / unsatisfiable `Range` header throwing ERR_OUT_OF_RANGE
 *    outside any handler » prototypes/server/extend/response-pipe-file.js
 *  - absolute paths leaking to clients through error responses
 *    » prototypes/server.js handleStaticRequest, response-error.js sendError
 *
 * Runs a real SGAppsServer on 127.0.0.1 with a random port.
 * No external framework: project does not declare one. Pure Node + assert.
 */

const assert = require('assert');
const fs     = require('fs');
const os     = require('os');
const path   = require('path');
const http   = require('http');

const { SGAppsServer } = require('..');

const uncaught = [];
process.on('uncaughtException', (err) => {
	uncaught.push(err);
});

const FILE_CONTENT = 'hello static\n'; // 13 bytes
const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sgapps-server-test-'));
fs.writeFileSync(path.join(rootDir, 'a.txt'), FILE_CONTENT);

const app = new SGAppsServer({ debug: false });

let lastUpload = null;
app.post('/upload', (request, response) => {
	request.postData.then(() => {
		lastUpload = request.fileItems.map((file) => ({
			fieldName: file.fieldName,
			fileName: file.data.fileName,
			loaded: file.data.loaded,
			fileSize: file.data.fileSize,
			fileData: file.data.fileData
		}));
		response.send({ ok: true });
	}, (err) => {
		response.sendError(err);
	});
});

// pipeFileStatic without callback » fs error goes through sendError(err)
app.get('/raw-missing', (request, response) => {
	response.pipeFileStatic(path.join(rootDir, 'missing.txt'), 'missing.txt');
});

app.get('/*', (request, response) => {
	app.handleStaticRequest(request, response, rootDir);
});

function httpRequest(port, options, body) {
	return new Promise((resolve, reject) => {
		const req = http.request(
			Object.assign({ host: '127.0.0.1', port }, options),
			(res) => {
				const chunks = [];
				res.on('data', (chunk) => chunks.push(chunk));
				res.on('end', () => resolve({
					statusCode: res.statusCode,
					headers: res.headers,
					body: Buffer.concat(chunks).toString()
				}));
			}
		);
		req.setTimeout(2000, () => {
			req.destroy(Error(`timeout ${options.method || 'GET'} ${options.path}`));
		});
		req.on('error', reject);
		req.end(body);
	});
}

async function testUpload(port) {
	const boundary = '----------TestBoundary1234';
	const body = [
		`--${boundary}\r\n`,
		'Content-Disposition: form-data; name="title"\r\n\r\n',
		'demo\r\n',
		`--${boundary}\r\n`,
		'Content-Disposition: form-data; name="doc"; filename="a.txt"\r\n',
		'Content-Type: text/plain\r\n\r\n',
		'hello upload\r\n',
		`--${boundary}--\r\n`
	].join('');

	const res = await httpRequest(port, {
		method: 'POST',
		path: '/upload',
		headers: {
			'content-type': `multipart/form-data; boundary=${boundary}`,
			'content-length': Buffer.byteLength(body)
		}
	}, body);

	assert.strictEqual(res.statusCode, 200, 'upload answered 200');
	assert.strictEqual(uncaught.length, 0, `no uncaught exception: ${uncaught.map(String)}`);
	assert.strictEqual(lastUpload.length, 1);
	assert.strictEqual(lastUpload[0].fieldName, 'doc');
	assert.strictEqual(lastUpload[0].fileName, 'a.txt');
	assert.strictEqual(lastUpload[0].loaded, true);
	assert.ok(Buffer.isBuffer(lastUpload[0].fileData), 'fileData is a Buffer');
	assert.strictEqual(lastUpload[0].fileData.toString(), 'hello upload');
	assert.strictEqual(lastUpload[0].fileSize, 'hello upload'.length);
	console.log('  OK upload             — file loaded into Buffer, no uncaught exception');
}

async function testRanges(port) {
	const total = Buffer.byteLength(FILE_CONTENT);
	const cases = [
		// [range header, status, body, content-range]
		['bytes=2-4',     206, FILE_CONTENT.slice(2, 5),  `bytes 2-4/${total}`],
		['bytes=-5',      206, FILE_CONTENT.slice(-5),    `bytes ${total - 5}-${total - 1}/${total}`],
		['bytes=-500',    206, FILE_CONTENT,              `bytes 0-${total - 1}/${total}`],
		['bytes=3-',      206, FILE_CONTENT.slice(3),     `bytes 3-${total - 1}/${total}`],
		['bytes=0-999',   206, FILE_CONTENT,              `bytes 0-${total - 1}/${total}`],
		['bytes=50-',     416, '',                        `bytes */${total}`],
		['bytes=13-20',   416, '',                        `bytes */${total}`],
		['bytes=-0',      416, '',                        `bytes */${total}`],
		['bytes=5-2',     200, FILE_CONTENT,              undefined],
		['bytes=abc',     200, FILE_CONTENT,              undefined],
		['bytes=0-1,4-5', 200, FILE_CONTENT,              undefined],
		['bytes=-',       200, FILE_CONTENT,              undefined],
	];

	for (const [range, statusCode, body, contentRange] of cases) {
		const res = await httpRequest(port, {
			method: 'GET',
			path: '/a.txt',
			headers: { range }
		});
		assert.strictEqual(res.statusCode, statusCode, `${range}: status`);
		assert.strictEqual(res.body, body, `${range}: body`);
		assert.strictEqual(res.headers['content-range'], contentRange, `${range}: content-range`);
		if (statusCode !== 416) {
			assert.strictEqual(
				Number(res.headers['content-length']),
				Buffer.byteLength(body),
				`${range}: content-length`
			);
		}
	}
	assert.strictEqual(uncaught.length, 0, `no uncaught exception: ${uncaught.map(String)}`);
	console.log(`  OK range              — ${cases.length} Range variants, no uncaught exception`);
}

async function testNoPathLeak(port) {
	const res404 = await httpRequest(port, { method: 'GET', path: '/missing.txt' });
	assert.strictEqual(res404.statusCode, 404);
	assert.ok(!res404.body.includes(rootDir), `404 body leaks path: ${res404.body}`);
	assert.ok(!res404.body.includes('ENOENT'), `404 body leaks errno: ${res404.body}`);

	const res500 = await httpRequest(port, { method: 'GET', path: '/raw-missing' });
	assert.strictEqual(res500.statusCode, 500);
	assert.strictEqual(res500.body, 'Internal Server Error');

	console.log('  OK no path leak       — static 404 and system-error 500 hide fs details');
}

console.log('request-postdata / range / error-leak regression suite');

app.whenReady.then(() => {
	app.server().listen(0, '127.0.0.1', async () => {
		const { port } = app.server().address();
		let failed = null;
		try {
			await testUpload(port);
			await testRanges(port);
			await testNoPathLeak(port);
		} catch (err) {
			failed = err;
		}
		fs.rmSync(rootDir, { recursive: true, force: true });
		if (failed) {
			console.error(failed);
			process.exit(1);
		}
		console.log('ALL TESTS PASSED');
		// SessionManager keeps a setInterval alive; exit explicitly
		process.exit(0);
	});
}, (err) => {
	console.error(err);
	process.exit(1);
});
