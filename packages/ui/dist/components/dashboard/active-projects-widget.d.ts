export interface DashboardProject {
    id: string;
    name: string;
    color: string;
    completedTasks: number;
    totalTasks: number;
}
interface ActiveProjectsWidgetProps {
    projects: DashboardProject[];
    onProjectClick?: (projectId: string) => void;
    onViewAll?: () => void;
    labels?: {
        title?: string;
        viewAll?: string;
        empty?: string;
    };
}
export declare function ActiveProjectsWidget({ projects, onProjectClick, onViewAll, labels, }: ActiveProjectsWidgetProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=active-projects-widget.d.ts.map