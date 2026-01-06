# Claude Code Configuration Guide

**Configuración óptima de Claude Code para máximo efficiency.**

## ⚙️ Configuración de VSCode Extension

### Configuración Recomendada

**Archivo: `.vscode/settings.json`**

```json
{
  // Claude Code Settings
  "claudeCode.enabled": true,
  "claudeCode.model": "claude-sonnet-4-5-20250929",
  "claudeCode.temperature": 0.7,
  "claudeCode.maxTokens": 8000,

  // Context Optimization
  "claudeCode.maxContextFiles": 10,
  "claudeCode.maxFileSize": 500000,
  "claudeCode.excludePatterns": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/*.log",
    "**/.git/**"
  ],

  // UI Preferences
  "claudeCode.showInlineDiffs": true,
  "claudeCode.autoAcceptSuggestions": false,
  "claudeCode.enableStatusIndicator": true,

  // Performance
  "claudeCode.throttleRequests": true,
  "claudeCode.cacheResponses": true
}
```

---

## 📁 Archivos Context Estratégicos

### Contexto Base (Siempre Disponible)

Crear archivo: `.claude/CONTEXT.md`

```markdown
# Ordo-Todo Project Context

**Última actualización:** 2025-01-27

## Tech Stack
- Backend: NestJS 11, Prisma 6, PostgreSQL 16
- Frontend: Next.js 15, React 19, TailwindCSS 4
- Mobile: React Native, Expo 52
- Desktop: Electron, Vite

## Structure
- apps/backend (NestJS API)
- apps/web (Next.js web)
- apps/mobile (React Native)
- apps/desktop (Electron)
- packages/core (domain)
- packages/ui (components)
- packages/hooks (React Query)
- packages/db (Prisma)

## Quick Commands
npm run dev              # Start all
npm run lint             # Lint all
npm run test             # Test all
npm run build            # Build all

## Key Rules
- Used by 2+ apps? → packages/
- Platform-agnostic → packages/ui
- Business logic → packages/core
- 100% test coverage (critical paths)
- NO transparencies, NO gradientes
- Perfect responsiveness (mobile/tablet/desktop)

## Agents & Rules
- Agents: .claude/agents/
- Rules: .claude/rules/
- Prompts: .claude/PROMPTS.md
- Token Opt: .claude/TOKEN-OPTIMIZATION.md
```

### Archivos para Incluir

**En tu configuración de Claude Code, agregar:**

```json
{
  "claudeCode.alwaysInclude": [
    ".claude/CONTEXT.md",
    ".claude/rules.md",
    "turbo.json",
    "package.json"
  ]
}
```

---

## 🎯 Sistema de Exclusiones

### Archivos a Excluir (Ahorrar Tokens)

```json
{
  "claudeCode.excludeFiles": [
    "**/node_modules/**",
    "**/dist/**",
    "**/build/**",
    "**/.next/**",
    "**/coverage/**",
    "**/out/**",
    "**/.cache/**",
    "**/*.min.js",
    "**/*.min.css",
    "**/package-lock.json",
    "**/yarn.lock",
    "**/pnpm-lock.yaml",
    "**/*.log",
    "**/.DS_Store",
    "**/.env*",
    "**/.git/**",
    "**/generated/**"
  ]
}
```

---

## 🚀 Configuración de MCP Servers

### Archivo de Configuración

**Ubicación:**
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Linux: `~/.config/Claude/claude_desktop_config.json`

### Configuración Completa Optimizada

```json
{
  "mcpServers": {
    // 🌟 ESENCIALES (Must-Have)
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "C:\\Users\\Usuario\\source\\repos"
      ],
      "disabled": false
    },

    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "your_token_here"
      },
      "disabled": false
    },

    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"],
      "disabled": false
    },

    "memory": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-memory"],
      "disabled": false
    },

    // 📚 DOCUMENTACIÓN (Recomendado)
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/mcp-server-context7"],
      "env": {
        "UPSTASH_CONTEXT7_API_KEY": "your_key_here"
      },
      "disabled": false
    },

    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "your_key_here"
      },
      "disabled": true // Habilitar cuando se necesite búsqueda web
    },

    // 🔧 BACKEND (Opcional)
    "postgres": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-postgres"],
      "env": {
        "POSTGRES_CONNECTION_STRING": "postgresql://user:pass@localhost:5432/ordo_todo"
      },
      "disabled": true // Habilitar cuando se trabaje con DB
    },

    "docker": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-docker"],
      "disabled": true // Habilitar cuando se use Docker
    },

    // 🧪 TESTING (Opcional)
    "sequential-thinking": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sequential-thinking"],
      "disabled": false
    },

    "puppeteer": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-puppeteer"],
      "disabled": true // Habilitar para testing visual
    }
  }
}
```

---

## 💾 Strategies de Caching

### Habilitar Caching

```json
{
  "claudeCode": {
    "cacheResponses": true,
    "cacheDuration": 3600000, // 1 hora
    "throttleRequests": true,
    "requestDelay": 500 // ms entre requests
  }
}
```

### Memoria de Proyecto (Memory MCP)

**Configurar para recordar:**

```json
{
  "memory": {
    "projectDecisions": true,
    "codePatterns": true,
    "userPreferences": true,
    "commonTasks": true
  }
}
```

---

## 🎯 Configuración por Tipo de Tarea

### Desarrollo Backend

**MCPs activos:**
- ✅ filesystem
- ✅ postgres
- ✅ context7
- ✅ github
- ✅ memory

**Context files:**
- `.claude/rules/backend.md`
- `packages/db/prisma/schema.prisma`
- `apps/backend/package.json`

### Desarrollo Frontend

**MCPs activos:**
- ✅ filesystem
- ✅ context7
- ✅ brave-search
- ✅ github
- ✅ memory

**Context files:**
- `.claude/rules/frontend.md`
- `.claude/rules/packages.md`
- `apps/web/package.json`
- `packages/ui/package.json`

### Testing

**MCPs activos:**
- ✅ filesystem
- ✅ sequential-thinking
- ✅ puppeteer
- ✅ memory

**Context files:**
- `.claude/rules.md#testing-rules`
- `.claude/agents/testing-specialist.md`

### Documentation

**MCPs activos:**
- ✅ filesystem
- ✅ context7
- ✅ fetch
- ✅ memory

**Context files:**
- `.claude/rules.md#documentation-rules`
- `.claude/agents/documentation-specialist.md`

---

## 🔧 Optimizaciones de Rendimiento

### Reducir Contexto

```json
{
  "claudeCode": {
    "maxContextFiles": 10,
    "maxFileSize": 500000, // 500KB max
    "maxTotalSize": 5000000 // 5MB total
  }
}
```

### Excluir Directorios Pesados

```json
{
  "claudeCode.excludePatterns": [
    "**/node_modules/**",
    "**/.next/**",
    "**/dist/**",
    "**/coverage/**",
    "**/*.min.js",
    "**/*.map"
  ]
}
```

### Usar Referencias

**En lugar de incluir código completo:**

```json
{
  "claudeCode.useReferences": true,
  "claudeCode.referenceOnly": true,
  "claudeCode.includeExamples": false
}
```

---

## 📊 Monitoreo de Tokens

### Habilitar Logging

```json
{
  "claudeCode": {
    "logTokens": true,
    "logRequests": true,
    "logFile": ".claude/logs/usage.log"
  }
}
```

### Métricas Clave

**Monitorear:**
- Tokens por prompt (objetivo: <5,000)
- Tokens por respuesta (objetivo: <3,000)
- Tiempo de respuesta (objetivo: <30s)
- Cache hit rate (objetivo: >50%)

---

## 🎯 Configuración de Agentes

### Agente por Defecto

```json
{
  "claudeCode": {
    "defaultAgent": "general-purpose",
    "agentTimeout": 300000, // 5 minutos
    "agentMaxRetries": 3
  }
}
```

### Agentes Especialistas

```json
{
  "claudeCode.agents": {
    "backend": {
      "name": "nestjs-backend",
      "model": "claude-sonnet-4-5",
      "temperature": 0.5,
      "maxTokens": 8000
    },
    "frontend": {
      "name": "nextjs-frontend",
      "model": "claude-sonnet-4-5",
      "temperature": 0.7,
      "maxTokens": 8000
    },
    "testing": {
      "name": "testing-specialist",
      "model": "claude-sonnet-4-5",
      "temperature": 0.3,
      "maxTokens": 6000
    }
  }
}
```

---

## 🚀 Quick Start Script

### Script de Inicialización

**Archivo: `setup-claude.sh`**

```bash
#!/bin/bash

echo "🚀 Configurando Claude Code para Ordo-Todo..."

# 1. Crear archivo de contexto
cp .claude/OPTIMIZATION.md .claude/CONTEXT.md

# 2. Actualizar VSCode settings
echo "⚙️ Configurando VSCode..."
# (copy settings to .vscode/settings.json)

# 3. Verificar MCPs
echo "🔧 Verificando MCP servers..."
npx @modelcontextprotocol/server-filesystem --version
npx @modelcontextprotocol/server-github --version

# 4. Crear logs directory
mkdir -p .claude/logs

echo "✅ Configuración completa!"
echo "📖 Ver: .claude/README.md para guía completa"
```

---

## 📈 Métricas de Éxito

### Objetivos

**Tokens:**
- Prompt típico: <5,000 tokens
- Response típica: <3,000 tokens
- Tarea completa: <10,000 tokens

**Rendimiento:**
- Tiempo de respuesta: <30s
- Cache hit rate: >50%
- Solicitudes en paralelo: 2-3

**Calidad:**
- Tests passing: 100%
- Linting: 0 errores, 0 warnings
- Type checking: 0 errores
- Build: Success

---

## 🎯 Troubleshooting

### Tokens Excedidos

**Síntoma:** Prompt too long

**Solución:**
1. Reducir archivos en contexto
2. Usar referencias en lugar de contenido completo
3. Eliminar archivos duplicados
4. Aumentar exclusions

### Lentitud

**Síntoma:** Respuestas lentas

**Solución:**
1. Habilitar caching
2. Aumentar throttle
3. Reducir maxContextFiles
4. Usar prompts más específicos

### MCPs No Funcionan

**Síntoma:** MCPs no aparecen

**Solución:**
1. Verificar configuración JSON válida
2. Reiniciar Claude Desktop
3. Verificar logs en `~/Library/Logs/Claude/`
4. Verificar que MCP esté instalado

---

## 📚 Referencias Rápidas

### Comandos Útiles

```bash
# Ver logs
tail -f .claude/logs/usage.log

# Contar tokens aproximados
wc -w .claude/CONTEXT.md

# Ver tamaño de archivos
du -sh apps/backend/src/*

# Buscar archivos grandes
find . -type f -size +1M | grep -v node_modules
```

### Atajos de Teclado

```
Ctrl+Shift+C → Abrir Claude Code
Ctrl+Shift+P → Abrir prompt
Ctrl+Shift+A → Abrir agente
Ctrl+Shift+H → Ver historial
```

---

**Built with ❤️ for Ordo-Todo**

*Configuración optimizada = Máxima eficiencia*
