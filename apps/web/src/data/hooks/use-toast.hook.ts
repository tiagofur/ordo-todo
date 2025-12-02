"use client";

import { ReactNode } from "react";
import { notify } from "@/lib/notify";

type ToastVariant = "success" | "default" | "error";

function useToast() {
  const toast = (props: {
    message: string;
    description?: ReactNode;
    variant?: ToastVariant;
  }) => {
    const { message, description, variant = "default" } = props;
    const descString = typeof description === 'string' ? description : undefined;

    switch (variant) {
      case "success":
        notify.success(message, descString);
        break;
      case "error":
        notify.error(message, descString);
        break;
      default:
        notify.info(message, descString);
        break;
    }
  };

  return {
    toast,
  };
}

export { useToast };
