/**
 * @private
 * @function
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {SGAppsServerErrorOnlyCallback} [callback] 
 */
function loadNodeJsMvcApp(request, response, server, callback) {
	const _path = server._path;
	/**
	 * @private
	 * @type {FSLibrary}
	 */
	const _fs   = server._fs;
	const _appPath = server.NodeJsMvc.appPath;

	// TODO
}

/**
 * this decorator is not enabled by default
 * @memberof SGAppsServerDecoratorsLibrary
 * @method NodeJsMvcDecorator
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback
 */
function NodeJsMvcDecorator(request, response, server, callback) {
	if (
		request === null
		&& response === null
		&& server
	) {
		/**
		 * @memberof SGAppsServer#
		 * @name NodeJsMvc
		 * @type {object}
		 * @property {string} appPath
		 */;
		let _appPath = null;
		//@ts-ignore
		server.NodeJsMvc = {};
	
		Object.defineProperty(
			server.NodeJsMvc,
			'appPath',
			{
				get: () => _appPath,
				set: (v) => {
					if (typeof(v) === "string") {
						if (_appPath !== null) {
							server.logger.warn('[Server.NodeJsMvcDecorator] unable to set _appPath twice');
							return;
						}
						_appPath = v;

						loadNodeJsMvcApp(
							request,
							response,
							server
						);
					}
				}
			}
		);
	}

	callback();
};


module.exports = NodeJsMvcDecorator;