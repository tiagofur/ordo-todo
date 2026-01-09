import { useState } from "react";
import { ShareTaskDialog } from "./ShareTaskDialog";
import { Button } from "@ordo-todo/ui";
import { Share2 } from "lucide-react";

interface ShareTaskButtonProps {
  taskId: string;
  taskTitle?: string;
  variant?: "default" | "outline" | "ghost" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function ShareTaskButton({
  taskId,
  taskTitle,
  variant = "outline",
  size = "sm",
  className,
}: ShareTaskButtonProps) {
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShareDialogOpen(true)}
        className={className}
      >
        {size === "icon" ? (
          <Share2 className="h-4 w-4" />
        ) : (
          <>
            <Share2 className="h-4 w-4 mr-2" />
            Compartir
          </>
        )}
      </Button>

      <ShareTaskDialog
        open={shareDialogOpen}
        onOpenChange={setShareDialogOpen}
        taskId={taskId}
        taskTitle={taskTitle}
      />
    </>
  );
}