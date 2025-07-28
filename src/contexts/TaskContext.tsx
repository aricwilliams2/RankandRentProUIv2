import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { Task, TaskContextType } from "../types";

const TaskContext = createContext<TaskContextType | undefined>(undefined);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const fetchTasksAPI = async (): Promise<Task[]> => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  const json = await response.json();
  return json.data.map((task: any) => ({
    id: String(task.id),
    websiteId: String(task.website_id),
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    assignee: task.assignee,
    dueDate: new Date(task.due_date),
    createdAt: new Date(task.created_at),
    updatedAt: new Date(task.updated_at),
  }));
};

const createTaskAPI = async (task: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(task),
  });
  const created = await response.json();
  return {
    id: String(created.id),
    websiteId: String(created.website_id),
    title: created.title,
    description: created.description,
    status: created.status,
    priority: created.priority,
    assignee: created.assignee,
    dueDate: new Date(created.due_date),
    createdAt: new Date(created.created_at),
    updatedAt: new Date(created.updated_at),
  };
};

const updateTaskAPI = async (id: string, updates: Partial<Task>): Promise<Task> => {
  const response = await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const updated = await response.json();
  return {
    id: String(updated.id),
    websiteId: String(updated.website_id),
    title: updated.title,
    description: updated.description,
    status: updated.status,
    priority: updated.priority,
    assignee: updated.assignee,
    dueDate: new Date(updated.due_date),
    createdAt: new Date(updated.created_at),
    updatedAt: new Date(updated.updated_at),
  };
};

const deleteTaskAPI = async (id: string) => {
  await fetch(`${API_BASE_URL}/tasks/${id}`, {
    method: "DELETE",
  });
};

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTasksAPI();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, []);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const data = await fetchTasksAPI();
        setTasks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  const createTask = useCallback(async (task: Partial<Task>) => {
    try {
      setError(null);
      const newTask = await createTaskAPI(task);
      setTasks((prev) => [...prev, newTask]);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create task");
      throw err;
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updated = await updateTaskAPI(id, updates);
      setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
      throw err;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      await deleteTaskAPI(id);
      setTasks((prev) => prev.filter((task) => task.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  }, []);

  return <TaskContext.Provider value={{ tasks, createTask, updateTask, deleteTask, refreshTasks, loading, error }}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return context;
};
