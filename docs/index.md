# SGApps Server

**A high-performance HTTP web server framework for Node.js** with built-in routing, session management, cookie handling, static file serving with compression, template rendering, and an optional MVC framework -- all with minimal dependencies.

## Why Choose SGApps Server?

- 🚀 **Express-like API** -- familiar `get()`, `post()`, `use()` routing you already know
- 🔐 **Sessions & Cookies** -- cluster-aware sessions with worker/master sync, Keygrip-signed cookies
- 📦 **Static File Serving** -- ETag caching, gzip/deflate compression, range requests (206)
- 📝 **POST Data Parsing** -- multipart uploads, JSON, URL-encoded with deep field names
- 🏗️ **Access Logging** -- GoAccess & AWStats compatible log format
- 📚 **Optional MVC** -- controller/action/view framework with auto-discovery
- 💻 **Pretty CLI Logger** -- VT100-colored console with file/line tracing
- 📑 **TypeScript Support** -- full type definitions for IntelliSense

## Quick Example

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
});
```

## What's Inside

| | Module | What You'll Learn |
|---|---|---|
| **Core** | [SGAppsServer](core/sgapps-server.md) | Server setup, constructor options, routing methods, middleware chains |
| **Core** | [LoggerBuilder](core/logger.md) | Pretty CLI logging, custom formats, replacing global console |
| **Routing** | [Routing Patterns](routing/index.md) | Path params, regex routes, named groups, strict mode, wildcards |
| **Networking** | [Request](networking/request.md) | URL parsing, query/path params, flags, mount paths |
| **Networking** | [Response](networking/response.md) | `send()`, `redirect()`, `pipeFile()`, auto content-type |
| **Middleware** | [POST Data](middleware/post-data.md) | File uploads, JSON parsing, deep field names (`field[a][b]`) |
| **Middleware** | [Cookies](middleware/cookies.md) | Signed cookies, secure flags, httpOnly, sameSite |
| **Middleware** | [Sessions](middleware/sessions.md) | Cluster sync, auto-expiry, returning-user detection |
| **Middleware** | [Static Files](middleware/static-files.md) | ETag, gzip, range requests, auto-index |
| **Middleware** | [Templates](middleware/templates.md) | Named templates, environment variables, rendering |
| **Decorators** | [Access Logger](decorators/access-logger.md) | GoAccess/AWStats format, file rotation, custom handlers |
| **Decorators** | [MVC Framework](decorators/mvc.md) | Controllers, actions, views, auto-discovery |
| **Utilities** | [Email](utilities/email.md) | Sendmail integration, HTML, CC/BCC, validation |

## Step-by-Step Guides

Pick a guide and build something real:

- 🛠️ [Building a REST API](guides/building-a-rest-api.md) -- CRUD endpoints, middleware, error handling, CORS
- 📁 [Serving Static Files](guides/serving-static-files.md) -- static + API combo, SPA fallback, multiple directories
- 🔑 [Session Management](guides/session-management.md) -- login/logout flow, auth middleware, cluster usage
- 🛡️ [Security Best Practices](guides/security.md) -- cookies, CORS, rate limiting, headers, input validation
- 🔧 [Error Handling](guides/error-handling.md) -- error flow, custom error pages, async errors
- 🚀 [Production Deployment](guides/production-deployment.md) -- cluster, nginx, PM2, systemd, graceful shutdown
- ❓ [Troubleshooting & FAQ](guides/troubleshooting.md) -- common problems and solutions

## Use Cases

Runnable examples that show what SGApps Server replaces from the Express ecosystem:

| Use Case | Replaces | Description |
|---|---|---|
| [Express Migration](use-cases/express-migration.md) | `express` + 6 packages | Side-by-side rewrite with migration cheat sheet |
| [REST API](use-cases/rest-api.md) | `body-parser` + `cors` | CRUD, validation, CORS, error handling |
| [Auth & Sessions](use-cases/auth-sessions.md) | `express-session` + `cookie-parser` | Login, logout, role guards |
| [File Uploads](use-cases/file-uploads.md) | `multer` | Multipart forms, size limits |
| [Static Site + API](use-cases/static-site-api.md) | `serve-static` + `compression` | Frontend + API, SPA fallback |
| [Cluster Deployment](use-cases/cluster-deployment.md) | `connect-redis` | Multi-worker, shared sessions via IPC |
| [Access Logging](use-cases/access-logging.md) | `morgan` | GoAccess/AWStats, error-only logs |
| [Template Rendering](use-cases/template-rendering.md) | `ejs` / `pug` | Dynamic pages, env vars |
| [MVC Application](use-cases/mvc-application.md) | Custom MVC / `sails.js` | Controllers, actions, views |
| [Email Notifications](use-cases/email-notifications.md) | `nodemailer` | Contact forms, HTML emails |

## Getting Started

```bash
npm install sgapps-server
```

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

// Wait for decorators to initialize, then start
app.whenReady.then(() => {
    app.SessionManager._options.cookie = 'ssid';
    app.SessionManager._options.SESSION_LIFE = 120; // seconds

    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

[Full Getting Started Guide](getting-started.md) | [Architecture Overview](architecture.md)

---

## License

[Apache-2.0](https://www.apache.org/licenses/LICENSE-2.0)

By [Sergiu Gordienco](https://www.linkedin.com/in/sergiu-gordienco/) | [sgapps.io](https://sgapps.io)
