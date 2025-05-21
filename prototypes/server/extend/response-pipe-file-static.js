const _zlib = require('zlib');
const { Stats } = require('fs');
const { pipeline } = require('stream');
const _path = require('path');
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
	 * @param {object} [options]
	 * @param {number} [options.timeout=0]
	 * @param {string} [options.filePath] originap path is autoIndex was applied
	 * @param {string[]} [options.autoIndex] list of auto-index files, ex: ['index.html', 'index.htm', 'default.html']
	 */
	response.pipeFileStatic = function ResponsePipeFileStatic(filePath, fileName, callback, options = { timeout: 0, autoIndex: [] }) {
		var returned  = false;
		var _callback = function (err) {
			if (!returned && callback) {
				callback(err);
			}
		};
		function isWritable(stream) {
			return stream && !stream.destroyed && stream.writable;
		};
		server._fs.stat(filePath, function (
			err,
			stat
		) {
			if (err) {
				if (
					options.filePath
					&& options.filePath !== filePath
					&& options.autoIndex
					&& options.autoIndex.length
					&& !options.autoIndex.includes(_path.basename(filePath))
				) {
					return response.pipeFileStatic(
						_path.resolve(options.filePath, options.autoIndex[0]),
						fileName,
						callback,
						Object.assign(
							{},
							options || {},
							{
								filePath: options.filePath || filePath,
								autoIndex: options.autoIndex.slice(1)
							}
						)
					);
				} else if (callback) {
					_callback(err);
				} else {
					response.sendError(err);
				}
			} else if (stat.isDirectory() && options.autoIndex && options.autoIndex.length) {
				return response.pipeFileStatic(
					_path.resolve(filePath, options.autoIndex[0]),
					fileName,
					callback,
					Object.assign(
						{},
						options || {},
						{
							filePath: options.filePath || filePath,
							autoIndex: options.autoIndex.slice(1)
						}
					)
				);
			} else if (!stat.isFile()) {
				const err = Error('IS_NOT_FILE File not allowed to be accessed');
				if (callback) {
					_callback(err);
				} else {
					response.sendError(err);
				}
			} else {
				var eTagTime = Date.parse(stat.mtime);
				var eTag = `${stat.size}-${eTagTime}`;
				response.response.setHeader(
					'Last-Modified',
					new Date(eTagTime).toUTCString()
				);
				if (request && request.request.headers['if-none-match'] === eTag) {
					response.response.statusCode = 304;
					response.response.end();
					_callback();
				} else {
					if (!isWritable(response.response)) {
						_callback(new Error('Client connection closed or response already destroyed.'));
						return;
					}
					var acceptEncoding = request.request.headers['accept-encoding'];
					if (Array.isArray(acceptEncoding)) acceptEncoding = acceptEncoding[0];
					var raw = function () {
						const stream = server._fs.createReadStream(filePath);
						if (options.timeout) {
							setTimeout(() => {
								stream.close();
								stream.push(null);
								stream.read(0);
							}, options.timeout);
						}
						return stream;
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
						if (!isWritable(response.response)) {
							_callback(new Error('Client connection closed or response already destroyed.'));
							return;
						}
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
							}
						);
						
						pipeline(
							raw(),
							_zlib.createDeflate(),
							//@ts-ignore
							response.response,
							(err) => {
								response.sendError(err, {statusCode: 500});
							}
						);
					} else if (acceptEncoding.match(/\bgzip\b/)) {
						if (!isWritable(response.response)) {
							_callback(new Error('Client connection closed or response already destroyed.'));
							return;
						}
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

						pipeline(
							raw(),
							_zlib.createGzip(),
							//@ts-ignore
							response.response,
							(err) => {
								response.sendError(err, {statusCode: 500});
							}
						);
					} else {
						if (!isWritable(response.response)) {
							_callback(new Error('Client connection closed or response already destroyed.'));
							return;
						}
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

	// response._destroy.push(function () {
	// 	delete response.pipeFileStatic;
	// });

	callback();
}

module.exports = ResponsePipeFileStaticDecorator;