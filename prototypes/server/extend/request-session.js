const _cluster = require('cluster');
/**
 * @class
 * @name SGAppsServerRequestSession
 * @param {SGAppsServerRequest} request
 * @param {SGAppsSessionManagerOptions} options
 */
function SGAppsServerRequestSessionBuilder(request, options) {
	/**
	 * @typedef {object} SGAppsSessionManagerOptions
	 * @property {number} [SESSION_LIFE=600] 
	 * @property {string} [cookie='ssiddyn'] 
	 */

	/**
	 * @typedef {object} SGAppsServerRequestSessionCache
	 * @property {number} expire
	 * @property {object} data
	 */

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name _created
	 * @type {number}
	 */
	this._created = new Date().valueOf();
	var _this = this;

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name _ip
	 * @type {string}
	 */
	this._ip = (
		(
			request.request ? (
				Array.isArray(request.request.headers['x-forwarded-for']) ? (
					request.request.headers['x-forwarded-for'][0]
				) : request.request.headers['x-forwarded-for']
			) : null
		) || (
			( request.request && request.request.connection )
			? request.request.connection.remoteAddress
			: null
		) || (
			( request.request && request.request.socket )
			? request.request.socket.remoteAddress
			: null
		) || ''
	);

	/**
	 * Session was received from previously saved cookie
	 * @memberof SGAppsServerRequestSession#
	 * @name _confirmed
	 * @type {boolean}
	 */
	this._confirmed = false;

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name _id
	 * @type {string}
	 */
	this._id = request.cookies ? (
		request.cookies.get(
			options.cookie,
			{ secure: true }
		) || request.cookies.get(
			options.cookie,
			{ secure: false }
		) || null
	) : null;

	if (this._id === null) {
		this._id = `sess-${
			Math.floor(1E6 + 1E6 * Math.random()).toString(36)
			}-${
				new Date().valueOf().toString(36)
			}`;

		request.cookies.set(
			options.cookie,
			this._id,
			{
				secure: true
			},
			true
		);
		request.cookies.set(
			options.cookie,
			this._id,
			{
				secure: false
			},
			true
		);
	} else {
		this._confirmed = true;
	}
	
	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name _options
	 * @type {SGAppsSessionManagerOptions}
	 */
	this._options = Object.assign(
		{ SESSION_LIFE: 600, cookie: 'ssiddyn' },
		options || {}
	);

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name data
	 * @type {object}
	 */
	this.data = null;

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @method destroy
	 */
	this.destroy = function () {
		_this.data = null;
		_this._id = null;
		_this._ip = null;
		_this._options = null;
		delete _this.destroy;
	};

	return this;
}

/**
 * @class
 * @name SGAppsSessionManager
 * @param {SGAppsServer} server
 * @param {SGAppsSessionManagerOptions} [options]
 */
function SGAppsSessionManager(server, options) {
	/**
	 * @memberof SGAppsSessionManager#
	 * @name _options
	 * @type {SGAppsSessionManagerOptions}
	 */
	this._options = Object.assign(
		{ SESSION_LIFE: 600, cookie: 'ssiddyn', workersSyncMaxDelay: 200 },
		options || {}
	);


	/**
	 * @memberof SGAppsSessionManager#
	 * @name _enabled
	 * @type {boolean}
	 */
	this._enabled = true;

	/**
	 * @memberof SGAppsSessionManager#
	 * @name _sessions
	 * @type {Object<string,SGAppsServerRequestSessionCache>}
	 */
	this._sessions = {};

	return this;
};

/**
 * @memberof SGAppsSessionManager#
 * @method removeExpiredSessions
 */
SGAppsSessionManager.prototype.removeExpiredSessions = function () {
	const time = new Date().valueOf();
	let sessionId;
	for (sessionId in this._sessions) {
		if (this._sessions[sessionId].expire <= time) {
			this._sessions[sessionId].data = null;
			delete this._sessions[sessionId];
		}
	}
};

/**
 * @memberof SGAppsSessionManager#
 * @method handleRequest
 * @param {SGAppsServerRequest} request
 */
SGAppsSessionManager.prototype.handleRequest = function (request) {
	request.session = new SGAppsServerRequestSessionBuilder(
		request,
		this._options
	);

	const SessionManager = this;

	if (request.session._id in SessionManager._sessions) {
		request.session.data = SessionManager._sessions[request.session._id].data;
		SessionManager._sessions[request.session._id].expire = request.session._created + SessionManager._options.SESSION_LIFE * 1000;
	} else {
		SessionManager._sessions[request.session._id] = {
			expire: request.session._created + SessionManager._options.SESSION_LIFE * 1000,
			data: {}
		};
		request.session.data = SessionManager._sessions[request.session._id].data;
	}
};



/**
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback 
 */
function RequestSessionDecorator(request, response, server, callback) {
	if (
		request === null
		&&
		response === null
	) {
		/**
		 * @memberof SGAppsServer#
		 * @name SessionManager
		 * @type {SGAppsSessionManager}
		 */
		server.SessionManager = new SGAppsSessionManager(server);

		if (_cluster.isPrimary || _cluster.isMaster) {
			let workerId;
			const decorateWorker = (worker) => {
				worker.on('message', function (message) {
					if (
						message
						&& typeof(message) === "object"
						&& ( 'type' in message )
						&& typeof(message.type) === "string"
						&& typeof(message.pid) === "number" && message.pid
						&& typeof(message.sessionId) === "string" && message.sessionId
					) {
						if (
							message.type === "sgapps-server:session-manager:worker-data-request"
						) {
							if (
								(message.sessionId in server.SessionManager._sessions)
								&& typeof(server.SessionManager._sessions[message.sessionId].data) === "object"
								&& server.SessionManager._sessions[message.sessionId].data
							) {
								server.SessionManager._sessions[message.sessionId].expire = new Date().valueOf() + server.SessionManager._options.SESSION_LIFE * 1000;
								worker.send({
									type: "sgapps-server:session-manager:worker-data-response",
									sessionId: message.sessionId,
									data: server.SessionManager._sessions[message.sessionId].data,
									pid: process.pid
								});
							} else {
								worker.send({
									type: "sgapps-server:session-manager:worker-data-response",
									sessionId: message.sessionId,
									data: {},
									pid: process.pid
								});
							}
						} else if (
							message.type === "sgapps-server:session-manager:worker-data-store"
							&& typeof(message.data) === "object" && message.data
						) {
							if (
								(message.sessionId in server.SessionManager._sessions)
								&& typeof(server.SessionManager._sessions[message.sessionId].data) === "object"
								&& server.SessionManager._sessions[message.sessionId].data
							) {
								Object.assign(
									server.SessionManager._sessions[message.sessionId].data,
									message.data
								);
								server.SessionManager._sessions[message.sessionId].expire = new Date().valueOf() + server.SessionManager._options.SESSION_LIFE * 1000;
							} else {
								server.SessionManager._sessions[message.sessionId] = {
									expire: new Date().valueOf() + server.SessionManager._options.SESSION_LIFE * 1000,
									data: Object.assign({}, message.data)
								};
							}
						}
					}
				});
			};
			_cluster.on('fork', (worker) => {
				decorateWorker(worker);
			});
			for (workerId in _cluster.workers) {
				let worker = _cluster.workers[workerId];
				decorateWorker(worker);
			}
		}

		setInterval(() => {
			//@ts-ignore
			server.SessionManager.removeExpiredSessions();
		}, 5000);
		callback();
		return;
	}

	if (!server.SessionManager._enabled) {
		callback();
		return;
	}

	/**
	 * @memberof SGAppsServerRequest#
	 * @name session
	 * @type {SGAppsServerRequestSession}
	 */
	server.SessionManager.handleRequest(request);
	
	if (_cluster.isPrimary || _cluster.isMaster) {
		response._destroy.push(function () {
			request.session.destroy();
			delete request.session;
		});

		callback();
	} else {
		response._destroy.unshift(function () {
			process.send({
				type: 'sgapps-server:session-manager:worker-data-store',
				sessionId: request.session._id,
				data: request.session.data,
				pid: process.pid
			});
		});
		response._destroy.push(function () {
			request.session.destroy();
			delete request.session;
		});

		process.send({
			type: 'sgapps-server:session-manager:worker-data-request',
			sessionId: request.session._id,
			pid: process.pid
		});

		let callbackSent   = false;
		const callbackOnce = () => {
			if (callbackSent) return false;
			callbackSent = true;
			callback();
			return true;
		}

		process.on('message', function (message) {
			if (
				message
				&& typeof(message) === "object"
				&& request.session
				&& ( 'type' in message )
				&& typeof(message.type) === "string"
				&& ( 'pid' in message )
				&& typeof(message.pid) === "number"
				&& message.type === "sgapps-server:session-manager:worker-data-response"
				&& typeof(message.sessionId) === "string" && message.sessionId === request.session._id
				&& typeof(message.data) === "object" && message.data
			) {
				request.session.data = Object.assign(request.session.data, message.data);
				callbackOnce();
			}
		});

		setTimeout(function () {
			if (callbackOnce()) server.logger.warn(
				process.pid,
				' SessionSync between worker and master skipped after ' + server.SessionManager._options.workersSyncMaxDelay + 'ms'
			);
		}, server.SessionManager._options.workersSyncMaxDelay);
	}
};


module.exports = RequestSessionDecorator;