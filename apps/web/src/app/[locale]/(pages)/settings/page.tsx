"use client";

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
} from "lucide-react";
import { Label, Button } from "@ordo-todo/ui";
import { toast } from "sonner";
import { useTimerSettings } from "@/hooks/use-timer-settings";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useAIFeaturesTour } from "@/components/onboarding/ai-features-tour";
import { SessionsManager } from "@/components/settings/sessions-manager";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings, isLoaded } = useTimerSettings();
  const t = useTranslations("Settings");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { showTour, hasSeenTour } = useAIFeaturesTour();

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
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-blue-500 text-white shadow-sm shadow-blue-500/25">
              <SettingsIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            {t("title")}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            {t("subtitle")}
          </p>
        </div>

        <div className="grid gap-8">
          {/* Appearance */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                <Palette className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("appearance")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Label className="text-base">{t("theme")}</Label>
              <p className="text-sm text-muted-foreground mb-4">
                {t("selectTheme")}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                <button
                  onClick={() => setTheme("light")}
                  className={cn(
                    "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[90px] flex-shrink-0 sm:min-w-0",
                    theme === "light"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Sun className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">
                    {t("themes.light")}
                  </span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={cn(
                    "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[90px] flex-shrink-0 sm:min-w-0",
                    theme === "dark"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Moon className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">
                    {t("themes.dark")}
                  </span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={cn(
                    "flex flex-col items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[90px] flex-shrink-0 sm:min-w-0",
                    theme === "system"
                      ? "border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <Laptop className="h-5 w-5 sm:h-6 sm:w-6" />
                  <span className="text-xs sm:text-sm font-medium">
                    {t("themes.system")}
                  </span>
                </button>
              </div>
            </div>
          </section>

          {/* Language */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Globe className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("language")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <Label className="text-base">{t("selectLanguage")}</Label>
              <p className="text-sm text-muted-foreground mb-4">
                {t("languageDescription")}
              </p>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:pb-0">
                <button
                  onClick={() => handleLanguageChange("es")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "es"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-xl sm:text-2xl">🇪🇸</span>
                  <span className="text-xs sm:text-sm font-medium">Español</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("en")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "en"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
                  )}
                >
                  <span className="text-xl sm:text-2xl">🇺🇸</span>
                  <span className="text-xs sm:text-sm font-medium">English</span>
                </button>
                <button
                  onClick={() => handleLanguageChange("pt-br")}
                  className={cn(
                    "flex items-center gap-2 sm:gap-3 rounded-xl border-2 p-3 sm:p-4 transition-all min-w-[120px] flex-shrink-0 sm:min-w-0",
                    locale === "pt-br"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-transparent bg-muted/50 hover:bg-muted"
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
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500">
                <Clock className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("timer")}</h2>
            </div>

            <div className="grid gap-4">
              {/* Default Mode */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <Label className="text-base">{t("defaultMode")}</Label>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("defaultModeDescription")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => updateSettings({ defaultMode: "POMODORO" })}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                      settings.defaultMode === "POMODORO"
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="rounded-xl bg-red-500/10 p-2.5 text-red-500">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium">
                        {t("modes.pomodoro")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("modes.pomodoroDesc")}
                      </span>
                    </div>
                  </button>
                  <button
                    onClick={() => updateSettings({ defaultMode: "CONTINUOUS" })}
                    className={cn(
                      "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all",
                      settings.defaultMode === "CONTINUOUS"
                        ? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"
                        : "border-transparent bg-muted/50 hover:bg-muted"
                    )}
                  >
                    <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500">
                      <Monitor className="h-5 w-5" />
                    </div>
                    <div className="text-center">
                      <span className="block text-sm font-medium">
                        {t("modes.continuous")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {t("modes.continuousDesc")}
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Durations */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-3">
                    <Label htmlFor="workDuration">{t("focusDuration")}</Label>
                    <input
                      id="workDuration"
                      type="number"
                      min="1"
                      max="120"
                      value={settings.workDuration}
                      onChange={(e) =>
                        updateSettings({
                          workDuration: parseInt(e.target.value) || 25,
                        })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="shortBreak">{t("shortBreakDuration")}</Label>
                    <input
                      id="shortBreak"
                      type="number"
                      min="1"
                      max="30"
                      value={settings.shortBreakDuration}
                      onChange={(e) =>
                        updateSettings({
                          shortBreakDuration: parseInt(e.target.value) || 5,
                        })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="longBreak">{t("longBreakDuration")}</Label>
                    <input
                      id="longBreak"
                      type="number"
                      min="1"
                      max="60"
                      value={settings.longBreakDuration}
                      onChange={(e) =>
                        updateSettings({
                          longBreakDuration: parseInt(e.target.value) || 15,
                        })
                      }
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="pomodorosUntilLongBreak">
                        {t("longBreakInterval")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("longBreakIntervalDescription")}
                      </p>
                    </div>
                    <input
                      id="pomodorosUntilLongBreak"
                      type="number"
                      min="1"
                      max="10"
                      value={settings.pomodorosUntilLongBreak}
                      onChange={(e) =>
                        updateSettings({
                          pomodorosUntilLongBreak: parseInt(e.target.value) || 4,
                        })
                      }
                      className="flex h-10 w-20 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoStartBreaks">
                        {t("autoStartBreaks")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("autoStartBreaksDescription")}
                      </p>
                    </div>
                    <input
                      id="autoStartBreaks"
                      type="checkbox"
                      checked={settings.autoStartBreaks}
                      onChange={(e) =>
                        updateSettings({ autoStartBreaks: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-border text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="autoStartPomodoros">
                        {t("autoStartPomodoros")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("autoStartPomodorosDescription")}
                      </p>
                    </div>
                    <input
                      id="autoStartPomodoros"
                      type="checkbox"
                      checked={settings.autoStartPomodoros}
                      onChange={(e) =>
                        updateSettings({ autoStartPomodoros: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-border text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Notifications & Sound */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="h-5 w-5 text-indigo-500" />
                  <Label className="text-base">{t("notificationsAndSound")}</Label>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {t("notificationsDescription")}
                </p>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Volume2 className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="soundEnabled">{t("soundEffects")}</Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("soundEffectsDescription")}
                      </p>
                    </div>
                    <input
                      id="soundEnabled"
                      type="checkbox"
                      checked={settings.soundEnabled}
                      onChange={(e) =>
                        updateSettings({ soundEnabled: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-border text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-muted-foreground" />
                        <Label htmlFor="notificationsEnabled">
                          {t("browserNotifications")}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {t("browserNotificationsDescription")}
                      </p>
                    </div>
                    <input
                      id="notificationsEnabled"
                      type="checkbox"
                      checked={settings.notificationsEnabled}
                      onChange={(e) =>
                        updateSettings({ notificationsEnabled: e.target.checked })
                      }
                      className="h-5 w-5 rounded border-border text-indigo-600 focus:ring-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* AI Settings */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("ai.title")}</h2>
            </div>

            <div className="grid gap-4">
              {/* AI Insights */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  <Label className="text-base">{t("ai.insightsTitle")}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("ai.insightsDesc")}
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="aiInsightsEnabled">
                        {t("ai.enableInsights")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.enableInsightsDesc")}
                      </p>
                    </div>
                    <input
                      id="aiInsightsEnabled"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-border text-purple-600 focus:ring-purple-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="smartScheduling">
                        {t("ai.smartScheduling")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.smartSchedulingDesc")}
                      </p>
                    </div>
                    <input
                      id="smartScheduling"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-border text-purple-600 focus:ring-purple-600"
                    />
                  </div>
                </div>
              </div>

              {/* Wellbeing & Burnout */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <Label className="text-base">{t("ai.wellbeingTitle")}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("ai.wellbeingDesc")}
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="burnoutDetection">
                        {t("ai.burnoutDetection")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.burnoutDetectionDesc")}
                      </p>
                    </div>
                    <input
                      id="burnoutDetection"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-border text-pink-600 focus:ring-pink-600"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="restReminders">
                        {t("ai.restReminders")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.restRemindersDesc")}
                      </p>
                    </div>
                    <input
                      id="restReminders"
                      type="checkbox"
                      defaultChecked={true}
                      className="h-5 w-5 rounded border-border text-pink-600 focus:ring-pink-600"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-border">
                    <Label>{t("ai.sensitivity")}</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: "low", label: t("ai.sensitivityLevels.low") },
                        { key: "medium", label: t("ai.sensitivityLevels.medium") },
                        { key: "high", label: t("ai.sensitivityLevels.high") },
                      ].map(({ key, label }) => (
                        <button
                          key={key}
                          className={cn(
                            "px-3 py-2 rounded-xl text-sm font-medium transition-all",
                            key === "medium"
                              ? "bg-pink-500/10 border-2 border-pink-500 text-pink-600 dark:text-pink-400"
                              : "bg-muted/50 border-2 border-transparent hover:bg-muted"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Focus Audio */}
              <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Headphones className="h-5 w-5 text-cyan-500" />
                  <Label className="text-base">{t("ai.focusAudioTitle")}</Label>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("ai.focusAudioDesc")}
                </p>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="ambientAudio">
                        {t("ai.ambientAudio")}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {t("ai.ambientAudioDesc")}
                      </p>
                    </div>
                    <input
                      id="ambientAudio"
                      type="checkbox"
                      defaultChecked={false}
                      className="h-5 w-5 rounded border-border text-cyan-600 focus:ring-cyan-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="defaultVolume">
                        {t("ai.defaultVolume")}
                      </Label>
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
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-500">
                <Rocket className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("tour.title")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">{t("tour.aiFeatures")}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t("tour.aiFeaturesDesc")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    showTour();
                    toast.success(t("tour.starting"));
                  }}
                  className="gap-2 self-start sm:self-auto"
                >
                  <Play className="h-4 w-4" />
                  {hasSeenTour ? t("tour.retakeTour") : t("tour.startTour")}
                </Button>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  {t("tour.guideText")}
                </p>
              </div>
            </div>
          </section>

          {/* Tags Management */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Tags className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("tags")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                {t("tagsDescription")}
              </p>
              <button
                onClick={() => router.push("/tags")}
                className="flex items-center justify-between w-full rounded-xl border border-border p-4 text-left transition-all hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t("manageTags")}</p>
                    <p className="text-xs text-muted-foreground">
                      {t("manageTagsDescription")}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </section>

          {/* Security & Sessions */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-red-500/10 text-red-500">
                <Shield className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("security")}</h2>
            </div>

            <SessionsManager />
          </section>

          {/* Keyboard Shortcuts */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                <Keyboard className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("keyboardShortcuts")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <p className="text-sm text-muted-foreground mb-4">
                {t("keyboardShortcutsDescription")}
              </p>
              <div className="space-y-3">
                {[
                  {
                    action: t("shortcuts.startPause"),
                    shortcut: "Espacio",
                  },
                  { action: t("shortcuts.newTask"), shortcut: "Ctrl+N" },
                  { action: t("shortcuts.search"), shortcut: "Ctrl+K" },
                  { action: t("shortcuts.settings"), shortcut: "Ctrl+," },
                  {
                    action: t("shortcuts.toggleSidebar"),
                    shortcut: "Ctrl+B",
                  },
                ].map((item) => (
                  <div
                    key={item.action}
                    className="flex justify-between items-center py-2"
                  >
                    <span className="text-sm">{item.action}</span>
                    <kbd className="px-2.5 py-1 bg-muted/80 rounded-md text-xs font-mono border border-border">
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* About */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
              <div className="p-2.5 rounded-xl bg-muted text-muted-foreground">
                <SettingsIcon className="h-5 w-5" />
              </div>
              <h2 className="text-lg font-semibold">{t("about")}</h2>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t("version")}</span>
                  <span className="font-medium">0.1.2 (Beta)</span>
                </div>
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-muted-foreground">{t("platform")}</span>
                  <span className="font-medium">Web Application</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">
                    {t("developer")}
                  </span>
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
