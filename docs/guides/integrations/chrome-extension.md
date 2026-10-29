# Kit de publicación: extensión de Chrome (ODD 024)

> **Estado**: listo para el submit humano. Código en `apps/extension`; todo lo
> que el owner necesita para publicar está aquí.

## 1. Identidad y claves

| Pieza | Valor |
|---|---|
| Extension ID | `kljihfnniklhlmkpamdibbbjghinooaf` |
| Redirect OAuth | `https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/` |
| Client ID OAuth | = Extension ID (cliente público, PKCE S256, sin secret) |
| Clave pública | en `apps/extension/wxt.config.ts` (`key` del manifest) |
| Clave privada | `deploy/secrets/chrome-extension-key.pem` (gitignored — NO subir a ningún sitio) |

La `key` pública fija el ID en dev **y** en la Web Store: el ID de la tienda
será el mismo que en desarrollo.

## 2. Registro del cliente OAuth (una vez, por entorno)

La extensión necesita su fila en `OAuthClient` (los clientes no nacen por
seed). En producción (VPS, base de `api.ordotodo.app`):

```sql
INSERT INTO "OAuthClient" ("id", "clientId", "clientName", "redirectUris", "scopes", "createdAt", "updatedAt")
VALUES (gen_random_uuid()::text,
        'kljihfnniklhlmkpamdibbbjghinooaf',
        'Ordo para Chrome',
        ARRAY['https://kljihfnniklhlmkpamdibbbjghinooaf.chromiumapp.org/'],
        ARRAY['read', 'tasks:write'],
        now(), now());
```

Y en el `.env` del backend de producción:

```
OAUTH_FIRST_PARTY_CLIENT_IDS=kljihfnniklhlmkpamdibbbjghinooaf
```

Sin esta env, los consent tokens de la extensión NO autentican `/api/v1`
(401): es la allowlist first-party de ODD 024 S1.

En local: misma fila en la BD de dev (los tests unitarios no la necesitan).

## 3. Build y zip de release

```bash
cd apps/extension
npm run build          # → .output/chrome-mv3 (host_permissions: api.ordotodo.app)
npm run zip            # → .output/*.zip listo para subir a la store
```

Verificación previa al submit:

- [ ] `chrome://extensions` → modo desarrollador → **Load unpacked** sobre
      `apps/extension/.output/chrome-mv3` carga sin warnings de manifest.
- [ ] Flujo completo: login → consent ("Ordo para Chrome", scopes read +
      tasks:write) → popup conectado.
- [ ] Crear tarea desde popup (con prefill de la pestaña activa) y verla en
      `ordotodo.app`.
- [ ] Menú contextual en selección, enlace y página → 3 tareas (la de
      selección usa el proyecto por defecto de opciones).
- [ ] Badge = tareas de hoy sin completar; completar desde la pestaña Hoy lo
      actualiza.
- [ ] Cerrar sesión revoca y limpia el badge.

## 4. Permisos y su justificación (formulario de la store)

| Permiso | Justificación (copia para la store) |
|---|---|
| `activeTab` | Leer título/URL y texto seleccionado **solo de la pestaña activa, solo cuando el usuario interactúa** con la extensión (popup o menú contextual). No hay lectura en segundo plano de páginas. |
| `scripting` | Inyectar un único script de lectura de la selección en la pestaña activa, amparado por `activeTab`. |
| `identity` | `chrome.identity.launchWebAuthFlow` para el login OAuth con la pantalla de consentimiento de Ordo. |
| `contextMenus` | Entrada "Add to Ordo" del clic derecho. |
| `storage` | Guardar opciones (proyecto por defecto, idioma) en `storage.sync` y los tokens OAuth en `storage.session` (se borran al cerrar el navegador). |
| `alarms` | Refrescar el badge de "tareas de hoy" cada 30 minutos. |
| `host_permissions: api.ordotodo.app` | Único destino de red de la extensión (la API de Ordo). Sin `<all_urls>`. |

## 5. Listing (copia para la store)

**Nombre**: Ordo Todo

**Descripción corta (132 caracteres máx.)**:
- ES: `Captura tareas de Ordo desde cualquier página: popup de captura rápida, menú contextual y tus tareas de hoy en un clic.`
- EN: `Capture Ordo tasks from any page: quick-capture popup, right-click menu and your today tasks one click away.`
- PT-BR: `Capture tarefas do Ordo em qualquer página: popup de captura rápida, menu de contexto e suas tarefas de hoje.`

**Descripción larga (ES)**:

> Ordo es tu app de productividad; esta extensión es su brazo en el navegador:
> capturar y mirar, sin interrumpir lo que estás haciendo.
>
> - **Captura rápida**: abre el popup y la tarea llega con el título de la
>   página, su URL y el texto seleccionado ya rellenados.
> - **Clic derecho → "Add to Ordo"**: convierte una selección, un enlace o la
>   página entera en tarea, con tu proyecto por defecto.
> - **Tareas de hoy**: el icono muestra cuántas tienes pendientes hoy; la
>   pestaña "Hoy" las lista y te deja completarlas sin abrir la app.
> - **Privado por diseño**: se conecta a tu cuenta con OAuth (pantalla de
>   consentimiento de Ordo), solo habla con la API de Ordo y no vende ni
>   comparte datos. Los tokens viven en la sesión del navegador.

**Categoría**: Productivity. **Idiomas**: es / en / pt-BR.

**Capturas (1280×800)**: 3 mínimas — (1) popup con el formulario pre-rellenado
sobre una página real, (2) menú contextual "Add to Ordo" sobre una selección,
(3) pestaña Hoy con el badge en el icono.

## 6. Privacidad

- Privacy policy URL: `https://ordotodo.app/privacy` (ya publicada; la
  extensión no recoge datos para venta ni publicidad y no transmite nada a
  terceros — único destino: `api.ordotodo.app`).
- `Single purpose`: captura de tareas hacia Ordo.
- Datos usados: título/URL/selección de la pestaña activa al crear una tarea
  (va al contenido de la tarea que el usuario crea), y tokens de sesión del
  propio usuario (`storage.session`, se borran al cerrar el navegador).
- Declarar: "Does not sell or use data for unrelated purposes".

## 7. Checklist del submit (owner)

1. [ ] Registro SQL del cliente OAuth en prod + `OAUTH_FIRST_PARTY_CLIENT_IDS`
       en el `.env` del VPS + restart del backend (sección 2).
2. [ ] Verificación manual completa de la sección 3 contra producción.
3. [ ] `npm run zip` en `apps/extension`.
4. [ ] Subir en https://chrome.google.com/webstore/devconsole (cuenta de
       desarrollador ya existente; fee ya pagado).
5. [ ] Rellenar listing (sección 5), permisos (sección 4) y privacy (sección 6).
6. [ ] Enviar a revisión (suele tardar de horas a pocos días).
7. [ ] Tras publicar: verificar que el ID publicado coincide con
       `kljihfnniklhlmkpamdibbbjghinooaf` y que el login funciona contra prod.

## 8. Mantenimiento

- Versión: bump de `version` en `apps/extension/package.json` (y `wxt build`
  la refleja en el manifest). Cada release nuevo = nuevo zip.
- El consentimiento y los scopes viven en el backend: cambios de scopes de la
  extensión → añadirlos al registro del cliente si hace falta.
- Firefox/Edge: WXT lo facilita (`npm run dev:firefox`), verificado NO en la
  ODD 024 — evaluar en fase 2.
