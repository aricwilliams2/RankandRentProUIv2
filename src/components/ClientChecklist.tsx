import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Chip,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  ExpandMore,
  CheckCircle,
  Circle,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Refresh,
  Download,
  Print,
  Share,
  Edit,
  Delete,
  Add,
  Visibility,
  VisibilityOff,
} from 'lucide-react';
import type { ChecklistItem, ChecklistCategory, ClientChecklist } from '../types';
import { checklistCategories, checklistItems } from '../data/clientChecklistData';

interface ClientChecklistProps {
  clientId: string;
  clientName: string;
  onUpdate?: (checklist: ClientChecklist) => void;
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
  const [checklist, setChecklist] = useState<ClientChecklist>({
    id: `checklist-${clientId}`,
    clientId,
    items: checklistItems.map(item => ({ ...item })),
    totalItems: checklistItems.length,
    completedItems: 0,
    progress: 0,
    lastUpdated: new Date(),
    createdAt: new Date(),
  });

  const [filters, setFilters] = useState({
    priority: 'all',
    status: 'all',
    category: 'all',
    search: '',
  });

  const [showCompleted, setShowCompleted] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ChecklistItem | null>(null);

  // Calculate progress
  const progress = useMemo(() => {
    const completed = checklist.items.filter(item => item.isCompleted).length;
    const total = checklist.items.length;
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }, [checklist.items]);

  // Filter items based on current filters
  const filteredItems = useMemo(() => {
    return checklist.items.filter(item => {
      const matchesPriority = filters.priority === 'all' || item.priority === filters.priority;
      const matchesStatus = filters.status === 'all' || 
        (filters.status === 'completed' && item.isCompleted) ||
        (filters.status === 'pending' && !item.isCompleted);
      const matchesCategory = filters.category === 'all' || item.category === filters.category;
      const matchesSearch = filters.search === '' || 
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(filters.search.toLowerCase()));

      return matchesPriority && matchesStatus && matchesCategory && matchesSearch;
    });
  }, [checklist.items, filters]);

  // Group items by category
  const groupedItems = useMemo(() => {
    const groups: { [key: string]: ChecklistItem[] } = {};
    filteredItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredItems]);

  const handleItemToggle = (itemId: string) => {
    const updatedItems = checklist.items.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          isCompleted: !item.isCompleted,
          completedAt: !item.isCompleted ? new Date() : undefined,
          completedBy: !item.isCompleted ? 'Current User' : undefined,
        };
      }
      return item;
    });

    const updatedChecklist = {
      ...checklist,
      items: updatedItems,
      completedItems: updatedItems.filter(item => item.isCompleted).length,
      progress: Math.round((updatedItems.filter(item => item.isCompleted).length / updatedItems.length) * 100),
      lastUpdated: new Date(),
    };

    setChecklist(updatedChecklist);
    onUpdate?.(updatedChecklist);
  };

  const handleEditItem = (item: ChecklistItem) => {
    setEditingItem(item);
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;

    const updatedItems = checklist.items.map(item => 
      item.id === editingItem.id ? editingItem : item
    );

    const updatedChecklist = {
      ...checklist,
      items: updatedItems,
      lastUpdated: new Date(),
    };

    setChecklist(updatedChecklist);
    onUpdate?.(updatedChecklist);
    setEditDialogOpen(false);
    setEditingItem(null);
  };

  const getCategoryStats = (categoryId: string) => {
    const categoryItems = checklist.items.filter(item => item.category === categoryId);
    const completed = categoryItems.filter(item => item.isCompleted).length;
    const total = categoryItems.length;
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
  };

  const getPriorityStats = () => {
    const stats = { critical: 0, high: 0, medium: 0, low: 0 };
    checklist.items.forEach(item => {
      if (!item.isCompleted) {
        stats[item.priority]++;
      }
    });
    return stats;
  };

  const priorityStats = getPriorityStats();

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          {clientName} - Client Checklist
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Track progress and manage tasks for {clientName}
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
              {checklist.completedItems} of {checklist.totalItems} tasks completed
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Last updated: {checklist.lastUpdated.toLocaleDateString()}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Priority Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error">
                {priorityStats.critical}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Critical Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main">
                {priorityStats.high}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                High Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main">
                {priorityStats.medium}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Medium Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main">
                {priorityStats.low}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Low Priority
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: <Search size={16} />,
              }}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
              >
                <MenuItem value="all">All Priorities</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Category</InputLabel>
              <Select
                value={filters.category}
                label="Category"
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {checklistCategories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setShowCompleted(!showCompleted)}
              startIcon={showCompleted ? <VisibilityOff size={16} /> : <Visibility size={16} />}
            >
              {showCompleted ? 'Hide' : 'Show'} Completed
            </Button>

            <Button
              variant="outlined"
              size="small"
              onClick={() => setFilters({ priority: 'all', status: 'all', category: 'all', search: '' })}
              startIcon={<Refresh size={16} />}
            >
              Clear Filters
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Categories */}
      {checklistCategories.map(category => {
        const stats = getCategoryStats(category.id);
        const categoryItems = filteredItems.filter(item => item.category === category.id);
        
        if (categoryItems.length === 0) return null;

        return (
          <Accordion key={category.id} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    backgroundColor: category.color,
                    mr: 2,
                  }}
                />
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6">{category.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.description}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {stats.completed}/{stats.total}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={stats.percentage}
                    sx={{ width: 60, height: 6, borderRadius: 3 }}
                  />
                </Box>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                {categoryItems
                  .filter(item => showCompleted || !item.isCompleted)
                  .map(item => (
                    <Grid item xs={12} key={item.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                            <Checkbox
                              checked={item.isCompleted}
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
                                    textDecoration: item.isCompleted ? 'line-through' : 'none',
                                    color: item.isCompleted ? 'text.secondary' : 'text.primary',
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
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                  {item.description}
                                </Typography>
                              )}
                              {item.isCompleted && item.completedAt && (
                                <Typography variant="caption" color="text.secondary">
                                  Completed on {item.completedAt.toLocaleDateString()}
                                  {item.completedBy && ` by ${item.completedBy}`}
                                </Typography>
                              )}
                            </Box>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="Edit task">
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditItem(item)}
                                >
                                  <Edit size={16} />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          {editingItem && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Task Title"
                value={editingItem.title}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                value={editingItem.description || ''}
                onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editingItem.priority}
                  label="Priority"
                  onChange={(e) => setEditingItem({ ...editingItem, priority: e.target.value as any })}
                >
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Estimated Time (minutes)"
                type="number"
                value={editingItem.estimatedTime || ''}
                onChange={(e) => setEditingItem({ ...editingItem, estimatedTime: parseInt(e.target.value) || undefined })}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveEdit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Empty State */}
      {filteredItems.length === 0 && (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <AlertCircle size={48} color="#ccc" />
            <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
              No tasks found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try adjusting your filters or search terms
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 