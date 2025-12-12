# 🔧 Custom Fields: Campos Personalizados

## 📋 Resumen

Permitir crear **campos personalizados por proyecto** para adaptar las tareas a flujos de trabajo específicos.

## ✅ Estado: COMPLETADO (Diciembre 2024)

> Implementación completa en Web, Desktop y Mobile con soporte i18n.

---

## 🎯 Tipos de Campo Implementados

| Tipo | Ejemplo | Estado |
|------|---------|--------|
| `TEXT` | Notas adicionales | ✅ |
| `NUMBER` | Story points | ✅ |
| `SELECT` | Sprint, Cliente | ✅ |
| `MULTI_SELECT` | Skills requeridas | ✅ |
| `DATE` | Fecha de revisión | ✅ |
| `URL` | Link a diseño | ✅ |
| `EMAIL` | Contacto | ✅ |
| `CHECKBOX` | Requiere aprobación | ✅ |

---

## 🗄️ Base de Datos (Implementado)

```prisma
model CustomField {
  id          String          @id @default(cuid())
  name        String
  type        CustomFieldType
  description String?
  options     Json?           // Para SELECT/MULTI_SELECT
  isRequired  Boolean         @default(false)
  projectId   String
  project     Project         @relation(fields: [projectId], references: [id], onDelete: Cascade)
  values      CustomFieldValue[]
  createdAt   DateTime        @default(now())
  updatedAt   DateTime        @updatedAt

  @@index([projectId])
}

model CustomFieldValue {
  id            String      @id @default(cuid())
  fieldId       String
  field         CustomField @relation(fields: [fieldId], references: [id], onDelete: Cascade)
  taskId        String
  task          Task        @relation(fields: [taskId], references: [id], onDelete: Cascade)
  value         String
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@unique([fieldId, taskId])
  @@index([taskId])
}

enum CustomFieldType {
  TEXT
  NUMBER
  SELECT
  MULTI_SELECT
  DATE
  URL
  EMAIL
  CHECKBOX
}
```

---

## 🖥️ UI Implementada

### Configuración de Proyecto (Web)
- **Ubicación:** Project > Settings Tab > Custom Fields
- **Componente:** `apps/web/src/components/project/custom-fields-editor.tsx`
- **Features:** CRUD completo, gestión de opciones para SELECT, toggle de requerido

### En Task Form
- **Ubicación:** Debajo de los campos estándar
- **Componente:** `apps/web/src/components/task/custom-field-inputs.tsx`
- **Integrado en:** CreateTaskDialog, TaskDetailPanel

### Desktop App
- **Hooks:** `apps/desktop/src/hooks/api/use-custom-fields.ts`
- **Componente:** `apps/desktop/src/components/task/custom-field-inputs.tsx`
- **Integrado en:** CreateTaskDialog

### Mobile App
- **Hooks:** `apps/mobile/app/hooks/api/use-custom-fields.ts`
- **Componente:** `apps/mobile/app/components/task/custom-field-inputs.tsx`
- **Integrado en:** Task screen

---

## 🔌 Endpoints Implementados

| Método | Endpoint | Estado |
|--------|----------|--------|
| GET | `/api/v1/projects/:id/custom-fields` | ✅ |
| POST | `/api/v1/projects/:id/custom-fields` | ✅ |
| PATCH | `/api/v1/custom-fields/:id` | ✅ |
| DELETE | `/api/v1/custom-fields/:id` | ✅ |
| GET | `/api/v1/tasks/:id/custom-values` | ✅ |
| PUT | `/api/v1/tasks/:id/custom-values` | ✅ |

---

## 📁 Archivos Creados/Modificados

### Backend
- `apps/backend/src/custom-fields/custom-fields.module.ts`
- `apps/backend/src/custom-fields/custom-fields.service.ts`
- `apps/backend/src/custom-fields/custom-fields.controller.ts`
- `apps/backend/src/custom-fields/dto/custom-field.dto.ts`

### API Client
- `packages/api-client/src/types/custom-field.types.ts`
- `packages/api-client/src/client.ts` (6 nuevos métodos)

### Web App
- `apps/web/src/hooks/use-custom-fields.ts`
- `apps/web/src/components/project/custom-fields-editor.tsx`
- `apps/web/src/components/task/custom-field-inputs.tsx`
- `apps/web/src/lib/api-client.ts` (6 nuevos métodos)

### Desktop App
- `apps/desktop/src/hooks/api/use-custom-fields.ts`
- `apps/desktop/src/components/task/custom-field-inputs.tsx`

### Mobile App
- `apps/mobile/app/hooks/api/use-custom-fields.ts`
- `apps/mobile/app/components/task/custom-field-inputs.tsx`

### i18n
- `packages/i18n/src/locales/en.json` (CustomFields namespace)
- `packages/i18n/src/locales/es.json` (CustomFields namespace)
- `packages/i18n/src/locales/pt-br.json` (CustomFields namespace)

### Database
- `packages/db/prisma/schema.prisma`
- `packages/db/prisma/migrations/20251211_add_custom_fields/migration.sql`

---

## ✅ Checklist de Implementación

- [x] Schema + Migration: Completado
- [x] Backend (DTOs, Service, Controller, Module): Completado
- [x] API Client Types: Completado
- [x] Web Hooks: Completado
- [x] Web Field Editor UI: Completado
- [x] Web Task Form Integration: Completado
- [x] Desktop Hooks: Completado
- [x] Desktop Task Form Integration: Completado
- [x] Mobile Hooks: Completado
- [x] Mobile Task Form Integration: Completado
- [x] i18n (EN, ES, PT-BR): Completado
- [ ] Filtering by custom fields: Pendiente (fase futura)
- [ ] List/Kanban columns para custom fields: Pendiente (fase futura)
- [ ] Drag-and-drop reordering: Pendiente (fase futura)

---

**Fecha de Implementación:** 11 Diciembre 2024
**Tiempo Real:** ~4 horas
