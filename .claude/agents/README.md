# Ordo-Todo Agent System

## 🚀 Overview

This directory contains **elite, autonomous specialist agents** designed to build production-grade software with exceptional quality. Each agent is highly specialized, follows latest best practices, and operates with full autonomy: research → implement → test → document → iterate until perfect.

## 🎯 Core Philosophy

### Autonomous Development Cycle

Every agent follows this **non-negotiable workflow**:

```
1. RESEARCH  → Search for latest versions, best practices, breaking changes
2. PLAN      → Design solution with modern patterns
3. IMPLEMENT → Write clean, typed, validated code
4. TEST      → Create comprehensive tests (unit, integration, E2E)
5. VALIDATE  → Run tests, fix failures, repeat until 100% passing
6. REFACTOR  → Improve quality, performance, maintainability
7. DOCUMENT  → Generate docs, write comments, create examples
8. REPEAT    → Iterate until everything is perfect
```

### Quality Gates (Must Pass)

Agents don't consider tasks complete until:
- ✅ All tests pass (100% success rate, zero flakiness)
- ✅ Type checking passes (zero errors)
- ✅ Linting passes (zero warnings)
- ✅ Coverage meets thresholds (>80% critical paths)
- ✅ Documentation is complete
- ✅ Performance is optimized
- ✅ Security is validated

## 🤖 Specialist Agents

### 1. **NestJS Backend Architect** ([nestjs-backend.md](./nestjs-backend.md))
**Elite NestJS backend specialist for enterprise APIs**

- **Expertise**: NestJS 11+, REST APIs, GraphQL, microservices
- **Stack**: TypeScript, Prisma, JWT, Passport, Swagger, Jest
- **Responsibilities**:
  - Build complete CRUD operations with validation
  - Implement authentication & authorization (RBAC)
  - Create comprehensive tests (unit + integration + E2E)
  - Generate OpenAPI/Swagger documentation
  - Optimize performance and security
- **Use when**: Creating backend APIs, services, controllers, repositories
- **Autonomy**: Writes code → tests → docs → validates → repeats

### 2. **Next.js Frontend Architect** ([nextjs-frontend.md](./nextjs-frontend.md))
**Elite Next.js/React specialist for modern web apps**

- **Expertise**: Next.js 15+, React 19, App Router, Server Components
- **Stack**: TypeScript, TailwindCSS, shadcn/ui, React Query, Zustand
- **Responsibilities**:
  - Build performant, accessible components
  - Implement Server/Client Components correctly
  - Create comprehensive tests (unit + E2E with Playwright)
  - Generate Storybook documentation
  - Optimize Core Web Vitals (LCP < 2.5s, FID < 100ms)
- **Use when**: Building UI components, pages, features, hooks
- **Autonomy**: Writes code → tests → stories → validates accessibility → repeats

### 3. **React Native Specialist** ([react-native-specialist.md](./react-native-specialist.md))
**Elite mobile specialist for cross-platform apps**

- **Expertise**: React Native, Expo, iOS/Android native modules
- **Stack**: TypeScript, Expo Router, Reanimated, FlashList
- **Responsibilities**:
  - Build smooth 60fps mobile UIs
  - Handle platform-specific code (iOS/Android)
  - Optimize list performance (FlashList)
  - Implement proper navigation patterns
- **Use when**: Building mobile features, screens, native modules
- **Maintains**: Performance first, platform awareness

### 4. **Electron Specialist** ([electron-specialist.md](./electron-specialist.md))
**Elite desktop specialist for cross-platform apps**

- **Expertise**: Electron, IPC communication, native OS integration
- **Stack**: TypeScript, Electron Builder, Vite
- **Responsibilities**:
  - Build secure desktop apps (Context Isolation)
  - Implement Main/Renderer process separation
  - Create type-safe IPC communication
  - Handle native OS features
- **Use when**: Building desktop features, IPC handlers, native integration
- **Maintains**: Security first, proper process model

### 5. **PostgreSQL Specialist** ([postgres-specialist.md](./postgres-specialist.md))
**Elite database architect for PostgreSQL/Prisma**

- **Expertise**: PostgreSQL 16, Prisma 6, schema design, optimization
- **Stack**: PostgreSQL, Prisma ORM, database indexing
- **Responsibilities**:
  - Design normalized schemas (3NF)
  - Create proper indexes for query patterns
  - Handle migrations safely
  - Optimize query performance
- **Use when**: Designing tables, relationships, indexes, migrations
- **Maintains**: Data integrity, performance, scalability

### 6. **Testing Specialist** ([testing-specialist.md](./testing-specialist.md))
**Elite test automation specialist with full autonomy**

- **Expertise**: Vitest, Jest, Playwright, Testing Library
- **Stack**: TypeScript, Mock libraries, test utilities
- **Responsibilities**:
  - Write unit, integration, E2E tests
  - Ensure 100% coverage on critical paths
  - Eliminate test flakiness
  - Create visual regression tests
  - Performance testing
- **Use when**: Writing tests, improving coverage, fixing flaky tests
- **Autonomy**: Writes tests → runs → fixes → validates → repeats until 100% passing

### 7. **Documentation Specialist** ([documentation-specialist.md](./documentation-specialist.md))
**Elite technical writer for comprehensive documentation**

- **Expertise**: README, API docs, architecture diagrams, guides
- **Stack**: Docusaurus, Mintlify, TypeDoc, Storybook, Mermaid
- **Responsibilities**:
  - Write clear, accurate documentation
  - Create architecture diagrams (Mermaid)
  - Generate API references
  - Create migration guides
  - Document code with JSDoc
- **Use when**: Documenting features, APIs, architecture, code
- **Autonomy**: Analyzes → plans → writes → validates → refines

### 8. **Refactoring Specialist** ([refactoring-specialist.md](./refactoring-specialist.md))
**Elite code quality specialist for clean code**

- **Expertise**: SOLID principles, design patterns, code smells
- **Stack**: All TypeScript/JavaScript codebases
- **Responsibilities**:
  - Identify and eliminate code smells
  - Apply SOLID principles
  - Improve code organization
  - Reduce technical debt
  - Enhance maintainability
- **Use when**: Refactoring legacy code, improving architecture
- **Maintains**: Clean code, DRY, SOLID principles

## 📋 Usage Guide

### When to Use Each Agent

| Task | Agent | Command |
|------|-------|---------|
| Create REST API endpoint | NestJS Backend | `Use the nestjs-backend agent` |
| Build React component | Next.js Frontend | `Use the nextjs-frontend agent` |
| Create mobile screen | React Native | `Use the react-native-specialist agent` |
| Design database table | PostgreSQL | `Use the postgres-specialist agent` |
| Write tests | Testing Specialist | `Use the testing-specialist agent` |
| Write documentation | Documentation Specialist | `Use the documentation-specialist agent` |
| Refactor messy code | Refactoring Specialist | `Use the refactoring-specialist agent` |
| Add desktop feature | Electron Specialist | `Use the electron-specialist agent` |

### Agent Coordination

For complex features involving multiple layers:

```bash
# Example: Full-stack feature with database + API + frontend + tests + docs

1. Use postgres-specialist agent
   "Design the database schema for task management with users, projects, and tasks"

2. Use nestjs-backend agent
   "Create the REST API for task management with CRUD operations, validation, and tests"

3. Use nextjs-frontend agent
   "Build the UI components for task management with accessibility, responsive design, and tests"

4. Use testing-specialist agent
   "Write comprehensive E2E tests for the complete task management flow"

5. Use documentation-specialist agent
   "Document the task management feature with API docs, architecture diagrams, and user guide"
```

## 🎨 Agent Characteristics

### What Makes These Agents Special

1. **Latest Tech Stack**: Always searches for latest versions and patterns
2. **Full Autonomy**: Complete workflow from research to deployment
3. **Quality Obsessed**: Doesn't stop until everything is perfect
4. **Test-First**: Comprehensive testing is non-negotiable
5. **Documentation**: Every feature is fully documented
6. **Security**: Security best practices are enforced
7. **Performance**: Optimization is built-in, not added later
8. **Accessibility**: WCAG AA compliance is mandatory

### Search Behavior

Agents automatically search for:
- Latest package versions (NestJS, Next.js, React, etc.)
- Breaking changes and migration guides
- Best practices and patterns
- Security vulnerabilities
- Performance optimization techniques

### Testing Standards

- **Unit Tests**: 70% of tests, fast, isolated
- **Integration Tests**: 20% of tests, realistic
- **E2E Tests**: 10% of tests, critical paths only
- **Coverage**: >80% on critical paths, 100% on auth/payments
- **Flakiness**: Zero tolerance for flaky tests

### Documentation Standards

- **README**: Every project has comprehensive README
- **API Docs**: OpenAPI/Swagger for all APIs
- **Component Docs**: Storybook for all UI components
- **Code Comments**: JSDoc on all exports and complex logic
- **Architecture Diagrams**: Mermaid diagrams for complex systems
- **Migration Guides**: For breaking changes

## 🛠️ Technical Standards

### Code Quality

- **TypeScript**: Strict mode enabled, no `any` types
- **Linting**: ESLint with zero warnings
- **Formatting**: Prettier with consistent config
- **Git Hooks**: Pre-commit hooks for quality checks
- **CI/CD**: Automated quality gates

### Architecture

- **Clean Architecture**: Clear separation of concerns
- **SOLID Principles**: Applied consistently
- **DRY**: No code duplication
- **KISS**: Simple solutions over complex ones
- **YAGNI**: Only build what's needed

### Security

- **Input Validation**: All user input is validated
- **Authentication**: JWT with proper expiration
- **Authorization**: Role-based access control (RBAC)
- **SQL Injection**: Prevented with parameterized queries
- **XSS**: Proper sanitization and CSP headers
- **CORS**: Configured correctly

### Performance

- **Frontend**:
  - LCP < 2.5s (Largest Contentful Paint)
  - FID < 100ms (First Input Delay)
  - CLS < 0.1 (Cumulative Layout Shift)
  - Bundle size monitored and optimized

- **Backend**:
  - API response time < 200ms (p95)
  - Database queries optimized with indexes
  - Caching strategy (Redis)
  - Rate limiting on public endpoints

## 📊 Agent Matrix

| Agent | Platform | Testing | Documentation | Autonomy | Status |
|-------|----------|---------|---------------|----------|--------|
| NestJS Backend | Node.js | ✅ Comprehensive | ✅ Swagger + JSDoc | ⭐⭐⭐⭐⭐ | ✅ Active |
| Next.js Frontend | Web | ✅ Unit + E2E | ✅ Storybook + JSDoc | ⭐⭐⭐⭐⭐ | ✅ Active |
| React Native | iOS/Android | ✅ Component | ⚠️ Basic | ⭐⭐⭐⭐ | ✅ Active |
| Electron | Desktop | ⚠️ Basic | ⚠️ Basic | ⭐⭐⭐⭐ | ✅ Active |
| PostgreSQL | Database | ⚠️ Migration tests | ✅ Schema docs | ⭐⭐⭐⭐ | ✅ Active |
| Testing Specialist | All | ⭐⭐⭐⭐⭐ | ⚠️ Test patterns | ⭐⭐⭐⭐⭐ | ✅ Active |
| Documentation | All | N/A | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ✅ Active |
| Refactoring | All | ✅ Regression | ✅ Changelog | ⭐⭐⭐⭐ | ✅ Active |

## 🔄 Continuous Improvement

### Agent Updates

Agents are continuously updated with:
- Latest framework versions
- New best practices
- Security patches
- Performance optimizations
- Community feedback

### Feedback Loop

When agents complete tasks:
1. Validate results against quality gates
2. Run test suites and verify coverage
3. Check documentation completeness
4. Test in real environment
5. Gather feedback and improve

## 🎓 Best Practices

### Working with Agents

1. **Be Specific**: Provide clear requirements and context
2. **Trust the Process**: Agents follow proven workflows
3. **Review Results**: Always review generated code
4. **Ask Questions**: Agents prefer clarifying over assuming
5. **Provide Feedback**: Help agents learn and improve

### Example Interactions

```bash
# Good: Specific and well-scoped
"Use the nestjs-backend agent to create a tasks API endpoint with CRUD operations,
validation using class-validator, error handling, comprehensive tests,
and Swagger documentation"

# Bad: Vague and unclear
"Create a task feature"

# Good: Follows agent coordination
"1. Use postgres-specialist to design the database schema
2. Use nestjs-backend to create the API
3. Use nextjs-frontend to build the UI
4. Use testing-specialist to write E2E tests
5. Use documentation-specialist to document everything"
```

## 🔧 Configuration

### Agent Model Settings

- **Model**: Opus (most capable)
- **Temperature**: 0.7 (creative but precise)
- **Max Tokens**: As needed
- **Tools**: Full access (Bash, Read, Write, Edit, Search)

### Agent Capabilities

- File system operations (Read, Write, Edit)
- Command execution (Bash)
- Web search (latest documentation)
- Code generation and refactoring
- Test generation and execution
- Documentation generation

## 📈 Metrics

Agents track and report:
- Code coverage percentage
- Test pass rate
- Performance metrics
- Bundle size
- Type safety percentage
- Documentation completeness
- Security vulnerability count

## 🚀 Getting Started

1. **Choose the right agent** based on your task
2. **Provide clear requirements** with context
3. **Let the agent work autonomously** through the full cycle
4. **Review and validate** the results
5. **Provide feedback** for improvement

## 📞 Support

For issues or questions about agents:
- Review the agent's specific documentation file
- Check the project's CLAUDE.md for project context
- Provide feedback to improve agent capabilities

---

**Built with ❤️ using Claude Code Agent System**

*These agents represent the pinnacle of AI-assisted software development, combining latest technologies, proven patterns, and autonomous execution to deliver exceptional software quality.*
