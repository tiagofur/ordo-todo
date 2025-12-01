"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckSquare, Mail, Lock, Github, Chrome, ArrowRight, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth-context";
import { motion } from "framer-motion";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({
        email: formData.email,
        password: formData.password,
      });

      toast.success("Sesión iniciada exitosamente");
      // Redirect is handled by auth context
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Email o contraseña incorrectos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-purple-500/5 to-cyan-500/5 p-4">
      {/* Decorative elements */}
      <div className="absolute left-10 top-20 h-32 w-32 rotate-12 rounded-3xl bg-purple-500/10 blur-3xl" />
      <div className="absolute right-20 top-40 h-40 w-40 -rotate-12 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute bottom-20 left-1/4 h-36 w-36 rotate-6 rounded-2xl bg-pink-500/10 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo and Header */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="group mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3"
          >
            <CheckSquare className="h-9 w-9 text-white" />
          </motion.div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-foreground">
            Bienvenido de nuevo
          </h1>
          <p className="text-sm text-muted-foreground">
            Inicia sesión para continuar con Ordo
          </p>
        </div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-border/50 bg-card p-8 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
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

            {/* Password Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-purple-500 transition-colors hover:text-purple-600 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500 transition-colors">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 w-full rounded-xl border border-input bg-background pl-11 pr-4 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  placeholder="Tu contraseña"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center space-x-2">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-input text-cyan-500 focus:ring-2 focus:ring-cyan-500/20 focus:ring-offset-2"
              />
              <label htmlFor="remember" className="text-sm font-medium text-muted-foreground">
                Recordarme
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full overflow-hidden rounded-xl bg-purple-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-[1.02] hover:bg-purple-600 hover:shadow-xl hover:shadow-purple-500/40 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50"
            >
              <span className="flex items-center justify-center gap-2">
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium text-muted-foreground">O continúa con</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Social Login Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-600"
            >
              <Chrome className="h-5 w-5" />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-all duration-200 hover:bg-purple-500/10 hover:border-purple-500/30 hover:text-purple-600"
            >
              <Github className="h-5 w-5" />
              GitHub
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              ¿No tienes una cuenta?{" "}
              <Link
                href="/register"
                className="inline-flex items-center gap-1 font-semibold text-purple-500 transition-colors hover:text-purple-600"
              >
                Regístrate gratis
                <Sparkles className="h-3 w-3" />
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Al continuar, aceptas nuestros{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Términos de Servicio
          </Link>{" "}
          y{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Política de Privacidad
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
