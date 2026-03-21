# SGAppsServerDictionary

The internal route matching engine that stores handlers, matches URLs, and executes handler chains.

## Overview

`SGAppsServerDictionary` is the core data structure behind SGApps Server's routing. Each HTTP method (`get`, `post`, etc.), plus `use` (middleware) and `_finalHandler`, has its own dictionary instance. When a request comes in, the dictionary matches the URL against registered paths and runs matching handlers in sequence.

## Advantages

- **Multiple match types** -- string paths, regex, advanced patterns with validation
- **Handler chains** -- multiple handlers per route, called via `next()`
- **Reverse mode** -- `_finalHandler` dictionary runs handlers in reverse order
- **Path caching** -- route match results can be cached for performance
- **Debug timing** -- tracks handler execution time and warns on slow handlers

## Constructor

```js
const dict = new SGAppsServerDictionary([options]);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.name` | string | `""` | Dictionary name (used in debug output) |
| `options.reverse` | boolean | `false` | Insert new handlers at the beginning |

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `_paths` | array | Registered routes with their handlers |
| `_dictionary` | object | Routes organized by path key |
| `_cache` | object | Route match cache |
| `_options` | object | Configuration options |

### `generatePathKey(path)`

Create a unique string key for a route path.

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string or RegExp | Route path |

Returns `string` -- prefixed key (`s:` for strings, `r:` for regex, `*:` for others).

### `push(path, handlers)`

Register a route with one or more handlers.

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string or RegExp | Route path pattern |
| `handlers` | function[] | Array of handler functions |

```js
dict.push('/users/:id', [
    function (req, res, next) { next(); },
    function (req, res) { res.send('OK'); }
]);
```

**Path types accepted:**

| Type | Example | Description |
|------|---------|-------------|
| Wildcard | `*`, `/*` | Matches all routes |
| Exact string | `/api/users` | Exact match |
| Parameterized | `/users/:id` | Extracts named parameters |
| Advanced | `^/:name([a-z]+)` | String-to-regex with validation |
| Native RegExp | `/\/api\/v\d+/` | Full regex matching |

### `run(request, response, server, callback)`

Match the current request URL against all registered routes and execute matching handlers.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | SGAppsServerRequest | Wrapped request |
| `response` | SGAppsServerResponse | Wrapped response |
| `server` | SGAppsServer | Server instance |
| `callback` | function | Called when all matching handlers have completed |

**Execution flow:**
1. Iterates through `_paths` in order (or reverse for `_finalHandler`)
2. Tests each path against the request URL
3. For matching routes, executes handlers in sequence
4. Each handler calls `next()` to continue
5. When all matches exhausted, calls `callback`

---

## Route Match Behavior

### String Routes with `^` Prefix

When a string route starts with `^`, it is converted to a RegExp:

```js
// Input:
'^/:name([a-z]+)/:age(\\d+)'

// Converted to regex:
/^\/(?<name>[a-z]+)\/(?<age>\d+)$/
```

Named parameters (`:param(pattern)`) become named capture groups. Unnamed parameters (`:param`) match `[^/:]+`.

### Parameter Extraction

When a route matches with parameters, `request.params` is populated:

```js
// Route: /users/:name/:age
// URL: /users/alice/30
// Result: req.params = { name: "alice", age: "30", "0": "", "1": "users", "2": "alice", "3": "30" }
```

The params object is an array-like object that also contains the named parameters.

### Error Handling

If a handler throws an exception, the dictionary catches it and calls `server.handleErrorRequest()`:

```js
app.get('/danger', function (req, res) {
    throw new Error('Oops'); // caught, sends 500 error response
});
```

---

## Related Modules

- [Routing Overview](../routing/index.md) -- route patterns and examples
- [SGAppsServer](../core/sgapps-server.md) -- uses dictionaries internally
