import React, { forwardRef, useState } from "react";
import { ExternalLink, Phone, Check, MessageSquare, Calendar, X, ChevronDown, ChevronUp, Clock, AlertTriangle, Edit, MoreHorizontal, Trash2, Pencil, MapPin, BarChart3, UserPlus, Map, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import StarRating from "./StarRating";
import { Lead, CallLog } from "../types";
import { useLeadContext } from "../contexts/LeadContext";
import { useClientContext } from "../contexts/ClientContext";
import LeadFormDialog from "./LeadFormDialog";
// import { useAuth } from "../contexts/AuthContext";

interface LeadItemProps {
  lead: Lead;
  index: number;
}

const LeadItem = forwardRef<HTMLTableRowElement, LeadItemProps>(({ lead, index }, ref) => {
  const { setLastCalledIndex, toggleContactStatus, addCallLog, updateCallLog, deleteLead, refreshLeads, deleteCallLog } = useLeadContext();
  const { createClient } = useClientContext();
  const navigate = useNavigate();
  const [showCallDialog, setShowCallDialog] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showAllLogs, setShowAllLogs] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLogId, setEditingLogId] = useState<string | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [editOutcome, setEditOutcome] = useState<CallLog["outcome"]>("follow_up_1_day");
  const [callOutcome, setCallOutcome] = useState<CallLog["outcome"]>("follow_up_1_day");
  const [callNotes, setCallNotes] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [convertingToClient, setConvertingToClient] = useState(false);

  // Function to open Google Maps search for GMB
  const openGoogleMapsSearch = (domain: string) => {
    // Strip https:// or http:// and .com, .net, etc.
    const stripped = domain
      .replace(/^https?:\/\//, '') // remove https://
      .replace(/^www\./, '') // optional: remove www.
      .split('.')[0]; // get just 'precisiongvl'

    const searchTerm = stripped;
    const mapsSearchUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchTerm)}`;
    window.open(mapsSearchUrl, '_blank');
  };

  const handleCallLogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLastCalledIndex(index);
    setShowCallDialog(true);
  };

  const handleRowClick = () => {
    toggleContactStatus(lead.id);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowEditDialog(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${lead.name}"?`)) {
      setDeleting(true);
      try {
        await deleteLead(lead.id);
      } catch (error) {
        console.error("Failed to delete lead:", error);
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleViewAnalytics = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lead.website) {
      // Extract domain from website URL
      let domain = lead.website;
      try {
        const url = new URL(lead.website.startsWith("http") ? lead.website : `https://${lead.website}`);
        domain = url.hostname.replace("www.", "");
      } catch {
        // If URL parsing fails, use the website string as is
        domain = lead.website
          .replace(/^https?:\/\//, "")
          .replace("www.", "")
          .split("/")[0];
      }

      navigate("/analytics", {
        state: {
          domain: domain,
        },
      });
    }
  };

  const handleConvertToClient = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (window.confirm(`Convert "${lead.name}" to a client?`)) {
      setConvertingToClient(true);
      try {
        // Map lead data to client format
        const clientData = {
          id: lead?.id,
          name: lead.name,
          email: lead.email || "",
          phone: lead.phone,
          city: lead.city === "Unknown" ? undefined : lead.city || undefined,
          reviews: lead.reviews || 0,
          website: lead.website || undefined,
          contacted: lead.contacted,
          follow_up_at: lead.follow_up_at || undefined,
          notes: lead.notes || undefined,
        };

        await createClient(clientData);
        alert(`Successfully converted "${lead.name}" to a client!`);

        // Refresh clients data in the background
        // This ensures the clients tab shows updated data when navigated to
        setTimeout(() => {
          // Try to refresh if user switches to clients tab
          const event = new CustomEvent("refreshClients");
          window.dispatchEvent(event);
        }, 500);
      } catch (error) {
        console.error("Failed to convert lead to client:", error);
        alert("Failed to convert lead to client. Please try again.");
      } finally {
        setConvertingToClient(false);
      }
    }
  };
  const handleSubmitCallLog = async () => {
    if (callNotes.trim()) {
      await addCallLog(lead.id, {
        outcome: callOutcome,
        notes: callNotes.trim(),
        nextFollowUp: null,
      });

      // Optionally refresh leads; local state already updated by context
      try {
        await refreshLeads();
      } catch { }

      setCallNotes("");
      setCallOutcome("follow_up_1_day");
      setShowCallDialog(false);
    }
  };

  const handleCloseDialog = () => {
    setShowCallDialog(false);
    setCallNotes("");
    setCallOutcome("follow_up_1_day");
  };

  const handleEditLog = (log: CallLog) => {
    setEditingLogId(log.id);
    setEditNotes(log.notes);
    setEditOutcome(log.outcome);
  };

  const handleDeleteLog = async () => {
    if (editingLogId) {
      if (!window.confirm('Delete this call log?')) return;
      try {
        await deleteCallLog?.(lead.id, editingLogId);
        await refreshLeads();
      } catch (e) {
        // ignore
      } finally {
        setEditingLogId(null);
        setEditNotes("");
        setEditOutcome("follow_up_1_day");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingLogId && editNotes.trim()) {
      try {
        await updateCallLog(lead.id, editingLogId, {
          outcome: editOutcome,
          notes: editNotes.trim(),
        });
        await refreshLeads();
      } catch (e) {
        // ignore
      } finally {
        setEditingLogId(null);
        setEditNotes("");
        setEditOutcome("follow_up_1_day");
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingLogId(null);
    setEditNotes("");
    setEditOutcome("follow_up_1_day");
  };

  const getOutcomeLabel = (outcome: CallLog["outcome"]) => {
    const labels = {
      follow_up_1_day: "Follow up in 1 day",
      follow_up_72_hours: "Follow up in 72 hours",
      follow_up_next_week: "Follow up next week",
      follow_up_next_month: "Follow up next month",
      follow_up_3_months: "Follow up in 3 months",
    };
    return labels[outcome] || outcome;
  };

  const getOutcomeColor = (outcome: CallLog["outcome"]) => {
    switch (outcome) {
      case "follow_up_1_day":
        return "text-red-600 bg-red-50";
      case "follow_up_72_hours":
        return "text-orange-600 bg-orange-50";
      case "follow_up_next_week":
        return "text-yellow-600 bg-yellow-50";
      case "follow_up_next_month":
        return "text-blue-600 bg-blue-50";
      case "follow_up_3_months":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: Lead["status"]) => {
    switch (status) {
      case "New":
        return "bg-blue-100 text-blue-800";
      case "Contacted":
        return "bg-yellow-100 text-yellow-800";
      case "Qualified":
        return "bg-green-100 text-green-800";
      case "Converted":
        return "bg-purple-100 text-purple-800";
      case "Lost":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusAccentBorder = (status: Lead["status"]) => {
    switch (status) {
      case "New":
        return "border-blue-300";
      case "Contacted":
        return "border-yellow-300";
      case "Qualified":
        return "border-green-300";
      case "Converted":
        return "border-purple-300";
      case "Lost":
        return "border-red-300";
      default:
        return "border-gray-200";
    }
  };

  const getNextFollowUp = () => {
    if (!lead.callLogs || lead.callLogs.length === 0) return null;

    const latestLog = lead.callLogs.sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime())[0];

    return latestLog.nextFollowUp ? new Date(latestLog.nextFollowUp) : null;
  };

  const nextFollowUp = getNextFollowUp();
  const isFollowUpDue = nextFollowUp && nextFollowUp <= new Date();

  const sortedLogs = lead.callLogs ? [...lead.callLogs].sort((a, b) => new Date(b.callDate).getTime() - new Date(a.callDate).getTime()) : [];

  const displayedLogs = showAllLogs ? sortedLogs : sortedLogs.slice(0, 3);

  // Get latest call log note for preview
  const latestNote = sortedLogs.length > 0 ? sortedLogs[0].notes : "";

  // Check if lead has a valid phone number
  const hasPhoneNumber = lead.phone && lead.phone.trim() !== "" && lead.phone !== "tel:";

  // Mobile card layout
  const MobileCard = () => (
    <div className={`cursor-pointer transition-colors ${lead.contacted ? "bg-green-50/50" : "bg-white"} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""} ${deleting ? "opacity-50" : ""}`} onClick={handleRowClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>{lead.contacted && <Check className="w-3 h-3 text-white" />}</div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate flex items-center gap-2">
              {lead.name}
              {isFollowUpDue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
              <StarRating reviews={lead.reviews} />
              {lead.status && <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>{lead.status}</span>}
              {lead.city && lead.city !== "Unknown" && (
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <MapPin className="w-3 h-3" />
                  <span>{lead.city}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1 ml-2">
          {lead.website && (
            <Tooltip title="View Analytics">
              <button onClick={handleViewAnalytics} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                <BarChart3 className="w-3 h-3" />
              </button>
            </Tooltip>
          )}
          {lead.website && (
            <Tooltip title="Click to see Google GMB">
              <button onClick={() => openGoogleMapsSearch(lead.website)} className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                <Map className="w-3 h-3" />
              </button>
            </Tooltip>
          )}
          <Tooltip title="Convert to Client">
            <button onClick={handleConvertToClient} disabled={convertingToClient} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50">
              <UserPlus className="w-3 h-3" />
            </button>
          </Tooltip>

          <Tooltip title="Edit Lead">
            <button onClick={handleEditClick} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Pencil className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip title="Delete Lead">
            <button onClick={handleDeleteClick} disabled={deleting} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50">
              <Trash2 className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      </div>

      <div className="space-y-2">
        {hasPhoneNumber && (
          <div className="flex items-center justify-between">
            <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm flex-1\" onClick={(e) => e.stopPropagation()}>
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="border-b border-blue-300 hover:border-blue-600 truncate">{lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>
            </a>
            <Tooltip title="Log Call">
              <button onClick={handleCallLogClick} className="ml-2 p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                <Edit className="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        )}

        {lead.website && (
          <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm" onClick={(e) => e.stopPropagation()}>
            <ExternalLink className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="border-b border-blue-300 hover:border-blue-600 truncate">Visit Website</span>
          </a>
        )}

        {/* Latest Notes Preview */}
        {(latestNote || lead.notes) && (
          <div className="text-sm bg-gray-50 p-2 rounded">
            <p className="text-gray-700 text-xs line-clamp-2">{latestNote || lead.notes}</p>
          </div>
        )}

        {lead.callLogs && lead.callLogs.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowCallHistory(!showCallHistory);
            }}
            className="flex items-center text-gray-600 font-medium hover:text-gray-800 transition-colors text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {lead.callLogs.length} call{lead.callLogs.length > 1 ? "s" : ""}
            </span>
            {showCallHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
          </button>
        )}

        {isFollowUpDue && (
          <div className="flex items-center text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
            <Clock className="w-3 h-3 mr-1" />
            Follow-up due
          </div>
        )}
      </div>

      {/* Call History */}
      {showCallHistory && lead.callLogs && lead.callLogs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
          <div className="space-y-2">
            {displayedLogs.map((log) => (
              <div key={log.id} className="text-xs bg-gray-50 p-2 rounded">
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(log.outcome)}`}>{getOutcomeLabel(log.outcome)}</span>
                    <Tooltip title="Edit this log">
                      <button onClick={() => handleEditLog(log)} className="text-gray-400 hover:text-blue-600 transition-colors">
                        <Edit className="w-3 h-3" />
                      </button>
                    </Tooltip>
                  </div>
                  <span className="text-gray-500">{new Date(log.callDate).toLocaleDateString()}</span>
                </div>
                {editingLogId === log.id ? (
                  <div className="space-y-2 mt-2">
                    <select value={editOutcome} onChange={(e) => setEditOutcome(e.target.value as CallLog["outcome"])} className="w-full p-1 text-xs border border-gray-300 rounded">
                      <option value="follow_up_1_day">Follow up in 1 day</option>
                      <option value="follow_up_72_hours">Follow up in 72 hours</option>
                      <option value="follow_up_next_week">Follow up next week</option>
                      <option value="follow_up_next_month">Follow up next month</option>
                      <option value="follow_up_3_months">Follow up in 3 months</option>
                    </select>
                    <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full p-1 text-xs border border-gray-300 rounded resize-none" rows={3} style={{ direction: "ltr" }} dir="ltr" />
                    <div className="flex gap-1">
                      <button onClick={handleSaveEdit} className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                        <Save className="w-3 h-3" />
                        Save
                      </button>
                      <button onClick={handleDeleteLog} className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700">
                        <Trash2 className="w-3 h-3" />
                        Delete
                      </button>
                      <button onClick={handleCancelEdit} className="flex items-center gap-1 px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400">
                        <X className="w-3 h-3" />
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  log.notes && <p className="text-gray-700 mt-1">{log.notes}</p>
                )}
              </div>
            ))}

            {/* Show More/Less Button */}
            {sortedLogs.length > 3 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAllLogs(!showAllLogs);
                }}
                className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-xs mt-2"
              >
                <MoreHorizontal className="w-3 h-3 mr-1" />
                {showAllLogs ? `Show Less` : `Show All ${sortedLogs.length} Logs`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );



  return (
    <>
      {/* Mobile Card View */}
      <div className="block sm:hidden">
        <MobileCard />
      </div>

      {/* Desktop Table Row (compact) */}
      <tr ref={ref} className={`hidden sm:table-row border-b transition-colors cursor-pointer hover:bg-blue-50 even:bg-gray-50 ${lead.contacted ? "bg-green-50/50" : ""} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""} ${deleting ? "opacity-50" : ""}`} onClick={handleRowClick}>
        {/* Business */}
        <td className="p-3 lg:p-4">
          <div className="flex items-start gap-2">
            <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>{lead.contacted && <Check className="w-3 h-3 text-white" />}</div>
            <div>
              <div className="font-medium text-sm flex items-center gap-2">
                {lead.name}
                {isFollowUpDue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
              </div>
              {lead.status && <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getStatusColor(lead.status)}`}>{lead.status}</span>}
              {lead.city && lead.city !== "Unknown" && (
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                  <MapPin className="w-3 h-3" />
                  <span>{lead.city}</span>
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Reviews (hide on small desktop widths via CSS in header) */}
        <td className="hidden md:table-cell p-3 lg:p-4">
          <div className="mt-1">
            <StarRating reviews={lead.reviews} />
          </div>
        </td>

        {/* Phone */}
        <td className="p-3 lg:p-4">
          {hasPhoneNumber ? (
            <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors group text-sm" onClick={(e) => e.stopPropagation()}>
              <Phone className="w-4 h-4 mr-1.5 group-hover:animate-pulse" />
              <span className="border-b border-blue-300 group-hover:border-blue-600">{lead.phone.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")}</span>
            </a>
          ) : (
            <span className="text-gray-400 text-sm">No phone</span>
          )}
        </td>

        {/* Website (hidden at small desktop widths by header visibility) */}
        <td className="hidden lg:table-cell p-3 lg:p-4 pt:5">
          {lead.website ? (
            <a href={lead.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm" onClick={(e) => e.stopPropagation()}>
              <ExternalLink className="w-4 h-4 mr-1.5" />
              <span className="border-b border-blue-300 hover:border-blue-600">Visit Website</span>
            </a>
          ) : (
            <span className="text-gray-400 text-sm">No website</span>
          )}
        </td>
      </tr>

      {/* Under-row: Call Log, Call History, Actions */}
      <tr className="hidden sm:table-row">
        <td colSpan={4} className="p-3 pt-0 lg:p-4 lg:pt-0">
          <div className={`flex flex-col gap-3 rounded-md bg-white ring-1 shadow-sm ring-gray-200 border-l-4 ${getStatusAccentBorder(lead.status)} px-3 py-3`}>
            {/* Actions row */}
            <div className="flex items-center gap-1 flex-wrap">
              {lead.website && (
                <Tooltip title="View Analytics">
                  <button onClick={handleViewAnalytics} className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
              {lead.website && (
                <Tooltip title="Click to see Google GMB">
                  <button onClick={() => openGoogleMapsSearch(lead.website)} className="p-1 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors">
                    <Map className="w-4 h-4" />
                  </button>
                </Tooltip>
              )}
              <Tooltip title="Convert to Client">
                <button onClick={handleConvertToClient} disabled={convertingToClient} className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors disabled:opacity-50">
                  <UserPlus className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip title="Edit Lead">
                <button onClick={handleEditClick} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
              </Tooltip>
              <Tooltip title="Delete Lead">
                <button onClick={handleDeleteClick} disabled={deleting} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50">
                  <Trash2 className="w-4 h-4" />
                </button>
              </Tooltip>

              {/* Call log quick action */}
              {hasPhoneNumber && (
                <button onClick={handleCallLogClick} className="ml-2 flex items-center text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors text-sm px-2 py-1 rounded" title="Log Call">
                  <Edit className="w-4 h-4 mr-1" />
                  <span>Log Call</span>
                </button>
              )}
            </div>

            {/* Call History toggle + note preview */}
            <div className="flex items-center gap-2">
              {lead.callLogs && lead.callLogs.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCallHistory(!showCallHistory);
                  }}
                  className="flex items-center text-gray-600 hover:text-gray-800 transition-colors text-sm"
                >
                  <MessageSquare className="w-4 h-4 mr-1" />
                  <span>{lead.callLogs.length} {lead.callLogs.length > 1 ? 'calls' : 'call'}</span>
                  {showCallHistory ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </button>
              )}
              {(latestNote || lead.notes) && <div className="text-xs text-gray-600 max-w-[18rem] lg:max-w-[32rem] truncate">{latestNote || lead.notes}</div>}
              {isFollowUpDue && (
                <div className="flex items-center text-orange-600 text-xs bg-orange-50 px-2 py-1 rounded">
                  <Clock className="w-3 h-3 mr-1" />
                  Due
                </div>
              )}
            </div>

            {/* Expanded Call History */}
            {showCallHistory && lead.callLogs && lead.callLogs.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-sm text-gray-700">Call History</h4>
                  {sortedLogs.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAllLogs(!showAllLogs);
                      }}
                      className="flex items-center text-blue-600 hover:text-blue-800 transition-colors text-sm"
                    >
                      <MoreHorizontal className="w-4 h-4 mr-1" />
                      {showAllLogs ? `Show Less` : `Show All ${sortedLogs.length} Logs`}
                    </button>
                  )}
                </div>
                {displayedLogs.map((log) => (
                  <div key={log.id} className="flex justify-between items-start bg-white p-3 rounded border text-sm">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getOutcomeColor(log.outcome)}`}>{getOutcomeLabel(log.outcome)}</span>
                        <span className="text-gray-500 text-xs">{new Date(log.callDate).toLocaleString()}</span>
                        <Tooltip title="Edit this log">
                          <button onClick={() => handleEditLog(log)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Tooltip>
                      </div>
                      {editingLogId === log.id ? (
                        <div className="space-y-2 mt-2">
                          <select value={editOutcome} onChange={(e) => setEditOutcome(e.target.value as CallLog["outcome"])} className="w-full p-2 border border-gray-300 rounded">
                            <option value="follow_up_1_day">Follow up in 1 day</option>
                            <option value="follow_up_72_hours">Follow up in 72 hours</option>
                            <option value="follow_up_next_week">Follow up next week</option>
                            <option value="follow_up_next_month">Follow up next month</option>
                            <option value="follow_up_3_months">Follow up in 3 months</option>
                          </select>
                          <textarea value={editNotes} onChange={(e) => setEditNotes(e.target.value)} className="w-full p-2 border border-gray-300 rounded resize-none" rows={3} style={{ direction: "ltr" }} dir="ltr" />
                          <div className="flex gap-2">
                            <button onClick={handleSaveEdit} className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700">
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                            <button onClick={handleDeleteLog} className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                            <button onClick={handleCancelEdit} className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400">
                              <X className="w-4 h-4" />
                              Close
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {log.notes && <p className="text-gray-700 mt-1">{log.notes}</p>}
                          {log.nextFollowUp && (
                            <div className="flex items-center text-blue-600 text-xs mt-1">
                              <Calendar className="w-3 h-3 mr-1" />
                              Follow up: {new Date(log.nextFollowUp).toLocaleString()}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </td>
      </tr>

      {/* Spacer row for visual separation */}
      <tr className="hidden sm:table-row">
        <td colSpan={4} className="py-1"></td>
      </tr>

      {/* Call Logging Dialog */}
      {showCallDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleCloseDialog}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Log Call - {lead.name}</h3>
              <button onClick={handleCloseDialog} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Schedule</label>
                <select value={callOutcome} onChange={(e) => setCallOutcome(e.target.value as CallLog["outcome"])} className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                  <option value="follow_up_1_day">Follow up in 1 day</option>
                  <option value="follow_up_72_hours">Follow up in 72 hours</option>
                  <option value="follow_up_next_week">Follow up next week</option>
                  <option value="follow_up_next_month">Follow up next month</option>
                  <option value="follow_up_3_months">Follow up in 3 months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call Notes *</label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Enter notes about the call..."
                  rows={4}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                  style={{ direction: "ltr" }}
                  dir="ltr"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={handleCloseDialog} className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleSubmitCallLog} className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" disabled={!callNotes.trim()}>
                Save Notes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lead Dialog */}
      <LeadFormDialog open={showEditDialog} onClose={() => setShowEditDialog(false)} onSuccess={() => setShowEditDialog(false)} lead={lead} />
    </>
  );
});

LeadItem.displayName = "LeadItem";

export default LeadItem;
