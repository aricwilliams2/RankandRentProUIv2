import React, { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    IconButton,
    Chip,
    Grid,
    Paper,
    useTheme,
    CircularProgress,
    Alert,
} from '@mui/material';
import {
    Plus,
    Edit,
    Delete,
    GripVertical,
    Calendar,
    User,
    Flag,
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { Task } from "../types";
import { useTaskContext } from "../contexts/TaskContext";
import { useWebsiteContext } from "../contexts/WebsiteContext";

const Tasks = () => {
    const theme = useTheme();
    const { tasks, createTask, updateTask, deleteTask, refreshTasks, loading, error } = useTaskContext();
    const { websites } = useWebsiteContext();

    // Dialog state
    const [taskDialogOpen, setTaskDialogOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskForm, setTaskForm] = useState({
        title: '',
        description: '',
        websiteId: '',
        priority: 'medium' as Task['priority'],
        status: 'todo' as Task['status'],
        assignee: '',
        dueDate: '',
    });

    // Load tasks on component mount
    useEffect(() => {
        refreshTasks();
    }, []);

    // Group tasks by status
    const todoTasks = tasks.filter(task => task.status === 'todo');
    const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
    const completedTasks = tasks.filter(task => task.status === 'completed');

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;

        console.log('Drag end:', { source, destination, draggableId, availableTaskIds: tasks.map(t => t.id) });

        if (source.droppableId === destination.droppableId) {
            // Same column - just reordering
            return;
        }

        // Different column - update status
        const newStatus = destination.droppableId as Task['status'];
        const task = tasks.find(t => t.id === draggableId);

        if (task) {
            try {
                await updateTask(task.id, { status: newStatus });
            } catch (err) {
                console.error('Failed to update task status:', err);
            }
        } else {
            console.error('Task not found for draggableId:', draggableId);
        }
    };

    const handleTaskDialogOpen = (task?: Task) => {
        if (task) {
            setSelectedTask(task);
            setTaskForm({
                title: task.title,
                description: task.description,
                websiteId: task.websiteId || '',
                priority: task.priority,
                status: task.status,
                assignee: task.assignee,
                dueDate: task.dueDate.toISOString().split('T')[0],
            });
        } else {
            setSelectedTask(null);
            setTaskForm({
                title: '',
                description: '',
                websiteId: '',
                priority: 'medium',
                status: 'todo',
                assignee: '',
                dueDate: '',
            });
        }
        setTaskDialogOpen(true);
    };

    const handleTaskDialogClose = () => {
        setTaskDialogOpen(false);
        setSelectedTask(null);
    };

    const handleTaskSubmit = async () => {
        try {
            const taskData = {
                title: taskForm.title,
                description: taskForm.description,
                websiteId: taskForm.websiteId || undefined,
                priority: taskForm.priority,
                status: taskForm.status,
                assignee: taskForm.assignee,
                dueDate: new Date(taskForm.dueDate),
            };

            if (selectedTask) {
                await updateTask(selectedTask.id, taskData);
            } else {
                await createTask(taskData);
            }
            handleTaskDialogClose();
        } catch (err) {
            console.error('Failed to save task:', err);
        }
    };

    const handleTaskDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this task?')) {
            try {
                await deleteTask(id);
            } catch (err) {
                console.error('Failed to delete task:', err);
            }
        }
    };

    const getStatusColor = (status: Task['status']) => {
        switch (status) {
            case 'todo':
                return 'default';
            case 'in_progress':
                return 'warning';
            case 'completed':
                return 'success';
            default:
                return 'default';
        }
    };

    const getPriorityColor = (priority: Task['priority']) => {
        switch (priority) {
            case 'low':
                return 'success';
            case 'medium':
                return 'warning';
            case 'high':
                return 'error';
            default:
                return 'default';
        }
    };

    const TaskCard = ({ task, index }: { task: Task; index: number }) => {
        const website = websites.find((w: any) => w.id === task.websiteId);

        return (
            <Draggable draggableId={task.id} index={index}>
                {(provided, snapshot) => (
                    <Card
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                            mb: 2,
                            cursor: 'grab',
                            '&:active': { cursor: 'grabbing' },
                            transform: snapshot.isDragging ? 'rotate(5deg)' : 'none',
                            boxShadow: snapshot.isDragging ? theme.shadows[8] : theme.shadows[1],
                        }}
                    >
                        <CardContent sx={{ p: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
                                <Box sx={{ cursor: 'grab', mr: 1, mt: 0.5 }}>
                                    <GripVertical size={16} color={theme.palette.text.secondary} />
                                </Box>
                                <Typography variant="subtitle2" fontWeight="medium" sx={{ flex: 1 }}>
                                    {task.title}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                    <IconButton size="small" onClick={() => handleTaskDialogOpen(task)}>
                                        <Edit size={14} />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => handleTaskDelete(task.id)}>
                                        <Delete size={14} />
                                    </IconButton>
                                </Box>
                            </Box>

                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: '0.875rem' }}>
                                {task.description}
                            </Typography>

                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                                <Chip
                                    size="small"
                                    label={task.priority}
                                    color={getPriorityColor(task.priority)}
                                    icon={<Flag size={12} />}
                                />
                                {website && (
                                    <Chip
                                        size="small"
                                        label={website.domain}
                                        variant="outlined"
                                        sx={{ fontSize: '0.75rem' }}
                                    />
                                )}
                            </Box>

                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <User size={12} />
                                    <Typography variant="caption">{task.assignee}</Typography>
                                </Box>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Calendar size={12} />
                                    <Typography variant="caption">{task.dueDate.toLocaleDateString()}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                )}
            </Draggable>
        );
    };

    const TaskColumn = ({
        title,
        tasks,
        droppableId,
        color
    }: {
        title: string;
        tasks: Task[];
        droppableId: string;
        color: string;
    }) => (
        <Grid item xs={12} md={4}>
            <Paper
                sx={{
                    height: 'calc(100vh - 200px)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    border: `2px solid ${color}`,
                    borderRadius: 2,
                }}
            >
                <Box sx={{
                    p: 2,
                    backgroundColor: color,
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <Typography variant="h6" fontWeight="medium">
                        {title}
                    </Typography>
                    <Chip
                        label={tasks.length}
                        size="small"
                        sx={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}
                    />
                </Box>

                <Droppable droppableId={droppableId}>
                    {(provided, snapshot) => (
                        <Box
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            sx={{
                                flex: 1,
                                p: 2,
                                overflowY: 'auto',
                                backgroundColor: snapshot.isDraggingOver ? `${color}10` : 'transparent',
                                transition: 'background-color 0.2s ease',
                            }}
                        >
                            {tasks.map((task, index) => (
                                <TaskCard key={task.id} task={task} index={index} />
                            ))}
                            {provided.placeholder}

                            {tasks.length === 0 && (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    color: 'text.secondary',
                                    border: '2px dashed',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    backgroundColor: 'action.hover'
                                }}>
                                    <Typography variant="body2">No tasks</Typography>
                                </Box>
                            )}
                        </Box>
                    )}
                </Droppable>
            </Paper>
        </Grid>
    );

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    // Ensure tasks are loaded and have valid IDs
    if (!tasks || tasks.length === 0) {
        return (
            <Box sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                    <Typography variant="h4" fontWeight="bold">
                        Task Board
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Plus />}
                        onClick={() => handleTaskDialogOpen()}
                    >
                        Add Task
                    </Button>
                </Box>
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        No tasks yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Create your first task to get started
                    </Typography>
                </Box>
            </Box>
        );
    }

    // Debug logging
    console.log('Tasks state:', tasks.map(t => ({ id: t.id, title: t.title, status: t.status })));
    console.log('Filtered tasks:', {
        todo: todoTasks.map(t => t.id),
        inProgress: inProgressTasks.map(t => t.id),
        completed: completedTasks.map(t => t.id)
    });

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Task Board
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Plus />}
                    onClick={() => handleTaskDialogOpen()}
                >
                    Add Task
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                    {error}
                </Alert>
            )}

            <DragDropContext onDragEnd={handleDragEnd}>
                <Grid container spacing={3}>
                    <TaskColumn
                        title="To Do"
                        tasks={todoTasks}
                        droppableId="todo"
                        color={theme.palette.grey[500]}
                    />
                    <TaskColumn
                        title="In Progress"
                        tasks={inProgressTasks}
                        droppableId="in_progress"
                        color={theme.palette.warning.main}
                    />
                    <TaskColumn
                        title="Completed"
                        tasks={completedTasks}
                        droppableId="completed"
                        color={theme.palette.success.main}
                    />
                </Grid>
            </DragDropContext>

            {/* Task Dialog */}
            <Dialog open={taskDialogOpen} onClose={handleTaskDialogClose} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {selectedTask ? 'Edit Task' : 'Add New Task'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Title"
                            value={taskForm.title}
                            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                            fullWidth
                            required
                        />

                        <TextField
                            label="Description"
                            value={taskForm.description}
                            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                            fullWidth
                            multiline
                            rows={3}
                            required
                        />

                        <FormControl fullWidth>
                            <InputLabel>Website</InputLabel>
                            <Select
                                value={taskForm.websiteId}
                                onChange={(e) => setTaskForm({ ...taskForm, websiteId: e.target.value })}
                                label="Website"
                            >
                                <MenuItem value="">No Website</MenuItem>
                                {websites.map((website: any) => (
                                    <MenuItem key={website.id} value={website.id}>
                                        {website.domain}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <FormControl fullWidth>
                                <InputLabel>Priority</InputLabel>
                                <Select
                                    value={taskForm.priority}
                                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as Task['priority'] })}
                                    label="Priority"
                                >
                                    <MenuItem value="low">Low</MenuItem>
                                    <MenuItem value="medium">Medium</MenuItem>
                                    <MenuItem value="high">High</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth>
                                <InputLabel>Status</InputLabel>
                                <Select
                                    value={taskForm.status}
                                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as Task['status'] })}
                                    label="Status"
                                >
                                    <MenuItem value="todo">To Do</MenuItem>
                                    <MenuItem value="in_progress">In Progress</MenuItem>
                                    <MenuItem value="completed">Completed</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <TextField
                                label="Assignee"
                                value={taskForm.assignee}
                                onChange={(e) => setTaskForm({ ...taskForm, assignee: e.target.value })}
                                fullWidth
                                required
                            />

                            <TextField
                                label="Due Date"
                                type="date"
                                value={taskForm.dueDate}
                                onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                                fullWidth
                                required
                                InputLabelProps={{ shrink: true }}
                            />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleTaskDialogClose}>Cancel</Button>
                    <Button onClick={handleTaskSubmit} variant="contained">
                        {selectedTask ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Tasks;
