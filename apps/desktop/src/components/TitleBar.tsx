import { Minus, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";

interface TitleBarProps {
  isMaximized: boolean;
}

export default function TitleBar({ isMaximized }: TitleBarProps) {
  const [platform, setPlatform] = useState<string>('unknown');

  useEffect(() => {
    // Get platform from electron API
    if (window.electronAPI?.platform) {
      setPlatform(window.electronAPI.platform);
    }
  }, []);

  // Don't render on macOS - it uses native traffic lights
  if (platform === 'darwin') {
    return null;
  }

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
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-10 bg-background border-b border-border px-4 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* App title - left side */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-semibold text-foreground">Ordo-Todo</span>
      </div>

      {/* Window controls - right side (Windows/Linux only) */}
      <div
        className="flex items-center space-x-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-10 h-8 hover:bg-muted transition-colors"
          title="Minimizar"
        >
          <Minus size={14} />
        </button>

        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-10 h-8 hover:bg-muted transition-colors"
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          <Maximize2 size={14} />
        </button>

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-10 h-8 hover:bg-red-500 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

