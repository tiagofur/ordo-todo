"use client";

import { useState, useEffect, Suspense } from "react";
import { Link, useRouter } from "@/i18n/navigation";
import {
  CheckSquare,
  Mail,
  Lock,
  Github,
  ArrowRight,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@ordo-todo/auth-provider";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { API_CONFIG } from "@/config";
import { resolvePostLoginTarget } from "@/lib/post-login-target";
import { useTranslations } from "next-intl";
import { cn } from "@ordo-todo/ui";
import { AuthLocaleSwitcher } from "@/components/auth/auth-locale-switcher";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" className={className}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export default function SignInPage() {
  // useSearchParams() requires a Suspense boundary or the route fails to
  // prerender ("should be wrapped in a suspense boundary" at build time).
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const t = useTranslations("Auth.login");
  const { login, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Validated once: absolute API URL or null. Drives both the password
  // login (via redirectTo) and the social buttons (via OAuth state).
  const postLoginTarget = resolvePostLoginTarget(searchParams.get("next"));

  // Red de seguridad: el middleware ya redirige a /dashboard cuando ve la
  // cookie de sesión, pero si la sesión existe solo en el almacenamiento local
  // (p. ej. otra pestaña), no tiene sentido mostrar el formulario. Con un
  // `next` válido (flujo de conexión OAuth) la sesión existente debe
  // continuar hacia ese destino, no hacia el dashboard.
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;
    if (postLoginTarget) {
      window.location.href = postLoginTarget;
      return;
    }
    router.replace("/dashboard");
  }, [isAuthenticated, isAuthLoading, postLoginTarget, router]);

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  // OAuth failures redirect back here with ?error=… (see the backend
  // OAuthCallbackExceptionFilter): surface them as a toast once.
  useEffect(() => {
    const error = searchParams.get("error");
    if (!error) return;
    const key =
      error === "registration_invite_only"
        ? "errors.inviteOnly"
        : "errors.oauthFailed";
    toast.error(t(key));
    window.history.replaceState(null, "", window.location.pathname);
  }, [searchParams, t]);

  const handleFieldChange = (field: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email.trim()) {
      newErrors.email = t("errors.requiredFields");
    }

    if (!formData.password) {
      newErrors.password = t("errors.requiredFields");
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const redirectTo = resolvePostLoginTarget(searchParams.get("next"));
      await login(
        {
          email: formData.email,
          password: formData.password,
        },
        redirectTo ? { redirectTo } : undefined,
      );

      toast.success(t("success"));
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        t("errors.invalidCredentials");
      setErrors({ password: message });
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Social login leaves the SPA: `next` travels as a query param and the
  // backend platform guard carries it through the OAuth `state`, so the
  // callback can return to the post-login target too. Same validation
  // as resolvePostLoginTarget (only /api/... paths; host is ours).
  const socialUrl = (provider: "google" | "github") => {
    const base = `${API_CONFIG.baseURL}/auth/${provider}`;
    const next = searchParams.get("next");
    if (!next || !resolvePostLoginTarget(next)) return base;
    return `${base}?next=${encodeURIComponent(next)}`;
  };

  const handleGoogleSignIn = () => {
    try {
      window.location.href = socialUrl("google");
    } catch {
      toast.error(t("errors.googleFailed"));
    }
  };

  const handleGitHubSignIn = () => {
    try {
      window.location.href = socialUrl("github");
    } catch {
      toast.error(t("errors.githubFailed"));
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ad46ff] text-white shadow-lg shadow-[#ad46ff]/30">
            <CheckSquare className="h-8 w-8 stroke-[2.2]" />
          </div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {/* Main Form Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email Input */}
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
                  type="text"
                  autoComplete="username"
                  required
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={cn(
                    "h-11 w-full rounded-xl border bg-background pl-10 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.email
                      ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input text-foreground focus:border-primary focus:ring-primary/20",
                  )}
                  placeholder={t("emailPlaceholder")}
                />
              </div>
              {errors.email && (
                <p
                  id="email-error"
                  className="text-xs font-medium text-destructive mt-1"
                  role="alert"
                >
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-foreground"
                >
                  {t("passwordLabel")}
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-primary transition-colors hover:text-primary/80 hover:underline"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <div className="relative group">
                <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    handleFieldChange("password", e.target.value)
                  }
                  aria-invalid={!!errors.password}
                  aria-describedby={
                    errors.password ? "password-error" : undefined
                  }
                  className={cn(
                    "h-11 w-full rounded-xl border bg-background pl-10 pr-11 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2",
                    errors.password
                      ? "border-destructive text-destructive focus:border-destructive focus:ring-destructive/20"
                      : "border-input text-foreground focus:border-primary focus:ring-primary/20",
                  )}
                  placeholder={t("passwordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p
                  id="password-error"
                  className="text-xs font-medium text-destructive mt-1"
                  role="alert"
                >
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-input text-primary focus:ring-2 focus:ring-primary/20"
              />
              <label
                htmlFor="remember"
                className="text-sm font-medium text-muted-foreground cursor-pointer select-none"
              >
                {t("rememberMe")}
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 active:scale-[0.99] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    {t("submitButton")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              {t("orContinueWith")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/80 hover:border-foreground/20"
            >
              <GoogleIcon className="h-4 w-4" />
              {t("google")}
            </button>
            <button
              type="button"
              onClick={handleGitHubSignIn}
              className="flex items-center justify-center gap-2.5 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-muted/80 hover:border-foreground/20"
            >
              <Github className="h-4 w-4" />
              {t("github")}
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("noAccount")}{" "}
              <Link
                href="/register"
                className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline"
              >
                {t("signUpFree")}
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          {t("termsPrefix")}{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            {t("terms")}
          </Link>{" "}
          {t("termsAnd")}{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            {t("privacy")}
          </Link>
        </p>
        <div className="mt-4">
          <AuthLocaleSwitcher />
        </div>
      </motion.div>
    </div>
  );
}
