# Plan de Acción: Estabilización y Mejoras de Ordo-Todo

Este documento detalla el plan de acción para resolver los problemas identificados en el análisis del proyecto, con un enfoque estricto en el uso de **NestJS (REST)** y la **eliminación de cualquier iniciativa de migración a tRPC**.

## 1. Arquitectura Backend (NestJS REST)

**Objetivo**: Consolidar `apps/backend` en NestJS como la única fuente de verdad para la API, descartando tRPC.

- [x] **Acción 1.1: Cancelar Migración a tRPC**
    - [x] Confirmar que no existen dependencias de tRPC en `apps/backend` ni `apps/web` (Verificado: No existen).
    - [x] Eliminar cualquier documentación o referencia futura a tRPC en el proyecto (ej. en `README.md` o `docs/`).
    - [x] **Estado**: El código actual ya es puramente NestJS REST. Se eliminaron todas las referencias a tRPC en la documentación.

- [x] **Acción 1.2: Optimización de la API REST**
    - [x] Asegurar que todos los nuevos endpoints sigan los patrones de Clean Architecture implementados en `packages/core`. (Verificado: `TasksService` usa `CreateTaskUseCase`, etc.)
    - [x] Mantener la generación/actualización del cliente API (`@ordo-todo/api-client`) sincronizada con los controladores de NestJS. (Verificado: Se agregaron endpoints de AI faltantes a `packages/api-client`)

## 2. Estandarización de Idioma

**Objetivo**: Eliminar la inconsistencia de idiomas (Español/Portugués/Inglés) en la aplicación.

- [x] **Acción 2.1: Definir Idioma Base**
    - [x] **Código/Comentarios**: Estandarizar a **Inglés** (Mejor práctica para colaboración y consistencia con librerías).
    - [x] **UI (Usuario Final)**: Implementar soporte para múltiples idiomas (i18n), con **Español** como idioma por defecto inicial (dado el contexto del usuario).

- [ ] **Acción 2.2: Implementación de i18n**
    - [x] **Web**: Utilizar soporte nativo de Next.js o `next-intl`. (Implementado con `next-intl` y enrutamiento `/es`, `/en`)
    - [ ] **Mobile**: Integrar `i18next` o similar para manejo de traducciones.
    - [ ] **Tarea**: Extraer textos "hardcodeados" en componentes a archivos de traducción (locales). (En progreso: Sidebar, TopBar, TimerWidget migrados)

## 3. Autenticación Móvil

**Objetivo**: Completar el flujo de autenticación en la aplicación móvil (`apps/mobile`).

- [ ] **Acción 3.1: Integración con Backend**
    - [ ] Utilizar los endpoints existentes de `apps/backend` (`/auth/login`, `/auth/register`) a través de `@ordo-todo/api-client`.
    - [ ] No crear nuevos endpoints específicos para móvil a menos que sea estrictamente necesario.

- [ ] **Acción 3.2: Gestión de Sesión**
    - [ ] Implementar almacenamiento seguro de tokens (JWT) usando `SecureStore` (o `AsyncStorage` si no hay datos sensibles críticos, pero `SecureStore` es preferible). *Nota: `expo-secure-store` no está en package.json, se recomienda agregarlo.*
    - [ ] Manejar la persistencia del estado de autenticación (Auto-login al abrir la app).

- [ ] **Acción 3.3: UI de Autenticación**
    - [ ] Finalizar pantallas de Login y Registro en React Native, asegurando paridad visual con la versión Web.

## 4. Próximos Pasos Inmediatos

- [x] **Limpieza de Documentación**: Se actualizaron `docs/analisys/copilot-issues.md`, `docs/analisys/copilot-now.md`, `docs/design/PRD.md`, `docs/design/TECHNICAL_DESIGN.md` y otros planes para reflejar que tRPC está descartado.
- [x] **Configuración de i18n**: Instalar dependencias necesarias en Web y Mobile. (Web completado)
- [ ] **Desarrollo Auth Mobile**: Comenzar con la pantalla de Login en Mobile.
