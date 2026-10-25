# Ordo-Todo Claude Code Configuration

**Complete configuration for Claude Code agents working on the Ordo-Todo project.**

## 📁 Structure

```
.claude/
├── README.md                     # 📘 This file - Main guide
├── OPTIMIZATION.md              # ⚡ Project context (token efficient)
├── TOKEN-OPTIMIZATION.md        # 💰 Token optimization guide
├── PROMPTS.md                   # 🎯 Optimized prompt templates
├── CLAUDE-CONFIG.md            # ⚙️ Configuration guide
├── MCP-SERVERS.md               # 🚀 MCP servers recommendations
│
├── agents/                      # 🤖 Elite specialist agents (7)
│   ├── README.md               #    Agent system guide
│   ├── nestjs-backend.md       #    NestJS backend architect
│   ├── nextjs-frontend.md      #    Next.js/React frontend architect
│   ├── electron-specialist.md      # Desktop specialist
│   ├── postgres-specialist.md      # Database architect
│   ├── testing-specialist.md       # Test automation expert
│   ├── documentation-specialist.md # Technical writer
│   └── refactoring-specialist.md   # Code quality expert
│
└── rules/                       # 📋 Project-specific rules
    ├── rules.md                #    Main rules (architecture, quality, UI/UX)
    ├── backend.md              #    Backend-specific rules (NestJS)
    ├── frontend.md             #    Frontend-specific rules (Next.js)
    ├── mobile.md               #    Mobile-specific rules (Tauri 2)
    ├── desktop.md              #    Desktop-specific rules (Electron)
    └── packages.md             #    Shared packages rules
```

**📊 Statistics:**

- 19 configuration files
- ~10,000 lines of documentation
- 8 elite specialist agents
- 6 rule files (1 global + 5 specific)
- 13 recommended MCP servers
- Complete token optimization system

---

## 🤖 Agent System

### Available Agents (8 Specialists)

| Agent                                                              | Specialization                          | Use For                                     |
| ------------------------------------------------------------------ | --------------------------------------- | ------------------------------------------- |
| **[OpenCode Assistant](OPENCODE-PROFILE.md)**                      | Full-stack, coordination, general tasks | Primary assistant, delegates to specialists |
| **[NestJS Backend](agents/nestjs-backend.md)**                     | REST APIs, controllers, services        | Backend API development                     |
| **[Next.js Frontend](agents/nextjs-frontend.md)**                  | React components, pages, hooks          | Web UI development                          |
| **[Electron](agents/electron-specialist.md)**                      | Desktop features, IPC                   | Desktop app development                     |
| **[PostgreSQL](agents/postgres-specialist.md)**                    | Database schema, migrations             | Database design                             |
| **[Testing Specialist](agents/testing-specialist.md)**             | Unit, integration, E2E tests            | Test automation                             |
| **[Documentation Specialist](agents/documentation-specialist.md)** | API docs, README, diagrams              | Technical writing                           |
| **[Refactoring Specialist](agents/refactoring-specialist.md)**     | Code quality, SOLID                     | Refactoring legacy code                     |

### Agent Characteristics

**All agents are:**

- ✅ **Autonomous**: Complete workflow from research to documentation
- ✅ **Latest Tech**: Always search for latest versions and patterns
- ✅ **Test-First**: Comprehensive tests (unit + integration + E2E)
- ✅ **Quality Obsessed**: Don't stop until everything is perfect
- ✅ **Documented**: Generate docs, examples, and diagrams

### Agent Workflow

```
1. RESEARCH  → Search for latest versions, best practices
2. PLAN      → Design solution with modern patterns
3. IMPLEMENT → Write clean, typed, validated code
4. TEST      → Create comprehensive tests
5. VALIDATE  → Run tests, fix failures, repeat until 100% passing
6. REFACTOR  → Improve quality, performance
7. DOCUMENT  → Generate docs, write comments
8. REPEAT    → Iterate until perfect
```

### Agent Usage Examples

```bash
# Backend API development
"Use the nestjs-backend agent to create a tasks REST API with CRUD operations,
 validation, comprehensive tests, and Swagger documentation"

# Frontend component development
"Use the nextjs-frontend agent to build a task list component with
 accessibility, responsive design, Storybook docs, and Playwright tests"

# Database design
"Use the postgres-specialist agent to design a database schema for
 task management with proper indexes and relationships"

# Testing
"Use the testing-specialist agent to write comprehensive tests for
 the task feature with 100% coverage on critical paths"

# Documentation
"Use the documentation-specialist agent to document the task management
 API with OpenAPI specs, architecture diagrams, and usage examples"
```

---

## 📋 Rule System

### Main Rules ([rules/rules.md](rules/rules.md))

**Core principles:**

1. **Code Placement**: Used by 2+ apps? → Put in packages
2. **Clean Architecture**: Clear separation of concerns
3. **Testing**: 100% on critical paths, >80% overall
4. **UI/UX**: NO transparencies, NO gradients, perfect responsiveness
5. **Quality Gates**: All tests pass, zero type errors, zero warnings

**Key rules:**

- 🏗️ [Architecture Rules](rules/rules.md#architecture-rules) - Monorepo structure, code placement
- ✅ [Code Quality Rules](rules/rules.md#code-quality-rules) - TypeScript, error handling, naming
- 🧪 [Testing Rules](rules/rules.md#testing-rules) - Coverage, test types, determinism
- 🎨 [UI/UX Rules](rules/rules.md#uiux-rules) - Transparencies, gradients, responsivity
- 📦 [Shared Packages Rules](rules/packages.md) - When to use packages
- ⚡ [Performance Rules](rules/rules.md#performance-rules) - Web Vitals, optimization
- 🔒 [Security Rules](rules/rules.md#security-rules) - Validation, auth, environment
- 📚 [Documentation Rules](rules/rules.md#documentation-rules) - JSDoc, README, API docs

### Backend Rules ([rules/backend.md])

**NestJS-specific:**

- Feature-based organization
- Controller responsibilities (HTTP only)
- Service responsibilities (business logic)
- Repository pattern (PrismaService)
- Validation with class-validator
- Error handling with NestJS exceptions
- JWT authentication & authorization
- Swagger documentation required

### Frontend Rules ([rules/frontend.md])

**Next.js-specific:**

- Use App Router (not Pages Router)
- Server Components by default
- Server Actions for mutations
- Platform-agnostic components from packages/ui
- React Query for server state
- Zustand for client state
- Perfect responsiveness (mobile, tablet, desktop)
- Dark mode support required
- WCAG AA accessibility

### Packages Rules ([rules/packages.md])

**Shared packages:**

- **packages/ui**: Platform-agnostic components
- **packages/hooks**: React Query hook factories
- **packages/stores**: Zustand stores
- **packages/core**: Pure domain logic
- **packages/db**: Prisma schema & migrations
- **packages/api-client**: REST API client
- **packages/i18n**: Translations (3 languages)

---

## 🎯 Quality Gates

### Mandatory Checks

**All agents MUST ensure these pass before completing tasks:**

```bash
npm run lint           # ✅ Zero errors, zero warnings
npm run check-types    # ✅ Zero type errors
npm run test           # ✅ 100% tests pass
npm run build          # ✅ Zero build errors
```

### Coverage Requirements

- **Statements**: >80%
- **Branches**: >75%
- **Functions**: >80%
- **Lines**: >80%
- **Critical Paths** (auth, payments): 100%

### Performance Targets

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1
- **Lighthouse Score**: >90

---

## 🚫 Forbidden Patterns

### NEVER Do:

1. ❌ Skip tests ("I'll add them later")
2. ❌ Use `any` type ("It's too complicated")
3. ❌ Hardcode values ("Just this once")
4. ❌ Copy-paste code ("It's similar but not the same")
5. ❌ Ignore warnings ("It's just a warning")
6. ❌ Push failing tests ("I'll fix it later")
7. ❌ Skip documentation ("The code is self-explanatory")
8. ❌ Use transparencies ("It looks cool")
9. ❌ Use gradients ("It makes it pop")
10. ❌ Ignore mobile ("Nobody uses mobile")

### ALWAYS Do:

1. ✅ Write tests first (TDD when possible)
2. ✅ Type everything (no implicit any)
3. ✅ Extract shared logic (to packages)
4. ✅ Fix all warnings (zero tolerance)
5. ✅ Run all tests before committing
6. ✅ Document code (JSDoc, README, examples)
7. ✅ Use solid colors (no transparencies)
8. ✅ Test on mobile (320px - 640px)
9. ✅ Check accessibility (keyboard, screen reader)
10. ✅ Validate performance (Lighthouse, Web Vitals)

---

## 📊 Project Structure

```
ordo-todo/
├── apps/
│   ├── backend/      # NestJS REST API (@ordo-todo/backend)
│   ├── web/          # Next.js 15 web app (@ordo-todo/web)
│   ├── mobile/       # Tauri 2 + React (@ordo-todo/mobile)
│   └── desktop/      # Tauri 2 + Vite (@ordo-todo/desktop)
│
└── packages/
    ├── core/         # Domain logic, entities, use cases
    ├── db/           # Prisma schema & migrations
    ├── ui/           # Shared React components
    ├── hooks/        # React Query hooks factory
    ├── stores/       # Zustand stores
    ├── api-client/   # REST API client
    ├── i18n/         # Translations (3 languages)
    └── styles/       # Shared Tailwind config
```

---

## 🎓 Quick Reference

### When to Use Each Agent

| Task                  | Agent              | Command                                     |
| --------------------- | ------------------ | ------------------------------------------- |
| Create REST API       | NestJS Backend     | `Use the nestjs-backend agent...`           |
| Build React component | Next.js Frontend   | `Use the nextjs-frontend agent...`          |
| Design database table | PostgreSQL         | `Use the postgres-specialist agent...`      |
| Write tests           | Testing Specialist | `Use the testing-specialist agent...`       |
| Write documentation   | Documentation      | `Use the documentation-specialist agent...` |
| Refactor code         | Refactoring        | `Use the refactoring-specialist agent...`   |
| Add desktop feature   | Electron           | `Use the electron-specialist agent...`      |

### Code Placement Decision Tree

```
Is this feature-specific?
├─ YES → Place in the app (apps/backend, apps/web, etc.)
└─ NO → Is it used by 2+ apps?
    ├─ YES → Place in packages/
    │   ├─ Business logic? → packages/core
    │   ├─ UI component? → packages/ui
    │   ├─ Data fetching? → packages/hooks
    │   ├─ State management? → packages/stores
    │   ├─ API calls? → packages/api-client
    │   └─ Translations? → packages/i18n
    └─ NO → Keep local
```

### Import Rules

```typescript
// ✅ CORRECT: Use workspace protocol for packages
import { Button } from "@ordo-todo/ui";
import { useTasks } from "@ordo-todo/hooks";
import { Task } from "@ordo-todo/core";

// ❌ WRONG: Relative imports for packages
import { Button } from "../../../ui/src/components/button";

// ✅ CORRECT: Relative imports within same app
import { LocalComponent } from "./local-component";
```

---

## 🚀 Getting Started

### For New Features

1. **Choose the right agent** based on your task
2. **Provide clear requirements** with context
3. **Let the agent work** through the full autonomous cycle
4. **Review and validate** the results
5. **Provide feedback** for improvement

### For Bug Fixes

1. **Use the appropriate specialist agent** for the code area
2. **Describe the bug** with reproduction steps
3. **Let the agent** investigate, fix, and test
4. **Verify the fix** works and tests pass

### For Refactoring

1. **Use the refactoring-specialist agent**
2. **Describe the code quality issues**
3. **Let the agent** apply SOLID principles and patterns
4. **Verify tests still pass**

---

## 📈 Metrics

Agents track and report:

- Code coverage percentage
- Test pass rate
- Performance metrics
- Bundle size
- Type safety percentage
- Documentation completeness
- Security vulnerability count

---

## 🎯 Success Criteria

**A task is complete only when:**

- ✅ All tests pass (100% success rate)
- ✅ Zero type errors
- ✅ Zero linting warnings
- ✅ Coverage meets thresholds (>80%)
- ✅ All apps build successfully
- ✅ All code documented
- ✅ Perfect responsiveness (mobile, tablet, desktop)
- ✅ Accessibility: WCAG AA compliant
- ✅ Performance: Lighthouse >90
- ✅ No transparencies or gradients

---

## 📞 Support

- **Agent Issues**: Check agent's documentation file
- **Rule Clarifications**: See [rules.md](rules.md)
- **Project Context**: See [CLAUDE.md](../CLAUDE.md)
- **Agent System**: See [agents/README.md](agents/README.md)

---

## 🔗 Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Main project documentation
- [agents/README.md](agents/README.md) - Agent system guide
- [rules/rules.md](rules/rules.md) - Main project rules
- [rules/backend.md](rules/backend.md) - Backend rules
- [rules/frontend.md](rules/frontend.md) - Frontend rules
- [rules/mobile.md](rules/mobile.md) - Mobile rules
- [rules/desktop.md](rules/desktop.md) - Desktop rules
- [rules/packages.md](rules/packages.md) - Packages rules

---

**Built with ❤️ for Ordo-Todo**

_This configuration ensures elite agents build production-grade software with exceptional quality, comprehensive testing, and perfect documentation._
