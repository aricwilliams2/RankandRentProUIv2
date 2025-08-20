import React, { useState, useRef, useEffect } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    Alert,
    Grid,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    CircularProgress,
    Divider,
} from '@mui/material';
import { Video, Square, Play, Download, Upload, Eye, Trash2, Share, BarChart3, Clock, FileVideo } from 'lucide-react';
import { apiCall } from '../config/api';

interface VideoRecorderProps {
    onRecordingComplete: (blob: Blob, metadata: any) => void;
    onError: (error: string) => void;
}

interface VideoRecording {
    id: string;
    title: string;
    description?: string;
    duration: number;
    file_size: number;
    recording_type: 'screen' | 'webcam' | 'both';
    shareable_url: string;
    view_count: number;
    created_at: string;
    is_public: boolean;
}

interface VideoAnalytics {
    total_views: number;
    unique_viewers: number;
    average_watch_time: number;
    completion_rate: number;
    top_viewers: Array<{
        ip_address: string;
        views: number;
        last_viewed: string;
    }>;
}

// Robust video readiness helpers
const waitForCanPlay = (el: HTMLVideoElement) =>
    new Promise<void>((resolve, reject) => {
        const onReady = () => resolve();
        const onError = (e: any) => reject(e);
        el.addEventListener('canplay', onReady, { once: true });
        el.addEventListener('error', onError, { once: true });
    });

const safePlay = async (el: HTMLVideoElement) => {
    try {
        await el.play();
    } catch (e) {
        console.log('Autoplay blocked, continuing...');
    }
};

const VideoRecorder: React.FC<VideoRecorderProps> = ({ onRecordingComplete, onError }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [recordingType, setRecordingType] = useState<'screen' | 'webcam' | 'both'>('screen');
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [recorder, setRecorder] = useState<MediaRecorder | null>(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [debugInfo, setDebugInfo] = useState<string>('');

    // Track individual streams for proper cleanup
    const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
    const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
    const [micStream, setMicStream] = useState<MediaStream | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const timeIntervalRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    // Helper to build a mixed audio stream
    const buildMixedAudioStream = (opts: { screen?: MediaStream; mic?: MediaStream }) => {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const destination = ctx.createMediaStreamDestination();

        const sources: MediaStreamAudioSourceNode[] = [];
        if (opts.screen && opts.screen.getAudioTracks().length) {
            sources.push(ctx.createMediaStreamSource(opts.screen));
        }
        if (opts.mic && opts.mic.getAudioTracks().length) {
            sources.push(ctx.createMediaStreamSource(opts.mic));
        }

        // Optional: let's keep default gains; you can add GainNodes to balance levels
        sources.forEach(s => s.connect(destination));

        return destination.stream; // contains ONE mixed audio track
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
            if (screenStream) {
                screenStream.getTracks().forEach(track => track.stop());
            }
            if (webcamStream) {
                webcamStream.getTracks().forEach(track => track.stop());
            }
            if (micStream) {
                micStream.getTracks().forEach(track => track.stop());
            }
            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [stream]); // Only depend on the main stream, not individual streams

    const startRecording = async () => {
        if (isRecording) {
            console.log('Already recording, ignoring start request');
            return;
        }

        try {
            setDebugInfo('Starting recording...');

            // Reset individual stream states
            setScreenStream(null);
            setWebcamStream(null);
            setMicStream(null);

            let mediaStream: MediaStream;

            if (recordingType === 'screen') {
                setDebugInfo('Getting screen stream...');
                const scr = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: 15 },
                    audio: true // system/tab audio if user checks the box in Chrome
                });
                setScreenStream(scr);

                setDebugInfo('Getting mic...');
                const mic = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                setMicStream(mic);

                const mixed = buildMixedAudioStream({ screen: scr, mic });

                mediaStream = new MediaStream([
                    ...scr.getVideoTracks(),
                    ...mixed.getAudioTracks() // exactly one mixed audio track
                ]);
                setDebugInfo('Screen stream obtained');
            } else if (recordingType === 'webcam') {
                setDebugInfo('Getting webcam stream...');
                const cam = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, frameRate: 15 },
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                setWebcamStream(cam);
                setMicStream(cam); // mic is inside this stream

                // Optional but consistent:
                const mixed = buildMixedAudioStream({ mic: cam });

                mediaStream = new MediaStream([
                    ...cam.getVideoTracks(),
                    ...(mixed.getAudioTracks().length ? mixed.getAudioTracks() : cam.getAudioTracks())
                ]);
                setDebugInfo('Webcam stream obtained');
            } else {
                // Screen + Webcam mode
                setDebugInfo('Getting screen and webcam streams...');
                const scr = await navigator.mediaDevices.getDisplayMedia({
                    video: { frameRate: 15 },
                    audio: true
                });
                const cam = await navigator.mediaDevices.getUserMedia({
                    video: { width: 1280, height: 720, frameRate: 15 },
                    audio: false // keep webcam silent to avoid echo
                });
                setScreenStream(scr);
                setWebcamStream(cam);

                setDebugInfo('Getting mic...');
                const mic = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                setMicStream(mic);

                setDebugInfo('Creating composite stream...');

                const canvas = canvasRef.current!;
                const ctx = canvas.getContext('2d')!;

                // Get the actual screen dimensions from the screen stream
                const screenTrack = scr.getVideoTracks()[0];
                const screenSettings = screenTrack.getSettings();
                const screenWidth = screenSettings.width || 1920;
                const screenHeight = screenSettings.height || 1080;

                // Set canvas to match screen resolution to avoid cropping
                canvas.width = screenWidth;
                canvas.height = screenHeight;

                // Build off-DOM video elements
                const screenVideo = document.createElement('video');
                const webcamVideo = document.createElement('video');

                Object.assign(screenVideo, { muted: true, playsInline: true, autoplay: true });
                Object.assign(webcamVideo, { muted: true, playsInline: true, autoplay: true });

                screenVideo.srcObject = scr;
                webcamVideo.srcObject = cam;

                // Wait until both can render real frames
                await Promise.all([waitForCanPlay(screenVideo), waitForCanPlay(webcamVideo)]);

                // Start them (guard against autoplay quirks)
                await Promise.all([safePlay(screenVideo), safePlay(webcamVideo)]);

                // Draw loop (use intrinsic sizes to avoid freezing on 0x0 frames)
                let rafId = 0;
                const drawFrame = () => {
                    const sw = screenVideo.videoWidth || canvas.width;
                    const sh = screenVideo.videoHeight || canvas.height;

                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(screenVideo, 0, 0, sw, sh);

                    // webcam picture-in-picture (proportional to screen size)
                    const pipW = Math.min(240, canvas.width * 0.15); // 15% of screen width, max 240px
                    const pipH = Math.min(180, canvas.height * 0.15); // 15% of screen height, max 180px
                    const margin = Math.min(16, canvas.width * 0.01); // 1% of screen width, max 16px

                    ctx.drawImage(
                        webcamVideo,
                        canvas.width - pipW - margin,
                        margin,
                        pipW,
                        pipH
                    );

                    rafId = requestAnimationFrame(drawFrame);
                };
                drawFrame();
                animationFrameRef.current = rafId;

                // Build the captured media stream (video from canvas + mixed audio)
                const canvasStream = canvas.captureStream(15);

                // Mix system audio (if present) + mic
                const mixed = buildMixedAudioStream({ screen: scr, mic });

                // Add ONE mixed audio track to the canvas stream
                const mixedTrack = mixed.getAudioTracks()[0];
                if (mixedTrack) canvasStream.addTrack(mixedTrack);

                mediaStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...(mixedTrack ? [mixedTrack] : [])
                ]);

                // Monitor for track interruptions
                scr.getVideoTracks().forEach(t => {
                    t.addEventListener('ended', () => {
                        setDebugInfo('Screen share ended by user');
                        stopRecording();
                    });
                });
                cam.getVideoTracks().forEach(t => {
                    t.addEventListener('ended', () => setDebugInfo('Webcam track ended'));
                });

                setDebugInfo(`Composite stream created at ${screenWidth}x${screenHeight}`);
            }

            setStream(mediaStream);

            // Show preview and force playback
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                try {
                    await videoRef.current.play();
                } catch (e) {
                    console.log('Preview autoplay blocked');
                }
            }

            // Use a codec matrix that prioritizes smaller file sizes
            let options: MediaRecorderOptions = {};

            const tryTypes = [
                'video/webm;codecs=vp9', // Prioritize VP9 for better compression
                'video/mp4;codecs=h264', // H.264 for Safari and good compression
                'video/webm;codecs=vp8', // Fallback to VP8
                'video/webm'
            ];

            for (const t of tryTypes) {
                if ((window as any).MediaRecorder?.isTypeSupported?.(t)) {
                    options.mimeType = t as any;
                    break;
                }
            }

            console.log('Using MediaRecorder options:', options);
            const mediaRecorder = new MediaRecorder(mediaStream, options);

            const chunks: Blob[] = [];

            mediaRecorder.ondataavailable = (event) => {
                console.log('Data available:', event.data.size, 'bytes');
                if (event.data.size > 0) {
                    chunks.push(event.data);
                }
            };

            mediaRecorder.onstop = () => {
                console.log('MediaRecorder stopped, chunks:', chunks.length);
                const mimeType = options.mimeType || 'video/webm';
                const blob = new Blob(chunks, { type: mimeType });

                // Get actual resolution for metadata
                let actualResolution = '1280x720'; // default for webcam
                if (recordingType === 'screen' || recordingType === 'both') {
                    const screenTrack = mediaStream.getVideoTracks().find(t => t.kind === 'video');
                    if (screenTrack) {
                        const settings = screenTrack.getSettings();
                        actualResolution = `${settings.width || 1280}x${settings.height || 720}`;
                    }
                }

                const metadata = {
                    recordingType,
                    duration: recordingTime,
                    resolution: actualResolution,
                    frameRate: 15, // Updated frame rate
                    quality: 'optimized',
                    mimeType: mimeType
                };

                console.log('Recording completed:', {
                    blobSize: blob.size,
                    chunks: chunks.length,
                    mimeType: mimeType,
                    resolution: actualResolution
                });

                if (blob.size === 0) {
                    onError('Recording failed: No data was captured');
                    return;
                }

                onRecordingComplete(blob, metadata);
            };

            setRecorder(mediaRecorder);

            // Small delay to ensure first frame is drawn
            await new Promise(r => setTimeout(r, 100));

            mediaRecorder.start(1000); // Collect data every second
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timeIntervalRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            setDebugInfo('Recording started successfully');

        } catch (error: any) {
            setDebugInfo(`Error: ${error.message}`);
            onError('Failed to start recording: ' + error.message);
        }
    };

    const stopRecording = async () => {
        if (!recorder || !isRecording) {
            console.log('No active recording to stop');
            return;
        }

        try {
            setDebugInfo('Stopping recording...');

            // Request data before stopping to ensure we get the final chunk
            recorder.requestData();

            // Small delay to ensure all data is captured
            await new Promise(resolve => setTimeout(resolve, 100));

            recorder.stop();

            // Stop animation frame if running
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }

            // Cleanup all media tracks
            if (stream) {
                stream.getTracks().forEach(track => {
                    console.log('Stopping composite track:', track.kind, track.label);
                    track.stop();
                });
            }

            // Cleanup individual streams
            if (screenStream) {
                screenStream.getTracks().forEach(track => {
                    console.log('Stopping screen track:', track.kind, track.label);
                    track.stop();
                });
                setScreenStream(null);
            }

            if (webcamStream) {
                webcamStream.getTracks().forEach(track => {
                    console.log('Stopping webcam track:', track.kind, track.label);
                    track.stop();
                });
                setWebcamStream(null);
            }

            if (micStream) {
                micStream.getTracks().forEach(track => {
                    console.log('Stopping mic track:', track.kind, track.label);
                    track.stop();
                });
                setMicStream(null);
            }

            // Clear video preview
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }

            if (timeIntervalRef.current) {
                clearInterval(timeIntervalRef.current);
            }

            setStream(null);
            setRecorder(null);
            setIsRecording(false);
            setRecordingTime(0);
            setDebugInfo('Recording stopped - camera turned off');

        } catch (error: any) {
            setDebugInfo(`Stop error: ${error.message}`);
            onError('Failed to stop recording: ' + error.message);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card>
            <CardContent>
                <Typography variant="h5" gutterBottom>
                    <Video size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    Video Recorder
                </Typography>

                {/* Debug Info */}
                {debugInfo && (
                    <Alert severity="info" sx={{ mb: 2 }}>
                        <Typography variant="body2">{debugInfo}</Typography>
                    </Alert>
                )}

                <Box sx={{ mb: 3 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Recording Type</InputLabel>
                        <Select
                            value={recordingType}
                            label="Recording Type"
                            onChange={(e) => setRecordingType(e.target.value as any)}
                            disabled={isRecording}
                        >
                            <MenuItem value="screen">Screen Only</MenuItem>
                            <MenuItem value="webcam">Webcam Only</MenuItem>
                            <MenuItem value="both">Screen + Webcam</MenuItem>
                        </Select>
                    </FormControl>

                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        {!isRecording ? (
                            <Button
                                variant="contained"
                                color="primary"
                                startIcon={<Play />}
                                onClick={startRecording}
                                size="large"
                            >
                                Start Recording
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<Square />}
                                onClick={stopRecording}
                                size="large"
                            >
                                Stop Recording ({formatTime(recordingTime)})
                            </Button>
                        )}
                    </Box>
                </Box>

                {/* Hidden canvas for compositing */}
                <canvas
                    ref={canvasRef}
                    style={{ display: 'none' }}
                />

                {/* Video Preview */}
                <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    />
                </Box>

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {recordingType === 'screen' && 'Recording your screen with audio'}
                        {recordingType === 'webcam' && 'Recording your webcam with audio'}
                        {recordingType === 'both' && 'Recording screen with audio + webcam overlay'}
                    </Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const VideoLibrary: React.FC = () => {
    const [recordings, setRecordings] = useState<VideoRecording[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRecording, setSelectedRecording] = useState<VideoRecording | null>(null);
    const [analytics, setAnalytics] = useState<VideoAnalytics | null>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
    const [uploadTitle, setUploadTitle] = useState('');
    const [uploadDescription, setUploadDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchRecordings();
    }, []);

    const fetchRecordings = async () => {
        try {
            setLoading(true);
            const response = await apiCall('api/videos/recordings');

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setRecordings(data.recordings || []);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchAnalytics = async (recordingId: string) => {
        try {
            setAnalyticsLoading(true);
            const response = await apiCall(`api/videos/recordings/${recordingId}/analytics`);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            setAnalytics(data);
        } catch (error: any) {
            console.error('Failed to fetch analytics:', error);
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const handleUploadVideo = async (blob: Blob, metadata: any) => {
        setUploadDialogOpen(true);
        // Store the blob temporarily
        (window as any).tempVideoBlob = blob;
        (window as any).tempVideoMetadata = metadata;
    };

    const confirmUpload = async () => {
        const blob = (window as any).tempVideoBlob;
        const metadata = (window as any).tempVideoMetadata;

        if (!blob) return;

        try {
            setUploading(true);
            const formData = new FormData();
            formData.append('video', blob, `recording-${Date.now()}.webm`);
            formData.append('title', uploadTitle || 'Untitled Recording');
            formData.append('description', uploadDescription);
            formData.append('is_public', 'true');
            formData.append('recording_type', metadata.recordingType);

            const response = await apiCall('api/videos/upload', {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            setUploadDialogOpen(false);
            setUploadTitle('');
            setUploadDescription('');
            fetchRecordings(); // Refresh the list

            // Clean up temp data
            delete (window as any).tempVideoBlob;
            delete (window as any).tempVideoMetadata;
        } catch (error: any) {
            setError('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const deleteRecording = async (recordingId: string) => {
        if (!window.confirm('Are you sure you want to delete this recording?')) return;

        try {
            const response = await apiCall(`api/videos/recordings/${recordingId}`, { method: 'DELETE' });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            fetchRecordings(); // Refresh the list
        } catch (error: any) {
            setError('Delete failed: ' + error.message);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading) {
        return (
            <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography sx={{ mt: 2 }}>Loading recordings...</Typography>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5">
                        <FileVideo size={24} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                        Video Library
                    </Typography>
                    <Button
                        variant="outlined"
                        startIcon={<Upload />}
                        onClick={() => setUploadDialogOpen(true)}
                    >
                        Upload Video
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {recordings.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <FileVideo size={48} style={{ opacity: 0.5, marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            No recordings yet
                        </Typography>
                        <Typography color="text.secondary">
                            Start recording or upload a video to see it here
                        </Typography>
                    </Box>
                ) : (
                    <List>
                        {recordings.map((recording) => (
                            <React.Fragment key={recording.id}>
                                <ListItem>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="h6">{recording.title}</Typography>
                                                <Chip
                                                    label={recording.recording_type}
                                                    size="small"
                                                    color="primary"
                                                    variant="outlined"
                                                />
                                                {recording.is_public && (
                                                    <Chip
                                                        label="Public"
                                                        size="small"
                                                        color="success"
                                                        variant="outlined"
                                                    />
                                                )}
                                            </Box>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="body2" color="text.secondary">
                                                    {recording.description || 'No description'}
                                                </Typography>
                                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                                    <Chip
                                                        icon={<Clock size={14} />}
                                                        label={formatDuration(recording.duration)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        icon={<Eye size={14} />}
                                                        label={`${recording.view_count} views`}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                    <Chip
                                                        label={formatFileSize(recording.file_size)}
                                                        size="small"
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <IconButton
                                                onClick={() => {
                                                    setSelectedRecording(recording);
                                                    fetchAnalytics(recording.id);
                                                }}
                                                title="View Analytics"
                                            >
                                                <BarChart3 size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => window.open(recording.shareable_url, '_blank')}
                                                title="View Video"
                                            >
                                                <Play size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = recording.shareable_url;
                                                    a.download = `${recording.title}.webm`;
                                                    a.click();
                                                }}
                                                title="Download"
                                            >
                                                <Download size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    navigator.clipboard.writeText(recording.shareable_url);
                                                }}
                                                title="Copy Share Link"
                                            >
                                                <Share size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => deleteRecording(recording.id)}
                                                title="Delete"
                                                color="error"
                                            >
                                                <Trash2 size={20} />
                                            </IconButton>
                                        </Box>
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <Divider />
                            </React.Fragment>
                        ))}
                    </List>
                )}

                {/* Analytics Dialog */}
                <Dialog
                    open={!!selectedRecording}
                    onClose={() => setSelectedRecording(null)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Analytics: {selectedRecording?.title}
                    </DialogTitle>
                    <DialogContent>
                        {analyticsLoading ? (
                            <Box sx={{ textAlign: 'center', py: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : analytics ? (
                            <Grid container spacing={3}>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h4" color="primary">
                                                {analytics.total_views}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Total Views
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h4" color="secondary">
                                                {analytics.unique_viewers}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Unique Viewers
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h4" color="info.main">
                                                {formatDuration(analytics.average_watch_time)}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Avg Watch Time
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={6}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h4" color="success.main">
                                                {analytics.completion_rate.toFixed(1)}%
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Completion Rate
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Top Viewers
                                    </Typography>
                                    <List dense>
                                        {analytics.top_viewers.map((viewer, index) => (
                                            <ListItem key={index}>
                                                <ListItemText
                                                    primary={`${viewer.ip_address} (${viewer.views} views)`}
                                                    secondary={new Date(viewer.last_viewed).toLocaleString()}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                </Grid>
                            </Grid>
                        ) : (
                            <Typography color="text.secondary">
                                No analytics data available
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSelectedRecording(null)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* Upload Dialog */}
                <Dialog
                    open={uploadDialogOpen}
                    onClose={() => setUploadDialogOpen(false)}
                    maxWidth="sm"
                    fullWidth
                >
                    <DialogTitle>Upload Video</DialogTitle>
                    <DialogContent>
                        <TextField
                            fullWidth
                            label="Title"
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Description"
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            margin="normal"
                            multiline
                            rows={3}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
                        <Button
                            onClick={confirmUpload}
                            variant="contained"
                            disabled={uploading}
                        >
                            {uploading ? <CircularProgress size={20} /> : 'Upload'}
                        </Button>
                    </DialogActions>
                </Dialog>
            </CardContent>
        </Card>
    );
};

const VideoRecording: React.FC = () => {
    const [recordingBlob, setRecordingBlob] = useState<Blob | null>(null);
    const [recordingMetadata, setRecordingMetadata] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedRecording, setUploadedRecording] = useState<any>(null);

    const handleRecordingComplete = async (blob: Blob, metadata: any) => {
        setRecordingBlob(blob);
        setRecordingMetadata(metadata);
        setError(null);

        // Automatically upload to cloud storage
        await uploadToCloud(blob, metadata);
    };

    const uploadToCloud = async (blob: Blob, metadata: any) => {
        try {
            setUploading(true);
            setUploadProgress(0);

            // Get title from user
            const title = prompt('Enter a title for your recording:') || 'My Recording';
            const description = prompt('Enter a description (optional):') || '';

            // Create FormData for upload
            const formData = new FormData();
            formData.append('video', blob, `recording-${Date.now()}.webm`);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('is_public', 'true');
            formData.append('recording_type', metadata.recordingType);

            // Simulate upload progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 90) {
                        clearInterval(progressInterval);
                        return 90;
                    }
                    return prev + 10;
                });
            }, 200);

            // Upload to API
            const response = await apiCall('/api/videos/upload', {
                method: 'POST',
                body: formData,
                headers: {} // Let browser set Content-Type for FormData
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            clearInterval(progressInterval);
            setUploadProgress(100);

            // Store uploaded recording data
            setUploadedRecording(data.recording);

            // Show success message
            const successMessage = `
🎉 Video uploaded successfully!

Title: ${data.recording.title}
Duration: ${data.recording.duration}s
Share URL: ${data.recording.shareable_url}

Click OK to open the video in a new tab.
            `;

            if (window.confirm(successMessage)) {
                window.open(data.recording.shareable_url, '_blank');
            }

            // Switch to library tab to show the uploaded video
            setTimeout(() => {
                setActiveTab(1);
            }, 1000);

        } catch (error: any) {
            setError('Upload failed: ' + error.message);
            console.error('Upload error:', error);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    };

    const handleError = (error: string) => {
        setError(error);
    };

    const handleNewRecording = () => {
        setRecordingBlob(null);
        setRecordingMetadata(null);
        setError(null);
        setUploadedRecording(null);
    };

    return (
        <Box>
            <Typography variant="h4" gutterBottom>
                Video Recording Studio
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Record your screen or webcam. Videos are automatically uploaded to cloud storage with analytics.
            </Typography>

            <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
                <Tab label="Record" />
                <Tab label="Library" />
            </Tabs>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {activeTab === 0 && (
                <>
                    {!recordingBlob ? (
                        <VideoRecorder
                            onRecordingComplete={handleRecordingComplete}
                            onError={handleError}
                        />
                    ) : (
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Recording Complete!
                                </Typography>

                                {uploading ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CircularProgress sx={{ mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Uploading to Cloud Storage...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" gutterBottom>
                                            {uploadProgress}% Complete
                                        </Typography>
                                        <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden' }}>
                                            <Box
                                                sx={{
                                                    width: `${uploadProgress}%`,
                                                    height: 8,
                                                    bgcolor: 'primary.main',
                                                    transition: 'width 0.3s ease'
                                                }}
                                            />
                                        </Box>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                            Your video will be available in the Library tab once upload completes.
                                        </Typography>
                                    </Box>
                                ) : uploadedRecording ? (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <Alert severity="success" sx={{ mb: 3 }}>
                                            ✅ Video uploaded successfully to cloud storage!
                                        </Alert>

                                        <video
                                            src={URL.createObjectURL(recordingBlob)}
                                            controls
                                            style={{ width: '100%', maxHeight: '400px', marginBottom: 16 }}
                                        />

                                        <Box sx={{ mb: 2 }}>
                                            <Chip
                                                label={`Duration: ${Math.floor(recordingMetadata.duration / 60)}:${(recordingMetadata.duration % 60).toString().padStart(2, '0')}`}
                                                color="primary"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={`Type: ${recordingMetadata.recordingType}`}
                                                color="secondary"
                                                sx={{ mr: 1 }}
                                            />
                                            <Chip
                                                label={`Size: ${(recordingBlob.size / 1024 / 1024).toFixed(1)} MB`}
                                                color="info"
                                            />
                                        </Box>

                                        <Box sx={{ mb: 3 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Video Details
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Title:</strong> {uploadedRecording.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                <strong>Share URL:</strong> {uploadedRecording.shareable_url}
                                            </Typography>
                                        </Box>

                                        <Grid container spacing={2} justifyContent="center">
                                            <Grid item>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    startIcon={<Download />}
                                                    onClick={() => {
                                                        const url = URL.createObjectURL(recordingBlob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `recording-${Date.now()}.webm`;
                                                        a.click();
                                                        URL.revokeObjectURL(url);
                                                    }}
                                                >
                                                    Download Local Copy
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    onClick={() => window.open(uploadedRecording.shareable_url, '_blank')}
                                                >
                                                    View in Cloud
                                                </Button>
                                            </Grid>
                                            <Grid item>
                                                <Button
                                                    variant="outlined"
                                                    onClick={handleNewRecording}
                                                >
                                                    Record Another
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                ) : (
                                    <Box sx={{ textAlign: 'center', py: 4 }}>
                                        <CircularProgress sx={{ mb: 2 }} />
                                        <Typography variant="h6" gutterBottom>
                                            Processing Recording...
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Preparing your video for cloud upload...
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            {activeTab === 1 && (
                <VideoLibrary />
            )}
        </Box>
    );
};

export default VideoRecording;