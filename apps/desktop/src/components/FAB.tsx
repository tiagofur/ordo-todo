import { useState } from "react";
import { Plus, X, ListTodo, FolderKanban, Timer, Tag } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/ui-store";
import { useNavigate } from "react-router-dom";

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

export function FAB() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { openCreateTaskDialog, openCreateProjectDialog } = useUIStore();

  const quickActions: QuickAction[] = [
    {
      id: "task",
      label: "Nueva Tarea",
      icon: <ListTodo className="h-5 w-5" />,
      color: "bg-blue-500 hover:bg-blue-600",
      onClick: () => {
        openCreateTaskDialog();
        setIsOpen(false);
      },
    },
    {
      id: "project",
      label: "Nuevo Proyecto",
      icon: <FolderKanban className="h-5 w-5" />,
      color: "bg-violet-500 hover:bg-violet-600",
      onClick: () => {
        openCreateProjectDialog();
        setIsOpen(false);
      },
    },
    {
      id: "timer",
      label: "Iniciar Timer",
      icon: <Timer className="h-5 w-5" />,
      color: "bg-red-500 hover:bg-red-600",
      onClick: () => {
        navigate("/timer");
        setIsOpen(false);
      },
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse items-end gap-3">
      {/* Action Buttons */}
      {isOpen && (
        <div className="flex flex-col-reverse gap-3 mb-2">
          {quickActions.map((action, index) => (
            <div
              key={action.id}
              className={cn(
                "flex items-center gap-3 origin-bottom-right transition-all duration-200",
                "animate-in fade-in slide-in-from-bottom-2"
              )}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Label */}
              <span className="px-3 py-1.5 bg-popover text-popover-foreground text-sm font-medium rounded-lg shadow-lg border whitespace-nowrap">
                {action.label}
              </span>

              {/* Icon Button */}
              <button
                onClick={action.onClick}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full shadow-lg text-white transition-all duration-200",
                  "hover:scale-110 active:scale-95",
                  action.color
                )}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main FAB Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-14 w-14 items-center justify-center rounded-full shadow-xl transition-all duration-300",
          "bg-primary text-primary-foreground hover:bg-primary/90",
          "hover:scale-105 active:scale-95",
          isOpen && "rotate-45"
        )}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/50 backdrop-blur-sm -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
