const FSLibrary = require('fs');
const _Extensions = require('./../resources/extensions');
const {
	Server,
	IncomingMessage,
	ServerResponse
} = require('http');
const { Duplex } = require('stream');
const LoggerBuilder = require('./logger');
const _EmailBuilder = require('./email');

const SGAppsServerRequest = require('./server/request');
const SGAppsServerResponse = require('./server/response');
const SGAppsServerDictionary = require('./dictionary');

/**
 * @class
 * @name SGAppsServerDecoratorsLibrary
 */


/**
 * @callback SGAppsServerErrorCallBack
 * @param {Error} err
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 */


/**
 * @callback SGAppsServerErrorOnlyCallback
 * @param {Error} err
 */

/**
 * @class
 * @name FSLibrary
 * @mixes FSLibraryModule
 */

/**
 * @class
 * @name SGAppsServerShared
 */;

/**
 * @callback SGAppsServerDecorator
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {SGAppsServer} server
 * @param {function} callback
 */;
const _decorators = [
	require('./server/extend/request-url'),
	require('./server/extend/response-send'),
	require('./server/extend/response-error'),
	require('./server/extend/response-redirect'),
	require('./server/extend/response-pipe-file'),
	require('./server/extend/response-template'),
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

	options = Object.assign(
		{
			server: null,
			strictRouting: true,
			decorators: []
		}, options || {}
	);

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
	 * @name STATUS_CODES
	 * @type {Object<number,string>}
	 */
	this.STATUS_CODES = require('http').STATUS_CODES;

	/**
	 * @memberof SGAppsServer#
	 * @name shared
	 * @type {SGAppsServerShared}
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
	 * @method Email
	 * @param {SGAppsServerEmail.Config} config
	 * @returns {SGAppsServerEmail}
	 */
	//@ts-ignore
	this.Email  = _EmailBuilder;


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
	 * @type {object}
	 */;
	this._fs = require('fs');

	/**
	 * @memberof SGAppsServer#
	 * @name _path
	 * @type {object}
	 */;
	this._path = require('path');

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
		"use"	: new SGAppsServerDictionary({ name: "use" }),
		"post"	: new SGAppsServerDictionary({ name: "post" }),
		"get"	: new SGAppsServerDictionary({ name: "get" }),
		"head"	: new SGAppsServerDictionary({ name: "head" }),
		"put"	: new SGAppsServerDictionary({ name: "put" }),
		"trace"	: new SGAppsServerDictionary({ name: "trace" }),
		"delete"	: new SGAppsServerDictionary({ name: "delete" }),
		"options"	: new SGAppsServerDictionary({ name: "options" }),
		"connect"	: new SGAppsServerDictionary({ name: "connect" }),
		"patch"		: new SGAppsServerDictionary({ name: "patch" }),
		"_finalHandler"	: new SGAppsServerDictionary({
			name: "_finalHandler",
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
					response
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


	/**
	 * @memberof SGAppsServer#
	 * @name whenReady
	 * @type {Promise<SGAppsServer>}
	 */
	this.whenReady = new Promise((resolve, reject) => {
		let index = 0;
		// @ts-ignore
		const _decorators = this._decorators;
		const loadDecorator = () => {
			if (_decorators[index]) {
				if (this.logger._debug) {
					process.stderr.write(
						`\n\t» \x1b[36m[Server.Decorator] ${
							_decorators[index].name || _decorators[index].toString()
						}\x1b[0m`
					);
				}
				_decorators[index](
					null,
					null,
					this,
					(err) => {
						if (err) {
							process.stderr.write(
								' \x1b[32;1mError\x1b[0m\n' + err.message + '\n'
							);
							reject(err);
						} else {
							index++;
							if (this.logger._debug) {
								process.stderr.write(' \x1b[32;1mDone\x1b[0m')
							}
							loadDecorator();
						}
					}
				);
			} else {
				if (this.logger._debug) {
					process.stderr.write('\n\n\t\t\x1b[32;1mDecorators Loaded\x1b[0m\n')
				}
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
			function (request, response, server) {
				server._requestListeners._finalHandler.run(
					request,
					response,
					server,
					function () {
						if (callback) {
							callback(request, response, server);
						} else if (
							response.response
							&& !response.response.writableEnded
						) {
							response.sendError(
								Error(`Unable to handle path ${request.request ? request.request.url : ''}`),
								{
									statusCode: 404
								}
							);
						}
					}
				);
			}
		);
	} else {
		response.sendError(Error(`[Request.method] is unknown; ${method}`));
	}
}


/**
 * @memberof SGAppsServer
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {string} path
 * @param {SGAppsServerErrorCallBack} callback
 */
SGAppsServer.prototype.handleStaticRequest = function (request, response, path, callback) {
	if (response.response) {
		response.pipeFileStatic(
			this._path.join(
				this._path.resolve(path),
				this._path.resolve(
					request.mountPath || './',
					this._path.resolve(
						'/',
						request.urlInfo.pathname
					)
				)
			),
			(request.urlInfo.pathname || '').replace(
				/^.*\//,
				''
			) || 'index.html',
			(err) => {
				if (callback) {
					callback(
						err || null,
						request,
						response,
						//@ts-ignore
						this
					);
				} else {
					if (err) {
						response.sendError(
							Error(`404 ${this.STATUS_CODES[404]}; ${err.message}`),
							{
								statusCode: 404
							}
						);
					}
				}
			}
		);
	} else {
		if (callback) {
			callback(
				Error('[Response] is already finished'),
				request,
				response,
				//@ts-ignore
				this
			);
		}
	}
}

/**
 * @memberof SGAppsServer
 * @param {IncomingMessage} request
 * @param {ServerResponse} response
 * @param {SGAppsServerDictionaryRunCallBack} [callback]
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

	let index = 0;
	const loadDecorator = () => {
		//@ts-ignore
		const _decorators = this._decorators;
		if (_decorators[index]) {
			_decorators[index](
				_request,
				_response,
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
					if (callback) {
						callback(_request, _response, this)
					} else {
						_response.sendError(
							Error(`Unable to handle path ${request.url}`),
							{
								statusCode: 404
							}
						);
					}
				}
			);
		}
	};
	loadDecorator();

	// Improve garbage collector
	_response._destroy.push(function () {
		delete _request.request;
		delete _response.response;
	});
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
 * @param {string|RequestHandler} path
 * @param {...RequestHandler} [handlers]
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.use = function (path, ...handlers) {
	this._requestListeners.use.push(
		(typeof(path) === "string" || (path instanceof RegExp)) ? path : '',
		//@ts-ignore
		typeof(path) === "function" ? [path, ...handlers] : handlers
	);
	return this;
}

/**
 * The `POST` method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.post = function (path, ...handlers) {
	this._requestListeners.post.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `GET` method requests a representation of the specified resource. Requests using GET should only retrieve data.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.get = function (path, ...handlers) {
	this._requestListeners.get.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `HEAD` method asks for a response identical to that of a GET request, but without the response body.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.head = function (path, ...handlers) {
	this._requestListeners.head.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `PUT` method replaces all current representations of the target resource with the request payload.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.put = function (path, ...handlers) {
	this._requestListeners.put.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `TRACE` method performs a message loop-back test along the path to the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.trace = function (path, ...handlers) {
	this._requestListeners.trace.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `DELETE` method deletes the specified resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.delete = function (path, ...handlers) {
	this._requestListeners.delete.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `OPTIONS` method is used to describe the communication options for the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.options = function (path, ...handlers) {
	this._requestListeners.options.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `CONNECT` method establishes a tunnel to the server identified by the target resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.connect = function (path, ...handlers) {
	this._requestListeners.connect.push(
		path,
		handlers
	);
	return this;
}

/**
 * The `PATCH` method is used to apply partial modifications to a resource.
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.patch = function (path, ...handlers) {
	this._requestListeners.patch.push(
		path,
		handlers
	);
	return this;
}

/**
 * add handler to all methods
 * 
 * @memberof SGAppsServer
 * @param {RequestPathStructure} path
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.all = function (path, ...handlers) {
	Object.keys(
		this._requestListeners
	).forEach((method) => {
		if (method !== "use" && method[0] !== '_' && method[0] !== 'finalHandler') {
			this._requestListeners[method].push(
				path,
				handlers
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
 * @param {...RequestHandler} handlers
 * @returns {SGAppsServer}
 */
SGAppsServer.prototype.finalHandler = function (path, ...handlers) {
	this._requestListeners._finalHandler.push(
		path,
		handlers
	);
	return this;
}

/**
 * @callback SGAppsServerHandlerPostData
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {function} next
 */

/**
 * @memberof SGAppsServer
 * @param {object} [options]
 * @param {number} [options.MAX_POST_SIZE]
 * @param {object} [options.error]
 * @param {number} options.error.statusCode
 * @param {string} [options.error.message]
 * @returns {SGAppsServerHandlerPostData}
 */
SGAppsServer.prototype.handlePostData = function (options) {
	return (request, response, next) => {
		options = Object.assign(
			{
				error: {
					statusCode: 500
				}
			}, options
		);
		if ("MAX_POST_SIZE" in options) {
			request.MAX_POST_SIZE = options.MAX_POST_SIZE;
		}
		request.postData.then(
			() => {
				next()
			},
			(err) => {
				response.sendError(
					Error(
						options.error.message
						|| this.STATUS_CODES[options.error.statusCode]
						|| err.message
						|| 'Unexpected Error'
					),
					{
						statusCode: options.error.statusCode
					}
				)
			}
		);
	}
}

module.exports = SGAppsServer;