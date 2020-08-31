const ePrototype = require("application-prototype/constructors/extensions/prototype");
const { IncomingMessage } = require("http");
const SGAppsServer = require("../server");

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
	/**
	 * @memberof SGAppsServerRequest#
	 * @var {object} urlInfo
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

	request.on('end', () => {
		this._destroy.forEach((unbindCall) => {
			unbindCall();
		});
		request.removeAllListeners();
	});

	return this;
};

module.exports = SGAppsServerRequest;