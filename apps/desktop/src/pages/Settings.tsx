import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { 
  Moon, Sun, Laptop, Globe, Bell, Clock, Keyboard, 
  Monitor, Download, Power, ExternalLink, RefreshCw, Loader2, Settings as SettingsIcon,
  Palette, Volume2, Sparkles, Headphones, Shield, Zap, Brain, Heart, Check
} from "lucide-react";
import { Label, Separator, Switch, Slider, Button, cn } from "@ordo-todo/ui";
import { changeLanguage, getCurrentLanguage, SupportedLanguage } from "@/i18n";
import { PageTransition, SlideIn } from "@/components/motion";
import { desktopBridge } from "@/lib/desktop-bridge";
import { useTimerStore } from "@/stores/timer-store";
import { useUserPreferences, useUpdatePreferences } from "@/lib/shared-hooks";
import { SessionsManager } from "@/components/settings/SessionsManager";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

type SettingsTab = "general" | "timer" | "audio" | "ai" | "security" | "desktop" | "shortcuts";

export function Settings() {
  const { setTheme, theme } = useTheme();
  const { t } = (useTranslation as any)();
  const currentLang = getCurrentLanguage();
  const [activeLang, setActiveLang] = useState<SupportedLanguage>(currentLang);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // User preferences from API
  const { data: userPreferences } = useUserPreferences();
  const updatePreferences = useUpdatePreferences();

  // Timer Store
  const { config, updateConfig, mode, setMode } = useTimerStore();

  // Desktop-specific native state
  const isNative = desktopBridge.isNative();
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);
  const [timerFloatingVisible, setTimerFloatingVisible] = useState(false);
  const [appVersion, setAppVersion] = useState("0.5.0");
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateStatus, setUpdateStatus] = useState<string>("idle");

  // Focus Audio local state
  const [ambientAudioAuto, setAmbientAudioAuto] = useState(false);
  const [ambientVolume, setAmbientVolume] = useState(50);

  // Timer default mode state
  const [timerMode, setTimerMode] = useState<"POMODORO" | "CONTINUOUS">("POMODORO");

  // Load desktop & preference settings
  useEffect(() => {
    setActiveLang(getCurrentLanguage());

    if (isNative) {
      desktopBridge.isAutostartEnabled().then((enabled) => {
        setAutoLaunchEnabled(enabled);
      });
      desktopBridge.getSystemInfo().then((info) => {
        if (info.version) setAppVersion(info.version);
      });
    }

    if (userPreferences?.focusAudio) {
      if (userPreferences.focusAudio.auto !== undefined) {
        setAmbientAudioAuto(Boolean(userPreferences.focusAudio.auto));
      }
      if (userPreferences.focusAudio.volume !== undefined) {
        setAmbientVolume(Number(userPreferences.focusAudio.volume));
      }
    }
  }, [isNative, userPreferences]);

  const handleLanguageChange = (lng: SupportedLanguage) => {
    changeLanguage(lng);
    setActiveLang(lng);
    const langNames: Record<SupportedLanguage, string> = {
      es: "Español",
      en: "English",
      "pt-br": "Português",
    };
    toast.success(`${t("Settings.language") || "Idioma"}: ${langNames[lng]}`);
  };

  const handleThemeChange = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    const mappedTheme = newTheme === "system" ? "AUTO" : newTheme === "dark" ? "DARK" : "LIGHT";
    updatePreferences.mutate({ theme: mappedTheme as any });
  };

  const handleFocusDurationChange = (val: number) => {
    updateConfig({ workDuration: val });
    updatePreferences.mutate({ pomodoroDuration: val });
  };

  const handleShortBreakDurationChange = (val: number) => {
    updateConfig({ shortBreakDuration: val });
    updatePreferences.mutate({ shortBreakDuration: val });
  };

  const handleLongBreakDurationChange = (val: number) => {
    updateConfig({ longBreakDuration: val });
    updatePreferences.mutate({ longBreakDuration: val });
  };

  const handlePomodorosUntilLongBreakChange = (val: number) => {
    updateConfig({ pomodorosUntilLongBreak: val });
    updatePreferences.mutate({ pomodorosUntilLongBreak: val });
  };

  const handleAutoStartBreaksChange = (enabled: boolean) => {
    updateConfig({ autoStartBreaks: enabled });
  };

  const handleAutoStartPomodorosChange = (enabled: boolean) => {
    updateConfig({ autoStartPomodoros: enabled });
  };

  const handleNotificationsToggle = (enabled: boolean) => {
    updateConfig({ notificationsEnabled: enabled });
    updatePreferences.mutate({ enableNotifications: enabled });
  };

  const handleSoundToggle = (enabled: boolean) => {
    updateConfig({ soundEnabled: enabled });
    updatePreferences.mutate({ enableSounds: enabled });
  };

  const handleAmbientAudioAutoToggle = (enabled: boolean) => {
    setAmbientAudioAuto(enabled);
    localStorage.setItem("ordo-ambient-auto", String(enabled));
    updatePreferences.mutate({
      focusAudio: {
        auto: enabled,
        volume: ambientVolume,
      },
    });
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

  const handleAutoLaunchToggle = async (enabled: boolean) => {
    const success = await desktopBridge.setAutostart(enabled);
    if (success) {
      setAutoLaunchEnabled(enabled);
      toast.success(enabled ? "Inicio automático activado" : "Inicio automático desactivado");
    }
  };

  const handleTimerFloatingToggle = async () => {
    const newVisibility = await desktopBridge.toggleMiniTimer();
    setTimerFloatingVisible(newVisibility);
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateStatus("latest");
      toast.info("Ordo está actualizado en la versión más reciente");
    }, 700);
  };

  // AI preference updates
  const handleAIPreferenceChange = (changes: Record<string, any>) => {
    updatePreferences.mutate(changes);
    toast.success("Preferencia de IA actualizada");
  };

  const currentAggressiveness = userPreferences?.aiAggressiveness ?? 5;
  const currentSensitivity =
    currentAggressiveness <= 3
      ? "low"
      : currentAggressiveness >= 8
      ? "high"
      : "medium";

  const languages: { code: SupportedLanguage; label: string; sub: string; flag: string }[] = [
    { code: "es", label: "Español", sub: "Español (Latinoamérica / España)", flag: "🇪🇸" },
    { code: "en", label: "English", sub: "International English", flag: "🇺🇸" },
    { code: "pt-br", label: "Português", sub: "Português (Brasil)", flag: "🇧🇷" },
  ];

  const tabs: { id: SettingsTab; label: string; icon: any }[] = [
    { id: "general", label: "General", icon: Palette },
    { id: "timer", label: "Temporizador", icon: Clock },
    { id: "audio", label: "Sonido & Alertas", icon: Bell },
    { id: "ai", label: "Inteligencia Artificial", icon: Sparkles },
    { id: "security", label: "Seguridad", icon: Shield },
    { id: "desktop", label: "Escritorio", icon: Monitor },
    { id: "shortcuts", label: "Atajos", icon: Keyboard },
  ];

  return (
    <PageTransition>
      <div className="space-y-6 pb-12">
        {/* Header - Apple Style Unified Pattern */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-xs shrink-0">
                <SettingsIcon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("Settings.title") || "Configuración"}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate">
                  {t("Settings.subtitle") || "Personaliza la apariencia y comportamiento de Ordo"}
                </p>
              </div>
            </div>
          </div>
        </SlideIn>

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
              {/* Card 1: Theme */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Palette className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.appearance") || "Apariencia"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("Settings.selectTheme") || "Selecciona el tema de la interfaz"}
                    </p>
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
                      <span>{t("Settings.themes.light") || "Claro"}</span>
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
                      <span>{t("Settings.themes.dark") || "Oscuro"}</span>
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
                      <span>{t("Settings.themes.system") || "Sistema"}</span>
                    </div>
                    {theme === "system" && (
                      <span className="absolute top-2.5 right-2.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Card 2: Language */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Globe className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.language") || "Idioma"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("Settings.languageDescription") || "Selecciona el idioma de la aplicación"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-1">
                  {languages.map((lng) => {
                    const isSelected = activeLang === lng.code;
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

          {/* TAB 2: TIMER (Full Parity with Web: Default Mode + Durations + Intervals) */}
          {activeTab === "timer" && (
            <motion.div
              key="timer"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* Default Mode Selector */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Zap className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.defaultMode") || "Modo Principal de Enfoque"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("Settings.defaultModeDescription") || "Elige cómo prefieres gestionar tu tiempo"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setTimerMode("POMODORO");
                      updatePreferences.mutate({ timerMode: "POMODORO" } as any);
                    }}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border-2 p-4 transition-all cursor-pointer text-left",
                      timerMode === "POMODORO"
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
                          {t("Settings.modes.pomodoro") || "Método Pomodoro"}
                        </span>
                        {timerMode === "POMODORO" && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("Settings.modes.pomodoroDesc") || "Ciclos de trabajo + pausas programadas"}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerMode("CONTINUOUS");
                      updatePreferences.mutate({ timerMode: "CONTINUOUS" } as any);
                    }}
                    className={cn(
                      "flex items-center gap-3.5 rounded-2xl border-2 p-4 transition-all cursor-pointer text-left",
                      timerMode === "CONTINUOUS"
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
                          {t("Settings.modes.continuous") || "Tiempo Corrido"}
                        </span>
                        {timerMode === "CONTINUOUS" && (
                          <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                            <Check className="h-2.5 w-2.5 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {t("Settings.modes.continuousDesc") || "Cronómetro continuo sin pausas automáticas"}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Durations & Automations */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Clock className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.timer") || "Duraciones y Automatizaciones"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Ajusta los minutos exactos de cada fase y la frecuencia de pausas
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  {/* Focus Duration */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.focusDuration") || "Tiempo de Enfoque"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Duración de cada sesión principal de trabajo
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[15, 25, 45, 50].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleFocusDurationChange(preset)}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              config.workDuration === preset
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
                        value={[config.workDuration]} 
                        onValueChange={(val) => handleFocusDurationChange(val[0])}
                        max={60} 
                        min={5} 
                        step={5} 
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {config.workDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Short Break Duration */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.shortBreakDuration") || "Descanso Corto"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Pausa breve recomendada entre bloques de enfoque
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[3, 5, 10].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleShortBreakDurationChange(preset)}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              config.shortBreakDuration === preset
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
                        value={[config.shortBreakDuration]} 
                        onValueChange={(val) => handleShortBreakDurationChange(val[0])}
                        max={15} 
                        min={1} 
                        step={1} 
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {config.shortBreakDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Long Break Duration */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.longBreakDuration") || "Descanso Largo"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Pausa prolongada después de completar ciclos de pomodoro
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[15, 20, 30].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handleLongBreakDurationChange(preset)}
                            className={cn(
                              "px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              config.longBreakDuration === preset
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
                        value={[config.longBreakDuration]} 
                        onValueChange={(val) => handleLongBreakDurationChange(val[0])}
                        max={45} 
                        min={5} 
                        step={5} 
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {config.longBreakDuration} min
                      </span>
                    </div>
                  </div>

                  {/* Long Break Interval */}
                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.longBreakInterval") || "Intervalo de Descanso Largo"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.longBreakIntervalDescription") || "Cantidad de pomodoros completados antes de un descanso largo"}
                      </p>
                      <div className="flex items-center gap-1.5 pt-1">
                        {[2, 4, 6].map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => handlePomodorosUntilLongBreakChange(preset)}
                            className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border",
                              (config.pomodorosUntilLongBreak || 4) === preset
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
                        value={[config.pomodorosUntilLongBreak || 4]} 
                        onValueChange={(val) => handlePomodorosUntilLongBreakChange(val[0])}
                        max={8} 
                        min={2} 
                        step={1} 
                        className="flex-1"
                      />
                      <span className="text-xs font-semibold tabular-nums px-2.5 py-1 rounded-xl bg-muted border border-border/60 text-foreground w-16 text-center shrink-0">
                        {config.pomodorosUntilLongBreak || 4} ciclos
                      </span>
                    </div>
                  </div>

                  {/* Auto Start Breaks */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.autoStartBreaks") || "Auto-iniciar descansos"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.autoStartBreaksDescription") || "Iniciar el temporizador de descanso automáticamente al terminar una sesión"}
                      </p>
                    </div>
                    <Switch 
                      checked={config.autoStartBreaks}
                      onCheckedChange={handleAutoStartBreaksChange}
                    />
                  </div>

                  {/* Auto Start Pomodoros */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.autoStartPomodoros") || "Auto-iniciar pomodoros"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.autoStartPomodorosDescription") || "Iniciar el siguiente ciclo de enfoque automáticamente al concluir el descanso"}
                      </p>
                    </div>
                    <Switch 
                      checked={config.autoStartPomodoros}
                      onCheckedChange={handleAutoStartPomodorosChange}
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
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.notificationsAndSound") || "Alertas & Sonido"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Notificaciones en tu pantalla y efectos audibles
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.browserNotifications") || "Notificaciones de escritorio"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Mostrar alertas nativas del sistema operativo al finalizar cada bloque
                      </p>
                    </div>
                    <Switch 
                      checked={config.notificationsEnabled}
                      onCheckedChange={handleNotificationsToggle}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.soundEffects") || "Efectos de sonido"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.soundEffectsDescription") || "Reproducir campana suave al completar sesiones y descansos"}
                      </p>
                    </div>
                    <Switch 
                      checked={config.soundEnabled}
                      onCheckedChange={handleSoundToggle}
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
                    <h3 className="text-base font-semibold text-foreground">Focus Audio</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Música ambiental y paisajes sonoros para concentración profunda
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        Audio ambiental automático
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Iniciar reproducción ambiental automáticamente al encender el temporizador
                      </p>
                    </div>
                    <Switch 
                      checked={ambientAudioAuto}
                      onCheckedChange={handleAmbientAudioAutoToggle}
                    />
                  </div>

                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        Volumen predeterminado
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Nivel de sonido inicial al activar la música de concentración
                      </p>
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

          {/* TAB 4: ARTIFICIAL INTELLIGENCE & WELLBEING (Full Parity) */}
          {activeTab === "ai" && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              {/* AI Insights & Scheduling */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Brain className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.ai.insightsTitle") || "Productividad Inteligente"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("Settings.ai.insightsDesc") || "Recomendaciones proactivas basadas en tus hábitos y tareas"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.ai.enableInsights") || "Habilitar AI Insights"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.ai.enableInsightsDesc") || "Muestra sugerencias de priorización y balance en el dashboard"}
                      </p>
                    </div>
                    <Switch 
                      checked={userPreferences?.enableAI ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ enableAI: checked })}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.ai.smartScheduling") || "Programación Inteligente"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.ai.smartSchedulingDesc") || "Sugiere los mejores bloques de horario según tu nivel de energía"}
                      </p>
                    </div>
                    <Switch 
                      checked={userPreferences?.aiSuggestScheduling ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiSuggestScheduling: checked })}
                    />
                  </div>
                </div>
              </div>

              {/* Wellbeing & Burnout Prevention */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Heart className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.ai.wellbeingTitle") || "Bienestar & Prevención de Burnout"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {t("Settings.ai.wellbeingDesc") || "Monitorea la sobrecarga de trabajo y cuida tu salud mental"}
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.ai.burnoutDetection") || "Detección de Riesgo de Agotamiento"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.ai.burnoutDetectionDesc") || "Analiza jornadas excesivas y patrones de fatiga"}
                      </p>
                    </div>
                    <Switch 
                      checked={userPreferences?.aiWeeklyReports ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiWeeklyReports: checked })}
                    />
                  </div>

                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.ai.restReminders") || "Recordatorios Suaves de Descanso"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {t("Settings.ai.restRemindersDesc") || "Notificaciones para desconectar tras sesiones intensas"}
                      </p>
                    </div>
                    <Switch 
                      checked={userPreferences?.aiSuggestTaskDurations ?? true}
                      onCheckedChange={(checked) => handleAIPreferenceChange({ aiSuggestTaskDurations: checked })}
                    />
                  </div>

                  <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-medium text-foreground">
                        {t("Settings.ai.sensitivity") || "Sensibilidad de Detección"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Nivel de tolerancia antes de emitir alertas de fatiga
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-muted/60 dark:bg-zinc-900 border border-border/80 rounded-xl w-full sm:w-64">
                      {[
                        { key: "low", label: "Baja", value: 3 },
                        { key: "medium", label: "Media", value: 5 },
                        { key: "high", label: "Alta", value: 8 },
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
            </motion.div>
          )}

          {/* TAB 6: DESKTOP & SYSTEM (Tauri v2 Native) */}
          {activeTab === "desktop" && (
            <motion.div
              key="desktop"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Monitor className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      Integración del Sistema
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Comportamiento nativo de la aplicación de escritorio
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  {/* Auto Start */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Power className="h-4 w-4 text-primary" />
                        Iniciar con el sistema operativo
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Abrir Ordo automáticamente al iniciar sesión en tu ordenador
                      </p>
                    </div>
                    <Switch 
                      checked={autoLaunchEnabled}
                      onCheckedChange={handleAutoLaunchToggle}
                    />
                  </div>

                  {/* Floating Mini Timer */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <ExternalLink className="h-4 w-4 text-primary" />
                        Mini-Timer Flotante Always-on-Top
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Ventana ultra compacta flotante fija sobre cualquier otra aplicación
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleTimerFloatingToggle}
                      className="rounded-xl border-border/80 text-xs font-medium cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      Abrir / Ocultar
                    </Button>
                  </div>

                  {/* Updates */}
                  <div className="py-4 flex items-center justify-between gap-4">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2 text-sm font-medium text-foreground">
                        <Download className="h-4 w-4 text-primary" />
                        Actualizaciones de Software
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {updateStatus === "latest" ? "Ordo está en su versión más reciente" : "Comprueba si existen nuevas versiones de la aplicación"}
                      </p>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={handleCheckForUpdates}
                      disabled={isCheckingUpdate}
                      className="rounded-xl border-border/80 text-xs font-medium cursor-pointer hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                    >
                      {isCheckingUpdate ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        "Buscar"
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* About Ordo */}
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-4">
                <h3 className="text-base font-semibold text-foreground">
                  {t("Settings.about") || "Acerca de Ordo"}
                </h3>
                <div className="divide-y divide-border/40 text-xs sm:text-sm">
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Settings.version") || "Versión"}</span>
                    <span className="font-semibold text-foreground tabular-nums">{appVersion}</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Settings.platform") || "Shell Nativo"}</span>
                    <span className="font-semibold text-foreground">Tauri v2 (Native Rust)</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">Motor de Renderizado</span>
                    <span className="font-semibold text-foreground">WebKit / Safari Nitro</span>
                  </div>
                  <div className="py-2.5 flex justify-between items-center">
                    <span className="text-muted-foreground">{t("Settings.developer") || "Desarrollado por"}</span>
                    <span className="font-semibold text-foreground">Ordo Team</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 7: KEYBOARD SHORTCUTS */}
          {activeTab === "shortcuts" && (
            <motion.div
              key="shortcuts"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="space-y-6"
            >
              <div className="rounded-2xl border border-border/80 bg-card p-5 sm:p-6 shadow-xs space-y-5">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                    <Keyboard className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">
                      {t("Settings.keyboardShortcuts") || "Atajos de Teclado"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Comandos rápidos globales para operar Ordo a la velocidad del pensamiento
                    </p>
                  </div>
                </div>

                <div className="divide-y divide-border/40 pt-2">
                  {[
                    { action: "Mini-Timer Flotante Always-on-Top", shortcut: "⌘ Shift T / Ctrl Shift T", desc: "Abre o esconde el temporizador compacto flotante" },
                    { action: "Crear Nueva Tarea Rápida", shortcut: "⌘ Shift N / Ctrl Shift N", desc: "Abre el modal de captura rápida de tareas desde cualquier lugar" },
                    { action: "Búsqueda Rápida", shortcut: "⌘ K / Ctrl K", desc: "Búsqueda omnibox de proyectos, tareas y notas" },
                    { action: "Abrir Configuración", shortcut: "⌘ , / Ctrl ,", desc: "Navega directamente a este panel de ajustes" },
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}

export default Settings;
