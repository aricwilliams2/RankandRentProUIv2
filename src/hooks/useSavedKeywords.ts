import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface SavedKeyword {
  id: number;
  keyword: string;
  difficulty: string;
  volume: string;
  last_updated: string;
  search_engine: string;
  country: string;
  category: 'idea' | 'question';
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface SavedKeywordsResponse {
  data: SavedKeyword[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export const useSavedKeywords = () => {
  const { token, isAuthenticated } = useAuth();
  const [savedKeywords, setSavedKeywords] = useState<SavedKeyword[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedKeywords = async (options: {
    category?: string;
    limit?: number;
    offset?: number;
    search?: string;
  } = {}) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (options.category) params.append('category', options.category);
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.offset) params.append('offset', options.offset.toString());
      if (options.search) params.append('search', options.search);

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/saved-keywords?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch saved keywords');
      }

      const data: SavedKeywordsResponse = await response.json();
      setSavedKeywords(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const saveKeyword = async (keywordData: {
    keyword: string;
    difficulty: string;
    volume: string;
    last_updated: string;
    search_engine: string;
    country: string;
    category: 'idea' | 'question';
    notes?: string;
  }) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to save keywords');
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/saved-keywords`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(keywordData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save keyword');
      }

      const data = await response.json();
      setSavedKeywords(prev => [data.data, ...prev]);
      return data.data;
    } catch (err) {
      throw err;
    }
  };

  const deleteKeyword = async (id: number) => {
    if (!isAuthenticated) {
      throw new Error('You must be logged in to delete keywords');
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/saved-keywords/${id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete keyword');
      }

      setSavedKeywords(prev => prev.filter(kw => kw.id !== id));
    } catch (err) {
      throw err;
    }
  };

  const checkIfSaved = async (keyword: string, category: string = 'idea') => {
    if (!isAuthenticated) return false;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com'}/api/saved-keywords/check?keyword=${encodeURIComponent(keyword)}&category=${category}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      return data.isSaved;
    } catch (err) {
      console.error('Error checking if keyword is saved:', err);
      return false;
    }
  };

  return {
    savedKeywords,
    loading,
    error,
    fetchSavedKeywords,
    saveKeyword,
    deleteKeyword,
    checkIfSaved,
  };
};
