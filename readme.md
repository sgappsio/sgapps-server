# SGApps Server

**An Express-compatible HTTP framework for Node.js that ships with sessions, cookies, compression, static serving, body parsing, and access logging -- built in.** No middleware assembly required.

[![pipeline status](https://labs.sgapps.io/open-source/sgapps-server/badges/master/pipeline.svg)](https://labs.sgapps.io/open-source/sgapps-server/-/commits/master)
[![License](https://img.shields.io/badge/License-Apache--2.0-blue)](https://labs.sgapps.io/open-source/sgapps-server/-/blob/master/LICENSE)
[![Repository - GitLab](https://img.shields.io/badge/Repository-GitLab-blue?logo=gitlab)](https://labs.sgapps.io/open-source/sgapps-server/)
[![Documentation](https://img.shields.io/badge/Documentation-Docs-blue?logo=html5)](https://sgappsio.github.io/sgapps-server/#/)
[![Sergiu Gordienco](https://img.shields.io/badge/author-Sergiu_Gordienco-blue?logo=linkedin)](https://www.linkedin.com/in/sergiu-gordienco/)
[![email sergiu.gordienco@gmail.com](https://img.shields.io/badge/email-sergiu.gordienco@gmail.com-blue?logo=email)](mailto:sergiu.gordienco@gmail.com)

[![npm](https://img.shields.io/npm/v/sgapps-server)](https://www.npmjs.com/package/sgapps-server)
[![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/sgappsio/sgapps-server/master)](https://github.com/sgappsio/sgapps-server)
[![GitHub issues](https://img.shields.io/github/issues/sgappsio/sgapps-server)](https://github.com/sgappsio/sgapps-server/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/sgappsio/sgapps-server)](https://github.com/sgappsio/sgapps-server/pulls)

[![SGApps Server Documentation](docs/media/banner-docs.svg)](https://sgappsio.github.io/sgapps-server/#/)

---

## The Problem with Express

Building a production Express app typically means installing and wiring together 6-10 separate middleware packages:

```
express + body-parser + cookie-parser + express-session +
compression + serve-static + multer + morgan + ...
```

Each package has its own versioning, its own API surface, and its own security advisories. You end up maintaining glue code instead of writing application logic.

## How SGApps Server Solves It

**One install. One `require`. Everything works.**

```bash
npm install sgapps-server
```

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// Sessions, cookies, body parsing, static serving, compression
// -- all active. No middleware to install or configure.

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
});
```

The API is intentionally Express-compatible: `get()`, `post()`, `use()`, `all()`, `(req, res, next)` handlers, path parameters, regex routes. **If you know Express, you already know SGApps Server.**

---

## Express vs SGApps Server

| Capability | Express.js | SGApps Server |
|---|---|---|
| Routing (`get`, `post`, `use`, `all`) | Built-in | Built-in |
| Path parameters (`:id`) | Built-in | Built-in |
| Regex routes | Built-in | Built-in + named groups, advanced patterns |
| Body parsing (JSON, form, multipart) | `body-parser` + `multer` | **Built-in** |
| Cookie handling (signed) | `cookie-parser` | **Built-in** (Keygrip) |
| Sessions | `express-session` + store | **Built-in** (cluster-aware) |
| Static file serving | `serve-static` | **Built-in** |
| Gzip / Deflate compression | `compression` | **Built-in** |
| ETag caching | `serve-static` config | **Built-in** (automatic) |
| Range requests (206) | Manual | **Built-in** |
| Access logging (GoAccess, AWStats) | `morgan` + custom | **Built-in** decorator |
| Template engine | `app.set('view engine')` + package | **Built-in** TemplateManager |
| MVC framework | Third-party | **Built-in** optional decorator |
| Cluster session sync | `connect-redis` or similar | **Built-in** (IPC) |
| TypeScript definitions | `@types/express` | **Included** |
| Structured logger with source tracing | Third-party | **Built-in** LoggerBuilder |
| Deep form field parsing (`a[b][c]`) | Third-party | **Built-in** |

**Fewer dependencies = smaller attack surface, simpler upgrades, less maintenance.**

---

## Quick Start

### Basic Server

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.get('/', function (req, res) {
    res.send('Hello World!');
});

app.get('/users/:id', function (req, res) {
    res.send({ userId: req.params.id });
});

app.post('/api/data', app.handlePostData(), function (req, res) {
    res.send({ received: req.body });
});

app.server().listen(8080, () => {
    app.logger.log('Server is running on port 8080');
});
```

### Sessions & Authentication

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.SessionManager._options.cookie = 'ssid';
    app.SessionManager._options.SESSION_LIFE = 3600; // 1 hour
    app.CookiesManager.COOKIES_KEY = 'your-secret-key';

    app.post('/login', app.handlePostData(), function (req, res) {
        // authenticate user ...
        req.session.data.user = { name: req.body.username };
        res.redirect('/dashboard');
    });

    app.get('/dashboard', function (req, res) {
        if (!req.session.data.user) return res.redirect('/login');
        res.send({ user: req.session.data.user });
    });

    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

### Static Files + API

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// API routes
app.get('/api/users', function (req, res) {
    res.send([{ id: 1, name: 'Alice' }]);
});

// Static files with auto-index, ETag, gzip -- zero config
app.get('/*', function (req, res, next) {
    app.handleStaticRequest(req, res, './public', function (err) {
        if (err) next();
    }, { autoIndex: ['index.html'] });
});

app.server().listen(8080);
```

### Production Access Logging

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer({
    decorators: [require('sgapps-server/decorators/access-logger')]
});

app.whenReady.then(() => {
    app.AccessLogger.combined = true;
    app.AccessLoggerPaths['default'] = {
        isEnabled: true,
        path: 'logs/{year}/{month}/access-{worker-id}.log'
    };

    app.server().listen(8080, () => {
        app.logger.log('Server is running on port 8080');
    });
}, app.logger.error);
```

```bash
# Analyze with GoAccess
tail -f logs/2024/3/access-master.log | goaccess \
    --log-format='%h %e %^[%x] "%v" "%r" %s %b "%R" "%u"' \
    --date-format='%d/%b/%Y:%H:%M:%S %z' \
    --time-format='%d/%b/%Y:%H:%M:%S %z' -
```

---

## Production-Ready Features

### Cluster Support

Sessions synchronize transparently between Node.js cluster workers via IPC -- no Redis, no external session store required for single-machine deployments.

```javascript
const cluster = require('cluster');

if (cluster.isPrimary) {
    for (let i = 0; i < 4; i++) cluster.fork();
} else {
    const app = new SGAppsServer();
    // Sessions are automatically synced with the master process
    app.server().listen(8080);
}
```

### Handler Performance Monitoring

Debug mode warns you when handlers exceed configurable execution time thresholds:

```javascript
const app = new SGAppsServer({
    debug: true,
    _DEBUG_MAX_HANDLER_EXECUTION_TIME: 200, // warn after 200ms
    _DEBUG_REQUEST_HANDLERS_STATS: true      // log per-handler timing
});
```

### Deep Form Data Parsing

Nested field names like `user[address][city]` are automatically parsed into objects -- no additional middleware or configuration:

```javascript
// POST body: user[name]=Alice&user[tags][]=admin&user[tags][]=editor
// req.body = { user: { name: "Alice", tags: ["admin", "editor"] } }
```

---

## 📖 Documentation

> **Comprehensive guides, API reference, and real-world examples for every module.**
>
> **[Open Full Documentation](https://sgappsio.github.io/sgapps-server/#/)** &nbsp; | &nbsp; [Getting Started](docs/getting-started.md) &nbsp; | &nbsp; [Architecture](docs/architecture.md)

### API Reference

| Area | Module | Coverage |
|---|---|---|
| **Core** | [SGAppsServer](docs/core/sgapps-server.md) | Constructor options, all route methods, middleware, static serving, `whenReady` |
| **Core** | [LoggerBuilder](docs/core/logger.md) | Log levels, custom formats, `prettyCli()`, `decorateGlobalLogger()` |
| **Routing** | [Routing Patterns](docs/routing/index.md) | Path params, regex, named groups, strict mode, `all()`, `finalHandler()` |
| **Routing** | [Dictionary](docs/routing/dictionary.md) | Internal route matching engine, `push()`, `run()`, caching |
| **Request** | [SGAppsServerRequest](docs/networking/request.md) | `urlInfo`, `query`, `params`, `body`, `files`, `session`, `cookies`, `postData` |
| **Response** | [SGAppsServerResponse](docs/networking/response.md) | `send()`, `sendError()`, `redirect()`, `pipeFile()`, `pipeFileStatic()` |
| **Middleware** | [POST Data](docs/middleware/post-data.md) | Multipart, JSON, URL-encoded, deep field names, file streaming |
| **Middleware** | [Cookies](docs/middleware/cookies.md) | `get()`, `set()`, signed cookies, secure/httpOnly/sameSite options |
| **Middleware** | [Sessions](docs/middleware/sessions.md) | `SessionManager` config, cluster sync, `_confirmed`, `destroy()` |
| **Middleware** | [Static Files](docs/middleware/static-files.md) | ETag, gzip/deflate, range requests, auto-index, MIME detection |
| **Middleware** | [Templates](docs/middleware/templates.md) | `add()`, `render()`, environment variables, `addList()` |
| **Decorators** | [Access Logger](docs/decorators/access-logger.md) | Log format, path templates, custom handlers, GoAccess/AWStats |
| **Decorators** | [MVC Framework](docs/decorators/mvc.md) | Controllers, actions, views, directory conventions, shared state |
| **Utilities** | [Email](docs/utilities/email.md) | `send()`, `valid()`, HTML/text, CC/BCC, address validation |

### Use Cases

Complete, runnable examples. Each one replaces an Express + middleware combo with a single `require('sgapps-server')`.

| Use Case | What It Replaces | What You'll Build |
|---|---|---|
| [Express Migration](docs/use-cases/express-migration.md) | `express` + 6 packages | Side-by-side rewrite with migration cheat sheet |
| [REST API](docs/use-cases/rest-api.md) | `express` + `body-parser` + `cors` | CRUD with validation, CORS, error handling |
| [Auth & Sessions](docs/use-cases/auth-sessions.md) | `express` + `express-session` + `cookie-parser` | Login, logout, role guards, remember me |
| [File Uploads](docs/use-cases/file-uploads.md) | `express` + `multer` | Multipart forms, size limits, type validation |
| [Static Site + API](docs/use-cases/static-site-api.md) | `express` + `serve-static` + `compression` | Frontend + API, SPA fallback, auto-compression |
| [Cluster Deployment](docs/use-cases/cluster-deployment.md) | `express` + `express-session` + `connect-redis` | Multi-worker, shared sessions via IPC |
| [Access Logging](docs/use-cases/access-logging.md) | `express` + `morgan` + `rotating-file-stream` | GoAccess/AWStats, error-only logs, rotation |
| [Template Rendering](docs/use-cases/template-rendering.md) | `express` + `ejs` / `pug` | Dynamic pages, env vars, error templates |
| [MVC Application](docs/use-cases/mvc-application.md) | `express` + custom MVC / `sails.js` | Controllers, actions, views, auto-discovery |
| [Email Notifications](docs/use-cases/email-notifications.md) | `express` + `nodemailer` | Contact forms, welcome emails, CC/BCC |

### Guides

| Guide | What You'll Learn |
|---|---|
| [Building a REST API](docs/guides/building-a-rest-api.md) | Full CRUD API with routing, body parsing, CORS, error handling |
| [Serving Static Files](docs/guides/serving-static-files.md) | Static + API server, SPA fallback, multiple directories |
| [Session Management](docs/guides/session-management.md) | Login/logout flow, auth middleware, role guards, cluster usage |
| [Security Best Practices](docs/guides/security.md) | Cookie hardening, CORS, rate limiting, security headers, input validation |
| [Error Handling](docs/guides/error-handling.md) | Error propagation flow, custom error pages, async error patterns |
| [Production Deployment](docs/guides/production-deployment.md) | Cluster mode, nginx reverse proxy, PM2, systemd, graceful shutdown |
| [Troubleshooting & FAQ](docs/guides/troubleshooting.md) | Common problems, debugging tips, FAQ |

---

## Authors

- [Sergiu Gordienco](https://www.linkedin.com/in/sergiu-gordienco/) &lt; sergiu.gordienco@sgapps.io >

## License

[Apache-2.0](./LICENSE) -- one of the requirements is to include reference to this project

