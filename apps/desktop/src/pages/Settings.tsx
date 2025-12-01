import { useTheme } from "next-themes";
import { Moon, Sun, Laptop } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export function Settings() {
  const { setTheme, theme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Personaliza tu experiencia</p>
      </div>

      <div className="rounded-lg border bg-card p-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium">Apariencia</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Selecciona el tema de la aplicación
          </p>
          
          <div className="grid grid-cols-3 gap-4 max-w-md">
            <button
              onClick={() => setTheme("light")}
              className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${
                theme === "light" ? "border-primary bg-accent" : "border-muted"
              }`}
            >
              <Sun className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Claro</span>
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${
                theme === "dark" ? "border-primary bg-accent" : "border-muted"
              }`}
            >
              <Moon className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Oscuro</span>
            </button>
            <button
              onClick={() => setTheme("system")}
              className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground ${
                theme === "system" ? "border-primary bg-accent" : "border-muted"
              }`}
            >
              <Laptop className="mb-2 h-6 w-6" />
              <span className="text-sm font-medium">Sistema</span>
            </button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium">Acerca de</h3>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Versión</span>
              <span className="font-medium">0.1.0</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Electron</span>
              <span className="font-medium">33.2.1</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-muted-foreground">Desarrollado por</span>
              <span className="font-medium">Ordo-Todo Team</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
