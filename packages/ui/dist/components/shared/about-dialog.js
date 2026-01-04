import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { CheckCircle2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from '../ui/dialog.js';
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
export function AboutDialog({ open, onOpenChange, versionInfo = { version: '0.1.0', platform: 'Web' }, renderLogo, links = {}, labels = {}, }) {
    const t = { ...DEFAULT_LABELS, ...labels };
    const defaultLinks = {
        website: 'https://ordo-todo.com',
        github: 'https://github.com/tiagofur/ordo-todo',
        docs: 'https://ordo-todo.com/docs',
        ...links,
    };
    return (_jsx(Dialog, { open: open, onOpenChange: onOpenChange, children: _jsxs(DialogContent, { className: "max-w-md", children: [_jsxs(DialogHeader, { className: "text-center", children: [_jsx("div", { className: "flex justify-center mb-4", children: renderLogo ? (renderLogo()) : (_jsx("div", { className: "w-20 h-20 bg-primary rounded-2xl flex items-center justify-center", children: _jsx(CheckCircle2, { className: "w-12 h-12 text-primary-foreground" }) })) }), _jsx(DialogTitle, { className: "text-2xl", children: t.title }), _jsx(DialogDescription, { className: "text-center", children: t.description })] }), _jsxs("div", { className: "space-y-4 mt-4", children: [_jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-muted-foreground", children: t.version }), _jsx("span", { className: "font-medium", children: versionInfo.version })] }), versionInfo.electronVersion && (_jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-muted-foreground", children: t.electron }), _jsx("span", { className: "font-medium", children: versionInfo.electronVersion })] })), _jsxs("div", { className: "flex justify-between py-2 border-b", children: [_jsx("span", { className: "text-muted-foreground", children: t.platform }), _jsx("span", { className: "font-medium capitalize", children: versionInfo.platform || 'Web' })] }), _jsxs("div", { className: "pt-4 text-center text-sm text-muted-foreground", children: [_jsx("p", { children: t.copyright }), _jsx("p", { className: "mt-1", children: t.madeWith })] }), _jsxs("div", { className: "flex justify-center gap-4 pt-4", children: [defaultLinks.website && (_jsx("a", { href: defaultLinks.website, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline", children: t.website })), defaultLinks.github && (_jsx("a", { href: defaultLinks.github, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline", children: t.github })), defaultLinks.docs && (_jsx("a", { href: defaultLinks.docs, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary hover:underline", children: t.documentation }))] })] })] }) }));
}
