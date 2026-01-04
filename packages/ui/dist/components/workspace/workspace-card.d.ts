import { type ReactNode } from 'react';
export interface WorkspaceData {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    type: 'PERSONAL' | 'WORK' | 'TEAM';
    color: string;
    icon?: string | null;
    projectsCount?: number;
    tasksCount?: number;
}
interface WorkspaceCardProps {
    workspace: WorkspaceData;
    index?: number;
    onWorkspaceClick?: (workspace: WorkspaceData) => void;
    onDelete?: (workspaceId: string) => void;
    onOpenSettings?: (workspaceId: string) => void;
    /** Render a settings dialog/modal - controlled externally */
    renderSettingsDialog?: () => ReactNode;
    labels?: {
        types?: {
            PERSONAL?: string;
            WORK?: string;
            TEAM?: string;
        };
        status?: {
            active?: string;
        };
        stats?: {
            projects?: (count: number) => string;
            tasks?: (count: number) => string;
        };
        actions?: {
            settings?: string;
            delete?: string;
            moreOptions?: string;
        };
        confirmDelete?: (name: string) => string;
    };
    className?: string;
}
/**
 * WorkspaceCard - Platform-agnostic workspace display card
 */
export declare function WorkspaceCard({ workspace, index, onWorkspaceClick, onDelete, onOpenSettings, renderSettingsDialog, labels, className, }: WorkspaceCardProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=workspace-card.d.ts.map