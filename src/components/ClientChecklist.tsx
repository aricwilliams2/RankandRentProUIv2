import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  Chip,
  LinearProgress,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import {
  ExpandMore,
  UnfoldMore,
} from '@mui/icons-material';
import type { ChecklistItem, ChecklistCategory } from '../types';
import { checklistCategories, checklistItems } from '../data/clientChecklistData';
import { useChecklist } from '../hooks/useChecklist';

interface ClientChecklistProps {
  clientId: string;
  clientName: string;
  onUpdate?: (checklist: any) => void;
}

const priorityColors = {
  critical: '#f44336',
  high: '#ff9800',
  medium: '#2196f3',
  low: '#4caf50',
};

const priorityLabels = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function ClientChecklist({ clientId, clientName, onUpdate }: ClientChecklistProps) {
  const {
    completions,
    stats,
    loading,
    error,
    toggleItem,
    resetChecklist,
    isItemCompleted,
    refresh,
    totalItems,
    completedCount,
    progress
  } = useChecklist(parseInt(clientId));

  const [resetting, setResetting] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const handleItemToggle = async (itemId: string) => {
    try {
      await toggleItem(itemId);

      // Notify parent component with updated progress
      onUpdate?.({
        clientId,
        completedItems: Object.keys(completions).filter(id => completions[id]?.is_completed),
        progress,
        totalItems,
        completedCount,
      });
    } catch (err) {
      console.error('Failed to toggle item:', err);
      // You could show a toast notification here
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all checklist items? This action cannot be undone.')) {
      try {
        setResetting(true);
        await resetChecklist();
        // You could show a success toast notification here
      } catch (err) {
        console.error('Failed to reset checklist:', err);
        // You could show an error toast notification here
      } finally {
        setResetting(false);
      }
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setExpandedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleOpenAll = () => {
    const allCategoryIds = checklistCategories.map(category => category.id);
    setExpandedCategories(allCategoryIds);
  };

  const handleCloseAll = () => {
    setExpandedCategories([]);
  };

  // Group items by category
  const groupedItems = checklistCategories.map(category => ({
    ...category,
    items: checklistItems.filter(item => item.category === category.id)
  }));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading checklist...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<RefreshCw />}
          onClick={refresh}
        >
          Try Again
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {clientName} - Client Checklist
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Track progress for {clientName}
        </Typography>
      </Box>

      {/* Progress Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Overall Progress</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h4" color="primary">
                {progress}%
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RotateCcw />}
                onClick={handleReset}
                disabled={resetting}
              >
                {resetting ? 'Resetting...' : 'Reset All'}
              </Button>
            </Box>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {completedCount} of {totalItems} tasks completed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalItems - completedCount} remaining
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Accordion Controls */}
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<UnfoldMore />}
          onClick={handleOpenAll}
        >
          Open All Categories
        </Button>
        <Button
          variant="outlined"
          size="small"
          onClick={handleCloseAll}
        >
          Close All Categories
        </Button>
      </Box>

      {/* Checklist Items by Category - Accordion */}
      {groupedItems.map(category => {
        const categoryItems = category.items;
        const completedInCategory = categoryItems.filter(item => isItemCompleted(item.id)).length;
        const categoryProgress = categoryItems.length > 0 ? (completedInCategory / categoryItems.length) * 100 : 0;
        const isExpanded = expandedCategories.includes(category.id);

        return (
          <Accordion
            key={category.id}
            expanded={isExpanded}
            onChange={() => handleCategoryToggle(category.id)}
            sx={{ mb: 1 }}
          >
            <AccordionSummary
              expandIcon={<ExpandMore />}
              sx={{
                backgroundColor: isExpanded ? '#f5f5f5' : 'white',
                '&:hover': {
                  backgroundColor: '#f9f9f9'
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      borderRadius: '50%',
                      backgroundColor: category.color,
                      mr: 2,
                    }}
                  />
                  <Typography variant="h6">{category.name}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2" color="text.secondary">
                    {completedInCategory} / {categoryItems.length} completed
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold">
                    {Math.round(categoryProgress)}%
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ pt: 0 }}>
              <Grid container spacing={2}>
                {categoryItems.map(item => (
                  <Grid item xs={12} key={item.id}>
                    <Box sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 2,
                      p: 2,
                      border: '1px solid #e0e0e0',
                      borderRadius: 1,
                      backgroundColor: isItemCompleted(item.id) ? '#f8f9fa' : 'white'
                    }}>
                      <Checkbox
                        checked={isItemCompleted(item.id)}
                        onChange={() => handleItemToggle(item.id)}
                        icon={<Circle size={20} />}
                        checkedIcon={<CheckCircle size={20} />}
                        color="primary"
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{
                              textDecoration: isItemCompleted(item.id) ? 'line-through' : 'none',
                              color: isItemCompleted(item.id) ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {item.title}
                          </Typography>
                          <Chip
                            label={priorityLabels[item.priority]}
                            size="small"
                            sx={{
                              backgroundColor: priorityColors[item.priority],
                              color: 'white',
                              fontSize: '0.7rem',
                            }}
                          />
                          {item.estimatedTime && (
                            <Chip
                              icon={<Clock size={12} />}
                              label={`${item.estimatedTime}m`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </Box>
                        {item.description && (
                          <Typography variant="body2" color="text.secondary">
                            {item.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Empty State */}
      {checklistItems.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AlertCircle size={48} color="#ccc" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No checklist items available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Checklist items will appear here once configured
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 