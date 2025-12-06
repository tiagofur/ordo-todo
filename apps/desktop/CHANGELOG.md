# Changelog

Todos los cambios notables de Ordo-Todo Desktop serán documentados en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [1.0.0] - 2025-12-04

### 🎉 Primera Versión Estable

Esta es la primera versión estable de Ordo-Todo Desktop, una aplicación de productividad 
moderna que combina gestión de tareas con la técnica Pomodoro.

### ✨ Agregado

#### Core Features
- **Gestión de Tareas**: CRUD completo con prioridades, estados y fechas
- **Timer Pomodoro**: Intervalos de trabajo/descanso configurables
- **Proyectos**: Organización de tareas por proyectos
- **Etiquetas**: Sistema de etiquetas con colores personalizables
- **Workspaces**: Múltiples espacios de trabajo

#### Desktop Features
- **System Tray**: Ícono en bandeja con controles rápidos
- **Atajos Globales**: Control desde cualquier aplicación
- **Notificaciones Nativas**: Alertas del sistema operativo
- **Timer Flotante**: Ventana always-on-top con mini timer
- **Auto-Start**: Iniciar con el sistema operativo
- **Auto-Update**: Actualizaciones automáticas

#### Analytics
- **Gráfico Semanal**: Pomodoros completados por día
- **Mapa de Calor**: Horas pico de productividad
- **Focus Score**: Puntuación de enfoque 0-100
- **Insights**: Sugerencias personalizadas

#### Offline Mode
- **Base de datos SQLite**: Almacenamiento local completo
- **Sync Engine**: Sincronización automática al reconectar
- **Resolución de Conflictos**: Last-write-wins strategy
- **Indicador de Estado**: Visual del estado de sincronización

#### UI/UX
- **Tema Claro/Oscuro**: Con soporte para preferencia del sistema
- **Internacionalización**: Español e Inglés
- **Animaciones**: Transiciones fluidas con Framer Motion
- **Accesibilidad**: WCAG AA, skip links, ARIA labels

#### Deep Links
- Protocolo `ordo://` registrado
- Soporta: tasks, projects, workspaces, timer, settings

### 🔧 Técnico

#### Stack
- Electron 39.x
- React 19.x
- Vite 7.x
- TypeScript 5.9
- Zustand 5.x
- TanStack Query 5.x
- TailwindCSS 4.x
- better-sqlite3

#### Distribución
- **Windows**: NSIS installer + Portable
- **macOS**: DMG (x64 + arm64)
- **Linux**: AppImage, DEB, RPM

---

## [0.6.0] - 2025-12-04

### Agregado
- Timer Window flotante
- Deep Links (ordo://)
- Auto-updates con electron-updater
- Auto-start al iniciar el sistema
- Configuración de escritorio en Settings

---

## [0.5.0] - 2025-12-03

### Agregado
- Base de datos SQLite local con better-sqlite3
- CRUD de tareas offline
- Sync engine con cola de cambios
- Resolución de conflictos
- Indicador de estado de sincronización

---

## [0.4.0] - 2025-12-02

### Agregado
- AI Weekly Reports (generador de reportes inteligentes)
- Internacionalización (Español/English)
- Animaciones con Framer Motion
- Auditoría de accesibilidad (WCAG AA)
- Optimización de rendimiento (code splitting)

---

## [0.3.0] - 2025-12-01

### Agregado
- Dashboard de Analytics completo
- Gráfico semanal con Recharts
- Mapa de calor de horas pico
- Focus Score gauge
- Productivity Insights
- Kanban board con drag & drop
- Project Timeline (Gantt-like)
- Task Detail Panel mejorado

---

## [0.2.0] - 2025-11-30

### Agregado
- System Tray con mini timer
- Atajos de teclado globales
- Notificaciones nativas
- Dashboard widgets
- FAB con acciones rápidas
- Persistencia de estado de ventana
- Menú de aplicación nativo

---

## [0.1.0] - 2025-11-25

### Agregado
- Estructura base Electron + React + Vite
- Routing con react-router-dom
- Componentes UI básicos (shadcn/ui)
- CRUD de tareas básico
- Timer Pomodoro básico
- Sistema de temas (claro/oscuro)
- Selector de workspaces

---

[1.0.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v1.0.0
[0.6.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.6.0
[0.5.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.5.0
[0.4.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.4.0
[0.3.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.3.0
[0.2.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.2.0
[0.1.0]: https://github.com/tiagofur/ordo-todo/releases/tag/v0.1.0
