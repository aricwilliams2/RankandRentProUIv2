import { HashRouter as Router, Routes, Route, Navigate, Outlet, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Layout from "./components/Layout";
import LoginPage from "./components/LoginPage";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Websites from "./pages/Websites";
import PhoneNumbers from "./pages/PhoneNumbers";
import Analytics from "./pages/Analytics";
import Revenue from "./pages/Revenue";
import Research from "./pages/Research";
import Settings from "./pages/Settings";
import ClientChecklistPage from "./pages/ClientChecklistPage";
import IndividualClientChecklistPage from "./pages/ClientChecklistPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ApiProvider } from "./contexts/ApiContext";
import { ClientProvider } from "./contexts/ClientContext";
import LeadSniperProFunc from "./pages/LeadSniperPro";
import { TaskProvider } from "./contexts/TaskContext";
import { LeadProvider } from "./contexts/LeadContext";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { UserPhoneNumbersProvider } from "./contexts/UserPhoneNumbersContext";
import { CallForwardingProvider } from "./contexts/CallForwardingContext";
import { BillingProvider } from "./contexts/BillingContext";
import { Box, CircularProgress } from "@mui/material";
import SerpResults from "./pages/SerpResults";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";
import CallForwardingPage from "./pages/CallForwarding";
import VideoRecording from "./pages/VideoRecording";
import VideoPlayer from "./components/VideoPlayer";
import KeywordResearch from "./pages/KeywordResearch";
import SavedKeywords from "./pages/SavedKeywords";
import "./styles/twilio.css";

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1e40af',
    },
    secondary: {
      main: '#f59e0b',
    },
  },
});

const RequireAuth = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <Outlet />;
};

const ProtectedShell = () => (
  <ApiProvider>
    <ClientProvider>
      <LeadProvider>
        <WebsiteProvider>
          <BillingProvider>
            <UserPhoneNumbersProvider>
              <CallForwardingProvider>
                <TaskProvider>
                  <Layout>
                    <Outlet />
                  </Layout>
                </TaskProvider>
              </CallForwardingProvider>
            </UserPhoneNumbersProvider>
          </BillingProvider>
        </WebsiteProvider>
      </LeadProvider>
    </ClientProvider>
  </ApiProvider>
);

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        {/* Add the shareable video route - accessible without authentication */}
        <Route path="/v/:shareableId" element={<VideoPlayer />} />
        <Route element={<RequireAuth />}>
          <Route element={<ProtectedShell />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/Leads" element={<LeadSniperProFunc />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/websites" element={<Websites />} />
            <Route path="/phone-numbers" element={<PhoneNumbers />} />
            <Route path="/video-recording" element={<VideoRecording />} />
            <Route path="/call-forwarding" element={<CallForwardingPage />} />
            <Route path="/checklists" element={<ClientChecklistPage />} />
            <Route path="/client-checklist/:clientId" element={<IndividualClientChecklistPage />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/revenue" element={<Revenue />} />
            <Route path="/research" element={<Research />} />
            <Route path="/keyword-research" element={<KeywordResearch />} />
            <Route path="/saved-keywords" element={<SavedKeywords />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/serp-results" element={<SerpResults />} />
            <Route path="/success" element={<SuccessPage />} />
            <Route path="/cancel" element={<CancelPage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

const App = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default App;
