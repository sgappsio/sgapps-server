var _fs      = require("fs");
var _path    = require("path");
var _cluster = require("cluster");
/**
 * @class
 * @name AccessLogger
 * @description Access Logger for HTTP Web Servers
 */
function AccessLogger() {
	this.months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December"
	];
	this.combined = false;	
};

/**
 * @memberof AccessLogger#
 * @method logRequest
 * @param {IncomingMessage} request 
 * @param {ServerResponse} response 
 * @returns {string}
 */
AccessLogger.prototype.logRequest = function (request, response) {
	return this.getRemoteIp(request) + ' - ' +
		this.getUsername(request) + ' [' +
		this.formattedDate(new Date()) + '] "' +
		(request.method || '-') + ' ' +
		(request.url || '-') + ' ' +
		this.getProtocol(request) + '/' +
		request.httpVersion + '" ' +
		response.statusCode + ' ' +
		((response.socket || response.connection || {}).bytesWritten || '-') + ' "' +
		(this.getReferer(request) || "-" ) + '"' + (
			this.combined ? (
				' "' +
				(request.headers['user-agent'] || "-") + '"'
			) : ''
		);
};

/**
 * @memberof AccessLogger#
 * @method formattedDate
 * @param {Date} timeStamp 
 * @returns {string}
 */
AccessLogger.prototype.formattedDate = function formattedDate(timeStamp) {
	var _2d = function (i) {
		return ((i < 10) ? ('0' + i) : (
			i > 99 ? (
				i + ''
			) : ('' + i)
		));
	};
    return _2d(timeStamp.getUTCDate()) + '/' +
        this.months[timeStamp.getMonth()].substring(0, 3) + '/' +
        _2d(timeStamp.getUTCFullYear()) + ':' +
        _2d(timeStamp.getUTCHours()) + ':' +
        _2d(timeStamp.getUTCMinutes()) + ':' +
        _2d(timeStamp.getUTCSeconds()) + ' +0000';
};

/**
 * @memberof AccessLogger#
 * @method getUsername
 * @param {IncomingMessage|SGAppsServerRequest} request 
 * @returns {string}
 */
AccessLogger.prototype.getUsername = function getUsername(request) {
    var username = "-";
	//@ts-ignore
    if (request.session && request.session.user) {
		//@ts-ignore
        username = request.session.user ? request.session.user.username : '';
    }
	
	//@ts-ignore
	if (username !== '-' && request.session && (request.session.id || request.session._id)) {
		//@ts-ignore
        username = request.session._id || request.session.id;
    }
    return username;
};

/**
 * @memberof AccessLogger#
 * @method getReferer
 * @param {IncomingMessage|SGAppsServerRequest} request 
 * @returns {string}
 */
AccessLogger.prototype.getReferer = function (request) {
	//@ts-ignore
    return (request.request || request).headers.referer || (request.request || request).headers.referrer || null;
};

/**
 * @memberof AccessLogger#
 * @method getProtocol
 * @param {IncomingMessage|SGAppsServerRequest} request
 * @returns {string}
 */
AccessLogger.prototype.getProtocol = function (request) {
	/**
	 * @private
	 * @type {IncomingMessage}
	 */
	//@ts-ignore
	var message = (request.request || request);

    if (message.socket && message.socket.localPort === 443) {
        return "HTTPS";
    }
    return "HTTP";
};

/**
 * @memberof AccessLogger#
 * @method getSize
 * @param {Buffer|string} data
 * @returns {number}
 */
AccessLogger.prototype.getSize = function (data) {
	if (data === null) return 0;
    if (Buffer.isBuffer(data)) {
        return data.length;
    }
    if (typeof data === 'string') {
        return Buffer.byteLength(data);
    }
	return null;
};

/**
 * @memberof AccessLogger#
 * @method getRemoteIp
 * @param {IncomingMessage} request
 * @returns {string}
 */
AccessLogger.prototype.getRemoteIp = function (request) {
	var getData = function (data) {
		if (Array.isArray(data)) return data[0];
		return data;
	};
    return getData(request.headers['X-Forwarded-For']) || getData(request.connection.remoteAddress) || "Unknown IP Address";
};

/**
 * @memberof AccessLogger
 * @callback AccessLoggerHandle
 * @param {string} dataLog
 * @returns {null|string}
 */
/**
 * @memberof AccessLogger
 * @typedef {object} AccessLoggerPath
 * @property {boolean} [isEnabled=false]
 * @property {string|null} [path] file path where logs will be written, placeholders: {year} {month} {date} {day} {pid} {worker-id}
 * @property {boolean} [waitAllHandlers=false] file path where logs will be written
 * @property {AccessLogger.AccessLoggerHandle|null} [handle]
 */

/***
 * @private
 * @type {Object<string,import("fs").WriteStream>}
 */
var AccessLoggerWriteStreams = {};

var AccessLoggerWriter = function (path, data) {
	var err;
	var logPath = _path.resolve(path);
	if (logPath in AccessLoggerWriteStreams) {
		if (AccessLoggerWriteStreams[logPath] !== null) {
			if (AccessLoggerWriteStreams[logPath].writable) {
				AccessLoggerWriteStreams[logPath].write(data + '\n');
			}
		}
	} else {
		var date = new Date();
		var filePath = logPath.replace(
			'{pid}',
			process.pid + ''
		).replace(
			'{year}',
			date.getFullYear() + ''
		).replace(
			'{month}',
			(date.getMonth() + 1) + ''
		).replace(
			'{date}',
			date.getDate() + ''
		).replace(
			'{day}',
			date.getDay() + ''
		).replace(
			'{worker-id}',
			( _cluster.worker ? _cluster.worker.id : 'master' ) + ''
		);

		var dirPath = _path.dirname(filePath);

		var err, dataStream;
		try {
			_fs.mkdirSync(dirPath, { recursive: true });
			dataStream = _fs.createWriteStream(
				filePath,
				{
					flags: 'a',
					mode: parseInt('0644', 8)
				}
			);
	
			if (dataStream.writable) {
				dataStream.write(data + '\n');
			}

			AccessLoggerWriteStreams[logPath] = dataStream;
		} catch (err) {
			AccessLoggerWriteStreams[logPath] = null;
		};
	}
};

/**
 * @private
 * @function
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 */
var AccessLoggerHandler = function (server, request, response) {
	var logData = server.AccessLogger.logRequest(request.request, response.response);
	var pathId, loggerPath, updatedLogData = logData, currentLogData;
	var paths = [];
	for (pathId in server.AccessLoggerPaths) {
		if (!updatedLogData) continue;

		loggerPath = server.AccessLoggerPaths[pathId];

		if (loggerPath.isEnabled) {
			if (loggerPath.handle) {
				currentLogData = loggerPath.handle(logData);
			} else {
				currentLogData = updatedLogData;
			}
			
			if (currentLogData) {
				if (loggerPath.waitAllHandlers) {
					updatedLogData = currentLogData;
					if (loggerPath.path) {
						paths.push(loggerPath.path);
					}
				} else {
					if (loggerPath.path) {
						AccessLoggerWriter(loggerPath.path, currentLogData);
					}
				}
			}
		}
	}

	for (pathId in request.AccessLoggerPaths) {
		if (!updatedLogData) continue;

		loggerPath = server.AccessLoggerPaths[pathId];

		if (loggerPath.isEnabled) {
			if (loggerPath.handle) {
				currentLogData = loggerPath.handle(logData);
			} else {
				currentLogData = updatedLogData;
			}
			
			if (currentLogData) {
				if (loggerPath.waitAllHandlers) {
					updatedLogData = currentLogData;
					if (loggerPath.path) {
						paths.push(loggerPath.path);
					}
				} else {
					if (loggerPath.path) {
						AccessLoggerWriter(loggerPath.path, currentLogData);
					}
				}
			}
		}
	}

	if (updatedLogData) {
		paths.forEach(function (path) {
			AccessLoggerWriter(path, updatedLogData);
		});
	}
};

/**
 * this decorator is not enabled by default
 * @memberof SGAppsServerDecoratorsLibrary
 * @method AccessLoggerDecorator
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback
 */
var AccessLoggerDecorator = function (request, response, server, callback) {
	if (
		request === null
		&& response === null
		&& server
	) {
		/**
		 * @memberof SGAppsServer#
		 * @var {AccessLogger} AccessLogger
		 */
		server.AccessLogger = new AccessLogger();

		/**
		 * @memberof SGAppsServer#
		 * @var {Object<string,AccessLogger.AccessLoggerPath>} AccessLoggerPaths
		 */
		server.AccessLoggerPaths = {};
	} else {
		/**
		 * @memberof SGAppsServerRequest#
		 * @var {Object<string,AccessLogger.AccessLoggerPath>} AccessLoggerPaths
		 */
		request.AccessLoggerPaths = {};
		response.response.on('close', function () {
			AccessLoggerHandler(server, request, response);
		});
	}
	callback();
};

AccessLoggerDecorator.AccessLogger = AccessLogger;

module.exports = AccessLoggerDecorator;

