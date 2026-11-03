'use strict';

/*
 * Regression suite for prototype pollution through request bodies
 * in prototypes/server/extend/request-postdata.js:
 *  - multipart field names parsed by _parseDeepFieldName
 *    ("__proto__[x]", "constructor[prototype][x]", "a[__proto__][x]")
 *  - multipart with _REQUEST_FORM_PARAMS_DEEP_PARSE disabled
 *  - JSON body `{"__proto__": {...}}` replacing request.body's prototype
 *  - urlencoded body (parseUrlVars from application-prototype >= 1.31.2)
 *
 * Runs real SGAppsServer instances on 127.0.0.1 with random ports.
 * No external framework: project does not declare one. Pure Node + assert.
 */

const assert = require('assert');
const http   = require('http');

const { SGAppsServer } = require('..');

const uncaught = [];
process.on('uncaughtException', (err) => {
	uncaught.push(err);
});

const BOUNDARY = '----------PollutionBoundary1234';

function buildApp(deepParse) {
	const app = new SGAppsServer({ debug: false, _REQUEST_FORM_PARAMS_DEEP_PARSE: deepParse });
	app.post('/body', (request, response) => {
		request.postData.then(() => {
			response.send({
				body: request.body,
				bodyProtoIsObject: Object.getPrototypeOf(request.body) === Object.prototype,
				inheritedIsAdmin: request.body.isAdmin,
				fileFields: Object.keys(request.files),
				fileItems: request.fileItems.map((file) => ({
					fieldName: file.fieldName,
					loaded: file.data.loaded,
					data: file.data.fileData ? file.data.fileData.toString() : null
				}))
			});
		}, (err) => response.sendError(err));
	});
	return app;
}

function listen(app) {
	return app.whenReady.then(() => new Promise((resolve) => {
		app.server().listen(0, '127.0.0.1', () => resolve(app.server().address().port));
	}));
}

function post(port, contentType, body) {
	return new Promise((resolve, reject) => {
		const req = http.request({
			host: '127.0.0.1',
			port,
			path: '/body',
			method: 'POST',
			headers: {
				'content-type': contentType,
				'content-length': Buffer.byteLength(body)
			}
		}, (res) => {
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const text = Buffer.concat(chunks).toString();
				resolve({ statusCode: res.statusCode, text, json: JSON.parse(text) });
			});
		});
		req.setTimeout(2000, () => req.destroy(Error('timeout POST /body')));
		req.on('error', reject);
		req.end(body);
	});
}

function multipart(fields, files) {
	const parts = [];
	fields.forEach(([name, value]) => {
		parts.push(
			`--${BOUNDARY}\r\n`
			+ `Content-Disposition: form-data; name="${name}"\r\n\r\n`
			+ `${value}\r\n`
		);
	});
	(files || []).forEach(([name, content]) => {
		parts.push(
			`--${BOUNDARY}\r\n`
			+ `Content-Disposition: form-data; name="${name}"; filename="f.txt"\r\n`
			+ 'Content-Type: text/plain\r\n\r\n'
			+ `${content}\r\n`
		);
	});
	return parts.join('') + `--${BOUNDARY}--\r\n`;
}

function assertClean(label) {
	const probe = {};
	['polluted', 'polluted2', 'polluted3', 'polluted4', 'isAdmin', 'push'].forEach((key) => {
		assert.strictEqual(probe[key], undefined, `${label}: Object.prototype.${key} is polluted`);
	});
	assert.strictEqual(uncaught.length, 0, `${label}: uncaught ${uncaught.map(String)}`);
}

async function testDeepParse() {
	const port = await listen(buildApp(true));

	const res = await post(
		port,
		`multipart/form-data; boundary=${BOUNDARY}`,
		multipart([
			['__proto__[polluted]', 'yes'],
			['constructor[prototype][polluted2]', 'yes'],
			['a[__proto__][polluted3]', 'yes'],
			['a[constructor][prototype][polluted4]', 'yes'],
			['user[name]', 'ion'],
			['tags[]', 'x'],
			['tags[]', 'y']
		], [
			['__proto__[file]', 'evil'],
			['doc', 'good']
		])
	);
	assert.strictEqual(res.statusCode, 200, res.text);
	assertClean('multipart deep');
	assert.deepStrictEqual(res.json.body, { user: { name: 'ion' }, tags: ['x', 'y'] }, 'legit deep fields kept');
	assert.deepStrictEqual(res.json.fileFields, ['doc'], 'forbidden file field skipped');
	assert.strictEqual(res.json.fileItems.length, 2, 'both file streams consumed');
	assert.ok(res.json.fileItems.every((file) => file.loaded), 'all files loaded');
	console.log('  OK multipart deep     — forbidden keys ignored, legit fields kept');

	const resJson = await post(
		port,
		'application/json',
		'{"__proto__": {"isAdmin": true}, "name": "ion"}'
	);
	assert.strictEqual(resJson.statusCode, 200, resJson.text);
	assert.strictEqual(resJson.json.bodyProtoIsObject, true, 'request.body prototype unchanged');
	assert.strictEqual(resJson.json.inheritedIsAdmin, undefined, 'no inherited isAdmin');
	assert.deepStrictEqual(resJson.json.body, { name: 'ion' });
	assertClean('json');
	console.log('  OK json               — "__proto__" key does not replace body prototype');

	const resUrl = await post(
		port,
		'application/x-www-form-urlencoded',
		'__proto__[polluted]=yes&constructor[prototype][polluted2]=yes&a[b]=1'
	);
	assert.strictEqual(resUrl.statusCode, 200, resUrl.text);
	assert.strictEqual(resUrl.json.bodyProtoIsObject, true, 'request.body prototype unchanged');
	assert.deepStrictEqual(resUrl.json.body.a, { b: '1' });
	assertClean('urlencoded');
	console.log('  OK urlencoded         — no pollution');
}

async function testFlatParse() {
	const port = await listen(buildApp(false));

	const res = await post(
		port,
		`multipart/form-data; boundary=${BOUNDARY}`,
		multipart([
			['__proto__', 'yes'],
			['name', 'ion']
		], [
			['__proto__', 'evil'],
			['doc', 'good']
		])
	);
	assert.strictEqual(res.statusCode, 200, res.text);
	assertClean('multipart flat');
	assert.strictEqual(res.json.bodyProtoIsObject, true, 'request.body prototype unchanged');
	assert.deepStrictEqual(res.json.body, { name: 'ion' });
	assert.deepStrictEqual(res.json.fileFields, ['doc']);
	assert.strictEqual(res.json.fileItems.length, 2, 'both file streams consumed');
	assert.ok(res.json.fileItems.every((file) => file.loaded), 'all files loaded');
	console.log('  OK multipart flat     — forbidden keys ignored without deep parse');
}

console.log('request-postdata prototype pollution regression suite');

(async () => {
	try {
		await testDeepParse();
		await testFlatParse();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	console.log('ALL TESTS PASSED');
	// SessionManager keeps a setInterval alive; exit explicitly
	process.exit(0);
})();
