# Template Management

File-based template registration, rendering, and a built-in template engine (FaceboxTemplate) with expressions, includes, code blocks, and environment variables.

## Overview

The `response-template` decorator adds a `TemplateManager` to the server. It manages a registry of named templates (name-to-file-path mappings) and renders them through a three-layer architecture:

```
TemplateManager          (registry: add, remove, get, render)
    |
    v
TemplateManagerViewer    (routing: .tpl/.fbx-tpl -> FaceboxTemplate, other -> pipeFile)
    |
    v
FaceboxTemplate          (engine: expressions, includes, code blocks, file caching)
```

Templates with `.tpl` or `.fbx-tpl` extensions are processed through the **FaceboxTemplate engine**, which supports expressions, includes, sub-rendering, JavaScript code execution, and file reads. All other file types (`.html`, `.htm`, etc.) are served as-is via `pipeFile()`.

## Advantages

- **Named templates** -- register templates by name, render by name
- **Two rendering modes** -- FaceboxTemplate engine for `.tpl`/`.fbx-tpl`, raw file serving for everything else
- **Expression syntax** -- `{{ }}` expressions with full JavaScript access to `vars` and `env`
- **Template includes** -- `{{include:path}}` for static includes, `{{render:path}}` for recursive rendering
- **Code blocks** -- `{code}`, `{eval}`, `{js-script}`, `{css-style}` blocks
- **File reads** -- `{{read:path}}`, `{{read-base64:path}}`, `{{read-hex:path}}`
- **Environment variables** -- global `_env` object shared across all templates
- **File caching** -- template files are cached in memory (disabled in debug mode)
- **Nested rendering** -- includes can be nested up to `INCLUDE_LEVEL` deep (default: 10)

## Getting Started

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.whenReady.then(() => {
    // Register templates
    app.TemplateManager.add('home', './views/home.fbx-tpl');
    app.TemplateManager.add('about', './views/about.fbx-tpl');
    app.TemplateManager.add('static-page', './views/static.html');

    // Set global environment variables (available in all templates)
    app.TemplateManager._env = {
        siteName: 'My App',
        version: '1.0.0',
        year: new Date().getFullYear()
    };

    app.get('/', function (req, res) {
        app.TemplateManager.render(res, 'home', {
            title: 'Welcome',
            user: req.session.data.user || null
        });
    });

    app.server().listen(8080);
});
```

---

## Architecture

### TemplateManager

The top-level registry. Manages name-to-path mappings and delegates rendering to the viewer.

**Initialized by:** the `response-template` decorator during server startup.

**Accessible as:** `app.TemplateManager`

### TemplateManagerViewer

The routing layer. Decides how to render based on file extension:

| File Extension | Rendering Method |
|---|---|
| `.tpl`, `.fbx-tpl` | **FaceboxTemplate engine** -- expressions, includes, code blocks |
| All others (`.html`, `.htm`, etc.) | **`pipeFile()`** -- served raw as-is, no processing |

If a template has a `code` property (pre-loaded content), it renders from memory via `renderCode()`. Otherwise it reads from disk via `renderFile()`.

### FaceboxTemplate

The template engine. Processes template syntax by:

1. Extracting `{{read:...}}` directives (deferred)
2. Processing `{{include:...}}` directives (static file include, no rendering)
3. Processing `{{render:...}}` directives (include + recursive rendering)
4. Extracting `<script type="text/facebox-template">` blocks
5. Extracting `{code}...{/code}`, `{eval}...{/eval}`, `{js-script}...{/js-script}`, `{css-style}...{/css-style}` blocks
6. Extracting `{{ expression }}` expressions
7. Evaluating all extracted blocks and expressions

---

## TemplateManager API

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `_templates` | object | Registered templates: `{ [name]: { name, path, code? } }` |
| `_viewer` | TemplateManagerViewer | The rendering engine instance |
| `_env` | object | Global environment variables (merged on assignment, not replaced) |
| `_options` | object | Configuration (contains `_fs` reference) |

### `_env` (Environment Variables)

Setting `_env` **merges** into the existing environment -- it does not replace it:

```js
app.TemplateManager._env = { siteName: 'App' };
app.TemplateManager._env = { version: '2.0' };
// _env is now { siteName: 'App', version: '2.0' }
```

Environment variables are accessible in templates as `env.vars`:

```html
<!-- In a .fbx-tpl template -->
<title>{{ env.vars.siteName }} - {{ vars.title }}</title>
```

### `add(templateName, filePath)`

Register a single template.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Unique template identifier |
| `filePath` | string | Path to the template file on disk |

```js
app.TemplateManager.add('home', './views/home.fbx-tpl');
app.TemplateManager.add('layout', './views/layout.fbx-tpl');
app.TemplateManager.add('static-help', './views/help.html');
```

### `addList(templates)`

Register multiple templates at once.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templates` | object | `{ name: filePath, ... }` mapping |

```js
app.TemplateManager.addList({
    'home':      './views/home.fbx-tpl',
    'about':     './views/about.fbx-tpl',
    'layout':    './views/layout.fbx-tpl',
    'error-404': './views/errors/404.fbx-tpl',
    'error-500': './views/errors/500.fbx-tpl'
});
```

### `get(templateName)`

Retrieve a template's metadata.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

Returns `{ name: string, path: string, code?: string }` or `null` if not found.

```js
var tpl = app.TemplateManager.get('home');
// { name: 'home', path: './views/home.fbx-tpl' }
```

### `templateExists(templateName)`

Check if a template is registered.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

Returns `boolean`.

```js
if (app.TemplateManager.templateExists('user-profile')) {
    app.TemplateManager.render(res, 'user-profile', { user: userData });
} else {
    res.sendError(new Error('Template not found'), { statusCode: 500 });
}
```

### `remove(templateName)`

Unregister a template. No-op if the template doesn't exist.

| Parameter | Type | Description |
|-----------|------|-------------|
| `templateName` | string | Template identifier |

```js
app.TemplateManager.remove('deprecated-page');
```

### `render(response, templateName, [vars])`

Render a template and send it as the HTTP response.

| Parameter | Type | Description |
|-----------|------|-------------|
| `response` | SGAppsServerResponse | Response to write to |
| `templateName` | string | Template identifier |
| `vars` | object | Per-render variables (accessible as `vars` in templates) |

If the template doesn't exist, sends a **404 error** with the message "Page Template not found".

```js
app.TemplateManager.render(res, 'home', {
    title: 'Home Page',
    items: ['one', 'two', 'three'],
    user: req.session.data.user
});
```

---

## TemplateManagerViewer API

The viewer is accessible as `app.TemplateManager._viewer`. You typically don't interact with it directly, but it's useful for advanced use cases.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `_facebox` | FaceboxTemplate | The underlying template engine |
| `_debug` | boolean | Debug mode (disables file caching when `true`) |
| `_env` | object | Environment variables (synced from TemplateManager) |

### `renderCode(code, vars, virtualFilePath, callback)`

Render a template from a code string instead of a file.

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Template source code |
| `vars` | object | Template variables |
| `virtualFilePath` | string | Virtual file path (used for relative includes) |
| `callback` | function | `(err, html)` callback |

```js
app.TemplateManager._viewer.renderCode(
    '<h1>{{ vars.title }}</h1><p>{{ vars.message }}</p>',
    { title: 'Hello', message: 'World' },
    './views/virtual.fbx-tpl',
    function (err, html) {
        res.send(html);
    }
);
```

### `render(response, view, vars)`

Render a view object (template metadata) to a response. This is what `TemplateManager.render()` calls internally.

| Parameter | Type | Description |
|-----------|------|-------------|
| `response` | SGAppsServerResponse | Response to write to |
| `view` | object | `{ name, path, code? }` template metadata |
| `vars` | object | Template variables |

**Rendering logic:**
- If `path` ends with `.tpl` or `.fbx-tpl`:
  - If `view.code` exists: renders from the code string
  - Otherwise: reads file from disk and renders
- If `path` has any other extension: serves the file raw via `pipeFile()`

---

## FaceboxTemplate Engine

The FaceboxTemplate engine is the core rendering system for `.tpl` and `.fbx-tpl` files. It processes template syntax and produces HTML output.

### Template Context

Inside a template, two objects are available:

| Variable | Description |
|----------|-------------|
| `vars` | Per-render variables passed to `render()` |
| `env` | Environment object with `env.vars` (global env), `env.path`, `env.dirname`, `env.render()`, `env.renderFile()` |

The `env` object structure:

| Property | Type | Description |
|----------|------|-------------|
| `env.vars` | object | Global environment variables (`TemplateManager._env`) |
| `env.path` | string | Current template file path |
| `env.dirname` | string | Directory of the current template |
| `env.render` | function | `render(text, vars, env)` -- render a string as template |
| `env.renderFile` | function | `renderFile(filePath, vars, callback)` -- render a file |
| `env.error` | array | Error collection |

### Expression Syntax

#### `{{ expression }}` -- Output Expression

Evaluates a JavaScript expression and outputs the result. Has access to `vars` and `env`.

```html
<h1>{{ vars.title }}</h1>
<p>Welcome, {{ vars.user ? vars.user.name : 'Guest' }}</p>
<footer>{{ env.vars.siteName }} &copy; {{ env.vars.year }}</footer>
<p>{{ vars.items.length }} items</p>
<p>{{ new Date().toISOString() }}</p>
```

If the expression returns `undefined`, an empty string is output.

#### `{{include:path}}` -- Static Include

Includes the raw content of a file without processing it through the template engine. The file is read from disk and inserted as-is.

```html
{{include:.:header.html}}
{{include:.:partials/nav.html}}
```

**Path resolution:**
- Paths starting with `.:` are relative to the current template's directory
- Other paths are evaluated as JavaScript expressions with access to `vars` and `env`

#### `{{render:path}}` -- Rendered Include

Includes a file and **processes it through the template engine** recursively. The included file has access to the same `vars` and its own `env` context.

```html
{{render:.:layout/header.fbx-tpl}}
<main>{{ vars.content }}</main>
{{render:.:layout/footer.fbx-tpl}}
```

Nesting is limited by `INCLUDE_LEVEL` (default: 10) to prevent infinite recursion.

#### `{{read:path}}` -- File Read

Reads a file and outputs its content as a string.

```html
<pre>{{ "{{" }}read:.:data/config.json{{ "}}" }}</pre>
```

#### `{{read-base64:path}}` -- Base64 File Read

Reads a file and outputs its content as base64-encoded.

```html
<img src="data:image/png;base64,{{read-base64:.:images/logo.png}}" />
```

#### `{{read-hex:path}}` -- Hex File Read

Reads a file and outputs its content as hexadecimal.

```html
<span class="hash">{{read-hex:.:checksums/file.sha}}</span>
```

### Block Syntax

#### `{code}...{/code}` -- Raw Code Block

Outputs the content as-is, without processing. Useful for embedding template syntax examples.

```html
{code}
This {{ will not be processed }} as an expression.
{/code}
```

#### `{eval}...{/eval}` -- Execute Block

Executes JavaScript code without outputting anything. Useful for setup, loops that build state, etc.

```html
{eval}
vars.formattedDate = new Date(vars.createdAt).toLocaleDateString();
vars.isAdmin = vars.user && vars.user.role === 'admin';
{/eval}

<p>Created: {{ vars.formattedDate }}</p>
```

#### `{js-script}...{/js-script}` -- Client-Side Script Block

Wraps content in `<script type="text/javascript">` tags. The content is **not** evaluated server-side.

```html
{js-script}
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded');
});
{/js-script}
```

Outputs:
```html
<script type="text/javascript" charset="utf-8">
document.addEventListener('DOMContentLoaded', function () {
    console.log('Page loaded');
});
</script>
```

#### `{css-style}...{/css-style}` -- Style Block

Wraps content in `<style type="text/css">` tags. The content is **not** evaluated server-side.

```html
{css-style}
body { font-family: sans-serif; color: #333; }
.header { background: {{ vars.themeColor || '#4a6cf7' }}; }
{/css-style}
```

**Note:** CSS content is wrapped first, then `{{ }}` expressions inside are evaluated.

#### `<script type="text/facebox-template">` -- Template Script Block

An alternative syntax for JavaScript return blocks. Behaves like `{js-return}`:

```html
<script type="text/facebox-template">
return vars.items.map(function (item) {
    return '<li>' + item.name + '</li>';
}).join('\n');
</script>
```

### Path Resolution

Template paths in directives (`include`, `render`, `read`) are resolved as follows:

| Syntax | Resolution |
|---|---|
| `.:filename.html` | Relative to current template's directory: `env.dirname + filename.html` |
| JavaScript expression | Evaluated with access to `vars` and `env`, must return a string path |

```html
<!-- Relative path -->
{{include:.:partials/header.html}}

<!-- Expression path -->
{{include:env.dirname + 'partials/' + vars.headerFile}}

<!-- Computed path -->
{{render:vars.templateBasePath + '/layout.fbx-tpl'}}
```

### File Caching

The FaceboxTemplate engine caches file contents in memory:

| Mode | Behavior |
|---|---|
| **Production** (`_debug = false`) | Files are cached after first read. Changes require server restart. |
| **Debug** (`_debug = true`) | Files are read from disk on every render. |

```js
// Enable debug mode (disable caching)
app.TemplateManager._viewer._debug = true;

// Clear the file cache manually
app.TemplateManager._viewer._facebox._cachedFiles = {};
```

### `INCLUDE_LEVEL`

Maximum nesting depth for `{{render:...}}` directives. Default: `10`.

```js
// Increase nesting limit
app.TemplateManager._viewer._facebox.INCLUDE_LEVEL = 20;
```

---

## FaceboxTemplate API

The engine is accessible as `app.TemplateManager._viewer._facebox`. Advanced use cases may call it directly.

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `_debug` | boolean | `false` | Debug mode (disables file caching) |
| `_env` | object | `{}` | Environment variables (synced from TemplateManager) |
| `_cachedFiles` | object | `{}` | In-memory file cache (`{ [path]: content }`) |
| `INCLUDE_LEVEL` | number | `10` | Maximum nesting depth for includes |

### `render(text, vars, env)`

Render a template string synchronously.

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | string | Template source code |
| `vars` | object | Template variables |
| `env` | object | Environment object (`{ vars, path, dirname, render, renderFile }`) |

Returns `string` -- the rendered HTML.

### `renderFile(filePath, vars, callback)`

Read a file from disk and render it.

| Parameter | Type | Description |
|-----------|------|-------------|
| `filePath` | string | Absolute or relative path to the template file |
| `vars` | object | Template variables |
| `callback` | function | `(err, html)` callback |

### `renderCode(code, vars, callback, virtualFilePath)`

Render a code string with a virtual file path context.

| Parameter | Type | Description |
|-----------|------|-------------|
| `code` | string | Template source code |
| `vars` | object | Template variables |
| `callback` | function | `(err, html)` callback |
| `virtualFilePath` | string | Virtual path (used for relative path resolution in includes) |

---

## Complete Example

### Template Files

**views/layout.fbx-tpl:**
```html
<!DOCTYPE html>
<html>
<head>
    <title>{{ vars.title }} - {{ env.vars.siteName }}</title>
    {css-style}
    body { font-family: sans-serif; margin: 2rem; }
    nav { background: #f0f2f5; padding: 1rem; margin-bottom: 2rem; }
    footer { margin-top: 2rem; color: #888; font-size: 0.9em; }
    {/css-style}
</head>
<body>
    {{render:.:partials/nav.fbx-tpl}}
    <main>
        {{ vars.content }}
    </main>
    <footer>&copy; {{ env.vars.year }} {{ env.vars.siteName }} v{{ env.vars.version }}</footer>
</body>
</html>
```

**views/partials/nav.fbx-tpl:**
```html
<nav>
    <a href="/">Home</a> |
    <a href="/about">About</a> |
    <a href="/users">Users</a>
    {eval}
    vars.navRendered = true;
    {/eval}
</nav>
```

**views/home.fbx-tpl:**
```html
{eval}
vars.content = '<h1>Welcome</h1><p>Hello, ' + (vars.user ? vars.user.name : 'Guest') + '!</p>';
{/eval}
{{render:.:layout.fbx-tpl}}
```

**views/users.fbx-tpl:**
```html
{eval}
var html = '<h1>Users</h1><ul>';
vars.users.forEach(function (user) {
    html += '<li>' + user.name + ' (' + user.role + ')</li>';
});
html += '</ul>';
vars.content = html;
{/eval}
{{render:.:layout.fbx-tpl}}
```

### Server Code

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.whenReady.then(() => {
    app.TemplateManager._env = {
        siteName: 'My App',
        version: '1.0.0',
        year: new Date().getFullYear()
    };

    app.TemplateManager.addList({
        'home':  './views/home.fbx-tpl',
        'users': './views/users.fbx-tpl'
    });

    app.get('/', function (req, res) {
        app.TemplateManager.render(res, 'home', {
            title: 'Home',
            user: req.session.data.user || null
        });
    });

    app.get('/users', function (req, res) {
        app.TemplateManager.render(res, 'users', {
            title: 'Users',
            users: [
                { name: 'Alice', role: 'admin' },
                { name: 'Bob', role: 'user' }
            ]
        });
    });

    app.server().listen(8080, () => {
        app.logger.log('Template server running on port 8080');
    });
}, app.logger.error);
```

---

## Rendering Flow Diagram

```
TemplateManager.render(res, 'home', { title: 'Home' })
    |
    +-- Lookup 'home' in _templates
    |   -> { name: 'home', path: './views/home.fbx-tpl' }
    |
    +-- Viewer.render(res, view, vars)
    |   -> path ends with .fbx-tpl? Yes -> FaceboxTemplate
    |
    +-- FaceboxTemplate.renderFile('./views/home.fbx-tpl', vars, callback)
    |   -> Read file (cached or from disk)
    |   -> FaceboxTemplate.render(fileContent, vars, env)
    |       |
    |       +-- Process {{include:...}} directives
    |       +-- Process {{render:...}} directives (recursive)
    |       +-- Extract {code}, {eval}, {js-script}, {css-style} blocks
    |       +-- Extract {{ expression }} expressions
    |       +-- Evaluate all blocks and expressions
    |       +-- Return rendered HTML string
    |
    +-- response.send(html)
```

---

## Tips

- **Use `.fbx-tpl` extension** for templates that need the engine. Use `.html` for static files.
- **Use `{eval}` blocks** to prepare complex data before the main template renders.
- **Use `{{render:...}}`** for layouts and partials that also need template processing.
- **Use `{{include:...}}`** for raw file includes (CSS snippets, HTML fragments) that don't need processing.
- **Enable debug mode** during development to disable file caching: `app.TemplateManager._viewer._debug = true`
- **Clear cache** if you update templates in production without restarting: `app.TemplateManager._viewer._facebox._cachedFiles = {}`

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- `TemplateManager` property
- [MVC Framework](../decorators/mvc.md) -- uses templates for controller views
- [Template Rendering Use Case](../use-cases/template-rendering.md) -- runnable example
