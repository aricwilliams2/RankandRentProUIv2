import React from "react";
import { CheckSquare, Users } from "lucide-react";
import { useLeadContext } from "../contexts/LeadContext";

const FilterPanel: React.FC = () => {
  const { filters, setFilters, areas, currentArea, setCurrentArea } = useLeadContext();

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleShowAllLeads = () => {
    // Set current area to empty to show all leads
    setCurrentArea("");
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base">Lead Status</h2>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <label className="inline-flex items-center cursor-pointer">
          <input type="checkbox" name="showContactedOnly" checked={filters.showContactedOnly} onChange={handleFilterChange} className="sr-only peer" />
          <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ms-3 text-xs sm:text-sm font-medium text-gray-700 flex items-center">
            <CheckSquare className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 text-blue-600" />
            Show contacted leads only
          </span>
        </label>

        <div className="pt-2 border-t border-gray-200">
          <button
            onClick={handleShowAllLeads}
            className="inline-flex items-center px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:border-blue-300 transition-colors w-full sm:w-auto justify-center"
          >
            <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5" />
            Show All Leads
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
