import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";
import { Keyboard } from "lucide-react";

interface ShortcutItem {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: ShortcutItem[] = [
  // Timer
  { keys: ["Ctrl", "Space"], description: "Iniciar/Pausar Timer", category: "Timer" },
  { keys: ["Ctrl", "Shift", "S"], description: "Toggle Timer (Global)", category: "Timer" },
  { keys: ["Ctrl", "Shift", "K"], description: "Saltar al siguiente", category: "Timer" },
  
  // Navigation
  { keys: ["Ctrl", "1"], description: "Ir a Dashboard", category: "Navegación" },
  { keys: ["Ctrl", "2"], description: "Ir a Tareas", category: "Navegación" },
  { keys: ["Ctrl", "3"], description: "Ir a Proyectos", category: "Navegación" },
  { keys: ["Ctrl", "4"], description: "Ir a Timer", category: "Navegación" },
  { keys: ["Ctrl", "5"], description: "Ir a Analytics", category: "Navegación" },
  
  // Actions
  { keys: ["Ctrl", "N"], description: "Nueva Tarea", category: "Acciones" },
  { keys: ["Ctrl", "Shift", "P"], description: "Nuevo Proyecto", category: "Acciones" },
  { keys: ["Ctrl", "Shift", "N"], description: "Nueva Tarea Rápida (Global)", category: "Acciones" },
  
  // Window
  { keys: ["Ctrl", "Shift", "O"], description: "Mostrar/Ocultar Ventana (Global)", category: "Ventana" },
  { keys: ["Ctrl", "Shift", "F"], description: "Enfocar Ventana (Global)", category: "Ventana" },
  { keys: ["F11"], description: "Pantalla Completa", category: "Ventana" },
  
  // General
  { keys: ["Ctrl", "/"], description: "Mostrar Atajos", category: "General" },
  { keys: ["Ctrl", ","], description: "Configuración", category: "General" },
];

export function ShortcutsDialog() {
  const { shortcutsDialogOpen, closeShortcutsDialog } = useUIStore();

  // Group shortcuts by category
  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, ShortcutItem[]>);

  return (
    <Dialog open={shortcutsDialogOpen} onOpenChange={closeShortcutsDialog}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Atajos de Teclado
          </DialogTitle>
          <DialogDescription>
            Usa estos atajos para navegar y controlar la aplicación más rápido.
            Los atajos marcados como "Global" funcionan incluso cuando la ventana no está enfocada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {Object.entries(groupedShortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((shortcut, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.keys.map((key, keyIndex) => (
                        <span key={keyIndex}>
                          <kbd className="px-2 py-1 text-xs font-semibold text-foreground bg-muted border border-border rounded">
                            {key}
                          </kbd>
                          {keyIndex < shortcut.keys.length - 1 && (
                            <span className="mx-1 text-muted-foreground">+</span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t text-center text-sm text-muted-foreground">
          Puedes personalizar los atajos globales en Configuración → Atajos
        </div>
      </DialogContent>
    </Dialog>
  );
}
