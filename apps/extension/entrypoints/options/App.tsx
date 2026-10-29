import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage, type SupportedLanguage } from '../../src/i18n';
import { apiClient } from '../../src/lib/api-client';
import { getSession, logout } from '../../src/lib/auth';
import { getOptions, saveOptions } from '../../src/lib/options';

interface ProjectRow {
  id: string;
  name: string;
}

export default function OptionsApp() {
  const { t } = useTranslation();
  const [email, setEmail] = useState<string | null>(null);
  const [language, setLanguage] = useState<'auto' | SupportedLanguage>('auto');
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [defaultProjectId, setDefaultProjectId] = useState<string>('');

  useEffect(() => {
    void (async () => {
      const [session, options] = await Promise.all([getSession(), getOptions()]);
      setEmail(session?.email ?? null);
      setLanguage(options.language ?? 'auto');
      setDefaultProjectId(options.defaultProjectId ?? '');
      try {
        const workspaces = await apiClient.getWorkspaces();
        if (workspaces[0]) {
          setProjects(
            (await apiClient.getProjects(workspaces[0].id)) as ProjectRow[],
          );
        }
      } catch {
        setProjects([]);
      }
    })();
  }, []);

  const updateLanguage = async (value: 'auto' | SupportedLanguage) => {
    setLanguage(value);
    await saveOptions({ language: value });
    if (value === 'auto') {
      localStorage.removeItem('ordo-language');
      await changeLanguage(getCurrentLanguage());
    } else {
      await changeLanguage(value);
    }
  };

  const updateDefaultProject = async (value: string) => {
    setDefaultProjectId(value);
    await saveOptions({ defaultProjectId: value || null });
  };

  return (
    <main className="mx-auto max-w-xl space-y-8 p-8">
      <h1 className="text-lg font-semibold">{t('Extension.optionsTitle')}</h1>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">{t('Extension.optionsLanguage')}</h2>
        <select
          value={language}
          onChange={(event) =>
            void updateLanguage(event.target.value as 'auto' | SupportedLanguage)
          }
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="auto">{t('Extension.optionsAuto')}</option>
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt-br">Português (BR)</option>
        </select>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">
          {t('Extension.optionsDefaultProject')}
        </h2>
        <select
          value={defaultProjectId}
          onChange={(event) => void updateDefaultProject(event.target.value)}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">{t('Extension.optionsNoDefaultProject')}</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {t('Extension.optionsDefaultProjectHelp')}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-medium">{t('Extension.optionsSession')}</h2>
        {email ? (
          <div className="flex items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {t('Extension.connectedAs', { email })}
            </p>
            <button
              type="button"
              onClick={async () => {
                await logout();
                setEmail(null);
              }}
              className="text-sm text-red-600 hover:underline"
            >
              {t('Extension.logout')}
            </button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {t('Extension.optionsNotSignedIn')}
          </p>
        )}
      </section>
    </main>
  );
}
