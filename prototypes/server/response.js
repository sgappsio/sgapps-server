const { ServerResponse } = require("http");
const SGAppsServer = require("../server");

/**
 * @class
 * @name SGAppsServerResponse
 * @param {ServerResponse} response
 * @param {SGAppsServer} server
 */
function SGAppsServerResponse(response, server) {

	/**
	 * @memberof SGAppsServerResponse#
	 * @name response
	 * @type {ServerResponse}
	 */
	this.response = response;

	/**
	 * Array of functions to be called on response end
	 * @memberof SGAppsServerResponse#
	 * @name _destroy
	 * @type {Array<function>}
	 */
	this._destroy = [];


	/**
	 * Array of functions to be called on response end
	 * @memberof SGAppsServerResponse#
	 * @var {object} _flags
	 * @property {boolean} finished will be true if response.end() has been called.
	 * @property {boolean} sent Is true if all data has been flushed to the underlying system, immediately before the 'finish' event is emitted.
	 * @property {boolean} closed Indicates that the the response is completed, or its underlying connection was terminated prematurely (before the response completion).
	 */
	this._flags = {
		sent: response.writableFinished || false,
		closed: false
	};

	Object.defineProperties(
		this._flags,
		{
			finished: {
				get: () => response.finished || response.writableEnded
			}
		}
	);

	response.on('finish', () => {
		this._flags.sent = true;
	});

	response.on('close', () => {
		this._flags.closed = true;
	})

	response.on('end', () => {
		this._destroy.forEach((unbindCall) => {
			unbindCall();
		});
		response.removeAllListeners();
	});

	return this;
};

module.exports = SGAppsServerResponse;