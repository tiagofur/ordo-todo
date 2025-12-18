import { type ReactNode } from 'react';
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
export declare function AboutDialog({ open, onOpenChange, versionInfo, renderLogo, links, labels, }: AboutDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=about-dialog.d.ts.map