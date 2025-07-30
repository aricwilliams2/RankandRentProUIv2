import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
  Tab,
  Tabs,
  Container,
} from '@mui/material';
import { Lock, User, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LoginPage() {
  const { login, register, loading, error } = useAuth();
  const [tabValue, setTabValue] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setFormErrors({});
    setFormData({ name: '', email: '', password: '' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (tabValue === 1 && !formData.name) {
      errors.name = 'Name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      if (tabValue === 0) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.name, formData.email, formData.password);
      }
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        p: 2,
      }}
    >
      <Container maxWidth="sm">
        <Card sx={{ borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 0 }}>
            {/* Header */}
            <Box sx={{ textAlign: 'center', p: 4, pb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                <img 
                  src="https://www.rankandrenttool.com/Rank&.png" 
                  alt="RankRent Pro" 
                  style={{ width: 120, objectFit: 'contain' }}
                />
              </Box>
              <Typography variant="h4" fontWeight="bold" color="primary" gutterBottom>
                Welcome to RankRent Pro
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Your complete rank and rent management solution
              </Typography>
            </Box>

            {/* Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs 
                value={tabValue} 
                onChange={handleTabChange} 
                centered
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontSize: '1rem',
                    fontWeight: 600,
                  }
                }}
              >
                <Tab 
                  label="Sign In" 
                  icon={<Lock size={20} />} 
                  iconPosition="start"
                />
                <Tab 
                  label="Sign Up" 
                  icon={<User size={20} />} 
                  iconPosition="start"
                />
              </Tabs>
            </Box>

            {/* Error Alert */}
            {error && (
              <Box sx={{ p: 3, pb: 0 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  {error}
                </Alert>
              </Box>
            )}

            {/* Login Form */}
            <TabPanel value={tabValue} index={0}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    fullWidth
                    InputProps={{
                      startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#666' }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password}
                    fullWidth
                    InputProps={{
                      startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#666' }} />,
                      endAdornment: (
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Button>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Signing In...
                      </>
                    ) : (
                      'Sign In'
                    )}
                  </Button>
                </Box>
              </form>
            </TabPanel>

            {/* Register Form */}
            <TabPanel value={tabValue} index={1}>
              <form onSubmit={handleSubmit}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <TextField
                    label="Full Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                    fullWidth
                    InputProps={{
                      startAdornment: <User size={20} style={{ marginRight: 8, color: '#666' }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <TextField
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    error={!!formErrors.email}
                    helperText={formErrors.email}
                    fullWidth
                    InputProps={{
                      startAdornment: <Mail size={20} style={{ marginRight: 8, color: '#666' }} />,
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  
                  <TextField
                    label="Password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleInputChange}
                    error={!!formErrors.password}
                    helperText={formErrors.password || 'Minimum 6 characters'}
                    fullWidth
                    InputProps={{
                      startAdornment: <Lock size={20} style={{ marginRight: 8, color: '#666' }} />,
                      endAdornment: (
                        <Button
                          onClick={() => setShowPassword(!showPassword)}
                          sx={{ minWidth: 'auto', p: 1 }}
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </Button>
                      ),
                    }}
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={loading}
                    sx={{
                      mt: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    {loading ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        Creating Account...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </Button>
                </Box>
              </form>
            </TabPanel>
          </CardContent>
        </Card>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
            © {new Date().getFullYear()} RankRent Pro. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}