import React from "react";
import { Info, CheckCircle, AlertCircle } from "lucide-react";
import { useLeadContext } from "../contexts/LeadContext";

const InfoPanel: React.FC = () => {
  const { leads, filteredLeads, currentArea, areas, loading, error } = useLeadContext();
  const contactedCount = filteredLeads.filter((lead) => lead.contacted).length;
  const totalLeads = filteredLeads.length;
  const progressPercentage = totalLeads > 0 ? (contactedCount / totalLeads) * 100 : 0;

  // Find current area name
  const currentAreaName = areas.find((area) => area.id === currentArea)?.name || "";

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full flex-shrink-0">
            <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-start gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 bg-red-100 rounded-full flex-shrink-0">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-red-800 text-sm sm:text-base">Error Loading Data</h2>
            <p className="text-xs sm:text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex items-start gap-2 sm:gap-3">
        <div className="p-1.5 sm:p-2 bg-blue-100 rounded-full flex-shrink-0">
          <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">
            {currentAreaName ? `${currentAreaName} Progress Tracking` : 'Lead Progress Tracking'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Track your contacted leads and overall progress</p>

          <div className="mt-3 sm:mt-4 flex items-center justify-between mb-1">
            <div className="text-xs sm:text-sm font-medium text-gray-700">Contacted Leads</div>
            <div className="text-xs sm:text-sm font-medium text-gray-700 text-right">
              {contactedCount} of {totalLeads}
              {filteredLeads.length !== leads.length && (
                <div className="text-xs text-gray-500">(filtered from {leads.length} total)</div>
              )}
            </div>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
            <div 
              className="bg-green-500 h-2 sm:h-2.5 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="mt-3 sm:mt-4 flex items-center text-xs sm:text-sm text-gray-600">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 mr-1 sm:mr-1.5 flex-shrink-0" />
            <span className="leading-tight">
              {contactedCount === 0 
                ? "Start contacting leads by clicking on any row" 
                : contactedCount === totalLeads 
                ? "Great job! You've contacted all leads" 
                : `${totalLeads - contactedCount} leads remaining`
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;