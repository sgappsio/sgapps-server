const {
	STATUS_CODES
} = require('http');

/**
 * Node.js system errors (fs, net, …) expose `syscall` / `errno` / `path`.
 * @private
 * @param {Error} error
 * @returns {boolean}
 */
function isSystemError(error) {
	const systemError = /** @type {NodeJS.ErrnoException} */ (error);
	return (
		typeof(systemError.syscall) === "string"
		|| typeof(systemError.errno) === "number"
		|| typeof(systemError.path) === "string"
	);
}

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
			response.response.statusMessage = STATUS_CODES[options.statusCode] || `Unknown status code: ${options.statusCode}`;
		}
		if (error && (error instanceof Error)) {
			if (response.response.writable) {
				let message = error.message;
				if (isSystemError(error)) {
					// fs / OS errors carry absolute paths and syscall details;
					// keep them in the server log, not in the client response
					if (server.logger._debug) server.logger.error(error);
					message = STATUS_CODES[options.statusCode] || 'Error';
				}
				response.response.write(
					message,
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

	// response._destroy.push(() => {
	// 	delete response.sendError;
	// });

	callback();
};

module.exports = ResponseSendErrorDecorator;