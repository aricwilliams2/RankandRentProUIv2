import React, { useEffect, useState } from "react";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, Tooltip, List, ListItem, ListItemText, ListItemIcon, Divider } from "@mui/material";
import { Plus, Pencil, Trash2, Globe, Mail, Phone, History, MessageCircle, PhoneCall, StickyNote, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../contexts/ClientContext";
import type { Client } from "../types";

export default function Clients() {
  const { 
    clients, 
    createClient, 
    updateClient, 
    deleteClient, 
    refreshClients,
    loading, 
    error 
  } = useClientContext();
  
  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    reviews: 0,
    website: "",
    notes: "",
  });

  // Refresh clients data when component mounts or becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshClients();
      }
    };

    const handleCustomRefresh = () => {
      refreshClients();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('refreshClients', handleCustomRefresh);
    
    // Also refresh when component mounts
    refreshClients();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('refreshClients', handleCustomRefresh);
    };
  }, [refreshClients]);

  const handleOpen = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
        city: client.city || "",
        reviews: client.reviews || 0,
        website: client.website || "",
        notes: client.notes || "",
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        city: "",
        reviews: 0,
        website: "",
        notes: "",
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedClient(null);
    setSubmitting(false);
  };

  const handleHistoryOpen = (client: Client) => {
    setSelectedClient(client);
    setHistoryOpen(true);
  };

  const handleHistoryClose = () => {
    setHistoryOpen(false);
    setSelectedClient(null);
  };

  const getHistoryIcon = (type: "email" | "call" | "note") => {
    switch (type) {
      case "email":
        return <MessageCircle size={20} />;
      case "call":
        return <PhoneCall size={20} />;
      case "note":
        return <StickyNote size={20} />;
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      if (selectedClient) {
        // Update existing client
        await updateClient(selectedClient.id, formData);
      } else {
        // Create new client
        await createClient(formData);
      }
      
      handleClose();
    } catch (err) {
      console.error("Failed to save client:", err);
      // Error is handled by the context
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await deleteClient(id);
      } catch (err) {
        console.error("Failed to delete client:", err);
        // Error is handled by the context
      }
    }
  };

  const handleViewAnalytics = (client: Client) => {
    if (client.website) {
      // Extract domain from website URL
      let domain = client.website;
      try {
        const url = new URL(client.website.startsWith('http') ? client.website : `https://${client.website}`);
        domain = url.hostname.replace('www.', '');
      } catch {
        // If URL parsing fails, use the website string as is
        domain = client.website.replace(/^https?:\/\//, '').replace('www.', '').split('/')[0];
      }
      
      navigate('/analytics', {
        state: {
          domain: domain
        }
      });
    }
  };
  

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Typography>Loading clients...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Box sx={{ mb: 2 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Box>
      )}
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Clients
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleOpen()}>
          Add Client
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Website</TableCell>
              <TableCell>Reviews</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients?.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Typography variant="subtitle2">{client.name}</Typography>
                  {client.city && (
                    <Typography variant="caption" color="text.secondary">
                      {client.city}
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 2 }}>
                    <Tooltip title={client.email}>
                      <IconButton size="small" color="primary">
                        <Mail size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={client.phone}>
                      <IconButton size="small" color="primary">
                        <Phone size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {client?.website ? (
                    <Tooltip title={client.website}>
                      <IconButton
                        size="small"
                        color="primary"
                        component="a"
                        href={client.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe size={18} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No website
                    </Typography>
                  )}
                </TableCell>
                <TableCell>${client.websites.reduce((sum, website) => sum + website.monthlyRevenue, 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {client.reviews || 0} reviews
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={client.contacted ? "Contacted" : "New"}
                    color={client.contacted ? "success" : "default"}
                  />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    {client.website && (
                      <Tooltip title="View Analytics">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleViewAnalytics(client)}
                        >
                          <BarChart3 size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <IconButton size="small" onClick={() => handleOpen(client)}>
                      <Pencil size={18} />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(client.id)}>
                      <Trash2 size={18} />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Name *"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              label="Email *"
              type="email"
              fullWidth
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              label="Phone *"
              fullWidth
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <TextField
              label="City"
              fullWidth
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            />
            <TextField
              label="Website"
              type="url"
              fullWidth
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              placeholder="https://example.com"
            />
            <TextField
              label="Reviews Count"
              type="number"
              fullWidth
              value={formData.reviews}
              onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) || 0 })}
              inputProps={{ min: 0 }}
            />
            <TextField
              label="Notes"
              multiline
              rows={3}
              fullWidth
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting || !formData.name || !formData.email || !formData.phone}
          >
            {selectedClient ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
