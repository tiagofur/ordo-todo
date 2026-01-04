
import { type ReactNode } from 'react';
import { CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog.js';

interface VersionInfo {
  version: string;
  electronVersion?: string;
  platform?: string;
}

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  versionInfo?: VersionInfo;
  renderLogo?: () => ReactNode;
  links?: {
    website?: string;
    github?: string;
    docs?: string;
  };
  labels?: {
    title?: string;
    description?: string;
    version?: string;
    electron?: string;
    platform?: string;
    copyright?: string;
    madeWith?: string;
    website?: string;
    github?: string;
    documentation?: string;
  };
}

const DEFAULT_LABELS = {
  title: 'Ordo-Todo',
  description: 'Your personal productivity companion',
  version: 'Version',
  electron: 'Electron',
  platform: 'Platform',
  copyright: '© 2025 Ordo-Todo',
  madeWith: 'Made with ❤️ to boost your productivity',
  website: 'Website',
  github: 'GitHub',
  documentation: 'Documentation',
};

export function AboutDialog({
  open,
  onOpenChange,
  versionInfo = { version: '0.1.0', platform: 'Web' },
  renderLogo,
  links = {},
  labels = {},
}: AboutDialogProps) {
  const t = { ...DEFAULT_LABELS, ...labels };
  const defaultLinks = {
    website: 'https://ordo-todo.com',
    github: 'https://github.com/tiagofur/ordo-todo',
    docs: 'https://ordo-todo.com/docs',
    ...links,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            {renderLogo ? (
              renderLogo()
            ) : (
              <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary-foreground" />
              </div>
            )}
          </div>
          <DialogTitle className="text-2xl">{t.title}</DialogTitle>
          <DialogDescription className="text-center">
            {t.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">{t.version}</span>
            <span className="font-medium">{versionInfo.version}</span>
          </div>

          {versionInfo.electronVersion && (
            <div className="flex justify-between py-2 border-b">
              <span className="text-muted-foreground">{t.electron}</span>
              <span className="font-medium">{versionInfo.electronVersion}</span>
            </div>
          )}

          <div className="flex justify-between py-2 border-b">
            <span className="text-muted-foreground">{t.platform}</span>
            <span className="font-medium capitalize">
              {versionInfo.platform || 'Web'}
            </span>
          </div>

          <div className="pt-4 text-center text-sm text-muted-foreground">
            <p>{t.copyright}</p>
            <p className="mt-1">{t.madeWith}</p>
          </div>

          <div className="flex justify-center gap-4 pt-4">
            {defaultLinks.website && (
              <a
                href={defaultLinks.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t.website}
              </a>
            )}
            {defaultLinks.github && (
              <a
                href={defaultLinks.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t.github}
              </a>
            )}
            {defaultLinks.docs && (
              <a
                href={defaultLinks.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {t.documentation}
              </a>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
