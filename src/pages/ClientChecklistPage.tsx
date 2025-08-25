import React from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { Box, Typography, IconButton, Alert } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientChecklist from '../components/ClientChecklist';
import type { Client } from '../types';

export default function ClientChecklistPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get client data from navigation state or fallback
  const client = location.state?.client as Client;

  if (!clientId) {
    return <Navigate to="/clients" replace />;
  }

  if (!client) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">
          Client information not found. Please navigate back to the clients list and try again.
        </Alert>
        <IconButton
          onClick={() => navigate('/clients')}
          sx={{ mt: 2 }}
        >
          <ArrowLeft size={24} />
        </IconButton>
      </Box>
    );
  }

  const handleChecklistUpdate = (checklistData: any) => {
    console.log('Checklist updated:', checklistData);
    // Here you could save the checklist data to your backend
    // The checklist data is now automatically persisted via the API
  };

  return (
    <Box sx={{ maxWidth: '1200px', margin: '0 auto', p: 3 }}>
      {/* Header with back button */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton
          onClick={() => navigate('/clients')}
          sx={{ mr: 2 }}
        >
          <ArrowLeft size={24} />
        </IconButton>
        <Typography variant="h5" fontWeight="bold">
          Back to Clients
        </Typography>
      </Box>

      {/* Client Checklist Component */}
      <ClientChecklist
        clientId={clientId}
        clientName={client.name}
        onUpdate={handleChecklistUpdate}
      />
    </Box>
  );
} 