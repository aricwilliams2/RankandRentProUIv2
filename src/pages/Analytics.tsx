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
} from 'lucide-react';
import type { Website, SEOMetrics } from '../types';

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