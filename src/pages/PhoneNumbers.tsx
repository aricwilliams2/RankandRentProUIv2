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
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Phone,
  Plus,
  Trash2,
  PhoneCall,
  PhoneMissed,
  Clock,
  DollarSign,
  Globe,
  Volume2,
  BarChart3,
  Forward,
  History,
} from 'lucide-react';
import type { PhoneNumber, Website } from '../types';

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
      topKeywords: ['plumbing', 'emergency plumber'],
      competitors: ['competitor1.com'],
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

interface Call {
  id: string;
  phoneNumberId: string;
  duration: number;
  status: 'completed' | 'missed' | 'voicemail';
  callerNumber: string;
  timestamp: Date;
  recording?: string;
  transcription?: string;
}

const mockPhoneNumbers: PhoneNumber[] = [
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
];

const mockCalls: Call[] = [
  {
    id: '1',
    phoneNumberId: '1',
    duration: 180,
    status: 'completed',
    callerNumber: '(555) 987-6543',
    timestamp: new Date('2024-03-17T14:30:00'),
    recording: 'call-recording-1.mp3',
    transcription: 'Hi, I need emergency plumbing service...',
  },
  {
    id: '2',
    phoneNumberId: '1',
    duration: 0,
    status: 'missed',
    callerNumber: '(555) 456-7890',
    timestamp: new Date('2024-03-17T15:45:00'),
  },
  {
    id: '3',
    phoneNumberId: '1',
    duration: 45,
    status: 'voicemail',
    callerNumber: '(555) 234-5678',
    timestamp: new Date('2024-03-17T16:15:00'),
    recording: 'voicemail-1.mp3',
  },
];

export default function PhoneNumbers() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(mockPhoneNumbers);
  const [websites] = useState<Website[]>(mockWebsites);
  const [calls] = useState<Call[]>(mockCalls);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [callHistoryOpen, setCallHistoryOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [formData, setFormData] = useState({
    websiteId: '',
    provider: 'Twilio',
  });

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNumber(null);
    setFormData({
      websiteId: '',
      provider: 'Twilio',
    });
  };

  const handleCallHistoryOpen = (number: PhoneNumber) => {
    setSelectedNumber(number);
    setCallHistoryOpen(true);
  };

  const handleCallHistoryClose = () => {
    setCallHistoryOpen(false);
    setSelectedNumber(null);
  };

  const handleSubmit = () => {
    // Simulated phone number purchase
    const newNumber: PhoneNumber = {
      id: String(Date.now()),
      number: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
      websiteId: formData.websiteId,
      provider: formData.provider,
      monthlyFee: 25,
      callCount: 0,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setPhoneNumbers([...phoneNumbers, newNumber]);
    handleDialogClose();
  };

  const handleDelete = (id: string) => {
    setPhoneNumbers(phoneNumbers.filter(number => number.id !== id));
  };

  const getCallStatusIcon = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return <PhoneCall size={16} color="green" />;
      case 'missed':
        return <PhoneMissed size={16} color="red" />;
      case 'voicemail':
        return <Volume2 size={16} color="orange" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Phone Numbers
        </Typography>
        <Button
          variant="contained"
          startIcon={<Plus size={20} />}
          onClick={handleDialogOpen}
        >
          Purchase Number
        </Button>
      </Box>

      <Grid container spacing={3}>
        {phoneNumbers.map((number) => {
          const website = websites.find(w => w.id === number.websiteId);
          const numberCalls = calls.filter(call => call.phoneNumberId === number.id);
          const completedCalls = numberCalls.filter(call => call.status === 'completed');
          const missedCalls = numberCalls.filter(call => call.status === 'missed');
          const averageDuration = completedCalls.length
            ? completedCalls.reduce((acc, call) => acc + call.duration, 0) / completedCalls.length
            : 0;

          return (
            <Grid item xs={12} md={6} key={number.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Phone size={20} />
                        <Typography variant="h6">{number.number}</Typography>
                        <Chip
                          size="small"
                          label={number.status}
                          color={number.status === 'active' ? 'success' : 'default'}
                        />
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Globe size={16} />
                        <Typography variant="body2" color="text.secondary">
                          {website?.domain || 'Unassigned'}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(number.id)}
                      >
                        <Trash2 size={18} />
                      </IconButton>
                    </Box>
                  </Box>

                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Monthly Fee</Typography>
                            <DollarSign size={16} />
                          </Box>
                          <Typography variant="h6">${number.monthlyFee}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Total Calls</Typography>
                            <PhoneCall size={16} />
                          </Box>
                          <Typography variant="h6">{numberCalls.length}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Missed Calls</Typography>
                            <PhoneMissed size={16} />
                          </Box>
                          <Typography variant="h6">{missedCalls.length}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary">Avg Duration</Typography>
                            <Clock size={16} />
                          </Box>
                          <Typography variant="h6">{formatDuration(Math.round(averageDuration))}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<History size={18} />}
                      onClick={() => handleCallHistoryOpen(number)}
                    >
                      Call History
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<BarChart3 size={18} />}
                    >
                      Analytics
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Purchase Number Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Purchase Phone Number</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Website</InputLabel>
              <Select
                value={formData.websiteId}
                label="Website"
                onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}
              >
                {websites.map((website) => (
                  <MenuItem key={website.id} value={website.id}>
                    {website.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Provider</InputLabel>
              <Select
                value={formData.provider}
                label="Provider"
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              >
                <MenuItem value="Twilio">Twilio</MenuItem>
                <MenuItem value="Vonage">Vonage</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Purchase
          </Button>
        </DialogActions>
      </Dialog>

      {/* Call History Dialog */}
      <Dialog
        open={callHistoryOpen}
        onClose={handleCallHistoryClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History size={20} />
            <Typography variant="h6">Call History</Typography>
          </Box>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedNumber?.number}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Caller</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calls
                  .filter(call => call.phoneNumberId === selectedNumber?.id)
                  .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
                  .map((call) => (
                    <TableRow key={call.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getCallStatusIcon(call.status)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {call.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{call.callerNumber}</TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {call.timestamp.toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {call.timestamp.toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {call.recording && (
                            <Tooltip title="Play Recording">
                              <IconButton size="small">
                                <Volume2 size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                          {call.status === 'missed' && (
                            <Tooltip title="Call Back">
                              <IconButton size="small">
                                <Forward size={18} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCallHistoryClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}