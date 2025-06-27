import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
  Rating,
  Alert,
  Paper,
  CircularProgress,
} from '@mui/material';
import {
  Search,
  Plus,
  Trash2,
  Globe,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  Link as LinkIcon,
  AlertTriangle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Star,
  Bookmark,
  Eye,
  Activity,
  BarChart3,
} from 'lucide-react';
import { useApiContext } from '../contexts/ApiContext';
import type { MarketResearch, CompetitorAnalysis, KeywordOpportunity } from '../types';

const niches = [
  'Plumbing',
  'HVAC',
  'Pest Control',
  'Roofing',
  'Landscaping',
  'Moving Services',
  'House Cleaning',
  'Carpet Cleaning',
  'Tree Service',
  'Garage Door Repair',
  'Junk Removal',
  'Demolition',
];

const locations = [
  'Miami, FL',
  'Orlando, FL',
  'Tampa, FL',
  'Jacksonville, FL',
  'Atlanta, GA',
  'Houston, TX',
  'Dallas, TX',
  'Phoenix, AZ',
  'Las Vegas, NV',
  'Denver, CO',
  'Knoxville, TN',
  'Nashville, TN',
];

export default function Research() {
  const { 
    loading, 
    error, 
    research, 
    startNewResearch
  } = useApiContext();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [selectedResearch, setSelectedResearch] = useState<MarketResearch | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    niche: '',
    location: '',
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setFormData({ niche: '', location: '' });
  };

  const handleAnalysisOpen = (item: MarketResearch) => {
    setSelectedResearch(item);
    setAnalysisOpen(true);
  };

  const handleAnalysisClose = () => {
    setAnalysisOpen(false);
    setSelectedResearch(null);
  };

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    try {
      await startNewResearch(formData.niche, formData.location);
    } finally {
      setAnalyzing(false);
      handleDialogClose();
    }
  };

  const handleDelete = (id: string) => {
    // In a real app, we'd delete from the API here
    // For now, we'll just close any related dialogs
    if (selectedResearch?.id === id) {
      handleAnalysisClose();
    }
  };

  const getStatusColor = (status: MarketResearch['status']) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'archived':
        return 'default';
    }
  };

  const getStatusIcon = (status: MarketResearch['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in_progress':
        return <Activity size={16} />;
      case 'archived':
        return <Eye size={16} />;
    }
  };

  const getCompetitionColor = (score: number) => {
    if (score < 40) return 'success';
    if (score < 70) return 'warning';
    return 'error';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'success';
    if (difficulty < 60) return 'warning';
    return 'error';
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Market Research
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleDialogOpen}
        >
          New Research
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {loading && research.length === 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      )}

      <Grid container spacing={3}>
        {research.map((item) => (
          <Grid item xs={12} md={6} key={item.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Target size={20} />
                      <Typography variant="h6">{item.niche}</Typography>
                      <Chip
                        size="small"
                        label={item.status}
                        color={getStatusColor(item.status)}
                        icon={getStatusIcon(item.status)}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {item.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </Box>

                {item.status === 'completed' ? (
                  <>
                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Search Volume</Typography>
                              <TrendingUp size={16} />
                            </Box>
                            <Typography variant="h6">{item.monthlySearchVolume.toLocaleString()}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Competition</Typography>
                              <Users size={16} />
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="h6">{item.competitionScore}</Typography>
                              <Chip
                                size="small"
                                label={item.competitionScore < 40 ? 'Low' : item.competitionScore < 70 ? 'Medium' : 'High'}
                                color={getCompetitionColor(item.competitionScore)}
                              />
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Est. Value</Typography>
                              <DollarSign size={16} />
                            </Box>
                            <Typography variant="h6">${item.estimatedValue}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={6}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" color="text.secondary">Competitors</Typography>
                              <Globe size={16} />
                            </Box>
                            <Typography variant="h6">{item.competitors.length}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<BarChart3 size={18} />}
                        onClick={() => handleAnalysisOpen(item)}
                      >
                        View Analysis
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Bookmark size={18} />}
                      >
                        Save Report
                      </Button>
                    </Box>
                  </>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Analysis in progress...
                    </Typography>
                    <LinearProgress />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* New Research Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>New Market Research</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Niche</InputLabel>
              <Select
                value={formData.niche}
                label="Niche"
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              >
                {niches.map((niche) => (
                  <MenuItem key={niche} value={niche}>
                    {niche}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Location</InputLabel>
              <Select
                value={formData.location}
                label="Location"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              >
                {locations.map((location) => (
                  <MenuItem key={location} value={location}>
                    {location}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleStartAnalysis}
            disabled={analyzing || !formData.niche || !formData.location}
          >
            {analyzing ? 'Analyzing...' : 'Start Analysis'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Analysis Dialog */}
      <Dialog
        open={analysisOpen}
        onClose={handleAnalysisClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChart3 size={20} />
            <Typography variant="h6">Market Analysis</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedResearch?.niche} in {selectedResearch?.location}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedResearch && (
            <Box sx={{ mt: 2 }}>
              {/* Competitors Analysis */}
              <Typography variant="h6" gutterBottom>
                Competitor Analysis
              </Typography>
              <TableContainer sx={{ mb: 4 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Domain</TableCell>
                      <TableCell>DA</TableCell>
                      <TableCell>Backlinks</TableCell>
                      <TableCell>Keywords</TableCell>
                      <TableCell>Traffic</TableCell>
                      <TableCell>Weaknesses</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedResearch.competitors.map((competitor) => (
                      <TableRow key={competitor.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} />
                            {competitor.domain}
                          </Box>
                        </TableCell>
                        <TableCell>{competitor.domainAuthority}</TableCell>
                        <TableCell>{competitor.backlinks}</TableCell>
                        <TableCell>{competitor.organicKeywords}</TableCell>
                        <TableCell>{competitor.estimatedTraffic}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {competitor.weaknesses.map((weakness, index) => (
                              <Chip
                                key={index}
                                size="small"
                                label={weakness}
                                color="error"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Keyword Opportunities */}
              <Typography variant="h6" gutterBottom>
                Keyword Opportunities
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Keyword</TableCell>
                      <TableCell>Volume</TableCell>
                      <TableCell>Difficulty</TableCell>
                      <TableCell>CPC</TableCell>
                      <TableCell>Competition</TableCell>
                      <TableCell>Intent</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedResearch.keywordOpportunities.map((keyword) => (
                      <TableRow key={keyword.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Target size={16} />
                            {keyword.keyword}
                          </Box>
                        </TableCell>
                        <TableCell>{keyword.searchVolume}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">{keyword.difficulty}</Typography>
                            <Chip
                              size="small"
                              label={keyword.difficulty < 30 ? 'Easy' : keyword.difficulty < 60 ? 'Medium' : 'Hard'}
                              color={getDifficultyColor(keyword.difficulty)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>${keyword.cpc.toFixed(2)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={keyword.competition}
                            color={keyword.competition === 'low' ? 'success' : keyword.competition === 'medium' ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={keyword.intent}
                            variant="outlined"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Notes & Recommendations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedResearch.notes}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAnalysisClose}>Close</Button>
          <Button variant="contained" startIcon={<FileText size={16} />}>
            Export Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}