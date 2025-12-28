// ===== PROMPTS DATABASE =====
const prompts = {
    backend: `Use nestjs-backend agent to create Projects CRUD API:

Pattern Reference: apps/backend/src/tasks/
Location: apps/backend/src/projects/
Entity: Project from @ordo-todo/core

Requirements:
- Controller with REST endpoints (GET, POST, PATCH, DELETE)
- Service with business logic
- Repository using PrismaService
- DTOs with class-validator (Create, Update, Query)
- Unit tests (Jest)
- Integration tests (supertest)
- Swagger documentation
- JSDoc comments

Apply rules from: .claude/rules/backend.md

Quality Gates (must pass):
✅ npm run lint
✅ npm run check-types
✅ npm run test
✅ npm run build`,

    frontend: `Use nextjs-frontend agent to create ProjectCard component:

Location: packages/ui/src/components/project/project-card.tsx
Pattern Reference: packages/ui/src/components/task/task-card.tsx

Props Interface:
- project: Project object
- onProjectClick: (id: string) => void
- onEdit?: (id: string) => void
- onDelete?: (id: string) => void
- labels?: { edit?: string; delete?: string }

Requirements:
- Platform-agnostic (no hooks, no router)
- TypeScript strict types
- Accessibility: WCAG AA (keyboard, ARIA, focus indicators)
- Responsive: mobile (320-640px), tablet (641-1024px), desktop (1025px+)
- Dark mode: dark:bg-gray-900 variants
- Styling: TailwindCSS (solid colors only, no gradients)

Tests: React Testing Library
Docs: Storybook stories + JSDoc comments

Rules: .claude/rules/packages.md`,

    mobile: `Use react-native-specialist agent to create ProjectList screen:

Location: apps/mobile/src/app/projects/
- Create projects list screen
- Use FlashList for performance
- Navigate to project details on tap
- Support pull-to-refresh
- Show loading states

Follow Expo Router patterns
Apply React Native best practices`,

    desktop: `Use electron-specialist agent to create project management feature:

Main Process:
- Create IPC handler for projects
- Implement window management

Renderer Process:
- Create project list UI component
- Implement IPC communication with preload script

Security:
- Context isolation enabled
- Node integration disabled
- Validate all IPC inputs`,

    database: `Use postgres-specialist agent to design projects table:

Schema Location: packages/db/prisma/schema.prisma

Table Requirements:
- Fields: id (cuid), name, description, ownerId, createdAt, updatedAt
- Relationships: owner (User), tasks (Task[])
- Indexes: ownerId, name
- Constraints: name NOT NULL, owner foreign key

Normalization: 3NF
Performance: Appropriate indexes for common queries
Documentation: Comment blocks

Generate: Run npx prisma generate after schema change`,

    testing: `Use testing-specialist agent to test ProjectService:

Target: apps/backend/src/projects/projects.service.ts
Type: Service layer testing

Framework: Jest
Coverage target: 100%

Requirements:
- Test all public methods
- Test edge cases (empty input, null values)
- Test error handling
- Mock PrismaService
- Arrange-Act-Assert pattern
- Clear, descriptive test names

Test File Location: apps/backend/src/projects/projects.service.spec.ts`,

    docs: `Use documentation-specialist agent to document Projects API:

Components:
1. OpenAPI/Swagger specification
   - Endpoint descriptions
   - Request/response schemas
   - Error codes
   - Authentication requirements

2. JSDoc comments
   - All public methods
   - Parameter descriptions
   - Return types
   - Usage examples

3. README
   - Installation instructions
   - Usage examples
   - API reference

Output: Update Swagger in backend, add JSDoc to service`,

    refactor: `Use refactoring-specialist agent to refactor ProjectService:

Target: apps/backend/src/projects/projects.service.ts
Issues: [Describe the problems]

Goals:
- Apply SOLID principles
- Extract duplicate code
- Improve error handling
- Add proper validation
- Optimize database queries
- Improve type safety

Maintain: Same functionality
Improve: Code quality, readability, maintainability

Rules: .claude/rules.md#code-quality-rules`
};

// ===== TAB NAVIGATION =====
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });

    // Remove active class from all tabs
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Add active class to clicked tab
    event.target.classList.add('active');

    // Smooth scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ===== COPY PROMPTS =====
function copyPrompt(type) {
    const prompt = prompts[type];
    if (prompt) {
        copyToClipboardText(prompt);
        showNotification('✅ Prompt copiado al portapapeles');
    }
}

// ===== COPY TO CLIPBOARD =====
function copyToClipboard(button) {
    const pre = button.previousElementSibling;
    const code = pre.querySelector('code').innerText;

    copyToClipboardText(code);
    showNotification('✅ Copiado al portapapeles');

    // Visual feedback
    button.textContent = '✅ Copiado!';
    button.style.background = '#10b981';

    setTimeout(() => {
        button.textContent = '📋 Copiar';
        button.style.background = '#667eea';
    }, 2000);
}

// ===== COPY TEXT =====
function copyToClipboardText(text) {
    navigator.clipboard.writeText(text).then(() => {
        console.log('Text copied to clipboard');
    }).catch(err => {
        console.error('Failed to copy: ', err);

        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    });
}

// ===== NOTIFICATION =====
function showNotification(message) {
    // Remove existing notification if any
    const existing = document.querySelector('.copy-notification');
    if (existing) {
        existing.remove();
    }

    // Create notification
    const notification = document.createElement('div');
    notification.className = 'copy-notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + 1-7 for tabs
    if (e.ctrlKey || e.metaKey) {
        const key = e.key;
        if (key >= '1' && key <= '7') {
            e.preventDefault();
            const tabs = document.querySelectorAll('.tab');
            const sections = ['inicio', 'agentes', 'reglas', 'prompts', 'mcps', 'tokens', 'config'];
            const index = parseInt(key) - 1;

            if (tabs[index] && sections[index]) {
                tabs[index].click();
            }
        }
    }
});

// ===== SMOOTH SCROLL =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== ANIMATIONS ON SCROLL =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card, .agent-card, .mcp-card, .prompt-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(el);
    });
});

// ===== INITIALIZATION =====
console.log('🚀 Guía Ordo-Todo Claude Code cargada');
console.log('💡 Atajos de teclado: Ctrl/Cmd + 1-7 para cambiar tabs');
