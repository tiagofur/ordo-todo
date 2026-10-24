# Tutorial de Ordo — pantalla por pantalla

Guía estática (HTML + CSS + JS vanilla, sin build ni dependencias) que explica **qué hace y cómo se usa cada pantalla de la app**. Está pensada para portarse a la landing pública (`apps/webpage`, sección guía) más adelante; mientras tanto vive en `docs/tutorial` y se puede abrir directo en el navegador.

## Cómo verla

```bash
# opción 1: abrir el archivo directo
open docs/tutorial/index.html

# opción 2: servirlo (recomendado)
cd docs/tutorial && python3 -m http.server 8741
# → http://127.0.0.1:8741
```

Funciona con `file://` también: los scripts son clásicos (no módulos ES) y no hay `fetch`.

## Qué cubre

26 pantallas agrupadas como el sidebar de la app: Empezar (primeros pasos, Hoy), Tu día (AI Chat, Tareas, Calendario, Mi plan, Ritual), Planificar (Proyectos, Hábitos, Objetivos, Notas), Equipo (Workspaces, Carga de trabajo, Eisenhower, Reuniones), Foco y tiempo (Temporizador, Modo Enfoque), Rendimiento (Insights, Bienestar, Etiquetas, Papelera), Tu cuenta (Notificaciones, Configuración, Perfil, Atajos) y Administración.

Cada página sigue el mismo esqueleto: **Qué hace → Qué verás (zonas) → Cómo se usa (pasos) → Trucos y detalles → Pantallas relacionadas**. El contenido se redactó contra el código fuente de `apps/web` (componentes y `packages/i18n/src/locales/es.json`), así que los nombres de botones y estados coinciden con la UI real. `analytics` y `reports` se documentan como pestañas de Insights porque en la app son redirecciones.

## Estructura

```
docs/tutorial/
├── index.html          índice con ruta recomendada y progreso
├── <pantalla>.html     26 páginas (una por pantalla de la app)
└── assets/
    ├── styles.css      todo el CSS (tema claro/oscuro con variables)
    ├── screens.js      catálogo de pantallas: grupos, colores, iconos, rutas
    └── app.js          sidebar, búsqueda, pager, progreso en localStorage, tema
```

## Cómo editar

- **Añadir/renombrar una pantalla:** edita `assets/screens.js` (un objeto `s(...)` por pantalla). El sidebar del índice y los enlaces anterior/siguiente de las demás páginas se generan de ahí… **salvo el índice**: `index.html` tiene su propio HTML para el TOC (estático a propósito, para que el índice exista sin JS). Si añades una página, actualiza también su entrada en `index.html`.
- **Iconos:** trazos estilo lucide definidos como strings SVG en `assets/screens.js` (`I.*`).
- **Colores por sección:** mismos valores que usa el sidebar de la app (`C.*` en `screens.js`).
- **Progreso de lectura:** `localStorage` (`ordo-tutorial-read`); el tema también se recuerda (`ordo-tutorial-theme`). Al portarlo a la landing, valora migrar a claves con namespace.

## Para el futuro porteo a la landing

- El contenido de cada página es un `<main>` autónomo: fácil de convertir en ruta de Next.js (`/guide/pantallas/<id>`) reutilizando el `<dl class="zones">`, `.steps` y `.callout` como componentes.
- Las capturas de la app viven en `apps/webpage/public/images/guide/` (hoy: analytics, dashboard, focus, projects); conviene ampliarlas pantalla a pantalla al portar.
- i18n: el tutorial está en español; la landing exige EN/ES/PT-BR. La estructura por ficheros facilita duplicar el contenido por locale.
