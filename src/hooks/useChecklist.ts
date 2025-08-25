import { useState, useEffect, useCallback } from 'react';
import { checklistService, ChecklistCompletion, CompletionStats } from '../services/checklistService';
import { checklistItems } from '../data/clientChecklistData';

export const useChecklist = (clientId: number) => {
  const [completions, setCompletions] = useState<Record<string, ChecklistCompletion>>({});
  const [stats, setStats] = useState<CompletionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate real-time progress based on completions state
  const totalItems = checklistItems.length; // 125 total items
  const completedCount = Object.values(completions).filter(completion => completion?.is_completed).length;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  // Load checklist data
  const loadChecklist = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [completionsData, statsData] = await Promise.all([
        checklistService.getClientChecklist(clientId),
        checklistService.getCompletionStats(clientId)
      ]);
      
      setCompletions(completionsData);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load checklist');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  // Toggle checklist item with immediate UI update
  const toggleItem = useCallback(async (itemId: string, isCompleted?: boolean) => {
    try {
      // Optimistically update the UI immediately
      const currentCompletion = completions[itemId];
      const newIsCompleted = isCompleted !== undefined ? isCompleted : !currentCompletion?.is_completed;
      
      // Update completions immediately for instant UI feedback
      setCompletions(prev => ({
        ...prev,
        [itemId]: {
          ...currentCompletion,
          is_completed: newIsCompleted,
          completed_at: newIsCompleted ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }
      }));

      // Make API call
      const updatedCompletion = await checklistService.toggleChecklistItem(clientId, itemId, isCompleted);
      
      // Update with actual API response
      setCompletions(prev => ({
        ...prev,
        [itemId]: updatedCompletion
      }));

      // Refresh stats in background
      checklistService.getCompletionStats(clientId).then(newStats => {
        setStats(newStats);
      }).catch(err => {
        console.error('Failed to refresh stats:', err);
      });

      return updatedCompletion;
    } catch (err) {
      // Revert optimistic update on error
      setCompletions(prev => {
        const reverted = { ...prev };
        if (prev[itemId]) {
          reverted[itemId] = {
            ...prev[itemId],
            is_completed: !prev[itemId].is_completed,
            completed_at: prev[itemId].is_completed ? null : prev[itemId].completed_at,
            updated_at: prev[itemId].updated_at
          };
        }
        return reverted;
      });
      
      setError(err instanceof Error ? err.message : 'Failed to update checklist item');
      throw err;
    }
  }, [clientId, completions]);

  // Mark item as completed
  const markAsCompleted = useCallback(async (itemId: string) => {
    return await toggleItem(itemId, true);
  }, [toggleItem]);

  // Mark item as incomplete
  const markAsIncomplete = useCallback(async (itemId: string) => {
    return await toggleItem(itemId, false);
  }, [toggleItem]);

  // Reset checklist
  const resetChecklist = useCallback(async () => {
    try {
      await checklistService.resetClientChecklist(clientId);
      setCompletions({});
      setStats({ total_items: totalItems, completed_items: 0, incomplete_items: totalItems });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset checklist');
      throw err;
    }
  }, [clientId, totalItems]);

  // Check if item is completed
  const isItemCompleted = useCallback((itemId: string): boolean => {
    return completions[itemId]?.is_completed || false;
  }, [completions]);

  // Load data on mount
  useEffect(() => {
    loadChecklist();
  }, [loadChecklist]);

  return {
    completions,
    stats,
    loading,
    error,
    toggleItem,
    markAsCompleted,
    markAsIncomplete,
    resetChecklist,
    isItemCompleted,
    refresh: loadChecklist,
    // Add real-time progress data
    totalItems,
    completedCount,
    progress
  };
};
