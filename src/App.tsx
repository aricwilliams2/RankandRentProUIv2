import { HashRouter as Router, Routes, Route } from "react-router-dom";
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
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ApiProvider } from "./contexts/ApiContext";
import { ClientProvider } from "./contexts/ClientContext";
import LeadSniperProFunc from "./pages/LeadSniperPro";
import { TaskProvider } from "./contexts/TaskContext";
import { LeadProvider } from "./contexts/LeadContext";
import { WebsiteProvider } from "./contexts/WebsiteContext";
import { Box, CircularProgress } from "@mui/material";
import SerpResults from "./pages/SerpResults";
import SuccessPage from "./pages/SuccessPage";
import CancelPage from "./pages/CancelPage";

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();

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
    return <LoginPage />;
  }

  return (
    <ApiProvider>
      <ClientProvider>
        <LeadProvider>
          <WebsiteProvider>
            <TaskProvider>
              <Router>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/Leads" element={<LeadSniperProFunc />} />
                    <Route path="/clients" element={<Clients />} />
                    <Route path="/websites" element={<Websites />} />
                    <Route path="/phone-numbers" element={<PhoneNumbers />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/revenue" element={<Revenue />} />
                    <Route path="/research" element={<Research />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/serp-results" element={<SerpResults />} />
                    <Route path="/success" element={<SuccessPage />} />
                    <Route path="/cancel" element={<CancelPage />} />
                  </Routes>
                </Layout>
              </Router>
            </TaskProvider>
          </WebsiteProvider>
        </LeadProvider>
      </ClientProvider>
    </ApiProvider>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
