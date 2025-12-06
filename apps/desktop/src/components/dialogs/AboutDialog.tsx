import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUIStore } from "@/stores/ui-store";
import { CheckCircle2 } from "lucide-react";

export function AboutDialog() {
  const { aboutDialogOpen, closeAboutDialog } = useUIStore();
  const [version, setVersion] = useState("0.1.0");
  const [electronVersion, setElectronVersion] = useState("");

  useEffect(() => {
    // Get version info from Electron
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(setVersion);
      setElectronVersion(window.electronAPI.versions.electron);
    }
  }, []);

  return (
    <Dialog open={aboutDialogOpen} onOpenChange={closeAboutDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <DialogTitle className="text-2xl">Ordo-Todo</DialogTitle>
          <DialogDescription className="text-center">
            Tu compañero de productividad personal
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Versión</span>
            <span className="font-medium">{version}</span>
          </div>
          
          {electronVersion && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">Electron</span>
              <span className="font-medium">{electronVersion}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">Plataforma</span>
            <span className="font-medium capitalize">
              {window.electronAPI?.platform ?? "Web"}
            </span>
          </div>

          <div className="pt-4 text-center text-sm text-muted-foreground">
            <p>© 2025 Ordo-Todo</p>
            <p className="mt-1">
              Hecho con ❤️ para aumentar tu productividad
            </p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            <a
              href="https://ordo-todo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Sitio Web
            </a>
            <a
              href="https://github.com/tiagofur/ordo-todo"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              GitHub
            </a>
            <a
              href="https://ordo-todo.com/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Documentación
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
