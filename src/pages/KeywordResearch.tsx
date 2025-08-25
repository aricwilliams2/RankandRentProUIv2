import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Card,
    CardContent,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Container,
    Paper,
    Divider,
    Tabs,
    Tab,
    IconButton,
    Snackbar,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip,
} from '@mui/material';
import { Search, TrendingUp, Target, Calendar, Bookmark, BookmarkPlus, Save, X, Youtube } from 'lucide-react';
import posthog from 'posthog-js';
import { useAuth } from '../contexts/AuthContext';
import { useSavedKeywords } from '../hooks/useSavedKeywords';

interface KeywordSuggestion {
    keyword: string;
    difficulty: string;
    volume: string | null;
    lastUpdated: string;
}

interface KeywordSuggestionsResponse {
    status: string;
    Ideas: KeywordSuggestion[];
    Questions: KeywordSuggestion[];
}

const KeywordResearch: React.FC = () => {
    const { isAuthenticated } = useAuth();
    const { saveKeyword, checkIfSaved } = useSavedKeywords();

    const [keyword, setKeyword] = useState('');
    const [country, setCountry] = useState('us');
    const [searchEngine, setSearchEngine] = useState('google');
    const [ideas, setIdeas] = useState<KeywordSuggestion[]>([]);
    const [questions, setQuestions] = useState<KeywordSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    // New state for save functionality
    const [savedStatus, setSavedStatus] = useState<Record<string, boolean>>({});
    const [saveDialogOpen, setSaveDialogOpen] = useState(false);
    const [selectedSuggestion, setSelectedSuggestion] = useState<KeywordSuggestion | null>(null);
    const [saveNotes, setSaveNotes] = useState('');
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    const countries = [
        { code: 'us', name: 'United States' },
        { code: 'uk', name: 'United Kingdom' },
        { code: 'ca', name: 'Canada' },
        { code: 'au', name: 'Australia' },
        { code: 'de', name: 'Germany' },
        { code: 'fr', name: 'France' },
        { code: 'es', name: 'Spain' },
        { code: 'it', name: 'Italy' },
    ];

    const searchEngines = [
        { code: 'google', name: 'Google' },
        { code: 'bing', name: 'Bing' },
        { code: 'yahoo', name: 'Yahoo' },
    ];

    const fetchSuggestions = async () => {
        if (!keyword.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const params = new URLSearchParams({
                keyword: keyword.trim(),
                country,
                se: searchEngine,
            });

            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/keyword-suggestions?${params}`);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch suggestions');
            }

            const data: KeywordSuggestionsResponse = await response.json();
            setIdeas(data.Ideas || []);
            setQuestions(data.Questions || []);

            // Check saved status for all suggestions
            if (isAuthenticated) {
                const allSuggestions = [...(data.Ideas || []), ...(data.Questions || [])];
                const savedStatusMap: Record<string, boolean> = {};

                for (const suggestion of allSuggestions) {
                    const isSaved = await checkIfSaved(suggestion.keyword, 'idea');
                    savedStatusMap[suggestion.keyword] = isSaved;
                }

                setSavedStatus(savedStatusMap);
            }

            // Track keyword research event
            posthog.capture('keyword_research_performed', {
                keyword: keyword.trim(),
                country,
                search_engine: searchEngine,
                ideas_count: data.Ideas?.length || 0,
                questions_count: data.Questions?.length || 0,
                total_results: (data.Ideas?.length || 0) + (data.Questions?.length || 0),
            });

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');

            // Track error event
            posthog.capture('keyword_research_error', {
                keyword: keyword.trim(),
                country,
                search_engine: searchEngine,
                error: err instanceof Error ? err.message : 'Unknown error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchSuggestions();
    };

    const handleSaveKeyword = (suggestion: KeywordSuggestion, category: 'idea' | 'question') => {
        if (!isAuthenticated) {
            setSnackbar({
                open: true,
                message: 'Please log in to save keywords',
                severity: 'error',
            });
            return;
        }

        setSelectedSuggestion(suggestion);
        setSaveNotes('');
        setSaveDialogOpen(true);
    };

    const confirmSaveKeyword = async () => {
        if (!selectedSuggestion) return;

        setSaving(true);
        try {
            const category = activeTab === 0 ? 'idea' : 'question';

            await saveKeyword({
                keyword: selectedSuggestion.keyword,
                difficulty: selectedSuggestion.difficulty,
                volume: selectedSuggestion.volume || '',
                last_updated: selectedSuggestion.lastUpdated,
                search_engine: searchEngine,
                country,
                category,
                notes: saveNotes.trim() || undefined,
            });

            // Update saved status
            setSavedStatus(prev => ({
                ...prev,
                [selectedSuggestion.keyword]: true,
            }));

            setSnackbar({
                open: true,
                message: 'Keyword saved successfully!',
                severity: 'success',
            });

            // Track save event
            posthog.capture('keyword_saved', {
                keyword: selectedSuggestion.keyword,
                category,
                has_notes: !!saveNotes.trim(),
            });

        } catch (err) {
            setSnackbar({
                open: true,
                message: err instanceof Error ? err.message : 'Failed to save keyword',
                severity: 'error',
            });
        } finally {
            setSaving(false);
            setSaveDialogOpen(false);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty.toLowerCase()) {
            case 'easy':
                return 'success';
            case 'medium':
                return 'warning';
            case 'hard':
                return 'error';
            default:
                return 'default';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString();
        } catch {
            return 'N/A';
        }
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    const handleYouTubeSearch = (keyword: string) => {
        const searchQuery = encodeURIComponent(keyword);
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
        window.open(youtubeSearchUrl, '_blank');
    };

    const renderSuggestionCard = (suggestion: KeywordSuggestion, index: number, category: 'idea' | 'question') => (
        <Grid item xs={12} sm={6} md={4} key={index}>
            <Card
                elevation={2}
                sx={{
                    height: '100%',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                    }
                }}
            >
                <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography
                            variant="h6"
                            component="h3"
                            sx={{
                                fontWeight: 'bold',
                                color: 'primary.main',
                                wordBreak: 'break-word',
                                flex: 1,
                                mr: 1
                            }}
                        >
                            {suggestion.keyword}
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Search on YouTube">
                                <IconButton
                                    onClick={() => handleYouTubeSearch(suggestion.keyword)}
                                    color="error"
                                    size="small"
                                >
                                    <Youtube size={16} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title={savedStatus[suggestion.keyword] ? 'Already saved' : 'Save keyword'}>
                                <IconButton
                                    onClick={() => handleSaveKeyword(suggestion, category)}
                                    color={savedStatus[suggestion.keyword] ? 'primary' : 'default'}
                                    size="small"
                                >
                                    {savedStatus[suggestion.keyword] ? <Bookmark size={16} /> : <BookmarkPlus size={16} />}
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TrendingUp size={16} color="#666" />
                            <Typography variant="body2" color="text.secondary">
                                Volume:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {suggestion.volume || 'N/A'}
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Target size={16} color="#666" />
                            <Typography variant="body2" color="text.secondary">
                                Difficulty:
                            </Typography>
                            <Chip
                                label={suggestion.difficulty || 'N/A'}
                                color={getDifficultyColor(suggestion.difficulty) as any}
                                size="small"
                                variant="outlined"
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Calendar size={16} color="#666" />
                            <Typography variant="body2" color="text.secondary">
                                Updated:
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                {formatDate(suggestion.lastUpdated)}
                            </Typography>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
    );

    const totalResults = ideas.length + questions.length;

    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                    Keyword Research
                </Typography>

                <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                    <form onSubmit={handleSubmit}>
                        <Grid container spacing={3} alignItems="end">
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Seed Keyword"
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    placeholder="Enter a keyword to research..."
                                    required
                                    disabled={loading}
                                />
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel>Country</InputLabel>
                                    <Select
                                        value={country}
                                        label="Country"
                                        onChange={(e) => setCountry(e.target.value)}
                                    >
                                        {countries.map((country) => (
                                            <MenuItem key={country.code} value={country.code}>
                                                {country.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={3}>
                                <FormControl fullWidth disabled={loading}>
                                    <InputLabel>Search Engine</InputLabel>
                                    <Select
                                        value={searchEngine}
                                        label="Search Engine"
                                        onChange={(e) => setSearchEngine(e.target.value)}
                                    >
                                        {searchEngines.map((engine) => (
                                            <MenuItem key={engine.code} value={engine.code}>
                                                {engine.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} md={2}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    fullWidth
                                    disabled={loading || !keyword.trim()}
                                    startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                                    sx={{ height: 56 }}
                                >
                                    {loading ? 'Searching...' : 'Search'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {totalResults > 0 && (
                    <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                                Keyword Suggestions
                            </Typography>
                            <Chip
                                label={`${totalResults} total results`}
                                color="primary"
                                size="small"
                                sx={{ ml: 2 }}
                            />
                        </Box>

                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={activeTab} onChange={handleTabChange} aria-label="keyword suggestions tabs">
                                <Tab
                                    label={`Keyword Ideas (${ideas.length})`}
                                    id="tab-0"
                                    aria-controls="tabpanel-0"
                                />
                                <Tab
                                    label={`Question Keywords (${questions.length})`}
                                    id="tab-1"
                                    aria-controls="tabpanel-1"
                                />
                            </Tabs>
                        </Box>

                        <div
                            role="tabpanel"
                            hidden={activeTab !== 0}
                            id="tabpanel-0"
                            aria-labelledby="tab-0"
                        >
                            {activeTab === 0 && ideas.length > 0 && (
                                <Grid container spacing={3}>
                                    {ideas.map((idea, index) => renderSuggestionCard(idea, index, 'idea'))}
                                </Grid>
                            )}
                            {activeTab === 0 && ideas.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No keyword ideas found
                                    </Typography>
                                </Box>
                            )}
                        </div>

                        <div
                            role="tabpanel"
                            hidden={activeTab !== 1}
                            id="tabpanel-1"
                            aria-labelledby="tab-1"
                        >
                            {activeTab === 1 && questions.length > 0 && (
                                <Grid container spacing={3}>
                                    {questions.map((question, index) => renderSuggestionCard(question, index, 'question'))}
                                </Grid>
                            )}
                            {activeTab === 1 && questions.length === 0 && (
                                <Box sx={{ textAlign: 'center', py: 8 }}>
                                    <Typography variant="h6" color="text.secondary">
                                        No question keywords found
                                    </Typography>
                                </Box>
                            )}
                        </div>
                    </Box>
                )}

                {!loading && !error && totalResults === 0 && keyword && (
                    <Box sx={{ textAlign: 'center', py: 8 }}>
                        <Typography variant="h6" color="text.secondary">
                            No suggestions found for "{keyword}"
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Try a different keyword or search parameters
                        </Typography>
                    </Box>
                )}

                {/* Save Keyword Dialog */}
                <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
                    <DialogTitle>
                        Save Keyword
                        <IconButton
                            aria-label="close"
                            onClick={() => setSaveDialogOpen(false)}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                            }}
                        >
                            <X />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="h6" color="primary">
                                {selectedSuggestion?.keyword}
                            </Typography>
                        </Box>
                        <TextField
                            fullWidth
                            label="Notes (optional)"
                            multiline
                            rows={4}
                            value={saveNotes}
                            onChange={(e) => setSaveNotes(e.target.value)}
                            placeholder="Add notes about this keyword..."
                            sx={{ mt: 2 }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setSaveDialogOpen(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button
                            onClick={confirmSaveKeyword}
                            variant="contained"
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={16} /> : <Save />}
                        >
                            {saving ? 'Saving...' : 'Save Keyword'}
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                >
                    <Alert
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Container>
    );
};

export default KeywordResearch;