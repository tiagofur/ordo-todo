import { Minus, Maximize2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { desktopBridge } from "@/lib/desktop-bridge";

interface TitleBarProps {
  isMaximized?: boolean;
}

export default function TitleBar({ isMaximized: propIsMaximized }: TitleBarProps) {
  const [platform, setPlatform] = useState<string>('unknown');
  const [isMaximized, setIsMaximized] = useState<boolean>(propIsMaximized ?? false);

  useEffect(() => {
    setPlatform(desktopBridge.getPlatform());
    if (desktopBridge.isNative()) {
      desktopBridge.isMaximized().then(setIsMaximized);
    }
  }, []);

  // Don't render window controls on macOS - it uses native traffic lights overlay
  if (platform === 'darwin') {
    return (
      <div
        data-tauri-drag-region
        className="fixed top-0 left-0 right-0 z-50 h-8 pointer-events-auto select-none"
      />
    );
  }

  const handleMinimize = async () => {
    await desktopBridge.minimize();
  };

  const handleMaximize = async () => {
    await desktopBridge.toggleMaximize();
    const max = await desktopBridge.isMaximized();
    setIsMaximized(max);
  };

  const handleClose = async () => {
    await desktopBridge.close();
  };

  return (
    <div
      data-tauri-drag-region
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-9 bg-background/90 backdrop-blur-md border-b border-border px-4 select-none"
    >
      {/* App title - left side */}
      <div className="flex items-center space-x-2" data-tauri-drag-region>
        <span className="text-xs font-medium text-muted-foreground">Ordo-Todo</span>
      </div>

      {/* Window controls - right side (Windows/Linux only) */}
      <div className="flex items-center space-x-1">
        <button
          onClick={handleMinimize}
          className="flex items-center justify-center w-8 h-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-sm"
          title="Minimizar"
        >
          <Minus size={13} />
        </button>

        <button
          onClick={handleMaximize}
          className="flex items-center justify-center w-8 h-7 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors rounded-sm"
          title={isMaximized ? "Restaurar" : "Maximizar"}
        >
          <Maximize2 size={13} />
        </button>

        <button
          onClick={handleClose}
          className="flex items-center justify-center w-8 h-7 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors rounded-sm"
          title="Cerrar"
        >
          <X size={13} />
        </button>
      </div>
    </div>
  );
}
