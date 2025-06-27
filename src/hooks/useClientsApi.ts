import { useState, useCallback } from 'react';
import type { Client, Communication } from '../types';

export const useClientsApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getClients = useCallback(async (): Promise<Client[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/clients');
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
      const response = await fetch(`/api/clients/${id}`);
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
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
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
      await fetch(`/api/clients/${id}`, {
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
      const response = await fetch(`/api/clients/${clientId}/communication`);
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
      const response = await fetch(`/api/clients/${clientId}/communication`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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