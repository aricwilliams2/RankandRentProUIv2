import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";
import {
  Website,
  SortField,
  SortDirection,
} from "../types";

interface WebsiteContextType {
  websites: Website[];
  createWebsite: (data: Partial<Website>) => Promise<Website>;
  updateWebsite: (id: string, updates: Partial<Website>) => Promise<Website>;
  deleteWebsite: (id: string) => Promise<void>;
  refreshWebsites: () => Promise<void>;
  loading: boolean;
  error: string | null;
  sortField: SortField | null;
  sortDirection: SortDirection;
  setSortField: (field: SortField | null) => void;
  setSortDirection: (direction: SortDirection) => void;
}

const WebsiteContext = createContext<WebsiteContextType | undefined>(undefined);

const API_BASE_URL = "https://newrankandrentapi.onrender.com/api";

const fetchWebsitesAPI = async (): Promise<Website[]> => {
  const response = await fetch(`${API_BASE_URL}/websites`);
  const json = await response.json();
  return json.data.map((website: any) => ({
    ...website,
    monthly_revenue: parseFloat(website.monthly_revenue) || 0,
    createdAt: new Date(website.created_at),
    updatedAt: new Date(website.updated_at),
  }));
};

const createWebsiteAPI = async (websiteData: Partial<Website>): Promise<Website> => {
  const data = {
    domain: websiteData.domain,
    niche: websiteData.niche,
    status: websiteData.status || 'active',
    monthly_revenue: websiteData.monthly_revenue || 0,
    domain_authority: websiteData.domain_authority || 0,
    backlinks: websiteData.backlinks || 0,
    organic_keywords: websiteData.organic_keywords || 0,
    organic_traffic: websiteData.organic_traffic || 0,
  };

  const response = await fetch(`${API_BASE_URL}/websites`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const website = await response.json();
  return {
    ...website,
    monthly_revenue: parseFloat(website.monthly_revenue) || 0,
    createdAt: new Date(website.created_at),
    updatedAt: new Date(website.updated_at),
  };
};

const updateWebsiteAPI = async (
  website: Website,
  fieldsToUpdate?: string[]
): Promise<Website> => {
  const data: any = {
    domain: website.domain,
    niche: website.niche,
    status: website.status,
    monthly_revenue: website.monthly_revenue,
    domain_authority: website.domain_authority,
    backlinks: website.backlinks,
    organic_keywords: website.organic_keywords,
    organic_traffic: website.organic_traffic,
  };

  if (fieldsToUpdate && fieldsToUpdate.length > 0) {
    const filteredData: any = {};
    fieldsToUpdate.forEach((field) => {
      if (data.hasOwnProperty(field)) {
        filteredData[field] = data[field];
      }
    });
    Object.assign(data, filteredData);
  }

  const response = await fetch(`${API_BASE_URL}/websites/${website.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const updated = await response.json();
  return {
    ...updated,
    monthly_revenue: parseFloat(updated.monthly_revenue) || 0,
    createdAt: new Date(updated.created_at),
    updatedAt: new Date(updated.updated_at),
  };
};

const deleteWebsiteAPI = async (id: string) => {
  await fetch(`${API_BASE_URL}/websites/${id}`, { method: "DELETE" });
};

export const WebsiteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [sortField, setSortField] = useState<SortField | null>("domain");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshWebsites = async () => {
    try {
      setError(null);
      const data = await fetchWebsitesAPI();
      setWebsites(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load websites");
      throw err;
    }
  };

  useEffect(() => {
    const loadWebsites = async () => {
      try {
        setLoading(true);
        setError(null);
        await refreshWebsites();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load websites");
      } finally {
        setLoading(false);
      }
    };

    loadWebsites();
  }, []);

  const createWebsite = async (data: Partial<Website>) => {
    try {
      setError(null);
      const newWebsite = await createWebsiteAPI(data);
      setWebsites((prev) => [...prev, newWebsite]);
      return newWebsite;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create website");
      throw err;
    }
  };

  const updateWebsite = async (id: string, updates: Partial<Website>) => {
    try {
      setError(null);
      const website = websites.find((w) => w.id === id);
      if (!website) throw new Error("Website not found");

      const updated = await updateWebsiteAPI({ ...website, ...updates });
      setWebsites((prev) =>
        prev.map((w) => (w.id === id ? { ...w, ...updated } : w))
      );
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update website");
      throw err;
    }
  };

  const deleteWebsite = async (id: string) => {
    try {
      setError(null);
      await deleteWebsiteAPI(id);
      setWebsites((prev) => prev.filter((w) => w.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete website");
      throw err;
    }
  };

  return (
    <WebsiteContext.Provider
      value={{
        websites,
        createWebsite,
        updateWebsite,
        deleteWebsite,
        refreshWebsites,
        loading,
        error,
        sortField,
        sortDirection,
        setSortField,
        setSortDirection,
      }}
    >
      {children}
    </WebsiteContext.Provider>
  );
};

export const useWebsiteContext = () => {
  const context = useContext(WebsiteContext);
  if (!context) {
    throw new Error("useWebsiteContext must be used within a WebsiteProvider");
  }
  return context;
};