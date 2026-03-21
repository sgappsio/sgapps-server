# Static File Serving

Serve files with ETag caching, gzip/deflate compression, range request support, and automatic index file resolution.

## Overview

The `response-pipe-file-static` decorator adds `pipeFileStatic()` to every response, and `response-pipe-file` adds `pipeFile()` for raw file streaming. Together they provide production-ready static file serving with caching headers, content compression, partial content responses, and MIME type detection.

## Advantages

- **ETag caching** -- generates ETags from file size and modification time, returns 304 on match
- **Gzip/Deflate** -- automatic compression based on `Accept-Encoding` header
- **Range requests** -- `206 Partial Content` for video/audio streaming and download resuming
- **Auto-index** -- configurable list of index files to try for directory paths
- **MIME detection** -- automatic content-type from file extension
- **Last-Modified** -- cache validation headers
- **Stream timeout** -- configurable timeout for long-running streams

## Getting Started

### Using `handleStaticRequest()` (Recommended)

```js
const app = new SGAppsServer();

app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next(); // file not found, pass to next handler
    }, {
        autoIndex: ['index.html', 'index.htm']
    });
});

app.server().listen(8080);
```

### Using `pipeFileStatic()` Directly

```js
app.get('/assets/*', function (req, res) {
    var filePath = '/var/www' + req.urlInfo.pathname;
    var fileName = req.urlInfo.pathname.replace(/^.*\//, '') || 'index.html';

    res.pipeFileStatic(filePath, fileName, function (err) {
        if (err) {
            res.sendError(new Error('File not found'), { statusCode: 404 });
        }
    });
});
```

## API Reference

### `handleStaticRequest(request, response, path, [callback], [options])`

Convenience method on the server that resolves file paths relative to a directory and serves them.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | SGAppsServerRequest | Wrapped request |
| `response` | SGAppsServerResponse | Wrapped response |
| `path` | string | Root directory for static files |
| `callback` | function | `(err, request, response, server)` |
| `options.timeout` | number | Stream timeout in ms (default: 0) |
| `options.autoIndex` | string[] | Index files to try for directories |

### `pipeFileStatic(filePath, fileName, callback, [options])`

Serve a file with full caching and compression support.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Absolute path to the file |
| `fileName` | string | File name for MIME detection |
| `callback` | function | `(err)` called on completion |
| `options.timeout` | number | Stream timeout in ms |
| `options.autoIndex` | string[] | Index files for directory fallback |

### `pipeFile(filePath, callback)`

Stream a file directly with range request support but no caching or compression.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Absolute path to the file |
| `callback` | function | `(err)` called on completion |

## Caching Behavior

### ETag Flow

```
Client Request                    Server Response
     |                                  |
     |--- GET /style.css ------------->|
     |                                  |--- 200 OK
     |                                  |    ETag: "1234-5678"
     |                                  |    Last-Modified: ...
     |                                  |    Content-Encoding: gzip
     |                                  |    (file body)
     |                                  |
     |--- GET /style.css ------------->|
     |    If-None-Match: "1234-5678"   |
     |                                  |--- 304 Not Modified
     |                                  |    (no body)
```

ETags are computed as `{fileSize}-{mtimeMs}`. When the client sends `If-None-Match` with a matching ETag, the server returns `304 Not Modified` with no body.

### Compression

Compression is applied automatically based on the `Accept-Encoding` request header:

| Accept-Encoding | Response |
|-----------------|----------|
| Contains `deflate` | `Content-Encoding: deflate` |
| Contains `gzip` | `Content-Encoding: gzip` |
| Neither | Raw file with `Content-Length` |

### Range Requests

When the client sends a `Range` header, the server responds with partial content:

```
Client: Range: bytes=0-1023
Server: 206 Partial Content
        Content-Range: bytes 0-1023/5000
        Accept-Ranges: bytes
        Content-Length: 1024
        (partial file body)
```

## Auto-Index

When a URL points to a directory, the server tries index files in order:

```js
app.handleStaticRequest(req, res, './public', callback, {
    autoIndex: ['index.html', 'index.htm', 'default.html']
});
// GET /about/ tries:
//   ./public/about/index.html
//   ./public/about/index.htm
//   ./public/about/default.html
```

---

## Code Examples

### Example 1: SPA with API Routes

```js
// API routes first
app.get('/api/users', function (req, res) {
    res.send([{ name: 'Alice' }]);
});

// Static files for everything else
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './dist', function (err) {
        if (err) {
            // Fallback to index.html for SPA routing
            res.pipeFileStatic('./dist/index.html', 'index.html', function (err) {
                if (err) res.sendError(err, { statusCode: 404 });
            });
        }
    });
});
```

### Example 2: Multiple Static Directories

```js
app.get('/assets/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './assets', function (err) {
        if (err) next();
    });
});

app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, { autoIndex: ['index.html'] });
});
```

---

## Related Modules

- [Response](../networking/response.md) -- `pipeFile()` and `pipeFileStatic()` details
- [SGAppsServer](../core/sgapps-server.md) -- `handleStaticRequest()` method
