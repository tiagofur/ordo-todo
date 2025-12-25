"use client";

import { useTheme } from "next-themes";
import { AppLayout } from "@/components/shared/app-layout";
import { Clock, Palette, Moon, Sun, Monitor, Laptop, Zap, Bell, Volume2, Globe, Keyboard, Settings as SettingsIcon, Sparkles, Brain, Heart, Headphones, Rocket, Play } from "lucide-react";
import { Label, Button } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useAIFeaturesTour } from "@/components/onboarding/ai-features-tour";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useTimerSettings();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { showTour, hasSeenTour } = useAIFeaturesTour();

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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <div
              className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl text-white shadow-lg"
              style={{
                backgroundColor: accentColor,
                boxShadow: `0 10px 15px -3px ${accentColor}40, 0 4px 6px -4px ${accentColor}40`,
              }}
            >
              <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            {t("title") || "Configuración"}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
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
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                  <button
                    onClick={() => setTheme("light")}
                    className={cn(
                      "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[90px] flex-shrink-0 sm:min-w-0",
                      theme === "light"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm font-medium">{t("themes.light") || "Claro"}</span>
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={cn(
                      "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[90px] flex-shrink-0 sm:min-w-0",
                      theme === "dark"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm font-medium">{t("themes.dark") || "Oscuro"}</span>
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={cn(
                      "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[90px] flex-shrink-0 sm:min-w-0",
                      theme === "system"
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                        : "border-transparent bg-muted/50"
                    )}
                  >
                    <Laptop className="h-5 w-5 sm:h-6 sm:w-6" />
                    <span className="text-xs sm:text-sm font-medium">{t("themes.system") || "Sistema"}</span>
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
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                <button
                  onClick={() => handleLanguageChange("es")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "es"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-xl sm:text-2xl">🇪🇸</span>
                  <span className="text-xs sm:text-sm font-medium">Español</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "en"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-xl sm:text-2xl">🇺🇸</span>
                  <span className="text-xs sm:text-sm font-medium">English</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("pt-br")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all hover:bg-accent min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "pt-br"
                      ? "border-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : "border-transparent bg-muted/50"
                  )}
                >
                  <span className="text-xl sm:text-2xl">🇧🇷</span>
                  <span className="text-xs sm:text-sm font-medium">Português</span>
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

          {/* AI Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-purple-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Inteligencia Artificial</h2>
            </div>

            <div className="grid gap-4">
              {/* AI Insights */}
              <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <Label className="text-base">AI Insights</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Recibe sugerencias proactivas basadas en tus patrones de productividad
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="aiInsightsEnabled">Habilitar insights de IA</Label>
                      <p className="text-sm text-muted-foreground">
                        Muestra sugerencias personalizadas en el dashboard
                      </p>
                    </div>
                    <input
                      id="aiInsightsEnabled"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smartScheduling">Programación inteligente</Label>
                      <p className="text-sm text-muted-foreground">
                        Sugiere horarios óptimos basados en tu productividad
                      </p>
                    </div>
                    <input
                      id="smartScheduling"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Wellbeing & Burnout */}
              <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <Label className="text-base">Bienestar</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Detección de riesgo de burnout y recomendaciones de descanso
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="burnoutDetection">Detección de burnout</Label>
                      <p className="text-sm text-muted-foreground">
                        Analiza patrones de trabajo para prevenir agotamiento
                      </p>
                    </div>
                    <input
                      id="burnoutDetection"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="restReminders">Recordatorios de descanso</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificaciones suaves para tomar pausas
                      </p>
                    </div>
                    <input
                      id="restReminders"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-gray-300 text-pink-600 focus:ring-pink-600"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border/50">
                    <Label>Sensibilidad de detección</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Baja", "Media", "Alta"].map((level) => (
                        <button
                          key={level}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm font-medium transition-all",
                            level === "Media"
                              ? "bg-pink-500/10 border-2 border-pink-500/50 text-pink-600"
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                          )}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Audio */}
              <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="h-5 w-5 text-cyan-500" />
                  <Label className="text-base">Focus Audio</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  Sonidos ambient para mejorar la concentración durante sesiones de trabajo
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ambientAudio">Audio ambient automático</Label>
                      <p className="text-sm text-muted-foreground">
                        Inicia audio al comenzar una sesión de focus
                      </p>
                    </div>
                    <input
                      id="ambientAudio"
                      type="checkbox"
                      defaultChecked={false}
                      className="h-5 w-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="defaultVolume">Volumen por defecto</Label>
                      <span className="text-sm text-muted-foreground">50%</span>
                    </div>
                    <input
                      id="defaultVolume"
                      type="range"
                      min="0"
                      max="100"
                      defaultValue="50"
                      className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Tour & Help */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border/50">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/10 to-purple-500/10 text-cyan-500">
                <Rocket className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">Tour & Ayuda</h2>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Tour de Features de IA</Label>
                  <p className="text-sm text-muted-foreground">
                    Revisa las nuevas funcionalidades de inteligencia artificial
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    showTour();
                    toast.success("Iniciando tour de IA...");
                  }}
                  className="gap-2"
                >
                  <Play className="h-4 w-4" />
                  {hasSeenTour ? "Ver de nuevo" : "Iniciar tour"}
                </Button>
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  💡 El tour te guía por: Búsqueda Inteligente, Asistente de Reuniones, 
                  Panel de Bienestar, Carga del Equipo y Focus Audio.
                </p>
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
                  <span className="font-medium">0.1.2 (Beta)</span>
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

