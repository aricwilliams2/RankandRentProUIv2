import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Box,
    Typography,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Chip,
    Grid,
} from '@mui/material';
import { Play, Clock, Eye, FileVideo, Calendar, User } from 'lucide-react';
import { apiCall } from '../config/api';
import { toAbsolute } from '../utils/url';

interface VideoData {
    id: string;
    title: string;
    description?: string;
    duration: number;
    file_size: number;
    recording_type: 'screen' | 'webcam' | 'both';
    video_url: string;
    thumbnail_url?: string;
    view_count: number;
    created_at: string;
    user_name?: string;
    is_public: boolean;
    shareable_id?: string;
}

const VideoPlayer: React.FC = () => {
    const { shareableId } = useParams<{ shareableId: string }>();
    const [video, setVideo] = useState<VideoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            if (!shareableId) {
                setError('Invalid video ID');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                console.log('Fetching video with shareableId:', shareableId);
                const response = await apiCall(`/api/videos/v/${shareableId}`);
                console.log('API Response status:', response.status);
                console.log('API Response ok:', response.ok);

                if (!response.ok) {
                    const errorData = await response.json();
                    console.log('Error data:', errorData);
                    throw new Error(errorData.error || 'Video not found');
                }

                const data = await response.json();
                console.log('Video data:', data);
                setVideo(data.recording);
            } catch (err: any) {
                console.error('Error fetching video:', err);
                setError(err.message || 'Failed to load video');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [shareableId]);

    const formatDuration = (seconds: number) => {
        if (!seconds || seconds <= 0) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatFileSize = (bytes: number) => {
        if (!bytes || bytes === 0) return 'Unknown';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                    <CircularProgress size={60} sx={{ color: 'white', mb: 2 }} />
                    <Typography variant="h6">Loading video...</Typography>
                </Box>
            </Box>
        );
    }

    if (error || !video) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                }}
            >
                <Card sx={{ maxWidth: 500, mx: 2 }}>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <FileVideo size={48} style={{ marginBottom: 16, opacity: 0.5 }} />
                        <Typography variant="h4" color="error" gutterBottom>
                            Video Not Found
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            {error || 'The video you\'re looking for doesn\'t exist or is not public.'}
                        </Typography>
                        <Link to="/" style={{ textDecoration: 'none' }}>
                            <Typography
                                variant="button"
                                sx={{
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' },
                                }}
                            >
                                Return to Home
                            </Typography>
                        </Link>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'grey.100', py: 4 }}>
            <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
                {/* Video Header */}
                <Card sx={{ mb: 3 }}>
                    <CardContent>
                        <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                            {video.title}
                        </Typography>
                        {video.description && (
                            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                {video.description}
                            </Typography>
                        )}
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            {video.user_name && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <User size={16} />
                                    <Typography variant="body2" color="text.secondary">
                                        {video.user_name}
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Calendar size={16} />
                                <Typography variant="body2" color="text.secondary">
                                    {new Date(video.created_at).toLocaleDateString()}
                                </Typography>
                            </Box>
                            {video.duration > 0 && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Clock size={16} />
                                    <Typography variant="body2" color="text.secondary">
                                        {formatDuration(video.duration)}
                                    </Typography>
                                </Box>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Eye size={16} />
                                <Typography variant="body2" color="text.secondary">
                                    {video.view_count} views
                                </Typography>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>

                {/* Video Player */}
                <Card sx={{ mb: 3, overflow: 'hidden' }}>
                    <Box sx={{ position: 'relative', bgcolor: 'black' }}>
                        {(() => {
                            const videoSrc = toAbsolute(video.video_url);
                            const posterSrc = video.thumbnail_url ? toAbsolute(video.thumbnail_url) : undefined;
                            const mime = videoSrc.endsWith('.webm') ? 'video/webm' : 'video/mp4';

                            return !videoSrc ? (
                                <Alert severity="error">No playable video URL provided.</Alert>
                            ) : (
                                <video
                                    style={{ width: '100%', height: 'auto', maxHeight: '70vh' }}
                                    controls
                                    poster={posterSrc}
                                    preload="metadata"
                                >
                                    <source src={videoSrc} type={mime} />
                                    Your browser does not support the video tag.
                                </video>
                            );
                        })()}
                    </Box>
                </Card>

                {/* Video Information */}
                <Card>
                    <CardContent>
                        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Play size={24} />
                            Video Information
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Duration
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatDuration(video.duration)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        File Size
                                    </Typography>
                                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                        {formatFileSize(video.file_size)}
                                    </Typography>
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Recording Type
                                    </Typography>
                                    <Chip
                                        label={video.recording_type || 'Unknown'}
                                        size="small"
                                        color="primary"
                                        variant="outlined"
                                    />
                                </Box>
                            </Grid>
                            <Grid item xs={12} sm={6} md={3}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Status
                                    </Typography>
                                    <Chip
                                        label={video.is_public ? 'Public' : 'Private'}
                                        size="small"
                                        color={video.is_public ? 'success' : 'warning'}
                                        variant="outlined"
                                    />
                                </Box>
                            </Grid>
                            {video.shareable_id && (
                                <Grid item xs={12}>
                                    <Box>
                                        <Typography variant="body2" color="text.secondary">
                                            Shareable ID
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 'medium', fontFamily: 'monospace' }}>
                                            {video.shareable_id}
                                        </Typography>
                                    </Box>
                                </Grid>
                            )}
                        </Grid>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
};

export default VideoPlayer;
