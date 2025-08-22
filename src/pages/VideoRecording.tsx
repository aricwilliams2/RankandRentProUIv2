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
import { toLocalShareUrl, generateShareableUrl } from '../utils/url';

// Helper to await an event once
const once = (emitter: any, event: string) =>
    new Promise<void>(resolve => {
        const h = () => { emitter.removeEventListener?.(event, h); resolve(); };
        emitter.addEventListener?.(event, h, { once: true });
        // Fallback for MediaRecorder which uses onstop prop in some browsers:
        if (!emitter.addEventListener) {
            const prev = emitter['on' + event as 'onstop'];
            emitter['on' + event as 'onstop'] = (...args: any[]) => {
                prev && prev(...args);
                resolve();
            };
        }
    });

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
    shareable_id?: string;
    video_url?: string;
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
    const webcamPreviewRef = useRef<HTMLVideoElement | null>(null);
    const timeIntervalRef = useRef<number | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const [pipActive, setPipActive] = useState(false);
    
    // Keep a handle to PiP windows so you can close/cleanup later
    const pipWinRef = useRef<Window | null>(null);
    
    // Loom-style compositing refs
    const screenVidRef = useRef<HTMLVideoElement>(document.createElement('video'));
    const camVidRef = useRef<HTMLVideoElement>(document.createElement('video'));
    const composeCanvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
    const composedStreamRef = useRef<MediaStream | null>(null);
    
    // Draggable bubble box (canvas coordinates)
    const [camBox, setCamBox] = useState({ x: 24, y: 24, w: 240, h: 240 }); // square → circle mask

    // PiP helper functions
    const enterPiP = async () => {
        const el = webcamPreviewRef.current;
        if (!el) return;
        // Safari uses webkit APIs
        // @ts-ignore
        if (document.pictureInPictureEnabled && !el.disablePictureInPicture) {
            if (document.pictureInPictureElement) await document.exitPictureInPicture();
            await el.requestPictureInPicture(); // must be user-gesture chained
            setPipActive(true);
            // @ts-ignore
        } else if (el.webkitSupportsPresentationMode && typeof el.webkitSetPresentationMode === 'function') {
            // Safari fallback
            // @ts-ignore
            el.webkitSetPresentationMode('picture-in-picture');
            setPipActive(true);
        }
    };

    const exitPiP = async () => {
        // @ts-ignore
        if (document.pictureInPictureElement) {
            // @ts-ignore
            await document.exitPictureInPicture();
            // @ts-ignore
        } else if (webcamPreviewRef.current?.webkitPresentationMode === 'picture-in-picture') {
            // @ts-ignore
            webcamPreviewRef.current.webkitSetPresentationMode('inline');
        }
        setPipActive(false);
    };

    const openFloatingCam = async () => {
        // Prefer Document Picture-in-Picture (Chrome/Edge)
        const anyWin = window as any;
        if (anyWin.documentPictureInPicture && webcamStream) {
            // If already open, focus it
            if (pipWinRef.current && !pipWinRef.current.closed) {
                pipWinRef.current.focus();
                return;
            }

            const pipWindow: Window = await anyWin.documentPictureInPicture.requestWindow({
                width: 240,
                height: 160
            });

            pipWinRef.current = pipWindow;

            // Basic styles
            const doc = pipWindow.document;
            doc.body.style.margin = '0';
            doc.body.style.background = 'black';

            // Create the video element inside the PiP window
            const v = doc.createElement('video');
            v.autoplay = true;
            v.muted = true;     // mute so it can autoplay
            v.playsInline = true;
            // @ts-ignore
            v.srcObject = webcamStream;
            v.style.width = '100%';
            v.style.height = '100%';
            v.style.objectFit = 'cover';
            doc.body.appendChild(v);

            // Optional: rounded corners / subtle shadow
            const style = doc.createElement('style');
            style.textContent = `
                video { border-radius: 12px; }
                html, body { width: 100%; height: 100%; }
            `;
            doc.head.appendChild(style);

            // If the user closes the PiP window, clear our ref
            pipWindow.addEventListener('pagehide', () => {
                pipWinRef.current = null;
            });
            return;
        }

        // Fallback: Classic PiP on the inline overlay element
        await enterPiP();
    };

    const closeFloatingCam = async () => {
        if (pipWinRef.current && !pipWinRef.current.closed) {
            pipWinRef.current.close();
            pipWinRef.current = null;
        }
        await exitPiP();
    };

    // DPiP HUD for always-on-top bubble
    const openFloatingCamHUD = async (camStream: MediaStream) => {
        const anyWin = window as any;
        // Prefer DPiP (Chrome/Edge). Fallback to classic PiP if not available.
        if (!anyWin.documentPictureInPicture) {
            // classic PiP fallback – visible but NOT draggable; still helpful
            const el = webcamPreviewRef.current;
            if (el && !document.pictureInPictureElement) {
                el.srcObject = camStream;
                await el.requestPictureInPicture().catch(() => { });
            }
            return;
        }

        // If already open, focus
        if (pipWinRef.current && !pipWinRef.current.closed) {
            pipWinRef.current.focus();
            return;
        }

        const pipWindow: Window = await anyWin.documentPictureInPicture.requestWindow({
            width: 240, height: 240
        });
        pipWinRef.current = pipWindow;

        // Build HUD document
        const doc = pipWindow.document;
        doc.body.style.margin = '0';
        doc.body.style.background = 'transparent';
        doc.body.style.userSelect = 'none';

        const wrap = doc.createElement('div');
        wrap.style.cssText = `
            width:100%;height:100%;
            display:flex;align-items:center;justify-content:center;
            background:transparent;
        `;
        const v = doc.createElement('video');
        v.autoplay = true;
        v.muted = true;        // allow autoplay
        v.playsInline = true;
        // @ts-ignore
        v.srcObject = camStream;
        v.style.cssText = `
            width: 100%; height: 100%;
            object-fit: cover;
            border-radius: 9999px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.35);
            cursor: grab;
            background:black;
        `;
        wrap.appendChild(v);
        doc.body.appendChild(wrap);

        // --- Drag inside the HUD; report position back to the main page ---
        // We'll send normalized center coords + size (0..1), so main page can map to canvas.
        let dragging = false, startX = 0, startY = 0, cx = 0.85, cy = 0.15, size = 0.25; // initial pos/size
        const send = () => {
            pipWindow.opener?.postMessage(
                { type: 'pip-drag', cx, cy, size }, '*'
            );
        };
        send();

        const onDown = (e: MouseEvent) => { dragging = true; startX = e.clientX; startY = e.clientY; v.style.cursor = 'grabbing'; };
        const onMove = (e: MouseEvent) => {
            if (!dragging) return;
            const dx = e.clientX - startX, dy = e.clientY - startY;
            startX = e.clientX; startY = e.clientY;
            const W = doc.documentElement.clientWidth, H = doc.documentElement.clientHeight;
            // move center by delta normalized to window size
            cx = Math.min(0.98, Math.max(0.02, cx + dx / W));
            cy = Math.min(0.98, Math.max(0.02, cy + dy / H));
            wrap.style.justifyContent = cx < 0.5 ? 'flex-start' : (cx > 0.5 ? 'flex-end' : 'center');
            wrap.style.alignItems = cy < 0.5 ? 'flex-start' : (cy > 0.5 ? 'flex-end' : 'center');
            send();
        };
        const onUp = () => { dragging = false; v.style.cursor = 'grab'; };

        v.addEventListener('mousedown', onDown);
        doc.addEventListener('mousemove', onMove);
        doc.addEventListener('mouseup', onUp);

        // Optional: scroll to resize bubble
        doc.addEventListener('wheel', (e) => {
            e.preventDefault();
            size = Math.min(0.6, Math.max(0.12, size + (e.deltaY < 0 ? 0.03 : -0.03)));
            v.style.width = v.style.height = `${Math.round(size * 100)}%`;
            send();
        }, { passive: false });

        // Keep some initial size
        v.style.width = v.style.height = `${Math.round(size * 100)}%`;

        // Cleanup
        pipWindow.addEventListener('pagehide', () => { pipWinRef.current = null; });
    };

    // Loom-style compositor
    const startLoomCompositor = async ({
        screen,
        cam,
        mixedAudio
    }: {
        screen: MediaStream;
        cam: MediaStream;
        mixedAudio: MediaStream;
    }) => {
        const screenVid = screenVidRef.current!;
        const camVid = camVidRef.current!;
        Object.assign(screenVid, { srcObject: screen, muted: true, playsInline: true });
        Object.assign(camVid, { srcObject: cam, muted: true, playsInline: true });
        await Promise.all([screenVid.play().catch(() => { }), camVid.play().catch(() => { })]);

        // Ensure screen video is playing for rVFC
        if (screenVid.paused) {
            await screenVid.play().catch(() => { });
        }

        // Canvas size = screen size
        const track = screen.getVideoTracks()[0];
        const s = track.getSettings();
        const width = (s.width as number) || 1920;
        const height = (s.height as number) || 1080;

        const canvas = composeCanvasRef.current!;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d', { alpha: false })!;

        // The stream we will record
        const composed = canvas.captureStream(30);
        // Add mixed audio track(s)
        mixedAudio.getAudioTracks().forEach(t => composed.addTrack(t));
        composedStreamRef.current = composed;

        // Draw loop driven by screen frames (resilient in bg tabs)
        let stopped = false;
        const draw = () => {
            if (stopped) return;
            // draw screen
            ctx.drawImage(screenVid, 0, 0, width, height);

            // draw circular webcam bubble with soft shadow
            const { x, y, w, h } = camBox;
            const r = Math.min(w, h) / 2;
            ctx.save();
            ctx.shadowColor = 'rgba(0,0,0,0.35)';
            ctx.shadowBlur = 24;
            ctx.shadowOffsetY = 10;
            ctx.beginPath();
            ctx.arc(x + w / 2, y + h / 2, r, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(camVid, x, y, w, h);
            ctx.restore();
        };

        const pump = () => {
            // @ts-ignore
            screenVid.requestVideoFrameCallback(() => { draw(); pump(); });
        };
        pump();

        return {
            stream: composed,
            stop: () => { stopped = true; }
        };
    };



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

    // Handle visibility changes to pause/resume recording (only for webcam-only mode)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (recorder && isRecording && recordingType === 'webcam') {
                if (document.hidden) {
                    setDebugInfo('Page hidden - webcam recording paused');
                    recorder.pause();
                } else {
                    setDebugInfo('Page visible - webcam recording resumed');
                    recorder.resume();
                }
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [recorder, isRecording, recordingType]);

    // Attach webcam stream to preview when it changes
    useEffect(() => {
        const el = webcamPreviewRef.current;
        if (recordingType !== 'both' || !webcamStream || !el) return;

        el.srcObject = webcamStream;
    }, [recordingType, webcamStream]);

    // Receive HUD messages and update the recorded bubble position
    useEffect(() => {
        const onMsg = (e: MessageEvent) => {
            if (!e?.data || e.data.type !== 'pip-drag') return;
            const { cx, cy, size } = e.data as { cx: number; cy: number; size: number };

            // Map normalized HUD coords → canvas coords
            const canvas = composeCanvasRef.current;
            if (!canvas) return;
            const W = canvas.width, H = canvas.height;
            const w = Math.round(W * size), h = w; // keep circle
            const x = Math.round(cx * W - w / 2);
            const y = Math.round(cy * H - h / 2);

            setCamBox(b => ({
                ...b, x: Math.max(0, Math.min(W - w, x)),
                y: Math.max(0, Math.min(H - h, y)),
                w, h
            }));
        };
        window.addEventListener('message', onMsg);
        return () => window.removeEventListener('message', onMsg);
    }, []);

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
            const isDual = recordingType === 'both';

            if (recordingType === 'screen') {
                setDebugInfo('Getting screen stream...');
                const scr = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        frameRate: { ideal: 30, max: 60 },
                        width: { ideal: 1920 },
                        height: { ideal: 1080 }
                    },
                    audio: true
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

                // Add event listeners for screen share interruptions
                scr.getVideoTracks().forEach(track => {
                    track.addEventListener('ended', () => {
                        setDebugInfo('Screen share ended by user');
                        stopRecording();
                    });
                    track.addEventListener('mute', () => setDebugInfo('Screen track muted'));
                    track.addEventListener('unmute', () => setDebugInfo('Screen track unmuted'));

                    // Monitor for track content changes
                    track.addEventListener('contentchange', () => {
                        setDebugInfo('Screen content changed - window switched');
                    });
                });

                setDebugInfo('Screen stream obtained - select "Entire Screen" for best results');
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
                // BOTH mode - Loom-style compositing
                setDebugInfo('Getting screen + webcam (Loom style)...');

                const scr = await navigator.mediaDevices.getDisplayMedia({
                    video: {
                        frameRate: { ideal: 30, max: 60 },
                        width: { ideal: 1920 }, height: { ideal: 1080 },

                        // ✅ Experimental but widely supported in Chromium – helps a lot:
                        // @ts-ignore
                        surfaceSwitching: 'include',          // let user change monitor/window during share
                        // @ts-ignore
                        monitorTypeSurfaces: 'include',       // show all monitors
                        // @ts-ignore
                        selfBrowserSurface: 'include',        // include this browser window in the picker
                        // ⚠️ Don't set displaySurface here; it's readonly (we'll *check* it below)
                    },
                    audio: {
                        // @ts-ignore
                        systemAudio: 'include'                // capture system audio when allowed
                    }
                });
                const cam = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30, max: 60 } },
                    audio: false
                });

                // Fail fast if the user didn't pick "Entire Screen"
                const track = scr.getVideoTracks()[0];
                const surf = (track.getSettings() as any).displaySurface; // 'monitor' | 'window' | 'browser' | 'application'

                if (surf !== 'monitor') {
                    setDebugInfo(
                        `You selected "${surf}". Pick "Your Entire Screen" for tab/app switching.`
                    );
                    // Auto-stop and reprompt so they can choose again:
                    scr.getTracks().forEach(t => t.stop());
                    return; // exit startRecording; user hits Start again
                }

                // Add resize listener for monitor switching
                track.addEventListener('resize', () => {
                    const s = track.getSettings();
                    const canvas = composeCanvasRef.current!;
                    canvas.width = (s.width as number) || canvas.width;
                    canvas.height = (s.height as number) || canvas.height;
                });

                setScreenStream(scr);
                setWebcamStream(cam);

                // Open the floating cam HUD when recording starts
                await openFloatingCamHUD(cam);

                // Mic narration
                const mic = await navigator.mediaDevices.getUserMedia({
                    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
                });
                setMicStream(mic);

                // Mix system + mic (you already have this helper)
                const mixed = buildMixedAudioStream({ screen: scr, mic });

                // Start compositor
                const { stream: composed } = await startLoomCompositor({ screen: scr, cam, mixedAudio: mixed });
                mediaStream = composed;
                setStream(composed);

                // Preview in your UI
                if (videoRef.current) {
                    videoRef.current.srcObject = composed;
                    try { await videoRef.current.play(); } catch { }
                }

                // Recorder (single)
                let options: MediaRecorderOptions = {};
                for (const t of ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm']) {
                    if ((window as any).MediaRecorder?.isTypeSupported?.(t)) { options.mimeType = t as any; break; }
                }
                if (options.mimeType?.includes('webm')) options.videoBitsPerSecond = 8_000_000;

                const mediaRecorder = new MediaRecorder(composed, options);
                const chunks: Blob[] = [];
                mediaRecorder.ondataavailable = e => e.data.size && chunks.push(e.data);
                mediaRecorder.onstop = () => {
                    const mt = options.mimeType || 'video/webm';
                    const blob = new Blob(chunks, { type: mt });
                    const st = composed.getVideoTracks()[0]?.getSettings?.() || {};
                    const metadata = {
                        recordingType: 'both',
                        duration: recordingTime,
                        resolution: `${st.width || 1280}x${st.height || 720}`,
                        frameRate: 30,
                        quality: 'optimized',
                        mimeType: mt
                    };
                    onRecordingComplete(blob, metadata);
                };

                setRecorder(mediaRecorder);
                mediaRecorder.start(1000);
                setIsRecording(true);
                setRecordingTime(0);
                timeIntervalRef.current = setInterval(() => setRecordingTime(p => p + 1), 1000);

                // Stop if screen sharing ends
                scr.getVideoTracks().forEach(t => t.addEventListener('ended', () => stopRecording()));

                setDebugInfo('Recording with Loom-style compositing');
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

            // Only create the generic single recorder for screen/webcam modes
            if (!isDual) {
                // Use a codec matrix that prioritizes quality and compatibility
                let options: MediaRecorderOptions = {};

                const tryTypes = [
                    'video/webm;codecs=vp9,opus', // Best quality and compression
                    'video/webm;codecs=vp8,opus', // Good compatibility
                    'video/webm;codecs=vp9', // VP9 without audio codec
                    'video/webm;codecs=vp8', // VP8 without audio codec
                    'video/mp4;codecs=h264', // H.264 for Safari
                    'video/webm' // Fallback
                ];

                for (const t of tryTypes) {
                    if ((window as any).MediaRecorder?.isTypeSupported?.(t)) {
                        options.mimeType = t as any;
                        break;
                    }
                }

                // Add bitrate settings for better quality
                if (options.mimeType?.includes('webm')) {
                    options.videoBitsPerSecond = 8000000; // 8 Mbps for high quality
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
                    if (recordingType === 'screen') {
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
                        frameRate: 30, // Updated to match our target FPS
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
            }

        } catch (error: any) {
            setDebugInfo(`Error: ${error.message}`);
            onError('Failed to start recording: ' + error.message);
        }
    };

    const stopRecording = async () => {
        const rec: any = recorder; // may hold {screenRecorder, webcamRecorder} in "both" mode

        if (!isRecording || !rec) {
            console.log('No active recording to stop');
            return;
        }

        try {
            setDebugInfo('Stopping recording...');

            // Close the HUD so we don't leave a floating window hanging
            if (pipWinRef.current && !pipWinRef.current.closed) {
                pipWinRef.current.close();
                pipWinRef.current = null;
            }
            try {
                await closeFloatingCam();
            } catch (e) {
                console.log('Error exiting PiP:', e);
            }

            if (rec?.stop) {
                // Single recorder mode (all modes now use single recorder)
                rec.requestData();
                await new Promise(r => setTimeout(r, 100));
                rec.stop();
            }

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

            // Cleanup compositor
            if (composedStreamRef.current) {
                composedStreamRef.current.getTracks().forEach(t => t.stop());
                composedStreamRef.current = null;
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

                {/* Hidden canvas for compositing - no longer used in dual-stream mode */}

                {/* Video Preview */}
                <Box sx={{ position: 'relative', bgcolor: 'black', borderRadius: 2, overflow: 'hidden' }}>
                    <video
                        ref={videoRef}
                        autoPlay
                        muted
                        playsInline
                        style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }}
                    />

                    {/* Preview bubble to match camBox */}
                    {recordingType === 'both' && (
                        <video
                            ref={webcamPreviewRef}
                            autoPlay
                            muted
                            playsInline
                            onMouseDown={(e) => {
                                const startX = e.clientX, startY = e.clientY;
                                const startBox = { ...camBox };
                                const move = (ev: MouseEvent) => {
                                    const dx = ev.clientX - startX, dy = ev.clientY - startY;
                                    setCamBox(b => ({
                                        ...b,
                                        x: Math.max(8, Math.min(startBox.x + dx, (videoRef.current?.clientWidth || 0) - b.w - 8)),
                                        y: Math.max(8, Math.min(startBox.y + dy, (videoRef.current?.clientHeight || 0) - b.h - 8))
                                    }));
                                };
                                const up = () => {
                                    window.removeEventListener('mousemove', move);
                                    window.removeEventListener('mouseup', up);
                                };
                                window.addEventListener('mousemove', move);
                                window.addEventListener('mouseup', up);
                            }}
                            style={{
                                position: 'absolute',
                                left: camBox.x, top: camBox.y, width: camBox.w, height: camBox.h,
                                borderRadius: '9999px', objectFit: 'cover', background: 'black',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.35)', cursor: 'grab', zIndex: 2,
                                display: webcamStream ? 'block' : 'none' // show only when ready
                            }}
                        // srcObject set in code
                        />
                    )}
                </Box>

                {/* Loom-style compositing info */}
                {recordingType === 'both' && (
                    <Box sx={{ mt: 1, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                        <Typography variant="body2" color="info.contrastText">
                            💡 A floating webcam bubble will appear when recording starts. Drag it to reposition, scroll to resize. The bubble is burned into the recording and stays visible even when switching tabs.
                        </Typography>
                    </Box>
                )}

                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {recordingType === 'screen' && 'Recording your screen with audio. Select "Entire Screen" when prompted for best window switching support.'}
                        {recordingType === 'webcam' && 'Recording your webcam with audio'}
                        {recordingType === 'both' && 'Recording screen with audio + webcam overlay. Select "Entire Screen" when prompted for best window switching support.'}
                    </Typography>
                                         {(recordingType === 'screen' || recordingType === 'both') && (
                         <Alert severity="info" sx={{ mt: 2 }}>
                             <Typography variant="body2">
                                 <strong>Tip:</strong> When the screen selection dialog appears, choose "Entire Screen" instead of "Application Window" or "Browser Tab" to capture all windows and applications when you switch between them. The recording will continue even when you switch to other windows.
                             </Typography>
                             {recordingType === 'both' && (
                                 <Typography variant="body2" sx={{ mt: 1 }}>
                                     <strong>Monitor Switching:</strong> Click the screen-share banner's "Change" button to switch monitors while recording.
                                 </Typography>
                             )}
                         </Alert>
                     )}
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

            // Determine the correct file extension based on MIME type
            let fileExtension = 'webm';
            if (metadata?.mimeType?.includes('mp4')) {
                fileExtension = 'mp4';
            } else if (metadata?.mimeType?.includes('webm')) {
                fileExtension = 'webm';
            }

            const formData = new FormData();
            formData.append('video', blob, `recording-${Date.now()}.${fileExtension}`);
            formData.append('title', uploadTitle || 'Untitled Recording');
            formData.append('description', uploadDescription);
            formData.append('is_public', 'true');
            formData.append('recording_type', metadata?.recordingType || 'screen');
            formData.append('mime_type', metadata?.mimeType || 'video/webm');

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
                                                onClick={() => window.open(generateShareableUrl(recording.shareable_id || ''), '_blank')}
                                                title="View Video"
                                            >
                                                <Play size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    const a = document.createElement('a');
                                                    a.href = recording.video_url || recording.shareable_url;
                                                    a.download = `${recording.title}.webm`;
                                                    a.click();
                                                }}
                                                title="Download"
                                            >
                                                <Download size={20} />
                                            </IconButton>
                                            <IconButton
                                                onClick={() => {
                                                    const shareableUrl = generateShareableUrl(recording.shareable_id || '');
                                                    navigator.clipboard.writeText(shareableUrl);
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

            // Determine the correct file extension based on MIME type
            let fileExtension = 'webm';
            if (metadata.mimeType?.includes('mp4')) {
                fileExtension = 'mp4';
            } else if (metadata.mimeType?.includes('webm')) {
                fileExtension = 'webm';
            }

            // Create FormData for upload
            const formData = new FormData();
            formData.append('video', blob, `recording-${Date.now()}.${fileExtension}`);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('is_public', 'true');
            formData.append('recording_type', metadata.recordingType);
            formData.append('mime_type', metadata.mimeType || 'video/webm');

            // Add webcam blob for dual-track recordings
            if (metadata.multiTrack && metadata.webcamBlob) {
                formData.append('webcam', metadata.webcamBlob, `webcam-${Date.now()}.${fileExtension}`);
                formData.append('layout', 'top-right'); // optional hint for server overlay position
            }

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

            // Debug: Log the blob details
            console.log('Uploading blob:', {
                size: blob.size,
                type: blob.type,
                mimeType: metadata.mimeType,
                fileExtension: fileExtension
            });

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
Share URL: ${generateShareableUrl(data.recording.shareable_id || '')}

Click OK to open the video in a new tab.
             `;

            if (window.confirm(successMessage)) {
                window.open(generateShareableUrl(data.recording.shareable_id || ''), '_blank');
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
                                                <strong>Share URL:</strong> {generateShareableUrl(uploadedRecording.shareable_id || '')}
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
                                                    onClick={() => window.open(generateShareableUrl(uploadedRecording.shareable_id || ''), '_blank')}
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