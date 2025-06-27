import { useState, useCallback } from 'react';
import type { Invoice, PricingRule } from '../types';

export const useRevenueApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getInvoices = useCallback(async (): Promise<Invoice[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/invoices');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoice = useCallback(async (id: string): Promise<Invoice | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${id}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createInvoice = useCallback(async (invoice: Partial<Invoice>): Promise<Invoice | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
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

  const updateInvoice = useCallback(async (id: string, invoice: Partial<Invoice>): Promise<Invoice | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoice),
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

  const deleteInvoice = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await fetch(`/api/invoices/${id}`, {
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

  const getPricingRules = useCallback(async (websiteId?: string): Promise<PricingRule[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = websiteId 
        ? `/api/pricing-rules?websiteId=${websiteId}` 
        : '/api/pricing-rules';
      const response = await fetch(url);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const savePricingRule = useCallback(async (rule: Partial<PricingRule>): Promise<PricingRule | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const method = rule.id ? 'PATCH' : 'POST';
      const url = rule.id ? `/api/pricing-rules/${rule.id}` : '/api/pricing-rules';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rule),
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

  const deletePricingRule = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await fetch(`/api/pricing-rules/${id}`, {
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

  return {
    loading,
    error,
    getInvoices,
    getInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getPricingRules,
    savePricingRule,
    deletePricingRule
  };
};