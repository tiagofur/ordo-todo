import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Clock,
  Coffee,
  TreePine,
  Filter,
  Calendar,
  Timer,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { format, subDays, formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Session types
type SessionType = "WORK" | "SHORT_BREAK" | "LONG_BREAK";

interface Session {
  id: string;
  type: SessionType;
  duration: number;
  completedAt: string;
  taskId?: string;
  task?: { title: string };
}

interface SessionHistoryFilters {
  type: SessionType | "ALL";
  days: number;
  page: number;
  limit: number;
}

// Mock data - TODO: Replace with actual API hook
const mockSessions: Session[] = [
  { id: "1", type: "WORK", duration: 25, completedAt: new Date().toISOString() },
  { id: "2", type: "SHORT_BREAK", duration: 5, completedAt: subDays(new Date(), 0).toISOString() },
  { id: "3", type: "WORK", duration: 25, completedAt: subDays(new Date(), 1).toISOString() },
  { id: "4", type: "LONG_BREAK", duration: 15, completedAt: subDays(new Date(), 1).toISOString() },
  { id: "5", type: "WORK", duration: 25, completedAt: subDays(new Date(), 2).toISOString() },
];

export function SessionHistory() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<SessionHistoryFilters>({
    type: "ALL",
    days: 7,
    page: 1,
    limit: 10,
  });

  // TODO: Replace with actual API hook
  const sessions = mockSessions;
  const isLoading = false;
  const totalSessions = sessions.length;
  const totalPages = Math.ceil(totalSessions / filters.limit);

  const getSessionTypeColor = (type: SessionType) => {
    switch (type) {
      case "WORK":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "SHORT_BREAK":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "LONG_BREAK":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getSessionTypeIcon = (type: SessionType) => {
    switch (type) {
      case "WORK":
        return <Clock className="h-4 w-4" />;
      case "SHORT_BREAK":
        return <Coffee className="h-4 w-4" />;
      case "LONG_BREAK":
        return <TreePine className="h-4 w-4" />;
      default:
        return <Timer className="h-4 w-4" />;
    }
  };

  const getSessionTypeLabel = (type: SessionType) => {
    switch (type) {
      case "WORK":
        return t("timer.modes.work") || "Trabajo";
      case "SHORT_BREAK":
        return t("timer.modes.shortBreak") || "Descanso corto";
      case "LONG_BREAK":
        return t("timer.modes.longBreak") || "Descanso largo";
      default:
        return type;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  // Filter sessions
  const filteredSessions = sessions.filter((session) => {
    if (filters.type !== "ALL" && session.type !== filters.type) return false;
    const sessionDate = new Date(session.completedAt);
    const daysAgo = subDays(new Date(), filters.days);
    return sessionDate >= daysAgo;
  });

  // Calculate stats
  const totalMinutes = filteredSessions.reduce((acc, s) => acc + s.duration, 0);
  const workSessions = filteredSessions.filter((s) => s.type === "WORK").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("timer.history.totalSessions") || "Sesiones totales"}
              </p>
              <p className="text-2xl font-bold">{filteredSessions.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("timer.history.totalTime") || "Tiempo total"}
              </p>
              <p className="text-2xl font-bold">{formatDuration(totalMinutes)}</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {t("timer.history.workSessions") || "Pomodoros"}
              </p>
              <p className="text-2xl font-bold">{workSessions}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("timer.history.filters") || "Filtros"}:
          </span>
        </div>

        <Select
          value={filters.type}
          onValueChange={(value) =>
            setFilters({ ...filters, type: value as SessionType | "ALL", page: 1 })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">{t("timer.history.allTypes") || "Todos"}</SelectItem>
            <SelectItem value="WORK">{t("timer.modes.work") || "Trabajo"}</SelectItem>
            <SelectItem value="SHORT_BREAK">{t("timer.modes.shortBreak") || "Descanso corto"}</SelectItem>
            <SelectItem value="LONG_BREAK">{t("timer.modes.longBreak") || "Descanso largo"}</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.days.toString()}
          onValueChange={(value) =>
            setFilters({ ...filters, days: parseInt(value), page: 1 })
          }
        >
          <SelectTrigger className="w-[140px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">{t("timer.history.today") || "Hoy"}</SelectItem>
            <SelectItem value="7">{t("timer.history.last7Days") || "7 días"}</SelectItem>
            <SelectItem value="30">{t("timer.history.last30Days") || "30 días"}</SelectItem>
            <SelectItem value="90">{t("timer.history.last90Days") || "90 días"}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Sessions List */}
      <div className="rounded-2xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">
            {t("timer.history.loading") || "Cargando historial..."}
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="p-8 text-center">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">
              {t("timer.history.noSessions") || "No hay sesiones"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t("timer.history.noSessionsDescription") || "Completa tu primera sesión para verla aquí"}
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredSessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-xl",
                      getSessionTypeColor(session.type)
                    )}
                  >
                    {getSessionTypeIcon(session.type)}
                  </div>
                  <div>
                    <p className="font-medium">{getSessionTypeLabel(session.type)}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(session.completedAt), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </div>
                </div>

                <Badge variant="secondary" className="font-mono">
                  {formatDuration(session.duration)}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t("timer.history.page") || "Página"} {filters.page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
              disabled={filters.page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
              disabled={filters.page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
