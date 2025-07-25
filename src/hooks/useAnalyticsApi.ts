import { useState, useCallback } from 'react';
import type { 
  Website, 
  SEOMetrics, 
  Backlink,
  KeywordData,
  TrafficInsights,
  UrlMetrics,
  KeywordMetrics,
  KeywordGenerator
} from '../types';

export const useAnalyticsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getWebsiteAnalytics = useCallback(async (websiteId: string): Promise<SEOMetrics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/websites/${websiteId}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWebsiteBacklinks = useCallback(async (websiteId: string): Promise<Backlink[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/websites/${websiteId}/backlinks`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getKeywordRankings = useCallback(async (websiteId: string): Promise<KeywordData[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/websites/${websiteId}/keywords`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrafficInsights = useCallback(async (websiteId: string): Promise<TrafficInsights | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/websites/${websiteId}/traffic`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAnalytics = useCallback(async (websiteId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/analytics/websites/${websiteId}/refresh`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh analytics');
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUrlMetrics = useCallback(async (url: string): Promise<UrlMetrics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `https://newrankandrentapi.onrender.com/api/url-metrics?url=${encodeURIComponent(url)}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch URL metrics');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getKeywordMetrics = useCallback(async (keyword: string, country: string = 'us'): Promise<KeywordMetrics | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `https://newrankandrentapi.onrender.com/api/keyword-metrics?keyword=${encodeURIComponent(keyword)}&country=${country}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch keyword metrics');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getKeywordIdeas = useCallback(async (keyword: string, country: string = 'us'): Promise<KeywordGenerator | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `https://newrankandrentapi.onrender.com/api/keyword-generator?keyword=${encodeURIComponent(keyword)}&country=${country}`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch keyword ideas');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const checkGoogleRank = useCallback(async (keyword: string, url: string, country: string = 'us'): Promise<GoogleRankCheck | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const apiUrl = `https://newrankandrentapi.onrender.com/api/google-rank-check?keyword=${encodeURIComponent(keyword)}&url=${encodeURIComponent(url)}&country=${country}&id=google-serp`;
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        throw new Error('Failed to check Google ranking');
      }
      
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getWebsiteAnalytics,
    getWebsiteBacklinks,
    getKeywordRankings,
    getTrafficInsights,
    refreshAnalytics,
    getUrlMetrics,
    getKeywordMetrics,
    getKeywordIdeas,
    checkGoogleRank
  };
};