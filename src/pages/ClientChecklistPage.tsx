import React from 'react';
import { useParams, useLocation, Navigate } from 'react-router-dom';
import { Box, Typography, IconButton } from '@mui/material';
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

  if (!clientId || !client) {
    return <Navigate to="/clients" replace />;
  }

  const handleChecklistUpdate = (checklistData: any) => {
    console.log('Checklist updated:', checklistData);
    // Here you could save the checklist data to your backend
  };

  return (
    <Box>
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