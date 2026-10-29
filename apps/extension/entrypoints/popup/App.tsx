import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { browser } from 'wxt/browser';
import { getSession, logout, startLogin } from '../../src/lib/auth';

type State =
  | { status: 'loading' }
  | { status: 'anon'; error?: string }
  | { status: 'authed'; email: string };

// T2: estado de sesión. T3 añade la captura; T5, la vista Hoy.
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
    <main className="popup-root">
      <h1>{t('Extension.popupTitle')}</h1>
      <p>{t('Extension.popupSubtitle')}</p>
      {state.status === 'loading' && <p role="status">{t('Extension.authLoading')}</p>}
      {state.status === 'anon' && (
        <>
          {state.error && (
            <p role="alert" style={{ color: '#c026d3' }}>
              {state.error}
            </p>
          )}
          <button type="button" onClick={handleLogin}>
            {t('Extension.login')}
          </button>
        </>
      )}
      {state.status === 'authed' && (
        <>
          <p role="status">{t('Extension.connectedAs', { email: state.email })}</p>
          <button type="button" onClick={handleLogout}>
            {t('Extension.logout')}
          </button>
          <button
            type="button"
            onClick={() => browser.tabs.create({ url: 'https://ordotodo.app' })}
          >
            {t('Extension.openOrdo')}
          </button>
        </>
      )}
    </main>
  );
}
