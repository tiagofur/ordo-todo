# 🖥️ Ordo-Todo Desktop App

**Framework**: Electron 39+ con React 19 + Vite  
**Plataformas**: Windows, macOS, Linux  
**Estado**: ✅ Funcional (v0.6.0)

---

## 🚀 Quick Start

```bash
# Desde la raíz del proyecto
cd apps/desktop
npm run dev
```

El app se abrirá automáticamente como ventana Electron.

---

## ✅ Features Implementados

### Features Nativos de Desktop

| Feature | Estado | Descripción |
|---------|--------|-------------|
| **System Tray** | ✅ | Mini timer + quick actions en tray |
| **Global Shortcuts** | ✅ | `Ctrl+Shift+S` timer, `Ctrl+Shift+N` nueva tarea |
| **Native Notifications** | ✅ | Alertas del sistema al terminar pomodoro |
| **Window State** | ✅ | Recuerda posición y tamaño |
| **Always on Top** | ✅ | Timer flotante |
| **Offline Mode** | ✅ | SQLite local + sync |
| **Auto-Update** | ✅ | Actualizaciones automáticas |
| **Multi-Window** | ✅ | Timer en ventana separada |
| **Deep Links** | ✅ | `ordo://task/123` |

### Shortcuts Globales

| Shortcut | Acción |
|----------|--------|
| `Ctrl+Shift+S` | Toggle Timer |
| `Ctrl+Shift+N` | Nueva Tarea Rápida |
| `Ctrl+Shift+O` | Mostrar/Ocultar Ventana |
| `Ctrl+Space` | Iniciar/Pausar Timer |
| `Ctrl+1-5` | Navegación rápida |
| `F11` | Pantalla Completa |
| `Ctrl+/` | Mostrar Atajos |

---

## 🏗️ Arquitectura

```
apps/desktop/
├── electron/               # Main Process
│   ├── main.ts             # Entry point
│   ├── preload.ts          # Preload script
│   ├── tray.ts             # System tray
│   ├── shortcuts.ts        # Global shortcuts
│   ├── notifications.ts    # Native notifications
│   └── window-state.ts     # Persistencia de ventana
│
├── src/                    # Renderer Process (React)
│   ├── components/         # Componentes React
│   ├── pages/              # Vistas principales
│   ├── stores/             # Zustand stores
│   ├── hooks/              # Custom hooks
│   └── lib/                # Utilities
│
└── resources/              # Assets
    └── icons/              # App icons
```

---

## 📦 Build y Distribución

### Desarrollo
```bash
npm run dev          # Desarrollo con HMR
```

### Producción
```bash
npm run build        # Build de producción
npm run package      # Crear instaladores

# Plataformas específicas
npm run package:win  # Windows (NSIS + Portable)
npm run package:mac  # macOS (DMG)
npm run package:linux # Linux (AppImage + DEB + RPM)
```

### Salida de builds
```
dist/
├── Ordo-Todo-Setup-1.0.0.exe   # Windows installer
├── Ordo-Todo-1.0.0.dmg         # macOS installer
├── Ordo-Todo-1.0.0.AppImage    # Linux portable
└── ordo-todo_1.0.0_amd64.deb   # Linux Debian
```

---

## 🔧 Configuración

### Variables de Entorno
```env
# .env
VITE_API_URL=http://localhost:3101
```

### electron-builder.yml
```yaml
appId: com.ordotodo.desktop
productName: Ordo-Todo
copyright: Copyright © 2025

win:
  target: [nsis, portable]
  
mac:
  target: [dmg]
  category: public.app-category.productivity

linux:
  target: [AppImage, deb, rpm]
```

---

## 🎯 Paridad con Web

### Features con Paridad Completa
- ✅ Dashboard + Widgets
- ✅ Timer Pomodoro
- ✅ Tasks CRUD
- ✅ Projects CRUD
- ✅ Analytics
- ✅ Settings
- ✅ i18n (es/en)

### En Progreso
- ⚠️ Kanban Board (básico)
- ⚠️ AI Reports

---

## 🔮 Roadmap Desktop

### Próximas Mejoras

1. **Kanban Completo** - Drag & drop con @dnd-kit
2. **AI Report Dialog** - Generar reportes con IA
3. **Calendar View** - Vista de calendario completa
4. **Focus Mode** - Modo concentración sin distracciones

---

## 🐛 Troubleshooting

### Ventana en blanco
```bash
# Limpiar cache
rm -rf dist .vite
npm run dev
```

### Tray no aparece
- Verificar que las APIs de Electron están expuestas en `preload.ts`
- Revisar logs en la consola de desarrollo

### Shortcuts no funcionan
- Verificar conflictos con otros programas
- Los shortcuts globales pueden requerir permisos en macOS

---

**Documentación técnica completa:** Ver [TECHNICAL_DESIGN.md](../design/TECHNICAL_DESIGN.md)
