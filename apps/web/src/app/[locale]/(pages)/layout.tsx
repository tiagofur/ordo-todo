"use client";

import ForceAuthentication from "@/components/auth/force-authentication.component";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ForceAuthentication>
      {children}
    </ForceAuthentication>
  );
}
