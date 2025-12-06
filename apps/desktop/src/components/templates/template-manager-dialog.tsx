import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { TemplateManager } from "./template-manager";

interface TemplateManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplateManagerDialog({ open, onOpenChange }: TemplateManagerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogTitle>Manage Templates</DialogTitle>
        <TemplateManager />
      </DialogContent>
    </Dialog>
  );
}
