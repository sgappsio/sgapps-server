# Guide: Serving Static Files

How to serve static files, configure auto-indexing, combine static serving with API routes, and set up a single-page application.

## Basic Static Server

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, {
        autoIndex: ['index.html', 'index.htm']
    });
});

// 404 fallback
app.finalHandler('/*', function (req, res) {
    res.sendError(new Error('File not found'), { statusCode: 404 });
});

app.server().listen(8080, () => {
    app.logger.log('Static server on port 8080');
});
```

## Directory Structure

```
project/
├── server.js
└── public/
    ├── index.html
    ├── css/
    │   └── style.css
    ├── js/
    │   └── app.js
    └── images/
        └── logo.png
```

## Combining Static Files with API Routes

API routes should be registered **before** the static file handler:

```js
// API routes
app.get('/api/users', function (req, res) {
    res.send([{ name: 'Alice' }]);
});

app.post('/api/users', app.handlePostData(), function (req, res) {
    res.send({ created: true }, { statusCode: 201 });
});

// Static files (catch-all, registered last)
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, {
        autoIndex: ['index.html']
    });
});

app.finalHandler('/*', function (req, res) {
    res.sendError(new Error('Not Found'), { statusCode: 404 });
});
```

## Single-Page Application (SPA)

For SPAs, unmatched routes should fall back to `index.html`:

```js
// Static files
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './dist', function (err) {
        if (err) {
            // File not found -- serve index.html for client-side routing
            res.pipeFileStatic(
                require('path').resolve('./dist/index.html'),
                'index.html',
                function (err) {
                    if (err) res.sendError(err, { statusCode: 500 });
                }
            );
        }
    });
});
```

## Multiple Static Directories

Serve from multiple directories with priority:

```js
// Try /assets first
app.get('/assets/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './assets', function (err) {
        if (err) next();
    });
});

// Then try /public
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, { autoIndex: ['index.html'] });
});
```

## What You Get for Free

The static file handler automatically provides:

| Feature | Description |
|---------|-------------|
| **ETag caching** | 304 responses for unchanged files |
| **Gzip compression** | Transparent compression based on Accept-Encoding |
| **Range requests** | 206 partial content for video/audio streaming |
| **MIME types** | Automatic Content-Type from file extension |
| **Last-Modified** | Cache validation headers |

No additional configuration needed -- these features are always active.

---

## Next Steps

- [Building a REST API](../guides/building-a-rest-api.md) -- add API endpoints
- [Static Files Reference](../middleware/static-files.md) -- full API details
- [Response](../networking/response.md) -- `pipeFile()` and `pipeFileStatic()`
