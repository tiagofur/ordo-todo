
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../../utils/index.js';

// Chart colors for generic data visualization
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Status colors (can be overridden via props)
const DEFAULT_STATUS_COLORS: Record<string, string> = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
};

interface ProjectTimeChartProps {
  data: { name: string; value: number }[];
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
export function ProjectTimeChart({
  data,
  title = 'Time by Project',
  noDataMessage = 'No data available',
  tooltipLabel = 'Time',
  className = '',
}: ProjectTimeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-border bg-card p-6 flex flex-col justify-center items-center h-[360px]',
          className
        )}
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{noDataMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label={({ percent }) => `${((percent || 0) * 100).toFixed(0)}%`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [`${value} min`, tooltipLabel]}
              itemStyle={{ color: 'var(--foreground)' }}
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface TaskStatusChartProps {
  data: { status: string; count: number }[];
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
export function TaskStatusChart({
  data,
  title = 'Task Status',
  noDataMessage = 'No tasks',
  statusColors = DEFAULT_STATUS_COLORS,
  className = '',
}: TaskStatusChartProps) {
  const getStatusHex = (status: string): string => {
    return statusColors[status] || '#8884d8';
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-border bg-card p-6 flex flex-col justify-center items-center h-[360px]',
          className
        )}
      >
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground">{noDataMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn('rounded-2xl border border-border bg-card p-6', className)}>
      <h3 className="text-lg font-semibold mb-6">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getStatusHex(entry.status)} />
              ))}
            </Pie>
            <Tooltip
              itemStyle={{ color: 'var(--foreground)' }}
              contentStyle={{
                backgroundColor: 'var(--popover)',
                borderColor: 'var(--border)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
