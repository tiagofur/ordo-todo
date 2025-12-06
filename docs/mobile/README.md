# 📱 Ordo-Todo Mobile App

**Framework**: React Native + Expo SDK 52+  
**Router**: Expo Router (file-based)  
**Estado**: 🚧 En Desarrollo (60%)

---

## 🚀 Quick Start

```bash
# Desde la raíz del proyecto
cd apps/mobile

# Instalar dependencias
npm install

# Iniciar desarrollo
npx expo start

# Opciones de ejecución
# - Presiona 'a' para Android emulator
# - Presiona 'i' para iOS simulator
# - Escanea QR con Expo Go app
```

---

## 📁 Estructura del Proyecto

```
apps/mobile/
├── app/                        # Expo Router (Pages)
│   ├── (auth)/                 # Auth screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── _layout.tsx
│   │
│   ├── (tabs)/                 # Tab navigation
│   │   ├── index.tsx           # Home/Today
│   │   ├── projects.tsx        # Projects list
│   │   ├── timer.tsx           # Pomodoro timer
│   │   ├── analytics.tsx       # Stats
│   │   └── _layout.tsx         # Tab bar config
│   │
│   ├── task/
│   │   └── [id].tsx            # Task detail
│   │
│   ├── project/
│   │   └── [id].tsx            # Project detail
│   │
│   ├── settings/
│   │   └── index.tsx           # Settings screen
│   │
│   ├── _layout.tsx             # Root layout
│   └── +not-found.tsx          # 404 screen
│
├── components/                 # Componentes React Native
│   ├── ui/                     # Base components
│   ├── task/                   # Task components
│   ├── project/                # Project components
│   └── timer/                  # Timer components
│
├── hooks/                      # Custom hooks
│   ├── useAuth.ts
│   ├── useTasks.ts
│   └── useTimer.ts
│
├── lib/                        # Utilities
│   ├── api.ts                  # API client
│   ├── storage.ts              # AsyncStorage helpers
│   └── theme.ts                # Theme config
│
├── stores/                     # Zustand stores
│   ├── auth-store.ts
│   └── timer-store.ts
│
├── assets/                     # Images, fonts
├── app.json                    # Expo config
├── eas.json                    # EAS Build config
└── package.json
```

---

## ✅ Features Implementados

| Feature | Estado | Notas |
|---------|--------|-------|
| Navigation | ✅ | Expo Router tabs + stack |
| Theme (Light/Dark) | ✅ | Sistema de temas |
| Task List | ✅ | Lista con swipe actions |
| Task Create | ✅ | Formulario básico |
| Task Detail | 🟡 | Parcial |
| Projects List | ✅ | Grid view |
| Timer UI | ✅ | Pomodoro visual |
| Timer Logic | 🟡 | Falta background |
| Analytics | 🟡 | Parcial |
| Settings | ✅ | Básico |
| Push Notifications | 🔴 | Pendiente |
| Offline Mode | 🔴 | Pendiente |
| OAuth Login | 🔴 | Pendiente |

---

## 🎯 Roadmap Mobile

### Fase 1: Core Features (En Progreso)
- [x] Setup Expo + Router
- [x] Navegación por tabs
- [x] Theme system
- [x] Task list básico
- [x] Timer UI
- [ ] Autenticación completa
- [ ] Task CRUD completo
- [ ] Subtareas

### Fase 2: Productividad
- [ ] Timer background mode
- [ ] Notificaciones locales
- [ ] Push notifications
- [ ] Widgets (iOS/Android)

### Fase 3: Offline & Sync
- [ ] SQLite local
- [ ] Sync queue
- [ ] Conflict resolution
- [ ] Background sync

### Fase 4: Polish
- [ ] Haptic feedback
- [ ] Gestures (swipe, long press)
- [ ] Animaciones Reanimated
- [ ] Deep linking

---

## 🔄 Código Compartido

**Estado:** 🔮 Futuro

Cuando el proceso de consolidación en `@ordo-todo/ui` esté completo, mobile podrá reutilizar:

### Packages ya disponibles

| Package | Uso en Mobile |
|---------|---------------|
| `@ordo-todo/core` | ✅ Entities, validaciones, business logic |
| `@ordo-todo/api-client` | ✅ Cliente HTTP tipado |
| `@ordo-todo/hooks` | ✅ React Query hooks (crear factory) |

### Packages pendientes de soporte mobile

| Package | Estado | Notas |
|---------|--------|-------|
| `@ordo-todo/ui` | 🔴 | Componentes son web-only (Radix UI) |
| `@ordo-todo/stores` | 🟡 | Zustand funciona, pero stores aún en apps |

### Alternativa para Mobile

Los componentes UI en mobile usan **React Native Paper** en lugar de shadcn/ui. Sin embargo, se pueden compartir:

- Hooks de datos (`@ordo-todo/hooks`)
- Lógica de dominio (`@ordo-todo/core`)
- Tipos y DTOs (`@ordo-todo/api-client`)
- Stores de estado (`@ordo-todo/stores` - futuro)

> Ver [packages/README.md](../packages/README.md) para más detalles.

## 🔧 Configuración

### Variables de Entorno

```env
# .env
EXPO_PUBLIC_API_URL=http://192.168.1.X:3101
```

> **Nota**: Para desarrollo, usa tu IP local en lugar de `localhost`

### app.json

```json
{
  "expo": {
    "name": "Ordo-Todo",
    "slug": "ordo-todo",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "scheme": "ordo",
    "userInterfaceStyle": "automatic",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.ordotodo.app"
    },
    "android": {
      "package": "com.ordotodo.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2563EB"
      }
    }
  }
}
```

---

## 📦 Dependencias Clave

```json
{
  "dependencies": {
    "expo": "~52.0.0",
    "expo-router": "~4.0.0",
    "react-native": "0.76.x",
    
    // UI
    "react-native-paper": "^5.x",
    "react-native-reanimated": "~3.x",
    "react-native-gesture-handler": "~2.x",
    
    // State
    "@tanstack/react-query": "^5.x",
    "zustand": "^5.x",
    
    // Storage
    "@react-native-async-storage/async-storage": "^2.x",
    "expo-secure-store": "~14.x",
    
    // Notifications
    "expo-notifications": "~0.29.x"
  }
}
```

---

## 🛠️ Comandos de Desarrollo

```bash
# Desarrollo
npx expo start                    # Iniciar dev server
npx expo start --clear            # Limpiar cache
npx expo start --android          # Directo a Android
npx expo start --ios              # Directo a iOS

# Build
eas build --platform android      # Build Android APK/AAB
eas build --platform ios          # Build iOS IPA
eas build --platform all          # Ambas plataformas

# Publicar
eas update                        # OTA update
eas submit --platform ios         # Submit a App Store
eas submit --platform android     # Submit a Play Store

# Testing
npm run lint                      # ESLint
npm run check-types               # TypeScript
```

---

## 🔌 Integración con Backend

```typescript
// lib/api.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## 🎨 Theming

```typescript
// lib/theme.ts
export const lightTheme = {
  colors: {
    primary: '#2563EB',
    background: '#FFFFFF',
    surface: '#F3F4F6',
    text: '#111827',
    textSecondary: '#6B7280',
  },
};

export const darkTheme = {
  colors: {
    primary: '#60A5FA',
    background: '#111827',
    surface: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
  },
};
```

---

## 🐛 Troubleshooting

### Metro bundler cache
```bash
npx expo start --clear
```

### Pods issues (iOS)
```bash
cd ios
pod install --repo-update
cd ..
npx expo start
```

### Build fails
```bash
eas build --platform android --clear-cache
```

---

## 📚 Referencias

- [Expo Docs](https://docs.expo.dev)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [React Native Paper](https://callstack.github.io/react-native-paper/)
- [EAS Build](https://docs.expo.dev/build/introduction/)
