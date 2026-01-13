# 📋 Reporte de Errores - apps/desktop

**Fecha:** 2026-01-12  
**Total de errores:** 14 errores en 11 archivos  
**Generado por:** TypeScript `tsc --noEmit`

---

## 🔴 Errores Críticos: `auth-provider` no existe

### Contexto
El archivo `apps/desktop/src/components/providers/auth-provider.tsx` **NO EXISTE**, pero varios archivos intentan importar desde esa ruta.

**El hook correcto está en:** `@ordo-todo/auth-provider` (paquete compartido en `packages/auth-provider`)

### Archivos afectados

#### 1. `src/pages/Auth.tsx` (línea 8)
```typescript
// ❌ Incorrecto
import { useAuth } from "../components/providers/auth-provider";

// ✅ Correcto
import { useAuth } from "@ordo-todo/auth-provider";
```

#### 2. `src/components/dashboard/AIInsightsWidget.tsx` (línea 23)
```typescript
// ❌ Incorrecto
import { useAuth } from "@/components/providers/auth-provider";

// ✅ Correcto
import { useAuth } from "@ordo-todo/auth-provider";
```

#### 3. `src/components/providers/index.tsx` (línea 2)
```typescript
// ❌ Incorrecto - Este archivo importa y re-exporta AuthProvider
import { AuthProvider } from "./auth-provider";

// ✅ Solución: Este archivo probablemente no se usa ya que App.tsx 
// ya importa directamente desde @ordo-todo/auth-provider.
// Verificar si `src/components/providers/index.tsx` es necesario.
```

**Nota:** `App.tsx` ya usa correctamente:
```typescript
import { AuthProvider } from "@ordo-todo/auth-provider";
```

---

## 🟡 Errores de Tipos - Workspace

### 4. `src/components/workspace/WorkspaceSettingsDialog.tsx` (línea 297)
```
error TS2322: Type '{ workspace: ...; owner: ... }' is not assignable to type 'IntrinsicAttributes & WorkspaceMembersSettingsProps'.
Property 'owner' does not exist on type 'WorkspaceMembersSettingsProps'
```

**Solución:** Revisar la interfaz `WorkspaceMembersSettingsProps` y agregar la prop `owner` o eliminarla del componente que la pasa.

### 5. `src/components/workspace/workspace-configuration-settings.tsx` (línea 79)
Error de tipos pendiente de investigar.

### 6. `src/components/workspace/invite-member-dialog.tsx` (línea 59) - 4 errores
```
error TS2322: Type '...' is not assignable to type 'Control<TFieldValues, any, TTransformedValues>'
```

**Contexto:** Errores con el `control` prop de React Hook Form en `FormField`.

**Posible causa:** 
- Incompatibilidad de versiones de `react-hook-form`
- Types incorrectos en el schema de zod

---

## 🟡 Errores de Imports - Layout

### 7. `src/components/layout/AppLayout.tsx` (línea 5)
Import no encontrado - verificar qué se está importando.

### 8. `src/components/layout/Sidebar.tsx` (línea 8)
Import no encontrado - posiblemente relacionado con iconos de lucide-react.

### 9. `src/components/layout/TopBar.tsx` (línea 4)
Import no encontrado.

---

## 🟡 Otros Errores

### 10. `src/components/notes/NoteBoard.tsx` (línea 78)
Error de tipo - valor no asignable.

### 11. `src/lib/shared-api-client.ts` (línea 3)
```typescript
// El tipo ApiClient podría no tener todas las propiedades requeridas
import type { ApiClient } from "@ordo-todo/api-client";
```

---

## 📊 Plan de Corrección (Orden Sugerido)

### Fase 1: Corregir imports de auth-provider (Prioridad Alta)
1. [x] `src/pages/Auth.tsx` → Cambiar import a `@ordo-todo/auth-provider`
2. [x] `src/components/dashboard/AIInsightsWidget.tsx` → Cambiar import
3. [x] `src/components/providers/index.tsx` → Evaluar si eliminar o corregir

### Fase 2: Corregir errores de Workspace (Prioridad Media)
4. [x] `WorkspaceSettingsDialog.tsx` → Agregar/quitar prop `owner`
5. [x] `workspace-configuration-settings.tsx` → Investigar error
6. [x] `invite-member-dialog.tsx` → Revisar types de react-hook-form

### Fase 3: Corregir errores de Layout (Prioridad Media)
7. [x] `AppLayout.tsx` → Verificar import
8. [x] `Sidebar.tsx` → Verificar import
9. [x] `TopBar.tsx` → Verificar import

### Fase 4: Otros errores (Prioridad Baja)
10. [x] `NoteBoard.tsx` → Corregir tipo
11. [x] `shared-api-client.ts` → Completar tipo ApiClient

---

## 🔍 Comandos útiles

```bash
# Ver errores de TypeScript
cd apps/desktop && npx tsc --noEmit

# Ver errores con más detalle
cd apps/desktop && npx tsc --noEmit --pretty false

# Ver solo errores de un archivo específico
# (no hay comando directo, pero puedes filtrar la salida)
cd apps/desktop && npx tsc --noEmit 2>&1 | findstr "Auth.tsx"
```

---

## 📝 Notas Adicionales

### Sobre `packages/auth-provider`
El paquete `@ordo-todo/auth-provider` exporta:
- `AuthProvider` - Componente provider
- `useAuth` - Hook para acceder al contexto de auth
- `defaultAuthContext` - Contexto por defecto
- Tipos: `AuthContextType`, `AuthProviderProps`, `PlatformType`, `AuthEvent`, `ApiClient`

### Arquitectura actual de Auth en Desktop
```
App.tsx
└── AuthProvider (de @ordo-todo/auth-provider)
    └── RouterProvider
        └── Componentes que usan useAuth()
```

Los componentes deberían importar `useAuth` directamente desde `@ordo-todo/auth-provider`, no desde un archivo local inexistente.

---

## ✅ Tareas Completadas Hoy (2026-01-12)

1. [x] Migrar `profile-tabs.tsx` de `@radix-ui/react-tabs` a `@ordo-todo/ui` Tabs
2. [x] Corregir `TimerWidget` en Sidebar (usaba stub vacío en lugar del funcional)
3. [x] Investigar arquitectura de Sidebar compartido entre web y desktop
4. [x] Documentar errores de TypeScript en desktop
