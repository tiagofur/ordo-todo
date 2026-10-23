"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from "@ordo-todo/ui";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useCreateInviteCode } from "@/hooks/use-admin";
import { getErrorMessage } from "@/lib/error-handler";

const MAX_USES_MIN = 1;
const MAX_USES_MAX = 10000;

interface CreateInviteCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Builds the ISO instant for the end of the selected day in UTC, so the
 * value is deterministic regardless of the viewer's timezone.
 */
export function endOfDayUtcIso(dateInput: string): string | undefined {
  if (!dateInput) return undefined;
  const parsed = new Date(`${dateInput}T23:59:59.999Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function CreateInviteCodeDialog({
  open,
  onOpenChange,
}: CreateInviteCodeDialogProps) {
  const t = useTranslations("Admin.createCode");
  const createCode = useCreateInviteCode();

  const [label, setLabel] = useState("");
  const [maxUses, setMaxUses] = useState("1");
  const [expiresAt, setExpiresAt] = useState("");
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setLabel("");
    setMaxUses("1");
    setExpiresAt("");
    setError(null);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    const parsedMaxUses = Number(maxUses);
    if (
      !Number.isInteger(parsedMaxUses) ||
      parsedMaxUses < MAX_USES_MIN ||
      parsedMaxUses > MAX_USES_MAX
    ) {
      setError(t("maxUsesInvalid"));
      return;
    }

    const expiresIso = endOfDayUtcIso(expiresAt);
    if (expiresAt && !expiresIso) {
      setError(t("expiresAtInvalid"));
      return;
    }
    if (expiresIso && new Date(expiresIso).getTime() <= Date.now()) {
      setError(t("expiresAtInvalid"));
      return;
    }

    const payload: { label?: string; maxUses: number; expiresAt?: string } = {
      maxUses: parsedMaxUses,
    };
    const trimmedLabel = label.trim();
    if (trimmedLabel) payload.label = trimmedLabel;
    if (expiresIso) payload.expiresAt = expiresIso;

    try {
      await createCode.mutateAsync(payload);
      toast.success(t("success"));
      handleClose(false);
    } catch (err) {
      toast.error(getErrorMessage(err, t("error")));
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="rounded-2xl bg-background p-6 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-code-label">{t("label")}</Label>
            <Input
              id="invite-code-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder={t("labelPlaceholder")}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-code-max-uses">{t("maxUses")}</Label>
            <Input
              id="invite-code-max-uses"
              type="number"
              min={MAX_USES_MIN}
              max={MAX_USES_MAX}
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="invite-code-expires-at">{t("expiresAt")}</Label>
            <Input
              id="invite-code-expires-at"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
            >
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={createCode.isPending}>
              {createCode.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
