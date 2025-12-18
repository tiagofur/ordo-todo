import { type ReactNode } from 'react';
export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: ReactNode;
}
interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    /** Render a Link component (for Next.js or React Router) */
    renderLink: (props: {
        href: string;
        className: string;
        children: ReactNode;
    }) => ReactNode;
    homeHref?: string;
    homeLabel?: string;
    className?: string;
}
export declare function Breadcrumbs({ items, renderLink, homeHref, homeLabel, className, }: BreadcrumbsProps): import("react/jsx-runtime").JSX.Element | null;
export {};
//# sourceMappingURL=breadcrumbs.d.ts.map