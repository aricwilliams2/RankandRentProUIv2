import React, { useRef, useEffect, useState } from "react";
import LeadItem from "./LeadItem";
import { ChevronUp, ChevronDown, Edit3, X } from "lucide-react";
import { SortField } from "../types";
import { useLeadContext } from "../contexts/LeadContext";

const LeadsList: React.FC = () => {
  const { filteredLeads, lastCalledIndex, setLastCalledIndex, sortField, sortDirection, handleSort, updateLead } = useLeadContext();
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showBulkEditModal, setShowBulkEditModal] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  // Handle select all/none
  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)));
    }
  };

  // Handle individual lead selection
  const handleLeadSelection = (leadId: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId);
    } else {
      newSelected.add(leadId);
    }
    setSelectedLeads(newSelected);
  };

  // Handle bulk update
  const handleBulkUpdate = async () => {
    if (selectedLeads.size === 0 || !newCity.trim()) return;

    setIsUpdating(true);
    try {
      const updatePromises = Array.from(selectedLeads).map(leadId =>
        updateLead(leadId, { city: newCity.trim() })
      );

      await Promise.all(updatePromises);

      // Reset state
      setSelectedLeads(new Set());
      setNewCity("");
      setShowBulkEditModal(false);
    } catch (error) {
      console.error("Failed to update leads:", error);
      alert("Failed to update some leads. Please try again.");
    } finally {
      setIsUpdating(false);
    }
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
      {/* Bulk Edit Controls */}
      {selectedLeads.size > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-blue-800">
              {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setShowBulkEditModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
              Bulk Edit Tag
            </button>
          </div>
          <button
            onClick={() => setSelectedLeads(new Set())}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Mobile Card View for smaller screens */}
      <div className="block sm:hidden">
        <div className="divide-y divide-gray-200">
          {filteredLeads.map((lead, index) => (
            <div key={lead.id} className="p-4 hover:bg-blue-50 transition-colors">
              <LeadItem
                lead={lead}
                index={index}
                isSelected={selectedLeads.has(lead.id)}
                onSelectionChange={handleLeadSelection}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Table View for larger screens */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 text-sm">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                  />
                </div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("name")}>
                <div className="flex items-center">Business {renderSortIndicator("name")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("phone")}>
                <div className="flex items-center">Phone {renderSortIndicator("phone")}</div>
              </th>
              <th className="text-left p-3 lg:p-4 font-semibold text-gray-700 cursor-pointer hover:bg-gray-100 text-sm" onClick={() => handleSort("website")}>
                <div className="flex items-center">Website {renderSortIndicator("website")}</div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredLeads.map((lead, index) => (
              <LeadItem
                key={lead.id}
                lead={lead}
                index={index}
                ref={(el) => (rowRefs.current[index] = el)}
                isSelected={selectedLeads.has(lead.id)}
                onSelectionChange={handleLeadSelection}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Bulk Edit Modal */}
      {showBulkEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Bulk Edit Tag</h3>
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Tag for {selectedLeads.size} lead{selectedLeads.size > 1 ? 's' : ''}:
                </label>
                <input
                  type="text"
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  placeholder="Enter new tag..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setShowBulkEditModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkUpdate}
                disabled={!newCity.trim() || isUpdating}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isUpdating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </>
                ) : (
                  'Update Tags'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsList;