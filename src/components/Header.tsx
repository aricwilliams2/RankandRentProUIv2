import React from "react";
import { Phone, RefreshCw, AlertCircle, Plus, Music, ChevronDown, ChevronUp } from "lucide-react";
import { useLeadContext } from "../contexts/LeadContext";
import LeadFormDialog from "./LeadFormDialog";

const Header: React.FC = () => {
  const { clearCache, currentArea, areas, loading, error } = useLeadContext();
  const [showAddLead, setShowAddLead] = React.useState(false);
  const [musicOpen, setMusicOpen] = React.useState(false);
  const currentAreaName = areas.find((area) => area.id === currentArea)?.name || "";

  return (
    <>
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg py-3 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Phone className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0" />
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold truncate">LeadTracker</h1>
            {currentAreaName && (
              <span className="text-white/80 text-xs sm:text-sm px-2 py-0.5 bg-white/10 rounded-full truncate max-w-24 sm:max-w-none">
                {currentAreaName}
              </span>
            )}
            {loading && (
              <div className="flex items-center text-white/70 text-xs">
                <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                Loading...
              </div>
            )}
            {error && (
              <div className="flex items-center text-red-300 text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Error
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 ml-2">

            <span className="hidden lg:inline mr-3 text-sm whitespace-nowrap">Your Sales Leads Dashboard</span>
            <button
              onClick={() => setShowAddLead(true)}
              className="flex items-center px-2 sm:px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap"
              title="Add new lead"
            >
              <Plus className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0`} />
              <span className="hidden sm:inline">Add Lead</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={clearCache}
              className="flex items-center px-2 sm:px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs sm:text-sm transition-colors whitespace-nowrap disabled:opacity-50"
              title="Reload data from API"
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 flex-shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reload Data</span>
              <span className="sm:hidden">Reload</span>
            </button>
          </div>
        </div>
      </header>

      {/* Fixed top-right music control (300px width) */}
      {/* <div className="fixed bottom-0 right-3 z-40 w-[400px]">
        <div className="bg-white/95 backdrop-blur-sm border border-orange-300 text-orange-800 rounded-md shadow-sm">
          <button
            onClick={() => setMusicOpen((v) => !v)}
            className="w-full px-3 py-2 flex items-center justify-between hover:bg-orange-50 transition-colors"
            aria-expanded={musicOpen}
            aria-controls="music-player-panel"
          >
            <span className="flex items-center gap-2">
              <Music className="h-4 w-4 text-orange-600" />
              <span className="text-sm">Play music?</span>
            </span>
            {musicOpen ? <ChevronUp className="h-4 w-4 text-orange-600" /> : <ChevronDown className="h-4 w-4 text-orange-600" />}
          </button>
          {musicOpen && (
            <div id="music-player-panel" className="border-t border-orange-200">
              <div className="p-2">
                <div className="rounded-md overflow-hidden border border-orange-200 bg-white">
                  <iframe
                    title="Spotify Player"
                    style={{ border: 0, width: '100%', height: 152 }}
                    src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div> */}

      <LeadFormDialog
        open={showAddLead}
        onClose={() => setShowAddLead(false)}
        onSuccess={() => setShowAddLead(false)}
      />
    </>
  );
};

export default Header;