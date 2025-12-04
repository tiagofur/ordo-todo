---
applyTo: "**"
---

# 🤖 PPN Copilot Chat Instructions

Estas instrucciones definen el comportamiento de GitHub Copilot Chat para el proyecto **Pepinillo Pomodoro (PPN)**.

## 🎯 Contexto del Proyecto

**Proyecto**: PPN (Pepinillo Pomodoro) - App de productividad con técnica Pomodoro  
**Stack**: Flutter + NestJS + PostgreSQL + Stripe  
**Repositorio**: tiagofur/ppn-new  
**Issues Activos**: #26-#31 (Sistema de temas, widgets, refactoring)

## 📁 Estructura del Proyecto

```
ppn-new/
├── flutter/          # Frontend multiplataforma (Flutter/Dart)
├── backend/          # API REST (NestJS/TypeScript)
├── astro/            # Landing page (Astro)
├── docs/             # Documentación técnica
└── .github/
    ├── copilot-instructions.md   # Guía completa (1111 líneas)
    ├── copilot-agents.yml        # Agentes especializados
    └── agents/
        ├── flutter-ui-ux.md      # Flutter UI/UX Expert
        └── nest-backend.md       # NestJS Backend Specialist
```

## 🎨 Estilo de Comunicación

### Preferencias del Usuario

- **Idioma principal**: Español (para discusiones técnicas)
- **Código**: Inglés (nombres de variables, funciones, comentarios)
- **Documentación**: Español para docs internas, Inglés para código
- **Formato**: Directo, conciso, sin fluff innecesario
- **Emojis**: ✅ Usar para mejor legibilidad (pero no abusar)

### Tono y Enfoque

- **Proactivo**: Sugerir mejoras sin esperar a que las pidan
- **Educativo**: Explicar el "por qué" de las decisiones
- **Técnico**: Fundamentos en mejores prácticas
- **Práctico**: Soluciones implementables, no teóricas
- **Entusiasta**: Celebrar buen código y diseño

## 💻 Reglas de Código

### Flutter/Dart

```dart
// ✅ SIEMPRE hacer:
- Usar theme system (NO hardcodear colores/spacing)
- Extraer widgets > 150 líneas en componentes
- const constructors siempre que sea posible
- Documentar componentes reutilizables con ejemplos
- Nombres descriptivos (NO GenericWidget1)
- DRY: Don't Repeat Yourself

// ❌ NUNCA hacer:
- Hardcodear colores: Colors.blue ❌ → theme.colorScheme.primary ✅
- Hardcodear spacing: 16 ❌ → AppConstants.spacingM ✅
- Hardcodear shadows: BoxShadow(...) ❌ → AppShadows.getSmall() ✅
- Widgets gigantes (> 200 líneas) ❌
- Duplicar patrones de código ❌
- Ignorar accesibilidad ❌
```

**Acceso al Theme**:

```dart
final theme = Theme.of(context);
final colors = theme.componentColors;
final brightness = theme.brightness;
final visualStyle = theme.visualStyle;
```

**Archivos clave Flutter**:

- `lib/core/theme/` - Sistema de theming
- `lib/core/constants/app_constants.dart` - Constantes
- `lib/core/widgets/` - Widgets comunes

### NestJS/TypeScript

```typescript
// ✅ SIEMPRE hacer:
- DTOs con validación class-validator en TODOS los endpoints
- userId del JWT (req.user.userId), NUNCA del body
- @Public() decorator para endpoints públicos
- Try-catch con type-safe error handling
- Dependency injection (NO instanciar servicios manualmente)
- TypeScript strict mode

// ❌ NUNCA hacer:
- Confiar en userId del body (vulnerabilidad) ❌
- Olvidar @Public() en login/register ❌
- Acceder a error.message sin type checking ❌
- console.log (usar Logger inyectado) ❌
- Hardcodear secrets (usar .env) ❌
```

**Pattern de Seguridad**:

```typescript
// ✅ CORRECTO: userId del JWT
@Post('tasks')
async createTask(
  @Req() req: AuthenticatedRequest,
  @Body() createTaskDto: CreateTaskDto,
) {
  const userId = req.user.userId; // Del token JWT ✅
  return this.tasksService.create(userId, createTaskDto);
}

// ❌ INCORRECTO: userId del body
@Post('tasks')
async createTask(@Body() createTaskDto: CreateTaskDto) {
  const userId = createTaskDto.userId; // ❌ VULNERABILIDAD
}
```

**Archivos clave Backend**:

- `backend/src/auth/` - Autenticación JWT
- `backend/src/stripe/` - Integración Stripe
- `backend/src/common/decorators/` - Decorators personalizados

## 🔐 Seguridad Crítica

### JWT Guard Global

**IMPORTANTE**: El backend usa JWT como guard GLOBAL. Todos los endpoints requieren autenticación por defecto.

```typescript
// ✅ Endpoint público (login, register)
@Post('login')
@Public() // ← CRÍTICO: Excluir del guard global
async login(@Body() loginDto: LoginDto) {}

// ✅ Endpoint protegido (automático, no necesita decorators)
@Get('profile')
async getProfile(@Req() req: AuthenticatedRequest) {}
```

### Stripe Dual Security

El sistema Stripe tiene **comportamiento dual** por entorno:

- **Desarrollo**: Permite webhooks sin customer vinculado (para testing con `stripe trigger`)
- **Producción**: Rechaza webhooks sin customer vinculado (seguridad)

```typescript
if (isProduction) {
  // 🚨 Rechazar si customer no existe
  throw new Error(`Security violation: Customer not linked`);
} else {
  // 🧪 Permitir para testing
  this.logger.warn(`[DEV MODE] Customer not linked. OK for testing.`);
}
```

## 🛠️ Comandos Frecuentes

### Backend (NestJS)

```powershell
cd backend

# Desarrollo
npm run start:dev              # Hot reload
npm run start:debug            # Con debugger

# Testing
npm run test                   # Unit tests
npm run test:e2e               # E2E tests
npm run test:cov               # Coverage

# Database
npm run migration:generate -- src/database/migrations/NameOfMigration
npm run migration:run
npm run migration:revert

# Stripe Webhooks
stripe listen --forward-to http://localhost:3001/api/v1/stripe/webhook
stripe trigger customer.subscription.created

# Docker
docker-compose -f docker-compose-db.yml up -d  # Solo PostgreSQL
docker-compose up -d                           # Todo
npm run docker:clean                           # Limpiar
```

### Flutter

```powershell
cd flutter

# Desarrollo
flutter run -d windows         # Windows app
flutter run -d chrome          # Web app
flutter run -d android         # Android (emulator)

# Testing
flutter test                   # Unit + Widget tests
flutter test integration_test/ # Integration tests
flutter analyze                # Linter

# Build
flutter build apk              # Android APK
flutter build web              # Web app
flutter build windows          # Windows app
```

## 📚 Referencias Rápidas

### Variables de Entorno Críticas

```env
# Backend (.env)
NODE_ENV=development           # development | production
DB_TYPE=postgres               # postgres | sqlite
DB_HOST=localhost
DB_PORT=5432                   # 5433 para docker-compose-db.yml
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=pepinillo_db
JWT_SECRET=your-secret-here    # openssl rand -hex 32
STRIPE_ENABLED=true
STRIPE_API_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Flutter API Config

```dart
// lib/core/config/api_config.dart
const apiBaseUrl = 'http://localhost:3001/api/v1';  // Local
// const apiBaseUrl = 'http://10.0.2.2:3001/api/v1';  // Android emulator
```

### Issues Activos

- **#26**: Sistema de temas centralizado
- **#27**: Biblioteca de widgets comunes
- **#28**: Refactorizar pantallas grandes
- **#29**: Auditoría de uso de temas
- **#30**: Spacing, sizing y accesibilidad
- **#31**: Documentación design system

## 🎯 Workflow de Trabajo

### Al Crear Nuevo Endpoint (Backend)

1. ✅ Crear DTO con validaciones `class-validator`
2. ✅ Agregar `@ApiProperty()` para Swagger
3. ✅ Extraer `userId` de `req.user.userId` (NO del body)
4. ✅ Usar try-catch con type-safe error handling
5. ✅ Agregar `@Public()` si es endpoint público
6. ✅ Documentar con `@ApiOperation()` y `@ApiResponse()`

### Al Crear Nueva Pantalla (Flutter)

1. ✅ Dividir en componentes lógicos (< 200 líneas cada uno)
2. ✅ Usar theme system consistentemente
3. ✅ Implementar estados (loading, error, empty, success)
4. ✅ Validar accesibilidad (touch targets 48x48dp, contraste)
5. ✅ Considerar responsive design
6. ✅ Documentar widgets complejos

### Al Refactorizar Código

1. 🔍 Identificar código duplicado
2. 📦 Extraer a componentes/servicios reutilizables
3. 🏷️ Mejorar nombres (descriptivos y claros)
4. 🎨 Aplicar theme system
5. 🧹 Eliminar valores hardcodeados
6. ✅ Validar que funciona igual
7. 📝 Documentar cambios

## 🚀 Optimización de Tokens

### Prioridades

1. **Leer solo archivos necesarios** - No leer migraciones antiguas, node_modules
2. **Usar glob patterns específicos** - `flutter/lib/core/widgets/**/*.dart`
3. **Batch operations** - `multi_replace_string_in_file` para múltiples edits
4. **Context sharing** - Referenciar archivos ya leídos antes de leer de nuevo

### Toolsets Configurados

**Usar toolsets específicos** para eficiencia:

- `@ppnFlutter` - Desarrollo UI Flutter
- `@ppnBackend` - APIs NestJS
- `@ppnStripe` - Integración Stripe
- `@ppnGithub` - Issues y PRs
- `@ppnDebug` - Debugging
- `@ppnDocs` - Documentación

## 🎨 Diseño Visual (Flutter)

### Principios de Diseño PPN

- **Moderno y Minimalista**: Interfaces limpias
- **Colorido y Alegre**: Colores vibrantes pero balanceados (HSL S: 60-80%)
- **Espacioso**: Breathing room generoso (16-24px base)
- **Consistente**: Mismo lenguaje visual
- **Accesible**: WCAG AA mínimo (contraste 4.5:1)

### Visual Styles

- **Aurora**: Gradientes vibrantes + glassmorphism
- **Monolight**: Colores sólidos + superficies planas

**IMPORTANTE**: Todos los componentes DEBEN funcionar con ambos estilos.

### Spacing System

```dart
AppConstants.spacingXs   // 4px
AppConstants.spacingS    // 8px
AppConstants.spacingM    // 16px
AppConstants.spacingL    // 24px
AppConstants.spacingXL   // 32px
AppConstants.spacingXxl  // 48px
```

## 🐛 Debugging Issues Comunes

### Backend

**401 Unauthorized en todos los endpoints**:

- ✅ Verificar `@Public()` en endpoints públicos
- ✅ Validar JWT_SECRET configurado
- ✅ Token no expirado

**Webhooks Stripe no funcionan**:

- ✅ Verificar `@Public()` en webhook endpoint
- ✅ Raw body middleware ANTES de `express.json()`
- ✅ STRIPE_WEBHOOK_SECRET configurado
- ✅ Usar `stripe listen` para debug local

**TypeScript errors en catch**:

- ✅ Usar: `error instanceof Error ? error.message : String(error)`
- ✅ NO acceder a `error.message` directamente

### Flutter

**Colores no actualizan con theme**:

- ✅ Usar `theme.componentColors` en lugar de hardcodear
- ✅ Verificar que widget se reconstruye al cambiar theme

**Widget tree muy profundo**:

- ✅ Extraer widgets grandes en componentes
- ✅ Usar `RepaintBoundary` para widgets complejos
- ✅ const constructors para reducir rebuilds

## 📖 Documentación Completa

Para información detallada, consultar:

- **Guía completa**: `.github/copilot-instructions.md` (1111 líneas)
- **Flutter Expert**: `.github/agents/flutter-ui-ux.md`
- **NestJS Expert**: `.github/agents/nest-backend.md`
- **Stripe Security**: `backend/SECURITY_STRIPE.md`
- **Stripe Quick Start**: `backend/STRIPE_QUICK_START.md`

## ✨ Filosofía de Trabajo

> **Código limpio, componentizado y seguro.  
> Diseño moderno, colorido y accesible.  
> Documentación clara, ejemplos prácticos.  
> Proactividad, creatividad, excelencia.**

---

**Versión**: 1.0.0  
**Última actualización**: 2025-01-13  
**Mantenedor**: @tiagofur
