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
  Avatar,
  Divider,
} from '@mui/material';
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Globe,
  ExternalLink,
  Crown,
  Target,
  BarChart3,
  Award,
} from 'lucide-react';

interface SerpResult {
  rank: number;
  title: string;
  link: string;
  description: string;
  'domain authority': number;
  'page authority': number;
}

interface SerpData {
  status: string;
  data: {
    message: string;
    rank: number;
    SERP: SerpResult[];
  };
  message: string;
}



export default function SerpResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  
  const [serpData, setSerpData] = useState<SerpData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get data from location state or URL params
  const urlParams = new URLSearchParams(location.search);
  const keyword = location.state?.keyword || urlParams.get('keyword');
  const website = location.state?.website || urlParams.get('website');
  const traffic = location.state?.traffic || urlParams.get('traffic');

  useEffect(() => {
    if (!keyword || !website) {
      setError('Missing keyword or website data');
      setLoading(false);
      return;
    }

    fetchSerpData();
  }, [keyword, website]);

  const fetchSerpData = async () => {
    if (!keyword || !website) return;

    setLoading(true);
    setError(null);

    try {
      // Clean up the URL for the API call
      let cleanUrl = website;
      if (!website.startsWith('http')) {
        cleanUrl = `https://${website}`;
      }

      const response = await fetch(
        `/api/google-rank-check?keyword=${encodeURIComponent(keyword)}&url=${encodeURIComponent(cleanUrl)}&country=us&id=google-serp`,
        {
          method: 'POST',
        }
      );
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      setSerpData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SERP data');
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return theme.palette.success.main;
    if (rank <= 10) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={20} />;
    if (rank <= 3) return <Award size={20} />;
    if (rank <= 10) return <Target size={20} />;
    return <BarChart3 size={20} />;
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const getAuthorityColor = (authority: number) => {
    if (authority >= 80) return theme.palette.success.main;
    if (authority >= 60) return theme.palette.warning.main;
    if (authority >= 40) return theme.palette.info.main;
    return theme.palette.error.main;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Analyzing search rankings...
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keyword: "{keyword}"
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Analytics
        </Button>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={fetchSerpData}>
          Retry Analysis
        </Button>
      </Box>
    );
  }

  if (!serpData) {
    return (
      <Box>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(-1)}
          sx={{ mb: 2 }}
        >
          Back to Analytics
        </Button>
        <Alert severity="info">
          No SERP data available.
        </Alert>
      </Box>
    );
  }

  const targetSite = getDomainFromUrl(website);
  const targetResult = serpData.data.SERP.find(result => 
    getDomainFromUrl(result.link).includes(targetSite.replace('https://', '').replace('http://', ''))
  );

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          startIcon={<ArrowLeft size={20} />}
          onClick={() => navigate(-1)}
        >
          Back to Analytics
        </Button>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            SERP Analysis Results
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
            <Search size={20} />
            <Typography variant="h6" color="primary">
              "{keyword}"
            </Typography>
            <Chip label={`${traffic} monthly searches`} size="small" color="info" />
          </Box>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                {getRankIcon(serpData.data.rank)}
                <Typography color="text.secondary" variant="body2">
                  Your Rank
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getRankColor(serpData.data.rank) }}>
                #{serpData.data.rank}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Google Position
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TrendingUp size={24} color={theme.palette.info.main} />
                <Typography color="text.secondary" variant="body2">
                  Traffic Potential
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {traffic}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Monthly Searches
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Globe size={24} color={theme.palette.success.main} />
                <Typography color="text.secondary" variant="body2">
                  Domain Authority
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getAuthorityColor(targetResult?.['domain authority'] || 0) }}>
                {targetResult?.['domain authority'] || 'N/A'}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Your Site DA
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Target size={24} color={theme.palette.warning.main} />
                <Typography color="text.secondary" variant="body2">
                  Page Authority
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold" sx={{ color: getAuthorityColor(targetResult?.['page authority'] || 0) }}>
                {targetResult?.['page authority'] || 'N/A'}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Your Page PA
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Ranking Message */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Search size={24} />
            <Typography variant="h6" fontWeight="medium">
              Ranking Analysis
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Website:</strong> {website}
          </Typography>
          <Alert 
            severity={serpData.data.rank <= 10 ? 'success' : serpData.data.rank <= 20 ? 'warning' : 'error'}
            sx={{ mb: 2 }}
          >
            {serpData.data.message}
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Analysis shows your website's position among the top 99 Google search results for this keyword.
          </Typography>
        </CardContent>
      </Card>

      {/* SERP Results Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <BarChart3 size={24} />
            <Typography variant="h6" fontWeight="medium">
              Complete SERP Results
            </Typography>
            <Chip label={`${serpData.data.SERP.length} results`} size="small" />
          </Box>
          
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Rank</TableCell>
                  <TableCell>Title & Description</TableCell>
                  <TableCell>Domain</TableCell>
                  <TableCell align="center">DA</TableCell>
                  <TableCell align="center">PA</TableCell>
                  <TableCell align="center">Visit</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {serpData.data.SERP.map((result) => {
                  const isTargetSite = getDomainFromUrl(result.link).includes(targetSite.replace('https://', '').replace('http://', ''));
                  const domain = getDomainFromUrl(result.link);
                  
                  return (
                    <TableRow 
                      key={result.rank}
                      sx={{
                        backgroundColor: isTargetSite ? theme.palette.primary.light + '20' : 'transparent',
                        border: isTargetSite ? `2px solid ${theme.palette.primary.main}` : 'none',
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getRankIcon(result.rank)}
                          <Chip
                            label={`#${result.rank}`}
                            size="small"
                            sx={{
                              backgroundColor: getRankColor(result.rank),
                              color: 'white',
                              fontWeight: 'bold',
                            }}
                          />
                          {isTargetSite && (
                            <Chip label="YOUR SITE" size="small" color="primary" variant="outlined" />
                          )}
                        </Box>
                      </TableCell>
                      
                      <TableCell sx={{ maxWidth: 400 }}>
                        <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 0.5 }}>
                          {result.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {result.description}
                        </Typography>
                      </TableCell>
                      
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {domain.charAt(0).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {domain}
                          </Typography>
                        </Box>
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          label={result['domain authority']}
                          size="small"
                          sx={{
                            backgroundColor: getAuthorityColor(result['domain authority']),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Chip
                          label={result['page authority']}
                          size="small"
                          sx={{
                            backgroundColor: getAuthorityColor(result['page authority']),
                            color: 'white',
                            fontWeight: 'bold',
                          }}
                        />
                      </TableCell>
                      
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<ExternalLink size={16} />}
                          href={result.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outlined"
                        >
                          Visit
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}