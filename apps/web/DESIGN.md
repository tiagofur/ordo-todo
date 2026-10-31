---
name: Ordo Todo (App)
description: App de productividad todo-en-uno — un cockpit sereno con firma de color por sección.
colors:
  primary: "#06B6D4"
  primary-foreground: "#FFFFFF"
  primary-dark: "#22D3EE"
  secondary: "#ECFEFF"
  secondary-foreground: "#0891B2"
  accent: "#ECFEFF"
  accent-foreground: "#0891B2"
  background: "oklch(1 0 0)"
  foreground: "oklch(0.141 0.005 285.823)"
  card: "oklch(1 0 0)"
  muted: "#F3F4F6"
  muted-foreground: "#6B7280"
  border: "#E5E7EB"
  destructive: "oklch(0.577 0.245 27.325)"
  ring: "#06B6D4"
  sidebar: "#FAFAFA"
  sidebar-border: "#E5E7EB"
  brand-mark: "#AD46FF"
  section-dashboard: "#06B6D4"
  section-tasks: "#8B5CF6"
  section-projects: "#EC4899"
  section-workspaces: "#F97316"
  section-calendar: "#3B82F6"
  section-goals: "#EC4899"
  section-habits: "#10B981"
  section-notes: "#EAB308"
  section-wellbeing: "#F43F5E"
typography:
  display:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "normal"
  headline:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "normal"
  title:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.375
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
    fontFeature: "'cv02', 'cv03', 'cv04', 'cv11'"
  label:
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  "2xl": "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  "2xl": "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-primary-dark:
    backgroundColor: "{colors.primary-dark}"
  button-outline:
    backgroundColor: "{colors.background}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  input:
    backgroundColor: "transparent"
    textColor: "{colors.foreground}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "4px 12px"
  card:
    backgroundColor: "{colors.card}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.xl}"
  badge:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.primary-foreground}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
---

# Design System: Ordo Todo (App)

## Overview

**Creative North Star: "El cockpit sereno"**

La app es un panel de control tranquilo sobre un lienzo neutro: zinc y blanco en modo claro, un azul-negro profundo (`oklch(0.1 0.01 275)`) en modo oscuro. La personalidad es **precisa y cálida** — ordenada, eficiente y franca, con acentos alegres en dosis medidas. El color en Ordo **ordena, nunca decora**: cada módulo firma con su color propio (tareas violeta, proyectos rosa, hábitos verde…) para que el usuario reconozca dónde está sin leer un título, pero la acción primaria y el chrome de UI hablan un solo idioma (el cian del sistema semántico).

Es un sistema Radix/shadcn **confiado y accesible**: controles con estados completos (hover, focus-visible con anillo de 3px, disabled, aria-invalid), teclado primero, y una elevación **plana por defecto** — las superficies descansan y solo se levantan como respuesta (hover, overlays, carga). El único gesto expresivo permitido fuera de esa disciplina es el glassmorphism del dashboard (`glass-panel`, blur 12px) y las transiciones suaves de tema (300 ms).

**Key Characteristics:**

- Base semántica shadcn (tokens `--primary/--muted/--border…`) con modo oscuro por clase `.dark`, nunca por media query.
- Firma de color por sección vía `--theme-*` mapeada a utilidades Tailwind (`bg-tasks`, `text-projects`…).
- Una sola familia tipográfica (Inter) con jerarquía de peso, no de tamaño chillón.
- Radios generosos y consistentes: 14 px en superficies, 8 px en controles, pill solo para badges/chips.
- Estados siempre completos: focus ring visible, skeletons `animate-pulse` para cargas, `EmptyState` para vacíos.

## Colors

Paleta neutra y calma (blanco/zinc claro, azul-negro oscuro) sobre la que hablan dos voces de color: el **cian semántico** que ejecuta acciones y el **arcoíris de sección** que firma módulos. El morado de marca existe pero no participa en la UI.

### Primary
- **Cian Eléctrico** (`#06B6D4` claro / `#22D3EE` oscuro — token `--primary`): la voz de acción de toda la app. Botones primarios, enlaces, selección de texto, foco (`--ring`), badges activos, sidebar activo. Es el mismo valor en web, desktop y móvil porque vive en `@ordo-todo/styles`.
- **Morado Ordo** (`#AD46FF` — token de marca): identidad pura, no UI. Aparece en el BrandMark (login, registro, authorize), `themeColor` del viewport, favicon y acentos de apps conectadas. Nunca en botones ni estados de acción.

### Secondary
- **Cian Bruma** (`#ECFEFF` claro / `#164E63` oscuro — `--secondary`/`--accent`): fondos de hover, chips secundarios, elementos seleccionados suaves. Su texto acompaña en `#0891B2` / `#22D3EE`.

### Tertiary (firmas por sección)
- **Violeta Tareas** (`#8B5CF6`), **Rosa Proyectos** (`#EC4899`), **Esmeralda Hábitos** (`#10B981`), **Naranja Workspaces** (`#F97316`), **Azul Calendario** (`#3B82F6`), **Amarillo Notas** (`#EAB308`), **Rosa Bienestar** (`#F43F5E`) — tokens `--theme-*` expuestos como `bg-tasks`, `text-projects`, etc. Colorean cabeceras, iconos de navegación, tarjetas y gráficos de su módulo. Los colores de proyecto (7) y de tags (10) son paletas cerradas (`projectColors`/`tagColors` en `@ordo-todo/styles`): se eligen, no se inventan.
- **Destructivo** (`oklch(0.577 0.245 27.325)`): rojo único para borrar, revocar y errores (`aria-invalid`).

### Neutral
- **Lienzo Blanco** (`oklch(1 0 0)`), **Tinta Casi-Negra** (`oklch(0.141 0.005 285.823)`): fondo y texto del modo claro.
- **Azul-Noche** (`oklch(0.1 0.01 275)` fondo / `oklch(0.15 0.02 275)` cards): el modo oscuro no es zinc puro; tiene un sesgo azul frío que hace descansar la vista.
- **Gris Zinc** (`#F3F4F6` muted / `#6B7280` muted-foreground / `#E5E7EB` border): texto secundario, placeholders, bordes. El modo oscuro usa `#27272A` para bordes/inputs y `#A1A1AA` para texto secundario.

### Named Rules

**La Regla de la Marca Púrpura.** `#AD46FF` es identidad (icono, auth, themeColor), nunca color de acción. Si un botón necesita atención, ese botón es cian.

**La Regla de Firma por Sección.** Cada módulo usa su `--theme-*` para identificarse (iconos de sidebar, cabeceras, tarjetas) pero nunca para botones de acción: la acción es siempre del sistema semántico.

**La Regla del Modo Oscuro Frío.** El oscuro lleva sesgo azul (`oklch(... 275)`), no gris puro. Un nuevo color debe funcionar en ambos temas o no entra.

## Typography

**Display Font:** Inter (fallback `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`)
**Body Font:** Inter (misma pila)
**Label/Mono Font:** Inter (sin familia mono distintiva; código inline usa la pila por defecto)

**Character:** Una sola familia que lo sostiene todo — la jerarquía se construye con peso (400–700) y tamaño moderado, nunca con tamaños estridentes. Las features `cv02/cv03/cv04/cv11` de Inter abren cifras y formas para tablas y contadores de Pomodoro.

### Hierarchy
- **Display** (700, 36 px, 1.25): títulos de página y números hero de insights. Rara vez más grande.
- **Headline** (600, 24 px, 1.375): títulos de vista dentro de la página.
- **Title** (600, 20 px, 1.375): títulos de tarjeta, cabeceras de panel.
- **Body** (400, 16 px que compacta a 14 px en desktop, 1.5): contenido, descripciones de tarea. En formularios el estándar es `text-sm` (14 px).
- **Label** (500, 12–14 px): badges, metadatos, timestamps, texto de botón (`text-sm font-medium`/`semibold`).

### Named Rules

**La Regla de Una Sola Familia.** Inter en todo; si algo necesita otra fuente, necesita una justificación de diseño, no un capricho.

**La Regla del Peso antes que el Tamaño.** Para diferenciar jerarquías cercanas, sube el peso (400→500→600); no infles los tamaños.

## Layout

- **Modelo espacial**: navegación lateral fija a la izquierda (tokens `--sidebar-*`, gris `#FAFAFA` claro / `#18181B` oscuro, borde 1 px) y contenido fluido a su derecha. En móvil la sidebar se convierte en drawer (Sheet). Cabecera de vista con título + acciones arriba del contenido.
- **Grid y ritmo**: escala de espaciado Tailwind en grid de 4 px; el ritmo habitual es `gap-4` (16 px) entre tarjetas y `p-4`/`p-6` dentro de ellas. Densidad media: suficiente aire para que la app de 34 módulos no abrume.
- **Breakpoints**: los de Tailwind v4 por defecto (sm 640 px, md 768 px, lg 1024 px, xl 1280 px, 2xl 1536 px) — no hay overrides del proyecto.
- **Detalles de oficio**: scrollbars finos propios (8 px, thumb `muted-foreground/30` que sube a `/50` en hover); transición de tema de 300 ms aplicada a superficies para que el cambio claro/oscuro no parpadee.

## Elevation & Depth

**Plano por defecto.** Las superficies descansan planas sobre el lienzo; la profundidad aparece solo como respuesta o como capa funcional. Los bordes de 1 px (`--border`) hacen el trabajo de separación que otros sistemas delegan en sombras.

### Shadow Vocabulary
- **Sombra de control** (`shadow-xs`, ≈ `0 1px 2px 0 rgb(0 0 0 / 0.05)`): inputs y botones outline en reposo.
- **Sombra de superficie** (`shadow`, escala Tailwind por defecto): cards (`rounded-xl border bg-card shadow`) — apenas un susurro.
- **Sombra de capa**: dropdowns, popovers, dialogs y sheets levantan la escala Tailwind (sm→xl) según profundidad de overlay.
- **Vidrio del dashboard** (`glass-panel`): `rgba(255,255,255,0.7)` + `blur(12px)` claro, `rgba(24,24,27,0.4)` oscuro — utilidad exclusiva del dashboard, no un patrón general.
- **Skeletons** (`animate-pulse bg-muted`): la "profundidad" de la espera es tonal, no sombreada.

### Named Rules

**La Regla de la Sombra-Respuesta.** Si un elemento está en reposo y tiene sombra marcada, la sombra está de más; la elevación se gana con hover, foco o apertura de overlay.

## Shapes

Radio base del sistema: `--radius: 10px`, derivado en la escala (`sm` 6 px, `md` 8 px, `lg` 10 px, `xl` 14 px, `2xl` 16 px). La forma acompaña la función: **superficies** (cards, panels, dialogs) en `rounded-xl` (14 px); **controles** (botones, inputs, items de menú) en `rounded-md` (8 px); **badges, chips y avatares** en `rounded-full` (pill o círculo); el **BrandMark** en `rounded-2xl` (16 px) como silueta distintiva de la marca. Bordes de 1 px en `--border` delimitan sin cerrar; esquinas de corte, clip-path o geometría agresiva no existen en este sistema.

## Components

Primitivos Radix/shadcn en `packages/ui` (consumidos por web, desktop y móvil). Todos comparten: `focus-visible` con anillo de 3 px al 50 % del color `--ring`, `disabled` con opacidad 50 % y sin puntero, `aria-invalid` que tiñe anillo y borde de destructivo.

### Buttons
- **Shape:** `rounded-md` (8 px), altura 36 px (default), iconos de 16 px.
- **Primary:** fondo **Cian Eléctrico** (`bg-primary`), texto blanco, `px-4 py-2`; hover al 90 % de opacidad. Es el único botón que ejecuta la acción principal de una vista.
- **Outline:** borde `--border/80` sobre fondo, texto en tinta; hover lleva `bg-accent`. Para acciones secundarias.
- **Ghost:** sin fondo ni borde; hover `bg-accent` (50 % en oscuro). Para acciones de la barra superior y menús.
- **Secondary / Destructive / Link:** `bg-secondary`; destructivo en rojo con ring propio; link cian subrayado con `underline-offset-4`.
- **Sizes:** `sm` 32 px (padding 12 px), `lg` 40 px (padding 24 px), `icon` cuadrado 36 px.

### Chips / Badges / Tags
- **Style:** pill `rounded-full`, `px-2 py-0.5`, label 12 px medium, borde 1 px. Variantes: primary (cian), secondary, destructive, outline.
- **Tags de tarea:** paleta cerrada de 10 colores (`tagColors`); se muestran como pills tenues con dot de color, nunca como relleno saturado a pantalla completa.

### Cards / Containers
- **Corner Style:** `rounded-xl` (14 px).
- **Background:** `--card` (blanco / azul-card oscuro), texto en tinta.
- **Shadow Strategy:** sombra por defecto sutil; ver Elevation.
- **Border:** 1 px `--border`; en hover de elementos clicables, `bg-accent` o borde reforzado, nunca salto de sombra.
- **Internal Padding:** `p-4` estándar, `p-6` para panels hero; `gap-4` en grids de cards.

### Inputs / Fields
- **Style:** altura 36 px, `rounded-md`, borde `--input`, fondo transparente (30 % de `--input` en oscuro), texto 14 px, placeholder `--muted-foreground`.
- **Focus:** borde → `--ring` + anillo de 3 px `ring-ring/50`; la selección de texto usa cian con texto blanco.
- **Error / Disabled:** `aria-invalid` tiñe borde y anillo de destructivo; disabled al 50 % sin puntero. Labels con `Label` de Radix y errores inline debajo.
- **Selects/combos:** Popover/Command de Radix con búsqueda, `rounded-md`, item activo `bg-accent`.

### Navigation
- **Sidebar** izquierda con tokens propios: fondo `--sidebar`, item activo `bg-sidebar-accent` + texto acento o firma de sección, iconos 16–20 px. Secciones colapsables (Collapsible), badges de contador en pill.
- **Dropdown menus** (Radix): `rounded-md`, item hover `bg-accent`, separadores `Separator` de 1 px, atajos de teclado alineados a la derecha en `muted-foreground`.
- **Móvil:** la sidebar pasa a drawer (Sheet) deslizante; tabs inferiores no existen — el drawer es la navegación.

### Signature: la tarjeta de tarea temática
El patrón que define a Ordo: tarjeta `rounded-xl` con checkbox a la izquierda, título en tinta, metadatos en label gris (fecha, tags-pill, proyecto con dot de su color, avatares de asignados) y la **firma de color de su sección/proyecto** como acento lateral o de cabecera. Con subtareas muestra progreso (`Progress` fino en cian). En Kanban vive dentro de columnas custom con cabecera de color de workflow.

### Patrones de estado
- **Carga:** `Skeleton` (`animate-pulse bg-muted rounded`) replicando la forma del contenido — nunca spinners genéricos sobre páginas vacías.
- **Vacío:** componente `EmptyState` (icono + título + descripción + CTA primario) — todo módulo tiene el suyo traducido a los 3 idiomas.
- **Feedback:** toasts Sonner (esquina, icono por severidad) para resultados de acciones; los errores de formulario van inline, no en toast.

## Do's and Don'ts

### Do:
- **Do** usa siempre tokens semánticos (`bg-primary`, `text-muted-foreground`, `border`) — el modo oscuro y el future re-theming dependen de que ningún hex crudo decida colores por su cuenta.
- **Do** firma cada módulo con su `--theme-*` (`bg-tasks`, `text-habits`…) para iconos, cabeceras y acentos de tarjeta.
- **Do** mantén el focus ring visible (3 px, `ring-ring/50`) en todo control interactivo; teclado primero.
- **Do** respeta `prefers-reduced-motion` (ya global) y mantén las transiciones en la escala 150–300 ms.
- **Do** usa `Skeleton` para cargas y `EmptyState` para vacíos, ambos trilingües vía i18n.
- **Do** radios por función: `xl` superficies, `md` controles, `full` solo pills/chips/avatares.

### Don't:
- **Don't** uses el morado `#AD46FF` en botones, enlaces o estados de acción: es identidad (BrandMark, auth, themeColor), no voz de UI.
- **Don't** introduzcas violeta `#7C3AED` ni ningún "nuevo primario": la migración cian→violeta está como decisión abierta en PRODUCT.md y solo un PR de tokens decidido por el owner puede cambiarla.
- **Don't** copies el mundo visual de la webpage (violeta editorial, testimonios, CTAs de marketing): la app y el sitio público son mundos hermanos con primarios distintos hoy.
- **Don't** mezcles geometrías: nada de botones pill ni cards cuadradas; el pill es de badges/chips.
- **Don't** metas glassmorphism (`glass-panel`) fuera del dashboard, ni sombras en reposo que no respondan a estado.
- **Don't** dejes cadenas en duro: toda cadena visible pasa por i18n (EN/ES/PT-BR) antes de merge.
- **Don't** uses media queries para modo oscuro: el sistema es por clase `.dark` en `<html>`.
