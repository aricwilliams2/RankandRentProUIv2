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
  const { clients } = useClientContext();
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
import { useClientContext } from "../contexts/ClientContext";
import { useLeadContext } from "../contexts/LeadContext";

import { TrendingUp, Users, Globe2, Plus, Calendar, Edit2, Trash2 } from "lucide-react";

export default function Dashboard() {
    dueDate: "",
  });
      { 
import { TrendingUp, Users, Globe2, Plus, Calendar, Edit2, Trash2 } from "lucide-react";
        value: totalLeads.toString(), 
        change: totalLeads > 0 ? `+${Math.floor(totalLeads * 0.1) || 1}` : "0", 
        icon: TrendingUp,
        isPositive: totalLeads > 0
      },
    ];
  }, [websites, clients, leads]);

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
    setSubmitting(false);
  };
  // Calculate stats from available data
  const handleTaskSubmit = async () => {
        status: formData.status as "todo" | "in_progress" | "completed",
        priority: formData.priority as "low" | "medium" | "high",
        assignee: formData.assignee,
        dueDate: new Date(formData.dueDate),
      };

    } finally {
      setSubmitting(false);
import { useClientContext } from "../contexts/ClientContext";
    switch (status) {
      case "completed":
        change: totalLeads > 0 ? `+${Math.floor(totalLeads * 0.1) || 1}` : "0", 
      case "in_progress":
        return "warning";
      case "todo":
  const { clients } = useClientContext();
    switch (priority) {
      case "high":
        return "error";
      case "medium":
        return "warning";
      case "low":
    if (taskFilter === "all") return true;
    return task.status === taskFilter;
  });

  return (
    <Box>
      {error && (
        </Alert>
      )}
  // Calculate stats from available data
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
                    />
                    <Typography variant="body2" fontWeight="medium">
                      New lead captured
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                  }}
                >
                    1 hour ago
                  </Typography>
                </Box>
        change: totalLeads > 0 ? `+${Math.floor(totalLeads * 0.1) || 1}` : "0", 
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={handleTaskDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedTask ? "Edit Task" : "Add New Task"}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
                    {website.domain}
                  </MenuItem>
                <MenuItem value="1">Website 1</MenuItem>
                <MenuItem value="2">Website 2</MenuItem>
                <MenuItem value="3">Website 3</MenuItem>
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
