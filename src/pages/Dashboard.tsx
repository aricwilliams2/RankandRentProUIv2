import React, { useEffect } from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  CircularProgress,
  Alert,
} from "@mui/material";
import { TrendingUp, Users, Globe2, Phone, DollarSign, Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import type { Website, Task } from "../types";
import { useTaskContext } from "../contexts/TaskContext";
import { useApiContext } from "../contexts/ApiContext";



export default function Dashboard() {
  const { tasks, createTask, updateTask, deleteTask, refreshTasks, loading, error } = useTaskContext();
  const { 
    websites, 
    clients, 
    invoices, 
    getWebsites, 
    getClients, 
    getInvoices,
    loading: apiLoading 
  } = useApiContext();

  const theme = useTheme();
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = React.useState("all");
  const [submitting, setSubmitting] = React.useState(false);
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    websiteId: "",
    priority: "medium",
    status: "todo",
    assignee: "",
    dueDate: "",
  });

  // Load tasks on component mount
  useEffect(() => {
    refreshTasks();
    getWebsites();
    getClients();
    getInvoices();
  }, []); // Remove refreshTasks from dependencies to prevent infinite loop

  // Calculate dynamic stats from real data
  const calculateStats = React.useMemo(() => {
    // Total Revenue from paid invoices
    const totalRevenue = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + invoice.amount, 0);

    // Active Websites
    const activeWebsites = websites.filter(website => website.status === 'active').length;

    // Total Leads from all websites
    const totalLeads = websites.reduce((sum, website) => sum + (website.leads?.length || 0), 0);

    // Active Clients
    const activeClients = clients.length;

    // Total Phone Numbers from all websites
    const totalPhoneNumbers = websites.reduce((sum, website) => sum + (website.phoneNumbers?.length || 0), 0);

    // Calculate changes (mock percentages since we don't have historical data)
    // In a real app, you'd calculate these from historical data
    const getRandomChange = () => {
      const isPositive = Math.random() > 0.3; // 70% chance of positive change
      const percentage = (Math.random() * 20 + 5).toFixed(1); // 5-25% change
      return isPositive ? `+${percentage}%` : `-${percentage}%`;
    };

    return [
      { 
        label: "Total Revenue", 
        value: `$${totalRevenue.toLocaleString()}`, 
        change: getRandomChange(), 
        icon: DollarSign,
        isPositive: totalRevenue > 0
      },
      { 
        label: "Active Websites", 
        value: activeWebsites.toString(), 
        change: activeWebsites > 0 ? `+${Math.floor(activeWebsites * 0.1) || 1}` : "0", 
        icon: Globe2,
        isPositive: activeWebsites > 0
      },
      { 
        label: "Total Leads", 
        value: totalLeads.toString(), 
        change: totalLeads > 0 ? `+${Math.floor(totalLeads * 0.15) || 1}` : "0", 
        icon: TrendingUp,
        isPositive: totalLeads > 0
      },
      { 
        label: "Active Clients", 
        value: activeClients.toString(), 
        change: activeClients > 0 ? `+${Math.floor(activeClients * 0.1) || 1}` : "0", 
        icon: Users,
        isPositive: activeClients > 0
      },
      { 
        label: "Phone Numbers", 
        value: totalPhoneNumbers.toString(), 
        change: totalPhoneNumbers > 0 ? `+${Math.floor(totalPhoneNumbers * 0.2) || 1}` : "0", 
        icon: Phone,
        isPositive: totalPhoneNumbers > 0
      },
    ];
  }, [websites, clients, invoices]);
  const handleTaskDialogOpen = (task?: Task) => {
    if (task) {
      setSelectedTask(task);
      setFormData({
        title: task.title,
        description: task.description,
        websiteId: task.websiteId,
        priority: task.priority,
        status: task.status,
        assignee: task.assignee,
        dueDate: task.dueDate.toISOString().split("T")[0],
      });
    } else {
      setSelectedTask(null);
      setFormData({
        title: "",
        description: "",
        websiteId: "",
        priority: "medium",
        status: "todo",
        assignee: "",
        dueDate: "",
      });
    }
    setTaskDialogOpen(true);
  };

  const handleTaskDialogClose = () => {
    setTaskDialogOpen(false);
    setSelectedTask(null);
    setSubmitting(false);
  };

  const handleTaskSubmit = async () => {
    setSubmitting(true);
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        websiteId: formData.websiteId,
        status: formData.status as "todo" | "in_progress" | "completed",
        priority: formData.priority as "low" | "medium" | "high",
        assignee: formData.assignee,
        dueDate: new Date(formData.dueDate),
      };

      if (selectedTask) {
        await updateTask(selectedTask.id, taskData);
      } else {
        await createTask(taskData);
      }
      
      handleTaskDialogClose();
    } catch (err) {
      console.error("Failed to save task:", err);
      // Error is handled by the context
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(id);
      } catch (err) {
        console.error("Failed to delete task:", err);
        // Error is handled by the context
      }
    }
  };

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "completed":
        return "success";
      case "in_progress":
        return "warning";
      case "todo":
        return "info";
      default:
        return "default";
    }
  };

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
        return "success";
      default:
        return "default";
    }
  };

  const filteredTasks = tasks.filter((task) => {
    if (taskFilter === "all") return true;
    return task.status === taskFilter;
  });

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Dashboard Overview
        </Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <ButtonGroup variant="outlined" size="small">
            <Button onClick={() => setTaskFilter("all")} variant={taskFilter === "all" ? "contained" : "outlined"}>
              All
            </Button>
            <Button onClick={() => setTaskFilter("todo")} variant={taskFilter === "todo" ? "contained" : "outlined"}>
              To Do
            </Button>
            <Button onClick={() => setTaskFilter("in_progress")} variant={taskFilter === "in_progress" ? "contained" : "outlined"}>
              In Progress
            </Button>
            <Button onClick={() => setTaskFilter("completed")} variant={taskFilter === "completed" ? "contained" : "outlined"}>
              Completed
            </Button>
          </ButtonGroup>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => handleTaskDialogOpen()}>
            Add Task
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {calculateStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} md={6} lg={4} xl={2.4} key={stat.label}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Icon size={24} color={theme.palette.primary.main} />
                    <Typography 
                      color={stat.isPositive ? "success.main" : "error.main"} 
                      variant="body2"
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                  <Typography variant="h4" fontWeight="bold" sx={{ mb: 0.5 }}>
                    {stat.value}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    {stat.label}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 3 }}>
                Project Tasks
              </Typography>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Website</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredTasks.map((task) => {
                        const website = websites.find((w) => w.id === task.websiteId);
                        return (
                          <TableRow key={task.id}>
                            <TableCell>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {task.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {task.description}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Globe2 size={16} />
                                <Typography variant="body2">{website?.domain || "Unassigned"}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Typography variant="body2">{task.assignee}</Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Calendar size={16} />
                                <Typography variant="body2">{task.dueDate.toLocaleDateString()}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={task.priority} color={getPriorityColor(task.priority)} />
                            </TableCell>
                            <TableCell>
                              <Chip size="small" label={task.status} color={getStatusColor(task.status)} />
                            </TableCell>
                            <TableCell align="right">
                              <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
                                <IconButton size="small" onClick={() => handleTaskDialogOpen(task)}>
                                  <Edit2 size={16} />
                                </IconButton>
                                <IconButton size="small" color="error" onClick={() => handleTaskDelete(task.id)}>
                                  <Trash2 size={16} />
                                </IconButton>
                              </Box>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" sx={{ mb: 2 }}>
                Recent Activity
              </Typography>
              <Box sx={{ "& > *:not(:last-child)": { mb: 2 } }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "success.main",
                      }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      New lead captured
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    2 minutes ago
                  </Typography>
                </Box>
                <Divider />
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    p: 1,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                      }}
                    />
                    <Typography variant="body2" fontWeight="medium">
                      Website ranking improved
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    1 hour ago
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={handleTaskDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Title" fullWidth value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            <TextField label="Description" fullWidth multiline rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Website</InputLabel>
              <Select value={formData.websiteId} label="Website" onChange={(e) => setFormData({ ...formData, websiteId: e.target.value })}>
                {websites.map((website) => (
                  <MenuItem key={website.id} value={website.id}>
                    {website.domain}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField label="Assignee" fullWidth value={formData.assignee} onChange={(e) => setFormData({ ...formData, assignee: e.target.value })} />
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select value={formData.priority} label="Priority" onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select value={formData.status} label="Status" onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
            <TextField label="Due Date" type="date" fullWidth value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTaskDialogClose}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleTaskSubmit}
            disabled={submitting || !formData.title || !formData.dueDate}
          >
            {submitting ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                <span>{selectedTask ? "Updating..." : "Creating..."}</span>
              </Box>
            ) : (
              selectedTask ? "Update" : "Add"
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
