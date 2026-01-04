import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/index.js';
export function Breadcrumbs({ items, renderLink, homeHref = '/dashboard', homeLabel = 'Home', className, }) {
    if (items.length === 0) {
        return null;
    }
    return (_jsxs("nav", { "aria-label": "Breadcrumb", className: cn('flex items-center gap-1 text-sm mb-4', className), children: [renderLink({
                href: homeHref,
                className: 'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
                children: (_jsxs(_Fragment, { children: [_jsx(Home, { className: "h-4 w-4" }), _jsx("span", { className: "hidden sm:inline", children: homeLabel })] })),
            }), items.map((item, index) => {
                const isLast = index === items.length - 1;
                return (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(ChevronRight, { className: "h-4 w-4 text-muted-foreground/50" }), item.href && !isLast
                            ? renderLink({
                                href: item.href,
                                className: cn('flex items-center gap-1 transition-colors hover:text-foreground', 'text-muted-foreground truncate max-w-[200px]'),
                                children: (_jsxs(_Fragment, { children: [item.icon, _jsx("span", { children: item.label })] })),
                            })
                            : (_jsxs("span", { className: cn('flex items-center gap-1 truncate max-w-[200px]', isLast
                                    ? 'font-medium text-foreground'
                                    : 'text-muted-foreground'), children: [item.icon, _jsx("span", { children: item.label })] }))] }, index));
            })] }));
}
