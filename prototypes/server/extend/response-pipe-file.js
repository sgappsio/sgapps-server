/**
 * @private
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback
 */
function ResponsePipeFileDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	 * @memberof SGAppsServerResponse#
	 * @method pipeFile
	 * @param {string} filePath 
	 * @param {function} callback represents a `Function(Error)`
	 */
	response.pipeFile = function ResponsePipe(filePath, callback) {
		var returned = false;
		var _callback = function (err) { if (!returned && callback) callback(err); };

		if (response.response.writableEnded) {
			_callback(Error('Response is already ended'));
		}
		
		server._fs.stat(filePath, function (err, stat) {
			if (err) {
				_callback(err);
				return;
			}

			var readStream, start, end, total = stat.size, chunkSize;

			if (request) {
				var range = request.request.headers.range || "";
				if (range && total) {
					var parts = range.replace(/bytes=/, "").split("-");
					var partialStart = parts[0];
					var partialEnd = parts[1];

					start = parseInt(partialStart, 10);
					end = partialEnd ? parseInt(partialEnd, 10) : total-1;
					chunkSize = (end-start)+1;

					if (
						!response.response.headersSent
						&& response.response.writable
						&& response.response.writableEnded
					) {
						response.response.statusCode	= 206;
						response.response.setHeader(
							"Content-Range",
							`bytes ${start}-${end}/${total}`
						);
						response.response.setHeader("Accept-Ranges", "bytes");
						response.response.setHeader("Content-Length", chunkSize);
					}
				}
			}

			if (typeof(start) === "number") {
				if (typeof(end) === "number") {
					readStream = server._fs.createReadStream(filePath, { start: start, end: end });
				} else {
					readStream = server._fs.createReadStream(filePath, { start: start });
				}
			} else {
				readStream = server._fs.createReadStream(filePath);
			}



			// This catches any errors that happen while creating the readable stream (usually invalid names)
			readStream.on('error', function(err) {
				_callback(err);
			});

			// // This will wait until we know the readable stream is actually valid before piping
			readStream.on('open', function () {
				// This just pipes the read stream to the response object (which goes to the client)
				readStream.pipe(response);
			});

			response.response.on('close', function() {
				// Resume the read stream when the write stream gets hungry
				readStream.destroy();
			});

			response.response.on('end', function() {
				// Resume the read stream when the write stream gets hungry
				readStream.destroy();
			});

			readStream.on('end', function() {
				_callback(undefined);
			});
		});
	};

	response.response.on('end', function ResponsePipeEnd() {
		delete response.pipeFile;
	});

	callback();
};

module.exports = ResponsePipeFileDecorator;