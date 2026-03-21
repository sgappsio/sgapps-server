# Use Case: REST API

A complete JSON REST API with CRUD operations, input validation, CORS, error handling, and middleware chains.

**Express equivalent:** `express` + `body-parser` + `cors`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// ---------------------
//  In-memory data store
// ---------------------
var users = [
    { id: 1, name: 'Alice', email: 'alice@example.com', role: 'admin' },
    { id: 2, name: 'Bob', email: 'bob@example.com', role: 'user' }
];
var nextId = 3;

// ---------------------
//  CORS middleware
// ---------------------
app.use(function (req, res, next) {
    res.response.setHeader('Access-Control-Allow-Origin', '*');
    res.response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.options('/*', function (req, res) {
    res.sendStatusCode(204);
});

// ---------------------
//  Validation helper
// ---------------------
function validateUser(body) {
    var errors = [];
    if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 2) {
        errors.push('name is required (min 2 characters)');
    }
    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
        errors.push('valid email is required');
    }
    return errors;
}

// ---------------------
//  Routes
// ---------------------

// List all users (with optional role filter)
app.get('/api/users', function (req, res) {
    var result = users;
    if (req.query.role) {
        result = users.filter(function (u) { return u.role === req.query.role; });
    }
    res.send(result);
});

// Get single user
app.get('/api/users/:id', function (req, res) {
    var user = users.find(function (u) { return u.id === parseInt(req.params.id); });
    if (!user) {
        return res.sendError(new Error('User not found'), { statusCode: 404 });
    }
    res.send(user);
});

// Create user
app.post('/api/users', app.handlePostData(), function (req, res) {
    var errors = validateUser(req.body);
    if (errors.length > 0) {
        return res.send({ errors: errors }, { statusCode: 400 });
    }

    var user = {
        id: nextId++,
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        role: req.body.role || 'user'
    };
    users.push(user);
    res.send(user, { statusCode: 201 });
});

// Update user
app.put('/api/users/:id', app.handlePostData(), function (req, res) {
    var index = users.findIndex(function (u) { return u.id === parseInt(req.params.id); });
    if (index === -1) {
        return res.sendError(new Error('User not found'), { statusCode: 404 });
    }

    if (req.body.name) {
        if (typeof req.body.name !== 'string' || req.body.name.trim().length < 2) {
            return res.send({ errors: ['name must be at least 2 characters'] }, { statusCode: 400 });
        }
        users[index].name = req.body.name.trim();
    }
    if (req.body.email) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
            return res.send({ errors: ['valid email is required'] }, { statusCode: 400 });
        }
        users[index].email = req.body.email.trim().toLowerCase();
    }
    if (req.body.role) {
        users[index].role = req.body.role;
    }

    res.send(users[index]);
});

// Delete user
app.delete('/api/users/:id', function (req, res) {
    var index = users.findIndex(function (u) { return u.id === parseInt(req.params.id); });
    if (index === -1) {
        return res.sendError(new Error('User not found'), { statusCode: 404 });
    }
    users.splice(index, 1);
    res.sendStatusCode(204);
});

// ---------------------
//  404 fallback
// ---------------------
app.finalHandler('/*', function (req, res) {
    res.send({ error: 'Endpoint not found', path: req.urlInfo.pathname }, { statusCode: 404 });
});

// ---------------------
//  Start
// ---------------------
app.server().listen(3000, () => {
    app.logger.log('REST API running on port 3000');
});
```

## Testing with curl

```bash
# List all users
curl http://localhost:3000/api/users

# Filter by role
curl http://localhost:3000/api/users?role=admin

# Get single user
curl http://localhost:3000/api/users/1

# Create user (JSON)
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Charlie","email":"charlie@example.com","role":"user"}' \
    http://localhost:3000/api/users

# Create user (form-encoded)
curl -X POST -d "name=Diana&email=diana@example.com" \
    http://localhost:3000/api/users

# Update user
curl -X PUT -H "Content-Type: application/json" \
    -d '{"name":"Alice Updated"}' \
    http://localhost:3000/api/users/1

# Delete user
curl -X DELETE http://localhost:3000/api/users/2

# 404
curl http://localhost:3000/api/unknown
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `app.get()`, `app.post()`, `app.put()`, `app.delete()` | Standard REST route methods |
| `app.handlePostData()` | Body parsing as per-route middleware |
| `req.params.id` | Path parameters |
| `req.query.role` | Query string parameters |
| `req.body` | Parsed JSON or form body |
| `res.send(data)` | Auto-detects JSON content-type |
| `res.send(data, { statusCode })` | Response with custom status |
| `res.sendError(err, { statusCode })` | Error responses |
| `res.sendStatusCode(204)` | Status-only responses |
| `app.finalHandler()` | Catch-all 404 |
| `app.use()` | CORS middleware |
| `app.options()` | CORS preflight handling |

---

## Related

- [Express Migration](../use-cases/express-migration.md) -- migration cheat sheet
- [Authentication & Sessions](../use-cases/auth-sessions.md) -- add auth to this API
- [SGAppsServer Reference](../core/sgapps-server.md) -- full API docs
