"use client";

import { useState } from "react";
import { Plus, Briefcase } from "lucide-react";
import { useWorkspaces } from "@/lib/api-hooks";
import { WorkspaceCard } from "@/components/workspace/workspace-card";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

export default function WorkspacesPage() {
  const t = useTranslations('Workspaces');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { data: workspaces, isLoading } = useWorkspaces();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
              <Briefcase className="h-6 w-6" />
            </div>
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('subtitle')}
          </p>
        </div>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:scale-105 hover:shadow-xl hover:shadow-orange-500/30"
        >
          <Plus className="h-4 w-4" />
          {t('newWorkspace')}
        </button>
      </div>

      {/* Workspaces Grid */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-2xl bg-muted/50 animate-pulse"
            />
          ))}
        </div>
      ) : workspaces && workspaces.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {workspaces.map((workspace: any, index: number) => (
            <WorkspaceCard
              key={workspace.id}
              workspace={workspace}
              index={index}
            />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center py-16 px-4 text-center"
        >
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-muted/50 mb-6">
            <Briefcase className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">{t('noWorkspaces')}</h3>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t('noWorkspacesDescription')}
          </p>
          <button
            onClick={() => setShowCreateDialog(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-medium text-white shadow-lg shadow-orange-500/20 transition-all duration-200 hover:bg-orange-600 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            {t('createWorkspace')}
          </button>
        </motion.div>
      )}

      <CreateWorkspaceDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
