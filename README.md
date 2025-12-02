# Ordo-Todo

**The Modern Task Organization Platform**

Ordo-Todo es una aplicación de gestión de tareas de próxima generación que combina simplicidad, elegancia y poder tecnológico. Construida con una arquitectura de **DDD (Domain-Driven Design)** y **Clean Architecture** en un **monorepo con Turborepo**.

---

## 🚀 Features

- **✨ Simplicidad Inteligente**: Interfaz minimalista con funcionalidad potente
- **🤖 IA como Copiloto**: Asistente inteligente que ayuda sin interrumpir
- **🍅 Pomodoro Timer Avanzado**: 
  - Modos Pomodoro y Tiempo Corrido
  - **Cambio de Tarea en Vuelo**: Cambia de tarea sin detener el reloj
  - **Completado Continuo**: Marca tareas como listas y sigue trabajando en el mismo bloque de tiempo
  - Tracking detallado de sesiones y pausas
- **📱 Multiplataforma**: Web, Mobile (iOS/Android) y Desktop
- **🔄 Sync en Tiempo Real**: Sincronización entre dispositivos
- **🌙 Modo Oscuro**: Tema claro y oscuro

---

## 🏗️ Architecture

Este proyecto usa **DDD + Clean Architecture** en un monorepo con Turborepo:

```
ordo-todo/
├── apps/
│   ├── web/           # Next.js 16
│   ├── mobile/        # React Native + Expo
│   ├── backend/       # NestJS (Main API)
│   └── db/            # Shared database
│
├── packages/
│   ├── core/          # 🎯 DDD Domain (Entities, Use Cases, Value Objects)
│   ├── eslint-config/ # Shared ESLint
│   └── typescript-config/ # Shared TSConfig
│
└── docs/              # Documentation
    ├── PRD.md
    ├── TECHNICAL_DESIGN.md
    ├── WIREFRAMES.md
    └── ARCHITECTURE.md
```

### Key Principles

- **Domain-Driven Design**: Rich entities, value objects, use cases
- **Clean Architecture**: Dependency inversion, infrastructure agnostic core
- **Type-Safety**: End-to-end TypeScript
- **Testability**: Core is 100% unit testable without infrastructure

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 16** - App Router, Server Components
- **React 19** - Latest features
- **TailwindCSS 4** - Utility-first styling
- **Radix UI** - Accessible headless components
- **Zustand** - Client state management
- **TanStack Query** - Server state management
- **Axios** - API Client

### Mobile
- **React Native** - Cross-platform
- **Expo SDK 52+** - Development platform
- **Expo Router** - File-based navigation

### Backend
- **PostgreSQL 16** - Primary database
- **Prisma 6** - Type-safe ORM
- **NextAuth.js** - Authentication
- **Redis (Upstash)** - Caching & sessions

### Core
- **TypeScript 5.9+** - Strict mode
- **Jest** - Unit testing
- **tsup** - Build tool

---

## 📦 Getting Started

### Prerequisites

- **Node.js 18+**
- **npm 10+**
- **PostgreSQL 16** (local or cloud)

### Installation

1. **Clone and install dependencies**

```bash
git clone https://github.com/tiagofur/ordo-todo.git
cd ordo-todo
npm install
```

2. **Configure environment variables**

```bash
# Copy example files
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env
```

3. **Setup PostgreSQL**

**Option A: Docker (Recommended)**
```bash
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d postgres:16
```

**Option B: Cloud (Supabase/Neon)**
- Create a free project at [supabase.com](https://supabase.com) or [neon.tech](https://neon.tech)
- Copy the connection string to your `.env.local`

4. **Push database schema**

```bash
cd apps/web
npx prisma db push
npx prisma generate
```

5. **Run development server**

```bash
# From root directory
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🧪 Development Commands

```bash
# Run all apps in development
npm run dev

# Run specific app
npm run dev --filter=@ordo-todo/web
npm run dev --filter=@ordo-todo/mobile

# Build all packages
npm run build

# Run tests
npm run test --filter=@ordo-todo/core

# Lint all code
npm run lint

# Type check
npm run check-types

# Database commands (from apps/web)
cd apps/web
npx prisma db push      # Push schema
npx prisma generate     # Generate client
npx prisma studio       # Open DB GUI
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | DDD + Clean Architecture details |
| [PRD.md](./PRD.md) | Product requirements |
| [TECHNICAL_DESIGN.md](./TECHNICAL_DESIGN.md) | Technical specifications |
| [WIREFRAMES.md](./WIREFRAMES.md) | UI/UX designs |
| [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) | Current progress |
| [QUICKSTART.md](./QUICKSTART.md) | Quick start guide |
| [internationalization.md](./docs/getting-started/internationalization.md) | i18n implementation guide |

---

## 🌍 Internationalization (i18n)

Ordo-Todo is fully internationalized and supports multiple languages:

### Supported Languages
- 🇺🇸 **English (en)** - Default language
- 🇪🇸 **Spanish (es)** - Español
- 🇧🇷 **Portuguese (pt-BR)** - Português (Brasil)

### Implementation
The application uses `next-intl` for internationalization with:
- **Namespace-based organization**: Each component has its own translation namespace
- **Type-safe translations**: Full TypeScript support
- **Server and client components**: Works with both Next.js rendering modes
- **Dynamic content support**: Handles pluralization, date formatting, and variables

### Quick Example
```typescript
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('MyComponent');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### Translation Files
All translations are stored in `apps/web/messages/`:
```
messages/
├── en.json     # English translations
├── es.json     # Spanish translations
└── pt-br.json  # Portuguese (Brazil) translations
```

For detailed implementation guide, best practices, and how to add new languages, see:
📖 [Internationalization Guide](./docs/getting-started/internationalization.md)

---

## 📁 Project Structure

### apps/web (Next.js)
```
src/
├── app/              # Pages & API routes
│   ├── (auth)/       # Auth pages group
│   ├── (dashboard)/  # Dashboard pages
│   └── api/          # NextAuth
├── components/       # React components
├── hooks/            # Custom hooks
├── stores/           # Zustand stores
├── lib/              # Utilities & API Client
```

### packages/core (DDD)
```
src/
├── shared/           # Base classes
│   ├── entity.ts
│   ├── value-object.ts
│   └── use-case.ts
├── users/            # User domain
├── workspaces/       # Workspace domain
├── projects/         # Project domain
├── tasks/            # Task domain (main aggregate)
├── timer/            # Pomodoro domain
└── analytics/        # Analytics domain
```

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

Built with ❤️ by the Ordo-Todo Team

---

**Current Status**: 🟡 In Development  
**Version**: 0.1.0-alpha
