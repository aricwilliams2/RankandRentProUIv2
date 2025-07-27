import { useState, useCallback } from 'react';
import type { Task } from '../types';

const API_BASE_URL = "https://newrankandrentapi.onrender.com/api";

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
      const response = await fetch(`${API_BASE_URL}/dashboard/stats`);
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
      const response = await fetch(`${API_BASE_URL}/dashboard/activity`);
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

  // GET /tasks - Fetch all tasks with optional status filter
  const getTasks = useCallback(async (status?: Task['status']): Promise<Task[]> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching tasks from API...');
      const url = status 
        ? `${API_BASE_URL}/tasks?status=${status}` 
        : `${API_BASE_URL}/tasks`;
      
      console.log('API URL:', url);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      // Return the data array from API response
      const tasks = apiResponse.data || [];
      console.log('Processed tasks:', tasks);
      return tasks;
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // GET /tasks/:id - Fetch a single task
  const getTask = useCallback(async (id: string): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching task ${id} from API...`);
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      console.log('Task fetched:', apiResponse);
      return apiResponse.data;
    } catch (err) {
      console.error('Error fetching task:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // POST /tasks - Create a new task
  const saveTask = useCallback(async (task: Partial<Task>): Promise<Task | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const isUpdate = Boolean(task.id);
      const method = isUpdate ? 'PUT' : 'POST';
      const url = isUpdate ? `${API_BASE_URL}/tasks/${task.id}` : `${API_BASE_URL}/tasks`;
      
      console.log(`${isUpdate ? 'Updating' : 'Creating'} task:`, task);
      console.log('API URL:', url);
      
      // Transform data for API
      const apiData = {
        website_id: task.website_id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        due_date: task.due_date
      };
      
      console.log('Sending data to API:', apiData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(apiData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      const apiResponse = await response.json();
      console.log('Task saved successfully:', apiResponse);
      
      // Return the saved task data
      return apiResponse.data || apiResponse;
    } catch (err) {
      console.error('Error saving task:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // DELETE /tasks/:id - Delete a task
  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Deleting task ${id}...`);
      const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      
      console.log(`Task ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
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
    getTask,
    saveTask,
    deleteTask
  };
};