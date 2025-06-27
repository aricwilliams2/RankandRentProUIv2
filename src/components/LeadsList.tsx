import React, { useRef, useEffect } from "react";
import LeadItem from "./LeadItem";
import { ChevronUp, ChevronDown } from "lucide-react";
import { SortField } from "../types";
import { useLeadContext } from "../contexts/LeadContext";

const LeadsList: React.FC = () => {
  const { filteredLeads, lastCalledIndex, setLastCalledIndex, sortField, sortDirection, handleSort } = useLeadContext();

  const rowRefs = useRef<(HTMLTableRowElement | null)[]>([]);

  // Scroll to the last called index when returning from a call
  useEffect(() => {
    if (lastCalledIndex !== null) {
      const targetRow = rowRefs.current[lastCalledIndex];
      if (targetRow) {
        // Slight delay to ensure the app has rendered
        setTimeout(() => {
          targetRow.scrollIntoView({ behavior: "smooth", block: "center" });
          // Highlight the row briefly
          targetRow.classList.add("bg-blue-100");
          setTimeout(() => {
            targetRow.classList.remove("bg-blue-100");
          }, 1500);
          // Reset the last called index
          setLastCalledIndex(null);
        }, 300);
      }
    }
  }, [lastCalledIndex, setLastCalledIndex]);

  // Helper to render sort indicators
  const renderSortIndicator = (field: SortField) => {
    if (sortField !== field) return null;

    return sortDirection === "asc" ? <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4 ml-1 inline" /> : <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 ml-1 inline" />;
  };

  if (filteredLeads.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6 sm:p-8 text-center">
        <p className="text-gray-600 text-base sm:text-lg">No leads found matching your criteria.</p>
        <p className="text-gray-500 mt-2 text-sm sm:text-base">Try adjusting your filters or add a new lead.</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      {/* Mobile Card View for smaller screens */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200">
          {filteredLeads.map((lead, index) => (
            <div key={lead.id} className="p-4 hover:bg-blue-50 transition-colors">
              <LeadItem lead={lead} index={index} />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View for larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("name")}>
                <div className="flex items-center">Business {renderSortIndicator("name")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("reviews")}>
                <div className="flex items-center">Reviews {renderSortIndicator("reviews")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("phone")}>
                <div className="flex items-center">Phone {renderSortIndicator("phone")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("website")}>
                <div className="flex items-center">Website {renderSortIndicator("website")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 text-sm">
                Call Log
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 text-sm">
                Call History
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 text-sm">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, index) => (
              <LeadItem key={lead.id} lead={lead} index={index} ref={(el) => (rowRefs.current[index] = el)} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeadsList;