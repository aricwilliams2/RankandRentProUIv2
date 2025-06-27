import { useState, useCallback } from 'react';
import type { PhoneNumber } from '../types';

interface Call {
  id: string;
  phoneNumberId: string;
  duration: number;
  status: 'completed' | 'missed' | 'voicemail';
  callerNumber: string;
  timestamp: Date;
  recording?: string;
  transcription?: string;
}

export const usePhoneNumbersApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getPhoneNumbers = useCallback(async (): Promise<PhoneNumber[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/phone-numbers');
      const data = await response.json();
      return data.map((number: any) => ({
        ...number,
        createdAt: new Date(number.createdAt),
        updatedAt: new Date(number.updatedAt)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const purchasePhoneNumber = useCallback(async (
    websiteId: string, 
    provider: string
  ): Promise<PhoneNumber | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/phone-numbers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ websiteId, provider }),
      });
      const data = await response.json();
      return {
        ...data,
        createdAt: new Date(data.createdAt),
        updatedAt: new Date(data.updatedAt)
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePhoneNumber = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await fetch(`/api/phone-numbers/${id}`, {
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

  const getCallHistory = useCallback(async (phoneNumberId: string): Promise<Call[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/phone-numbers/${phoneNumberId}/calls`);
      const data = await response.json();
      return data.map((call: any) => ({
        ...call,
        timestamp: new Date(call.timestamp)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getPhoneNumbers,
    purchasePhoneNumber,
    deletePhoneNumber,
    getCallHistory
  };
};