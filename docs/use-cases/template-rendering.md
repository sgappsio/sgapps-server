# Use Case: Template Rendering

Dynamic HTML pages with named templates, environment variables, and per-request data.

**Express equivalent:** `express` + `ejs` / `pug` / `handlebars`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.whenReady.then(() => {
    // ---------------------
    //  Register templates
    // ---------------------
    app.TemplateManager.addList({
        'home': './views/home.html',
        'about': './views/about.html',
        'user-profile': './views/profile.html',
        'error-404': './views/404.html',
        'error-500': './views/500.html'
    });

    // Set global environment variables (available in all templates)
    app.TemplateManager._env = {
        siteName: 'My Application',
        version: '1.0.0',
        year: new Date().getFullYear(),
        baseUrl: 'http://localhost:3000'
    };

    // ---------------------
    //  Routes
    // ---------------------
    app.get('/', function (req, res) {
        app.TemplateManager.render(res, 'home', {
            title: 'Home',
            visits: req.session.data.visits || 0
        });
        req.session.data.visits = (req.session.data.visits || 0) + 1;
    });

    app.get('/about', function (req, res) {
        app.TemplateManager.render(res, 'about', {
            title: 'About Us'
        });
    });

    app.get('/user/:name', function (req, res) {
        if (!app.TemplateManager.templateExists('user-profile')) {
            return res.sendError(new Error('Template not found'), { statusCode: 500 });
        }
        app.TemplateManager.render(res, 'user-profile', {
            title: req.params.name + '\'s Profile',
            username: req.params.name
        });
    });

    // Dynamic template selection
    app.get('/page/:name', function (req, res) {
        var templateName = req.params.name;
        if (app.TemplateManager.templateExists(templateName)) {
            app.TemplateManager.render(res, templateName, {
                title: templateName
            });
        } else {
            app.TemplateManager.render(res, 'error-404', {
                title: 'Page Not Found',
                requestedPage: req.params.name
            });
        }
    });

    // 404 handler
    app.finalHandler('/*', function (req, res) {
        app.TemplateManager.render(res, 'error-404', {
            title: 'Page Not Found',
            requestedPage: req.urlInfo.pathname
        });
    });

    app.server().listen(3000, () => {
        app.logger.log('Template server running on port 3000');
    });
}, app.logger.error);
```

## Directory Structure

```
project/
├── server.js
└── views/
    ├── home.html
    ├── about.html
    ├── profile.html
    ├── 404.html
    └── 500.html
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `app.TemplateManager.addList()` | Bulk template registration |
| `app.TemplateManager.render()` | Render template with variables |
| `app.TemplateManager._env` | Global variables shared across all templates |
| `app.TemplateManager.templateExists()` | Check before rendering |
| `app.finalHandler()` | Custom 404 page |
| Per-request variables | `{ title, username }` passed to individual renders |
| Dynamic template names | Template selected from URL parameter |

---

## Related

- [Templates Reference](../middleware/templates.md) -- full TemplateManager API
- [MVC Application](../use-cases/mvc-application.md) -- templates within MVC structure
