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
} from 'lucide-react';
import type { PhoneNumber, Website } from '../types';
import { useTwilio } from '../hooks/useTwilio';
import { useUserPhoneNumbers } from '../contexts/UserPhoneNumbersContext';
import { useAuth } from '../contexts/AuthContext';
import { RecordingPlayer } from '../components/RecordingPlayer';

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
  status: 'completed' | 'missed' | 'voicemail' | 'failed' | 'busy' | 'no-answer' | 'queued' | 'ringing' | 'in-progress' | 'canceled';
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
  const { user } = useAuth();
  const userPhoneNumbers = useUserPhoneNumbers();

  // Debug logging
  console.log('PhoneNumbers component - User:', user);
  console.log('PhoneNumbers component - UserPhoneNumbers:', {
    loading: userPhoneNumbers.loading,
    error: userPhoneNumbers.error,
    phoneNumbers: userPhoneNumbers.phoneNumbers,
    recordings: userPhoneNumbers.recordings,
    calls: userPhoneNumbers.calls
  });
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
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });
  const [purchaseResult, setPurchaseResult] = useState<{
    show: boolean;
    requestedNumber: string;
    assignedNumber: string;
    isDifferent: boolean;
  } | null>(null);

  const {
    useAvailableNumbers,
    useBuyNumber,
    useMakeCall,
    useDeletePhoneNumber,
  } = useTwilio();

  // Load call history and recordings when component mounts
  React.useEffect(() => {
    if (user && userPhoneNumbers.phoneNumbers.length > 0) {
      userPhoneNumbers.getCallHistory();
      userPhoneNumbers.getRecordings();
    }
  }, [user, userPhoneNumbers.phoneNumbers.length]);

  // Queries
  const { data: availableNumbers, isLoading: availableNumbersLoading } = useAvailableNumbers(searchParams);

  // Mutations
  const buyNumberMutation = useBuyNumber();
  const makeCallMutation = useMakeCall();
  const deletePhoneNumberMutation = useDeletePhoneNumber();

  const handleDialogOpen = () => {
    console.log('handleDialogOpen called');
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
    console.log('handleCallInterfaceOpen called');
    setCallInterfaceOpen(true);
  };

  const handleCallInterfaceClose = () => {
    setCallInterfaceOpen(false);
    setCallData({ to: '', from: '', record: true });
  };

  const handleRecordingsOpen = () => {
    console.log('handleRecordingsOpen called');
    setRecordingsOpen(true);
  };

  const handleRecordingsClose = () => {
    setRecordingsOpen(false);
  };

  const handleBuyNumber = async (phoneNumber: string) => {
    try {
      const response = await userPhoneNumbers.buyPhoneNumber({
        phoneNumber,
        country: searchParams.country,
        areaCode: searchParams.areaCode,
      });

      // Show detailed result
      setPurchaseResult({
        show: true,
        requestedNumber: response.requestedNumber || phoneNumber,
        assignedNumber: response.phoneNumber.phone_number || response.phoneNumber.number || '',
        isDifferent: response.isDifferentNumber
      });

      // Also show snackbar notification
      if (response.isDifferentNumber) {
        setSnackbar({
          open: true,
          message: `The number ${response.requestedNumber} was taken. We got you ${response.phoneNumber.phone_number || response.phoneNumber.number} instead.`,
          severity: 'warning',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Successfully purchased ${response.phoneNumber.phone_number || response.phoneNumber.number}!`,
          severity: 'success',
        });
      }
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

  // Use call history from context
  const callLogs = userPhoneNumbers.calls;
  const recordings = userPhoneNumbers.recordings;

  return (
    <Box>
      {/* User Info Section */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                Welcome to Your Calling Platform, {user?.name}!
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                You own {userPhoneNumbers.phoneNumbers.length} phone numbers and have made {userPhoneNumbers.calls.length} calls
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 3, textAlign: 'center' }}>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {userPhoneNumbers.phoneNumberStats?.active_numbers || userPhoneNumbers.phoneNumbers.filter(n => n.status === 'active').length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Active Numbers</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  {userPhoneNumbers.phoneNumberStats?.total_numbers || userPhoneNumbers.phoneNumbers.length}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Total Numbers</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">
                  ${userPhoneNumbers.phoneNumberStats?.total_monthly_cost || '0.00'}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Monthly Cost</Typography>
              </Box>
              <Box>
                <Typography variant="h4" fontWeight="bold">{userPhoneNumbers.calls.length}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Calls Made</Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          My Phone Numbers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<PhoneCall size={20} />}
            onClick={handleCallInterfaceOpen}
            disabled={userPhoneNumbers.phoneNumbers.length === 0}
          >
            Make Call
          </Button>
          <Button
            variant="outlined"
            startIcon={<Volume2 size={20} />}
            onClick={handleRecordingsOpen}
          >
            Recordings ({userPhoneNumbers.recordings.length})
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
      {userPhoneNumbers.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading phone numbers: {userPhoneNumbers.error}
        </Alert>
      )}

      {/* My Numbers Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {userPhoneNumbers.loading ? (
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Grid>
          ) : userPhoneNumbers.phoneNumbers.length === 0 ? (
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
            userPhoneNumbers.phoneNumbers.map((number, index) => {
              const website = mockWebsites.find(w => w.id === number.websiteId);
              const numberCalls = (callLogs || []).filter(call => call?.phoneNumberId === number.id);
              const completedCalls = numberCalls.filter(call => call?.status === 'completed');
              const missedCalls = numberCalls.filter(call => call?.status === 'no-answer');
              const averageDuration = completedCalls.length
                ? completedCalls.reduce((acc, call) => acc + (call?.duration || 0), 0) / completedCalls.length
                : 0;

              return (
                <Grid item xs={12} md={6} key={number.id || `phone-${index}`}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                            <Phone size={20} />
                            <Typography variant="h6">{number.phone_number || number.number}</Typography>
                            <Chip
                              size="small"
                              label={number.status}
                              color={number.status === 'active' ? 'success' : 'default'}
                            />
                            {number.friendly_name && (
                              <Chip
                                size="small"
                                label={number.friendly_name}
                                color="primary"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Globe size={16} />
                            <Typography variant="body2" color="text.secondary">
                              {number.locality && number.region
                                ? `${number.locality}, ${number.region}`
                                : number.country || 'Unknown Location'}
                            </Typography>
                          </Box>
                          {website?.domain && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Website: {website.domain}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeletePhoneNumber(String(number.id))}
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
                              <Typography variant="h6">${number.monthlyFee || number.monthly_cost || '1.00'}</Typography>
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
          {userPhoneNumbers.loading ? (
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
                    <TableCell>Direction</TableCell>
                    <TableCell>From</TableCell>
                    <TableCell>To</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Cost</TableCell>
                    <TableCell>Date & Time</TableCell>
                    <TableCell align="right">Recording</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(callLogs || [])
                    .filter(Boolean) // Remove null/undefined entries
                    .sort((a, b) => new Date(b?.startTime || b?.createdAt || 0).getTime() - new Date(a?.startTime || a?.createdAt || 0).getTime())
                    .map((call, index) => (
                      <TableRow key={call.id || call.callSid || call.call_sid || `call-${index}`}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {getCallStatusIcon(call.status as any)}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {call.status}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {call.direction === 'inbound' ? '📲' : '📞'}
                            <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                              {call.direction === 'outbound-api' ? 'outbound' : call.direction}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{call.from || call.from_number}</TableCell>
                        <TableCell>{call.to || call.to_number}</TableCell>
                        <TableCell>{formatDuration(call.duration)}</TableCell>
                        <TableCell>
                          {call.price ? `$${call.price}` : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(call.startTime || call.createdAt || 0).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(call.startTime || call.createdAt || 0).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {call.recordingUrl && call.recording_status === 'completed' && (
                            <RecordingPlayer
                              recordingUrl={call.recordingUrl || call.recording_url || ''}
                              recordingSid={call.recordingSid || call.recording_sid}
                              duration={call.recording_duration || call.duration}
                              callSid={call.callSid || call.call_sid || ''}
                              fromNumber={call.from || call.from_number}
                              toNumber={call.to || call.to_number}
                              callDuration={call.duration}
                              callStatus={call.status}
                              createdAt={call.startTime || call.createdAt}
                              onError={(error) => {
                                setSnackbar({
                                  open: true,
                                  message: error,
                                  severity: 'error'
                                });
                              }}
                            />
                          )}
                          {call.recordingUrl && call.recording_status === 'processing' && (
                            <Typography variant="caption" color="text.secondary">
                              Processing...
                            </Typography>
                          )}
                          {!call.recordingUrl && (
                            <Typography variant="caption" color="text.secondary">
                              No recording
                            </Typography>
                          )}
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
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PhoneCall size={24} />
            <Typography variant="h6">Make a Call</Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Call using one of your purchased phone numbers
          </Typography>
        </DialogTitle>
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
              helperText="Enter the phone number you want to call"
            />

            <FormControl fullWidth required>
              <InputLabel>From (Your Number)</InputLabel>
              <Select
                value={callData.from}
                label="From (Your Number)"
                onChange={(e) => setCallData({ ...callData, from: e.target.value })}
              >
                {userPhoneNumbers.phoneNumbers
                  .filter(num => num.status === 'active')
                  .map((number, index) => (
                    <MenuItem key={number.id || `menu-${index}`} value={number.phone_number || number.number}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                        <Phone size={16} />
                        <Typography>{number.phone_number || number.number}</Typography>
                        {number.friendly_name && (
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            ({number.friendly_name})
                          </Typography>
                        )}
                        <Chip
                          size="small"
                          label={number.capabilities?.voice ? 'Voice' : 'No Voice'}
                          color={number.capabilities?.voice ? 'success' : 'default'}
                          sx={{ ml: 'auto' }}
                        />
                      </Box>
                    </MenuItem>
                  ))}
              </Select>
              {userPhoneNumbers.phoneNumbers.filter(num => num.status === 'active').length === 0 && (
                <Typography variant="caption" color="error" sx={{ mt: 1 }}>
                  You need to purchase an active phone number to make calls
                </Typography>
              )}
            </FormControl>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <input
                type="checkbox"
                id="record-call"
                checked={callData.record}
                onChange={(e) => setCallData({ ...callData, record: e.target.checked })}
              />
              <label htmlFor="record-call">Record Call</label>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                (Additional charges apply)
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCallInterfaceClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleMakeCall}
            disabled={makeCallMutation.isPending || !callData.from || userPhoneNumbers.phoneNumbers.filter(num => num.status === 'active').length === 0}
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
          {userPhoneNumbers.loading ? (
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
              {userPhoneNumbers.error && (
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  Error: {userPhoneNumbers.error}
                </Typography>
              )}
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ mt: 1 }}>
                            {recordings.map((recording, index) => {
                const associatedCall = (callLogs || []).find(call => 
                  call && (call.callSid === recording.callSid || call.call_sid === recording.callSid)
                );

                return (
                  <Grid item xs={12} key={recording.recordingSid || recording.id || `recording-${index}`}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                              Recording {recording.recordingSid}
                            </Typography>
                            {associatedCall && (
                              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                Call: {associatedCall.from || associatedCall.from_number} → {associatedCall.to || associatedCall.to_number}
                              </Typography>
                            )}
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Duration: {formatRecordingDuration(recording.duration)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Status: {recording.status}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              Created: {new Date(recording.createdAt).toLocaleString()}
                            </Typography>
                          </Box>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            onClick={() => userPhoneNumbers.deleteRecording(recording.recordingSid)}
                            disabled={userPhoneNumbers.loading}
                          >
                            {userPhoneNumbers.loading ? 'Deleting...' : 'Delete'}
                          </Button>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          {/* Debug info */}
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                            Debug - Media URL: {recording.mediaUrl || 'No URL'}
                          </Typography>
                          <RecordingPlayer
                            recordingUrl={recording.mediaUrl}
                            recordingSid={recording.recordingSid}
                            duration={recording.duration}
                            callSid={recording.callSid}
                            fromNumber={recording.fromNumber}
                            toNumber={recording.toNumber}
                            callDuration={recording.callDuration}
                            callStatus={recording.callStatus}
                            createdAt={recording.createdAt}
                            onError={(error) => {
                              console.error('RecordingPlayer error:', error);
                              setSnackbar({
                                open: true,
                                message: error,
                                severity: 'error'
                              });
                            }}
                          />
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
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
                {(callLogs || [])
                  .filter(Boolean) // Remove null/undefined entries
                  .filter(call => call && String(call.phoneNumberId) === String(selectedNumber?.id))
                  .sort((a, b) => new Date(b?.startTime || b?.createdAt || 0).getTime() - new Date(a?.startTime || a?.createdAt || 0).getTime())
                  .map((call, index) => (
                    <TableRow key={call.id || call.callSid || call.call_sid || `dialog-call-${index}`}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getCallStatusIcon(call.status as any)}
                          <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                            {call.status}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{call.from || call.from_number}</TableCell>
                      <TableCell>{formatDuration(call.duration)}</TableCell>
                      <TableCell>
                        {call.price ? `$${call.price}` : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(call.startTime || call.createdAt || 0).toLocaleDateString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(call.startTime || call.createdAt || 0).toLocaleTimeString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          {call.recordingUrl && (
                            <RecordingPlayer
                              recordingUrl={call.recordingUrl || call.recording_url || ''}
                              recordingSid={call.recordingSid || call.recording_sid}
                              duration={call.recording_duration || call.duration}
                              callSid={call.callSid || call.call_sid || ''}
                              fromNumber={call.from || call.from_number}
                              toNumber={call.to || call.to_number}
                              callDuration={call.duration}
                              callStatus={call.status}
                              createdAt={call.startTime || call.createdAt}
                              onError={(error) => {
                                setSnackbar({
                                  open: true,
                                  message: error,
                                  severity: 'error'
                                });
                              }}
                            />
                          )}
                          {call.status === 'no-answer' && (
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

      {/* Purchase Result Dialog */}
      {purchaseResult && (
        <Dialog
          open={purchaseResult.show}
          onClose={() => setPurchaseResult(null)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {purchaseResult.isDifferent ? (
                <Alert severity="warning" sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Number Assignment Changed
                  </Typography>
                </Alert>
              ) : (
                <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    Number Successfully Purchased!
                  </Typography>
                </Alert>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {purchaseResult.isDifferent && (
                <>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Requested Number:
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'error.main' }}>
                      {purchaseResult.requestedNumber}
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      (This number was already taken)
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Assigned Number:
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'success.main' }}>
                      {purchaseResult.assignedNumber}
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      (Your new phone number)
                    </Typography>
                  </Box>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Don't worry! Twilio found you the best available alternative number in the same area.
                    Your new number has the same capabilities and pricing.
                  </Alert>
                </>
              )}

              {!purchaseResult.isDifferent && (
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Your New Number:
                  </Typography>
                  <Typography variant="h6" sx={{ color: 'success.main' }}>
                    {purchaseResult.assignedNumber}
                  </Typography>
                  <Typography variant="caption" color="success.main">
                    (Exactly what you requested!)
                  </Typography>
                </Box>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setPurchaseResult(null)}
              variant="contained"
              color="primary"
            >
              Got it!
            </Button>
          </DialogActions>
        </Dialog>
      )}

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