'use strict';

/*
 * Regression suite for the SessionManager worker-branch IPC listener leak
 * fixed in prototypes/server/extend/request-session.js.
 *
 * In the broken version every HTTP request handled by a cluster worker
 * added a persistent `process.on('message', ...)` listener; that closure
 * retained `request` and each incoming IPC frame iterated all listeners
 * synchronously. Here we drive the decorator directly, with cluster
 * forced into worker mode, and assert that process.listenerCount('message')
 * never drifts from baseline — across happy, timeout, race, and anti-warning
 * scenarios.
 *
 * No external framework: project does not declare one. Pure Node + assert.
 */

const assert  = require('assert');
const cluster = require('cluster');

// Force the worker branch of RequestSessionDecorator. Both flags are read
// at call time, so overriding here (before any invocation) is sufficient.
Object.defineProperty(cluster, 'isMaster',  { value: false, configurable: true, writable: true });
Object.defineProperty(cluster, 'isPrimary', { value: false, configurable: true, writable: true });

// `process.send` is only present inside child processes. Provide a no-op so
// the decorator's outbound IPC does not throw when running under `node`.
process.send = function () { return true; };

// test1/test2 batch requests synchronously, so the attached listener count
// briefly reaches N before any timeout/response drains. That transient batch
// trips Node's default-10 MaxListenersExceededWarning and spams the suite
// output even though the fix is correct (the count returns to baseline after
// each callback fires). Disable the auto-warn here; test4 restores it to 10
// explicitly to exercise the real anti-warning assertion.
process.setMaxListeners(0);

const RequestSessionDecorator = require('../prototypes/server/extend/request-session.js');

function buildServer(workersSyncMaxDelay) {
	const server = {
		logger: {
			warn:  function () {},
			log:   function () {},
			error: function () {}
		},
		SessionManager: null
	};
	// Initialization pass: (null, null, server, cb) installs server.SessionManager.
	// Because isMaster/isPrimary are false the master-side worker fork hook is skipped,
	// so no 'message' listeners are added here.
	RequestSessionDecorator(null, null, server, function () {});
	if (workersSyncMaxDelay !== undefined) {
		server.SessionManager._options.workersSyncMaxDelay = workersSyncMaxDelay;
	}
	return server;
}

function buildRequestResponse(sessionId) {
	const cookieStore = sessionId ? { ssiddyn: sessionId } : {};
	const request = {
		request: {
			headers: {},
			connection: { remoteAddress: '127.0.0.1' },
			socket:     { remoteAddress: '127.0.0.1' }
		},
		cookies: {
			get: function (name) { return cookieStore[name] || null; },
			set: function (name, value) { cookieStore[name] = value; }
		}
	};
	const response = { _destroy: [] };
	return { request: request, response: response };
}

function sleep(ms) {
	return new Promise(function (resolve) { setTimeout(resolve, ms); });
}

function runOnce(server, sessionId, onDone) {
	const io = buildRequestResponse(sessionId);
	RequestSessionDecorator(io.request, io.response, server, function () {
		onDone(io.request);
	});
	return io.request;
}

function masterResponse(req, data) {
	process.emit('message', {
		type:      'sgapps-server:session-manager:worker-data-response',
		sessionId: req.session._id,
		data:      data || {},
		pid:       1
	});
}

async function test1Happy() {
	const server   = buildServer(1000);
	const baseline = process.listenerCount('message');
	const N        = 100;
	let completed  = 0;

	for (let i = 0; i < N; i++) {
		const req = runOnce(server, 'sess-happy-' + i, function () { completed++; });
		masterResponse(req, { k: i });
	}

	assert.strictEqual(completed, N, 'all N callbacks fired on happy path');
	assert.strictEqual(
		process.listenerCount('message'), baseline,
		'listener count drifted after ' + N + ' happy-path iterations (got ' +
			process.listenerCount('message') + ', baseline ' + baseline + ')'
	);
	console.log('  OK test1Happy          — ' + N + ' iterations, listener count stable at ' + baseline);
}

async function test2Timeout() {
	const server   = buildServer(10);
	const baseline = process.listenerCount('message');
	const N        = 100;
	let completed  = 0;

	for (let i = 0; i < N; i++) {
		runOnce(server, 'sess-timeout-' + i, function () { completed++; });
	}

	// Wait well past workersSyncMaxDelay for all timeouts to flush.
	await sleep(80);

	assert.strictEqual(completed, N, 'all N callbacks fired via timeout fallback');
	assert.strictEqual(
		process.listenerCount('message'), baseline,
		'listener count drifted after ' + N + ' timeout iterations (got ' +
			process.listenerCount('message') + ', baseline ' + baseline + ')'
	);
	console.log('  OK test2Timeout        — ' + N + ' iterations via timeout, listener count stable at ' + baseline);
}

async function test3Race() {
	const server   = buildServer(10);
	const baseline = process.listenerCount('message');
	let callbackCount = 0;

	const req = runOnce(server, 'sess-race', function () { callbackCount++; });

	// Timeout fires at ~10ms; wait past it, then deliver a late "master" response.
	await sleep(25);
	assert.strictEqual(callbackCount, 1, 'callback invoked exactly once by timeout');
	assert.strictEqual(
		process.listenerCount('message'), baseline,
		'listener detached after timeout (count ' + process.listenerCount('message') + ', baseline ' + baseline + ')'
	);

	masterResponse(req, { k: 'late' });

	assert.strictEqual(callbackCount, 1, 'late master response did NOT re-invoke callback');
	assert.strictEqual(
		process.listenerCount('message'), baseline,
		'listener still detached after late emit (count ' + process.listenerCount('message') + ', baseline ' + baseline + ')'
	);
	console.log('  OK test3Race           — timeout wins, late response ignored, callback fired once');
}

async function test4NoWarning() {
	// With the fix the attached listener count never exceeds 1 under this
	// synchronous-emit shape, so a per-emitter cap of 10 must stay below the
	// MaxListenersExceededWarning threshold across 1000 iterations.
	const originalMax = process.getMaxListeners();  // whatever the suite set (0 at start)
	process.setMaxListeners(10);

	const warnings = [];
	const onWarn   = function (w) { warnings.push(w); };
	process.on('warning', onWarn);

	try {
		const server = buildServer(1000);
		const N      = 1000;
		for (let i = 0; i < N; i++) {
			const req = runOnce(server, 'sess-smoke-' + i, function () {});
			masterResponse(req, { k: i });
		}
		// process.emitWarning() is deferred; let the event loop drain.
		await sleep(50);

		const maxWarnings = warnings.filter(function (w) {
			return w && w.name === 'MaxListenersExceededWarning';
		});
		assert.strictEqual(
			maxWarnings.length, 0,
			'MaxListenersExceededWarning emitted — listener leak reproduced (' + maxWarnings.length + ' warning[s])'
		);
	} finally {
		process.removeListener('warning', onWarn);
		process.setMaxListeners(originalMax);
	}
	console.log('  OK test4NoWarning      — 1000 iterations under setMaxListeners(10), no MaxListenersExceededWarning');
}

(async function run() {
	try {
		console.log('request-session worker IPC listener-leak regression suite');
		console.log('  initial process.listenerCount("message") = ' + process.listenerCount('message'));
		await test1Happy();
		await test2Timeout();
		await test3Race();
		await test4NoWarning();
		console.log('ALL TESTS PASSED');
		// setInterval inside RequestSessionDecorator keeps the loop alive; exit cleanly.
		process.exit(0);
	} catch (err) {
		console.error('FAIL');
		console.error(err && (err.stack || err.message || err));
		process.exit(1);
	}
})();
