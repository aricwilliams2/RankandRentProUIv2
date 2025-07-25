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
  Link,
} from '@mui/material';
import { TrendingUp, Link as LinkIcon, Search, Globe, ArrowUpRight, ArrowDownRight, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, Activity, Award, Target, Users, BarChart3, DollarSign, Zap, Eye, Expand as ExpandMore, TrendingDown, XCircle } from 'lucide-react';
import { useApiContext } from '../contexts/ApiContext';
import { useLocation, useNavigate } from 'react-router-dom';
import type { Website, UrlMetrics, KeywordMetrics, KeywordGenerator, GoogleRankCheck } from '../types';

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    getUrlMetrics, 
    getKeywordMetrics, 
    getKeywordIdeas, 
    getWebsites,
    checkGoogleRank,
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
  const [analyzingKeywords, setAnalyzingKeywords] = useState<Record<string, KeywordMetrics | null>>({});
  const [expandedKeywords, setExpandedKeywords] = useState<Set<string>>(new Set());
  
  // Google Rank Check State
  const [rankCheckKeyword, setRankCheckKeyword] = useState('');
  const [rankCheckUrl, setRankCheckUrl] = useState('');
  const [rankCheckData, setRankCheckData] = useState<GoogleRankCheck | null>(null);
  
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

  const handleAnalyzeKeywordIdea = async (keywordKey: string, actualKeyword?: string) => {
    const keywordToAnalyze = actualKeyword || keywordKey;
    
    // Toggle expansion
    const newExpanded = new Set(expandedKeywords);
    if (newExpanded.has(keywordKey)) {
      newExpanded.delete(keywordKey);
      setExpandedKeywords(newExpanded);
      return;
    }

    newExpanded.add(keywordKey);
    setExpandedKeywords(newExpanded);

    // Only fetch if we don't have data yet
    if (!analyzingKeywords[keywordKey]) {
      setLoading(true);
      try {
        const keywordData = await getKeywordMetrics(keywordToAnalyze);
        setAnalyzingKeywords(prev => ({
          ...prev,
          [keywordKey]: keywordData
        }));
      } catch (err) {
        setError(`Failed to analyze keyword: ${keywordToAnalyze}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleRankCheck = async () => {
    if (!rankCheckKeyword.trim() || !rankCheckUrl.trim()) return;
    
    try {
      const result = await checkGoogleRank(rankCheckKeyword, rankCheckUrl);
      setRankCheckData(result);
    } catch (error) {
      console.error('Failed to check ranking:', error);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'text-green-600 bg-green-50';
    if (rank <= 10) return 'text-blue-600 bg-blue-50';  
    if (rank <= 20) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Award className="w-4 h-4" />;
    if (rank <= 10) return <CheckCircle className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
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
            
            {/* Google Rank Checker */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Award size={20} />
                Google Rank Checker
              </Typography>
              
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3 }}>
                    <TextField
                      label="Keyword"
                      value={rankCheckKeyword}
                      onChange={(e) => setRankCheckKeyword(e.target.value)}
                      placeholder="e.g., junk removal wilmington"
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <TextField
                      label="Website URL"
                      value={rankCheckUrl}
                      onChange={(e) => setRankCheckUrl(e.target.value)}
                      placeholder="e.g., https://hancockhauling.com"
                      fullWidth
                      variant="outlined"
                      size="small"
                    />
                    <Button
                      variant="contained"
                      onClick={handleRankCheck}
                      disabled={loading || !rankCheckKeyword.trim() || !rankCheckUrl.trim()}
                      startIcon={loading ? <CircularProgress size={16} /> : <Search size={16} />}
                      sx={{ minWidth: '120px' }}
                    >
                      {loading ? 'Checking...' : 'Check Rank'}
                    </Button>
                  </Box>
                  
                  {rankCheckData && (
                    <Box>
                      {/* Rank Summary */}
                      <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1, borderRadius: '8px', ...getRankColor(rankCheckData.data.rank).split(' ').reduce((acc, cls) => {
                            const [prop, value] = cls.split('-');
                            if (prop === 'text') acc.color = value === 'green' ? 'success.main' : value === 'blue' ? 'info.main' : value === 'orange' ? 'warning.main' : 'error.main';
                            if (prop === 'bg') acc.bgcolor = value === 'green' ? 'success.light' : value === 'blue' ? 'info.light' : value === 'orange' ? 'warning.light' : 'error.light';
                            return acc;
                          }, {}) }}>
                            {getRankIcon(rankCheckData.data.rank)}
                            <Typography variant="h6" fontWeight="bold">
                              Rank #{rankCheckData.data.rank}
                            </Typography>
                          </Box>
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {rankCheckData.data.message}
                        </Typography>
                      </Box>
                      
                      {/* SERP Results */}
                      <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 2 }}>
                        Top 10 Search Results
                      </Typography>
                      
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell width="60px">Rank</TableCell>
                              <TableCell>Title & URL</TableCell>
                              <TableCell width="100px">DA</TableCell>
                              <TableCell width="100px">PA</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {rankCheckData.data.SERP.slice(0, 10).map((result) => (
                              <TableRow 
                                key={result.rank}
                                sx={{ 
                                  bgcolor: result.rank === rankCheckData.data.rank ? 'success.light' : 'inherit',
                                  '&:hover': { bgcolor: 'action.hover' }
                                }}
                              >
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    {result.rank <= 3 && <Award size={16} color="gold" />}
                                    <Typography variant="body2" fontWeight="medium">
                                      #{result.rank}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography 
                                      variant="body2" 
                                      fontWeight="medium" 
                                      sx={{ 
                                        display: '-webkit-box',
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        mb: 0.5
                                      }}
                                    >
                                      {result.title}
                                    </Typography>
                                    <Link 
                                      href={result.link} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 0.5,
                                        fontSize: '0.75rem',
                                        color: 'text.secondary'
                                      }}
                                    >
                                      <LinkIcon size={12} />
                                      {new URL(result.link).hostname}
                                    </Link>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={result["domain authority"]} 
                                    size="small"
                                    color={result["domain authority"] >= 60 ? 'success' : result["domain authority"] >= 30 ? 'warning' : 'error'}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip 
                                    label={result["page authority"]} 
                                    size="small"
                                    color={result["page authority"] >= 40 ? 'success' : result["page authority"] >= 20 ? 'warning' : 'error'}
                                  />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Keyword Ideas Results */}
      {keywordIdeas && keywordIdeas.success && (
        <Box sx={{ mb: 3 }}>
          {/* All Ideas Section */}
          <Accordion expanded sx={{ mb: 2 }}>
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
                      <React.Fragment key={idea.id}>
                        <TableRow>
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
                              {idea.updatedAt ? new Date(idea.updatedAt).toLocaleDateString() : 'N/A'}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Button
                              size="small"
                              variant={expandedKeywords.has(idea.keyword) ? "contained" : "outlined"}
                              startIcon={expandedKeywords.has(idea.keyword) ? 
                                (loading && !analyzingKeywords[idea.keyword] ? <CircularProgress size={16} /> : <ExpandMore size={16} />) : 
                                <Target size={16} />}
                              onClick={() => handleAnalyzeKeywordIdea(idea.keyword)}
                              disabled={loading && !analyzingKeywords[idea.keyword]}
                            >
                              {expandedKeywords.has(idea.keyword) ? 'Hide' : 'Analyze'}
                            </Button>
                          </TableCell>
                        </TableRow>
                        {expandedKeywords.has(idea.keyword) && (
                          <TableRow>
                            <TableCell colSpan={5} sx={{ p: 0, borderBottom: 'none' }}>
                              <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                                {analyzingKeywords[idea.keyword] && analyzingKeywords[idea.keyword]?.success ? (
                                  <Box>
                                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                                      Detailed Analysis: "{idea.keyword}"
                                    </Typography>
                                    <Grid container spacing={2}>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <Search size={20} color="primary" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            {formatNumber(analyzingKeywords[idea.keyword]!.data.searchVolume)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            US Searches
                                          </Typography>
                                        </Card>
                                      </Grid>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <Globe size={20} color="primary" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            {formatNumber(analyzingKeywords[idea.keyword]!.data.globalSearchVolume)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Global Volume
                                          </Typography>
                                        </Card>
                                      </Grid>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <Eye size={20} color="primary" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            {formatNumber(analyzingKeywords[idea.keyword]!.data.clicks)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Clicks
                                          </Typography>
                                        </Card>
                                      </Grid>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <DollarSign size={20} color="secondary" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            ${analyzingKeywords[idea.keyword]!.data.cpc.toFixed(2)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Cost Per Click
                                          </Typography>
                                        </Card>
                                      </Grid>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <Zap size={20} color="secondary" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            {formatNumber(analyzingKeywords[idea.keyword]!.data.trafficPotential)}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Traffic Potential
                                          </Typography>
                                        </Card>
                                      </Grid>
                                      <Grid item xs={6} sm={4} md={2}>
                                        <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                          <AlertTriangle size={20} color="error" />
                                          <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                            {analyzingKeywords[idea.keyword]!.data.difficulty}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                            Difficulty
                                          </Typography>
                                        </Card>
                                      </Grid>
                                    </Grid>
                                    <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                      <Chip 
                                        size="small" 
                                        label={`CTR: ${((analyzingKeywords[idea.keyword]!.data.clicks / analyzingKeywords[idea.keyword]!.data.searchVolume) * 100).toFixed(1)}%`}
                                        color="info"
                                      />
                                      <Chip 
                                        size="small" 
                                        label={`Traffic Value: $${(analyzingKeywords[idea.keyword]!.data.trafficPotential * analyzingKeywords[idea.keyword]!.data.cpc).toFixed(2)}`}
                                        color="success"
                                      />
                                      <Chip 
                                        size="small" 
                                        label={`Competition: ${analyzingKeywords[idea.keyword]!.data.difficulty > 70 ? 'High' : analyzingKeywords[idea.keyword]!.data.difficulty > 40 ? 'Medium' : 'Low'}`}
                                        color={analyzingKeywords[idea.keyword]!.data.difficulty > 70 ? 'error' : analyzingKeywords[idea.keyword]!.data.difficulty > 40 ? 'warning' : 'success'}
                                      />
                                    </Box>
                                  </Box>
                                ) : loading && !analyzingKeywords[idea.keyword] ? (
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                                    <CircularProgress size={24} sx={{ mr: 2 }} />
                                    <Typography variant="body2" color="text.secondary">
                                      Analyzing keyword metrics...
                                    </Typography>
                                  </Box>
                                ) : (
                                  <Alert severity="error">
                                    Failed to load keyword metrics. Please try again.
                                  </Alert>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* Question Ideas Section */}
          {keywordIdeas.data.questionIdeas && keywordIdeas.data.questionIdeas.results.length > 0 && (
            <Accordion expanded sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Search size={20} />
                  Question Ideas ({keywordIdeas.data.questionIdeas.results.length} of {formatNumber(keywordIdeas.data.questionIdeas.total)})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Question Keyword</TableCell>
                        <TableCell>Difficulty</TableCell>
                        <TableCell>Volume</TableCell>
                        <TableCell>Last Updated</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {keywordIdeas.data.questionIdeas.results.slice(0, 20).map((idea) => (
                        <React.Fragment key={`question-${idea.id}`}>
                          <TableRow>
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
                                {idea.updatedAt ? new Date(idea.updatedAt).toLocaleDateString() : 'N/A'}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Button
                                size="small"
                                variant={expandedKeywords.has(`question-${idea.keyword}`) ? "contained" : "outlined"}
                                startIcon={expandedKeywords.has(`question-${idea.keyword}`) ? 
                                  (loading && !analyzingKeywords[`question-${idea.keyword}`] ? <CircularProgress size={16} /> : <ExpandMore size={16} />) : 
                                  <Target size={16} />}
                                onClick={() => handleAnalyzeKeywordIdea(`question-${idea.keyword}`, idea.keyword)}
                                disabled={loading && !analyzingKeywords[`question-${idea.keyword}`]}
                              >
                                {expandedKeywords.has(`question-${idea.keyword}`) ? 'Hide' : 'Analyze'}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedKeywords.has(`question-${idea.keyword}`) && (
                            <TableRow>
                              <TableCell colSpan={5} sx={{ p: 0, borderBottom: 'none' }}>
                                <Box sx={{ p: 3, backgroundColor: 'grey.50' }}>
                                  {analyzingKeywords[`question-${idea.keyword}`] && analyzingKeywords[`question-${idea.keyword}`]?.success ? (
                                    <Box>
                                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                                        Detailed Analysis: "{idea.keyword}"
                                      </Typography>
                                      <Grid container spacing={2}>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <Search size={20} color="primary" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              {formatNumber(analyzingKeywords[`question-${idea.keyword}`]!.data.searchVolume)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              US Searches
                                            </Typography>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <Globe size={20} color="primary" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              {formatNumber(analyzingKeywords[`question-${idea.keyword}`]!.data.globalSearchVolume)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Global Volume
                                            </Typography>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <Eye size={20} color="primary" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              {formatNumber(analyzingKeywords[`question-${idea.keyword}`]!.data.clicks)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Clicks
                                            </Typography>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <DollarSign size={20} color="secondary" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              ${analyzingKeywords[`question-${idea.keyword}`]!.data.cpc.toFixed(2)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Cost Per Click
                                            </Typography>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <Zap size={20} color="secondary" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              {formatNumber(analyzingKeywords[`question-${idea.keyword}`]!.data.trafficPotential)}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Traffic Potential
                                            </Typography>
                                          </Card>
                                        </Grid>
                                        <Grid item xs={6} sm={4} md={2}>
                                          <Card variant="outlined" sx={{ textAlign: 'center', p: 2 }}>
                                            <AlertTriangle size={20} color="error" />
                                            <Typography variant="h6" fontWeight="bold" sx={{ mt: 1 }}>
                                              {analyzingKeywords[`question-${idea.keyword}`]!.data.difficulty}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Difficulty
                                            </Typography>
                                          </Card>
                                        </Grid>
                                      </Grid>
                                      <Box sx={{ mt: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                                        <Chip 
                                          size="small" 
                                          label={`CTR: ${((analyzingKeywords[`question-${idea.keyword}`]!.data.clicks / analyzingKeywords[`question-${idea.keyword}`]!.data.searchVolume) * 100).toFixed(1)}%`}
                                          color="info"
                                        />
                                        <Chip 
                                          size="small" 
                                          label={`Traffic Value: $${(analyzingKeywords[`question-${idea.keyword}`]!.data.trafficPotential * analyzingKeywords[`question-${idea.keyword}`]!.data.cpc).toFixed(2)}`}
                                          color="success"
                                        />
                                        <Chip 
                                          size="small" 
                                          label={`Competition: ${analyzingKeywords[`question-${idea.keyword}`]!.data.difficulty > 70 ? 'High' : analyzingKeywords[`question-${idea.keyword}`]!.data.difficulty > 40 ? 'Medium' : 'Low'}`}
                                          color={analyzingKeywords[`question-${idea.keyword}`]!.data.difficulty > 70 ? 'error' : analyzingKeywords[`question-${idea.keyword}`]!.data.difficulty > 40 ? 'warning' : 'success'}
                                        />
                                      </Box>
                                    </Box>
                                  ) : loading && !analyzingKeywords[`question-${idea.keyword}`] ? (
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', py: 2 }}>
                                      <CircularProgress size={24} sx={{ mr: 2 }} />
                                      <Typography variant="body2" color="text.secondary">
                                        Analyzing keyword metrics...
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Alert severity="error">
                                      Failed to load keyword metrics. Please try again.
                                    </Alert>
                                  )}
                                </Box>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </AccordionDetails>
            </Accordion>
          )}
        </Box>
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