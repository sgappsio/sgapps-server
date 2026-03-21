# Guide: Session Management

How to configure sessions, implement login/logout, protect routes, and use sessions in a Node.js cluster.

## Basic Session Usage

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.SessionManager._options.SESSION_LIFE = 1800; // 30 minutes
    app.SessionManager._options.cookie = 'my-session';
    app.CookiesManager.COOKIES_KEY = 'a-strong-secret-key';

    app.get('/', function (req, res) {
        req.session.data.visits = (req.session.data.visits || 0) + 1;
        res.send({ visits: req.session.data.visits });
    });

    app.server().listen(8080);
});
```

## Login / Logout Flow

```js
app.whenReady.then(() => {
    app.SessionManager._options.SESSION_LIFE = 3600; // 1 hour

    // Login page
    app.get('/login', function (req, res) {
        res.send('<form method="POST" action="/login">' +
            '<input name="username" placeholder="Username">' +
            '<input name="password" type="password" placeholder="Password">' +
            '<button>Login</button></form>');
    });

    // Handle login
    app.post('/login', app.handlePostData(), function (req, res) {
        // In production, check against a database
        if (req.body.username === 'admin' && req.body.password === 'secret') {
            req.session.data.user = {
                username: req.body.username,
                role: 'admin',
                loginTime: Date.now()
            };
            res.redirect('/dashboard');
        } else {
            res.sendError(new Error('Invalid credentials'), { statusCode: 401 });
        }
    });

    // Protected route
    app.get('/dashboard', function (req, res) {
        if (!req.session.data.user) {
            return res.redirect('/login');
        }
        res.send({
            message: 'Welcome ' + req.session.data.user.username,
            session: {
                id: req.session._id,
                returning: req.session._confirmed,
                ip: req.session._ip
            }
        });
    });

    // Logout
    app.get('/logout', function (req, res) {
        req.session.data = {};
        res.redirect('/login');
    });

    app.server().listen(8080);
});
```

## Auth Middleware

Create reusable authentication middleware:

```js
function requireAuth(req, res, next) {
    if (req.session.data.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

function requireRole(role) {
    return function (req, res, next) {
        if (req.session.data.user && req.session.data.user.role === role) {
            next();
        } else {
            res.sendError(new Error('Forbidden'), { statusCode: 403 });
        }
    };
}

// Usage
app.get('/admin', requireAuth, requireRole('admin'), function (req, res) {
    res.send('Admin panel');
});

app.get('/profile', requireAuth, function (req, res) {
    res.send({ user: req.session.data.user });
});
```

## Session Configuration Options

| Option | Default | Description |
|--------|---------|-------------|
| `SESSION_LIFE` | `600` | Session lifetime in seconds (10 minutes) |
| `cookie` | `'ssiddyn'` | Cookie name for the session ID |
| `workersSyncMaxDelay` | `200` | Max wait for worker/master sync in ms |

```js
app.whenReady.then(() => {
    // Long sessions (1 day)
    app.SessionManager._options.SESSION_LIFE = 86400;

    // Custom cookie name
    app.SessionManager._options.cookie = 'app-session';

    // Increase sync timeout for slow networks
    app.SessionManager._options.workersSyncMaxDelay = 500;
});
```

## Cluster Usage

Sessions work transparently across cluster workers:

```js
const cluster = require('cluster');
const { SGAppsServer } = require('sgapps-server');

if (cluster.isPrimary) {
    // Fork 4 workers
    for (let i = 0; i < 4; i++) {
        cluster.fork();
    }

    cluster.on('exit', function (worker) {
        console.log('Worker', worker.process.pid, 'died, restarting...');
        cluster.fork();
    });
} else {
    const app = new SGAppsServer();

    app.whenReady.then(() => {
        app.SessionManager._options.SESSION_LIFE = 3600;

        app.get('/whoami', function (req, res) {
            res.send({
                worker: process.pid,
                sessionId: req.session._id,
                visits: req.session.data.visits || 0
            });
            req.session.data.visits = (req.session.data.visits || 0) + 1;
        });

        app.server().listen(8080);
    });
}
```

The `visits` counter will be consistent across all workers because the master process holds the session store.

## Session Properties Reference

| Property | Type | Description |
|----------|------|-------------|
| `_id` | string | Unique session ID (e.g., `sess-abc123-def456`) |
| `_ip` | string | Client IP (supports X-Forwarded-For) |
| `_created` | number | Timestamp when session was created |
| `_confirmed` | boolean | `true` if session cookie was sent by client |
| `data` | object | Your session data -- any JSON-serializable values |

### Understanding `_confirmed`

- `false` on the **first request** -- the client didn't send a session cookie
- `true` on **subsequent requests** -- the client sent back the session cookie

This is useful for detecting first-time vs. returning visitors.

---

## Next Steps

- [Sessions Reference](../middleware/sessions.md) -- full API documentation
- [Cookies](../middleware/cookies.md) -- cookie configuration
- [Building a REST API](../guides/building-a-rest-api.md) -- add API endpoints
