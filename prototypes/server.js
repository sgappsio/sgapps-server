const FSLibrary = require('fs');
const _Extensions = require('./../resources/extensions');
const {
	Server,
	IncomingMessage,
	ServerResponse
} = require('http');
const { Duplex } = require('stream');
const LoggerBuilder = require('./logger');

const SGAppsServerRequest = require('./server/request');
const SGAppsServerResponse = require('./server/response');
const SGAppsServerDictionary = require('./dictionary');

/**
 * @callback SGAppsServerDecorator
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {SGAppsServer} server
 * @param {function} callback
 */;
const _decorators = [
	require('./server/extend/request-url'),
	require('./server/extend/response-error'),
	require('./server/extend/response-send'),
	require('./server/extend/response-pipe-file'),
	require('./server/extend/request-postdata'),
	require('./server/extend/request-cookie'),
	require('./server/extend/request-session'),
	require('./server/extend/response-pipe-file-static'),
];

/**
 * @typedef {string|RegExp} RequestPathStructure
 */

/**
 * @callback RequestHandler
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {function} next
 */

/**
 * @typedef {object} SGAppsServerOptions
 * @property {Server} [server]
 * @property {boolean} [strictRouting=false]
 */

/**
 * @example
 * // ================================
 * //   Start your 🚀 Web-Server app
 * // ================================
 * 
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 * 
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 * 
 * app.server().listen(8080, () => {
 *   app.logger.log('Server is running on port 8080');
 * })
 * 
 * @example
 * // ========================================
 * //   Start your 🚀 Web-Server app Extended
 * // ========================================
 * 
 * const { SGAppsServer } = require('@sgapps.io/server');
 * const app = new SGAppsServer();
 * 
 * app.get('/', function (req, res) {
 *   res.send('hello world')
 * })
 * 
 * app.whenReady.then(() => {
 *   app.SessionManager.cookie = 'ssid';
 *   app.SessionManager.SESSION_LIFE = 120; // seconds
 * 
 *   app.server().listen(8080, () => {
 *     app.logger.log('Server is running on port 8080');
 *   })
 * }, app.logger.error);
 * 
 * @class
 * @description HTTP Server for high performance results
 * @name SGAppsServer
 * @param {object} [options] 
 * @param {Server} [options.server]
 * @param {boolean} [options.strictRouting=true]
 * @param {SGAppsServerDecorator[]} [options.decorators]
 */
function SGAppsServer(options) {
	/**
	 * @memberof SGAppsServer#
	 * @name _server
	 * @type {Server}
	 */
	//@ts-ignore
	this._server  = options.server ? options.server : require("http").createServer();

	/**
	 * @memberof SGAppsServer#
	 * @name _decorators
	 * @type {SGAppsServerDecorator[]}
	 */;
	let _decoratorsComputed = [ ..._decorators, ...(options.decorators || []) ];
	Object.defineProperty(
		this,
		'_decorators',
		{
			get: () => _decoratorsComputed,
			set: (decorators) => {
				[ ..._decorators, ...decorators ];
			},
			enumerable: true,
			configurable: false
		}
	);

	/**
	 * @memberof SGAppsServer#
	 * @name _options
	 * @type {SGAppsServerOptions}
	 */
	this._options = Object.assign(
		{ strictRouting: true }, (options || {})
	);


	/**
	 * @memberof SGAppsServer#
	 * @name shared
	 * @type {object}
	 */
	this.shared = {};

	/**
	 * @memberof SGAppsServer#
	 * @name logger
	 * @type {LoggerBuilder}
	 */
	this.logger = new LoggerBuilder();


	/**
	 * @memberof SGAppsServer#
	 * @name mountPath
	 * @type {string}
	 */
	let _mountPath = '';
	Object.defineProperty(
		this,
		'mountPath',
		{
			get: () => _mountPath,
			set: (path) => {
				_mountPath	= path;
			},
			enumerable: true,
			configurable: true
		}
	);

	/**
	 * @memberof SGAppsServer#
	 * @name _fs
	 * @type {FSLibrary}
	 */
	this._fs = FSLibrary;

	/**
	 * @memberof SGAppsServer#
	 * @name EXTENSIONS
	 * @type {ResourcesExtensions}
	 */
	this.EXTENSIONS = _Extensions;


	/**
	 * @memberof SGAppsServer#
	 * @name _requestListeners
	 * @type {Object<string,SGAppsServerDictionary>}
	 */
	this._requestListeners = {
		"use"	: new SGAppsServerDictionary(),
		"post"	: new SGAppsServerDictionary(),
		"get"	: new SGAppsServerDictionary(),
		"head"	: new SGAppsServerDictionary(),
		"put"	: new SGAppsServerDictionary(),
		"trace"	: new SGAppsServerDictionary(),
		"delete"	: new SGAppsServerDictionary(),
		"options"	: new SGAppsServerDictionary(),
		"connect"	: new SGAppsServerDictionary(),
		"patch"		: new SGAppsServerDictionary(),
		"_finalHandler"	: new SGAppsServerDictionary({
			reverse: true
		})
	};

	this._server.on(
		'request',
		(
			/**
			 * @param {IncomingMessage} request 
			 * @param {ServerResponse} response 
			 * @this {SGAppsServer}
			 */
			function (request, response) {
				this.handle(
					request,
					response,
					function (_request, _response, server) {
						server._requestListeners._finalHandler.run(
							_request,
							_response,
							server,
							function () {
								_response.sendError(
									Error(`Unable to handle path ${request.url}`),
									{
										statusCode: 404
									}
								);
							}
						);
					}
				)
			}
		).bind(this)
	);

	this._server.on(
		'upgrade',
		/**
		 * 
		 * @param {IncomingMessage} request 
		 * @param {Duplex} socket 
		 * @param {Buffer} data 
		 */
		function (request, socket, data) {

		}
	);

	/**
	 * default value is `16 Kb` » `16 * 1024`
	 * @memberof SGAppsServer#
	 * @name MAX_POST_SIZE
	 * @type {number}
	 */
	var MAX_POST_SIZE = 16 * 1024;
	Object.defineProperty(this, 'MAX_POST_SIZE', {
		get: function () {
			return MAX_POST_SIZE;
		},
		set: (value) => {
			if (typeof(value) === "number") {
				MAX_POST_SIZE = value;
			} else {
				this.logger.error('MAX_POST_SIZE should be a number');
			}
		}
	});


	this.whenReady = new Promise((resolve, reject) => {
		let index = 0;
		// @ts-ignore
		const _decorators = this._decorators;
		const loadDecorator = () => {
			if (_decorators[index]) {
				_decorators[index](
					null,
					null,
					this,
					(err) => {
						if (err) {
							reject(err);
						} else {
							index++;
							loadDecorator();
						}
					}
				);
			} else {
				resolve(this);
			}
		};
		loadDecorator();
	});

	return this;
}

/**
 * @memberof SGAppsServer
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {SGAppsServerDictionaryRunCallBack} callback
 */
SGAppsServer.prototype.handleRequest = function (request, response, callback) {
	const method = (request.request.method || 'get').toLocaleLowerCase();
	if (
		method && method[0] !== "_" && (
			method in this._requestListeners
		)
	) {
		this._requestListeners[method].run(
			request,
			response,
			//@ts-ignore
			this,
			callback
		);
	} else {
		response.sendError(Error(`[Request.method] is unknown; ${method}`));
	}
}

/**
 * @memberof SGAppsServer
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 * @param {SGAppsServerDictionaryRunCallBack} callback
 */
SGAppsServer.prototype.handle = function (request, response, callback) {
	/**
	 * @private
	 * @type {SGAppsServerRequest}
	 */
	//@ts-ignore
	const _request = new SGAppsServerRequest(request, this);

	/**
	 * @private
	 * @type {SGAppsServerResponse}
	 */
	//@ts-ignore
	const _response = new SGAppsServerResponse(response, this);

	// Improve garbage collector
	_response.response.on('end', function () {
		delete _request.request;
		delete _response.response;
	});

	let index = 0;
	const loadDecorator = () => {
		//@ts-ignore
		const _decorators = this._decorators;
		if (_decorators[index]) {
			_decorators[index](
				null,
				null,
				// @ts-ignore
				this,
				(err) => {
					if (err) {
						_response.sendError(
							Error(
								`Unable to load [Request.Decorator]: ${_decorators[index].name} ; ${err.message}`
							)
						);
					} else {
						index++;
						loadDecorator();
					}
				}
			);
		} else {
			this.handleRequest(
				_request,
				_response,
				function () {
					callback(_request, _response, this)
				}
			);
		}
	};
	loadDecorator();
};

/**
 * @memberof SGAppsServer
 * @returns {Server}
 */
SGAppsServer.prototype.server = function () {
	return this._server;
}

/**
 * @memberof SGAppsServer
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.use = function (handler) {
	this._requestListeners.use.push(
		'',
		handler
	);
	return this;
}

/**
 * The `POST` method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.post = function (path, handler) {
	this._requestListeners.post.push(
		path,
		handler
	);
	return this;
}

/**
 * The `GET` method requests a representation of the specified resource. Requests using GET should only retrieve data.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.get = function (path, handler) {
	this._requestListeners.get.push(
		path,
		handler
	);
	return this;
}

/**
 * The `HEAD` method asks for a response identical to that of a GET request, but without the response body.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.head = function (path, handler) {
	this._requestListeners.head.push(
		path,
		handler
	);
	return this;
}

/**
 * The `PUT` method replaces all current representations of the target resource with the request payload.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.put = function (path, handler) {
	this._requestListeners.put.push(
		path,
		handler
	);
	return this;
}

/**
 * The `TRACE` method performs a message loop-back test along the path to the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.trace = function (path, handler) {
	this._requestListeners.trace.push(
		path,
		handler
	);
	return this;
}

/**
 * The `DELETE` method deletes the specified resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.delete = function (path, handler) {
	this._requestListeners.delete.push(
		path,
		handler
	);
	return this;
}

/**
 * The `OPTIONS` method is used to describe the communication options for the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.options = function (path, handler) {
	this._requestListeners.options.push(
		path,
		handler
	);
	return this;
}

/**
 * The `CONNECT` method establishes a tunnel to the server identified by the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.connect = function (path, handler) {
	this._requestListeners.connect.push(
		path,
		handler
	);
	return this;
}

/**
 * The `PATCH` method is used to apply partial modifications to a resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.patch = function (path, handler) {
	this._requestListeners.patch.push(
		path,
		handler
	);
	return this;
}

/**
 * add handler to all methods
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.all = function (path, handler) {
	Object.keys(
		this._requestListeners
	).forEach(function (method) {
		if (method !== "use" && method[0] !== '_') {
			this._requestListeners[method].push(
				path,
				handler
			);
		}
	});
	return this;
}

/**
 * add final handler to all methods, last added is first
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.finalHandler = function (path, handler) {
	this._requestListeners._finalHandler.push(
		path,
		handler
	);
	return this;
}

module.exports = SGAppsServer;