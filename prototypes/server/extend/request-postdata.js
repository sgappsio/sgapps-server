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
	request._postDataBuffer = Buffer.from('', 'binary');

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
		set: () => server.logger.warn("[Request.bodyItems] is not configurable"),
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
	 * @memberof SGAppsServerRequest#
	 * @name fileItems
	 * @type {SGAppsServerRequestFile[]}
	 */
	let _fileItems = [];
	Object.defineProperty(request, 'fileItems', {
		get: () => _fileItems,
		set: () => server.logger.warn("[Request.fileItems] is not configurable"),
		enumerable: true,
		configurable: true
	});

	/**
	 * Automatically used procedure for parsing formData field name if option `server._options._REQUEST_FORM_PARAMS_DEEP_PARSE = true`. it's by default enabled but can be disabled when needed
	 * @memberof SGAppsServerRequest#
	 * @method _parseDeepFieldName
	 * @param {object} container
	 * @param {string} fieldName
	 * @param {any} fieldData
	 * @param {object} [options]
	 * @param {boolean} [options.transform2ArrayOnDuplicate=false]
	 * @example
	 * paramsContainer = {};
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][data]', 2);
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
	 * request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
	 * // if _debug enabled warns will be emitted
	 * // [Warn] [Request._parseDeepFieldName] Writing Array field "test[arr][]" into a object
	 * // [Warn] [Request._parseDeepFieldName] Overwriting field "test[data]" value
	 * console.log(paramsContainer)
	 * {
	 *     "test": {
	 *         "arr": {
	 *             "1": "2021-02-12T21:23:01.913Z",
	 *             "2": 2,
	 *             "data": 2
	 *         },
	 *         "data": 2
	 *     }
	 * }
	 * @example
	 * paramsContainer = {};
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][data]', 2);
	 * request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
	 * // if _debug enabled warns will be emitted
	 * // [Warn] [Request._parseDeepFieldName] Converting array to object due incorrect field "test[arr][data]" name 
	 * console.log(paramsContainer)
	 * {
	 *     "test": {
	 *         "arr": {
	 *             "0": "2021-02-12T21:34:47.359Z",
	 *             "1": 2,
	 *             "data": 2
	 *         },
	 *         "data": 2
	 *     }
	 * }
	 * @example
	 * paramsContainer = {};
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', new Date());
	 * request._parseDeepFieldName(paramsContainer, 'test[arr][]', 2);
	 * request._parseDeepFieldName(paramsContainer, 'test[data]', 2);
	 * console.log(paramsContainer)
	 * {
	 *     "test": {
	 *         "arr": [
	 *             "2021-02-12T21:26:43.766Z",
	 *             2
	 *         ],
	 *         "data": 2
	 *     }
	 * }
	 */
	request._parseDeepFieldName = (container, fieldName, fieldData, options) => {
		if (!fieldName[0] || fieldName[0] === '[') {
			console.warn(
				`[Warn] [Request._parseDeepFieldName] Unable to parse fieldName without base`, {
					container,
					fieldName,
					fieldData
				}
			);
			return;
		}
	
		let fieldNamePrefix = fieldName.replace(/\[.*$/, '');
		container[fieldNamePrefix] = container[fieldNamePrefix] || {};
		let p = container[fieldNamePrefix];
		let pPrev = container;
		const _debug = server.logger._debug;
	
		const parts = fieldName
			.match(/\[[^\[]*\]/g);
	
		if (!parts) {
			if (fieldNamePrefix in container) {
				if (_debug) {
					server.logger.warn(
						`[Warn] [Request._parseDeepFieldName] Overwriting field "${fieldName}" value`, {
							container,
							fieldName,
							fieldData
						}
					);
				}
			}
			container[fieldNamePrefix] = fieldData;
			return;
		}
	
		parts
			.map(v => v.replace(/^\[([^\]]*)\]$/, '$1'))
			.forEach((k, i, a) => {
				if (p && typeof (p) === "object") {
					if (i === a.length - 1) {
						if (k === '') {
							if (pPrev) {
								const prevIndex = i ? a[i - 1] : fieldNamePrefix;
								if (!Array.isArray(pPrev[prevIndex])) {
									if (prevIndex in pPrev) {
										if (pPrev[prevIndex] && typeof (pPrev[prevIndex]) === "object") {
											const index = Object.keys(pPrev[prevIndex]).length;
	
											if (index === 0) {
												pPrev[prevIndex] = [];
												pPrev[prevIndex].push(fieldData);
											} else {
												if (_debug) {
													server.logger.warn(
														`[Warn] [Request._parseDeepFieldName] Writing Array field "${fieldName}" into a object`, {
															container,
															fieldName,
															fieldData
														}
													);
												}
												if (index in pPrev[prevIndex]) {
													if (_debug) {
														server.logger.warn(
															`[Warn] [Request._parseDeepFieldName] Overwriting field "${fieldName}" value`, {
																container,
																fieldName,
																fieldData
															}
														);
													}
												}
												pPrev[prevIndex][index] = fieldData;
											}
										} else {
											pPrev[prevIndex] = [];
											pPrev[prevIndex].push(fieldData);
										}
									} else {
										pPrev[prevIndex] = [];
										pPrev[prevIndex].push(fieldData);
									}
								} else {
									pPrev[prevIndex].push(fieldData);
								}
							} else {
								if (_debug) {
									console.warn(
										`[Warn] [Request._parseDeepFieldName] Unable to parse intermediary array index "[]"`, {
											container,
											fieldName,
											fieldData
										}
									);
								}
								p = null;
							}
						} else {
							if (k in p) {
								if (_debug) {
									console.warn(
										`[Warn] [Request._parseDeepFieldName] Overwriting field "${fieldName}" value`, {
											container,
											fieldName,
											fieldData
										}
									);
								}
							} else {
								if (Array.isArray(p)) {
									if (k.match(/^\d+$/)) {
										if (p[k] === undefined) {
											p[k] = fieldData;
										} else {
											if (_debug) {
												server.logger.warn(
													`[Warn] [Request._parseDeepFieldName] Overwriting field "${fieldName}" value`, {
														container,
														fieldName,
														fieldData
													}
												);
											}
											p[k] = fieldData;
										}
									} else {
										if (_debug) {
											server.logger.warn(
												`[Warn] [Request._parseDeepFieldName] Converting array to object due incorrect field "${fieldName}" name`, {
													container,
													fieldName,
													fieldData
												}
											);
										}
	
										const prevIndex = i ? a[i - 1] : fieldNamePrefix;
										pPrev[prevIndex] = Object.assign({}, p);
										pPrev[prevIndex][k] = fieldData;
									}
								} else {
									p[k] = fieldData;
								}
							}
						}
					} else {
						if (k === '') {
							if (_debug) {
								server.logger.warn(
									`[Warn] [Request._parseDeepFieldName] Unable to parse intermediary array index "[]"`, {
										container,
										fieldName,
										fieldData
									}
								);
							}
							p = null;
						} else {
							p[k] = p[k] || {};
							pPrev = p;
							p = p[k];
						}
					}
				} else {
					if (p !== null) {
						p = null;
						if (_debug) {
							server.logger.warn(
								`[Warn] [Request._parseDeepFieldName] Unable to parse Request params. Setting field "${fieldName}" in structure`, {
									container,
									fieldName,
									fieldData
								}
							);
						}
					}
				}
			});
	};

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
							let readable = new Readable();
							readable._read = () => {}; // _read is required but you can noop it
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

										//@ts-ignore
										_fileItems.push(file);

										if (server._options._REQUEST_FORM_PARAMS_DEEP_PARSE) {
											request._parseDeepFieldName(
												_files, fieldName, file
											);
										} else {
											if (!(fieldName in _files)) _files[fieldName] = [];
											//@ts-ignore
											_files[fieldName].push(file);
										}
			
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
									if (server._options._REQUEST_FORM_PARAMS_DEEP_PARSE) {
										request._parseDeepFieldName(
											_body, fieldName, value
										);
									} else {
										_body[fieldName] = value;
									}
								});
				
								busboy.on('error', function (err) {
									server.logger.error(err);
									reject(err);
								});
				
								busboy.on('finish', function () {
									resolve(request._postDataBuffer);
								});
				
								//@ts-ignore
								readable.pipe(busboy); // consume the Stream
						} else {
							if (
								(
									(
										request.request.headers['content-type'] || ''
									) || ''
								).indexOf('application/json') === 0
							) {
								const data = request._postDataBuffer.toString('utf-8', 0, request._postDataBuffer.length);

								try {
									const jsonData = JSON.parse(data);
									if (jsonData && typeof(jsonData) === "object") {
										Object.assign(_body, jsonData);
									}
								} catch (err) {
									if (server.logger._debug) {
										server.logger.warn(`[Request._body] Unable to parse JSON data`);
									}
								}
							} else if (
								(
									(
										request.request.headers['content-type'] || ''
									) || ''
								).indexOf('application/x-www-form-urlencoded') === 0
							) {
								const data = request._postDataBuffer.toString('utf-8', 0, request._postDataBuffer.length);
								
								//@ts-ignore
								try {
									const formData = data.parseUrlVars(true);
	
									if (formData && typeof(formData) === "object") {
										Object.assign(_body, formData);
									}
								} catch (err) {
									if (server.logger._debug) {
										server.logger.warn(`[Request._body] Unable to parse URL Formed Data data`);
									}
								}
							}
							resolve(request._postDataBuffer);
						}
					});
				});
				return _postData;
			},
			set: (v) => {
				server.logger.warn('[Request.postData] is not writeable');
			}
		}
	);

	response._destroy.push(function () {
		_postData = null;
		_body = null;
		_bodyItems = null;
		_fileItems = null;
		_files = null;
		delete request._parseDeepFieldName;
		delete request._postDataBuffer;
		delete request.postData;
	});

	callback();
};

