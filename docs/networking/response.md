# SGAppsServerResponse

A wrapper around Node.js `ServerResponse` that provides helper methods for sending data, errors, redirects, and serving files.

## Overview

Every HTTP response is wrapped in an `SGAppsServerResponse` instance. Built-in decorators add methods like `send()`, `sendError()`, `redirect()`, `pipeFile()`, and `pipeFileStatic()` that handle content-type detection, compression, caching, and range requests automatically.

## Advantages

- **Auto content-type** -- `send()` detects HTML, JSON, plain text, and binary
- **Error handling** -- `sendError()` sets status codes and messages
- **HTTP redirects** -- `redirect()` with configurable status codes
- **File streaming** -- `pipeFile()` streams files with range request support
- **Static serving** -- `pipeFileStatic()` adds ETag, compression, and auto-index
- **Lifecycle tracking** -- `_flags` tracks finished, sent, and closed states

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `response` | ServerResponse | The underlying Node.js response object |
| `_flags` | object | Response lifecycle flags |
| `_destroy` | array | Cleanup functions called on response finish |

### `_flags` Properties

| Flag | Type | Description |
|------|------|-------------|
| `finished` | boolean | `true` if `response.end()` has been called |
| `sent` | boolean | `true` if all data has been flushed to the socket |
| `closed` | boolean | `true` if the connection was terminated |

## Methods Added by Decorators

### `send(data, [options])`

Send a response with automatic content-type detection.

| Parameter | Type | Description |
|-----------|------|-------------|
| `data` | string, Buffer, object, array | Response body |
| `options.statusCode` | number | HTTP status code (default: 200) |
| `options.headers` | object | Additional response headers |

**Content-type auto-detection:**

| Data Type | Content-Type |
|-----------|-------------|
| String starting with `<` | `text/html` |
| Other strings | `text/plain` |
| Buffer | `application/octet-stream` |
| Array or Object | `application/json` |

```js
res.send('Hello');                          // text/plain
res.send('<h1>Hello</h1>');                 // text/html
res.send({ status: 'ok' });                // application/json
res.send(Buffer.from('binary'));            // application/octet-stream
res.send('Custom', { statusCode: 201 });   // with status code
res.send('data', {
    headers: { 'X-Custom': 'value' }       // with custom headers
});
```

### `sendStatusCode(statusCode)`

Send a response with just a status code and its standard message.

| Parameter | Type | Description |
|-----------|------|-------------|
| `statusCode` | number | HTTP status code |

```js
res.sendStatusCode(204); // sends "No Content" with status 204
res.sendStatusCode(403); // sends "Forbidden" with status 403
```

### `sendError(error, [options])`

Send an error response.

| Parameter | Type | Description |
|-----------|------|-------------|
| `error` | Error | Error object |
| `options.statusCode` | number | HTTP status code (default: 500) |

```js
res.sendError(new Error('Not Found'), { statusCode: 404 });
res.sendError(new Error('Internal Error')); // defaults to 500
```

### `redirect(url, [options])`

Send an HTTP redirect response.

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | Redirect target URL |
| `options.statusCode` | number | HTTP status code (default: 302) |
| `options.headers` | object | Additional headers |

```js
res.redirect('/login');                              // 302 redirect
res.redirect('/new-url', { statusCode: 301 });       // permanent redirect
```

### `pipeFile(filePath, callback)`

Stream a file to the response with range request (206) support.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Absolute path to the file |
| `callback` | function | `(err)` called on completion |

```js
res.pipeFile('/path/to/video.mp4', function (err) {
    if (err) app.logger.error(err);
});
```

**Range request support:**
- Parses `Range` header from the request
- Responds with `206 Partial Content` and `Content-Range` header
- Supports `bytes=start-end` format

### `pipeFileStatic(filePath, fileName, callback, [options])`

Serve a static file with caching, compression, and auto-index support.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Absolute path to the file |
| `fileName` | string | File name (used for MIME type detection) |
| `callback` | function | `(err)` called on completion |
| `options.timeout` | number | Stream timeout in ms (default: 0) |
| `options.autoIndex` | string[] | Index files to try for directories |

**Features:**
- **ETag caching** -- generates ETags from file size + mtime, returns 304 on match
- **Compression** -- automatic gzip/deflate based on `Accept-Encoding` header
- **Last-Modified** -- sets `Last-Modified` header for cache validation
- **MIME detection** -- automatic from file extension
- **Auto-index** -- tries index files when path is a directory

```js
res.pipeFileStatic(
    '/var/www/style.css',
    'style.css',
    function (err) {
        if (err) res.sendError(err, { statusCode: 404 });
    },
    {
        autoIndex: ['index.html', 'index.htm']
    }
);
```

---

## Code Examples

### Example 1: JSON API Response

```js
app.get('/api/users', function (req, res) {
    res.send([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' }
    ]);
    // Content-Type: application/json
});
```

### Example 2: HTML Response with Status Code

```js
app.get('/error', function (req, res) {
    res.send('<h1>Page Not Found</h1>', {
        statusCode: 404,
        headers: { 'X-Error': 'not-found' }
    });
});
```

### Example 3: File Download

```js
app.get('/download/:file', function (req, res) {
    var filePath = '/var/files/' + req.params.file;
    res.response.setHeader('Content-Disposition', 'attachment');
    res.pipeFile(filePath, function (err) {
        if (err) {
            res.sendError(err, { statusCode: 404 });
        }
    });
});
```

### Example 4: Checking Response State

```js
app.use(function (req, res, next) {
    // Set a timeout
    setTimeout(function () {
        if (!res._flags.finished) {
            res.sendError(new Error('Request timeout'), { statusCode: 408 });
        }
    }, 30000);
    next();
});
```

---

## Related Modules

- [Request](../networking/request.md) -- request wrapper
- [Static Files](../middleware/static-files.md) -- static file serving details
- [SGAppsServer](../core/sgapps-server.md) -- `handleStaticRequest()` convenience method
