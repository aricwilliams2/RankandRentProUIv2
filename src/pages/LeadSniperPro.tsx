import AreaSelector from "../components/AreaSelector";
import FilterPanel from "../components/FilterPanel";
import Header from "../components/Header";
import InfoPanel from "../components/InfoPanel";
import LeadsList from "../components/LeadsList";
import { LeadProvider } from "../contexts/LeadContext";

function LeadSniperProFunc() {
  return (
    <LeadProvider>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <Header />
        <main className="flex-grow container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 max-w-7xl">
          <AreaSelector />
          <InfoPanel />
          <FilterPanel />
          <LeadsList />
        </main>
        <footer className="py-3 sm:py-4 text-center text-xs sm:text-sm text-gray-500 bg-white border-t">
          LeadTracker © {new Date().getFullYear()} - Click on a row to mark as contacted • Data synced with API
        </footer>
      </div>
    </LeadProvider>
  );
}

export default LeadSniperProFunc;