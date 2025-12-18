export interface WorkspaceSelectorItem {
    id: string;
    slug: string;
    name: string;
    type: 'PERSONAL' | 'WORK' | 'TEAM';
    color: string;
    stats?: {
        projectCount?: number;
        taskCount?: number;
    };
}
interface WorkspaceSelectorProps {
    workspaces?: WorkspaceSelectorItem[];
    selectedWorkspaceId?: string | null;
    isLoading?: boolean;
    onSelect?: (workspace: WorkspaceSelectorItem) => void;
    onCreateClick?: () => void;
    labels?: {
        create?: string;
        search?: string;
        defaultName?: string;
        noResults?: string;
        types?: {
            personal?: string;
            work?: string;
            team?: string;
        };
        stats?: {
            projects?: string;
            tasks?: string;
        };
    };
}
export declare function WorkspaceSelector({ workspaces, selectedWorkspaceId, isLoading, onSelect, onCreateClick, labels, }: WorkspaceSelectorProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=workspace-selector.d.ts.map