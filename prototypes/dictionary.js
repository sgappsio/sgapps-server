const parseParams = require('application-prototype/constructors/request/params-parser');

function routeMatch(route, url, strictRouting, _cache) {
	if (
		route === '*'
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
			return true;
		} else if (
			parseParams(url, route, { cache: _cache || {} }) !== null
		) {
			return true;
		} else {
			return false;
		}
	} else if (route && route instanceof RegExp) {
		return route.test(url);
	} else {
		return false;
	}
}

/**
 * @class
 * @name SGAppsServerDictionary
 * @description a dictionary for storing 
 * @param {object} [options]
 * @param {string} [options.name=""]
 * @param {boolean} [options.reverse=false]
 */
function SGAppsServerDictionary(options) {
	this._paths = [];
	/**
	 * @memberof SGAppsServerDictionary#
	 * @name _dictionary
	 * @type {Object<RequestPathStructure,Array<RequestHandler>>}
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

	return this;
}

/**
 * @memberof SGAppsServerDictionary#
 * @method push
 * @param {RequestPathStructure} path
 * @param {RequestHandler[]} handlers
 */
SGAppsServerDictionary.prototype.push = function (path, handlers) {
	if (path === '') path = '*';

	if (!(path in this._dictionary)) {
		this._dictionary[path] = [];
	}
	if (this._options.reverse) {
		this._paths.unshift(path);
		handlers.map(v => v).reverse().forEach(handler => {
			this._dictionary[path].unshift(handler);
		});
	} else {
		this._paths.push(path);
		handlers.forEach(handler => {
			this._dictionary[path].push(handler);
		})
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
	const url = request.request.url;
	const _cache = this._cache;
	let next  = () => {
		if (!this._paths[index]) {
			callback(request, response, server);
		} else if (
			routeMatch(
				this._paths[index],
				url,
				strictRouting,
				_cache
			)
		) {
			let itemIndex = 0;
			let itemNext = () => {
				if (itemIndex >= this._dictionary[this._paths[index]].length) {
					index++;
					next();
				} else {
					if (this._paths[index]) {
						server.logger.log(
							this._paths[index].toString(),
							this._options.name,
							request.request.url,
							this._dictionary[this._paths[index]][itemIndex].name
						);
					}
					let err;
					try {
						this._dictionary[this._paths[index]][itemIndex]
							.apply(
								server,
								[
									request,
									response,
									function () {
										itemIndex++;
										itemNext();
									}
								]
							);
					} catch (err) {
						server.logger.error(err);
						next();
					}
				}
			};
			itemNext();
		} else {
			index++;
			next();
		}
	}
	next();
};

module.exports = SGAppsServerDictionary;