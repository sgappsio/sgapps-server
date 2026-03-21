# Use Case: Authentication & Sessions

Login/logout flow with role-based access control, session persistence, and remember-me cookies.

**Express equivalent:** `express` + `express-session` + `cookie-parser` + `connect-flash`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// ---------------------
//  Mock user database
// ---------------------
var usersDb = {
    'admin': { username: 'admin', password: 'admin123', role: 'admin', name: 'Administrator' },
    'editor': { username: 'editor', password: 'editor123', role: 'editor', name: 'Jane Editor' },
    'viewer': { username: 'viewer', password: 'viewer123', role: 'viewer', name: 'John Viewer' }
};

// ---------------------
//  Auth middleware
// ---------------------
function requireAuth(req, res, next) {
    if (req.session.data.user) {
        next();
    } else {
        res.send({ error: 'Authentication required' }, { statusCode: 401 });
    }
}

function requireRole(role) {
    return function (req, res, next) {
        if (!req.session.data.user) {
            return res.send({ error: 'Authentication required' }, { statusCode: 401 });
        }
        if (req.session.data.user.role !== role && req.session.data.user.role !== 'admin') {
            return res.send({ error: 'Insufficient permissions' }, { statusCode: 403 });
        }
        next();
    };
}

// ---------------------
//  Public routes
// ---------------------
app.get('/', function (req, res) {
    res.send({
        message: 'Welcome to the API',
        authenticated: !!req.session.data.user,
        endpoints: {
            login: 'POST /login',
            logout: 'GET /logout',
            profile: 'GET /profile',
            admin: 'GET /admin/dashboard',
            editor: 'GET /editor/articles'
        }
    });
});

// ---------------------
//  Login
// ---------------------
app.post('/login', app.handlePostData(), function (req, res) {
    var username = (req.body.username || '').trim().toLowerCase();
    var password = req.body.password || '';

    if (!username || !password) {
        return res.send({ error: 'Username and password are required' }, { statusCode: 400 });
    }

    var user = usersDb[username];
    if (!user || user.password !== password) {
        return res.send({ error: 'Invalid credentials' }, { statusCode: 401 });
    }

    // Store user in session (without password)
    req.session.data.user = {
        username: user.username,
        name: user.name,
        role: user.role,
        loginAt: Date.now()
    };

    res.send({
        message: 'Login successful',
        user: req.session.data.user
    });
});

// ---------------------
//  Logout
// ---------------------
app.get('/logout', function (req, res) {
    req.session.data.user = null;
    res.send({ message: 'Logged out' });
});

// ---------------------
//  Protected: any authenticated user
// ---------------------
app.get('/profile', requireAuth, function (req, res) {
    res.send({
        user: req.session.data.user,
        session: {
            id: req.session._id,
            returning: req.session._confirmed,
            ip: req.session._ip
        }
    });
});

// ---------------------
//  Protected: admin only
// ---------------------
app.get('/admin/dashboard', requireRole('admin'), function (req, res) {
    res.send({
        dashboard: 'Admin Dashboard',
        stats: {
            totalUsers: Object.keys(usersDb).length,
            activeSessions: Object.keys(app.SessionManager._sessions).length
        }
    });
});

// ---------------------
//  Protected: editor or admin
// ---------------------
app.get('/editor/articles', requireRole('editor'), function (req, res) {
    res.send({
        articles: [
            { id: 1, title: 'Getting Started with SGApps', status: 'published' },
            { id: 2, title: 'Advanced Routing Patterns', status: 'draft' }
        ]
    });
});

// ---------------------
//  Protected: change password
// ---------------------
app.post('/change-password', requireAuth, app.handlePostData(), function (req, res) {
    var currentPassword = req.body.currentPassword || '';
    var newPassword = req.body.newPassword || '';

    var user = usersDb[req.session.data.user.username];
    if (!user || user.password !== currentPassword) {
        return res.send({ error: 'Current password is incorrect' }, { statusCode: 400 });
    }
    if (newPassword.length < 6) {
        return res.send({ error: 'New password must be at least 6 characters' }, { statusCode: 400 });
    }

    user.password = newPassword;
    res.send({ message: 'Password changed successfully' });
});

// ---------------------
//  Start
// ---------------------
app.whenReady.then(() => {
    app.CookiesManager.COOKIES_KEY = 'a-strong-random-secret-key';
    app.SessionManager._options.cookie = 'app-session';
    app.SessionManager._options.SESSION_LIFE = 1800; // 30 minutes

    app.server().listen(3000, () => {
        app.logger.log('Auth server running on port 3000');
    });
}, app.logger.error);
```

## Testing with curl

```bash
# Login as admin
curl -X POST -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}' \
    -c cookies.txt \
    http://localhost:3000/login

# Access profile (with session cookie)
curl -b cookies.txt http://localhost:3000/profile

# Access admin dashboard (admin only)
curl -b cookies.txt http://localhost:3000/admin/dashboard

# Login as viewer
curl -X POST -H "Content-Type: application/json" \
    -d '{"username":"viewer","password":"viewer123"}' \
    -c cookies.txt \
    http://localhost:3000/login

# Try admin dashboard as viewer (403)
curl -b cookies.txt http://localhost:3000/admin/dashboard

# Logout
curl -b cookies.txt http://localhost:3000/logout

# Try profile after logout (401)
curl -b cookies.txt http://localhost:3000/profile
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `req.session.data` | Store user data across requests |
| `req.session._confirmed` | Detect returning vs. new visitors |
| `req.session._id` | Unique session identifier |
| `app.SessionManager._options` | Configure session lifetime and cookie name |
| `app.CookiesManager.COOKIES_KEY` | Secret key for signed cookies |
| Middleware functions | `requireAuth`, `requireRole()` as reusable guards |
| Multiple handlers per route | `requireAuth, app.handlePostData(), handler` chain |

---

## Related

- [Session Management Guide](../guides/session-management.md) -- cluster usage and detailed config
- [Cookies Reference](../middleware/cookies.md) -- cookie options API
- [Sessions Reference](../middleware/sessions.md) -- SessionManager API
