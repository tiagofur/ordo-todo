'use client';

import { type ReactNode } from 'react';
import { cn } from '../../utils/index.js';
import { Button } from '../ui/button.js';
import { Mail, Github } from 'lucide-react';

interface AuthFormProps {
  /** Logo component to render */
  renderLogo?: () => ReactNode;
  /** Theme toggle component */
  renderThemeToggle?: () => ReactNode;
  isLoading?: boolean;
  onGoogleSignIn?: () => void;
  onGitHubSignIn?: () => void;
  onEmailLoginClick?: () => void;
  onRegisterClick?: () => void;
  labels?: {
    welcome?: string;
    subtitle?: string;
    emailLogin?: string;
    or?: string;
    googleLogin?: string;
    githubLogin?: string;
    noAccount?: string;
    register?: string;
    connecting?: string;
  };
}

const DEFAULT_LABELS = {
  welcome: 'Welcome',
  subtitle: 'Sign in to continue to your account',
  emailLogin: 'Continue with Email',
  or: 'or',
  googleLogin: 'Continue with Google',
  githubLogin: 'Continue with GitHub',
  noAccount: "Don't have an account?",
  register: 'Sign up',
  connecting: 'Connecting...',
};

// Google logo SVG component (brand colors are intentional)
function GoogleLogo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

export function AuthForm({
  renderLogo,
  renderThemeToggle,
  isLoading = false,
  onGoogleSignIn,
  onGitHubSignIn,
  onEmailLoginClick,
  onRegisterClick,
  labels = {},
}: AuthFormProps) {
  const t = { ...DEFAULT_LABELS, ...labels };

  return (
    <div className="flex justify-center items-center h-screen bg-background relative">
      {/* Theme Toggle */}
      {renderThemeToggle && (
        <div className="absolute top-6 right-6">{renderThemeToggle()}</div>
      )}

      <div
        className={cn(
          'flex flex-col justify-center items-center',
          'bg-card text-card-foreground w-96 rounded-xl p-8 shadow-lg border border-border'
        )}
      >
        {renderLogo?.()}
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-xl font-semibold text-foreground">
            {t.welcome}
          </h1>
          <p className="text-sm text-muted-foreground text-center">
            {t.subtitle}
          </p>
        </div>

        <div className="flex flex-col gap-3 w-80">
          {/* Login with Email/Password */}
          <Button
            onClick={onEmailLoginClick}
            className="w-full py-6"
            size="lg"
          >
            <Mail className="w-5 h-5 mr-2" />
            {t.emailLogin}
          </Button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-2">
            <div className="flex-1 border-t border-border" />
            <span className="text-sm text-muted-foreground">
              {t.or}
            </span>
            <div className="flex-1 border-t border-border" />
          </div>

          {/* Google Sign In */}
          <Button
            onClick={onGoogleSignIn}
            disabled={isLoading}
            variant="outline"
            className="w-full py-6"
            size="lg"
          >
            <GoogleLogo />
            <span className="ml-2">{t.googleLogin}</span>
          </Button>

          {/* GitHub Sign In */}
          <Button
            onClick={onGitHubSignIn}
            disabled={isLoading}
            variant="secondary"
            className="w-full py-6"
            size="lg"
          >
            <Github className="w-5 h-5 mr-2" />
            {t.githubLogin}
          </Button>
        </div>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm">
          <span className="text-muted-foreground">{t.noAccount} </span>
          <Button
            onClick={onRegisterClick}
            variant="link"
            className="p-0 h-auto font-medium"
          >
            {t.register}
          </Button>
        </div>

        {isLoading && (
          <div className="mt-4 text-sm text-muted-foreground">
            {t.connecting}
          </div>
        )}
      </div>
    </div>
  );
}
