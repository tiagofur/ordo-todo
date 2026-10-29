import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { browser } from 'wxt/browser';
import {
  CreateTaskDialog,
  type CreateTaskDialogLabels,
  type CreateTaskFormData,
  type ProjectOption,
} from '@ordo-todo/ui';
import type { Task } from '@ordo-todo/api-client';
import { serializeCalendarDateForApi } from '@ordo-todo/core';
import { apiClient } from '../../src/lib/api-client';
import { refreshBadge } from '../../src/lib/badge';
import { getSession, logout, startLogin } from '../../src/lib/auth';
import {
  buildPrefill,
  getActivePageContext,
  type PageContext,
} from '../../src/lib/capture';
import { getOptions } from '../../src/lib/options';

type State =
  | { status: 'loading' }
  | { status: 'anon'; error?: string }
  | { status: 'authed'; email: string };

type View = 'capture' | 'today';

export default function App() {
  const { t } = useTranslation();
  const [state, setState] = useState<State>({ status: 'loading' });

  useEffect(() => {
    // Idioma elegido en opciones (sync) manda sobre el detector.
    void getOptions().then((options) => {
      if (options.language && options.language !== 'auto') {
        void import('../../src/i18n').then(({ changeLanguage }) =>
          changeLanguage(options.language as Parameters<typeof changeLanguage>[0]),
        );
      }
    });
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
        <>
          <div className="flex items-center justify-between px-4 py-2">
            <p role="status" className="truncate text-xs text-muted-foreground">
              {t('Extension.connectedAs', { email: state.email })}
            </p>
            <button
              type="button"
              onClick={handleLogout}
              className="shrink-0 text-xs text-muted-foreground hover:underline"
            >
              {t('Extension.logout')}
            </button>
          </div>
          <PopupTabs />
        </>
      )}
    </main>
  );
}

function PopupTabs() {
  const { t } = useTranslation();
  const [view, setView] = useState<View>('capture');

  return (
    <div>
      <div className="flex gap-1 border-b px-4" role="tablist">
        {(
          [
            ['capture', t('Extension.tabCapture')],
            ['today', t('Extension.tabToday')],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`px-3 py-1.5 text-sm ${
              view === key
                ? 'border-b-2 border-primary font-medium text-primary'
                : 'text-muted-foreground'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {view === 'capture' ? <CaptureView /> : <TodayView />}
    </div>
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
      void refreshBadge();
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

function TodayView() {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[] | null>(null);

  const load = () => {
    apiClient
      .getTasksToday()
      .then((today) =>
        setTasks(
          [...today.overdue, ...today.dueToday].filter(
            (task) => task.status !== 'COMPLETED' && !task.completedAt,
          ),
        ),
      )
      .catch(() => setTasks([]));
  };

  useEffect(load, []);

  const complete = async (taskId: string) => {
    setTasks((current) => current?.filter((task) => task.id !== taskId) ?? null);
    try {
      await apiClient.completeTask(taskId);
    } catch {
      // Si falla, recargamos para mostrar el estado real.
    }
    load();
    void refreshBadge();
  };

  return (
    <div className="px-4 py-3">
      {tasks === null && (
        <p role="status" className="py-6 text-sm text-muted-foreground">
          {t('Extension.authLoading')}
        </p>
      )}
      {tasks?.length === 0 && (
        <p className="py-6 text-sm text-muted-foreground">
          {t('Extension.todayEmpty')}
        </p>
      )}
      {tasks && tasks.length > 0 && (
        <ul className="space-y-1">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-2 py-1">
              <input
                type="checkbox"
                aria-label={task.title}
                onChange={() => void complete(task.id)}
                className="h-4 w-4"
              />
              <span className="truncate text-sm">{task.title}</span>
            </li>
          ))}
        </ul>
      )}
      <button
        type="button"
        onClick={() => browser.tabs.create({ url: 'https://ordotodo.app' })}
        className="mt-3 text-xs text-muted-foreground hover:underline"
      >
        {t('Extension.openOrdo')}
      </button>
    </div>
  );
}
