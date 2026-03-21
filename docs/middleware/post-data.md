# POST Data Parsing

Automatic parsing of multipart form data, JSON, and URL-encoded request bodies with deep field name support and file upload handling.

## Overview

The `request-postdata` decorator adds POST body parsing to every request. It supports three content types: `multipart/form-data` (file uploads), `application/json`, and `application/x-www-form-urlencoded`. Parsed data is available on `req.body` (fields) and `req.files` (uploads). Parsing is lazy -- it only starts when `req.postData` is accessed.

## Advantages

- **Three content types** -- multipart, JSON, and URL-encoded handled automatically
- **Lazy parsing** -- POST data is only parsed when `req.postData` is accessed
- **Deep field names** -- `field[sub][key]` parsed into nested objects
- **File streaming** -- access file streams before buffering completes
- **Size limits** -- per-request `MAX_POST_SIZE` enforcement
- **Boundary correction** -- auto-detects multipart boundaries from body content

## Getting Started

```js
app.post('/api/submit', app.handlePostData(), function (req, res) {
    res.send({
        body: req.body,
        fileCount: req.fileItems.length
    });
});
```

## Request Properties

| Property | Type | Description |
|----------|------|-------------|
| `body` | object | Parsed form fields or JSON data |
| `bodyItems` | array | Raw form field items with metadata |
| `files` | object | Uploaded files organized by field name |
| `fileItems` | array | Flat array of all uploaded files |
| `postData` | Promise\<Buffer\> | Resolves when POST data is fully received |
| `_postDataBuffer` | Buffer | Raw POST body as a buffer |

### File Object Structure

Each file in `fileItems` or `files` has this structure:

| Property | Type | Description |
|----------|------|-------------|
| `fieldName` | string | Form field name |
| `data.fileName` | string | Original file name |
| `data.encoding` | string | File encoding |
| `data.fileStream` | function | Returns the readable stream |
| `data.fileData` | Buffer | File content (available after load) |
| `data.fileSize` | number | File size in bytes |
| `data.contentType` | string | MIME type |
| `data.loaded` | boolean | Whether file is fully buffered |

### Body Item Structure

Each item in `bodyItems` has this structure:

| Property | Type | Description |
|----------|------|-------------|
| `fieldName` | string | Form field name |
| `data.value` | string | Field value |
| `data.encoding` | string | Field encoding |
| `data.valTruncated` | string | Whether value was truncated |
| `data.fieldNameTruncated` | Buffer | Whether field name was truncated |
| `data.mimeType` | string | Field MIME type |

## Deep Field Name Parsing

When `_REQUEST_FORM_PARAMS_DEEP_PARSE` is enabled (default), field names like `user[name]` are parsed into nested objects:

```js
// Form fields:
// user[name] = "Alice"
// user[tags][] = "admin"
// user[tags][] = "editor"
// user[address][city] = "NYC"

// Result in req.body:
{
    "user": {
        "name": "Alice",
        "tags": ["admin", "editor"],
        "address": {
            "city": "NYC"
        }
    }
}
```

**Rules:**
- `field[key]` creates nested objects
- `field[]` creates arrays
- Mixing `field[key]` and `field[]` on the same parent converts arrays to objects
- Duplicate non-array fields emit warnings in debug mode

## Content Type Handling

### `multipart/form-data`

Used for file uploads. Parsed with Busboy:

```js
app.post('/upload', app.handlePostData(), function (req, res) {
    req.fileItems.forEach(function (file) {
        app.logger.log('File:', file.data.fileName, file.data.fileSize, 'bytes');
    });
    res.send({ uploaded: req.fileItems.length });
});
```

### `application/json`

JSON bodies are parsed and merged into `req.body`:

```js
app.post('/api/data', app.handlePostData(), function (req, res) {
    // POST body: {"name": "Alice", "age": 30}
    res.send({ name: req.body.name }); // { "name": "Alice" }
});
```

### `application/x-www-form-urlencoded`

Standard form submissions:

```js
app.post('/form', app.handlePostData(), function (req, res) {
    // POST body: name=Alice&age=30
    res.send({ name: req.body.name }); // { "name": "Alice" }
});
```

## Controlling POST Size

```js
// Global limit (default: 16 KB)
app.MAX_POST_SIZE = 1024 * 1024; // 1 MB

// Per-route limit via handlePostData options
app.post('/upload', app.handlePostData({
    MAX_POST_SIZE: 10 * 1024 * 1024 // 10 MB
}), function (req, res) {
    res.send('OK');
});

// Per-request limit in middleware
app.post('/large-upload', function (req, res, next) {
    req.MAX_POST_SIZE = 50 * 1024 * 1024; // 50 MB
    next();
}, app.handlePostData(), function (req, res) {
    res.send('OK');
});
```

---

## Related Modules

- [Request](../networking/request.md) -- request properties overview
- [SGAppsServer](../core/sgapps-server.md) -- `handlePostData()` method
