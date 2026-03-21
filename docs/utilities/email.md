# Email

Send email via the system's `sendmail` command with support for HTML bodies, CC/BCC, reply-to, timeouts, and address validation.

## Overview

The `Email` class wraps the system's `sendmail` binary to send emails from your server. It supports HTML and plain text bodies, multiple recipients, CC/BCC, reply-to addresses, and configurable timeouts. Email validation is built in.

**Note:** Requires `sendmail` to be installed on the system.

## Advantages

- **No SMTP config** -- uses the system's sendmail directly
- **HTML support** -- send HTML emails with plain-text alternatives
- **Multiple recipients** -- to, CC, BCC support
- **Address validation** -- built-in email address format checking
- **Configurable timeout** -- kill the process if it hangs
- **Global defaults** -- set default `from` and `timeout` once

## Getting Started

```js
const app = new SGAppsServer();

var msg = new app.Email({
    to: 'user@example.com',
    from: 'noreply@myapp.com',
    subject: 'Welcome!',
    body: '<h1>Welcome to MyApp</h1><p>Thanks for signing up.</p>',
    bodyType: 'html',
    altText: 'Welcome to MyApp. Thanks for signing up.'
});

msg.send(function (err) {
    if (err) {
        app.logger.error('Email failed:', err);
    } else {
        app.logger.log('Email sent');
    }
});
```

## Constructor

```js
var email = new Email(config);
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `config.to` | string or string[] | Recipient address(es) |
| `config.from` | string | Sender address (falls back to global default) |
| `config.replyTo` | string | Reply-to address (defaults to `from`) |
| `config.cc` | string or string[] | Carbon copy recipients |
| `config.bcc` | string or string[] | Blind carbon copy recipients |
| `config.subject` | string | Email subject |
| `config.body` | string | Email body content |
| `config.bodyType` | string | `'html'` for HTML emails, omit for plain text |
| `config.altText` | string | Alternative text for HTML emails |
| `config.timeout` | number | Timeout in milliseconds (default: 3000) |
| `config.path` | string | Custom path to sendmail binary |
| `config.debug` | boolean | Enable debug output (default: false) |

## Static Methods

### `Email.from(email)`

Set or get the global default sender address.

```js
Email.from('noreply@myapp.com');
var current = Email.from(); // returns 'noreply@myapp.com'
```

### `Email.timeout(milliseconds)`

Set or get the global default timeout.

```js
Email.timeout(5000); // 5 seconds
var current = Email.timeout(); // returns 5000
```

### `Email.isValidAddress(email)`

Validate an email address format.

```js
Email.isValidAddress('user@example.com'); // true
Email.isValidAddress('invalid');          // false
```

## Instance Methods

### `send(callback)`

Send the email.

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | function | `(err)` called on completion |

### `valid(callback)`

Validate the email configuration without sending.

| Parameter | Type | Description |
|-----------|------|-------------|
| `callback` | function | `(err)` called with validation result |

## Instance Properties

| Property | Type | Description |
|----------|------|-------------|
| `options` | object | Message configuration with timeout |
| `encodedBody` | string | Generated encoded email body |
| `msg` | string | Complete email message structure |

---

## Code Examples

### Example 1: Plain Text Email

```js
var msg = new app.Email({
    to: 'admin@example.com',
    from: 'alerts@myapp.com',
    subject: 'Server Alert',
    body: 'CPU usage exceeded 90%'
});

msg.send(function (err) {
    if (err) app.logger.error(err);
});
```

### Example 2: HTML Email with CC

```js
var msg = new app.Email({
    to: 'team@example.com',
    cc: ['manager@example.com', 'lead@example.com'],
    from: 'reports@myapp.com',
    subject: 'Weekly Report',
    body: '<h1>Report</h1><p>All systems operational.</p>',
    bodyType: 'html',
    altText: 'Report: All systems operational.'
});

msg.send(function (err) {
    if (err) app.logger.error(err);
});
```

### Example 3: Validation Before Sending

```js
if (app.Email.isValidAddress(userEmail)) {
    var msg = new app.Email({
        to: userEmail,
        subject: 'Password Reset',
        body: 'Click here to reset your password.',
        timeout: 5000
    });
    msg.send(function (err) {
        if (err) app.logger.error(err);
    });
} else {
    app.logger.warn('Invalid email:', userEmail);
}
```

---

## Related Modules

- [SGAppsServer](../core/sgapps-server.md) -- `app.Email` constructor
