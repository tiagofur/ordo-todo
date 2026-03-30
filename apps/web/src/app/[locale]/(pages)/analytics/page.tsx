"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function AnalyticsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/insights?tab=analytics");
  }, [router]);

  return null;
}
