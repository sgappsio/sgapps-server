const ePrototype = require("application-prototype/constructors/extensions/prototype");
const Busboy = require("busboy");
const { ServerResponse } = require("http");
const { Stream, Readable } = require("stream");

/**
 * @private
 * @method RequestUrlDecorator
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server
 * @param {function} callback
 */
module.exports = function RequestUrlDecorator(request, response, server, callback) {
	if (request === null || response === null) {
		callback();
		return;
	}

	/**
	 * post data buffer cache
	 * @memberof SGAppsServerRequest#
	 * @name _postDataBuffer
	 * @type {Buffer}
	 */
	request._postDataBuffer = new Buffer('');

	/**
	 * @typedef {object} SGAppsServerRequestFile
	 * @property {string} fieldName field's name
	 * @property {object} data
	 * @property {string} data.fileName file's name `[duplicate]`
	 * @property {string} data.encoding file's encoding
	 * @property {Readable} data.fileStream () => fileStream
	 * @property {Buffer} data.fileData
	 * @property {number} data.fileSize size in bytes
	 * @property {string} data.contentType file's mimeType
	 * @property {boolean} data.loaded indicate if file is fully loaded into `fileData`
	 */

	/**
	 * @typedef {object} SGAppsServerRequestPostDataItem
	 * @property {string} fieldName field's name
	 * @property {object} data
	 * @property {string} data.value
	 * @property {string} data.encoding file's encoding
	 * @property {string} data.valTruncated 
	 * @property {Buffer} data.fieldNameTruncated
	 * @property {string} data.mimeType file's mimeType
	 */

	let _body = {};
	let _bodyItems = [];

	/**
	 * @memberof SGAppsServerRequest#
	 * @name body
	 * @type {object}
	 */
	Object.defineProperty(request, 'body', {
		get: () => _body,
		set: () => server.logger.warn("[Request.body] is not configurable"),
		enumerable: true,
		configurable: true
	});

	/**
	 * @memberof SGAppsServerRequest#
	 * @name bodyItems
	 * @type {SGAppsServerRequestPostDataItem[]}
	 */
	Object.defineProperty(request, 'bodyItems', {
		get: () => _bodyItems,
		set: () => server.logger.warn("[Request.body] is not configurable"),
		enumerable: true,
		configurable: true
	});

	/**
	 * @memberof SGAppsServerRequest#
	 * @name files
	 * @type {Object<string,SGAppsServerRequestFile[]>}
	 */
	let _files = {};
	Object.defineProperty(request, 'files', {
		get: () => _files,
		set: () => server.logger.warn("[Request.files] is not configurable"),
		enumerable: true,
		configurable: true
	});

	/**
	 * request's post received data
	 * @memberof SGAppsServerRequest#
	 * @name postData
	 * @type {Promise<Buffer>}
	 */
	let _postData = null;
	Object.defineProperty(
		request,
		'postData',
		{
			get: () => {
				if (_postData) return _postData;
				_postData = new Promise(function (resolve, reject) {
					let _postDataSize = 0;
					let _canceled = false;
					request.request.on("data", function (chunk) {
						if (_canceled) return;
						if (request.request.aborted) return;
			
						var dataLimit = request.MAX_POST_SIZE;
			
						if (dataLimit < _postDataSize) {
							_canceled = true;
							const err = Error('[Request.MAX_POST_SIZE] exceeded');
							server.logger.error(err);
							reject(err);
							return;
						}
			
						request._postDataBuffer = Buffer.concat([request._postDataBuffer, chunk]);
			
						_postDataSize += chunk.length;
					});
			
					request.request.once("error", function (err) {
						if (_canceled) return;
						server.logger.error(err);
						_canceled = true;
						reject(err);
					});
			
					request.request.once("abort", function () {
						if (_canceled) return;
						const err = Error('[Request] aborted');
						server.logger.error(err);
						_canceled = true;
						reject(err);
					});
			
					request.request.once('end', function () {
						if (_canceled) return;
						if (
							(
								request.request.headers['content-type'] || ''
							).indexOf('multipart/form-data') === 0
						) {
			
							let Readable = require('stream').Readable;
							let readable = new Readable()
							readable._read = () => {} // _read is required but you can noop it
							readable.push(request._postDataBuffer);
							readable.push(null);
				
							var detectedBoundary = (
								request._postDataBuffer
									.slice(0, 1024).toString()
									.match(/^\-\-(\-{4,}[A-Za-z0-9]{4,}\-*)(\r|)\n/) || []
							)[1] || null;
				
								if (detectedBoundary) {
									var calculatedHeader = 'multipart/form-data; boundary=' + detectedBoundary;
									if (
										calculatedHeader !== request.request.headers['content-type']
									) {
										server.logger.warn(
											"Multipart Form Data: boundary replaced from ",
											request.request.headers['content-type'],
											calculatedHeader
										);
									}
									request.request.headers['content-type'] = calculatedHeader;
								}
				
								/**
								 * @private
								 * @type {Readable}
								 */
								//@ts-ignore
								const busboy = new Busboy({
									headers: request.request.headers,
									limits: {
										fieldNameSize: 255,
										fieldSize: request.MAX_POST_SIZE,
										fileSize: request.MAX_POST_SIZE
									}
								});
			
								busboy.on(
									'file',
									/**
									 * @inner
									 * @param {string} fieldName 
									 * @param {Readable} fileStream 
									 * @param {string} fileName 
									 * @param {string} encoding 
									 * @param {string} mimeType 
									 */
									function (
										fieldName,
										fileStream,
										fileName,
										encoding,
										mimeType
									) {
										const file = {
											fieldName: fieldName,
											data: {
												fileName: fileName,
												encoding: encoding,
												fileStream: () => fileStream,
												fileData: null,
												fileSize: 0,
												contentType: mimeType,
												loaded: false
											}
										};
										if (!(fieldName in _files)) _files[fieldName] = [];
			
										//@ts-ignore
										_files[fieldName].push(file);
			
										fileStream.on('data', function (data) {
											file.data.fileData.push(data);
											file.data.fileSize += data.length;
										});
										fileStream.on('error', function (err) {
											file.data.error = err;
											server.logger.error(err);
										});
										fileStream.on('end', function () {
											file.data.fileData = Buffer.concat(file.data.fileData);
											if (!file.data.error)
												file.data.loaded = true;
										});
									}
								);
			
								busboy.on('field', function (fieldName, value, fieldNameTruncated, valTruncated, encoding, mimeType) {
									// console.warn("BusBoy Field", arguments);
									_bodyItems.push({
										fieldName: fieldName,
										data: {
											value: value,
											fieldNameTruncated: fieldNameTruncated,
											valTruncated: valTruncated,
											encoding: encoding,
											mimeType: mimeType
										}
									});
									_body[fieldName] = value;
								});
				
								busboy.on('error', function (err) {
									server.logger.error(err);
									reject(err);
								});
				
								busboy.on('finish', function () {
									resolve(request._postDataBuffer);
								});
				
								//@ts-ignore
								readable.pipe(busboy) // consume the stream
						} else {
							resolve(request._postDataBuffer);
						}
					});
				});
				return _postData;
			},
			set: (v) => {
				server.logger.warn('[Request.postData] is not writeable')
			}
		}
	)

	response._destroy.push(function () {
		_postData = null;
		_body = null;
		_bodyItems = null;
		_files = null;
		delete request._postDataBuffer;
		delete request.postData;
	})

	callback();
}

