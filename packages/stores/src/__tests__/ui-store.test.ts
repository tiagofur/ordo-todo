import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore, defaultUIState } from '../ui-store.js';

describe('useUIStore', () => {
    beforeEach(() => {
        useUIStore.setState(defaultUIState);
    });

    it('should initialize with default state', () => {
        const state = useUIStore.getState();
        expect(state.sidebarCollapsed).toBe(false);
        expect(state.createTaskDialogOpen).toBe(false);
    });

    it('should toggle sidebar', () => {
        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarCollapsed).toBe(true);

        useUIStore.getState().toggleSidebar();
        expect(useUIStore.getState().sidebarCollapsed).toBe(false);
    });

    it('should handle dialog actions', () => {
        useUIStore.getState().openCreateTaskDialog();
        expect(useUIStore.getState().createTaskDialogOpen).toBe(true);

        useUIStore.getState().closeCreateTaskDialog();
        expect(useUIStore.getState().createTaskDialogOpen).toBe(false);
    });

    it('should handle panel actions', () => {
        useUIStore.getState().openTaskDetailPanel('task-123');
        expect(useUIStore.getState().taskDetailPanelOpen).toBe(true);
        expect(useUIStore.getState().selectedTaskId).toBe('task-123');

        useUIStore.getState().closeTaskDetailPanel();
        expect(useUIStore.getState().taskDetailPanelOpen).toBe(false);
        expect(useUIStore.getState().selectedTaskId).toBe(null);
    });

    it('should handle sort actions', () => {
        // Initial: priority, asc
        useUIStore.getState().setTasksSort('dueDate');
        expect(useUIStore.getState().tasksSortBy).toBe('dueDate');
        expect(useUIStore.getState().tasksSortOrder).toBe('asc');

        // Toggle same field -> desc
        useUIStore.getState().setTasksSort('dueDate');
        expect(useUIStore.getState().tasksSortOrder).toBe('desc');

        // Explicit order
        useUIStore.getState().setTasksSort('title', 'asc');
        expect(useUIStore.getState().tasksSortBy).toBe('title');
        expect(useUIStore.getState().tasksSortOrder).toBe('asc');
    });

    it('should reset UI', () => {
        useUIStore.getState().setSidebarCollapsed(true);
        useUIStore.getState().openAboutDialog();

        useUIStore.getState().resetUI();

        expect(useUIStore.getState().sidebarCollapsed).toBe(false);
        expect(useUIStore.getState().aboutDialogOpen).toBe(false);
    });
});
