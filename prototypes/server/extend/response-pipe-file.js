/**
 * Parses a single `Range: bytes=...` header (RFC 7233).
 * Returns `null` when the header must be ignored (missing, malformed,
 * multi-range, reversed bounds) so the full file is served with 200,
 * `false` when the range cannot be satisfied (416),
 * or `{ start, end }` with inclusive, in-file bounds.
 * @private
 * @param {string} header
 * @param {number} total file size in bytes
 * @returns {null|false|{start: number, end: number}}
 */
function parseByteRange(header, total) {
	const match = /^\s*bytes\s*=\s*(\d*)\s*-\s*(\d*)\s*$/i.exec(header || '');
	if (!match) return null;

	const [, rawStart, rawEnd] = match;
	if (rawStart === '' && rawEnd === '') return null;

	let start, end;
	if (rawStart === '') {
		// suffix range: "bytes=-N" » last N bytes
		const suffixLength = parseInt(rawEnd, 10);
		if (!suffixLength) return false;
		start = Math.max(0, total - suffixLength);
		end = total - 1;
	} else {
		start = parseInt(rawStart, 10);
		// "bytes=5-2" is syntactically invalid » ignore the header
		if (rawEnd !== '' && parseInt(rawEnd, 10) < start) return null;
		if (start >= total) return false;
		end = rawEnd === '' ? total - 1 : Math.min(parseInt(rawEnd, 10), total - 1);
	}

	return { start, end };
}

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
	 * @param {SGAppsServerErrorOnlyCallback} callback represents a `Function(Error)`
	 */
	response.pipeFile = function ResponsePipe(filePath, callback) {
		var returned = false;
		var _callback = function (err) { if (!returned && callback) callback(err); };

		if (response._flags.finished) {
			_callback(Error('Response is already ended'));
			return;
		}
		
		server._fs.stat(filePath, function (err, stat) {
			if (err) {
				_callback(err);
				return;
			}

			let readStream, start, end, total = stat.size;

			if (
				request.request
				&& total
				&& !response.response.headersSent
				&& !response._flags.finished
			) {
				const range = parseByteRange(
					request.request.headers.range || "",
					total
				);

				if (range === false) {
					response.response.statusCode = 416;
					response.response.setHeader("Content-Range", `bytes */${total}`);
					response.response.setHeader("Accept-Ranges", "bytes");
					response.response.setHeader("Content-Length", 0);
					response.response.end();
					_callback(null);
					return;
				}

				if (range) {
					start = range.start;
					end = range.end;
					response.response.statusCode	= 206;
					response.response.setHeader(
						"Content-Range",
						`bytes ${start}-${end}/${total}`
					);
					response.response.setHeader("Accept-Ranges", "bytes");
					response.response.setHeader("Content-Length", (end - start) + 1);
				}
			}

			try {
				readStream = typeof(start) === "number"
					? server._fs.createReadStream(filePath, { start: start, end: end })
					: server._fs.createReadStream(filePath);
			} catch (err) {
				_callback(err);
				return;
			}



			// This catches any errors that happen while creating the readable stream (usually invalid names)
			readStream.on('error', function(err) {
				_callback(err);
			});

			// // This will wait until we know the readable stream is actually valid before piping
			readStream.on('open', function () {
				// This just pipes the read stream to the response object (which goes to the client)
				readStream.pipe(response.response);
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
				_callback(null);
			});
		});
	};

	// response._destroy.push(function ResponsePipeEnd() {
	// 	delete response.pipeFile;
	// });

	callback();
};

module.exports = ResponsePipeFileDecorator;