const _faceboxTemplate = require('./facebox-templates.js')

/**
 * @typedef {object} TemplateManagerRenderOptions
 */

/**
 * @class
 * @name TemplateManagerViewer
 * @param {object} options 
 * @param {FSLibrary} options._fs
 */
function TemplateManagerViewer(options) {

	/**
	 * @memberof TemplateManagerViewer#
	 * @name _facebox
	 * @type {FaceboxTemplate}
	 */;
	this._facebox = new _faceboxTemplate({
		_fs: options._fs
	});

	/**
	 * @memberof TemplateManagerViewer#
	 * @name _debug
	 * @type {boolean}
	 */
	let _debug = false;
	Object.defineProperty(
		this,
		'_debug',
		{
			get: () => _debug,
			set: (v) => {
				_debug = !!v;
				//@ts-ignore
				this._facebox._debug = _debug;
			}
		}
	);
	
	/**
	 * @memberof TemplateManagerViewer#
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
				this._facebox._env = _env;
			}
		}
	);

	/**
	 * @memberof TemplateManagerViewer#
	 * @method renderCode
	 * @param {string} code 
	 * @param {Object<string, any>} vars 
	 * @param {string} virtualFilePath 
	 * @param {function} callback 
	 */
	this.renderCode	= function (code, vars, virtualFilePath, callback) {
		return this.facebox.renderCode(code, vars, virtualFilePath, callback);
	}.bind(this);

	return this;
};

/**
 * @memberof TemplateManagerViewer#
 * @method render
 * @param {SGAppsServerResponse} response 
 * @param {TemplateManagerTemplate} view
 * @param {Object<string,any>} vars
 * @this TemplateManagerViewer
 */
TemplateManagerViewer.prototype.render	= function( response, view, vars ) {
	var getStackTrace = function() {
		var obj = {};
		Error.captureStackTrace(obj, getStackTrace);
		return obj.stack;
	};
	var err;
	if( view.path.match(/\.(tpl|fbx-tpl)$/) ) {
		if (view.code) {
			this._facebox.renderCode(
				view.code,
				vars,
				function( err, html ) {
					if (err) {
						if(Array.isArray(err)) {
							err.forEach(function(v) {
								throw v;
							});
						} else {
							throw err;
						}
					}
					response.send(html);
				},
				view.path
			);
		} else {
			try {
				this._facebox.renderFile( view.path, vars, function( err, html ) {
					if (err) {
						if(Array.isArray(err)) {
							err.forEach(function(v) {
								throw v;
							});
						} else {
							throw err;
						}
					}
					response.send(html);
				});
			} catch (err) {
				response.sendError(err);
			}
		}
	} else {
		response.pipeFile(
			view.path,
			function (err) {
				if (!response._flags.finished) {
					if (err) {
						response.sendError(err);
					} else {
						response.send('');
					}
				}
			}
		);
	}
};

module.exports	= TemplateManagerViewer;
