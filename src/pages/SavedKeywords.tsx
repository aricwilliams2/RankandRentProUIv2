import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Grid,
    Card,
    CardContent,
    Chip,
    IconButton,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Pagination,
} from '@mui/material';
import { Delete, Edit, Search, Filter, Bookmark, Youtube } from 'lucide-react';
import { useSavedKeywords } from '../hooks/useSavedKeywords';
import { useAuth } from '../contexts/AuthContext';
import posthog from 'posthog-js';

const SavedKeywords: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { savedKeywords, loading, error, fetchSavedKeywords, deleteKeyword } = useSavedKeywords();

    const [search, setSearch] = useState('');
    const [category, setCategory] = useState<string>('');
    const [page, setPage] = useState(1);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedKeyword, setSelectedKeyword] = useState<any>(null);
    const [editNotes, setEditNotes] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchSavedKeywords({
                search: search.trim() || undefined,
                category: category || undefined,
                limit: 20,
                offset: (page - 1) * 20,
            });
        }
    }, [isAuthenticated, search, category, page]);

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this keyword?')) {
            try {
                await deleteKeyword(id);

                // Track delete event
                posthog.capture('keyword_deleted', {
                    keyword_id: id,
                });
            } catch (error) {
                console.error('Failed to delete keyword:', error);
            }
        }
    };

    const handleEdit = (keyword: any) => {
        setSelectedKeyword(keyword);
        setEditNotes(keyword.notes || '');
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedKeyword) return;

        try {
            // This would need to be implemented in the API
            // For now, we'll just close the dialog
            setEditDialogOpen(false);

            // Track edit event
            posthog.capture('keyword_edited', {
                keyword_id: selectedKeyword.id,
                has_notes: !!editNotes.trim(),
            });
        } catch (error) {
            console.error('Failed to edit keyword:', error);
        }
    };

    const handleYouTubeSearch = (keyword: string) => {
        const searchQuery = encodeURIComponent(keyword);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
        window.open(youtubeSearchUrl, '_blank');
    };

    if (!isAuthenticated) {
        return (
            <Container maxWidth="lg">
                <Box sx={{ py: 4, textAlign: 'center' }}>
                    <Typography variant="h5" color="text.secondary">
                        Please log in to view your saved keywords
                    </Typography>
                </Box>
            </Container>
        );
    }

    return (
        <Container maxWidth="lg">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    My Saved Keywords
                </Typography>

                {/* Filters */}
                <Box sx={{ mb: 3 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Search keywords"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                InputProps={{
                                    startAdornment: <Search size={20} style={{ marginRight: 8 }} />,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <FormControl fullWidth>
                                <InputLabel>Category</InputLabel>
                                <Select
                                    value={category}
                                    label="Category"
                                    onChange={(e) => setCategory(e.target.value)}
                                >
                                    <MenuItem value="">All Categories</MenuItem>
                                    <MenuItem value="idea">Ideas</MenuItem>
                                    <MenuItem value="question">Questions</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} md={3}>
                            <Button
                                fullWidth
                                variant="outlined"
                                startIcon={<Filter size={20} />}
                                onClick={() => {
                                    setSearch('');
                                    setCategory('');
                                    setPage(1);
                                }}
                            >
                                Clear Filters
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : savedKeywords.length > 0 ? (
                    <>
                        <Grid container spacing={3}>
                            {savedKeywords.map((keyword) => (
                                <Grid item xs={12} sm={6} md={4} key={keyword.id}>
                                    <Card elevation={2}>
                                        <CardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1, mr: 1 }}>
                                                    {keyword.keyword}
                                                </Typography>
                                                <Box>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleYouTubeSearch(keyword.keyword)}
                                                        title="Search on YouTube"
                                                        color="error"
                                                    >
                                                        <Youtube size={16} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleEdit(keyword)}
                                                        title="Edit notes"
                                                    >
                                                        <Edit size={16} />
                                                    </IconButton>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(keyword.id)}
                                                        title="Delete keyword"
                                                    >
                                                        <Delete size={16} />
                                                    </IconButton>
                                                </Box>
                                            </Box>

                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                <Chip
                                                    label={keyword.category}
                                                    color={keyword.category === 'idea' ? 'primary' : 'secondary'}
                                                    size="small"
                                                />
                                                <Chip
                                                    label={keyword.difficulty}
                                                    color={keyword.difficulty === 'Easy' ? 'success' : keyword.difficulty === 'Medium' ? 'warning' : 'error'}
                                                    size="small"
                                                    variant="outlined"
                                                />
                                            </Box>

                                            <Box sx={{ mb: 2 }}>
                                                <Typography variant="body2" color="text.secondary">
                                                    Volume: {keyword.volume}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Updated: {new Date(keyword.last_updated).toLocaleDateString()}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Search Engine: {keyword.search_engine}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Country: {keyword.country.toUpperCase()}
                                                </Typography>
                                            </Box>

                                            {keyword.notes && (
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Notes: {keyword.notes}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>

                        {/* Pagination would go here if needed */}
                        {savedKeywords.length >= 20 && (
                            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                                <Pagination
                                    count={Math.ceil(savedKeywords.length / 20)}
                                    page={page}
                                    onChange={(event, value) => setPage(value)}
                                    color="primary"
                                />
                            </Box>
                        )}
                    </>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Bookmark size={64} color="#ccc" style={{ marginBottom: 16 }} />
                        <Typography variant="h6" color="text.secondary">
                            No saved keywords found
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Start by saving keywords from your keyword research
                        </Typography>
                    </Box>
                )}

                {/* Edit Dialog */}
                <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>Edit Keyword Notes</DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" color="primary">
                                {selectedKeyword?.keyword}
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="Notes"
                            multiline
                            rows={4}
                            value={editNotes}
                            onChange={(e) => setEditNotes(e.target.value)}
                            placeholder="Add or edit notes about this keyword..."
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveEdit} variant="contained">
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Container>
    );
};

export default SavedKeywords;
