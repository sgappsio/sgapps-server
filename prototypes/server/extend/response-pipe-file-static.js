const _zlib = require('zlib');
const { Stats } = require('fs');
/**
 * @private
 * @method ResponsePipeFileStaticDecorator
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server
 * @param {function} callback
 */
function ResponsePipeFileStaticDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	 * @inner
	 * @memberof SGAppsServerResponse#
	 * @callback pipeFileStaticCallback
	 * @param {Error} error 
	 */

	/**
	 * @method pipeFileStatic
	 * @memberof SGAppsServerResponse#
	 * @param {string} filePath
	 * @param {string} fileName
	 * @param {SGAppsServerResponse.pipeFileStaticCallback} callback
	 */
	response.pipeFileStatic = function ResponsePipeFileStatic(filePath, fileName, callback) {
		var returned  = false;
		var _callback = function (err) {
			if (!returned && callback) {
				callback(err);
			}
		};
		server._fs.stat(filePath, function (
			err,
			stat
		) {
			if (err) {
				if (callback) {
					_callback(err);
				} else {
					response.sendError(err);
				}
			} else if (!stat.isFile()) {
				const err = Error('IS_NOT_FILE File not allowed to be accesed');
				if (callback) {
					_callback(err);
				} else {
					response.sendError(err);
				}
			} else {
				var eTag = `${stat.size}-${Date.parse(stat.mtime)}`;
				response.response.setHeader(
					'Last-Modified',
					stat.mtime
				);
				if (request && request.request.headers['if-none-match'] === eTag) {
					response.response.statusCode = 304;
					response.response.end();
					_callback();
				} else {
					var acceptEncoding = request.request.headers['accept-encoding'];
					if (Array.isArray(acceptEncoding)) acceptEncoding = acceptEncoding[0];
					var raw = function () {
						return server._fs.createReadStream(filePath);
					};
					if (!acceptEncoding) {
						acceptEncoding = '';
					}

					response.response.setHeader(
						'Content-Type',
						server.EXTENSIONS.mime(fileName || filePath || "file")
					);
					response.response.setHeader(
						'ETag',
						eTag
					);
					response.response.statusCode = 200;
					let resError;
					if (acceptEncoding.match(/\bdeflate\b/)) {
						response.response.setHeader(
							'content-encoding',
							'deflate'
						);
						
						response.response.on(
							'end',
							function () {
								_callback(resError);
							}
						);
						response.response.on(
							'error',
							function (err) {
								resError = err;
							});
						raw().pipe(
							_zlib.createDeflate()
						).pipe(response.response);
					} else if (acceptEncoding.match(/\bgzip\b/)) {
						response.response.setHeader(
							'content-encoding',
							'gzip'
						);
						response.response.on(
							'end',
							function () {
								_callback(resError);
							}
						);
						response.response.on(
							'error',
							function (err) {
								resError = err;
							}
						);
						raw().pipe(_zlib.createGzip()).pipe(response.response);
					} else {
						response.response.setHeader(
							'Content-Length',
							stat.size
						);
						response.pipeFile(
							filePath,
							(
								callback || function (err) {
									if (err) {
										response.sendError(err);
									} else {
										response.response.end();
									}
								}
							)
						);
					}
				}
			}
		});
	};

	response._destroy.push(function () {
		delete response.pipeFileStatic;
	});

	callback();
}

module.exports = ResponsePipeFileStaticDecorator;