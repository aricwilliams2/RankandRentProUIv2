import { useState, useCallback } from 'react';
import { 
  performMarketResearch,
  fetchSerpData,
  fetchTrafficData,
  fetchCompetitorData,
  processSerpData,
  extractTopKeywords,
  analyzeDomainStatistics
} from '../services/apiService';
import type { MarketResearch } from '../types';

export const useResearchApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startResearch = useCallback(async (niche: string, location: string): Promise<MarketResearch | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, we would make actual API calls here
      // For now, we're using our simulated API service
      const research = await performMarketResearch(niche, location);
      
      return research;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCompetitorInsights = useCallback(async (domain: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const competitorData = await fetchCompetitorData(domain);
      const keywordsData = extractTopKeywords(competitorData);
      const statistics = analyzeDomainStatistics(competitorData);
      
      return {
        keywords: keywordsData,
        statistics,
        raw: competitorData
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrafficInsights = useCallback(async (domain: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const trafficData = await fetchTrafficData(domain);
      
      return {
        history: trafficData.traffic_history,
        averages: trafficData.traffic,
        topPages: trafficData.top_pages,
        topCountries: trafficData.top_countries,
        topKeywords: trafficData.top_keywords,
        raw: trafficData
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSerpInsights = useCallback(async (keyword: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const serpData = await fetchSerpData(keyword);
      const competitors = processSerpData(serpData);
      
      return {
        competitors,
        raw: serpData
      };
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
    startResearch,
    getCompetitorInsights,
    getTrafficInsights,
    getSerpInsights
  };
};