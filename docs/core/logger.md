# LoggerBuilder

A pretty CLI logger with VT100 formatting, file/line tracing, and the ability to replace Node.js global console.

## Overview

`LoggerBuilder` wraps the standard `console` methods with VT100 color formatting and automatic source location tracing. Each log message includes a timestamp, log level, source file, line number, and method name. It can optionally replace the global `console` to decorate all application logging.

## Advantages

- **Source tracing** -- every log line shows file, line number, and method name
- **VT100 colors** -- color-coded output by log level (log, info, warn, error)
- **Customizable format** -- change the header format string with placeholders
- **Pretty object printing** -- `prettyCli()` renders objects with color-coded types
- **Global replacement** -- `decorateGlobalLogger()` replaces `console.log/info/warn/error`
- **Interactive prompts** -- `prompt()` reads user input from stdin
- **Debug toggle** -- set `_debug = false` to suppress all output

## Getting Started

```js
const { LoggerBuilder } = require('sgapps-server');
const logger = new LoggerBuilder();

logger.log('Server started');
logger.info('Listening on port', 8080);
logger.warn('Deprecation notice');
logger.error(new Error('Something went wrong'));
```

## API Reference

### Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `_format` | string | VT100 format | Header format string with placeholders |
| `_debug` | boolean | `true` | When `false`, all log methods are silenced |
| `_headerFormatters` | array | `[]` | Custom header formatter functions |

### Format Placeholders

| Placeholder | Description |
|-------------|-------------|
| `{{timestamp}}` | ISO 8601 timestamp |
| `{{TYPE}}` | Log level (LOG, INFO, WARN, ERROR) |
| `{{file}}` | Source file name |
| `{{line}}` | Source line number |
| `{{method}}` | Calling method name |
| `{{title}}` | Relative file path |
| `{{stack}}` | Stack trace (only for error level) |

### `log(...messages)`

Log standard messages. Silenced when `_debug` is `false`.

```js
logger.log('User connected:', userId);
```

### `info(...messages)`

Log informational messages with cyan coloring.

```js
logger.info('Request processed in', duration, 'ms');
```

### `warn(...messages)`

Log warning messages with yellow coloring.

```js
logger.warn('Handler exceeded timeout');
```

### `error(...messages)`

Log error messages with red coloring and full stack trace. Always logged regardless of `_debug` setting.

```js
logger.error(new Error('Connection refused'));
```

### `prettyCli(ref, [indent], [separator])`

Pretty-print a value with VT100 color-coded types.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `ref` | any | | Value to print |
| `indent` | number | `0` | Indentation level |
| `separator` | string | `"  "` | Indentation string |

```js
logger.log(logger.prettyCli({
    name: 'test',
    count: 42,
    active: true,
    data: null
}));
// Output: colored object with types highlighted
```

**Color scheme:**
- Strings: green
- Numbers: yellow
- Booleans: blue
- Functions: cyan
- null/undefined: magenta
- Buffers: green hex with "Buffer(...)" wrapper
- RegExp: green with "RegExp(...)" wrapper

### `prompt(callback, [message])`

Read a line of input from stdin.

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | function | `(err, buffer)` called with input |
| `message` | string | Optional prompt message to display |

```js
logger.prompt(function (err, buffer) {
    var response = buffer.toString().replace(/^\s*(.*?)\s*$/, '$1');
    if (response === 'y') {
        // user confirmed
    }
}, 'Continue? [y/n]: ');
```

### `decorateGlobalLogger()`

Replace the global `console.log`, `console.info`, `console.warn`, and `console.error` with the logger's decorated versions. The original console is saved to `global.console_original`.

```js
const logger = new LoggerBuilder();
logger.decorateGlobalLogger();

// Now all console.log calls are decorated
console.log('This has file/line info now');
```

---

## Code Examples

### Example 1: Custom Format

```js
const logger = new LoggerBuilder();
logger._format = '[{{TYPE}}] {{timestamp}} {{file}}:{{line}} -';
logger.log('Custom format');
// Output: [LOG] 2024-01-15T10:30:00.000Z server.js:5 - Custom format
```

### Example 2: Header Formatters

```js
const logger = new LoggerBuilder();
logger._headerFormatters.push(function (info) {
    info.type = info.type + ' [PID:' + process.pid + ']';
});
logger.log('With PID');
```

### Example 3: Silent Mode

```js
const logger = new LoggerBuilder();
logger._debug = false;
logger.log('This will not appear');
logger._debug = true;
logger.log('This will appear');
```

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- uses LoggerBuilder as `app.logger`
