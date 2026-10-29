import { createRoot } from 'react-dom/client';
import App from './App';
import '../../src/i18n';
import '../../src/styles.css';

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(<App />);
}
