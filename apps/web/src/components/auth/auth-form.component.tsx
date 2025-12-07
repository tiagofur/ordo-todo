"use client";

import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Logo from "../template/logo.component";
import ThemeToggle from "../template/theme-toggle.component";
import { AuthForm as AuthFormUI } from "@ordo-todo/ui";
import { useTranslations } from "next-intl";

export default function AuthForm() {
  const t = useTranslations("AuthForm");
  const router = useRouter();

  useEffect(() => {
    // Check if user is already authenticated
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("Google sign in error:", error);
    }
  };

  const handleGitHubSignIn = async () => {
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error("GitHub sign in error:", error);
    }
  };

  return (
    <AuthFormUI
      onGoogleSignIn={handleGoogleSignIn}
      onGitHubSignIn={handleGitHubSignIn}
      onEmailLoginClick={() => router.push("/login")}
      onRegisterClick={() => router.push("/register")}
      renderLogo={() => <Logo big />}
      renderThemeToggle={() => <ThemeToggle />}
      labels={{
        welcome: t("welcome"),
        subtitle: t("subtitle"),
        emailLogin: t("emailLogin"),
        or: t("or"),
        googleLogin: t("googleLogin"),
        githubLogin: t("githubLogin"),
        noAccount: t("noAccount"),
        register: t("register"),
        connecting: t("connecting"),
      }}
    />
  );
}
