"use client";

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { cn } from "../../utils/index.js";
import { STATUS_COLORS } from "@ordo-todo/ui";

// Chart colors for generic data visualization (projects, etc.)
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Helper to get hex color from STATUS_COLORS
const getStatusHex = (status: string): string => {
  const statusKey = status as keyof typeof STATUS_COLORS;
  return STATUS_COLORS[statusKey]?.hex || '#8884d8';
};

interface ProjectTimeChartProps {
  data: { name: string; value: number }[];
  className?: string;
  title?: string;
  noDataMessage?: string;
}

export function ProjectTimeChart({ 
  data, 
  className,
  title = "Tiempo por Proyecto",
  noDataMessage = "No hay datos suficientes"
}: ProjectTimeChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className={cn("rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]", className)}>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{noDataMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
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
                            label={({name, percent}) => `${((percent || 0) * 100).toFixed(0)}%`}
                         >
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                         </Pie>
                         <Tooltip 
                           formatter={(value: number) => [`${value} min`, 'Tiempo']} 
                           itemStyle={{ color: 'var(--foreground)' }} 
                           contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} 
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
  className?: string;
  title?: string;
  noDataMessage?: string;
}

export function TaskStatusChart({ 
  data, 
  className,
  title = "Estado de Tareas",
  noDataMessage = "No hay tareas"
}: TaskStatusChartProps) {
    if (!data || data.length === 0) {
        return (
            <div className={cn("rounded-2xl border border-border/50 bg-card p-6 flex flex-col justify-center items-center h-[360px]", className)}>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{noDataMessage}</p>
            </div>
        );
    }

    return (
        <div className={cn("rounded-2xl border border-border/50 bg-card p-6", className)}>
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
                           contentStyle={{ backgroundColor: 'var(--popover)', borderColor: 'var(--border)' }} 
                         />
                         <Legend />
                     </PieChart>
                 </ResponsiveContainer>
             </div>
        </div>
    );
}
