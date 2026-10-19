"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/shared/app-layout";
import {
  Clock,
  Palette,
  Moon,
  Sun,
  Monitor,
  Laptop,
  Zap,
  Bell,
  Volume2,
  Globe,
  Keyboard,
  Settings as SettingsIcon,
  Sparkles,
  Brain,
  Heart,
  Headphones,
  Rocket,
  Play,
  Shield,
  Tags,
  ChevronRight,
  Check,
} from "lucide-react";
import { Label, Button, Separator, Switch, Slider, cn } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useAIFeaturesTour } from "@/components/onboarding/ai-features-tour";
import { SessionsManager } from "@/components/settings/sessions-manager";
import { useUserPreferences, useUpdatePreferences } from "@/lib/api-hooks";
import type { UpdatePreferencesDto } from "@ordo-todo/api-client";

type SettingsTab = "general" | "timer" | "audio" | "ai" | "security" | "shortcuts";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useTimerSettings();
  const { data: userPreferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { showTour, hasSeenTour } = useAIFeaturesTour();

  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [ambientAudioAuto, setAmbientAudioAuto] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(50);

  useEffect(() => {
    if (userPreferences?.focusAudio) {
      if (userPreferences.focusAudio.auto !== undefined) {
        setAmbientAudioAuto(Boolean(userPreferences.focusAudio.auto));
        localStorage.setItem("ordo-ambient-auto", String(userPreferences.focusAudio.auto));
      }
      if (userPreferences.focusAudio.volume !== undefined) {
        setAmbientVolume(Number(userPreferences.focusAudio.volume));
        localStorage.setItem("ordo-ambient-volume", String(userPreferences.focusAudio.volume));
      }
    } else {
      const savedAuto = localStorage.getItem("ordo-ambient-auto");
      const savedVol = localStorage.getItem("ordo-ambient-volume");
      if (savedAuto !== null) setAmbientAudioAuto(savedAuto === "true");
      if (savedVol !== null) setAmbientVolume(parseInt(savedVol, 10) || 50);
    }
  }, [userPreferences?.focusAudio]);

  const handleLanguageChange = (newLocale: string) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    const newPath = segments.join("/");
    router.push(newPath);
    const langName =
      newLocale === "es"
        ? "Español"
        : newLocale === "en"
        ? "English"
        : "Português";
    toast.success(t("languageChanged", { lang: langName }));
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    const mappedTheme =
      newTheme === "system" ? "AUTO" : newTheme === "dark" ? "DARK" : "LIGHT";
    updatePreferences.mutate({ theme: mappedTheme });
  };

  const handleTimerChange = (newTimerSettings: Parameters<typeof updateSettings>[0]) => {
    updateSettings(newTimerSettings);
    const backendPayload: Record<string, any> = {};
    if (newTimerSettings.workDuration !== undefined)
      backendPayload.pomodoroDuration = newTimerSettings.workDuration;
    if (newTimerSettings.shortBreakDuration !== undefined)
      backendPayload.shortBreakDuration = newTimerSettings.shortBreakDuration;
    if (newTimerSettings.longBreakDuration !== undefined)
      backendPayload.longBreakDuration = newTimerSettings.longBreakDuration;
    if (newTimerSettings.autoStartBreaks !== undefined)
      backendPayload.autoStartBreaks = newTimerSettings.autoStartBreaks;
    if (newTimerSettings.autoStartPomodoros !== undefined)
      backendPayload.autoStartPomodoros = newTimerSettings.autoStartPomodoros;

    if (Object.keys(backendPayload).length > 0) {
      updatePreferences.mutate(backendPayload);
    }
  };

  const handleAmbientAutoChange = (enabled: boolean) => {
    setAmbientAudioAuto(enabled);
    localStorage.setItem("ordo-ambient-auto", String(enabled));
    updatePreferences.mutate({
      focusAudio: {
        auto: enabled,
        volume: ambientVolume,
      },
    });
    toast.success(t("settingsSaved") || "Ajuste guardado");
  };

  const handleAmbientVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
    localStorage.setItem("ordo-ambient-volume", String(vol));
    updatePreferences.mutate({
      focusAudio: {
        auto: ambientAudioAuto,
        volume: vol,
      },
    });
  };

  const handleAIPreferenceChange = (
    newAiPreferences: Partial<UpdatePreferencesDto>
  ) => {
    updatePreferences.mutate(newAiPreferences);
    toast.success(t("settingsSaved") || "Ajustes guardados");
  };

  const currentAggressiveness = userPreferences?.aiAggressiveness ?? 5;
  const currentSensitivity =
    currentAggressiveness <= 3
      ? "low"
      : currentAggressiveness >= 8
      ? "high"
      : "medium";

  const languages = [
    { code: "es", label: "Español", sub: "Español (Latinoamérica / España)", flag: "🇪🇸" },
    { code: "en", label: "English", sub: "International English", flag: "🇺🇸" },
    { code: "pt-br", label: "Português", sub: "Português (Brasil)", flag: "🇧🇷" },
  ];

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "general", label: "General", icon: Palette },
    { id: "timer", label: "Temporizador", icon: Clock },
    { id: "audio", label: "Sonido & Alertas", icon: Bell },
    { id: "ai", label: "Inteligencia Artificial", icon: Sparkles },
    { id: "security", label: "Seguridad & Datos", icon: Shield },
    { id: "shortcuts", label: "Atajos", icon: Keyboard },
  ];

  if (!isLoaded) return null;

  return (
    <AppLayout>
      <div className="space-y-6 pb-12">
        {/* Header - Apple Style Unified Pattern */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
              <SettingsIcon className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                {t("title")}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </div>

        {/* Apple Segmented Pill Navigation Tabs */}
        <div className="overflow-x-auto no-scrollbar pb-1">
          <div className="inline-flex items-center gap-1.5 p-1.5 bg-muted/60 dark:bg-zinc-900/80 border border-border/80 rounded-2xl shadow-xs min-w-full sm:min-w-0">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "inline-flex items-center gap-2 whitespace-nowrap rounded-xl px-3.5 py-2 text-xs sm:text-sm font-medium transition-all cursor-pointer shrink-0",
                    isActive
                      ? "bg-background text-foreground shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* TAB 1: GENERAL (Appearance & Language) */}
          {activeTab === "general" && (
            <motion.div
              key="general"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Theme Card */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Palette className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("appearance")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("selectTheme")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                  {/* Light */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("light")}
                    className={cn(
                      "group relative flex flex-col items-center justify-between gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all cursor-pointer text-center",
                      theme === "light"
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border/70 bg-card/50 text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground"
                    )}
                  >
                    <div className="w-full h-20 rounded-xl bg-white border border-zinc-200 p-2 flex gap-1.5 shadow-2xs overflow-hidden">
                      <div className="w-1/4 h-full bg-zinc-100 rounded-md flex flex-col gap-1 p-1">
                        <div className="w-full h-1.5 bg-zinc-300 rounded" />
                        <div className="w-3/4 h-1 bg-zinc-200 rounded" />
                        <div className="w-1/2 h-1 bg-zinc-200 rounded" />
                      </div>
                      <div className="flex-1 h-full flex flex-col gap-1.5 p-1">
                        <div className="w-full h-3 bg-zinc-100 rounded flex items-center px-1">
                          <div className="w-1/3 h-1 bg-zinc-300 rounded" />
                        </div>
                        <div className="w-full h-8 bg-zinc-50 border border-zinc-100 rounded flex flex-col gap-1 p-1">
                          <div className="w-3/4 h-1 bg-zinc-200 rounded" />
                          <div className="w-1/2 h-1 bg-zinc-200 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                      <Sun className="h-4 w-4 text-amber-500" />
                      <span>{t("themes.light")}</span>
                    </div>
                    {theme === "light" && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  {/* Dark */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("dark")}
                    className={cn(
                      "group relative flex flex-col items-center justify-between gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all cursor-pointer text-center",
                      theme === "dark"
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border/70 bg-card/50 text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground"
                    )}
                  >
                    <div className="w-full h-20 rounded-xl bg-zinc-950 border border-zinc-800 p-2 flex gap-1.5 shadow-2xs overflow-hidden">
                      <div className="w-1/4 h-full bg-zinc-900 rounded-md flex flex-col gap-1 p-1">
                        <div className="w-full h-1.5 bg-zinc-700 rounded" />
                        <div className="w-3/4 h-1 bg-zinc-800 rounded" />
                        <div className="w-1/2 h-1 bg-zinc-800 rounded" />
                      </div>
                      <div className="flex-1 h-full flex flex-col gap-1.5 p-1">
                        <div className="w-full h-3 bg-zinc-900 rounded flex items-center px-1">
                          <div className="w-1/3 h-1 bg-zinc-700 rounded" />
                        </div>
                        <div className="w-full h-8 bg-zinc-900/60 border border-zinc-800/80 rounded flex flex-col gap-1 p-1">
                          <div className="w-3/4 h-1 bg-zinc-700 rounded" />
                          <div className="w-1/2 h-1 bg-zinc-800 rounded" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                      <Moon className="h-4 w-4 text-indigo-400" />
                      <span>{t("themes.dark")}</span>
                    </div>
                    {theme === "dark" && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>

                  {/* System */}
                  <button
                    type="button"
                    onClick={() => handleThemeChange("system")}
                    className={cn(
                      "group relative flex flex-col items-center justify-between gap-3 rounded-2xl border-2 p-3 sm:p-4 transition-all cursor-pointer text-center",
                      theme === "system"
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border/70 bg-card/50 text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground"
                    )}
                  >
                    <div className="w-full h-20 rounded-xl border border-zinc-400/40 p-0 flex shadow-2xs overflow-hidden">
                      <div className="w-1/2 h-full bg-white border-r border-zinc-200 p-2 flex flex-col gap-1.5">
                        <div className="w-full h-2 bg-zinc-100 rounded" />
                        <div className="w-3/4 h-5 bg-zinc-50 border border-zinc-100 rounded" />
                      </div>
                      <div className="w-1/2 h-full bg-zinc-950 p-2 flex flex-col gap-1.5">
                        <div className="w-full h-2 bg-zinc-900 rounded" />
                        <div className="w-3/4 h-5 bg-zinc-900/60 border border-zinc-800 rounded" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium">
                      <Laptop className="h-4 w-4 text-cyan-500" />
                      <span>{t("themes.system")}</span>
                    </div>
                    {theme === "system" && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Language Card */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Globe className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("language")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("languageDescription")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                  {languages.map((lng) => {
                    const isSelected = locale === lng.code;
                    return (
                      <button
                        key={lng.code}
                        type="button"
                        onClick={() => handleLanguageChange(lng.code)}
                        className={cn(
                          "relative flex items-center gap-3.5 rounded-2xl border-2 p-4 transition-all cursor-pointer text-left",
                          isSelected
                            ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                            : "border-border/70 bg-card/50 text-muted-foreground hover:bg-muted/40 hover:border-border hover:text-foreground"
                        )}
                      >
                        <span className="text-3xl shrink-0">{lng.flag}</span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-sm font-bold text-foreground">{lng.label}</span>
                          <span className="text-xs text-muted-foreground block truncate">{lng.sub}</span>
                        </div>
                        {isSelected && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 shadow-xs">
                            <Check className="h-3 w-3 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: TIMER */}
          {activeTab === "timer" && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Default Mode */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("defaultMode")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("defaultModeDescription")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => handleTimerChange({ defaultMode: "POMODORO" })}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border-2 p-4 transition-all cursor-pointer text-left",
                      settings.defaultMode === "POMODORO"
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border/70 bg-card/50 text-foreground hover:bg-muted/40 hover:border-border"
                    )}
                  >
                    <div className="rounded-xl bg-red-500/10 p-2.5 text-red-500 shrink-0">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold text-foreground">
                          {t("modes.pomodoro")}
                        </span>
                        {settings.defaultMode === "POMODORO" && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("modes.pomodoroDesc")}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTimerChange({ defaultMode: "CONTINUOUS" })}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border-2 p-4 transition-all cursor-pointer text-left",
                      settings.defaultMode === "CONTINUOUS"
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border/70 bg-card/50 text-foreground hover:bg-muted/40 hover:border-border"
                    )}
                  >
                    <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 shrink-0">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold text-foreground">
                          {t("modes.continuous")}
                        </span>
                        {settings.defaultMode === "CONTINUOUS" && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("modes.continuousDesc")}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Durations */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("timer")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Ajusta los minutos exactos de cada fase y la frecuencia de pausas
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  {/* Focus */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">{t("focusDuration")}</Label>
                      <p className="text-xs text-muted-foreground">Duración de cada sesión principal de trabajo</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[15, 25, 45, 50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleTimerChange({ workDuration: preset })}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              settings.workDuration === preset
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {preset}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-72 shrink-0">
                      <Slider
                        value={[settings.workDuration]}
                        onValueChange={(val) => handleTimerChange({ workDuration: val[0] })}
                        max={60}
                        min={5}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {settings.workDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Short Break */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">{t("shortBreakDuration")}</Label>
                      <p className="text-xs text-muted-foreground">Pausa breve recomendada entre bloques de enfoque</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[3, 5, 10].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleTimerChange({ shortBreakDuration: preset })}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              settings.shortBreakDuration === preset
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {preset}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-72 shrink-0">
                      <Slider
                        value={[settings.shortBreakDuration]}
                        onValueChange={(val) => handleTimerChange({ shortBreakDuration: val[0] })}
                        max={15}
                        min={1}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {settings.shortBreakDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Long Break */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">{t("longBreakDuration")}</Label>
                      <p className="text-xs text-muted-foreground">Pausa prolongada después de completar ciclos</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[15, 20, 30].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleTimerChange({ longBreakDuration: preset })}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              settings.longBreakDuration === preset
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {preset}m
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-72 shrink-0">
                      <Slider
                        value={[settings.longBreakDuration]}
                        onValueChange={(val) => handleTimerChange({ longBreakDuration: val[0] })}
                        max={45}
                        min={5}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {settings.longBreakDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Long Break Interval */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">{t("longBreakInterval")}</Label>
                      <p className="text-xs text-muted-foreground">{t("longBreakIntervalDescription")}</p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[2, 4, 6].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleTimerChange({ pomodorosUntilLongBreak: preset })}
                            className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              (settings.pomodorosUntilLongBreak || 4) === preset
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-muted/60 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted"
                            )}
                          >
                            {preset} ciclos
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-72 shrink-0">
                      <Slider
                        value={[settings.pomodorosUntilLongBreak || 4]}
                        onValueChange={(val) => handleTimerChange({ pomodorosUntilLongBreak: val[0] })}
                        max={8}
                        min={2}
                        step={1}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {settings.pomodorosUntilLongBreak || 4} ciclos
                      </span>
                    </div>
                  </div>

                  {/* Auto Start Breaks */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("autoStartBreaks")}</Label>
                      <p className="text-xs text-muted-foreground">{t("autoStartBreaksDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.autoStartBreaks}
                      onCheckedChange={(checked) => handleTimerChange({ autoStartBreaks: checked })}
                    />
                  </div>

                  {/* Auto Start Pomodoros */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("autoStartPomodoros")}</Label>
                      <p className="text-xs text-muted-foreground">{t("autoStartPomodorosDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.autoStartPomodoros}
                      onCheckedChange={(checked) => handleTimerChange({ autoStartPomodoros: checked })}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: AUDIO & ALERTS */}
          {activeTab === "audio" && (
            <motion.div
              key="audio"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Bell className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("notificationsAndSound")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("notificationsDescription")}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("browserNotifications")}</Label>
                      <p className="text-xs text-muted-foreground">{t("browserNotificationsDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.notificationsEnabled}
                      onCheckedChange={(checked) => handleTimerChange({ notificationsEnabled: checked })}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("soundEffects")}</Label>
                      <p className="text-xs text-muted-foreground">{t("soundEffectsDescription")}</p>
                    </div>
                    <Switch
                      checked={settings.soundEnabled}
                      onCheckedChange={(checked) => handleTimerChange({ soundEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Focus Audio */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Headphones className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("ai.focusAudioTitle")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("ai.focusAudioDesc")}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.ambientAudio")}</Label>
                      <p className="text-xs text-muted-foreground">{t("ai.ambientAudioDesc")}</p>
                    </div>
                    <Switch
                      checked={ambientAudioAuto}
                      onCheckedChange={handleAmbientAutoChange}
                    />
                  </div>

                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.defaultVolume")}</Label>
                      <p className="text-xs text-muted-foreground">Nivel de sonido ambiental predeterminado</p>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-72 shrink-0">
                      <Slider
                        value={[ambientVolume]}
                        onValueChange={(val) => handleAmbientVolumeChange(val[0])}
                        max={100}
                        min={0}
                        step={5}
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {ambientVolume}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: ARTIFICIAL INTELLIGENCE */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Brain className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("ai.insightsTitle")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("ai.insightsDesc")}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.enableInsights")}</Label>
                      <p className="text-xs text-muted-foreground">{t("ai.enableInsightsDesc")}</p>
                    </div>
                    <Switch
                      checked={userPreferences?.enableAI ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ enableAI: checked })}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.smartScheduling")}</Label>
                      <p className="text-xs text-muted-foreground">{t("ai.smartSchedulingDesc")}</p>
                    </div>
                    <Switch
                      checked={userPreferences?.aiSuggestScheduling ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiSuggestScheduling: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Wellbeing */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("ai.wellbeingTitle")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("ai.wellbeingDesc")}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.burnoutDetection")}</Label>
                      <p className="text-xs text-muted-foreground">{t("ai.burnoutDetectionDesc")}</p>
                    </div>
                    <Switch
                      checked={userPreferences?.aiWeeklyReports ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiWeeklyReports: checked })}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.restReminders")}</Label>
                      <p className="text-xs text-muted-foreground">{t("ai.restRemindersDesc")}</p>
                    </div>
                    <Switch
                      checked={userPreferences?.aiSuggestTaskDurations ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiSuggestTaskDurations: checked })}
                    />
                  </div>

                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">{t("ai.sensitivity")}</Label>
                      <p className="text-xs text-muted-foreground">Nivel de tolerancia para alertas preventivas</p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 dark:bg-zinc-900 border border-border/80 rounded-xl w-full sm:w-64">
                      {[
                        { key: "low", label: t("ai.sensitivityLevels.low"), value: 3 },
                        { key: "medium", label: t("ai.sensitivityLevels.medium"), value: 5 },
                        { key: "high", label: t("ai.sensitivityLevels.high"), value: 8 },
                      ].map(({ key, label, value }) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => handleAIPreferenceChange({ aiAggressiveness: value })}
                          className={cn(
                            "py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center",
                            currentSensitivity === key
                              ? "bg-background text-foreground shadow-xs font-semibold"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Tour & Help */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <Label className="text-base font-semibold text-foreground">{t("tour.aiFeatures")}</Label>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("tour.aiFeaturesDesc")}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      showTour();
                      toast.success(t("tour.starting"));
                    }}
                    className="rounded-xl border-border/60 gap-2 text-xs font-semibold self-start sm:self-auto cursor-pointer"
                  >
                    <Play className="h-4 w-4 text-primary" />
                    <span>{hasSeenTour ? t("tour.retakeTour") : t("tour.startTour")}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: SECURITY & SESSIONS */}
          {activeTab === "security" && (
            <motion.div
              key="security"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <SessionsManager />

              {/* Tags Management Link */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-semibold text-foreground">{t("tags")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("tagsDescription")}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/tags")}
                    className="rounded-xl border-border/60 gap-2 text-xs font-medium cursor-pointer"
                  >
                    <Tags className="h-4 w-4 text-emerald-500" />
                    <span>{t("manageTags")}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 6: KEYBOARD SHORTCUTS & ABOUT */}
          {activeTab === "shortcuts" && (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-500 shrink-0">
                    <Keyboard className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{t("keyboardShortcuts")}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">{t("keyboardShortcutsDescription")}</p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  {[
                    { action: t("shortcuts.startPause"), shortcut: "Espacio", desc: "Iniciar o pausar el temporizador activo" },
                    { action: t("shortcuts.newTask"), shortcut: "Ctrl + N / ⌘ N", desc: "Crear una nueva tarea en tu lista" },
                    { action: t("shortcuts.search"), shortcut: "Ctrl + K / ⌘ K", desc: "Búsqueda omnibox de proyectos, tareas y notas" },
                    { action: t("shortcuts.settings"), shortcut: "Ctrl + , / ⌘ ,", desc: "Abrir la configuración de la cuenta" },
                    { action: t("shortcuts.toggleSidebar"), shortcut: "Ctrl + B / ⌘ B", desc: "Colapsar o expandir la barra lateral" },
                  ].map((item) => (
                    <div key={item.action} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4">
                      <div>
                        <span className="text-sm font-medium text-foreground block">{item.action}</span>
                        <span className="text-xs text-muted-foreground">{item.desc}</span>
                      </div>
                      <kbd className="px-3 py-1.5 bg-muted/80 rounded-xl border border-border/80 text-xs font-mono text-foreground font-semibold shadow-2xs self-start sm:self-auto shrink-0">
                        {item.shortcut}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>

              {/* About */}
              <div className="rounded-2xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-base font-semibold text-foreground">{t("about")}</h3>
                <div className="divide-y divide-border/40 text-xs sm:text-sm">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("version")}</span>
                    <span className="font-semibold text-foreground">1.0.0 (Web)</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("platform")}</span>
                    <span className="font-semibold text-foreground">Web Application / Next.js</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("developer")}</span>
                    <span className="font-semibold text-foreground">Ordo-Todo Team</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
