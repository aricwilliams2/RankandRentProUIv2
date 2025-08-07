import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, Tooltip } from '@mui/material';
import { Play, Pause, Download, Volume2, Phone } from 'lucide-react';
import { twilioApi } from '../services/twilioApi';

interface RecordingPlayerProps {
    recordingUrl?: string;
    recordingSid?: string;
    duration: number;
    callSid: string;
    onError?: (error: string) => void;
    // Enhanced props from new API
    fromNumber?: string;
    toNumber?: string;
    callDuration?: number;
    callStatus?: string;
    createdAt?: Date;
}

export const RecordingPlayer: React.FC<RecordingPlayerProps> = ({
    recordingUrl,
    recordingSid,
    duration,
    callSid,
    onError,
    fromNumber,
    toNumber,
    callDuration,
    callStatus,
    createdAt
}) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [loading, setLoading] = useState(false);
    const [audioError, setAudioError] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Determine the best audio URL to use (prefer proxy endpoint)
    const [authenticatedAudioUrl, setAuthenticatedAudioUrl] = useState<string | null>(null);
    const [isLoadingAuth, setIsLoadingAuth] = useState(false);

    const audioUrl = React.useMemo(() => {
        if (recordingSid) {
            // Use authenticated endpoint for proper authorization
            return authenticatedAudioUrl || recordingUrl;
        }
        return recordingUrl;
    }, [recordingSid, recordingUrl, authenticatedAudioUrl]);

    // Load authenticated audio URL when recordingSid changes
    React.useEffect(() => {
        if (recordingSid && !authenticatedAudioUrl) {
            setIsLoadingAuth(true);
            twilioApi.getRecordingStreamWithAuth(recordingSid)
                .then(url => {
                    setAuthenticatedAudioUrl(url);
                    setIsLoadingAuth(false);
                })
                .catch(error => {
                    console.error('Failed to load authenticated recording:', error);
                    setIsLoadingAuth(false);
                    // Fallback to query parameter method
                    setAuthenticatedAudioUrl(twilioApi.getRecordingStream(recordingSid));
                });
        }
    }, [recordingSid, authenticatedAudioUrl]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const initializeAudio = () => {
        if (!audioRef.current && audioUrl) {
            console.log('RecordingPlayer: Initializing audio with URL:', audioUrl);
            audioRef.current = new Audio(audioUrl);

            audioRef.current.addEventListener('loadstart', () => setLoading(true));
            audioRef.current.addEventListener('canplay', () => setLoading(false));
            audioRef.current.addEventListener('timeupdate', () => {
                if (audioRef.current) {
                    setCurrentTime(audioRef.current.currentTime);
                }
            });
            audioRef.current.addEventListener('ended', () => {
                setIsPlaying(false);
                setCurrentTime(0);
            });
            audioRef.current.addEventListener('error', (e) => {
                const errorMsg = 'Failed to load recording';
                setAudioError(errorMsg);
                setLoading(false);
                setIsPlaying(false);
                onError?.(errorMsg);
                console.error('Audio playback error:', e);
            });
        }
    };

    const togglePlayback = async () => {
        if (!audioUrl) {
            const errorMsg = 'No recording URL available';
            setAudioError(errorMsg);
            onError?.(errorMsg);
            console.log('RecordingPlayer: No recording URL provided');
            return;
        }

        if (isLoadingAuth) {
            console.log('RecordingPlayer: Still loading authenticated URL');
            return;
        }

        console.log('RecordingPlayer: Attempting to play:', audioUrl);

        initializeAudio();

        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
                setIsPlaying(false);
            } else {
                setLoading(true);
                setAudioError(null);
                await audioRef.current.play();
                setIsPlaying(true);
                setLoading(false);
            }
        } catch (error) {
            const errorMsg = 'Failed to play recording';
            setAudioError(errorMsg);
            setLoading(false);
            setIsPlaying(false);
            onError?.(errorMsg);
            console.error('Playback error:', error);
        }
    };

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
        if (audioRef.current && duration > 0) {
            const rect = event.currentTarget.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const width = rect.width;
            const newTime = (clickX / width) * duration;
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const downloadRecording = async () => {
        if (!audioUrl) return;

        try {
            const response = await fetch(audioUrl);
            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `recording-${callSid}.wav`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            const errorMsg = 'Failed to download recording';
            setAudioError(errorMsg);
            onError?.(errorMsg);
            console.error('Download failed:', error);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    if (audioError) {
        return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.6 }}>
                <Volume2 size={16} color="gray" />
                <Typography variant="caption" color="error">
                    {audioError}
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
            {/* Play/Pause Button */}
            <Tooltip title={isPlaying ? 'Pause' : 'Play'}>
                <IconButton
                    onClick={togglePlayback}
                    disabled={loading || !recordingUrl}
                    size="small"
                    sx={{
                        width: 32,
                        height: 32,
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&:disabled': { bgcolor: 'grey.300' }
                    }}
                >
                    {loading ? (
                        <Box
                            sx={{
                                width: 16,
                                height: 16,
                                border: '2px solid currentColor',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }}
                        />
                    ) : isPlaying ? (
                        <Pause size={16} />
                    ) : (
                        <Play size={16} style={{ marginLeft: 2 }} />
                    )}
                </IconButton>
            </Tooltip>

            {/* Progress Bar */}
            <Box sx={{ flex: 1, minWidth: 80 }}>
                <Box
                    sx={{
                        height: 6,
                        bgcolor: 'grey.300',
                        borderRadius: 3,
                        cursor: 'pointer',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                    onClick={handleSeek}
                >
                    <Box
                        sx={{
                            height: '100%',
                            bgcolor: 'primary.main',
                            borderRadius: 3,
                            width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%`,
                            transition: 'width 0.1s ease'
                        }}
                    />
                </Box>
            </Box>

            {/* Time Display */}
            <Typography variant="caption" sx={{ minWidth: 45, textAlign: 'center', fontFamily: 'monospace' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            {/* Download Button */}
            <Tooltip title="Download Recording">
                <IconButton
                    onClick={downloadRecording}
                    size="small"
                    disabled={!audioUrl}
                    sx={{ ml: 0.5 }}
                >
                    <Download size={16} />
                </IconButton>
            </Tooltip>

            {/* Enhanced Call Information */}
            {(fromNumber || toNumber || callDuration || callStatus || createdAt) && (
                <Box sx={{ ml: 2, minWidth: 200 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                        <Phone size={12} />
                        <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                            {fromNumber} → {toNumber}
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {callDuration && (
                            <Typography variant="caption" color="text.secondary">
                                Call: {formatTime(callDuration)}
                            </Typography>
                        )}
                        {callStatus && (
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                                {callStatus}
                            </Typography>
                        )}
                    </Box>
                    {createdAt && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                            {createdAt.toLocaleDateString()} {createdAt.toLocaleTimeString()}
                        </Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};