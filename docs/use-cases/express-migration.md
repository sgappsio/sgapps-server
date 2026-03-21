# Use Case: Migrating from Express

A side-by-side comparison showing how a typical Express application looks before and after migration to SGApps Server.

## The Express Version (Before)

A typical Express app with sessions, cookies, body parsing, static files, compression, and logging requires **7 packages**:

```bash
npm install express body-parser cookie-parser express-session compression serve-static morgan
```

```javascript
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const compression = require('compression');
const serveStatic = require('serve-static');
const morgan = require('morgan');
const path = require('path');

const app = express();

// Wire up 6 middleware packages
app.use(morgan('combined'));
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser('secret-key'));
app.use(session({
    secret: 'session-secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 3600000 }
}));
app.use(serveStatic(path.join(__dirname, 'public')));

// Routes
app.get('/', function (req, res) {
    req.session.visits = (req.session.visits || 0) + 1;
    res.json({ visits: req.session.visits });
});

app.post('/api/data', function (req, res) {
    res.json({ received: req.body });
});

app.get('/users/:id', function (req, res) {
    res.json({ userId: req.params.id });
});

app.listen(8080, function () {
    console.log('Server running on port 8080');
});
```

**Dependencies:** 7 packages, each with its own version, API, and security surface.

---

## The SGApps Server Version (After)

```bash
npm install sgapps-server
```

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// Routes -- same API, no middleware wiring
app.get('/', function (req, res) {
    req.session.data.visits = (req.session.data.visits || 0) + 1;
    res.send({ visits: req.session.data.visits });
});

app.post('/api/data', app.handlePostData(), function (req, res) {
    res.send({ received: req.body });
});

app.get('/users/:id', function (req, res) {
    res.send({ userId: req.params.id });
});

// Static files -- compression, ETag, range requests built in
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, { autoIndex: ['index.html'] });
});

app.whenReady.then(() => {
    app.CookiesManager.COOKIES_KEY = 'secret-key';
    app.SessionManager._options.SESSION_LIFE = 3600;

    app.server().listen(8080, () => {
        app.logger.log('Server running on port 8080');
    });
}, app.logger.error);
```

**Dependencies:** 1 package. Sessions, cookies, body parsing, compression, static serving, and logging are all built in.

---

## Migration Cheat Sheet

| Express Pattern | SGApps Server Equivalent |
|---|---|
| `const app = express()` | `const app = new SGAppsServer()` |
| `app.listen(port)` | `app.server().listen(port)` |
| `app.get(path, handler)` | `app.get(path, handler)` (identical) |
| `app.post(path, handler)` | `app.post(path, handler)` (identical) |
| `app.use(handler)` | `app.use(handler)` (identical) |
| `app.use(express.json())` | Not needed -- use `app.handlePostData()` per route |
| `app.use(cookieParser(key))` | `app.CookiesManager.COOKIES_KEY = key` |
| `app.use(session({...}))` | `app.SessionManager._options = {...}` |
| `app.use(compression())` | Not needed -- built in for static files |
| `app.use(serveStatic(dir))` | `app.handleStaticRequest(req, res, dir, cb)` |
| `app.use(morgan('combined'))` | Add `access-logger` decorator |
| `req.session.visits` | `req.session.data.visits` |
| `req.body` | `req.body` (identical, after `handlePostData()`) |
| `req.params.id` | `req.params.id` (identical) |
| `req.query.page` | `req.query.page` (identical) |
| `res.json(data)` | `res.send(data)` (auto-detects JSON) |
| `res.send(html)` | `res.send(html)` (identical) |
| `res.redirect(url)` | `res.redirect(url)` (identical) |
| `res.status(404).send(msg)` | `res.send(msg, { statusCode: 404 })` |

### Key Differences

1. **Body parsing is per-route**, not global. Use `app.handlePostData()` as middleware on routes that need it. This is more efficient -- GET routes skip parsing entirely.

2. **Session data lives in `req.session.data`**, not directly on `req.session`. This separates session metadata (`_id`, `_ip`, `_confirmed`) from your application data.

3. **Static files use a handler**, not global middleware. This gives you control over ordering -- API routes can be checked before static files.

4. **`app.server().listen()`** instead of `app.listen()`. The `server()` method returns the underlying `http.Server` for full control.

5. **`app.whenReady`** resolves when all decorators have initialized. Configure sessions/cookies inside the callback.

---

## Related

- [REST API](../use-cases/rest-api.md) -- CRUD API use case
- [Authentication & Sessions](../use-cases/auth-sessions.md) -- session management use case
- [Getting Started](../getting-started.md) -- step-by-step first server
