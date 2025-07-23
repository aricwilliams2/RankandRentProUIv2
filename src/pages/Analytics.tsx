import React, { useState, useEffect } from 'react';
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
  TextField,
  Alert,
  CircularProgress,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { TrendingUp, Link as LinkIcon, Search, Globe, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, Activity, Award, Target, Users, BarChart3, DollarSign, Zap, Eye, Expand as ExpandMore, TrendingDown } from 'lucide-react';
import { useApiContext } from '../contexts/ApiContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Website, UrlMetrics, KeywordMetrics, KeywordGenerator } from '../types';

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    getUrlMetrics, 
    getKeywordMetrics, 
    getKeywordIdeas, 
    getWebsites,
    loading: apiLoading,
    error: apiError 
  } = useApiContext();

  // State for dynamic data
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [urlMetrics, setUrlMetrics] = useState<UrlMetrics | null>(null);
  const [keywordMetrics, setKeywordMetrics] = useState<KeywordMetrics | null>(null);
  const [keywordIdeas, setKeywordIdeas] = useState<KeywordGenerator | null>(null);
  
  // Form states
  const [searchUrl, setSearchUrl] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedKeyword, setSelectedKeyword] = useState('');
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load websites on component mount
  useEffect(() => {
    const loadWebsites = async () => {
      try {
        const websitesData = await getWebsites();
        setWebsites(websitesData);
        
        // Check if we have website data from navigation
        const state = location.state as { website?: Website, domain?: string, keywords?: string[] };
        if (state?.website) {
          setSelectedWebsite(state.website);
          setSearchUrl(state.website.domain);
          if (state.website.seoMetrics?.topKeywords?.length > 0) {
            setSearchKeyword(state.website.seoMetrics.topKeywords[0]);
          }
          // Auto-load analytics for the selected website
          await loadAnalyticsForWebsite(state.website);
        } else if (state?.domain) {
          setSearchUrl(state.domain);
          if (state.keywords && state.keywords.length > 0) {
            setSearchKeyword(state.keywords[0]);
          }
          // Auto-load analytics for the domain
          await handleUrlSearch(state.domain);
          if (state.keywords && state.keywords.length > 0) {
            await handleKeywordSearch(state.keywords[0]);
          }
        } else if (websitesData.length > 0) {
          // Default to first website if no specific data passed
          setSelectedWebsite(websitesData[0]);
          setSearchUrl(websitesData[0].domain);
        }
      } catch (err) {
        setError('Failed to load websites');
      }
    };

    loadWebsites();
  }, [location.state]);

  const loadAnalyticsForWebsite = async (website: Website) => {
    setLoading(true);
    setError(null);
    
    try {
      // Load URL metrics for the website
      const urlData = await getUrlMetrics(website.domain);
      setUrlMetrics(urlData);

      // Load keyword data for the top keyword if available
      if (website.seoMetrics?.topKeywords?.length > 0) {
        const topKeyword = website.seoMetrics.topKeywords[0];
        const [metricsData, ideasData] = await Promise.all([
          getKeywordMetrics(topKeyword),
          getKeywordIdeas(topKeyword)
        ]);
        
        setKeywordMetrics(metricsData);
        setKeywordIdeas(ideasData);
        setSelectedKeyword(topKeyword);
      }
    } catch (err) {
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleWebsiteChange = async (websiteId: string) => {
    const website = websites.find(w => w.id === websiteId);
    if (website) {
      setSelectedWebsite(website);
      setSearchUrl(website.domain);
      if (website.seoMetrics?.topKeywords?.length > 0) {
        setSearchKeyword(website.seoMetrics.topKeywords[0]);
      }
      await loadAnalyticsForWebsite(website);
    }
  };

  const handleUrlSearch = async (url?: string) => {
    const targetUrl = url || searchUrl;
    if (!targetUrl) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getUrlMetrics(targetUrl);
      setUrlMetrics(data);
    } catch (err) {
      setError('Failed to fetch URL metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordSearch = async (keyword?: string) => {
    const targetKeyword = keyword || searchKeyword;
    if (!targetKeyword) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const [metricsData, ideasData] = await Promise.all([
        getKeywordMetrics(targetKeyword),
        getKeywordIdeas(targetKeyword)
      ]);
      
      setKeywordMetrics(metricsData);
      setKeywordIdeas(ideasData);
      setSelectedKeyword(targetKeyword);
    } catch (err) {
      setError('Failed to fetch keyword data');
    } finally {
      setLoading(false);
    }
  };

  const handleKeywordFromList = async (keyword: string) => {
    setSearchKeyword(keyword);
    await handleKeywordSearch(keyword);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          {selectedWebsite && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Analyzing: {selectedWebsite.domain} | {selectedWebsite.niche}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<RefreshCw size={20} />}
          onClick={() => selectedWebsite && loadAnalyticsForWebsite(selectedWebsite)}
          disabled={loading || !selectedWebsite}
        >
          Refresh Analytics
        </Button>
      </Box>

      {/* Error Alert */}
      {(error || apiError) && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error || apiError}
        </Alert>
      )}

      {/* Website Selection */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Select Website</InputLabel>
            <Select
              value={selectedWebsite?.id || ''}
              label="Select Website"
              onChange={(e) => handleWebsiteChange(e.target.value)}
            >
              {websites.map((website) => (
                <MenuItem key={website.id} value={website.id}>
                  {website.domain} ({website.niche})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Custom URL"
              value={searchUrl}
              onChange={(e) => setSearchUrl(e.target.value)}
              placeholder="e.g., medium.com"
              fullWidth
              size="small"
            />
            <Button
              variant="outlined"
              onClick={() => handleUrlSearch()}
              disabled={loading || !searchUrl}
              startIcon={loading ? <CircularProgress size={16} /> : <Search size={16} />}
              sx={{ minWidth: '100px' }}
            >
              Analyze
            </Button>
          </Stack>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Keyword Research"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="e.g., plumbing services"
              fullWidth
              size="small"
            />
            <Button
              variant="outlined"
              onClick={() => handleKeywordSearch()}
              disabled={loading || !searchKeyword}
              startIcon={loading ? <CircularProgress size={16} /> : <Target size={16} />}
              sx={{ minWidth: '100px' }}
            >
              Research
            </Button>
          </Stack>
        </Grid>
      </Grid>

      {/* Quick Keywords from Selected Website */}
      {selectedWebsite?.seoMetrics?.topKeywords && selectedWebsite.seoMetrics.topKeywords.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Keyword Analysis for {selectedWebsite.domain}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {selectedWebsite.seoMetrics.topKeywords.map((keyword) => (
                <Chip
                  key={keyword}
                  label={keyword}
                  onClick={() => handleKeywordFromList(keyword)}
                  color={selectedKeyword === keyword ? 'primary' : 'default'}
                  variant={selectedKeyword === keyword ? 'filled' : 'outlined'}
                  sx={{ cursor: 'pointer', mb: 1 }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* URL Metrics Results */}
      {urlMetrics && urlMetrics.success && (
        <Accordion expanded sx={{ mb: 3 }}>
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
                          Monthly Traffic
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
                          Organic Keywords
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
                          Total Backlinks
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
                          Domain Traffic
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
                          Domain Value
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
                          Total Keywords
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
        <Accordion expanded sx={{ mb: 3 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Target size={20} />
              Keyword Analysis: "{selectedKeyword}"
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
                          Cost Per Click
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
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Competition Level
                        </Typography>
                        <Chip
                          size="small"
                          label={keywordMetrics.data.difficulty > 70 ? 'High' : keywordMetrics.data.difficulty > 40 ? 'Medium' : 'Low'}
                          color={keywordMetrics.data.difficulty > 70 ? 'error' : keywordMetrics.data.difficulty > 40 ? 'warning' : 'success'}
                        />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Click-through Rate
                        </Typography>
                        <Typography variant="body2">
                          {((keywordMetrics.data.clicks / keywordMetrics.data.searchVolume) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Traffic Value
                        </Typography>
                        <Typography variant="body2">
                          ${(keywordMetrics.data.trafficPotential * keywordMetrics.data.cpc).toFixed(2)}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Keyword Ideas Results */}
      {keywordIdeas && keywordIdeas.success && (
        <Accordion expanded sx={{ mb: 3 }}>
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
                    <TableCell align="right">Actions</TableCell>
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
                      <TableCell align="right">
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Target size={16} />}
                          onClick={() => handleKeywordFromList(idea.keyword)}
                        >
                          Analyze
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Loading State */}
      {(loading || apiLoading) && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Empty State */}
      {!loading && !urlMetrics && !keywordMetrics && !keywordIdeas && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <BarChart3 size={64} color="text.secondary" />
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
              No Analytics Data
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select a website or enter a URL/keyword to start analyzing
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}