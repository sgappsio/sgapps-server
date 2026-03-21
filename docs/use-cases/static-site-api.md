# Use Case: Static Site + API

Serve a frontend (static files or SPA) alongside JSON API routes, with compression, caching, and SPA fallback.

**Express equivalent:** `express` + `serve-static` + `compression`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const path = require('path');
const app = new SGAppsServer();

// ---------------------
//  API routes (checked first)
// ---------------------
app.get('/api/status', function (req, res) {
    res.send({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});

app.get('/api/users', function (req, res) {
    res.send([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]);
});

app.post('/api/contact', app.handlePostData(), function (req, res) {
    app.logger.log('Contact form:', req.body);
    res.send({ message: 'Thank you for your message' }, { statusCode: 201 });
});

// ---------------------
//  Static assets (CSS, JS, images)
// ---------------------
app.get('/assets/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    });
});

// ---------------------
//  SPA fallback (all other GET requests)
//  Try static file first, fall back to index.html for client-side routing
// ---------------------
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) {
            // File not found -- serve index.html for SPA routing
            res.pipeFileStatic(
                path.resolve('./public/index.html'),
                'index.html',
                function (err) {
                    if (err) res.sendError(err, { statusCode: 500 });
                }
            );
        }
    }, { autoIndex: ['index.html'] });
});

// ---------------------
//  Start
// ---------------------
app.server().listen(3000, () => {
    app.logger.log('Static + API server running on port 3000');
});
```

## Directory Structure

```
project/
├── server.js
└── public/
    ├── index.html
    ├── assets/
    │   ├── css/
    │   │   └── style.css
    │   ├── js/
    │   │   └── app.js
    │   └── images/
    │       └── logo.png
    └── favicon.ico
```

## What You Get for Free

No configuration needed -- these are all automatic:

| Feature | Behavior |
|---|---|
| **ETag caching** | Returns `304 Not Modified` when file hasn't changed |
| **Gzip compression** | Compresses with gzip or deflate based on `Accept-Encoding` |
| **MIME types** | Detects content-type from file extension |
| **Last-Modified** | Sets cache validation header |
| **Range requests** | Supports `206 Partial Content` for video/audio |
| **Auto-index** | Tries `index.html` when URL points to a directory |

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| Route ordering | API routes registered before static catch-all |
| `app.handleStaticRequest()` | Serve directory with auto-index |
| `res.pipeFileStatic()` | Serve specific file with caching and compression |
| Error callback | Fall through to SPA on file-not-found |
| `autoIndex` | Resolve `/about/` to `/about/index.html` |

---

## Related

- [Serving Static Files Guide](../guides/serving-static-files.md) -- multiple directories, detailed config
- [Static Files Reference](../middleware/static-files.md) -- full API
- [Response Reference](../networking/response.md) -- `pipeFile()`, `pipeFileStatic()` methods
