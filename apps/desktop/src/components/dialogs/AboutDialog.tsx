import { AboutDialog as AboutDialogUI } from "@ordo-todo/ui";
import { useUIStore } from "@/stores/ui-store";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";

export function AboutDialog() {
  const { t } = useTranslation();
  const { aboutDialogOpen, closeAboutDialog } = useUIStore();
  const [version, setVersion] = useState("0.1.0");
  const [electronVersion, setElectronVersion] = useState("");
  const [platform, setPlatform] = useState("Desktop");

  useEffect(() => {
    // Get version info from Electron
    if (window.electronAPI) {
      window.electronAPI.getVersion().then(setVersion);
      setElectronVersion(window.electronAPI.versions.electron);
      setPlatform(window.electronAPI.platform);
    }
  }, []);

  return (
    <AboutDialogUI
      open={aboutDialogOpen}
      onOpenChange={closeAboutDialog}
      versionInfo={{
        version,
        electronVersion,
        platform,
      }}
      renderLogo={() => (
        <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
        </div>
      )}
      links={{
        website: "https://ordo-todo.com",
        github: "https://github.com/tiagofur/ordo-todo",
        docs: "https://ordo-todo.com/docs",
      }}
      labels={{
        title: "Ordo-Todo",
        description: t("about.description", "Your personal productivity companion"),
        version: t("about.version", "Version"),
        electron: "Electron",
        platform: t("about.platform", "Platform"),
        copyright: "© 2025 Ordo-Todo",
        madeWith: t("about.madeWith", "Made with ❤️ to boost your productivity"),
        website: t("about.website", "Website"),
        github: "GitHub",
        documentation: t("about.documentation", "Documentation"),
      }}
    />
  );
}
