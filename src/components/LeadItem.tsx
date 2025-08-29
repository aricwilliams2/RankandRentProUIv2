import React, { forwardRef, useState } from "react";
import { ExternalLink, Phone, Check, MessageSquare, Calendar, X, ChevronDown, ChevronUp, Clock, AlertTriangle, Edit, MoreHorizontal, Trash2, Pencil, MapPin, BarChart3, UserPlus, Map, Save, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tooltip } from "@mui/material";
import { Lead, CallLog } from "../types";
import { useLeadContext } from "../contexts/LeadContext";
import { useClientContext } from "../contexts/ClientContext";
import { useAuth } from "../contexts/AuthContext";
import LeadFormDialog from "./LeadFormDialog";

interface LeadItemProps {
  lead: Lead;
  index: number;
  isSelected?: boolean;
  onSelectionChange?: (leadId: string) => void;
}

const LeadItem = forwardRef<HTMLTableRowElement, LeadItemProps>(({ lead, index, isSelected, onSelectionChange }, ref) => {
  const { setLastCalledIndex, toggleContactStatus, addCallLog, updateCallLog, deleteLead, refreshLeads, deleteCallLog } = useLeadContext();
  const { createClient } = useClientContext();
  const { user } = useAuth();
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
  const [savingCallLog, setSavingCallLog] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingLog, setDeletingLog] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTo, setEmailTo] = useState("");
  const [senderName, setSenderName] = useState("");
  const [originalSubject, setOriginalSubject] = useState("");
  const [originalBody, setOriginalBody] = useState("");

  // Email templates
  const emailTemplates = [
    {
      id: 1,
      name: "The Missed Calls",
      subject: "Hey my name is {{name}} and I noticed missed calls going to competitors",
      body: `Hey, my name is {{name}}.

Every day, people in your city are searching Google for the exact service you provide… but they're calling your competitor instead.

It's not your fault. Most local businesses don't know how Google decides who shows up at the top — they assume it's about who's been around longest or who spends the most money. The truth? With the right SEO system, you can leapfrog over companies that have been there for decades.

To show you what I mean, I recorded a short video that compares your site to your competitors and shows exactly how many calls are slipping through.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 2,
      name: "The Marketing Money Pit",
      subject: "Hey my name is {{name}} and I help stop wasted ad spend",
      body: `Hey, my name is {{name}}.

Are you tired of spending money on ads that disappear the second you stop paying?

Most small businesses get stuck believing Facebook ads or mailers are the only option. But the moment you stop, the leads dry up. SEO is different — it builds an asset you own. I've seen clients get calls month after month from rankings we built once. That's the power of owning your spot on Google.

I made you a free video that breaks down your site's rankings, where your competitors are ahead, and how much that gap is costing you.

👉 Here's the video: [Video Link]

— {{name}}`
    },
    {
      id: 3,
      name: "The Empty Calendar",
      subject: "Hey my name is {{name}} and I help fill calendars with Google leads",
      body: `Hey, my name is {{name}}.

If your calendar isn't full, it's because your website is invisible.

Think about it: when someone needs a plumber, roofer, or landscaper — they don't flip through a phonebook anymore. They Google. And if you're not on page one, you don't exist. It's not about being the best in town, it's about being the best seen. That's what I do: I make sure you're found first, so your phone rings more than theirs.

I recorded a quick video that shows your current visibility, how many people are searching for your services this month, and how many of those calls you're missing.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 4,
      name: "The Google Rigged Game",
      subject: "Hey my name is {{name}} and I help small businesses beat big chains",
      body: `Hey, my name is {{name}}.

It feels like Google is rigged against small businesses, doesn't it?

Big chains and franchises dominate the search results, leaving local owners frustrated. But the truth is, Google actually favors small businesses that are optimized the right way. I've helped mom-and-pop shops outrank national chains with smart SEO strategies — because Google values relevance and authority more than size. That's your advantage.

I put together a short video to prove it. It shows one keyword in your market where we can outrank the big guys and what that means in new customers.

👉 Here's the video: [Video Link]

— {{name}}`
    },
    {
      id: 5,
      name: "The Cost of Waiting",
      subject: "Hey my name is {{name}} and waiting is costing customers",
      body: `Hey, my name is {{name}}.

Every month you wait to do SEO is another month of lost customers.

Here's the reality: your competitors are building momentum right now. SEO compounds — the longer they work on it, the further ahead they get. But the opposite is also true: start today, and in 3–6 months you'll be ahead of them, taking the calls they're getting now. I've seen local businesses transform in less than a year because they chose not to wait.

To make this real, I recorded a free video that shows exactly what your competitors are capturing right now, and how much money that's worth compared to your site's position.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 6,
      name: "The Reputation Gap",
      subject: "Hey my name is {{name}} and I help local businesses control their reputation online",
      body: `Hey, my name is {{name}}.

When people search your business name, they don't just see you — they see reviews, competitors, and sometimes even bad info. If your competitors show up with more stars or better placement, they get the call even if you're the better company.

The good news? With SEO, we can push the right pages and reviews to the top, and make sure your best reputation is the one people see first.

I recorded a quick video that shows exactly how your business appears compared to others nearby, and how much credibility (and money) that's costing you today.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 7,
      name: "The Mobile Search Rush",
      subject: "Hey my name is {{name}} and I help businesses win on mobile search",
      body: `Hey, my name is {{name}}.

Most local searches happen on a phone, and people usually pick one of the first three results without scrolling. If you're not in those top spots, you're missing nearly 70% of potential calls.

I've helped small businesses optimize for local maps and mobile results so that when someone searches "near me," they show up first.

To show you where you stand right now, I created a free video that compares your mobile visibility to competitors in your area.

👉 Here's the video: [Video Link]

— {{name}}`
    },
    {
      id: 8,
      name: "The Seasonal Spike",
      subject: "Hey my name is {{name}} and I help businesses capture seasonal demand",
      body: `Hey, my name is {{name}}.

Some services get huge seasonal spikes — whether it's landscaping in the spring, HVAC in the summer, or roof repairs after storms. If you're not ranking when that surge happens, those customers go straight to someone else.

SEO ensures you're already in position before the rush hits, so you can capture the calls when demand is hottest.

I put together a short video that shows how many searches for your services are happening each month and where those calls are going today.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 9,
      name: "The Local Map Pack",
      subject: "Hey my name is {{name}} and I help businesses win the Google Maps box",
      body: `Hey, my name is {{name}}.

When someone searches on Google, the first thing they see is the Maps "3-pack." Those three businesses get the majority of calls — and everyone else fights over scraps. If you're not in that pack, you're losing business every single day.

With local SEO, we can put you in that pack and keep you there.

I recorded a quick video that shows your current map ranking and how many leads you're missing compared to competitors already in the pack.

👉 Here's the video: [Video Link]

— {{name}}`
    },
    {
      id: 10,
      name: "The Competitor Copycat",
      subject: "Hey my name is {{name}} and I can show you your competitor's SEO playbook",
      body: `Hey, my name is {{name}}.

Your competitors aren't beating you by accident — they're using specific SEO strategies to show up first and take the calls. The good news? Their strategy is visible, and I can show you exactly what they're doing.

Once you see it, you'll realize how easy it is to outsmart them with the right moves.

I created a short video that breaks down your competitor's SEO setup compared to yours, and shows how much business they're pulling in because of it.

👉 Here's the link: [Video Link]

— {{name}}`
    },
    {
      id: 11,
      name: "The Trust Factor",
      subject: "Hey my name is {{name}} and higher rankings build instant trust",
      body: `Hey, my name is {{name}}.

Most people trust the businesses that show up at the top of Google. Even if they don't know you yet, they assume you're the best because you're ranked first. If you're buried down the list, it doesn't matter how good you are — they won't call.

SEO earns you that trust automatically, because people believe Google is showing them the most reliable choice.

I made a quick video showing where you currently appear compared to competitors, and how much credibility (and business) they're stealing by being above you.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 12,
      name: "The \"Near Me\" Effect",
      subject: "Hey my name is {{name}} and I help businesses show up for 'near me' searches",
      body: `Hey, my name is {{name}}.

Every day, people search things like "plumber near me" or "best roofer near me." The businesses that show up there get the call instantly. If you're not showing up in those searches, those local customers never even know you exist.

Local SEO makes sure you're in those results — right when people need you most.

I recorded a free video that shows how you show up for "near me" searches in your area, and how many of those calls are going to your competitors.

👉 Here's the video: [Video Link]

— {{name}}`
    },
    {
      id: 13,
      name: "The Future-Proofing Play",
      subject: "Hey my name is {{name}} and SEO keeps your leads coming long-term",
      body: `Hey, my name is {{name}}.

Ads stop working the second you stop paying. But SEO is different — once you rank, it keeps bringing calls day after day, month after month. It's like owning real estate on Google instead of renting ads.

I've seen businesses build steady lead pipelines that continue even when they pause other marketing. That's the power of future-proofing with SEO.

To show you the difference, I created a video comparing your site's visibility with competitors who've been investing in SEO — and what that means for long-term calls.

👉 Watch it here: [Video Link]

— {{name}}`
    },
    {
      id: 14,
      name: "The Local Loyalty Loop",
      subject: "Hey my name is {{name}} and I help businesses win repeat local customers",
      body: `Hey, my name is {{name}}.

SEO isn't just about getting new customers — it's about staying visible so past customers remember you, too. When they search again, they see you right away and call back. If your competitor shows up first, even repeat customers can slip away.

Ranking high on Google builds that loyalty loop, keeping you front of mind.

I made a short video that shows how visible you are right now compared to competitors — and how many customers might be slipping through because they saw another name first.

👉 Watch the video here: [Video Link]

— {{name}}`
    },
    {
      id: 15,
      name: "The Voice Search Shift",
      subject: "Hey my name is {{name}} and I help businesses show up on Alexa & Siri",
      body: `Hey, my name is {{name}}.

More and more people are searching by voice — asking Siri, Alexa, or Google Assistant for the nearest business. And guess what? Those devices only recommend the top-ranked results.

If you're not optimized for voice search, you're missing out on a growing number of "near me" calls.

I recorded a quick video that shows how your business shows up (or doesn't) in voice-style searches, and how competitors are capturing those leads instead.

👉 Watch it here: [Video Link]

— {{name}}`
    }
  ];

  // Function to replace {{name}} placeholder with actual name
  const replaceNamePlaceholder = (text: string, name: string) => {
    return text.replace(/\{\{name\}\}/g, name);
  };

  // Function to handle template selection
  const handleTemplateSelect = (templateId: number) => {
    const template = emailTemplates.find(t => t.id === templateId);
    if (template && senderName) {
      setOriginalSubject(template.subject);
      setOriginalBody(template.body);
      setEmailSubject(replaceNamePlaceholder(template.subject, senderName));
      setEmailBody(replaceNamePlaceholder(template.body, senderName));
    }
  };

  // Function to handle sender name change with real-time updates
  const handleSenderNameChange = (newName: string) => {
    setSenderName(newName);

    // Update subject and body with new name from original template content
    if (originalSubject) {
      setEmailSubject(replaceNamePlaceholder(originalSubject, newName));
    }
    if (originalBody) {
      setEmailBody(replaceNamePlaceholder(originalBody, newName));
    }
  };

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

  // Function to handle email compose with Gmail
  const handleEmailCompose = () => {
    const toEmail = emailTo.trim() || lead.email;
    if (toEmail) {
      const subject = emailSubject ? `&su=${encodeURIComponent(emailSubject)}` : "";
      const body = emailBody ? `&body=${encodeURIComponent(emailBody)}` : "";
      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(toEmail)}${subject}${body}`;
      window.open(url, "_blank");
      setShowEmailModal(false);
      setEmailSubject("");
      setEmailBody("");
      setEmailTo("");
      setSenderName("");
      setOriginalSubject("");
      setOriginalBody("");
    }
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
      // Extract domain from website URL, preserving https://www.
      let domain = lead.website;
      try {
        const url = new URL(lead.website.startsWith("http") ? lead.website : `https://${lead.website}`);
        domain = url.protocol + '//' + url.hostname;
      } catch {
        // If URL parsing fails, use the website string as is
        domain = lead.website
          .replace(/^https?:\/\//, "")
          .split("/")[0];
        // Add https:// back if it was stripped
        if (!lead.website.startsWith("http")) {
          domain = `https://${domain}`;
        }
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
    if (callNotes.trim() && !savingCallLog) {
      setSavingCallLog(true);
      try {
        await addCallLog(lead.id, {
          outcome: callOutcome,
          notes: callNotes.trim(),
          nextFollowUp: null,
        });

        // Optionally refresh leads; local state already updated by context
        await refreshLeads().catch(() => {
          // Silently handle refresh error as it's optional
        });

        setCallNotes("");
        setCallOutcome("follow_up_1_day");
        setShowCallDialog(false);
      } catch (error) {
        console.error("Failed to save call log:", error);
        alert("Failed to save call log. Please try again.");
      } finally {
        setSavingCallLog(false);
      }
    }
  };

  const handleCloseDialog = () => {
    if (!savingCallLog) {
      setShowCallDialog(false);
      setCallNotes("");
      setCallOutcome("follow_up_1_day");
    }
  };

  const handleEditLog = (log: CallLog) => {
    setEditingLogId(log.id);
    setEditNotes(log.notes);
    setEditOutcome(log.outcome);
  };

  const handleDeleteLog = async () => {
    if (editingLogId && !deletingLog) {
      if (!window.confirm('Delete this call log?')) return;
      setDeletingLog(true);
      try {
        await deleteCallLog?.(lead.id, editingLogId);
        await refreshLeads();
      } catch (e) {
        console.error("Failed to delete call log:", e);
        alert("Failed to delete call log. Please try again.");
      } finally {
        setDeletingLog(false);
        setEditingLogId(null);
        setEditNotes("");
        setEditOutcome("follow_up_1_day");
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editingLogId && editNotes.trim() && !savingEdit) {
      setSavingEdit(true);
      try {
        await updateCallLog(lead.id, editingLogId, {
          outcome: editOutcome,
          notes: editNotes.trim(),
        });
        await refreshLeads();
      } catch (e) {
        console.error("Failed to update call log:", e);
        alert("Failed to update call log. Please try again.");
      } finally {
        setSavingEdit(false);
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
    <div className={`cursor-pointer transition-colors ${lead.contacted ? "bg-green-50/50" : "bg-white"} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""} ${deleting ? "opacity-50" : ""} ${isSelected ? "bg-blue-50" : ""}`} onClick={handleRowClick}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {onSelectionChange && (
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => {
                e.stopPropagation();
                onSelectionChange(lead.id);
              }}
              className="mt-0 w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
            />
          )}
          <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full border ${lead.contacted ? "bg-green-500 border-green-600" : "border-gray-300"} flex items-center justify-center`}>{lead.contacted && <Check className="w-3 h-3 text-white" />}</div>
          <div className="min-w-0 flex-1">
            <div className="font-medium text-sm truncate flex items-center gap-2">
              {lead.name}
              {isFollowUpDue && <AlertTriangle className="w-4 h-4 text-orange-500" />}
            </div>
            <div className="mt-1 flex items-center gap-2 flex-wrap">
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
          {lead.email && (
            <Tooltip title="Compose Email">
              <button onClick={(e) => {
                e.stopPropagation();
                setShowEmailModal(true);
                setEmailTo(lead.email || "");
                setSenderName(user?.name || ""); // Use logged-in user's name
              }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                <Mail className="w-3 h-3" />
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
                      <button
                        onClick={handleSaveEdit}
                        disabled={savingEdit}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {savingEdit ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-3 h-3" />
                            Save
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleDeleteLog}
                        disabled={deletingLog}
                        className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        {deletingLog ? (
                          <>
                            <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </>
                        )}
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
      <tr ref={ref} className={`hidden sm:table-row border-b transition-colors cursor-pointer hover:bg-blue-50 even:bg-gray-50 ${lead.contacted ? "bg-green-50/50" : ""} ${isFollowUpDue ? "border-l-4 border-orange-400" : ""} ${deleting ? "opacity-50" : ""} ${isSelected ? "bg-blue-50" : ""}`} onClick={handleRowClick}>
        {/* Checkbox */}
        <td className="p-1 lg:p-2">
          {onSelectionChange && (
            <input
              type="checkbox"
              checked={isSelected || false}
              onChange={(e) => {
                e.stopPropagation();
                onSelectionChange(lead.id);
              }}
              className="w-3 h-3 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
            />
          )}
        </td>
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
              {lead.email && (
                <Tooltip title="Compose Email">
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setShowEmailModal(true);
                    setEmailTo(lead.email || "");
                    setSenderName(user?.name || ""); // Use logged-in user's name
                  }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Mail className="w-4 h-4" />
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
                            <button
                              onClick={handleSaveEdit}
                              disabled={savingEdit}
                              className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {savingEdit ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="w-4 h-4" />
                                  Save
                                </>
                              )}
                            </button>
                            <button
                              onClick={handleDeleteLog}
                              disabled={deletingLog}
                              className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                              {deletingLog ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                  Deleting...
                                </>
                              ) : (
                                <>
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </>
                              )}
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
              <button
                onClick={handleCloseDialog}
                disabled={savingCallLog}
                className="text-gray-400 hover:text-gray-600 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
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
              <button
                onClick={handleCloseDialog}
                disabled={savingCallLog}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitCallLog}
                disabled={!callNotes.trim() || savingCallLog}
                className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {savingCallLog ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  'Save Notes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Compose Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => {
          setShowEmailModal(false);
          setEmailTo("");
          setSenderName("");
          setEmailSubject("");
          setEmailBody("");
          setOriginalSubject("");
          setOriginalBody("");
        }}>
          <div className="bg-white rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Compose Email - {lead.name}</h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailTo("");
                  setSenderName("");
                  setEmailSubject("");
                  setEmailBody("");
                  setOriginalSubject("");
                  setOriginalBody("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Name:</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => handleSenderNameChange(e.target.value)}
                  placeholder="Enter your name..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">To:</label>
                <input
                  type="email"
                  value={emailTo}
                  onChange={(e) => setEmailTo(e.target.value)}
                  placeholder="Enter email address..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Template:</label>
                <select
                  onChange={(e) => handleTemplateSelect(Number(e.target.value))}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a template...</option>
                  {emailTemplates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject:</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Enter email subject..."
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Body:</label>
                <textarea
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  placeholder="Enter your email message..."
                  rows={8}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailTo("");
                  setSenderName("");
                  setEmailSubject("");
                  setEmailBody("");
                  setOriginalSubject("");
                  setOriginalBody("");
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailCompose}
                className="flex-1 px-4 py-2 text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                <Mail className="w-4 h-4" />
                Open Gmail
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
