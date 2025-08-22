# Backend Video Upload Fix - WebM File Support

## Problem
The video upload endpoint is rejecting WebM files with the error:
```
Error: Invalid file type. Only video files are allowed.
    at fileFilter (C:\Users\aricw\OneDrive\Documents\newRankandRentAPI\services\VideoService.js:29:12)
```

## Root Cause
The `fileFilter` function in `VideoService.js` is not properly configured to accept WebM video files. The MediaRecorder API creates WebM files with MIME type `video/webm`, but the backend file filter is rejecting them.

## Solution

### 1. Update VideoService.js

**File Location:** `services/VideoService.js` (around line 29)

**Current Problematic Code:**
```javascript
const fileFilter = (req, file, cb) => {
    // This is likely only checking for mp4, mov, etc. but not webm
    if (file.mimetype.startsWith('video/')) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'), false);
    }
};
```

**Updated Code (Option 1 - Comprehensive):**
```javascript
const fileFilter = (req, file, cb) => {
    // Accept all video MIME types including WebM
    const allowedMimeTypes = [
        'video/webm',
        'video/webm;codecs=vp8',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8,opus',
        'video/webm;codecs=vp9,opus',
        'video/mp4', 
        'video/mp4;codecs=h264',
        'video/quicktime',
        'video/x-msvideo',
        'video/x-ms-wmv',
        'video/ogg',
        'video/mpeg',
        'video/3gpp',
        'video/3gpp2'
    ];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
        console.log('File accepted:', file.mimetype);
        cb(null, true);
    } else {
        console.log('File rejected:', file.mimetype);
        cb(new Error(`Invalid file type: ${file.mimetype}. Only video files are allowed.`), false);
    }
};
```

**Updated Code (Option 2 - Simple):**
```javascript
const fileFilter = (req, file, cb) => {
    console.log('File upload attempt:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size
    });
    
    // Accept any MIME type that starts with 'video/'
    if (file.mimetype && file.mimetype.startsWith('video/')) {
        console.log('File accepted:', file.mimetype);
        cb(null, true);
    } else {
        console.log('File rejected:', file.mimetype);
        cb(new Error(`Invalid file type: ${file.mimetype}. Only video files are allowed.`), false);
    }
};
```

### 2. Verify Multer Configuration

Make sure your multer upload configuration includes the fileFilter:

**File Location:** `services/VideoService.js` (where multer is configured)

**Current Configuration:**
```javascript
const upload = multer({
    storage: storage,
    // fileFilter might be missing or incorrectly configured
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
```

**Updated Configuration:**
```javascript
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,  // Make sure this is included
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});
```

### 3. Test the Fix

1. **Restart your backend server**
2. **Try recording a video** using the frontend
3. **Check the console logs** for:
   - File upload attempt details
   - Whether the file is accepted or rejected
   - The actual MIME type being sent

### 4. Expected Console Output

After the fix, you should see logs like:
```
File upload attempt: {
  originalname: 'recording-1234567890.webm',
  mimetype: 'video/webm',
  size: 1234567
}
File accepted: video/webm
```

Instead of the current error:
```
Error: Invalid file type. Only video files are allowed.
```

## Additional Considerations

### File Size Limits
If you're recording high-quality videos, you might need to increase the file size limit:

```javascript
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB limit for high-quality recordings
    }
});
```

### MIME Type Validation
If you want to be more strict about accepted formats, use the comprehensive list in Option 1. If you want to be more permissive, use Option 2.

### Error Handling
Consider adding better error handling in your upload route:

```javascript
app.post('/api/videos/upload', upload.single('video'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }
        
        console.log('Uploaded file:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });
        
        // Process the upload...
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
});
```

## Troubleshooting

### If the fix doesn't work:

1. **Check the exact MIME type** being sent by the frontend
2. **Verify the fileFilter function** is being called
3. **Check multer configuration** includes the fileFilter
4. **Restart the server** after making changes
5. **Clear browser cache** and try again

### Common Issues:

- **MIME type mismatch**: Frontend might be sending a different MIME type than expected
- **Multer not configured**: fileFilter might not be included in multer config
- **Server not restarted**: Changes require server restart
- **Cached configuration**: Old multer config might be cached

## Files to Modify

1. `services/VideoService.js` - Update fileFilter function
2. Verify multer configuration in the same file
3. Restart the backend server

## Testing

After implementing the fix:

1. Record a short video (5-10 seconds)
2. Check console logs for acceptance
3. Verify the video appears in the library
4. Test different recording types (screen, webcam, both)

This should resolve the "Invalid file type" error and allow WebM video uploads to work properly.
