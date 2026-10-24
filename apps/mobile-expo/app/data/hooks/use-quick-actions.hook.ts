import { useEffect } from 'react';
import * as QuickActions from 'expo-quick-actions';
import { Platform } from 'react-native';

interface QuickAction {
    id: string;
    title: string;
    subtitle?: string;
    icon?: string;
    data?: any;
}

export function useQuickActions() {
    useEffect(() => {
        // Set up quick actions
        const actions: QuickAction[] = [
            {
                id: 'new-task',
                title: 'New Task',
                subtitle: 'Create a new task quickly',
                icon: Platform.OS === 'ios' ? 'plus' : 'ic_shortcut_addtask',
                data: { action: 'new-task' }
            },
            {
                id: 'quick-timer',
                title: 'Quick Timer',
                subtitle: 'Start a Pomodoro timer',
                icon: Platform.OS === 'ios' ? 'timer' : 'ic_shortcut_timer',
                data: { action: 'quick-timer' }
            },
            {
                id: 'search',
                title: 'Search',
                subtitle: 'Find tasks and projects',
                icon: Platform.OS === 'ios' ? 'search' : 'ic_shortcut_search',
                data: { action: 'search' }
            }
        ];

        QuickActions.setItems(actions).catch((error: any) => {
            console.error('[QuickActions] Failed to set items:', error);
        });

        // Listen for quick action presses
        const subscription = QuickActions.addListener((action: any) => {
            console.log('[QuickActions] Action pressed:', action);

            // Dispatch custom event for the app to handle
            // You might want to use navigation or context here
            switch (action.id) {
                case 'new-task':
                    // Navigate to new task screen or dispatch event
                    console.log('[QuickActions] New task action');
                    break;
                case 'quick-timer':
                    // Start timer or navigate to timer screen
                    console.log('[QuickActions] Quick timer action');
                    break;
                case 'search':
                    // Navigate to search screen
                    console.log('[QuickActions] Search action');
                    break;
                default:
                    console.log('[QuickActions] Unknown action:', action.id);
            }
        });

        return () => {
            subscription?.remove();
        };
    }, []);

    return {
        // You can add methods here if needed
    };
}