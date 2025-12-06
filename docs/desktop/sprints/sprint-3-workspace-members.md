# 📋 Sprint 3: Workspace Members & Settings

**Prioridad**: 🟡 ALTA  
**Duración estimada**: 2-3 días  
**Objetivo**: Implementar gestión de miembros del workspace

---

## 📁 Archivos a Migrar

| Archivo | Origen (Web) | Prioridad |
|---------|--------------|-----------|
| `invite-member-dialog.tsx` | 6,646 bytes | 🔴 Crítica |
| `workspace-members-settings.tsx` | 7,480 bytes | 🔴 Crítica |
| `workspace-configuration-settings.tsx` | 8,399 bytes | 🟡 Media |
| `workspace-activity-log.tsx` | 6,329 bytes | 🟡 Media |

---

## 1. `invite-member-dialog.tsx`

**Origen**: `apps/web/src/components/workspace/invite-member-dialog.tsx`  
**Destino**: `apps/desktop/src/components/workspace/invite-member-dialog.tsx`

### Funcionalidad
- Dialog para invitar usuarios por email
- Selector de rol (admin, member, viewer)
- Envío de invitación al backend

### Cambios de migración
```typescript
// Cambiar:
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

// Por:
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
```

### Hooks necesarios
```typescript
// Verificar existencia en Desktop
import { useInviteMember } from '@/hooks/api';
```

---

## 2. `workspace-members-settings.tsx`

**Origen**: `apps/web/src/components/workspace/workspace-members-settings.tsx`  
**Destino**: `apps/desktop/src/components/workspace/workspace-members-settings.tsx`

### Funcionalidad
- Lista de miembros actuales
- Cambiar rol de miembro
- Eliminar miembro
- Ver invitaciones pendientes

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar navegación
- [ ] Adaptar i18n

---

## 3. `workspace-configuration-settings.tsx`

**Origen**: `apps/web/src/components/workspace/workspace-configuration-settings.tsx`  
**Destino**: `apps/desktop/src/components/workspace/workspace-configuration-settings.tsx`

### Funcionalidad
- Configuración general del workspace
- Cambiar nombre
- Cambiar descripción
- Configuraciones avanzadas

---

## 4. `workspace-activity-log.tsx`

**Origen**: `apps/web/src/components/workspace/workspace-activity-log.tsx`  
**Destino**: `apps/desktop/src/components/workspace/workspace-activity-log.tsx`

### Funcionalidad
- Log de actividad del workspace
- Filtros por usuario/tipo
- Paginación

---

## 🔗 Integración

### Actualizar Settings.tsx

Integrar los nuevos componentes en la página de settings:

```typescript
// apps/desktop/src/pages/Settings.tsx
import { InviteMemberDialog } from '@/components/workspace/invite-member-dialog';
import { WorkspaceMembersSettings } from '@/components/workspace/workspace-members-settings';

// Agregar tabs/secciones para:
// - Miembros
// - Configuración
// - Actividad
```

---

## ✅ Criterios de Aceptación

### Invite Member Dialog
- [ ] Dialog se abre correctamente
- [ ] Campo de email funcional
- [ ] Selector de rol funcional
- [ ] Envía invitación al backend
- [ ] Muestra confirmación/error

### Members Settings
- [ ] Lista miembros actuales
- [ ] Muestra rol de cada uno
- [ ] Permite cambiar rol (si es admin)
- [ ] Permite eliminar miembro
- [ ] Muestra invitaciones pendientes

---

## 🧪 Testing

```bash
# 1. Build
cd apps/desktop
npm run build

# 2. Dev mode
npm run dev

# 3. Navegar a Settings > Workspace > Miembros
# 4. Probar invitar un usuario
# 5. Verificar lista de miembros
```
