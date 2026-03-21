# Middleware Overview

Built-in decorators that extend request and response objects with essential web server capabilities.

## Overview

SGApps Server uses a **decorator pattern** to compose server functionality. Each decorator is a function that runs in two phases: once at server startup (initialization) and once per incoming request (decoration). The built-in decorators provide URL parsing, response helpers, POST data parsing, cookie management, session handling, static file serving, and template rendering.

## Built-in Decorators

All decorators below are loaded automatically when you create an `SGAppsServer` instance. They initialize asynchronously -- use `app.whenReady` to access their configuration.

| Decorator | Adds to Request | Adds to Response | Adds to Server |
|-----------|----------------|-----------------|----------------|
| request-url | `getMountUpdatedUrl()` | | |
| response-send | | `send()`, `sendStatusCode()` | |
| response-error | | `sendError()` | |
| response-redirect | | `redirect()` | |
| response-pipe-file | | `pipeFile()` | |
| response-template | | | `TemplateManager` |
| request-postdata | `body`, `files`, `postData` | | |
| request-cookie | `cookies` | | `CookiesManager` |
| request-session | `session` | | `SessionManager` |
| response-pipe-file-static | | `pipeFileStatic()` | |

## Optional Decorators

These are not loaded by default. Add them via the `decorators` option:

| Decorator | Module | Description |
|-----------|--------|-------------|
| [Access Logger](../decorators/access-logger.md) | `sgapps-server/decorators/access-logger` | HTTP access logging |
| [MVC Framework](../decorators/mvc.md) | `sgapps-server/decorators/nodejs-mvc-bootstrap` | Controller/action/view architecture |

```js
const AccessLogger = require('sgapps-server/decorators/access-logger');

const app = new SGAppsServer({
    decorators: [AccessLogger]
});
```

## Writing Custom Decorators

A decorator is a function with this signature:

```js
function MyDecorator(request, response, server, callback) {
    // Phase 1: Initialization (called once at startup)
    if (request === null && response === null) {
        server.myFeature = { enabled: true };
        callback();
        return;
    }

    // Phase 2: Per-request decoration
    request.myHelper = function () {
        return 'custom data';
    };

    response.myMethod = function (data) {
        response.send({ custom: data });
    };

    callback(); // must call callback to continue
}
```

**Rules:**
- Always call `callback()` to pass control to the next decorator
- Call `callback(error)` to signal an error
- In phase 1, `request` and `response` are both `null`
- In phase 2, they are `SGAppsServerRequest` and `SGAppsServerResponse` instances

Register custom decorators at construction:

```js
const app = new SGAppsServer({
    decorators: [MyDecorator, AnotherDecorator]
});
```

---

## Detailed Documentation

- [POST Data](../middleware/post-data.md) -- form data, JSON, file uploads
- [Cookies](../middleware/cookies.md) -- cookie get/set with signing
- [Sessions](../middleware/sessions.md) -- in-memory sessions with cluster sync
- [Static Files](../middleware/static-files.md) -- file serving with caching and compression
- [Templates](../middleware/templates.md) -- file-based template rendering
