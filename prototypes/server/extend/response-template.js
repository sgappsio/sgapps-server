const TemplateManagerViewer = require('./template-manager/viewer');

/**
 * @class
 * @name TemplateManager
 * @param {object} options
 * @param {FSLibrary} options._fs
 */
const TemplateManager = function (options) {
	/**
	 * @typedef {object} TemplateManagerTemplate
	 * @property {string} name
	 * @property {string} path
	 */
	this._templates	= {};

	/**
	 * @memberof TemplateManager#
	 * @var {object} _options
	 * @property {FSLibrary} _fs
	 */
	this._options = Object.assign(
		{}, options
	);

	/**
	 * @memberof TemplateManager#
	 * @name _viewer
	 * @type {TemplateManagerViewer}
	 */;
	this._viewer = new TemplateManagerViewer({
		_fs: options._fs
	});

	/**
	 * @memberof TemplateManager#
	 * @name _env
	 * @type {Object<string,any>}
	 */;
	let _env = {};
	Object.defineProperty(
		this,
		'_env',
		{
			get: () => _env,
			set: (data) => {
				Object.assign(_env, data);
				//@ts-ignore
				this._viewer._env = { global: _env };
			}
		}
	);

	return this;
};

/**
 * @memberof TemplateManager#
 * @method templateExists
 * @param {string} templateName 
 * @returns {boolean}
 */
TemplateManager.prototype.templateExists = function (templateName) {
	return (templateName in this._templates);
};


/**
 * @memberof TemplateManager#
 * @method remove
 * @param {string} templateName 
 */
TemplateManager.prototype.remove = function (templateName) {
	if (templateName in this._templates) {
		delete this._templates[templateName];
	}
};

/**
 * @memberof TemplateManager#
 * @method add
 * @param {string} templateName 
 * @param {string} filePath
 */
TemplateManager.prototype.add = function (templateName, filePath) {
	this._templates[templateName] = {
		name: templateName,
		path: filePath
	};
};

/**
 * @memberof TemplateManager#
 * @method addList
 * @param {Object<string, string>} templates
 */
TemplateManager.prototype.addList = function (templates) {
	let templateName;
	for (templateName in templates) {
		this._templates[templateName] = {
			name: templateName,
			path: templates[templateName]
		};
	}
};

/**
 * @memberof TemplateManager#
 * @method get
 * @param {string} templateName
 * @return {TemplateManagerTemplate}
 */
TemplateManager.prototype.get = function (templateName) {
	if (templateName in this._templates) {
		return this._templates[templateName];
	}
	return null;
};

/**
 * @memberof TemplateManager#
 * @method render
 * @param {SGAppsServerResponse} response
 * @param {string} templateName
 * @param {Object<string,any>} [vars]
 */
TemplateManager.prototype.render = function (
	response, templateName, vars
) {
	if( templateName in this._templates ) {
		this._viewer.render(
			response,
			this._templates[templateName],
			vars || {}
		);
	} else {
		response.sendError(
			Error('Page Template not found'),
			{
				statusCode: 404
			}
		);
	}
};

/**
 * @private
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 * @param {function} callback 
 */
function ResponseTemplateDecorator(request, response, server, callback) {

	if (
		request === null
		&& response === null
	) {
		/**
		 * @memberof SGAppsServer#
		 * @name TemplateManager
		 * @type {TemplateManager} 
		 */
		//@ts-ignore
		server.TemplateManager = new TemplateManager({
			_fs: server._fs
		});
	}
	
}

module.exports = ResponseTemplateDecorator;