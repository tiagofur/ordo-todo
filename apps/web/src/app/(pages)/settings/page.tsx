"use client";

import { useTheme } from "next-themes";
import { AppLayout } from "@/components/shared/app-layout";
import { Clock, Palette, Moon, Sun, Monitor, Laptop, Zap, Bell, Volume2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useTimerSettings();

  if (!isLoaded) return null;

  return (
    <AppLayout>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto space-y-8 pb-10"
      >
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">
            Personaliza la apariencia y comportamiento de Ordo
          </p>
        </div>

        <div className="grid gap-8">
          {/* Appearance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Palette className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Apariencia</h2>
            </div>
            
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Label className="text-base">Tema</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Selecciona el tema de la interfaz
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      theme === "light"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Sun className="h-6 w-6" />
                    <span className="text-sm font-medium">Claro</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Moon className="h-6 w-6" />
                    <span className="text-sm font-medium">Oscuro</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      theme === "system"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Laptop className="h-6 w-6" />
                    <span className="text-sm font-medium">Sistema</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Timer Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Temporizador</h2>
            </div>

            <div className="grid gap-4">
              {/* Default Mode */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Label className="text-base">Modo Principal</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  Elige cómo prefieres gestionar tu tiempo por defecto
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateSettings({ defaultMode: "POMODORO" })}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      settings.defaultMode === "POMODORO"
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <div className="rounded-full bg-red-100 p-2 dark:bg-red-900/30">
                      <Zap className="h-5 w-5 text-red-500" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium">Pomodoro</span>
                      <span className="text-xs text-muted-foreground">Enfoque + Descansos</span>
                    </div>
                  </button>
                  <button
                    onClick={() => updateSettings({ defaultMode: "CONTINUOUS" })}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                      settings.defaultMode === "CONTINUOUS"
                        ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <div className="rounded-full bg-blue-100 p-2 dark:bg-blue-900/30">
                      <Monitor className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium">Tiempo Corrido</span>
                      <span className="text-xs text-muted-foreground">Cronómetro simple</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Durations */}
              <div className="rounded-xl border bg-card p-6 shadow-sm space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="workDuration">Enfoque (min)</Label>
                    <input
                      id="workDuration"
                      type="number"
                      min="1"
                      max="120"
                      value={settings.workDuration}
                      onChange={(e) => updateSettings({ workDuration: parseInt(e.target.value) || 25 })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="shortBreak">Descanso corto (min)</Label>
                    <input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) => updateSettings({ shortBreakDuration: parseInt(e.target.value) || 5 })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="longBreak">Descanso largo (min)</Label>
                    <input
                      id="longBreak"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) => updateSettings({ longBreakDuration: parseInt(e.target.value) || 15 })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pomodorosUntilLongBreak">Intervalo de descanso largo</Label>
                      <p className="text-sm text-muted-foreground">
                        Cantidad de pomodoros antes de un descanso largo
                      </p>
                    </div>
                    <input
                      id="pomodorosUntilLongBreak"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.pomodorosUntilLongBreak}
                      onChange={(e) => updateSettings({ pomodorosUntilLongBreak: parseInt(e.target.value) || 4 })}
                      className="flex h-10 w-20 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoStartBreaks">Auto-iniciar descansos</Label>
                      <p className="text-sm text-muted-foreground">
                        Iniciar el temporizador de descanso automáticamente
                      </p>
                    </div>
                    <input
                      id="autoStartBreaks"
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) => updateSettings({ autoStartBreaks: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoStartPomodoros">Auto-iniciar pomodoros</Label>
                      <p className="text-sm text-muted-foreground">
                        Iniciar el siguiente pomodoro automáticamente
                      </p>
                    </div>
                    <input
                      id="autoStartPomodoros"
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) => updateSettings({ autoStartPomodoros: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications & Sound */}
              <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  <Label className="text-base">Notificaciones y Sonido</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Configura las alertas cuando se complete una sesión
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="soundEnabled">Efectos de sonido</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Reproducir un sonido al completar una sesión
                      </p>
                    </div>
                    <input
                      id="soundEnabled"
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="notificationsEnabled">Notificaciones del navegador</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Mostrar notificaciones incluso con el navegador minimizado
                      </p>
                    </div>
                    <input
                      id="notificationsEnabled"
                      type="checkbox"
                      checked={settings.notificationsEnabled}
                      onChange={(e) => updateSettings({ notificationsEnabled: e.target.checked })}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AppLayout>
  );
}
