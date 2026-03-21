# Routing

An overview of SGApps Server's route matching system, including path parameters, regex patterns, named groups, and strict routing.

## Overview

SGApps Server uses a dictionary-based routing system where handlers are stored per HTTP method. When a request arrives, the server matches the URL pathname against registered routes and executes matching handlers in registration order. Each handler calls `next()` to pass control to the next match.

## Advantages

- **Path parameters** -- `:param` syntax extracts values from URL segments
- **Regex routes** -- native `RegExp` objects for complex matching
- **Advanced patterns** -- string routes starting with `^` enable regex validation on parameters
- **Named groups** -- `(?<name>...)` capture groups map directly to `req.params`
- **Strict routing** -- configurable trailing slash behavior
- **Wildcard matching** -- `*` and `/*` match all routes
- **Handler chains** -- multiple handlers per route, executed in sequence

## Route Patterns

### Exact Match

```js
app.get('/about', function (req, res) {
    res.send('About page');
});
// Matches: GET /about
// Does not match: GET /about/ (with strictRouting: true)
```

### Wildcard

```js
app.use('*', function (req, res, next) {
    // Matches every request
    next();
});

app.get('/*', function (req, res) {
    // Matches every GET request
    res.send('Catch-all');
});
```

### Path Parameters

```js
app.get('/users/:id', function (req, res) {
    res.send({ userId: req.params.id });
});
// GET /users/42 -> req.params.id === "42"

app.get('/users/:name/:age', function (req, res) {
    res.send(`${req.params.name} is ${req.params.age}`);
});
// GET /users/alice/30 -> req.params = { name: "alice", age: "30" }
```

### Regular Expressions

```js
// Native RegExp
app.get(/\/api\/v\d+\/users/, function (req, res) {
    res.send('Matched versioned API');
});
// Matches: /api/v1/users, /api/v2/users, etc.

// RegExp with named groups
app.get(/^\/user\/(?<id>\d+)$/, function (req, res) {
    res.send({ id: req.params.id });
});
// GET /user/42 -> req.params.id === "42"
```

### Advanced String Patterns

String routes starting with `^` are converted to regex with parameter validation:

```js
// Validate parameter format
app.get('^/:name([a-z]+)/:age(\\d+)', function (req, res) {
    res.send(`${req.params.name} is ${req.params.age}`);
});
// GET /alice/30 -> matches
// GET /alice/abc -> does not match (age must be digits)

// Unnamed capture groups
app.get('^/([a-z]+)/', function (req, res) {
    res.send('Matched lowercase path segment');
});

// Named groups in string patterns
app.get('^/(?<test>[a-z]+)/', function (req, res) {
    res.send(`Param: ${req.params.test}`);
});
```

## Strict Routing

With `strictRouting: true` (default):

| Route | URL | Match? |
|-------|-----|--------|
| `/path/` | `/path/` | Yes |
| `/path/` | `/path` | No |
| `/path` | `/path` | Yes |
| `/path` | `/path/` | No |

With `strictRouting: false`:

| Route | URL | Match? |
|-------|-----|--------|
| `/path/` | `/path/` | Yes |
| `/path/` | `/path` | Yes |
| `/path` | `/path/` | Yes |

```js
const app = new SGAppsServer({ strictRouting: false });
```

## Handler Execution Order

Handlers execute in this order for each request:

1. **`use` handlers** -- middleware, runs first for all requests
2. **HTTP method handlers** -- `get`, `post`, `put`, etc.
3. **`_finalHandler` handlers** -- runs last, in reverse registration order

Within each group, handlers execute in registration order. Multiple handlers on the same route run sequentially:

```js
app.get('/api/data',
    function validate(req, res, next) {
        // runs first
        next();
    },
    function process(req, res) {
        // runs second
        res.send('OK');
    }
);
```

## The `all()` Method

Register a handler for every HTTP method:

```js
app.all('/api/*', function (req, res, next) {
    // Runs for GET, POST, PUT, DELETE, etc.
    res.response.setHeader('Access-Control-Allow-Origin', '*');
    next();
});
```

## The `finalHandler()` Method

Final handlers run after all other handlers, in reverse order (last registered runs first):

```js
app.finalHandler('/*', function (req, res) {
    // This runs last -- 404 fallback
    res.sendError(Error('Not Found'), { statusCode: 404 });
});
```

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- route registration methods
- [Dictionary](../routing/dictionary.md) -- internal route matching engine
- [Request](../networking/request.md) -- `req.params` and `req.query`
