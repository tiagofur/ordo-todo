import { useTranslation } from 'react-i18next';

export default function App() {
  const { t } = useTranslation();

  return (
    <main className="popup-root">
      <h1>{t('Extension.popupTitle')}</h1>
      <p>{t('Extension.popupSubtitle')}</p>
    </main>
  );
}
