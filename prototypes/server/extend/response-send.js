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
	 * @param {Object<string,(string|string[])>} [options.headers]
	 */
	response.send = function (data, options) {
		if (response._flags.finished)
			return;
		options = Object.assign(
			{
				statusCode: 200,
				headers: {}
			},
			options || {}
		);

		if (!response.response.headersSent) {
			if (
				!options.headers["Content-type"]
				&&
				!options.headers["Content-Type"]
				&&
				!options.headers["content-type"]
			) {
				if (typeof(data) === "string") {
					options.headers["Content-type"] = (
						data[0] === '<' ? "text/html" : "text/plain"
					);
				} else if (data instanceof Buffer) {
					options.headers["Content-type"] = 'application/octet-stream';
				} else if (Array.isArray(data) || typeof(data) === "object") {
					options.headers['Content-type'] = 'application/json';
				} else {
					options.headers["Content-type"] = 'application/octet-stream';
				}
			}

			response.response.statusCode = options.statusCode;
			let header;
			for (header in options.headers) {
				response.response.setHeader(header, options.headers[header]);
			}
		}

		if (
			typeof(data) === "string"
			|| data instanceof Buffer
		) {
			response.response.write(data, function (err) {
				//@ts-ignore
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else if (Array.isArray(data) || (typeof(data) === "object" && data)) {
			response.response.write(JSON.stringify(data), function (err) {
				//@ts-ignore
				if (err) server.logger.error(err);
				response.response.end();
			});
		} else {
			response.response.write((data.toString ? data.toString() : (data + '')), function (err) {
				//@ts-ignore
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
			//@ts-ignore
			server.STATUS_CODES[statusCode] || 'Unknown status code',
			{
				statusCode
			}
		);
	}
	
	response._destroy.push(function () {
		// @ts-ignore
		delete response.send;
	});

	callback();
};

module.exports = ResponseSendDecorator;