const {
	STATUS_CODES
} = require('http');

/**
 * @private
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback
 */
function ResponseRedirectDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	 * if it returns `false` than the action was not possible
	 * @memberof SGAppsServerResponse#
	 * @method redirect
	 * @param {string} url
	 * @param {object} [options]
	 * @param {number} [options.statusCode=302]
	 * @param {Object<string,(string|string[])>} [options.headers]
	 */
	response.redirect = function (url, options) {
		options = Object.assign(
			{
				statusCode: 302,
				headers: {}
			},
			options || {}
		);
		if (!options.headers) {
			options.headers = {};
		}
		options.headers.location = url;
		response.send(
			`Redirecting to: ${url}`,
			options
		);
	};

	// response._destroy.push(function () {
	// 	delete response.redirect;
	// });

	callback();
};

module.exports = ResponseRedirectDecorator;