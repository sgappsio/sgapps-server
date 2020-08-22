/*
	On template Rendering we have
	following variables

	var vars	= {}; // variables that a sent from controllers
	var env		= {
		error	: [],
		vars	: envVars,
		path	: "", // filePath
		dirname	: "", // dirname
		render	: function( text, vars, env ) {}, // render function
		renderFile	: function( file, vars, callback ) {}, // render file function
			// callback( error {{ [] or false }}, htm)
	};
	env.vars = {
		// env varssent from app
		response : [object] // http reponse object
	}
*/
/**
 * @class
 * @name FaceboxTemplate
 * @param {object} options
 * @param {FSLibrary} options._fs
 */
function FaceboxTemplate(options) {

	/**
	 * @memberof FaceboxTemplate#
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
			}
		}
	);
	
	/**
	 * @memberof FaceboxTemplate#
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
			}
		}
	);

	/**
	 * @memberof FaceboxTemplate#
	 * @var {Object<string,string>} _cachedFiles
	 */
	this._cachedFiles = {};

	function readFileSync(addr) {
		if (addr in this._cachedFiles) {
			return this._cachedFiles[addr];
		} else {
			const content	= options._fs.readFileSync( addr, { encoding: "utf-8" } );
			if (!this._debug) {
				this._cachedFiles[addr]	= content;
			}
			return content;
		}
	};

	/**
	 * @memberof FaceboxTemplate#
	 * @var {number} INCLUDE_LEVEL
	 */
	this.INCLUDE_LEVEL = 10;

	/**
	 * @memberof FaceboxTemplate#
	 * @method render
	 * @param {string} text
	 * @param {Object<string,any>} vars
	 * @param {Object<string,any>} env
	 * @this FaceboxTemplate
	 */
	this.render	= function FaceboxTemplateRender( text, vars, env ) {
		if (vars === undefined) vars = {};

		const template	= { text: text };
		const replacers	= [];
		let err			= false;
		/**
		 * @private
		 * @param {string} addr 
		 * @returns {string}
		 */
		const parseAddr = function parseAddr(addr) {
			let err;
			if(addr.subs(1) == ":") {
				return `${env.dirname.replace(/\/+$/,'')}/${addr.subs(1,0)}`;
			} else {
				try {
					return (new Function(
						`const env	= arguments[1];const vars = arguments[0];\n return ${addr}`
					))(vars, env);
				} catch(err) {
					throw Error(
						`Unable to eval path: ${addr} ; ${err.meesage} ;`
					);
				}
			}
		}.bind(this);

		text = text.replace(
			/\{\{(read|read\-base64|read\-hex)\:(.*?)\}\}/g,
			function (match, p1, p2, offset, string) {
				const x	= '[[replacer-'+Math.floor(Math.random()*10000000)+'-'+Math.floor(Math.random()*10000000)+'-'+new Date().valueOf()+']]';
				replacers.push({ id : x, type : 'action-'+p1, param : p2 });
				return x;
			}
		);
		text = text.replace(
			/\{\{(include)\:(.*?)\}\}/g,
			function (match, p1, p2, offset, string) {
				return readFileSync( parseAddr(p2) );
			}
		);
		text = text.replace(
			/\{\{(render)\:(.*?)\}\}/g,
			function (match, p1, p2, offset, string) {
				const addr	= parseAddr(p2);
				return this.render(
					readFileSync(addr),
					vars,
					{
						vars	: this._env,
						path	: addr,
						dirname	: ((addr).replace(/[^\/]+$/,'')+'/').replace(/^\/+$/,'/'),
						render	: this.render,
						renderFile	: this.renderFile
					}
				);
			}.bind(this)
		);

		text = text.replace(
			/\<script[^\>]+?type\s*?=\s*?\"text\/facebox\-template\"[^\>]*?\>([\s\S]*?)\<\/script\>/g,
			function (match, p1, p2, offset, string) {
				const x	= '[[replacer-'+Math.floor(Math.random()*10000000)+'-'+Math.floor(Math.random()*10000000)+'-'+new Date().valueOf()+']]';
				replacers.push({ id : x, type : 'js-return', code : p1 });
				return x;
			}
		);

		text = text.replace(
			/\{(code|js\-return|eval|js\-script|css\-style)\}([\s\S]*?)\{\/\1\}/g,
			function (match, p1, p2, offset, string) {
				const x	= '[[replacer-'+Math.floor(Math.random()*10000000)+'-'+Math.floor(Math.random()*10000000)+'-'+new Date().valueOf()+']]';
				replacers.push({ id : x, type : p1, code : p2 });
				return x;
			}
		);
		
		text = text.replace(
			/\{\{([\s\S]*?)\}\}/g,
			function (match, p1, offset, string) {
				const x	= '[[replacer-'+Math.floor(Math.random()*10000000)+'-'+Math.floor(Math.random()*10000000)+'-'+new Date().valueOf()+']]';
				replacers.push({ id : x, type : 'js-return', code : 'return '+p1 });
				return x;
			}
		);

		let i;
		for (i=0; i<replacers.length; i++) {
			switch(replacers[i].type) {
				case 'code':
					text = text.split(replacers[i].id).join(replacers[i].code);
				break;
				case 'js-return':
					text	= text.split(replacers[i].id).join((new Function("var vars = arguments[0];var env = arguments[1];\nvar result = (function faceBoxTemplate_jsReturn() {\n"+replacers[i].code + "\n})(); if (result === undefined) return ''; return result;" ))( vars, env ));
				break;
				case 'eval':
					(new Function("var vars = arguments[0];var env = arguments[1];\n"+replacers[i].code ))( vars, env );
					text = text.split(replacers[i].id).join('');
				break;
				case 'js-script':
					text = text.split(replacers[i].id).join('<script type="text/javascript" charset="utf-8">\n'+replacers[i].code+'\n</script>');
				break;
				case 'css-style':
					text = text.split(replacers[i].id).join('<style type="text/css">\n'+replacers[i].code+'\n</style>');
				break;
				case 'action-read':
					text = text.split(replacers[i].id).join(readFileSync(parseAddr(replacers[i].param)));
				break;
				case 'action-read-base64':
					text = text.split(replacers[i].id).join(readFileSync(parseAddr(replacers[i].param)).base64encode());
				break;
				case 'action-read-hex':
					text = text.split(replacers[i].id).join(readFileSync(parseAddr(replacers[i].param)).toHex());
				break;
			}
		}
		return text;
	}.bind(this);



	/**
	 * @memberof FaceboxTemplate#
	 * @method renderFile
	 * @param {string} filePath
	 * @param {Object<string,any>} vars
	 * @param {function} callback
	 * @this FaceboxTemplate
	 */
	this.renderFile	= function( filePath, vars, callback ) {
		const env		= {
			vars	: this._env,
			path	: filePath,
			dirname	: (filePath.replace(/[^\/]+$/,'')+'/').replace(/^\/+$/,'/'),
			render	: this.render,
			renderFile	: this.renderFile
		};
		callback(
			null,
			this.render( readFileSync( filePath ), vars, env )
		);
	}.bind(this);

	/**
	 * @memberof FaceboxTemplate#
	 * @method renderCode
	 * @param {string} code
	 * @param {Object<string,any>} vars
	 * @param {function} callback
	 * @param {string} virtualFilePath
	 * @this FaceboxTemplate
	 */
	this.renderCode	= function( code, vars, callback, virtualFilePath ) {
		const env		= {
			vars	: this._env,
			path	: virtualFilePath || '',
			dirname	: ((virtualFilePath || '').replace(/[^\/]+$/,'')+'/').replace(/^\/+$/,'/'),
			render	: this.render,
			renderFile	: this.renderFile
		};
		callback(
			null,
			this.render(code, vars, env)
		);
	}.bind(this);

	return this;
};
module.exports	= FaceboxTemplate;
