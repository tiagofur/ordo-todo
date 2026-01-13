# Plan: OAuth Social Login para Desktop + Refactor `as any`

## Fecha: 2026-01-13

---

## Parte 1: Refactorizar `as any` en `invite-member-dialog.tsx`

### Problema
El uso de `form.control as any` es necesario porque los tipos genéricos de `react-hook-form` no infieren correctamente cuando se usa `zodResolver` con un schema de zod que usa un enum.

### Solución
Usar el tipo `InviteMemberDTO` importado desde `@ordo-todo/core` como tipo explícito para `useForm`:

```typescript
import { inviteMemberSchema, MemberRole, type InviteMemberDTO } from "@ordo-todo/core";

const form = useForm<InviteMemberDTO>({
  resolver: zodResolver(inviteMemberSchema),
  defaultValues: {
    email: "",
    role: MemberRole.MEMBER,
  },
});
```

Esto debería eliminar la necesidad de `as any` en los `FormField` components.

---

## Parte 2: Implementar OAuth Social Login para Desktop (Electron)

### Arquitectura Actual
- **Backend**: Ya tiene endpoints OAuth funcionando (`/auth/google`, `/auth/github`)
- **Web**: Usa redirección del navegador estándar con httpOnly cookies
- **Desktop**: No implementado (actualmente solo stubs)

### Estrategia para Electron
Para apps de Electron, OAuth debe manejarse de forma diferente porque:
1. No podemos usar cookies del backend directamente en Electron
2. Necesitamos un flujo que abra el browser externo y capture el callback

### Opciones de Implementación

#### Opción A: Navegador Externo + Deep Link (Recomendado)
1. Registrar un protocolo personalizado `ordo://`
2. Abrir OAuth en el navegador predeterminado del sistema
3. Backend redirige a `ordo://auth/callback?tokens=...`
4. Electron intercepta el deep link y procesa los tokens

#### Opción B: Servidor Local Temporal
1. Iniciar un servidor HTTP temporal en un puerto aleatorio
2. Usar `http://localhost:{port}/callback` como redirect URI
3. Servidor recibe tokens y los envía al proceso principal

#### Opción C: BrowserWindow Modal (Menos seguro)
1. Abrir una ventana de Electron sin acceso a Node.js
2. Usar `webContents.on('will-redirect')` para interceptar el callback

### Implementación Elegida: Opción A (Deep Link)

#### Cambios Necesarios

##### 1. Electron Main Process (`electron/main.ts`)
- Registrar protocolo `ordo://`
- Manejar el deep link `ordo://auth/callback`

##### 2. Backend (`apps/backend`)
- Agregar endpoint para iniciar OAuth desde desktop con parámetro `platform=desktop`
- Modificar callback para redirigir a `ordo://auth/callback` cuando es desktop

##### 3. Auth Provider (`packages/auth-provider`)
- Agregar métodos `signInWithGoogle` y `signInWithGitHub` al `AuthContextType`
- Implementar lógica diferente según `platform`

##### 4. Desktop App (`apps/desktop`)
- Crear utilidad para iniciar OAuth
- IPC para comunicar tokens desde main process a renderer

---

## Archivos a Modificar

### Refactor `as any`:
- [x] `apps/desktop/src/components/workspace/invite-member-dialog.tsx`

### OAuth Social:
- [x] `packages/auth-provider/src/types.ts` - Agregar métodos OAuth
- [x] `packages/auth-provider/src/auth-provider.tsx` - Implementar métodos OAuth
- [x] `apps/desktop/electron/deep-links.ts` - Agregar tipo 'auth' a deep links
- [x] `apps/desktop/src/lib/oauth.ts` - Crear utilidad de OAuth para desktop
- [x] `apps/desktop/src/hooks/use-oauth-callback.ts` - Hook para manejar callback
- [x] `apps/desktop/src/pages/Auth.tsx` - Conectar botones a OAuth real
- [x] `apps/backend/src/auth/auth.controller.ts` - Soporte para platform=desktop

---

## Prioridad de Ejecución
1. ✅ Refactorizar `as any` (simple, bajo riesgo)
2. ✅ Agregar tipos OAuth a auth-provider
3. ✅ Implementar deep link en Electron (ya existía, se extendió)
4. ✅ Modificar backend para soportar desktop redirect
5. ✅ Conectar todo en frontend

---

## Estado Final: ✅ Completado

- TypeScript compila sin errores
- OAuth flow implementado usando deep links
- Los botones de Google/GitHub ahora abren el navegador y procesan el callback

