# Use Case: File Uploads

Multipart form data handling with file size limits, multiple files per field, and file metadata access.

**Express equivalent:** `express` + `multer`

## Complete Example

```javascript
const { SGAppsServer } = require('sgapps-server');
const fs = require('fs');
const path = require('path');
const app = new SGAppsServer();

// Ensure upload directory exists
var uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ---------------------
//  Single file upload
// ---------------------
app.post('/upload', app.handlePostData({ MAX_POST_SIZE: 5 * 1024 * 1024 }), function (req, res) {
    if (req.fileItems.length === 0) {
        return res.send({ error: 'No files uploaded' }, { statusCode: 400 });
    }

    var results = [];
    req.fileItems.forEach(function (file) {
        var savePath = path.join(uploadDir, Date.now() + '-' + file.data.fileName);
        fs.writeFileSync(savePath, file.data.fileData);

        results.push({
            field: file.fieldName,
            name: file.data.fileName,
            size: file.data.fileSize,
            type: file.data.contentType,
            saved: savePath
        });
    });

    res.send({ uploaded: results }, { statusCode: 201 });
});

// ---------------------
//  Upload with form fields
// ---------------------
app.post('/submit-form', app.handlePostData({ MAX_POST_SIZE: 10 * 1024 * 1024 }), function (req, res) {
    res.send({
        fields: req.body,
        files: req.fileItems.map(function (f) {
            return {
                field: f.fieldName,
                name: f.data.fileName,
                size: f.data.fileSize,
                type: f.data.contentType,
                loaded: f.data.loaded
            };
        })
    });
});

// ---------------------
//  Upload with size validation
// ---------------------
app.post('/upload-avatar',
    function (req, res, next) {
        // Allow max 1MB for avatars
        req.MAX_POST_SIZE = 1 * 1024 * 1024;
        next();
    },
    app.handlePostData(),
    function (req, res) {
        var avatar = req.fileItems[0];
        if (!avatar) {
            return res.send({ error: 'No file uploaded' }, { statusCode: 400 });
        }

        // Validate mime type
        var allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.indexOf(avatar.data.contentType) === -1) {
            return res.send({
                error: 'Invalid file type. Allowed: ' + allowed.join(', ')
            }, { statusCode: 400 });
        }

        var ext = avatar.data.fileName.replace(/^.*\./, '');
        var savePath = path.join(uploadDir, 'avatar-' + Date.now() + '.' + ext);
        fs.writeFileSync(savePath, avatar.data.fileData);

        res.send({
            avatar: {
                name: avatar.data.fileName,
                size: avatar.data.fileSize,
                type: avatar.data.contentType,
                path: savePath
            }
        }, { statusCode: 201 });
    }
);

// ---------------------
//  Start
// ---------------------
app.server().listen(3000, () => {
    app.logger.log('Upload server running on port 3000');
});
```

## Testing with curl

```bash
# Upload a single file
curl -X POST -F "file=@photo.jpg" http://localhost:3000/upload

# Upload multiple files
curl -X POST -F "file1=@photo.jpg" -F "file2=@document.pdf" http://localhost:3000/upload

# Upload with form fields
curl -X POST -F "title=My Photo" -F "description=A nice photo" -F "image=@photo.jpg" \
    http://localhost:3000/submit-form

# Upload avatar (with validation)
curl -X POST -F "avatar=@profile.png" http://localhost:3000/upload-avatar

# Test size limit (will fail if file > 1MB)
curl -X POST -F "avatar=@large-image.jpg" http://localhost:3000/upload-avatar
```

## What This Demonstrates

| Feature | How It's Used |
|---|---|
| `app.handlePostData()` | Multipart form data parsing |
| `MAX_POST_SIZE` option | Global and per-route size limits |
| `req.MAX_POST_SIZE` | Per-request size override in middleware |
| `req.fileItems` | Flat array of all uploaded files |
| `req.files` | Files organized by field name |
| `req.body` | Form fields alongside file uploads |
| `file.data.fileData` | File content as Buffer |
| `file.data.fileName` | Original file name |
| `file.data.fileSize` | File size in bytes |
| `file.data.contentType` | MIME type |
| `file.data.loaded` | Whether file is fully buffered |
| Handler chain | Validation middleware before upload handler |

---

## Related

- [POST Data Reference](../middleware/post-data.md) -- full file/body parsing API
- [Request Reference](../networking/request.md) -- `fileItems`, `files`, `body` properties
