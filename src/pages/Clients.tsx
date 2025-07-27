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
  });

  const handleOpen = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        phone: client.phone,
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
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
    if (client.websites.length > 0) {
      const website = client.websites[0]; // Use first website
      navigate('/analytics', {
        state: {
          website: website,
          domain: website.domain,
          keywords: website.seoMetrics?.topKeywords || []
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
              <TableCell>Websites</TableCell>
              <TableCell>Revenue</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>
                  <Typography variant="subtitle2">{client.name}</Typography>
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
                    <Tooltip title="View History">
                      <IconButton size="small" color="primary" onClick={() => handleHistoryOpen(client)}>
                        <History size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {client.websites.map((website) => (
                      <Tooltip key={website.id} title={website.domain}>
                        <IconButton size="small" color="primary">
                          <Globe size={18} />
                        </IconButton>
                      </Tooltip>
                    ))}
                  </Box>
                </TableCell>
                <TableCell>${client.websites.reduce((sum, website) => sum + website.monthlyRevenue, 0).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip size="small" label={client.websites.length > 0 ? "Active" : "New"} color={client.websites.length > 0 ? "success" : "default"} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    {client.websites.length > 0 && (
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
            <TextField label="Name" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
            <TextField label="Phone" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {selectedClient ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={historyOpen} onClose={handleHistoryClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <History size={20} />
            <Typography variant="h6">Communication History</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedClient?.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <List>
            {selectedClient?.communicationHistory
              .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
              .map((comm, index) => (
                <React.Fragment key={comm.id}>
                  <ListItem alignItems="flex-start">
                    <ListItemIcon sx={{ minWidth: 40 }}>{getHistoryIcon(comm.type)}</ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                          <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
                            {comm.type}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(comm.createdAt).toLocaleString()}
                          </Typography>
                        </Box>
                      }
                      secondary={comm.content}
                    />
                  </ListItem>
                  {index < selectedClient.communicationHistory.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHistoryClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
