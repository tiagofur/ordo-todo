# Ordo-Todo

**The Modern AI-Powered Task Organization Platform**

[English](#english) | [Espanol](#espanol) | [Portugues](#portugues)

---

<a name="english"></a>

## What is Ordo-Todo?

Ordo-Todo is a next-generation task management application that combines simplicity, elegance, and technological power. Built with **DDD (Domain-Driven Design)** and **Clean Architecture** in a **Turborepo monorepo**.

### Key Features

| Feature | Description |
|---------|-------------|
| **Intelligent Simplicity** | Minimalist interface with powerful functionality |
| **AI Copilot** | Intelligent assistant that helps without interrupting |
| **Advanced Pomodoro Timer** | Multiple modes, task switching, continuous completion |
| **Multi-platform** | Web, Mobile (iOS/Android), and Desktop (Windows/Mac/Linux) |
| **Real-time Sync** | Seamless synchronization across all devices |
| **Analytics** | Focus Score, productivity metrics, actionable insights |
| **Team Collaboration** | Workspaces, assignments, comments, mentions |
| **Multi-language** | English, Spanish, Portuguese (Brazil) |

---

## Quick Start

### Prerequisites

- Node.js 18+
- npm 10+
- PostgreSQL 16 (or Docker)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/tiagofur/ordo-todo.git
cd ordo-todo

# 2. Install dependencies
npm install

# 3. Set up PostgreSQL (using Docker)
docker run --name ordo-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=ordo_todo \
  -p 5432:5432 \
  -d postgres:16

# 4. Configure environment
cp apps/web/.env.example apps/web/.env.local
cp apps/backend/.env.example apps/backend/.env

# 5. Push database schema
cd apps/web && npx prisma db push && npx prisma generate && cd ../..

# 6. Start development
npm run dev
```

Visit [http://localhost:3100](http://localhost:3100) (Web) and [http://localhost:3200](http://localhost:3200) (API)

---

## Project Structure

```
ordo-todo/
├── apps/
│   ├── web/              # Next.js 16 - Web application
│   ├── backend/          # NestJS - REST API
│   ├── mobile/           # React Native + Expo
│   ├── desktop/          # Electron + React
│   └── webpage/          # Astro 5 - Promotional site (3 languages)
│
├── packages/
│   ├── core/             # Domain logic (entities, use cases, validation)
│   ├── db/               # Prisma schema and client
│   ├── ui/               # 90+ shared React components
│   ├── hooks/            # 100+ React Query hooks
│   ├── stores/           # Zustand stores
│   ├── api-client/       # REST client with types
│   ├── i18n/             # Translations (EN, ES, PT-BR)
│   └── config/           # Shared configurations
│
├── docs/                 # Technical documentation
│   ├── USER_GUIDE.md     # Complete user guide
│   ├── design/           # PRD, Architecture, Wireframes
│   └── ROADMAP.md        # Development roadmap
│
└── webpage/              # Promotional website (Astro)
    └── src/pages/        # /en, /es, /pt-br
```

---

## Applications

### Web App (Next.js 16)

```bash
npm run dev --filter=@ordo-todo/web
# Visit http://localhost:3100
```

Features:
- Server Components + App Router
- TailwindCSS 4 + Radix UI
- Real-time collaboration
- Full i18n support

### Backend API (NestJS)

```bash
npm run dev --filter=@ordo-todo/backend
# API at http://localhost:3200
```

Features:
- RESTful endpoints with Swagger docs
- JWT authentication
- WebSocket notifications
- AI integration (Gemini)

### Mobile App (Expo)

```bash
cd apps/mobile
npm run start
# Scan QR with Expo Go
```

Features:
- iOS and Android support
- Native notifications
- Offline mode (coming soon)

### Desktop App (Electron)

```bash
cd apps/desktop
npm run electron:dev
```

Features:
- System tray integration
- Global shortcuts
- Native notifications
- Auto-updates

### Promotional Website (Astro 5)

```bash
cd webpage
npm run dev
# Visit http://localhost:4321
```

Features:
- Static site generation
- 3 languages (EN, ES, PT-BR)
- SEO optimized
- User guide included

---

## Documentation

### User Guide

Complete guide to master Ordo-Todo:

- **[User Guide (docs/USER_GUIDE.md)](./docs/USER_GUIDE.md)** - Full documentation
- **[Online Guide (EN)](https://ordo-todo.com/en/guide)** - Interactive web version
- **[Guia (ES)](https://ordo-todo.com/es/guide)** - Version en espanol
- **[Guia (PT-BR)](https://ordo-todo.com/pt-br/guide)** - Versao em portugues

### Technical Documentation

| Document | Description |
|----------|-------------|
| [PRD.md](./docs/design/PRD.md) | Product Requirements Document |
| [ARCHITECTURE.md](./docs/design/ARCHITECTURE.md) | DDD + Clean Architecture |
| [ROADMAP.md](./docs/ROADMAP.md) | Development roadmap |
| [COMPONENT_GUIDELINES.md](./docs/COMPONENT_GUIDELINES.md) | UI component patterns |
| [PROJECT_ORGANIZATION.md](./docs/PROJECT_ORGANIZATION.md) | File organization rules |
| [CLAUDE.md](./CLAUDE.md) | AI assistant context |

### API Reference

```bash
# Start the backend and visit
http://localhost:3200/api/docs
```

---

## Development Commands

```bash
# All apps
npm run dev              # Start all in development
npm run build            # Build all
npm run lint             # Lint all
npm run check-types      # Type check all
npm run test             # Run all tests

# Specific apps
npm run dev --filter=@ordo-todo/web
npm run dev --filter=@ordo-todo/backend
npm run dev:desktop

# Database
cd apps/web
npx prisma db push       # Push schema
npx prisma generate      # Generate client
npx prisma studio        # Open DB GUI

# Desktop builds
cd apps/desktop
npm run build:win        # Windows
npm run build:mac        # macOS
npm run build:linux      # Linux
```

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 19, TailwindCSS 4, Radix UI |
| **Mobile** | React Native, Expo SDK 52+ |
| **Desktop** | Electron, Vite, React |
| **Backend** | NestJS, PostgreSQL 16, Prisma 6 |
| **State** | Zustand, TanStack Query |
| **AI** | Google Gemini API |
| **Auth** | JWT, NextAuth.js |
| **i18n** | next-intl, i18next |
| **Build** | Turborepo, tsup |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the MIT License.

---

## Team

Built with passion by the Ordo-Todo Team

---

**Status**: In Development
**Version**: 0.2.0-beta

---

<a name="espanol"></a>

## Espanol

Ordo-Todo es una aplicacion de gestion de tareas de proxima generacion. Lee la [Guia de Usuario](./docs/USER_GUIDE.md) para comenzar.

### Caracteristicas Principales

- Gestion de tareas con IA
- Timer Pomodoro avanzado
- Multiplataforma (Web, Mobile, Desktop)
- Colaboracion en equipo
- Analytics y metricas de productividad
- Soporte multilenguaje

---

<a name="portugues"></a>

## Portugues

Ordo-Todo e um aplicativo de gerenciamento de tarefas de proxima geracao. Leia o [Guia do Usuario](./docs/USER_GUIDE.md) para comecar.

### Recursos Principais

- Gerenciamento de tarefas com IA
- Timer Pomodoro avancado
- Multiplataforma (Web, Mobile, Desktop)
- Colaboracao em equipe
- Analytics e metricas de produtividade
- Suporte multilinguagem
