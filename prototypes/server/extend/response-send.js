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
	*/
	response.send = function (data) {
		if (typeof(data) === "string") {
			if (data[0] === '<') {
				if (!response.response.headersSent) {
					response.response.setHeader('Content-Type', 'text/html');
				}
			} else {
				if (!response.response.headersSent) {
					response.response.setHeader('Content-Type', 'text/plain');
				}
			}
			
			response.response.write(data, function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else if (data instanceof Buffer) {
			if (!response.response.headersSent) {
				response.response.setHeader('Content-Type', 'application/octet-stream');
			}
			
			response.response.write(data, function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else if (Array.isArray(data) || typeof(data) === "object") {
			if (!response.response.headersSent) {
				response.response.setHeader('Content-Type', 'application/json');
			}
			
			response.response.write(JSON.stringify(data), function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else {
			if (!response.response.headersSent) {
				response.response.setHeader('Content-Type', 'application/octet-stream');
			}
			
			response.response.write((data.toString ? data.toString() : (data + '')), function (err) {
				if (err) server.logger.error(err);
				response.response.end();
			});
		}
	};
	
	response.response.on('end', function () {
		// @ts-ignore
		delete response.send;
	});

	callback();
};

module.exports = ResponseSendDecorator;