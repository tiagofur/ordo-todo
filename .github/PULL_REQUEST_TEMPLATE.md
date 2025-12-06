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
- [ ] Componentes < 200 líneas (Flutter)
- [ ] DTOs validados con `class-validator` (Backend)
- [ ] userId del JWT, NUNCA del body (Backend)

### Testing

- [ ] Tests unitarios agregados/actualizados
- [ ] Tests pasan localmente (`npm run test` / `flutter test`)
- [ ] Linter pasa sin errores (`npm run lint` / `flutter analyze`)
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
- [ ] Componentes documentados con ejemplos (Flutter)

### Performance

- [ ] Sin queries N+1 (Backend)
- [ ] Índices agregados en columnas de búsqueda (Database)
- [ ] `const` widgets donde sea posible (Flutter)
- [ ] Sin rebuilds innecesarios (Flutter)

### Accesibilidad

- [ ] Touch targets mínimo 48x48dp (Flutter)
- [ ] Contraste mínimo 4.5:1 (Flutter)
- [ ] Semantics labels agregados (Flutter)
- [ ] Probado con TalkBack/VoiceOver (si aplica)

### Flutter Específico

- [ ] Usa theme system (`theme.componentColors`, `AppConstants.spacing*`)
- [ ] NO hardcodea colores (`Colors.blue` ❌ → `theme.colorScheme.primary` ✅)
- [ ] NO hardcodea spacing (`16` ❌ → `AppConstants.spacingM` ✅)
- [ ] Widgets reutilizables en `lib/core/widgets/`
- [ ] Soporta ambos visual styles (Aurora y Monolight)

### Backend Específico

- [ ] Migraciones tienen `up()` y `down()` reversibles
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

# Flutter
flutter test          # Resultado: ✅ X tests passed
flutter analyze       # Resultado: ✅ No issues found
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
- [ ] Validar diseño de componente `NombreWidget`
- [ ] Confirmar approach de `funcionalidad X`

---

## 🚀 Deploy Notes

<!-- Si aplica, instrucciones especiales para deploy -->

- [ ] Requiere correr migraciones (`npm run migration:run`)
- [ ] Requiere nuevas variables de entorno (ver `.env.example`)
- [ ] Requiere actualizar dependencias (`npm install` / `flutter pub get`)
- [ ] Requiere restart de servicios (Redis, PostgreSQL)

---

**Checklist Summary**: ☑️ X/Y completado

<!-- GitHub Actions ejecutará validaciones automáticas -->
