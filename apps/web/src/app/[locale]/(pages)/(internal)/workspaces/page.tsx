"use client";

import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useWorkspaces, useCreateWorkspace } from "@/lib/api-hooks";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function WorkspacesPage() {
  const t = useTranslations('Workspaces');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: workspaces, isLoading } = useWorkspaces();
  const { mutateAsync: createWorkspace } = useCreateWorkspace();
  
  return (
    <div className="space-y-6">
      {/* Header - Standard Iconic Design */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <motion.div
            initial={{ rotate: -10, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            className="flex h-14 w-14 items-center justify-center rounded-2xl bg-workspaces text-white shadow-lg shadow-workspaces/25 shrink-0"
          >
            <Briefcase className="h-7 w-7" />
          </motion.div>

          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1 line-clamp-1">
              {t('subtitle')}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium bg-workspaces text-white shadow-lg shadow-workspaces/25 transition-all duration-200 hover:shadow-xl hover:shadow-workspaces/30"
        >
          <Plus className="h-4 w-4" />
          {t('newWorkspace')}
        </motion.button>
      </div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted/50 animate-pulse border border-border/20"
            />
          ))}
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workspaces.map((workspace: any, index: number) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              index={index}
            />
          ))}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 px-4 text-center bg-muted/10 rounded-3xl border-2 border-dashed border-border/50"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-workspaces/10 text-workspaces mb-6">
            <Briefcase className="h-12 w-12" />
          </div>
          <h3 className="text-2xl font-bold mb-2 tracking-tight">{t('noWorkspaces')}</h3>
          <p className="text-muted-foreground mb-8 max-w-md text-balance">
            {t('noWorkspacesDescription')}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-base font-semibold bg-workspaces text-white shadow-xl shadow-workspaces/25 transition-all duration-200"
          >
            <Plus className="h-5 w-5" />
            {t('createWorkspace')}
          </motion.button>
        </motion.div>
      )}

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSubmit={async (data) => {
            await createWorkspace(data);
            setShowCreateDialog(false);
        }}
      />
    </div>
  );
}
