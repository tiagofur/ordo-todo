"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function WellbeingPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/insights?tab=wellbeing");
  }, [router]);

  return null;
}
