# 🌍 Scripts de Análisis i18n

Scripts para analizar, verificar y gestionar traducciones en Ordo Todo.

## 📁 Scripts Disponibles

### 1. `check_component_translations.js`
Analiza componentes individuales para verificar traducciones faltantes.

```bash
node check_component_translations.js
```

**Salida:**
- Análisis componente por componente
- Claves encontradas vs faltantes
- Línea exacta donde se usa cada traducción

### 2. `find_missing_translations_v2.js`
Busca todas las claves `t('...')` en el código y las compara con los archivos JSON.

```bash
node find_missing_translations_v2.js
```

**Archivos generados:**
- `missing_translations_clean.json` - Reporte detallado

**Salida:**
- Total de archivos analizados
- Claves válidas vs inválidas
- Traducciones faltantes por idioma
- Agrupadas por namespace

### 3. `add_missing_translations.js`
Agrega traducciones faltantes a los archivos JSON de los 3 idiomas.

```bash
node add_missing_translations.js
```

**Archivos modificados:**
- `packages/i18n/src/locales/en.json`
- `packages/i18n/src/locales/es.json`
- `packages/i18n/src/locales/pt-br.json`

## 📊 Resultado del Análisis Actual

**Última revisión:** 2025-12-31

### Componentes Analizados: 8
- ✅ project-card.tsx
- ✅ project-list.tsx
- ✅ project-board.tsx
- ✅ create-project-dialog.tsx
- ✅ task-card.tsx
- ✅ create-task-dialog.tsx (con correcciones)
- ✅ task-detail-panel.tsx

### Traducciones Verificadas: 80+ claves
- **Agregadas:** 3 traducciones faltantes
- **Faltantes:** 0 (en componentes principales)

### Traducciones Agregadas:

| Clave | EN | ES | PT-BR |
|-------|----|----|----|
| `CreateTaskDialog.form.selectAssignee` | Select assignee (optional) | Seleccionar miembro (opcional) | Selecionar membro (opcional) |
| `CreateTaskDialog.form.workspaceMembers` | Workspace members | Miembros del workspace | Membros do workspace |
| `CreateTaskDialog.form.assignToMe` | Assign to me (default) | Asignarme a mí (por defecto) | Atribuir a mim (padrão) |

## 🚀 Uso Recomendado

### Para Analizar un Componente Nuevo

1. Agrega la ruta del componente a `check_component_transcriptions.js`:

```javascript
const componentsToCheck = [
  // ... componentes existentes
  'apps/web/src/components/tu-nuevo-componente.tsx',
];
```

2. Ejecuta el análisis:
```bash
node check_component_translations.js
```

3. Agrega las traducciones faltantes manualmente o usa `add_missing_translations.js`

### Para Análisis Completo

```bash
# Paso 1: Buscar todas las traducciones faltantes
node find_missing_translations_v2.js

# Paso 2: Revisar el reporte
cat missing_translations_clean.json

# Paso 3: Agregar traducciones (si es necesario)
# (Primero edita add_missing_translations.js con las traducciones a agregar)
node add_missing_translations.js

# Paso 4: Verificar que todo esté correcto
node check_component_translations.js
```

## 📝 Notas

### Falsos Positivos Conocidos

El script puede detectar algunas claves que no son realmente traducciones:

1. **Caracteres individuales:** Como "T" en `.toISOString().split("T")`
2. **Colores hex:** Como `#3B82F6`
3. **Rutas:** Como `@/components/...`
4. **Fechas:** Como `31 Dec`

Estos se filtran automáticamente en `find_missing_translations_v2.js`.

### Estructura de Namespaces

Las traducciones están organizadas por componente:

```json
{
  "NombreComponente": {
    "sección": {
      "clave": "valor de traducción"
    }
  }
}
```

Ejemplos de namespaces usados:
- `ProjectCard`
- `ProjectList`
- `CreateTaskDialog`
- `TaskDetailPanel`
- `TaskCard`

## 🔧 Personalización

### Agregar Más Componentes para Análisis

Edita `check_component_transcriptions.js`:

```javascript
const componentsToCheck = [
  'apps/web/src/components/tu-componente.tsx',
];
```

### Modificar Filtros de Claves Inválidas

Edita `find_missing_translations_v2.js`, sección `validKeys.filter()`:

```javascript
const invalidPatterns = [
  // Agrega más patrones aquí
];
```

## 📚 Referencias

- **next-intl docs:** https://next-intl-docs.vercel.app/
- **Archivos de traducción:** `../../packages/i18n/src/locales/`
- **Componentes web:** `../../apps/web/src/components/`

## ✅ Checklist para Pull Requests

Antes de hacer un PR de cambios en i18n:

- [ ] Ejecutar `check_component_translations.js`
- [ ] Ejecutar `find_missing_translations_v2.js`
- [ ] Verificar que no haya traducciones faltantes
- [ ] Eliminar fallbacks innecesarios (`t('key') || "texto"`)
- [ ] Probar los componentes en los 3 idiomas
- [ ] Actualizar este README si se agregan nuevos scripts

## 🆘 Troubleshooting

### "No se encontró namespace"

**Causa:** El componente usa `useTranslations('Namespace')` pero ese namespace no existe en los JSON.

**Solución:** Crea el namespace en los 3 archivos JSON.

### "Traducciones faltantes pero existen"

**Causa:** El script tiene falsos positivos o la estructura del JSON es diferente.

**Solución:**
1. Verifica manualmente en el JSON
2. Ajusta el regex si es necesario
3. Reporta el falso positivo

### Las traducciones no se muestran

**Causa:** Puede ser un problema de caché o configuración de next-intl.

**Solución:**
1. Revisa `apps/web/src/i18n/request.ts`
2. Verifica que el namespace esté importado correctamente
3. Reinicia el servidor de desarrollo

---

**Mantenedor:** OpenCode AI
**Última actualización:** 2025-12-31
