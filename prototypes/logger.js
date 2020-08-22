var promptCallbacks = [];

process.stdin.on('readable', function () {
	var chunk = process.stdin.read();
	if (chunk !== null) {
		if (promptCallbacks.length) {
			var cbs = promptCallbacks;
			promptCallbacks = [];
			cbs.forEach(function (cb) {
				var er;
				try {
					cb(chunk);
				} catch (er) {
					console.log(er);
				}
			});
		}
	}
});


var path = require("path");



var stackList = function () {
	var stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/i;
	var stackReg2 = /at\s+()(.*):(\d*):(\d*)/i;
	var stackIndex = 1;
	var data = {
		method: "anonymous",
		path: "unknown",
		line: "?",
		pos: "?",
		file: "unknown",
		stack: ""
	};
	var errorStack = (new Error()).stack.split('\n').slice(3);
	var s = errorStack[stackIndex] || errorStack[0],
		sp = stackReg.exec(s) || stackReg2.exec(s);
	if (sp && sp.length === 5) {
		data.method = data.method || sp[1];
		data.path = path.relative(process.cwd(), sp[2]);
		data.line = sp[3];
		data.pos = sp[4];
		data.file = (data.path + '').replace(/^[\S\s]*\//, '');
		data.stack = errorStack.join('\n');
	}
	return data;
};

/**
 * @example
 * // =============================
 * //   Use Logger as 💻 instance
 * // =============================
 * 
 * const { LoggerBuilder } = require('@sgapps.io/server');
 * 
 * const logger = new LoggerBuilder();
 * 
 * logger.log("Hello world");
 * 
 * @example
 * // replace default console
 * 
 * const { LoggerBuilder } = require('@sgapps.io/server');
 * const logger = new LoggerBuilder();
 * logger.decorateGlobalLogger();
 * 
 * console.log("Console Messages are decorated now");
 * 
 * @class
 * @name LoggerBuilder
 * @description Pretty CLI Logger, with possibility to replace default nodejs' console logger
 */
function LoggerBuilder() {
	var console = global.console_original || global.console;
	/**
	 * @example
	 * // Insert an message in VT100 format
	 * logger._format = "\x1b[7m {{timestamp}} [{{TYPE}}] <{{title}}> {{file}}:{{line}} ({{method}}){{stack}}\x1b[7m";
	 * 
	 * @memberof LoggerBuilder#
	 * @description this parameter may be changed if you decide to change decoration schema
	 * @name _format
	 * @type {string}
	 */
	this._format = "\x1b[7m {{timestamp}} [{{TYPE}}] <{{title}}> {{file}}:{{line}} ({{method}}){{stack}}\x1b[7m";
	/**
	 * @memberof LoggerBuilder#
	 * @name _debug
	 * @type {boolean}
	 */
	this._debug  = true;
	return this;
}
LoggerBuilder.prototype.pushHeader = function (args, type, stack) {
	const data = stackList();
	let format = this._format;
	format = format.replace('{{timestamp}}', new Date().toISOString());
	format = format.replace('{{TYPE}}', type.toUpperCase());
	format = format.replace('{{file}}', data.file);
	format = format.replace('{{line}}', data.line);
	format = format.replace('{{method}}', data.method);
	format = format.replace('{{title}}', data.path);
	format = format.replace('{{stack}}', stack ? "\n" + data.stack + "\n" : "");
	args.unshift(format);
};

/**
 * @memberof LoggerBuilder#
 * @method prettyCli
 * @param {any} ref
 * @param {number} [indent]
 * @param {string} [separator="  "]
 */
LoggerBuilder.prototype.prettyCli = function (ref, indent, separator) {
	indent = indent || 0;
	if (separator === undefined) separator = "  ";
	let data = '';
	if (Array.isArray(ref)) {
		data += `\x1b[0m[${
			ref
				.map(item => this.prettyCli(item, indent + 1, separator))
				.map(
					(item, index) => `\n${separator}\x1b[0m${item}\x1b[0m${
						(index < ref.length - 1) ? ',' : '\n'
					}`
				).join('')
		}\x1b[0m]`
	} else {
		switch (typeof(ref)) {
			case "boolean":
				data += `\x1b[0;34m${ref}\x1b[0m`
			break;
			case "function":
				data += `\x1b[0;36m${ref}\x1b[0m`
			break;
			case "number":
				data += `\x1b[0;33m${ref}\x1b[0m`
			break;
			case "undefined":
				data += `\x1b[0;35m${ref}\x1b[0m`
			break;
			case "object":
				if (ref === null) {
					data += `\x1b[0;35m${ref}\x1b[0m`
				} else if (ref instanceof RegExp) {
					data += `\x1b[0;32mRegExp\x1b[34m(\x1b[32m${ref.toString()}\x1b[34m)\x1b[0m`
				} else if (ref instanceof Buffer) {
					data += `\x1b[0;32mBuffer\x1b[34m(\x1b[32m${
							ref.slice(0,16)
								.toString('hex')
								.replace(/(.{2})/g, '$1, ')
								.replace(/\,\s+$/, '')
								.replace(/,/g, '\x1b[0m,\x1b[32m')
						}\x1b[0m${
							ref.byteLength > 16 ? '...' : ''
						}\x1b[34m)\x1b[0m`
				} else {
					data += '\x1b[0m{\n';
					let prop, firstProp = true;
					for (prop in ref) {
						if (firstProp) {
							firstProp = false;
						} else {
							data += '\x1b[0m,\n'
						}
						if (`${prop}`.match(/^[\_\da-zA-Z]+$/)) {
							data += `\n${separator}\x1b[0m${prop} \: `;
						} else {
							data += `\n${separator}\x1b[32m${JSON.stringify(prop)}\x1b[0m] \: `;
						}
						data += ` ${this.prettyCli(ref[prop], indent + 1, separator)}`;
					}
					data += '}\x1b[0m';
				}
			break;
			case "string":
			default:
				data += `\x1b[0;32m${JSON.stringify(ref)}\x1b[0m`
			break;
		}
	}
	if (indent) {
		const indentData = '\n' + new Array(indent).fill(separator).join('');
		data = indentData + data.replace(/\n/g, indentData);
	}

	return data;
};

/**
 * @memberof LoggerBuilder#
 * @method log
 * @param {...any} messages
 */
LoggerBuilder.prototype.log	= function () {
	if (this._debug) {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("\x1b[0m");
		this.pushHeader(args, "log");
		args.push('\x1b[0m');
		console.log.apply(console, args);
	}
}

/**
 * @memberof LoggerBuilder#
 * @method info
 * @param {...any} messages
 */
LoggerBuilder.prototype.info = function () {
	if (this._debug) {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("\x1b[0;36m ");
		this.pushHeader(args, "info");
		args.push("\x1b[0m");
		console.log.apply(console, args);
	}
}

/**
 * @memberof LoggerBuilder#
 * @method warn
 * @param {...any} messages
 */
LoggerBuilder.prototype.warn = function () {
	if (this._debug) {
		var args = Array.prototype.slice.call(arguments);
		args.unshift("\x1b[0;40;33m ");
		this.pushHeader(args, "warn");
		args.push("\x1b[0m");
		console.log.apply(console, args);
	}
};

/**
 * @memberof LoggerBuilder#
 * @method error
 * @param {...any} messages
 */
LoggerBuilder.prototype.error	= function () {
	var getStackTrace = function () {
		var obj = {};
		Error.captureStackTrace(obj, getStackTrace);
		return obj.stack;
	};
	var args = Array.prototype.slice.call(arguments);
	console.log("\x1b[0;40;31m");
	this.pushHeader(args, "error", true);
	console.error.apply(console, args);
	console.log(getStackTrace());
	console.log("\x1b[0m\n");
}

/**
 * @callback LoggerBuilderPrompt
 * @param {Buffer} message 
 */

/**
 * @example
 * logger.prompt("rerun tests? [y/n]: ", function (err, buffer) {
 * 	// trim spaces from response
 * 	var response = buffer.toString().replace(/^\s*(.*?)\s*$/, '$1');
 * 	if (response === 'y') {
 * 		// write your code
 * 	}
 * });
 * 
 * @memberof LoggerBuilder#
 * @method prompt
 * @param {LoggerBuilderPrompt} callback
 * @param {string|Buffer} message
 */
LoggerBuilder.prototype.prompt = function (callback, message) {
	if (typeof (message) !== "undefined")
		process.stdout.write(message);
	promptCallbacks.push(callback);
}
		
/**
 * @memberof LoggerBuilder#
 * @method decorateGlobalLogger
 */
LoggerBuilder.prototype.decorateGlobalLogger = function () {
	//@ts-ignore
	if (!global.console_original) {
		//@ts-ignore
		global.console_original = {
			log: console.log,
			info: console.info,
			warn: console.warn,
			error: console.error,
			dir: console.dir,
			time: console.time,
			timeEnd: console.timeEnd,
			trace: console.trace,
			assert: console.assert,
			Console: console.Console
		};
		global.console.log = this.log;
		global.console.info = this.info;
		global.console.warn = this.warn;
		global.console.error = this.error;
		//@ts-ignore
		global.console.prompt = this.prompt;
	}
}

module.exports = LoggerBuilder;