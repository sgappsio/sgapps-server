const ePrototype = require("application-prototype/constructors/extensions/prototype");
const Cookies = require('./../../../resources/thirdparty/cookies');

/**
 * @class
 * @name SGAppsServerRequestCookie
 */

/**
 * @memberof SGAppsServerRequestCookie#
 * @method get
 * @param {string} name
 * @param {object} [options]
 * @param {boolean} [options.secure=false]
 * @returns {string}
 */


/**
 * @memberof SGAppsServerRequestCookie#
 * @method set
 * @param {string} name
 * @param {string} value
 * @param {object} [options]
 * @param {boolean} [options.secure=false]
 * @returns {string}
 */
;

/**
 * @private
 * @method RequestCookieDecorator
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server
 * @param {function} callback
 */
module.exports = function RequestCookieDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		/**
		 * @memberof SGAppsServer#
		 * @var {object} CookiesManager
		 * @property {string} COOKIES_KEY
		 * @property {boolean} [_enabled=true] if is changed to false server will not decorate requests with cookie manager
		 * @property {function (SGAppsServerRequest,SGAppsServerResponse):object} handle
		 */
		server.CookiesManager = {
			COOKIES_KEY: 'your secret key',
			_enabled: true,
			handle: (request, response) => {
				return new Cookies(request.request, response.response, {
					keys: [server.CookiesManager.COOKIES_KEY]
				});
			}
		};
		callback();
		return;
	}
	
	if (!server.CookiesManager._enabled) {
		callback();
		return;
	}

	/**
	 * @memberof SGAppsServerRequest#
	 * @name cookies
	 * @type {SGAppsServerRequestCookie}
	 */;
	//@ts-ignore
	request.cookies = new Cookies(request.request, response.response, {
		keys: [server.CookiesManager.COOKIES_KEY]
	});

	response._destroy.push(() => {
		delete request.cookies;
	});

	callback();
};