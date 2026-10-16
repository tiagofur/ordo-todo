# 📱💻🖥️ Comparación de Pantallas - ORDO Creators

> Documento que describe todas las pantallas de las 3 aplicaciones: **Web**, **Desktop** y **Mobile**.

---

## 📊 Tabla Resumen de Pantallas

| # | Pantalla | Web | Desktop | Mobile | Notas |
|---|----------|:---:|:-------:|:------:|-------|
| 1 | **Inicio/Dashboard** | ✅ | ✅ | ✅ | Funciona igual en las 3 |
| 2 | **Tareas** | ✅ | ✅ | ✅ | Mobile en Home + pantalla detalle |
| 3 | **Proyectos** | ✅ | ✅ | ✅ | Grid de proyectos |
| 4 | **Detalle de Proyecto** | ✅ | ✅ | ✅ | Vista detallada del proyecto |
| 5 | **Workspaces** | ✅ | ✅ | ✅ | Gestión de espacios de trabajo |
| 6 | **Detalle de Workspace** | ✅ | ✅ | ✅ | Movil: 1 col, Tablet: 2 cols, Large: 3 cols (Desktop style) |
| 7 | **Calendario** | ✅ | ✅ | ✅ | Time blocking |
| 8 | **Timer/Pomodoro** | ✅ | ✅ | ✅ | Movil implementado con sincronización backend |
| 9 | **Analytics** | ✅ | ✅ | ✅ | Estadísticas y métricas |
| 10 | **Goals/OKRs** | ✅ | ✅ | ✅ | Objetivos y Key Results |
| 11 | **Detalle de Goal** | ✅ | ✅ | ✅ | Vista con Key Results |
| 12 | **Hábitos** | ✅ | ✅ | ✅ | Seguimiento de hábitos |
| 13 | **Tags/Etiquetas** | ✅ | ✅ | ✅ | Gestión de etiquetas |
| 14 | **Perfil** | ✅ | ✅ | ✅ | Información del usuario |
| 15 | **Settings** | ✅ | ✅ | ✅ | Movil separado de perfil (Paridad funcional) |
| 16 | **Wellbeing** | ✅ | ✅ | ✅ | Bienestar y burnout |
| 17 | **Workload** | ✅ | ✅ | ✅ | Carga de trabajo del equipo |
| 18 | **Eisenhower Matrix** | ✅ | ✅ | ✅ | Matriz de priorización |
| 19 | **Notes** | ✅ | ✅ | ✅ | Movil: Lista simplificada |
| 20 | **Meetings** | ✅ | ✅ | ❌ | Análisis de reuniones con IA |
| 21 | **Reports** | ✅ | ✅ | ✅ | Reportes semanales/mensuales |
| 22 | **Focus Mode** | ✅ | ✅ | ✅ | Modo concentración |
| 23 | **Trash** | ✅ | ✅ | ✅ | Papelera de tareas |
| 24 | **Tasks by Period** | ✅ | ✅ | ✅ | Tareas por período |
| 25 | **Creator Hub** | ✅ | ✅ | ✅ | Gestión de contenido (ideas, series, etc) |
| 26 | **AI Chat** | ✅ | ✅ | ✅ | Implementado en las 3 apps |
| 27 | **Auth/Login** | ✅ | ✅ | ✅ | Autenticación |
| 28 | **Shared Task** | ✅ | ✅ | ❌ | Tareas compartidas públicamente |
| 29 | **Notifications** | ✅ | ✅ | ✅ | Pagina dedicada (Inbox) |

---

## 🎯 Detalle por Pantalla

---

### 1. 🏠 Dashboard / Inicio

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/dashboard` |
| **Desktop** | `/dashboard` |
| **Mobile** | `/(tabs)/index.tsx` |

#### Funcionalidades
- **Resumen de estadísticas**: Tareas pendientes, completadas, para hoy
- **Lista de tareas del día** con filtros (todas, hoy, próximas, completadas)
- **Widget de OKRs/Goals** con progreso porcentual
- **Timer widget** (Web/Desktop)
- **Productivity streak** (Web/Desktop)
- **Hábitos del día** (Web/Desktop)
- **AI Insights** (Web/Desktop)
- **Acceso rápido a crear tarea**

#### UI/Diseño
- **Web/Desktop**: Layout con sidebar + área principal dividida en widgets organizados en grid
- **Mobile**: Header con gradiente que muestra estadísticas, filtros horizontales, lista vertical de tareas con cards, FAB para nueva tarea

#### Diferencias
| Característica | Web | Desktop | Mobile |
|----------------|-----|---------|--------|
| Widgets múltiples | ✅ | ✅ | ❌ |
| OKR Quick Access | ✅ | ✅ | ✅ |
| AI Insights Widget | ✅ | ✅ | ❌ |
| Timer Widget | ✅ | ✅ | ❌ |
| Filtros de tareas | ✅ | ✅ | ✅ |

---

### 2. ✅ Tareas

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/tasks` |
| **Desktop** | `/tasks` |
| **Mobile** | `/(internal)/all-tasks.tsx` y `/(internal)/task.tsx` |

#### Funcionalidades
- **Lista de tareas** con ordenamiento y filtrado
- **Filtrado por etiquetas**
- **Vista lista o grid**
- **Crear/editar tareas**
- **Marcar como completada**
- **Prioridad visual** (alta/media/baja)
- **Fecha de vencimiento**
- **Asignación a proyecto**

#### UI/Diseño
- **Web/Desktop**: Header con título + botón crear, filtros, grid/lista de tarjetas de tareas
- **Mobile**: Header con gradiente, lista de tareas en cards, bottom action button

#### Diferencias
| Característica | Web | Desktop | Mobile |
|----------------|-----|---------|--------|
| Vista Grid | ✅ | ✅ | ❌ |
| Vista Lista | ✅ | ✅ | ✅ (Animated FlatList) |
| Drag & Drop | ✅ | ✅ | ❌ |
| Inline Edit | ✅ | ✅ | ❌ (pantalla separada) |
| **Consistencia Visual** | ✅ (Violeta) | ✅ (Violeta) | ✅ (Violeta - Tokens Unificados) |
| **Animaciones** | ✅ (Framer Motion Staggered) | ✅ (Framer Motion Staggered) | ✅ (Reanimated Staggered) |

---

### 3. 📁 Proyectos

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/projects` |
| **Desktop** | `/projects` |
| **Mobile** | `/(internal)/projects/index.tsx` |

#### Funcionalidades
- **Grid de tarjetas de proyectos**
- **Crear nuevo proyecto** (dialog/modal)
- **Ver tareas del proyecto**
- **Color y nombre del proyecto**
- **Contador de tareas**

#### UI/Diseño
- **Web/Desktop**: Header con icono rosa + título + botón crear, grid responsive de ProjectCards
- **Mobile**: Header estándar con icono rosa, lista de cards de proyecto con animaciones staggered (cascada) y FAB rosa.

#### Consistencia: ✅ Completa
- **Colores**: Las 3 apps usan Rosa (`#EC4899`) como color base de la sección.
- **Header**: Implementado header estándar con icono en todas las plataformas.
- **Animaciones**: Entrada staggered (cascada) en las 3 plataformas.
- **Tokens**: Uso unificado de `bg-projects` y `colors.section.projects`.

---

### 4. 📂 Detalle de Proyecto

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/projects/[projectId]` |
| **Desktop** | `/projects/:id` |
| **Mobile** | `/(internal)/projects/[id].tsx` |

#### Funcionalidades
- **Información del proyecto** (nombre, descripción, color)
- **Lista de tareas del proyecto**
- **Crear tarea dentro del proyecto**
- **Editar/eliminar proyecto**

#### UI/Diseño
- **Web/Desktop**: Header premium con el color asignado al proyecto, barra de progreso interactiva, pestañas (Web) y toggles (Desktop).
- **Mobile**: Header icónico con el color del proyecto, progreso visual y animaciones en cascada.

#### Consistencia: ✅ Completa
- **Colores**: Las 3 apps respetan el **color propio del registro** (color del proyecto) para los elementos de UI, manteniendo la identidad visual individual.
- **Header**: Implementado header estándar icónico en todas las plataformas.
- **Premium UX**: Barra de progreso detallada y animaciones suaves en todas las transiciones.

---

### 5. 🏢 Workspaces

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/(internal)/workspaces` |
| **Desktop** | `/workspaces` |
| **Mobile** | `/(internal)/workspaces/index.tsx` |

#### Funcionalidades
- **Grid de workspaces** del usuario
- **Crear nuevo workspace**
- **Tipo de workspace** (personal, equipo, cliente)
- **Color e icono personalizados**
- **Contador de miembros**

#### UI/Diseño
- **Web/Desktop**: Header icónico naranja con grid responsive de tarjetas de workspace. Animaciones de entrada en cascada.
- **Mobile**: Header icónico naranja, lista adaptativa (2 columnas en tablet) con animaciones suaves y badges de tipo de workspace.

#### Consistencia: ✅ Completa
- **Colores**: Uso unificado del Naranja (`#F97316`) y tokens `bg-workspaces`.
- **Header**: Implementado header estándar icónico en todas las plataformas.
- **Responsividad**: Grid adaptativo en Desktop/Web y soporte multi-columna en Mobile para Tablets.

---

### 6. 🏢 Detalle de Workspace ✅

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/(internal)/workspaces/[slug]` |
| **Desktop** | `/workspaces/:id` |
| **Mobile** | `/(internal)/workspaces/[id].tsx` |

#### Funcionalidades
- **Dashboard del workspace**
- **Lista de proyectos** del workspace
- **Actividad reciente** (Audit logs)
- **Configuración y gestión de miembros**
- **Estadísticas rápidas** (proyectos, miembros)

#### UI/Diseño
- **Web/Desktop**: Cabecera icónica estandarizada con el emoji del workspace y el color dinámico del registro aplicado a sombras y acentos. Animaciones de entrada escalonadas (`framer-motion`).
- **Mobile**: Cabecera "Hero" con color del workspace, estadísticas visuales y lista de proyectos en Grid responsivo (1 col teléfono, 2 cols tablet, 3 cols tablet grande).

#### Consistencia: ✅ Completa
- **Color**: Las 3 plataformas (Web/Desktop/Mobile) respetan el color dinámico del registro.
- **Header**: Implementado header estándar icónico en las plataformas compatibles.
- **Animaciones**: Entrada staggered (cascada) en Web, Desktop y Mobile (`reanimated`).
- **Responsividad**: Mobile ahora soporta layouts de escritorio en pantallas grandes (iPad Pro/Tablets).

---

### 7. 📅 Calendario
| Plataforma | Estado | Coherencia Visual | Notas de Diseño |
| :--- | :--- | :--- | :--- |
| **Web** | ✅ Completa | Alta | Header icónico premium con color Azul (`#3B82F6`). Animaciones staggered. Layout con sidebar de tareas no programadas y calendario principal. |
| **Desktop** | ✅ Completa | Alta | Mirror de la versión Web. Header icónico premium y animaciones unificadas. |
| **Mobile** | ✅ Completa | Alta | Header icónico premium con decoraciones y sombras dinámicas. Navegación semanal y selector de días optimizado. |

**Estándares de Diseño Implementados:**
- **Color**: Uso unificado del Azul (`#3B82F6`) como color de sección.
- **Header**: Implementado header icónico premium (cuadrado rotado, sombra brillante) en todas las plataformas.
- **Micro-interacciones**: Efectos hover en contenedores, animaciones de entrada en cascada y feedback visual en el selector de días (Mobile).
- **Time Blocking**: UX consistente para la asignación de bloques de tiempo.

#### Funcionalidades
- **Vista de calendario semanal**
- **Time blocking** (bloques de tiempo para tareas)
- **Navegación por semanas**
- **Tareas no programadas** (sidebar en Desktop/Web)
- **Drag & drop para programar**

#### UI/Diseño
- **Web/Desktop**: Layout de pantalla completa con sidebar de tareas sin programar. Header icónico azul y grid de calendario con bordes redondeados (2xl) y sombras profundas.
- **Mobile**: Header icónico azul, selector de semana/día con diseño de "pills" modernizado y visualización de bloques de tiempo con colores dinámicos por proyecto.

#### Diferencias
| Característica | Web | Desktop | Mobile |
|----------------|-----|---------|--------|
| Vista Mensual | ✅ | ✅ | ❌ |
| Vista Semanal | ✅ | ✅ | ✅ |
| Sidebar Unscheduled | ✅ | ✅ | ❌ |
| Drag & Drop | ✅ | ✅ | ❌ |

---

### 7. ⏱️ Timer / Pomodoro

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/timer` |
| **Desktop** | `/timer` |
| **Mobile** | `/(internal)/timer.tsx` |

#### Funcionalidades
- **Temporizador Pomodoro** (trabajo/descanso corto/descanso largo)
- **Selección de tarea** para el timer
- **Historial de sesiones**
- **Estadísticas de enfoque**
- **Colores dinámicos** según modo (rojo=trabajo, azul=descanso corto, verde=descanso largo)

#### UI/Diseño
- Tabs: Temporizador | Historial
- Timer circular grande
- Controles de play/pause/stop
- Lista de tareas para seleccionar

---

### 8. 📊 Analytics

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/analytics` |
| **Desktop** | `/analytics` |
| **Mobile** | `/(internal)/analytics.tsx` |

#### Funcionalidades
- **Métricas diarias/semanales** de productividad
- **Heatmap de actividad**
- **Distribución por proyectos**
- **Distribución por estado de tareas**
- **Streak de productividad**
- **Gráficos de tendencias**

#### UI/Diseño
- Múltiples cards con gráficos
- Navegación por fecha
- Iconos con colores temáticos

---

### 9. 🎯 Goals / OKRs

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/goals` |
| **Desktop** | `/goals` |
| **Mobile** | `/(internal)/goals/index.tsx` |

#### Funcionalidades
- **Lista de objetivos (Objectives)**
- **Crear nuevo objetivo**
- **Progreso porcentual**
- **Período** (mensual, trimestral, anual)
- **Color personalizado**
- **Key Results asociados**

#### UI/Diseño
- Grid de cards de objetivos
- Barra de progreso visual
- Indicador de período
- Color primario rosa

---

### 10. 📈 Detalle de Goal

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/goals/[id]` |
| **Desktop** | `/goals/:id` |
| **Mobile** | `/(internal)/goals/[id].tsx` |

#### UI/Diseño
| Plataforma | Estado | Coherencia Visual | Notas de Diseño |
| :--- | :--- | :--- | :--- |
| **Web** | ✅ Completa | Alta | Header icónico premium con color Rosa (`#EC4899`). Animaciones staggered. Progreso visual en tarjetas y detalles. |
| **Desktop** | ✅ Completa | Alta | Header icónico premium. Mirror visual de Web con layout adaptativo. |
| **Mobile** | ✅ Completa | Alta | Header icónico premium con temas y sombras dinámicas. UX optimizada para touch con listas animadas. |

**Estándares de Diseño Implementados:**
- **Color**: Uso unificado del Rosa (`#EC4899`) como base, con soporte para colores personalizados por objetivo.
- **Header**: Implementado header icónico premium en todas las plataformas.
- **Micro-interacciones**: Barras de progreso animadas, hover effects en Web/Desktop, y feedback táctil en Mobile.
- **Feedback Visual**: Empty states ilustrados y transiciones suaves entre estados de carga.

#### Consistencia: ✅ Completa
- **Color**: Uso unificado del Rosa (`#EC4899`) y tokens de sección en todas las plataformas.
- **Header**: Implementado header estándar icónico en las 3 plataformas.
- **Micro-animaciones**: Barras de progreso con efectos visuales y animaciones de entrada.

---

### 11. ⭐ Hábitos

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/habits` |
| **Desktop** | `/habits` |
| **Mobile** | `/(tabs)/habits.tsx` |

#### Funcionalidades
- **Lista de hábitos** activos
- **Marcar completado** para hoy
- **Streak/racha** de días consecutivos
- **Frecuencia** (diario, semanal, etc)
- **Crear nuevo hábito**
- **Ver historial**

#### UI/Diseño
- **Web/Desktop**: Cabecera icónica estandarizada (`bg-habits`), animaciones staggered y diálogos de creación/edición refacturados para usar el tema Esmeralda y sombras dinámicas.
- **Mobile**: Cabecera icónica estandarizada, layout adaptativo para Tablets y uso unificado de tokens de sección.

#### Consistencia: ✅ Completa
- Las 4 plataformas (Web, Desktop, Mobile, Tablet) utilizan el esquema Esmeralda consistente.
- Los diálogos de creación y los paneles de detalle son coherentes entre Web y Desktop.
- Animaciones staggered y layout adaptativo implementados.

---

### 12. 🏷️ Tags/Etiquetas

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/tags` |
| **Desktop** | `/tags` |
| **Mobile** | `/(internal)/tags.tsx` |

#### Funcionalidades
- **Lista de etiquetas**
- **Crear/editar/eliminar** etiquetas
- **Color personalizado**
- **Ver tareas con etiqueta**
- **Contador de tareas** por etiqueta

#### UI/Diseño
| Plataforma | Estado | Coherencia Visual | Notas de Diseño |
| :--- | :--- | :--- | :--- |
| **Web** | ✅ Completa | Alta | Header icónico premium con color Índigo (`#6366f1`). Animaciones staggered y cards interactivas. |
| **Desktop** | ✅ Completa | Alta | Mirror visual de Web. Header icónico premium y diálogos unificados. |
| **Mobile** | ✅ Completa | Alta | Header icónico premium con decoraciones. Modal nativo para creación/edición. |

#### Consistencia: ✅ Completa
- **Color**: Uso unificado del Índigo (`#6366f1`) y tokens de sección.
- **Header**: Implementado header estándar icónico en las 3 plataformas.
- **Animaciones**: Entrada staggered (cascada) y micro-interacciones.

---

### 13. 👤 Perfil

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/(internal)/profile` |
| **Desktop** | `/profile` |
| **Mobile** | `/(tabs)/profile.tsx` |

#### Funcionalidades
- **Información del usuario** (nombre, email, avatar)
- **Estadísticas personales** (tareas completadas, minutos enfocados, pomodoros)
- **Lista de opciones/ajustes**
- **Cerrar sesión**
- **Mobile: Toggle biométrico** (Face ID/huella)

#### UI/Diseño
- **Mobile**: Header con gradiente + avatar grande, estadísticas en cards, lista de opciones

---

### 14. ⚙️ Settings

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/settings` |
| **Desktop** | `/settings` |
| **Mobile** | `/(internal)/settings.tsx` |

#### Funcionalidades
- **Tema** (claro/oscuro/sistema)
- **Idioma** (es/en/pt)
- **Notificaciones**
- **Desktop: Iniciar con Windows**
- **Desktop: Minimizar al iniciar**
- **Desktop: Timer flotante**
- **Desktop: Actualizaciones automáticas**
- **Exportar datos**
- **Eliminar cuenta**

---

### 15. 💚 Wellbeing (Bienestar) ✅

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/wellbeing` |
| **Desktop** | `/wellbeing` |
| **Mobile** | `/(internal)/wellbeing.tsx` |

#### Funcionalidades
- **Análisis de burnout** con nivel de riesgo
- **Patrones de trabajo** (horas promedio, trabajo nocturno, fines de semana)
- **Resumen semanal** con tendencia
- **Recomendaciones AI** personalizadas
- **Alerts/Warnings** de comportamiento
- **Nivel de Energía** (Desktop/Mobile)

#### UI/Diseño
- **Color**: Rose (`#f43f5e`) consistente mediante tokens en las 3 plataformas.
- **Header**: Implementado header estándar icónico en todas las plataformas con animaciones premium.
- **Cards**: Indicadores visuales, medidores circulares animados y hover effects mejorados.
- **Micro-interacciones**: Feedback háptico en Mobile y efectos de hover en Web/Desktop.

#### Consistencia: ✅ Completa
- **Mobile**: Header icónico estándar y animaciones `reanimated`.
- **Web/Desktop**: Diseño unificado con `framer-motion` y temas premium.

---

### 16. 👥 Workload (Carga de Trabajo)

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/workload` |
| **Desktop** | `/workload` |
| **Mobile** | `/(internal)/workload.tsx` |

#### Funcionalidades
- **Vista por workspace/equipo**
- **Carga de cada miembro** (score de 0-100)
- **Nivel de carga** (bajo/moderado/alto/sobrecargado)
- **Tendencia** de carga (subiendo/bajando/estable)
- **Sugerencias de redistribución**
- **Balance score** del equipo

---

### 17. ⬛ Eisenhower Matrix

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/eisenhower` |
| **Desktop** | `/eisenhower` |
| **Mobile** | `/(internal)/eisenhower-matrix.tsx` |

#### Funcionalidades
- **4 cuadrantes**: Hacer primero, Programar, Delegar, Eliminar
- **Drag & drop** entre cuadrantes (Web/Desktop)
- **Marcar tareas como completadas**
- **Tips de uso** de la matriz

#### UI/Diseño
- Grid 2x2 de colores distintivos
- Rojo (urgente+importante), Azul (importante), Amarillo (urgente), Gris (ninguno)
- Color primario morado

---

### 18. 📝 Notes ✅

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/(internal)/workspaces/[slug]/notes` |
| **Desktop** | `/notes` |
| **Mobile** | `/(internal)/notes.tsx` |

#### Funcionalidades
- **Tablero de notas** estilo post-it
- **Crear/editar/eliminar** notas
- **Posicionamiento libre** (drag & drop)
- **Persistencia por Workspace**
- **Widget de acceso rápido** en Dashboard (Mobile)

#### UI/Diseño
- **Web/Desktop**: Cabecera icónica estandarizada con color Amarillo (`#EAB308`). 
- **Mobile**: Cabecera icónica estandarizada. Tablero interactivo con gestos de arrastre (*drag*) mediante `react-native-reanimated`.
- **Botón Nueva Nota**: Integrado en la cabecera estándar y vía FAB en mobile.

#### Consistencia: ✅ Completa
- **Color**: Amarillo (`#EAB308`) consistente mediante tokens en las 3 plataformas.
- **Header**: Implementado header estándar icónico en todas las plataformas.
- **Animaciones**: Entrada staggered y gestos interactivos en mobile.
- **Responsividad**: Layout optimizado para Tablet en Mobile (Widget lateral).

---

### 19. 🎤 Meetings

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/meetings` |
| **Desktop** | `/meetings` |
| **Mobile** | ❌ No disponible |

#### Funcionalidades
- **Subir transcripción** de reunión
- **Análisis con IA**:
  - Resumen
  - Puntos clave
  - Action items
  - Decisiones tomadas
  - Participantes
  - Temas
  - Sentimiento general
- **Crear tareas** desde action items

---

### 20. 📑 Reports

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/reports` |
| **Desktop** | `/reports` |
| **Mobile** | `/(internal)/weekly-monthly-reports.tsx` |

#### Funcionalidades
- **Reporte semanal** de productividad
- **Reporte mensual**
- **AI Weekly Report** con insights
- **Gráficos de rendimiento**
- **Resumen de objetivos cumplidos**

---

### 21. 🎯 Focus Mode

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/focus` |
| **Desktop** | `/focus` |
| **Mobile** | `/(internal)/focus-mode.tsx` |

#### Funcionalidades
- **Pantalla completa inmersiva**
- **Timer grande** centrado
- **Nombre de tarea actual**
- **Controles mínimos** (play/pause/stop/skip)
- **Botón para completar tarea**
- **Color del fondo** según modo
- **Fullscreen toggle**

---

### 22. 🗑️ Trash (Papelera)

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/trash` |
| **Desktop** | `/tasks/trash` |
| **Mobile** | `/(internal)/task-trash.tsx` |

#### Funcionalidades
- **Lista de tareas eliminadas**
- **Restaurar tarea**
- **Eliminar permanentemente**
- **Vaciar papelera**

---

### 23. 📆 Tasks by Period

| App | Ruta |
|-----|------|
| **Web** | Filtro en tasks |
| **Desktop** | `/tasks/:period` |
| **Mobile** | `/(internal)/tasks-period.tsx` |

#### Funcionalidades
- Ver tareas de **hoy**, **esta semana**, **este mes**
- Filtrado automático por fecha

---

### 24. 🎨 Creator Hub

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/creator/*` |
| **Desktop** | `/creator_hub` (SPA) |
| **Mobile** | `/(tabs)/creator.tsx` + subfichas |

#### Funcionalidades
- **Ideas** de contenido
- **Pipeline** de producción
- **Series** de contenido
- **Publishing** programación

#### Diferencias importantes
| Característica | Web | Mobile |
|----------------|-----|--------|
| Ideas | ✅ | ✅ |
| Pipeline | ✅ | ✅ |
| Series | ✅ | ✅ |
| Publishing | ✅ | ✅ |

---

### 25. 🤖 AI Chat

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/ai-chat` |
| **Desktop** | `/ai-chat` |
| **Mobile** | `/(internal)/ai-chat.tsx` |

#### Funcionalidades (Solo Mobile)
- **Chat con asistente AI**
- **Central action button** en tab bar
- Interfaz conversacional

---

### 26. 🔔 Notifications

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/(pages)/notifications` |
| **Desktop** | `/notifications` |
| **Mobile** | `/(internal)/notifications.tsx` |

#### Funcionalidades
- **Lista de notificaciones** tipo Inbox
- **Filtros** (Todas/No leídas)
- **Marcar como leídas** (individual o todas)
- **Categorización** por tipo
- **Navegación** desde popover (Web) o campana (Desktop)

---

### 27. 🔐 Auth/Login

| App | Ruta |
|-----|------|
| **Web** | `/[locale]/login` y `/[locale]/register` |
| **Desktop** | `/auth` |
| **Mobile** | `/(external)/auth.tsx` |

#### Funcionalidades
- **Login con email/password**
- **Registro**
- **OAuth** (Google, GitHub, etc)
- **Mobile: Login biométrico**

---

## 🎨 Consistencia de Diseño

### Colores por Sección

| Sección | Color | Hex |
|---------|-------|-----|
| Dashboard | Cyan | `#06b6d4` |
| Tasks | Violeta | `#8b5cf6` |
| Projects | Rosa | `#ec4899` |
| Workspaces | Naranja | `#f97316` |
| Calendar | Azul | `#3b82f6` |
| Timer | Dinámico | rojo/verde/azul |
| Goals | Rosa | `#ec4899` |
| Habits | Esmeralda | `#10B981` | ✅ Verificado |
| Analytics | Azul | `#3b82f6` |
| Eisenhower | Morado | `#a855f7` |
| Wellbeing | Rosa/Rojo | `#f43f5e` |
| Notes | Amarillo | `#eab308` |
| Tags | Índigo | `#6366f1` |

### Elementos Comunes entre apps

1. **Headers**: Icono en cuadrado redondeado + título + subtítulo
2. **Cards**: Bordes redondeados, sombras sutiles, hover effects
3. **Animaciones**: FadeIn, SlideIn, transiciones suaves
4. **Loading states**: Skeleton placeholders animados
5. **Empty states**: Icono grande + mensaje + CTA

---

## 📱 Mobile-First Considerations

Las siguientes funcionalidades **no están en mobile** y se consideran de baja prioridad por el espacio limitado:

1. ❌ Notes (tablero drag & drop no es práctico)
2. ❌ Meetings (requiere mucho texto/input)

4. ❌ Workspace Detail (simplificado)
5. ❌ Shared Task Page

Las siguientes funcionalidades **son exclusivas de mobile**:

1. ✅ AI Chat (experiencia conversacional)
2. ✅ Biometric Login (Face ID/huella)
3. ✅ Notifications screen dedicada
4. ✅ Quick actions desde tab bar

---

## 🔧 Recomendaciones

1. ✅ **Agregar Timer a Mobile**: Implementado con sync backend.
2. ✅ **Notes Mobile**: Versión simplificada lista implementada.
3. ✅ **Desktop Creator Hub**: Migrado a Desktop (Implementación completa con datos reales).
4. ✅ **Unificar Settings**: Separado Settings de Profile en Mobile.
5. ✅ **AI Chat everywhere**: Implementado en Web y Desktop.

---

*Documento generado el 2026-01-14*
