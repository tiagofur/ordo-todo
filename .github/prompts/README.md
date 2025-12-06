# 🤖 GitHub Copilot Prompts - Ordo-Todo

Colección de prompts especializados para desarrollo en **Ordo-Todo**.

## 📚 Prompts Disponibles

> **Total**: 7 prompts especializados (⭐ = más usado, ✨ = nuevo)

### 1. **@prompts** - General Assistant ⭐
**Archivo**: Configurado en `.github/copilot-instructions.md`  
**Propósito**: Ayudante general del proyecto Ordo-Todo

**Conoce**:
- ✅ Arquitectura completa (Next.js + React Native + Electron + NestJS + PostgreSQL)
- ✅ Convenciones de código (TailwindCSS, DTOs, seguridad)
- ✅ Estructura del monorepo Turborepo
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
@debug.prompt El endpoint /auth/login retorna 401.
Ya agregué @Public() pero sigue fallando. ¿Qué revisar?
```

---

### 3. **@testing.prompt** - Testing Expert
**Archivo**: `testing.prompt.md`  
**Propósito**: Experto en testing (unit, integration, E2E)

**Especialidades**:
- ✅ AAA Pattern (Arrange-Act-Assert)
- ✅ React: component tests, integration tests
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
- ✅ Extract Component/Hook
- ✅ Eliminate Duplication
- ✅ Improve Names
- ✅ Apply Design Patterns
- ✅ Componentización extrema

**Uso**:
```
@refactor.prompt Esta página dashboard/page.tsx tiene 500 líneas.
Divídela en componentes reutilizables manteniendo la funcionalidad.
```

---

### 5. **@documentation.prompt** - Documentation Specialist
**Archivo**: `documentation.prompt.md`  
**Propósito**: Mantiene documentación organizada y actualizada

**Reglas**:
- ✅ Docs en carpetas correctas (backend/, web/, etc.)
- ✅ Nomenclatura kebab-case
- ✅ Evita duplicación
- ✅ Archiva obsoletos (NO elimina)
- ✅ Actualiza índices

**Uso**:
```
@documentation.prompt Documenta el sistema de auth JWT
en docs/backend/authentication.md con ejemplos

@documentation.prompt Actualiza README.md con instrucciones
para la nueva app desktop
```

---

### 6. **@cleanup.prompt** - Code Cleanup Specialist ✨
**Archivo**: `cleanup.prompt.md`  
**Propósito**: Elimina warnings, deprecations y malas prácticas

**Detecta y Corrige**:
- ✅ console.log → Logger / eliminar
- ✅ Código deprecated → Versión actual
- ✅ Imports no usados
- ✅ Variables no utilizadas
- ✅ Warnings del linter
- ✅ TODOs → Issues de GitHub

**Uso**:
```
@cleanup.prompt Busca todos los console.log en apps/web/src/ y elimínalos
o reemplázalos con logger apropiado

@cleanup.prompt Encuentra código deprecated de React 18
y actualiza a React 19 patterns

@cleanup.prompt Elimina imports no usados en todo el proyecto backend
```

---

### 7. **@guide-sync.prompt** - Guide Sync Specialist 🔄 ✨
**Archivo**: `guide-sync.prompt.md`  
**Propósito**: Sincroniza `docs/` (Markdown) con guías interactivas

**Especialidades**:
- ✅ Audita documentación técnica nueva/actualizada
- ✅ Identifica contenido relevante para guías
- ✅ Transforma MD → HTML interactivo
- ✅ Mantiene cross-references
- ✅ Genera reportes de sincronización

**Uso**:
```
@guide-sync.prompt Revisa docs/backend/ y identifica cambios
que necesitan actualizar la documentación pública

@guide-sync.prompt Genera reporte de sincronización docs/ → README
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

| Prompt | Desarrollo | Debugging | Testing | Refactor | Docs | Cleanup |
|--------|-----------|-----------|---------|----------|------|---------|
| `@prompts` | ✅✅✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `@debug.prompt` | ⚪ | ✅✅✅ | ✅ | ⚪ | ⚪ | ⚪ |
| `@testing.prompt` | ✅ | ✅ | ✅✅✅ | ✅ | ⚪ | ⚪ |
| `@refactor.prompt` | ⚪ | ⚪ | ✅ | ✅✅✅ | ⚪ | ✅ |
| `@documentation.prompt` | ✅ | ⚪ | ⚪ | ⚪ | ✅✅✅ | ⚪ |
| `@cleanup.prompt` | ✅ | ⚪ | ⚪ | ✅ | ⚪ | ✅✅✅ |
| `@guide-sync.prompt` | ⚪ | ⚪ | ⚪ | ⚪ | ✅ | ⚪ |

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
✅ @refactor.prompt Extrae los componentes duplicados en esta página
   a componentes reutilizables en src/components/
```

### 2. Proporciona Contexto

```
❌ @cleanup.prompt Limpia el código
✅ @cleanup.prompt Busca console.log en apps/backend/src/ y reemplaza
   con Logger. Mantén solo 1 import de logging por archivo.
```

### 3. Combina Prompts

```
# Workflow completo para nueva feature
@prompts Implementa login con email/password
# [código generado]

@testing.prompt Crea tests para AuthService
# [tests generados]

@cleanup.prompt Elimina console.logs y formatea código
# [código limpio]

@documentation.prompt Documenta en docs/backend/authentication.md
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
- [guide-sync.prompt.md](guide-sync.prompt.md) - Sincronización docs

### Guías del Proyecto

- [CLAUDE.md](../../CLAUDE.md) - Guía completa del proyecto
- [Copilot Instructions](../copilot-instructions.md) - Instrucciones generales
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Guía de contribución

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

- [x] `@guide-sync.prompt` - Sincronización docs ✅ **COMPLETADO**
- [ ] `@performance.prompt` - Optimización de performance
- [ ] `@security.prompt` - Auditoría de seguridad
- [ ] `@migration.prompt` - Migraciones de versiones
- [ ] `@api.prompt` - Diseño de APIs REST
- [ ] `@ui.prompt` - Componentes UI específicos

---

**Versión**: 2.0.0  
**Última actualización**: 2025-12-06  
**Proyecto**: Ordo-Todo  
**Mantenedor**: @tiagofur

