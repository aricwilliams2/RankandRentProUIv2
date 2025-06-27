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
import LeadSniperProFunc from "./pages/LeadSniperPro";

const App = () => {
  return (
    <ApiProvider>
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
    </ApiProvider>
  );
};

export default App;
