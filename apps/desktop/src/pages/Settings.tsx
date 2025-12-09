import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { 
  Moon, Sun, Laptop, Globe, Bell, Clock, Keyboard, 
  Monitor, Download, Power, ExternalLink, RefreshCw, Loader2, Settings as SettingsIcon 
} from "lucide-react";
import { Label, Separator, Switch, Slider, Button } from "@ordo-todo/ui";
import { changeLanguage, getCurrentLanguage, supportedLanguages } from "@/i18n";
import { PageTransition, SlideIn } from "@/components/motion";
import { useElectron } from "@/hooks/use-electron";

export function Settings() {
  const { setTheme, theme } = useTheme();
  const { t, i18n } = useTranslation();
  const { isElectron } = useElectron();
  const currentLang = getCurrentLanguage();

  // Accent color (matching Web)
  const accentColor = "#06b6d4"; // Cyan

  // Desktop-specific state
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);
  const [startMinimized, setStartMinimized] = useState(true);
  const [timerFloatingVisible, setTimerFloatingVisible] = useState(false);
  const [updateState, setUpdateState] = useState<{
    status: string;
    version?: string;
    progress?: number;
  }>({ status: 'idle' });
  const [appVersion, setAppVersion] = useState('0.5.0');
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);

  // Load desktop settings
  useEffect(() => {
    if (!isElectron || !window.electronAPI) return;

    // Load auto-launch settings
    window.electronAPI.autoLaunch.getSettings().then((settings) => {
      setAutoLaunchEnabled(settings.enabled);
      setStartMinimized(settings.minimized);
    });

    // Load timer window visibility
    window.electronAPI.timerWindow.isVisible().then(setTimerFloatingVisible);

    // Load app version
    window.electronAPI.autoUpdater.getVersion().then(setAppVersion);

    // Listen for update state changes
    window.electronAPI.autoUpdater.onStateChange((state) => {
      setUpdateState(state);
      if (state.status !== 'checking') {
        setIsCheckingUpdate(false);
      }
    });

    return () => {
      window.electronAPI?.removeAllListeners('auto-update:state');
    };
  }, [isElectron]);

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng as any);
  };

  const handleAutoLaunchToggle = async (enabled: boolean) => {
    if (!window.electronAPI) return;
    
    if (enabled) {
      await window.electronAPI.autoLaunch.enable(startMinimized);
    } else {
      await window.electronAPI.autoLaunch.disable();
    }
    setAutoLaunchEnabled(enabled);
  };

  const handleStartMinimizedToggle = async (minimized: boolean) => {
    if (!window.electronAPI) return;
    
    await window.electronAPI.autoLaunch.setStartMinimized(minimized);
    setStartMinimized(minimized);
  };

  const handleTimerFloatingToggle = async () => {
    if (!window.electronAPI) return;
    
    const newVisibility = await window.electronAPI.timerWindow.toggle();
    setTimerFloatingVisible(newVisibility);
  };

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    
    setIsCheckingUpdate(true);
    await window.electronAPI.autoUpdater.check(false);
  };

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.autoUpdater.download();
  };

  const handleInstallUpdate = async () => {
    if (!window.electronAPI) return;
    await window.electronAPI.autoUpdater.install();
  };

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header - Styled like Web */}
        <SlideIn direction="top">
          <div>
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
              {t("Settings.title")}
            </h1>
            <p className="text-muted-foreground mt-2">Personaliza tu experiencia</p>
          </div>
        </SlideIn>

        {/* Appearance */}
        <SlideIn delay={0.1}>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Sun className="h-5 w-5 text-muted-foreground" />
                {t("Settings.appearance")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("Settings.theme")}
              </p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "light" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <Sun className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{t("Settings.themes.light")}</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "dark" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <Moon className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{t("Settings.themes.dark")}</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "system" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <Laptop className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">{t("Settings.themes.system")}</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Language */}
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Globe className="h-5 w-5 text-muted-foreground" />
                {t("Settings.language")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Selecciona el idioma de la aplicación
              </p>
              
              <div className="grid grid-cols-2 gap-4 max-w-md">
                {supportedLanguages.map((lng) => (
                  <button
                    key={lng}
                    onClick={() => handleLanguageChange(lng)}
                    className={`flex items-center gap-3 rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                      currentLang === lng ? "border-primary bg-accent" : "border-muted"
                    }`}
                  >
                    <span className="text-2xl">{lng === "es" ? "🇪🇸" : "🇺🇸"}</span>
                    <span className="text-sm font-medium">{t(`settings.languages.${lng}`)}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Timer Settings */}
        <SlideIn delay={0.2}>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Clock className="h-5 w-5 text-muted-foreground" />
                {t("Settings.timer")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configura los tiempos del pomodoro
              </p>
            </div>

            <div className="space-y-6 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("Settings.timerSettings.focusDuration")}</Label>
                  <span className="text-sm text-muted-foreground">25 min</span>
                </div>
                <Slider defaultValue={[25]} max={60} min={5} step={5} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("Settings.timerSettings.shortBreakDuration")}</Label>
                  <span className="text-sm text-muted-foreground">5 min</span>
                </div>
                <Slider defaultValue={[5]} max={15} min={1} step={1} />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>{t("Settings.timerSettings.longBreakDuration")}</Label>
                  <span className="text-sm text-muted-foreground">15 min</span>
                </div>
                <Slider defaultValue={[15]} max={30} min={5} step={5} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("Settings.timerSettings.autoStartBreaks")}</Label>
                  <p className="text-sm text-muted-foreground">
                    Iniciar descanso automáticamente
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("Settings.timerSettings.autoStartPomodoros")}</Label>
                  <p className="text-sm text-muted-foreground">
                    Iniciar siguiente pomodoro automáticamente
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Notifications */}
        <SlideIn delay={0.3}>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                {t("Settings.notifications")}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Configura las notificaciones
              </p>
            </div>

            <div className="space-y-4 max-w-md">
              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("Settings.notificationSettings.desktop")}</Label>
                  <p className="text-sm text-muted-foreground">
                    Mostrar notificaciones de escritorio
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("Settings.notificationSettings.sound")}</Label>
                  <p className="text-sm text-muted-foreground">
                    Reproducir sonido al completar
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>{t("Settings.notificationSettings.taskReminders")}</Label>
                  <p className="text-sm text-muted-foreground">
                    Recordar tareas próximas a vencer
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Keyboard Shortcuts */}
        <SlideIn delay={0.4}>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Keyboard className="h-5 w-5 text-muted-foreground" />
                Atajos de Teclado
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Atajos globales de la aplicación
              </p>
            </div>

            <div className="space-y-3 max-w-md">
              {[
                { action: "Iniciar/Pausar timer", shortcut: "Ctrl+Shift+P" },
                { action: "Nueva tarea", shortcut: "Ctrl+N" },
                { action: "Buscar", shortcut: "Ctrl+K" },
                { action: "Mostrar/Ocultar app", shortcut: "Ctrl+Shift+O" },
                { action: "Configuración", shortcut: "Ctrl+," },
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
        </SlideIn>

        {/* Desktop Settings (only shown in Electron) */}
        {isElectron && (
          <SlideIn delay={0.5}>
            <div className="rounded-lg border bg-card p-6 space-y-6">
              <div>
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  Configuración de Escritorio
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Opciones específicas de la aplicación de escritorio
                </p>
              </div>

              <div className="space-y-4 max-w-md">
                {/* Auto Launch */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <Power className="h-4 w-4" />
                      Iniciar con el sistema
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Abrir Ordo-Todo al iniciar el ordenador
                    </p>
                  </div>
                  <Switch 
                    checked={autoLaunchEnabled}
                    onCheckedChange={handleAutoLaunchToggle}
                  />
                </div>

                {/* Start Minimized */}
                {autoLaunchEnabled && (
                  <div className="flex items-center justify-between ml-6 border-l-2 pl-4">
                    <div>
                      <Label>Iniciar minimizado</Label>
                      <p className="text-sm text-muted-foreground">
                        Ocultar la ventana al iniciar
                      </p>
                    </div>
                    <Switch 
                      checked={startMinimized}
                      onCheckedChange={handleStartMinimizedToggle}
                    />
                  </div>
                )}

                <Separator />

                {/* Floating Timer Window */}
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Timer Flotante
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar mini timer siempre visible
                    </p>
                  </div>
                  <Switch 
                    checked={timerFloatingVisible}
                    onCheckedChange={handleTimerFloatingToggle}
                  />
                </div>

                <Separator />

                {/* Auto Update */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Actualizaciones
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {updateState.status === 'available' 
                          ? `Nueva versión disponible: ${updateState.version}`
                          : updateState.status === 'downloaded'
                          ? 'Actualización lista para instalar'
                          : updateState.status === 'downloading'
                          ? `Descargando... ${updateState.progress?.toFixed(0)}%`
                          : 'Buscar actualizaciones automáticamente'
                        }
                      </p>
                    </div>
                    
                    {updateState.status === 'downloaded' ? (
                      <Button 
                        size="sm" 
                        onClick={handleInstallUpdate}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reiniciar
                      </Button>
                    ) : updateState.status === 'available' ? (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleDownloadUpdate}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Descargar
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={handleCheckForUpdates}
                        disabled={isCheckingUpdate || updateState.status === 'downloading'}
                      >
                        {isCheckingUpdate ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          'Buscar'
                        )}
                      </Button>
                    )}
                  </div>

                  {updateState.status === 'downloading' && (
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${updateState.progress || 0}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </SlideIn>
        )}

        {/* About */}
        <SlideIn delay={isElectron ? 0.6 : 0.5}>
          <div className="rounded-lg border bg-card p-6 space-y-4">
            <h3 className="text-lg font-medium">Acerca de</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Versión</span>
                <span className="font-medium">{appVersion}</span>
              </div>
              {isElectron && window.electronAPI && (
                <>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Electron</span>
                    <span className="font-medium">{window.electronAPI.versions.electron}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Chrome</span>
                    <span className="font-medium">{window.electronAPI.versions.chrome}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Node.js</span>
                    <span className="font-medium">{window.electronAPI.versions.node}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Desarrollado por</span>
                <span className="font-medium">Ordo-Todo Team</span>
              </div>
            </div>
          </div>
        </SlideIn>
      </div>
    </PageTransition>
  );
}
