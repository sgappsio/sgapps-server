# MVC Framework

An optional decorator that provides a controller/action/view architecture with automatic directory-based discovery, shared state, and template rendering.

## Overview

The `nodejs-mvc-bootstrap` decorator adds MVC support to SGApps Server. It scans an application directory for controller folders, loads their actions and views, and routes requests through the controller/action pattern. Views use the server's TemplateManager for rendering.

## Advantages

- **Convention over configuration** -- directory structure defines routes
- **Auto-discovery** -- controllers loaded from filesystem structure
- **Shared state** -- data shared between controllers and handlers
- **View rendering** -- integrated with TemplateManager
- **Action configuration** -- public/protected, POST data requirements, custom max POST size
- **Async ready** -- `whenReady` promise resolves when all controllers are loaded

## Getting Started

```js
const { SGAppsServer } = require('sgapps-server');
const MvcDecorator = require('sgapps-server/decorators/nodejs-mvc-bootstrap');

const app = new SGAppsServer({
    decorators: [MvcDecorator]
});

app.whenReady.then(() => {
    app.NodeJsMvc.appPath = './app';

    app.NodeJsMvc.whenReady.then(() => {
        app.server().listen(8080, () => {
            app.logger.log('MVC server running');
        });
    });
});
```

## Directory Structure

```
app/
├── home/
│   ├── config.js
│   ├── controller/
│   │   ├── index.js
│   │   └── about.js
│   └── views/
│       ├── index.html
│       └── about.html
├── users/
│   ├── config.js
│   ├── controller/
│   │   ├── list.js
│   │   └── profile.js
│   └── views/
│       ├── list.html
│       └── profile.html
```

## Server Properties

| Property | Type | Description |
|----------|------|-------------|
| `NodeJsMvc` | object | MVC container |
| `NodeJsMvc.appPath` | string | Path to the MVC application directory |
| `NodeJsMvc.controllers` | object | Loaded controller instances |
| `NodeJsMvc.whenReady` | Promise | Resolves when all controllers are loaded |

## Controller API

Each controller has these methods:

| Method | Description |
|--------|-------------|
| `addAction(name, options)` | Register an action |
| `removeAction(name)` | Unregister an action |
| `getAction(name)` | Get action configuration |
| `actionExists(name)` | Check if action exists |
| `addView(view)` | Register a view template |
| `removeView(name)` | Unregister a view |
| `getView(name)` | Get view configuration |
| `viewExists(name)` | Check if view exists |
| `render(response, viewName, options)` | Render a view |

### Controller Properties

| Property | Type | Description |
|----------|------|-------------|
| `name` | string | Controller name (from directory) |
| `_actions` | object | Registered actions |
| `_views` | object | Registered views |
| `viewer` | TemplateManagerViewer | Template renderer |
| `shared` | object | Shared data (same as `server.shared`) |

## Action Configuration

```js
controller.addAction('profile', {
    public: true,                        // accessible without auth
    postData: false,                     // don't require POST parsing
    maxPostSize: 1024 * 1024,            // 1MB max for this action
    capture: function (req, res, server, controller, action) {
        controller.render(res, 'profile', {
            user: req.session.data.user
        });
    }
});
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `public` | boolean | `false` | Whether action is publicly accessible |
| `postData` | boolean | `false` | Parse POST data before action |
| `maxPostSize` | number | server default | Max POST size for this action |
| `capture` | function | | Action handler function |

### Action Handler Signature

```js
function capture(request, response, server, controller, action) {
    // request: SGAppsServerRequest
    // response: SGAppsServerResponse
    // server: SGAppsServer
    // controller: Controller instance
    // action: Action configuration object
}
```

---

## Code Examples

### Example 1: Action File

```js
// app/users/controller/list.js
module.exports = {
    public: true,
    capture: function (req, res, server, controller) {
        var users = server.shared.users || [];
        controller.render(res, 'list', {
            users: users,
            title: 'User List'
        });
    }
};
```

### Example 2: Controller Config

```js
// app/users/config.js
module.exports = {
    // Optional: custom initialization
    init: function (controller, server) {
        server.shared.users = [];
    }
};
```

### Example 3: View Template

```html
<!-- app/users/views/list.html -->
<html>
<body>
    <h1>Users</h1>
    <ul>
        <!-- Template rendering depends on the template viewer -->
    </ul>
</body>
</html>
```

---

## Related Modules

- [Templates](../middleware/templates.md) -- template rendering engine
- [SGAppsServer](../core/sgapps-server.md) -- server instance
- [Middleware Overview](../middleware/index.md) -- optional decorator usage
