"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@ordo-todo/auth-provider";
import { Button } from "@ordo-todo/ui";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  CheckSquare,
  Eye,
  FolderKanban,
  KeyRound,
  Link2,
  Loader2,
  Pencil,
  ShieldCheck,
  Webhook,
  type LucideIcon,
} from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { API_CONFIG } from "@/config";
import { apiClient } from "@/lib/api-client";

/**
 * Authorize-request params the API hop forwards here and this screen
 * posts back verbatim with the decision. Mirrors
 * AUTHORIZE_FORWARD_PARAMS in the backend OAuth controller.
 */
const AUTHORIZE_PARAMS = [
  "client_id",
  "redirect_uri",
  "scope",
  "state",
  "code_challenge",
  "code_challenge_method",
] as const;

type AuthorizeParam = (typeof AUTHORIZE_PARAMS)[number];

interface AuthorizeRequest {
  params: Record<AuthorizeParam, string>;
  /** Encoded query carrying only the forwarded params. */
  query: string;
}

function readAuthorizeRequest(
  searchParams: URLSearchParams,
): AuthorizeRequest | null {
  const params = {} as Record<AuthorizeParam, string>;
  const query = new URLSearchParams();
  for (const key of AUTHORIZE_PARAMS) {
    const value = searchParams.get(key) ?? "";
    params[key] = value;
    if (value) query.set(key, value);
  }
  if (!params.client_id || !params.redirect_uri || !params.code_challenge) {
    return null;
  }
  return { params, query: query.toString() };
}

const SCOPE_META: Record<string, { key: string; Icon: LucideIcon }> = {
  read: { key: "read", Icon: Eye },
  "tasks:write": { key: "tasksWrite", Icon: Pencil },
  "projects:write": { key: "projectsWrite", Icon: FolderKanban },
  "admin:webhooks": { key: "adminWebhooks", Icon: Webhook },
};

type Decision = "approve" | "deny";

export default function ConnectAuthorizePage() {
  // useSearchParams() requires a Suspense boundary or the route fails to
  // prerender ("should be wrapped in a suspense boundary" at build time).
  return (
    <Suspense>
      <ConnectAuthorize />
    </Suspense>
  );
}

function ConnectAuthorize() {
  const t = useTranslations("Connect.authorize");
  const tScopes = useTranslations("Connect.scopes");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [submitting, setSubmitting] = useState<Decision | null>(null);

  const request = useMemo(
    () => readAuthorizeRequest(searchParams),
    [searchParams],
  );
  const invalid = !request || searchParams.has("ordo_error");

  // Login-hop target: the API authorize path, the contract the login
  // page's resolvePostLoginTarget accepts (`/api/...`). Null when the
  // configured API base has no `/api` path — a broken deploy we surface
  // as the error state instead of stranding the tab after login.
  const loginNext = useMemo(() => {
    if (!request) return null;
    let apiPath: string;
    try {
      apiPath = new URL(API_CONFIG.baseURL).pathname.replace(/\/$/, "");
    } catch {
      return null;
    }
    if (!apiPath.startsWith("/api")) return null;
    return `${apiPath}/oauth/authorize?${request.query}`;
  }, [request]);

  // No session: run the login hop; after signing in the browser
  // re-enters the authorize endpoint, which sends it back here with a
  // session.
  useEffect(() => {
    if (invalid || !loginNext || isAuthLoading || isAuthenticated) return;
    router.replace(`/login?next=${encodeURIComponent(loginNext)}`);
  }, [invalid, loginNext, isAuthLoading, isAuthenticated, router]);

  const clientInfo = useQuery({
    queryKey: [
      "oauth-client-info",
      request?.params.client_id,
      request?.params.scope,
    ],
    queryFn: () =>
      apiClient.getOAuthClientInfo(
        request?.params.client_id ?? "",
        request?.params.scope || undefined,
      ),
    enabled: !invalid && isAuthenticated,
    retry: false,
    staleTime: 60_000,
  });

  if (invalid || !loginNext) {
    return (
      <ConnectShell>
        <ErrorState title={t("error.title")} body={t("error.body")} cta={t("error.openApp")} />
      </ConnectShell>
    );
  }

  if (isAuthLoading || !isAuthenticated || !user) {
    return (
      <ConnectShell>
        <PendingState
          label={isAuthLoading ? t("checkingSession") : t("redirectingToLogin")}
        />
      </ConnectShell>
    );
  }

  if (clientInfo.isPending) {
    return (
      <ConnectShell>
        <PendingState label={t("loadingApp")} />
      </ConnectShell>
    );
  }

  if (clientInfo.isError || clientInfo.data.grantedScopes === null) {
    return (
      <ConnectShell>
        <ErrorState title={t("error.title")} body={t("error.body")} cta={t("error.openApp")} />
      </ConnectShell>
    );
  }

  const appName = clientInfo.data.clientName.trim() || t("fallbackApp");
  const scopes = clientInfo.data.grantedScopes;
  const accountLabel = user.email || user.name || "";
  const initial = (user.name || user.email || "?").trim().charAt(0).toUpperCase();

  // The form posts top-level so the tab itself follows the API's 302
  // back to the requesting app (or its access_denied on cancel).
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const decision =
      submitter instanceof HTMLButtonElement && submitter.value === "deny"
        ? "deny"
        : "approve";
    setSubmitting(decision);
  };

  return (
    <ConnectShell>
      <form
        method="POST"
        action={`${API_CONFIG.baseURL}/oauth/authorize`}
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-8 shadow-sm"
      >
        {AUTHORIZE_PARAMS.map((key) =>
          request.params[key] ? (
            <input
              key={key}
              type="hidden"
              name={key}
              value={request.params[key]}
            />
          ) : null,
        )}

        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#ad46ff] text-white shadow-lg shadow-[#ad46ff]/30">
            <CheckSquare className="h-6 w-6 stroke-[2.2]" />
          </div>
          <Link2 className="h-5 w-5 text-muted-foreground" aria-hidden />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-muted text-foreground">
            <Bot className="h-6 w-6" />
          </div>
        </div>

        <h1 className="text-center text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {t("title", { app: appName })}
        </h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {t("subtitle")}
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-xl border border-border bg-muted/50 p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ad46ff]/15 text-sm font-semibold text-[#ad46ff]">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{t("signedInAs")}</p>
            <p className="truncate text-sm font-medium text-foreground">
              {accountLabel}
            </p>
          </div>
        </div>

        <p className="mt-6 text-sm font-medium text-foreground">
          {t("permissionsTitle", { app: appName })}
        </p>
        <ul className="mt-3 space-y-2">
          {scopes.map((scope) => {
            const meta = SCOPE_META[scope];
            const Icon = meta?.Icon ?? KeyRound;
            return (
              <li
                key={scope}
                className="flex items-start gap-3 rounded-xl border border-border p-3"
              >
                <div className="mt-0.5 rounded-lg bg-[#ad46ff]/10 p-1.5 text-[#ad46ff]">
                  <Icon className="h-4 w-4" />
                </div>
                <span className="text-sm text-foreground">
                  {meta ? tScopes(meta.key) : tScopes("unknown", { scope })}
                </span>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 flex items-start gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>{t("revokeHint")}</span>
        </p>

        {/* Approve is first in DOM order so Enter submits it; the visual
            order (Cancel left, Approve right) comes from `order-*`. */}
        <div className="mt-6 flex gap-3">
          <Button
            type="submit"
            name="decision"
            value="approve"
            className="order-2 flex-1"
            disabled={submitting !== null}
            aria-busy={submitting === "approve"}
          >
            {submitting === "approve" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("approve")}
          </Button>
          <Button
            type="submit"
            name="decision"
            value="deny"
            variant="outline"
            className="order-1 flex-1"
            disabled={submitting !== null}
            aria-busy={submitting === "deny"}
          >
            {submitting === "deny" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {t("deny")}
          </Button>
        </div>
      </form>
    </ConnectShell>
  );
}

function ConnectShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {children}
      </motion.div>
    </div>
  );
}

function PendingState({ label }: { label: string }) {
  return (
    <div
      className="flex items-center justify-center gap-3 rounded-2xl border border-border bg-card p-8 shadow-sm"
      role="status"
    >
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function ErrorState({
  title,
  body,
  cta,
}: {
  title: string;
  body: string;
  cta: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold tracking-tight text-foreground">
        {title}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
      <Button asChild variant="outline" className="mt-6">
        <Link href="/dashboard">{cta}</Link>
      </Button>
    </div>
  );
}
