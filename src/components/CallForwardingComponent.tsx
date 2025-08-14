import React, { useState } from 'react';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Switch,
    FormControlLabel,
    Alert,
    Snackbar,
    CircularProgress,
    IconButton,
    Chip,
    Divider,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import {
    Phone,
    Plus,
    Trash2,
    Edit,
    Forward,
    Settings,
    CheckCircle,
    X,
    Info,
    RefreshCw,
} from 'lucide-react';
import { useCallForwarding } from '../contexts/CallForwardingContext';
import { useUserPhoneNumbers } from '../contexts/UserPhoneNumbersContext';
import { CallForwarding, CallForwardingFormData } from '../types';

export default function CallForwardingComponent() {
    const { callForwardings, loading, error, getCallForwardings, createCallForwarding, updateCallForwarding, toggleCallForwarding, deleteCallForwarding } = useCallForwarding();
    const { phoneNumbers } = useUserPhoneNumbers();

    // Temporary debug helper to identify object rendering issues
    const show = (v: any) => typeof v === 'object' && v !== null ? JSON.stringify(v) : String(v ?? '');

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingForwarding, setEditingForwarding] = useState<CallForwarding | null>(null);
    const [formData, setFormData] = useState<CallForwardingFormData>({
        phone_number_id: '',
        forward_to_number: '',
        forwarding_type: 'always',
        ring_timeout: 20,
    });
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error' | 'info' | 'warning';
    }>({ open: false, message: '', severity: 'info' });

    const handleDialogOpen = (forwarding?: CallForwarding) => {
        if (forwarding) {
            setEditingForwarding(forwarding);
            setFormData({
                phone_number_id: forwarding.phone_number_id,
                forward_to_number: forwarding.forward_to_number,
                forwarding_type: forwarding.forwarding_type,
                ring_timeout: forwarding.ring_timeout,
            });
        } else {
            setEditingForwarding(null);
            setFormData({
                phone_number_id: '',
                forward_to_number: '',
                forwarding_type: 'always',
                ring_timeout: 20,
            });
        }
        setDialogOpen(true);
    };

    const handleDialogClose = () => {
        setDialogOpen(false);
        setEditingForwarding(null);
        setFormData({
            phone_number_id: '',
            forward_to_number: '',
            forwarding_type: 'always',
            ring_timeout: 20,
        });
    };

    const handleSubmit = async () => {
        try {
            if (editingForwarding) {
                await updateCallForwarding(editingForwarding.id, formData);
                setSnackbar({
                    open: true,
                    message: 'Call forwarding setting updated successfully!',
                    severity: 'success',
                });
            } else {
                await createCallForwarding(formData);
                setSnackbar({
                    open: true,
                    message: 'Call forwarding setting created successfully!',
                    severity: 'success',
                });
            }
            handleDialogClose();
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Failed to ${editingForwarding ? 'update' : 'create'} call forwarding setting: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error',
            });
        }
    };

    const handleToggle = async (id: string, currentStatus: boolean) => {
        try {
            await toggleCallForwarding(id, !currentStatus);
            setSnackbar({
                open: true,
                message: `Call forwarding ${!currentStatus ? 'enabled' : 'disabled'} successfully!`,
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Failed to toggle call forwarding: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error',
            });
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteCallForwarding(id);
            setSnackbar({
                open: true,
                message: 'Call forwarding setting deleted successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: `Failed to delete call forwarding setting: ${error instanceof Error ? error.message : 'Unknown error'}`,
                severity: 'error',
            });
        }
    };

    const getPhoneNumberDisplay = (phoneNumberId: string) => {
        const phoneNumber = phoneNumbers.find(pn => pn.id === phoneNumberId);
        return phoneNumber ? (phoneNumber.phone_number || phoneNumber.number || 'Unknown Number') : 'Unknown Number';
    };

    const getForwardingTypeLabel = (type: string) => {
        switch (type) {
            case 'always':
                return 'Always Forward';
            case 'busy':
                return 'Forward When Busy';
            case 'no_answer':
                return 'Forward on No Answer';
            case 'unavailable':
                return 'Forward When Unavailable';
            default:
                return type;
        }
    };

    const getForwardingTypeColor = (type: string) => {
        switch (type) {
            case 'always':
                return 'primary';
            case 'busy':
                return 'warning';
            case 'no_answer':
                return 'info';
            case 'unavailable':
                return 'secondary';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box>
                    <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                        Call Forwarding
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage how your calls are forwarded to other numbers
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshCw size={20} />}
                        onClick={getCallForwardings}
                        disabled={loading}
                    >
                        Refresh
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Plus size={20} />}
                        onClick={() => handleDialogOpen()}
                    >
                        Add Forwarding Rule
                    </Button>
                </Box>
            </Box>

            {/* Error Alert */}
            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            {/* Call Forwarding Rules */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <CircularProgress />
                </Box>
            ) : callForwardings.length === 0 ? (
                <Card>
                    <CardContent sx={{ textAlign: 'center', py: 4 }}>
                        <Forward size={48} color="#ccc" />
                        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                            No call forwarding rules yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Create your first forwarding rule to start redirecting calls
                        </Typography>
                        <Button
                            variant="contained"
                            startIcon={<Plus size={20} />}
                            onClick={() => handleDialogOpen()}
                        >
                            Create Forwarding Rule
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Status</TableCell>
                                <TableCell>From Number</TableCell>
                                <TableCell>Forward To</TableCell>
                                <TableCell>Type</TableCell>
                                <TableCell>Ring Timeout</TableCell>
                                <TableCell>Created</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {callForwardings.map((forwarding) => (
                                <TableRow key={forwarding.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {forwarding.is_active ? (
                                                <CheckCircle size={16} color="green" />
                                            ) : (
                                                <X size={16} color="red" />
                                            )}
                                            <FormControlLabel
                                                control={
                                                    <Switch
                                                        checked={forwarding.is_active}
                                                        onChange={() => handleToggle(forwarding.id, forwarding.is_active)}
                                                        size="small"
                                                    />
                                                }
                                                label=""
                                            />
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Phone size={16} />
                                            <Typography variant="body2">
                                                {show(getPhoneNumberDisplay(forwarding.phone_number_id))}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {show(forwarding.forward_to_number)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getForwardingTypeLabel(forwarding.forwarding_type)}
                                            color={getForwardingTypeColor(forwarding.forwarding_type) as any}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {show(forwarding.ring_timeout)}s
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(forwarding.created_at).toLocaleDateString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleDialogOpen(forwarding)}
                                                >
                                                    <Edit size={16} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => handleDelete(forwarding.id)}
                                                >
                                                    <Trash2 size={16} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={handleDialogClose}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Settings size={20} />
                        <Typography variant="h6">
                            {editingForwarding ? 'Edit Call Forwarding' : 'Create Call Forwarding'}
                        </Typography>
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <FormControl fullWidth>
                                    <InputLabel>Phone Number</InputLabel>
                                    <Select
                                        value={formData.phone_number_id}
                                        label="Phone Number"
                                        onChange={(e) => setFormData({ ...formData, phone_number_id: e.target.value })}
                                    >
                                        {phoneNumbers.map((phoneNumber) => (
                                            <MenuItem key={phoneNumber.id} value={phoneNumber.id}>
                                                {phoneNumber.phone_number || phoneNumber.number || 'Unknown Number'}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Forward To Number"
                                    value={formData.forward_to_number}
                                    onChange={(e) => setFormData({ ...formData, forward_to_number: e.target.value })}
                                    placeholder="+15551234567"
                                    helperText="Enter the phone number to forward calls to"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Forwarding Type</InputLabel>
                                    <Select
                                        value={formData.forwarding_type}
                                        label="Forwarding Type"
                                        onChange={(e) => setFormData({ ...formData, forwarding_type: e.target.value as any })}
                                    >
                                        <MenuItem value="always">Always Forward</MenuItem>
                                        <MenuItem value="busy">Forward When Busy</MenuItem>
                                        <MenuItem value="no_answer">Forward on No Answer</MenuItem>
                                        <MenuItem value="unavailable">Forward When Unavailable</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Ring Timeout (seconds)"
                                    type="number"
                                    value={formData.ring_timeout}
                                    onChange={(e) => setFormData({ ...formData, ring_timeout: parseInt(e.target.value) || 20 })}
                                    inputProps={{ min: 5, max: 60 }}
                                    helperText="How long to ring before forwarding"
                                />
                            </Grid>
                        </Grid>

                        {/* Info Alert */}
                        <Alert severity="info" icon={<Info />}>
                            <Typography variant="body2">
                                <strong>Forwarding Types:</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mt: 1 }}>
                                • <strong>Always Forward:</strong> Immediately forwards all calls
                            </Typography>
                            <Typography variant="body2">
                                • <strong>Forward When Busy:</strong> Forwards when your line is busy
                            </Typography>
                            <Typography variant="body2">
                                • <strong>Forward on No Answer:</strong> Forwards after the ring timeout
                            </Typography>
                            <Typography variant="body2">
                                • <strong>Forward When Unavailable:</strong> Forwards when you're unavailable
                            </Typography>
                        </Alert>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDialogClose}>Cancel</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={!formData.phone_number_id || !formData.forward_to_number}
                    >
                        {editingForwarding ? 'Update' : 'Create'}
                    </Button>
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
