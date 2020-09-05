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
function ResponseSendErrorDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	 * @memberof SGAppsServerResponse#
	 * @method sendError
	 * @param {Error} error 
	 * @param {object} [options]
	 * @param {number} [options.statusCode=500]
	 */
	response.sendError = function (error, options) {
		options = Object.assign(
			{
				statusCode: 500
			},
			options || {}
		);
		if (!response.response.headersSent) {
			response.response.statusCode = options.statusCode;
			response.response.statusMessage = STATUS_CODES[options.statusCode] || `Unknown status code: ${options.statusCode}`
		}
		if (error && (error instanceof Error)) {
			if (response.response.writable) {
				response.response.write(
					error.message,
					function _ResponseErrorWriteCallback() {
						if (!response._flags.finished) {
							response.response.end();
						}
					}
				);
				return;
			}
		}
		if (!response._flags.finished) {
			response.response.end();
		}
	};

	response._destroy.push(() => {
		delete response.sendError;
	});

	callback();
};

module.exports = ResponseSendErrorDecorator;