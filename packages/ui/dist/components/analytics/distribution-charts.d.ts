interface ProjectTimeChartProps {
    data: {
        name: string;
        value: number;
    }[];
    title?: string;
    noDataMessage?: string;
    tooltipLabel?: string;
    className?: string;
}
/**
 * ProjectTimeChart - Pie chart showing time distribution by project
 *
 * @example
 * <ProjectTimeChart
 *   data={[{ name: 'Project A', value: 120 }, { name: 'Project B', value: 60 }]}
 *   title={t('title')}
 * />
 */
export declare function ProjectTimeChart({ data, title, noDataMessage, tooltipLabel, className, }: ProjectTimeChartProps): import("react/jsx-runtime").JSX.Element;
interface TaskStatusChartProps {
    data: {
        status: string;
        count: number;
    }[];
    title?: string;
    noDataMessage?: string;
    /** Custom status colors mapping */
    statusColors?: Record<string, string>;
    className?: string;
}
/**
 * TaskStatusChart - Donut chart showing task status distribution
 *
 * @example
 * const statusColors = { TODO: '#gray', IN_PROGRESS: '#blue', COMPLETED: '#green' };
 *
 * <TaskStatusChart
 *   data={[{ status: 'TODO', count: 5 }, { status: 'COMPLETED', count: 10 }]}
 *   statusColors={statusColors}
 *   title={t('title')}
 * />
 */
export declare function TaskStatusChart({ data, title, noDataMessage, statusColors, className, }: TaskStatusChartProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=distribution-charts.d.ts.map