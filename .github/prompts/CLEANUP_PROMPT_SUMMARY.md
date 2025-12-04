# 🔧 Cleanup Prompt - Resumen de Implementación

> **Fecha**: 2025-11-14  
> **Propósito**: Prompt especializado para limpieza de código  
> **Estado**: ✅ Implementado

## 🎯 Problema Resuelto

### Antes ❌

- **Print statements** por todo el código (Flutter/Backend)
- **Console.log** en producción (Backend)
- **Código deprecated** sin actualizar (Flutter 2.x, TypeORM 0.2)
- **Imports no usados** acumulándose
- **Variables declaradas** sin utilizar
- **Warnings del linter** ignorados
- **TODOs** sin trackear
- **Try-catch vacíos** que ocultan errores

### Ahora ✅

- ✅ **Logger apropiado** en lugar de prints
- ✅ **Código actualizado** a versiones actuales
- ✅ **Imports limpios** (solo los necesarios)
- ✅ **Cero warnings** del linter
- ✅ **TODOs convertidos** en issues de GitHub
- ✅ **Error handling** apropiado

## 📦 Archivo Creado

**Archivo**: `.github/prompts/cleanup.prompt.md`  
**Líneas**: ~720  
**Propósito**: Code Cleanup Specialist

## 🔍 Capacidades del Prompt

### 1. Detección y Corrección de Print Statements

**Flutter**:
```dart
// ❌ Detecta
print('Debug: User logged in');

// ✅ Reemplaza con
import 'package:logging/logging.dart';
final _logger = Logger('AuthService');
_logger.info('User logged in');
```

**Backend**:
```typescript
// ❌ Detecta
console.log('User created:', user);

// ✅ Reemplaza con
private readonly logger = new Logger(UsersService.name);
this.logger.log('User created:', user.email);
```

### 2. Actualización de Deprecations

**Flutter** (2.x → 3.x):
```dart
// ❌ Deprecated
textTheme.headline1
ThemeData.brightness
Scaffold.of(context).showSnackBar()

// ✅ Actualizado
textTheme.displayLarge
Theme.of(context).brightness
ScaffoldMessenger.of(context).showSnackBar()
```

**Backend** (TypeORM 0.2 → 0.3):
```typescript
// ❌ Deprecated
repository.findOne(id);

// ✅ Actualizado
repository.findOne({ where: { id } });
```

### 3. Limpieza de Imports

```dart
// ❌ Imports no usados
import 'package:provider/provider.dart';  // No usado
import 'package:flutter/material.dart';    // Usado

// ✅ Limpio
import 'package:flutter/material.dart';
```

### 4. Variables No Utilizadas

```dart
// ❌ Variable declarada sin usar
final response = await api.get('/users');  // No usada

// ✅ Opciones:
// 1. Eliminar
// 2. Usar con prefijo _
final _response = await api.get('/users');
```

### 5. Código Comentado

```dart
// ❌ Código comentado obsoleto
// Text('Old implementation'),
// Container(child: OldWidget()),

// ✅ Eliminar (Git history preserva)
```

### 6. TODOs y FIXMEs

```dart
// TODO: Implement error handling    // ← Crear issue
// FIXME: Memory leak on dispose     // ← Alta prioridad
// HACK: Temporary workaround         // ← Refactor needed

// ✅ Acción: Catalogar y crear issues en GitHub
```

### 7. Try-Catch Sin Manejo

```dart
// ❌ Catch silencioso
try {
  await fetchData();
} catch (e) {}

// ✅ Log + rethrow
try {
  await fetchData();
} catch (e, stackTrace) {
  _logger.severe('Failed to fetch data', e, stackTrace);
  rethrow;
}
```

### 8. Warnings del Linter

**Ejecuta y corrige**:
```bash
# Flutter
flutter analyze
dart fix --apply

# Backend
npm run lint -- --fix
```

## 🔄 Workflow de Limpieza

### Paso 1: Análisis

```bash
# Flutter
flutter analyze > cleanup_flutter.txt

# Backend
npm run lint > cleanup_backend.txt
```

### Paso 2: Priorización

1. 🔴 **Errors** - Rompen compilación
2. 🟠 **Deprecations** - Dejarán de funcionar
3. 🟡 **Security** - Vulnerabilidades
4. 🟢 **Prints** - Contaminan logs
5. ⚪ **Formatting** - Estético

### Paso 3: Corrección Automática

```bash
# Flutter
dart fix --apply
flutter format lib/ test/

# Backend
npm run lint -- --fix
npm run format
```

### Paso 4: Validación

```bash
# Ejecutar tests
flutter test
npm run test

# Verificar cero warnings
flutter analyze | grep "warning:" | wc -l  # Debe ser 0
npm run lint -- --quiet                     # Sin output
```

## 📚 Búsqueda de Documentación

### Flutter/Dart

**Recursos**:
- [Official Docs](https://docs.flutter.dev/)
- [API Reference](https://api.flutter.dev/)
- [Migration Guides](https://docs.flutter.dev/release/breaking-changes)

**Ejemplo búsqueda**:
```
1. Ir a https://api.flutter.dev/
2. Buscar clase/método deprecated
3. Ver "Migration guide" link
4. Aplicar alternativa recomendada
```

### NestJS/TypeScript

**Recursos**:
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)

## 🎯 Ejemplos de Uso

### Caso 1: Eliminar Prints

```
@cleanup.prompt Busca todos los print() en lib/features/auth/
y reemplázalos con Logger. Agrupa por archivo y crea imports necesarios.
```

**Output esperado**:
- Lista de archivos modificados
- Cambios de print → Logger
- Imports agregados
- Resumen (ej: "15 prints reemplazados en 5 archivos")

### Caso 2: Actualizar Deprecations

```
@cleanup.prompt Busca uso de TextTheme.headline1 en lib/
y actualiza a displayLarge según Flutter 3.0 migration guide
```

**Output esperado**:
- Búsqueda de todos los usos
- Reemplazo con nueva API
- Link a migration guide oficial

### Caso 3: Limpiar Imports

```
@cleanup.prompt Analiza lib/ y elimina todos los imports no utilizados.
Ejecuta dart fix --apply después para validar.
```

**Output esperado**:
- Lista de imports removidos por archivo
- Comando ejecutado para validar
- Confirmación de cero warnings

### Caso 4: Crear Issues para TODOs

```
@cleanup.prompt Busca todos los TODO, FIXME, HACK en lib/ y src/.
Categoriza por prioridad y genera template de issues de GitHub.
```

**Output esperado**:
```markdown
## High Priority
- [ ] FIXME: Memory leak en ProfileScreen.dispose()
- [ ] FIXME: Race condition en auth provider

## Medium Priority
- [ ] TODO: Implement pagination en TasksList

## Low Priority
- [ ] HACK: Temporary workaround for API timeout
```

## 🛠️ Comandos Útiles

### Flutter

```bash
# Análisis completo
flutter analyze

# Auto-fix
dart fix --apply

# Ver qué cambiaría sin aplicar
dart fix --dry-run

# Formato
flutter format lib/ test/

# Actualizar dependencias
flutter pub upgrade --major-versions
```

### Backend

```bash
# Análisis
npm run lint

# Auto-fix
npm run lint -- --fix

# Prettier
npm run format

# Ver deprecations
npm outdated

# Actualizar deps
npm update
```

## 📋 Checklist Pre-Commit

- [ ] Sin `print()` statements (Flutter)
- [ ] Sin `console.log()` (Backend)
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
| Print statements | 0 |
| Console.logs | 0 en producción |
| Imports no usados | 0 |
| Código comentado | 0 |
| TODOs | < 10 por módulo |

### Dashboard

```bash
# Generar reporte
echo "# Cleanup Report - $(date +%Y-%m-%d)" > cleanup_report.md
echo "" >> cleanup_report.md
echo "## Flutter" >> cleanup_report.md
echo "- Warnings: $(flutter analyze | grep -c 'warning:')" >> cleanup_report.md
echo "- Prints: $(grep -r 'print(' lib/ --include='*.dart' | wc -l)" >> cleanup_report.md
echo "" >> cleanup_report.md
echo "## Backend" >> cleanup_report.md
echo "- Warnings: $(npm run lint -- --quiet 2>&1 | wc -l)" >> cleanup_report.md
echo "- Console.logs: $(grep -r 'console\.' src/ --include='*.ts' | wc -l)" >> cleanup_report.md
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
3. **Guía Interactiva**: [../../guide/index.html](../../guide/index.html)
4. **AI Tips**: [../../guide/ai-tips.html](../../guide/ai-tips.html)

## 🎉 Beneficios Inmediatos

✅ **Código profesional** - Cero warnings, cero prints  
✅ **Mantenible** - Actualizado a versiones actuales  
✅ **Trackeable** - TODOs convertidos en issues  
✅ **Debuggeable** - Logs apropiados en lugar de prints  
✅ **Rápido** - Auto-fix ahorra horas de trabajo manual  

## 🚀 Próximos Pasos

### Inmediato
1. ✅ Probar `@cleanup.prompt` con Copilot
2. ⏳ Ejecutar primera limpieza en `lib/features/auth/`
3. ⏳ Crear issues para TODOs encontrados

### Corto Plazo
1. ⏳ Limpiar todos los prints en Flutter
2. ⏳ Actualizar deprecations de Flutter 2.x
3. ⏳ Limpiar console.logs en Backend

### Mediano Plazo
1. ⏳ Integrar en pre-commit hooks
2. ⏳ Agregar checks en CI/CD
3. ⏳ Sprint cleanup mensual

---

**Versión**: 1.0.0  
**Última actualización**: 2025-11-14  
**Mantenedor**: @tiagofur

