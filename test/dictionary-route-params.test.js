'use strict';

/*
 * Regression suite for string routes with named segments (`/users/:id`)
 * in prototypes/dictionary.js » routeMatch.
 *
 * Before the fix these routes never matched (404) in either strictRouting
 * mode although docs/routing/index.md documents them.
 *
 * Runs real SGAppsServer instances on 127.0.0.1 with random ports.
 * No external framework: project does not declare one. Pure Node + assert.
 */

const assert = require('assert');
const http   = require('http');

const { SGAppsServer } = require('..');

function buildApp(strictRouting) {
	const app = new SGAppsServer({ debug: false, strictRouting });
	const reply = (request, response) => {
		const params = {};
		Object.keys(request.params).forEach((key) => {
			if (!/^\d+$/.test(key)) params[key] = request.params[key];
		});
		response.send({ params, index: Array.from(request.params) });
	};
	app.get('/users/:name/:age', reply);
	app.get('/users/:id', reply);
	app.get('/files/:file.json', reply);
	app.get('/slash/:id/', reply);
	app.get('^/re/:id(\\d+)', reply);
	app.get('/static', (request, response) => response.send('static'));
	return app;
}

function get(port, path) {
	return new Promise((resolve, reject) => {
		const req = http.get({ host: '127.0.0.1', port, path }, (res) => {
			const chunks = [];
			res.on('data', (chunk) => chunks.push(chunk));
			res.on('end', () => {
				const body = Buffer.concat(chunks).toString();
				let json = null;
				try { json = JSON.parse(body); } catch (err) { /* not json */ }
				resolve({ statusCode: res.statusCode, body, json });
			});
		});
		req.setTimeout(2000, () => req.destroy(Error(`timeout GET ${path}`)));
		req.on('error', reject);
	});
}

function listen(app) {
	return app.whenReady.then(() => new Promise((resolve) => {
		app.server().listen(0, '127.0.0.1', () => resolve(app.server().address().port));
	}));
}

async function expectParams(port, path, params) {
	const res = await get(port, path);
	assert.strictEqual(res.statusCode, 200, `${path}: status (${res.body})`);
	assert.deepStrictEqual(res.json.params, params, `${path}: params`);
	return res;
}

async function expect404(port, path) {
	const res = await get(port, path);
	assert.strictEqual(res.statusCode, 404, `${path}: expected 404, got ${res.statusCode} ${res.body}`);
}

async function testStrict() {
	const port = await listen(buildApp(true));

	const res = await expectParams(port, '/users/42', { id: '42' });
	assert.deepStrictEqual(res.json.index, ['', 'users', '42'], 'array part of params kept');
	await expectParams(port, '/users/alice/30', { name: 'alice', age: '30' });
	await expectParams(port, '/users/ion%20pop', { id: 'ion pop' });
	await expectParams(port, '/files/report.json', { file: 'report' });
	await expectParams(port, '/slash/7/', { id: '7' });
	await expectParams(port, '/re/42', { id: '42' });

	await expect404(port, '/users/42/');        // strict: trailing slash differs
	await expect404(port, '/users/');           // empty segment
	await expect404(port, '/users/a/b/c');      // too many segments
	await expect404(port, '/x/users/42');       // anchored at start
	await expect404(port, '/files/reportXjson'); // "." is literal
	await expect404(port, '/slash/7');          // strict: route requires slash

	console.log('  OK strictRouting=true  — params extracted, exact matching');
}

async function testLoose() {
	const port = await listen(buildApp(false));

	await expectParams(port, '/users/42', { id: '42' });
	await expectParams(port, '/users/42/', { id: '42' });
	await expectParams(port, '/users/alice/30/', { name: 'alice', age: '30' });
	await expectParams(port, '/slash/7', { id: '7' });
	await expectParams(port, '/slash/7/', { id: '7' });

	await expect404(port, '/users/');
	await expect404(port, '/x/users/42');

	console.log('  OK strictRouting=false — params extracted, trailing slash optional');
}

console.log('dictionary route params regression suite');

(async () => {
	try {
		await testStrict();
		await testLoose();
	} catch (err) {
		console.error(err);
		process.exit(1);
	}
	console.log('ALL TESTS PASSED');
	// SessionManager keeps a setInterval alive; exit explicitly
	process.exit(0);
})();
