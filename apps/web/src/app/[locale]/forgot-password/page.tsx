"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import {
  CheckSquare,
  Mail,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@ordo-todo/ui";
import { apiClient } from "@/lib/api-client";
import { toast } from "sonner";
import { AuthLocaleSwitcher } from "@/components/auth/auth-locale-switcher";

export default function ForgotPasswordPage() {
  const t = useTranslations("Auth.forgotPassword");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError(t("errors.requiredEmail"));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.forgotPassword(trimmedEmail);
      setIsSubmitted(true);
      toast.success(t("successTitle"));
    } catch {
      // Even if network fails, don't leak user state; surface polite message
      setError(t("errors.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-[420px] space-y-6"
      >
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <CheckSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">
            Ordo
          </span>
          <h1 className="mt-4 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {isSubmitted ? t("successTitle") : t("title")}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm">
            {isSubmitted
              ? t("successSubtitle", { email })
              : t("subtitle")}
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          {isSubmitted ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("successSubtitle", { email })}
              </p>
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail("");
                  }}
                  className="w-full text-xs font-medium text-primary hover:underline transition-colors"
                >
                  {t("tryAnotherEmail")}
                </button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t("backToLogin")}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {error && (
                <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  {t("emailLabel")}
                </label>
                <div className="relative group">
                  <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (error) setError(null);
                    }}
                    className={cn(
                      "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                      error
                        ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                        : "border-input text-foreground focus:border-primary focus:ring-primary/20"
                    )}
                    placeholder={t("emailPlaceholder")}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/25 transition-all duration-200 hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submitButton")}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("backToLogin")}
                </Link>
              </div>
              <div className="pt-2">
                <AuthLocaleSwitcher />
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
