'use strict';

/*
 * Regression suite: _parseDeepFieldName warnings must not log posted data
 * (prototypes/server/extend/request-postdata.js).
 *
 * Before the fix every warning logged `{ container, fieldName, fieldData }`,
 * i.e. the whole parsed request.body / request.files plus the field value;
 * one warning used console.warn even with `debug: false`, and raw field
 * names allowed log injection through new lines.
 *
 * A secret is posted through every warning path with debug enabled; all
 * console / logger output is captured and must not contain it.
 *
 * Runs a real SGAppsServer on 127.0.0.1 with a random port.
 * No external framework: project does not declare one. Pure Node + assert.
 */

const assert = require('assert');
const http   = require('http');
const util   = require('util');

const { SGAppsServer } = require('..');

const SECRET = 'S3CRET-p4ssw0rd-token';
const BOUNDARY = '----------LogLeakBoundary1234';

const captured = [];
const record = (...args) => captured.push(util.format(...args));
const recorder = { log: record, info: record, warn: record, error: record, debug: record };

// capture direct console usage too (bypassing the logger)
['log', 'info', 'warn', 'error', 'debug'].forEach((method) => {
	console[method] = record;
});

function buildApp(debug) {
	const app = new SGAppsServer({ debug });
	app.logger._console = recorder;
	app.post('/body', (request, response) => {
		request.postData.then(() => response.send({ ok: true }), (err) => response.sendError(err));
	});
	return app;
}

function listen(app) {
	return app.whenReady.then(() => new Promise((resolve) => {
		app.server().listen(0, '127.0.0.1', () => resolve(app.server().address().port));
	}));
}

function multipart(fields) {
	return fields.map(([name, value]) => (
		`--${BOUNDARY}\r\n`
		+ `Content-Disposition: form-data; name="${name}"\r\n\r\n`
		+ `${value}\r\n`
	)).join('') + `--${BOUNDARY}--\r\n`;
}

function post(port, body) {
	return new Promise((resolve, reject) => {
		const req = http.request({
			host: '127.0.0.1',
			port,
			path: '/body',
			method: 'POST',
			headers: {
				'content-type': `multipart/form-data; boundary=${BOUNDARY}`,
				'content-length': Buffer.byteLength(body)
			}
		}, (res) => {
			res.resume();
			res.on('end', () => resolve(res.statusCode));
		});
		req.setTimeout(2000, () => req.destroy(Error('timeout POST /body')));
		req.on('error', reject);
		req.end(body);
	});
}

// every field triggers (at least) one _parseDeepFieldName warning
const FIELDS = [
	['password', SECRET],                 // value parsed first, then dumped via container
	['[nobase]', SECRET],                 // fieldName without base
	['plain', SECRET],
	['plain', SECRET],                    // overwriting plain field
	['test[arr][data]', SECRET],
	['test[arr][]', SECRET],              // writing array field into an object
	['test[data]', SECRET],
	['test[data]', SECRET],               // overwriting nested field
	['list[]', SECRET],
	['list[x]', SECRET],                  // converting array to object
	['nested[][y]', SECRET],              // intermediary "[]"
	['scalar', SECRET],
	['scalar[k][j]', SECRET],             // value is not an object
	['__proto__[a]', SECRET],             // forbidden key
	['inject\nFAKE LOG LINE[a]', SECRET], // log injection attempt
	['inject\nFAKE LOG LINE[a]', SECRET]
];

async function testDebugOn() {
	const port = await listen(buildApp(true));
	captured.length = 0;

	assert.strictEqual(await post(port, multipart(FIELDS)), 200);

	const output = captured.join('\n');
	assert.ok(
		/\[Request\._parseDeepFieldName\]/.test(output),
		'warnings are still emitted in debug mode'
	);
	assert.ok(!output.includes(SECRET), `posted value leaked into logs:\n${output}`);
	assert.ok(!/\nFAKE LOG LINE/.test(output), 'raw new line from field name reached the logs');
	assert.ok(output.includes('"inject\\nFAKE LOG LINE[a]"'), 'field name is logged escaped');
	assert.ok(
		output.includes('Overwriting field value "plain"'),
		'real duplicate plain field is reported'
	);
	assert.ok(
		!output.includes('Overwriting field value "password"'),
		'first occurrence of a plain field must not be reported as overwrite'
	);
	process.stdout.write('  OK debug=true         — warnings kept, no values, field names escaped\n');
}

async function testDebugOff() {
	const port = await listen(buildApp(false));
	captured.length = 0;

	assert.strictEqual(await post(port, multipart(FIELDS)), 200);

	const output = captured.join('\n');
	assert.ok(!output.includes(SECRET), `posted value leaked into logs:\n${output}`);
	assert.ok(
		!/\[Request\._parseDeepFieldName\]/.test(output),
		`parser warnings emitted with debug=false:\n${output}`
	);
	process.stdout.write('  OK debug=false        — no parser warnings at all\n');
}

process.stdout.write('request-postdata log leak regression suite\n');

(async () => {
	try {
		await testDebugOn();
		await testDebugOff();
	} catch (err) {
		process.stderr.write(`${err.stack || err}\n`);
		process.exit(1);
	}
	process.stdout.write('ALL TESTS PASSED\n');
	// SessionManager keeps a setInterval alive; exit explicitly
	process.exit(0);
})();
