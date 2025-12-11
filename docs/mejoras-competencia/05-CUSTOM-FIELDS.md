# 🔧 Custom Fields: Campos Personalizados

## 📋 Resumen

Permitir crear **campos personalizados por proyecto** para adaptar las tareas a flujos de trabajo específicos.

---

## 🎯 Tipos de Campo

| Tipo | Ejemplo |
|------|---------|
| `TEXT` | Notas adicionales |
| `NUMBER` | Story points |
| `SELECT` | Sprint, Cliente |
| `MULTI_SELECT` | Skills requeridas |
| `DATE` | Fecha de revisión |
| `URL` | Link a diseño |
| `EMAIL` | Contacto |
| `CHECKBOX` | Requiere aprobación |

---

## 🗄️ Base de Datos

```prisma
model CustomField {
  id          String          @id @default(cuid())
  name        String
  type        CustomFieldType
  options     Json?           // Para SELECT/MULTI_SELECT
  isRequired  Boolean         @default(false)
  projectId   String
  project     Project         @relation(fields: [projectId], references: [id])
  values      CustomFieldValue[]
}

model CustomFieldValue {
  id            String      @id @default(cuid())
  fieldId       String
  field         CustomField @relation(fields: [fieldId], references: [id])
  taskId        String
  task          Task        @relation(fields: [taskId], references: [id])
  value         String
  @@unique([fieldId, taskId])
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

## 🖥️ UI Design

### Configuración de Proyecto
```
Proyecto > Settings > Custom Fields
┌─────────────────────────────────────┐
│  + Agregar campo                    │
├─────────────────────────────────────┤
│ Sprint     [SELECT ▼]  [Editar] [X] │
│ Story Pts  [NUMBER ▼]  [Editar] [X] │
│ Cliente    [SELECT ▼]  [Editar] [X] │
└─────────────────────────────────────┘
```

### En Task Form
Los custom fields aparecen debajo de los campos estándar.

### En Task List/Kanban
Columnas opcionales para mostrar custom fields.

---

## 🔌 Endpoints

| Método | Endpoint |
|--------|----------|
| GET | `/api/v1/projects/:id/custom-fields` |
| POST | `/api/v1/projects/:id/custom-fields` |
| PATCH | `/api/v1/custom-fields/:id` |
| DELETE | `/api/v1/custom-fields/:id` |
| PATCH | `/api/v1/tasks/:id/custom-values` |

---

## ✅ Implementación

- Schema + Backend: 3 días
- Field Editor UI: 2 días
- Task Form Integration: 2 días
- List/Kanban columns: 2 días
- Filtering by custom fields: 2 días

**Total: 11 días**
