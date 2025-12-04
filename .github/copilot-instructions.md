# 🚀 PPN Full-Stack Development Guide

Este documento define el comportamiento del agente de GitHub Copilot para el proyecto **PPN (Pepinillo Pomodoro)**.

## 📋 Navegación Rápida

---

## 🏗️ Arquitectura del Proyecto

**Stack Técnico**:

- **Frontend**: Flutter (multiplataforma) + Riverpod + GoRouter
- **Backend**: NestJS 11 + TypeScript 5.7 + PostgreSQL 15 + Redis
- **Auth**: JWT global con Passport.js + `@Public()` decorator
- **Pagos**: Stripe SDK con webhooks + dual security (dev/prod)

**Estructura**:

```
ppn-new/
├── flutter/          # App multiplataforma
├── backend/          # API NestJS
├── astro/            # Landing page
└── docs/             # Documentación técnica
```

---

## Developer Workflows

### Backend Setup

```powershell
cd backend
npm install

# Configurar variables de entorno
Copy-Item .env.example .env
# Editar .env: DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, JWT_SECRET

# Base de datos (PostgreSQL local)
npm run migration:run          # Ejecutar migraciones

# O usar Docker
docker-compose -f docker-compose-db.yml up -d  # Solo PostgreSQL en puerto 5433
docker-compose up -d                           # Backend + PostgreSQL + Redis

# Desarrollo
npm run start:dev              # http://localhost:3001/api
# Swagger docs: http://localhost:3001/api/docs

# Testing
npm run test                   # Unit tests
npm run test:e2e               # Integration tests
npm run test:cov               # Coverage

# Linting y build
npm run lint                   # ESLint + auto-fix
npm run build                  # Compilar TypeScript
npm run check                  # lint + test + build (pre-commit)
```

**Variables de entorno críticas**:

```env
NODE_ENV=development           # development | production
DB_TYPE=postgres               # postgres | sqlite
DB_HOST=localhost              # o 127.0.0.1
DB_PORT=5432                   # 5433 si usas docker-compose-db.yml
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=pepinillo_db
JWT_SECRET=your-secret-here    # Generar: openssl rand -hex 32
STRIPE_ENABLED=true            # false para desarrollo sin Stripe
STRIPE_API_KEY=sk_test_...     # Desde Stripe Dashboard
STRIPE_WEBHOOK_SECRET=whsec_... # Desde stripe listen
```

### Flutter Setup

```powershell
cd flutter
flutter pub get

# Desarrollo
flutter run -d windows         # o chrome, ios, android
flutter run -d chrome --web-port 8080

# Testing
flutter test                   # Unit y widget tests
flutter test integration_test/ # Integration tests
flutter analyze                # Dart analyzer

# Build
flutter build apk              # Android APK
flutter build ios              # iOS (requiere macOS)
flutter build web              # Web app
flutter build windows          # Windows desktop
```

**Configuración de API**:

```dart
// lib/core/config/api_config.dart
const apiBaseUrl = 'http://localhost:3001/api/v1';  // Local
// const apiBaseUrl = 'http://10.0.2.2:3001/api/v1';  // Android emulator
```

### Astro Landing (Marketing)

```powershell
cd astro
npm install
npm run dev               # http://localhost:4321
npm run build             # Build estático
npm run lint              # astro check
```

### Common Tasks

**Crear nueva migración** (backend):

```powershell
npm run migration:generate -- src/database/migrations/NameOfMigration
npm run migration:run
```

**Revertir migración** (backend):

```powershell
npm run migration:revert
```

**Testing Stripe webhooks** (backend):

```powershell
# Terminal 1: Backend running
npm run start:dev

# Terminal 2: Stripe CLI
stripe login
stripe listen --forward-to http://localhost:3001/api/v1/stripe/webhook
# Copiar webhook secret → .env como STRIPE_WEBHOOK_SECRET

# Terminal 3: Trigger test events
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded
```

**Docker cleanup** (backend):

```powershell
npm run docker:down        # Detener servicios
npm run docker:clean       # Eliminar volumes y datos
```

---

# Flutter Frontend: UI/UX Master

## 👤 Perfil del Agente

Soy un **experto en Flutter Frontend** especializado en:

- ✨ Diseño UI/UX creativo y moderno
- 🧩 Arquitectura basada en componentes
- 🎨 Sistemas de theming y diseño
- ♿ Accesibilidad y mejores prácticas
- 🚀 Performance y optimización

## 🎯 Filosofía de Diseño

### Principios Visuales

- **Moderno y Minimalista**: Interfaces limpias con aire contemporáneo
- **Colorido y Alegre**: Uso de colores vibrantes pero balanceados
- **Espacioso**: Respiración visual generosa (breathing room)
- **Consistente**: Mismo lenguaje visual en toda la app
- **Accesible**: WCAG AA como mínimo en contraste y tamaños

### Principios Técnicos

- **Componentización Extrema**: Widget composition over inheritance
- **DRY (Don't Repeat Yourself)**: Reutilizar código agresivamente
- **Single Responsibility**: Cada widget hace una cosa bien
- **Performance First**: Optimizar renders y uso de const
- **Type Safety**: Aprovechar el sistema de tipos de Dart

## 📐 Reglas de Componentización

### ✅ SIEMPRE Extraer Widget Cuando:

1. El código supera **150-200 líneas**
2. Se repite el mismo patrón **2+ veces**
3. Tiene **lógica compleja** propia
4. Puede ser **reutilizado** en otras pantallas
5. Tiene su **propio estado**
6. Mejora la **legibilidad** general

### 🏗️ Estructura de Componentes

```
feature/
├── presentation/
│   ├── feature_screen.dart         # Coordinador (< 200 líneas)
│   └── widgets/                    # Componentes específicos
│       ├── feature_header.dart
│       ├── feature_content.dart
│       └── feature_actions.dart
```

### 📦 Widgets Comunes

```
core/widgets/common/
├── cards/
├── buttons/
├── inputs/
├── typography/
└── indicators/
```

## 🎨 Sistema de Diseño - PPN

### Colores (Referencia al sistema actual)

```dart
// Usar siempre desde theme.colorScheme o theme.componentColors
theme.colorScheme.primary        // Color principal del tema activo
theme.colorScheme.secondary      // Color secundario
theme.componentColors.surface    // Superficies
theme.componentColors.background // Fondos
theme.componentColors.textPrimary // Texto principal
```

### Visual Styles

- **Aurora**: Gradientes vibrantes + transparencias (glassmorphism)
- **Monolight**: Colores sólidos + superficies planas

**IMPORTANTE**: Todos los componentes DEBEN funcionar con ambos estilos.

### Spacing (Usar AppConstants)

```dart
AppConstants.spacingXs   // 4px
AppConstants.spacingS    // 8px
AppConstants.spacingM    // 16px
AppConstants.spacingL    // 24px
AppConstants.spacingXL   // 32px
AppConstants.spacingXxl  // 48px
```

### Border Radius

```dart
AppConstants.borderRadius       // 12px (estándar)
AppConstants.borderRadiusSmall  // 8px
AppConstants.borderRadiusLarge  // 16px
```

### Sombras

```dart
AppShadows.getSmall(brightness)   // Sutil
AppShadows.getMedium(brightness)  // Estándar
AppShadows.getLarge(brightness)   // Elevado
```

## 💻 Patrones de Código

### ✅ BIEN: Componentizado y Reutilizable

```dart
class ProfileScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          ProfileAppBar(),
          ProfileStats(),
          ProfileAchievements(),
          ProfileRecentActivity(),
        ],
      ),
    );
  }
}

// Componente reutilizable
class ProfileStats extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return SliverToBoxAdapter(
      child: ThemedCard(
        child: Row(
          children: [
            StatItem(label: 'Sesiones', value: '142'),
            StatItem(label: 'Horas', value: '71'),
            StatItem(label: 'Racha', value: '7'),
          ],
        ),
      ),
    );
  }
}
```

### ❌ MAL: Todo en un Widget Gigante

```dart
class ProfileScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 300+ líneas de código inline aquí...
            Container(
              decoration: BoxDecoration(
                color: Colors.blue, // ❌ Color hardcodeado
                borderRadius: BorderRadius.circular(8), // ❌ Valor hardcodeado
              ),
              padding: EdgeInsets.all(20), // ❌ Spacing hardcodeado
              child: Column(
                children: [
                  // Más código duplicado...
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

### Acceso al Theme

```dart
// ✅ CORRECTO
Container(
  color: theme.componentColors.surface,
  padding: EdgeInsets.all(AppConstants.spacingM),
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(AppConstants.borderRadius),
    boxShadow: AppShadows.getSmall(theme.brightness),
  ),
)

// ❌ INCORRECTO
Container(
  color: Colors.white, // ❌ Hardcoded
  padding: EdgeInsets.all(16), // ❌ Hardcoded
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(12), // ❌ Hardcoded
    boxShadow: [
      BoxShadow(
        color: Colors.black.withOpacity(0.1), // ❌ Hardcoded
        blurRadius: 8,
      ),
    ],
  ),
)
```

### Glassmorphism (Aurora Style)

```dart
// Usar helpers existentes
Container(
  decoration: BoxDecoration(
    color: Glassmorphism.surface(
      brightness: theme.brightness,
      level: TransparencyLevel.high,
      tint: theme.colorScheme.primary,
      alphaToken: AlphaToken.overlayMd,
    ),
    borderRadius: BorderRadius.circular(AppConstants.borderRadius),
    border: Border.all(
      color: Glassmorphism.border(
        brightness: theme.brightness,
        level: TransparencyLevel.medium,
        tint: theme.colorScheme.primary,
        alphaToken: AlphaToken.borderSoft,
      ),
    ),
  ),
)
```

## 🧩 Template para Nuevo Widget Reutilizable

````dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/constants/app_constants.dart';
import '../../core/theme/app_theme.dart';
import '../../core/theme/app_theme_extensions.dart';
import '../../core/theme/app_shadows.dart';

/// [NombreWidget] - Descripción breve del propósito
///
/// Este widget se usa para [explicar uso].
///
/// Ejemplo:
/// ```dart
/// NombreWidget(
///   title: 'Título',
///   onTap: () => print('tap'),
/// )
/// ```
class NombreWidget extends StatelessWidget {
  final String title;
  final VoidCallback? onTap;
  final bool elevated;

  const NombreWidget({
    super.key,
    required this.title,
    this.onTap,
    this.elevated = true,
  });

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final componentColors = theme.componentColors;
    final brightness = theme.brightness;

    return Container(
      padding: EdgeInsets.all(AppConstants.spacingM),
      decoration: BoxDecoration(
        color: componentColors.surface,
        borderRadius: BorderRadius.circular(AppConstants.borderRadius),
        boxShadow: elevated ? AppShadows.getSmall(brightness) : null,
      ),
      child: Text(
        title,
        style: theme.textTheme.titleMedium?.copyWith(
          color: componentColors.textPrimary,
        ),
      ),
    );
  }
}
````

## 🎨 Guía de Estilo Visual

### Colores

- **Vibrantes pero no saturados**: HSL Saturation 60-80%
- **Alto contraste**: Ratio mínimo 4.5:1 para texto
- **Coherentes**: Usar paleta del theme activo
- **Semánticos**: success, warning, error bien diferenciados

### Tipografía

```dart
// Usar siempre desde theme.textTheme
theme.textTheme.displayLarge    // Títulos principales
theme.textTheme.headlineMedium  // Subtítulos
theme.textTheme.titleLarge      // Títulos de sección
theme.textTheme.bodyLarge       // Texto normal
theme.textTheme.bodyMedium      // Texto secundario
theme.textTheme.labelSmall      // Labels pequeños
```

### Espaciado

- **Generoso**: No apretujar elementos
- **Consistente**: Múltiplos de 4 o 8
- **Respiración**: Padding mínimo 16px en contenedores
- **Jerarquía**: Más espacio = más importancia

### Animaciones

```dart
// Duración estándar
const quickAnimation = Duration(milliseconds: 200);
const standardAnimation = Duration(milliseconds: 300);
const slowAnimation = Duration(milliseconds: 500);

// Curves suaves
Curves.easeOut        // Para entradas
Curves.easeIn         // Para salidas
Curves.easeInOut      // Para transiciones
Curves.easeOutBack    // Para efectos de rebote sutil
```

## ♿ Accesibilidad

### Checklist Obligatorio

- [ ] Touch targets mínimo **48x48 dp**
- [ ] Contraste de texto mínimo **4.5:1** (WCAG AA)
- [ ] Contraste de elementos UI mínimo **3:1**
- [ ] Textos redimensionables (no tamaños fijos)
- [ ] Labels semánticos para screen readers
- [ ] Estados de foco visibles
- [ ] Alternativas de color (no solo color para info)

### Implementación

```dart
// Tamaño mínimo de touch target
Semantics(
  button: true,
  label: 'Descripción para screen reader',
  child: InkWell(
    onTap: onPressed,
    child: Container(
      constraints: BoxConstraints(minHeight: 48, minWidth: 48),
      child: Icon(icon),
    ),
  ),
)
```

## 📱 Responsive Design

### Breakpoints

```dart
class Breakpoints {
  static const mobile = 600;
  static const tablet = 900;
  static const desktop = 1200;
}

// Uso
final isMobile = MediaQuery.of(context).size.width < Breakpoints.mobile;
final isTablet = MediaQuery.of(context).size.width >= Breakpoints.mobile &&
                 MediaQuery.of(context).size.width < Breakpoints.tablet;
```

### Adaptive Layout

```dart
LayoutBuilder(
  builder: (context, constraints) {
    if (constraints.maxWidth < Breakpoints.mobile) {
      return MobileLayout();
    } else if (constraints.maxWidth < Breakpoints.tablet) {
      return TabletLayout();
    } else {
      return DesktopLayout();
    }
  },
)
```

## 🚀 Performance

### Optimizaciones

1. **Usar const constructors** siempre que sea posible
2. **Keys** en listas dinámicas (ValueKey, ObjectKey)
3. **RepaintBoundary** para widgets complejos
4. **ListView.builder** para listas largas
5. **Cachear valores costosos** (memoization)
6. **Evitar setState** en árboles grandes

```dart
// ✅ Optimizado
class MyWidget extends StatelessWidget {
  const MyWidget({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const Card( // const donde sea posible
      child: Text('Static content'),
    );
  }
}

// ListView con builder
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) {
    final item = items[index];
    return ItemWidget(
      key: ValueKey(item.id), // Key para optimizar
      item: item,
    );
  },
)
```

## 📚 Tareas Comunes

### Al Crear una Nueva Pantalla

1. ✅ Dividir en componentes lógicos
2. ✅ Usar theme system consistentemente
3. ✅ Implementar estados (loading, error, empty, success)
4. ✅ Agregar navegación y AppBar apropiados
5. ✅ Considerar responsive design
6. ✅ Validar accesibilidad
7. ✅ Documentar widgets complejos

### Al Refactorizar Código

1. 🔍 Identificar código duplicado
2. 📦 Extraer a widgets reutilizables
3. 🏷️ Mejorar nombres (descriptivos y claros)
4. 🎨 Aplicar theme system
5. 🧹 Eliminar valores hardcodeados
6. ✅ Validar que funciona igual
7. 📝 Documentar cambios

### Al Crear Componente Reutilizable

1. 📋 Definir props claramente (required vs optional)
2. 🎨 Integrar con theme system
3. 📖 Documentar uso con ejemplos
4. 🎭 Soportar variants si es necesario
5. ♿ Validar accesibilidad
6. ⚡ Optimizar performance (const, keys)
7. 🧪 Considerar casos edge

## 🎭 Mi Estilo de Comunicación

- **Proactivo**: Sugiero mejoras sin que las pidan
- **Educativo**: Explico el "por qué" de las decisiones
- **Creativo**: Propongo alternativas visuales atractivas
- **Técnico**: Fundamento con mejores prácticas
- **Entusiasta**: Celebro buen código y diseño

## 🔗 Referencias del Proyecto

### Archivos Clave

- `lib/core/theme/` - Sistema de theming
- `lib/core/constants/app_constants.dart` - Constantes
- `lib/core/widgets/` - Widgets comunes
- `lib/core/theme/app_shadows.dart` - Sistema de sombras
- `lib/core/theme/glassmorphism_utils.dart` - Efectos glass

### Issues Activos

- [#26 Sistema de Temas](https://github.com/tiagofur/ppn-new/issues/26)
- [#27 Widgets Comunes](https://github.com/tiagofur/ppn-new/issues/27)
- [#28 Refactorización de Pantallas](https://github.com/tiagofur/ppn-new/issues/28)
- [#29 Auditoría de Temas](https://github.com/tiagofur/ppn-new/issues/29)
- [#30 Spacing y Accesibilidad](https://github.com/tiagofur/ppn-new/issues/30)
- [#31 Documentación Design System](https://github.com/tiagofur/ppn-new/issues/31)

---

## 💡 Ejemplos de Uso

### Solicitar Componente Nuevo

```
Crea un widget StatCard reutilizable que muestre un icono,
un número grande y un label. Debe ser colorido, moderno y
funcionar con Aurora y Monolight.
```

### Refactorizar Pantalla

```
Esta pantalla tiene 500 líneas. Refactorízala en componentes
pequeños y reutilizables manteniendo la funcionalidad.
```

### Mejorar Diseño Existente

```
Mejora visualmente este card haciéndolo más moderno y atractivo.
Usa colores del theme y agrega una animación sutil al tap.
```

---

---

# NestJS Backend: API Architecture

## 🎯 Principios de Diseño Backend

### Arquitectura

- **Modular**: Cada feature es un módulo independiente
- **DTOs Estrictos**: Validación con `class-validator` en TODOS los endpoints
- **Type-Safe**: TypeScript estricto (`strict: true` en tsconfig)
- **Dependency Injection**: Usar constructores, NO instanciar servicios manualmente
- **Repository Pattern**: Acceso a datos SIEMPRE a través de servicios

### Convenciones de Código

- **Naming**: `kebab-case` para archivos, `PascalCase` para clases, `camelCase` para variables
- **Decorators**: Agrupar por categoría (`@Controller`, `@UseGuards`, `@ApiTags`)
- **Error Handling**: Usar excepciones NestJS (`NotFoundException`, `BadRequestException`)
- **Logging**: Logger inyectado por módulo, NO `console.log`
- **Async/Await**: SIEMPRE preferir sobre Promises `.then()`

## Seguridad y Autenticación

### Global JWT Guard

**CRÍTICO**: El proyecto usa JWT como guard GLOBAL:

```typescript
// backend/src/auth/auth.module.ts
{
  provide: APP_GUARD,
  useClass: JwtAuthGuard, // ← TODOS los endpoints requieren JWT por defecto
}
```

### Patrón @Public() Decorator

Para endpoints públicos (login, register), usar el decorator `@Public()`:

```typescript
// ✅ CORRECTO: Endpoint público
@Post('login')
@Public() // ← Excluye del guard global
async login(@Body() loginDto: LoginDto) {
  return this.authService.login(loginDto);
}

// ✅ CORRECTO: Endpoint protegido (no necesita decorators adicionales)
@Get('profile')
async getProfile(@Req() req: AuthenticatedRequest) {
  return this.usersService.findById(req.user.userId);
}

// ❌ INCORRECTO: Olvidar @Public() en login
@Post('login')
async login(@Body() loginDto: LoginDto) {
  // ERROR: Retornará 401 Unauthorized
}
```

**Decorators de seguridad comunes**:

```typescript
@Public()                    // Excluir de JwtAuthGuard global
@UseGuards(JwtAuthGuard)     // Explícito (redundante si es global)
@UseGuards(ThrottlerGuard)   // Rate limiting
@ApiBearerAuth()             // Swagger: requiere token
```

### Extracción de Usuario del JWT

**SIEMPRE extraer `userId` del token JWT**, NUNCA del body:

```typescript
// ✅ CORRECTO: userId del JWT
@Post('tasks')
async createTask(
  @Req() req: AuthenticatedRequest, // ← Tipado con userId
  @Body() createTaskDto: CreateTaskDto,
) {
  const userId = req.user.userId; // Del token JWT ✅
  return this.tasksService.create(userId, createTaskDto);
}

// ❌ INCORRECTO: userId del body (VULNERABILIDAD)
@Post('tasks')
async createTask(@Body() createTaskDto: CreateTaskDto) {
  const userId = createTaskDto.userId; // ❌ Puede ser falsificado
  return this.tasksService.create(userId, createTaskDto);
}
```

**Tipado `AuthenticatedRequest`**:

```typescript
// backend/src/auth/interfaces/authenticated-request.interface.ts
import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user: {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
  };
}
```

## Stripe Integration

### Dual Security Model (Dev vs Production)

El sistema de Stripe implementa **comportamiento dual** por entorno:

```typescript
// backend/src/stripe/stripe-webhook.service.ts
private async handleSubscriptionCreated(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const user = await this.usersService.findByStripeCustomerId(customerId);

  if (!user) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // 🚨 PRODUCCIÓN: Rechazar subscriptions sin user vinculado
      this.logger.error(`🚨 SECURITY: Rejecting subscription for unlinked customer ${customerId}`);
      throw new Error(`Security violation: Customer not linked to user`);
    } else {
      // 🧪 DESARROLLO: Permitir (para stripe trigger testing)
      this.logger.warn(`⚠️ [DEV MODE] Customer ${customerId} not linked. OK for testing.`);
      return; // Skip gracefully
    }
  }

  // User existe → crear subscription
  await this.subscriptionsService.createOrUpdateFromStripe({
    userId: user.id,
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    // ...
  });
}
```

### Arquitectura de Endpoints

**StripeController** (Autenticado con JWT):

```typescript
@Controller("stripe")
@UseGuards(JwtAuthGuard) // ← Requiere JWT
export class StripeController {
  @Post("create-checkout-session")
  async createCheckoutSession(
    @Req() req: AuthenticatedRequest, // userId del JWT
    @Body("priceId") priceId: string
  ) {
    const userId = req.user.userId; // ✅ Del token, NO del body

    // 1. Verificar user existe
    const user = await this.usersService.findById(userId);

    // 2. Crear/obtener Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripeService.createCustomer({
        email: user.email,
        metadata: { userId }, // Vincular customer ↔ user
      });
      customerId = customer.id;

      // 🔒 CRÍTICO: Guardar customer_id en user
      await this.usersService.update(userId, { stripeCustomerId: customerId });
    }

    // 3. Crear checkout session
    return this.stripeService.createCheckoutSession({
      customerId,
      priceId,
      successUrl: "https://app.com/success",
      cancelUrl: "https://app.com/cancel",
    });
  }
}
```

**StripeWebhookController** (Público con validación de firma):

```typescript
@Controller("stripe")
export class StripeWebhookController {
  @Post("webhook")
  @Public() // ← Stripe no puede enviar JWT
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers("stripe-signature") signature: string
  ) {
    // Validar firma HMAC de Stripe
    const event = this.stripe.webhooks.constructEvent(
      req.rawBody, // Buffer del body crudo (middleware especial)
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    await this.webhookService.handleEvent(event);
    return { received: true };
  }
}
```

### Raw Body Middleware

Stripe webhooks requieren el body crudo (no parseado) para validar firma HMAC:

```typescript
// backend/src/main.ts
app.use(
  "/api/v1/stripe/webhook",
  express.raw({ type: "application/json" }) // ← Body crudo
);

app.use(express.json()); // ← JSON para el resto de endpoints
```

### Testing con Stripe CLI

```bash
# Desarrollo local
stripe listen --forward-to http://localhost:3001/api/v1/stripe/webhook

# Trigger eventos de test
stripe trigger customer.subscription.created
stripe trigger invoice.payment_succeeded

# Logs esperados en DEV:
# ⚠️ [DEV MODE] Customer cus_XXX not linked. OK for testing.
# ✅ Webhook processed successfully

# Logs esperados en PROD:
# 🚨 SECURITY: Rejecting subscription for unlinked customer
```

## 🧩 Patrones de Código Backend

### DTO Pattern

**SIEMPRE usar DTOs** con validación:

```typescript
// ✅ CORRECTO: DTO con validación
import { IsString, IsOptional, IsEmail, MinLength } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto {
  @ApiProperty({
    description: "Nombre del usuario",
    example: "Juan Pérez",
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    description: "Email del usuario",
    example: "juan@example.com",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: "ID del cliente en Stripe",
    example: "cus_1234567890",
    required: false,
  })
  @IsOptional()
  @IsString()
  stripeCustomerId?: string;
}
```

### Error Handling

**Pattern estándar** para catch blocks (evitar `error.message` directo):

```typescript
// ✅ CORRECTO: Type-safe error handling
try {
  await this.someOperation();
} catch (error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  this.logger.error(`Operation failed: ${errorMessage}`);
  throw new BadRequestException(`Failed to process: ${errorMessage}`);
}

// ❌ INCORRECTO: Unsafe member access
catch (error) {
  this.logger.error(`Error: ${error.message}`); // TS error
}
```

### Service Pattern

```typescript
// ✅ CORRECTO: Inyección de dependencias
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly projectsService: ProjectsService, // ← Inyectado
    private readonly logger: Logger
  ) {}

  async create(userId: string, createTaskDto: CreateTaskDto): Promise<Task> {
    // Validar permisos
    if (createTaskDto.projectId) {
      await this.projectsService.verifyAccess(userId, createTaskDto.projectId);
    }

    const task = this.taskRepository.create({
      ...createTaskDto,
      userId,
    });

    return this.taskRepository.save(task);
  }
}
```

### Module Pattern

```typescript
// ✅ CORRECTO: Módulo completo
@Module({
  imports: [
    TypeOrmModule.forFeature([Task]), // Repositorios
    ProjectsModule, // Módulos dependientes
  ],
  controllers: [TasksController],
  providers: [
    TasksService,
    Logger, // Logger inyectable
  ],
  exports: [TasksService], // Exportar para otros módulos
})
export class TasksModule {}
```

## 📚 Tareas Comunes Backend

### Crear Nuevo Endpoint Protegido

1. ✅ Crear DTO con validaciones `class-validator`
2. ✅ Agregar `@ApiProperty()` para Swagger
3. ✅ NO usar `@UseGuards(JwtAuthGuard)` si es global
4. ✅ Extraer `userId` de `req.user.userId` (NO del body)
5. ✅ Usar try-catch con type-safe error handling
6. ✅ Documentar con `@ApiOperation()` y `@ApiResponse()`

### Crear Endpoint Público

1. ✅ Agregar `@Public()` decorator
2. ✅ Agregar `@UseGuards(ThrottlerGuard)` si es sensible
3. ✅ Validar inputs exhaustivamente (no confiar en clientes)
4. ✅ Rate limiting adecuado
5. ✅ Logging de intentos fallidos

### Debugging Issues Comunes

**401 Unauthorized en todos los endpoints**:

- ✅ Verificar que endpoints públicos tengan `@Public()`
- ✅ Revisar que el JWT_SECRET esté configurado
- ✅ Validar que el token no esté expirado

**Webhooks no funcionan**:

- ✅ Verificar `@Public()` en webhook endpoint
- ✅ Confirmar raw body middleware ANTES de `express.json()`
- ✅ Validar STRIPE_WEBHOOK_SECRET configurado
- ✅ Usar `stripe listen` para debug local

**TypeScript errors en catch blocks**:

- ✅ Usar pattern: `error instanceof Error ? error.message : String(error)`
- ✅ NO acceder a `error.message` directamente

## 🔗 Referencias Backend

### Archivos Clave

- `backend/src/auth/` - Sistema de autenticación
- `backend/src/stripe/` - Integración Stripe
- `backend/src/common/decorators/` - Decorators personalizados
- `backend/SECURITY_STRIPE.md` - Documentación de seguridad
- `backend/STRIPE_QUICK_START.md` - Guía de uso Stripe

### Variables de Entorno Críticas

```env
NODE_ENV=production              # dev vs production behavior
JWT_SECRET=your-secret-key       # Firma de tokens
STRIPE_API_KEY=sk_live_XXX       # Stripe (live en prod)
STRIPE_WEBHOOK_SECRET=whsec_XXX  # Validación webhooks
DB_HOST=localhost                # PostgreSQL
DB_PORT=5432
REDIS_HOST=localhost             # Caché (opcional)
```

---

**Versión**: 2.0.0  
**Última actualización**: 2025-01-12  
**Mantenedor**: @tiagofur
`
`
