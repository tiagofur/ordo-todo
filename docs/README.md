# Ordo-Todo Documentation

> **Last updated:** March 2026

Welcome to the documentation for **Ordo-Todo**, a modern cross-platform task management platform built with **DDD** and **Clean Architecture**.

---

## Documentation Structure

```
docs/
├── README.md                        # This file (main index)
│
├── design/                          # Product & Design
│   ├── PRD.md                       # Product Requirements Document (v2.0)
│   ├── DESIGN_SYSTEM.md             # Design tokens, colors, typography, components
│   ├── DESIGN_GUIDELINES.md         # Quick visual rules (no gradients, no transparencies)
│   ├── ARCHITECTURE.md              # DDD + Clean Architecture patterns
│   ├── TECHNICAL_DESIGN.md          # Technical specifications
│   └── WIREFRAMES.md               # UI/UX wireframe specs
│
├── getting-started/                 # Getting Started
│   ├── QUICKSTART.md                # 5-minute setup
│   ├── SETUP_AND_TESTING.md         # Full installation guide
│   └── internationalization.md      # i18n guide
│
├── web/                             # Web App (Next.js 16)
│   ├── README.md                    # Setup, structure, features
│   ├── AUDITORIA-COMPLETA.md        # Complete web audit
│   ├── ROADMAP.md                   # Web-specific roadmap
│   ├── BEST-PRACTICES.md            # Best practices
│   ├── PERFORMANCE-GUIDE.md         # Performance optimization
│   ├── DEVELOPER-TOOLS.md           # Dev tools guide
│   ├── MAINTENANCE.md               # Maintenance guide
│   ├── MIGRATION-GUIDE.md           # Migration procedures
│   └── TROUBLESHOOTING.md           # Problem solving
│
├── backend/                         # API (NestJS 11)
│   ├── README.md                    # Endpoints reference
│   ├── ARCHITECTURE.md              # Backend architecture
│   ├── AUDITORIA-COMPLETA.md        # Complete backend audit
│   ├── AUDITORIA-RESUMEN-FINAL.md   # Executive summary
│   ├── SECURITY.md                  # Backend security
│   ├── PERFORMANCE.md               # Query optimization
│   ├── DATABASE_INDEXES.md          # Index strategy
│   ├── N1_OPTIMIZATION.md           # N+1 query fixes
│   ├── REDIS_SETUP.md               # Redis configuration
│   ├── DEPLOYMENT.md                # Deployment procedures
│   ├── MIGRATION_GUIDE.md           # Database migrations
│   ├── IMPROVEMENTS.md              # Planned improvements
│   ├── ROADMAP-MEJORAS-2025.md      # Improvement roadmap
│   ├── SPRINT-4-5-COMPLETE.md       # Sprint history
│   ├── GUIA-ARREGLO-RAPIDO.md       # Quick fixes
│   ├── INDEX.md                     # Docs index
│   └── ai-features.md              # AI system docs
│
├── mobile/                          # Mobile App (React Native)
│   ├── README.md                    # Setup, roadmap, status
│   ├── PENDING_TASKS.md             # Pending work
│   └── WEB_VS_MOBILE_GAP_ANALYSIS.md # Feature parity
│
├── desktop/                         # Desktop App (Electron)
│   ├── README.md                    # Features, build guide
│   ├── analysis-report.md           # Parity analysis
│   ├── developer-needs-assessment.md # Dev requirements
│   └── REFACTORING_PLAN.md          # Refactoring roadmap
│
├── packages/                        # Shared Packages
│   ├── README.md                    # Package overview
│   ├── AUDIT-2026-Q1.md             # Latest audit
│   ├── METRICAS-POR-PAQUETE.md      # Per-package metrics
│   ├── INICIO-RAPIDO.md             # Quick start
│   ├── PLATFORM-AGNOSTIC-PATTERN.md # Component patterns
│   ├── ROADMAP.md                   # Package roadmap
│   └── VIOLACIONES-POR-PAQUETE/     # Per-package issues
│
├── mejoras-competencia/             # Competitive Features
│   ├── COMPETITIVE-ANALYSIS.md      # Market analysis
│   ├── 01-HABIT-TRACKER.md          # Habits system
│   ├── 02-SMART-DATES.md            # Date system
│   ├── 03-OKRS-GOALS.md             # OKR system
│   ├── 04-TIME-BLOCKING.md          # Time blocking
│   ├── 05-CUSTOM-FIELDS.md          # Custom fields
│   └── 06-AI-FEATURES.md            # AI features
│
├── deployment/                      # Deployment
│   ├── DEPLOYMENT-STATUS.md         # Current status
│   └── QUICK-COMMANDS.md            # Deploy commands
│
├── ROADMAP.md                       # Development roadmap
├── COMPONENT_GUIDELINES.md          # MANDATORY component patterns
├── PROJECT_ORGANIZATION.md          # File organization rules
├── SHARED-CODE-ARCHITECTURE.md      # Shared package architecture
├── PRICING-STRATEGY.md              # Pricing tiers
├── USER_GUIDE.md                    # End-user guide
├── CI_CD_STATUS.md                  # CI/CD pipeline
├── DEPLOYMENT_RUNBOOKS.md           # Deployment procedures
├── DEPENDENCY_MANAGEMENT.md         # Dependency strategy
├── SECURITY_REPORT.md               # Security audit
├── MOBILE_GAP_ANALYSIS.md           # Web vs Mobile parity
└── OAUTH-DESKTOP-IMPLEMENTATION.md  # Desktop OAuth flow
```

---

## Quick Start

### New to the project

1. **[QUICKSTART.md](./getting-started/QUICKSTART.md)** - Get running in 5 minutes
2. **[PRD.md](./design/PRD.md)** - Understand the product (v2.0, March 2026)
3. **[DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)** - Visual design reference

### Understand the architecture

1. **[ARCHITECTURE.md](./design/ARCHITECTURE.md)** - DDD decisions
2. **[SHARED-CODE-ARCHITECTURE.md](./SHARED-CODE-ARCHITECTURE.md)** - Package structure

### Work on a specific app

| App | Docs | Status |
|-----|------|--------|
| Web | [web/README.md](./web/README.md) | Production |
| Backend | [backend/README.md](./backend/README.md) | Stable (34 modules, 200+ endpoints) |
| Desktop | [desktop/README.md](./desktop/README.md) | Functional |
| Mobile | [mobile/README.md](./mobile/README.md) | In Progress |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Monorepo | Turborepo | Latest |
| Web | Next.js, React, Tailwind CSS | 16.1, 19.2, 4.1 |
| Mobile | React Native, Expo | SDK 52+ |
| Desktop | Electron, Vite, React | Latest |
| Backend | NestJS REST API | 11.1 |
| Database | PostgreSQL + Prisma | 16 / 7.x |
| AI | Google Gemini | Latest |
| Language | TypeScript | 5.9.3 |

---

## Project Status

| Component | Status | Health |
|-----------|--------|--------|
| Backend | Stable | 34 modules, 200+ endpoints, 0 TS errors |
| Web | Production | PWA, i18n (3 langs), offline support |
| Desktop | Functional | Auth, core features working |
| Mobile | In Progress | ~60% feature parity |
| Packages | Stable | 11 packages, 88 UI components |
| AI | Implemented | Chat, parsing, reports, wellbeing |
| Tests | 83% | 526/633 passing |
| Security | Clean | 0 npm vulnerabilities |

---

## Key Documents

| Document | Purpose |
|----------|---------|
| [PRD.md](./design/PRD.md) | What we're building and why |
| [DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) | How it looks (colors, tokens, components) |
| [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) | How to create components (MANDATORY) |
| [ROADMAP.md](./ROADMAP.md) | What's next |
| [COMPETITIVE-ANALYSIS.md](./mejoras-competencia/COMPETITIVE-ANALYSIS.md) | Market positioning |

---

**Questions?** Check [troubleshooting/](./troubleshooting/) or open an issue on GitHub.
