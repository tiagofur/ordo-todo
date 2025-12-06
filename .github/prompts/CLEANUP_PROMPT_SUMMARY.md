# 🔧 Cleanup Prompt - Resumen de Implementación

> **Fecha**: 2025-12-06  
> **Propósito**: Prompt especializado para limpieza de código  
> **Estado**: ✅ Implementado

## 🎯 Problema Resuelto

### Antes ❌

- **Console.log statements** por todo el código (Web/Mobile/Backend)
- **Código deprecated** sin actualizar (React 18.x, Prisma)
- **Imports no usados** acumulándose
- **Variables declaradas** sin utilizar
- **Warnings del linter** ignorados
- **TODOs** sin trackear
- **Try-catch vacíos** que ocultan errores

### Ahora ✅

- ✅ **Logger apropiado** en lugar de console.logs
- ✅ **Código actualizado** a versiones actuales
- ✅ **Imports limpios** (solo los necesarios)
- ✅ **Cero warnings** del linter
- ✅ **TODOs convertidos** en issues de GitHub
- ✅ **Error handling** apropiado

## 📦 Archivo Creado

**Archivo**: `.github/prompts/cleanup.prompt.md`  
**Líneas**: ~550  
**Propósito**: Code Cleanup Specialist

## 🔍 Capacidades del Prompt

### 1. Detección y Corrección de Console.log Statements

**React/Next.js/React Native**:
```typescript
// ❌ Detecta
console.log('Debug: User logged in');

// ✅ Eliminar o usar condicionalmente en desarrollo
if (process.env.NODE_ENV === 'development') {
  console.log('Debug:', data);
}
```

**Backend (NestJS)**:
```typescript
// ❌ Detecta
console.log('User created:', user);

// ✅ Reemplaza con
private readonly logger = new Logger(UsersService.name);
this.logger.log('User created:', user.email);
```

### 2. Actualización de Deprecations

**React 18 → React 19**:
```typescript
// ❌ Deprecated
render(<App />, document.getElementById('root'));

// ✅ Actualizado
const root = createRoot(document.getElementById('root')!);
root.render(<App />);
```

**Prisma**:
```typescript
// ❌ Deprecated pattern
const user = await prisma.user.findUnique({ where: { id } });
// user puede ser null

// ✅ Actualizado - manejo explícito
const user = await prisma.user.findUniqueOrThrow({ where: { id } });
```

### 3. Limpieza de Imports

```typescript
// ❌ Imports no usados
import { useState, useEffect, useMemo } from 'react';  // useMemo no usado
import { Card, Button, Modal } from '@/components/ui';  // Modal no usado

// ✅ Limpio
import { useState, useEffect } from 'react';
import { Card, Button } from '@/components/ui';
```

### 4. Variables No Utilizadas

```typescript
// ❌ Variable declarada sin usar
const response = await api.get('/users');  // No usada

// ✅ Opciones:
// 1. Eliminar
// 2. Usar con prefijo _
const _response = await api.get('/users');
```

### 5. Código Comentado

```typescript
// ❌ Código comentado obsoleto
// <OldImplementation />
// <Container><OldWidget /></Container>

// ✅ Eliminar (Git history preserva)
```

### 6. TODOs y FIXMEs

```typescript
// TODO: Implement error handling    // ← Crear issue
// FIXME: Memory leak on unmount     // ← Alta prioridad
// HACK: Temporary workaround         // ← Refactor needed

// ✅ Acción: Catalogar y crear issues en GitHub
```

### 7. Try-Catch Sin Manejo

```typescript
// ❌ Catch silencioso
try {
  await fetchData();
} catch (e) {}

// ✅ Log + rethrow
try {
  await fetchData();
} catch (error) {
  console.error('Failed to fetch data:', error);
  toast.error('Failed to load data');
  throw error;
}
```

### 8. Warnings del Linter

**Ejecuta y corrige**:
```bash
# Monorepo
npm run lint
npm run lint -- --fix

# Específico por app
npm run lint --filter=@ordo-todo/web
npm run lint --filter=@ordo-todo/backend
```

## 🔄 Workflow de Limpieza

### Paso 1: Análisis

```bash
# Web (Next.js)
cd apps/web
npm run lint > cleanup_web.txt

# Backend (NestJS)
cd apps/backend
npm run lint > cleanup_backend.txt
```

### Paso 2: Priorización

1. 🔴 **Errors** - Rompen compilación
2. 🟠 **Deprecations** - Dejarán de funcionar
3. 🟡 **Security** - Vulnerabilidades
4. 🟢 **Console.logs** - Contaminan logs
5. ⚪ **Formatting** - Estético

### Paso 3: Corrección Automática

```bash
# Monorepo
npm run lint -- --fix
npm run format
```

### Paso 4: Validación

```bash
# Ejecutar tests
npm run test

# Verificar cero warnings
npm run lint -- --quiet  # Sin output = limpio
```

## 📚 Búsqueda de Documentación

### React/Next.js

**Recursos**:
- [React Docs](https://react.dev/)
- [Next.js Docs](https://nextjs.org/docs)

### React Native / Expo

**Recursos**:
- [React Native Docs](https://reactnative.dev/)
- [Expo Docs](https://docs.expo.dev/)

### NestJS/TypeScript

**Recursos**:
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## 🎯 Ejemplos de Uso

### Caso 1: Eliminar Console.logs

```
@cleanup.prompt Busca todos los console.log en apps/web/src/
y elimínalos o reemplázalos con manejo apropiado.
```

**Output esperado**:
- Lista de archivos modificados
- Cambios realizados
- Resumen (ej: "15 console.logs eliminados en 5 archivos")

### Caso 2: Actualizar Deprecations

```
@cleanup.prompt Busca uso de patterns deprecated de React 18
y actualiza a React 19 según migration guide
```

### Caso 3: Limpiar Imports

```
@cleanup.prompt Analiza apps/backend/src/ y elimina todos los imports no utilizados.
Ejecuta lint después para validar.
```

### Caso 4: Crear Issues para TODOs

```
@cleanup.prompt Busca todos los TODO, FIXME, HACK en apps/ y packages/.
Categoriza por prioridad y genera template de issues de GitHub.
```

## 🛠️ Comandos Útiles

### Monorepo

```bash
# Lint todo
npm run lint

# Format todo
npm run format

# Específico por app
npm run lint --filter=@ordo-todo/web
npm run lint --filter=@ordo-todo/backend
```

### Por App

```bash
# Web/Desktop/Mobile
cd apps/web  # o apps/desktop, apps/mobile
npm run lint
npm run lint -- --fix

# Backend
cd apps/backend
npm run lint
npm run lint -- --fix
npm run format
```

## 📋 Checklist Pre-Commit

- [ ] Sin `console.log()` en código de producción
- [ ] Sin imports no usados
- [ ] Sin variables declaradas sin usar
- [ ] Sin código comentado
- [ ] Sin warnings del linter
- [ ] Sin errores de compilación
- [ ] Tests pasan
- [ ] Formato aplicado

## 📊 Métricas de Código Limpio

### Objetivos

| Métrica | Objetivo |
|---------|----------|
| Warnings del linter | 0 |
| Errores de compilación | 0 |
| Console.logs | 0 en producción |
| Imports no usados | 0 |
| Código comentado | 0 |
| TODOs | < 10 por módulo |

### Dashboard

```bash
# Generar reporte
echo "# Cleanup Report - $(date +%Y-%m-%d)" > cleanup_report.md
echo "" >> cleanup_report.md
echo "## Web" >> cleanup_report.md
echo "- Console.logs: $(grep -r 'console\.' apps/web/src --include='*.ts' --include='*.tsx' | wc -l)" >> cleanup_report.md
echo "" >> cleanup_report.md
echo "## Backend" >> cleanup_report.md
echo "- Warnings: $(npm run lint --filter=@ordo-todo/backend -- --quiet 2>&1 | wc -l)" >> cleanup_report.md
echo "- Console.logs: $(grep -r 'console\.' apps/backend/src --include='*.ts' | wc -l)" >> cleanup_report.md
```

## 🔗 Integración con Otros Prompts

### Workflow Completo

```mermaid
graph LR
    A[@prompts] --> B[Código inicial]
    B --> C[@testing.prompt]
    C --> D[Tests]
    D --> E[@cleanup.prompt]
    E --> F[Código limpio]
    F --> G[@documentation.prompt]
    G --> H[Documentado]
```

1. `@prompts` - Implementar feature
2. `@testing.prompt` - Crear tests
3. **`@cleanup.prompt`** - Limpiar código ✨
4. `@documentation.prompt` - Documentar

## 📚 Recursos Creados

1. **Prompt**: [cleanup.prompt.md](cleanup.prompt.md)
2. **Guía de Prompts**: [README.md](README.md)
3. **CONTRIBUTING.md**: [../../.github/CONTRIBUTING.md](../CONTRIBUTING.md)

## 🎉 Beneficios Inmediatos

✅ **Código profesional** - Cero warnings, cero console.logs  
✅ **Mantenible** - Actualizado a versiones actuales  
✅ **Trackeable** - TODOs convertidos en issues  
✅ **Debuggeable** - Logs apropiados en lugar de console.logs  
✅ **Rápido** - Auto-fix ahorra horas de trabajo manual  

## 🚀 Próximos Pasos

### Inmediato
1. ✅ Probar `@cleanup.prompt` con Copilot
2. ⏳ Ejecutar primera limpieza en `apps/web/src/`
3. ⏳ Crear issues para TODOs encontrados

### Corto Plazo
1. ⏳ Limpiar todos los console.logs en Web
2. ⏳ Actualizar deprecations de React 18
3. ⏳ Limpiar console.logs en Backend

### Mediano Plazo
1. ⏳ Integrar en pre-commit hooks
2. ⏳ Agregar checks en CI/CD
3. ⏳ Sprint cleanup mensual

---

**Versión**: 2.0.0  
**Última actualización**: 2025-12-06  
**Proyecto**: Ordo-Todo  
**Mantenedor**: @tiagofur

