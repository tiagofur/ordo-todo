# 📚 Archivos de Configuración y Documentación - PPN

Este directorio contiene todos los archivos de configuración y documentación necesarios para el desarrollo del proyecto **Pepinillo Pomodoro (PPN)**.

## 📂 Estructura de Archivos Creados

```
.github/
├── CONTRIBUTING.md                    # ✅ Guía de contribución
├── PULL_REQUEST_TEMPLATE.md          # ✅ Template para PRs
├── ISSUE_TEMPLATE/                    # ✅ Templates para issues
│   ├── bug_report.md
│   ├── feature_request.md
│   └── task.md
├── prompts/                           # ✅ Prompts de GitHub Copilot
│   ├── README.md                     # 🆕 Guía completa de prompts
│   ├── prompts.prompt.md             # Principal (ya existía)
│   ├── debug.prompt.md               # 🆕 Debugging specialist
│   ├── testing.prompt.md             # 🆕 Testing specialist
│   ├── refactor.prompt.md            # 🆕 Refactoring specialist
│   ├── documentation.prompt.md       # 🆕 Documentation specialist
│   └── cleanup.prompt.md             # 🆕 Code cleanup specialist
├── copilot-instructions.md            # Guía completa (ya existía)
├── copilot-agents.yml                 # Agentes especializados (ya existía)
└── instructions/
    └── chat.instructions.md           # Chat instructions (ya existía)

.vscode/
├── settings.json                      # ✅ Mejorado con config NestJS
├── extensions.json                    # 🆕 Extensiones recomendadas
├── launch.json                        # 🆕 Configuraciones de debugging
└── tasks.json                         # 🆕 Tasks automatizadas
```

## 🎯 Propósito de Cada Archivo

### GitHub (`.github/`)

#### 📖 CONTRIBUTING.md
**Propósito**: Guía completa para contribuidores  
**Contenido**:
- Setup inicial (backend, flutter, astro)
- Workflow de desarrollo
- Standards de código (Flutter/Dart, NestJS/TypeScript, PostgreSQL)
- Testing requirements
- Pull request process
- Commit message conventions

**Cuándo usar**: Antes de contribuir al proyecto

#### 📝 PULL_REQUEST_TEMPLATE.md
**Propósito**: Template automático para PRs  
**Contenido**:
- Descripción estructurada
- Tipos de cambio (bug, feature, refactor, etc.)
- Checklist completo (código, testing, seguridad, docs, performance, a11y)
- Secciones específicas para Flutter y Backend
- Criterios de aceptación

**Cuándo usar**: Automáticamente al crear un PR en GitHub

#### 🐛 ISSUE_TEMPLATE/bug_report.md
**Propósito**: Reportar bugs con toda la info necesaria  
**Contenido**:
- Descripción del bug
- Entorno (plataforma, componente, versión)
- Pasos para reproducir
- Comportamiento esperado vs actual
- Screenshots/logs
- Prioridad y contexto

**Cuándo usar**: Al encontrar un bug

#### ✨ ISSUE_TEMPLATE/feature_request.md
**Propósito**: Proponer nuevas funcionalidades  
**Contenido**:
- Descripción de la feature
- Problema que resuelve (User Story)
- Solución propuesta (UI/UX, flujo)
- Detalles técnicos (frontend, backend, database)
- Prioridad, impacto, esfuerzo estimado
- Alternativas y riesgos

**Cuándo usar**: Al proponer una nueva feature

#### 📋 ISSUE_TEMPLATE/task.md
**Propósito**: Tareas de desarrollo, refactoring, mantenimiento  
**Contenido**:
- Tipo de tarea (refactoring, cleanup, deps, docs, etc.)
- Contexto y justificación
- Checklist de subtareas
- Archivos/áreas afectadas
- Criterios de completitud

**Cuándo usar**: Para tareas técnicas que no son bugs ni features

### GitHub Copilot Prompts (`.github/prompts/`)

#### 🚀 prompts.prompt.md (Principal)
**Propósito**: Prompt contextual reutilizable para GitHub Copilot  
**Cuándo usar**: `@prompts` en Copilot Chat para cualquier tarea general

**Ejemplo**:
```
@prompts Crea un widget StatCard para Flutter
→ Copilot aplica reglas de theme system, componentización, accesibilidad
```

#### 🐛 debug.prompt.md
**Propósito**: Especializado en debugging  
**Contenido**:
- Metodología de debugging sistemática
- Checklist para Flutter y NestJS
- Common issues y soluciones
- Debug commands útiles
- Template de debug report

**Cuándo usar**: Al investigar bugs complejos

**Ejemplo**:
```
@debug.prompt Por qué mi widget no se reconstruye al cambiar estado?
→ Copilot analiza con metodología de debugging
```

#### 🧪 testing.prompt.md
**Propósito**: Especializado en testing  
**Contenido**:
- Testing philosophy y pyramid
- Unit tests (Flutter & NestJS)
- Widget tests
- E2E/Integration tests
- Coverage goals
- Templates de tests

**Cuándo usar**: Al escribir tests o mejorar coverage

**Ejemplo**:
```
@testing.prompt Crea tests para TasksService
→ Copilot genera tests completos con AAA pattern
```

#### ♻️ refactor.prompt.md
**Propósito**: Especializado en refactoring  
**Contenido**:
- Refactoring philosophy
- Patterns de componentización
- Code smells a resolver
- Técnicas de refactoring
- Before/After examples

**Cuándo usar**: Al refactorizar código existente

**Ejemplo**:
```
@refactor.prompt Esta pantalla tiene 500 líneas, componentiza
→ Copilot divide en componentes pequeños
```

#### 📚 documentation.prompt.md
**Propósito**: Especialista en documentación organizada  
**Contenido**:
- Estructura de carpetas docs/
- Reglas de nomenclatura (kebab-case)
- Template de documentos
- Workflow crear/actualizar/archivar

**Cuándo usar**: Al crear o mantener documentación

**Ejemplo**:
```
@documentation.prompt Documenta el sistema de auth JWT
→ Crea doc en backend/api/authentication.md
```

#### 🔧 cleanup.prompt.md
**Propósito**: Limpieza de código (warnings, deprecations, prints)  
**Contenido**:
- Detectar print statements → Logger
- Actualizar código deprecated
- Eliminar imports/variables no usados
- Corregir warnings del linter
- Buscar TODOs y crear issues

**Cuándo usar**: Antes de commit, para mantener código limpio

**Ejemplo**:
```
@cleanup.prompt Elimina todos los print() en lib/
→ Reemplaza con Logger apropiado
```

### VSCode Configuration (`.vscode/`)

#### ⚙️ settings.json
**Propósito**: Configuración de VS Code para el proyecto  
**Contenido**:
- Format on save (Dart, TypeScript)
- Auto-fix con dart fix y ESLint
- Exclusiones de archivos pesados
- GitHub Copilot habilitado
- Inlay hints y bracket colorization

**Beneficios**:
- ✅ Código formateado automáticamente
- ✅ Linter ejecutado al guardar
- ✅ Workspace consistente entre devs

#### 🧩 extensions.json
**Propósito**: Extensiones recomendadas de VS Code  
**Contenido**:
- Flutter/Dart essentials
- TypeScript/NestJS tools
- Database tools (PostgreSQL)
- Git tools (GitLens, GitHub PR)
- Productivity utilities

**Beneficios**:
- ✅ Setup automático al abrir workspace
- ✅ Todos los devs usan las mismas herramientas

#### 🐛 launch.json
**Propósito**: Configuraciones de debugging  
**Contenido**:
- Flutter (dev, web, windows, profile)
- NestJS (dev, debug, tests)
- Astro (dev)
- Compound configs (Full Stack)

**Cuándo usar**: F5 para debug, o "Run and Debug" panel

**Ejemplo**:
```
F5 → Seleccionar "🚀 Full Stack (Flutter + NestJS)"
→ Lanza backend y frontend simultáneamente
```

#### ⚡ tasks.json
**Propósito**: Tasks automatizadas  
**Contenido**:
- Flutter (run, test, analyze, clean)
- NestJS (dev, test, e2e, lint, build)
- Database (migrations, docker)
- Stripe (webhook listener)
- Composite tasks (start full stack, run all tests)

**Cuándo usar**: Cmd+Shift+B o "Terminal > Run Task"

**Ejemplo**:
```
Cmd+Shift+B → "🚀 Start Full Stack"
→ Levanta PostgreSQL + NestJS automáticamente
```

## 🚀 Cómo Usar Estos Archivos

### Para Desarrollo Diario

1. **Al iniciar el proyecto**:
   ```bash
   # VSCode te recomendará instalar extensiones
   # Aceptar todas las recomendaciones
   ```

2. **Al crear features nuevas**:
   - Usar `@prompts` en Copilot Chat
   - Seguir standards de CONTRIBUTING.md
   - Usar tasks de VSCode (Cmd+Shift+B)

3. **Al encontrar bugs**:
   - Crear issue con template `bug_report.md`
   - Usar `@debug.prompt` para investigar

4. **Al refactorizar**:
   - Usar `@refactor.prompt` en Copilot Chat
   - Seguir checklist en refactor.prompt.md

5. **Al escribir tests**:
   - Usar `@testing.prompt` en Copilot Chat
   - Alcanzar coverage mínimo (70% backend, 60% flutter)

### Para Contributors Nuevos

1. Leer `CONTRIBUTING.md` primero
2. Instalar extensiones recomendadas (VSCode te lo pedirá)
3. Usar templates de issues/PRs
4. Usar prompts de Copilot para ayuda contextual

### Para Debugging

**Método 1: VSCode Debugger**
```
1. F5 → Seleccionar configuración
2. Poner breakpoints
3. Inspeccionar variables
```

**Método 2: Tasks**
```
1. Cmd+Shift+B
2. Seleccionar task (ej: "NestJS: Start Dev")
3. Ver logs en terminal integrado
```

**Método 3: Copilot Debug Assistant**
```
Chat: @debug.prompt Mi endpoint retorna 401 en producción
→ Copilot sugiere checklist de debugging
```

## 📊 Workflow Completo Ejemplo

### Crear Nueva Feature

```bash
# 1. Crear branch
git checkout -b feature/task-filters

# 2. Crear issue en GitHub
# Usar template feature_request.md

# 3. Desarrollar con Copilot
# Chat: @prompts Crea filtros para lista de tareas
# → Copilot genera código siguiendo standards

# 4. Testing
# Cmd+Shift+B → "🧪 Run All Tests"
# O usar @testing.prompt para generar tests

# 5. Validar
# Cmd+Shift+B → "🔍 Lint All"

# 6. Commit
git commit -m "feat(tasks): add filter functionality"

# 7. Push y crear PR
git push origin feature/task-filters
# → Template de PR se aplica automáticamente
# → Completar checklist

# 8. Code review
# → Reviewers validan contra CONTRIBUTING.md

# 9. Merge
# → Squash and merge
```

## 🎯 Beneficios de Esta Estructura

### Para Desarrolladores

- ✅ **Consistencia**: Todos siguen los mismos standards
- ✅ **Productividad**: Tasks y configs automatizadas
- ✅ **Aprendizaje**: Prompts de Copilot educan sobre mejores prácticas
- ✅ **Calidad**: Templates fuerzan documentación completa

### Para el Proyecto

- ✅ **Mantenibilidad**: Código consistente y documentado
- ✅ **Onboarding Rápido**: CONTRIBUTING.md + prompts
- ✅ **Menos Errores**: Linters y formatters automáticos
- ✅ **Mejor Comunicación**: Templates estructurados

### Para Copilot

- ✅ **Contexto Rico**: Instrucciones claras en cada prompt
- ✅ **Especialización**: Prompts especializados para tareas específicas
- ✅ **Standards Aplicados**: Genera código siguiendo reglas del proyecto

## 🔗 Referencias Rápidas

| Archivo | Propósito | Comando/Uso |
|---------|-----------|-------------|
| `CONTRIBUTING.md` | Guía completa | Leer antes de contribuir |
| `prompts.prompt.md` | Prompt general | `@prompts <tarea>` |
| `debug.prompt.md` | Debugging | `@debug.prompt <problema>` |
| `testing.prompt.md` | Testing | `@testing.prompt <componente>` |
| `refactor.prompt.md` | Refactoring | `@refactor.prompt <código>` |
| `settings.json` | Config VSCode | Automático |
| `extensions.json` | Extensiones | Acepta al abrir workspace |
| `launch.json` | Debugging | F5 |
| `tasks.json` | Tasks | Cmd+Shift+B |

## 📝 Mantenimiento

Estos archivos deben actualizarse cuando:

- ✅ Cambian standards de código
- ✅ Se agregan nuevas herramientas/dependencias
- ✅ Se identifican nuevos patterns o anti-patterns
- ✅ Se actualizan versiones de frameworks

---

**Creado**: 2025-01-14  
**Última actualización**: 2025-01-14  
**Mantenedor**: @tiagofur

**¡Toda la configuración lista para construir PPN! 🚀**
