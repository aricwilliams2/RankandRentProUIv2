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
} from '@mui/material';
import {
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
} from 'lucide-react';
import type { ChecklistItem, ChecklistCategory } from '../types';
import { checklistCategories, checklistItems } from '../data/clientChecklistData';

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
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  // Calculate progress
  const totalItems = checklistItems.length;
  const completedCount = completedItems.size;
  const progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;

  const handleItemToggle = (itemId: string) => {
    const newCompletedItems = new Set(completedItems);
    if (newCompletedItems.has(itemId)) {
      newCompletedItems.delete(itemId);
    } else {
      newCompletedItems.add(itemId);
    }
    setCompletedItems(newCompletedItems);

    // Notify parent component
    onUpdate?.({
      clientId,
      completedItems: Array.from(newCompletedItems),
      progress,
      totalItems,
      completedCount: newCompletedItems.size,
    });
  };

  // Group items by category
  const groupedItems = checklistCategories.map(category => ({
    ...category,
    items: checklistItems.filter(item => item.category === category.id)
  }));

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
            <Typography variant="h4" color="primary">
              {progress}%
            </Typography>
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
          </Box>
        </CardContent>
      </Card>

      {/* Checklist Items by Category */}
      {groupedItems.map(category => (
        <Card key={category.id} sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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

            <Grid container spacing={2}>
              {category.items.map(item => (
                <Grid item xs={12} key={item.id}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Checkbox
                      checked={completedItems.has(item.id)}
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
                            textDecoration: completedItems.has(item.id) ? 'line-through' : 'none',
                            color: completedItems.has(item.id) ? 'text.secondary' : 'text.primary',
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
          </CardContent>
        </Card>
      ))}

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