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
		{ SESSION_LIFE: 600, cookie: 'ssiddyn' },
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

	response._destroy.push(function () {
		request.session.destroy();
		delete request.session;
	});
	
	callback();
};


module.exports = RequestSessionDecorator;