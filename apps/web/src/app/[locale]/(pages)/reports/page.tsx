"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function ReportsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/insights?tab=reports");
  }, [router]);

  return null;
}
