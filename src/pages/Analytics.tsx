import { useState, useEffect } from 'react';

import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  TextField,
  InputAdornment,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  FormControl,
  Select,
  InputLabel,
  FormHelperText,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  Globe,
  DollarSign,
  Search,
  MapPin,
  Calendar,
  Target,
  Activity,
  ExternalLink,
  Map,
  X,
} from 'lucide-react';

interface TrafficData {
  status: string;
  url: string;
  trafficMonthlyAvg: number;
  costMonthlyAvg: number;
  traffic_history: {
    date: string;
    organic: number;
  }[];
  top_pages: {
    url: string;
    traffic: number;
    share: number;
  }[];
  top_keywords: {
    keyword: string;
    position: number;
    traffic: number;
  }[];
  top_countries: {
    country: string;
    share: number;
  }[];
}



import { apiCall } from '../config/api';

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState('');
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [analysisMode, setAnalysisMode] = useState<'subdomains' | 'exact'>('subdomains');
  const [isCachedData, setIsCachedData] = useState(false);

  // Get domain and mode from location state or URL params
  const domain = location.state?.domain || new URLSearchParams(location.search).get('domain');
  const urlMode = new URLSearchParams(location.search).get('mode') as 'subdomains' | 'exact' | null;

  // Function to open Google Maps search for GMB
  const openGoogleMapsSearch = (domain: string) => {
    // Strip https:// or http:// and .com, .net, etc.
    const stripped = domain
      .replace(/^https?:\/\//, '') // remove https://
      .replace(/^www\./, '') // optional: remove www.
      .split('.')[0]; // get just 'precisiongvl'

    const searchTerm = stripped;
    const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    window.open(mapsSearchUrl, '_blank');
  };

  // Cache utilities - now includes mode in cache key
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
  const getCacheKey = (d: string, m: string) => `analytics:${m}:${d}`;
  const getCachedTraffic = (d: string, m: string) => {
    try {
      const raw = localStorage.getItem(getCacheKey(d, m));
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return null;
      return parsed as { data: TrafficData; timestamp: number };
    } catch {
      return null;
    }
  };
  const setCachedTraffic = (d: string, m: string, data: TrafficData) => {
    try {
      localStorage.setItem(getCacheKey(d, m), JSON.stringify({ data, timestamp: Date.now() }));
    } catch { }
  };

  useEffect(() => {
    if (domain) {
      // Use mode from URL if available, otherwise default to subdomains
      const mode = urlMode || 'subdomains';
      setAnalysisMode(mode);

      const cached = getCachedTraffic(domain, mode);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        setTrafficData(cached.data);
        setIsCachedData(true);
        setLoading(false);
        return;
      }
      fetchTrafficData(false, mode);
    } else {
      setLoading(false);
    }
  }, [domain, urlMode]);

  const fetchTrafficData = async (forceRefresh: boolean = false, mode: string = analysisMode) => {
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      if (!forceRefresh) {
        const cached = getCachedTraffic(domain, mode);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
          setTrafficData(cached.data);
          setIsCachedData(true);
          return;
        }
      }

      // Handle URL encoding - use encodeURI for URLs with protocol, encodeURIComponent for domains only
      const encodedUrl = domain.startsWith('http://') || domain.startsWith('https://')
        ? encodeURI(domain)  // Use encodeURI for full URLs to preserve protocol
        : encodeURIComponent(domain);  // Use encodeURIComponent for domains only

      const response = await apiCall(`/api/website-traffic?url=${encodedUrl}&mode=${mode}`);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTrafficData(data);
      setIsCachedData(false);
      setCachedTraffic(domain, mode, data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
    } finally {
      setLoading(false);
    }
  };

  const handleClientSidePdf = async () => {
    setPdfGenerating(true);
    const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
      import('html2canvas/dist/html2canvas.esm.js'),
      import('jspdf')
    ]);

    const target = document.getElementById('analytics-report-area') || document.body;
    const hidden: HTMLElement[] = Array.from(target.querySelectorAll('.no-report')) as HTMLElement[];
    hidden.forEach(el => (el.style.visibility = 'hidden'));

    try {
      // Apply temporary print-friendly styles to improve color fidelity and avoid clipping
      const styleEl = document.createElement('style');
      styleEl.id = 'report-capture-styles';
      styleEl.textContent = `
        .report-capture, .report-capture * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; }
        .report-capture { background: #ffffff !important; }
        .report-capture p, .report-capture span, .report-capture td, .report-capture th, .report-capture div, .report-capture li { color: #111111 !important; }
      `;
      document.head.appendChild(styleEl);
      const root = target as HTMLElement;
      root.classList.add('report-capture');
      root.style.paddingBottom = '24px';

      const scale = Math.min(2, window.devicePixelRatio || 1);
      const canvas = await html2canvas(target as HTMLElement, {
        scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        foreignObjectRendering: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 24;
      const renderWidth = pageWidth - margin * 2;
      const renderHeight = (canvas.height * renderWidth) / canvas.width;

      let remainingHeight = renderHeight;
      let offsetY = 0;

      pdf.addImage(
        imgData,
        'PNG',
        margin,
        margin - offsetY,
        renderWidth,
        Math.min(remainingHeight, pageHeight - margin * 2)
      );
      remainingHeight -= (pageHeight - margin * 2);
      offsetY += (pageHeight - margin * 2);

      while (remainingHeight > 0) {
        pdf.addPage();
        pdf.addImage(
          imgData,
          'PNG',
          margin,
          margin - offsetY,
          renderWidth,
          Math.min(remainingHeight, pageHeight - margin * 2)
        );
        remainingHeight -= (pageHeight - margin * 2);
        offsetY += (pageHeight - margin * 2);
      }

      pdf.save('analytics-report.pdf');
    } finally {
      hidden.forEach(el => (el.style.visibility = ''));
      const styleEl = document.getElementById('report-capture-styles');
      if (styleEl && styleEl.parentNode) styleEl.parentNode.removeChild(styleEl);
      const root = target as HTMLElement;
      root.classList.remove('report-capture');
      root.style.paddingBottom = '';
      setPdfGenerating(false);
    }
  };

  const formatTrafficHistory = () => {
    if (!trafficData?.traffic_history) return [];

    return trafficData.traffic_history.map(item => ({
      ...item,
      month: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit'
      }),
      fullDate: new Date(item.date).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
      })
    }));
  };

  const getCountryName = (countryCode: string) => {
    const countries: Record<string, string> = {
      'us': 'United States',
      'ca': 'Canada',
      'gb': 'United Kingdom',
      'au': 'Australia',
      'de': 'Germany',
      'fr': 'France',
      'es': 'Spain',
      'it': 'Italy',
      'br': 'Brazil',
      'mx': 'Mexico',
    };
    return countries[countryCode.toLowerCase()] || countryCode.toUpperCase();
  };

  const getPositionColor = (position: number) => {
    if (position <= 3) return theme.palette.success.main;
    if (position <= 10) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
  ];

  const handleKeywordClick = (keyword: string, traffic: number) => {
    // Navigate to SERP results page
    navigate('/serp-results', {
      state: {
        keyword: keyword,
        website: domain,
        traffic: traffic
      }
    });
  };

  const handleWebsiteSubmit = () => {
    if (websiteInput.trim()) {
      let cleanDomain = websiteInput.trim();

      if (analysisMode === 'subdomains') {
        // For subdomains mode, preserve protocol and hostname, strip everything after .com
        if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
          try {
            const url = new URL(cleanDomain);
            cleanDomain = url.protocol + '//' + url.hostname;
          } catch {
            // If URL parsing fails, just remove the protocol
            cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
          }
        } else {
          // If no protocol, just get the domain part before any path
          cleanDomain = cleanDomain.split('/')[0];
        }
      } else {
        // For exact mode, preserve the full URL with protocol
        if (!cleanDomain.startsWith('http://') && !cleanDomain.startsWith('https://')) {
          cleanDomain = `https://${cleanDomain}`;
        }
        try {
          const url = new URL(cleanDomain);
          cleanDomain = url.protocol + '//' + url.hostname + url.pathname;
        } catch {
          // If URL parsing fails, use as-is
        }
      }

      // Navigate with both domain and mode parameters
      // Handle URL encoding - use encodeURI for URLs with protocol, encodeURIComponent for domains only
      const encodedDomain = cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')
        ? encodeURI(cleanDomain)  // Use encodeURI for full URLs to preserve protocol
        : encodeURIComponent(cleanDomain);  // Use encodeURIComponent for domains only

      navigate(`/analytics?domain=${encodedDomain}&mode=${analysisMode}`);
      // Update the current domain and fetch data
    }
  };

  // Show website input if no domain is provided
  // Show website input if no domain is provided
  if (!domain) {
    return (
      <Box>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
          Website Analytics
        </Typography>

        <Card sx={{ maxWidth: 600, mx: 'auto', mt: 8 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Globe size={64} color="#1976d2" style={{ marginBottom: 16 }} />
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                Analyze Website Traffic
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Enter a website URL or domain to get detailed traffic analytics and keyword rankings
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Website URL or Domain"
                placeholder={analysisMode === 'subdomains'
                  ? "e.g., example.com or https://example.com"
                  : "e.g., https://blog.example.com/posts or example.com/specific-page"
                }
                value={websiteInput}
                onChange={(e) => setWebsiteInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleWebsiteSubmit()}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Globe size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  }
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Analysis Mode</InputLabel>
                <Select
                  value={analysisMode}
                  onChange={(e) => setAnalysisMode(e.target.value as 'subdomains' | 'exact')}
                  label="Analysis Mode"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    }
                  }}
                >
                  <MenuItem value="subdomains">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Globe size={16} />
                      Include Subdomains (Default)
                    </Box>
                  </MenuItem>
                  <MenuItem value="exact">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Target size={16} />
                      Exact Domain Only
                    </Box>
                  </MenuItem>
                </Select>
                <FormHelperText>
                  {analysisMode === 'subdomains'
                    ? 'Analyzes the main domain and all its subdomains. Enter any URL and it will analyze the root domain (e.g., example.com from https://blog.example.com/posts)'
                    : 'Analyzes only the exact URL specified. Enter the full URL including protocol and path to analyze that specific page (e.g., https://blog.example.com/posts)'
                  }
                </FormHelperText>
              </FormControl>

              <Button
                variant="contained"
                size="large"
                onClick={handleWebsiteSubmit}
                disabled={!websiteInput.trim()}
                startIcon={<Search size={20} />}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  textTransform: 'none',
                  fontSize: '1.1rem',
                }}
              >
                Analyze Website
              </Button>
            </Box>

            <Box sx={{ mt: 4, p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                What you'll get:
              </Typography>
              <Box component="ul" sx={{ m: 0, pl: 2 }}>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Monthly traffic trends and history
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Top performing keywords and rankings
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 0.5 }}>
                  Geographic traffic distribution
                </Typography>
                <Typography component="li" variant="body2">
                  Top pages and traffic sources
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Analytics History below the analyzer when no domain is selected */}
        <Box sx={{ mt: 6 }}>
          <AnalyticsHistorySection />
        </Box>
      </Box>
    );
  }


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing website traffic...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {domain}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => fetchTrafficData()}>
          Retry Analysis
        </Button>
      </Box>
    );
  }

  if (!trafficData) {
    return (
      <Box>
        <Alert severity="info">
          No traffic data available for this domain.
        </Alert>
      </Box>
    );
  }

  const chartData = formatTrafficHistory();
  const totalTraffic = chartData.reduce((sum, item) => sum + item.organic, 0);
  const avgTraffic = chartData.length > 0 ? Math.round(totalTraffic / chartData.length) : 0;

  return (
    <Box>
      <Box id="analytics-report-area">
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight="bold">
            Website Analytics
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, flexWrap: 'wrap' }}>
            <Globe size={20} />
            <Typography variant="h6" color="primary">
              {trafficData.url}
            </Typography>
            <Chip
              label={trafficData.status}
              color="success"
              size="small"
            />
            <Chip
              label={analysisMode === 'subdomains' ? 'Include Subdomains' : 'Exact Domain'}
              color={analysisMode === 'subdomains' ? 'primary' : 'secondary'}
              size="small"
              icon={analysisMode === 'subdomains' ? <Globe size={14} /> : <Target size={14} />}
            />
            {trafficData.url && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Map size={16} />}
                onClick={() => openGoogleMapsSearch(trafficData.url)}
                sx={{
                  ml: 2,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                }}
              >
                Click to see Google GMB
              </Button>
            )}
            <Button
              className="no-report"
              variant="outlined"
              size="small"
              onClick={() => fetchTrafficData(true)}
              sx={{ ml: 1, textTransform: 'none', fontSize: '0.875rem' }}
            >
              Refresh Data
            </Button>
            {isCachedData && (
              <Typography
                variant="body2"
                sx={{
                  ml: 1,
                  fontWeight: 'bold',
                  color: 'error.main',
                  fontSize: '0.875rem',
                }}
              >
                (This is cached data)
              </Typography>
            )}
            <Button
              className="no-report"
              variant="contained"
              size="small"
              onClick={handleClientSidePdf}
              disabled={pdfGenerating}
              sx={{ ml: 2, textTransform: 'none', fontSize: '0.875rem' }}
            >
              {pdfGenerating ? 'Generating…' : 'Download Report (PDF)'}
            </Button>
          </Box>
        </Box>

        {/* Key Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <TrendingUp size={24} color={theme.palette.primary.main} />
                  <Typography color="text.secondary" variant="body2">
                    Monthly Avg
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {trafficData.trafficMonthlyAvg}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Organic Traffic
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <DollarSign size={24} color={theme.palette.success.main} />
                  <Typography color="text.secondary" variant="body2">
                    Monthly Value
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  ${trafficData.costMonthlyAvg.toFixed(2)}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Traffic Value
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Activity size={24} color={theme.palette.warning.main} />
                  <Typography color="text.secondary" variant="body2">
                    Period Avg
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {avgTraffic}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Visits/Month
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Target size={24} color={theme.palette.info.main} />
                  <Typography color="text.secondary" variant="body2">
                    Keywords
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {trafficData.top_keywords.length}
                </Typography>
                <Typography color="text.secondary" variant="body2">
                  Ranking Keywords
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Traffic History Chart */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Calendar size={24} />
                  <Typography variant="h6" fontWeight="medium">
                    Traffic History
                  </Typography>
                </Box>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis
                        tick={{ fontSize: 12 }}
                        label={{ value: 'Organic Traffic', angle: -90, position: 'insideLeft' }}
                      />
                      <Tooltip
                        formatter={(value) => [value, 'Organic Traffic']}
                        labelFormatter={(label: string) => {
                          const chartItem = chartData.find(item => item.month === label);
                          return chartItem ? chartItem.fullDate : label;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="organic"
                        stroke={theme.palette.primary.main}
                        strokeWidth={3}
                        dot={{ fill: theme.palette.primary.main, strokeWidth: 2, r: 6 }}
                        activeDot={{ r: 8, stroke: theme.palette.primary.main, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Keywords and Countries */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Top Keywords */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Search size={24} />
                  <Typography variant="h6" fontWeight="medium">
                    Top Keywords
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Keyword</TableCell>
                        <TableCell align="center">Position</TableCell>
                        <TableCell align="right">Traffic</TableCell>
                        <TableCell align="center">Analysis</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trafficData.top_keywords.map((keyword, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              fontWeight="medium"
                              sx={{
                                cursor: 'pointer',
                                color: theme.palette.primary.main,
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                              onClick={() => handleKeywordClick(keyword.keyword, keyword.traffic)}
                            >
                              {keyword.keyword}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`#${keyword.position}`}
                              size="small"
                              sx={{
                                backgroundColor: getPositionColor(keyword.position),
                                color: 'white',
                                fontWeight: 'bold',
                              }}
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {keyword.traffic.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<Target size={16} />}
                              onClick={() => handleKeywordClick(keyword.keyword, keyword.traffic)}
                            >
                              Check SERP
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top Countries */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <MapPin size={24} />
                  <Typography variant="h6" fontWeight="medium">
                    Traffic by Country
                  </Typography>
                </Box>
                <Box sx={{ height: 200, mb: 2 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficData.top_countries}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="share"
                      >
                        {trafficData.top_countries.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value}%`, 'Share']}
                        labelFormatter={(label) => getCountryName(label)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box>
                  {trafficData.top_countries.map((country, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {getCountryName(country.country)}
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {country.share}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Top Pages */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <Globe size={24} />
                  <Typography variant="h6" fontWeight="medium">
                    Top Pages
                  </Typography>
                </Box>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Page URL</TableCell>
                        <TableCell align="right">Traffic</TableCell>
                        <TableCell align="right">Share</TableCell>
                        <TableCell align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {trafficData.top_pages.map((page, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                            >
                              {page.url}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {page.traffic.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {page.share.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              size="small"
                              startIcon={<ExternalLink size={16} />}
                              href={page.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Visit
                            </Button>
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
      <AnalyticsHistorySection />
    </Box>
  );
}

// Types for Analytics Snapshots
interface AnalyticsSnapshotListItem {
  id: number;
  url: string | null;
  mode: string | null;
  created_at: string;
}

// interface AnalyticsSnapshotDetail {
//   id: number;
//   user_id: number;
//   url: string | null;
//   mode: string | null;
//   snapshot_json: string;
//   created_at: string;
// }

interface AnalyticsPayload {
  history?: any[];
  top_keywords?: any[];
  top_pages?: any[];
  [k: string]: any;
}

function AnalyticsHistorySection() {
  const [items, setItems] = useState<AnalyticsSnapshotListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [openId, setOpenId] = useState<number | null>(null);
  const [payload, setPayload] = useState<AnalyticsPayload | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const theme = useTheme();
  type GroupedSnapshot = { groupKey: string; url: string | null; mode: string | null; created_at: string; ids: number[] };
  const [groups, setGroups] = useState<GroupedSnapshot[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupedSnapshot | null>(null);
  const [deletingKey, setDeletingKey] = useState<string | null>(null);
  const [snapshotPdfGenerating, setSnapshotPdfGenerating] = useState(false);

  useEffect(() => {
    const fetchList = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (limit) params.set('limit', String(limit));
        if (offset) params.set('offset', String(offset));
        const res = await apiCall(`/api/analytics-snapshots?${params.toString()}`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        const list = (json.data as AnalyticsSnapshotListItem[]) || [];
        setItems(list);
        // Group snapshots from the same analytics call (same url/mode within a short time window)
        const sorted = [...list].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const grouped: GroupedSnapshot[] = [];
        const WINDOW_MS = 5000; // 5 seconds window
        for (const it of sorted) {
          const ts = new Date(it.created_at).getTime();
          const last = grouped[grouped.length - 1];
          if (
            last &&
            last.url === it.url &&
            last.mode === it.mode &&
            Math.abs(ts - new Date(last.created_at).getTime()) <= WINDOW_MS
          ) {
            last.ids.push(it.id);
          } else {
            grouped.push({
              groupKey: `${it.url || '-'}|${it.mode || '-'}|${new Date(Math.floor(ts / 1000) * 1000).toISOString()}`,
              url: it.url,
              mode: it.mode,
              created_at: it.created_at,
              ids: [it.id],
            });
          }
        }
        setGroups(grouped.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      } catch (e: any) {
        setError(e?.message || 'Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [limit, offset]);

  const openSnapshotGroup = async (group: GroupedSnapshot) => {
    setSelectedGroup(group);
    setOpenId(group.ids[0] ?? null);
    setDetailLoading(true);
    setDetailError(null);
    setPayload(null);
    try {
      // Fetch all snapshots in the group and merge their payloads
      const details = await Promise.all(
        group.ids.map(async (sid) => {
          const r = await apiCall(`/api/analytics-snapshots/${sid}`);
          if (!r.ok) throw new Error(await r.text());
          const j = (await r.json()) as { data: any };
          const raw = j?.data?.snapshot ?? j?.data?.snapshot_json;
          if (raw && typeof raw === 'object') return raw as AnalyticsPayload;
          if (typeof raw === 'string') {
            try { return JSON.parse(raw) as AnalyticsPayload; } catch { return {} as AnalyticsPayload; }
          }
          return {} as AnalyticsPayload;
        })
      );

      const mergeArrays = (arrays: any[][], keySelector?: (x: any) => string) => {
        const acc: any[] = [];
        const seen = new Set<string>();
        for (const arr of arrays) {
          for (const item of arr || []) {
            const key = keySelector ? keySelector(item) : JSON.stringify(item);
            if (seen.has(key)) continue;
            seen.add(key);
            acc.push(item);
          }
        }
        return acc;
      };

      const histories = details.map(d => (d as any).history || (d as any).traffic_history || []);
      const keywords = details.map(d => (d as any).top_keywords || []);
      const pages = details.map(d => (d as any).top_pages || []);

      const mergedPayload: AnalyticsPayload = {
        history: mergeArrays(histories, (x) => String(x.date ?? x.label ?? x.month ?? x.period ?? JSON.stringify(x))),
        top_keywords: mergeArrays(keywords, (x) => String(typeof x === 'string' ? x : (x.keyword ?? x.term ?? x.query ?? JSON.stringify(x)))),
        top_pages: mergeArrays(pages, (x) => String(typeof x === 'string' ? x : (x.url ?? x.page ?? x.path ?? JSON.stringify(x)))),
      };
      setPayload(mergedPayload);
    } catch (e: any) {
      setDetailError(e?.message || 'Failed to load snapshot');
    } finally {
      setDetailLoading(false);
    }
  };

  const deleteGroup = async (group: GroupedSnapshot) => {
    if (!window.confirm('Delete this snapshot?')) return;
    setDeletingKey(group.groupKey);
    try {
      await Promise.all(
        group.ids.map(async (sid) => {
          const res = await apiCall(`/api/analytics-snapshots/${sid}`, { method: 'DELETE' });
          if (!res.ok) throw new Error(await res.text());
        })
      );
      setGroups(prev => prev.filter(g => g.groupKey !== group.groupKey));
      setItems(prev => prev.filter(it => !group.ids.includes(it.id)));
      if (selectedGroup?.groupKey === group.groupKey) {
        setSelectedGroup(null);
        setOpenId(null);
        setPayload(null);
      }
    } catch (e: any) {
      alert(e?.message || 'Delete failed');
    } finally {
      setDeletingKey(null);
    }
  };

  return (
    <Box className="no-report" sx={{ mt: 4 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" fontWeight="medium">Analytics History</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <Button variant="outlined" size="small" disabled={offset === 0} onClick={() => setOffset(Math.max(0, offset - limit))}>Prev</Button>
              <Button variant="outlined" size="small" onClick={() => setOffset(offset + limit)}>Next</Button>
              <TextField
                select
                size="small"
                label="Page Size"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                sx={{ width: 140 }}
              >
                {[10, 20, 50, 100].map(n => (
                  <MenuItem key={n} value={n}>{n} / page</MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>

          {loading && <Typography variant="body2">Loading…</Typography>}
          {error && <Typography variant="body2" color="error">{error}</Typography>}

          {!loading && !error && (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>URL</TableCell>
                    <TableCell>Mode</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groups.map(group => (
                    <TableRow key={group.groupKey}>
                      <TableCell>{new Date(group.created_at).toLocaleString()}</TableCell>
                      <TableCell>{group.url || '-'}</TableCell>
                      <TableCell>{group.mode || '-'}</TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', alignItems: 'center' }}>
                          <Button size="small" variant="outlined" onClick={() => openSnapshotGroup(group)}>View</Button>
                          <IconButton aria-label="Delete" color="error" onClick={() => deleteGroup(group)} disabled={deletingKey === group.groupKey}>
                            <X size={16} />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                  {groups.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">No snapshots yet.</Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <Dialog open={selectedGroup != null} onClose={() => { setSelectedGroup(null); setOpenId(null); }} maxWidth="lg" fullWidth>
        <DialogTitle>Snapshot Details</DialogTitle>
        <DialogContent dividers>
          {detailLoading && <Typography variant="body2">Loading…</Typography>}
          {detailError && <Typography variant="body2" color="error">{detailError}</Typography>}
          {payload && (
            <Box id="snapshot-report-area">
              {/* Header info */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">Snapshot</Typography>
                <Typography variant="body2" color="text.secondary">
                  URL: {selectedGroup?.url || '-'} | Mode: {selectedGroup?.mode || '-'}
                </Typography>
              </Box>

              {/* Normalize helpers */}
              {(() => {
                const normalizeNumber = (val: any): number => {
                  if (typeof val === 'number') return val;
                  if (typeof val !== 'string') return 0;
                  const s = val.trim().replace(/,/g, '').toLowerCase();
                  const match = s.match(/^([0-9]*\.?[0-9]+)([kmb])?$/);
                  if (!match) return Number(s) || 0;
                  const num = parseFloat(match[1]);
                  const suf = match[2];
                  if (suf === 'k') return num * 1_000;
                  if (suf === 'm') return num * 1_000_000;
                  if (suf === 'b') return num * 1_000_000_000;
                  return num;
                };

                const rawHistory: any[] = (payload as any).history || (payload as any).traffic_history || [];
                const normalizedHistory = rawHistory.map((p: any) => {
                  const dateStr = p.date || p.label || p.month || p.period || '';
                  const value = normalizeNumber(p.value ?? p.visits ?? p.traffic ?? p.organic ?? 0);
                  const d = dateStr ? new Date(dateStr) : null;
                  const month = d ? d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }) : String(dateStr);
                  const fullDate = d ? d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : String(dateStr);
                  return { month, fullDate, organic: value };
                });

                const rawKeywords: any[] = (payload as any).top_keywords || [];
                const normalizedKeywords = rawKeywords.map((k: any) => {
                  if (typeof k === 'string') return { keyword: k, traffic: 0 };
                  return {
                    keyword: k.keyword ?? k.term ?? k.query ?? '-',
                    traffic: normalizeNumber(k.traffic ?? k.volume ?? k.search_volume ?? 0),
                    position: k.position,
                  };
                });

                const rawPages: any[] = (payload as any).top_pages || [];
                const normalizedPages = rawPages.map((p: any) => ({
                  url: p.url ?? p.page ?? p.path ?? '-',
                  traffic: normalizeNumber(p.traffic ?? p.visits ?? p.value ?? 0),
                  share: typeof p.share === 'number' ? p.share : Number(p.share) || undefined,
                }));

                return (
                  <Box>
                    {/* Traffic History Chart */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Calendar size={20} />
                          <Typography variant="subtitle1">Traffic History</Typography>
                        </Box>
                        <Box sx={{ height: 280 }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={normalizedHistory}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                              <YAxis tick={{ fontSize: 12 }} label={{ value: 'Organic Traffic', angle: -90, position: 'insideLeft' }} />
                              <Tooltip
                                formatter={(value) => [value as any, 'Organic Traffic']}
                                labelFormatter={(label: string) => {
                                  const chartItem = normalizedHistory.find(item => item.month === label);
                                  return chartItem ? chartItem.fullDate : label;
                                }}
                              />
                              <Line type="monotone" dataKey="organic" stroke={theme.palette.primary.main} strokeWidth={3} dot={{ r: 3 }} />
                            </LineChart>
                          </ResponsiveContainer>
                        </Box>
                      </CardContent>
                    </Card>

                    {/* Top Keywords */}
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Search size={20} />
                          <Typography variant="subtitle1">Top Keywords</Typography>
                        </Box>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Keyword</TableCell>
                                <TableCell align="right">Traffic</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {normalizedKeywords.map((k, i) => (
                                <TableRow key={i}>
                                  <TableCell>{k.keyword}</TableCell>
                                  <TableCell align="right">{k.traffic.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                              {normalizedKeywords.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={2}><Typography variant="body2" color="text.secondary">No keyword data.</Typography></TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>

                    {/* Top Pages */}
                    <Card>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Globe size={20} />
                          <Typography variant="subtitle1">Top Pages</Typography>
                        </Box>
                        <TableContainer>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell>Page URL</TableCell>
                                <TableCell align="right">Traffic</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {normalizedPages.map((p, i) => (
                                <TableRow key={i}>
                                  <TableCell>
                                    <Typography
                                      variant="body2"
                                      sx={{ whiteSpace: 'normal', overflowWrap: 'anywhere', wordBreak: 'break-word' }}
                                    >
                                      {p.url}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">{p.traffic.toLocaleString()}</TableCell>
                                </TableRow>
                              ))}
                              {normalizedPages.length === 0 && (
                                <TableRow>
                                  <TableCell colSpan={2}><Typography variant="body2" color="text.secondary">No page data.</Typography></TableCell>
                                </TableRow>
                              )}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </CardContent>
                    </Card>
                  </Box>
                );
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button className="no-report" onClick={async () => {
            setSnapshotPdfGenerating(true);
            try {
              const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
                import('html2canvas/dist/html2canvas.esm.js'),
                import('jspdf')
              ]);
              const target = document.getElementById('snapshot-report-area') || document.body;
              // Apply temporary print-friendly styles to improve color fidelity and avoid clipping
              const styleEl = document.createElement('style');
              styleEl.id = 'report-capture-styles';
              styleEl.textContent = `
                .report-capture, .report-capture * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-shadow: none !important; }
                .report-capture { background: #ffffff !important; }
                .report-capture p, .report-capture span, .report-capture td, .report-capture th, .report-capture div, .report-capture li { color: #111111 !important; }
              `;
              document.head.appendChild(styleEl);
              const root = target as HTMLElement;
              root.classList.add('report-capture');
              const prevPaddingBottom = root.style.paddingBottom;
              root.style.paddingBottom = '24px';
              const scale = Math.min(2, window.devicePixelRatio || 1);
              const canvas = await html2canvas(target as HTMLElement, { scale, useCORS: true, allowTaint: true, backgroundColor: '#ffffff' });
              const imgData = canvas.toDataURL('image/png');
              const pdf = new jsPDF({ orientation: 'p', unit: 'pt', format: 'a4' });
              const pageWidth = pdf.internal.pageSize.getWidth();
              const pageHeight = pdf.internal.pageSize.getHeight();
              const margin = 24;
              const renderWidth = pageWidth - margin * 2;
              const renderHeight = (canvas.height * renderWidth) / canvas.width;
              let remainingHeight = renderHeight;
              let offsetY = 0;
              pdf.addImage(imgData, 'PNG', margin, margin - offsetY, renderWidth, Math.min(remainingHeight, pageHeight - margin * 2));
              remainingHeight -= (pageHeight - margin * 2);
              offsetY += (pageHeight - margin * 2);
              while (remainingHeight > 0) {
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', margin, margin - offsetY, renderWidth, Math.min(remainingHeight, pageHeight - margin * 2));
                remainingHeight -= (pageHeight - margin * 2);
                offsetY += (pageHeight - margin * 2);
              }
              pdf.save('analytics-report.pdf');
              // Cleanup
              const styleEl2 = document.getElementById('report-capture-styles');
              if (styleEl2 && styleEl2.parentNode) styleEl2.parentNode.removeChild(styleEl2);
              root.classList.remove('report-capture');
              root.style.paddingBottom = prevPaddingBottom;
            } finally {
              setSnapshotPdfGenerating(false);
            }
          }} variant="contained" disabled={snapshotPdfGenerating}>{snapshotPdfGenerating ? 'Generating…' : 'Download PDF'}</Button>
          <Button className="no-report" onClick={() => setOpenId(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}