import { type ReactNode } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '../../utils/index.js';

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

export function Breadcrumbs({
  items,
  renderLink,
  homeHref = '/dashboard',
  homeLabel = 'Home',
  className,
}: BreadcrumbsProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center gap-1 text-sm mb-4', className)}
    >
      {/* Home */}
      {renderLink({
        href: homeHref,
        className:
          'flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors',
        children: (
          <>
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">{homeLabel}</span>
          </>
        ),
      })}

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={index} className="flex items-center gap-1">
            <ChevronRight className="h-4 w-4 text-muted-foreground/50" />
            {item.href && !isLast
              ? renderLink({
                  href: item.href,
                  className: cn(
                    'flex items-center gap-1 transition-colors hover:text-foreground',
                    'text-muted-foreground truncate max-w-[200px]'
                  ),
                  children: (
                    <>
                      {item.icon}
                      <span>{item.label}</span>
                    </>
                  ),
                })
              : (
                <span
                  className={cn(
                    'flex items-center gap-1 truncate max-w-[200px]',
                    isLast
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </span>
              )}
          </div>
        );
      })}
    </nav>
  );
}
