# 📚 Ordo-Todo Documentation

## 🌐 Documentación HTML Interactiva

Esta carpeta contiene la documentación técnica completa de Ordo-Todo en formato HTML, diseñada para ser fácil de navegar y visualmente atractiva.

### 📖 Cómo Usar

1. **Abrir en el Navegador:**
   - Simplemente abre `index.html` en tu navegador favorito
   - O usa un servidor local: `npx serve documentation`

2. **Navegar:**
   - Usa el menú de navegación superior para moverte entre secciones
   - Cada sección tiene tabs para organizar el contenido
   - Los ejemplos de código son interactivos y fáciles de copiar

### 📁 Estructura

```
documentation/
├── index.html              # Página principal
├── styles.css              # Estilos compartidos
├── core/
│   └── index.html         # Documentación del Core Package
├── web/
│   └── index.html         # Documentación de la Web App
├── mobile/
│   └── index.html         # Documentación de la Mobile App
├── desktop/
│   └── index.html         # Documentación de la Desktop App
├── backend/
│   └── index.html         # Documentación del Backend (próximamente)
└── database/
    └── index.html         # Documentación de la Base de Datos (próximamente)
```

### 🎨 Características

- ✅ **Dark Theme** - Diseño moderno con tema oscuro
- ✅ **Responsive** - Se adapta a cualquier tamaño de pantalla
- ✅ **Ejemplos de Código** - Snippets listos para copiar y usar
- ✅ **Navegación Intuitiva** - Fácil de encontrar lo que necesitas
- ✅ **Tabs Interactivos** - Organización clara del contenido

### 📦 Contenido

#### Core Package (`core/index.html`)
- Constantes compartidas (colores, prioridades, estados, límites)
- Utilidades (fechas, tiempo, strings, cálculos, colores)
- Validaciones Zod para todas las entidades
- Ejemplos de uso en cada función

#### Web App (`web/index.html`)
- Stack tecnológico completo
- Estructura del proyecto
- Componentes principales
- Custom Hooks
- Uso del Core Package
- Internacionalización
- PWA Features
- Mejores prácticas

#### Mobile App (`mobile/index.html`)
- React Native + Expo setup
- Estructura del proyecto
- Características planificadas
- Uso del Core Package
- Características nativas
- Roadmap de desarrollo

#### Desktop App (`desktop/index.html`)
- Electron setup
- Características nativas del SO
- IPC Communication
- Reutilización de código de Web
- Roadmap de desarrollo

### 🔄 Actualización

Esta documentación se actualiza automáticamente cuando se realizan cambios importantes en el código.

**Última actualización:** Diciembre 2025

### 📝 Contribuir

Para agregar o actualizar documentación:

1. Edita los archivos HTML correspondientes
2. Mantén el estilo consistente con `styles.css`
3. Agrega ejemplos de código cuando sea relevante
4. Actualiza el índice principal si agregas nuevas secciones

### 🆘 Soporte

Si encuentras errores o tienes sugerencias para mejorar la documentación:

1. Abre un issue en GitHub
2. Propón cambios via Pull Request
3. Contacta al equipo de desarrollo

---

**Nota:** Esta documentación complementa los archivos Markdown en `/docs`. 
- **HTML Documentation** → Referencia técnica interactiva
- **Markdown Docs** → Planes de desarrollo y guías de implementación
