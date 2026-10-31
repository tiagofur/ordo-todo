import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@ordo-todo/ui";
import { Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError(t("Auth.changePassword.currentRequired", "Por favor ingresa tu contraseña actual"));
      return;
    }

    if (newPassword.length < 8) {
      setError(t("Auth.changePassword.tooShort", "La nueva contraseña debe tener al menos 8 caracteres"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("Auth.changePassword.mismatch", "Las contraseñas no coinciden"));
      return;
    }

    setIsLoading(true);
    try {
      await (apiClient as any).changePassword({
        currentPassword,
        newPassword,
      });

      toast.success(t("Auth.changePassword.success", "Contraseña actualizada exitosamente"));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || t("Auth.changePassword.errorGeneric", "Error al actualizar la contraseña");
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] bg-background border-border">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-semibold">
              {t("Auth.changePassword.title", "Cambiar Contraseña")}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("Auth.changePassword.description", "Ingresa tu contraseña actual y define tu nueva contraseña segura.")}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-lg border border-destructive/20">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="desktop-current-password">{t("Auth.changePassword.currentLabel", "Contraseña actual")}</Label>
            <div className="relative">
              <Input
                id="desktop-current-password"
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t("Auth.changePassword.currentPlaceholder", "••••••••")}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desktop-new-password">{t("Auth.changePassword.newLabel", "Nueva contraseña")}</Label>
            <div className="relative">
              <Input
                id="desktop-new-password"
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t("Auth.changePassword.newPlaceholder", "Mínimo 8 caracteres")}
                className="pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="desktop-confirm-password">{t("Auth.changePassword.confirmLabel", "Confirmar nueva contraseña")}</Label>
            <Input
              id="desktop-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder={t("Auth.changePassword.confirmPlaceholder", "Repite la nueva contraseña")}
              required
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={isLoading}
            >
              {t("Auth.changePassword.cancel", "Cancelar")}
            </Button>
            <Button type="submit" disabled={isLoading} className="gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t("Auth.changePassword.submit", "Actualizar Contraseña")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
