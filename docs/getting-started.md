# Getting Started

## Installation

```bash
npm install sgapps-server
```

```js
const { SGAppsServer } = require('sgapps-server');
```

---

## Your First Server

Copy this to a file and run it with `node`:

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// Step 1: Define a route
app.get('/', function (req, res) {
    res.send('Hello World!');
});

// Step 2: Start the server
app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
});
```

**What each step does:**
1. `new SGAppsServer()` creates a server with all built-in decorators loaded (cookies, sessions, POST parsing, static files, etc.)
2. `app.get('/', handler)` registers a handler for GET requests to `/`
3. `app.server().listen(8080)` starts the underlying Node.js HTTP server

---

## Waiting for Decorators

Decorators (built-in middleware) load asynchronously. For basic routing, you can start listening immediately. But if you need to configure sessions, cookies, or templates, wait for `whenReady`:

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.whenReady.then(() => {
    // Now SessionManager, CookiesManager, TemplateManager are available
    app.SessionManager._options.cookie = 'my-session-id';
    app.SessionManager._options.SESSION_LIFE = 300; // 5 minutes

    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

---

## Route Parameters

Extract values from the URL path using `:param` syntax:

```js
app.get('/users/:id', function (req, res) {
    res.send({ userId: req.params.id });
});

// GET /users/42 -> { "userId": "42" }
```

Multiple parameters work too:

```js
app.get('/users/:name/:age', function (req, res) {
    res.send(`Hello ${req.params.name}, age ${req.params.age}`);
});
```

---

## Handling POST Data

Use `app.handlePostData()` as middleware to parse request bodies:

```js
app.post('/api/data', app.handlePostData(), function (req, res) {
    // req.body contains parsed form/JSON data
    res.send({ received: req.body });
});
```

Supports three content types automatically:
- `application/json` -- parsed into `req.body`
- `application/x-www-form-urlencoded` -- parsed into `req.body`
- `multipart/form-data` -- fields in `req.body`, files in `req.files`

---

## Serving Static Files

```js
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next(); // file not found, try next handler
    }, {
        autoIndex: ['index.html', 'index.htm']
    });
});
```

Static file serving includes automatic ETag caching, gzip/deflate compression, and range request support.

---

## Middleware

Use `app.use()` to register middleware that runs before route handlers:

```js
// Log every request
app.use(function (req, res, next) {
    app.logger.log(req.request.method, req.urlInfo.pathname);
    next();
});

// Add CORS headers
app.use(function (req, res, next) {
    res.response.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
```

---

## Constructor Options

```js
const app = new SGAppsServer({
    strictRouting: true,           // /path/ !== /path (default: true)
    debug: true,                   // enable debug logging (default: true)
    _DEBUG_MAX_HANDLER_EXECUTION_TIME: 500,  // warn on slow handlers (ms)
    _REQUEST_FORM_PARAMS_DEEP_PARSE: true    // parse field[sub][key] names
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `server` | Server | `null` | Use an existing HTTP server instance |
| `strictRouting` | boolean | `true` | `/path/` only matches `/path/`, not `/path` |
| `debug` | boolean | `true` | Enable debug logging |
| `decorators` | array | `[]` | Additional decorator functions to load |
| `_DEBUG_MAX_HANDLER_EXECUTION_TIME` | number | `500` | Warn if handler exceeds this time (ms) |
| `_DEBUG_REQUEST_HANDLERS_STATS` | boolean | `false` | Log handler execution statistics |
| `_REQUEST_FORM_PARAMS_DEEP_PARSE` | boolean | `true` | Parse `field[sub][key]` into nested objects |

---

## Next Steps

- [Architecture Overview](architecture.md) -- understand how the framework is designed
- [SGAppsServer Reference](core/sgapps-server.md) -- full API for the server class
- [Routing](routing/index.md) -- advanced route patterns and parameters
- [Request & Response](networking/request.md) -- working with request/response objects
- [Session Management](guides/session-management.md) -- configure sessions with cluster support
