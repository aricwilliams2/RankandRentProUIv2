import { useState, useCallback } from 'react';
import type { Task } from '../types';

interface DashboardStats {
  totalRevenue: number;
  activeWebsites: number;
  totalLeads: number;
  activeClients: number;
  phoneNumbers: number;
  revenueChange: string;
  websitesChange: string;
  leadsChange: string;
  clientsChange: string;
  phoneNumbersChange: string;
}

interface RecentActivity {
  id: string;
  type: 'lead' | 'website' | 'client' | 'revenue' | 'phoneNumber';
  message: string;
  timestamp: Date;
}

export const useDashboardApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const getDashboardStats = useCallback(async (): Promise<DashboardStats | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentActivity = useCallback(async (): Promise<RecentActivity[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/dashboard/activity');
      const data = await response.json();
      return data.map((activity: any) => ({
        ...activity,
        timestamp: new Date(activity.timestamp)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getTasks = useCallback(async (status?: Task['status']): Promise<Task[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const url = status 
        ? `/api/tasks?status=${status}` 
        : '/api/tasks';
      const response = await fetch(url);
      const data = await response.json();
      
      // Convert string dates to Date objects
      return data.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const saveTask = useCallback(async (task: Partial<Task>): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const method = task.id ? 'PATCH' : 'POST';
      const url = task.id ? `/api/tasks/${task.id}` : '/api/tasks';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
      });
      const data = await response.json();
      
      // Convert string dates to Date objects
      return {
        ...data,
        dueDate: new Date(data.dueDate),
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

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await fetch(`/api/tasks/${id}`, {
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
    getDashboardStats,
    getRecentActivity,
    getTasks,
    saveTask,
    deleteTask
  };
};