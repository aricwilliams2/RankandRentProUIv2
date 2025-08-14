import React from 'react';
import { Box, Container, Typography, Breadcrumbs, Link } from '@mui/material';
import { Home, Forward } from 'lucide-react';
import CallForwardingComponent from '../components/CallForwardingComponent';

export default function CallForwardingPage() {
    return (
        <Container maxWidth="xl">
            <Box sx={{ py: 3 }}>
                {/* Breadcrumbs */}
                <Breadcrumbs sx={{ mb: 3 }}>
                    <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Home size={16} />
                        Home
                    </Link>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Forward size={16} />
                        <Typography color="text.primary">Call Forwarding</Typography>
                    </Box>
                </Breadcrumbs>

                {/* Page Content */}
                <CallForwardingComponent />
            </Box>
        </Container>
    );
}
