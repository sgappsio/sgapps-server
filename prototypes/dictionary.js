const parseParams = require('application-prototype/constructors/request/params-parser');

/**
 * 
 * @param {RequestPathStructure} route 
 * @param {string} url 
 * @param {boolean} strictRouting 
 * @param {object} _cache 
 */
function routeMatch(route, url, strictRouting, _cache) {
	if (
		route === '*'
		||
		route === '/*'
		||
		route === '^/*'
		||
		(
			!strictRouting
			&& (
				route === '/'
			)
		)
	) return true;

	if (typeof (route) === "string") {
		// if (
		// 	route[1] !== url[1]
		// ) return false;

		if (
			url === route
		) {
			return true;
		} else if (
			url.indexOf(route) === 0 && !strictRouting
		) {
			return true;
		} else if (
			strictRouting
			&& url.indexOf(route) === 0
			&& (
				(
					// /path/route/ --- /path/route/
					url.length === route.length
				) || (
					// /path/route? --- /path/route
					url[route.length - 1] === '?'
				)
			)
		) {
			return true;
		} else if (
			!strictRouting
			&&
			//@ts-ignore
			url.indexOf(route.subs(0, -1)) === 0
			&&
			(
				url.length === route.length - 1
				||
				(
					(
						url[route.length - 1] === '?'
						|| url[route.length - 1] === '/'
					) && route[route.length - 1] === '/'
				)
			)
		) {
			const params = parseParams(url, route, { cache: _cache || {} })
			if (
				params !== null
			) {
				return params || true;
			}
		} else {
			return false;
		}
	} else if (route && route instanceof RegExp) {
		const result = route.exec(url);
		if (result) {
			const { groups } = result;
			return groups || true;
		} else {
			return false;
		}
	}
	return false;
}


/**
 * @typedef {object} RequestPathStructureMap
 * @property {string} key
 * @property {RequestPathStructure} path
 * @property {Array<RequestHandler>} handlers
 */

/**
 * @class
 * @name SGAppsServerDictionary
 * @description a dictionary for storing 
 * @param {object} [options]
 * @param {string} [options.name=""]
 * @param {boolean} [options.reverse=false]
 */
function SGAppsServerDictionary(options) {
	/**
	 * @memberof SGAppsServerDictionary#
	 * @name _paths
	 * @type {Array<RequestPathStructureMap>}
	 */
	this._paths = [];
	/**
	 * @memberof SGAppsServerDictionary#
	 * @name _dictionary
	 * @type {Object<string,Array<RequestHandler>>}
	 */
	this._dictionary = {};
	this._cache = {};
	this._options = Object.assign(
		{
			reverse: false,
			name: ""
		},
		options || {}
	);

	/**
	 * @memberof SGAppsServerDictionary#
	 * @method generatePathKey
	 * @param {RequestPathStructure} path
	 * @returns {string}
	 */
	this.generatePathKey = function (path) {
		if (typeof(path) === "string") {
			return `s:${path}`;
		} else if (path instanceof RegExp) {
			return `r:${path.toString()}`
		} else {
			return `*:${path}`
		}
	}

	return this;
}

/**
 * @example
 * server.get('/', (req, res) => {
 *     res.send('root');
 * })
 * // will match "test" "best", everything with est
 * server.get(/.*est/, (req, res) => {
 *     res.send('root');
 * })
 * server.get('/:name/:surname', (req, res) => {
 *     const { name, surname } = req.params;
 *     res.send(`Hi ${name} ${surname}`);
 * })
 * // apply rules with regexp emulation, they are marked with "^" in the start
 * server.get('^/:name([a-z]+)/:age(\d+)', (req, res, next) => {
 *     const { name, age } = req.params;
 *     if (age < 18) {
 *         res.send(`Hi ${name}, you are not allowed`);
 *     } else {
 *         next()
 *     }
 * })
 * // apply rules with regexp emulation, they are marked with "^" in the start
 * server.get('^/([a-z]+)/', (req, res, next) => {
 *     const { name, age } = req.params;
 *     if (age < 18) {
 *         res.send(`Hi ${name}, you are not allowed`);
 *     } else {
 *         next()
 *     }
 * })
 * // add regular expression with group names
 * server.get('^/(?<test>[a-z]+)/', (req, res, next) => {
 *     const { test } = req.params;
 *     res.send(`param: ${test}`);
 * })
 * server.get('/', (req, res) => {
 *     res.send('root');
 * })
 * 
 * @memberof SGAppsServerDictionary#
 * @method push
 * @param {RequestPathStructure} path
 * @param {RequestHandler[]} handlers
 */
SGAppsServerDictionary.prototype.push = function (path, handlers) {
	if (path === '') path = '*';

	const pathKey = this.generatePathKey(path);

	if (typeof(path) === "string" && path[0] === "^") {
		// (?<name>...)
		const rule = path
			.replace(/([^\w\*\$\{\}\|\+\?\#\!\<\>\\\(\)\[\]\-\=\,\.\~\:\;\&\^])/g,'\\$1')
			.replace(/\/\*$/, '\/.*')
			.replace(/\:([a-zA-Z][a-zA-Z\d]*)\((.*?)\)/g, '(?<$1>$2)')
			.replace(/\:([a-zA-Z][a-zA-Z\d]*)/g, '(?<$1>[^\/\:]+)') + '$';

		//@ts-ignore
		const regRule = rule.toRegexp();

		if (regRule && (regRule instanceof RegExp)) {
			path = regRule;
		}
	}

	if (this._options.reverse) {
		this._paths.unshift({
			key: pathKey,
			path,
			// : handlers.map(v => v).reverse()
			handlers
		});
	} else {
		this._paths.push({
			key: pathKey,
			path,
			handlers
		});
	}
};

/**
 * @callback SGAppsServerDictionaryRunCallBack
 * @param {SGAppsServerRequest} request 
 * @param {SGAppsServerResponse} response 
 * @param {SGAppsServer} server 
 */

/**
 * @memberof SGAppsServerDictionary#
 * @method run
 * @param {SGAppsServerRequest} request
 * @param {SGAppsServerResponse} response
 * @param {SGAppsServer} server
 * @param {SGAppsServerDictionaryRunCallBack} callback
 */
SGAppsServerDictionary.prototype.run = function (request, response, server, callback) {
	let index = 0;
	const {
		strictRouting
	} = server._options;
	// const url = request.request.url;
	const url = request.urlInfo.pathname.replace(/^\/+/, '/');
	const _cache = this._cache;
	const _debug = server.logger._debug;

	let next  = () => {
		if (!this._paths[index]) {
			callback(request, response, server);
		} else {
			const matchResult = routeMatch(
				this._paths[index].path,
				url,
				strictRouting,
				_cache
			);

			// TODO apply cache
			// IF response is 200 && mathched by a string path
			// TODO add cache pathname|pathkey
			// TODO add cache pathname|handlers
			// console.info(
			// 	{
			// 		matchResult,
			// 		url,
			// 		path: this._paths[index].path,
			// 		strictRouting
			// 	}
			// );

			if (typeof(matchResult) === "object" && matchResult) {
				request.params = Object.assign(
					request.urlInfo.pathname.split('/'),
					matchResult
				);
			}

			if (
				!!matchResult
			) {
				let itemIndex = 0;
				let itemNext = () => {
					if (itemIndex >= this._paths[index].handlers.length) {
						index++;
						next();
					} else {
						let err, timer = null;
						const _startTime = _debug ? ( new Date().valueOf() ) : null;
						let _endTime = null;
						if (_debug) {
							timer = setTimeout(() => {
								if (response._flags.finished || _endTime !== null) return;
								server.logger.warn(
									`[SGAppsServer.Handler] Max Execution time exceeded ( ${
										server._options._DEBUG_MAX_HANDLER_EXECUTION_TIME
									} ms ) ; time spend ${ _endTime - _startTime } ms`
								);
								server.logger.warn(this._paths[index].path);
								server.logger.warn(this._paths[index].handlers[itemIndex].toString());
							}, server._options._DEBUG_MAX_HANDLER_EXECUTION_TIME);
						}
						try {
							this._paths[index].handlers[itemIndex]
								.apply(
									server,
									[
										request,
										response,
										function () {
											if (_debug && timer !== null) {
												_endTime = new Date().valueOf();
												clearTimeout(timer);
												timer = null;
											}
											itemIndex++;
											itemNext();
										}
									]
								);
						} catch (err) {
							server.logger.error(err);
							if (_debug) {
								_endTime = new Date().valueOf();
							}
							itemNext();
						}
					}
				};
				itemNext();
			} else {
				index++;
				next();
			}
		}
	}
	next();
};

module.exports = SGAppsServerDictionary;