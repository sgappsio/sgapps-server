# Session Management

In-memory session storage with automatic cookie-based identification, expiration, and transparent Node.js cluster worker/master synchronization.

## Overview

The `request-session` decorator adds session support to every request. Sessions are stored in memory and identified by a cookie. When running in a Node.js cluster, the master process holds the authoritative session store and workers synchronize via IPC messages automatically.

## Advantages

- **Automatic setup** -- sessions work out of the box with no configuration
- **Cluster-aware** -- transparent worker/master session synchronization
- **Cookie-based** -- session IDs stored in cookies, configurable name
- **Auto-expiry** -- expired sessions cleaned up every 5 seconds
- **Confirmation flag** -- `session._confirmed` tells you if this is a returning user
- **Per-session data** -- arbitrary data object persisted across requests
- **Destroy support** -- clean up individual sessions

## Getting Started

```js
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.SessionManager._options.SESSION_LIFE = 1800; // 30 minutes
    app.SessionManager._options.cookie = 'my-session';

    app.get('/visit', function (req, res) {
        req.session.data.visits = (req.session.data.visits || 0) + 1;
        res.send({
            visits: req.session.data.visits,
            returning: req.session._confirmed
        });
    });

    app.server().listen(8080);
});
```

## Server Configuration

The `SessionManager` is added to the server during decorator initialization:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `_options.SESSION_LIFE` | number | `600` | Session lifetime in seconds |
| `_options.cookie` | string | `'ssiddyn'` | Cookie name for session ID |
| `_options.workersSyncMaxDelay` | number | `200` | Max IPC sync delay in ms |
| `_enabled` | boolean | `true` | Set to `false` to disable sessions |
| `_sessions` | object | `{}` | In-memory session store |

```js
app.whenReady.then(() => {
    app.SessionManager._options.SESSION_LIFE = 3600; // 1 hour
    app.SessionManager._options.cookie = 'ssid';

    // Disable sessions entirely
    // app.SessionManager._enabled = false;
});
```

## Session Object

Each request gets a `session` property with these fields:

| Property | Type | Description |
|----------|------|-------------|
| `_id` | string | Unique session identifier |
| `_ip` | string | Client IP address (supports X-Forwarded-For) |
| `_created` | number | Session creation timestamp |
| `_confirmed` | boolean | `true` if session was restored from an existing cookie |
| `data` | object | Arbitrary session data (persisted across requests) |

### `session.destroy()`

Clean up the session object and release references:

```js
app.get('/logout', function (req, res) {
    req.session.data = {};
    res.redirect('/');
});
```

## Cluster Support

When using Node.js `cluster`, session synchronization happens automatically:

```
Request arrives at Worker
         |
         v
Worker creates session, reads cookie
         |
         v
Worker sends IPC: "give me session data for ID X"
         |
         v
Master responds with stored session data
         |
         v
Worker merges data into request.session.data
         |
         v
Handler executes
         |
         v
Response finishes
         |
         v
Worker sends IPC: "store updated session data for ID X"
         |
         v
Master updates session store
```

If the master doesn't respond within `workersSyncMaxDelay` (default: 200ms), the worker continues with its local session data and logs a warning.

### Cluster Example

```js
const cluster = require('cluster');

if (cluster.isPrimary) {
    // Master: create workers
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }
} else {
    // Worker: create server
    const app = new SGAppsServer();

    app.get('/counter', function (req, res) {
        req.session.data.count = (req.session.data.count || 0) + 1;
        res.send({ count: req.session.data.count });
    });

    app.server().listen(8080);
    // Sessions are automatically synced with master
}
```

---

## Code Examples

### Example 1: Login Flow

```js
app.post('/login', app.handlePostData(), function (req, res) {
    if (req.body.username === 'admin' && req.body.password === 'secret') {
        req.session.data.user = { username: 'admin', role: 'admin' };
        res.redirect('/dashboard');
    } else {
        res.sendError(new Error('Invalid credentials'), { statusCode: 401 });
    }
});

app.get('/dashboard', function (req, res) {
    if (!req.session.data.user) {
        return res.redirect('/login');
    }
    res.send({ user: req.session.data.user });
});
```

### Example 2: Session-Based Rate Limiting

```js
app.use(function (req, res, next) {
    var now = Date.now();
    var window = 60000; // 1 minute
    var limit = 100;

    if (!req.session.data._rateLimit) {
        req.session.data._rateLimit = { count: 0, start: now };
    }

    var rl = req.session.data._rateLimit;
    if (now - rl.start > window) {
        rl.count = 0;
        rl.start = now;
    }

    rl.count++;
    if (rl.count > limit) {
        return res.sendError(new Error('Too many requests'), { statusCode: 429 });
    }

    next();
});
```

### Example 3: Checking Returning Users

```js
app.get('/welcome', function (req, res) {
    if (req.session._confirmed) {
        res.send('Welcome back!');
    } else {
        res.send('Welcome, new visitor!');
    }
});
```

---

## Related Modules

- [Cookies](../middleware/cookies.md) -- sessions use cookies for identification
- [Request](../networking/request.md) -- `req.session` property
- [Architecture](../architecture.md) -- cluster synchronization diagram
