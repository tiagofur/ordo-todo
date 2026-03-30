"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

export default function EisenhowerPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/tasks?view=eisenhower");
  }, [router]);

  return null;
}
