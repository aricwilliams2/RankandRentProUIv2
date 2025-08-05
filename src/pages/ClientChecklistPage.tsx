import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
} from '@mui/material';
import {
  Plus,
  Users,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import ClientChecklist from '../components/ClientChecklist';
import type { ClientChecklist as ClientChecklistType } from '../types';

interface Client {
  id: string;
  name: string;
  email: string;
  business: string;
  status: 'active' | 'pending' | 'completed';
  progress: number;
  lastUpdated: Date;
}

const sampleClients: Client[] = [
  {
    id: '1',
    name: 'John Smith',
    email: 'john@acmeplumbing.com',
    business: 'Acme Plumbing Services',
    status: 'active',
    progress: 65,
    lastUpdated: new Date('2024-01-15'),
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@eliteelectric.com',
    business: 'Elite Electric Solutions',
    status: 'pending',
    progress: 25,
    lastUpdated: new Date('2024-01-10'),
  },
  {
    id: '3',
    name: 'Mike Davis',
    email: 'mike@premiumhvac.com',
    business: 'Premium HVAC Services',
    status: 'completed',
    progress: 100,
    lastUpdated: new Date('2024-01-20'),
  },
];

export default function ClientChecklistPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showClientList, setShowClientList] = useState(true);
  const [checklistData, setChecklistData] = useState<{ [key: string]: ClientChecklistType }>({});

  const handleClientSelect = (client: Client) => {
    setSelectedClient(client);
    setShowClientList(false);
  };

  const handleBackToList = () => {
    setSelectedClient(null);
    setShowClientList(true);
  };

  const handleChecklistUpdate = (checklist: ClientChecklistType) => {
    setChecklistData(prev => ({
      ...prev,
      [checklist.clientId]: checklist,
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'primary';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <TrendingUp size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'completed':
        return <CheckCircle size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  if (!showClientList) {
    return (
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleBackToList}
            startIcon={<Users size={20} />}
          >
            Back to Clients
          </Button>
          <Typography variant="h4">
            {selectedClient?.business} - Checklist
          </Typography>
        </Box>
        
        {selectedClient && (
          <ClientChecklist
            clientId={selectedClient.id}
            clientName={selectedClient.business}
            onUpdate={handleChecklistUpdate}
          />
        )}
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">
          Client Checklists
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={() => {/* Add new client functionality */}}
        >
          Add New Client
        </Button>
      </Box>

      <Grid container spacing={3}>
        {sampleClients.map((client) => (
          <Grid item xs={12} md={6} lg={4} key={client.id}>
            <Card 
              sx={{ 
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                }
              }}
              onClick={() => handleClientSelect(client)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {client.name.charAt(0)}
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      {client.business}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.name} • {client.email}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <Chip
                    icon={getStatusIcon(client.status)}
                    label={client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                    color={getStatusColor(client.status) as any}
                    size="small"
                  />
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.progress}%
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: '100%',
                      height: 8,
                      backgroundColor: 'grey.200',
                      borderRadius: 4,
                      overflow: 'hidden',
                    }}
                  >
                    <Box
                      sx={{
                        width: `${client.progress}%`,
                        height: '100%',
                        backgroundColor: 'primary.main',
                        transition: 'width 0.3s ease',
                      }}
                    />
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary">
                  Last updated: {client.lastUpdated.toLocaleDateString()}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {sampleClients.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Users size={48} color="#ccc" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No clients yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add your first client to start tracking their checklist progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<Plus size={20} />}
              onClick={() => {/* Add new client functionality */}}
            >
              Add First Client
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 