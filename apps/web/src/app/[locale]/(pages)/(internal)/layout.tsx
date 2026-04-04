"use client";

import { AppLayout } from "@/components/shared/app-layout";
import ForceAuthentication from "@/components/auth/force-authentication.component";
import { WorkspaceAutoSelector } from "@/components/workspace/workspace-auto-selector";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ForceAuthentication>
      <WorkspaceAutoSelector />
      <AppLayout>{children}</AppLayout>
    </ForceAuthentication>
  );
}
