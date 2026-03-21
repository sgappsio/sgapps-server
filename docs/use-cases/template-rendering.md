# Use Case: Template Rendering

Dynamic HTML pages using the FaceboxTemplate engine with layouts, partials, expressions, and environment variables.

**Express equivalent:** `express` + `ejs` / `pug` / `handlebars`

## Complete Example

### Directory Structure

```
project/
├── server.js
└── views/
    ├── layout.fbx-tpl
    ├── home.fbx-tpl
    ├── about.fbx-tpl
    ├── users.fbx-tpl
    ├── error-404.fbx-tpl
    ├── partials/
    │   ├── nav.fbx-tpl
    │   └── footer.fbx-tpl
    └── static/
        └── help.html
```

### Layout Template

**views/layout.fbx-tpl:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>{{ vars.title }} - {{ env.vars.siteName }}</title>
    {css-style}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, sans-serif; color: #333; }
    .container { max-width: 960px; margin: 0 auto; padding: 2rem; }
    .header { background: #1a1a2e; color: #fff; padding: 1rem 2rem; }
    .header a { color: #a0aec0; text-decoration: none; margin-right: 1rem; }
    .header a:hover { color: #fff; }
    .footer { margin-top: 3rem; padding: 1rem 2rem; color: #888; font-size: 0.85em; border-top: 1px solid #eee; }
    {/css-style}
</head>
<body>
    {{render:.:partials/nav.fbx-tpl}}
    <div class="container">
        {{ vars.content }}
    </div>
    {{render:.:partials/footer.fbx-tpl}}
</body>
</html>
```

### Partials

**views/partials/nav.fbx-tpl:**
```html
<div class="header">
    <strong>{{ env.vars.siteName }}</strong>
    &nbsp;&nbsp;
    <a href="/">Home</a>
    <a href="/about">About</a>
    <a href="/users">Users</a>
    <a href="/help">Help</a>
</div>
```

**views/partials/footer.fbx-tpl:**
```html
<div class="footer">
    &copy; {{ env.vars.year }} {{ env.vars.siteName }} v{{ env.vars.version }}
    &middot; Rendered by SGApps Server
</div>
```

### Page Templates

**views/home.fbx-tpl:**
```html
{eval}
var greeting = vars.user ? ('Welcome back, ' + vars.user.name + '!') : 'Welcome, Guest!';
vars.content = '<h1>' + greeting + '</h1>' +
    '<p>This page has been visited <strong>' + vars.visits + '</strong> times.</p>' +
    '<p>Server time: ' + new Date().toLocaleString() + '</p>';
{/eval}
{{render:.:layout.fbx-tpl}}
```

**views/about.fbx-tpl:**
```html
{eval}
vars.content = '<h1>About</h1>' +
    '<p>' + env.vars.siteName + ' is built with SGApps Server.</p>' +
    '<ul>' +
    '<li>Version: ' + env.vars.version + '</li>' +
    '<li>Node.js: ' + process.version + '</li>' +
    '<li>Platform: ' + process.platform + '</li>' +
    '</ul>';
{/eval}
{{render:.:layout.fbx-tpl}}
```

**views/users.fbx-tpl:**
```html
{eval}
var rows = vars.users.map(function (user) {
    return '<tr><td>' + user.id + '</td><td>' + user.name + '</td><td>' + user.role + '</td></tr>';
}).join('\n');

vars.content = '<h1>Users (' + vars.users.length + ')</h1>' +
    '<table style="width:100%;border-collapse:collapse;">' +
    '<tr style="background:#f6f8fa;"><th>ID</th><th>Name</th><th>Role</th></tr>' +
    rows +
    '</table>';
{/eval}
{{render:.:layout.fbx-tpl}}
```

**views/error-404.fbx-tpl:**
```html
{eval}
vars.content = '<h1>404 - Page Not Found</h1>' +
    '<p>The page <code>' + vars.requestedPath + '</code> does not exist.</p>' +
    '<p><a href="/">Go to Home</a></p>';
{/eval}
{{render:.:layout.fbx-tpl}}
```

### Server Code

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

var users = [
    { id: 1, name: 'Alice', role: 'admin' },
    { id: 2, name: 'Bob', role: 'editor' },
    { id: 3, name: 'Charlie', role: 'viewer' }
];

app.whenReady.then(() => {
    // Enable debug mode (disable file caching during development)
    app.TemplateManager._viewer._debug = true;

    // Global environment variables -- available in all templates as env.vars
    app.TemplateManager._env = {
        siteName: 'My Application',
        version: '1.0.0',
        year: new Date().getFullYear()
    };

    // Register all templates
    app.TemplateManager.addList({
        'home':      './views/home.fbx-tpl',
        'about':     './views/about.fbx-tpl',
        'users':     './views/users.fbx-tpl',
        'error-404': './views/error-404.fbx-tpl',
        'help':      './views/static/help.html'   // served as raw HTML
    });

    // ---------------------
    //  Routes
    // ---------------------
    app.get('/', function (req, res) {
        req.session.data.visits = (req.session.data.visits || 0) + 1;
        app.TemplateManager.render(res, 'home', {
            title: 'Home',
            user: req.session.data.user || null,
            visits: req.session.data.visits
        });
    });

    app.get('/about', function (req, res) {
        app.TemplateManager.render(res, 'about', { title: 'About' });
    });

    app.get('/users', function (req, res) {
        app.TemplateManager.render(res, 'users', {
            title: 'Users',
            users: users
        });
    });

    // Static HTML (no FaceboxTemplate processing -- just pipeFile)
    app.get('/help', function (req, res) {
        app.TemplateManager.render(res, 'help', {});
    });

    // Dynamic template selection by URL
    app.get('/page/:name', function (req, res) {
        var templateName = req.params.name;
        if (app.TemplateManager.templateExists(templateName)) {
            app.TemplateManager.render(res, templateName, {
                title: req.params.name
            });
        } else {
            app.TemplateManager.render(res, 'error-404', {
                title: '404',
                requestedPath: req.urlInfo.pathname
            });
        }
    });

    // 404 fallback
    app.finalHandler('/*', function (req, res) {
        app.TemplateManager.render(res, 'error-404', {
            title: '404',
            requestedPath: req.urlInfo.pathname
        });
    });

    app.server().listen(3000, () => {
        app.logger.log('Template server running on port 3000');
    });
}, app.logger.error);
```

## FaceboxTemplate Syntax Quick Reference

| Syntax | Purpose | Example |
|---|---|---|
| `{{ expression }}` | Output a JS expression | `{{ vars.title }}` |
| `{{ env.vars.key }}` | Output an environment variable | `{{ env.vars.siteName }}` |
| `{{include:.:file}}` | Include raw file content | `{{include:.:partials/header.html}}` |
| `{{render:.:file}}` | Include and process as template | `{{render:.:layout.fbx-tpl}}` |
| `{{read:.:file}}` | Read file as string | `{{read:.:data/config.json}}` |
| `{{read-base64:.:file}}` | Read file as base64 | `{{read-base64:.:img/logo.png}}` |
| `{eval}...{/eval}` | Execute JS (no output) | `{eval}vars.x = 1;{/eval}` |
| `{code}...{/code}` | Raw output (no processing) | `{code}{{ not processed }}{/code}` |
| `{js-script}...{/js-script}` | Wrap in `<script>` tags | Client-side JavaScript |
| `{css-style}...{/css-style}` | Wrap in `<style>` tags | Inline CSS |

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `app.TemplateManager.addList()` | Bulk template registration |
| `app.TemplateManager.render()` | Render template with variables |
| `app.TemplateManager._env` | Global environment variables |
| `app.TemplateManager._viewer._debug` | Disable file caching for development |
| `app.TemplateManager.templateExists()` | Check before rendering |
| `{{render:...}}` | Layout composition with recursive rendering |
| `{eval}...{/eval}` | Prepare data before rendering |
| `{css-style}...{/css-style}` | Inline CSS blocks |
| `{{ vars.x }}` | Per-render variable output |
| `{{ env.vars.x }}` | Global environment variable output |
| `.fbx-tpl` vs `.html` | Engine-processed vs raw file serving |
| `app.finalHandler()` | 404 error page with template |

---

## Related

- [Templates Reference](../middleware/templates.md) -- full API for TemplateManager, Viewer, and FaceboxTemplate engine
- [MVC Application](../use-cases/mvc-application.md) -- templates within MVC structure
