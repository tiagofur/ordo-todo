import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  Filter,
  Star,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Flame,
  Plus,
  X,
  Save,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Badge,
  ColorSwatchPicker,
  FORM_COLORS,
  cn,
} from "@ordo-todo/ui";
import { toCalendarDateString, isCalendarDateToday, isCalendarDateOverdue } from "@ordo-todo/core";

// Filter preset types
export interface FilterPreset {
  id: string;
  name: string;
  icon: string;
  color: string;
  filters: TaskFilters;
  isBuiltIn: boolean;
}

export interface TaskFilters {
  status?: ("TODO" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED")[];
  priority?: ("LOW" | "MEDIUM" | "HIGH" | "URGENT")[];
  dueDateRange?: "overdue" | "today" | "tomorrow" | "thisWeek" | "noDate";
  assignedToMe?: boolean;
  hasSubtasks?: boolean;
  projectId?: string;
  tagIds?: string[];
}

const STORAGE_KEY = "desktop-task-filter-presets";

// Built-in presets
const builtInPresets: FilterPreset[] = [
  {
    id: "urgent",
    name: "Urgentes",
    icon: "flame",
    color: "#ef4444",
    filters: { priority: ["URGENT", "HIGH"] },
    isBuiltIn: true,
  },
  {
    id: "today",
    name: "Hoy",
    icon: "calendar",
    color: "#3b82f6",
    filters: { dueDateRange: "today" },
    isBuiltIn: true,
  },
  {
    id: "overdue",
    name: "Vencidas",
    icon: "alert",
    color: "#dc2626",
    filters: { dueDateRange: "overdue" },
    isBuiltIn: true,
  },
  {
    id: "thisWeek",
    name: "Esta semana",
    icon: "clock",
    color: "#8b5cf6",
    filters: { dueDateRange: "thisWeek" },
    isBuiltIn: true,
  },
  {
    id: "myTasks",
    name: "Mis tareas",
    icon: "user",
    color: "#06b6d4",
    filters: { assignedToMe: true },
    isBuiltIn: true,
  },
  {
    id: "completed",
    name: "Completadas",
    icon: "check",
    color: "#22c55e",
    filters: { status: ["COMPLETED"] },
    isBuiltIn: true,
  },
];

const iconMap: Record<string, React.ReactNode> = {
  flame: <Flame className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  alert: <AlertTriangle className="h-4 w-4" />,
  clock: <Clock className="h-4 w-4" />,
  user: <User className="h-4 w-4" />,
  check: <CheckCircle className="h-4 w-4" />,
  star: <Star className="h-4 w-4" />,
  filter: <Filter className="h-4 w-4" />,
};

interface QuickFiltersProps {
  activeFilters: TaskFilters;
  onFiltersChange: (filters: TaskFilters) => void;
  onPresetSelect: (preset: FilterPreset) => void;
  className?: string;
}

export function QuickFilters({
  activeFilters,
  onFiltersChange,
  onPresetSelect,
  className,
}: QuickFiltersProps) {
  const { t } = useTranslation();
  const [presets, setPresets] = useState<FilterPreset[]>(builtInPresets);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  // Load custom presets from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const customPresets = JSON.parse(stored) as FilterPreset[];
        setPresets([...builtInPresets, ...customPresets]);
      } catch {
        // Invalid stored presets, use defaults
      }
    }
  }, []);

  const handlePresetClick = (preset: FilterPreset) => {
    if (activePresetId === preset.id) {
      // Clear filters if clicking same preset
      setActivePresetId(null);
      onFiltersChange({});
    } else {
      setActivePresetId(preset.id);
      onPresetSelect(preset);
    }
  };

  const handleSavePreset = (name: string, icon: string, color: string) => {
    const newPreset: FilterPreset = {
      id: `custom-${Date.now()}`,
      name,
      icon,
      color,
      filters: activeFilters,
      isBuiltIn: false,
    };

    const customPresets = presets.filter((p) => !p.isBuiltIn);
    const updatedCustomPresets = [...customPresets, newPreset];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedCustomPresets));
    setPresets([...builtInPresets, ...updatedCustomPresets]);
    setShowCreateDialog(false);
  };

  const handleDeletePreset = (presetId: string) => {
    const customPresets = presets.filter((p) => !p.isBuiltIn && p.id !== presetId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customPresets));
    setPresets([...builtInPresets, ...customPresets]);
    if (activePresetId === presetId) {
      setActivePresetId(null);
      onFiltersChange({});
    }
  };

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Built-in preset chips */}
      {presets.slice(0, 6).map((preset) => (
        <Button
          key={preset.id}
          variant={activePresetId === preset.id ? "default" : "outline"}
          size="sm"
          onClick={() => handlePresetClick(preset)}
          className={cn(
            "gap-1.5 h-8 transition-all font-medium",
            activePresetId === preset.id
              ? "text-white shadow-xs"
              : "text-foreground bg-background hover:bg-muted/50"
          )}
          style={{
            ...(activePresetId === preset.id
              ? { backgroundColor: preset.color, borderColor: preset.color, color: "#ffffff" }
              : { borderColor: `${preset.color}60` }),
          }}
        >
          <span style={{ color: activePresetId === preset.id ? "#ffffff" : preset.color }}>
            {iconMap[preset.icon] || <Filter className="h-4 w-4" />}
          </span>
          <span style={{ color: activePresetId === preset.id ? "#ffffff" : "var(--foreground)" }}>
            {preset.name}
          </span>
        </Button>
      ))}

      {/* More presets dropdown */}
      {presets.length > 6 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 h-8">
              {t("QuickFilters.moreLabel", "Más")}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {presets.slice(6).map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className="gap-2"
              >
                <span style={{ color: preset.color }}>
                  {iconMap[preset.icon] || <Filter className="h-4 w-4" />}
                </span>
                {preset.name}
                {!preset.isBuiltIn && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 ml-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePreset(preset.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-muted-foreground" />
                  </Button>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Save current filter as preset */}
      {hasActiveFilters && !activePresetId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowCreateDialog(true)}
          className="gap-1 h-8 text-muted-foreground hover:text-foreground"
        >
          <Save className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t("QuickFilters.saveFilterButton", "Guardar filtro")}
          </span>
        </Button>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setActivePresetId(null);
            onFiltersChange({});
          }}
          className="gap-1 h-8 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
          {t("QuickFilters.clearLabel", "Limpiar")}
        </Button>
      )}

      {/* Create preset dialog */}
      <CreatePresetDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSave={handleSavePreset}
      />
    </div>
  );
}

// Dialog for creating custom presets
interface CreatePresetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (name: string, icon: string, color: string) => void;
}

function CreatePresetDialog({ open, onOpenChange, onSave }: CreatePresetDialogProps) {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("star");
  const [selectedColor, setSelectedColor] = useState<string>(FORM_COLORS[9]);

  const icons = ["star", "flame", "calendar", "clock", "user", "check", "filter"];

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), selectedIcon, selectedColor);
      setName("");
      setSelectedIcon("star");
      setSelectedColor(FORM_COLORS[9]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("QuickFilters.presetDialog.saveTitle", "Guardar Filtro")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("QuickFilters.presetDialog.nameLabel", "Nombre")}
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(
                "QuickFilters.presetDialog.namePlaceholder",
                "Mi filtro personalizado",
              )}
            />
          </div>

          {/* Icon selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("QuickFilters.presetDialog.iconLabel", "Icono")}
            </label>
            <div className="flex gap-2 flex-wrap">
              {icons.map((icon) => (
                <Button
                  key={icon}
                  variant={selectedIcon === icon ? "default" : "outline"}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => setSelectedIcon(icon)}
                >
                  {iconMap[icon]}
                </Button>
              ))}
            </div>
          </div>

          {/* Color selector — ODD 025: picker canónico */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("QuickFilters.presetDialog.colorLabel", "Color")}
            </label>
            <ColorSwatchPicker
              value={selectedColor}
              onChange={setSelectedColor}
            />
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("QuickFilters.presetDialog.previewLabel", "Vista previa")}
            </label>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              style={{ borderColor: `${selectedColor}50` }}
            >
              <span style={{ color: selectedColor }}>
                {iconMap[selectedIcon]}
              </span>
              {name || t("QuickFilters.presetDialog.previewDefault", "Mi filtro")}
            </Button>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t("QuickFilters.presetDialog.cancel", "Cancelar")}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!name.trim()}
              className="bg-purple-500 hover:bg-purple-600 text-white shadow-sm shadow-purple-500/25 border-0"
            >
              {t("QuickFilters.presetDialog.save", "Guardar")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook for managing filters
export function useQuickFilters() {
  const [filters, setFilters] = useState<TaskFilters>({});

  const applyFilters = <T extends { 
    status?: string; 
    priority?: string; 
    dueDate?: string | Date | null;
    assigneeId?: string | null;
  }>(
    items: T[], 
    currentUserId?: string
  ): T[] => {
    return items.filter((item) => {
      // Status filter
      if (filters.status?.length && !filters.status.includes(item.status as any)) {
        return false;
      }

      // Priority filter
      if (filters.priority?.length && !filters.priority.includes(item.priority as any)) {
        return false;
      }

      // Due date range filter
      if (filters.dueDateRange) {
        const hasDueDate = !!item.dueDate;
        const dueStr = toCalendarDateString(item.dueDate);
        const now = new Date();
        const todayStr = toCalendarDateString(now);

        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = toCalendarDateString(tomorrow);

        const endOfWeek = new Date(now);
        endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
        const endOfWeekStr = toCalendarDateString(endOfWeek);

        switch (filters.dueDateRange) {
          case "overdue":
            if (!hasDueDate || !isCalendarDateOverdue(item.dueDate, item.status === "COMPLETED")) return false;
            break;
          case "today":
            if (!hasDueDate || !isCalendarDateToday(item.dueDate)) return false;
            break;
          case "tomorrow":
            if (!hasDueDate || dueStr !== tomorrowStr) return false;
            break;
          case "thisWeek":
            if (!hasDueDate || dueStr < todayStr || dueStr > endOfWeekStr) return false;
            break;
          case "noDate":
            if (hasDueDate) return false;
            break;
        }
      }

      // Assigned to me filter
      if (filters.assignedToMe && currentUserId) {
        if (item.assigneeId !== currentUserId) return false;
      }

      return true;
    });
  };

  return {
    filters,
    setFilters,
    applyFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
  };
}
