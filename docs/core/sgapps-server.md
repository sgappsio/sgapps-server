# SGAppsServer

The main server class that handles HTTP routing, middleware, decorator loading, and request dispatch.

## Overview

`SGAppsServer` creates a Node.js HTTP server and wraps it with an Express-like routing API. It loads built-in decorators to provide cookie handling, session management, POST data parsing, static file serving, and template rendering. Custom decorators can extend the server's capabilities further.

## Advantages

- **Express-like routing** -- `get()`, `post()`, `use()`, `all()` with `(req, res, next)` handlers
- **Automatic decorator loading** -- built-in middleware initializes asynchronously via `whenReady`
- **Path parameters** -- extract values from URLs with `:param` syntax
- **Regex routing** -- match routes with regular expressions and named groups
- **Multiple handlers per route** -- chain middleware and handlers on a single path
- **Final handlers** -- reverse-order catch-all handlers for fallback logic
- **Shared state** -- `shared` object accessible from all request handlers
- **Debug mode** -- warns on slow handlers and logs execution statistics

## Getting Started

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
});
```

## Constructor

```js
const app = new SGAppsServer([options]);
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `options.server` | Server | `null` | Existing Node.js HTTP server to use |
| `options.strictRouting` | boolean | `true` | When true, `/path/` does not match `/path` |
| `options.debug` | boolean | `true` | Enable debug logging |
| `options.decorators` | array | `[]` | Additional decorator functions |
| `options._DEBUG_MAX_HANDLER_EXECUTION_TIME` | number | `500` | Warn if handler exceeds this (ms) |
| `options._DEBUG_REQUEST_HANDLERS_STATS` | boolean | `false` | Log handler execution statistics |
| `options._REQUEST_FORM_PARAMS_DEEP_PARSE` | boolean | `true` | Parse `field[sub]` into nested objects |

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `logger` | [LoggerBuilder](../core/logger.md) | Pretty CLI logger instance |
| `shared` | object | Shared data object accessible from all handlers |
| `STATUS_CODES` | object | HTTP status code to message mapping |
| `EXTENSIONS` | object | MIME type detection utilities |
| `mountPath` | string | Application mount path prefix |
| `MAX_POST_SIZE` | number | Maximum POST body size in bytes (default: 16384) |
| `whenReady` | Promise | Resolves when all decorators have loaded |
| `Email` | function | Email constructor (see [Email](../utilities/email.md)) |

### Properties Added by Decorators

| Property | Type | Added By | Description |
|----------|------|----------|-------------|
| `TemplateManager` | [TemplateManager](../middleware/templates.md) | response-template | Template registration and rendering |
| `CookiesManager` | object | request-cookie | Cookie configuration |
| `SessionManager` | [SGAppsSessionManager](../middleware/sessions.md) | request-session | Session configuration |
| `AccessLogger` | [AccessLogger](../decorators/access-logger.md) | access-logger | Access log generation (optional) |
| `AccessLoggerPaths` | object | access-logger | Log output paths (optional) |

### Route Methods

All route methods return the server instance (chainable).

| Method | Description |
|--------|-------------|
| `get(path, ...handlers)` | Register GET route handler |
| `post(path, ...handlers)` | Register POST route handler |
| `put(path, ...handlers)` | Register PUT route handler |
| `delete(path, ...handlers)` | Register DELETE route handler |
| `head(path, ...handlers)` | Register HEAD route handler |
| `options(path, ...handlers)` | Register OPTIONS route handler |
| `patch(path, ...handlers)` | Register PATCH route handler |
| `trace(path, ...handlers)` | Register TRACE route handler |
| `connect(path, ...handlers)` | Register CONNECT route handler |
| `use([path], ...handlers)` | Register middleware (runs before method handlers) |
| `all(path, ...handlers)` | Register handler for all HTTP methods |
| `finalHandler(path, ...handlers)` | Register final handler (last added runs first) |

**Handler signature:**

```js
function handler(request, response, next) {
    // request: SGAppsServerRequest
    // response: SGAppsServerResponse
    // next: function -- call to pass to next handler
}
```

### `server()`

Returns the underlying Node.js `http.Server` instance.

```js
app.server().listen(8080);
```

### `handle(request, response, [callback])`

Main request handler. Wraps raw `IncomingMessage` and `ServerResponse` into `SGAppsServerRequest` and `SGAppsServerResponse`, applies decorators, then dispatches through route handlers.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | IncomingMessage | Raw Node.js request |
| `response` | ServerResponse | Raw Node.js response |
| `callback` | function | Optional final callback |

### `handleRequest(request, response, [callback])`

Routes a wrapped request through the dictionary chain: `use` -> HTTP method -> `_finalHandler`.

### `handleErrorRequest(request, response, [err])`

Sends a 500 error response. Called automatically when a handler throws an exception.

### `handleStaticRequest(request, response, path, [callback], [options])`

Serves static files from a directory.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | SGAppsServerRequest | Wrapped request |
| `response` | SGAppsServerResponse | Wrapped response |
| `path` | string | Directory path to serve files from |
| `callback` | function | `(err, request, response, server)` callback |
| `options.timeout` | number | Stream timeout in ms (default: 0) |
| `options.autoIndex` | string[] | Index files to try (e.g., `['index.html']`) |

### `handlePostData([options])`

Returns a middleware function that parses POST request bodies.

| Parameter | Type | Description |
|-----------|------|-------------|
| `options.MAX_POST_SIZE` | number | Override max POST size for this handler |
| `options.error.statusCode` | number | Status code on error (default: 500) |
| `options.error.message` | string | Error message override |

```js
app.post('/api/submit', app.handlePostData(), function (req, res) {
    res.send({ body: req.body, files: req.fileItems });
});
```

---

## Code Examples

### Example 1: Basic Routing

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('<h1>Home</h1>');
});

app.get('/about', function (req, res) {
    res.send('<h1>About</h1>');
});

app.post('/api/data', app.handlePostData(), function (req, res) {
    res.send({ received: req.body });
});

app.server().listen(3000);
```

### Example 2: Middleware Chain

```js
// Global middleware -- runs for every request
app.use(function (req, res, next) {
    res.response.setHeader('X-Powered-By', 'SGApps Server');
    next();
});

// Route-specific middleware chain
app.get('/admin/:page',
    function authCheck(req, res, next) {
        if (!req.session._confirmed) {
            return res.sendError(Error('Unauthorized'), { statusCode: 401 });
        }
        next();
    },
    function renderAdmin(req, res) {
        res.send(`Admin page: ${req.params.page}`);
    }
);
```

### Example 3: Static Files with Fallback

```js
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, {
        autoIndex: ['index.html', 'index.htm']
    });
});

// Fallback for unmatched routes
app.finalHandler('/*', function (req, res) {
    res.sendError(Error('Page not found'), { statusCode: 404 });
});
```

### Example 4: Using an Existing HTTP Server

```js
const http = require('http');
const server = http.createServer();

const app = new SGAppsServer({ server: server });

app.get('/', function (req, res) {
    res.send('Using existing server');
});

server.listen(8080);
```

### Example 5: Configuring Session and Cookies

```js
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.CookiesManager.COOKIES_KEY = 'my-secret-key';
    app.SessionManager._options.SESSION_LIFE = 3600; // 1 hour
    app.SessionManager._options.cookie = 'my-ssid';

    app.get('/profile', function (req, res) {
        if (req.session._confirmed) {
            res.send({ user: req.session.data });
        } else {
            res.redirect('/login');
        }
    });

    app.server().listen(8080);
});
```

---

## Related Modules

- [LoggerBuilder](../core/logger.md) -- logging utility
- [Routing](../routing/index.md) -- route matching patterns
- [Request](../networking/request.md) -- request wrapper
- [Response](../networking/response.md) -- response wrapper
- [Middleware Overview](../middleware/index.md) -- built-in decorators
