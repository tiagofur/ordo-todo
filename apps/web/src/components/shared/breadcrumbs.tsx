"use client";

import Link from "next/link";
import {
  Breadcrumbs as BreadcrumbsUI,
  type BreadcrumbItem,
} from "@ordo-todo/ui";
import { useTranslations } from "next-intl";

export type { BreadcrumbItem };

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const t = useTranslations("Breadcrumbs");

  return (
    <BreadcrumbsUI
      items={items}
      className={className}
      homeLabel={t("home")}
      renderLink={({ href, className, children }) => (
        <Link href={href} className={className}>
          {children}
        </Link>
      )}
    />
  );
}
