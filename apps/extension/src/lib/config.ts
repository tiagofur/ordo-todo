// Config de la extensión. El ID de la extensión es el client_id OAuth
// (first-party, allowlist en OAUTH_FIRST_PARTY_CLIENT_IDS del backend).
export const OAUTH_CLIENT_ID = 'kljihfnniklhlmkpamdibbbjghinooaf';
export const OAUTH_REDIRECT_URI = `https://${OAUTH_CLIENT_ID}.chromiumapp.org/`;

// `read` + `tasks:write`: capturar, listar hoy y completar. Sin scopes de
// admin (ver ODD 024 S1; la negociación de scope es la del consent screen).
export const OAUTH_SCOPES = ['read', 'tasks:write'];

// En dev apunta al backend local (host_permissions dev ya lo cubre); en la
// build de producción, a la API desplegada.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'https://api.ordotodo.app/api/v1';
