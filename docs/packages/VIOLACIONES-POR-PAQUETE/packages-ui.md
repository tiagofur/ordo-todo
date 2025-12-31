# 📦 Análisis Detallado: packages/ui

**Score:** 42/100
**Estado:** 🔴 CRÍTICO - Requiere refactorización inmediata

---

## 📊 Resumen de Violaciones

| Severidad    | Cantidad | Líneas | Archivos Afectados |
| ------------ | -------- | ------ | ------------------ |
| **CRÍTICAS** | 15       | 100+   | 100+ archivos      |
| **ALTAS**    | 8        | 50+    | 50+ archivos       |
| **MEDIAS**   | 6        | 80+    | 80+ archivos       |
| **BAJAS**    | 5        | 20+    | 20+ archivos       |

**Total Violaciones:** 34+ en 113 archivos

---

## 🚨 Violaciones CRÍTICAS

### 1. Platform-Specific Code - Rule 19 Violation

**Regla violada:** Components in packages/ui MUST be platform-agnostic (NO hooks, NO framework code)

**Violaciones:**

#### 1.1 `'use client'` Directive en TODOS los componentes

- **Archivos afectados:** ~100 archivos (prácticamente todos)
- **Ejemplos:**
  - task-card.tsx:1
  - workspace-card.tsx:1
  - project-board.tsx:1
  - pomodoro-timer.tsx:1
  - Todos los componentes base (button.tsx, input.tsx, etc.)

```typescript
// ❌ ANTES
"use client";

export function TaskCard({ task }: { task: Task }) {
  // ...
}

// ✅ DESPUÉS
export interface TaskCardProps {
  task: Task;
  // ... otras props
}

export function TaskCard({ task, ...props }: TaskCardProps) {
  // ...
}
```

**Impacto:** Componentes NO pueden usarse en:

- Server-side rendering (Next.js app router)
- React Native (mobile app)
- Electron (desktop app)

**Solución:** Eliminar `'use client'` de TODOS los componentes

---

#### 1.2 React Hooks Usage en TODOS los componentes

- **Archivos afectados:** ~90 archivos
- **Ejemplos:**
  - task-card.tsx:3 (useState)
  - workspace-selector.tsx:3 (useState, useMemo)
  - pomodoro-timer.tsx:3 (useState)
  - project-board.tsx:3, 18, 208 (useState, useEffect, useMemo, createPortal)

```typescript
// ❌ ANTES
"use client"

import { useState } from 'react';

export function TaskCard({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div>
      <button onClick={() => setIsExpanded(!isExpanded)}>
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}

// ✅ DESPUÉS (en consuming app, NO en package/ui)
// apps/web/src/components/task/task-card-container.tsx
"use client"

import { TaskCard } from '@ordo-todo/ui';

export function TaskCardContainer({ task }: { task: Task }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <TaskCard
      task={task}
      isExpanded={isExpanded}
      onToggleExpand={() => setIsExpanded(!isExpanded)}
    />
  );
}

// packages/ui/src/components/task/task-card.tsx (sin 'use client')
export interface TaskCardProps {
  task: Task;
  isExpanded: boolean;
  onToggleExpand: (taskId: string) => void;
  labels?: {
    expand?: string;
    collapse?: string;
  };
}

export function TaskCard({ task, isExpanded, onToggleExpand, labels }: TaskCardProps) {
  return (
    <div>
      <button
        onClick={() => onToggleExpand(task.id)}
        aria-label={isExpanded ? labels?.collapse : labels?.expand}
      >
        {task.title}
      </button>
      {isExpanded && <p>{task.description}</p>}
    </div>
  );
}
```

**Impacto:** Bloquea reutilización de componentes en platforms diferentes

**Solución:**

1. Mover TODOS los estados a consuming apps
2. Toda data recibida vía props
3. Todos los callbacks recibidos vía props
4. Componentes puramente presentacionales

**Tiempo estimado:** 3-4 semanas con 2-3 senior devs

---

#### 1.3 createPortal Usage

- **Archivos afectados:**
  - project-board.tsx:208

```typescript
// ❌ ANTES
import { createPortal } from 'react-dom';

// Usado dentro de componente
{mounted && createPortal(
  <Modal>...</Modal>,
  document.body
)}

// ✅ DESPUÉS (remover de package/ui, manejar en consuming app)
// El consuming app debe manejar el portal
```

**Solución:** Eliminar createPortal, dejar que consuming app maneje

---

### 2. Transparency Violations - Rule 13 Violation

**Regla violada:** Backgrounds MUST be solid colors (NO transparencies)

**Violaciones:** 100+ instancias

#### 2.1 bg-transparent

- **Archivos afectados:** 20+ archivos
- **Ejemplos:**
  - ui/input.tsx:11
  - ui/textarea.tsx:10
  - ui/select.tsx:40
  - task-card.tsx:68
  - workspace-card.tsx:196

```css
/* ❌ ANTES */
input {
  background-color: transparent;
}

/* ✅ DESPUÉS */
input {
  background-color: #ffffff;
}

input.dark\:bg-input {
  background-color: #1f2937;
}
```

---

#### 2.2 opacity-\*

- **Archivos afectados:** 50+ archivos
- **Ejemplos:**
  - ui/switch.tsx:16 (disabled:opacity-50)
  - ui/slider.tsx:20, 23 (bg-primary/20, border-primary/50)
  - ui/button.tsx:8, 12, 14, 16 (disabled:opacity-50, bg-primary/90)
  - task-card.tsx:68 (opacity-60)
  - workspace-card.tsx:196 (opacity-0 group-hover:opacity-100)
  - ui/dialog.tsx:76 (opacity-70)

```css
/* ❌ ANTES */
button:disabled {
  opacity: 0.5;
}

.opacity-60 {
  opacity: 0.6;
}

/* ✅ DESPUÉS */
button:disabled {
  background-color: #d1d5db;
  color: #9ca3af;
}

.opacity-solid {
  background-color: #e5e7eb; /* equivalente sólido de opacity-60 */
}
```

---

#### 2.3 /XX Modifiers (Tailwind opacity modifiers)

- **Archivos afectados:** 30+ archivos
- **Ejemplos:**
  - ui/badge.tsx:8, 17 (focus-visible:ring-destructive/20, dark:focus-visible:ring-destructive/40)
  - ui/calendar.tsx:32, 77, 121 (bg-transparent)
  - ui/tabs.tsx:32 (disabled:opacity-50)
  - ui/dropdown-menu.tsx:44, 88, 106, 142 (bg-black/10)

```css
/* ❌ ANTES */
.bg-primary\/20 {
  background-color: rgba(59, 130, 246, 0.2);
}

.bg-black\/10 {
  background-color: rgba(0, 0, 0, 0.1);
}

/* ✅ DESPUÉS */
.bg-primary-20 {
  background-color: #dbeafe; /* equivalente sólido */
}

.bg-black-10 {
  background-color: #e5e5e5; /* equivalente sólido */
}
```

**Solución:**

1. Crear paleta de colores sólidos para reemplazar transparencias
2. Reemplazar todos los `bg-transparent` con colores sólidos apropiados
3. Reemplazar todos los `opacity-*` con colores sólidos (except disabled states)
4. Reemplazar todos los `/XX` modifiers con clases de colores sólidos

**Tiempo estimado:** 2 semanas con 2 devs

---

### 3. Gradient Violations - Rule 14 Violation

**Regla violada:** Backgrounds MUST be solid (NO gradients)

**Violaciones:**

#### 3.1 blur-3xl with opacity

- **Archivos afectados:** 5 archivos
- **Ejemplos:**
  - task-card.tsx:290
  - workspace-card.tsx:243
  - habits-widget.tsx:214
  - habit-onboarding.tsx:147
  - task-card-compact.tsx:510

```css
/* ❌ ANTES */
.bg-gradient-blur {
  filter: blur(3xl);
  opacity: 0.1;
}

/* ✅ DESPUÉS */
.bg-gradient-solid {
  background-color: #e5e7eb; /* color sólido */
}
```

**Solución:**

1. Eliminar todos los efectos `blur-3xl opacity-*`
2. Reemplazar con colores sólidos o eliminar efecto
3. Simplificar decoraciones visuales

**Tiempo estimado:** 1 día

---

## 🟠 Violaciones ALTAS

### 4. Accessibility Violations - Rule 16 Violation

**Regla violada:** ALL UI components MUST have keyboard navigation, ARIA labels, proper semantic HTML

**Violaciones:**

#### 4.1 Missing ARIA Labels

- **Archivos afectados:** 50+ archivos
- **Ejemplos:**
  - button.tsx:46-65 (No aria-label en custom buttons)
  - workspace-card.tsx:193-201 (Button sin aria-label)
  - task-card.tsx:199-207 (MoreVertical button sin aria-label)
  - dropdown-menu.tsx:27-31, 42-62 (Triggers y items sin aria-label)

```typescript
// ❌ ANTES
<button onClick={handleClick}>
  <MoreVerticalIcon />
</button>

// ✅ DESPUÉS
<button
  onClick={handleClick}
  aria-label="More options"
  aria-expanded={isOpen}
>
  <MoreVerticalIcon />
</button>
```

---

#### 4.2 Missing Keyboard Navigation

- **Archivos afectados:** 30+ archivos con componentes custom interactivos
- **Ejemplos:**
  - dropdown-menu.tsx (falta keyboard support)
  - task-selector.tsx (combobox sin keyboard navigation)

**Solución:**

1. Agregar `aria-label` a todos los botones icon-only
2. Asegurar que todos los elementos interactivos tengan labels
3. Implementar keyboard navigation en dropdowns, modals, etc.
4. Agregar `role` attributes apropiados
5. Testear con screen reader

**Tiempo estimado:** 2 semanas con 1 dev

---

### 5. Missing Dark Mode Support - Rule 17 Violation

**Regla violada:** ALL components MUST support dark mode

**Violaciones:**

- **Archivos afectados:** 40+ archivos con dark mode incompleto
- **Ejemplos:**
  - card.tsx (No explicit dark mode classes)
  - alert.tsx (Minimal dark mode support)
  - task-card.tsx (Limited dark mode on borders, shadows)
  - workspace-card.tsx (Limited dark mode support)

```typescript
// ❌ ANTES
<div className="bg-white border-gray-200">
  <h3 className="text-gray-900">{title}</h3>
</div>

// ✅ DESPUÉS
<div className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
  <h3 className="text-gray-900 dark:text-gray-100">{title}</h3>
</div>
```

**Solución:**

1. Agregar variantes `dark:` a todos los colores
2. Asegurar text colors tengan dark mode
3. Asegurar borders tengan dark mode
4. Testear todos los componentes en dark mode

**Tiempo estimado:** 1 semana con 1 dev

---

## 🟡 Violaciones MEDIAS

### 6. Responsive Design Issues - Rule 15 Violation

**Regla violada:** ALL components MUST support mobile (320-640px), tablet (641-1024px), desktop (1025px+)

**Violaciones:**

#### 6.1 Fixed Widths

- **Archivos afectados:**
  - sidebar.tsx:123 (fixed width w-64)
  - auth-form.tsx:89 (fixed width w-96)
  - task-card.tsx:190 (truncate max-w-[180px])

```typescript
// ❌ ANTES
<div className="w-64">
  <Sidebar />
</div>

// ✅ DESPUÉS
<div className="w-full md:w-64">
  <Sidebar />
</div>
```

---

#### 6.2 No Responsive Text Sizing

- **Archivos afectados:** 30+ archivos
- **Ejemplos:**
  - workspace-card.tsx:165 (Fixed text sizing)
  - auth-form.tsx (No responsive fonts)

```typescript
// ❌ ANTES
<h3 className="text-xl">{title}</h3>

// ✅ DESPUÉS
<h3 className="text-lg md:text-xl lg:text-2xl">{title}</h3>
```

**Solución:**

1. Usar mobile-first responsive design
2. Agregar breakpoints `md:` y `lg:` apropiados
3. Remover fixed widths
4. Testear en 320px, 768px, 1024px+

**Tiempo estimado:** 1 semana con 1 dev

---

### 7. TypeScript Issues - Rule 4 Violation

**Violaciones:**

- **project-board.tsx:24** - `tasks?: any[]`
- **project-board.tsx:76, 77** - Local state typed as `any[]`

```typescript
// ❌ ANTES
export function ProjectBoard({ tasks?: any[] }: { tasks?: any[] }) {
  const [localTasks, setLocalTasks] = useState<any[]>([]);
}

// ✅ DESPUÉS
interface TaskProps {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  // ...
}

export function ProjectBoard({ tasks }: { tasks?: TaskProps[] }) {
  const [localTasks, setLocalTasks] = useState<TaskProps[]>([]);
}
```

**Solución:**

1. Definir interfaces apropiadas para todas las data structures
2. Eliminar todos los `any` types
3. Usar discriminant unions donde apropiado

---

## 🟢 Violaciones BAJAS

### 8. Missing JSDoc Documentation - Rule 28 Violation

**Cobertura:**

- **Buenos:** button.tsx, task-card.tsx, workspace-card.tsx, timer-widget.tsx, pomodoro-timer.tsx
- **Faltantes:** Most base UI components, domain-specific components

**Solución:** Agregar JSDoc a todos los componentes exportados

---

### 9. Code Duplication

**Ejemplos:**

- Button patterns repeated across multiple components
- Badge styling duplicated in multiple places
- Status/priority configuration patterns repeated

**Solución:** Extraer common patterns a sub-components

---

## ✅ Fortalezas

1. **Naming Conventions** ✅
   - PascalCase componentes
   - kebab-case archivos
   - camelCase funciones/variables

2. **Component Organization** ✅
   - Estructura bien organizada por dominio
   - Barrel exports limpios

3. **CVA Usage** ✅
   - Uso apropiado de class-variance-authority
   - Variants bien definidos

4. **Good Structure** ✅
   - 91+ componentes bien separados por dominio
   - Base components bien diseñados

---

## 📊 Score Detallado

| Categoría         | Score      | Peso     | Peso Score |
| ----------------- | ---------- | -------- | ---------- |
| Platform-Agnostic | 5/100      | 25%      | 1.25       |
| NO Transparencies | 10/100     | 20%      | 2.00       |
| NO Gradients      | 20/100     | 15%      | 3.00       |
| Accessibility     | 40/100     | 15%      | 6.00       |
| Dark Mode         | 50/100     | 10%      | 5.00       |
| Responsive Design | 60/100     | 5%       | 3.00       |
| TypeScript        | 80/100     | 5%       | 4.00       |
| JSDoc             | 30/100     | 3%       | 0.90       |
| Naming            | 100/100    | 1%       | 1.00       |
| CVA Usage         | 80/100     | 1%       | 0.80       |
| **TOTAL**         | **42/100** | **100%** | **26.95**  |

---

## 🎯 Plan de Corrección Priorizado

### SEMANA 1-2: CRÍTICO - Refactorización Arquitectónica

**Semana 1: Planificación y Pilotos**

- [ ] Auditar todos los componentes (113 archivos)
- [ ] Identificar 20 componentes más críticos
- [ ] Crear guía de arquitectura platform-agnostic
- [ ] Refactorizar 5 componentes piloto

**Semana 2: Refactorización Masiva**

- [ ] Refactorizar 30 componentes de dominio
- [ ] Refactorizar 25 componentes base
- [ ] Code reviews cruzados

### SEMANA 3-4: CRÍTICO - Eliminar Transparencias

**Semana 3: Análisis y Reemplazo**

- [ ] Crear paleta de colores sólidos
- [ ] Reemplazar 70% de transparencias

**Semana 4: Validación y Resto**

- [ ] Reemplazar 30% restante
- [ ] Validar consistencia visual
- [ ] Eliminar gradientes

### SEMANA 5-6: ALTA - Accessibility y Dark Mode

- [ ] Agregar ARIA labels a todos los botones
- [ ] Implementar keyboard navigation
- [ ] Completar dark mode en todos los componentes
- [ ] Test con screen reader

### SEMANA 7-8: MEDIA - Responsiveness y TypeScript

- [ ] Implementar responsive design
- [ ] Eliminar tipos `any`
- [ ] Agregar JSDoc completo

---

## 📞 Recursos

- [RESUMEN-EJECUTIVO.md](../RESUMEN-EJECUTIVO.md)
- [PLAN-ACCION.md](../PLAN-ACCION.md)
- [.claude/rules.md](../../.claude/rules.md)

---

**Última actualización:** 31 de Diciembre 2025
