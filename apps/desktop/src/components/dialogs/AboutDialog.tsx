import { AboutDialog as AboutDialogUI } from "@ordo-todo/ui";
import { useUIStore } from "@/stores/ui-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { desktopBridge } from "@/lib/desktop-bridge";

export function AboutDialog() {
  const { t } = (useTranslation as any)();
  const { aboutDialogOpen, closeAboutDialog } = useUIStore();
  const [version, setVersion] = useState("1.0.0");
  const [shellInfo, setShellInfo] = useState("Tauri v2");
  const [platform, setPlatform] = useState("macOS (Native Rust)");

  useEffect(() => {
    desktopBridge.getSystemInfo().then((info) => {
      if (info.version) setVersion(info.version);
      if (info.platform) setPlatform(`${info.platform} (${info.arch})`);
      setShellInfo("Tauri v2 (Native Rust)");
    });
  }, []);

  return (
    <AboutDialogUI
      open={aboutDialogOpen}
      onOpenChange={closeAboutDialog}
      versionInfo={{
        version,
        electronVersion: shellInfo,
        platform,
      }}
      renderLogo={() => (
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
        </div>
      )}
      links={{
        // No verified production domain yet (ODD 013 S10): website/docs
        // omitted until business provides one. GitHub is the canonical link.
        github: "https://github.com/tiagofur/ordo-todo",
      }}
      labels={{
        title: "Ordo-Todo",
        description: t("About.description", "Your personal productivity companion"),
        version: t("About.version", "Version"),
        electron: "Shell",
        platform: t("About.platform", "Platform"),
        copyright: "© 2025 Ordo-Todo",
        madeWith: t("About.madeWith", "Made with ❤️ to boost your productivity"),
        website: t("About.website", "Website"),
        github: "GitHub",
        documentation: t("About.documentation", "Documentation"),
      }}
    />
  );
}
