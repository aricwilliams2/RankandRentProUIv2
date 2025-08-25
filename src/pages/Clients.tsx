import React, { useEffect, useState } from "react";
import { Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Chip, Tooltip, List, ListItem, ListItemText, ListItemIcon, Divider, Snackbar } from "@mui/material";
import { Plus, Pencil, Trash2, Globe, Mail, Phone, History, MessageCircle, PhoneCall, StickyNote, BarChart3, Copy, Check, Map, CheckSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useClientContext } from "../contexts/ClientContext";
import type { Client } from "../types";
import { useAuth } from "../contexts/AuthContext";

export default function Clients() {
  const { clients, createClient, updateClient, deleteClient, refreshClients, loading, error } = useClientContext();

  const [open, setOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    email: "",
    phone: "",
    city: "",
    reviews: 0,
    website: "",
    notes: "",
  });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

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

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("refreshClients", handleCustomRefresh);

    // Also refresh when component mounts
    refreshClients();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("refreshClients", handleCustomRefresh);
    };
  }, [refreshClients]);

  const handleOpen = (client?: Client) => {
    console.log("client", client);
    if (client) {
      setSelectedClient(client);
      setFormData({
        id: client?.id,
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
        id: "",
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

  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setSnackbarMessage("Email copied to clipboard!");
      setSnackbarOpen(true);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      setSnackbarMessage("Failed to copy email");
      setSnackbarOpen(true);
    }
  };

  const handleCallPhone = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  const handleViewAnalytics = (client: Client) => {
    if (client.website) {
      // Extract domain from website URL, preserving https://www.
      let domain = client.website;
      try {
        const url = new URL(client.website.startsWith("http") ? client.website : `https://${client.website}`);
        domain = url.protocol + '//' + url.hostname;
      } catch {
        // If URL parsing fails, use the website string as is
        domain = client.website
          .replace(/^https?:\/\//, "")
          .split("/")[0];
        // Add https:// back if it was stripped
        if (!client.website.startsWith("http")) {
          domain = `https://${domain}`;
        }
      }

      navigate("/analytics", {
        state: {
          domain: domain,
        },
      });
    }
  };

  const handleOpenChecklist = (client: Client) => {
    navigate(`/client-checklist/${client.id}`, {
      state: {
        client: client,
      },
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
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

      <Box sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        justifyContent: "space-between",
        alignItems: { xs: "stretch", sm: "center" },
        gap: { xs: 2, sm: 0 },
        mb: 4
      }}>
        <Typography variant="h4" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          Clients
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => handleOpen()}
          sx={{ width: { xs: "100%", sm: "auto" } }}
        >
          Add Client
        </Button>
      </Box>

      {/* Mobile Card View */}
      <Box sx={{ display: { xs: "block", md: "none" } }}>
        {clients?.map((client) => (
          <Card key={client.id} sx={{ mb: 2, p: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
              <Box>
                <Typography variant="subtitle1" fontWeight="medium">
                  {client.name}
                </Typography>
                {client.city && (
                  <Typography variant="caption" color="text.secondary">
                    {client.city}
                  </Typography>
                )}
              </Box>
              <Chip size="small" label={client.contacted ? "Contacted" : "New"} color={client.contacted ? "success" : "default"} />
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Mail size={14} />
                <Typography variant="body2">{client.email}</Typography>
                <IconButton size="small" onClick={() => handleCopyEmail(client.email)}>
                  {copiedEmail === client.email ? <Check size={14} /> : <Copy size={14} />}
                </IconButton>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Phone size={14} />
                <Typography variant="body2">{client.phone}</Typography>
                <IconButton size="small" onClick={() => handleCallPhone(client.phone)}>
                  <PhoneCall size={14} />
                </IconButton>
              </Box>
              {client.website && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Globe size={14} />
                  <Typography variant="body2" sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {client.website}
                  </Typography>
                  <IconButton size="small" component="a" href={client.website} target="_blank" rel="noopener noreferrer">
                    <Globe size={14} />
                  </IconButton>
                </Box>
              )}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                {client.reviews || 0} reviews
              </Typography>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleOpenChecklist(client)}
                  sx={{
                    backgroundColor: '#4caf50',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: '#45a049',
                    },
                    fontSize: '0.75rem',
                    px: 1,
                    py: 0.5,
                    minWidth: 'auto',
                    textTransform: 'none',
                  }}
                  startIcon={<CheckSquare size={14} />}
                >
                  SEO Checklist 💰
                </Button>
                {client.website && (
                  <IconButton size="small" color="info" onClick={() => handleViewAnalytics(client)}>
                    <BarChart3 size={16} />
                  </IconButton>
                )}
                {client.website && (
                  <IconButton size="small" color="warning" onClick={() => openGoogleMapsSearch(client.website!)}>
                    <Map size={16} />
                  </IconButton>
                )}
                <IconButton size="small" onClick={() => handleOpen(client)}>
                  <Pencil size={16} />
                </IconButton>
                <IconButton size="small" color="error" onClick={() => handleDelete(client.id)}>
                  <Trash2 size={16} />
                </IconButton>
              </Box>
            </Box>
          </Card>
        ))}
      </Box>

      {/* Desktop Table View */}
      <TableContainer component={Paper} sx={{ display: { xs: "none", md: "block" } }}>
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
                    <Tooltip title={`Copy ${client.email} to clipboard`}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleCopyEmail(client.email)}
                      >
                        {copiedEmail === client.email ? <Check size={18} /> : <Copy size={18} />}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={`Call ${client.phone}`}>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleCallPhone(client.phone)}
                      >
                        <PhoneCall size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
                <TableCell>
                  {client?.website ? (
                    <Tooltip title={client.website}>
                      <IconButton size="small" color="primary" component="a" href={client.website} target="_blank" rel="noopener noreferrer">
                        <Globe size={18} />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No website
                    </Typography>
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    N/A
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{client.reviews || 0} reviews</Typography>
                </TableCell>
                <TableCell>
                  <Chip size="small" label={client.contacted ? "Contacted" : "New"} color={client.contacted ? "success" : "default"} />
                </TableCell>
                <TableCell align="right">
                  <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                    <Tooltip title="SEO Checklist">
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOpenChecklist(client)}
                        sx={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#45a049',
                          },
                          fontSize: '0.75rem',
                          px: 1.5,
                          py: 0.5,
                          minWidth: 'auto',
                          textTransform: 'none',
                        }}
                        startIcon={<CheckSquare size={14} />}
                      >
                        SEO Checklist 💰
                      </Button>
                    </Tooltip>
                    {client.website && (
                      <Tooltip title="View Analytics">
                        <IconButton size="small" color="info" onClick={() => handleViewAnalytics(client)}>
                          <BarChart3 size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    {client.website && (
                      <Tooltip title="Click to see Google GMB">
                        <IconButton size="small" color="warning" onClick={() => openGoogleMapsSearch(client.website!)}>
                          <Map size={18} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Edit Client">
                      <IconButton size="small" onClick={() => handleOpen(client)}>
                        <Pencil size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Client">
                      <IconButton size="small" color="error" onClick={() => handleDelete(client.id)}>
                        <Trash2 size={18} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth sx={{ '& .MuiDialog-paper': { width: { xs: '95%', sm: '600px' }, m: { xs: 2, sm: 'auto' } } }}>
        <DialogTitle>{selectedClient ? "Edit Client" : "Add New Client"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name *" fullWidth value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            <TextField label="Email *" type="email" fullWidth value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
            <TextField label="Phone *" fullWidth value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
            <TextField label="City" fullWidth value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
            <TextField label="Website" type="url" fullWidth value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" />
            <TextField label="Reviews Count" type="number" fullWidth value={formData.reviews} onChange={(e) => setFormData({ ...formData, reviews: parseInt(e.target.value) || 0 })} inputProps={{ min: 0 }} />
            <TextField label="Notes" multiline rows={3} fullWidth value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={submitting || !formData.name || !formData.email || !formData.phone}>
            {selectedClient ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
      />
    </Box>
  );
}
