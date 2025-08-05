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
  addCallLog: (leadId: string, callLog: Omit<CallLog, "id" | "leadId" | "callDate">) => void;
  updateCallLog: (leadId: string, callLogId: string, updateData: Partial<Pick<CallLog, "outcome" | "notes">>) => void;
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
  id: string;
  number: string;
  websiteId: string;
  provider: string;
  monthlyFee: number;
  callCount: number;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
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
