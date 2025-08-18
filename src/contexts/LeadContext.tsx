import React, { createContext, useState, useEffect, useContext, useMemo } from "react";
import { Lead, LeadContextType, Filters, AreaData, SortField, SortDirection, CallLog } from "../types";
import { createCallLogAPI, updateCallLogAPI, fetchCallLogsAPI, deleteCallLogAPI } from "../services/apiService";
import { apiCall } from '../config/api';

const LeadContext = createContext<LeadContextType | undefined>(undefined);

const initialFilters: Filters = {
  showContactedOnly: false,
};

// API Configuration - Updated for local development




// Transform API lead data to frontend format
const transformAPILeadToFrontend = (apiLead: any): Lead => {
  return {
    id: apiLead.id,
    name: apiLead.name,
    email: apiLead.email,
    phone: apiLead.phone || "",
    company: apiLead.company,
    website: apiLead.website || "",
    status: apiLead.status,
    reviews: apiLead.reviews || 0,
    // Handle contacted as string "1", number 1, or boolean true
    contacted: apiLead.contacted === 1 || apiLead.contacted === true || apiLead.contacted === "1",
    callLogs: [], // Call logs will be managed separately
    createdAt: new Date(apiLead.created_at),
    updatedAt: new Date(apiLead.updated_at),
    city: apiLead.city || "Unknown", // Handle null city
    follow_up_at: apiLead.follow_up_at,
    notes: apiLead.notes,
  };
};

// Transform lead data for API (frontend -> backend format)
const transformLeadForAPI = (lead: Lead, fieldsToUpdate?: string[]) => {
  const apiData: any = {};

  // If specific fields are provided, only include those
  if (fieldsToUpdate) {
    fieldsToUpdate.forEach((field) => {
      switch (field) {
        case "contacted":
          apiData.contacted = lead.contacted;
          break;
        case "notes":
          apiData.notes = lead.notes;
          break;
        case "follow_up_at":
          apiData.follow_up_at = lead.follow_up_at;
          break;
        case "city":
          apiData.city = lead.city === "Unknown" ? null : lead.city;
          break;
        // Add other fields as needed
      }
    });
  } else {
    // Include all fields for complete updates
    apiData.name = lead.name;
    apiData.email = lead.email;
    apiData.phone = lead.phone;
    apiData.company = lead.company;
    apiData.website = lead.website;
    apiData.status = lead.status;
    apiData.reviews = lead.reviews;
    apiData.contacted = lead.contacted;
    apiData.city = lead.city === "Unknown" ? null : lead.city;
    apiData.follow_up_at = lead.follow_up_at;
    apiData.notes = lead.notes;
  }

  return apiData;
};

// API call to fetch leads with pagination support
const fetchLeadsAPI = async (): Promise<Lead[]> => {
  try {
    const response = await apiCall('/api/leads');

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const apiResponse = await response.json();
    const leads = apiResponse.data || [];

    console.log("Fetched leads:", leads.length);

    // Fetch call logs for each lead
    const leadsWithCallLogs = await Promise.all(
      leads.map(async (lead: any) => {
        try {
          console.log(`Fetching call logs for lead ${lead.id}...`);
          const callLogsResponse = await fetchCallLogsAPI(lead.id);
          console.log(`Call logs response for lead ${lead.id}:`, callLogsResponse);

          // Handle the API response structure: { success: true, data: [...] }
          const callLogs = callLogsResponse.success && callLogsResponse.data ? callLogsResponse.data : [];

          const transformedLead = transformAPILeadToFrontend(lead);
          transformedLead.callLogs = callLogs.map((log: any) => ({
            id: log.id,
            leadId: log.lead_id,
            callDate: new Date(log.created_at),
            outcome: log.outcome,
            notes: log.notes,
            nextFollowUp: log.next_follow_up,
            duration: log.duration,
          }));

          console.log(`Transformed lead ${lead.id} with ${transformedLead.callLogs.length} call logs:`, transformedLead.callLogs);

          return transformedLead;
        } catch (error) {
          console.error(`Failed to fetch call logs for lead ${lead.id}:`, error);
          const transformedLead = transformAPILeadToFrontend(lead);
          transformedLead.callLogs = [];
          return transformedLead;
        }
      })
    );

    return leadsWithCallLogs;
  } catch (error) {
    console.error("Failed to fetch leads from API:", error);
    throw error;
  }
};

// API call to update lead
const updateLeadAPI = async (lead: Lead, fieldsToUpdate?: string[]) => {
  try {
    const leadData = transformLeadForAPI(lead, fieldsToUpdate);
    const response = await apiCall(`/api/leads/${lead.id}`, {
      method: "PUT", // Laravel API uses PUT for updates
      body: JSON.stringify(leadData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const updatedData = await response.json();
    return updatedData;
  } catch (error) {
    console.error("Failed to update lead via API:", error);
    throw error;
  }
};

// API call to create a new lead
const createLeadAPI = async (leadData: Partial<Lead>) => {
  try {
    // Get current user from localStorage
    const user = localStorage.getItem("user");
    const userId = user ? JSON.parse(user).id : null;

    // Ensure all required fields are present
    const requestBody = {
      user_id: userId,
      name: leadData.name || "",
      email: leadData.email || "",
      phone: leadData.phone || "",
      company: leadData.company || "",
      website: leadData.website || "",
      city: leadData.city || null,
      status: leadData.status || "New",
      notes: leadData.notes || "",
      reviews: leadData.reviews || 0,
      contacted: leadData.contacted || false,
    };

    const response = await apiCall('/api/leads', {
      method: "POST",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: "Failed to parse error response" };
      }
      console.error("API Error Response:", errorData);
      console.error("Response status:", response.status);
      console.error("Response statusText:", response.statusText);
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
    }

    const newLead = await response.json();
    return transformAPILeadToFrontend(newLead);
  } catch (error) {
    console.error("Failed to create lead via API:", error);
    throw error;
  }
};

// API call to delete a lead
const deleteLeadAPI = async (leadId: string) => {
  try {
    const response = await apiCall(`/api/leads/${leadId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error Response:", errorData);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return true;
  } catch (error) {
    console.error("Failed to delete lead via API:", error);
    throw error;
  }
};

export const LeadProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allLeads, setAllLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get current area from localStorage or default to first available city
  const [currentArea, setCurrentAreaState] = useState<string>(() => {
    return localStorage.getItem("currentArea") || "";
  });

  const [lastCalledIndex, setLastCalledIndex] = useState<number | null>(() => {
    const savedIndex = localStorage.getItem(`lastCalledIndex_${currentArea}`);
    return savedIndex ? parseInt(savedIndex, 10) : null;
  });

  const [filters, setFilters] = useState<Filters>(initialFilters);

  // Sorting states
  const [sortField, setSortField] = useState<SortField | null>("reviews");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // Create areas from API data (group by city)
  const areas = useMemo<AreaData[]>(() => {
    const cityGroups = allLeads.reduce((acc, lead) => {
      const city = lead.city || "Unknown";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);

    return Object.entries(cityGroups).map(([city, leads]) => ({
      id: city.toLowerCase().replace(/\s+/g, "-"),
      name: city,
      leads,
    }));
  }, [allLeads]);

  // Get leads for current area
  const leads = useMemo(() => {
    if (!currentArea) {
      // If no area is selected, show all leads
      return allLeads;
    }
    const area = areas.find((a) => a.id === currentArea);
    return area?.leads || [];
  }, [areas, currentArea, allLeads]);

  // Load leads from API on component mount
  useEffect(() => {
    const loadLeads = async () => {
      try {
        setLoading(true);
        setError(null);

        const apiLeads = await fetchLeadsAPI();
        const leadsWithCallLogs = apiLeads;

        setAllLeads(leadsWithCallLogs);

        // Set default area if not set
        if (!currentArea && leadsWithCallLogs.length > 0) {
          const firstLead = leadsWithCallLogs[0];
          if (firstLead.city) {
            const firstAreaId = firstLead.city.toLowerCase().replace(/\s+/g, "-");
            setCurrentAreaState(firstAreaId);
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load leads");
      } finally {
        setLoading(false);
      }
    };

    loadLeads();
  }, []); // Remove currentArea dependency to prevent infinite loop

  // Set current area and update localStorage
  const setCurrentArea = (areaId: string) => {
    setCurrentAreaState(areaId);
    localStorage.setItem("currentArea", areaId);

    // Reset filters when changing area
    setFilters(initialFilters);
    // Reset last called index
    setLastCalledIndex(null);
    // Reset sorting
    setSortField("reviews");
    setSortDirection("desc");
  };

  // Save current area to localStorage
  useEffect(() => {
    if (currentArea) {
      localStorage.setItem("currentArea", currentArea);
    }
  }, [currentArea]);



  // Save last called index to localStorage
  useEffect(() => {
    if (lastCalledIndex !== null) {
      localStorage.setItem(`lastCalledIndex_${currentArea}`, lastCalledIndex.toString());
    }
  }, [lastCalledIndex, currentArea]);

  // Toggle contact status for a lead
  const toggleContactStatus = async (id: string) => {
    const lead = allLeads.find((l) => l.id === id);
    if (!lead) return;

    const updatedLead = { ...lead, contacted: !lead.contacted };

    try {
      // Update API first - send the contacted field with proper boolean value
      const response = await apiCall(`/api/leads/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          contacted: updatedLead.contacted
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error Response:", errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === id ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to update contacted status:", error);
      setError("Failed to update lead status");
    }
  };

  // Add call log function
  const addCallLog = async (leadId: string, callLogData: Omit<CallLog, "id" | "leadId" | "callDate">): Promise<void> => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      // Create call log via API
      const apiCallLog = await createCallLogAPI(leadId, {
        outcome: callLogData.outcome,
        notes: callLogData.notes,
        nextFollowUp: callLogData.nextFollowUp || calculateNextFollowUp(callLogData.outcome),
        duration: callLogData.duration || 0,
      });

      // Transform API response to frontend format
      const newCallLog: CallLog = {
        id: apiCallLog.id,
        leadId,
        callDate: new Date(apiCallLog.created_at),
        outcome: apiCallLog.outcome,
        notes: apiCallLog.notes,
        nextFollowUp: apiCallLog.next_follow_up,
        duration: apiCallLog.duration,
      };

      const updatedLead = {
        ...lead,
        callLogs: [...(lead.callLogs || []), newCallLog],
        contacted: true, // Mark as contacted when a call is logged
      };

      // Update lead contacted status via API
      const response = await apiCall(`/api/leads/${leadId}`, {
        method: "PUT",
        body: JSON.stringify({
          contacted: true
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to update lead contacted status: ${response.status}`);
      }

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to add call log:", error);
      setError("Failed to add call log");
    }
  };

  // Update call log function
  const updateCallLog = async (leadId: string, callLogId: string, updateData: Partial<Pick<CallLog, "outcome" | "notes">>) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    try {
      // Update call log via API
      const apiCallLog = await updateCallLogAPI(callLogId, {
        outcome: updateData.outcome,
        notes: updateData.notes,
        nextFollowUp: updateData.outcome ? calculateNextFollowUp(updateData.outcome) : undefined,
      });

      // Transform API response to frontend format
      const updatedCallLog: CallLog = {
        id: apiCallLog.id,
        leadId,
        callDate: new Date(apiCallLog.created_at),
        outcome: apiCallLog.outcome,
        notes: apiCallLog.notes,
        nextFollowUp: apiCallLog.next_follow_up,
        duration: apiCallLog.duration,
      };

      const updatedLead = {
        ...lead,
        callLogs:
          lead.callLogs?.map((log) =>
            log.id === callLogId ? updatedCallLog : log
          ) || [],
      };

      // Update local state on success
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
    } catch (error) {
      console.error("Failed to update call log:", error);
      setError("Failed to update call log");
    }
  };

  const removeCallLog = async (leadId: string, callLogId: string) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;
    try {
      await deleteCallLogAPI(callLogId);
      const updatedLead = {
        ...lead,
        callLogs: (lead.callLogs || []).filter((log) => log.id !== callLogId),
      };
      setAllLeads((prevLeads) => prevLeads.map((l) => (l.id === leadId ? updatedLead : l)));
    } catch (error) {
      console.error("Failed to delete call log:", error);
      setError("Failed to delete call log");
      throw error;
    }
  };

  // Helper function to calculate next follow-up date based on outcome
  const calculateNextFollowUp = (outcome: CallLog["outcome"]): string => {
    const now = new Date();
    const nextDate = new Date(now);

    switch (outcome) {
      case "follow_up_1_day":
        nextDate.setDate(now.getDate() + 1);
        return nextDate.toISOString();
      case "follow_up_72_hours":
        nextDate.setDate(now.getDate() + 3);
        return nextDate.toISOString();
      case "follow_up_next_week":
        nextDate.setDate(now.getDate() + 7);
        return nextDate.toISOString();
      case "follow_up_next_month":
        nextDate.setMonth(now.getMonth() + 1);
        return nextDate.toISOString();
      case "follow_up_3_months":
        nextDate.setMonth(now.getMonth() + 3);
        return nextDate.toISOString();
      default:
        return "";
    }
  };

  // Create a new lead
  const createLead = async (leadData: Partial<Lead>) => {
    try {
      setError(null);
      const newLead = await createLeadAPI(leadData);
      // Refresh all leads to get the updated list from server
      await refreshLeads();
      return newLead;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create lead");
      throw error;
    }
  };

  // Refresh leads from API
  const refreshLeads = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load call logs from localStorage
      const savedCallLogs = localStorage.getItem("callLogs");
      const callLogsMap = savedCallLogs ? JSON.parse(savedCallLogs) : {};

      const apiLeads = await fetchLeadsAPI();

      // Merge with saved call logs
      const leadsWithCallLogs = apiLeads.map((lead) => ({
        ...lead,
        callLogs:
          callLogsMap[lead.id]?.map((log: any) => ({
            ...log,
            callDate: new Date(log.callDate),
            nextFollowUp: log.nextFollowUp ? new Date(log.nextFollowUp) : undefined,
          })) || [],
      }));

      setAllLeads(leadsWithCallLogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to refresh leads");
    } finally {
      setLoading(false);
    }
  };

  // Delete a lead
  const deleteLead = async (leadId: string) => {
    try {
      setError(null);
      await deleteLeadAPI(leadId);
      setAllLeads((prevLeads) => prevLeads.filter((lead) => lead.id !== leadId));
      return true;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to delete lead");
      throw error;
    }
  };

  // Update a lead
  const updateLead = async (leadId: string, updateData: Partial<Lead>) => {
    const lead = allLeads.find((l) => l.id === leadId);
    if (!lead) return;

    const updatedLead = { ...lead, ...updateData };

    try {
      setError(null);
      await updateLeadAPI(updatedLead);
      setAllLeads((prevLeads) => prevLeads.map((lead) => (lead.id === leadId ? updatedLead : lead)));
      return updatedLead;
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to update lead");
      throw error;
    }
  };

  // Clear cache and reload from API
  const clearCache = async () => {
    localStorage.removeItem(`lastCalledIndex_${currentArea}`);
    localStorage.removeItem("callLogs");

    try {
      setLoading(true);
      setError(null);
      const apiLeads = await fetchLeadsAPI();
      setAllLeads(apiLeads);
      setLastCalledIndex(null);
      setFilters(initialFilters);
      setSortField("reviews");
      setSortDirection("desc");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reload leads");
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting by toggling field and direction
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    // First filter by showContactedOnly
    let result = leads.filter((lead) => {
      if (filters.showContactedOnly && !lead.contacted) {
        return false;
      }
      return true;
    });

    // Then sort if a sort field is selected
    if (sortField) {
      result = [...result].sort((a, b) => {
        let valueA: string | number = "";
        let valueB: string | number = "";

        // Get values based on sort field
        if (sortField === "name") {
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
        } else if (sortField === "reviews") {
          // Use absolute values for reviews to handle negative values
          valueA = Math.abs(a.reviews);
          valueB = Math.abs(b.reviews);
        } else if (sortField === "phone") {
          valueA = a.phone;
          valueB = b.phone;
        } else if (sortField === "website") {
          valueA = a.website.toLowerCase();
          valueB = b.website.toLowerCase();
        }

        // For strings, use localeCompare
        if (typeof valueA === "string" && typeof valueB === "string") {
          return sortDirection === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
        }

        // For numbers
        if (sortDirection === "asc") {
          return (valueA as number) - (valueB as number);
        } else {
          return (valueB as number) - (valueA as number);
        }
      });
    }

    return result;
  }, [leads, filters, sortField, sortDirection]);

  return (
    <LeadContext.Provider
      value={{
        leads,
        setLeads: () => { }, // Not used anymore, data comes from API
        lastCalledIndex,
        setLastCalledIndex,
        toggleContactStatus,
        clearCache,
        filters,
        setFilters,
        filteredLeads,
        areas,
        currentArea,
        setCurrentArea,
        sortField,
        setSortField,
        sortDirection,
        setSortDirection,
        handleSort,
        addCallLog,
        updateCallLog,
        deleteCallLog: removeCallLog,
        loading,
        error,
        // New CRUD functions
        createLead,
        updateLead,
        deleteLead,
        refreshLeads,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
};

export const useLeadContext = () => {
  const context = useContext(LeadContext);
  if (context === undefined) {
    throw new Error("useLeadContext must be used within a LeadProvider");
  }
  return context;
};
