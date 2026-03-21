# Use Case: MVC Application

Controller/action/view architecture with directory-based auto-discovery, shared state, and template views.

**Express equivalent:** `express` + custom MVC boilerplate or `sails.js` / `adonis.js`

## Complete Example

### Server Setup

```javascript
const { SGAppsServer } = require('sgapps-server');
const MvcDecorator = require('sgapps-server/decorators/nodejs-mvc-bootstrap');

const app = new SGAppsServer({
    decorators: [MvcDecorator]
});

app.whenReady.then(() => {
    app.NodeJsMvc.appPath = './app';

    // Shared data available in all controllers
    app.shared.siteName = 'My MVC App';
    app.shared.users = [
        { id: 1, name: 'Alice', role: 'admin' },
        { id: 2, name: 'Bob', role: 'user' }
    ];

    app.NodeJsMvc.whenReady.then(() => {
        app.server().listen(3000, () => {
            app.logger.log('MVC server running on port 3000');
            app.logger.log('Controllers loaded:', Object.keys(app.NodeJsMvc.controllers));
        });
    });
}, app.logger.error);
```

### Directory Structure

```
project/
├── server.js
└── app/
    ├── home/
    │   ├── config.js
    │   ├── controller/
    │   │   ├── index.js
    │   │   └── about.js
    │   └── views/
    │       ├── index.html
    │       └── about.html
    └── users/
        ├── config.js
        ├── controller/
        │   ├── list.js
        │   └── profile.js
        └── views/
            ├── list.html
            └── profile.html
```

### Controller Config

```javascript
// app/home/config.js
module.exports = {};
```

### Action Files

```javascript
// app/home/controller/index.js
module.exports = {
    public: true,
    capture: function (req, res, server, controller) {
        controller.render(res, 'index', {
            title: 'Home',
            siteName: server.shared.siteName
        });
    }
};
```

```javascript
// app/home/controller/about.js
module.exports = {
    public: true,
    capture: function (req, res, server, controller) {
        controller.render(res, 'about', {
            title: 'About',
            siteName: server.shared.siteName
        });
    }
};
```

```javascript
// app/users/controller/list.js
module.exports = {
    public: true,
    capture: function (req, res, server, controller) {
        controller.render(res, 'list', {
            title: 'Users',
            users: server.shared.users
        });
    }
};
```

```javascript
// app/users/controller/profile.js
module.exports = {
    public: true,
    postData: false,
    capture: function (req, res, server, controller) {
        var userId = parseInt(req.params.id || req.query.id);
        var user = server.shared.users.find(function (u) { return u.id === userId; });

        if (!user) {
            return res.sendError(new Error('User not found'), { statusCode: 404 });
        }

        controller.render(res, 'profile', {
            title: user.name + '\'s Profile',
            user: user
        });
    }
};
```

## Action Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `public` | boolean | `false` | Whether action is publicly accessible |
| `postData` | boolean | `false` | Parse POST body before action executes |
| `maxPostSize` | number | server default | Max POST body size for this action |
| `capture` | function | | Action handler: `(req, res, server, controller, action)` |

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `MvcDecorator` | Optional decorator loaded at construction |
| `app.NodeJsMvc.appPath` | Points to the MVC directory root |
| `app.NodeJsMvc.whenReady` | Promise resolves when controllers are loaded |
| `controller.render()` | Render a view template |
| `server.shared` | Data shared across all controllers |
| Directory conventions | Folder name = controller name, file name = action name |
| `public: true` | Action accessible without additional auth |
| `postData: true` | Parse POST data before running the action |

---

## Related

- [MVC Framework Reference](../decorators/mvc.md) -- full decorator API
- [Template Rendering](../use-cases/template-rendering.md) -- standalone template usage
- [Templates Reference](../middleware/templates.md) -- TemplateManager API
