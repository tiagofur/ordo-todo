"use client";

import { ConfirmDelete as ConfirmDeleteUI } from "@ordo-todo/ui";
import { useTranslations } from "next-intl";

interface ConfirmDeleteProps {
  children: React.ReactNode;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  disabled?: boolean;
}

export function ConfirmDelete({
  children,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  disabled = false,
}: ConfirmDeleteProps) {
  const t = useTranslations("ConfirmDelete");

  return (
    <ConfirmDeleteUI
      onConfirm={onConfirm}
      disabled={disabled}
      title={title || t("title")}
      description={description || t("description")}
      confirmText={confirmText || t("confirm")}
      cancelText={cancelText || t("cancel")}
      deletingText={t("deleting")}
    >
      {children}
    </ConfirmDeleteUI>
  );
}
