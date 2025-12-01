import { Minus, Square, X, Maximize2, Minimize2, Zap } from "lucide-react";

interface TitleBarProps {
  isMaximized: boolean;
}

export default function TitleBar({ isMaximized }: TitleBarProps) {
  const handleMinimize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.minimizeWindow();
    }
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      await window.electronAPI.maximizeWindow();
    }
  };

  const handleClose = async () => {
    if (window.electronAPI) {
      await window.electronAPI.closeWindow();
    }
  };

  return (
    <div className="flex items-center justify-between h-10 bg-background border-b border-border px-4 select-none drag-region">
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <Zap size={16} className="text-green-500" />
          <span className="text-xs text-muted-foreground">Electron</span>
        </div>
        <div className="w-px h-4 bg-border" />
        <h1 className="text-sm font-semibold text-foreground">Ordo-Todo</h1>
      </div>

      <div className="flex items-center space-x-1">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
          title="Minimizar"
        >
          <Minus size={14} />
        </button>

        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-muted transition-colors"
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
        </button>

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-500 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
