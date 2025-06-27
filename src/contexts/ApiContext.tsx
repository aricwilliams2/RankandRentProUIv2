import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useResearchApi } from '../hooks/useResearchApi';
import { useWebsitesApi } from '../hooks/useWebsitesApi';
import { useClientsApi } from '../hooks/useClientsApi';
import { useRevenueApi } from '../hooks/useRevenueApi';
import { useDashboardApi } from '../hooks/useDashboardApi';
import { usePhoneNumbersApi } from '../hooks/usePhoneNumbersApi';
import { useAnalyticsApi } from '../hooks/useAnalyticsApi';
import type { 
  MarketResearch, 
  CompetitorInsights, 
  SerpInsights, 
  TrafficInsights,
  Website,
  Client,
  Invoice,
  PricingRule,
  Lead,
  PhoneNumber,
  Task,
  SEOMetrics,
  Backlink,
  KeywordData
} from '../types';

interface ApiContextType {
  // Loading and error states
  loading: boolean;
  error: string | null;
  
  // Data
  research: MarketResearch[];
  websites: Website[];
  clients: Client[];
  invoices: Invoice[];
  tasks: Task[];
  
  // Research methods
  startNewResearch: (niche: string, location: string) => Promise<MarketResearch | null>;
  getCompetitorInsights: (domain: string) => Promise<CompetitorInsights | null>;
  getTrafficInsights: (domain: string) => Promise<TrafficInsights | null>;
  getSerpInsights: (keyword: string) => Promise<SerpInsights | null>;
  
  // Website methods
  getWebsites: () => Promise<Website[]>;
  addWebsite: (website: Partial<Website>) => Promise<Website | null>;
  updateWebsite: (id: string, website: Partial<Website>) => Promise<Website | null>;
  deleteWebsite: (id: string) => Promise<boolean>;
  getLeadsForWebsite: (websiteId: string) => Promise<Lead[]>;
  getPhoneNumbersForWebsite: (websiteId: string) => Promise<PhoneNumber[]>;
  generateWebsiteContent: (websiteId: string, contentData: { title: string; primaryKeywords: string; secondaryKeywords: string }) => Promise<string>;
  
  // Client methods
  getClients: () => Promise<Client[]>;
  getClient: (id: string) => Promise<Client | null>;
  addClient: (client: Partial<Client>) => Promise<Client | null>;
  updateClient: (id: string, client: Partial<Client>) => Promise<Client | null>;
  deleteClient: (id: string) => Promise<boolean>;
  
  // Revenue methods
  getInvoices: () => Promise<Invoice[]>;
  createInvoice: (invoice: Partial<Invoice>) => Promise<Invoice | null>;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => Promise<Invoice | null>;
  getPricingRules: (websiteId?: string) => Promise<PricingRule[]>;
  savePricingRule: (rule: Partial<PricingRule>) => Promise<PricingRule | null>;
  
  // Dashboard methods
  getDashboardStats: () => Promise<any>;
  getRecentActivity: () => Promise<any[]>;
  getTasks: (status?: string) => Promise<Task[]>;
  saveTask: (task: Partial<Task>) => Promise<Task | null>;
  deleteTask: (id: string) => Promise<boolean>;
  
  // Phone numbers methods
  getPhoneNumbers: () => Promise<PhoneNumber[]>;
  purchasePhoneNumber: (websiteId: string, provider: string) => Promise<PhoneNumber | null>;
  deletePhoneNumber: (id: string) => Promise<boolean>;
  getCallHistory: (phoneNumberId: string) => Promise<any[]>;
  
  // Analytics methods
  getWebsiteAnalytics: (websiteId: string) => Promise<SEOMetrics | null>;
  getWebsiteBacklinks: (websiteId: string) => Promise<Backlink[]>;
  getKeywordRankings: (websiteId: string) => Promise<KeywordData[]>;
  refreshAnalytics: (websiteId: string) => Promise<boolean>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const researchApi = useResearchApi();
  const websitesApi = useWebsitesApi();
  const clientsApi = useClientsApi();
  const revenueApi = useRevenueApi();
  const dashboardApi = useDashboardApi();
  const phoneNumbersApi = usePhoneNumbersApi();
  const analyticsApi = useAnalyticsApi();
  
  const [research, setResearch] = useState<MarketResearch[]>([]);
  const [websites, setWebsites] = useState<Website[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Calculate overall loading state
  const loading = 
    researchApi.loading || 
    websitesApi.loading || 
    clientsApi.loading || 
    revenueApi.loading || 
    dashboardApi.loading || 
    phoneNumbersApi.loading || 
    analyticsApi.loading;
  
  // Get the first error that occurs
  const error = 
    researchApi.error || 
    websitesApi.error || 
    clientsApi.error || 
    revenueApi.error || 
    dashboardApi.error || 
    phoneNumbersApi.error || 
    analyticsApi.error;

  // Research methods
  const startNewResearch = useCallback(async (niche: string, location: string) => {
    const result = await researchApi.startResearch(niche, location);
    if (result) {
      setResearch(prev => [...prev, result]);
    }
    return result;
  }, [researchApi]);

  // Website methods
  const getWebsites = useCallback(async () => {
    const result = await websitesApi.getWebsites();
    setWebsites(result);
    return result;
  }, [websitesApi]);

  const addWebsite = useCallback(async (website: Partial<Website>) => {
    const result = await websitesApi.addWebsite(website);
    if (result) {
      setWebsites(prev => [...prev, result]);
    }
    return result;
  }, [websitesApi]);

  const updateWebsite = useCallback(async (id: string, website: Partial<Website>) => {
    const result = await websitesApi.updateWebsite(id, website);
    if (result) {
      setWebsites(prev => prev.map(w => w.id === id ? result : w));
    }
    return result;
  }, [websitesApi]);

  const deleteWebsite = useCallback(async (id: string) => {
    const result = await websitesApi.deleteWebsite(id);
    if (result) {
      setWebsites(prev => prev.filter(w => w.id !== id));
    }
    return result;
  }, [websitesApi]);

  // Client methods
  const getClients = useCallback(async () => {
    const result = await clientsApi.getClients();
    setClients(result);
    return result;
  }, [clientsApi]);

  // Task methods
  const getTasks = useCallback(async (status?: string) => {
    const result = await dashboardApi.getTasks(status as any);
    setTasks(result);
    return result;
  }, [dashboardApi]);

  const saveTask = useCallback(async (task: Partial<Task>) => {
    const result = await dashboardApi.saveTask(task);
    if (result) {
      setTasks(prev => {
        const existing = prev.findIndex(t => t.id === result.id);
        if (existing >= 0) {
          return [...prev.slice(0, existing), result, ...prev.slice(existing + 1)];
        } else {
          return [...prev, result];
        }
      });
    }
    return result;
  }, [dashboardApi]);

  const deleteTask = useCallback(async (id: string) => {
    const result = await dashboardApi.deleteTask(id);
    if (result) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
    return result;
  }, [dashboardApi]);

  // Initialize data
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load research data if needed
        const researchResponse = await fetch('/api/research');
        const researchData = await researchResponse.json();
        setResearch(researchData);
        
        // Load websites
        getWebsites();
        
        // Load clients
        getClients();
        
        // Load invoices
        const invoicesResult = await revenueApi.getInvoices();
        setInvoices(invoicesResult);
        
        // Load tasks
        getTasks();
      } catch (err) {
        console.error('Error loading initial data:', err);
      }
    };
    
    loadInitialData();
  }, [getWebsites, getClients, revenueApi, getTasks]);

  return (
    <ApiContext.Provider
      value={{
        // State
        loading,
        error,
        research,
        websites,
        clients,
        invoices,
        tasks,
        
        // Research methods
        startNewResearch,
        getCompetitorInsights: researchApi.getCompetitorInsights,
        getTrafficInsights: researchApi.getTrafficInsights,
        getSerpInsights: researchApi.getSerpInsights,
        
        // Website methods
        getWebsites,
        addWebsite,
        updateWebsite,
        deleteWebsite,
        getLeadsForWebsite: websitesApi.getLeadsForWebsite,
        getPhoneNumbersForWebsite: websitesApi.getPhoneNumbersForWebsite,
        generateWebsiteContent: websitesApi.generateWebsiteContent,
        
        // Client methods
        getClients,
        getClient: clientsApi.getClient,
        addClient: clientsApi.addClient,
        updateClient: clientsApi.updateClient,
        deleteClient: clientsApi.deleteClient,
        
        // Revenue methods
        getInvoices: revenueApi.getInvoices,
        createInvoice: revenueApi.createInvoice,
        updateInvoice: revenueApi.updateInvoice,
        getPricingRules: revenueApi.getPricingRules,
        savePricingRule: revenueApi.savePricingRule,
        
        // Dashboard methods
        getDashboardStats: dashboardApi.getDashboardStats,
        getRecentActivity: dashboardApi.getRecentActivity,
        getTasks,
        saveTask,
        deleteTask,
        
        // Phone numbers methods
        getPhoneNumbers: phoneNumbersApi.getPhoneNumbers,
        purchasePhoneNumber: phoneNumbersApi.purchasePhoneNumber,
        deletePhoneNumber: phoneNumbersApi.deletePhoneNumber,
        getCallHistory: phoneNumbersApi.getCallHistory,
        
        // Analytics methods
        getWebsiteAnalytics: analyticsApi.getWebsiteAnalytics,
        getWebsiteBacklinks: analyticsApi.getWebsiteBacklinks,
        getKeywordRankings: analyticsApi.getKeywordRankings,
        refreshAnalytics: analyticsApi.refreshAnalytics
      }}
    >
      {children}
    </ApiContext.Provider>
  );
};

export const useApiContext = () => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApiContext must be used within an ApiProvider');
  }
  return context;
};