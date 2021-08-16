const TemplateManagerViewer = require("../prototypes/server/extend/template-manager/viewer");

/**
 * @memberof SGAppsServer.NodeJsMvc.Controller
 * @typedef {object} View
 * @property {string} name
 * @property {string} path
 * @property {string} code
 */;


/**
 * @memberof SGAppsServer.NodeJsMvc.Controller.Action
 * @callback OptionCapture
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {SGAppsServer} server
 * @param {SGAppsServer.NodeJsMvc.Controller} controller
 * @param {SGAppsServer.NodeJsMvc.Controller.Action} action
 */

/**
 * @memberof SGAppsServer.NodeJsMvc.Controller.Action
 * @typedef {object} Options
 * @property {boolean} public
 * @property {boolean} postData
 * @property {number} maxPostSize
 * @property {SGAppsServer.NodeJsMvc.Controller.Action.OptionCapture} [capture]
 */;

/**
 * @memberof SGAppsServer.NodeJsMvc.Controller
 * @class
 * @name Action
 * @param {string} actionName
 * @param {SGAppsServer.NodeJsMvc.Controller} controller
 * @param {SGAppsServer.NodeJsMvc.Controller.Action.Options} options
 * @param {SGAppsServer} server
 */
function NodeJsMvcAction(actionName, controller, options, server ) {
	var _config	= Object.assign(
		{
			public: false,
			postData: false,
			maxPostSize: server.MAX_POST_SIZE,
			capture: null
		}, options || {}
	);
	/**
	 * @private
	 * @type {SGAppsServer.NodeJsMvc.Controller.Action}
	 */
	//@ts-ignore
	var actionObject	= {
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
		 * @name controller
		 * @type {SGAppsServer.NodeJsMvc.Controller}
		 */
		controller	: controller,
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
		 * @name name
		 * @type {string}
		 */
		name	: actionName,
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
		 * @method run
		 * @param {SGAppsServerRequest} request
		 * @param {SGAppsServerResponse} response
		 */
		run			: function(request, response) {
			if (
				('capture' in _config)
				&& _config.capture
			) {
				_config.capture(
					request,
					response,
					server,
					controller,
					actionObject
				);
			} else {
				response.sendError(Error('[Server.NodeJsMvc.Controller.Action] is empty'));
			}
		}
	};
	/**
	 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
	 * @name public
	 * @type {boolean}
	 */
	Object.defineProperty(
		actionObject,
		'public',
		{
			get: () => _config.public,
			set: (v) => {
				_config.public = !!v;
			}
		}
	);
	/**
	 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
	 * @name postData
	 * @type {boolean}
	 */
	Object.defineProperty(
		actionObject,
		'postData',
		{
			get: () => _config.postData,
			set: (v) => {
				_config.postData = !!v;
			}
		}
	);
	/**
	 * @memberof SGAppsServer.NodeJsMvc.Controller.Action#
	 * @name maxPostSize
	 * @type {number}
	 */
	Object.defineProperty(
		actionObject,
		'maxPostSize',
		{
			get: () => _config.maxPostSize,
			set: (v) => {
				_config.maxPostSize = v;
			}
		}
	);
	return actionObject;
}

/**
 * @memberof SGAppsServer.NodeJsMvc
 * @class
 * @name Controller
 * @param {string} controllerName
 * @param {object} options
 * @param {object} [options.shared]
 * @param {SGAppsServer} server
 */
function NodeJsMvcController(controllerName, options, server ) {
	// options._onAction( actionName, controllerObject );
	// options._noAction( actionName, controllerObject );
	
	/**
	 * @private
	 * @type {SGAppsServer.NodeJsMvc.Controller}
	 */
	var controllerObject	= {
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @name _actions
		 * @type {Object<string,SGAppsServer.NodeJsMvc.Controller.Action>}
		 */
		_actions: {},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @name _views
		 * @type {Object<string,SGAppsServer.NodeJsMvc.Controller.View>}
		 */
		_views: {},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @name viewer
		 * @type {TemplateManagerViewer}
		 */
		viewer: server.TemplateManager._viewer,
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @name name
		 * @type {string}
		 */
		name: controllerName,
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method getView
		 * @param {string} viewName
		 * @returns {SGAppsServer.NodeJsMvc.Controller.View}
		 */
		getView	: function (viewName) {
			return (
				(viewName in controllerObject._views) ? controllerObject._views[viewName] : null
			);
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method viewExists
		 * @param {string} viewName
		 * @returns {boolean}
		 */
		viewExists	: function (viewName) {
			return (viewName in controllerObject._views);
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method addView
		 * @param {SGAppsServer.NodeJsMvc.Controller.View} view
		 * @returns {SGAppsServer.NodeJsMvc.Controller.View}
		 */
		addView	: function (view) {
			if(!(view.name in controllerObject._views)) {
				controllerObject._views[view.name]	= view;
				return controllerObject._views[view.name];
			}
			return null;
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method render
		 * @param {SGAppsServerResponse} response
		 * @param {string} viewName
		 * @param {object} [options]
		 */
		render	: function (response, viewName, options) {
			if(viewName in controllerObject._views) {
				var err;
				try {
					controllerObject.viewer.render(
						response,
						controllerObject.getView(viewName),
						options
					);
				} catch (err) {
					console.error(err);
				}
			} else {
				response.sendError(Error('[SGAppsServer.Response] template not found'));
			}
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method removeView
		 * @param {string} viewName
		 * @returns {boolean}
		 */
		removeView	: function (viewName) {
			if (viewName in controllerObject._views) {
				delete	controllerObject._views[viewName];
				return true;
			}
			return false;
		},

		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method getAction
		 * @param {string} actionName
		 * @returns {SGAppsServer.NodeJsMvc.Controller.Action}
		 */
		getAction	: function( actionName ) {
			if (actionName in controllerObject._actions) {
				return controllerObject._actions[actionName];
			}
			return null;
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method actionExists
		 * @param {string} actionName
		 * @returns {boolean}
		 */
		actionExists	: function (actionName) {
			return (actionName in controllerObject._actions);
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method addAction
		 * @param {string} actionName
		 * @param {object} options
		 * @returns {boolean}
		 */
		addAction	: function( actionName, options ) {
			if (!(actionName in controllerObject._actions)) {
				//@ts-ignore
				controllerObject._actions[actionName]	= new NodeJsMvcAction(
					actionName,
					controllerObject,
					options,
					server
				);
				//@ts-ignore
				return controllerObject._actions[actionName];
			}
			return null;
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @method removeAction
		 * @param {string} actionName
		 * @returns {boolean}
		 */
		removeAction	: function( actionName ) {
			if( controllerObject.actionExists( actionName ) ) {
				delete	controllerObject._actions[actionName];
				return true;
			}
			return false;
		},
		/**
		 * @memberof SGAppsServer.NodeJsMvc.Controller#
		 * @name shared
		 * @type {Object<string,any>}
		 */
		shared: options.shared || {}
	};
	return controllerObject;
};

/**
 * @private
 * @function
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function (Error, Object<string,SGAppsServer.NodeJsMvc.Controller>):void} [callback] 
 */
function loadNodeJsMvcApp(request, response, server, callback) {
	/**
	 * @private
	 * @type {Object<string,SGAppsServer.NodeJsMvc.Controller>}
	 */
	const controllers = {};
	const _path = server._path;
	/**
	 * @private
	 * @type {FSLibrary}
	 */
	const _fs   = server._fs;
	const _appPath = server.NodeJsMvc.appPath;

	_fs.readdir(_appPath, "utf8", function (err, files) {
		if (err) {
			callback(err, controllers);
			return;
		}
		const _tick = () => {
			if (!files.length) {
				callback(null, controllers);
				return;
			}
			const controllerName = files.shift();
			let configFile = _path.resolve(
				_appPath,
				controllerName,
				'config.js'
			);

			_fs.exists(configFile, (status) => {
				if (!status) {
					_tick();
					return;
				}

				/**
				 * @private
				 * @type {SGAppsServer.NodeJsMvc.Controller}
				 */
				let controller;
				
				//@ts-ignore
				controller = new NodeJsMvcController(
					controllerName,
					require(configFile),
					server
				);

				//@ts-ignore
				controllers[controllerName] = controller;

				server.logger.info(`[NodeJsMvc.Controller] added ${controllerName}`);

				_fs.readdir(
					_path.join(
						_appPath,
						controllerName,
						'controller'
					),
					'utf8',
					(err, actions) => {
						if (err) {
							server.logger.error(err);
							_tick();
							return;
						}
						const _tickAction = () => {
							if (!actions.length) {
								_tick();
								return;
							}

							const actionFileName = actions.shift();

							if (!actionFileName.match(/\.js$/)) {
								_tickAction();
								return;
							}

							const actionName = actionFileName.replace(/\.js$/, '');

							/**
							 * @private
							 * @type {SGAppsServer.NodeJsMvc.Controller.Action}
							 */
							let action;

							_fs.stat(
								_path.join(
									_appPath,
									controllerName,
									'controller',
									actionFileName
								),
								(err, stats) => {
									if (err) {
										server.logger.error(err);
										_tickAction();
										return;
									}

									if (!stats.isFile()) {
										_tickAction();
										return;
									}

									//@ts-ignore
									action = controller.addAction(
										actionName,
										require(
											_path.join(
												_appPath,
												controllerName,
												'controller',
												actionFileName
											)
										)
									);

									server.logger.info(`    [NodeJsMvc.Action] added ${controllerName}:${actionName}`);

									_fs.stat(
										_path.join(
											_appPath,
											controllerName,
											'views'
										),
										(err, stats) => {
											if (err) {
												server.logger.error(err);
												_tickAction();
												return;
											}

											if (!stats.isDirectory()) {
												_tickAction();
												return;
											}

											_fs.readdir(
												_path.join(
													_appPath,
													controllerName,
													'views'
												),
												'utf8',
												(err, views) => {
													if (err) {
														server.logger.error(err);
														_tickAction();
														return;
													}

													const _tickView = () => {
														if (!views.length) {
															_tickAction();
															return;
														}

														const viewFileName = views.shift();

														if (!viewFileName.match(/\.(fbx\-tpl|tpl|html|htm|txt)$/)) {
															_tickView();
															return;
														}

														const viewName = viewFileName.replace(/\.[^\.]+$/, '');
														
														_fs.stat(
															_path.join(
																_appPath,
																controllerName,
																'views'
															),
															(err, stats) => {
																if (err) {
																	server.logger.error(err);
																	_tickView();
																	return;
																}

																if (!stats.isDirectory()) {
																	_tickView();
																	return;
																}

																_fs.readFile(
																	_path.join(
																		_appPath,
																		controllerName,
																		'views',
																		viewFileName
																	),
																	'utf8',
																	(err, code) => {
																		if (err) {
																			server.logger.error(err);
																			_tickView();
																			return;
																		}

																		controller.addView({
																			path: _path.join(
																				_appPath,
																				controllerName,
																				'views',
																				viewFileName
																			),
																			name: viewName,
																			code: (
																				server.logger._debug ? null : code
																			)
																		});

																		_tickView();
																	}
																);
															}
														)
													};

													_tickView();
												}
											);
										}
									);
								}
							);
						}

						_tickAction();
					}
				);
			})
		}

		_tick();
	});
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
		 * @memberof SGAppsServer
		 * @class
		 * @name NodeJsMvc
		 */;
		/**
		 * @memberof SGAppsServer.NodeJsMvc#
		 * @name appPath
		 * @type {string}
		 */
		let _appPath = null;
		/**
		 * @memberof SGAppsServer#
		 * @name NodeJsMvc
		 * @type {SGAppsServer.NodeJsMvc}
		 */
		//@ts-ignore
		server.NodeJsMvc = {
			controllers: {}
		};
	

		/**
		 * @memberof SGAppsServer.NodeJsMvc#
		 * @name controllers
		 * @type {Object<string,SGAppsServer.NodeJsMvc.Controller>}
		 */;

		let _ready, _reject;
		const _whenReady = new Promise((resolve, reject) => {
			_ready = resolve;
			_reject = reject;
		});

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
							server,
							function (err, controllers) {
								if (err) {
									server.logger.error(err);
									_reject(err);
									return;
								}
								server.NodeJsMvc.controllers = controllers;
								_ready(server.NodeJsMvc.controllers);
							}
						);
					}
				}
			}
		);

		/**
		 * @memberof SGAppsServer.NodeJsMvc#
		 * @name whenReady
		 * @type {Promise<Object<string,SGAppsServer.NodeJsMvc.Controller>>}
		 */;
		Object.defineProperty(
			server.NodeJsMvc,
			'whenReady',
			{
				get: () => _whenReady,
				set: (v) => {
					server.logger.warn('[SGAppsServer.NodeJsMvc.whenReady] is readonly');
				}
			}
		);

		server.NodeJsMvc.whenReady.then((controllers) => {
			Object.values(
				controllers
			).forEach((controller) => {
				Object.values(controller._actions).forEach((action) => {
					const handler = function (request, response, next) {
						request.params.shift();
						request.params.shift();
						request.params.shift();
						action.run(
							request,
							response
						);
					};

					handler.toString = () => `NodeJSMvcAction() => {
						/**
						 * @controller ${controller.name}
						 * @action ${action.name}
						 * @file ${server.NodeJsMvc.appPath}/${controller.name}/controllers/${action.name}.js
						 */

						// code is protected
					}`;

					const applyPath = (path) => {
						server.get(path, handler);
						if (action.postData) {
							server.post(path, server.handlePostData(), handler);
						} else {
							server.post(path, handler);
						}
					};

					if (controller.name === 'index' && action.name === 'index') {
						applyPath('/');
					}

					if (action.name === 'index') {
						applyPath(`^/${controller.name}(/|$)`);
					}

					applyPath(`^/${controller.name}/${action.name}(|/.*)`);
				});
			});
		}, server.logger.error);
	}

	callback();
};


module.exports = NodeJsMvcDecorator;