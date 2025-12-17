import { useState } from "react";
import { Building2, ChevronDown, Plus, Settings } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useWorkspaceStore } from "../../stores/workspace-store";
import { useWorkspaces } from "@/hooks/api/use-workspaces";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { WorkspaceSettingsDialog } from "./WorkspaceSettingsDialog";

interface WorkspaceSelectorProps {
  onCreateClick: () => void;
}

export function WorkspaceSelector({ onCreateClick }: WorkspaceSelectorProps) {
  const { t } = (useTranslation as any)();
  const { selectedWorkspaceId, setSelectedWorkspaceId } = useWorkspaceStore();
  const { data: workspaces } = useWorkspaces();
  const [showSettings, setShowSettings] = useState(false);

  const selectedWorkspace = workspaces?.find((w) => w.id === selectedWorkspaceId);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
            <div 
              className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-primary"
              style={{ 
                backgroundColor: selectedWorkspace?.color ? `${selectedWorkspace.color}20` : undefined,
                color: selectedWorkspace?.color 
              }}
            >
              {selectedWorkspace?.icon ? (
                <span className="text-xs">{selectedWorkspace.icon}</span>
              ) : (
                <Building2 className="h-3.5 w-3.5" />
              )}
            </div>
            <span className="flex-1 truncate text-left font-medium">
              {selectedWorkspace?.name || t('WorkspaceSelector.defaultName')}
            </span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-64" align="start">
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            {t('WorkspaceSelector.label')}
          </DropdownMenuLabel>
          
          {workspaces?.map((workspace) => (
            <DropdownMenuItem
              key={workspace.id}
              onClick={() => setSelectedWorkspaceId(workspace.id as string)}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 truncate">
                <div 
                  className="flex h-4 w-4 items-center justify-center rounded text-[10px]"
                  style={{ 
                    backgroundColor: workspace.color ? `${workspace.color}20` : undefined,
                    color: workspace.color 
                  }}
                >
                  {workspace.icon || <Building2 className="h-3 w-3" />}
                </div>
                <span className={selectedWorkspaceId === workspace.id ? "font-medium" : ""}>
                  {workspace.name}
                </span>
              </div>
              {selectedWorkspaceId === workspace.id && (
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          {selectedWorkspaceId && (
            <DropdownMenuItem onClick={() => setShowSettings(true)}>
              <Settings className="mr-2 h-4 w-4" />
              {t('WorkspaceSelector.settings')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem onClick={onCreateClick}>
            <Plus className="mr-2 h-4 w-4" />
            {t('WorkspaceSelector.newWorkspace')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedWorkspaceId && (
        <WorkspaceSettingsDialog 
          workspaceId={selectedWorkspaceId} 
          open={showSettings} 
          onOpenChange={setShowSettings} 
        />
      )}
    </>
  );
}
