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

	response.on('end', () => {
		this._destroy.forEach((unbindCall) => {
			unbindCall();
		});
		response.removeAllListeners();
	});

	return this;
};

module.exports = SGAppsServerResponse;