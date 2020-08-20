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
	return this;
};

module.exports = SGAppsServerResponse;