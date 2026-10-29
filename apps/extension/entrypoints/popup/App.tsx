import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { browser } from 'wxt/browser';
import {
  CreateTaskDialog,
  type CreateTaskDialogLabels,
  type CreateTaskFormData,
  type ProjectOption,
} from '@ordo-todo/ui';
import { serializeCalendarDateForApi } from '@ordo-todo/core';
import { apiClient } from '../../src/lib/api-client';
import { getSession, logout, startLogin } from '../../src/lib/auth';
import {
  buildPrefill,
  getActivePageContext,
  type PageContext,
} from '../../src/lib/capture';

type State =
  | { status: 'loading' }
  | { status: 'anon'; error?: string }
  | { status: 'authed'; email: string };

export default function App() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    getSession()
      .then((session) =>
        setState(
          session ? { status: 'authed', email: session.email } : { status: 'anon' },
        ),
      )
      .catch(() => setState({ status: 'anon' }));
  }, []);

  const handleLogin = async () => {
    setState({ status: 'loading' });
    try {
      const session = await startLogin();
      setState({ status: 'authed', email: session.email });
    } catch {
      setState({ status: 'anon', error: t('Extension.authError') });
    }
  };

  const handleLogout = async () => {
    await logout();
    setState({ status: 'anon' });
  };

  return (
    <main className="popup-root w-[380px]">
      <h1 className="px-4 pt-3 text-sm font-semibold">
        {t('Extension.popupTitle')}
      </h1>
      {state.status === 'loading' && (
        <p role="status" className="px-4 py-6 text-sm text-muted-foreground">
          {t('Extension.authLoading')}
        </p>
      )}
      {state.status === 'anon' && (
        <div className="flex flex-col gap-3 px-4 py-6">
          {state.error && (
            <p role="alert" className="text-sm text-red-600">
              {state.error}
            </p>
          )}
          <button
            type="button"
            onClick={handleLogin}
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            {t('Extension.login')}
          </button>
        </div>
      )}
      {state.status === 'authed' && (
        <div className="flex items-center justify-between px-4 py-2">
          <p role="status" className="truncate text-xs text-muted-foreground">
            {t('Extension.connectedAs', { email: state.email })}
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs text-muted-foreground hover:underline"
            >
              {t('Extension.logout')}
            </button>
          </div>
        </div>
      )}
      {state.status === 'authed' && <CaptureView />}
    </main>
  );
}

function CaptureView() {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [prefill, setPrefill] = useState<{
    initialTitle: string;
    initialDescription: string;
  } | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [created, setCreated] = useState(false);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Contexto de página y proyectos en paralelo; el diálogo se monta cuando
    // el contexto existe para que los valores iniciales caigan en el form.
    let cancelled = false;
    getActivePageContext()
      .then((ctx: PageContext | null) => {
        if (!cancelled && ctx) setPrefill(buildPrefill(ctx));
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setPrefill((prev) => prev ?? { initialTitle: '', initialDescription: '' });
      });
    (async () => {
      try {
        const workspaces = await apiClient.getWorkspaces();
        if (workspaces[0]) {
          const list = await apiClient.getProjects(workspaces[0].id);
          if (!cancelled) {
            setProjects(
              list.map((p) => ({ id: p.id, name: p.name, color: p.color })),
            );
          }
        }
      } catch {
        // Sin proyectos accesibles: la captura express (sin proyecto) sigue.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const labels: CreateTaskDialogLabels = useMemo(
    () => ({
      title: t('CreateTask.title'),
      description: t('CreateTask.description'),
      formTitle: t('CreateTask.formTitle'),
      formTitlePlaceholder: t('CreateTask.formTitlePlaceholder'),
      formProject: t('CreateTask.formProject'),
      formNoProject: t('CreateTask.formNoProject'),
      formDescription: t('CreateTask.formDescription'),
      formDescriptionPlaceholder: t('CreateTask.formDescriptionPlaceholder'),
      formPriority: t('CreateTask.formPriority'),
      formEstimatedMinutes: t('CreateTask.formEstimatedMinutes'),
      formDueDate: t('CreateTask.formDueDate'),
      cancel: t('CreateTask.cancel'),
      create: t('CreateTask.create'),
      creating: t('CreateTask.creating'),
      priorities: {
        low: t('CreateTask.priorities.low'),
        medium: t('CreateTask.priorities.medium'),
        high: t('CreateTask.priorities.high'),
        urgent: t('CreateTask.priorities.urgent'),
      },
      validation: {
        titleRequired: t('CreateTask.validation.titleRequired'),
      },
    }),
    [t],
  );

  const onSubmit = async (data: CreateTaskFormData) => {
    setIsPending(true);
    setFormError(null);
    try {
      await apiClient.createTask({
        title: data.title,
        description: data.description || undefined,
        priority: data.priority,
        dueDate: data.dueDate
          ? (serializeCalendarDateForApi(data.dueDate) as unknown as string)
          : undefined,
        // Sin proyecto = tarea express (ODD 021): projectId null.
        projectId: data.projectId || null,
        estimatedMinutes: data.estimatedMinutes ?? undefined,
      } as never);
      setCreated(true);
      setOpen(false);
    } catch {
      setFormError(t('Extension.captureError'));
    } finally {
      setIsPending(false);
    }
  };

  if (created) {
    return (
      <div className="flex flex-col items-center gap-3 px-4 py-8">
        <p role="status" className="text-sm font-medium">
          {t('Extension.created')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => browser.tabs.create({ url: 'https://ordotodo.app' })}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground"
          >
            {t('Extension.openOrdo')}
          </button>
          <button
            type="button"
            onClick={() => {
              setCreated(false);
              setFormError(null);
              setPrefill(null);
              setOpen(true);
            }}
            className="rounded-md border px-3 py-1.5 text-sm"
          >
            {t('Extension.newCapture')}
          </button>
        </div>
      </div>
    );
  }

  if (!prefill) {
    return (
      <p role="status" className="px-4 py-6 text-sm text-muted-foreground">
        {t('Extension.authLoading')}
      </p>
    );
  }

  return (
    <CreateTaskDialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) window.close();
      }}
      projects={projects}
      initialTitle={prefill.initialTitle}
      initialDescription={prefill.initialDescription}
      onSubmit={onSubmit}
      isPending={isPending}
      formError={formError}
      labels={labels}
    />
  );
}
