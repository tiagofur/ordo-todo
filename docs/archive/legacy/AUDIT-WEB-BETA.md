# 🔒 Auditoría Web App para Beta en Producción

**Fecha**: Enero 13, 2026  
**Estado**: Auditoría en progreso
**Objetivo**: App web funcional para beta en producción

---

## 📊 Resumen Ejecutivo

| Categoría | Estado | Errores | Prioridad |
|-----------|--------|---------|-----------|
| **API Client** | ❌ Crítico | 6 | 🔴 Máxima |
| **Search** | ❌ Roto | 2 | 🔴 Máxima |
| **Auth** | ⚠️ Parcial | 2 | 🔴 Alta |
| **Workspaces** | ⚠️ Parcial | 1 | 🟡 Media |
| **Imports** | ⚠️ Limpieza | 11 | 🟡 Media |
| **Tests** | ❌ Roto | 6 | 🟢 Baja |
| **Otros** | ⚠️ Menor | 2 | 🟢 Baja |

**Total**: 30 errores TypeScript

---

## 🔴 FASE 1: Críticos para Producción (1-2 horas)

### 1.1 Arreglar API Client Duplicado 🔴 MÁXIMA

**Problema**: 
- `apps/web/src/lib/api-client.ts` tiene 1070 líneas de código
- `packages/api-client` ya tiene la implementación completa
- Múltiples exportaciones duplicadas causan errores

**Archivos afectados**:
1. `apps/web/src/lib/api-client.ts` - Eliminar o simplificar
2. `apps/web/src/lib/shared-api-client.ts` - Eliminar

**Acción**:
```bash
# Opción A: Eliminar completamente (RECOMENDADO)
rm apps/web/src/lib/api-client.ts
rm apps/web/src/lib/shared-api-client.ts

# Luego actualizar todos los imports:
# from "@/lib/api-client" → from "@ordo-todo/api-client/api-instance"
# from "@/lib/shared-api-client" → from "@ordo-todo/api-client/api-instance"
```

**Archivos a verificar imports**:
- `src/components/search/smart-search.tsx`
- `src/components/settings/sessions-manager.tsx`
- `src/lib/api-hooks.ts`

**Verificación**:
```bash
cd apps/web
npm run check-types | grep api-client
```

**Esperado**: 0 errores de api-client

---

### 1.2 Arreglar Métodos de Búsqueda 🔴 MÁXIMA

**Problema**:
- `smart-search.tsx` usa `apiClient.semanticSearch()` y `apiClient.searchSuggestions()`
- Estos métodos NO existen en el tipo `OrdoApiClient`
- La búsqueda NO funcionará en producción

**Archivos afectados**:
1. `packages/api-client/src/client.ts` - Ya tiene los métodos implementados
2. `packages/api-client/src/types/search.types.ts` - Tipos exportados
3. `apps/web/src/components/search/smart-search.tsx` - Uso incorrecto

**Estado actual**: ✅ Métodos ya implementados en `packages/api-client`

**Acción**: Actualizar `smart-search.tsx` para usar los métodos del paquete:

```typescript
// Cambiar esto:
import { apiClient } from "@/lib/api-client";

// Por esto:
import { apiClient } from "@ordo-todo/api-client/api-instance";
```

**Verificación**:
```bash
cd apps/web
npm run check-types | grep smart-search
```

**Esperado**: 0 errores en smart-search

---

## 🟡 FASE 2: Funcionalidad Principal (2-3 horas)

### 2.1 Arreglar Auth para Producción 🟡 ALTA

**Problemas**:
1. Logout usa `window.location.href = "/login"` (hard navigation)
2. No hay redirección correcta después de login/logout
3. Auth provider está integrado pero sidebar usa `@ordo-todo/auth-provider`

**Archivos afectados**:
1. `apps/web/src/components/providers/auth-provider.tsx`
2. `apps/web/src/components/shared/sidebar.tsx`

**Acciones**:

#### Acción 2.1.1: Mejorar logout en sidebar.tsx

```typescript
// Cambiar esto en sidebar.tsx (handleLogout):
const handleLogout = async () => {
  try {
    await authLogout();
    // Usar soft navigation
    router.push('/login');
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

#### Acción 2.1.2: Agregar redirección después de login

El auth-provider del paquete ya maneja esto, pero verificar que funcione.

**Verificación**:
```bash
cd apps/web
npm run check-types | grep -E "sidebar|auth-provider"
```

**Esperado**: 0 errores en auth

---

### 2.2 Arreglar Workspace Types 🟡 MEDIA

**Problema**:
- `WorkspaceData` en packages/ui espera `type`, no `tier`
- `Workspace` en api-client tiene `tier`, no `type`
- Esto causa incompatibilidad

**Archivos afectados**:
1. `packages/ui/src/components/workspace/workspace-card.tsx`
2. `packages/api-client/src/types/workspace.types.ts`

**Acción**: Agregar `type` como campo opcional en Workspace (compatibilidad):

```typescript
// packages/api-client/src/types/workspace.types.ts
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  tier: WorkspaceTier;
  type?: 'PERSONAL' | 'WORK' | 'TEAM'; // ← AGREGAR
  ownerId: string | null;
  // ... resto
}
```

**Verificación**:
```bash
cd packages/ui
npm run check-types | grep workspace-card
```

**Esperado**: 0 errores en workspace-card

---

## 🟢 FASE 3: Limpieza de Imports (1-2 horas)

### 3.1 Arreglar Imports Incorrectos 🟢 MEDIA

**Problemas**:
- `app-layout.tsx` importa `./sidebar` (no existe, es `mobile-sidebar`)
- `internal-page.component.tsx` importa `@/components/shared/sidebar` (no existe, es `mobile-sidebar`)

**Archivos afectados**:
1. `apps/web/src/components/shared/app-layout.tsx`
2. `apps/web/src/components/template/internal-page.component.tsx`

**Acción**:

#### Acción 3.1.1: Corregir app-layout.tsx

```typescript
// Cambiar:
import Sidebar from './mobile-sidebar';
// Por:
import { Sidebar } from '@ordo-todo/ui';
```

#### Acción 3.1.2: Corregir internal-page.component.tsx

```typescript
// Cambiar:
import { Sidebar } from '@/components/shared/mobile-sidebar';
// Por:
import { Sidebar } from '@ordo-todo/ui';
```

**Verificación**:
```bash
cd apps/web
npm run check-types | grep -E "app-layout|internal-page"
```

**Esperado**: 0 errores en estos archivos

---

## 🟢 FASE 4: Tests (1 hora, opcional para beta)

### 4.1 Arreglar Tests de Workspace 🟢 BAJA

**Problemas**:
- Tests usan `tier` que no existe en `Workspace` mock
- `useCreateWorkspace` no importado
- `act` no importado de @testing-library/react
- `createMockWorkspace` retorna `undefined`

**Archivos afectados**:
1. `apps/web/src/lib/__tests__/workspace-hooks.test.tsx`

**Acciones**:

#### Acción 4.1.1: Agregar imports

```typescript
import { act } from "@testing-library/react";
import { useCreateWorkspace } from "@ordo-todo/hooks";
```

#### Acción 4.1.2: Corregir mock de Workspace

```typescript
const createMockWorkspace = (overrides?: Partial<Workspace>): Workspace => ({
  id: "workspace-123",
  name: "Test Workspace",
  slug: "test",
  color: "#2563EB",
  icon: null,
  tier: "FREE",
  ownerId: "user-123",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
```

#### Acción 4.1.3: Corregir test

```typescript
it("should create workspace successfully", async () => {
  const resultWorkspace = createMockWorkspace({ id: "new-workspace" });

  const { result } = renderHook(() => useCreateWorkspace(), {
    wrapper: createWrapper(queryClient),
  });

  vi.mocked(mockClient.createWorkspace).mockResolvedValue(resultWorkspace);

  await act(async () => {
    await result.current.mutateAsync({
      name: "New",
      slug: "new",
    });
  });

  expect(mockClient.createWorkspace).toHaveBeenCalledWith({
    name: "New",
    slug: "new",
  });
  expect(result.current.data).toEqual(resultWorkspace);
});
```

**Verificación**:
```bash
cd apps/web
npm run check-types | grep workspace-hooks
```

**Esperado**: 0 errores en workspace-hooks

---

### 4.2 Eliminar Export Duplicados de API Client 🟢 BAJA

**Problema**:
- `apps/web/src/lib/api-client.ts` tiene múltiples exportaciones duplicadas
- Causa errores de TypeScript

**Acción**: Eliminar estas líneas del final del archivo:

```typescript
// ELIMINAR:
// Export apiClient instance for easy importing
export { apiClient as default, apiClient };
export { apiClient as default, apiClient };
```

**Verificación**:
```bash
cd apps/web
npm run check-types | grep "api-client"
```

**Esperado**: 0 errores de api-client

---

## 📋 Checklist de Verificación para Producción

### Funcionalidad Crítica (DEBE funcionar):

- [ ] **Auth**: Login funciona
- [ ] **Auth**: Logout funciona
- [ ] **Auth**: Sesiones activas visibles
- [ ] **Auth**: Revocar sesiones funciona
- [ ] **Workspaces**: Listar workspaces funciona
- [ ] **Workspaces**: Crear workspace funciona
- [ ] **Workspaces**: Eliminar workspace funciona
- [ ] **Búsqueda**: Búsqueda semántica funciona
- [ ] **Búsqueda**: Autocomplete funciona
- [ ] **Búsqueda**
