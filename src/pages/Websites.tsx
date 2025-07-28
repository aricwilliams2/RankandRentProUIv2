import React, { useState } from "react";
import React, { useState, useEffect } from "react";
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
  Alert,
} from "@mui/material";
import { Globe, Plus, Pencil, Trash2, ExternalLink, Users, Phone, TrendingUp, MessageSquare, DollarSign, ArrowUpRight, ArrowDownRight, FileText, Send, Tag } from "lucide-react";
import type { Website, Lead } from "../types";
import { useWebsiteContext } from "../contexts/WebsiteContext";

export default function Websites() {
  const { websites, createWebsite, updateWebsite, deleteWebsite, refreshWebsites, loading, error } = useWebsiteContext();
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [websiteDialogOpen, setWebsiteDialogOpen] = useState(false);
  const [leadsDialogOpen, setLeadsDialogOpen] = useState(false);
  const [contentDialogOpen, setContentDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    domain: "",
    niche: "",
  });
  const [contentKeywords, setContentKeywords] = useState("");
  const [additionalKeywords, setAdditionalKeywords] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");

  // Load websites on component mount
  useEffect(() => {
    refreshWebsites();
  }, [refreshWebsites]);

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
        domain: "",
        niche: "",
      });
    }
    setWebsiteDialogOpen(true);
  };

  const handleWebsiteDialogClose = () => {
    setWebsiteDialogOpen(false);
    setSelectedWebsite(null);
    setSubmitting(false);
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
    setContentKeywords("");
    setAdditionalKeywords("");
    setContentTitle("");
    setGeneratedContent("");
  };

  const handleContentDialogClose = () => {
    setContentDialogOpen(false);
    setSelectedWebsite(null);
  };

  const handleWebsiteSubmit = async () => {
    setSubmitting(true);
    try {
      const websiteData = {
        domain: formData.domain,
        niche: formData.niche,
        status: "active" as const,
      };

      if (selectedWebsite) {
        // Update existing website
        await updateWebsite(selectedWebsite.id, websiteData);
      } else {
        // Add new website
        await createWebsite(websiteData);
      }
      handleWebsiteDialogClose();
    } catch (err) {
      console.error("Failed to save website:", err);
      // Error is handled by the context
    } finally {
      setSubmitting(false);
    }
  };

  const handleWebsiteDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this website?")) {
      try {
        await deleteWebsite(id);
      } catch (err) {
        console.error("Failed to delete website:", err);
        // Error is handled by the context
      }
    }
  };

  const generateContent = async () => {
    setIsGeneratingContent(true);
    // Simulate API call
    try {
      // This would be replaced with an actual API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

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
      console.error("Error generating content:", error);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  const getLeadStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "new":
        return "info";
      case "contacted":
        return "warning";
      case "qualified":
        return "success";
      case "converted":
        return "primary";
      default:
        return "default";
    }
  };

  const getLeadSourceIcon = (source: Lead["source"]) => {
    switch (source) {
      case "form":
        return <MessageSquare size={16} />;
      case "call":
        return <Phone size={16} />;
      default:
        return null;
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Websites
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleWebsiteDialogOpen()}>
          Add Website
        </Button>
      </Box>

      {loading && websites.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
      <Grid container spacing={3}>
        {websites.map((website) => (
          <Grid item xs={12} key={website.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                      <Globe size={20} />
                      <Typography variant="h6">{website.domain}</Typography>
                      <Chip size="small" label={website.status} color={website.status === "active" ? "success" : "default"} />
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      Niche: {website.niche}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small" onClick={() => handleWebsiteDialogOpen(website)}>
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleWebsiteDelete(website.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Monthly Revenue
                          </Typography>
                          <DollarSign size={16} />
                        </Box>
                        <Typography variant="h6">${(website.monthlyRevenue || 0).toLocaleString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Leads
                          </Typography>
                          <Users size={16} />
                        </Box>
                        <Typography variant="h6">{website.leads?.length || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Phone Numbers
                          </Typography>
                          <Phone size={16} />
                        </Box>
                        <Typography variant="h6">{website.phoneNumbers?.length || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Organic Traffic
                          </Typography>
                          <TrendingUp size={16} />
                        </Box>
                        <Typography variant="h6">{website.seoMetrics?.organicTraffic?.toLocaleString() || 0}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                <Box sx={{ display: "flex", gap: 2 }}>
                  <Button variant="outlined" size="small" startIcon={<Users size={18} />} onClick={() => handleLeadsDialogOpen(website)}>
                    View Leads
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<ExternalLink size={18} />} href={`https://${website.domain}`} target="_blank" rel="noopener noreferrer">
                    Visit Website
                  </Button>
                  <Button variant="outlined" size="small" startIcon={<FileText size={18} />} onClick={() => handleContentDialogOpen(website)}>
                    Write Content
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Website Dialog */}
      <Dialog open={websiteDialogOpen} onClose={handleWebsiteDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedWebsite ? "Edit Website" : "Add New Website"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Domain" fullWidth value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} placeholder="example.com" />
            <TextField label="Niche" fullWidth value={formData.niche} onChange={(e) => setFormData({ ...formData, niche: e.target.value })} placeholder="e.g., Plumbing, Real Estate, etc." />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWebsiteDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleWebsiteSubmit}
            disabled={submitting || !formData.domain || !formData.niche}
          >
            {submitting ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <span>{selectedWebsite ? "Updating..." : "Creating..."}</span>
              </Box>
            ) : (
              selectedWebsite ? "Update" : "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leads Dialog */}
      <Dialog open={leadsDialogOpen} onClose={handleLeadsDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Users size={20} />
            <Typography variant="h6">Leads</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWebsite?.domain}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedWebsite?.leads && selectedWebsite.leads.length > 0 ? (
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
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                          <Typography variant="body2">{lead.email}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {lead.phone}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={lead.source}>
                          <Box sx={{ display: "flex", alignItems: "center" }}>{getLeadSourceIcon(lead.source)}</Box>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                          <Typography>${lead.value}</Typography>
                          {lead.value > 300 ? <ArrowUpRight size={16} color="green" /> : <ArrowDownRight size={16} color="red" />}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip size="small" label={lead.status} color={getLeadStatusColor(lead.status)} />
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
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                No leads found for this website
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLeadsDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Content Writing Dialog */}
      <Dialog open={contentDialogOpen} onClose={handleContentDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FileText size={20} />
            <Typography variant="h6">Content Writer</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedWebsite?.domain}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {!generatedContent ? (
            <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
              <Typography variant="body1">Generate SEO-optimized content for your website by entering your target keywords below.</Typography>

              <TextField label="Content Title" fullWidth value={contentTitle} onChange={(e) => setContentTitle(e.target.value)} placeholder="e.g., Ultimate Guide to Emergency Plumbing Services" />

              <TextField label="Primary Keywords" fullWidth value={contentKeywords} onChange={(e) => setContentKeywords(e.target.value)} placeholder="e.g., emergency plumbing, water leak repair" helperText="Enter your main target keywords separated by commas" />

              <TextField label="Secondary Keywords" fullWidth value={additionalKeywords} onChange={(e) => setAdditionalKeywords(e.target.value)} placeholder="e.g., 24/7 plumbing service, water damage prevention" helperText="Enter additional keywords to include in the content" />

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Typography variant="subtitle2" sx={{ width: "100%" }}>
                  Recommended Keywords:
                </Typography>
                {selectedWebsite?.seoMetrics?.topKeywords?.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    size="small"
                    icon={<Tag size={14} />}
                    onClick={() => {
                      if (!contentKeywords.includes(keyword)) {
                        setContentKeywords((prev) => (prev ? `${prev}, ${keyword}` : keyword));
                      }
                    }}
                    sx={{ cursor: "pointer" }}
                  />
                )) || []}
              </Box>
            </Box>
          ) : (
            <Box sx={{ pt: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Generated Content Preview
                </Typography>
                <Button
                  size="small"
                  startIcon={<FileText size={16} />}
                  onClick={() => {
                    // In a real app, this would download or copy the content
                    alert("Content export functionality would be implemented here");
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
                  maxHeight: "400px",
                  overflow: "auto",
                  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                  whiteSpace: "pre-wrap",
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
              <Button variant="contained" startIcon={isGeneratingContent ? null : <Send size={18} />} onClick={generateContent} disabled={isGeneratingContent || !contentKeywords || !contentTitle}>
                {isGeneratingContent ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} />
                    <span>Generating...</span>
                  </Box>
                ) : (
                  "Generate Content"
                )}
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setGeneratedContent("");
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
