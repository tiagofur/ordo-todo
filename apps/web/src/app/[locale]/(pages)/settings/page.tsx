"use client";

import { useTheme } from "next-themes";
import { AppLayout } from "@/components/shared/app-layout";
import { Clock, Palette, Moon, Sun, Monitor, Laptop, Zap, Bell, Volume2, Globe, Keyboard, Settings as SettingsIcon } from "lucide-react";
import { Label } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useTimerSettings();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  // Accent color for styled headers
  const accentColor = "#06b6d4"; // Cyan

  const handleLanguageChange = (newLocale: string) => {
    // Replace the locale in the current path
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');
    router.push(newPath);
    toast.success(`Idioma cambiado a ${newLocale === 'es' ? 'Español' : newLocale === 'en' ? 'English' : 'Português'}`);
  };

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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <SettingsIcon className="h-6 w-6" />
            </div>
            {t("title") || "Configuración"}
          </h1>
          <p className="text-muted-foreground">
            {t("subtitle") || "Personaliza la apariencia y comportamiento de Ordo"}
          </p>
        </div>

        <div className="grid gap-8">
          {/* Appearance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <Palette className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("appearance") || "Apariencia"}</h2>
            </div>
            
            <div className="grid gap-4">
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Label className="text-base">{t("theme") || "Tema"}</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("selectTheme") || "Selecciona el tema de la interfaz"}
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
                    <span className="text-sm font-medium">{t("themes.light") || "Claro"}</span>
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
                    <span className="text-sm font-medium">{t("themes.dark") || "Oscuro"}</span>
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
                    <span className="text-sm font-medium">{t("themes.system") || "Sistema"}</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Language */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-500">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("language") || "Idioma"}</h2>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <Label className="text-base">{t("selectLanguage") || "Idioma de la aplicación"}</Label>
              <p className="text-sm text-muted-foreground mb-4">
                {t("languageDescription") || "Selecciona el idioma de la interfaz"}
              </p>
              <div className="grid grid-cols-3 gap-4">
                <button
                  onClick={() => handleLanguageChange("es")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                    locale === "es"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-2xl">🇪🇸</span>
                  <span className="text-sm font-medium">Español</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                    locale === "en"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-2xl">🇺🇸</span>
                  <span className="text-sm font-medium">English</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("pt-br")}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-accent",
                    locale === "pt-br"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-2xl">🇧🇷</span>
                  <span className="text-sm font-medium">Português</span>
                </button>
              </div>
            </div>
          </section>

          {/* Timer Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("timer") || "Temporizador"}</h2>
            </div>

            <div className="grid gap-4">
              {/* Default Mode */}
              <div className="rounded-xl border bg-card p-6 shadow-sm">
                <Label className="text-base">{t("defaultMode") || "Modo Principal"}</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("defaultModeDescription") || "Elige cómo prefieres gestionar tu tiempo por defecto"}
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
                    <Label htmlFor="workDuration">{t("focusDuration") || "Enfoque (min)"}</Label>
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
                    <Label htmlFor="shortBreak">{t("shortBreakDuration") || "Descanso corto (min)"}</Label>
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
                    <Label htmlFor="longBreak">{t("longBreakDuration") || "Descanso largo (min)"}</Label>
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
                      <Label htmlFor="pomodorosUntilLongBreak">{t("longBreakInterval") || "Intervalo de descanso largo"}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("longBreakIntervalDescription") || "Cantidad de pomodoros antes de un descanso largo"}
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
                      <Label htmlFor="autoStartBreaks">{t("autoStartBreaks") || "Auto-iniciar descansos"}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("autoStartBreaksDescription") || "Iniciar el temporizador de descanso automáticamente"}
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
                      <Label htmlFor="autoStartPomodoros">{t("autoStartPomodoros") || "Auto-iniciar pomodoros"}</Label>
                      <p className="text-sm text-muted-foreground">
                        {t("autoStartPomodorosDescription") || "Iniciar el siguiente pomodoro automáticamente"}
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
                  <Label className="text-base">{t("notificationsAndSound") || "Notificaciones y Sonido"}</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("notificationsDescription") || "Configura las alertas cuando se complete una sesión"}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="soundEnabled">{t("soundEffects") || "Efectos de sonido"}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("soundEffectsDescription") || "Reproducir un sonido al completar una sesión"}
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
                        <Label htmlFor="notificationsEnabled">{t("browserNotifications") || "Notificaciones del navegador"}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("browserNotificationsDescription") || "Mostrar notificaciones incluso con el navegador minimizado"}
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

          {/* Keyboard Shortcuts */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Keyboard className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("keyboardShortcuts") || "Atajos de Teclado"}</h2>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                {t("keyboardShortcutsDescription") || "Atajos globales de la aplicación"}
              </p>
              <div className="space-y-3">
                {[
                  { action: t("shortcuts.startPause") || "Iniciar/Pausar timer", shortcut: "Espacio" },
                  { action: t("shortcuts.newTask") || "Nueva tarea", shortcut: "Ctrl+N" },
                  { action: t("shortcuts.search") || "Buscar", shortcut: "Ctrl+K" },
                  { action: t("shortcuts.settings") || "Configuración", shortcut: "Ctrl+," },
                  { action: t("shortcuts.toggleSidebar") || "Mostrar/Ocultar sidebar", shortcut: "Ctrl+B" },
                ].map((item) => (
                  <div key={item.action} className="flex justify-between items-center py-2">
                    <span className="text-sm">{item.action}</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs font-mono">
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-gray-500/10 text-gray-500">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("about") || "Acerca de"}</h2>
            </div>
            
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t("version") || "Versión"}</span>
                  <span className="font-medium">1.0.0 (Web)</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t("platform") || "Plataforma"}</span>
                  <span className="font-medium">Web Application</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">{t("developer") || "Desarrollado por"}</span>
                  <span className="font-medium">Ordo-Todo Team</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </AppLayout>
  );
}

