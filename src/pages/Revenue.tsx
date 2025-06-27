import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  DollarSign,
  Plus,
  Edit2,
  Trash2,
  Send,
  Download,
  TrendingUp,
  Users,
  Calculator,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { Website, Client, Invoice, PricingRule } from '../types';

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

const mockClients: Client[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    email: 'contact@acme.com',
    phone: '(555) 123-4567',
    websites: [],
    communicationHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

const mockInvoices: Invoice[] = [
  {
    id: '1',
    clientId: '1',
    websiteId: '1',
    amount: 2500,
    status: 'paid',
    dueDate: new Date('2024-03-25'),
    paidDate: new Date('2024-03-20'),
    items: [
      {
        id: '1',
        description: 'Website Rental - acmeplumbing.com',
        quantity: 1,
        rate: 2000,
        amount: 2000,
      },
      {
        id: '2',
        description: 'Lead Generation Fee (25 leads)',
        quantity: 25,
        rate: 20,
        amount: 500,
      }
    ],
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    id: '2',
    clientId: '1',
    websiteId: '1',
    amount: 2800,
    status: 'sent',
    dueDate: new Date('2024-04-25'),
    items: [
      {
        id: '3',
        description: 'Website Rental - acmeplumbing.com',
        quantity: 1,
        rate: 2000,
        amount: 2000,
      },
      {
        id: '4',
        description: 'Lead Generation Fee (40 leads)',
        quantity: 40,
        rate: 20,
        amount: 800,
      }
    ],
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-15'),
  }
];

const mockPricingRules: PricingRule[] = [
  {
    id: '1',
    websiteId: '1',
    name: 'Standard Pricing',
    basePrice: 2000,
    leadMultiplier: 20,
    minimumLeads: 20,
    maximumLeads: 50,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export default function Revenue() {
  const [invoices] = useState<Invoice[]>(mockInvoices);
  const [websites] = useState<Website[]>(mockWebsites);
  const [clients] = useState<Client[]>(mockClients);
  const [pricingRules] = useState<PricingRule[]>(mockPricingRules);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<string>('');
  const [leadCount, setLeadCount] = useState<number>(20);

  const totalRevenue = invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const pendingRevenue = invoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const getInvoiceStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'sent':
        return 'info';
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const getInvoiceStatusIcon = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle size={16} />;
      case 'sent':
        return <Clock size={16} />;
      case 'overdue':
        return <AlertTriangle size={16} />;
      default:
        return null;
    }
  };

  const calculatePrice = (websiteId: string, leads: number) => {
    const rule = pricingRules.find(r => r.websiteId === websiteId && r.status === 'active');
    if (!rule) return 0;

    const adjustedLeads = Math.min(Math.max(leads, rule.minimumLeads), rule.maximumLeads);
    return rule.basePrice + (adjustedLeads * rule.leadMultiplier);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Revenue Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<Calculator size={20} />}
            onClick={() => setCalculatorOpen(true)}
          >
            Price Calculator
          </Button>
          <Button
            variant="contained"
            startIcon={<Plus size={20} />}
          >
            Create Invoice
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <DollarSign size={24} />
                <Typography color="success.main" variant="body2">
                  <ArrowUpRight size={16} style={{ marginRight: 4 }} />
                  +12.5%
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${totalRevenue.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Total Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Clock size={24} />
                <Typography color="warning.main" variant="body2">
                  <ArrowUpRight size={16} style={{ marginRight: 4 }} />
                  +8.3%
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${pendingRevenue.toLocaleString()}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Pending Revenue
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Users size={24} />
                <Typography color="success.main" variant="body2">
                  <ArrowUpRight size={16} style={{ marginRight: 4 }} />
                  +2
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {clients.length}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Active Clients
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6} lg={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <TrendingUp size={24} />
                <Typography color="success.main" variant="body2">
                  <ArrowUpRight size={16} style={{ marginRight: 4 }} />
                  +15.2%
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${(totalRevenue / clients.length).toFixed(0)}
              </Typography>
              <Typography color="text.secondary" variant="body2">
                Average Revenue per Client
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                Recent Invoices
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Invoice</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Website</TableCell>
                      <TableCell>Amount</TableCell>
                      <TableCell>Due Date</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((invoice) => {
                      const client = clients.find(c => c.id === invoice.clientId);
                      const website = websites.find(w => w.id === invoice.websiteId);
                      return (
                        <TableRow key={invoice.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <FileText size={16} />
                              <Typography variant="body2">
                                INV-{invoice.id}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{client?.name}</TableCell>
                          <TableCell>{website?.domain}</TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              ${invoice.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {invoice.dueDate.toLocaleDateString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {getInvoiceStatusIcon(invoice.status)}
                              <Chip
                                size="small"
                                label={invoice.status}
                                color={getInvoiceStatusColor(invoice.status)}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              {invoice.status === 'draft' && (
                                <Tooltip title="Send Invoice">
                                  <IconButton size="small">
                                    <Send size={16} />
                                  </IconButton>
                                </Tooltip>
                              )}
                              <Tooltip title="Download PDF">
                                <IconButton size="small">
                                  <Download size={16} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small">
                                  <Edit2 size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Price Calculator Dialog */}
      <Dialog
        open={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Price Calculator</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Website</InputLabel>
              <Select
                value={selectedWebsite}
                label="Website"
                onChange={(e) => setSelectedWebsite(e.target.value)}
              >
                {websites.map((website) => (
                  <MenuItem key={website.id} value={website.id}>
                    {website.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Expected Monthly Leads"
              type="number"
              value={leadCount}
              onChange={(e) => setLeadCount(parseInt(e.target.value) || 0)}
              InputProps={{ inputProps: { min: 0 } }}
            />
            {selectedWebsite && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Pricing Breakdown
                  </Typography>
                  {(() => {
                    const rule = pricingRules.find(r => r.websiteId === selectedWebsite);
                    if (!rule) return null;

                    const adjustedLeads = Math.min(Math.max(leadCount, rule.minimumLeads), rule.maximumLeads);
                    const totalPrice = calculatePrice(selectedWebsite, leadCount);

                    return (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">Base Price:</Typography>
                          <Typography variant="body2">${rule.basePrice}</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2">
                            Lead Fee ({adjustedLeads} leads × ${rule.leadMultiplier}):
                          </Typography>
                          <Typography variant="body2">
                            ${adjustedLeads * rule.leadMultiplier}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="subtitle2">Total Monthly Price:</Typography>
                          <Typography variant="subtitle2" color="primary">
                            ${totalPrice}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })()}
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCalculatorOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}