import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const STATUS_COLORS: Record<string, string> = {
    'TODO': '#9ca3af',
    'IN_PROGRESS': '#3b82f6',
    'COMPLETED': '#22c55e',
    'CANCELLED': '#ef4444'
};

export function ProjectTimeChart({ data, className }: { data: { name: string, value: number }[], className?: string }) {
    if (!data || data.length === 0) {
        return (
            <div className={cn("rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]", className)}>
                <h3 className="text-lg font-semibold mb-2">Tiempo por Proyecto</h3>
                <p className="text-muted-foreground">No hay datos suficientes</p>
            </div>
        );
    }

    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
             <h3 className="text-lg font-semibold mb-6">Tiempo por Proyecto</h3>
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
                            label={({name, percent}) => `${((percent || 0) * 100).toFixed(0)}%`}
                         >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                         </Pie>
                         <Tooltip formatter={(value: number) => [`${value} min`, 'Tiempo']} itemStyle={{ color: 'var(--foreground)' }} contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} />
                         <Legend />
                     </PieChart>
                 </ResponsiveContainer>
             </div>
        </div>
    );
}

export function TaskStatusChart({ data, className }: { data: { status: string, count: number }[], className?: string }) {
    if (!data || data.length === 0) {
        return (
            <div className={cn("rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]", className)}>
                <h3 className="text-lg font-semibold mb-2">Estado de Tareas</h3>
                <p className="text-muted-foreground">No hay tareas</p>
            </div>
        );
    }

    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
             <h3 className="text-lg font-semibold mb-6">Estado de Tareas</h3>
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
                                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] || '#8884d8'} />
                            ))}
                         </Pie>
                         <Tooltip itemStyle={{ color: 'var(--foreground)' }} contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} />
                         <Legend />
                     </PieChart>
                 </ResponsiveContainer>
             </div>
        </div>
    );
}
