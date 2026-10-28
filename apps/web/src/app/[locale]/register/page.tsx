"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import {
  CheckSquare,
  Mail,
  Lock,
  User,
  AtSign,
  Github,
  Chrome,
  ArrowRight,
  Check,
  X,
  Eye,
  EyeOff,
  Sparkles,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { useAuth } from "@ordo-todo/auth-provider";
import { UsernameInput } from "@ordo-todo/ui";
import {
  useUsernameValidation,
  generateUsernameSuggestions,
} from "@ordo-todo/hooks";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { API_CONFIG } from "@/config";
import {
  inviteCodeMissing,
  resolveRegisterErrorMessage,
} from "@/lib/registration-invite";
import { useRegistrationMode } from "@/hooks/use-registration-mode";
import { resolvePostLoginTarget } from "@/lib/post-login-target";
import { resolveValidationMessage } from "@/lib/username-message";
import { AuthLocaleSwitcher } from "@/components/auth/auth-locale-switcher";

// Define interface for password checks
interface PasswordChecks {
  length: boolean;
  lowercase: boolean;
  uppercase: boolean;
  number: boolean;
  special: boolean;
}

export default function SignUpPage() {
  // useSearchParams() requires a Suspense boundary or the route fails to
  // prerender at build time.
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postLoginTarget = resolvePostLoginTarget(searchParams.get("next"));
  const { register, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  // Red de seguridad: si ya hay sesión (p. ej. desde otra pestaña u otro
  // despliegue), no tiene sentido mostrar el formulario.
  useEffect(() => {
    if (!isAuthLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isAuthLoading, router]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations("Auth.register");
  const tInvite = useTranslations("RegisterInvite");
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    inviteCode: "",
  });

  // ODD 019: fail closed — until proven open, the form asks for a code.
  const registrationMode = useRegistrationMode(apiClient);

  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Real API client for username validation
  const { validationResult, validateUsername, resetValidation } =
    useUsernameValidation({
      apiClient: apiClient as any, // Hook uses fetch internally, type mismatch
      minLength: 3,
      maxLength: 20,
      debounceMs: 500,
    });

  // Validate username when value changes
  useEffect(() => {
    if (formData.username && formData.username.length >= 3) {
      validateUsername(formData.username);
    } else {
      resetValidation();
      setSuggestions([]);
    }
  }, [formData.username, validateUsername, resetValidation]);

  // Generate suggestions when username is taken
  useEffect(() => {
    if (validationResult.isAvailable === false) {
      const newSuggestions = generateUsernameSuggestions(formData.username);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [validationResult.isAvailable, formData.username]);

  // Password strength calculation
  const passwordStrength = useMemo(() => {
    const password = formData.password;
    if (!password)
      return {
        score: 0,
        label: "",
        color: "",
        textColor: "",
        checks: {
          length: false,
          lowercase: false,
          uppercase: false,
          number: false,
          special: false,
        } as PasswordChecks,
      };

    let score = 0;
    const checks: PasswordChecks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^a-zA-Z0-9]/.test(password),
    };

    score += checks.length ? 1 : 0;
    score += checks.lowercase ? 1 : 0;
    score += checks.uppercase ? 1 : 0;
    score += checks.number ? 1 : 0;
    score += checks.special ? 1 : 0;

    if (score <= 2)
      return {
        score,
        label: t("strengthWeak"),
        color: "bg-red-500",
        textColor: "text-red-600",
        checks,
      };
    if (score <= 3)
      return {
        score,
        label: t("strengthFair"),
        color: "bg-yellow-500",
        textColor: "text-yellow-600",
        checks,
      };
    if (score <= 4)
      return {
        score,
        label: t("strengthGood"),
        color: "bg-cyan-500",
        textColor: "text-cyan-600",
        checks,
      };
    return {
      score,
      label: t("strengthExcellent"),
      color: "bg-green-500",
      textColor: "text-green-600",
      checks,
    };
  }, [formData.password, t]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!formData.username || formData.username.length < 3) {
      toast.error(t("usernameMinLength", { min: 3 }));
      return;
    }

    // Check if username validation shows it's taken
    if (validationResult.isAvailable === false) {
      toast.error(t("usernameTaken"));
      return;
    }

    // Check if username validation is still loading
    if (validationResult.isLoading) {
      toast.error(t("usernameWaitValidation"));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error(t("errors.passwordMismatch"));
      return;
    }

    if (formData.password.length < 8) {
      toast.error(t("errors.passwordMinLength"));
      return;
    }

    if (passwordStrength.score < 2) {
      toast.error(t("errors.passwordTooWeak"));
      return;
    }

    const inviteOnly = registrationMode !== "open";
    if (inviteCodeMissing(registrationMode, formData.inviteCode)) {
      toast.error(tInvite("errorRequired"));
      return;
    }

    setIsLoading(true);

    try {
      await register(
        {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
          ...(inviteOnly ? { inviteCode: formData.inviteCode.trim() } : {}),
        },
        postLoginTarget ? { redirectTo: postLoginTarget } : undefined,
      );

      toast.success(t("success"));
      // Redirect is handled by auth context
    } catch (error: unknown) {
      // ODD 019: machine-readable invite codes → precise messages.
      toast.error(
        resolveRegisterErrorMessage(error, tInvite, t("errors.createFailed")),
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Same social flow as login: `next` travels as a query param and the
  // backend platform guard carries it through the OAuth `state`.
  const socialUrl = (provider: "google" | "github") => {
    const base = `${API_CONFIG.baseURL}/auth/${provider}`;
    const next = searchParams.get("next");
    if (!next || !resolvePostLoginTarget(next)) return base;
    return `${base}?next=${encodeURIComponent(next)}`;
  };

  const handleSocialSignUp = (provider: "google" | "github") => {
    try {
      window.location.href = socialUrl(provider);
    } catch {
      toast.error(t("errors.createFailed"));
    }
  };

  const passwordsMatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch =
    formData.password &&
    formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 py-12">
      {/* Decorative elements */}
      <div className="absolute left-20 top-10 h-40 w-40 rotate-45 rounded-3xl bg-cyan-100 dark:bg-cyan-900 blur-3xl animate-pulse" />
      <div className="absolute right-10 top-32 h-36 w-36 -rotate-12 rounded-full bg-pink-100 dark:bg-pink-900 blur-3xl animate-pulse delay-700" />
      <div className="absolute bottom-10 left-10 h-32 w-32 rotate-12 rounded-2xl bg-purple-100 dark:bg-purple-900 blur-3xl animate-pulse delay-1000" />

      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div className="group mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#ad46ff] shadow-lg shadow-[#ad46ff]/30 transition-all duration-300 hover:scale-105">
            <CheckSquare className="h-9 w-9 text-white stroke-[2.2]" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        {/* Main Form Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Invite Code Input (ODD 019 — hidden while registration is open) */}
            {registrationMode !== "open" && (
              <div className="space-y-2">
                <label
                  htmlFor="inviteCode"
                  className="text-sm font-medium text-foreground"
                >
                  {tInvite("label")}
                </label>
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-500 transition-colors">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <input
                    id="inviteCode"
                    type="text"
                    required
                    value={formData.inviteCode}
                    onChange={(e) =>
                      setFormData({ ...formData, inviteCode: e.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm uppercase transition-all duration-200 placeholder:normal-case placeholder:text-muted-foreground focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    placeholder={tInvite("placeholder")}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{tInvite("helper")}</p>
              </div>
            )}

            {/* Name Input */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-foreground"
              >
                {t("nameLabel")}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-500 transition-colors">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  placeholder={t("namePlaceholder")}
                />
              </div>
            </div>

            {/* Username Input */}
            <UsernameInput
              value={formData.username}
              onChange={(value) =>
                setFormData({ ...formData, username: value })
              }
              label={t("usernameLabel")}
              placeholder={t("usernamePlaceholder")}
              required={true}
              helperText={t("usernameHelper")}
              className="h-12"
              // Validation props
              isLoading={validationResult.isLoading}
              isValid={validationResult.isValid}
              isAvailable={validationResult.isAvailable}
              validationMessage={resolveValidationMessage(
                validationResult.message,
                t,
              )}
              // Suggestions props
              suggestions={suggestions}
              showSuggestions={true}
              onSuggestionClick={(suggestion) => {
                setFormData({ ...formData, username: suggestion });
                setSuggestions([]);
              }}
              onRefreshSuggestions={() => {
                const newSuggestions = generateUsernameSuggestions(
                  formData.username,
                );
                setSuggestions(newSuggestions);
              }}
              strings={{
                minLength: t("usernameMinLength", { min: 3 }),
                suggestionsTitle: t("usernameSuggestions"),
                refresh: t("usernameRefresh"),
                requirementsTitle: t("usernameRequirements"),
                ruleLength: t("usernameRuleLength", { min: 3, max: 20 }),
                ruleChars: t("usernameRuleChars"),
                ruleStart: t("usernameRuleStart"),
                ruleConsecutive: t("usernameRuleConsecutive"),
              }}
            />

            {/* Email Input */}
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                {t("emailLabel")}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 transition-colors">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  placeholder={t("emailPlaceholder")}
                />
              </div>
            </div>

            {/* Password Input with Strength Indicator */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                {t("passwordLabel")}
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div className="space-y-3 rounded-xl border border-border bg-muted p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{
                          width: `${(passwordStrength.score / 5) * 100}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold min-w-[70px] ${passwordStrength.textColor}`}
                    >
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.length ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          passwordStrength.checks?.length
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {t("strengthMinChars")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.uppercase ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          passwordStrength.checks?.uppercase
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {t("strengthUppercase")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.number ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          passwordStrength.checks?.number
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {t("strengthNumbers")}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.special ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                      <span
                        className={
                          passwordStrength.checks?.special
                            ? "text-green-600 dark:text-green-400"
                            : "text-muted-foreground"
                        }
                      >
                        {t("strengthSymbols")}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-foreground"
              >
                {t("confirmPasswordLabel")}
              </label>
              <div className="relative group">
                <div
                  className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                    passwordsMatch
                      ? "text-green-500"
                      : passwordsMismatch
                        ? "text-red-500"
                        : "text-orange-500"
                  }`}
                >
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className={`h-12 w-full rounded-xl border bg-background pl-11 pr-20 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    passwordsMatch
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500"
                      : passwordsMismatch
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-input focus:border-orange-500 focus:ring-orange-500"
                  }`}
                  placeholder={t("confirmPasswordPlaceholder")}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? t("hidePassword") : t("showPassword")
                  }
                  className="absolute right-11 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
                {passwordsMatch && (
                  <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                )}
                {passwordsMismatch && (
                  <X className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {passwordsMismatch && (
                <p className="text-xs font-medium text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1">
                  {t("passwordsMismatch")}
                </p>
              )}
              {passwordsMatch && (
                <p className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
                  <Check className="h-3.5 w-3.5" /> {t("passwordsMatch")}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:bg-cyan-600 hover:shadow-xl active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t("submitting")}
                  </>
                ) : (
                  <>
                    {t("submitButton")}
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">
              {t("orSignUpWith")}
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSocialSignUp("google")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-pink-100 dark:hover:bg-pink-900 hover:border-pink-300 dark:hover:border-pink-700 hover:text-pink-600"
            >
              <Chrome className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialSignUp("github")}
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-cyan-100 dark:hover:bg-cyan-900 hover:border-cyan-300 dark:hover:border-cyan-700 hover:text-cyan-600"
            >
              <Github className="h-5 w-5" />
              GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t("haveAccount")}{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-cyan-500 transition-colors hover:text-cyan-600"
              >
                {t("signIn")}
                <ArrowRight className="h-3 w-3" />
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
      </div>
    </div>
  );
}
