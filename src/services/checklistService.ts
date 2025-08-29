import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://newrankandrentapi.onrender.com';

export interface ChecklistCompletion {
  id: number;
  user_id: number;
  client_id: number;
  checklist_item_id: string;
  is_completed: boolean;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompletionStats {
  total_items: number;
  completed_items: number;
  incomplete_items: number;
}

class ChecklistService {
  private getHeaders() {
    const token = localStorage.getItem('token'); // or however you store your auth token
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  // Get all checklist completion status for a client
  async getClientChecklist(clientId: number): Promise<Record<string, ChecklistCompletion>> {
    const response = await axios.get(`${API_BASE_URL}/api/checklist/client/${clientId}`, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Toggle completion status of a checklist item
  async toggleChecklistItem(clientId: number, itemId: string, isCompleted?: boolean): Promise<ChecklistCompletion> {
    const response = await axios.put(`${API_BASE_URL}/api/checklist/client/${clientId}/item/${itemId}/toggle`, 
      { isCompleted }, 
      { headers: this.getHeaders() }
    );
    return response.data.data;
  }

  // Mark a checklist item as completed
  async markAsCompleted(clientId: number, itemId: string): Promise<ChecklistCompletion> {
    const response = await axios.put(`${API_BASE_URL}/api/checklist/client/${clientId}/item/${itemId}/complete`, {}, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Mark a checklist item as incomplete
  async markAsIncomplete(clientId: number, itemId: string): Promise<ChecklistCompletion> {
    const response = await axios.put(`${API_BASE_URL}/api/checklist/client/${clientId}/item/${itemId}/incomplete`, {}, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Get completion statistics for a client
  async getCompletionStats(clientId: number): Promise<CompletionStats> {
    const response = await axios.get(`${API_BASE_URL}/api/checklist/client/${clientId}/stats`, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Get completed items for a client
  async getCompletedItems(clientId: number): Promise<ChecklistCompletion[]> {
    const response = await axios.get(`${API_BASE_URL}/api/checklist/client/${clientId}/completed`, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Get incomplete items for a client
  async getIncompleteItems(clientId: number): Promise<ChecklistCompletion[]> {
    const response = await axios.get(`${API_BASE_URL}/api/checklist/client/${clientId}/incomplete`, {
      headers: this.getHeaders()
    });
    return response.data.data;
  }

  // Reset all checklist items for a client
  async resetClientChecklist(clientId: number): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/checklist/client/${clientId}/reset`, {
      headers: this.getHeaders()
    });
  }
}

export const checklistService = new ChecklistService();
