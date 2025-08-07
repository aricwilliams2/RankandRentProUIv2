import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Website, WebsiteContextType } from "../types";

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);


// Helper function to strip down domain input to just the domain name
const stripDomain = (input: string): string => {
  if (!input) return '';

  // Remove protocol (http://, https://, etc.)
  let domain = input.replace(/^https?:\/\//, '');

  // Remove www. if present
  domain = domain.replace(/^www\./, '');

  // Remove everything after the first slash (path, query params, etc.)
  domain = domain.split('/')[0];

  // Remove port numbers if present
  domain = domain.split(':')[0];

  return domain.trim();
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const userId = user ? JSON.parse(user).id : null;

  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...(userId && { 'X-User-ID': userId }),
  };
};

// Convert frontend camelCase to backend snake_case
const transformWebsiteForAPI = (website: Partial<Website>) => {
  const apiWebsite: any = {};

  if (website.domain !== undefined) apiWebsite.domain = website.domain;
  if (website.niche !== undefined) apiWebsite.niche = website.niche;
  if (website.status !== undefined) apiWebsite.status = website.status;
  if (website.monthlyRevenue !== undefined) apiWebsite.monthly_revenue = website.monthlyRevenue;

  // Handle SEO metrics if they exist
  if (website.seoMetrics) {
    if (website.seoMetrics.domainAuthority !== undefined) apiWebsite.domain_authority = website.seoMetrics.domainAuthority;
    if (website.seoMetrics.backlinks !== undefined) apiWebsite.backlinks = website.seoMetrics.backlinks;
    if (website.seoMetrics.organicKeywords !== undefined) apiWebsite.organic_keywords = website.seoMetrics.organicKeywords;
    if (website.seoMetrics.organicTraffic !== undefined) apiWebsite.organic_traffic = website.seoMetrics.organicTraffic;
    if (website.seoMetrics.topKeywords !== undefined) apiWebsite.top_keywords = website.seoMetrics.topKeywords;
    if (website.seoMetrics.competitors !== undefined) apiWebsite.competitors = website.seoMetrics.competitors;
    if (website.seoMetrics.lastUpdated !== undefined) apiWebsite.seo_last_updated = website.seoMetrics.lastUpdated;
  }

  return apiWebsite;
};

const fetchWebsitesAPI = async (): Promise<Website[]> => {
  const response = await fetch(`/api/websites`, {
    headers: getAuthHeaders(),
  });
  const json = await response.json();

  // Handle different response structures
  let sites: any[] = [];
  if (Array.isArray(json)) {
    // Direct array response
    sites = json;
  } else if (json.data && Array.isArray(json.data)) {
    // Wrapped in data property
    sites = json.data;
  } else if (json.data && !Array.isArray(json.data)) {
    // Single object in data property
    sites = [json.data];
  } else {
    // Single object or other structure
    sites = [json];
  }

  return sites.map((site: any) => ({
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    phoneNumbers: site.phone_numbers || [],
    leads: site.leads || [],
    seoMetrics: {
      domainAuthority: site.domain_authority || 0,
      backlinks: site.backlinks || 0,
      organicKeywords: site.organic_keywords || 0,
      organicTraffic: site.organic_traffic || 0,
      topKeywords: site.top_keywords || [],
      competitors: site.competitors || [],
      lastUpdated: site.seo_last_updated ? new Date(site.seo_last_updated) : new Date(),
    },
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  }));
};

const createWebsiteAPI = async (website: Partial<Website>): Promise<Website> => {
  // Only send domain and niche in the request body as specified
  // Strip down the domain input to just the domain name
  const requestBody = {
    domain: website.domain ? stripDomain(website.domain) : '',
    niche: website.niche
  };

  const response = await fetch(`/api/websites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Failed to create website: ${response.statusText}`);
  }

  const json = await response.json();

  // Handle different response structures
  const site = json.data || json;

  return {
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    phoneNumbers: site.phone_numbers || [],
    leads: site.leads || [],
    seoMetrics: {
      domainAuthority: site.domain_authority || 0,
      backlinks: site.backlinks || 0,
      organicKeywords: site.organic_keywords || 0,
      organicTraffic: site.organic_traffic || 0,
      topKeywords: site.top_keywords || [],
      competitors: site.competitors || [],
      lastUpdated: site.seo_last_updated ? new Date(site.seo_last_updated) : new Date(),
    },
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  };
};

const updateWebsiteAPI = async (id: string, updates: Partial<Website>): Promise<Website> => {
  const response = await fetch(`/api/websites/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(transformWebsiteForAPI(updates)),
  });
  const json = await response.json();

  // Handle different response structures
  const site = json.data || json;

  return {
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    phoneNumbers: site.phone_numbers || [],
    leads: site.leads || [],
    seoMetrics: {
      domainAuthority: site.domain_authority || 0,
      backlinks: site.backlinks || 0,
      organicKeywords: site.organic_keywords || 0,
      organicTraffic: site.organic_traffic || 0,
      topKeywords: site.top_keywords || [],
      competitors: site.competitors || [],
      lastUpdated: site.seo_last_updated ? new Date(site.seo_last_updated) : new Date(),
    },
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  };
};

const deleteWebsiteAPI = async (id: string) => {
  await fetch(`/api/websites/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWebsites = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchWebsitesAPI();
      setWebsites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load websites");
    }
  }, []);

  useEffect(() => {
    const loadWebsites = async () => {
      try {
        setLoading(true);
        const data = await fetchWebsitesAPI();
        setWebsites(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load websites");
      } finally {
        setLoading(false);
      }
    };

    loadWebsites();
  }, []);

  const createWebsite = useCallback(async (site: Partial<Website>) => {
    try {
      setError(null);
      const newSite = await createWebsiteAPI(site);
      setWebsites((prev) => [...prev, newSite]);
      return newSite;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create website");
      throw err;
    }
  }, []);

  const updateWebsite = useCallback(async (id: string, updates: Partial<Website>) => {
    try {
      setError(null);
      const updated = await updateWebsiteAPI(id, updates);
      setWebsites((prev) => prev.map((w) => (w.id === id ? updated : w)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update website");
      throw err;
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteWebsiteAPI(id);
      setWebsites((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete website");
      throw err;
    }
  }, []);

  return <WebsiteContext.Provider value={{ websites, createWebsite, updateWebsite, deleteWebsite, refreshWebsites, loading, error }}>{children}</WebsiteContext.Provider>;
};

export const useWebsiteContext = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error("useWebsiteContext must be used within a WebsiteProvider");
  }
  return context;
};
