import { useState, useCallback } from 'react';
import type { Website, Lead, PhoneNumber } from '../types';
import { apiCall } from '../config/api';

export const useWebsitesApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getWebsites = useCallback(async (): Promise<Website[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/websites');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addWebsite = useCallback(async (website: Partial<Website>): Promise<Website | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/websites', {
        method: 'POST',
        body: JSON.stringify(website),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateWebsite = useCallback(async (id: string, website: Partial<Website>): Promise<Website | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/websites/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(website),
      });
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteWebsite = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiCall(`/api/websites/${id}`, {
        method: 'DELETE',
      });
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getLeadsForWebsite = useCallback(async (websiteId: string): Promise<Lead[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/websites/${websiteId}/leads`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPhoneNumbersForWebsite = useCallback(async (websiteId: string): Promise<PhoneNumber[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/websites/${websiteId}/phone-numbers`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const generateWebsiteContent = useCallback(async (
    websiteId: string, 
    contentData: { title: string; primaryKeywords: string; secondaryKeywords: string }
  ): Promise<string> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/websites/${websiteId}/generate-content`, {
        method: 'POST',
        body: JSON.stringify(contentData),
      });
      
      const data = await response.json();
      return data.content;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return '';
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getWebsites,
    addWebsite,
    updateWebsite,
    deleteWebsite,
    getLeadsForWebsite,
    getPhoneNumbersForWebsite,
    generateWebsiteContent
  };
};