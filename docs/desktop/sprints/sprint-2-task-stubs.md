# 📋 Sprint 2: Task Detail Stubs

**Prioridad**: 🔴 ALTA  
**Duración estimada**: 3-4 días  
**Objetivo**: Reemplazar stubs con implementaciones funcionales

---

## 📁 Archivos a Implementar

Los siguientes archivos existen en Desktop pero son placeholders vacíos:

| Archivo | Estado Actual | Tamaño Web |
|---------|---------------|------------|
| `activity-feed.tsx` | Stub (173 bytes) | 9,701 bytes |
| `attachment-list.tsx` | Stub (174 bytes) | 10,261 bytes |
| `comment-thread.tsx` | Stub (179 bytes) | 9,684 bytes |
| `file-upload.tsx` | Stub (176 bytes) | 10,695 bytes |

---

## 1. `activity-feed.tsx`

**Origen**: `apps/web/src/components/task/activity-feed.tsx`  
**Destino**: `apps/desktop/src/components/task/activity-feed.tsx` (reemplazar)

### Funcionalidad
- Mostrar historial de cambios de la tarea
- Formato de fecha relativo ("hace 2 horas")
- Iconos por tipo de actividad (creación, edición, comentario)

### Hooks necesarios en Desktop
```typescript
// Verificar que existe en apps/desktop/src/hooks/api/
import { useTaskActivity } from '@/hooks/api';
```

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar `useTranslations` → `useTranslation`
- [ ] Verificar hook de actividad existe

---

## 2. `attachment-list.tsx`

**Origen**: `apps/web/src/components/task/attachment-list.tsx`  
**Destino**: `apps/desktop/src/components/task/attachment-list.tsx` (reemplazar)

### Funcionalidad
- Listar archivos adjuntos de la tarea
- Preview de imágenes
- Botón de descarga
- Botón de eliminar

### Hooks necesarios
```typescript
import { useAttachments, useDeleteAttachment } from '@/hooks/api';
```

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar manejo de URLs de archivos
- [ ] Verificar integración con file-upload

---

## 3. `comment-thread.tsx`

**Origen**: `apps/web/src/components/task/comment-thread.tsx`  
**Destino**: `apps/desktop/src/components/task/comment-thread.tsx` (reemplazar)

### Funcionalidad
- Listar comentarios de la tarea
- Crear nuevo comentario
- Editar/eliminar comentarios propios
- Soporte para menciones (@usuario)

### Hooks necesarios
```typescript
import { useComments, useCreateComment, useDeleteComment } from '@/hooks/api';
```

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar componente de menciones
- [ ] Verificar formato de fechas

---

## 4. `file-upload.tsx`

**Origen**: `apps/web/src/components/task/file-upload.tsx`  
**Destino**: `apps/desktop/src/components/task/file-upload.tsx` (reemplazar)

### Funcionalidad
- Drag & drop de archivos
- Preview antes de subir
- Barra de progreso
- Validación de tipo/tamaño

### Hooks necesarios
```typescript
import { useUploadAttachment } from '@/hooks/api';
```

### Cambios de migración
- [ ] Remover `"use client"`
- [ ] Adaptar API de subida de archivos
- [ ] Verificar límites de tamaño

---

## 📦 Verificar Hooks API

Antes de migrar, verificar que estos hooks existen en Desktop:

```bash
# Revisar apps/desktop/src/hooks/api/
ls apps/desktop/src/hooks/api/
```

**Hooks esperados**:
- `use-comments.ts` ✅ (existe)
- `use-attachments.ts` ✅ (existe)

---

## ✅ Criterios de Aceptación

### Activity Feed
- [ ] Muestra historial de cambios
- [ ] Fechas formateadas correctamente
- [ ] Iconos apropiados por tipo

### Attachment List
- [ ] Lista archivos adjuntos
- [ ] Permite descargar
- [ ] Permite eliminar
- [ ] Muestra preview de imágenes

### Comment Thread
- [ ] Lista comentarios existentes
- [ ] Permite crear comentario
- [ ] Permite eliminar propio
- [ ] Formato de fecha relativo

### File Upload
- [ ] Drag & drop funciona
- [ ] Muestra progreso
- [ ] Valida tipo/tamaño
- [ ] Integra con attachment-list

---

## 🧪 Testing

```bash
# 1. Build
cd apps/desktop
npm run build

# 2. Dev mode
npm run dev

# 3. Abrir detalle de tarea y verificar cada tab/sección
```
