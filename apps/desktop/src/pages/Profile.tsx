import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { Settings as SettingsIcon, Sun, Laptop } from "lucide-react";
import { Label, Separator, Switch, Slider, Button } from "@ordo-todo/ui";
import { ProfileTabs } from "../components/shared/profile-tabs";
import { changeLanguage, getCurrentLanguage, supportedLanguages } from "@/i18n";
import { PageTransition, SlideIn } from "@/components/motion";
import { useElectron } from "@/hooks/use-electron";
import { desktopBridge } from "@/lib/desktop-bridge";
import {
  useFullProfile,
  useUpdateProfile,
  useUpdatePreferences,
  useExportData,
  useDeleteAccount
} from "@/hooks/api";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const { setTheme, theme } = useTheme();
  const { t, i18n } = (useTranslation as any)();
  const { isElectron } = useElectron();
  const navigate = useNavigate();
  const currentLang = getCurrentLanguage();
  const addSuccess = (msg: string) => toast.success(msg);
  const addError = (msg: string) => toast.error(msg);

  // API hooks
  const { data: profile, isLoading } = useFullProfile();
  const updateProfile = useUpdateProfile();
  const updatePreferences = useUpdatePreferences();
  const exportData = useExportData();
  const deleteAccount = useDeleteAccount();

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
    if (!isElectron) return;

    desktopBridge.isAutostartEnabled().then((enabled) => {
      setAutoLaunchEnabled(enabled);
    });

    desktopBridge.getSystemInfo().then((info) => {
      setAppVersion(info.version || '1.0.0');
    });
  }, [isElectron]);

  const handleLanguageChange = (lng: string) => {
    changeLanguage(lng as any);
  };

  const handleAutoLaunchToggle = async (enabled: boolean) => {
    const success = await desktopBridge.setAutostart(enabled);
    if (success) {
      setAutoLaunchEnabled(enabled);
    }
  };

  const handleStartMinimizedToggle = async (minimized: boolean) => {
    setStartMinimized(minimized);
  };

  const handleTimerFloatingToggle = async () => {
    const newVisibility = await desktopBridge.toggleMiniTimer();
    setTimerFloatingVisible(newVisibility);
  };

  const handleCheckForUpdates = async () => {
    setIsCheckingUpdate(true);
    setTimeout(() => {
      setIsCheckingUpdate(false);
      setUpdateState({ status: 'not-available' });
    }, 600);
  };

  const handleDownloadUpdate = async () => {};
  const handleInstallUpdate = async () => {};

  // Desktop-specific content for Account tab
  const desktopOnlyContent = (
    <>
      {/* Desktop Settings Separator */}
      <Separator />

      {/* Desktop Settings */}
      <div className="space-y-4">
        <h4 className="font-medium">Desktop Settings</h4>

        {/* Auto Launch */}
        <div className="flex items-center justify-between">
          <div>
            <Label>Start with system</Label>
            <p className="text-sm text-muted-foreground">
              Launch Ordo-Todo when computer starts
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
              <Label>Start minimized</Label>
              <p className="text-sm text-muted-foreground">
                Hide window on startup
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
            <Label>Floating Timer</Label>
            <p className="text-sm text-muted-foreground">
              Show always-visible mini timer
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
              <Label>Updates</Label>
              <p className="text-sm text-muted-foreground">
                {updateState.status === 'available'
                  ? `New version available: ${updateState.version}`
                  : updateState.status === 'downloaded'
                  ? 'Update ready to install'
                  : updateState.status === 'downloading'
                  ? `Downloading... ${updateState.progress?.toFixed(0)}%`
                  : 'Automatically check for updates'
                }
              </p>
            </div>

            {updateState.status === 'downloaded' ? (
              <Button
                size="sm"
                onClick={handleInstallUpdate}
              >
                Restart
              </Button>
            ) : updateState.status === 'available' ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleDownloadUpdate}
              >
                Download
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleCheckForUpdates}
                disabled={isCheckingUpdate || updateState.status === 'downloading'}
              >
                {isCheckingUpdate ? '...' : 'Check'}
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

      {/* About Section */}
      <Separator />

      <div className="space-y-4">
        <h4 className="font-medium">About</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Version</span>
            <span className="font-medium">{appVersion}</span>
          </div>
          {isElectron && (
            <>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Shell</span>
                <span className="font-medium">Tauri v2 (Native Rust)</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Engine</span>
                <span className="font-medium">WebKit / Safari Nitro</span>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
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
              Profile Settings
            </h1>
            <p className="text-muted-foreground mt-2">Manage your profile and preferences</p>
          </div>
        </SlideIn>

        {/* Appearance & Language Settings */}
        <SlideIn delay={0.1}>
          <div className="rounded-lg border bg-card p-6 space-y-6">
            <div>
              <h3 className="text-lg font-medium flex items-center gap-2">
                <Sun className="h-5 w-5 text-muted-foreground" />
                Appearance
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Customize the app appearance
              </p>

              <div className="grid grid-cols-3 gap-4 max-w-md">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "light" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <Sun className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "dark" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <span className="mb-2 h-6 w-6">🌙</span>
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button
                  onClick={() => setTheme("system")}
                  className={`flex flex-col items-center justify-between rounded-md border-2 p-4 hover:bg-accent hover:text-accent-foreground transition-all ${
                    theme === "system" ? "border-primary bg-accent" : "border-muted"
                  }`}
                >
                  <Laptop className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
            </div>

            <Separator />

            {/* Language */}
            <div>
              <h3 className="text-lg font-medium">Language</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Select app language
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
                    <span className="text-sm font-medium">{lng === "es" ? "Spanish" : "English"}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Profile Tabs */}
        <SlideIn delay={0.2}>
          <ProfileTabs
            profile={profile as any}
            sessionUser={{ email: profile?.email || "" }}
            isLoading={isLoading}
            onUpdateProfile={async (data) => {
              await updateProfile.mutateAsync(data);
            }}
            onUpdateUsername={async (newUsername) => {
              await updateProfile.mutateAsync({ username: newUsername });
            }}
            onUpdatePreferences={async (data) => {
              await updatePreferences.mutateAsync(data);
            }}
            onExportData={async () => {
              await exportData.mutateAsync();
            }}
            onDeleteAccount={async () => {
              await deleteAccount.mutateAsync();
              navigate("/login");
            }}
            isUpdateProfilePending={updateProfile.isPending}
            isUpdatePreferencesPending={updatePreferences.isPending}
            isExportDataPending={exportData.isPending}
            isDeleteAccountPending={deleteAccount.isPending}
            addSuccess={addSuccess}
            addError={addError}
            desktopOnlyContent={desktopOnlyContent}
          />
        </SlideIn>
      </div>
    </PageTransition>
  );
}
