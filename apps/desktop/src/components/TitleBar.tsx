import { Minus, Maximize2, X, CheckSquare, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { desktopBridge } from "@/lib/desktop-bridge";

interface TitleBarProps {
  isMaximized?: boolean;
}

export default function TitleBar({ isMaximized: propIsMaximized }: TitleBarProps) {
  const [platform] = useState<string>(() => desktopBridge.getPlatform());
  const [isMaximized, setIsMaximized] = useState<boolean>(propIsMaximized ?? false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (desktopBridge.isNative()) {
      desktopBridge.isMaximized().then(setIsMaximized);
    }
  }, []);

  const handleStartDrag = (e: React.MouseEvent) => {
    // Only drag on primary (left) mouse button and avoid inputs/buttons
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("a")) {
      return;
    }
    if (e.button === 0) {
      desktopBridge.startDragging();
    }
  };

  const handleDoubleClick = async () => {
    await desktopBridge.toggleMaximize();
    const max = await desktopBridge.isMaximized();
    setIsMaximized(max);
  };

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

  const isMac = platform === "darwin";

  return (
    <header
      data-tauri-drag-region
      onMouseDown={handleStartDrag}
      onDoubleClick={handleDoubleClick}
      style={{ WebkitAppRegion: "drag" } as React.CSSProperties}
      className="fixed top-0 left-0 right-0 z-50 flex h-8 items-center justify-between px-4 select-none pointer-events-auto"
    >
      {/* Left section: App branding on Windows/Linux; transparent spacing on macOS for traffic lights */}
      <div
        data-tauri-drag-region
        className="flex items-center space-x-2 pointer-events-none w-56"
      >
        {!isMac && (
          <>
            <div className="flex h-5 w-5 items-center justify-center rounded-[6px] bg-[#ad46ff] text-white shadow-sm shadow-[#ad46ff]/30">
              <CheckSquare className="h-3.5 w-3.5 stroke-[2.2]" />
            </div>
            <span className="text-xs font-semibold tracking-wide text-foreground">
              Ordo
            </span>
          </>
        )}
      </div>

      {/* Center: Window grab hint/title */}
      <div
        data-tauri-drag-region
        className="flex-1 flex justify-center text-[11px] font-medium text-muted-foreground/60 pointer-events-none"
      >
        <span>Ordo-Todo</span>
      </div>

      {/* Right section: Windows/Linux controls OR macOS shortcut pill */}
      <div
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
        className="flex items-center space-x-1.5"
      >
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
        >
          {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
        </button>

        {isMac ? (
          <span
            data-tauri-drag-region
            className="text-[10px] text-muted-foreground/50 px-2 py-0.5 rounded border border-border/30"
          >
            ⌘⇧T Timer
          </span>
        ) : (
          <>
            <button
              onClick={handleMinimize}
              className="flex h-7 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Minimizar"
            >
              <Minus size={13} />
            </button>
            <button
              onClick={handleMaximize}
              className="flex h-7 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={isMaximized ? "Restaurar" : "Maximizar"}
            >
              <Maximize2 size={13} />
            </button>
            <button
              onClick={handleClose}
              className="flex h-7 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive hover:text-destructive-foreground"
              title="Cerrar"
            >
              <X size={13} />
            </button>
          </>
        )}
      </div>
    </header>
  );
}
