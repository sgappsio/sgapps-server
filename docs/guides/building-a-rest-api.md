# Guide: Building a REST API

A step-by-step guide to building a JSON REST API with SGApps Server, covering routing, POST data handling, error responses, and middleware.

## Setup

```bash
mkdir my-api && cd my-api
npm init -y
npm install sgapps-server
```

## Step 1: Basic Server

```js
// server.js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

app.server().listen(3000, () => {
    app.logger.log('API running on port 3000');
});
```

## Step 2: Add Middleware

```js
// JSON content-type header for all responses
app.use(function (req, res, next) {
    res.response.setHeader('Content-Type', 'application/json');
    next();
});

// CORS headers
app.use(function (req, res, next) {
    res.response.setHeader('Access-Control-Allow-Origin', '*');
    res.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Handle CORS preflight
app.options('/*', function (req, res) {
    res.sendStatusCode(204);
});
```

## Step 3: In-Memory Data Store

```js
var users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];
var nextId = 3;
```

## Step 4: CRUD Routes

### List All Users

```js
app.get('/api/users', function (req, res) {
    res.send(users);
});
```

### Get Single User

```js
app.get('/api/users/:id', function (req, res) {
    var user = users.find(function (u) {
        return u.id === parseInt(req.params.id);
    });
    if (user) {
        res.send(user);
    } else {
        res.sendError(new Error('User not found'), { statusCode: 404 });
    }
});
```

### Create User

```js
app.post('/api/users', app.handlePostData(), function (req, res) {
    if (!req.body.name || !req.body.email) {
        return res.sendError(new Error('name and email required'), { statusCode: 400 });
    }
    var user = {
        id: nextId++,
        name: req.body.name,
        email: req.body.email
    };
    users.push(user);
    res.send(user, { statusCode: 201 });
});
```

### Update User

```js
app.put('/api/users/:id', app.handlePostData(), function (req, res) {
    var index = users.findIndex(function (u) {
        return u.id === parseInt(req.params.id);
    });
    if (index === -1) {
        return res.sendError(new Error('User not found'), { statusCode: 404 });
    }
    if (req.body.name) users[index].name = req.body.name;
    if (req.body.email) users[index].email = req.body.email;
    res.send(users[index]);
});
```

### Delete User

```js
app.delete('/api/users/:id', function (req, res) {
    var index = users.findIndex(function (u) {
        return u.id === parseInt(req.params.id);
    });
    if (index === -1) {
        return res.sendError(new Error('User not found'), { statusCode: 404 });
    }
    users.splice(index, 1);
    res.sendStatusCode(204);
});
```

## Step 5: Error Handling

```js
// 404 for unmatched routes
app.finalHandler('/*', function (req, res) {
    res.sendError(new Error('Endpoint not found'), { statusCode: 404 });
});
```

## Complete Example

```js
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// Middleware
app.use(function (req, res, next) {
    res.response.setHeader('Access-Control-Allow-Origin', '*');
    res.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

app.options('/*', function (req, res) {
    res.sendStatusCode(204);
});

// Data
var users = [
    { id: 1, name: 'Alice', email: 'alice@example.com' },
    { id: 2, name: 'Bob', email: 'bob@example.com' }
];
var nextId = 3;

// Routes
app.get('/api/users', function (req, res) {
    res.send(users);
});

app.get('/api/users/:id', function (req, res) {
    var user = users.find(function (u) { return u.id === parseInt(req.params.id); });
    if (user) {
        res.send(user);
    } else {
        res.sendError(new Error('User not found'), { statusCode: 404 });
    }
});

app.post('/api/users', app.handlePostData(), function (req, res) {
    var user = { id: nextId++, name: req.body.name, email: req.body.email };
    users.push(user);
    res.send(user, { statusCode: 201 });
});

app.put('/api/users/:id', app.handlePostData(), function (req, res) {
    var index = users.findIndex(function (u) { return u.id === parseInt(req.params.id); });
    if (index === -1) return res.sendError(new Error('Not found'), { statusCode: 404 });
    if (req.body.name) users[index].name = req.body.name;
    if (req.body.email) users[index].email = req.body.email;
    res.send(users[index]);
});

app.delete('/api/users/:id', function (req, res) {
    var index = users.findIndex(function (u) { return u.id === parseInt(req.params.id); });
    if (index === -1) return res.sendError(new Error('Not found'), { statusCode: 404 });
    users.splice(index, 1);
    res.sendStatusCode(204);
});

// 404 fallback
app.finalHandler('/*', function (req, res) {
    res.sendError(new Error('Endpoint not found'), { statusCode: 404 });
});

app.server().listen(3000, () => {
    app.logger.log('REST API running on port 3000');
});
```

## Testing

```bash
# List users
curl http://localhost:3000/api/users

# Get user
curl http://localhost:3000/api/users/1

# Create user
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Charlie","email":"charlie@example.com"}' \
    http://localhost:3000/api/users

# Update user
curl -X PUT -H "Content-Type: application/json" \
    -d '{"name":"Charlie Updated"}' \
    http://localhost:3000/api/users/3

# Delete user
curl -X DELETE http://localhost:3000/api/users/3
```

---

## Next Steps

- [Serving Static Files](../guides/serving-static-files.md) -- add a frontend
- [Session Management](../guides/session-management.md) -- add authentication
- [Access Logger](../decorators/access-logger.md) -- log API requests
