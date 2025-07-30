import React, { useState, useEffect } from 'react';
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
  Paper,
  useTheme,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
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
  ArrowLeft,
  Calendar,
  Target,
  Activity,
  ExternalLink,
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function Analytics() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [trafficData, setTrafficData] = useState<TrafficData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [websiteInput, setWebsiteInput] = useState('');
  const [showSerpResults, setShowSerpResults] = useState(false);
  const [serpData, setSerpData] = useState<any>(null);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentTraffic, setCurrentTraffic] = useState(0);

  // Get domain from location state or URL params
  const domain = location.state?.domain || new URLSearchParams(location.search).get('domain');

  useEffect(() => {
    if (domain) {
      fetchTrafficData();
    } else {
      setLoading(false);
    }
  }, [domain]);

  const fetchTrafficData = async () => {
    if (!domain) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/website-traffic?url=${encodeURIComponent(domain)}&mode=subdomains`);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setTrafficData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch traffic data');
    } finally {
      setLoading(false);
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
      // Clean the input and navigate with the domain
      let cleanDomain = websiteInput.trim();
      if (cleanDomain.startsWith('http://') || cleanDomain.startsWith('https://')) {
        try {
          cleanDomain = new URL(cleanDomain).hostname;
        } catch {
          // If URL parsing fails, just remove the protocol
          cleanDomain = cleanDomain.replace(/^https?:\/\//, '');
        }
      }
      
      navigate(`/analytics?domain=${encodeURIComponent(cleanDomain)}`);
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
                placeholder="e.g., example.com or https://example.com"
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
        <Button variant="contained" onClick={fetchTrafficData}>
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
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Website Analytics
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Globe size={20} />
          <Typography variant="h6" color="primary">
            {trafficData.url}
          </Typography>
          <Chip 
            label={trafficData.status} 
            color="success" 
            size="small" 
          />
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
                      formatter={(value, name) => [value, 'Organic Traffic']}
                      labelFormatter={(label, payload) => {
                        const item = payload?.[0]?.payload;
                        return item ? item.fullDate : label;
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
                      {trafficData.top_countries.map((entry, index) => (
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
                          <Typography variant="body2" sx={{ maxWidth: 400, overflow: 'hidden', textOverflow: 'ellipsis' }}>
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
  );
}