const ePrototype = require("application-prototype/constructors/extensions/prototype");

/**
 * @class
 * @name SGAppsServerRequest
 * @param {IncomingMessage} request
 * @param {SGAppsServer} server
 */
function SGAppsServerRequest(request, server) {
	/**
	 * @memberof SGAppsServerRequest#
	 * @name request
	 * @type {IncomingMessage}
	 */
	this.request = request;

	//@ts-ignore
	const _urlInfo = `${request.protocol || 'http'}://${request.headers.host || 'localhost'}/${request.url}`.parseUrl(true);
	_urlInfo.pathname = _urlInfo.pathname.replace(/\/{2,}/g, '/');
	/**
	 * @memberof SGAppsServerRequest#
	 * @name urlInfo
	 * @type {object}
	 * @property {string} original
	 * @property {string} origin 
	 * @property {string} domain full domain of url
	 * @property {string} domain_short	domain without "www."
	 * @property {string} pathname url's pathname
	 * @property {string} reqQuery url's query from '?'
	 * @property {string} protocol url.split('://')[0]
	 * @property {string} url
	 * @property {string} url_p
	 * @property {string} isIp	domain or Ip
	 */;
	Object.defineProperty(this, 'urlInfo', {
		get: () => _urlInfo,
		set: () => {
			server.logger.warn('[Request.urlInfo] is not configurable')
		}
	})

	/**
	 * @memberof SGAppsServerRequest#
	 * @name query
	 * @type {object}
	 */
	Object.defineProperty(this, 'query', {
		get: () => _urlInfo.get_vars,
		set: () => server.logger.warn("[Request.query] is not configurable"),
		enumerable: true,
		configurable: true
	});

	/**
	 * @memberof SGAppsServerRequest#
	 * @name mountPath
	 * @type {string}
	 */
	let _mountPath = '';
	Object.defineProperty(this, 'mountPath', {
		get: () => (_mountPath || server.mountPath),
		set: (path) => {
			server.logger.warn("[Request.mountPath] should be not configurable");
			_mountPath	= path;
		},
		enumerable: true,
		configurable: true
	});

	/**
	 * @example
	 * // changing max post size to 4Mb
	 * request.MAX_POST_SIZE = 4 * 1024 * 1024;
	 * 
	 * @example
	 * // reset max post size to global value
	 * request.MAX_POST_SIZE = -1;
	 * 
	 * @memberof SGAppsServerRequest#
	 * @name MAX_POST_SIZE
	 * @type {number}
	 */
	let _MAX_POST_SIZE = -1;
	Object.defineProperty(this, 'MAX_POST_SIZE', {
		get: () => (_MAX_POST_SIZE < 0 ? server.MAX_POST_SIZE : _MAX_POST_SIZE),
		set: (value) => {
			if (typeof(value) === "number") {
				server.logger.warn(`[Request.MAX_POST_SIZE] was changed to ${value}`);
				_MAX_POST_SIZE	= value;
			} else {
				server.logger.warn(`[Request.MAX_POST_SIZE] should be a number`);
			}
		},
		enumerable: true,
		configurable: true
	});

	/**
	 * Array of functions to be called on response end
	 * @memberof SGAppsServerRequest#
	 * @name _destroy
	 * @type {Array<function>}
	 */
	this._destroy = [];


	/**
	 * @memberof SGAppsServerRequest
	 * @typedef {(Object<(string|number),string>|string[])} RequestParams
	 */

	/**
	 * Array of functions to be called on response end
	 * @memberof SGAppsServerRequest#
	 * @name params
	 * @type {SGAppsServerRequest.RequestParams}
	 */;
	//@ts-ignore
	this.params = this.urlInfo.pathname.split('/');

	/**
	 * Array of functions to be called on response end
	 * @memberof SGAppsServerRequest#
	 * @var {object} _flags
	 * @property {boolean} complete The message.complete property will be true if a complete HTTP message has been received and successfully parsed.
	 * @property {boolean} aborted The message.aborted property will be true if the request has been aborted.
	 * @property {boolean} closed Indicates that the underlying connection was closed.
	 */
	this._flags = {
		closed: false
	};

	Object.defineProperties(
		this._flags,
		{
			complete: {
				get: () => request.complete || false
			},
			aborted: {
				get: () => request.aborted || false
			}
		}
	);

	request.on('close', () => {
		this._flags.closed = true;
	});


	request.on('end', () => {
		this._destroy.forEach((unbindCall) => {
			unbindCall();
		});
		delete this.params;
		request.removeAllListeners();

		//? TODO CHECK request destroy
		// request.shouldKeepAlive
	});

	return this;
};

module.exports = SGAppsServerRequest;