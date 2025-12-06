# 📋 Sprint 4: AI Components & Reports

**Prioridad**: 🟡 MEDIA  
**Duración estimada**: 2-3 días  
**Objetivo**: Completar sistema de reportes con IA

---

## 📁 Estado Actual

| Componente | Web | Desktop |
|------------|-----|---------|
| `AIWeeklyReport.tsx` | ❌ | ✅ 13,499 bytes |
| `generate-report-dialog.tsx` | ✅ 5,744 bytes | ❌ |
| `report-card.tsx` | ✅ 5,544 bytes | ❌ |
| `report-detail.tsx` | ✅ 9,093 bytes | ❌ |
| `ai-assistant-sidebar.tsx` | ✅ 5,000 bytes | ❌ |

**Nota**: Desktop ya tiene `AIWeeklyReport.tsx` que NO existe en Web.

---

## 1. `generate-report-dialog.tsx`

**Origen**: `apps/web/src/components/ai/generate-report-dialog.tsx`  
**Destino**: `apps/desktop/src/components/ai/generate-report-dialog.tsx`

### Funcionalidad
- Dialog para configurar generación de reporte
- Selector de periodo (semanal, mensual)
- Selector de proyectos a incluir
- Botón de generar

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar i18n
- [ ] Verificar hook de generación

---

## 2. `report-card.tsx`

**Origen**: `apps/web/src/components/ai/report-card.tsx`  
**Destino**: `apps/desktop/src/components/ai/report-card.tsx`

### Funcionalidad
- Tarjeta para mostrar en lista de reportes
- Preview del contenido
- Fecha de generación
- Acciones (ver, eliminar, exportar)

---

## 3. `report-detail.tsx`

**Origen**: `apps/web/src/components/ai/report-detail.tsx`  
**Destino**: `apps/desktop/src/components/ai/report-detail.tsx`

### Funcionalidad
- Vista completa del reporte
- Secciones: resumen, tareas, productividad
- Exportar a PDF/Markdown
- Compartir

---

## 4. `ai-assistant-sidebar.tsx` (Opcional)

**Origen**: `apps/web/src/components/ai/ai-assistant-sidebar.tsx`  
**Destino**: `apps/desktop/src/components/ai/ai-assistant-sidebar.tsx`

### Funcionalidad
- Sidebar con chat de IA
- Preguntas sobre productividad
- Sugerencias de mejora

**Prioridad**: 🟢 Baja - Implementar solo si hay tiempo.

---

## 🔗 Integración

### Crear página de Reports

```typescript
// apps/desktop/src/pages/Reports.tsx
import { GenerateReportDialog } from '@/components/ai/generate-report-dialog';
import { ReportCard } from '@/components/ai/report-card';
import { ReportDetail } from '@/components/ai/report-detail';

export function Reports() {
  // Lista de reportes generados
  // Botón para generar nuevo
  // Vista de detalle al seleccionar
}
```

### Agregar a navegación

```typescript
// En el Sidebar o menú, agregar link a Reports
<NavLink to="/reports">
  <FileText className="h-4 w-4" />
  <span>Reports</span>
</NavLink>
```

---

## ✅ Criterios de Aceptación

### Generate Report Dialog
- [ ] Dialog se abre
- [ ] Permite seleccionar periodo
- [ ] Permite seleccionar proyectos
- [ ] Genera reporte al confirmar

### Report Card
- [ ] Muestra preview del reporte
- [ ] Muestra fecha de generación
- [ ] Click abre detalle

### Report Detail
- [ ] Muestra contenido completo
- [ ] Secciones navegables
- [ ] Exportar funciona

---

## 🧪 Testing

```bash
# 1. Build
cd apps/desktop
npm run build

# 2. Dev mode
npm run dev

# 3. Navegar a Reports
# 4. Generar un reporte
# 5. Ver detalle del reporte
# 6. Exportar a PDF
```
