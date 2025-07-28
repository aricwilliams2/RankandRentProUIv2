import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Website, WebsiteContextType } from "../types";

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  if (website.domainAuthority !== undefined) apiWebsite.domain_authority = website.domainAuthority;
  if (website.backlinks !== undefined) apiWebsite.backlinks = website.backlinks;
  if (website.organicKeywords !== undefined) apiWebsite.organic_keywords = website.organicKeywords;
  if (website.organicTraffic !== undefined) apiWebsite.organic_traffic = website.organicTraffic;
  if (website.topKeywords !== undefined) apiWebsite.top_keywords = website.topKeywords;
  if (website.competitors !== undefined) apiWebsite.competitors = website.competitors;
  if (website.seoLastUpdated !== undefined) apiWebsite.seo_last_updated = website.seoLastUpdated;

  return apiWebsite;
};

const fetchWebsitesAPI = async (): Promise<Website[]> => {
  const response = await fetch(`${API_BASE_URL}/websites`, {
    headers: getAuthHeaders(),
  });
  const json = await response.json();

  return json.data.map((site: any) => ({
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    domainAuthority: site.domain_authority,
    backlinks: site.backlinks,
    organicKeywords: site.organic_keywords,
    organicTraffic: site.organic_traffic,
    topKeywords: site.top_keywords,
    competitors: site.competitors,
    seoLastUpdated: site.seo_last_updated,
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  }));
};

const createWebsiteAPI = async (website: Partial<Website>): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(transformWebsiteForAPI(website)),
  });
  const site = await response.json();
  return {
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    domainAuthority: site.domain_authority,
    backlinks: site.backlinks,
    organicKeywords: site.organic_keywords,
    organicTraffic: site.organic_traffic,
    topKeywords: site.top_keywords,
    competitors: site.competitors,
    seoLastUpdated: site.seo_last_updated,
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  };
};

const updateWebsiteAPI = async (id: string, updates: Partial<Website>): Promise<Website> => {
  const response = await fetch(`${API_BASE_URL}/websites/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(transformWebsiteForAPI(updates)),
  });
  const site = await response.json();
  return {
    id: String(site.id),
    domain: site.domain,
    niche: site.niche,
    status: site.status,
    monthlyRevenue: site.monthly_revenue,
    domainAuthority: site.domain_authority,
    backlinks: site.backlinks,
    organicKeywords: site.organic_keywords,
    organicTraffic: site.organic_traffic,
    topKeywords: site.top_keywords,
    competitors: site.competitors,
    seoLastUpdated: site.seo_last_updated,
    createdAt: new Date(site.created_at),
    updatedAt: new Date(site.updated_at),
  };
};

const deleteWebsiteAPI = async (id: string) => {
  await fetch(`${API_BASE_URL}/websites/${id}`, { 
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
