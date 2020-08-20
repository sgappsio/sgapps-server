const parseParams = require('application-prototype/constructors/request/params-parser');

function routeMatch(route, url, strictRouting, _cache) {
	if (
		route[0] !== url[0]
	) return false;

	if (
		route === ''
		||
		(
			!strictRouting
			&& (
				url === '' || url === '/'
			)
		)
	) return true;

	if (typeof (route) === "string") {
		if (
			url === route
		) {
			return true;
		} else if (
			strictRouting
			&& (
				url.length === route.length - 1
				||
				(
					(
						url[route.length - 1] === '?'
						|| (
							url[route.length - 1] === '/'
							&& (
								url.length === route.length
								||
								url[route.length] === '?'
							)
						)
					) && route[route.length - 1] === '/'
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
 * @param {boolean} [options.reverse=false]
 */
function SGAppsServerDictionary(options) {
	this._paths = [];
	this._dictionary = {};
	this._cache = {};
	this._options = Object.assign(
		{
			reverse: false
		},
		options || {}
	);

	return this;
}

/**
 * @memberof SGAppsServerDictionary#
 * @method push
 * @param {RequestPathStructure} path
 * @param {RequestHandler} handler
 */
SGAppsServerDictionary.prototype.push = function (path, handler) {
	if (!(path in this._dictionary)) {
		this._dictionary[path] = [];
	}
	if (this._options.reverse) {
		this._paths.unshift(path);
		this._dictionary[path].unshift(handler);
	} else {
		this._paths.push(path);
		this._dictionary[path].push(handler);
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
			index++;
			this._paths[index].apply(
				server,
				[
					request,
					response,
					next
				]
			);
		} else {
			index++;
			next();
		}
	}
};

module.exports = SGAppsServerDictionary;