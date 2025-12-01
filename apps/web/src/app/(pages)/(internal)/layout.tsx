import { AppLayout } from "@/components/shared/app-layout";
import ForceAuthentication from "@/components/auth/force-authentication.component";
import { WorkspaceAutoSelector } from "@/components/workspace/workspace-auto-selector";

export default function Layout(props: any) {
  return (
    <ForceAuthentication>
      <WorkspaceAutoSelector />
      <AppLayout>{props.children}</AppLayout>
    </ForceAuthentication>
  );
}
