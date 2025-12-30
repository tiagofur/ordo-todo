# @ordo-todo/web

This is the main web application for Ordo-Todo, a productivity platform built with Next.js 16 (App Router), React 19, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Running backend services (API + Database)

### Installation

Install dependencies from the root of the monorepo:

```bash
npm install
```

### Running Development Server

To start the web application in development mode:

```bash
npm run dev
# Runs on localhost:3100
```

## 🏗️ Architecture

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **I18n**: next-intl

## 🧪 Testing

We use Vitest for unit/integration tests and Playwright for E2E tests.

### Unit Tests

```bash
npm run test
npm run test:ui # with UI
npm run test:coverage # coverage report
```

### E2E Tests

```bash
npm run test:e2e
npm run test:e2e:ui # interactive mode
```

## 📚 Key Features

- **Workspaces & Projects**: Organize tasks hierarchically.
- **Task Management**: Kanban, List, and Calendar views.
- **Habits**: Gamified habit tracking with streaks.
- **Focus Mode**: Pomodoro timer with analytics.
- **Offline Support**: PWA capabilities.

## 🤝 Contribution

Please ensure all tests pass and linting checks are green before submitting a PR.

```bash
npm run lint
npm run check-types
```
