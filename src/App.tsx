import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Websites from "./pages/Websites";
import PhoneNumbers from "./pages/PhoneNumbers";
import Analytics from "./pages/Analytics";
import Revenue from "./pages/Revenue";
import Research from "./pages/Research";
import Settings from "./pages/Settings";
import { ApiProvider } from "./contexts/ApiContext";
import { ClientProvider } from "./contexts/ClientContext";
import LeadSniperProFunc from "./pages/LeadSniperPro";
import { TaskProvider } from "./contexts/TaskContext";
import { LeadProvider } from "./contexts/LeadContext";
import { WebsiteProvider } from "./contexts/WebsiteContext";

const App = () => {
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

export default App;
