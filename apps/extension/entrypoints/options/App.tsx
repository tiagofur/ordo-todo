import { useTranslation } from 'react-i18next';

// T5: proyecto por defecto, idioma y estado de sesión.
export default function App() {
  const { t } = useTranslation();

  return <p>{t('Extension.optionsPlaceholder')}</p>;
}
