const ePrototype = require("application-prototype/constructors/extensions/prototype");

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
	 * @typedef {string} MountUpdatedURL
	 */
	/**
	 * @memberof SGAppsServerRequest#
	 * @method getMountUpdatedUrl
	 * @param {string} url
	 * @returns {MountUpdatedURL}
	 */
	request.getMountUpdatedUrl	= function (url) {
		if (request.mountPath !== "/") {
			if (request.mountPath[0] === "^") {
				return '/'+url.substring(
					(
						(
							url.match(
								new RegExp(request.mountPath)
							) || []
						)[0] || ""
					).length
				).replace(/^\/+/, '');
			} else {
				return '/'+url.substring(request.mountPath.length).replace(/^\/+/, '');
			}
		}
		return url;
	};

	response._destroy.push(() => {
		delete request.getMountUpdatedUrl;
	});

	callback();
};