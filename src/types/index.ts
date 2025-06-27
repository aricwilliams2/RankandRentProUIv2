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
  id: string;
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
}

// Core Types for other parts of the app
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  websites: Website[];
  communicationHistory: Communication[];
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
  websiteId: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "completed";
  priority: "low" | "medium" | "high";
  assignee: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
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