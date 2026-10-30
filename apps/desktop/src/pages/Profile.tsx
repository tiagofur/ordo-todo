import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "@/i18n";
import { User as UserIcon } from "lucide-react";
import { Label, Separator, Switch, Slider, Button } from "@ordo-todo/ui";
import { ProfileTabs } from "../components/shared/profile-tabs";
import { PageTransition, SlideIn } from "@/components/motion";
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
  const { t } = (useTranslation as any)();
  // Native-shell listeners live in MainLayout (single mount site); Profile
  // only needs the platform flag (ODD 014 T3). isDesktop() (no isNative()):
  // en el shell móvil los controles nativos de escritorio son no-ops (KMO-I03).
  const isDesktopShell = desktopBridge.isDesktop();
  const navigate = useNavigate();
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
    if (!isDesktopShell) return;

    desktopBridge.isAutostartEnabled().then((enabled) => {
      setAutoLaunchEnabled(enabled);
    });

    desktopBridge.getSystemInfo().then((info) => {
      setAppVersion(info.version || '1.0.0');
    });
  }, [isDesktopShell]);

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
          {isDesktopShell && (
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
        {/* Header - Apple Style Unified Pattern */}
        <SlideIn direction="top">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
              <div className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow-sm shadow-indigo-500/25 shrink-0">
                <UserIcon className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground m-0 leading-tight truncate">
                  {t("Profile.title", "Configuración de Perfil")}
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 truncate">
                  {t("Profile.subtitle", "Gestiona tu identidad, preferencias de IA, seguridad y suscripción")}
                </p>
              </div>
            </div>
          </div>
        </SlideIn>

        {/* Profile Tabs */}
        <SlideIn delay={0.1}>
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
            desktopOnlyContent={isDesktopShell ? desktopOnlyContent : undefined}
          />
        </SlideIn>
      </div>
    </PageTransition>
  );
}
