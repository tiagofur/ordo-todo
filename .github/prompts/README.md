# 🤖 GitHub Copilot Prompts - PPN

Colección de prompts especializados para desarrollo en **Pepinillo Pomodoro (PPN)**.

## 📚 Prompts Disponibles

> **Total**: 7 prompts especializados (⭐ = más usado, ✨ = nuevo)

### 1. **@prompts** - General Assistant ⭐
**Archivo**: Configurado en `.github/copilot-instructions.md`  
**Propósito**: Ayudante general del proyecto PPN

**Conoce**:
- ✅ Arquitectura completa (Flutter + NestJS + PostgreSQL + Stripe)
- ✅ Convenciones de código (theme system, DTOs, seguridad)
- ✅ Estructura del proyecto
- ✅ Best practices del stack

**Uso**:
```
@prompts Crea un endpoint POST /tasks que valide con DTOs
y extraiga userId del JWT
```

---

### 2. **@debug.prompt** - Debugging Specialist
**Archivo**: `debug.prompt.md`  
**Propósito**: Especialista en encontrar y resolver bugs

**Metodología**:
1. 🔍 Reproduce el bug consistentemente
2. 🎯 Aísla el componente problemático
3. 🔬 Analiza el código relevante
4. 🧪 Hipótesis y validación
5. ✅ Fix y test de regresión

**Uso**:
```
@debug.prompt El endpoint /stripe/webhook retorna 401.
Ya agregué @Public() pero sigue fallando. ¿Qué revisar?
```

---

### 3. **@testing.prompt** - Testing Expert
**Archivo**: `testing.prompt.md`  
**Propósito**: Experto en testing (unit, integration, E2E)

**Especialidades**:
- ✅ AAA Pattern (Arrange-Act-Assert)
- ✅ Flutter: widget tests, integration tests
- ✅ NestJS: unit tests, E2E tests
- ✅ Mocks y stubs apropiados
- ✅ Edge cases y error handling

**Uso**:
```
@testing.prompt Genera tests completos para TasksService
incluyendo casos edge y error handling
```

---

### 4. **@refactor.prompt** - Refactoring Master
**Archivo**: `refactor.prompt.md`  
**Propósito**: Maestro de refactoring

**Técnicas**:
- ✅ Extract Method/Widget
- ✅ Eliminate Duplication
- ✅ Improve Names
- ✅ Apply Design Patterns
- ✅ Componentización extrema

**Uso**:
```
@refactor.prompt Esta pantalla profile_screen.dart tiene 500 líneas.
Divídela en componentes reutilizables manteniendo la funcionalidad.
```

---

### 5. **@documentation.prompt** - Documentation Specialist
**Archivo**: `documentation.prompt.md`  
**Propósito**: Mantiene documentación organizada y actualizada

**Reglas**:
- ✅ Docs en carpetas correctas (backend/, flutter/, etc.)
- ✅ Nomenclatura kebab-case
- ✅ Evita duplicación
- ✅ Archiva obsoletos (NO elimina)
- ✅ Actualiza índices

**Uso**:
```
@documentation.prompt Documenta el sistema de auth JWT
en backend/api/authentication.md con ejemplos

@documentation.prompt Archiva THEME_AUDIT_REPORT.md
porque ya está consolidado en flutter/ui/theme-system.md
```

---

### 6. **@cleanup.prompt** - Code Cleanup Specialist ✨
**Archivo**: `cleanup.prompt.md`  
**Propósito**: Elimina warnings, deprecations y malas prácticas

**Detecta y Corrige**:
- ✅ Print statements → Logger
- ✅ Console.log → Logger inyectado
- ✅ Código deprecated → Versión actual
- ✅ Imports no usados
- ✅ Variables no utilizadas
- ✅ Warnings del linter
- ✅ TODOs → Issues de GitHub

**Uso**:
```
@cleanup.prompt Busca todos los print() en lib/ y reemplázalos
con Logger apropiado

@cleanup.prompt Encuentra código deprecated de Flutter 2.x
y actualiza a Flutter 3.x según migration guide

@cleanup.prompt Elimina imports no usados y variables sin usar
en todo el proyecto backend
```

---

### 7. **@guide-sync.prompt** - Guide Sync Specialist 🔄 ✨ NUEVO
**Archivo**: `guide-sync.prompt.md`  
**Propósito**: Sincroniza `docs/` (Markdown) con `guide/` (HTML interactivo)

**Especialidades**:
- ✅ Audita documentación técnica nueva/actualizada
- ✅ Identifica contenido relevante para guías visuales
- ✅ Transforma MD → HTML interactivo
- ✅ Mantiene cross-references bidireccionales
- ✅ Genera reportes de sincronización

**Transformaciones**:
- 📊 Tablas MD → Tablas HTML styled
- 🎨 Código MD → Code blocks con copy button
- 🔍 Lists MD → Checklists interactivos
- 📐 Texto → Diagramas ASCII visuales

**Uso**:
```
@guide-sync.prompt Revisa docs/backend/ y actualiza guide/
con lo que sea relevante

@guide-sync.prompt Crea guide/stripe-integration.html desde
docs/subscription/stripe-integration.md

@guide-sync.prompt Genera reporte de sincronización docs/ → guide/

@guide-sync.prompt Actualiza guide/authentication.html con cambios
recientes de docs/backend/api/authentication.md
```

---

## 🎯 Cuándo Usar Cada Prompt

### Desarrollo de Nueva Feature

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

**Workflow**:
1. `@prompts` - Implementar feature
2. `@testing.prompt` - Crear tests
3. `@cleanup.prompt` - Limpiar código
4. `@documentation.prompt` - Documentar

### Debugging

```
1. @debug.prompt - Identificar y resolver bug
2. @testing.prompt - Test de regresión
3. @cleanup.prompt - Limpiar código relacionado
```

### Refactoring

```
1. @refactor.prompt - Mejorar código existente
2. @testing.prompt - Validar no rompimos nada
3. @cleanup.prompt - Eliminar código muerto
```

### Mantenimiento

```
1. @cleanup.prompt - Limpiar warnings y deprecations
2. @testing.prompt - Agregar tests faltantes
3. @documentation.prompt - Actualizar docs
```

---

## 📊 Matriz de Prompts

| Prompt | Desarrollo | Debugging | Testing | Refactor | Docs | Cleanup | Guide Sync |
|--------|-----------|-----------|---------|----------|------|---------|------------|
| `@prompts` | ✅✅✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@debug.prompt` | ⚪ | ✅✅✅ | ✅ | ⚪ | ⚪ | ⚪ | ⚪ |
| `@testing.prompt` | ✅ | ✅ | ✅✅✅ | ✅ | ⚪ | ⚪ | ⚪ |
| `@refactor.prompt` | ⚪ | ⚪ | ✅ | ✅✅✅ | ⚪ | ✅ | ⚪ |
| `@documentation.prompt` | ✅ | ⚪ | ⚪ | ⚪ | ✅✅✅ | ⚪ | ✅ |
| `@cleanup.prompt` | ✅ | ⚪ | ⚪ | ✅ | ⚪ | ✅✅✅ | ⚪ |
| `@guide-sync.prompt` ✨ | ⚪ | ⚪ | ⚪ | ⚪ | ✅ | ⚪ | ✅✅✅ |

**Leyenda**:
- ✅✅✅ = Uso principal
- ✅ = Uso secundario
- ⚪ = No aplica

---

## 🔧 Configuración

### VSCode

Los prompts se detectan automáticamente si:
1. El repositorio está abierto en VSCode
2. La carpeta `.github/prompts/` existe
3. GitHub Copilot está habilitado

### Verificar Prompts Disponibles

```
# En Copilot Chat, escribe:
@

# Deberías ver:
# - @workspace
# - @prompts
# - @debug.prompt
# - @testing.prompt
# - @refactor.prompt
# - @documentation.prompt
# - @cleanup.prompt
```

---

## 💡 Tips de Uso

### 1. Sé Específico

```
❌ @refactor.prompt Mejora este código
✅ @refactor.prompt Extrae los widgets duplicados en esta pantalla
   a componentes reutilizables en lib/core/widgets/
```

### 2. Proporciona Contexto

```
❌ @cleanup.prompt Limpia el código
✅ @cleanup.prompt Busca print() en lib/features/auth/ y reemplaza
   con Logger. Mantén solo 1 import de logging por archivo.
```

### 3. Combina Prompts

```
# Workflow completo para nueva feature
@prompts Implementa login con email/password
# [código generado]

@testing.prompt Crea tests para AuthService
# [tests generados]

@cleanup.prompt Elimina prints y formatea código
# [código limpio]

@documentation.prompt Documenta en backend/api/authentication.md
# [documentación creada]
```

### 4. Iteración

Si la primera respuesta no es perfecta:

```
@refactor.prompt [primera respuesta]

# Si no te gusta:
Bien, pero simplifica más. Usa composition en lugar de inheritance.

# Copilot ajustará el enfoque
```

---

## 📚 Recursos

### Documentación Completa de Prompts

- [debug.prompt.md](debug.prompt.md) - Metodología de debugging
- [testing.prompt.md](testing.prompt.md) - Estrategias de testing
- [refactor.prompt.md](refactor.prompt.md) - Técnicas de refactoring
- [documentation.prompt.md](documentation.prompt.md) - Sistema de docs
- [cleanup.prompt.md](cleanup.prompt.md) - Limpieza de código
- [guide-sync.prompt.md](guide-sync.prompt.md) - Sincronización docs ↔ guide ✨

### Guías del Proyecto

- [Developer Guide](../../guide/index.html) - Guía interactiva HTML
- [AI Development Tips](../../guide/ai-tips.html) - Tips avanzados de IA
- [Copilot Instructions](../copilot-instructions.md) - Instrucciones generales

### Documentación Oficial

- [GitHub Copilot Docs](https://docs.github.com/en/copilot)
- [Copilot Chat](https://docs.github.com/en/copilot/github-copilot-chat)
- [VS Code Copilot](https://code.visualstudio.com/docs/copilot/overview)

---

## 🎓 Mejores Prácticas

### ✅ Hacer

1. **Usar el prompt más específico** para la tarea
2. **Proporcionar contexto** completo
3. **Iterar** si la respuesta no es perfecta
4. **Combinar prompts** para workflows complejos
5. **Validar output** con linters y tests

### ❌ Evitar

1. Usar `@prompts` genérico para tareas especializadas
2. Prompts vagos sin contexto
3. Aceptar código sin revisar
4. No ejecutar tests después de cambios
5. Ignorar warnings generados

---

## 📊 Métricas de Éxito

Track tu uso de prompts:

```markdown
# Weekly Prompt Usage Report

## Prompts Usados
- @prompts: 15 veces
- @debug.prompt: 5 veces
- @testing.prompt: 8 veces
- @refactor.prompt: 3 veces
- @documentation.prompt: 4 veces
- @cleanup.prompt: 6 veces

## Resultados
- Features implementadas: 3
- Bugs resueltos: 5
- Tests creados: 12
- Docs actualizados: 4
- Warnings eliminados: 23

## Acceptance Rate
- Código aceptado directamente: 60%
- Código con ajustes menores: 30%
- Código rechazado/reescrito: 10%
```

---

## 🚀 Próximos Prompts (Roadmap)

Ideas para futuros prompts especializados:

- [x] `@guide-sync.prompt` - Sincronización docs ↔ guide ✅ **COMPLETADO**
- [ ] `@performance.prompt` - Optimización de performance
- [ ] `@security.prompt` - Auditoría de seguridad
- [ ] `@migration.prompt` - Migraciones de versiones
- [ ] `@api.prompt` - Diseño de APIs REST
- [ ] `@ui.prompt` - Componentes UI específicos

---

**Versión**: 1.2.0  
**Última actualización**: 2025-11-14  
**Changelog**: Agregado `@guide-sync.prompt` para sincronización docs/ ↔ guide/  
**Mantenedor**: @tiagofur

