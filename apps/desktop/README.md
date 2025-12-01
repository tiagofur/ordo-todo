# Ordo-Todo Desktop App

Aplicación de escritorio para Ordo-Todo construida con Electron + React.

## 🚀 Inicio Rápido

### Desde el root del monorepo:

```bash
# Instalar dependencias
npm install

# Ejecutar la app de desktop
npm run dev:desktop
```

### Desde la carpeta de desktop:

```bash
cd apps/desktop

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# En otra terminal, ejecutar Electron
npm run electron
```

## 🏗️ Build y Distribución

### Builds Locales

```bash
# Generar builds para todas las plataformas
npm run build:all

# Builds específicos por plataforma
npm run build:win     # Windows (NSIS + Portable)
npm run build:mac     # macOS (DMG)
npm run build:linux   # Linux (AppImage + DEB + RPM)
```

### Archivos Generados

Después del build, encontrarás los instaladores en `dist/`:

- **Windows**: `Ordo-Todo Setup 0.1.0.exe` (instalador) + `Ordo-Todo 0.1.0.exe` (portable)
- **macOS**: `Ordo-Todo-0.1.0.dmg` (imagen de disco)
- **Linux**: `Ordo-Todo-0.1.0.AppImage` (AppImage)

### CI/CD Automático

Los builds se ejecutan automáticamente en GitHub Actions cuando:

- Se hace push a la rama `main`
- Se modifican archivos en `apps/desktop/`

Los releases se crean automáticamente con assets separados por plataforma.

### CI/CD Automático

Los builds se ejecutan automáticamente en GitHub Actions cuando:

- Se hace push a la rama `main`
- Se modifican archivos en `apps/desktop/`

Los releases se crean automáticamente con assets separados por plataforma.

## 🛠️ Tecnologías

- **Electron 33.2.1** - Framework de escritorio
- **React 19.2.0** - UI Framework
- **Vite 6.0.7** - Build tool
- **Tailwind CSS v4** - Styling
- **TypeScript 5.9.3** - Type safety
- **Lucide React** - Iconos

## 📁 Estructura

```
apps/desktop/
├── electron/
│   ├── main.ts          # Proceso principal de Electron
│   └── preload.ts       # APIs seguras para el renderer
├── src/
│   ├── components/      # Componentes React
│   │   ├── TitleBar.tsx # Barra de título personalizada
│   │   ├── Sidebar.tsx  # Navegación lateral
│   │   └── MainContent.tsx # Contenido principal
│   ├── App.tsx          # App principal
│   ├── App.css          # Estilos globales
│   ├── index.css        # CSS de Tailwind
│   ├── main.tsx         # Punto de entrada
│   └── lib/utils.ts     # Utilidades
├── build/               # Recursos de build
│   ├── icon.svg         # Icono fuente
│   ├── icon.png         # Icono Linux
│   ├── icon.ico         # Icono Windows
│   ├── icon.icns        # Icono macOS
│   └── entitlements.mac.plist # Permisos macOS
├── scripts/             # Scripts de utilidad
│   └── generate-icons.js # Generador de iconos
├── index.html           # HTML base
├── vite.config.ts       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind
├── postcss.config.mjs   # Configuración de PostCSS
└── package.json         # Dependencias y scripts
```

## 🎯 Características

### ✅ Implementadas

- ✅ Interfaz moderna con React + Tailwind
- ✅ Tema claro/oscuro
- ✅ Controles de ventana personalizados (minimizar, maximizar, cerrar)
- ✅ Navegación lateral
- ✅ Dashboard básico
- ✅ Single instance (solo una ventana)
- ✅ DevTools en desarrollo

### 🔄 Próximas

- 🔄 Build pipeline para Windows/macOS/Linux
- 🔄 Icono de bandeja del sistema
- 🔄 Notificaciones del sistema
- 🔄 Atajos de teclado
- 🔄 Integración con web app (compartir código)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia Vite dev server
npm run electron         # Inicia Electron (espera a Vite)
npm run electron:dev     # Ejecuta ambos concurrentemente

# Build
npm run build            # Build para producción
npm run build:win        # Build para Windows
npm run build:mac        # Build para macOS
npm run build:linux      # Build para Linux

# Preview
npm run preview          # Preview del build
```

## 🏗️ Arquitectura

La app usa una arquitectura moderna con:

1. **Proceso Principal** (`electron/main.ts`): Maneja la ventana, IPC, y APIs del sistema
2. **Proceso Renderer** (`src/`): React app que corre en la ventana
3. **Preload Script** (`electron/preload.ts`): Puente seguro entre procesos

### Comunicación entre Procesos

```typescript
// En el renderer (React)
window.electronAPI.minimizeWindow();
window.electronAPI.maximizeWindow();
window.electronAPI.closeWindow();

// En el main process
ipcMain.handle("minimize-window", () => {
  win?.minimize();
});
```

## 🎨 UI/UX

- **Diseño**: Inspirado en aplicaciones modernas como VS Code, Slack
- **Tema**: Soporte completo para modo claro y oscuro
- **Responsive**: Adaptable a diferentes tamaños de ventana
- **Accesible**: Navegación por teclado, contraste adecuado

## 📦 Build y Distribución

La app se puede empaquetar para múltiples plataformas usando `electron-builder`:

```bash
# Windows
npm run build:win

# macOS
npm run build:mac

# Linux
npm run build:linux
```

Los builds se generan en la carpeta `dist/` con instaladores nativos para cada plataforma.

## 🔍 Desarrollo

### DevTools

- Automáticamente abiertas en modo desarrollo
- DevTools de Chrome para debugging del renderer
- Console del main process visible en terminal

### Hot Reload

- Vite proporciona hot reload para cambios en React
- Electron se recarga automáticamente cuando cambian los archivos del main process

### Debugging

```bash
# Ver logs del main process
npm run electron  # Los logs aparecen en la terminal

# Debug del renderer process
# Abre DevTools con F12 o desde el menú
```

## 🚀 Próximos Pasos

1. **Integración con Web App**: Compartir componentes y lógica de negocio
2. **Funcionalidades Específicas**: Notificaciones, shortcuts, tray icon
3. **Build Pipeline**: CI/CD para releases automáticos
4. **Testing**: Unit tests y E2E con Playwright
5. **Optimización**: Bundle splitting, lazy loading, PWA features
