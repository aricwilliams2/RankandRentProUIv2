import React from "react";
import { useLeadContext } from "../contexts/LeadContext";
import { MapPin, AlertCircle, Filter } from "lucide-react";

const AreaSelector: React.FC = () => {
  const { areas, currentArea, setCurrentArea, loading, error } = useLeadContext();

  if (loading) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Loading Cities...</h2>
        </div>
        <div className="animate-pulse">
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded-full w-20"></div>
            <div className="h-8 bg-gray-200 rounded-full w-24"></div>
            <div className="h-8 bg-gray-200 rounded-full w-28"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0" />
          <h2 className="font-semibold text-red-800 text-sm sm:text-base">Error Loading Cities</h2>
        </div>
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (areas.length === 0) {
    return (
      <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
          <h2 className="font-semibold text-gray-600 text-sm sm:text-base">No Cities Available</h2>
        </div>
        <p className="text-gray-500 text-sm">No leads found. Please check your API connection or add some leads.</p>
      </div>
    );
  }

  return (
    <div className="mb-4 sm:mb-6 bg-white rounded-lg shadow-md p-3 sm:p-4">
      <div className="flex items-center gap-2 mb-3">
        <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
        <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Filter by City</h2>
        <span className="text-xs text-gray-500">({areas.length} cities)</span>
      </div>
      
      <div className="mb-3">
        <p className="text-xs text-gray-600">Click a city button below to filter leads by location:</p>
      </div>
      
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {areas.map((area) => (
          <button 
            key={area.id} 
            onClick={() => setCurrentArea(area.id)} 
            className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
              currentArea === area.id 
                ? "bg-blue-600 text-white shadow-md transform scale-105" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 hover:shadow-sm"
            }`}
            title={`View ${area.leads.length} leads in ${area.name}`}
          >
            <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>{area.name}</span>
            <span className={`px-1.5 py-0.5 rounded-full text-xs font-bold ${
              currentArea === area.id 
                ? "bg-white/20 text-white" 
                : "bg-gray-300 text-gray-600"
            }`}>
              {area.leads.length}
            </span>
          </button>
        ))}
      </div>
      
      {currentArea && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>
              Currently showing leads from <span className="font-medium text-gray-800">
                {areas.find(area => area.id === currentArea)?.name}
              </span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;