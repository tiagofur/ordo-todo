# 🖥️ Ordo-Todo Desktop

**Versión 1.0.0** | Aplicación de productividad moderna con gestión de tareas y Pomodoro.

![Ordo-Todo Desktop](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Electron](https://img.shields.io/badge/electron-39.x-47848F.svg)
![React](https://img.shields.io/badge/react-19.x-61DAFB.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📦 Descargas

| Plataforma | Descarga | Tipo |
|------------|----------|------|
| **Windows** | [Ordo-Todo-Setup-1.0.0.exe](https://github.com/tiagofur/ordo-todo/releases) | Instalador |
| **Windows** | [Ordo-Todo-1.0.0-portable.exe](https://github.com/tiagofur/ordo-todo/releases) | Portable |
| **macOS** | [Ordo-Todo-1.0.0.dmg](https://github.com/tiagofur/ordo-todo/releases) | DMG |
| **Linux** | [Ordo-Todo-1.0.0.AppImage](https://github.com/tiagofur/ordo-todo/releases) | AppImage |
| **Linux** | [ordo-todo_1.0.0_amd64.deb](https://github.com/tiagofur/ordo-todo/releases) | DEB |
| **Linux** | [ordo-todo-1.0.0.x86_64.rpm](https://github.com/tiagofur/ordo-todo/releases) | RPM |

---

## ✨ Características

### 📋 Gestión de Tareas
- Crear, editar y completar tareas
- Prioridades (Baja, Media, Alta, Urgente)
- Estados (Pendiente, En Progreso, Completada)
- Subtareas, comentarios y adjuntos
- Organización por proyectos y etiquetas

### ⏱️ Timer Pomodoro
- Intervalos configurables (25/5/15 min por defecto)
- Auto-inicio de descansos y pomodoros
- Notificaciones al completar
- Timer flotante siempre visible

### 📊 Analytics
- Gráfico semanal de pomodoros
- Mapa de calor de horas pico
- Focus Score (0-100)
- Insights de productividad

### 🖥️ Funciones Desktop
- **System Tray**: Controles rápidos desde la bandeja
- **Atajos Globales**: `Ctrl+Shift+P` para timer, `Ctrl+N` para tarea
- **Notificaciones Nativas**: Alertas del sistema operativo
- **Auto-Start**: Iniciar con el sistema
- **Auto-Update**: Actualizaciones automáticas
- **Deep Links**: URLs `ordo://` para navegación directa

### 🔄 Modo Offline
- Base de datos SQLite local
- Sincronización automática al reconectar
- Indicador de estado de conexión

### 🌐 Multi-idioma
- Español
- English

---

## 🚀 Desarrollo

### Requisitos
- Node.js 20+
- npm 10+

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tiagofur/ordo-todo.git
cd ordo-todo

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev --filter=@ordo-todo/desktop
```

### Scripts

```bash
# Desarrollo
npm run dev              # Vite dev server
npm run electron:dev     # Vite + Electron

# Build
npm run build            # Build completo
npm run build:win        # Windows (NSIS + Portable)
npm run build:mac        # macOS (DMG)
npm run build:linux      # Linux (AppImage, DEB, RPM)
npm run build:all        # Todas las plataformas

# Utilidades
npm run clean            # Limpiar builds
npm run generate-icons   # Regenerar iconos
```

---

## 📁 Estructura

```
apps/desktop/
├── build/               # Recursos de distribución
│   ├── icon.svg         # Ícono fuente
│   ├── icon.png/ico/icns
│   └── entitlements.mac.plist
├── electron/            # Proceso principal
│   ├── main.ts          # Entry point
│   ├── preload.ts       # APIs seguras
│   ├── tray.ts          # System tray
│   ├── shortcuts.ts     # Atajos globales
│   ├── notifications.ts # Notificaciones
│   ├── timer-window.ts  # Ventana flotante
│   ├── deep-links.ts    # Protocolo ordo://
│   ├── auto-updater.ts  # Actualizaciones
│   ├── auto-launch.ts   # Inicio con sistema
│   └── database/        # SQLite offline
├── src/                 # Renderer (React)
│   ├── components/      # Componentes UI
│   ├── pages/           # Páginas
│   ├── stores/          # Zustand stores
│   ├── hooks/           # Custom hooks
│   ├── i18n/            # Traducciones
│   └── lib/             # Utilidades
├── USER_GUIDE.md        # Guía del usuario
├── CHANGELOG.md         # Historial de cambios
└── package.json
```

---

## 🛠️ Stack Técnico

| Categoría | Tecnología |
|-----------|------------|
| **Runtime** | Electron 39.x |
| **UI Framework** | React 19.x |
| **Build Tool** | Vite 7.x |
| **Language** | TypeScript 5.9 |
| **State** | Zustand 5.x |
| **Server State** | TanStack Query 5.x |
| **Styling** | TailwindCSS 4.x |
| **Components** | shadcn/ui (Radix) |
| **Animations** | Framer Motion 11.x |
| **Charts** | Recharts 2.x |
| **Database** | better-sqlite3 |
| **i18n** | i18next |

---

## 📖 Documentación

- [Guía del Usuario](./USER_GUIDE.md)
- [Changelog](./CHANGELOG.md)
- [Roadmap](../../docs/desktop/roadmap.md)

---

## 📄 Licencia

MIT © Ordo-Todo Team
