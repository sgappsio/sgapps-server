# Security Best Practices

How to secure your SGApps Server application against common web vulnerabilities -- with built-in features, not third-party packages.

> [!TIP]
> SGApps Server includes signed cookies, session IP tracking, and httpOnly cookie defaults out of the box. Most Express apps need `helmet`, `cors`, `csurf`, and `cookie-parser` to reach the same baseline.

## Cookie Security

SGApps Server's cookie manager supports all security-relevant options natively.

### Recommended Production Configuration

```javascript
app.whenReady.then(() => {
    // Strong secret key for signed cookies
    app.CookiesManager.COOKIES_KEY = 'a-cryptographically-random-string-here';

    // Session cookie configuration
    app.SessionManager._options.cookie = 'ssid';
    app.SessionManager._options.SESSION_LIFE = 1800; // 30 minutes
});
```

### Cookie Options Reference

| Option | Default | Recommended | Why |
|---|---|---|---|
| `httpOnly` | `true` | `true` | Prevents JavaScript access (XSS mitigation) |
| `secure` | `false` | `true` in production | Cookies sent only over HTTPS |
| `sameSite` | `false` | `'strict'` or `'lax'` | Prevents CSRF attacks |
| `path` | `"/"` | `"/"` | Scope cookie to your domain root |
| `signed` | varies | `true` for sensitive data | Detects tampering via Keygrip |

```javascript
req.cookies.set('auth-token', token, {
    httpOnly: true,
    secure: true,        // HTTPS only
    sameSite: 'strict',  // no cross-site sending
    signed: true,        // Keygrip signature
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000) // 1 day
});
```

> [!WARNING]
> Never store sensitive data (passwords, tokens, PII) directly in cookies. Store a session ID and keep data server-side in `req.session.data`.

## Session Hardening

### Session Lifetime

Keep sessions short. Default is 600 seconds (10 minutes) -- appropriate for admin panels, too short for user-facing apps.

```javascript
// User-facing app: 30 minutes
app.SessionManager._options.SESSION_LIFE = 1800;

// Admin panel: 10 minutes
app.SessionManager._options.SESSION_LIFE = 600;

// Remember-me: handled via a separate long-lived cookie, not session lifetime
```

### IP Validation

Every session records the client IP in `req.session._ip`. You can use this to detect session hijacking:

```javascript
function validateSessionIp(req, res, next) {
    if (req.session._confirmed && req.session.data.user) {
        var currentIp = req.request.headers['x-forwarded-for']
            || req.request.connection.remoteAddress;
        if (req.session._ip !== currentIp) {
            // IP changed -- possible session hijacking
            req.session.data.user = null;
            return res.send({ error: 'Session expired' }, { statusCode: 401 });
        }
    }
    next();
}

app.use(validateSessionIp);
```

> [!NOTE]
> IP validation can cause false positives for users on mobile networks or VPNs where the IP changes frequently. Use it for high-security areas (admin, payment) rather than globally.

### Session Regeneration

After authentication, clear old session data to prevent session fixation:

```javascript
app.post('/login', app.handlePostData(), function (req, res) {
    // ... validate credentials ...

    // Clear any pre-auth session data
    var oldData = req.session.data;
    for (var key in oldData) {
        delete oldData[key];
    }

    // Set fresh authenticated session data
    req.session.data.user = { username: 'alice', role: 'admin' };
    req.session.data.authenticatedAt = Date.now();

    res.send({ message: 'Login successful' });
});
```

## Security Headers

Add security headers via middleware -- no external package needed:

```javascript
app.use(function (req, res, next) {
    // Prevent MIME type sniffing
    res.response.setHeader('X-Content-Type-Options', 'nosniff');

    // Prevent clickjacking
    res.response.setHeader('X-Frame-Options', 'DENY');

    // XSS protection (legacy browsers)
    res.response.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.response.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Content Security Policy
    res.response.setHeader('Content-Security-Policy',
        "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'");

    // Strict Transport Security (HTTPS only)
    res.response.setHeader('Strict-Transport-Security',
        'max-age=31536000; includeSubDomains');

    // Remove server fingerprint
    res.response.removeHeader('X-Powered-By');

    next();
});
```

<!-- tabs:start -->

#### **SGApps Server**

```javascript
// Built-in middleware -- no packages needed
app.use(function (req, res, next) {
    res.response.setHeader('X-Content-Type-Options', 'nosniff');
    res.response.setHeader('X-Frame-Options', 'DENY');
    next();
});
```

#### **Express.js**

```javascript
// Requires: npm install helmet
const helmet = require('helmet');
app.use(helmet());
```

<!-- tabs:end -->

## CORS Configuration

Cross-Origin Resource Sharing for API servers:

```javascript
var ALLOWED_ORIGINS = [
    'https://myapp.com',
    'https://admin.myapp.com'
];

app.use(function (req, res, next) {
    var origin = req.request.headers.origin;

    if (ALLOWED_ORIGINS.indexOf(origin) !== -1) {
        res.response.setHeader('Access-Control-Allow-Origin', origin);
        res.response.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    res.response.setHeader('Access-Control-Allow-Methods',
        'GET, POST, PUT, DELETE, OPTIONS');
    res.response.setHeader('Access-Control-Allow-Headers',
        'Content-Type, Authorization');
    res.response.setHeader('Access-Control-Max-Age', '86400');

    next();
});

// Handle preflight
app.options('/*', function (req, res) {
    res.sendStatusCode(204);
});
```

> [!WARNING]
> Never use `Access-Control-Allow-Origin: *` with `Access-Control-Allow-Credentials: true`. This is a security vulnerability that browsers will block.

## Rate Limiting

Session-based rate limiting without external packages:

```javascript
app.use(function (req, res, next) {
    var now = Date.now();
    var windowMs = 60000;  // 1 minute window
    var maxRequests = 100; // max requests per window

    if (!req.session.data._rateLimit) {
        req.session.data._rateLimit = { count: 0, windowStart: now };
    }

    var rl = req.session.data._rateLimit;

    // Reset window if expired
    if (now - rl.windowStart > windowMs) {
        rl.count = 0;
        rl.windowStart = now;
    }

    rl.count++;

    // Set rate limit headers
    res.response.setHeader('X-RateLimit-Limit', maxRequests);
    res.response.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - rl.count));

    if (rl.count > maxRequests) {
        res.response.setHeader('Retry-After', Math.ceil((rl.windowStart + windowMs - now) / 1000));
        return res.send({ error: 'Too many requests' }, { statusCode: 429 });
    }

    next();
});
```

## Input Validation

Always validate and sanitize user input at system boundaries:

```javascript
app.post('/api/users', app.handlePostData(), function (req, res) {
    var name = (req.body.name || '').trim();
    var email = (req.body.email || '').trim().toLowerCase();

    // Length limits
    if (name.length < 2 || name.length > 100) {
        return res.send({ error: 'Name must be 2-100 characters' }, { statusCode: 400 });
    }

    // Format validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.send({ error: 'Invalid email format' }, { statusCode: 400 });
    }

    // Sanitize HTML entities to prevent XSS in stored data
    name = name.replace(/[<>"'&]/g, function (c) {
        return { '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#39;", '&':'&amp;' }[c];
    });

    // ... proceed with validated data
});
```

## POST Size Limits

Control maximum request body size to prevent denial-of-service:

```javascript
// Global limit: 16KB (default)
app.MAX_POST_SIZE = 16 * 1024;

// Per-route: allow 5MB for file uploads
app.post('/upload', app.handlePostData({ MAX_POST_SIZE: 5 * 1024 * 1024 }), handler);

// Per-route: allow only 1KB for JSON API
app.post('/api/settings', app.handlePostData({ MAX_POST_SIZE: 1024 }), handler);
```

## HTTPS Redirect

Redirect HTTP to HTTPS in production:

```javascript
app.use(function (req, res, next) {
    var proto = req.request.headers['x-forwarded-proto'];
    if (proto === 'http') {
        var host = req.request.headers.host;
        return res.redirect('https://' + host + req.urlInfo.pathname, {
            statusCode: 301
        });
    }
    next();
});
```

## Security Checklist

| Item | Status | How |
|---|---|---|
| HTTPS only | | Reverse proxy (nginx) + HSTS header |
| Signed cookies | Built-in | `CookiesManager.COOKIES_KEY` |
| httpOnly cookies | Built-in | Default `true` |
| Session lifetime | Built-in | `SessionManager._options.SESSION_LIFE` |
| Session IP tracking | Built-in | `req.session._ip` |
| Security headers | Middleware | `X-Content-Type-Options`, `X-Frame-Options`, CSP |
| CORS | Middleware | Origin whitelist, credentials control |
| Rate limiting | Middleware | Session-based counter |
| Input validation | Per-route | Length, format, sanitization |
| POST size limits | Built-in | `MAX_POST_SIZE` global and per-route |
| Dependency audit | npm | `npm audit` regularly |

---

## Related

- [Cookies Reference](../middleware/cookies.md) -- cookie options API
- [Sessions Reference](../middleware/sessions.md) -- SessionManager configuration
- [Production Deployment](../guides/production-deployment.md) -- HTTPS, reverse proxy
