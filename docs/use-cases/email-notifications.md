# Use Case: Email Notifications

Send transactional email from route handlers using the system's sendmail binary -- HTML and plain text, CC/BCC, validation.

**Express equivalent:** `express` + `nodemailer`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const app = new SGAppsServer();

// ---------------------
//  Configure defaults
// ---------------------
app.Email.from('noreply@myapp.com');
app.Email.timeout(5000); // 5 second timeout

// ---------------------
//  Contact form
// ---------------------
app.post('/contact', app.handlePostData(), function (req, res) {
    var name = (req.body.name || '').trim();
    var email = (req.body.email || '').trim();
    var message = (req.body.message || '').trim();

    if (!name || !email || !message) {
        return res.send({ error: 'name, email, and message are required' }, { statusCode: 400 });
    }

    if (!app.Email.isValidAddress(email)) {
        return res.send({ error: 'Invalid email address' }, { statusCode: 400 });
    }

    var msg = new app.Email({
        to: 'support@myapp.com',
        replyTo: email,
        subject: 'Contact Form: ' + name,
        body: '<h2>New Contact Form Submission</h2>' +
              '<p><strong>Name:</strong> ' + name + '</p>' +
              '<p><strong>Email:</strong> ' + email + '</p>' +
              '<p><strong>Message:</strong></p>' +
              '<p>' + message + '</p>',
        bodyType: 'html',
        altText: 'Name: ' + name + '\nEmail: ' + email + '\nMessage: ' + message
    });

    msg.send(function (err) {
        if (err) {
            app.logger.error('Email send failed:', err);
            res.send({ error: 'Failed to send message' }, { statusCode: 500 });
        } else {
            res.send({ message: 'Message sent successfully' }, { statusCode: 201 });
        }
    });
});

// ---------------------
//  Welcome email on registration
// ---------------------
app.post('/register', app.handlePostData(), function (req, res) {
    var email = (req.body.email || '').trim();
    var name = (req.body.name || '').trim();

    if (!app.Email.isValidAddress(email)) {
        return res.send({ error: 'Invalid email address' }, { statusCode: 400 });
    }

    // ... save user to database ...

    var msg = new app.Email({
        to: email,
        subject: 'Welcome to MyApp!',
        body: '<h1>Welcome, ' + name + '!</h1>' +
              '<p>Your account has been created successfully.</p>' +
              '<p>Get started by visiting your <a href="https://myapp.com/dashboard">dashboard</a>.</p>',
        bodyType: 'html',
        altText: 'Welcome, ' + name + '! Your account has been created.'
    });

    msg.send(function (err) {
        if (err) {
            app.logger.warn('Welcome email failed for ' + email + ':', err);
            // Don't fail registration if email fails
        }
    });

    res.send({ message: 'Account created', email: email }, { statusCode: 201 });
});

// ---------------------
//  Admin notification with CC/BCC
// ---------------------
app.post('/report-issue', app.handlePostData(), function (req, res) {
    var msg = new app.Email({
        to: 'oncall@myapp.com',
        cc: 'team-lead@myapp.com',
        bcc: 'audit@myapp.com',
        subject: '[ISSUE] ' + (req.body.title || 'No title'),
        body: '<h2>Issue Report</h2>' +
              '<p><strong>Reporter:</strong> ' + (req.session.data.user ? req.session.data.user.name : 'Anonymous') + '</p>' +
              '<p><strong>Description:</strong></p>' +
              '<p>' + (req.body.description || 'No description') + '</p>',
        bodyType: 'html'
    });

    msg.send(function (err) {
        if (err) {
            res.send({ error: 'Failed to submit report' }, { statusCode: 500 });
        } else {
            res.send({ message: 'Issue reported' }, { statusCode: 201 });
        }
    });
});

// ---------------------
//  Start
// ---------------------
app.server().listen(3000, () => {
    app.logger.log('Email notification server running on port 3000');
});
```

## Testing with curl

```bash
# Send contact form
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Jane","email":"jane@example.com","message":"Hello!"}' \
    http://localhost:3000/contact

# Register (sends welcome email)
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Jane","email":"jane@example.com"}' \
    http://localhost:3000/register

# Validate email address
curl -X POST -H "Content-Type: application/json" \
    -d '{"name":"Jane","email":"not-valid","message":"Hello!"}' \
    http://localhost:3000/contact
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `app.Email` constructor | Create email instances per request |
| `Email.from()` | Global default sender address |
| `Email.timeout()` | Global send timeout |
| `Email.isValidAddress()` | Input validation before sending |
| `bodyType: 'html'` | HTML email with plain-text alternative |
| `altText` | Fallback text for HTML emails |
| `cc`, `bcc` | Carbon copy and blind copy recipients |
| `replyTo` | Custom reply-to address |
| `msg.send(callback)` | Async send with error handling |
| Non-blocking send | Welcome email failure doesn't block registration |

**Note:** Requires `sendmail` to be installed on the server. See `man sendmail` or install via your package manager.

---

## Related

- [Email Reference](../utilities/email.md) -- full API documentation
- [SGAppsServer Reference](../core/sgapps-server.md) -- `app.Email` property
