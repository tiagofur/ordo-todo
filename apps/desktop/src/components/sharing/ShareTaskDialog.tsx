import { useState } from "react";
import { useShareUrl } from "@/hooks/api/use-tasks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Share2, ExternalLink, Check } from "lucide-react";
import { toast } from "sonner";

interface ShareTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle?: string;
}

export function ShareTaskDialog({ open, onOpenChange, taskId, taskTitle }: ShareTaskDialogProps) {
  const [copied, setCopied] = useState(false);
  const shareUrlMutation = useShareUrl();

  const handleGenerateShareLink = async () => {
    try {
      const shareUrl = await shareUrlMutation.mutateAsync(taskId);
      await copyToClipboard(shareUrl);
      toast.success("¡Enlace de compartir copiado al portapapeles!");
    } catch (error) {
      console.error("Error generating share link:", error);
      toast.error("No se pudo generar el enlace de compartir");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInBrowser = () => {
    if (shareUrlMutation.data) {
      window.open(shareUrlMutation.data, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Compartir Tarea
          </DialogTitle>
          <DialogDescription>
            {taskTitle ? `Compartir "${taskTitle}" con otras personas` : "Compartir esta tarea con otras personas"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {shareUrlMutation.data ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="share-url">Enlace de compartir</Label>
                <div className="flex gap-2">
                  <Input
                    id="share-url"
                    value={shareUrlMutation.data}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(shareUrlMutation.data)}
                    className="min-w-[100px]"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Copiado
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={openInBrowser}
                  className="flex-1"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir en navegador
                </Button>
                <Button
                  variant="outline"
                  onClick={handleGenerateShareLink}
                  disabled={shareUrlMutation.isPending}
                >
                  <Share2 className="h-4 w-4 mr-2" />
                  Nuevo enlace
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Genera un enlace público para que otras personas puedan ver esta tarea sin necesidad de iniciar sesión.
              </p>
              <Button
                onClick={handleGenerateShareLink}
                disabled={shareUrlMutation.isPending}
                className="w-full"
              >
                {shareUrlMutation.isPending ? (
                  "Generando..."
                ) : (
                  <>
                    <Share2 className="h-4 w-4 mr-2" />
                    Generar enlace de compartir
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>

        <div className="text-xs text-muted-foreground border-t pt-4">
          <p className="mb-2">📌 <strong>Información de privacidad:</strong></p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Cualquier persona con el enlace podrá ver esta tarea</li>
            <li>Las personas con el enlace no podrán modificar la tarea</li>
            <li>Puedes generar un nuevo enlace para revocar el acceso anterior</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
}