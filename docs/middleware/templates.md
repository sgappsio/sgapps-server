# Template Management

File-based template registration, rendering, and environment variable injection.

## Overview

The `response-template` decorator adds a `TemplateManager` to the server. Templates are registered by name with a file path, then rendered to responses with optional variables. The template viewer reads files from disk and injects environment variables and per-render variables.

## Advantages

- **Named templates** -- register templates by name, render by name
- **File-based** -- templates are read from disk at render time
- **Environment variables** -- global `_env` object shared across all templates
- **Per-render variables** -- pass custom variables for each render call
- **Bulk registration** -- `addList()` registers multiple templates at once
- **Existence checks** -- `templateExists()` before rendering

## Getting Started

```js
const app = new SGAppsServer();

app.whenReady.then(() => {
    // Register templates
    app.TemplateManager.add('home', './views/home.html');
    app.TemplateManager.add('about', './views/about.html');

    // Set global environment variables
    app.TemplateManager._env = { siteName: 'My App', year: 2024 };

    app.get('/', function (req, res) {
        app.TemplateManager.render(res, 'home', {
            title: 'Welcome',
            user: req.session.data.user || null
        });
    });

    app.server().listen(8080);
});
```

## API Reference

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `_templates` | object | Registered templates (`{ name, path }`) |
| `_viewer` | TemplateManagerViewer | Template rendering engine |
| `_env` | object | Global environment variables (merged on set) |

### `add(templateName, filePath)`

Register a single template.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |
| `filePath` | string | Path to the template file |

```js
app.TemplateManager.add('error-404', './views/errors/404.html');
```

### `addList(templates)`

Register multiple templates at once.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templates` | object | `{ name: filePath, ... }` |

```js
app.TemplateManager.addList({
    'home': './views/home.html',
    'about': './views/about.html',
    'contact': './views/contact.html',
    'error-404': './views/errors/404.html',
    'error-500': './views/errors/500.html'
});
```

### `get(templateName)`

Retrieve a template's metadata.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

Returns `{ name, path }` or `null`.

### `templateExists(templateName)`

Check if a template is registered.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

Returns `boolean`.

### `remove(templateName)`

Unregister a template.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

### `render(response, templateName, [vars])`

Render a template and send it as the response.

| Parameter | Type | Description |
|-----------|------|-------------|
| `response` | SGAppsServerResponse | Response to write to |
| `templateName` | string | Template identifier |
| `vars` | object | Per-render variables |

If the template doesn't exist, sends a 404 error.

```js
app.TemplateManager.render(res, 'home', {
    title: 'Home Page',
    items: ['one', 'two', 'three']
});
```

---

## Code Examples

### Example 1: Error Pages

```js
app.whenReady.then(() => {
    app.TemplateManager.addList({
        'error-404': './views/404.html',
        'error-500': './views/500.html'
    });

    app.finalHandler('/*', function (req, res) {
        app.TemplateManager.render(res, 'error-404', {
            url: req.urlInfo.pathname
        });
    });
});
```

### Example 2: Environment Variables

```js
app.TemplateManager._env = {
    siteName: 'My Application',
    version: '1.0.0',
    year: new Date().getFullYear()
};

// All templates can access siteName, version, year
```

### Example 3: Conditional Template Rendering

```js
app.get('/page/:name', function (req, res) {
    var templateName = 'page-' + req.params.name;

    if (app.TemplateManager.templateExists(templateName)) {
        app.TemplateManager.render(res, templateName, {
            pageName: req.params.name
        });
    } else {
        res.sendError(new Error('Page not found'), { statusCode: 404 });
    }
});
```

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- `TemplateManager` property
- [MVC Framework](../decorators/mvc.md) -- uses templates for view rendering
