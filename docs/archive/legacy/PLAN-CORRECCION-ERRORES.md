# 📋 Plan de Corrección de Errores - Guía Paso a Paso

**Fecha**: Enero 12, 2026  
**Estado**: Documentación para continuar en casa

---

## 📊 Resumen del Estado Actual

| Componente      | Errores TS | Estado Funcional | Prioridad |
|-----------------|------------|------------------|-----------|
| **apps/web**     | 42         | ❌ Roto         | 🔴 Alta   |
| **packages/ui**   | 14         | ❌ Roto         | 🔴 Alta   |
| **packages/api-client** | 0       | ✅ Funcional     | ✅ OK     |
| **packages/core** | 0         | ✅ Funcional     | ✅ OK     |
| **apps/backend** | 0         | ✅ Funcional     | ✅ OK     |

---

## 🔴 FASE 1: Errores Críticos (Funcionalidad Rota)

### 1.1. Agregar métodos de búsqueda al API Client Package

**Ubicación**: `packages/api-client/src/client.ts`

**Problema**: El frontend intenta usar métodos que NO existen en el api-client del paquete.

**Métodos faltantes**:
- `semanticSearch(query: string, options?: SearchOptions): Promise<SearchResponse>`
- `searchSuggestions(query: string): Promise<SuggestionsResponse>`
- `askAI(question: string): Promise<AIAnswerResponse>`
- `quickSearch(query: string): Promise<QuickSearchResponse>`

**Archivos a modificar**:
1. `packages/api-client/src/client.ts` - Agregar los 4 métodos
2. `packages/api-client/src/types/search.types.ts` - Asegurar que exporte los tipos

---

#### PASO 1.1.1: Agregar tipos de búsqueda

**Archivo**: `packages/api-client/src/types/search.types.ts`

Busca y/o agrega estas interfaces al final del archivo:

```typescript
export interface SearchOptions {
  types?: Array<'task' | 'project' | 'habit'>;
  projectId?: string;
  includeCompleted?: boolean;
  limit?: number;
}

export interface SearchResult {
  id: string;
  type: 'task' | 'project' | 'habit';
  title: string;
  score: number;
  metadata?: {
    projectName?: string;
    status?: string;
    priority?: string;
  };
}

export interface SearchResponse {
  results: SearchResult[];
  interpretation: string | null;
  totalCount: number;
}

export interface SearchSuggestion {
  text: string;
  type: 'query' | 'task';
  count: number;
}

export interface SuggestionsResponse {
  suggestions: SearchSuggestion[];
}

export interface AIAnswerResponse {
  answer: string;
  type: 'summary' | 'error';
  data?: {
    totalCount?: number;
    highPriority?: number;
    dueThisWeek?: number;
  };
}

export interface QuickSearchResult {
  id: string;
  type: 'task' | 'project';
  title: string;
  subtitle: string;
}

export interface QuickSearchResponse {
  results: QuickSearchResult[];
}
```

**Verificar**: El archivo debe terminar con estas exportaciones.

---

#### PASO 1.1.2: Agregar métodos a la clase OrdoApiClient

**Archivo**: `packages/api-client/src/client.ts`

**Ubicación exacta**: Agrega estos métodos después de `async getCurrentUser()` (aprox línea 690)

Busca este patrón:
```typescript
  async getCurrentUser(): Promise<UserResponse> {
    const response = await this.axios.get<UserResponse>("/users/me");
    return response.data;
  }
```

Justo después de ese bloque, agrega:

```typescript
  // ============ SEARCH METHODS ============
  
  /**
   * Semantic search across all user content
   * GET /search
   */
  async semanticSearch(
    query: string,
    options?: {
      types?: string;
      projectId?: string;
      includeCompleted?: boolean;
      limit?: number;
    }
  ): Promise<SearchResponse> {
    const params: any = { q: query };
    if (options?.types) params.types = options.types;
    if (options?.projectId) params.projectId = options.projectId;
    if (options?.includeCompleted !== undefined) params.includeCompleted = options.includeCompleted;
    if (options?.limit) params.limit = options.limit;

    const response = await this.axios.get<SearchResponse>("/search", { params });
    return response.data;
  }

  /**
   * Get search suggestions based on partial input
   * GET /search/suggestions
   */
  async searchSuggestions(query: string): Promise<SuggestionsResponse> {
    const response = await this.axios.get<SuggestionsResponse>("/search/suggestions", {
      params: { q: query },
    });
    return response.data;
  }

  /**
   * Ask natural language questions about your data
   * GET /search/ask
   */
  async askAI(question: string): Promise<AIAnswerResponse> {
    const response = await this.axios.get<AIAnswerResponse>("/search/ask", {
      params: { q: question },
    });
    return response.data;
  }

  /**
   * Quick search for autocomplete
   * GET /search/quick
   */
  async quickSearch(query: string): Promise<QuickSearchResponse> {
    const response = await this.axios.get<QuickSearchResponse>("/search/quick", {
      params: { q: query },
    });
    return response.data;
  }
```

**IMPORTANTE**: Estos métodos deben estar dentro de la clase `OrdoApiClient`, NO fuera.

---

#### PASO 1.1.3: Actualizar exports del index.ts

**Archivo**: `packages/api-client/src/index.ts`

Asegúrate de que tenga estas líneas al final:

```typescript
// Search types
export * from './types/search.types';
```

---

#### PASO 1.1.4: Verificar la implementación

**Comando**:
```bash
cd packages/api-client
npm run check-types
```

**Resultado esperado**: `0 errores`

**Si hay errores**:
- Verifica que todos los tipos estén importados correctamente
- Verifica que los métodos estén dentro de la clase `OrdoApiClient`
- Verifica que el `return response.data` tenga el tipo correcto

---

### 1.2. Corregir import de useAuth en sidebar

**Archivo**: `apps/web/src/components/shared/sidebar.tsx`

**Problema**: Import dinámico incorrecto que no exporta `logout` correctamente.

**Ubicación**: Líneas 113-115 (aprox)

**Código INCORRECTO actual**:
```typescript
const { logout } = await import("@ordo-todo/auth-provider")
  .then(m => ({ useAuth: m.useAuth }));
const { logout: authLogout } = useAuth();
```

**Código CORRECTO**:

#### PASO 1.2.1: Agregar import al principio del archivo

Busca la sección de imports (líneas 1-15) y agrega:

```typescript
import { useAuth } from "@ordo-todo/auth-provider";
```

#### PASO 1.2.2: Corregir la función handleLogout

Busca la función `handleLogout` y reemplaza:

```typescript
const handleLogout = async () => {
  try {
    const { logout: authLogout } = useAuth();
    await authLogout();
    window.location.href = "/login";
  } catch (error) {
    console.error("Logout error:", error);
  }
};
```

**ELIMINA**: Estas líneas incorrectas:
```typescript
// BORRAR ESTO:
const { logout } = await import("@ordo-todo/auth-provider").then(m => ({ useAuth: m.useAuth }));
const { logout: authLogout } = useAuth();
```

#### PASO 1.2.3: Verificar

**Comando**:
```bash
cd apps/web
npm run check-types | grep sidebar
```

**Resultado esperado**: 0 errores en sidebar

---

### 1.3. Corregir WorkspaceData type mismatch

**Problema**: El componente UI espera `type`, pero el Workspace del API tiene `tier`.

**Dos opciones**:

#### OPCIÓN A: Agregar `type` a Workspace del api-client (Recomendado para compatibilidad)

**Archivo**: `packages/api-client/src/types/workspace.types.ts`

Busca la interfaz `Workspace` y agrega `type` como un campo opcional:

```typescript
export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  color: string;
  icon: string | null;
  tier: WorkspaceTier;
  type?: 'PERSONAL' | 'WORK' | 'TEAM'; // ← AGREGAR ESTA LÍNEA
  ownerId: string | null;
  owner?: {
    id: string;
    username: string | null;
    name: string | null;
    email: string;
  };
  createdAt: Date;
  updatedAt: Date;
  stats?: {
    projectCount: number;
    taskCount: number;
    memberCount: number;
  };
}
```

#### OPCIÓN B: Eliminar `type` de WorkspaceData del UI (Más limpio)

**Archivo**: `packages/ui/src/components/workspace/workspace-card.tsx`

Busca la interfaz `WorkspaceData`:

```typescript
export interface WorkspaceData {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  type: 'PERSONAL' | 'WORK' | 'TEAM'; // ← ELIMINAR ESTA LÍNEA
  color: string;
  icon?: string | null;
  projectsCount?: number;
  tasksCount?: number;
}
```

**Reemplazar con**:
```typescript
expor
