# Use Case: Cluster Deployment

Multi-worker Node.js server with automatic session synchronization via IPC -- no Redis or external session store required.

**Express equivalent:** `express` + `express-session` + `connect-redis` + `redis`

## Complete Example

```javascript
const cluster = require('cluster');
const os = require('os');
const { SGAppsServer } = require('sgapps-server');

var WORKERS = Math.min(os.cpus().length, 4);
var PORT = 8080;

if (cluster.isPrimary) {
    console.log('Master process ' + process.pid + ' starting ' + WORKERS + ' workers');

    for (var i = 0; i < WORKERS; i++) {
        cluster.fork();
    }

    // Restart crashed workers
    cluster.on('exit', function (worker, code, signal) {
        console.log('Worker ' + worker.process.pid + ' died (' + (signal || code) + '), restarting...');
        cluster.fork();
    });

    console.log('Master ready. Sessions are stored in master process memory.');
    console.log('Workers sync sessions via IPC automatically.');

} else {
    var app = new SGAppsServer();

    // ---------------------
    //  Routes
    // ---------------------
    app.get('/', function (req, res) {
        req.session.data.visits = (req.session.data.visits || 0) + 1;
        res.send({
            worker: process.pid,
            visits: req.session.data.visits,
            sessionId: req.session._id,
            returning: req.session._confirmed
        });
    });

    app.get('/api/session', function (req, res) {
        res.send({
            worker: process.pid,
            session: {
                id: req.session._id,
                ip: req.session._ip,
                data: req.session.data,
                confirmed: req.session._confirmed
            }
        });
    });

    app.post('/api/data', app.handlePostData(), function (req, res) {
        // Store data in session
        req.session.data.lastSubmission = {
            body: req.body,
            at: Date.now(),
            worker: process.pid
        };
        res.send({ saved: true, worker: process.pid });
    });

    // ---------------------
    //  Start
    // ---------------------
    app.whenReady.then(() => {
        app.SessionManager._options.SESSION_LIFE = 3600; // 1 hour
        app.SessionManager._options.cookie = 'cluster-session';

        app.server().listen(PORT, () => {
            app.logger.log('Worker ' + process.pid + ' listening on port ' + PORT);
        });
    }, app.logger.error);
}
```

## How It Works

```
Request ──> Worker 2 (random)
               │
               ├── Creates session, reads cookie
               │
               ├── IPC: "Master, give me session data for session-abc123"
               │
               ├── Master responds with stored data
               │
               ├── Handler executes, modifies session.data
               │
               ├── Response finishes
               │
               └── IPC: "Master, store updated session data for session-abc123"

Next Request ──> Worker 4 (different worker, same session)
               │
               ├── Same IPC flow
               │
               └── Gets the data that Worker 2 stored
```

Session data is always consistent across workers because the master process is the single source of truth.

## Testing

```bash
# Hit the server multiple times -- visits counter stays consistent
# even though requests land on different workers
curl -b cookies.txt -c cookies.txt http://localhost:8080/
curl -b cookies.txt -c cookies.txt http://localhost:8080/
curl -b cookies.txt -c cookies.txt http://localhost:8080/
# visits: 1, 2, 3 (not 1, 1, 1)

# Store data via one worker
curl -b cookies.txt -c cookies.txt -X POST \
    -H "Content-Type: application/json" \
    -d '{"key":"value"}' \
    http://localhost:8080/api/data

# Read it back (may hit a different worker)
curl -b cookies.txt http://localhost:8080/api/session
# lastSubmission is present regardless of which worker responds
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `cluster.isPrimary` / `cluster.fork()` | Standard Node.js cluster pattern |
| `SessionManager` | Automatic IPC sync -- zero configuration |
| `req.session.data` | Consistent across workers |
| `workersSyncMaxDelay` | Configurable IPC timeout (default: 200ms) |
| Worker restart | `cluster.on('exit')` for zero-downtime |

## When to Use This vs. Redis

| Scenario | Recommendation |
|---|---|
| Single machine, up to ~8 workers | **SGApps cluster sessions** (no external deps) |
| Multiple machines behind a load balancer | External session store (Redis, DB) |
| Sessions under 10KB per user | **SGApps cluster sessions** |
| Large session data or many concurrent users | External session store |

---

## Related

- [Sessions Reference](../middleware/sessions.md) -- SessionManager API
- [Session Management Guide](../guides/session-management.md) -- login/logout flow
- [Architecture](../architecture.md) -- cluster sync diagram
