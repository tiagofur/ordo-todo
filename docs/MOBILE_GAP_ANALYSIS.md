# Mobile Gap Analysis

Este documento detalla las discrepancias funcionales entre las aplicaciones Web y Mobile de Ordo, basado en una auditoría de código del 17/12/2025.

## Resumen Ejecutivo

La aplicación Mobile actual actúa como un "Companion" enfocado en la ejecución diaria (Tareas, Hábitos, Ver Objetivos) y no tiene paridad completa con la plataforma Web, que actúa como el centro de mando (Gestión de Proyectos, Analytics, Configuración profunda).

## Matriz de Paridad

| Feature | Web | Mobile | Brecha Detectada | Prioridad Sugerida |
| :--- | :---: | :---: | :--- | :--- |
| **Tasks (Gestión)** | ✅ Completo | ⚠️ Parcial | La creación/edición existe, pero faltan características avanzadas como sub-tareas visuales, adjuntos, y comentarios en la vista de detalle. | Alta |
| **Tasks (Vistas)** | ✅ Completo | ⚠️ Parcial | Web ofrece Tablero (Kanban), Lista, Calendario. Mobile se enfoca en Lista y Calendario. Falta Kanban. | Media |
| **Proyectos** | ✅ Completo | ❌ No disponible | No hay interfaz dedicada para listar, crear o editar proyectos. Solo se pueden seleccionar al crear una tarea. | **Crítica** |
| **Timer / Pomodoro** | ✅ Completo | ❌ No disponible | Feature totalmente ausente en Mobile. | Media |
| **Hábitos** | ✅ Completo | ✅ Completo | Parece haber buena paridad funcional en el seguimiento de hábitos. | Baja |
| **Objetivos (OKR)** | ✅ Completo | ✅ Completo | Paridad aparente en visualización y actualización de progreso. | Baja |
| **Analytics** | ✅ Completo | ❌ No disponible | Web tiene widgets ricos (Time Worked, Streak, etc.). Mobile solo muestra resumen básico en Home. | Baja |
| **Workspaces** | ✅ Completo | ⚠️ Parcial | Se puede seleccionar el workspace activo, pero no hay gestión (crear/editar/invitar miembros). | Baja |
| **Configuración** | ✅ Completo | ⚠️ Parcial | Mobile solo ofrece edición básica de Perfil. Web ofrece configuración de notificaciones, integraciones, tema detallado, etc. | Baja |
| **AI Features** | ✅ Sí | ⚠️ Parcial | Web tiene Chat AI contextual en tareas. Mobile tiene una pantalla `ai-chat.tsx` aislada, pero no integrada en el flujo de tareas. | Media |

## Recomendaciones para Roadmap Mobile

Si el objetivo es la paridad completa, se recomienda la siguiente secuencia de implementación:

1.  **Fase 1: Gestión de Proyectos.** Crear pantalla de lista de proyectos y detalle/edición de proyecto.
2.  **Fase 2: Enriquecimiento de Tareas.** Añadir soporte para Subtareas y Comentarios en la pantalla de detalle.
3.  **Fase 3: Timer.** Implementar el Pomodoro Timer en Mobile (ideal para usar el teléfono como timer mientras se trabaja en desktop).
4.  **Fase 4: Configuración y Analytics.**
