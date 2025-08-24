export interface CallLog {
  id: string;
  leadId: string;
  outcome: "follow_up_1_day" | "follow_up_72_hours" | "follow_up_next_week" | "follow_up_next_month" | "follow_up_3_months";
  notes: string;
  callDate: Date;
  duration?: number; // in seconds
  nextFollowUp: string | null;
}

export interface Lead {
  id: any;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  website: string;
  status?: "New" | "Contacted" | "Qualified" | "Converted" | "Lost";
  reviews: number;
  contacted: boolean;
  city?: string | null;
  follow_up_at?: string | null;
  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  callLogs: CallLog[];
}

export interface AreaData {
  id: string;
  name: string;
  leads: Lead[];
}

export interface Filters {
  showContactedOnly: boolean;
}

export type SortField = "name" | "reviews" | "phone" | "website";
export type SortDirection = "asc" | "desc";

export interface LeadContextType {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  lastCalledIndex: number | null;
  setLastCalledIndex: React.Dispatch<React.SetStateAction<number | null>>;
  toggleContactStatus: (id: string) => void;
  clearCache: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  filteredLeads: Lead[];
  areas: AreaData[];
  currentArea: string;
  setCurrentArea: (areaId: string) => void;
  sortField: SortField | null;
  setSortField: React.Dispatch<React.SetStateAction<SortField | null>>;
  sortDirection: SortDirection;
  setSortDirection: React.Dispatch<React.SetStateAction<SortDirection>>;
  handleSort: (field: SortField) => void;
  addCallLog: (leadId: string, callLog: Omit<CallLog, "id" | "leadId" | "callDate">) => Promise<void>;
  updateCallLog: (leadId: string, callLogId: string, updateData: Partial<Pick<CallLog, "outcome" | "notes">>) => void;
  deleteCallLog?: (leadId: string, callLogId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  // New CRUD functions
  createLead: (leadData: Partial<Lead>) => Promise<Lead>;
  updateLead: (leadId: string, updateData: Partial<Lead>) => Promise<Lead | undefined>;
  deleteLead: (leadId: string) => Promise<boolean>;
  refreshLeads: () => Promise<void>;
}

// Client Context Type
export interface ClientContextType {
  clients: Client[];
  createClient: (data: Partial<Client>) => Promise<Client>;
  updateClient: (id: string, updates: Partial<Client>) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  toggleContactStatus: (id: string) => Promise<void>;
  refreshClients: () => Promise<void>;
  loading: boolean;
  error: string | null;
  sortField: SortField | null;
  sortDirection: SortDirection;
  setSortField: (field: SortField | null) => void;
  setSortDirection: (direction: SortDirection) => void;
}

// Core Types for other parts of the app
export interface Client {
  id: any;
  name: string;
  email: string;
  phone: string;
  city?: string;
  reviews?: number;
  website?: string;
  contacted?: boolean;
  follow_up_at?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Website {
  id: string;
  domain: string;
  niche: string;
  status: "active" | "pending" | "rented";
  monthlyRevenue: number;
  phoneNumbers: PhoneNumber[];
  leads: Lead[];
  seoMetrics: SEOMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebsiteContextType {
  websites: Website[];
  createWebsite: (website: Partial<Website>) => Promise<Website>;
  updateWebsite: (id: string, updates: Partial<Website>) => Promise<Website>;
  deleteWebsite: (id: string) => Promise<void>;
  refreshWebsites: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export interface PhoneNumber {
  id: string | number;
  number?: string; // For compatibility
  phone_number: string; // Backend uses snake_case
  user_id?: string | number; // Backend field
  userId?: string; // Frontend compatibility
  twilio_sid?: string; // Backend field
  twilioSid?: string; // Frontend compatibility
  friendly_name?: string; // Backend field
  websiteId?: string; // Made optional - numbers can exist without websites
  provider?: string;
  monthlyFee?: number;
  monthly_cost?: string; // Backend field as string
  callCount?: number;
  status?: "active" | "inactive";
  is_active?: number; // Backend field (1/0)
  country: string;
  region?: string;
  locality?: string;
  purchase_price?: string; // Backend field
  purchase_price_unit?: string; // Backend field
  capabilities: {
    voice?: boolean;
    sms?: boolean;
  };
  created_at?: string; // Backend field
  updated_at?: string; // Backend field
  createdAt?: Date; // Frontend field
  updatedAt?: Date; // Frontend field
}

export interface SEOMetrics {
  domainAuthority: number;
  backlinks: number;
  organicKeywords: number;
  organicTraffic: number;
  topKeywords: string[];
  competitors: string[];
  lastUpdated: Date;
}

export interface Task {
  id: string;
  websiteId?: string; // Made optional
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  createTask: (task: Partial<Task>) => Promise<Task>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export interface Invoice {
  id: string;
  clientId: string;
  websiteId: string;
  amount: number;
  status: "draft" | "sent" | "paid" | "overdue";
  dueDate: Date;
  paidDate?: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PricingRule {
  id: string;
  websiteId: string;
  name: string;
  basePrice: number;
  leadMultiplier: number;
  minimumLeads: number;
  maximumLeads: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface Communication {
  id: string;
  clientId: string;
  type: "email" | "call" | "note";
  content: string;
  createdAt: Date;
  updatedBy: string;
}

export interface MarketResearch {
  id: string;
  niche: string;
  location: string;
  status: "in_progress" | "completed" | "archived";
  monthlySearchVolume: number;
  competitionScore: number;
  estimatedValue: number;
  competitors: CompetitorAnalysis[];
  keywordOpportunities: KeywordOpportunity[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompetitorAnalysis {
  id: string;
  domain: string;
  domainAuthority: number;
  backlinks: number;
  organicKeywords: number;
  estimatedTraffic: number;
  topKeywords: string[];
  weaknesses: string[];
}

export interface KeywordOpportunity {
  id: string;
  keyword: string;
  searchVolume: number;
  difficulty: number;
  cpc: number;
  competition: "low" | "medium" | "high";
  intent: "informational" | "commercial" | "transactional";
}

export interface UserPreferences {
  id: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
  emailDigest: "daily" | "weekly" | "never";
  defaultCurrency: string;
  timezone: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  is_paid?: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  isAuthenticated: boolean;
}

export interface APIIntegration {
  id: string;
  name: string;
  type: "seo" | "call_tracking" | "payment" | "email";
  status: "active" | "inactive" | "error";
  apiKey?: string;
  lastSync?: Date;
  settings: Record<string, any>;
}

// API Response Types
export interface SerpCompetitor {
  domain: string;
  title: string;
  url: string;
  metrics: {
    domainRating: number;
    organicKeywords: number;
    organicTraffic: number;
    backlinks: number;
    domains: number;
  };
}

export interface KeywordData {
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  competition: string;
  currentRank: number;
  previousRank: number;
  trafficPotential: number;
}

export interface DomainStatistics {
  totalKeywords: number;
  keywordsTop10: number;
  keywordsTop3: number;
  keywordsFirst: number;
  estimatedTraffic: number;
  keywordTrends: {
    new: number;
    improved: number;
    declined: number;
    lost: number;
  };
}

export interface TrafficHistory {
  date: string;
  organic: number;
}

export interface TopPage {
  url: string;
  traffic: number;
  share: number;
}

export interface CountryTraffic {
  country: string;
  share: number;
}

export interface KeywordTraffic {
  keyword: string;
  position: number;
  traffic: number;
}

export interface TrafficInsights {
  history: TrafficHistory[];
  averages: {
    trafficMonthlyAvg: number;
    costMontlyAvg: number;
  };
  topPages: TopPage[];
  topCountries: CountryTraffic[];
  topKeywords: KeywordTraffic[];
  raw: any;
}

export interface CompetitorInsights {
  keywords: KeywordData[];
  statistics: DomainStatistics;
  raw: any;
}

export interface SerpInsights {
  competitors: SerpCompetitor[];
  raw: any;
}

// New Ahrefs API Types
export interface UrlMetrics {
  success: boolean;
  data: {
    page: {
      backlinks: number;
      refDomains: number;
      traffic: number;
      trafficValue: number;
      organicKeywords: number;
      urlRating: number;
      numberOfWordsOnPage: number;
    };
    domain: {
      domainRating: number;
      ahrefsRank: number;
      backlinks: number;
      refDomains: number;
      traffic: number;
      trafficValue: number;
      organicKeywords: number;
    };
  };
}

export interface KeywordMetrics {
  success: boolean;
  data: {
    keyword: string;
    searchVolume: number;
    clicks: number;
    cpc: number;
    difficulty: number;
    globalSearchVolume: number;
    trafficPotential: number;
  };
}

export interface KeywordIdea {
  id: string;
  keyword: string;
  country: string;
  difficultyLabel: "Easy" | "Medium" | "Hard" | "Unknown";
  volumeLabel: string;
  updatedAt: string;
}

export interface KeywordGenerator {
  success: boolean;
  data: {
    allIdeas: {
      results: KeywordIdea[];
      total: number;
    };
    questionIdeas?: {
      results: KeywordIdea[];
      total: number;
    };
  };
}

// Google Rank Check Types
export interface SerpResult {
  rank: number;
  title: string;
  link: string;
  description: string;
  "domain authority": number;
  "page authority": number;
}

export interface Activity {
  id: number;
  type: string;
  title: string;
  description: string;
  website: string | null;
  timestamp: string;
  timeAgo: string;
  icon: string;
  color: string;
  category: string;
}

export interface ActivityResponse {
  success: boolean;
  data: Activity[];
  total: number;
}

export interface GoogleRankCheck {
  status: string;
  data: {
    message: string;
    rank: number;
    SERP: SerpResult[];
  };
  message: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  isCompleted: boolean;
  completedAt?: Date;
  completedBy?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedTime?: number; // in minutes
  dependencies?: string[]; // IDs of items that must be completed first
}

export interface ClientChecklist {
  id: string;
  clientId: string;
  items: ChecklistItem[];
  totalItems: number;
  completedItems: number;
  progress: number; // percentage
  lastUpdated: Date;
  createdAt: Date;
}

export interface ChecklistCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  items: ChecklistItem[];
}

// NEW: Multi-user Twilio types
export interface TwilioCall {
  id: string | number;
  call_sid?: string; // Backend field
  callSid?: string; // Frontend field
  user_id?: string | number; // Backend field
  userId?: string; // Frontend field
  phone_number_id?: string | number; // Backend field
  phoneNumberId?: string; // Frontend field
  to_number?: string; // Backend field
  from_number?: string; // Backend field
  to?: string; // Frontend field
  from?: string; // Frontend field
  direction: 'inbound' | 'outbound' | 'outbound-api';
  status: 'queued' | 'ringing' | 'in-progress' | 'completed' | 'busy' | 'failed' | 'no-answer' | 'canceled';
  duration: number; // in seconds
  price?: string | number; // Cost in USD (string from backend)
  price_unit?: string; // Backend field
  priceUnit?: string; // Frontend field
  recording_url?: string; // Backend field
  recordingUrl?: string; // Frontend field
  recording_sid?: string; // Backend field
  recordingSid?: string; // Frontend field
  recording_duration?: number; // Backend field
  recording_status?: 'completed' | 'processing' | 'failed'; // Backend field
  transcription?: string;
  start_time?: string; // Backend field
  startTime?: Date; // Frontend field
  end_time?: string; // Backend field
  endTime?: Date; // Frontend field
  created_at?: string; // Backend field
  createdAt?: Date; // Frontend field
  updated_at?: string; // Backend field
  updatedAt?: Date; // Frontend field
}

export interface TwilioRecording {
  id: string;
  recordingSid: string; // Twilio recording SID
  userId: string; // User who owns this recording
  callSid: string; // Associated call
  phoneNumberId: string; // Phone number used
  duration: number; // in seconds
  channels: number; // 1 = mono, 2 = stereo
  status: 'in-progress' | 'paused' | 'stopped' | 'processing' | 'completed' | 'absent';
  mediaUrl: string; // URL to download recording (now proxied)
  price?: number; // Cost in USD
  priceUnit?: string; // Currency
  createdAt: Date;
  updatedAt: Date;
  // Enhanced fields from new API response
  fromNumber?: string; // Caller number
  toNumber?: string; // Recipient number
  callDuration?: number; // Total call duration in seconds
  callStatus?: string; // Call completion status
}

export interface UserPhoneNumbersContextType {
  phoneNumbers: PhoneNumber[];
  calls: TwilioCall[];
  recordings: TwilioRecording[];
  phoneNumberStats: {
    total_numbers: number;
    active_numbers: number;
    total_purchase_cost: string;
    total_monthly_cost: string;
  } | null;
  loading: boolean;
  error: string | null;
  
  // Phone number management
  getMyNumbers: () => Promise<void>;
  searchAvailableNumbers: (params: { areaCode?: string; country?: string; limit?: number }) => Promise<any>;
  buyPhoneNumber: (data: { phoneNumber: string; country?: string; areaCode?: string; websiteId?: string }) => Promise<BuyNumberResponse>;
  updatePhoneNumber: (id: string, updates: Partial<PhoneNumber>) => Promise<PhoneNumber>;
  releasePhoneNumber: (id: string) => Promise<void>;
  
  // Calling functionality
  getCallHistory: (params?: { phoneNumberId?: string; limit?: number; page?: number }) => Promise<void>;
  getCallDetails: (callSid: string) => Promise<TwilioCall>;
  
  // Recording management
  getRecordings: (params?: { callSid?: string; phoneNumberId?: string; limit?: number; page?: number }) => Promise<void>;
  deleteRecording: (recordingSid: string) => Promise<void>;
}

// API Response types to match backend structure
export interface PhoneNumbersApiResponse {
  success: boolean;
  phoneNumbers: PhoneNumber[];
  stats: {
    total_numbers: number;
    active_numbers: number;
    total_purchase_cost: string;
    total_monthly_cost: string;
  };
}

export interface BuyNumberResponse {
  success: boolean;
  phoneNumber: PhoneNumber;
  requestedNumber: string;
  isDifferentNumber: boolean;
  message: string;
}

export interface CallHistoryApiResponse {
  success: boolean;
  callLogs: TwilioCall[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RecordingsApiResponse {
  success: boolean;
  recordings: TwilioRecording[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Call Forwarding Types
export interface CallForwarding {
  id: string;
  user_id: string;
  phone_number_id: string;
  forward_to_number: string;
  is_active: boolean;
  forwarding_type: 'always' | 'busy' | 'no_answer' | 'unavailable';
  ring_timeout: number;
  created_at: string;
  updated_at: string;
}

export interface CallForwardingFormData {
  phone_number_id: string;
  forward_to_number: string;
  forwarding_type: 'always' | 'busy' | 'no_answer' | 'unavailable';
  ring_timeout: number;
}

export interface CallForwardingApiResponse {
  success: boolean;
  callForwarding?: CallForwarding;
  callForwardings?: CallForwarding[];
  data?: CallForwarding[]; // Backend returns data in this field
  message?: string;
  error?: string;
}

export interface CallForwardingContextType {
  callForwardings: CallForwarding[];
  loading: boolean;
  error: string | null;
  getCallForwardings: () => Promise<void>;
  createCallForwarding: (data: CallForwardingFormData) => Promise<CallForwarding>;
  updateCallForwarding: (id: string, updates: Partial<CallForwarding>) => Promise<CallForwarding>;
  toggleCallForwarding: (id: string, isActive: boolean) => Promise<void>;
  deleteCallForwarding: (id: string) => Promise<void>;
  getCallForwardingByPhoneNumber: (phoneNumberId: string) => CallForwarding | undefined;
}
