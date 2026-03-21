# SGAppsServerRequest

A wrapper around Node.js `IncomingMessage` that provides parsed URL info, query parameters, path parameters, and properties added by decorators.

## Overview

Every incoming HTTP request is wrapped in an `SGAppsServerRequest` instance before being passed to route handlers. It provides convenient access to URL components, query parameters, and path parameters extracted from route matching. Built-in decorators further extend it with `body`, `files`, `cookies`, `session`, and `postData`.

## Advantages

- **Parsed URL** -- hostname, pathname, protocol, query string parsed automatically
- **Query parameters** -- `req.query` provides parsed query string as an object
- **Path parameters** -- `req.params` populated by route matching (`:id`, regex groups)
- **Per-request POST size** -- override `MAX_POST_SIZE` for individual requests
- **Lifecycle flags** -- track whether request is complete, aborted, or closed
- **Mount path support** -- `getMountUpdatedUrl()` adjusts URLs for sub-applications

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `request` | IncomingMessage | The underlying Node.js request object |
| `urlInfo` | object | Parsed URL components (see below) |
| `query` | object | Parsed query string parameters |
| `params` | object | URL path parameters from route matching |
| `mountPath` | string | Mount path for this request |
| `MAX_POST_SIZE` | number | Maximum POST size in bytes (set to -1 for server default) |
| `_flags` | object | Request lifecycle flags |
| `_destroy` | array | Cleanup functions called on response end |

### `urlInfo` Properties

| Property | Type | Description |
|----------|------|-------------|
| `original` | string | Original full URL |
| `origin` | string | URL origin |
| `domain` | string | Full domain |
| `domain_short` | string | Domain without "www." |
| `pathname` | string | URL path (normalized, no double slashes) |
| `reqQuery` | string | Raw query string after `?` |
| `protocol` | string | Protocol (`http` or `https`) |
| `url` | string | Full URL |
| `url_p` | string | Parsed URL |
| `isIp` | string | Whether domain is an IP address |
| `get_vars` | object | Parsed query parameters (same as `query`) |

### `_flags` Properties

| Flag | Type | Description |
|------|------|-------------|
| `complete` | boolean | HTTP message fully received and parsed |
| `aborted` | boolean | Request was aborted by the client |
| `closed` | boolean | Underlying connection was closed |
| `_DEBUG_MAX_HANDLER_EXECUTION_TIME` | number | Override handler timeout for this request |

## Properties Added by Decorators

| Property | Type | Added By | Description |
|----------|------|----------|-------------|
| `body` | object | request-postdata | Parsed form/JSON body data |
| `bodyItems` | array | request-postdata | Raw form field items |
| `files` | object | request-postdata | Uploaded files organized by field name |
| `fileItems` | array | request-postdata | Flat array of all uploaded files |
| `postData` | Promise | request-postdata | Resolves when POST data is fully received |
| `cookies` | object | request-cookie | Cookie get/set manager |
| `session` | object | request-session | Session with `data`, `_id`, `_ip`, `_confirmed` |
| `_postDataBuffer` | Buffer | request-postdata | Raw POST body buffer |

## Methods

### `getMountUpdatedUrl(url)`

Adjust a URL based on the request's mount path. Useful for sub-applications.

| Parameter | Type | Description |
|-----------|------|-------------|
| `url` | string | URL to adjust |

Returns `string` -- URL with mount path prefix removed.

```js
// If mountPath is '/api'
req.getMountUpdatedUrl('/api/users/42');
// Returns: '/users/42'
```

### `_parseDeepFieldName(container, fieldName, fieldData, [options])`

Parse nested form field names like `field[sub][key]` into deep objects. Automatically used when `_REQUEST_FORM_PARAMS_DEEP_PARSE` is enabled.

| Parameter | Type | Description |
|-----------|------|-------------|
| `container` | object | Target object to write into |
| `fieldName` | string | Form field name (e.g., `test[arr][data]`) |
| `fieldData` | any | Field value |
| `options.transform2ArrayOnDuplicate` | boolean | Convert to array on duplicate (default: false) |

```js
var container = {};
req._parseDeepFieldName(container, 'user[name]', 'Alice');
req._parseDeepFieldName(container, 'user[tags][]', 'admin');
req._parseDeepFieldName(container, 'user[tags][]', 'editor');
// container = { user: { name: 'Alice', tags: ['admin', 'editor'] } }
```

---

## Code Examples

### Example 1: Query Parameters

```js
app.get('/search', function (req, res) {
    var q = req.query.q || '';
    var page = req.query.page || '1';
    res.send({ query: q, page: page });
});
// GET /search?q=test&page=2
// Response: { "query": "test", "page": "2" }
```

### Example 2: Path Parameters

```js
app.get('/users/:userId/posts/:postId', function (req, res) {
    res.send({
        userId: req.params.userId,
        postId: req.params.postId
    });
});
// GET /users/5/posts/42
// Response: { "userId": "5", "postId": "42" }
```

### Example 3: Checking Request State

```js
app.use(function (req, res, next) {
    res.response.on('close', function () {
        if (req._flags.aborted) {
            app.logger.warn('Request was aborted:', req.urlInfo.pathname);
        }
    });
    next();
});
```

### Example 4: Custom POST Size Per Request

```js
app.post('/upload',
    function (req, res, next) {
        // Allow 10MB for this route
        req.MAX_POST_SIZE = 10 * 1024 * 1024;
        next();
    },
    app.handlePostData(),
    function (req, res) {
        res.send({ filesReceived: req.fileItems.length });
    }
);
```

---

## Related Modules

- [Response](../networking/response.md) -- response wrapper
- [POST Data](../middleware/post-data.md) -- body parsing details
- [Cookies](../middleware/cookies.md) -- cookie management
- [Sessions](../middleware/sessions.md) -- session management
