## 📝 Descripción

<!-- Describe brevemente los cambios realizados -->

## 🎯 Tipo de Cambio

<!-- Marca con [x] el tipo de PR -->

- [ ] 🐛 **Bug fix** (corrección que resuelve un issue)
- [ ] ✨ **New feature** (funcionalidad nueva)
- [ ] 💄 **UI/UX** (cambios de diseño o interfaz)
- [ ] ♻️ **Refactoring** (cambio de código sin alterar funcionalidad)
- [ ] 📝 **Documentation** (cambios en documentación)
- [ ] ⚡ **Performance** (mejoras de rendimiento)
- [ ] 🧪 **Tests** (agregar o modificar tests)
- [ ] 🔧 **Chore** (deps, config, mantenimiento)

## 🔗 Issues Relacionados

<!-- Linkea los issues que este PR resuelve o afecta -->

- Closes #
- Related to #

## 📸 Screenshots / Videos

<!-- Si aplica, agrega screenshots o videos del cambio -->

**Antes:**
<!-- Screenshot o descripción del estado anterior -->

**Después:**
<!-- Screenshot o descripción del nuevo estado -->

---

## ✅ Checklist

### Código

- [ ] Sigue los [standards de código](/.github/CONTRIBUTING.md#standards-de-código)
- [ ] Sin valores hardcodeados (colores, spacing, secrets)
- [ ] Componentes < 150 líneas (React/React Native)
- [ ] DTOs validados con `class-validator` (Backend)
- [ ] userId del JWT, NUNCA del body (Backend)

### Testing

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests pasan localmente (`npm run test`)
- [ ] Linter pasa sin errores (`npm run lint`)
- [ ] Validado manualmente en desarrollo

### Seguridad

- [ ] No expone datos sensibles (tokens, passwords, secrets)
- [ ] Validación de inputs en todos los endpoints (Backend)
- [ ] `@Public()` decorator en endpoints públicos (Backend)
- [ ] No vulnerabilidades de seguridad introducidas

### Documentación

- [ ] Comentarios útiles en código complejo
- [ ] README actualizado si cambia setup
- [ ] Swagger docs actualizadas (Backend)
- [ ] Componentes documentados con JSDoc (React)

### Performance

- [ ] Sin queries N+1 (Backend)
- [ ] Índices agregados en columnas de búsqueda (Database)
- [ ] Server Components donde sea posible (Next.js)
- [ ] Lazy loading para componentes pesados

### Accesibilidad

- [ ] Touch targets mínimo 44x44px (Mobile)
- [ ] Contraste mínimo 4.5:1
- [ ] aria-labels en iconos sin texto
- [ ] Navegación por teclado funcional (Web)

### Web Específico (Next.js)

- [ ] Usa TailwindCSS (no inline styles)
- [ ] Server Components por defecto (no 'use client' innecesario)
- [ ] React Query para server state
- [ ] Componentes reutilizables en `src/components/`

### Mobile Específico (React Native)

- [ ] Usa StyleSheet.create()
- [ ] Soporte para iOS y Android
- [ ] Expo SDK features cuando es posible

### Desktop Específico (Electron)

- [ ] Separación main/renderer process
- [ ] IPC communication seguro
- [ ] Funcionalidad offline si aplica

### Backend Específico (NestJS)

- [ ] Migraciones Prisma creadas si hay cambios de schema
- [ ] Transacciones en operaciones multi-tabla
- [ ] Logger inyectado (NO `console.log`)
- [ ] Type-safe error handling en catch blocks
- [ ] Endpoints documentados con `@ApiOperation()` y `@ApiResponse()`

---

## 🧪 Testing Realizado

<!-- Describe cómo probaste los cambios -->

### Manual Testing

- [ ] Probado en desarrollo local
- [ ] Probado en múltiples navegadores/dispositivos (si aplica)
- [ ] Validado flujo completo end-to-end

### Automated Testing

```bash
# Backend
npm run test          # Resultado: ✅ X tests passed
npm run test:e2e      # Resultado: ✅ X tests passed

# Web
npm run lint          # Resultado: ✅ No issues found
npm run build         # Resultado: ✅ Build successful
```

---

## 📊 Impacto

### Tamaño del PR

- Líneas agregadas: ~
- Líneas eliminadas: ~
- Archivos modificados: ~

### Breaking Changes

<!-- ¿Este PR introduce cambios que rompen compatibilidad? -->

- [ ] ✅ **No breaking changes**
- [ ] ⚠️ **Breaking changes** (describe abajo)

<!-- Si hay breaking changes, describe el impacto y plan de migración -->

---

## 💡 Notas Adicionales

<!-- Cualquier contexto adicional, decisiones técnicas, trade-offs, etc. -->

---

## 👀 Reviewer Notes

<!-- Áreas específicas donde quieres feedback -->

- [ ] Revisar lógica en `archivo.ts:linea`
- [ ] Validar diseño de componente `NombreComponente`
- [ ] Confirmar approach de `funcionalidad X`

---

## 🚀 Deploy Notes

<!-- Si aplica, instrucciones especiales para deploy -->

- [ ] Requiere correr migraciones (`npx prisma migrate deploy`)
- [ ] Requiere nuevas variables de entorno (ver `.env.example`)
- [ ] Requiere actualizar dependencias (`npm install`)
- [ ] Requiere restart de servicios (Redis, PostgreSQL)

---

**Checklist Summary**: ☑️ X/Y completado

<!-- GitHub Actions ejecutará validaciones automáticas -->
