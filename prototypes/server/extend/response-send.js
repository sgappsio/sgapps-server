/**
 * @private
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback
 */
function ResponseSendDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	* @method send
	* @memberof SGAppsServerResponse#
	* @param {string|Buffer|object|any[]} data 
	* @param {object} [options] 
	* @param {number} [options.statusCode=200] 
	*/
	response.send = function (data, options) {
		if (!response.response || !response.response.writableEnded)
			return;
		options = Object.assign(
			{
				statusCode: 200
			},
			options
		);

		if (typeof(data) === "string") {
			if (!response.response.headersSent) {
				if (data[0] === '<') {
					response.response.setHeader('Content-Type', 'text/html');
				} else {
					response.response.setHeader('Content-Type', 'text/plain');
				}
				response.response.statusCode = options.statusCode;
			}
			
			response.response.write(data, function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else if (data instanceof Buffer) {
			if (!response.response.headersSent) {
				response.response.statusCode = options.statusCode;
				response.response.setHeader('Content-Type', 'application/octet-stream');
			}
			
			response.response.write(data, function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else if (Array.isArray(data) || typeof(data) === "object") {
			if (!response.response.headersSent) {
				response.response.statusCode = options.statusCode;
				response.response.setHeader('Content-Type', 'application/json');
			}
			
			response.response.write(JSON.stringify(data), function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else {
			if (!response.response.headersSent) {
				response.response.statusCode = options.statusCode;
				response.response.setHeader('Content-Type', 'application/octet-stream');
			}
			
			response.response.write((data.toString ? data.toString() : (data + '')), function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		}
	};

	/**
	* @method sendStatusCode
	* @memberof SGAppsServerResponse#
	* @param {number} statusCode 
	*/
	response.sendStatusCode = function (statusCode) {
		response.send(
			server.STATUS_CODES[statusCode] || 'Unknown status code',
			{
				statusCode
			}
		);
	}
	
	response.response.on('end', function () {
		// @ts-ignore
		delete response.send;
	});

	callback();
};

module.exports = ResponseSendDecorator;