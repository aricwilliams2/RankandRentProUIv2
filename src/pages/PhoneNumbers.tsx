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
  Alert,
  Snackbar,
  CircularProgress,
  Tabs,
  Tab,
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
  Search,
  Play,
  Pause,
  Stop,
  Mic,
  MicOff,
} from 'lucide-react';
import type { PhoneNumber, Website } from '../types';
import { useTwilio } from '../hooks/useTwilio';

// Mock data for websites - replace with actual API calls
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
  call_sid: string;
  phoneNumberId: string;
  duration: number;
  status: 'completed' | 'missed' | 'voicemail' | 'failed' | 'busy' | 'no-answer';
  callerNumber: string;
  timestamp: Date;
  recording?: string;
  transcription?: string;
  price?: number;
}

interface AvailableNumber {
  phoneNumber: string;
  locality: string;
  region: string;
  capabilities: {
    voice: boolean;
    sms: boolean;
  };
}

export default function PhoneNumbers() {
  const [activeTab, setActiveTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [callHistoryOpen, setCallHistoryOpen] = useState(false);
  const [callInterfaceOpen, setCallInterfaceOpen] = useState(false);
  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [searchParams, setSearchParams] = useState({
    areaCode: '',
    country: 'US',
  });
  const [callData, setCallData] = useState({
    to: '',
    from: '',
    record: true,
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info';
  }>({ open: false, message: '', severity: 'info' });

  const {
    usePhoneNumbers,
    useAvailableNumbers,
    useCallLogs,
    useRecordings,
    useBuyNumber,
    useMakeCall,
    useDeletePhoneNumber,
    useDeleteRecording,
  } = useTwilio();

  // Queries
  const { data: phoneNumbers = [], isLoading: phoneNumbersLoading, error: phoneNumbersError } = usePhoneNumbers();
  const { data: availableNumbers, isLoading: availableNumbersLoading } = useAvailableNumbers(searchParams);
  const { data: callLogsData, isLoading: callLogsLoading } = useCallLogs();
  const { data: recordingsData, isLoading: recordingsLoading } = useRecordings();

  // Mutations
  const buyNumberMutation = useBuyNumber();
  const makeCallMutation = useMakeCall();
  const deletePhoneNumberMutation = useDeletePhoneNumber();
  const deleteRecordingMutation = useDeleteRecording();

  const handleDialogOpen = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedNumber(null);
    setSearchParams({ areaCode: '', country: 'US' });
  };

  const handleCallHistoryOpen = (number: PhoneNumber) => {
    setSelectedNumber(number);
    setCallHistoryOpen(true);
  };

  const handleCallHistoryClose = () => {
    setCallHistoryOpen(false);
    setSelectedNumber(null);
  };

  const handleCallInterfaceOpen = () => {
    setCallInterfaceOpen(true);
  };

  const handleCallInterfaceClose = () => {
    setCallInterfaceOpen(false);
    setCallData({ to: '', from: '', record: true });
  };

  const handleRecordingsOpen = () => {
    setRecordingsOpen(true);
  };

  const handleRecordingsClose = () => {
    setRecordingsOpen(false);
  };

  const handleBuyNumber = async (phoneNumber: string) => {
    try {
      await buyNumberMutation.mutateAsync({
        phoneNumber,
        country: searchParams.country,
        areaCode: searchParams.areaCode,
      });
      setSnackbar({
        open: true,
        message: 'Phone number purchased successfully!',
        severity: 'success',
      });
      handleDialogClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to purchase phone number: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  const handleMakeCall = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!callData.to) {
      setSnackbar({
        open: true,
        message: 'Please enter a phone number to call',
        severity: 'error',
      });
      return;
    }

    try {
      const result = await makeCallMutation.mutateAsync(callData);
      setSnackbar({
        open: true,
        message: `Call initiated! Call SID: ${result.callSid}`,
        severity: 'success',
      });
      handleCallInterfaceClose();
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to initiate call: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  const handleDeletePhoneNumber = async (id: string) => {
    try {
      await deletePhoneNumberMutation.mutateAsync(id);
      setSnackbar({
        open: true,
        message: 'Phone number deleted successfully!',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: `Failed to delete phone number: ${error instanceof Error ? error.message : 'Unknown error'}`,
        severity: 'error',
      });
    }
  };

  const handleDeleteRecording = async (recordingSid: string) => {
    if (window.confirm('Are you sure you want to delete this recording?')) {
      try {
        await deleteRecordingMutation.mutateAsync(recordingSid);
        setSnackbar({
          open: true,
          message: 'Recording deleted successfully!',
          severity: 'success',
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: `Failed to delete recording: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
        });
      }
    }
  };

  const getCallStatusIcon = (status: Call['status']) => {
    switch (status) {
      case 'completed':
        return <PhoneCall size={16} color="green" />;
      case 'missed':
        return <PhoneMissed size={16} color="red" />;
      case 'voicemail':
        return <Volume2 size={16} color="orange" />;
      case 'failed':
        return <PhoneMissed size={16} color="red" />;
      case 'busy':
        return <PhoneMissed size={16} color="orange" />;
      case 'no-answer':
        return <PhoneMissed size={16} color="red" />;
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds === 0) return '0:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatRecordingDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const callLogs = callLogsData?.callLogs || [];
  const recordings = recordingsData?.recordings || [];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Phone Numbers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PhoneCall size={20} />}
            onClick={handleCallInterfaceOpen}
          >
            Make Call
          </Button>
          <Button
            variant="outlined"
            startIcon={<Volume2 size={20} />}
            onClick={handleRecordingsOpen}
          >
            Recordings
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
            onClick={handleDialogOpen}
          >
            Purchase Number
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="My Numbers" />
          <Tab label="Call History" />
        </Tabs>
      </Box>

      {/* Error Alert */}
      {phoneNumbersError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading phone numbers: {phoneNumbersError.message}
        </Alert>
      )}

      {/* My Numbers Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {phoneNumbersLoading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Grid>
          ) : phoneNumbers.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Phone size={48} color="#ccc" />
                  <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                    No phone numbers yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Purchase your first phone number to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<Plus size={20} />}
                    onClick={handleDialogOpen}
                  >
                    Purchase Number
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            phoneNumbers.map((number) => {
              const website = mockWebsites.find(w => w.id === number.websiteId);
              const numberCalls = callLogs.filter(call => call.phoneNumberId === number.id);
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
                            onClick={() => handleDeletePhoneNumber(number.id)}
                            disabled={deletePhoneNumberMutation.isPending}
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
            })
          )}
        </Grid>
      )}

      {/* Call History Tab */}
      {activeTab === 1 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Recent Calls
          </Typography>
          {callLogsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : callLogs.length === 0 ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PhoneCall size={48} color="#ccc" />
                <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                  No call history yet
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Make your first call to see call history here
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Status</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {callLogs
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
                        <TableCell>{call.phoneNumberId}</TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell>
                          {call.price ? `$${call.price}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(call.timestamp).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(call.timestamp).toLocaleTimeString()}
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
          )}
        </Box>
      )}

      {/* Purchase Number Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Purchase Phone Number</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Area Code"
                  value={searchParams.areaCode}
                  onChange={(e) => setSearchParams({ ...searchParams, areaCode: e.target.value })}
                  placeholder="415"
                />
              </Grid>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Country</InputLabel>
                  <Select
                    value={searchParams.country}
                    label="Country"
                    onChange={(e) => setSearchParams({ ...searchParams, country: e.target.value })}
                  >
                    <MenuItem value="US">United States</MenuItem>
                    <MenuItem value="CA">Canada</MenuItem>
                    <MenuItem value="GB">United Kingdom</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              variant="contained"
              onClick={() => setSearchParams({ ...searchParams })}
              disabled={availableNumbersLoading}
              startIcon={<Search size={20} />}
            >
              {availableNumbersLoading ? 'Searching...' : 'Search Numbers'}
            </Button>

            {availableNumbers?.availableNumbers && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Available Numbers
                </Typography>
                <Grid container spacing={2}>
                  {availableNumbers.availableNumbers.map((number: AvailableNumber) => (
                    <Grid item xs={12} md={6} key={number.phoneNumber}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {number.phoneNumber}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {number.locality}, {number.region}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                            {number.capabilities.voice && (
                              <Chip size="small" label="Voice" color="primary" />
                            )}
                            {number.capabilities.sms && (
                              <Chip size="small" label="SMS" color="secondary" />
                            )}
                          </Box>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleBuyNumber(number.phoneNumber)}
                            disabled={buyNumberMutation.isPending}
                          >
                            {buyNumberMutation.isPending ? 'Purchasing...' : 'Buy Number'}
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Call Interface Dialog */}
      <Dialog
        open={callInterfaceOpen}
        onClose={handleCallInterfaceClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Make a Call</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleMakeCall} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="To (Phone Number)"
              type="tel"
              value={callData.to}
              onChange={(e) => setCallData({ ...callData, to: e.target.value })}
              placeholder="+1234567890"
              required
            />
            
            <TextField
              fullWidth
              label="From (Your Number)"
              type="tel"
              value={callData.from}
              onChange={(e) => setCallData({ ...callData, from: e.target.value })}
              placeholder="+1987654321"
            />
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="record-call"
                checked={callData.record}
                onChange={(e) => setCallData({ ...callData, record: e.target.checked })}
              />
              <label htmlFor="record-call">Record Call</label>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCallInterfaceClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleMakeCall}
            disabled={makeCallMutation.isPending}
          >
            {makeCallMutation.isPending ? 'Initiating Call...' : 'Make Call'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Recordings Dialog */}
      <Dialog
        open={recordingsOpen}
        onClose={handleRecordingsClose}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Call Recordings</DialogTitle>
        <DialogContent>
          {recordingsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : recordings.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Volume2 size={48} color="#ccc" />
              <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                No recordings yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recorded calls will appear here
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {recordings.map((recording: any) => (
                <Grid item xs={12} md={6} key={recording.sid}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        Recording {recording.sid}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Duration: {formatRecordingDuration(recording.duration)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Status: {recording.status}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Created: {new Date(recording.dateCreated).toLocaleString()}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <audio controls style={{ width: '100%' }}>
                          <source src={recording.mediaUrl} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </Box>
                      
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleDeleteRecording(recording.sid)}
                        disabled={deleteRecordingMutation.isPending}
                      >
                        {deleteRecordingMutation.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRecordingsClose}>Close</Button>
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
                  <TableCell>Cost</TableCell>
                  <TableCell>Date & Time</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {callLogs
                  .filter(call => call.phoneNumberId === selectedNumber?.id)
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
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
                        {call.price ? `$${call.price}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(call.timestamp).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(call.timestamp).toLocaleTimeString()}
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

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}