---
name: ✨ Feature Request
about: Propón una nueva funcionalidad o mejora
title: '[FEATURE] '
labels: ['enhancement', 'needs-discussion']
assignees: ''
---

## ✨ Descripción de la Feature

<!-- Describe la funcionalidad que propones en 2-3 oraciones -->

## 🎯 Problema que Resuelve

<!-- ¿Qué problema o necesidad aborda esta feature? -->

**User Story:**
> Como [tipo de usuario],  
> Quiero [realizar acción],  
> Para [lograr beneficio]

## 💡 Solución Propuesta

<!-- Describe cómo funcionaría la feature -->

### UI/UX (si aplica)

<!-- Wireframes, mockups, o descripción de la interfaz -->

### Flujo de Usuario

1. Usuario hace X
2. Sistema responde con Y
3. Usuario ve Z

## 🎨 Diseño Visual

<!-- Si tienes ideas de diseño, agrégalas aquí -->

**Mockups/Wireframes:**
<!-- Adjunta imágenes o links a Figma/sketch -->

**Inspiración:**
<!-- Links a apps/sites con funcionalidad similar -->

## 🔧 Detalles Técnicos

### Frontend Web (Next.js)

<!-- Páginas, componentes, hooks necesarios -->

- Nueva página: `app/[route]/page.tsx`
- Componentes: `ComponentA`, `ComponentB`
- Hooks: `useFeatureHook`
- State: React Query / Context

### Frontend Mobile (React Native + Expo)

<!-- Screens, componentes, hooks necesarios -->

- Nueva screen: `screens/FeatureScreen.tsx`
- Componentes: `ComponentA`, `ComponentB`
- Navigation: Stack/Tab updates

### Frontend Desktop (Electron)

<!-- Consideraciones específicas de desktop -->

- IPC handlers: `feature-action`
- Window behaviour: Modal/Dialog
- Offline support: Sí/No

### Backend (NestJS)

<!-- Endpoints, servicios, entidades necesarias -->

- Nuevo endpoint: `POST /api/v1/resource`
- Servicio: `ResourceService`
- DTOs: `CreateResourceDto`, `UpdateResourceDto`

### Database (Prisma)

<!-- Nuevas tablas, columnas, relaciones -->

- Nueva tabla: `resources`
- Relaciones: `user → resources (1:N)`
- Índices: `@@index([userId])`

### Shared Packages

<!-- Si afecta packages compartidos -->

- `@ordo-todo/core`: Nuevas entidades/use cases
- `@ordo-todo/api-client`: Nuevos endpoints
- `@ordo-todo/ui`: Nuevos componentes

## 📊 Prioridad e Impacto

**Prioridad:**
- [ ] 🔴 Critical (blocker para release)
- [ ] 🟠 High (muy solicitado por usuarios)
- [ ] 🟡 Medium (nice to have)
- [ ] 🟢 Low (futuro lejano)

**Impacto:**
- [ ] 🚀 Alto (afecta a todos los usuarios)
- [ ] 📊 Medio (afecta a segmento específico)
- [ ] 🎯 Bajo (feature de nicho)

**Esfuerzo Estimado:**
- [ ] 🟢 Small (< 1 día)
- [ ] 🟡 Medium (1-3 días)
- [ ] 🟠 Large (1-2 semanas)
- [ ] 🔴 Extra Large (> 2 semanas)

**Plataformas Afectadas:**
- [ ] Web (Next.js)
- [ ] Mobile (React Native)
- [ ] Desktop (Electron)
- [ ] Backend (NestJS)
- [ ] All platforms

## 🔀 Alternativas Consideradas

<!-- ¿Evaluaste otras soluciones? ¿Por qué esta es mejor? -->

## ⚠️ Riesgos y Consideraciones

<!-- Posibles problemas, breaking changes, dependencias -->

- **Breaking changes:** Sí/No
- **Requiere migración de datos:** Sí/No
- **Afecta performance:** Sí/No
- **Requiere nuevas dependencias:** Sí/No

## 🧪 Criterios de Aceptación

<!-- ¿Cómo sabremos que la feature está completa? -->

- [ ] Funcionalidad implementada según spec
- [ ] Tests unitarios agregados
- [ ] Documentación actualizada
- [ ] Validado en todas las plataformas requeridas
- [ ] Swagger docs actualizados (Backend)

## 📚 Referencias

<!-- Links a docs, issues relacionados, PRs, etc. -->

- Related to #
- Depends on #
- Documentation: [link]

---

## 💬 Discusión

<!-- Espacio para discutir la propuesta antes de implementar -->
