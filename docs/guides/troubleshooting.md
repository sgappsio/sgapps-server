# Troubleshooting & FAQ

Common problems, their causes, and how to fix them.

## Common Errors

### `req.body` is empty or `undefined`

**Cause:** POST data parsing is per-route in SGApps Server. You need to use `app.handlePostData()` as middleware on routes that need it.

```javascript
// Wrong -- body is not parsed
app.post('/api/data', function (req, res) {
    res.send(req.body); // {}
});

// Correct -- add handlePostData() middleware
app.post('/api/data', app.handlePostData(), function (req, res) {
    res.send(req.body); // { name: "Alice" }
});
```

> [!TIP]
> This is different from Express where `app.use(express.json())` parses all requests globally. SGApps Server's approach is more efficient -- GET requests skip body parsing entirely.

### Session data is empty on the second request

**Cause:** You're configuring sessions or starting the server before `whenReady` resolves.

```javascript
// Wrong -- SessionManager may not be initialized yet
app.SessionManager._options.cookie = 'ssid';
app.server().listen(8080);

// Correct -- wait for whenReady
app.whenReady.then(() => {
    app.SessionManager._options.cookie = 'ssid';
    app.server().listen(8080);
});
```

### `Cannot read property 'cookie' of undefined` on SessionManager

**Cause:** Same as above -- accessing `SessionManager` before decorators have initialized.

```javascript
// Always use whenReady for decorator configuration
app.whenReady.then(() => {
    app.SessionManager._options.cookie = 'ssid';      // works
    app.CookiesManager.COOKIES_KEY = 'secret';         // works
    app.TemplateManager.add('home', './views/home.html'); // works
});
```

### Static files return 404 but the file exists

**Cause 1:** Path resolution. `handleStaticRequest` resolves paths relative to `process.cwd()`, not the script file.

```javascript
// If server.js is in /var/www/myapp/ and you run from /var/www/:
// Wrong -- resolves to /var/www/public
app.handleStaticRequest(req, res, './public', callback);

// Correct -- use absolute path
var path = require('path');
app.handleStaticRequest(req, res, path.join(__dirname, 'public'), callback);
```

**Cause 2:** Strict routing. With `strictRouting: true` (default), `/about` doesn't match `/about/`.

```javascript
// Either disable strict routing:
const app = new SGAppsServer({ strictRouting: false });

// Or register both patterns:
app.get('/about', handler);
app.get('/about/', handler);
```

### Compression doesn't work

**Cause:** Gzip/deflate compression only applies to `pipeFileStatic()` (static files). The `send()` method does not compress.

```javascript
// Compressed -- pipeFileStatic handles Accept-Encoding
app.handleStaticRequest(req, res, './public', callback);

// NOT compressed -- send() writes raw data
res.send('<h1>This is not compressed</h1>');
```

To compress dynamic responses, use Node.js `zlib` manually or let a reverse proxy (nginx) handle it.

### `[Request.MAX_POST_SIZE] exceeded` error

**Cause:** The uploaded file or POST body exceeds the size limit. Default is 16KB.

```javascript
// Increase globally
app.MAX_POST_SIZE = 10 * 1024 * 1024; // 10MB

// Or per-route
app.post('/upload', app.handlePostData({
    MAX_POST_SIZE: 50 * 1024 * 1024 // 50MB
}), handler);
```

### `handler execution time exceeded` warning

**Cause:** A handler took longer than `_DEBUG_MAX_HANDLER_EXECUTION_TIME` (default: 500ms). This is a warning, not an error.

```javascript
// Increase the threshold
const app = new SGAppsServer({
    _DEBUG_MAX_HANDLER_EXECUTION_TIME: 2000 // warn after 2 seconds
});

// Or disable the warning
const app = new SGAppsServer({ debug: false });

// Or increase per-request
app.get('/slow-endpoint', function (req, res, next) {
    req._flags._DEBUG_MAX_HANDLER_EXECUTION_TIME = 5000; // 5 seconds for this route
    next();
}, handler);
```

### Route matches when it shouldn't (or vice versa)

**Cause:** Route ordering or strict routing.

```javascript
// Problem: /users/new matches /users/:id
app.get('/users/:id', function (req, res) { /* ... */ });
app.get('/users/new', function (req, res) { /* never reached */ });

// Fix: register specific routes before parameterized ones
app.get('/users/new', function (req, res) { /* runs for /users/new */ });
app.get('/users/:id', function (req, res) { /* runs for /users/42 */ });
```

> [!NOTE]
> Routes are matched in registration order. More specific routes should be registered first.

### Template rendering shows raw `{{ }}` syntax

**Cause:** The template file doesn't have a `.tpl` or `.fbx-tpl` extension. Only these extensions are processed by the FaceboxTemplate engine.

```javascript
// Wrong -- .html files are served raw
app.TemplateManager.add('home', './views/home.html');

// Correct -- .fbx-tpl files are processed
app.TemplateManager.add('home', './views/home.fbx-tpl');
```

### Sessions don't sync across cluster workers

**Cause:** Session sync happens via IPC, which requires the Node.js `cluster` module. If you're using PM2 or another process manager, make sure it uses cluster mode.

```javascript
// PM2: use cluster mode (exec_mode: 'cluster')
// Manual: use require('cluster')

// Check if sync is working:
app.get('/debug-session', function (req, res) {
    res.send({
        worker: process.pid,
        sessionId: req.session._id,
        confirmed: req.session._confirmed,
        data: req.session.data
    });
});
```

If `_confirmed` is always `false`, cookies aren't being sent back -- check cookie configuration and browser settings.

## FAQ

### Can I use SGApps Server with TypeScript?

Yes. The package includes `index.d.ts` with full type definitions. Import like this:

```typescript
import { SGAppsServer, LoggerBuilder } from 'sgapps-server';
const app = new SGAppsServer();
```

### Can I use async/await handlers?

The handler signature is callback-based (`next()`), but you can use async functions -- just make sure to catch errors:

```javascript
app.get('/api/data', async function (req, res) {
    try {
        var data = await fetchData();
        res.send(data);
    } catch (err) {
        res.sendError(err, { statusCode: 500 });
    }
});
```

### Can I mount a sub-application?

Yes, use `mountPath`:

```javascript
app.mountPath = '/api/v1';
// All routes are now relative to /api/v1
```

### How do I serve multiple sites (virtual hosts)?

Use the `Host` header in middleware:

```javascript
app.use(function (req, res, next) {
    var host = (req.request.headers.host || '').toLowerCase();
    if (host === 'admin.myapp.com') {
        req.vhost = 'admin';
    } else {
        req.vhost = 'main';
    }
    next();
});

app.get('/', function (req, res) {
    if (req.vhost === 'admin') {
        res.send('Admin panel');
    } else {
        res.send('Main site');
    }
});
```

### How do I add WebSocket support?

Access the underlying HTTP server and attach a WebSocket library:

```javascript
var WebSocket = require('ws');
var wss = new WebSocket.Server({ server: app.server() });

wss.on('connection', function (ws) {
    ws.on('message', function (message) {
        ws.send('Echo: ' + message);
    });
});

app.server().listen(8080);
```

### Where should I report bugs?

Open an issue at the project repository: [labs.sgapps.io/open-source/sgapps-server/issues](https://labs.sgapps.io/open-source/sgapps-server/issues)

---

## Related

- [Getting Started](../getting-started.md) -- initial setup
- [Architecture](../architecture.md) -- how request handling works
- [Error Handling](../guides/error-handling.md) -- error propagation details
