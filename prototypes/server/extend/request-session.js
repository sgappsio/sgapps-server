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

	/**
	 * @memberof SGAppsServerRequestSession#
	 * @name _ip
	 * @type {string}
	 */
	this._ip = (
		(
			request.request ? request.request.headers['x-forwarded-for'] : null
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
	this._id = (
		request.cookies.get(
			options.cookie,
			{ secure: true }
		) || request.cookies.get(
			options.cookie,
			{ secure: false }
		) || null
	);

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
			}
		);
		request.cookies.set(
			options.cookie,
			this._id,
			{
				secure: false
			}
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
		this.data = null;
		this._id = null;
		this._ip = null;
		this._options = null;
		delete this.destroy;
	}

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
}

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
	request.session = new SGAppsServerRequestSessionBuilder(
		request,
		server.SessionManager._options
	);

	if (request.session._id in server.SessionManager._sessions) {
		request.session.data = server.SessionManager._sessions[request.session._id].data;
		server.SessionManager._sessions[request.session._id].expire = request.session._created + server.SessionManager._options.SESSION_LIFE;
	} else {
		server.SessionManager._sessions[request.session._id] = {
			expire: request.session._created + server.SessionManager._options.SESSION_LIFE,
			data: {}
		};
		request.session.data = server.SessionManager._sessions[request.session._id].data;
	}

	response.response.on('end', function () {
		request.session.destroy();
	});
	
	callback();
};


module.exports = RequestSessionDecorator;