import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import {
  Button,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Input,
} from "@ordo-todo/ui";
import { useTranslation } from "react-i18next";
import { useWorkspaceSettings, useUpdateWorkspaceSettings } from "@/hooks/api";

interface WorkspaceConfigurationSettingsProps {
  workspaceId: string;
}

export function WorkspaceConfigurationSettings({
  workspaceId,
}: WorkspaceConfigurationSettingsProps) {
  const { t } = (useTranslation as any)();
  
  const { data: settings, isLoading } = useWorkspaceSettings(workspaceId);
  const updateSettingsMutation = useUpdateWorkspaceSettings();
  
  const [formData, setFormData] = useState({
    defaultView: "LIST" as "LIST" | "KANBAN" | "CALENDAR" | "TIMELINE" | "FOCUS",
    defaultDueTime: 540, // 9:00 AM in minutes
    timezone: "",
    locale: "",
  });

  // Update form when settings data loads
  useEffect(() => {
    if (settings) {
      setFormData({
        defaultView: (settings as any).defaultView || "LIST",
        defaultDueTime: (settings as any).defaultDueTime ?? 540,
        timezone: (settings as any).timezone || "",
        locale: (settings as any).locale || "",
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateSettingsMutation.mutateAsync({
        workspaceId,
        data: formData,
      });
      toast.success(t('WorkspaceConfigurationSettings.toast.updated'));
    } catch (error: any) {
      toast.error(error?.message || t('WorkspaceConfigurationSettings.toast.updateError'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Default View */}
        <div className="space-y-2">
          <Label htmlFor="defaultView" className="text-sm font-semibold text-foreground">
            {t('WorkspaceConfigurationSettings.form.defaultView.label')}
          </Label>
          <Select
            value={formData.defaultView}
            onValueChange={(value) => setFormData({ ...formData, defaultView: value })}
          >
            <SelectTrigger className="h-10 bg-muted/30 border-input focus:ring-primary/30">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LIST">
                <span className="flex items-center gap-2">
                  📋 {t('WorkspaceConfigurationSettings.form.defaultView.options.LIST')}
                </span>
              </SelectItem>
              <SelectItem value="KANBAN">
                <span className="flex items-center gap-2">
                  📊 {t('WorkspaceConfigurationSettings.form.defaultView.options.KANBAN')}
                </span>
              </SelectItem>
              <SelectItem value="CALENDAR">
                <span className="flex items-center gap-2">
                  📅 {t('WorkspaceConfigurationSettings.form.defaultView.options.CALENDAR')}
                </span>
              </SelectItem>
              <SelectItem value="TIMELINE">
                <span className="flex items-center gap-2">
                  ⏱️ {t('WorkspaceConfigurationSettings.form.defaultView.options.TIMELINE')}
                </span>
              </SelectItem>
              <SelectItem value="FOCUS">
                <span className="flex items-center gap-2">
                  🎯 {t('WorkspaceConfigurationSettings.form.defaultView.options.FOCUS')}
                </span>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] text-muted-foreground">
            {t('WorkspaceConfigurationSettings.form.defaultView.helper')}
          </p>
        </div>

        {/* Default Due Time */}
        <div className="space-y-2">
          <Label htmlFor="defaultDueTime" className="text-sm font-semibold text-foreground">
            {t('WorkspaceConfigurationSettings.form.defaultDueTime.label')}
          </Label>
          <Input
            id="defaultDueTime"
            type="time"
            value={`${Math.floor(formData.defaultDueTime / 60).toString().padStart(2, '0')}:${(formData.defaultDueTime % 60).toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [hours, minutes] = e.target.value.split(':').map(Number);
              setFormData({ ...formData, defaultDueTime: hours * 60 + minutes });
            }}
            className="h-10 bg-muted/30 border-input focus-visible:ring-primary/30"
          />
          <p className="text-[0.8rem] text-muted-foreground">
            {t('WorkspaceConfigurationSettings.form.defaultDueTime.helper')}
          </p>
        </div>

        {/* Timezone */}
        <div className="space-y-2">
          <Label htmlFor="timezone" className="text-sm font-semibold text-foreground">
            {t('WorkspaceConfigurationSettings.form.timezone.label')}
          </Label>
          <Select
            value={formData.timezone}
            onValueChange={(value) => setFormData({ ...formData, timezone: value })}
          >
            <SelectTrigger className="h-10 bg-muted/30 border-input focus:ring-primary/30">
              <SelectValue placeholder={t('WorkspaceConfigurationSettings.form.timezone.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
              <SelectItem value="America/Chicago">America/Chicago (CST)</SelectItem>
              <SelectItem value="America/Denver">America/Denver (MST)</SelectItem>
              <SelectItem value="America/Los_Angeles">America/Los Angeles (PST)</SelectItem>
              <SelectItem value="America/Mexico_City">America/Mexico City (CST)</SelectItem>
              <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
              <SelectItem value="Europe/Paris">Europe/Paris (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
              <SelectItem value="Asia/Shanghai">Asia/Shanghai (CST)</SelectItem>
              <SelectItem value="Australia/Sydney">Australia/Sydney (AEDT)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] text-muted-foreground">
            {t('WorkspaceConfigurationSettings.form.timezone.helper')}
          </p>
        </div>

        {/* Locale */}
        <div className="space-y-2">
          <Label htmlFor="locale" className="text-sm font-semibold text-foreground">
            {t('WorkspaceConfigurationSettings.form.locale.label')}
          </Label>
          <Select
            value={formData.locale}
            onValueChange={(value) => setFormData({ ...formData, locale: value })}
          >
            <SelectTrigger className="h-10 bg-muted/30 border-input focus:ring-primary/30">
              <SelectValue placeholder={t('WorkspaceConfigurationSettings.form.locale.placeholder')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en-US">English (US)</SelectItem>
              <SelectItem value="es-MX">Español (México)</SelectItem>
              <SelectItem value="es-ES">Español (España)</SelectItem>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="fr-FR">Français</SelectItem>
              <SelectItem value="de-DE">Deutsch</SelectItem>
              <SelectItem value="ja-JP">日本語</SelectItem>
              <SelectItem value="zh-CN">中文 (简体)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[0.8rem] text-muted-foreground">
            {t('WorkspaceConfigurationSettings.form.locale.helper')}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          disabled={updateSettingsMutation.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-6 shadow-sm"
        >
          <Save className="mr-2 h-4 w-4" />
          {updateSettingsMutation.isPending ? t('WorkspaceConfigurationSettings.actions.saving') : t('WorkspaceConfigurationSettings.actions.save')}
        </Button>
      </div>
    </form>
  );
}
