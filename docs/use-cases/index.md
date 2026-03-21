# Use Cases

Complete, production-ready examples that show how SGApps Server replaces Express.js + multiple middleware packages with a single dependency.

Every use case below is a self-contained, runnable Node.js application. Copy any of them into a file, run `npm install sgapps-server`, and start it with `node`.

## Overview

| Use Case | What It Demonstrates | Express Equivalent |
|---|---|---|
| [Express Migration](../use-cases/express-migration.md) | Side-by-side rewrite from Express to SGApps | express + 6 middleware packages |
| [REST API](../use-cases/rest-api.md) | Full CRUD with validation, CORS, error handling | express + body-parser + cors |
| [Authentication & Sessions](../use-cases/auth-sessions.md) | Login, logout, role guards, remember me | express + express-session + cookie-parser |
| [File Uploads](../use-cases/file-uploads.md) | Multipart form handling, size limits, streaming | express + multer |
| [Static Site + API](../use-cases/static-site-api.md) | Frontend + backend, SPA fallback, multiple dirs | express + serve-static + compression |
| [Cluster Deployment](../use-cases/cluster-deployment.md) | Multi-worker with shared sessions, zero-downtime | express + express-session + connect-redis |
| [Access Logging & Monitoring](../use-cases/access-logging.md) | GoAccess/AWStats, error-only logs, custom filters | express + morgan + rotating-file-stream |
| [Template Rendering](../use-cases/template-rendering.md) | Dynamic HTML pages with layouts and environment vars | express + ejs/pug/handlebars |
| [MVC Application](../use-cases/mvc-application.md) | Controller/action/view structure with auto-discovery | express + custom MVC boilerplate |
| [Email Notifications](../use-cases/email-notifications.md) | Send transactional email from route handlers | express + nodemailer |
