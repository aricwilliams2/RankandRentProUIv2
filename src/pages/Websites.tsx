import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  MenuItem,
  CircularProgress,
  Stack,
} from '@mui/material';
import {
  Globe,
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Users,
  Phone,
  TrendingUp,
  MessageSquare,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Send,
  Tag,
} from 'lucide-react';
import type { Website, Lead } from '../types';

// Mock data - replace with actual API calls
const initialWebsites: Website[] = [
  {
    id: '1',
    domain: 'acmeplumbing.com',
    niche: 'Plumbing',
    status: 'active',
    monthlyRevenue: 2500,
    phoneNumbers: [
      {
        id: '1',
        number: '(555) 123-4567',
        websiteId: '1',
        provider: 'Twilio',
        monthlyFee: 25,
        callCount: 45,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ],
    leads: [
      {
        id: '1',
        websiteId: '1',
        name: 'John Smith',
        email: 'john@example.com',
        phone: '(555) 987-6543',
        source: 'form',
        status: 'new',
        value: 250,
        createdAt: new Date('2024-03-17T10:30:00'),
        updatedAt: new Date('2024-03-17T10:30:00'),
      },
      {
        id: '2',
        websiteId: '1',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        phone: '(555) 456-7890',
        source: 'call',
        status: 'qualified',
        value: 500,
        createdAt: new Date('2024-03-16T15:45:00'),
        updatedAt: new Date('2024-03-16T16:30:00'),
      }
    ],
    seoMetrics: {
      domainAuthority: 35,
      backlinks: 150,
      organicKeywords: 500,
      organicTraffic: 2000,
      topKeywords: ['emergency plumber', 'plumbing services'],
      competitors: ['competitor1.com', 'competitor2.com'],
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function Websites() {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);
  const [leadsDialogOpen, setLeadsDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    domain: '',
    niche: '',
  });
  const [contentKeywords, setContentKeywords] = useState('');
  const [additionalKeywords, setAdditionalKeywords] = useState('');
  const [contentTitle, setContentTitle] = useState('');
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleWebsiteDialogOpen = (website?: Website) => {
    if (website) {
      setSelectedWebsite(website);
      setFormData({
        domain: website.domain,
        niche: website.niche,
      });
    } else {
      setSelectedWebsite(null);
      setFormData({
        domain: '',
        niche: '',
      });
    }
    setWebsiteDialogOpen(true);
  };

  const handleWebsiteDialogClose = () => {
    setWebsiteDialogOpen(false);
    setSelectedWebsite(null);
  };

  const handleLeadsDialogOpen = (website: Website) => {
    setSelectedWebsite(website);
    setLeadsDialogOpen(true);
  };

  const handleLeadsDialogClose = () => {
    setLeadsDialogOpen(false);
    setSelectedWebsite(null);
  };

  const handleContentDialogOpen = (website: Website) => {
    setSelectedWebsite(website);
    setContentDialogOpen(true);
    setContentKeywords('');
    setAdditionalKeywords('');
    setContentTitle('');
    setGeneratedContent('');
  };

  const handleContentDialogClose = () => {
    setContentDialogOpen(false);
    setSelectedWebsite(null);
  };

  const handleWebsiteSubmit = () => {
    if (selectedWebsite) {
      // Update existing website
      setWebsites(websites.map(website =>
        website.id === selectedWebsite.id
          ? {
              ...website,
              ...formData,
              updatedAt: new Date(),
            }
          : website
      ));
    } else {
      // Add new website
      const newWebsite: Website = {
        id: String(Date.now()),
        ...formData,
        status: 'active',
        monthlyRevenue: 0,
        phoneNumbers: [],
        leads: [],
        seoMetrics: {
          domainAuthority: 0,
          backlinks: 0,
          organicKeywords: 0,
          organicTraffic: 0,
          topKeywords: [],
          competitors: [],
          lastUpdated: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setWebsites([...websites, newWebsite]);
    }
    handleWebsiteDialogClose();
  };

  const handleWebsiteDelete = (id: string) => {
    setWebsites(websites.filter(website => website.id !== id));
  };

  const generateContent = async () => {
    setIsGeneratingContent(true);
    // Simulate API call
    try {
      // This would be replaced with an actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock generated content
      const mockContent = `
# ${contentTitle}

## Introduction
This is an in-depth guide about ${contentKeywords} for ${selectedWebsite?.domain}. We'll explore the most important aspects of this topic and provide valuable information for our readers.

## Key Points About ${contentKeywords}
- Professional services available in your area
- How to choose the right service provider
- Common problems and solutions
- Cost considerations and budgeting tips

## Why Choose Professional Services
When dealing with ${contentKeywords}, it's important to work with qualified professionals who understand the specific requirements and best practices in the ${selectedWebsite?.niche} industry.

## Additional Information on ${additionalKeywords}
We also provide specialized services related to ${additionalKeywords}, which complement our core offerings and provide a comprehensive solution for all your needs.

## Conclusion
Contact us today to learn more about our professional ${contentKeywords} services and how we can help you achieve the best results for your specific situation.
      `;
      
      setGeneratedContent(mockContent);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const getLeadStatusColor = (status: Lead['status']) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'contacted':
        return 'warning';
      case 'qualified':
        return 'success';
      case 'converted':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getLeadSourceIcon = (source: Lead['source']) => {
    switch (source) {
      case 'form':
        return <MessageSquare size={16} />;
      case 'call':
        return <Phone size={16} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Websites
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleWebsiteDialogOpen()}
        >
          Add Website
        </Button>
      </Box>

      <Grid container spacing={3}>
        {websites.map((website) => (
          <Grid item xs={12} key={website.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Globe size={20} />
                      <Typography variant="h6">{website.domain}</Typography>
                      <Chip
                        size="small"
                        label={website.status}
                        color={website.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Niche: {website.niche}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleWebsiteDialogOpen(website)}
                    >
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleWebsiteDelete(website.id)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
                          <DollarSign size={16} />
                        </Box>
                        <Typography variant="h6">${website.monthlyRevenue.toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Leads</Typography>
                          <Users size={16} />
                        </Box>
                        <Typography variant="h6">{website.leads.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Phone Numbers</Typography>
                          <Phone size={16} />
                        </Box>
                        <Typography variant="h6">{website.phoneNumbers.length}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">Organic Traffic</Typography>
                          <TrendingUp size={16} />
                        </Box>
                        <Typography variant="h6">{website.seoMetrics.organicTraffic.toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Users size={18} />}
                    onClick={() => handleLeadsDialogOpen(website)}
                  >
                    View Leads
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ExternalLink size={18} />}
                    href={`https://${website.domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Visit Website
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<FileText size={18} />}
                    onClick={() => handleContentDialogOpen(website)}
                  >
                    Write Content
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Website Dialog */}
      <Dialog
        open={websiteDialogOpen}
        onClose={handleWebsiteDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedWebsite ? 'Edit Website' : 'Add New Website'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Domain"
              fullWidth
              value={formData.domain}
              onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
              placeholder="example.com"
            />
            <TextField
              label="Niche"
              fullWidth
              value={formData.niche}
              onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
              placeholder="e.g., Plumbing, Real Estate, etc."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWebsiteDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleWebsiteSubmit}>
            {selectedWebsite ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leads Dialog */}
      <Dialog
        open={leadsDialogOpen}
        onClose={handleLeadsDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={20} />
            <Typography variant="h6">Leads</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWebsite?.domain}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedWebsite?.leads
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell>{lead.name}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2">{lead.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lead.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={lead.source}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getLeadSourceIcon(lead.source)}
                          </Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Typography>${lead.value}</Typography>
                          {lead.value > 300 ? (
                            <ArrowUpRight size={16} color="green" />
                          ) : (
                            <ArrowDownRight size={16} color="red" />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={lead.status}
                          color={getLeadStatusColor(lead.status)}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(lead.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeadsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Content Writing Dialog */}
      <Dialog
        open={contentDialogOpen}
        onClose={handleContentDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <FileText size={20} />
            <Typography variant="h6">Content Writer</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWebsite?.domain}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {!generatedContent ? (
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body1">
                Generate SEO-optimized content for your website by entering your target keywords below.
              </Typography>
              
              <TextField
                label="Content Title"
                fullWidth
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                placeholder="e.g., Ultimate Guide to Emergency Plumbing Services"
              />
              
              <TextField
                label="Primary Keywords"
                fullWidth
                value={contentKeywords}
                onChange={(e) => setContentKeywords(e.target.value)}
                placeholder="e.g., emergency plumbing, water leak repair"
                helperText="Enter your main target keywords separated by commas"
              />
              
              <TextField
                label="Secondary Keywords"
                fullWidth
                value={additionalKeywords}
                onChange={(e) => setAdditionalKeywords(e.target.value)}
                placeholder="e.g., 24/7 plumbing service, water damage prevention"
                helperText="Enter additional keywords to include in the content"
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Typography variant="subtitle2" sx={{ width: '100%' }}>
                  Recommended Keywords:
                </Typography>
                {selectedWebsite?.seoMetrics.topKeywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    icon={<Tag size={14} />}
                    onClick={() => {
                      if (!contentKeywords.includes(keyword)) {
                        setContentKeywords(prev => 
                          prev ? `${prev}, ${keyword}` : keyword
                        );
                      }
                    }}
                    sx={{ cursor: 'pointer' }}
                  />
                ))}
              </Box>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Generated Content Preview
                </Typography>
                <Button 
                  size="small" 
                  startIcon={<FileText size={16} />}
                  onClick={() => {
                    // In a real app, this would download or copy the content
                    alert('Content export functionality would be implemented here');
                  }}
                >
                  Export
                </Button>
              </Box>
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  maxHeight: '400px', 
                  overflow: 'auto',
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {generatedContent}
              </Paper>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {!generatedContent ? (
            <>
              <Button onClick={handleContentDialogClose}>Cancel</Button>
              <Button 
                variant="contained" 
                startIcon={isGeneratingContent ? null : <Send size={18} />}
                onClick={generateContent}
                disabled={isGeneratingContent || !contentKeywords || !contentTitle}
              >
                {isGeneratingContent ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} />
                    <span>Generating...</span>
                  </Box>
                ) : 'Generate Content'}
              </Button>
            </>
          ) : (
            <>
              <Button 
                onClick={() => {
                  setGeneratedContent('');
                }}
              >
                Edit Keywords
              </Button>
              <Button onClick={handleContentDialogClose}>Close</Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}