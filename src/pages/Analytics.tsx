import React, { useState } from 'react';
import {
  Box,
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
  Paper,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  TrendingUp,
  Link as LinkIcon,
  Search,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Activity,
  Award,
  Target,
  Users,
  BarChart3,
  DollarSign,
  Zap,
  Eye,
  ExpandMore,
  TrendingDown,
} from 'lucide-react';
import { useApiContext } from '../contexts/ApiContext';
import type { Website, SEOMetrics, UrlMetrics, KeywordMetrics, KeywordGenerator } from '../types';

// Mock data - replace with actual API calls
const mockWebsites: Website[] = [
  {
    id: '1',
    domain: 'acmeplumbing.com',
    niche: 'Plumbing',
    status: 'active',
    monthlyRevenue: 2500,
    phoneNumbers: [],
    leads: [],
    seoMetrics: {
      domainAuthority: 35,
      backlinks: 150,
      organicKeywords: 500,
      organicTraffic: 2000,
      topKeywords: ['emergency plumber', 'plumbing services', '24/7 plumber', 'commercial plumbing'],
      competitors: ['competitor1.com', 'competitor2.com'],
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

interface CompetitorMetrics {
  domain: string;
  domainAuthority: number;
  backlinks: number;
  organicKeywords: number;
  organicTraffic: number;
  commonKeywords: string[];
}

const mockCompetitorMetrics: CompetitorMetrics[] = [
  {
    domain: 'competitor1.com',
    domainAuthority: 42,
    backlinks: 230,
    organicKeywords: 750,
    organicTraffic: 3500,
    commonKeywords: ['emergency plumber', 'plumbing services'],
  },
  {
    domain: 'competitor2.com',
    domainAuthority: 28,
    backlinks: 95,
    organicKeywords: 320,
    organicTraffic: 1200,
    commonKeywords: ['24/7 plumber', 'commercial plumbing'],
  },
];

interface Backlink {
  id: string;
  url: string;
  domain: string;
  domainAuthority: number;
  anchor: string;
  status: 'active' | 'lost' | 'new';
  firstSeen: Date;
  lastSeen: Date;
}

const mockBacklinks: Backlink[] = [
  {
    id: '1',
    url: 'https://example.com/blog/best-plumbers',
    domain: 'example.com',
    domainAuthority: 45,
    anchor: 'professional plumbing services',
    status: 'active',
    firstSeen: new Date('2024-01-15'),
    lastSeen: new Date(),
  },
  {
    id: '2',
    url: 'https://directory.com/plumbers',
    domain: 'directory.com',
    domainAuthority: 55,
    anchor: 'emergency plumber',
    status: 'new',
    firstSeen: new Date('2024-03-10'),
    lastSeen: new Date(),
  },
  {
    id: '3',
    url: 'https://blog.com/home-maintenance',
    domain: 'blog.com',
    domainAuthority: 38,
    anchor: '24/7 plumbing',
    status: 'lost',
    firstSeen: new Date('2023-12-01'),
    lastSeen: new Date('2024-03-01'),
  },
];

export default function Analytics() {
  const [websites] = useState<Website[]>(mockWebsites);
  const [competitors] = useState<CompetitorMetrics[]>(mockCompetitorMetrics);
  const [backlinks] = useState<Backlink[]>(mockBacklinks);
  const [selectedWebsite] = useState<Website>(websites[0]);
  
  // New Ahrefs data states
  const [urlMetrics, setUrlMetrics] = useState<UrlMetrics | null>(null);
  const [keywordMetrics, setKeywordMetrics] = useState<KeywordMetrics | null>(null);
  const [keywordIdeas, setKeywordIdeas] = useState<KeywordGenerator | null>(null);
  const [searchUrl, setSearchUrl] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get API context
  const { getUrlMetrics, getKeywordMetrics, getKeywordIdeas } = useApiContext();

  const handleUrlSearch = async () => {
    if (!searchUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUrlMetrics(searchUrl);
      setUrlMetrics(data);
    } catch (err) {
      setError('Failed to fetch URL metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = async () => {
    if (!searchKeyword) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [metricsData, ideasData] = await Promise.all([
        getKeywordMetrics(searchKeyword),
        getKeywordIdeas(searchKeyword)
      ]);
      
      setKeywordMetrics(metricsData);
      setKeywordIdeas(ideasData);
    } catch (err) {
      setError('Failed to fetch keyword data');
    } finally {
      setLoading(false);
    }
  };

  const getMetricTrend = (current: number, baseline: number) => {
    const percentage = ((current - baseline) / baseline) * 100;
    return {
      value: Math.abs(percentage).toFixed(1) + '%',
      direction: percentage >= 0 ? 'up' : 'down',
      color: percentage >= 0 ? 'success.main' : 'error.main',
      icon: percentage >= 0 ? ArrowUpRight : ArrowDownRight,
    };
  };

  const getBacklinkStatusColor = (status: Backlink['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'new':
        return 'info';
      case 'lost':
        return 'error';
      default:
        return 'default';
    }
  };

  const getBacklinkStatusIcon = (status: Backlink['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={16} />;
      case 'new':
        return <TrendingUp size={16} />;
      case 'lost':
        return <AlertTriangle size={16} />;
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

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Last updated: {selectedWebsite.seoMetrics.lastUpdated.toLocaleString()}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={20} />}
        >
          Refresh Metrics
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Globe size={20} />
                URL Metrics Analysis
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Enter URL"
                  value={searchUrl}
                  onChange={(e) => setSearchUrl(e.target.value)}
                  placeholder="e.g., medium.com"
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleUrlSearch}
                  disabled={loading || !searchUrl}
                  startIcon={loading ? <CircularProgress size={16} /> : <Search size={16} />}
                  sx={{ minWidth: '120px' }}
                >
                  Analyze
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Target size={20} />
                Keyword Research
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                <TextField
                  label="Enter Keyword"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="e.g., fishing"
                  fullWidth
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={handleKeywordSearch}
                  disabled={loading || !searchKeyword}
                  startIcon={loading ? <CircularProgress size={16} /> : <Search size={16} />}
                  sx={{ minWidth: '120px' }}
                >
                  Research
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* URL Metrics Results */}
      {urlMetrics && urlMetrics.success && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <BarChart3 size={20} />
              URL Metrics: {searchUrl}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {/* Page Metrics */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Page Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <LinkIcon size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.page.backlinks)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Backlinks
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Globe size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.page.refDomains)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ref Domains
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Users size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(Math.round(urlMetrics.data.page.traffic))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traffic
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <DollarSign size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          ${formatNumber(Math.round(urlMetrics.data.page.trafficValue))}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traffic Value
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Search size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.page.organicKeywords)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Keywords
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Award size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {urlMetrics.data.page.urlRating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          URL Rating
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              
              {/* Domain Metrics */}
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Domain Metrics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Award size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          {urlMetrics.data.domain.domainRating}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Domain Rating
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <TrendingUp size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          #{formatNumber(urlMetrics.data.domain.ahrefsRank)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Ahrefs Rank
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <LinkIcon size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.domain.backlinks)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Backlinks
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Users size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.domain.traffic)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traffic
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <DollarSign size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          ${formatNumber(urlMetrics.data.domain.trafficValue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traffic Value
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Search size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(urlMetrics.data.domain.organicKeywords)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Keywords
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Keyword Metrics Results */}
      {keywordMetrics && keywordMetrics.success && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Target size={20} />
              Keyword Analysis: "{searchKeyword}"
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Search size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(keywordMetrics.data.searchVolume)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monthly Searches (US)
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Globe size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(keywordMetrics.data.globalSearchVolume)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Global Volume
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Eye size={24} color="primary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(keywordMetrics.data.clicks)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Clicks
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <DollarSign size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          ${keywordMetrics.data.cpc.toFixed(2)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          CPC
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Zap size={24} color="secondary" />
                        <Typography variant="h6" fontWeight="bold">
                          {formatNumber(keywordMetrics.data.trafficPotential)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Traffic Potential
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <AlertTriangle size={24} color="error" />
                        <Typography variant="h6" fontWeight="bold">
                          {keywordMetrics.data.difficulty}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Difficulty Score
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle2" gutterBottom>
                      Keyword Insights
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText
                          primary="Competition Level"
                          secondary={
                            <Chip
                              size="small"
                              label={keywordMetrics.data.difficulty > 70 ? 'High' : keywordMetrics.data.difficulty > 40 ? 'Medium' : 'Low'}
                              color={keywordMetrics.data.difficulty > 70 ? 'error' : keywordMetrics.data.difficulty > 40 ? 'warning' : 'success'}
                            />
                          }
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Click-through Rate"
                          secondary={`${((keywordMetrics.data.clicks / keywordMetrics.data.searchVolume) * 100).toFixed(1)}%`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText
                          primary="Traffic Value"
                          secondary={`$${(keywordMetrics.data.trafficPotential * keywordMetrics.data.cpc).toFixed(2)}`}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Keyword Ideas Results */}
      {keywordIdeas && keywordIdeas.success && (
        <Accordion sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Search size={20} />
              Keyword Ideas ({keywordIdeas.data.allIdeas.results.length} of {formatNumber(keywordIdeas.data.allIdeas.total)})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Keyword</TableCell>
                    <TableCell>Difficulty</TableCell>
                    <TableCell>Volume</TableCell>
                    <TableCell>Last Updated</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {keywordIdeas.data.allIdeas.results.slice(0, 20).map((idea) => (
                    <TableRow key={idea.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {idea.keyword}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={idea.difficultyLabel}
                          color={getDifficultyColor(idea.difficultyLabel)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {idea.volumeLabel.replace(/([A-Z])/g, ' $1').trim()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(idea.updatedAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}
      <Grid container spacing={3}>
        {/* Overview Cards */}
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Award size={24} />
                <Typography color="success.main" variant="body2">
                  {getMetricTrend(selectedWebsite.seoMetrics.domainAuthority, 30).value}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {selectedWebsite.seoMetrics.domainAuthority}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Domain Authority
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <LinkIcon size={24} />
                <Typography color="success.main" variant="body2">
                  {getMetricTrend(selectedWebsite.seoMetrics.backlinks, 120).value}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {selectedWebsite.seoMetrics.backlinks}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total Backlinks
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Search size={24} />
                <Typography color="success.main" variant="body2">
                  {getMetricTrend(selectedWebsite.seoMetrics.organicKeywords, 400).value}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {selectedWebsite.seoMetrics.organicKeywords}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Ranking Keywords
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Users size={24} />
                <Typography color="success.main" variant="body2">
                  {getMetricTrend(selectedWebsite.seoMetrics.organicTraffic, 1500).value}
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {selectedWebsite.seoMetrics.organicTraffic.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Monthly Organic Traffic
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Keyword Rankings */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                Top Keywords
              </Typography>
              <List>
                {selectedWebsite.seoMetrics.topKeywords.map((keyword, index) => (
                  <React.Fragment key={keyword}>
                    <ListItem>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        <Target size={20} />
                      </ListItemIcon>
                      <ListItemText
                        primary={keyword}
                        secondary={`Position ${index + 1}-${index + 3}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          size="small"
                          label={`${Math.floor(Math.random() * 1000 + 500)} searches/mo`}
                          color="primary"
                        />
                        <Activity size={16} />
                      </Box>
                    </ListItem>
                    {index < selectedWebsite.seoMetrics.topKeywords.length - 1 && (
                      <Divider variant="inset" component="li" />
                    )}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Competitor Analysis */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                Competitor Analysis
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Domain</TableCell>
                      <TableCell align="right">DA</TableCell>
                      <TableCell align="right">Backlinks</TableCell>
                      <TableCell align="right">Keywords</TableCell>
                      <TableCell align="right">Traffic</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {competitors.map((competitor) => (
                      <TableRow key={competitor.domain}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} />
                            {competitor.domain}
                          </Box>
                        </TableCell>
                        <TableCell align="right">{competitor.domainAuthority}</TableCell>
                        <TableCell align="right">{competitor.backlinks}</TableCell>
                        <TableCell align="right">{competitor.organicKeywords}</TableCell>
                        <TableCell align="right">{competitor.organicTraffic}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Backlinks */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                Backlink Profile
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Source</TableCell>
                      <TableCell>Anchor Text</TableCell>
                      <TableCell>DA</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>First Seen</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {backlinks.map((backlink) => (
                      <TableRow key={backlink.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LinkIcon size={16} />
                            <Typography variant="body2">{backlink.domain}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{backlink.anchor}</TableCell>
                        <TableCell>{backlink.domainAuthority}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getBacklinkStatusIcon(backlink.status)}
                            <Chip
                              size="small"
                              label={backlink.status}
                              color={getBacklinkStatusColor(backlink.status)}
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          {backlink.firstSeen.toLocaleDateString()}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Visit Link">
                            <IconButton
                              size="small"
                              href={backlink.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink size={16} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}