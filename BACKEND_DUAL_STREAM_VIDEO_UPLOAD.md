# Backend Dual-Stream Video Upload Support

## Overview

The frontend now supports dual-stream recording for "Screen + Webcam" mode to avoid browser throttling issues. Instead of real-time canvas compositing, the frontend records two separate streams and uploads both files for server-side composition.

## Frontend Changes Summary

- **Removed canvas-based compositing** - No more `requestAnimationFrame` throttling
- **Dual MediaRecorder setup** - Records screen and webcam separately
- **Enhanced upload** - Sends both video files with metadata
- **Background recording** - Screen capture continues when switching windows

## Backend API Changes Required

### 1. Update Upload Endpoint

**File:** `routes/videoRoutes.js` or similar

**Current endpoint:**
```javascript
router.post('/upload', authenticate, upload.single('video'), async (req, res) => {
    // Single file upload
});
```

**Updated endpoint:**
```javascript
// Use multer fields to accept multiple files
const upload = multer({
    storage: multer.memoryStorage(), // or your existing storage
    fileFilter: (req, file, cb) => {
        // Accept video files including WebM
        if (file.mimetype && file.mimetype.startsWith('video/')) {
            cb(null, true);
        } else {
            cb(new Error(`Invalid file type: ${file.mimetype}`), false);
        }
    },
    limits: {
        fileSize: 500 * 1024 * 1024 // 500MB per file
    }
});

router.post('/upload', authenticate, 
    upload.fields([
        { name: 'video', maxCount: 1 },    // Main screen recording
        { name: 'webcam', maxCount: 1 }    // Webcam overlay (optional)
    ]), 
    async (req, res) => {
        try {
            const screenFile = req.files?.video?.[0];
            const webcamFile = req.files?.webcam?.[0];
            
            if (!screenFile) {
                return res.status(400).json({ error: 'No video file uploaded' });
            }

            // Upload screen file to S3
            const screenKey = await uploadToS3(screenFile, 'videos/');
            
            let finalVideoKey = screenKey;
            
            // If webcam file exists, compose the videos
            if (webcamFile) {
                const webcamKey = await uploadToS3(webcamFile, 'videos/');
                const layout = req.body.layout || 'top-right';
                
                // Server-side composition with FFmpeg
                finalVideoKey = await composeVideoOverlay({
                    screenKey,
                    webcamKey,
                    layout,
                    outputKey: `composed/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`
                });
                
                // Clean up individual files after composition
                await deleteFromS3(screenKey);
                await deleteFromS3(webcamKey);
            }

            // Create database record
            const recording = await Video.create({
                title: req.body.title || 'Untitled Recording',
                description: req.body.description || '',
                file_path: finalVideoKey,
                recording_type: req.body.recording_type || 'screen',
                duration: 0, // Calculate from video metadata
                file_size: screenFile.size,
                user_id: req.user.id,
                is_public: req.body.is_public === 'true',
                shareable_id: generateShareableId()
            });

            res.json({ 
                success: true, 
                recording,
                message: webcamFile ? 'Video composed successfully' : 'Video uploaded successfully'
            });

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Upload failed: ' + error.message });
        }
    }
);
```

### 2. Video Composition Service

**File:** `services/VideoCompositionService.js` (new file)

```javascript
const ffmpeg = require('fluent-ffmpeg');
const { S3 } = require('aws-sdk');
const fs = require('fs');
const path = require('path');

class VideoCompositionService {
    constructor() {
        this.s3 = new S3({
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION
        });
    }

    async composeVideoOverlay({ screenKey, webcamKey, layout, outputKey }) {
        const tempDir = path.join(__dirname, '../temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        const screenPath = path.join(tempDir, 'screen.webm');
        const webcamPath = path.join(tempDir, 'webcam.webm');
        const outputPath = path.join(tempDir, 'composed.webm');

        try {
            // Download files from S3
            await this.downloadFromS3(screenKey, screenPath);
            await this.downloadFromS3(webcamKey, webcamPath);

            // Compose with FFmpeg
            await this.composeWithFFmpeg(screenPath, webcamPath, outputPath, layout);

            // Upload composed file to S3
            await this.uploadToS3(outputPath, outputKey);

            return outputKey;

        } finally {
            // Clean up temp files
            this.cleanupTempFiles([screenPath, webcamPath, outputPath]);
        }
    }

    async composeWithFFmpeg(screenPath, webcamPath, outputPath, layout) {
        return new Promise((resolve, reject) => {
            let filterComplex;
            
            // Define overlay position based on layout
            switch (layout) {
                case 'top-right':
                    filterComplex = '[1:v]scale=iw*0.25:ih*0.25[pip];[0:v][pip]overlay=W-w-20:20';
                    break;
                case 'top-left':
                    filterComplex = '[1:v]scale=iw*0.25:ih*0.25[pip];[0:v][pip]overlay=20:20';
                    break;
                case 'bottom-right':
                    filterComplex = '[1:v]scale=iw*0.25:ih*0.25[pip];[0:v][pip]overlay=W-w-20:H-h-20';
                    break;
                case 'bottom-left':
                    filterComplex = '[1:v]scale=iw*0.25:ih*0.25[pip];[0:v][pip]overlay=20:H-h-20';
                    break;
                default:
                    filterComplex = '[1:v]scale=iw*0.25:ih*0.25[pip];[0:v][pip]overlay=W-w-20:20';
            }

            ffmpeg()
                .input(screenPath)
                .input(webcamPath)
                .complexFilter(filterComplex)
                .outputOptions([
                    '-c:a copy',  // Copy audio from screen recording
                    '-c:v libvpx-vp9',  // Use VP9 for better compression
                    '-b:v 8M',  // 8 Mbps video bitrate
                    '-crf 23'  // Constant rate factor for quality
                ])
                .output(outputPath)
                .on('end', () => {
                    console.log('Video composition completed');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('FFmpeg error:', err);
                    reject(err);
                })
                .run();
        });
    }

    async downloadFromS3(key, localPath) {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key
        };

        const fileStream = fs.createWriteStream(localPath);
        const s3Stream = this.s3.getObject(params).createReadStream();
        
        return new Promise((resolve, reject) => {
            s3Stream.pipe(fileStream);
            fileStream.on('finish', resolve);
            fileStream.on('error', reject);
        });
    }

    async uploadToS3(localPath, key) {
        const fileStream = fs.createReadStream(localPath);
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
            Body: fileStream,
            ContentType: 'video/webm'
        };

        return this.s3.upload(params).promise();
    }

    cleanupTempFiles(filePaths) {
        filePaths.forEach(filePath => {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });
    }
}

module.exports = new VideoCompositionService();
```

### 3. Update Video Service

**File:** `services/VideoService.js`

Add the composition service import and update the upload logic:

```javascript
const VideoCompositionService = require('./VideoCompositionService');

// In your upload method:
async uploadVideo(req, res) {
    try {
        const screenFile = req.files?.video?.[0];
        const webcamFile = req.files?.webcam?.[0];
        
        if (!screenFile) {
            return res.status(400).json({ error: 'No video file uploaded' });
        }

        // Upload screen file
        const screenKey = await this.uploadToS3(screenFile);
        
        let finalVideoKey = screenKey;
        
        // Handle dual-stream composition
        if (webcamFile) {
            const webcamKey = await this.uploadToS3(webcamFile);
            const layout = req.body.layout || 'top-right';
            
            // Compose the videos
            finalVideoKey = await VideoCompositionService.composeVideoOverlay({
                screenKey,
                webcamKey,
                layout,
                outputKey: `composed/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`
            });
            
            // Clean up individual files
            await this.deleteFromS3(screenKey);
            await this.deleteFromS3(webcamKey);
        }

        // Create database record
        const recording = await this.createRecording({
            title: req.body.title,
            description: req.body.description,
            file_path: finalVideoKey,
            recording_type: req.body.recording_type,
            user_id: req.user.id,
            is_public: req.body.is_public === 'true'
        });

        res.json({ success: true, recording });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Upload failed: ' + error.message });
    }
}
```

### 4. Dependencies

**Package.json additions:**
```json
{
  "dependencies": {
    "fluent-ffmpeg": "^2.1.2",
    "aws-sdk": "^2.1000.0"
  }
}
```

**Install FFmpeg on server:**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# CentOS/RHEL
sudo yum install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

### 5. Environment Variables

**Add to .env:**
```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-video-bucket
```

### 6. Error Handling

Add proper error handling for composition failures:

```javascript
try {
    finalVideoKey = await VideoCompositionService.composeVideoOverlay({
        screenKey,
        webcamKey,
        layout,
        outputKey: `composed/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.webm`
    });
} catch (compositionError) {
    console.error('Composition failed:', compositionError);
    
    // Fallback: use screen recording only
    finalVideoKey = screenKey;
    
    // Log the error but don't fail the upload
    console.log('Using screen recording only due to composition failure');
}
```

## Testing

### 1. Test Single File Upload
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@screen-recording.webm" \
  -F "title=Test Recording" \
  -F "recording_type=screen"
```

### 2. Test Dual File Upload
```bash
curl -X POST http://localhost:3000/api/videos/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "video=@screen-recording.webm" \
  -F "webcam=@webcam-recording.webm" \
  -F "title=Test Dual Recording" \
  -F "recording_type=both" \
  -F "layout=top-right"
```

## Benefits

1. **No browser throttling** - Screen recording continues when switching windows
2. **Better quality** - Server-side composition with FFmpeg
3. **Reliable** - No canvas/requestAnimationFrame dependencies
4. **Flexible** - Multiple overlay positions supported
5. **Scalable** - Composition happens on server, not client

## Migration Notes

- Existing single-file uploads continue to work
- New dual-file uploads automatically get composed
- Backward compatibility maintained
- No database schema changes required
