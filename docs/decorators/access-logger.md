# Access Logger

HTTP access logging in GoAccess/AWStats-compatible format with configurable outputs, file path templates, and custom handlers.

## Overview

The Access Logger is an **optional decorator** that generates HTTP access log lines for every request. Log lines follow a format compatible with GoAccess and AWStats analysis tools. Logs can be written to files with automatic directory creation, date-based path templates, and per-request custom handlers.

## Advantages

- **GoAccess/AWStats compatible** -- standard log format for analysis tools
- **File output** -- automatic file creation with directory structure
- **Path templates** -- `{year}`, `{month}`, `{date}`, `{worker-id}` placeholders
- **Combined format** -- optional user-agent field
- **Virtual host support** -- optional hostname field for multi-site logging
- **Custom handlers** -- filter or transform log lines before writing
- **Per-request paths** -- add log outputs on individual requests
- **Cluster support** -- `{worker-id}` separates log files per worker

## Getting Started

```js
const { SGAppsServer } = require('sgapps-server');
const AccessLogger = require('sgapps-server/decorators/access-logger');

const app = new SGAppsServer({
    decorators: [AccessLogger]
});

app.whenReady.then(() => {
    app.AccessLogger.combined = true;
    app.AccessLogger.logsIncludeHostname = true;

    app.AccessLoggerPaths['default'] = {
        isEnabled: true,
        path: 'logs/{year}/{month}/access-{worker-id}.log'
    };

    app.server().listen(8080);
});
```

## Server Properties

| Property | Type | Description |
|----------|------|-------------|
| `AccessLogger` | AccessLogger | Log formatting instance |
| `AccessLoggerPaths` | object | Log output configurations |

### `AccessLogger` Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `combined` | boolean | `false` | Include user-agent in log line |
| `logsIncludeHostname` | boolean | `false` | Include virtual host in log line |

### `AccessLoggerPaths` Configuration

Each key in `AccessLoggerPaths` is a named log output:

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `isEnabled` | boolean | `false` | Enable this log output |
| `path` | string | `null` | File path with placeholders |
| `waitAllHandlers` | boolean | `false` | Wait for all handlers to process log data |
| `handle` | function | `null` | Custom handler `(logData) => logData` |

### Path Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{year}` | Current year |
| `{month}` | Current month (1-12) |
| `{date}` | Current date (1-31) |
| `{day}` | Current day of week (0-6) |
| `{pid}` | Process ID |
| `{worker-id}` | Cluster worker ID or "master" |

## Log Format

### Default Format

```
%h %e [%x] %v "%r" %s %b "%R"
```

Example:
```
192.168.1.1 - - [15/Jan/2024:10:30:00 +0000] -"GET /api/users HTTP/1.1" 200 1234 "-"
```

### Combined Format (`combined: true`)

```
%h %e [%x] %v "%r" %s %b "%R" "%u"
```

Example:
```
192.168.1.1 - - [15/Jan/2024:10:30:00 +0000] -"GET /api/users HTTP/1.1" 200 1234 "-" "Mozilla/5.0..."
```

### With Hostname (`logsIncludeHostname: true`)

```
%h %e [%x] "%v" "%r" %s %b "%R"
```

### Format Placeholders

| Placeholder | Description |
|-------------|-------------|
| `%h` | Remote IP address |
| `%e` | Username (from session, or `-`) |
| `%x` | Timestamp (dd/Mon/YYYY:HH:MM:SS +0000) |
| `%v` | Virtual host (hostname) |
| `%r` | Request line (METHOD /path HTTP/version) |
| `%s` | HTTP status code |
| `%b` | Response size in bytes |
| `%R` | Referrer URL |
| `%u` | User-agent string |

## API Reference

### `logRequest(request, response)`

Generate a formatted log line.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request` | IncomingMessage | Raw Node.js request |
| `response` | ServerResponse | Raw Node.js response |

Returns `string` -- the formatted log line.

### `getRemoteIp(request)`

Extract the client IP from `X-Forwarded-For` header or connection.

### `getUsername(request)`

Extract username from `session.user.username` or session ID.

### `getReferer(request)`

Get the `referer` or `referrer` header value.

### `getProtocol(request)`

Detect HTTP or HTTPS based on local port.

### `formattedDate(timestamp)`

Format a Date as `dd/Mon/YYYY:HH:MM:SS +0000`.

### `getSize(data)`

Get byte length of a Buffer or string.

---

## Code Examples

### Example 1: Multiple Log Outputs

```js
app.AccessLoggerPaths['default'] = {
    isEnabled: true,
    path: 'logs/{year}/{month}/access-{worker-id}.log'
};

app.AccessLoggerPaths['errors'] = {
    isEnabled: true,
    path: 'logs/{year}/{month}/errors-{worker-id}.log',
    handle: function (logData) {
        // Only log 4xx and 5xx responses
        if (logData.match(/" [45]\d{2} /)) {
            return logData;
        }
        return null; // skip this entry
    }
};
```

### Example 2: GoAccess Analysis

```bash
# Analyze logs with GoAccess
tail -f logs/2024/1/access-master.log | goaccess \
    --log-format='%h %e %^[%x] "%v" "%r" %s %b "%R" "%u"' \
    --date-format='%d/%b/%Y:%H:%M:%S %z' \
    --time-format='%d/%b/%Y:%H:%M:%S %z' -
```

### Example 3: Per-Request Log Paths

```js
app.use(function (req, res, next) {
    // Add extra logging for API requests
    if (req.urlInfo.pathname.indexOf('/api/') === 0) {
        req.AccessLoggerPaths['api'] = {
            isEnabled: true,
            path: 'logs/{year}/{month}/api-{worker-id}.log'
        };
    }
    next();
});
```

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- decorator registration
- [Middleware Overview](../middleware/index.md) -- optional decorator usage
