/**
 * Offline Store - Manages local database operations
 * 
 * Provides a unified interface for CRUD operations that work offline
 */

import { create } from 'zustand';

// Types from preload
interface LocalTask {
  id: string;
  workspace_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  status: string;
  priority: string;
  due_date?: number | null;
  estimated_pomodoros: number;
  completed_pomodoros: number;
  position: number;
  parent_task_id?: string | null;
  created_at: number;
  updated_at: number;
  completed_at?: number | null;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

interface LocalWorkspace {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  owner_id: string;
  created_at: number;
  updated_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

interface LocalProject {
  id: string;
  workspace_id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  status: string;
  start_date?: number | null;
  end_date?: number | null;
  created_at: number;
  updated_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

interface LocalPomodoroSession {
  id: string;
  task_id?: string | null;
  workspace_id: string;
  type: 'focus' | 'short_break' | 'long_break';
  duration: number;
  started_at: number;
  completed_at?: number | null;
  was_interrupted: number;
  notes?: string | null;
  created_at: number;
  is_synced: number;
  sync_status: string;
  local_updated_at: number;
  server_updated_at?: number | null;
  is_deleted: number;
}

interface OfflineStore {
  // State
  tasks: LocalTask[];
  workspaces: LocalWorkspace[];
  projects: LocalProject[];
  sessions: LocalPomodoroSession[];
  isLoading: boolean;
  error: string | null;

  // Task actions
  loadTasks: (workspaceId: string) => Promise<void>;
  loadTasksByProject: (projectId: string) => Promise<void>;
  createTask: (task: Partial<LocalTask>) => Promise<LocalTask | null>;
  updateTask: (id: string, updates: Partial<LocalTask>) => Promise<LocalTask | null>;
  deleteTask: (id: string) => Promise<boolean>;

  // Workspace actions
  loadWorkspaces: () => Promise<void>;
  createWorkspace: (workspace: Partial<LocalWorkspace>) => Promise<LocalWorkspace | null>;

  // Project actions
  loadProjects: (workspaceId: string) => Promise<void>;
  createProject: (project: Partial<LocalProject>) => Promise<LocalProject | null>;

  // Session actions
  loadSessions: (workspaceId: string, startDate?: number, endDate?: number) => Promise<void>;
  createSession: (session: Partial<LocalPomodoroSession>) => Promise<LocalPomodoroSession | null>;

  // Utility
  clearError: () => void;
}

const isElectron = typeof window !== 'undefined' && window.electronAPI;

export const useOfflineStore = create<OfflineStore>((set, get) => ({
  // Initial state
  tasks: [],
  workspaces: [],
  projects: [],
  sessions: [],
  isLoading: false,
  error: null,

  // Task actions
  loadTasks: async (workspaceId) => {
    if (!isElectron) return;
    
    set({ isLoading: true, error: null });
    try {
      const tasks = await window.electronAPI.db.task.getByWorkspace(workspaceId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false 
      });
    }
  },

  loadTasksByProject: async (projectId) => {
    if (!isElectron) return;
    
    set({ isLoading: true, error: null });
    try {
      const tasks = await window.electronAPI.db.task.getByProject(projectId);
      set({ tasks, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load tasks',
        isLoading: false 
      });
    }
  },

  createTask: async (task) => {
    if (!isElectron) return null;
    
    try {
      const newTask = await window.electronAPI.db.task.create(task as any);
      set((state) => ({ tasks: [...state.tasks, newTask] }));
      return newTask;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create task' });
      return null;
    }
  },

  updateTask: async (id, updates) => {
    if (!isElectron) return null;
    
    try {
      const updatedTask = await window.electronAPI.db.task.update(id, updates);
      if (updatedTask) {
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === id ? updatedTask : t)),
        }));
      }
      return updatedTask;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to update task' });
      return null;
    }
  },

  deleteTask: async (id) => {
    if (!isElectron) return false;
    
    try {
      const success = await window.electronAPI.db.task.delete(id);
      if (success) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
      }
      return success;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to delete task' });
      return false;
    }
  },

  // Workspace actions
  loadWorkspaces: async () => {
    if (!isElectron) return;
    
    set({ isLoading: true, error: null });
    try {
      const workspaces = await window.electronAPI.db.workspace.getAll();
      set({ workspaces, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load workspaces',
        isLoading: false 
      });
    }
  },

  createWorkspace: async (workspace) => {
    if (!isElectron) return null;
    
    try {
      const newWorkspace = await window.electronAPI.db.workspace.create(workspace as any);
      set((state) => ({ workspaces: [...state.workspaces, newWorkspace] }));
      return newWorkspace;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create workspace' });
      return null;
    }
  },

  // Project actions
  loadProjects: async (workspaceId) => {
    if (!isElectron) return;
    
    set({ isLoading: true, error: null });
    try {
      const projects = await window.electronAPI.db.project.getByWorkspace(workspaceId);
      set({ projects, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load projects',
        isLoading: false 
      });
    }
  },

  createProject: async (project) => {
    if (!isElectron) return null;
    
    try {
      const newProject = await window.electronAPI.db.project.create(project as any);
      set((state) => ({ projects: [...state.projects, newProject] }));
      return newProject;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create project' });
      return null;
    }
  },

  // Session actions
  loadSessions: async (workspaceId, startDate, endDate) => {
    if (!isElectron) return;
    
    set({ isLoading: true, error: null });
    try {
      const sessions = await window.electronAPI.db.session.getByWorkspace(
        workspaceId,
        startDate,
        endDate
      );
      set({ sessions, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load sessions',
        isLoading: false 
      });
    }
  },

  createSession: async (session) => {
    if (!isElectron) return null;
    
    try {
      const newSession = await window.electronAPI.db.session.create(session as any);
      set((state) => ({ sessions: [...state.sessions, newSession] }));
      return newSession;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create session' });
      return null;
    }
  },

  // Utility
  clearError: () => set({ error: null }),
}));
