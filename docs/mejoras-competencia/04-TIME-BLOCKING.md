# 📅 Time Blocking: Calendario Visual

## 📋 Resumen

Implementar **Time Blocking visual** que permita arrastrar tareas al calendario para asignarles bloques de tiempo.

## ✅ Estado: COMPLETADO (Diciembre 2024)

> Implementación base completada con scheduledEndTime y isTimeBlocked.
> Calendario semanal disponible en todas las plataformas.

---

## 🎯 Filosofía

| Concepto | Propósito | Estado |
|----------|-----------|--------|
| **Due Date** | Cuándo debe estar terminado | ✅ |
| **Scheduled Date** | Cuándo planeo trabajar | ✅ |
| **Scheduled Time** | Hora específica de inicio | ✅ |
| **Scheduled End Time** | Hora específica de fin | ✅ |
| **Is Time Blocked** | Mostrar en calendario semanal | ✅ |

---

## 🗄️ Base de Datos (Implementado)

```prisma
model Task {
  // existentes...
  scheduledDate    DateTime?  // Fecha programada
  scheduledTime    String?    // "HH:mm" inicio
  scheduledEndTime String?    // "HH:mm" fin
  isTimeBlocked    Boolean    @default(false)
}
```

---

## 🖥️ UI Implementada

### Vista Semanal (Web)
- **Ubicación:** Dashboard > Week View
- **Componente:** `apps/web/src/components/calendar/week-view.tsx`
- **Features:** 
  - Columnas por día (Lun-Dom)
  - Filas por hora (30min slots)
  - Tareas mostradas como bloques de color
  - Toggle para mostrar/ocultar time blocked

### Task Detail Panel
- Campo "Scheduled End Time" añadido
- Toggle "Time Blocked" para mostrar en calendario

### Desktop App
- Integrado en Task Detail Panel con campos de tiempo

### Mobile App
- Campos scheduledTime y scheduledEndTime en formulario de tarea
- Toggle isTimeBlocked

---

## 🔌 Endpoints (Existentes)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/tasks/time-blocks` | Time blocks por rango de fechas |
| PATCH | `/api/v1/tasks/:id` | Actualizar scheduledTime/scheduledEndTime |

---

## ✅ Checklist de Implementación

- [x] Campos en modelo Task (scheduledEndTime, isTimeBlocked)
- [x] Backend DTOs actualizados
- [x] Web Week Calendar View
- [x] Desktop integration
- [x] Mobile integration
- [ ] Drag & drop de tareas al calendario (fase futura)
- [ ] AI sugerencias de slots óptimos (fase futura)
- [ ] Sincronización con Google Calendar (fase futura)
- [ ] Sincronización con Outlook Calendar (fase futura)

---

## 📦 Archivos Modificados

### Database
- `packages/db/prisma/schema.prisma` - Campos agregados al modelo Task

### Backend
- `apps/backend/src/tasks/dto/create-task.dto.ts`
- `apps/backend/src/tasks/dto/update-task.dto.ts`

### API Client
- `packages/api-client/src/types/task.types.ts`

### Web
- `apps/web/src/components/calendar/week-view.tsx`
- `apps/web/src/components/task/task-detail-panel.tsx`

---

## 🚀 Mejoras Futuras

1. **Drag & Drop** - Arrastrar tareas del panel "sin programar" al calendario
2. **Resize** - Redimensionar bloques para cambiar duración
3. **AI Scheduling** - Sugerencias automáticas de slots disponibles
4. **Calendar Sync** - Bidireccional con Google/Outlook

---

**Fecha de Implementación:** 10-11 Diciembre 2024
