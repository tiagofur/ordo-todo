import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBgColor?: string;
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
  onClick?: () => void;
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  trend,
  onClick,
}: StatsCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300",
        "hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/20 hover:border-primary/20",
        onClick && "cursor-pointer"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm transition-transform duration-300",
            "group-hover:scale-110 group-hover:rotate-3",
            iconBgColor
          )}
        >
          <Icon className={cn("h-6 w-6", iconColor)} />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <span className="text-sm text-muted-foreground">{subtitle}</span>
            )}
          </div>
          {trend && (
            <div className="flex items-center gap-1 mt-1">
              <span
                className={cn(
                  "text-xs font-medium",
                  trend.isPositive ? "text-emerald-500" : "text-red-500"
                )}
              >
                {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
