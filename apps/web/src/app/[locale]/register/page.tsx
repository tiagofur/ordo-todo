"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { UsernameInput } from "@ordo-todo/ui";
import { useUsernameValidation, generateUsernameSuggestions } from "@ordo-todo/hooks";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Real API client for username validation
  const { validationResult, validateUsername, resetValidation } = useUsernameValidation({
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
    if (!password) return { score: 0, label: "", color: "", textColor: "", checks: {} };

    // ... (rest of logic same as before)
    let score = 0;
    const checks = {
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

    if (score <= 2) return { score, label: "Débil", color: "bg-red-500", textColor: "text-red-600", checks };
    if (score <= 3) return { score, label: "Media", color: "bg-yellow-500", textColor: "text-yellow-600", checks };
    if (score <= 4) return { score, label: "Buena", color: "bg-cyan-500", textColor: "text-cyan-600", checks };
    return { score, label: "Excelente", color: "bg-green-500", textColor: "text-green-600", checks };
  }, [formData.password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate username
    if (!formData.username || formData.username.length < 3) {
      toast.error("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }

    // Check if username validation shows it's taken
    if (validationResult.isAvailable === false) {
      toast.error("El nombre de usuario ya está en uso. Por favor, elige otro.");
      return;
    }

    // Check if username validation is still loading
    if (validationResult.isLoading) {
      toast.error("Espera a que se valide el nombre de usuario");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Las contraseñas no coinciden");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (passwordStrength.score < 2) {
      toast.error("La contraseña es muy débil. Por favor, usa una contraseña más segura");
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });

      toast.success("Cuenta creada exitosamente");
      // Redirect is handled by auth context
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Error al crear cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordsMatch = formData.password && formData.confirmPassword &&
    formData.password === formData.confirmPassword;
  const passwordsMismatch = formData.password && formData.confirmPassword &&
    formData.password !== formData.confirmPassword;

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-cyan-500/5 to-pink-500/5 p-4 py-12">
      {/* Decorative elements */}
      <div className="absolute left-20 top-10 h-40 w-40 rotate-45 rounded-3xl bg-cyan-500/10 blur-3xl animate-pulse" />
      <div className="absolute right-10 top-32 h-36 w-36 -rotate-12 rounded-full bg-pink-500/10 blur-3xl animate-pulse delay-700" />
      <div className="absolute bottom-10 left-10 h-32 w-32 rotate-12 rounded-2xl bg-purple-500/10 blur-3xl animate-pulse delay-1000" />

      <div
        className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700"
      >
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <div
            className="group mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-500 shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3"
          >
            <CheckSquare className="h-9 w-9 text-white" />
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            Crear Cuenta
          </h1>
          <p className="text-sm text-muted-foreground">
            Comienza a organizar tus tareas hoy mismo
          </p>
        </div>

        {/* Main Form Card */}
        <div
          className="overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-foreground">
                Nombre Completo
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-pink-500 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  placeholder="Tu nombre completo"
                />
              </div>
            </div>

            {/* Username Input */}
            <UsernameInput
              value={formData.username}
              onChange={(value) => setFormData({ ...formData, username: value })}
              label="Nombre de Usuario"
              placeholder="usuario123"
              required={true}
              helperText="Este será tu identificador único en la plataforma"
              className="h-12"
              // Validation props
              isLoading={validationResult.isLoading}
              isValid={validationResult.isValid}
              isAvailable={validationResult.isAvailable}
              validationMessage={validationResult.message}
              // Suggestions props
              suggestions={suggestions}
              showSuggestions={true}
              onSuggestionClick={(suggestion) => {
                setFormData({ ...formData, username: suggestion });
                setSuggestions([]);
              }}
              onRefreshSuggestions={() => {
                const newSuggestions = generateUsernameSuggestions(formData.username);
                setSuggestions(newSuggestions);
              }}
            />

            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo Electrónico
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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password Input with Strength Indicator */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
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
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-11 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {formData.password && (
                <div
                  className="space-y-3 rounded-xl border border-border/50 bg-muted/30 p-4 animate-in fade-in slide-in-from-top-2 duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${passwordStrength.color}`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-semibold min-w-[70px] ${passwordStrength.textColor}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.length ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )}
                      <span className={passwordStrength.checks?.length ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        8+ caracteres
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.uppercase ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )}
                      <span className={passwordStrength.checks?.uppercase ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        Mayúsculas
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.number ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )}
                      <span className={passwordStrength.checks?.number ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        Números
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {passwordStrength.checks?.special ? (
                        <Check className="h-3.5 w-3.5 text-green-500" />
                      ) : (
                        <X className="h-3.5 w-3.5 text-muted-foreground/50" />
                      )}
                      <span className={passwordStrength.checks?.special ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                        Símbolos
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-foreground">
                Confirmar Contraseña
              </label>
              <div className="relative group">
                <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                  passwordsMatch ? "text-green-500" : passwordsMismatch ? "text-red-500" : "text-orange-500"
                }`}>
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={`h-12 w-full rounded-xl border bg-background pl-11 pr-20 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${
                    passwordsMatch
                      ? "border-green-500 focus:border-green-500 focus:ring-green-500/20"
                      : passwordsMismatch
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                      : "border-input focus:border-orange-500 focus:ring-orange-500/20"
                  }`}
                  placeholder="Repite tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-11 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {passwordsMatch && (
                  <Check className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-green-500" />
                )}
                {passwordsMismatch && (
                  <X className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-red-500" />
                )}
              </div>
              {passwordsMismatch && (
                <p
                  className="text-xs font-medium text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1"
                >
                  Las contraseñas no coinciden
                </p>
              )}
              {passwordsMatch && (
                <p
                  className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1"
                >
                  <Check className="h-3.5 w-3.5" /> Las contraseñas coinciden
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-cyan-600 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Creando cuenta...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">O regístrate con</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-pink-500/10 hover:border-pink-500/30 hover:text-pink-600"
            >
              <Chrome className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600"
            >
              <Github className="h-5 w-5" />
              GitHub
            </button>
          </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-cyan-500 transition-colors hover:text-cyan-600"
              >
                Inicia sesión
                <ArrowRight className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al crear una cuenta, aceptas nuestros{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Política de Privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
