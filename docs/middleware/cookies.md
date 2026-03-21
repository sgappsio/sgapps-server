# Cookie Management

Built-in cookie handling with signed cookies, secure options, and configurable secret keys.

## Overview

The `request-cookie` decorator adds a `cookies` property to every request. It uses Keygrip-signed cookies for tamper detection and supports all standard cookie options including `httpOnly`, `secure`, `sameSite`, `domain`, `path`, and `expires`.

## Advantages

- **Signed cookies** -- Keygrip-based signing detects tampered values
- **Full options** -- secure, httpOnly, sameSite, domain, path, expires, overwrite
- **Global configuration** -- `CookiesManager` on server for shared settings
- **Enable/disable** -- toggle cookie handling with `CookiesManager._enabled`

## Getting Started

```js
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.CookiesManager.COOKIES_KEY = 'my-secret-key';

    app.get('/set', function (req, res) {
        req.cookies.set('username', 'alice', {
            httpOnly: true,
            secure: false
        });
        res.send('Cookie set');
    });

    app.get('/get', function (req, res) {
        var username = req.cookies.get('username');
        res.send('Hello ' + (username || 'Guest'));
    });

    app.server().listen(8080);
});
```

## Server Configuration

The `CookiesManager` object is added to the server during decorator initialization:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `COOKIES_KEY` | string | `'your secret key'` | Secret key for signing cookies |
| `_enabled` | boolean | `true` | Set to `false` to disable cookie handling |
| `handle` | function | built-in | Custom cookie handler factory |

```js
app.whenReady.then(() => {
    app.CookiesManager.COOKIES_KEY = 'a-strong-random-secret';

    // Disable cookies entirely
    // app.CookiesManager._enabled = false;
});
```

## API Reference

### `cookies.get(name, [options])`

Get a cookie value.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | string | Cookie name |
| `options.secure` | boolean | Read from secure cookies (default: false) |

Returns `string` -- the cookie value, or `undefined` if not found.

```js
var token = req.cookies.get('auth-token', { secure: true });
```

### `cookies.set(name, value, [options])`

Set a cookie.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `name` | string | | Cookie name |
| `value` | string | | Cookie value |
| `options.secure` | boolean | `false` | HTTPS only |
| `options.secureProxy` | boolean | | Trust proxy headers for secure detection |
| `options.signed` | boolean | | Use Keygrip-signed cookies |
| `options.path` | string | `"/"` | Cookie path |
| `options.expires` | Date | | Expiration date |
| `options.domain` | string | | Cookie domain |
| `options.httpOnly` | boolean | `true` | Prevent JavaScript access |
| `options.sameSite` | boolean/string | `false` | SameSite attribute |
| `options.overwrite` | boolean | `false` | Overwrite existing cookie |

```js
// Simple cookie
req.cookies.set('preference', 'dark');

// Secure cookie with expiry
req.cookies.set('token', 'abc123', {
    secure: true,
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    sameSite: 'strict'
});

// Delete a cookie (set empty value with past expiry)
req.cookies.set('token', '', {
    expires: new Date(0)
});
```

---

## Code Examples

### Example 1: Remember Me

```js
app.post('/login', app.handlePostData(), function (req, res) {
    // ... authenticate user ...
    if (req.body.remember) {
        req.cookies.set('remember-token', generateToken(), {
            httpOnly: true,
            expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
    }
    res.redirect('/dashboard');
});
```

### Example 2: Theme Preference

```js
app.get('/theme/:name', function (req, res) {
    req.cookies.set('theme', req.params.name, {
        httpOnly: false, // allow JavaScript access
        path: '/'
    });
    res.redirect('/');
});

app.use(function (req, res, next) {
    req.theme = req.cookies.get('theme') || 'light';
    next();
});
```

---

## Related Modules

- [Sessions](../middleware/sessions.md) -- sessions use cookies for session IDs
- [Request](../networking/request.md) -- `req.cookies` property
