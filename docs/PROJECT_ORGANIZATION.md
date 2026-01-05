# Proyecto Ordo-Todo: Organización de Archivos

Este documento establece las reglas para mantener la estructura y organización del proyecto Ordo-Todo. Siguiendo estas guías, garantizamos un entorno de desarrollo limpio y profesional.

## 📁 Reglas de Organización

### 1. Raíz del Proyecto (/)
La raíz debe mantenerse lo más limpia posible. Solo deben existir:
- Archivos de configuración de herramientas (`package.json`, `tsconfig.json`, `turbo.json`, `.gitignore`, etc.).
- `README.md` (Punto de entrada para humanos).
- `CLAUDE.md` (Punto de entrada para agentes IA).
- Directorios principales (`apps`, `packages`, `docs`, `scripts`).

### 2. Documentación (`/docs`)
Toda la documentación técnica y de diseño debe residir en `/docs`.
- **Nuevo/Planificación**: Crear en `/docs` o subcarpetas relevantes.
- **Backend/Frontend/Mobile/Desktop**: Carpetas específicas para guías de cada plataforma.
- **Histórico/Finalizado**: Mover a `/docs/archive/` una vez completado el ciclo de vida de la tarea.
- **Guías de IA**: `/docs/claude-guide/`.

### 3. Scripts (`/scripts`)
Cualquier script de utilidad (JS, TS, Shell, PowerShell, Batch) debe ir en `/scripts`.
- **I18N**: `/scripts/i18n/` para scripts de traducción.
- **Auditoría**: `/scripts/audit/` para validaciones y auditorías.
- **Utilidades**: `/scripts/utils/` para herramientas generales de desarrollo.

### 4. Archivos Temporales y Logs
**NUNCA** deben persistir en la raíz ni comprometerse al repositorio:
- `.log`, `.txt` generados por ejecuciones.
- JSONs de auditoría temporal.
- Backups de `package-lock.json`.
*Nota: Estos deben estar incluidos en el `.gitignore`.*

---

## 🚀 Cómo proceder al crear nuevos archivos

1. **¿Es una guía o plan?** -> `/docs`.
2. **¿Es un script de automatización?** -> `/scripts`.
3. **¿Es una configuración general?** -> Solo entonces va en la raíz.
4. **¿Es basura/temporal?** -> Eliminar después de usar o asegurar que esté en `.gitignore`.
