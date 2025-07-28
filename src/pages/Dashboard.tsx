import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardContent,
  Checkbox,
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
} from "@mui/material";
import { TrendingUp, Users, Globe2, Phone, DollarSign, Plus, Calendar, Edit2, Trash2 } from "lucide-react";
import type { Website, Task } from "../types";

const stats = [
  { label: "Total Revenue", value: "$24,500", change: "+12.5%", icon: DollarSign },
  { label: "Active Websites", value: "15", change: "+2", icon: Globe2 },
  { label: "Total Leads", value: "234", change: "+22%", icon: TrendingUp },
  { label: "Active Clients", value: "8", change: "+1", icon: Users },
  { label: "Phone Numbers", value: "12", change: "+3", icon: Phone },
];

const mockTasks: Task[] = [
  {
    id: "1",
    websiteId: "1",
    title: "Optimize meta descriptions",
    description: "Update meta descriptions for all service pages",
    status: "in_progress",
    priority: "high",
    assignee: "John Doe",
    dueDate: new Date("2024-03-25"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    websiteId: "1",
    title: "Build local citations",
    description: "Create business listings on top local directories",
    status: "todo",
    priority: "medium",
    assignee: "Jane Smith",
    dueDate: new Date("2024-03-28"),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockWebsites: Website[] = [
  {
    id: "1",
    domain: "acmeplumbing.com",
    niche: "Plumbing",
    status: "active",
    monthlyRevenue: 2500,
    phoneNumbers: [],
    leads: [],
    seoMetrics: {
      domainAuthority: 35,
      backlinks: 150,
      organicKeywords: 500,
      organicTraffic: 2000,
      topKeywords: ["plumbing", "emergency plumber"],
      competitors: ["competitor1.com"],
      lastUpdated: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function Dashboard() {
  const theme = useTheme();
  const [tasks, setTasks] = React.useState<Task[]>(mockTasks);
  const [websites] = React.useState<Website[]>(mockWebsites);
  const [taskDialogOpen, setTaskDialogOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);
  const [taskFilter, setTaskFilter] = React.useState("all");
  const [formData, setFormData] = React.useState({
    title: "",
    description: "",
    websiteId: "",
    priority: "medium",
    status: "todo",
    assignee: "",
    dueDate: "",
  });

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
  };

  const handleTaskSubmit = () => {
    if (selectedTask) {
      setTasks(
        tasks.map((task) =>
          task.id === selectedTask.id
            ? {
                ...task,
                ...formData,
                dueDate: new Date(formData.dueDate),
                updatedAt: new Date(),
              }
            : task
        )
      );
    } else {
      const newTask: Task = {
        id: String(Date.now()),
        ...formData,
        dueDate: new Date(formData.dueDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setTasks([...tasks, newTask]);
    }
    handleTaskDialogClose();
  };

  const handleTaskDelete = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
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
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Grid item xs={12} md={6} lg={4} xl={2.4} key={stat.label}>
              <Card>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Icon size={24} color={theme.palette.primary.main} />
                    <Typography color="success.main" variant="body2">
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
          <Button variant="contained" onClick={handleTaskSubmit}>
            {selectedTask ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
