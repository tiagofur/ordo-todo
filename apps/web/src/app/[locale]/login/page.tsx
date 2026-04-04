"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@ordo-todo/auth-provider";
import { motion } from "framer-motion";
import { AuthForm } from "@ordo-todo/ui";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = () => {
    // Navigate to email/password form
    toast.info("Complete el login form below");
  };

  const handleGoogleSignIn = async () => {
    try {
      window.location.href = "/api/v1/auth/google";
    } catch (error) {
      toast.error("Failed to sign in with Google");
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      window.location.href = "/api/v1/auth/github";
    } catch (error) {
      toast.error("Failed to sign in with GitHub");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <AuthForm
          renderLogo={() => (
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="group mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500 shadow-lg shadow-purple-500/30 transition-all duration-300 hover:scale-110 hover:rotate-3"
            >
              <CheckSquare className="h-9 w-9 text-white" />
            </motion.div>
          )}
          isLoading={isLoading}
          onEmailLoginClick={handleEmailLogin}
          onGoogleSignIn={handleGoogleSignIn}
          onGitHubSignIn={handleGitHubSignIn}
          onRegisterClick={() => router.push("/register")}
          labels={{
            welcome: "Bienvenido de nuevo",
            subtitle: "Inicia sesión para continuar con Ordo",
            emailLogin: "Continue with Email",
            or: "o continúa con",
            googleLogin: "Google",
            githubLogin: "GitHub",
            noAccount: "¿No tienes una cuenta?",
            register: "Regístrate gratis",
            connecting: "Conectando...",
          }}
        />

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
