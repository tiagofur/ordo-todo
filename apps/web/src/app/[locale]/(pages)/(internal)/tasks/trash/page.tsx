"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";

export default function TasksTrashLegacyRedirectPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const query = searchParams.toString();
    router.replace(`/trash/tasks${query ? `?${query}` : ""}`);
  }, [router, searchParams]);

  return null;
}
