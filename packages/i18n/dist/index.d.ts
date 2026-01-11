/**
 * Shared Internationalization Package for Ordo-Todo
 *
 * This package provides:
 * - Shared translation files for all supported locales
 * - Utility functions to convert between i18n library formats
 * - Type definitions for translations
 *
 * @example
 * ```tsx
 * // For Next.js (next-intl) - use JSON directly
 * import en from '@ordo-todo/i18n/locales/en';
 *
 * // For React Native/Desktop (i18next) - transform format
 * import en from '@ordo-todo/i18n/locales/en';
 * import { transformTranslations } from '@ordo-todo/i18n';
 *
 * const i18nextTranslations = transformTranslations(en, 'i18next');
 * ```
 */
export * from './types.js';
export * from './utils.js';
import en from './locales/en.json';
import es from './locales/es.json';
import ptBr from './locales/pt-br.json';
export declare const locales: {
    readonly en: {
        Calendar: {
            title: string;
            subtitle: string;
            today: string;
            month: string;
            week: string;
            day: string;
            agenda: string;
            previous: string;
            next: string;
        };
        Sidebar: {
            today: string;
            tasks: string;
            habits: string;
            calendar: string;
            projects: string;
            workspaces: string;
            workspacesTrash: string;
            projectsTrash: string;
            tasksTrash: string;
            trash: string;
            tags: string;
            analytics: string;
            goals: string;
            settings: string;
            installApp: string;
            eisenhower: string;
            meetings: string;
            wellbeing: string;
            workload: string;
            notes: string;
        };
        Settings: {
            title: string;
            subtitle: string;
            appearance: string;
            theme: string;
            selectTheme: string;
            themes: {
                light: string;
                dark: string;
                system: string;
            };
            language: string;
            selectLanguage: string;
            languageDescription: string;
            timer: string;
            defaultMode: string;
            defaultModeDescription: string;
            focusDuration: string;
            shortBreakDuration: string;
            longBreakDuration: string;
            longBreakInterval: string;
            longBreakIntervalDescription: string;
            autoStartBreaks: string;
            autoStartBreaksDescription: string;
            autoStartPomodoros: string;
            autoStartPomodorosDescription: string;
            notificationsAndSound: string;
            notificationsDescription: string;
            soundEffects: string;
            soundEffectsDescription: string;
            browserNotifications: string;
            browserNotificationsDescription: string;
            keyboardShortcuts: string;
            keyboardShortcutsDescription: string;
            shortcuts: {
                startPause: string;
                newTask: string;
                search: string;
                settings: string;
                toggleSidebar: string;
            };
            about: string;
            version: string;
            platform: string;
            developer: string;
        };
        TimerWidget: {
            startTimer: string;
        };
        TopBar: {
            searchPlaceholder: string;
            myAccount: string;
            profile: string;
            settings: string;
            logout: string;
            menu: string;
        };
        Dashboard: {
            completed: string;
            subtasks: string;
            timeWorked: string;
            productivity: string;
            today: string;
            todaysTasks: string;
            noTasks: string;
            noTasksDescription: string;
            createTask: string;
            allTasksCompleted: string;
            tasksCompletedToday: string;
            showCompleted: string;
            hideCompleted: string;
            viewList: string;
            viewGrid: string;
            sortOptions: {
                priority: string;
                duration: string;
                created: string;
            };
            quickActionButtons: {
                newProject: string;
                startTimer: string;
                newTask: string;
            };
        };
        Tasks: {
            title: string;
            subtitle: string;
            newTask: string;
            noTasksWithTag: string;
            allClear: string;
            noTasksWithTagDescription: string;
            noPendingTasks: string;
            confirmDeleteTask: string;
            taskDeleted: string;
            taskDeleteError: string;
        };
        Notes: {
            title: string;
            add: string;
            delete: string;
            noNotes: string;
            placeholder: string;
        };
        Projects: {
            title: string;
            subtitle: string;
            newProject: string;
            selectWorkspace: string;
            selectWorkspaceDescription: string;
            noProjects: string;
            noProjectsDescription: string;
            createProject: string;
        };
        Workspaces: {
            title: string;
            subtitle: string;
            newWorkspace: string;
            noWorkspaces: string;
            noWorkspacesDescription: string;
            createWorkspace: string;
        };
        WorkspaceCard: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            status: {
                active: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            actions: {
                settings: string;
                delete: string;
                moreOptions: string;
            };
            confirmDelete: string;
            toast: {
                deleted: string;
                deleteError: string;
            };
        };
        Trash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            noDeletedWorkspaces: string;
            noDeletedWorkspacesDescription: string;
            deletedAt: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        ProjectsTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectWorkspace: string;
            allWorkspaces: string;
            viewingProjectsFor: string;
            selectWorkspaceFirst: string;
            selectWorkspaceFirstDescription: string;
            noDeletedProjects: string;
            noDeletedProjectsDescription: string;
            deletedAt: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        TasksTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectProject: string;
            allProjects: string;
            viewingTasksFor: string;
            selectProjectFirst: string;
            selectProjectFirstDescription: string;
            noDeletedTasks: string;
            noDeletedTasksDescription: string;
            deletedAt: string;
            restore: string;
            permanentDelete: string;
            confirmDelete: string;
        };
        Tags: {
            title: string;
            subtitle: string;
            newTag: string;
            confirmDelete: string;
            tagDeleted: string;
            deleteError: string;
            edit: string;
            delete: string;
            task: string;
            tasks: string;
            noTags: string;
            noTagsDescription: string;
            createTag: string;
            tagCreated: string;
        };
        Habits: {
            title: string;
            subtitle: string;
            newHabit: string;
            todayProgress: string;
            completed: string;
            allDone: string;
            keepGoing: string;
            noHabits: string;
            noHabitsDescription: string;
            createHabit: string;
            stats: {
                currentStreak: string;
                longestStreak: string;
                totalCompletions: string;
                completionRate: string;
                thisWeek: string;
                thisMonth: string;
            };
            frequency: {
                DAILY: string;
                WEEKLY: string;
                SPECIFIC_DAYS: string;
                MONTHLY: string;
                daily: string;
                weekly: string;
                custom: string;
            };
            timeOfDay: {
                MORNING: string;
                AFTERNOON: string;
                EVENING: string;
                ANYTIME: string;
                morning: string;
                afternoon: string;
                evening: string;
                anytime: string;
            };
            daysOfWeek: {
                short: string[];
                long: string[];
            };
            actions: {
                complete: string;
                undo: string;
                pause: string;
                resume: string;
                edit: string;
                delete: string;
                viewStats: string;
            };
            form: {
                createTitle: string;
                createDescription: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                icon: string;
                color: string;
                frequency: string;
                daysOfWeek: string;
                targetDays: string;
                targetCount: string;
                timeOfDay: string;
                preferredTime: string;
                reminder: string;
                create: string;
                creating: string;
                cancel: string;
            };
            toast: {
                created: string;
                updated: string;
                deleted: string;
                completed: string;
                uncompleted: string;
                paused: string;
                resumed: string;
                streakBonus: string;
                error: string;
            };
            confirmDelete: string;
            status: {
                active: string;
                paused: string;
                archived: string;
            };
            emptyToday: {
                weekend: string;
                allDone: string;
                noScheduled: string;
            };
            streakMessage: {
                new: string;
                week: string;
                month: string;
                hundred: string;
            };
            onboarding: {
                welcome: {
                    title: string;
                    description: string;
                };
                streaks: {
                    title: string;
                    description: string;
                };
                reminders: {
                    title: string;
                    description: string;
                };
                gamification: {
                    title: string;
                    description: string;
                };
                skip: string;
                next: string;
                getStarted: string;
            };
        };
        Analytics: {
            title: string;
            subtitle: string;
            pomodoros: string;
            thisWeek: string;
            tasksCompleted: string;
            streak: string;
            avgPerDay: string;
            tabs: {
                overview: string;
                weekly: string;
                focus: string;
                aiInsights: string;
            };
            focusScore: {
                label: string;
                description: string;
                howToImprove: string;
                tips: {
                    reduceBreaks: string;
                    shortenBreaks: string;
                    usePomodoro: string;
                    eliminateDistractions: string;
                };
                whatIs: string;
                whatIsDescription: string;
                howCalculated: string;
                calculation: string;
                penalty: string;
                max: string;
                interpretation: string;
                excellent: string;
                moderate: string;
                needsImprovement: string;
                noData: string;
                noDataDescription: string;
            };
            weekly: {
                summary: string;
                comingSoon: string;
            };
            aiLearning: {
                title: string;
                description: string;
                whatAnalyzes: string;
                analyzesList: {
                    hours: string;
                    days: string;
                    duration: string;
                    completion: string;
                    patterns: string;
                };
                whatOffers: string;
                offersList: {
                    recommendations: string;
                    predictions: string;
                    insights: string;
                    visualizations: string;
                };
                tip: string;
            };
        };
        CreateTaskDialog: {
            validation: {
                titleRequired: string;
                projectRequired: string;
            };
            toast: {
                success: string;
                error: string;
                aiTitleRequired: string;
                aiSuccess: string;
            };
            ai: {
                generatedDescription: string;
                generating: string;
                magic: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            title: string;
            description: string;
            form: {
                title: string;
                titlePlaceholder: string;
                project: string;
                selectProject: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                description: string;
                descriptionPlaceholder: string;
                assignee: string;
                selectAssignee: string;
                workspaceMembers: string;
                assignToMe: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateProjectDialog: {
            validation: {
                nameRequired: string;
                workspaceRequired: string;
            };
            toast: {
                success: string;
                successWithTasks: string;
                templateSelected: string;
                error: string;
                createWorkspace: string;
            };
            title: string;
            description: string;
            templates: {
                title: string;
                tasksCount: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            form: {
                color: string;
                name: string;
                namePlaceholder: string;
                workspace: string;
                description: string;
                descriptionPlaceholder: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateWorkspaceDialog: {
            validation: {
                nameRequired: string;
            };
            toast: {
                success: string;
                error: string;
            };
            title: string;
            description: string;
            form: {
                type: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
            };
            types: {
                personal: string;
                personalDesc: string;
                work: string;
                workDesc: string;
                team: string;
                teamDesc: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        SubtaskList: {
            title: string;
            empty: string;
            add: string;
            placeholder: string;
            nested: string;
            tooltips: {
                drag: string;
                edit: string;
                delete: string;
            };
            toast: {
                created: string;
                createError: string;
                completed: string;
                completeError: string;
                reopened: string;
                reopenError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        CommentThread: {
            title: string;
            empty: string;
            placeholder: string;
            shortcut: string;
            edited: string;
            actions: {
                edit: string;
                delete: string;
                save: string;
                saving: string;
                cancel: string;
                send: string;
                sending: string;
            };
            toast: {
                added: string;
                addError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        Notifications: {
            title: string;
            empty: string;
            loading: string;
            markAllRead: string;
        };
        FileUpload: {
            errors: {
                tooLarge: string;
                invalidType: string;
                invalidResponse: string;
                unknown: string;
                uploadError: string;
                networkError: string;
                statusError: string;
            };
            success: {
                uploaded: string;
            };
            info: {
                cancelled: string;
            };
            dropzone: {
                dragging: string;
                idle: string;
                maxSize: string;
            };
            uploading: string;
        };
        AttachmentList: {
            title: string;
            empty: string;
            total: string;
            by: string;
            tooltips: {
                preview: string;
                download: string;
                delete: string;
            };
            toast: {
                downloading: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ActivityFeed: {
            title: string;
            showing: string;
            showMore: string;
            empty: string;
            dates: {
                today: string;
                yesterday: string;
            };
            actions: {
                TASK_CREATED: string;
                TASK_UPDATED: string;
                TASK_COMPLETED: string;
                TASK_DELETED: string;
                COMMENT_ADDED: string;
                COMMENT_EDITED: string;
                COMMENT_DELETED: string;
                ATTACHMENT_ADDED: string;
                ATTACHMENT_DELETED: string;
                SUBTASK_ADDED: string;
                SUBTASK_COMPLETED: string;
                STATUS_CHANGED: string;
                PRIORITY_CHANGED: string;
                ASSIGNEE_CHANGED: string;
                DUE_DATE_CHANGED: string;
            };
            details: {
                fromTo: string;
                to: string;
                removed: string;
                item: string;
                mentioned: string;
            };
        };
        ProjectCard: {
            tasks: string;
            tasksProgress: string;
            progress: string;
            archived: string;
            actions: {
                moreOptions: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            toast: {
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ProjectSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        ProjectSettings: {
            general: {
                title: string;
                description: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                save: string;
                saving: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            danger: {
                title: string;
                description: string;
                archive: {
                    title: string;
                    description: string;
                };
                unarchive: {
                    title: string;
                    description: string;
                };
                delete: {
                    title: string;
                    description: string;
                };
            };
            deleteDialog: {
                title: string;
                description: string;
                cancel: string;
                confirm: string;
            };
            toast: {
                updated: string;
                updateError: string;
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
        };
        Breadcrumbs: {
            home: string;
        };
        ProjectDetail: {
            notFound: string;
            notFoundDescription: string;
            backToProjects: string;
            addTask: string;
            tasksSection: string;
            breadcrumbs: {
                projects: string;
            };
            badges: {
                archived: string;
                completed: string;
            };
            stats: {
                task: string;
                tasks: string;
                totalTasks: string;
                completedTasks: string;
                completed: string;
            };
            status: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
                timeline: string;
                files: string;
                settings: string;
            };
            overview: {
                progress: string;
                recentTasks: string;
            };
            actions: {
                archive: string;
                unarchive: string;
            };
            menu: {
                settings: string;
                markComplete: string;
                markIncomplete: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            emptyState: {
                title: string;
                description: string;
                archivedDescription: string;
                completedDescription: string;
            };
            confirmArchive: string;
            confirmComplete: string;
            confirmUncomplete: string;
            confirmDelete: string;
            confirmDeleteTask: string;
            toast: {
                archived: string;
                archiveError: string;
                completed: string;
                uncompleted: string;
                completeError: string;
                deleted: string;
                taskDeleted: string;
                taskDeleteError: string;
            };
            backToWorkspace: string;
        };
        WorkspaceInfoBar: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            team: string;
            stats: {
                projects: string;
                activeTasks: string;
                completed: string;
            };
            actions: {
                newProject: string;
                settings: string;
            };
        };
        WorkspaceDashboard: {
            notFound: string;
            backToWorkspaces: string;
            newProject: string;
            settings: string;
            delete: string;
            deleteConfirmation: string;
            deleteSuccess: string;
            projects: string;
            recentActivity: string;
            noActivity: string;
            viewAllActivity: string;
            stats: {
                projects: string;
                tasks: string;
                members: string;
            };
            deleteError: string;
        };
        WorkspaceSelector: {
            create: string;
            label: string;
            defaultName: string;
            search: string;
            noResults: string;
            types: {
                personal: string;
                work: string;
                team: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            settings: string;
            newWorkspace: string;
        };
        WorkspaceSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                type: {
                    label: string;
                    helper: string;
                    options: {
                        PERSONAL: string;
                        WORK: string;
                        TEAM: string;
                    };
                };
                color: {
                    label: string;
                };
                icon: {
                    label: string;
                };
            };
            dangerZone: {
                title: string;
                description: string;
                delete: string;
                deleting: string;
                confirm: string;
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            tabs: {
                general: string;
                members: string;
                configuration: string;
                activity: string;
            };
        };
        WorkspaceActivityLog: {
            empty: {
                title: string;
                description: string;
            };
            by: string;
            pagination: {
                showing: string;
                page: string;
            };
        };
        WorkspaceConfigurationSettings: {
            form: {
                defaultView: {
                    label: string;
                    helper: string;
                    options: {
                        LIST: string;
                        KANBAN: string;
                        CALENDAR: string;
                        TIMELINE: string;
                        FOCUS: string;
                    };
                };
                defaultDueTime: {
                    label: string;
                    helper: string;
                };
                timezone: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
                locale: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
            };
            actions: {
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        InviteMemberDialog: {
            title: string;
            description: string;
            emailLabel: string;
            roleLabel: string;
            rolePlaceholder: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            cancel: string;
            invite: string;
            success: string;
            successWithToken: string;
            error: string;
            inviteLink: string;
            copied: string;
            done: string;
            devTokenNote: string;
        };
        WorkspaceMembersSettings: {
            membersTitle: string;
            membersDescription: string;
            inviteMember: string;
            loading: string;
            user: string;
            role: string;
            joined: string;
            unknownUser: string;
            remove: string;
            confirmRemove: string;
            invitationsTitle: string;
            invitationsDescription: string;
            email: string;
            status: string;
            sent: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            memberRemoved: string;
            errorRemoving: string;
            noMembers: string;
            removeSuccess: string;
            removeError: string;
        };
        AcceptInvitationPage: {
            title: string;
            description: string;
            missingToken: string;
            confirmText: string;
            processing: string;
            success: string;
            redirecting: string;
            failed: string;
            acceptButton: string;
            goToWorkspaces: string;
            backHome: string;
            error: string;
        };
        CreateTagDialog: {
            title: {
                create: string;
                edit: string;
            };
            description: {
                create: string;
                edit: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                color: {
                    label: string;
                };
                preview: {
                    label: string;
                    default: string;
                };
            };
            actions: {
                cancel: string;
                create: string;
                creating: string;
                save: string;
                saving: string;
            };
            toast: {
                created: string;
                createError: string;
                updated: string;
                updateError: string;
            };
        };
        TagSelector: {
            addTag: string;
            loading: string;
            noTags: string;
            toast: {
                assigned: string;
                assignError: string;
                removed: string;
                removeError: string;
            };
        };
        PomodoroTimer: {
            enterFocusMode: string;
            mode: string;
            modes: {
                pomodoro: string;
                continuous: string;
                stopwatch: string;
                shortBreak: string;
                longBreak: string;
                pomodoroCount: string;
            };
            pauses: string;
            paused: string;
            switchTask: {
                buttonTitle: string;
                title: string;
                description: string;
            };
        };
        SessionHistory: {
            error: string;
            stats: {
                pomodoros: string;
                totalTime: string;
                focusScore: string;
                completionRate: string;
            };
            filters: {
                title: string;
                type: string;
                allTypes: string;
                status: string;
                allStatus: string;
                completedOnly: string;
            };
            types: {
                work: string;
                short_break: string;
                long_break: string;
                shortBreak: string;
                longBreak: string;
                continuous: string;
            };
            sessions: {
                title: string;
                count: string;
                empty: string;
                pause: string;
                pauses: string;
            };
            pagination: {
                showing: string;
            };
            chart: {
                title: string;
            };
        };
        TaskSelector: {
            placeholder: string;
            searchPlaceholder: string;
            noTasks: string;
            groupHeading: string;
            noTaskAssigned: string;
        };
        TaskCard: {
            priority: {
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            actions: {
                viewEdit: string;
                delete: string;
            };
            status: {
                completed: string;
            };
        };
        TaskList: {
            loading: string;
            error: string;
            empty: string;
            emptyMyTasks: string;
            retry: string;
            filters: {
                allTasks: string;
                myTasks: string;
            };
        };
        TaskDetailPanel: {
            title: string;
            titlePlaceholder: string;
            description: {
                label: string;
                placeholder: string;
                empty: string;
            };
            details: {
                title: string;
                dueDate: string;
                startDate: string;
                scheduledDate: string;
                estimation: string;
                linkToGoal: string;
                addAnotherGoal: string;
                selectGoal: string;
                noActiveObjectives: string;
            };
            tabs: {
                subtasks: string;
                comments: string;
                attachments: string;
                activity: string;
            };
            tags: {
                none: string;
                add: string;
                available: string;
                noAvailable: string;
                create: string;
            };
            buttons: {
                save: string;
                delete: string;
            };
            footer: {
                created: string;
            };
            confirmDelete: string;
            toast: {
                updated: string;
                statusUpdated: string;
                statusError: string;
                priorityUpdated: string;
                priorityError: string;
                updateError: string;
                deleted: string;
                deleteError: string;
                tagAssigned: string;
                tagError: string;
                noTaskId: string;
                shareError: string;
                linkCopied: string;
                linkedToGoal: string;
                linkGoalError: string;
            };
            share: {
                title: string;
                description: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
                urgent: string;
            };
            statuses: {
                todo: string;
                inProgress: string;
                completed: string;
                cancelled: string;
            };
        };
        TaskFilters: {
            label: string;
            clear: string;
            status: {
                label: string;
                TODO: string;
                IN_PROGRESS: string;
                COMPLETED: string;
                CANCELLED: string;
            };
            priority: {
                label: string;
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            tags: {
                label: string;
            };
        };
        TaskForm: {
            label: string;
            placeholder: string;
            button: {
                add: string;
                adding: string;
            };
            toast: {
                success: string;
                error: string;
                projectIdRequired: string;
            };
        };
        TaskDetailView: {
            title: string;
            description: string;
            noDate: string;
            subtasks: {
                title: string;
                empty: string;
            };
            time: {
                title: string;
                comingSoon: string;
            };
            notFound: string;
        };
        AIAssistantSidebar: {
            title: string;
            welcome: string;
            thinking: string;
            placeholder: string;
            error: string;
        };
        ReportCard: {
            scopes: {
                TASK_COMPLETION: string;
                WEEKLY_SCHEDULED: string;
                MONTHLY_SCHEDULED: string;
                PROJECT_SUMMARY: string;
                PERSONAL_ANALYSIS: string;
                default: string;
            };
            metrics: {
                tasks: string;
                hoursWorked: string;
                pomodoros: string;
            };
            stats: {
                strengths: string;
                weaknesses: string;
                recommendations: string;
            };
        };
        ReportDetail: {
            generatedOn: string;
            poweredBy: string;
            summary: string;
            metrics: {
                title: string;
                tasksCompleted: string;
                timeWorked: string;
                pomodoros: string;
                focusScore: string;
            };
            strengths: string;
            weaknesses: string;
            recommendations: string;
            patterns: string;
        };
        FocusScoreGauge: {
            label: string;
            messages: {
                excellent: string;
                veryGood: string;
                good: string;
                moderate: string;
                low: string;
                needsImprovement: string;
            };
            description: string;
        };
        GenerateReportDialog: {
            trigger: string;
            title: string;
            description: string;
            includes: {
                title: string;
                metrics: string;
                strengths: string;
                recommendations: string;
                patterns: string;
                score: string;
            };
            buttons: {
                cancel: string;
                generate: string;
                close: string;
                retry: string;
            };
            loading: {
                title: string;
                description: string;
            };
            success: {
                title: string;
                description: string;
            };
            error: string;
        };
        DailyMetricsCard: {
            title: string;
            today: string;
            metrics: {
                completed: string;
                time: string;
                pomodoros: string;
                focus: string;
            };
        };
        PeakHoursChart: {
            title: string;
            description: string;
            empty: string;
            yAxis: string;
            tooltip: string;
            legend: {
                high: string;
                good: string;
                fair: string;
                low: string;
            };
        };
        ProductivityInsights: {
            title: string;
            description: string;
            empty: string;
            peakHours: {
                title: string;
                description: string;
            };
            peakDays: {
                title: string;
                description: string;
            };
            tip: string;
        };
        WeeklyChart: {
            title: string;
            description: string;
            weekOf: string;
            tasks: string;
            minutes: string;
            tasksCompleted: string;
            minutesWorked: string;
            tooltip: {
                tasks: string;
                time: string;
            };
        };
        AuthForm: {
            welcome: string;
            subtitle: string;
            emailLogin: string;
            or: string;
            googleLogin: string;
            githubLogin: string;
            noAccount: string;
            register: string;
            connecting: string;
        };
        Processing: {
            text: string;
        };
        ConfirmDelete: {
            title: string;
            description: string;
            confirm: string;
            cancel: string;
            deleting: string;
        };
        ConnectionStatus: {
            backOnline: {
                title: string;
                description: string;
            };
            offline: {
                title: string;
                description: string;
            };
        };
        SyncStatus: {
            offline: string;
            syncing: string;
            error: string;
            pending: string;
            synced: string;
            idle: string;
            neverSynced: string;
            justNow: string;
            minutesAgo: string;
            hoursAgo: string;
            lastSync: string;
            clickToSync: string;
        };
        PWAInstallButton: {
            install: string;
        };
        PWATester: {
            pwaStatus: {
                title: string;
                description: string;
                installable: string;
                installed: string;
                onlineStatus: string;
                online: string;
                offline: string;
                installButton: string;
            };
            pushNotifications: {
                title: string;
                description: string;
                supported: string;
                permission: string;
                subscribed: string;
                requestPermission: string;
                sendBrowser: string;
                sendBackground: string;
                granted: string;
                denied: string;
                testSent: string;
                backgroundSent: string;
            };
            keyboardShortcuts: {
                title: string;
                description: string;
                available: string;
                newTask: string;
                quickTimer: string;
                search: string;
                installPwa: string;
                triggerNewTask: string;
            };
            yes: string;
            no: string;
        };
        Error: {
            title: string;
            description: string;
            retry: string;
            home: string;
        };
        NotFound: {
            title: string;
            description: string;
            message: string;
            home: string;
            back: string;
        };
        ProjectBoard: {
            columns: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            addTask: string;
        };
        ProjectList: {
            columns: {
                task: string;
                dueDate: string;
                priority: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
        };
        FocusMode: {
            selectTask: string;
            deepWork: string;
            breakTime: string;
            loading: string;
            completeTask: string;
            exit: string;
        };
        ProjectFiles: {
            empty: string;
            name: string;
            task: string;
            size: string;
            uploadedBy: string;
            date: string;
            actions: string;
        };
        Profile: {
            title: string;
            tabs: {
                profile: string;
                ai: string;
                security: string;
                privacy: string;
                integrations: string;
                subscription: string;
                account: string;
            };
            profile: {
                title: string;
                description: string;
                avatar: {
                    change: string;
                    hint: string;
                };
                form: {
                    name: string;
                    namePlaceholder: string;
                    email: string;
                    emailHint: string;
                    phone: string;
                    phonePlaceholder: string;
                    jobTitle: string;
                    jobTitlePlaceholder: string;
                    department: string;
                    departmentPlaceholder: string;
                    timezone: string;
                    timezonePlaceholder: string;
                    bio: string;
                    bioPlaceholder: string;
                };
                save: string;
                saving: string;
            };
            ai: {
                title: string;
                description: string;
                enableAI: string;
                enableAIDescription: string;
                suggestions: {
                    title: string;
                    durations: string;
                    priorities: string;
                    scheduling: string;
                    weeklyReports: string;
                };
                aggressiveness: {
                    title: string;
                    description: string;
                    conservative: string;
                    proactive: string;
                };
                energy: {
                    title: string;
                    description: string;
                    morning: string;
                    afternoon: string;
                    evening: string;
                    levels: {
                        low: string;
                        medium: string;
                        high: string;
                    };
                };
                save: string;
                saving: string;
            };
            security: {
                title: string;
                description: string;
                password: {
                    title: string;
                    lastChanged: string;
                    change: string;
                };
                twoFactor: {
                    title: string;
                    description: string;
                    comingSoon: string;
                };
                connectedAccounts: {
                    title: string;
                    connected: string;
                };
                activeSessions: {
                    title: string;
                    currentSession: string;
                    thisDevice: string;
                    active: string;
                };
            };
            privacy: {
                title: string;
                description: string;
                dataSharing: {
                    title: string;
                    analytics: string;
                    analyticsDescription: string;
                    activityStatus: string;
                    activityStatusDescription: string;
                };
                emailNotifications: {
                    title: string;
                    taskReminders: string;
                    weeklyDigest: string;
                    marketing: string;
                };
                save: string;
                saving: string;
            };
            integrations: {
                title: string;
                description: string;
                connect: string;
                comingSoon: string;
                providers: {
                    googleCalendar: {
                        name: string;
                        description: string;
                    };
                    slack: {
                        name: string;
                        description: string;
                    };
                    github: {
                        name: string;
                        description: string;
                    };
                };
            };
            subscription: {
                title: string;
                description: string;
                currentPlan: string;
                upgrade: string;
                features: {
                    unlimitedTasks: string;
                    workspaces: string;
                    basicAI: string;
                    advancedAnalytics: string;
                    teamCollaboration: string;
                };
                billingHistory: {
                    title: string;
                    empty: string;
                };
            };
            account: {
                title: string;
                description: string;
                export: {
                    title: string;
                    description: string;
                    button: string;
                    exporting: string;
                };
                delete: {
                    title: string;
                    description: string;
                    button: string;
                    deleting: string;
                    dialog: {
                        title: string;
                        description: string;
                        cancel: string;
                        confirm: string;
                    };
                };
            };
            toast: {
                profileUpdated: string;
                profileError: string;
                aiUpdated: string;
                aiError: string;
                privacyUpdated: string;
                privacyError: string;
                exportStarted: string;
                exportError: string;
                deleteError: string;
            };
        };
        AIReport: {
            title: string;
            subtitle: string;
            generateButton: string;
            analyzing: string;
            emptyState: string;
            regenerate: string;
            export: string;
            stats: {
                pomodoros: string;
                tasks: string;
                streak: string;
                average: string;
            };
        };
        Timer: {
            title: string;
            subtitle: string;
            tabs: {
                timer: string;
                history: string;
            };
            modes: {
                work: string;
                shortBreak: string;
                longBreak: string;
            };
            history: {
                totalSessions: string;
                totalTime: string;
                workSessions: string;
                noSessions: string;
                noSessionsDescription: string;
                loading: string;
                filters: string;
                allTypes: string;
                today: string;
                last7Days: string;
                last30Days: string;
                last90Days: string;
                page: string;
            };
        };
        AIWeeklyReport: {
            weeklyReport: string;
            generateReport: string;
            analyzing: string;
            sections: {
                summary: string;
                achievements: string;
                improvements: string;
                recommendations: string;
            };
        };
        common: {
            loading: string;
            save: string;
            cancel: string;
            delete: string;
            edit: string;
            create: string;
            update: string;
            confirm: string;
            close: string;
            search: string;
            noResults: string;
            error: string;
            success: string;
            warning: string;
            info: string;
        };
        Sync: {
            offline: string;
            offlineDesc: string;
            syncing: string;
            syncingDesc: string;
            error: string;
            errorDesc: string;
            pending: string;
            pendingDesc: string;
            synced: string;
            syncedDesc: string;
            unknown: string;
            failedChanges: string;
            pendingChanges: string;
            offlineBanner: string;
        };
        About: {
            description: string;
            version: string;
            platform: string;
            madeWith: string;
            website: string;
            documentation: string;
        };
        Shortcuts: {
            title: string;
            description: string;
            footerNote: string;
        };
        Goals: {
            title: string;
            subtitle: string;
            createObjective: string;
            noObjectives: string;
            noObjectivesDescription: string;
            listTitle: string;
            backToList: string;
            createDescription: string;
            cancel: string;
            create: string;
            form: {
                title: string;
                titlePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                period: string;
                startDate: string;
                endDate: string;
                color: string;
                icon: string;
            };
            periods: {
                QUARTERLY: string;
                YEARLY: string;
                CUSTOM: string;
            };
            status: {
                DRAFT: string;
                ACTIVE: string;
                COMPLETED: string;
                CANCELLED: string;
                AT_RISK: string;
            };
            period: {
                Q1: string;
                Q2: string;
                Q3: string;
                Q4: string;
                YEARLY: string;
            };
            keyResults: {
                title: string;
                add: string;
                name: string;
                target: string;
                current: string;
                unit: string;
                metricType: string;
                types: {
                    PERCENTAGE: string;
                    NUMBER: string;
                    CURRENCY: string;
                    BOOLEAN: string;
                };
                subtitle: string;
                addFirst: string;
                empty: string;
                createTitle: string;
                createDescription: string;
                confirmDelete: string;
                deleted: string;
                form: {
                    title: string;
                    titlePlaceholder: string;
                    description: string;
                    descriptionPlaceholder: string;
                    metricType: string;
                    startValue: string;
                    targetValue: string;
                    unit: string;
                    unitPlaceholder: string;
                };
                actions: {
                    cancel: string;
                    create: string;
                    creating: string;
                };
                validation: {
                    titleRequired: string;
                };
                toast: {
                    created: string;
                    error: string;
                };
            };
            stats: {
                totalObjectives: string;
                onTrack: string;
                atRisk: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
            };
            averageProgress: string;
            viewAll: string;
            total: string;
            completed: string;
            progress: string;
            dueDate: string;
            okrsAtRisk: string;
            left: string;
            notFound: string;
            edit: string;
        };
        CustomFields: {
            title: string;
            subtitle: string;
            addField: string;
            noFields: string;
            noFieldsDescription: string;
            editField: string;
            createField: string;
            updateField: string;
            addFieldDescription: string;
            fieldName: string;
            fieldNamePlaceholder: string;
            fieldType: string;
            description: string;
            descriptionPlaceholder: string;
            options: string;
            addOption: string;
            required: string;
            deleteConfirm: string;
            cancel: string;
            create: string;
            save: string;
            fieldCreated: string;
            fieldUpdated: string;
            fieldDeleted: string;
            fieldError: string;
            deleteError: string;
            nameRequired: string;
            optionsRequired: string;
            types: {
                TEXT: string;
                NUMBER: string;
                SELECT: string;
                MULTI_SELECT: string;
                DATE: string;
                URL: string;
                EMAIL: string;
                CHECKBOX: string;
            };
        };
        Focus: {
            title: string;
            subtitle: string;
            startSession: string;
            endSession: string;
            ambientAudio: string;
            selectTrack: string;
            noTrack: string;
            volume: string;
            favorites: string;
            addToFavorites: string;
            removeFromFavorites: string;
            categories: {
                nature: string;
                cafe: string;
                whiteNoise: string;
                binaural: string;
                music: string;
            };
            tracks: {
                rain: string;
                thunderstorm: string;
                forest: string;
                ocean: string;
                river: string;
                cafe: string;
                library: string;
                whiteNoise: string;
                pinkNoise: string;
                brownNoise: string;
                binaural: string;
                lofi: string;
            };
            modes: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            modeDescriptions: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            stats: {
                totalSessions: string;
                totalMinutes: string;
                avgSession: string;
                streakDays: string;
            };
        };
        Search: {
            title: string;
            placeholder: string;
            placeholderWithAI: string;
            noResults: string;
            noResultsDescription: string;
            suggestions: string;
            results: string;
            navigate: string;
            select: string;
            close: string;
            aiPowered: string;
            types: {
                task: string;
                project: string;
                habit: string;
            };
            filters: {
                all: string;
                tasks: string;
                projects: string;
                habits: string;
            };
        };
        Meetings: {
            title: string;
            subtitle: string;
            analyze: string;
            analyzing: string;
            transcriptPlaceholder: string;
            summary: string;
            keyPoints: string;
            actionItems: string;
            decisions: string;
            participants: string;
            topics: string;
            sentiment: string;
            followUpRequired: string;
            convertToTasks: string;
            converting: string;
            tasksCreated: string;
            noActionItems: string;
            sentiments: {
                POSITIVE: string;
                NEUTRAL: string;
                NEGATIVE: string;
                MIXED: string;
            };
            summaryStyles: {
                executive: string;
                detailed: string;
                bulletPoints: string;
            };
        };
        Workload: {
            title: string;
            subtitle: string;
            myWorkload: string;
            teamWorkload: string;
            assignedTasks: string;
            completedTasks: string;
            overdueTasks: string;
            hoursThisWeek: string;
            capacityRemaining: string;
            workloadScore: string;
            trend: string;
            levels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                OVERLOADED: string;
            };
            trends: {
                INCREASING: string;
                STABLE: string;
                DECREASING: string;
            };
            suggestions: {
                title: string;
                redistribute: string;
                delegate: string;
                prioritize: string;
            };
            distribution: {
                overloaded: string;
                balanced: string;
                underutilized: string;
            };
        };
        Wellbeing: {
            title: string;
            subtitle: string;
            burnoutRisk: string;
            workLifeBalance: string;
            focusQuality: string;
            consistencyScore: string;
            riskLevels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                CRITICAL: string;
            };
            recommendations: {
                title: string;
                takeBreak: string;
                endDay: string;
                weekend: string;
                lateNight: string;
            };
            patterns: {
                title: string;
                lateNightWork: string;
                weekendWork: string;
                longSessions: string;
                avgHoursPerDay: string;
            };
            weeklySummary: string;
            insights: string;
            intervention: {
                gentleReminder: string;
                strongWarning: string;
                criticalAlert: string;
            };
        };
        Mobile: {
            home: {
                greeting: string;
                myTasks: string;
                pending: string;
                completed: string;
                today: string;
                loadError: string;
                retry: string;
                noTasks: string;
                noTasksInView: string;
                okrsGoals: string;
                active: string;
            };
            filters: {
                all: string;
                today: string;
                upcoming: string;
                completed: string;
            };
            tabs: {
                home: string;
                habits: string;
                calendar: string;
                profile: string;
            };
            common: {
                loading: string;
                error: string;
                cancel: string;
                save: string;
                delete: string;
                edit: string;
                create: string;
                back: string;
                done: string;
                search: string;
                noResults: string;
            };
            priority: {
                high: string;
                medium: string;
                low: string;
            };
            task: {
                newTask: string;
                editTask: string;
                title: string;
                description: string;
                project: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                noProject: string;
                selectProject: string;
                taskCreated: string;
                taskUpdated: string;
                createError: string;
                updateError: string;
            };
            profile: {
                title: string;
                settings: string;
                logout: string;
                logoutConfirm: string;
                theme: string;
                language: string;
                notifications: string;
                about: string;
            };
            workspaces: {
                title: string;
                noWorkspaces: string;
                createFirst: string;
            };
            goals: {
                title: string;
                newGoal: string;
                editGoal: string;
                noGoals: string;
                createFirst: string;
                keyResults: string;
                addKeyResult: string;
                progress: string;
                startDate: string;
                endDate: string;
            };
            habits: {
                title: string;
                loadError: string;
                retry: string;
                completed: string;
                streak: string;
                bestStreak: string;
                progress: string;
                oneWeek: string;
                oneWeekMessage: string;
                oneMonth: string;
                oneMonthMessage: string;
                hundredDays: string;
                hundredDaysMessage: string;
                errorUpdating: string;
                noHabits: string;
                createFirst: string;
                days: string;
            };
            calendar: {
                title: string;
                subtitle: string;
                noBlocks: string;
                noBlocksHint: string;
            };
            profileOptions: {
                notifications: string;
                darkMode: string;
                settings: string;
                help: string;
                about: string;
                logout: string;
                logoutTitle: string;
                logoutMessage: string;
                cancel: string;
                exit: string;
                version: string;
                completed: string;
                focusMinutes: string;
                pomodoros: string;
                loading: string;
            };
        };
        UnifiedTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            tabs: {
                workspaces: string;
                projects: string;
                tasks: string;
            };
            filterByWorkspace: string;
            filterByProject: string;
            allWorkspaces: string;
            allProjects: string;
            viewingProjectsFor: string;
            viewingTasksFor: string;
            selectWorkspaceFirst: string;
            selectProjectFirst: string;
            noDeletedWorkspaces: string;
            noDeletedProjects: string;
            noDeletedTasks: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
    };
    readonly es: {
        Calendar: {
            title: string;
            subtitle: string;
            today: string;
            month: string;
            week: string;
            day: string;
            agenda: string;
            previous: string;
            next: string;
        };
        Sidebar: {
            today: string;
            tasks: string;
            habits: string;
            calendar: string;
            projects: string;
            workspaces: string;
            workspacesTrash: string;
            projectsTrash: string;
            tasksTrash: string;
            trash: string;
            tags: string;
            analytics: string;
            settings: string;
            installApp: string;
            goals: string;
            eisenhower: string;
            meetings: string;
            wellbeing: string;
            workload: string;
            notes: string;
        };
        Settings: {
            title: string;
            subtitle: string;
            appearance: string;
            theme: string;
            selectTheme: string;
            themes: {
                light: string;
                dark: string;
                system: string;
            };
            language: string;
            selectLanguage: string;
            languageDescription: string;
            timer: string;
            defaultMode: string;
            defaultModeDescription: string;
            focusDuration: string;
            shortBreakDuration: string;
            longBreakDuration: string;
            longBreakInterval: string;
            longBreakIntervalDescription: string;
            autoStartBreaks: string;
            autoStartBreaksDescription: string;
            autoStartPomodoros: string;
            autoStartPomodorosDescription: string;
            notificationsAndSound: string;
            notificationsDescription: string;
            soundEffects: string;
            soundEffectsDescription: string;
            browserNotifications: string;
            browserNotificationsDescription: string;
            keyboardShortcuts: string;
            keyboardShortcutsDescription: string;
            shortcuts: {
                startPause: string;
                newTask: string;
                search: string;
                settings: string;
                toggleSidebar: string;
            };
            about: string;
            version: string;
            platform: string;
            developer: string;
        };
        TimerWidget: {
            startTimer: string;
        };
        TopBar: {
            searchPlaceholder: string;
            myAccount: string;
            profile: string;
            settings: string;
            logout: string;
            menu: string;
        };
        Dashboard: {
            completed: string;
            subtasks: string;
            timeWorked: string;
            productivity: string;
            today: string;
            todaysTasks: string;
            noTasks: string;
            noTasksDescription: string;
            createTask: string;
            allTasksCompleted: string;
            tasksCompletedToday: string;
            showCompleted: string;
            hideCompleted: string;
            viewList: string;
            viewGrid: string;
            sortOptions: {
                priority: string;
                duration: string;
                created: string;
            };
            quickActionButtons: {
                newProject: string;
                startTimer: string;
                newTask: string;
            };
        };
        Tasks: {
            title: string;
            subtitle: string;
            newTask: string;
            noTasksWithTag: string;
            allClear: string;
            noTasksWithTagDescription: string;
            noPendingTasks: string;
            confirmDeleteTask: string;
            taskDeleted: string;
            taskDeleteError: string;
        };
        Notes: {
            title: string;
            add: string;
            delete: string;
            noNotes: string;
            placeholder: string;
        };
        Projects: {
            title: string;
            subtitle: string;
            newProject: string;
            selectWorkspace: string;
            selectWorkspaceDescription: string;
            noProjects: string;
            noProjectsDescription: string;
            createProject: string;
        };
        Workspaces: {
            title: string;
            subtitle: string;
            newWorkspace: string;
            noWorkspaces: string;
            noWorkspacesDescription: string;
            createWorkspace: string;
        };
        WorkspaceCard: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            status: {
                active: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            actions: {
                settings: string;
                delete: string;
                moreOptions: string;
            };
            confirmDelete: string;
            toast: {
                deleted: string;
                deleteError: string;
            };
        };
        Trash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            noDeletedWorkspaces: string;
            noDeletedWorkspacesDescription: string;
            deletedAt: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        ProjectsTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectWorkspace: string;
            allWorkspaces: string;
            viewingProjectsFor: string;
            selectWorkspaceFirst: string;
            selectWorkspaceFirstDescription: string;
            noDeletedProjects: string;
            noDeletedProjectsDescription: string;
            deletedAt: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        TasksTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectProject: string;
            allProjects: string;
            viewingTasksFor: string;
            selectProjectFirst: string;
            selectProjectFirstDescription: string;
            noDeletedTasks: string;
            noDeletedTasksDescription: string;
            deletedAt: string;
            restore: string;
            permanentDelete: string;
            confirmDelete: string;
        };
        Tags: {
            title: string;
            subtitle: string;
            newTag: string;
            confirmDelete: string;
            tagDeleted: string;
            deleteError: string;
            edit: string;
            delete: string;
            task: string;
            tasks: string;
            noTags: string;
            noTagsDescription: string;
            createTag: string;
            tagCreated: string;
        };
        Habits: {
            title: string;
            subtitle: string;
            newHabit: string;
            todayProgress: string;
            completed: string;
            allDone: string;
            keepGoing: string;
            noHabits: string;
            noHabitsDescription: string;
            createHabit: string;
            stats: {
                currentStreak: string;
                longestStreak: string;
                totalCompletions: string;
                completionRate: string;
                thisWeek: string;
                thisMonth: string;
            };
            frequency: {
                DAILY: string;
                WEEKLY: string;
                SPECIFIC_DAYS: string;
                MONTHLY: string;
                daily: string;
                weekly: string;
                custom: string;
            };
            timeOfDay: {
                MORNING: string;
                AFTERNOON: string;
                EVENING: string;
                ANYTIME: string;
                morning: string;
                afternoon: string;
                evening: string;
                anytime: string;
            };
            daysOfWeek: {
                short: string[];
                long: string[];
            };
            actions: {
                complete: string;
                undo: string;
                pause: string;
                resume: string;
                edit: string;
                delete: string;
                viewStats: string;
            };
            form: {
                createTitle: string;
                createDescription: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                icon: string;
                color: string;
                frequency: string;
                daysOfWeek: string;
                targetDays: string;
                targetCount: string;
                timeOfDay: string;
                preferredTime: string;
                reminder: string;
                create: string;
                creating: string;
                cancel: string;
            };
            toast: {
                created: string;
                updated: string;
                deleted: string;
                completed: string;
                uncompleted: string;
                paused: string;
                resumed: string;
                streakBonus: string;
                error: string;
            };
            confirmDelete: string;
            status: {
                active: string;
                paused: string;
                archived: string;
            };
            emptyToday: {
                weekend: string;
                allDone: string;
                noScheduled: string;
            };
            streakMessage: {
                new: string;
                week: string;
                month: string;
                hundred: string;
            };
            onboarding: {
                welcome: {
                    title: string;
                    description: string;
                };
                streaks: {
                    title: string;
                    description: string;
                };
                reminders: {
                    title: string;
                    description: string;
                };
                gamification: {
                    title: string;
                    description: string;
                };
                skip: string;
                next: string;
                getStarted: string;
            };
        };
        Analytics: {
            title: string;
            subtitle: string;
            pomodoros: string;
            thisWeek: string;
            tasksCompleted: string;
            streak: string;
            avgPerDay: string;
            tabs: {
                overview: string;
                weekly: string;
                focus: string;
                aiInsights: string;
            };
            focusScore: {
                label: string;
                description: string;
                howToImprove: string;
                tips: {
                    reduceBreaks: string;
                    shortenBreaks: string;
                    usePomodoro: string;
                    eliminateDistractions: string;
                };
                whatIs: string;
                whatIsDescription: string;
                howCalculated: string;
                calculation: string;
                penalty: string;
                max: string;
                interpretation: string;
                excellent: string;
                moderate: string;
                needsImprovement: string;
                noData: string;
                noDataDescription: string;
            };
            weekly: {
                summary: string;
                comingSoon: string;
            };
            aiLearning: {
                title: string;
                description: string;
                whatAnalyzes: string;
                analyzesList: {
                    hours: string;
                    days: string;
                    duration: string;
                    completion: string;
                    patterns: string;
                };
                whatOffers: string;
                offersList: {
                    recommendations: string;
                    predictions: string;
                    insights: string;
                    visualizations: string;
                };
                tip: string;
            };
        };
        CreateTaskDialog: {
            validation: {
                titleRequired: string;
                projectRequired: string;
            };
            toast: {
                success: string;
                error: string;
                aiTitleRequired: string;
                aiSuccess: string;
            };
            ai: {
                generatedDescription: string;
                generating: string;
                magic: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            title: string;
            description: string;
            form: {
                title: string;
                titlePlaceholder: string;
                project: string;
                selectProject: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                description: string;
                descriptionPlaceholder: string;
                assignee: string;
                selectAssignee: string;
                workspaceMembers: string;
                assignToMe: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateProjectDialog: {
            validation: {
                nameRequired: string;
                workspaceRequired: string;
            };
            toast: {
                success: string;
                successWithTasks: string;
                templateSelected: string;
                error: string;
                createWorkspace: string;
            };
            title: string;
            description: string;
            templates: {
                title: string;
                tasksCount: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            form: {
                color: string;
                name: string;
                namePlaceholder: string;
                workspace: string;
                description: string;
                descriptionPlaceholder: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateWorkspaceDialog: {
            validation: {
                nameRequired: string;
            };
            toast: {
                success: string;
                error: string;
            };
            title: string;
            description: string;
            form: {
                type: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
            };
            types: {
                personal: string;
                personalDesc: string;
                work: string;
                workDesc: string;
                team: string;
                teamDesc: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        SubtaskList: {
            title: string;
            empty: string;
            add: string;
            placeholder: string;
            nested: string;
            tooltips: {
                drag: string;
                edit: string;
                delete: string;
            };
            toast: {
                created: string;
                createError: string;
                completed: string;
                completeError: string;
                reopened: string;
                reopenError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        CommentThread: {
            title: string;
            empty: string;
            placeholder: string;
            shortcut: string;
            edited: string;
            actions: {
                edit: string;
                delete: string;
                save: string;
                saving: string;
                cancel: string;
                send: string;
                sending: string;
            };
            toast: {
                added: string;
                addError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        Notifications: {
            title: string;
            empty: string;
            loading: string;
            markAllRead: string;
        };
        FileUpload: {
            errors: {
                tooLarge: string;
                invalidType: string;
                invalidResponse: string;
                unknown: string;
                uploadError: string;
                networkError: string;
                statusError: string;
            };
            success: {
                uploaded: string;
            };
            info: {
                cancelled: string;
            };
            dropzone: {
                dragging: string;
                idle: string;
                maxSize: string;
            };
            uploading: string;
        };
        AttachmentList: {
            title: string;
            empty: string;
            total: string;
            by: string;
            tooltips: {
                preview: string;
                download: string;
                delete: string;
            };
            toast: {
                downloading: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ActivityFeed: {
            title: string;
            showing: string;
            showMore: string;
            empty: string;
            dates: {
                today: string;
                yesterday: string;
            };
            actions: {
                TASK_CREATED: string;
                TASK_UPDATED: string;
                TASK_COMPLETED: string;
                TASK_DELETED: string;
                COMMENT_ADDED: string;
                COMMENT_EDITED: string;
                COMMENT_DELETED: string;
                ATTACHMENT_ADDED: string;
                ATTACHMENT_DELETED: string;
                SUBTASK_ADDED: string;
                SUBTASK_COMPLETED: string;
                STATUS_CHANGED: string;
                PRIORITY_CHANGED: string;
                ASSIGNEE_CHANGED: string;
                DUE_DATE_CHANGED: string;
            };
            details: {
                fromTo: string;
                to: string;
                removed: string;
                item: string;
                mentioned: string;
            };
        };
        ProjectCard: {
            tasks: string;
            tasksProgress: string;
            progress: string;
            archived: string;
            actions: {
                moreOptions: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            toast: {
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ProjectSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        ProjectSettings: {
            general: {
                title: string;
                description: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                save: string;
                saving: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            danger: {
                title: string;
                description: string;
                archive: {
                    title: string;
                    description: string;
                };
                unarchive: {
                    title: string;
                    description: string;
                };
                delete: {
                    title: string;
                    description: string;
                };
            };
            deleteDialog: {
                title: string;
                description: string;
                cancel: string;
                confirm: string;
            };
            toast: {
                updated: string;
                updateError: string;
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
        };
        Breadcrumbs: {
            home: string;
        };
        ProjectDetail: {
            notFound: string;
            notFoundDescription: string;
            backToProjects: string;
            addTask: string;
            tasksSection: string;
            breadcrumbs: {
                projects: string;
            };
            badges: {
                archived: string;
                completed: string;
            };
            stats: {
                task: string;
                tasks: string;
                totalTasks: string;
                completedTasks: string;
                completed: string;
            };
            status: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
                timeline: string;
                files: string;
                settings: string;
            };
            overview: {
                progress: string;
                recentTasks: string;
            };
            actions: {
                archive: string;
                unarchive: string;
            };
            menu: {
                settings: string;
                markComplete: string;
                markIncomplete: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            emptyState: {
                title: string;
                description: string;
                archivedDescription: string;
                completedDescription: string;
            };
            confirmArchive: string;
            confirmComplete: string;
            confirmUncomplete: string;
            confirmDelete: string;
            confirmDeleteTask: string;
            toast: {
                archived: string;
                archiveError: string;
                completed: string;
                uncompleted: string;
                completeError: string;
                deleted: string;
                taskDeleted: string;
                taskDeleteError: string;
            };
            backToWorkspace: string;
        };
        WorkspaceInfoBar: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            team: string;
            stats: {
                projects: string;
                activeTasks: string;
                completed: string;
            };
            actions: {
                newProject: string;
                settings: string;
            };
        };
        WorkspaceSelector: {
            create: string;
            label: string;
            defaultName: string;
            search: string;
            noResults: string;
            types: {
                personal: string;
                work: string;
                team: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            settings: string;
            newWorkspace: string;
        };
        WorkspaceDashboard: {
            notFound: string;
            backToWorkspaces: string;
            newProject: string;
            settings: string;
            delete: string;
            deleteConfirmation: string;
            deleteSuccess: string;
            projects: string;
            recentActivity: string;
            noActivity: string;
            viewAllActivity: string;
            stats: {
                projects: string;
                tasks: string;
                members: string;
            };
            deleteError: string;
        };
        WorkspaceSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                type: {
                    label: string;
                    helper: string;
                    options: {
                        PERSONAL: string;
                        WORK: string;
                        TEAM: string;
                    };
                };
                color: {
                    label: string;
                };
                icon: {
                    label: string;
                };
            };
            dangerZone: {
                title: string;
                description: string;
                delete: string;
                deleting: string;
                confirm: string;
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            tabs: {
                general: string;
                members: string;
                configuration: string;
                activity: string;
            };
        };
        WorkspaceActivityLog: {
            empty: {
                title: string;
                description: string;
            };
            by: string;
            pagination: {
                showing: string;
                page: string;
            };
        };
        WorkspaceConfigurationSettings: {
            form: {
                defaultView: {
                    label: string;
                    helper: string;
                    options: {
                        LIST: string;
                        KANBAN: string;
                        CALENDAR: string;
                        TIMELINE: string;
                        FOCUS: string;
                    };
                };
                defaultDueTime: {
                    label: string;
                    helper: string;
                };
                timezone: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
                locale: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
            };
            actions: {
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        InviteMemberDialog: {
            title: string;
            description: string;
            emailLabel: string;
            roleLabel: string;
            rolePlaceholder: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            cancel: string;
            invite: string;
            success: string;
            successWithToken: string;
            error: string;
            inviteLink: string;
            copied: string;
            done: string;
            devTokenNote: string;
        };
        WorkspaceMembersSettings: {
            membersTitle: string;
            membersDescription: string;
            inviteMember: string;
            loading: string;
            user: string;
            role: string;
            joined: string;
            unknownUser: string;
            remove: string;
            confirmRemove: string;
            memberRemoved: string;
            errorRemoving: string;
            noMembers: string;
            invitationsTitle: string;
            invitationsDescription: string;
            email: string;
            status: string;
            sent: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            removeSuccess: string;
            removeError: string;
        };
        AcceptInvitationPage: {
            title: string;
            description: string;
            missingToken: string;
            confirmText: string;
            processing: string;
            success: string;
            redirecting: string;
            failed: string;
            acceptButton: string;
            goToWorkspaces: string;
            backHome: string;
            error: string;
        };
        CreateTagDialog: {
            title: {
                create: string;
                edit: string;
            };
            description: {
                create: string;
                edit: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                color: {
                    label: string;
                };
                preview: {
                    label: string;
                    default: string;
                };
            };
            actions: {
                cancel: string;
                create: string;
                creating: string;
                save: string;
                saving: string;
            };
            toast: {
                created: string;
                createError: string;
                updated: string;
                updateError: string;
            };
        };
        TagSelector: {
            addTag: string;
            loading: string;
            noTags: string;
            toast: {
                assigned: string;
                assignError: string;
                removed: string;
                removeError: string;
            };
        };
        PomodoroTimer: {
            enterFocusMode: string;
            mode: string;
            modes: {
                pomodoro: string;
                continuous: string;
                stopwatch: string;
                shortBreak: string;
                longBreak: string;
                pomodoroCount: string;
            };
            pauses: string;
            paused: string;
            switchTask: {
                buttonTitle: string;
                title: string;
                description: string;
            };
        };
        SessionHistory: {
            error: string;
            stats: {
                pomodoros: string;
                totalTime: string;
                focusScore: string;
                completionRate: string;
            };
            filters: {
                title: string;
                type: string;
                allTypes: string;
                status: string;
                allStatus: string;
                completedOnly: string;
            };
            types: {
                work: string;
                short_break: string;
                long_break: string;
                shortBreak: string;
                longBreak: string;
                continuous: string;
            };
            sessions: {
                title: string;
                count: string;
                empty: string;
                pause: string;
                pauses: string;
            };
            pagination: {
                showing: string;
            };
            chart: {
                title: string;
            };
        };
        TaskSelector: {
            placeholder: string;
            searchPlaceholder: string;
            noTasks: string;
            groupHeading: string;
            noTaskAssigned: string;
        };
        TaskCard: {
            priority: {
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            actions: {
                viewEdit: string;
                delete: string;
            };
            status: {
                completed: string;
            };
        };
        TaskList: {
            loading: string;
            error: string;
            empty: string;
            emptyMyTasks: string;
            retry: string;
            filters: {
                allTasks: string;
                myTasks: string;
            };
        };
        TaskDetailPanel: {
            title: string;
            titlePlaceholder: string;
            description: {
                label: string;
                placeholder: string;
                empty: string;
            };
            details: {
                title: string;
                dueDate: string;
                startDate: string;
                scheduledDate: string;
                estimation: string;
                linkToGoal: string;
                addAnotherGoal: string;
                selectGoal: string;
                noActiveObjectives: string;
            };
            tabs: {
                subtasks: string;
                comments: string;
                attachments: string;
                activity: string;
            };
            tags: {
                none: string;
                add: string;
                available: string;
                noAvailable: string;
                create: string;
            };
            buttons: {
                save: string;
                delete: string;
            };
            footer: {
                created: string;
            };
            confirmDelete: string;
            toast: {
                updated: string;
                statusUpdated: string;
                statusError: string;
                priorityUpdated: string;
                priorityError: string;
                updateError: string;
                deleted: string;
                deleteError: string;
                tagAssigned: string;
                tagError: string;
                noTaskId: string;
                shareError: string;
                linkCopied: string;
                linkedToGoal: string;
                linkGoalError: string;
            };
            share: {
                title: string;
                description: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
                urgent: string;
            };
            statuses: {
                todo: string;
                inProgress: string;
                completed: string;
                cancelled: string;
            };
        };
        TaskFilters: {
            label: string;
            clear: string;
            status: {
                label: string;
                TODO: string;
                IN_PROGRESS: string;
                COMPLETED: string;
                CANCELLED: string;
            };
            priority: {
                label: string;
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            tags: {
                label: string;
            };
        };
        TaskForm: {
            label: string;
            placeholder: string;
            button: {
                add: string;
                adding: string;
            };
            toast: {
                success: string;
                error: string;
                projectIdRequired: string;
            };
        };
        TaskDetailView: {
            title: string;
            description: string;
            noDate: string;
            subtasks: {
                title: string;
                empty: string;
            };
            time: {
                title: string;
                comingSoon: string;
            };
            notFound: string;
        };
        AIAssistantSidebar: {
            title: string;
            welcome: string;
            thinking: string;
            placeholder: string;
            error: string;
        };
        ReportCard: {
            scopes: {
                TASK_COMPLETION: string;
                WEEKLY_SCHEDULED: string;
                MONTHLY_SCHEDULED: string;
                PROJECT_SUMMARY: string;
                PERSONAL_ANALYSIS: string;
                default: string;
            };
            metrics: {
                tasks: string;
                hoursWorked: string;
                pomodoros: string;
            };
            stats: {
                strengths: string;
                weaknesses: string;
                recommendations: string;
            };
        };
        ReportDetail: {
            generatedOn: string;
            poweredBy: string;
            summary: string;
            metrics: {
                title: string;
                tasksCompleted: string;
                timeWorked: string;
                pomodoros: string;
                focusScore: string;
            };
            strengths: string;
            weaknesses: string;
            recommendations: string;
            patterns: string;
        };
        FocusScoreGauge: {
            label: string;
            messages: {
                excellent: string;
                veryGood: string;
                good: string;
                moderate: string;
                low: string;
                needsImprovement: string;
            };
            description: string;
        };
        GenerateReportDialog: {
            trigger: string;
            title: string;
            description: string;
            includes: {
                title: string;
                metrics: string;
                strengths: string;
                recommendations: string;
                patterns: string;
                score: string;
            };
            buttons: {
                cancel: string;
                generate: string;
                close: string;
                retry: string;
            };
            loading: {
                title: string;
                description: string;
            };
            success: {
                title: string;
                description: string;
            };
            error: string;
        };
        DailyMetricsCard: {
            title: string;
            today: string;
            metrics: {
                completed: string;
                time: string;
                pomodoros: string;
                focus: string;
            };
        };
        PeakHoursChart: {
            title: string;
            description: string;
            empty: string;
            yAxis: string;
            tooltip: string;
            legend: {
                high: string;
                good: string;
                fair: string;
                low: string;
            };
        };
        ProductivityInsights: {
            title: string;
            description: string;
            empty: string;
            peakHours: {
                title: string;
                description: string;
            };
            peakDays: {
                title: string;
                description: string;
            };
            tip: string;
        };
        WeeklyChart: {
            title: string;
            description: string;
            weekOf: string;
            tasks: string;
            minutes: string;
            tasksCompleted: string;
            minutesWorked: string;
            tooltip: {
                tasks: string;
                time: string;
            };
        };
        AuthForm: {
            welcome: string;
            subtitle: string;
            emailLogin: string;
            or: string;
            googleLogin: string;
            githubLogin: string;
            noAccount: string;
            register: string;
            connecting: string;
        };
        Processing: {
            text: string;
        };
        ConfirmDelete: {
            title: string;
            description: string;
            confirm: string;
            cancel: string;
            deleting: string;
        };
        ConnectionStatus: {
            backOnline: {
                title: string;
                description: string;
            };
            offline: {
                title: string;
                description: string;
            };
        };
        SyncStatus: {
            offline: string;
            syncing: string;
            error: string;
            pending: string;
            synced: string;
            idle: string;
            neverSynced: string;
            justNow: string;
            minutesAgo: string;
            hoursAgo: string;
            lastSync: string;
            clickToSync: string;
        };
        PWAInstallButton: {
            install: string;
        };
        PWATester: {
            pwaStatus: {
                title: string;
                description: string;
                installable: string;
                installed: string;
                onlineStatus: string;
                online: string;
                offline: string;
                installButton: string;
            };
            pushNotifications: {
                title: string;
                description: string;
                supported: string;
                permission: string;
                subscribed: string;
                requestPermission: string;
                sendBrowser: string;
                sendBackground: string;
                granted: string;
                denied: string;
                testSent: string;
                backgroundSent: string;
            };
            keyboardShortcuts: {
                title: string;
                description: string;
                available: string;
                newTask: string;
                quickTimer: string;
                search: string;
                installPwa: string;
                triggerNewTask: string;
            };
            yes: string;
            no: string;
        };
        Error: {
            title: string;
            description: string;
            retry: string;
            home: string;
        };
        NotFound: {
            title: string;
            description: string;
            message: string;
            home: string;
            back: string;
        };
        ProjectBoard: {
            columns: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            addTask: string;
        };
        ProjectList: {
            columns: {
                task: string;
                dueDate: string;
                priority: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
        };
        FocusMode: {
            selectTask: string;
            deepWork: string;
            breakTime: string;
            loading: string;
            completeTask: string;
            exit: string;
        };
        ProjectFiles: {
            empty: string;
            name: string;
            task: string;
            size: string;
            uploadedBy: string;
            date: string;
            actions: string;
        };
        Profile: {
            title: string;
            tabs: {
                profile: string;
                ai: string;
                security: string;
                privacy: string;
                integrations: string;
                subscription: string;
                account: string;
            };
            profile: {
                title: string;
                description: string;
                avatar: {
                    change: string;
                    hint: string;
                };
                form: {
                    name: string;
                    namePlaceholder: string;
                    email: string;
                    emailHint: string;
                    phone: string;
                    phonePlaceholder: string;
                    jobTitle: string;
                    jobTitlePlaceholder: string;
                    department: string;
                    departmentPlaceholder: string;
                    timezone: string;
                    timezonePlaceholder: string;
                    bio: string;
                    bioPlaceholder: string;
                };
                save: string;
                saving: string;
            };
            ai: {
                title: string;
                description: string;
                enableAI: string;
                enableAIDescription: string;
                suggestions: {
                    title: string;
                    durations: string;
                    priorities: string;
                    scheduling: string;
                    weeklyReports: string;
                };
                aggressiveness: {
                    title: string;
                    description: string;
                    conservative: string;
                    proactive: string;
                };
                energy: {
                    title: string;
                    description: string;
                    morning: string;
                    afternoon: string;
                    evening: string;
                    levels: {
                        low: string;
                        medium: string;
                        high: string;
                    };
                };
                save: string;
                saving: string;
            };
            security: {
                title: string;
                description: string;
                password: {
                    title: string;
                    lastChanged: string;
                    change: string;
                };
                twoFactor: {
                    title: string;
                    description: string;
                    comingSoon: string;
                };
                connectedAccounts: {
                    title: string;
                    connected: string;
                };
                activeSessions: {
                    title: string;
                    currentSession: string;
                    thisDevice: string;
                    active: string;
                };
            };
            privacy: {
                title: string;
                description: string;
                dataSharing: {
                    title: string;
                    analytics: string;
                    analyticsDescription: string;
                    activityStatus: string;
                    activityStatusDescription: string;
                };
                emailNotifications: {
                    title: string;
                    taskReminders: string;
                    weeklyDigest: string;
                    marketing: string;
                };
                save: string;
                saving: string;
            };
            integrations: {
                title: string;
                description: string;
                connect: string;
                comingSoon: string;
                providers: {
                    googleCalendar: {
                        name: string;
                        description: string;
                    };
                    slack: {
                        name: string;
                        description: string;
                    };
                    github: {
                        name: string;
                        description: string;
                    };
                };
            };
            subscription: {
                title: string;
                description: string;
                currentPlan: string;
                upgrade: string;
                features: {
                    unlimitedTasks: string;
                    workspaces: string;
                    basicAI: string;
                    advancedAnalytics: string;
                    teamCollaboration: string;
                };
                billingHistory: {
                    title: string;
                    empty: string;
                };
            };
            account: {
                title: string;
                description: string;
                export: {
                    title: string;
                    description: string;
                    button: string;
                    exporting: string;
                };
                delete: {
                    title: string;
                    description: string;
                    button: string;
                    deleting: string;
                    dialog: {
                        title: string;
                        description: string;
                        cancel: string;
                        confirm: string;
                    };
                };
            };
            toast: {
                profileUpdated: string;
                profileError: string;
                aiUpdated: string;
                aiError: string;
                privacyUpdated: string;
                privacyError: string;
                exportStarted: string;
                exportError: string;
                deleteError: string;
            };
        };
        AIReport: {
            title: string;
            subtitle: string;
            generateButton: string;
            analyzing: string;
            emptyState: string;
            regenerate: string;
            export: string;
            stats: {
                pomodoros: string;
                tasks: string;
                streak: string;
                average: string;
            };
        };
        Timer: {
            title: string;
            subtitle: string;
            tabs: {
                timer: string;
                history: string;
            };
            modes: {
                work: string;
                shortBreak: string;
                longBreak: string;
            };
            history: {
                totalSessions: string;
                totalTime: string;
                workSessions: string;
                noSessions: string;
                noSessionsDescription: string;
                loading: string;
                filters: string;
                allTypes: string;
                today: string;
                last7Days: string;
                last30Days: string;
                last90Days: string;
                page: string;
            };
        };
        AIWeeklyReport: {
            weeklyReport: string;
            generateReport: string;
            analyzing: string;
            sections: {
                summary: string;
                achievements: string;
                improvements: string;
                recommendations: string;
            };
        };
        common: {
            loading: string;
            save: string;
            cancel: string;
            delete: string;
            edit: string;
            create: string;
            update: string;
            confirm: string;
            close: string;
            search: string;
            noResults: string;
            error: string;
            success: string;
            warning: string;
            info: string;
        };
        Sync: {
            offline: string;
            offlineDesc: string;
            syncing: string;
            syncingDesc: string;
            error: string;
            errorDesc: string;
            pending: string;
            pendingDesc: string;
            synced: string;
            syncedDesc: string;
            unknown: string;
            failedChanges: string;
            pendingChanges: string;
            offlineBanner: string;
        };
        About: {
            description: string;
            version: string;
            platform: string;
            madeWith: string;
            website: string;
            documentation: string;
        };
        Shortcuts: {
            title: string;
            description: string;
            footerNote: string;
        };
        Goals: {
            title: string;
            subtitle: string;
            createObjective: string;
            noObjectives: string;
            noObjectivesDescription: string;
            listTitle: string;
            backToList: string;
            notFound: string;
            edit: string;
            createDescription: string;
            cancel: string;
            create: string;
            form: {
                title: string;
                titlePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                period: string;
                startDate: string;
                endDate: string;
                color: string;
                icon: string;
            };
            periods: {
                QUARTERLY: string;
                YEARLY: string;
                CUSTOM: string;
            };
            status: {
                DRAFT: string;
                ACTIVE: string;
                COMPLETED: string;
                CANCELLED: string;
                AT_RISK: string;
            };
            period: {
                Q1: string;
                Q2: string;
                Q3: string;
                Q4: string;
                YEARLY: string;
            };
            keyResults: {
                title: string;
                subtitle: string;
                add: string;
                addFirst: string;
                empty: string;
                createTitle: string;
                createDescription: string;
                name: string;
                target: string;
                current: string;
                unit: string;
                metricType: string;
                confirmDelete: string;
                deleted: string;
                form: {
                    title: string;
                    titlePlaceholder: string;
                    description: string;
                    descriptionPlaceholder: string;
                    metricType: string;
                    startValue: string;
                    targetValue: string;
                    unit: string;
                    unitPlaceholder: string;
                };
                actions: {
                    cancel: string;
                    create: string;
                    creating: string;
                };
                validation: {
                    titleRequired: string;
                };
                toast: {
                    created: string;
                    error: string;
                };
                types: {
                    PERCENTAGE: string;
                    NUMBER: string;
                    CURRENCY: string;
                    BOOLEAN: string;
                };
            };
            stats: {
                totalObjectives: string;
                onTrack: string;
                atRisk: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
            };
            averageProgress: string;
            viewAll: string;
            total: string;
            completed: string;
            progress: string;
            dueDate: string;
            okrsAtRisk: string;
            left: string;
        };
        CustomFields: {
            title: string;
            subtitle: string;
            addField: string;
            noFields: string;
            noFieldsDescription: string;
            editField: string;
            createField: string;
            updateField: string;
            addFieldDescription: string;
            fieldName: string;
            fieldNamePlaceholder: string;
            fieldType: string;
            description: string;
            descriptionPlaceholder: string;
            options: string;
            addOption: string;
            required: string;
            deleteConfirm: string;
            cancel: string;
            create: string;
            save: string;
            fieldCreated: string;
            fieldUpdated: string;
            fieldDeleted: string;
            fieldError: string;
            deleteError: string;
            nameRequired: string;
            optionsRequired: string;
            types: {
                TEXT: string;
                NUMBER: string;
                SELECT: string;
                MULTI_SELECT: string;
                DATE: string;
                URL: string;
                EMAIL: string;
                CHECKBOX: string;
            };
        };
        Focus: {
            title: string;
            subtitle: string;
            startSession: string;
            endSession: string;
            ambientAudio: string;
            selectTrack: string;
            noTrack: string;
            volume: string;
            favorites: string;
            addToFavorites: string;
            removeFromFavorites: string;
            categories: {
                nature: string;
                cafe: string;
                whiteNoise: string;
                binaural: string;
                music: string;
            };
            tracks: {
                rain: string;
                thunderstorm: string;
                forest: string;
                ocean: string;
                river: string;
                cafe: string;
                library: string;
                whiteNoise: string;
                pinkNoise: string;
                brownNoise: string;
                binaural: string;
                lofi: string;
            };
            modes: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            modeDescriptions: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            stats: {
                totalSessions: string;
                totalMinutes: string;
                avgSession: string;
                streakDays: string;
            };
        };
        Search: {
            title: string;
            placeholder: string;
            placeholderWithAI: string;
            noResults: string;
            noResultsDescription: string;
            suggestions: string;
            results: string;
            navigate: string;
            select: string;
            close: string;
            aiPowered: string;
            types: {
                task: string;
                project: string;
                habit: string;
            };
            filters: {
                all: string;
                tasks: string;
                projects: string;
                habits: string;
            };
        };
        Meetings: {
            title: string;
            subtitle: string;
            analyze: string;
            analyzing: string;
            transcriptPlaceholder: string;
            summary: string;
            keyPoints: string;
            actionItems: string;
            decisions: string;
            participants: string;
            topics: string;
            sentiment: string;
            followUpRequired: string;
            convertToTasks: string;
            converting: string;
            tasksCreated: string;
            noActionItems: string;
            sentiments: {
                POSITIVE: string;
                NEUTRAL: string;
                NEGATIVE: string;
                MIXED: string;
            };
            summaryStyles: {
                executive: string;
                detailed: string;
                bulletPoints: string;
            };
        };
        Workload: {
            title: string;
            subtitle: string;
            myWorkload: string;
            teamWorkload: string;
            assignedTasks: string;
            completedTasks: string;
            overdueTasks: string;
            hoursThisWeek: string;
            capacityRemaining: string;
            workloadScore: string;
            trend: string;
            levels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                OVERLOADED: string;
            };
            trends: {
                INCREASING: string;
                STABLE: string;
                DECREASING: string;
            };
            suggestions: {
                title: string;
                redistribute: string;
                delegate: string;
                prioritize: string;
            };
            distribution: {
                overloaded: string;
                balanced: string;
                underutilized: string;
            };
        };
        Wellbeing: {
            title: string;
            subtitle: string;
            burnoutRisk: string;
            workLifeBalance: string;
            focusQuality: string;
            consistencyScore: string;
            riskLevels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                CRITICAL: string;
            };
            recommendations: {
                title: string;
                takeBreak: string;
                endDay: string;
                weekend: string;
                lateNight: string;
            };
            patterns: {
                title: string;
                lateNightWork: string;
                weekendWork: string;
                longSessions: string;
                avgHoursPerDay: string;
            };
            weeklySummary: string;
            insights: string;
            intervention: {
                gentleReminder: string;
                strongWarning: string;
                criticalAlert: string;
            };
        };
        Mobile: {
            home: {
                greeting: string;
                myTasks: string;
                pending: string;
                completed: string;
                today: string;
                loadError: string;
                retry: string;
                noTasks: string;
                noTasksInView: string;
                okrsGoals: string;
                active: string;
            };
            filters: {
                all: string;
                today: string;
                upcoming: string;
                completed: string;
            };
            tabs: {
                home: string;
                habits: string;
                calendar: string;
                profile: string;
            };
            common: {
                loading: string;
                error: string;
                cancel: string;
                save: string;
                delete: string;
                edit: string;
                create: string;
                back: string;
                done: string;
                search: string;
                noResults: string;
            };
            priority: {
                high: string;
                medium: string;
                low: string;
            };
            task: {
                newTask: string;
                editTask: string;
                title: string;
                description: string;
                project: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                noProject: string;
                selectProject: string;
                taskCreated: string;
                taskUpdated: string;
                createError: string;
                updateError: string;
            };
            profile: {
                title: string;
                settings: string;
                logout: string;
                logoutConfirm: string;
                theme: string;
                language: string;
                notifications: string;
                about: string;
            };
            workspaces: {
                title: string;
                noWorkspaces: string;
                createFirst: string;
            };
            goals: {
                title: string;
                newGoal: string;
                editGoal: string;
                noGoals: string;
                createFirst: string;
                keyResults: string;
                addKeyResult: string;
                progress: string;
                startDate: string;
                endDate: string;
            };
            habits: {
                title: string;
                loadError: string;
                retry: string;
                completed: string;
                streak: string;
                bestStreak: string;
                progress: string;
                oneWeek: string;
                oneWeekMessage: string;
                oneMonth: string;
                oneMonthMessage: string;
                hundredDays: string;
                hundredDaysMessage: string;
                errorUpdating: string;
                noHabits: string;
                createFirst: string;
                days: string;
            };
            calendar: {
                title: string;
                subtitle: string;
                noBlocks: string;
                noBlocksHint: string;
            };
            profileOptions: {
                notifications: string;
                darkMode: string;
                settings: string;
                help: string;
                about: string;
                logout: string;
                logoutTitle: string;
                logoutMessage: string;
                cancel: string;
                exit: string;
                version: string;
                completed: string;
                focusMinutes: string;
                pomodoros: string;
                loading: string;
            };
        };
        UnifiedTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            tabs: {
                workspaces: string;
                projects: string;
                tasks: string;
            };
            filterByWorkspace: string;
            filterByProject: string;
            allWorkspaces: string;
            allProjects: string;
            viewingProjectsFor: string;
            viewingTasksFor: string;
            selectWorkspaceFirst: string;
            selectProjectFirst: string;
            noDeletedWorkspaces: string;
            noDeletedProjects: string;
            noDeletedTasks: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
    };
    readonly 'pt-br': {
        Calendar: {
            title: string;
            subtitle: string;
            today: string;
            month: string;
            week: string;
            day: string;
            agenda: string;
            previous: string;
            next: string;
        };
        Sidebar: {
            today: string;
            tasks: string;
            habits: string;
            calendar: string;
            projects: string;
            workspaces: string;
            workspacesTrash: string;
            projectsTrash: string;
            tasksTrash: string;
            trash: string;
            tags: string;
            analytics: string;
            settings: string;
            installApp: string;
            goals: string;
            eisenhower: string;
            meetings: string;
            wellbeing: string;
            workload: string;
        };
        Settings: {
            title: string;
            subtitle: string;
            appearance: string;
            theme: string;
            selectTheme: string;
            themes: {
                light: string;
                dark: string;
                system: string;
            };
            language: string;
            selectLanguage: string;
            languageDescription: string;
            timer: string;
            defaultMode: string;
            defaultModeDescription: string;
            focusDuration: string;
            shortBreakDuration: string;
            longBreakDuration: string;
            longBreakInterval: string;
            longBreakIntervalDescription: string;
            autoStartBreaks: string;
            autoStartBreaksDescription: string;
            autoStartPomodoros: string;
            autoStartPomodorosDescription: string;
            notificationsAndSound: string;
            notificationsDescription: string;
            soundEffects: string;
            soundEffectsDescription: string;
            browserNotifications: string;
            browserNotificationsDescription: string;
            keyboardShortcuts: string;
            keyboardShortcutsDescription: string;
            shortcuts: {
                startPause: string;
                newTask: string;
                search: string;
                settings: string;
                toggleSidebar: string;
            };
            about: string;
            version: string;
            platform: string;
            developer: string;
        };
        TimerWidget: {
            startTimer: string;
        };
        TopBar: {
            searchPlaceholder: string;
            myAccount: string;
            profile: string;
            settings: string;
            logout: string;
            menu: string;
        };
        Dashboard: {
            completed: string;
            subtasks: string;
            timeWorked: string;
            productivity: string;
            today: string;
            todaysTasks: string;
            noTasks: string;
            noTasksDescription: string;
            createTask: string;
            allTasksCompleted: string;
            tasksCompletedToday: string;
            showCompleted: string;
            hideCompleted: string;
            viewList: string;
            viewGrid: string;
            sortOptions: {
                priority: string;
                duration: string;
                created: string;
            };
            quickActionButtons: {
                newProject: string;
                startTimer: string;
                newTask: string;
            };
        };
        Tasks: {
            title: string;
            subtitle: string;
            newTask: string;
            noTasksWithTag: string;
            allClear: string;
            noTasksWithTagDescription: string;
            noPendingTasks: string;
            confirmDeleteTask: string;
            taskDeleted: string;
            taskDeleteError: string;
        };
        Projects: {
            title: string;
            subtitle: string;
            newProject: string;
            selectWorkspace: string;
            selectWorkspaceDescription: string;
            noProjects: string;
            noProjectsDescription: string;
            createProject: string;
        };
        Workspaces: {
            title: string;
            subtitle: string;
            newWorkspace: string;
            noWorkspaces: string;
            noWorkspacesDescription: string;
            createWorkspace: string;
        };
        WorkspaceCard: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            status: {
                active: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            actions: {
                settings: string;
                delete: string;
                moreOptions: string;
            };
            confirmDelete: string;
            toast: {
                deleted: string;
                deleteError: string;
            };
        };
        Trash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            noDeletedWorkspaces: string;
            noDeletedWorkspacesDescription: string;
            deletedAt: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        ProjectsTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectWorkspace: string;
            allWorkspaces: string;
            viewingProjectsFor: string;
            selectWorkspaceFirst: string;
            selectWorkspaceFirstDescription: string;
            noDeletedProjects: string;
            noDeletedProjectsDescription: string;
            deletedAt: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
        TasksTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            selectProject: string;
            allProjects: string;
            viewingTasksFor: string;
            selectProjectFirst: string;
            selectProjectFirstDescription: string;
            noDeletedTasks: string;
            noDeletedTasksDescription: string;
            deletedAt: string;
            restore: string;
            permanentDelete: string;
            confirmDelete: string;
        };
        Tags: {
            title: string;
            subtitle: string;
            newTag: string;
            confirmDelete: string;
            tagDeleted: string;
            deleteError: string;
            edit: string;
            delete: string;
            task: string;
            tasks: string;
            noTags: string;
            noTagsDescription: string;
            createTag: string;
            tagCreated: string;
        };
        Habits: {
            title: string;
            subtitle: string;
            newHabit: string;
            todayProgress: string;
            completed: string;
            allDone: string;
            keepGoing: string;
            noHabits: string;
            noHabitsDescription: string;
            createHabit: string;
            stats: {
                currentStreak: string;
                longestStreak: string;
                totalCompletions: string;
                completionRate: string;
                thisWeek: string;
                thisMonth: string;
            };
            frequency: {
                DAILY: string;
                WEEKLY: string;
                SPECIFIC_DAYS: string;
                MONTHLY: string;
                daily: string;
                weekly: string;
                custom: string;
            };
            timeOfDay: {
                MORNING: string;
                AFTERNOON: string;
                EVENING: string;
                ANYTIME: string;
                morning: string;
                afternoon: string;
                evening: string;
                anytime: string;
            };
            daysOfWeek: {
                short: string[];
                long: string[];
            };
            actions: {
                complete: string;
                undo: string;
                pause: string;
                resume: string;
                edit: string;
                delete: string;
                viewStats: string;
            };
            form: {
                createTitle: string;
                createDescription: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                icon: string;
                color: string;
                frequency: string;
                daysOfWeek: string;
                targetDays: string;
                targetCount: string;
                timeOfDay: string;
                preferredTime: string;
                reminder: string;
                create: string;
                creating: string;
                cancel: string;
            };
            toast: {
                created: string;
                updated: string;
                deleted: string;
                completed: string;
                uncompleted: string;
                paused: string;
                resumed: string;
                streakBonus: string;
                error: string;
            };
            confirmDelete: string;
            status: {
                active: string;
                paused: string;
                archived: string;
            };
            emptyToday: {
                weekend: string;
                allDone: string;
                noScheduled: string;
            };
            streakMessage: {
                new: string;
                week: string;
                month: string;
                hundred: string;
            };
            onboarding: {
                welcome: {
                    title: string;
                    description: string;
                };
                streaks: {
                    title: string;
                    description: string;
                };
                reminders: {
                    title: string;
                    description: string;
                };
                gamification: {
                    title: string;
                    description: string;
                };
                skip: string;
                next: string;
                getStarted: string;
            };
        };
        Analytics: {
            title: string;
            subtitle: string;
            pomodoros: string;
            thisWeek: string;
            tasksCompleted: string;
            streak: string;
            avgPerDay: string;
            tabs: {
                overview: string;
                weekly: string;
                focus: string;
                aiInsights: string;
            };
            focusScore: {
                label: string;
                description: string;
                howToImprove: string;
                tips: {
                    reduceBreaks: string;
                    shortenBreaks: string;
                    usePomodoro: string;
                    eliminateDistractions: string;
                };
                whatIs: string;
                whatIsDescription: string;
                howCalculated: string;
                calculation: string;
                penalty: string;
                max: string;
                interpretation: string;
                excellent: string;
                moderate: string;
                needsImprovement: string;
                noData: string;
                noDataDescription: string;
            };
            weekly: {
                summary: string;
                comingSoon: string;
            };
            aiLearning: {
                title: string;
                description: string;
                whatAnalyzes: string;
                analyzesList: {
                    hours: string;
                    days: string;
                    duration: string;
                    completion: string;
                    patterns: string;
                };
                whatOffers: string;
                offersList: {
                    recommendations: string;
                    predictions: string;
                    insights: string;
                    visualizations: string;
                };
                tip: string;
            };
        };
        CreateTaskDialog: {
            validation: {
                titleRequired: string;
                projectRequired: string;
            };
            toast: {
                success: string;
                error: string;
                aiTitleRequired: string;
                aiSuccess: string;
            };
            ai: {
                generatedDescription: string;
                generating: string;
                magic: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            title: string;
            description: string;
            form: {
                title: string;
                titlePlaceholder: string;
                project: string;
                selectProject: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                description: string;
                descriptionPlaceholder: string;
                assignee: string;
                selectAssignee: string;
                workspaceMembers: string;
                assignToMe: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateProjectDialog: {
            validation: {
                nameRequired: string;
                workspaceRequired: string;
            };
            toast: {
                success: string;
                successWithTasks: string;
                templateSelected: string;
                error: string;
                createWorkspace: string;
            };
            title: string;
            description: string;
            templates: {
                title: string;
                tasksCount: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
            form: {
                color: string;
                name: string;
                namePlaceholder: string;
                workspace: string;
                description: string;
                descriptionPlaceholder: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        CreateWorkspaceDialog: {
            validation: {
                nameRequired: string;
            };
            toast: {
                success: string;
                error: string;
            };
            title: string;
            description: string;
            form: {
                type: string;
                name: string;
                namePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
            };
            types: {
                personal: string;
                personalDesc: string;
                work: string;
                workDesc: string;
                team: string;
                teamDesc: string;
            };
            buttons: {
                cancel: string;
                creating: string;
                create: string;
            };
        };
        SubtaskList: {
            title: string;
            empty: string;
            add: string;
            placeholder: string;
            nested: string;
            tooltips: {
                drag: string;
                edit: string;
                delete: string;
            };
            toast: {
                created: string;
                createError: string;
                completed: string;
                completeError: string;
                reopened: string;
                reopenError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        CommentThread: {
            title: string;
            empty: string;
            placeholder: string;
            shortcut: string;
            edited: string;
            actions: {
                edit: string;
                delete: string;
                save: string;
                saving: string;
                cancel: string;
                send: string;
                sending: string;
            };
            toast: {
                added: string;
                addError: string;
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        Notifications: {
            title: string;
            empty: string;
            loading: string;
            markAllRead: string;
        };
        FileUpload: {
            errors: {
                tooLarge: string;
                invalidType: string;
                invalidResponse: string;
                unknown: string;
                uploadError: string;
                networkError: string;
                statusError: string;
            };
            success: {
                uploaded: string;
            };
            info: {
                cancelled: string;
            };
            dropzone: {
                dragging: string;
                idle: string;
                maxSize: string;
            };
            uploading: string;
        };
        AttachmentList: {
            title: string;
            empty: string;
            total: string;
            by: string;
            tooltips: {
                preview: string;
                download: string;
                delete: string;
            };
            toast: {
                downloading: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ActivityFeed: {
            title: string;
            showing: string;
            showMore: string;
            empty: string;
            dates: {
                today: string;
                yesterday: string;
            };
            actions: {
                TASK_CREATED: string;
                TASK_UPDATED: string;
                TASK_COMPLETED: string;
                TASK_DELETED: string;
                COMMENT_ADDED: string;
                COMMENT_EDITED: string;
                COMMENT_DELETED: string;
                ATTACHMENT_ADDED: string;
                ATTACHMENT_DELETED: string;
                SUBTASK_ADDED: string;
                SUBTASK_COMPLETED: string;
                STATUS_CHANGED: string;
                PRIORITY_CHANGED: string;
                ASSIGNEE_CHANGED: string;
                DUE_DATE_CHANGED: string;
            };
            details: {
                fromTo: string;
                to: string;
                removed: string;
                item: string;
                mentioned: string;
            };
        };
        ProjectCard: {
            tasks: string;
            tasksProgress: string;
            progress: string;
            archived: string;
            actions: {
                moreOptions: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            toast: {
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
            confirmDelete: string;
        };
        ProjectSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        ProjectSettings: {
            general: {
                title: string;
                description: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                color: {
                    label: string;
                };
            };
            actions: {
                save: string;
                saving: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            danger: {
                title: string;
                description: string;
                archive: {
                    title: string;
                    description: string;
                };
                unarchive: {
                    title: string;
                    description: string;
                };
                delete: {
                    title: string;
                    description: string;
                };
            };
            deleteDialog: {
                title: string;
                description: string;
                cancel: string;
                confirm: string;
            };
            toast: {
                updated: string;
                updateError: string;
                archived: string;
                unarchived: string;
                archiveError: string;
                deleted: string;
                deleteError: string;
            };
        };
        Breadcrumbs: {
            home: string;
        };
        ProjectDetail: {
            notFound: string;
            notFoundDescription: string;
            backToProjects: string;
            addTask: string;
            tasksSection: string;
            breadcrumbs: {
                projects: string;
            };
            badges: {
                archived: string;
                completed: string;
            };
            stats: {
                task: string;
                tasks: string;
                totalTasks: string;
                completedTasks: string;
                completed: string;
            };
            status: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
                timeline: string;
                files: string;
                settings: string;
            };
            overview: {
                progress: string;
                recentTasks: string;
            };
            actions: {
                archive: string;
                unarchive: string;
            };
            menu: {
                settings: string;
                markComplete: string;
                markIncomplete: string;
                archive: string;
                unarchive: string;
                delete: string;
            };
            emptyState: {
                title: string;
                description: string;
                archivedDescription: string;
                completedDescription: string;
            };
            confirmArchive: string;
            confirmComplete: string;
            confirmUncomplete: string;
            confirmDelete: string;
            confirmDeleteTask: string;
            toast: {
                archived: string;
                archiveError: string;
                completed: string;
                uncompleted: string;
                completeError: string;
                deleted: string;
                taskDeleted: string;
                taskDeleteError: string;
            };
            backToWorkspace: string;
        };
        WorkspaceInfoBar: {
            types: {
                PERSONAL: string;
                WORK: string;
                TEAM: string;
            };
            team: string;
            stats: {
                projects: string;
                activeTasks: string;
                completed: string;
            };
            actions: {
                newProject: string;
                settings: string;
            };
        };
        WorkspaceSelector: {
            create: string;
            label: string;
            defaultName: string;
            search: string;
            noResults: string;
            types: {
                personal: string;
                work: string;
                team: string;
            };
            stats: {
                projects: string;
                tasks: string;
            };
            settings: string;
            newWorkspace: string;
        };
        WorkspaceSettingsDialog: {
            title: string;
            description: string;
            form: {
                name: {
                    label: string;
                    placeholder: string;
                };
                description: {
                    label: string;
                    placeholder: string;
                };
                type: {
                    label: string;
                    helper: string;
                    options: {
                        PERSONAL: string;
                        WORK: string;
                        TEAM: string;
                    };
                };
                color: {
                    label: string;
                };
                icon: {
                    label: string;
                };
            };
            dangerZone: {
                title: string;
                description: string;
                delete: string;
                deleting: string;
                confirm: string;
            };
            actions: {
                cancel: string;
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
                deleted: string;
                deleteError: string;
            };
            tabs: {
                general: string;
                members: string;
                configuration: string;
                activity: string;
            };
        };
        InviteMemberDialog: {
            title: string;
            description: string;
            emailLabel: string;
            roleLabel: string;
            rolePlaceholder: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            cancel: string;
            invite: string;
            success: string;
            successWithToken: string;
            error: string;
            inviteLink: string;
            copied: string;
            done: string;
            devTokenNote: string;
        };
        WorkspaceMembersSettings: {
            membersTitle: string;
            membersDescription: string;
            inviteMember: string;
            loading: string;
            user: string;
            role: string;
            joined: string;
            unknownUser: string;
            remove: string;
            confirmRemove: string;
            invitationsTitle: string;
            invitationsDescription: string;
            email: string;
            status: string;
            sent: string;
            roles: {
                owner: string;
                admin: string;
                member: string;
                viewer: string;
            };
            memberRemoved: string;
            errorRemoving: string;
            noMembers: string;
            removeSuccess: string;
            removeError: string;
        };
        AcceptInvitationPage: {
            title: string;
            description: string;
            missingToken: string;
            confirmText: string;
            processing: string;
            success: string;
            redirecting: string;
            failed: string;
            acceptButton: string;
            goToWorkspaces: string;
            backHome: string;
            error: string;
        };
        CreateTagDialog: {
            title: {
                create: string;
                edit: string;
            };
            description: {
                create: string;
                edit: string;
            };
            form: {
                name: {
                    label: string;
                    placeholder: string;
                    required: string;
                };
                color: {
                    label: string;
                };
                preview: {
                    label: string;
                    default: string;
                };
            };
            actions: {
                cancel: string;
                create: string;
                creating: string;
                save: string;
                saving: string;
            };
            toast: {
                created: string;
                createError: string;
                updated: string;
                updateError: string;
            };
        };
        TagSelector: {
            addTag: string;
            loading: string;
            noTags: string;
            toast: {
                assigned: string;
                assignError: string;
                removed: string;
                removeError: string;
            };
        };
        PomodoroTimer: {
            enterFocusMode: string;
            mode: string;
            modes: {
                pomodoro: string;
                continuous: string;
                stopwatch: string;
                shortBreak: string;
                longBreak: string;
                pomodoroCount: string;
            };
            pauses: string;
            paused: string;
            switchTask: {
                buttonTitle: string;
                title: string;
                description: string;
            };
        };
        SessionHistory: {
            error: string;
            stats: {
                pomodoros: string;
                totalTime: string;
                focusScore: string;
                completionRate: string;
            };
            filters: {
                title: string;
                type: string;
                allTypes: string;
                status: string;
                allStatus: string;
                completedOnly: string;
            };
            types: {
                work: string;
                short_break: string;
                long_break: string;
                shortBreak: string;
                longBreak: string;
                continuous: string;
            };
            sessions: {
                title: string;
                count: string;
                empty: string;
                pause: string;
                pauses: string;
            };
            pagination: {
                showing: string;
            };
            chart: {
                title: string;
            };
        };
        TaskSelector: {
            placeholder: string;
            searchPlaceholder: string;
            noTasks: string;
            groupHeading: string;
            noTaskAssigned: string;
        };
        TaskCard: {
            priority: {
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            actions: {
                viewEdit: string;
                delete: string;
            };
            status: {
                completed: string;
            };
        };
        TaskList: {
            loading: string;
            error: string;
            empty: string;
            emptyMyTasks: string;
            retry: string;
            filters: {
                allTasks: string;
                myTasks: string;
            };
        };
        TaskDetailPanel: {
            title: string;
            titlePlaceholder: string;
            description: {
                label: string;
                placeholder: string;
                empty: string;
            };
            details: {
                title: string;
                dueDate: string;
                startDate: string;
                scheduledDate: string;
                estimation: string;
                linkToGoal: string;
                addAnotherGoal: string;
                selectGoal: string;
                noActiveObjectives: string;
            };
            tabs: {
                subtasks: string;
                comments: string;
                attachments: string;
                activity: string;
            };
            tags: {
                none: string;
                add: string;
                available: string;
                noAvailable: string;
                create: string;
            };
            buttons: {
                save: string;
                delete: string;
            };
            footer: {
                created: string;
            };
            confirmDelete: string;
            toast: {
                updated: string;
                statusUpdated: string;
                statusError: string;
                priorityUpdated: string;
                priorityError: string;
                updateError: string;
                deleted: string;
                deleteError: string;
                tagAssigned: string;
                tagError: string;
                noTaskId: string;
                shareError: string;
                linkCopied: string;
                linkedToGoal: string;
                linkGoalError: string;
            };
            share: {
                title: string;
                description: string;
            };
            priorities: {
                low: string;
                medium: string;
                high: string;
                urgent: string;
            };
            statuses: {
                todo: string;
                inProgress: string;
                completed: string;
                cancelled: string;
            };
        };
        TaskFilters: {
            label: string;
            clear: string;
            status: {
                label: string;
                TODO: string;
                IN_PROGRESS: string;
                COMPLETED: string;
                CANCELLED: string;
            };
            priority: {
                label: string;
                LOW: string;
                MEDIUM: string;
                HIGH: string;
                URGENT: string;
            };
            tags: {
                label: string;
            };
        };
        TaskForm: {
            label: string;
            placeholder: string;
            button: {
                add: string;
                adding: string;
            };
            toast: {
                success: string;
                error: string;
                projectIdRequired: string;
            };
        };
        TaskDetailView: {
            title: string;
            description: string;
            noDate: string;
            subtasks: {
                title: string;
                empty: string;
            };
            time: {
                title: string;
                comingSoon: string;
            };
            notFound: string;
        };
        AIAssistantSidebar: {
            title: string;
            welcome: string;
            thinking: string;
            placeholder: string;
            error: string;
        };
        ReportCard: {
            scopes: {
                TASK_COMPLETION: string;
                WEEKLY_SCHEDULED: string;
                MONTHLY_SCHEDULED: string;
                PROJECT_SUMMARY: string;
                PERSONAL_ANALYSIS: string;
                default: string;
            };
            metrics: {
                tasks: string;
                hoursWorked: string;
                pomodoros: string;
            };
            stats: {
                strengths: string;
                weaknesses: string;
                recommendations: string;
            };
        };
        ReportDetail: {
            generatedOn: string;
            poweredBy: string;
            summary: string;
            metrics: {
                title: string;
                tasksCompleted: string;
                timeWorked: string;
                pomodoros: string;
                focusScore: string;
            };
            strengths: string;
            weaknesses: string;
            recommendations: string;
            patterns: string;
        };
        FocusScoreGauge: {
            label: string;
            messages: {
                excellent: string;
                veryGood: string;
                good: string;
                moderate: string;
                low: string;
                needsImprovement: string;
            };
            description: string;
        };
        GenerateReportDialog: {
            trigger: string;
            title: string;
            description: string;
            includes: {
                title: string;
                metrics: string;
                strengths: string;
                recommendations: string;
                patterns: string;
                score: string;
            };
            buttons: {
                cancel: string;
                generate: string;
                close: string;
                retry: string;
            };
            loading: {
                title: string;
                description: string;
            };
            success: {
                title: string;
                description: string;
            };
            error: string;
        };
        DailyMetricsCard: {
            title: string;
            today: string;
            metrics: {
                completed: string;
                time: string;
                pomodoros: string;
                focus: string;
            };
        };
        PeakHoursChart: {
            title: string;
            description: string;
            empty: string;
            yAxis: string;
            tooltip: string;
            legend: {
                high: string;
                good: string;
                fair: string;
                low: string;
            };
        };
        ProductivityInsights: {
            title: string;
            description: string;
            empty: string;
            peakHours: {
                title: string;
                description: string;
            };
            peakDays: {
                title: string;
                description: string;
            };
            tip: string;
        };
        WeeklyChart: {
            title: string;
            description: string;
            weekOf: string;
            tasks: string;
            minutes: string;
            tasksCompleted: string;
            minutesWorked: string;
            tooltip: {
                tasks: string;
                time: string;
            };
        };
        AuthForm: {
            welcome: string;
            subtitle: string;
            emailLogin: string;
            or: string;
            googleLogin: string;
            githubLogin: string;
            noAccount: string;
            register: string;
            connecting: string;
        };
        Processing: {
            text: string;
        };
        ConfirmDelete: {
            title: string;
            description: string;
            confirm: string;
            cancel: string;
            deleting: string;
        };
        ConnectionStatus: {
            backOnline: {
                title: string;
                description: string;
            };
            offline: {
                title: string;
                description: string;
            };
        };
        SyncStatus: {
            offline: string;
            syncing: string;
            error: string;
            pending: string;
            synced: string;
            idle: string;
            neverSynced: string;
            justNow: string;
            minutesAgo: string;
            hoursAgo: string;
            lastSync: string;
            clickToSync: string;
        };
        PWAInstallButton: {
            install: string;
        };
        PWATester: {
            pwaStatus: {
                title: string;
                description: string;
                installable: string;
                installed: string;
                onlineStatus: string;
                online: string;
                offline: string;
                installButton: string;
            };
            pushNotifications: {
                title: string;
                description: string;
                supported: string;
                permission: string;
                subscribed: string;
                requestPermission: string;
                sendBrowser: string;
                sendBackground: string;
                granted: string;
                denied: string;
                testSent: string;
                backgroundSent: string;
            };
            keyboardShortcuts: {
                title: string;
                description: string;
                available: string;
                newTask: string;
                quickTimer: string;
                search: string;
                installPwa: string;
                triggerNewTask: string;
            };
            yes: string;
            no: string;
        };
        Error: {
            title: string;
            description: string;
            retry: string;
            home: string;
        };
        NotFound: {
            title: string;
            description: string;
            message: string;
            home: string;
            back: string;
        };
        WorkspaceDashboard: {
            notFound: string;
            backToWorkspaces: string;
            newProject: string;
            settings: string;
            delete: string;
            deleteConfirmation: string;
            deleteSuccess: string;
            projects: string;
            recentActivity: string;
            noActivity: string;
            viewAllActivity: string;
            stats: {
                projects: string;
                tasks: string;
                members: string;
            };
            deleteError: string;
        };
        WorkspaceActivityLog: {
            empty: {
                title: string;
                description: string;
            };
            by: string;
            pagination: {
                showing: string;
                page: string;
            };
        };
        WorkspaceConfigurationSettings: {
            form: {
                defaultView: {
                    label: string;
                    helper: string;
                    options: {
                        LIST: string;
                        KANBAN: string;
                        CALENDAR: string;
                        TIMELINE: string;
                        FOCUS: string;
                    };
                };
                defaultDueTime: {
                    label: string;
                    helper: string;
                };
                timezone: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
                locale: {
                    label: string;
                    placeholder: string;
                    helper: string;
                };
            };
            actions: {
                save: string;
                saving: string;
            };
            toast: {
                updated: string;
                updateError: string;
            };
        };
        ProjectBoard: {
            columns: {
                todo: string;
                inProgress: string;
                completed: string;
            };
            addTask: string;
        };
        ProjectList: {
            columns: {
                task: string;
                dueDate: string;
                priority: string;
            };
            emptyState: {
                title: string;
                description: string;
                action: string;
            };
        };
        FocusMode: {
            selectTask: string;
            deepWork: string;
            breakTime: string;
            loading: string;
            completeTask: string;
            exit: string;
        };
        ProjectFiles: {
            empty: string;
            name: string;
            task: string;
            size: string;
            uploadedBy: string;
            date: string;
            actions: string;
        };
        Profile: {
            title: string;
            tabs: {
                profile: string;
                ai: string;
                security: string;
                privacy: string;
                integrations: string;
                subscription: string;
                account: string;
            };
            profile: {
                title: string;
                description: string;
                avatar: {
                    change: string;
                    hint: string;
                };
                form: {
                    name: string;
                    namePlaceholder: string;
                    email: string;
                    emailHint: string;
                    phone: string;
                    phonePlaceholder: string;
                    jobTitle: string;
                    jobTitlePlaceholder: string;
                    department: string;
                    departmentPlaceholder: string;
                    timezone: string;
                    timezonePlaceholder: string;
                    bio: string;
                    bioPlaceholder: string;
                };
                save: string;
                saving: string;
            };
            ai: {
                title: string;
                description: string;
                enableAI: string;
                enableAIDescription: string;
                suggestions: {
                    title: string;
                    durations: string;
                    priorities: string;
                    scheduling: string;
                    weeklyReports: string;
                };
                aggressiveness: {
                    title: string;
                    description: string;
                    conservative: string;
                    proactive: string;
                };
                energy: {
                    title: string;
                    description: string;
                    morning: string;
                    afternoon: string;
                    evening: string;
                    levels: {
                        low: string;
                        medium: string;
                        high: string;
                    };
                };
                save: string;
                saving: string;
            };
            security: {
                title: string;
                description: string;
                password: {
                    title: string;
                    lastChanged: string;
                    change: string;
                };
                twoFactor: {
                    title: string;
                    description: string;
                    comingSoon: string;
                };
                connectedAccounts: {
                    title: string;
                    connected: string;
                };
                activeSessions: {
                    title: string;
                    currentSession: string;
                    thisDevice: string;
                    active: string;
                };
            };
            privacy: {
                title: string;
                description: string;
                dataSharing: {
                    title: string;
                    analytics: string;
                    analyticsDescription: string;
                    activityStatus: string;
                    activityStatusDescription: string;
                };
                emailNotifications: {
                    title: string;
                    taskReminders: string;
                    weeklyDigest: string;
                    marketing: string;
                };
                save: string;
                saving: string;
            };
            integrations: {
                title: string;
                description: string;
                connect: string;
                comingSoon: string;
                providers: {
                    googleCalendar: {
                        name: string;
                        description: string;
                    };
                    slack: {
                        name: string;
                        description: string;
                    };
                    github: {
                        name: string;
                        description: string;
                    };
                };
            };
            subscription: {
                title: string;
                description: string;
                currentPlan: string;
                upgrade: string;
                features: {
                    unlimitedTasks: string;
                    workspaces: string;
                    basicAI: string;
                    advancedAnalytics: string;
                    teamCollaboration: string;
                };
                billingHistory: {
                    title: string;
                    empty: string;
                };
            };
            account: {
                title: string;
                description: string;
                export: {
                    title: string;
                    description: string;
                    button: string;
                    exporting: string;
                };
                delete: {
                    title: string;
                    description: string;
                    button: string;
                    deleting: string;
                    dialog: {
                        title: string;
                        description: string;
                        cancel: string;
                        confirm: string;
                    };
                };
            };
            toast: {
                profileUpdated: string;
                profileError: string;
                aiUpdated: string;
                aiError: string;
                privacyUpdated: string;
                privacyError: string;
                exportStarted: string;
                exportError: string;
                deleteError: string;
            };
        };
        common: {
            loading: string;
            save: string;
            cancel: string;
            delete: string;
            edit: string;
            create: string;
            update: string;
            confirm: string;
            close: string;
            search: string;
            noResults: string;
            error: string;
            success: string;
            warning: string;
            info: string;
        };
        AIReport: {
            title: string;
            subtitle: string;
            generateButton: string;
            analyzing: string;
            emptyState: string;
            regenerate: string;
            export: string;
            stats: {
                pomodoros: string;
                tasks: string;
                streak: string;
                average: string;
            };
        };
        Timer: {
            title: string;
            subtitle: string;
            tabs: {
                timer: string;
                history: string;
            };
            modes: {
                work: string;
                shortBreak: string;
                longBreak: string;
            };
            history: {
                totalSessions: string;
                totalTime: string;
                workSessions: string;
                noSessions: string;
                noSessionsDescription: string;
                loading: string;
                filters: string;
                allTypes: string;
                today: string;
                last7Days: string;
                last30Days: string;
                last90Days: string;
                page: string;
            };
        };
        AIWeeklyReport: {
            weeklyReport: string;
            generateReport: string;
            analyzing: string;
            sections: {
                summary: string;
                achievements: string;
                improvements: string;
                recommendations: string;
            };
        };
        Sync: {
            offline: string;
            offlineDesc: string;
            syncing: string;
            syncingDesc: string;
            error: string;
            errorDesc: string;
            pending: string;
            pendingDesc: string;
            synced: string;
            syncedDesc: string;
            unknown: string;
            failedChanges: string;
            pendingChanges: string;
            offlineBanner: string;
        };
        About: {
            description: string;
            version: string;
            platform: string;
            madeWith: string;
            website: string;
            documentation: string;
        };
        Shortcuts: {
            title: string;
            description: string;
            footerNote: string;
        };
        Goals: {
            title: string;
            subtitle: string;
            createObjective: string;
            noObjectives: string;
            noObjectivesDescription: string;
            listTitle: string;
            backToList: string;
            createDescription: string;
            cancel: string;
            create: string;
            form: {
                title: string;
                titlePlaceholder: string;
                description: string;
                descriptionPlaceholder: string;
                period: string;
                startDate: string;
                endDate: string;
                color: string;
                icon: string;
            };
            periods: {
                QUARTERLY: string;
                YEARLY: string;
                CUSTOM: string;
            };
            status: {
                DRAFT: string;
                ACTIVE: string;
                COMPLETED: string;
                CANCELLED: string;
                AT_RISK: string;
            };
            period: {
                Q1: string;
                Q2: string;
                Q3: string;
                Q4: string;
                YEARLY: string;
            };
            keyResults: {
                title: string;
                add: string;
                name: string;
                target: string;
                current: string;
                unit: string;
                metricType: string;
                types: {
                    PERCENTAGE: string;
                    NUMBER: string;
                    CURRENCY: string;
                    BOOLEAN: string;
                };
                subtitle: string;
                addFirst: string;
                empty: string;
                createTitle: string;
                createDescription: string;
                confirmDelete: string;
                deleted: string;
                form: {
                    title: string;
                    titlePlaceholder: string;
                    description: string;
                    descriptionPlaceholder: string;
                    metricType: string;
                    startValue: string;
                    targetValue: string;
                    unit: string;
                    unitPlaceholder: string;
                };
                actions: {
                    cancel: string;
                    create: string;
                    creating: string;
                };
                validation: {
                    titleRequired: string;
                };
                toast: {
                    created: string;
                    error: string;
                };
            };
            stats: {
                totalObjectives: string;
                onTrack: string;
                atRisk: string;
                completed: string;
            };
            tabs: {
                overview: string;
                list: string;
                board: string;
            };
            averageProgress: string;
            viewAll: string;
            total: string;
            completed: string;
            progress: string;
            dueDate: string;
            okrsAtRisk: string;
            left: string;
            notFound: string;
            edit: string;
        };
        CustomFields: {
            title: string;
            subtitle: string;
            addField: string;
            noFields: string;
            noFieldsDescription: string;
            editField: string;
            createField: string;
            updateField: string;
            addFieldDescription: string;
            fieldName: string;
            fieldNamePlaceholder: string;
            fieldType: string;
            description: string;
            descriptionPlaceholder: string;
            options: string;
            addOption: string;
            required: string;
            deleteConfirm: string;
            cancel: string;
            create: string;
            save: string;
            fieldCreated: string;
            fieldUpdated: string;
            fieldDeleted: string;
            fieldError: string;
            deleteError: string;
            nameRequired: string;
            optionsRequired: string;
            types: {
                TEXT: string;
                NUMBER: string;
                SELECT: string;
                MULTI_SELECT: string;
                DATE: string;
                URL: string;
                EMAIL: string;
                CHECKBOX: string;
            };
        };
        Focus: {
            title: string;
            subtitle: string;
            startSession: string;
            endSession: string;
            ambientAudio: string;
            selectTrack: string;
            noTrack: string;
            volume: string;
            favorites: string;
            addToFavorites: string;
            removeFromFavorites: string;
            categories: {
                nature: string;
                cafe: string;
                whiteNoise: string;
                binaural: string;
                music: string;
            };
            tracks: {
                rain: string;
                thunderstorm: string;
                forest: string;
                ocean: string;
                river: string;
                cafe: string;
                library: string;
                whiteNoise: string;
                pinkNoise: string;
                brownNoise: string;
                binaural: string;
                lofi: string;
            };
            modes: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            modeDescriptions: {
                pomodoro: string;
                deepWork: string;
                flow: string;
                sprint: string;
            };
            stats: {
                totalSessions: string;
                totalMinutes: string;
                avgSession: string;
                streakDays: string;
            };
        };
        Search: {
            title: string;
            placeholder: string;
            placeholderWithAI: string;
            noResults: string;
            noResultsDescription: string;
            suggestions: string;
            results: string;
            navigate: string;
            select: string;
            close: string;
            aiPowered: string;
            types: {
                task: string;
                project: string;
                habit: string;
            };
            filters: {
                all: string;
                tasks: string;
                projects: string;
                habits: string;
            };
        };
        Meetings: {
            title: string;
            subtitle: string;
            analyze: string;
            analyzing: string;
            transcriptPlaceholder: string;
            summary: string;
            keyPoints: string;
            actionItems: string;
            decisions: string;
            participants: string;
            topics: string;
            sentiment: string;
            followUpRequired: string;
            convertToTasks: string;
            converting: string;
            tasksCreated: string;
            noActionItems: string;
            sentiments: {
                POSITIVE: string;
                NEUTRAL: string;
                NEGATIVE: string;
                MIXED: string;
            };
            summaryStyles: {
                executive: string;
                detailed: string;
                bulletPoints: string;
            };
        };
        Workload: {
            title: string;
            subtitle: string;
            myWorkload: string;
            teamWorkload: string;
            assignedTasks: string;
            completedTasks: string;
            overdueTasks: string;
            hoursThisWeek: string;
            capacityRemaining: string;
            workloadScore: string;
            trend: string;
            levels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                OVERLOADED: string;
            };
            trends: {
                INCREASING: string;
                STABLE: string;
                DECREASING: string;
            };
            suggestions: {
                title: string;
                redistribute: string;
                delegate: string;
                prioritize: string;
            };
            distribution: {
                overloaded: string;
                balanced: string;
                underutilized: string;
            };
        };
        Wellbeing: {
            title: string;
            subtitle: string;
            burnoutRisk: string;
            workLifeBalance: string;
            focusQuality: string;
            consistencyScore: string;
            riskLevels: {
                LOW: string;
                MODERATE: string;
                HIGH: string;
                CRITICAL: string;
            };
            recommendations: {
                title: string;
                takeBreak: string;
                endDay: string;
                weekend: string;
                lateNight: string;
            };
            patterns: {
                title: string;
                lateNightWork: string;
                weekendWork: string;
                longSessions: string;
                avgHoursPerDay: string;
            };
            weeklySummary: string;
            insights: string;
            intervention: {
                gentleReminder: string;
                strongWarning: string;
                criticalAlert: string;
            };
        };
        Mobile: {
            home: {
                greeting: string;
                myTasks: string;
                pending: string;
                completed: string;
                today: string;
                loadError: string;
                retry: string;
                noTasks: string;
                noTasksInView: string;
                okrsGoals: string;
                active: string;
            };
            filters: {
                all: string;
                today: string;
                upcoming: string;
                completed: string;
            };
            tabs: {
                home: string;
                habits: string;
                calendar: string;
                profile: string;
            };
            common: {
                loading: string;
                error: string;
                cancel: string;
                save: string;
                delete: string;
                edit: string;
                create: string;
                back: string;
                done: string;
                search: string;
                noResults: string;
            };
            priority: {
                high: string;
                medium: string;
                low: string;
            };
            task: {
                newTask: string;
                editTask: string;
                title: string;
                description: string;
                project: string;
                priority: string;
                dueDate: string;
                estimatedMinutes: string;
                noProject: string;
                selectProject: string;
                taskCreated: string;
                taskUpdated: string;
                createError: string;
                updateError: string;
            };
            profile: {
                title: string;
                settings: string;
                logout: string;
                logoutConfirm: string;
                theme: string;
                language: string;
                notifications: string;
                about: string;
            };
            workspaces: {
                title: string;
                noWorkspaces: string;
                createFirst: string;
            };
            goals: {
                title: string;
                newGoal: string;
                editGoal: string;
                noGoals: string;
                createFirst: string;
                keyResults: string;
                addKeyResult: string;
                progress: string;
                startDate: string;
                endDate: string;
            };
            habits: {
                title: string;
                loadError: string;
                retry: string;
                completed: string;
                streak: string;
                bestStreak: string;
                progress: string;
                oneWeek: string;
                oneWeekMessage: string;
                oneMonth: string;
                oneMonthMessage: string;
                hundredDays: string;
                hundredDaysMessage: string;
                errorUpdating: string;
                noHabits: string;
                createFirst: string;
                days: string;
            };
            calendar: {
                title: string;
                subtitle: string;
                noBlocks: string;
                noBlocksHint: string;
            };
            profileOptions: {
                notifications: string;
                darkMode: string;
                settings: string;
                help: string;
                about: string;
                logout: string;
                logoutTitle: string;
                logoutMessage: string;
                cancel: string;
                exit: string;
                version: string;
                completed: string;
                focusMinutes: string;
                pomodoros: string;
                loading: string;
            };
        };
        UnifiedTrash: {
            title: string;
            subtitle: string;
            refresh: string;
            warningTitle: string;
            warningDescription: string;
            tabs: {
                workspaces: string;
                projects: string;
                tasks: string;
            };
            filterByWorkspace: string;
            filterByProject: string;
            allWorkspaces: string;
            allProjects: string;
            viewingProjectsFor: string;
            viewingTasksFor: string;
            selectWorkspaceFirst: string;
            selectProjectFirst: string;
            noDeletedWorkspaces: string;
            noDeletedProjects: string;
            noDeletedTasks: string;
            projects: string;
            tasks: string;
            restore: string;
            confirmDelete: string;
        };
    };
};
export { en, es, ptBr };
export default locales;
//# sourceMappingURL=index.d.ts.map