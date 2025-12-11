# 📅 Time Blocking: Calendario Visual

## 📋 Resumen

Implementar **Time Blocking visual** que permita arrastrar tareas al calendario para asignarles bloques de tiempo.

---

## 🎯 Filosofía

| Concepto | Propósito |
|----------|-----------|
| **Due Date** | Cuándo debe estar terminado |
| **Scheduled Date** | Cuándo planeo trabajar |
| **Time Block** | Hora específica + duración reservada |

---

## 🗄️ Base de Datos

Task ya tiene campos necesarios. Solo agregar:

```prisma
model Task {
  // existentes...
  scheduledEndTime String?    // "HH:mm"
  isTimeBlocked    Boolean    @default(false)
}
```

---

## 🖥️ Diseño UI

### Vista Semanal
- Columnas por día
- Filas por hora (30min slots)
- Tareas como bloques de color
- Panel inferior "Sin programar"

### Interacción Drag & Drop
1. Arrastrar tarea del panel
2. Soltar en slot de hora
3. Se crea time block automático

### Códigos de Color
- 🟩 Verde: Tareas propias
- 🟦 Azul: Eventos externos
- 🟨 Amarillo: Reuniones
- 🟧 Naranja: High priority

---

## 🔌 Backend

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/calendar/blocks` | Time blocks por rango |
| POST | `/api/v1/tasks/:id/schedule` | Programar en slot |
| DELETE | `/api/v1/tasks/:id/unschedule` | Quitar del calendario |

---

## 📦 Componentes

```
packages/ui/src/components/calendar/
├── CalendarView.tsx
├── TimeBlock.tsx
├── TimeSlot.tsx
└── UnscheduledTasks.tsx
```

---

## ✅ Implementación

- Backend: 3 días
- Core Logic: 2 días
- Web UI: 5 días
- Calendar Sync: 3 días
- Mobile: 2 días

**Total: 15 días**
