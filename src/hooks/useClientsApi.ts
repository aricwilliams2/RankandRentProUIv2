import { useState, useCallback } from 'react';
import type { Client, Communication } from '../types';
import { apiCall } from '../config/api';

export const useClientsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getClients = useCallback(async (): Promise<Client[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/clients');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getClient = useCallback(async (id: string): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/clients/${id}`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addClient = useCallback(async (client: Partial<Client>): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall('/api/clients', {
        method: 'POST',
        body: JSON.stringify(client),
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

  const updateClient = useCallback(async (id: string, client: Partial<Client>): Promise<Client | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/clients/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(client),
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

  const deleteClient = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await apiCall(`/api/clients/${id}`, {
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

  const getCommunicationHistory = useCallback(async (clientId: string): Promise<Communication[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/clients/${clientId}/communication`);
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const addCommunication = useCallback(async (
    clientId: string, 
    communication: Omit<Communication, 'id' | 'clientId' | 'createdAt' | 'updatedBy'>
  ): Promise<Communication | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiCall(`/api/clients/${clientId}/communication`, {
        method: 'POST',
        body: JSON.stringify(communication),
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

  return {
    loading,
    error,
    getClients,
    getClient,
    addClient,
    updateClient,
    deleteClient,
    getCommunicationHistory,
    addCommunication
  };
};