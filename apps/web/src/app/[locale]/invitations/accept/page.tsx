"use client";

import { useEffect, useState } from "react";
import { Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@ordo-todo/ui";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import { useAcceptInvitation } from "@/lib/api-hooks";

export default function AcceptInvitationPage() {
  const t = useTranslations("AcceptInvitationPage");
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  
  const acceptInvitationMutation = useAcceptInvitation();
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setErrorMessage(t("missingToken"));
    }
  }, [token, t]);

  const handleAccept = async () => {
    if (!token) return;

    setStatus("processing");
    try {
      await acceptInvitationMutation.mutateAsync({ token });
      setStatus("success");
      // Redirect after a delay
      setTimeout(() => {
        router.push("/workspaces");
      }, 2000);
    } catch (error: any) {
      setStatus("error");
      setErrorMessage(error?.message || t("error"));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-6">
          {status === "idle" && (
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">{t("confirmText")}</p>
            </div>
          )}

          {status === "processing" && (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">{t("processing")}</p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center gap-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="font-medium text-green-600">{t("success")}</p>
              <p className="text-sm text-muted-foreground">{t("redirecting")}</p>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center gap-4">
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="font-medium text-red-600">{t("failed")}</p>
              <p className="text-sm text-muted-foreground text-center">{errorMessage}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {status === "idle" && (
            <Button onClick={handleAccept} size="lg" className="w-full">
              {t("acceptButton")}
            </Button>
          )}
          
          {status === "success" && (
            <Button onClick={() => router.push("/workspaces")} variant="outline" className="w-full">
              {t("goToWorkspaces")} <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}

          {status === "error" && (
            <Button onClick={() => router.push("/")} variant="outline" className="w-full">
              {t("backHome")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
