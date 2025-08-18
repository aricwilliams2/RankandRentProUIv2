import React, { useEffect, useState } from 'react';
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
import BrowserCallComponent from '../components/BrowserCallComponent';
import CallForwardingComponent from '../components/CallForwardingComponent';
import { useBilling } from '../contexts/BillingContext';
import { twilioApi } from '../services/twilioApi';

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
  const { billing, canBuyNumbers, startTopUpProduct, startTopUpAmount, loading: billingLoading } = useBilling();

  // Stripe price for $10 fixed top-up (product price ID)
  const PRICE_10 = (import.meta as any).env?.VITE_STRIPE_PRICE_10 || 'price_10USD';

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

  const [recordingsOpen, setRecordingsOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumber | null>(null);
  const [searchParams, setSearchParams] = useState({
    areaCode: '',
    country: 'US',
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

  const [topUpOpen, setTopUpOpen] = useState(false);
  const [topUpBusy, setTopUpBusy] = useState(false);

  // Usage stats (totals)
  const [usageLoading, setUsageLoading] = useState(true);
  const [usageError, setUsageError] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ total_calls: number; total_duration_seconds: number; total_numbers: number } | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setUsageLoading(true);
        const res = await twilioApi.getUsageStats();
        // API shape: { success, data: { total_calls, total_duration_seconds, total_numbers } }
        const data = (res?.data ?? res) as any;
        const parsed = data?.total_calls !== undefined ? data : res?.data;
        if (isMounted) setUsage(parsed ?? null);
      } catch (e: any) {
        if (isMounted) setUsageError(e?.message ?? 'Failed to load usage stats');
      } finally {
        if (isMounted) setUsageLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const {
    useAvailableNumbers,
    useBuyNumber,
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

      setPurchaseResult({
        show: true,
        requestedNumber: response.requestedNumber || phoneNumber,
        assignedNumber: response.phoneNumber.phone_number || response.phoneNumber.number || '',
        isDifferent: response.isDifferentNumber
      });

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
    } catch (error: any) {
      if (error?.response?.status === 402) {
        setSnackbar({
          open: true,
          message: 'Insufficient balance. Please add at least $5 to purchase a number.',
          severity: 'warning',
        });
      } else {
        setSnackbar({
          open: true,
          message: `Failed to purchase phone number: ${error instanceof Error ? error.message : 'Unknown error'}`,
          severity: 'error',
        });
      }
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
        return <Phone size={16} color="green" />;
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

  const callLogs = userPhoneNumbers.calls;
  const recordings = userPhoneNumbers.recordings;

  return (
    <Box>


      {/* Sticky Billing Summary Bar + Usage Totals */}
      <Box sx={{ position: 'sticky', top: 0, zIndex: 5, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider', py: 1.5, px: 1, mb: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'center' }}>
            <Chip color="primary" variant="outlined" label={`Balance: $${billing ? billing.balance.toFixed(2) : '--'}`} />
            <Chip
              color="secondary"
              variant="outlined"
              label={
                usage
                  ? `Call duration: ${Math.floor(usage.total_duration_seconds / 3600)}h ${Math.floor((usage.total_duration_seconds % 3600) / 60)}m`
                  : (usageLoading ? 'Call duration: …' : 'Call duration: --')
              }
            />
            {!billingLoading && billing && !billing.hasClaimedFreeNumber && (
              <Chip color="success" variant="outlined" label="Free number available" />
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {/* Usage totals */}
            {usageLoading ? (
              <Chip variant="outlined" label="Loading usage…" />
            ) : usageError ? (
              <Chip color="error" variant="outlined" label={`Usage error: ${usageError}`} />
            ) : usage ? (
              <>
                <Chip variant="outlined" label={`Total calls: ${usage.total_calls}`} />
                <Chip variant="outlined" label={`Total duration: ${Math.floor(usage.total_duration_seconds / 60)}m ${usage.total_duration_seconds % 60}s`} />
                <Chip variant="outlined" label={`Owned numbers: ${usage.total_numbers}`} />
              </>
            ) : null}
            <Button variant="contained" color="warning" onClick={() => setTopUpOpen(true)} disabled={billingLoading}>
              Add Funds
            </Button>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          My Phone Numbers
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
            disabled={!canBuyNumbers}
          >
            {billing && !billing.hasClaimedFreeNumber ? 'Get Free Number' : 'Purchase Number'}
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        {/* Mobile Select Dropdown */}
        <Box sx={{ display: { xs: 'block', md: 'none' }, mb: 2 }}>
          <FormControl fullWidth>
            <Select
              value={activeTab}
              onChange={(e) => setActiveTab(e.target.value as number)}
              size="small"
            >
              <MenuItem value={0}>My Numbers</MenuItem>
              <MenuItem value={1}>Call History</MenuItem>
              <MenuItem value={2}>Call Forwarding</MenuItem>
              <MenuItem value={3}>Browser Call</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Desktop Tabs */}
        <Box sx={{ display: { xs: 'none', md: 'block' } }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            sx={{
              '& .MuiTab-root': {
                minWidth: 'auto',
                padding: { xs: '12px 8px', sm: '12px 16px' },
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }
            }}
          >
            <Tab label="My Numbers" />
            <Tab label="Call History" />
            <Tab label="Call Forwarding" />
            <Tab label="Browser Call" />
          </Tabs>
        </Box>
      </Box>

      {/* Error Alert */}
      {userPhoneNumbers.error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          Error loading phone numbers: {userPhoneNumbers.error}
        </Alert>
      )}

      {/* Top Up Modal */}
      <Dialog open={topUpOpen} onClose={() => !topUpBusy && setTopUpOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Add Funds</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Choose a top-up amount. A new tab will open for secure checkout.
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={topUpBusy}
              onClick={async () => {
                try {
                  setTopUpBusy(true);
                  const url = await startTopUpAmount(5);
                  if (url) window.open(url, '_blank');
                } finally {
                  setTopUpBusy(false);
                }
              }}
            >
              Add $5
            </Button>
            <Button
              variant="outlined"
              color="primary"
              disabled={topUpBusy}
              onClick={async () => {
                try {
                  setTopUpBusy(true);
                  const url = await startTopUpProduct(PRICE_10);
                  if (url) window.open(url, '_blank');
                } finally {
                  setTopUpBusy(false);
                }
              }}
            >
              Add $10
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopUpOpen(false)} disabled={topUpBusy}>Close</Button>
        </DialogActions>
      </Dialog>

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
                    disabled={!canBuyNumbers}
                  >
                    {billing && !billing.hasClaimedFreeNumber ? 'Get Free Number' : 'Purchase Number'}
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
                                <Phone size={16} />
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
                <Phone size={48} color="#ccc" />
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
                    .filter(Boolean)
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
                                setSnackbar({ open: true, message: error, severity: 'error' });
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

      {/* Call Forwarding Tab */}
      {activeTab === 2 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Call Forwarding
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Manage how your calls are forwarded to other numbers. Set up forwarding rules to ensure you never miss important calls.
          </Typography>
          <CallForwardingComponent />
        </Box>
      )}

      {/* Browser Call Tab */}
      {activeTab === 3 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Browser-Based Calling
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Make calls directly from your browser using your microphone and speakers.
            This feature allows you to make calls without using your phone.
          </Typography>
          <BrowserCallComponent />
        </Box>
      )}

      {/* Purchase Number Dialog */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="md" fullWidth>
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

            <Button variant="contained" onClick={() => setSearchParams({ ...searchParams })} disabled={availableNumbersLoading} startIcon={<Search size={20} />}>
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
                            onClick={async () => {
                              try {
                                await handleBuyNumber(number.phoneNumber);
                              } catch (e: any) {
                                if ((e?.response?.status || e?.status) === 402) {
                                  setSnackbar({ open: true, message: 'Insufficient balance. Please add at least $5 to purchase a number.', severity: 'warning' });
                                } else {
                                  setSnackbar({ open: true, message: e?.message || 'Failed to purchase number', severity: 'error' });
                                }
                              }
                            }}
                            disabled={buyNumberMutation.isPending || (!canBuyNumbers && !(billing && !billing.hasClaimedFreeNumber))}
                          >
                            {billing && !billing.hasClaimedFreeNumber ? 'Get Free Number' : (buyNumberMutation.isPending ? 'Purchasing...' : 'Buy Number')}
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

      {/* Recordings Dialog */}
      <Dialog open={recordingsOpen} onClose={handleRecordingsClose} maxWidth="lg" fullWidth>
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
                          <Button variant="outlined" color="error" size="small" onClick={() => userPhoneNumbers.deleteRecording(recording.recordingSid)} disabled={userPhoneNumbers.loading}>
                            {userPhoneNumbers.loading ? 'Deleting...' : 'Delete'}
                          </Button>
                        </Box>

                        <Box sx={{ mb: 2 }}>
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
                              setSnackbar({ open: true, message: error, severity: 'error' });
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
      <Dialog open={callHistoryOpen} onClose={handleCallHistoryClose} maxWidth="md" fullWidth>
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
                  .filter(Boolean)
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
                              onError={(error) => setSnackbar({ open: true, message: error, severity: 'error' })}
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
        <Dialog open={purchaseResult.show} onClose={() => setPurchaseResult(null)} maxWidth="sm" fullWidth>
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
            <Button onClick={() => setPurchaseResult(null)} variant="contained" color="primary">
              Got it!
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}