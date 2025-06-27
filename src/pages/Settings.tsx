import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Switch,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Bell,
  Moon,
  Sun,
  Monitor,
  Globe,
  Clock,
  DollarSign,
  Key,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Edit2,
  Trash2,
  HelpCircle,
  Search,
  Phone,
  CreditCard,
  Mail,
} from 'lucide-react';
import type { UserPreferences, APIIntegration } from '../types';

// Mock data - replace with actual API calls
const mockPreferences: UserPreferences = {
  id: '1',
  theme: 'system',
  notifications: true,
  emailDigest: 'daily',
  defaultCurrency: 'USD',
  timezone: 'America/New_York',
};

const mockIntegrations: APIIntegration[] = [
  {
    id: '1',
    name: 'Ahrefs',
    type: 'seo',
    status: 'active',
    apiKey: '****************************1234',
    lastSync: new Date('2024-03-18T10:30:00'),
    settings: {
      syncFrequency: 'daily',
      metrics: ['backlinks', 'keywords', 'traffic'],
    },
  },
  {
    id: '2',
    name: 'Twilio',
    type: 'call_tracking',
    status: 'active',
    apiKey: '****************************5678',
    lastSync: new Date('2024-03-18T11:15:00'),
    settings: {
      recordCalls: true,
      transcription: true,
      forwardingRules: true,
    },
  },
  {
    id: '3',
    name: 'Stripe',
    type: 'payment',
    status: 'inactive',
    settings: {},
  },
];

const currencies = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
];

const timezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export default function Settings() {
  const [preferences, setPreferences] = useState<UserPreferences>(mockPreferences);
  const [integrations, setIntegrations] = useState<APIIntegration[]>(mockIntegrations);
  const [integrationDialogOpen, setIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
  });

  const handlePreferenceChange = (key: keyof UserPreferences, value: any) => {
    setPreferences({ ...preferences, [key]: value });
  };

  const handleIntegrationDialogOpen = (integration?: APIIntegration) => {
    if (integration) {
      setSelectedIntegration(integration);
      setFormData({
        name: integration.name,
        type: integration.type,
        apiKey: integration.apiKey || '',
      });
    } else {
      setSelectedIntegration(null);
      setFormData({
        name: '',
        type: '',
        apiKey: '',
      });
    }
    setIntegrationDialogOpen(true);
  };

  const handleIntegrationDialogClose = () => {
    setIntegrationDialogOpen(false);
    setSelectedIntegration(null);
  };

  const handleIntegrationSubmit = () => {
    if (selectedIntegration) {
      // Update existing integration
      setIntegrations(integrations.map(integration =>
        integration.id === selectedIntegration.id
          ? {
              ...integration,
              ...formData,
              status: 'active',
            }
          : integration
      ));
    } else {
      // Add new integration
      const newIntegration: APIIntegration = {
        id: String(Date.now()),
        ...formData,
        status: 'active',
        lastSync: new Date(),
        settings: {},
      };
      setIntegrations([...integrations, newIntegration]);
    }
    handleIntegrationDialogClose();
  };

  const handleIntegrationDelete = (id: string) => {
    setIntegrations(integrations.filter(integration => integration.id !== id));
  };

  const getIntegrationIcon = (type: APIIntegration['type']) => {
    switch (type) {
      case 'seo':
        return <Search size={20} />;
      case 'call_tracking':
        return <Phone size={20} />;
      case 'payment':
        return <CreditCard size={20} />;
      case 'email':
        return <Mail size={20} />;
    }
  };

  const getIntegrationStatusColor = (status: APIIntegration['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      case 'error':
        return 'error';
    }
  };

  const getThemeIcon = (theme: UserPreferences['theme']) => {
    switch (theme) {
      case 'light':
        return <Sun size={20} />;
      case 'dark':
        return <Moon size={20} />;
      case 'system':
        return <Monitor size={20} />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Settings
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Preferences */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <SettingsIcon size={24} />
                <Typography variant="h6">Preferences</Typography>
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>Theme</InputLabel>
                  <Select
                    value={preferences.theme}
                    label="Theme"
                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    startAdornment={getThemeIcon(preferences.theme)}
                  >
                    <MenuItem value="light">Light</MenuItem>
                    <MenuItem value="dark">Dark</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={preferences.notifications}
                      onChange={(e) => handlePreferenceChange('notifications', e.target.checked)}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Bell size={20} />
                      <Typography>Enable Notifications</Typography>
                    </Box>
                  }
                />

                <FormControl fullWidth>
                  <InputLabel>Email Digest</InputLabel>
                  <Select
                    value={preferences.emailDigest}
                    label="Email Digest"
                    onChange={(e) => handlePreferenceChange('emailDigest', e.target.value)}
                    startAdornment={<Mail size={20} />}
                  >
                    <MenuItem value="daily">Daily</MenuItem>
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="never">Never</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Default Currency</InputLabel>
                  <Select
                    value={preferences.defaultCurrency}
                    label="Default Currency"
                    onChange={(e) => handlePreferenceChange('defaultCurrency', e.target.value)}
                    startAdornment={<DollarSign size={20} />}
                  >
                    {currencies.map((currency) => (
                      <MenuItem key={currency.code} value={currency.code}>
                        {currency.symbol} - {currency.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Timezone</InputLabel>
                  <Select
                    value={preferences.timezone}
                    label="Timezone"
                    onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
                    startAdornment={<Clock size={20} />}
                  >
                    {timezones.map((timezone) => (
                      <MenuItem key={timezone} value={timezone}>
                        {timezone.replace('_', ' ')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Integrations */}
        <Grid item xs={12} lg={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Globe size={24} />
                  <Typography variant="h6">Integrations</Typography>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Plus size={20} />}
                  onClick={() => handleIntegrationDialogOpen()}
                >
                  Add Integration
                </Button>
              </Box>

              <List>
                {integrations.map((integration, index) => (
                  <React.Fragment key={integration.id}>
                    <ListItem>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
                        {getIntegrationIcon(integration.type)}
                      </Box>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle2">{integration.name}</Typography>
                            <Chip
                              size="small"
                              label={integration.status}
                              color={getIntegrationStatusColor(integration.status)}
                            />
                          </Box>
                        }
                        secondary={
                          integration.lastSync && (
                            <Typography variant="caption" color="text.secondary">
                              Last synced: {integration.lastSync.toLocaleString()}
                            </Typography>
                          )
                        }
                      />
                      <ListItemSecondaryAction>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Sync">
                            <IconButton size="small">
                              <RefreshCw size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleIntegrationDialogOpen(integration)}
                            >
                              <Edit2 size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleIntegrationDelete(integration.id)}
                            >
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < integrations.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* System Information */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <HelpCircle size={24} />
                <Typography variant="h6">System Information</Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Alert severity="info" icon={<Key size={20} />}>
                    <Typography variant="subtitle2">API Version</Typography>
                    <Typography variant="body2">v1.2.0</Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="success" icon={<CheckCircle size={20} />}>
                    <Typography variant="subtitle2">System Status</Typography>
                    <Typography variant="body2">All systems operational</Typography>
                  </Alert>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Alert severity="warning" icon={<AlertTriangle size={20} />}>
                    <Typography variant="subtitle2">Next Maintenance</Typography>
                    <Typography variant="body2">March 25, 2024 at 02:00 UTC</Typography>
                  </Alert>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Dialog */}
      <Dialog
        open={integrationDialogOpen}
        onClose={handleIntegrationDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedIntegration ? 'Edit Integration' : 'Add New Integration'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                <MenuItem value="seo">SEO Tools</MenuItem>
                <MenuItem value="call_tracking">Call Tracking</MenuItem>
                <MenuItem value="payment">Payment Processing</MenuItem>
                <MenuItem value="email">Email Service</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Name"
              fullWidth
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <TextField
              label="API Key"
              fullWidth
              type="password"
              value={formData.apiKey}
              onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleIntegrationDialogClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleIntegrationSubmit}
            disabled={!formData.type || !formData.name}
          >
            {selectedIntegration ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}