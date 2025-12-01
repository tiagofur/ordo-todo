"use client";
import { IconBell, IconMenu2, IconSearch, IconUser, IconChevronRight } from "@tabler/icons-react";
import Link from "next/link";
import UserMenu from "./user-menu.component";
import ThemeToggle from "./theme-toggle.component";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export interface TopBarProps {
  className?: string;
  onToggleMenu?: () => void;
  onToggleAI?: () => void;
}

export default function TopBar(props: TopBarProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  const breadcrumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const isLast = index === segments.length - 1;
    
    // Simple capitalization for now, can be improved with a map
    const label = segment.charAt(0).toUpperCase() + segment.slice(1);

    return { href, label, isLast };
  });

  return (
    <header
      className={`flex items-center justify-between min-h-16 px-4 border-b bg-zinc-100 dark:bg-black sticky top-0 z-10 transition-transform duration-300 ${props.className ?? ""}`}
    >
      <div className="flex gap-2 items-center">
        <IconMenu2
          className="cursor-pointer text-black dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
          onClick={props.onToggleMenu}
        />
        
        {/* Breadcrumbs */}
        <div className="hidden md:flex items-center gap-1 ml-4 text-sm text-muted-foreground">
            {breadcrumbs.length > 0 ? (
                breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.href}>
                        {index > 0 && <IconChevronRight size={14} className="text-zinc-400" />}
                        {crumb.isLast ? (
                            <span className="font-medium text-foreground">{crumb.label}</span>
                        ) : (
                            <Link href={crumb.href} className="hover:text-foreground transition-colors">
                                {crumb.label}
                            </Link>
                        )}
                    </Fragment>
                ))
            ) : (
                <span className="font-medium text-foreground">Dashboard</span>
            )}
        </div>

        <div className="hidden lg:flex items-center rounded-lg gap-2 px-4 py-2 w-64 ml-4 bg-white border border-zinc-400/50 dark:border-zinc-700 dark:bg-zinc-700/70">
          <IconSearch size={18} className="text-zinc-600 dark:text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="focus:outline-none bg-transparent w-full text-black dark:text-zinc-300 placeholder:text-zinc-500 dark:placeholder:text-zinc-600"
            value={""}
            onChange={(e) => {}}
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Button 
            variant="ghost" 
            size="icon" 
            onClick={props.onToggleAI}
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/20"
            title="Ordo AI Copilot"
        >
            <Sparkles className="h-5 w-5" />
        </Button>
        <ThemeToggle />
        <IconBell className="cursor-pointer text-black dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors" />
        <Link
          href="/profile"
          className="text-black dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
        >
          <IconUser />
        </Link>
        <UserMenu />
      </div>
    </header>
  );
}
