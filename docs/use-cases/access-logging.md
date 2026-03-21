# Use Case: Access Logging & Monitoring

Production-grade HTTP access logs compatible with GoAccess and AWStats, with multiple log outputs, error-only filtering, and date-based file rotation.

**Express equivalent:** `express` + `morgan` + `rotating-file-stream` + custom middleware

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const AccessLogger = require('sgapps-server/decorators/access-logger');

const app = new SGAppsServer({
    decorators: [AccessLogger]
});

// ---------------------
//  Routes
// ---------------------
app.get('/', function (req, res) {
    res.send('<h1>Welcome</h1>');
});

app.get('/api/data', function (req, res) {
    res.send({ status: 'ok' });
});

app.get('/error', function (req, res) {
    res.sendError(new Error('Intentional error'), { statusCode: 500 });
});

// ---------------------
//  Configure logging
// ---------------------
app.whenReady.then(() => {
    // Enable combined format (includes user-agent)
    app.AccessLogger.combined = true;

    // Enable virtual host logging
    app.AccessLogger.logsIncludeHostname = true;

    // 1. Main access log -- all requests, date-based rotation
    app.AccessLoggerPaths['default'] = {
        isEnabled: true,
        path: 'logs/{year}/{month}/access-{worker-id}.log'
    };

    // 2. Error-only log -- 4xx and 5xx responses
    app.AccessLoggerPaths['errors'] = {
        isEnabled: true,
        path: 'logs/{year}/{month}/errors-{worker-id}.log',
        handle: function (logData) {
            if (logData.match(/" [45]\d{2} /)) {
                return logData;
            }
            return null; // skip non-error requests
        }
    };

    // 3. API-only log -- requests to /api/*
    app.AccessLoggerPaths['api'] = {
        isEnabled: true,
        path: 'logs/{year}/{month}/api-{worker-id}.log',
        handle: function (logData) {
            if (logData.match(/" [A-Z]+ \/api\//)) {
                return logData;
            }
            return null;
        }
    };

    // 4. Chained handlers -- modify data through pipeline
    app.AccessLoggerPaths['sanitized'] = {
        isEnabled: true,
        waitAllHandlers: true,
        path: 'logs/{year}/{month}/sanitized-{worker-id}.log',
        handle: function (logData) {
            // Strip query strings for privacy
            return logData.replace(/\?[^"]*"/, '"');
        }
    };

    app.server().listen(3000, () => {
        app.logger.log('Server with access logging running on port 3000');
    });
}, app.logger.error);
```

## Generated Log Files

```
logs/
└── 2024/
    └── 3/
        ├── access-master.log       # All requests
        ├── errors-master.log       # 4xx/5xx only
        ├── api-master.log          # /api/* only
        └── sanitized-master.log    # Query strings stripped
```

## Log Format Examples

**Default:**
```
192.168.1.1 - - [15/Mar/2024:10:30:00 +0000] -"GET /api/data HTTP/1.1" 200 15 "-"
```

**Combined (with user-agent):**
```
192.168.1.1 - - [15/Mar/2024:10:30:00 +0000] -"GET /api/data HTTP/1.1" 200 15 "-" "curl/8.1.2"
```

**With hostname:**
```
192.168.1.1 - - [15/Mar/2024:10:30:00 +0000] "example.com" "GET /api/data HTTP/1.1" 200 15 "-" "curl/8.1.2"
```

## Analyzing with GoAccess

```bash
# Real-time terminal dashboard
tail -f logs/2024/3/access-master.log | goaccess \
    --log-format='%h %e %^[%x] "%v" "%r" %s %b "%R" "%u"' \
    --date-format='%d/%b/%Y:%H:%M:%S %z' \
    --time-format='%d/%b/%Y:%H:%M:%S %z' -

# Generate HTML report
goaccess logs/2024/3/access-master.log \
    --log-format='%h %e %^[%x] "%v" "%r" %s %b "%R" "%u"' \
    --date-format='%d/%b/%Y:%H:%M:%S %z' \
    --time-format='%d/%b/%Y:%H:%M:%S %z' \
    -o report.html
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `AccessLogger` decorator | Optional decorator loaded at construction |
| `combined` flag | Include user-agent in log lines |
| `logsIncludeHostname` | Virtual host field for multi-site setups |
| `AccessLoggerPaths` | Multiple independent log outputs |
| `handle` function | Filter or transform log lines |
| `waitAllHandlers` | Pipeline-style log processing |
| Path placeholders | `{year}`, `{month}`, `{worker-id}` for rotation |
| Per-request paths | `req.AccessLoggerPaths` for route-specific logging |

---

## Related

- [Access Logger Reference](../decorators/access-logger.md) -- full API
- [Cluster Deployment](../use-cases/cluster-deployment.md) -- logging across workers
