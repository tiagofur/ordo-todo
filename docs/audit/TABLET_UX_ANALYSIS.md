# 📱 Análisis de UX para Tablets (Ordo Mobile App)

## 🔍 Estado Actual

Actualmente, la aplicación móvil utiliza un layout **puramente vertical** diseñado para teléfonos. Cuando se ejecuta en una tablet (iPad/Android Tablet):

- **Sidebar**: Navegación por tabs en la parte inferior (estándar móvil), lo cual es ineficiente en pantallas grandes.
- **Contenido**: Se estira horizontalmente (`flex: 1`), resultando en:
  - Líneas de texto demasiado largas (dificulta la lectura).
  - Espacio blanco desperdiciado a los lados.
  - Widgets estirados que se ven desproporcionados (e.g., MiniTimer ocupando 800px de ancho).
- **Widgets**: Se apilan uno tras otro, requiriendo mucho scroll vertical innecesario.

## 🚧 Limitaciones Técnicas

- **No podemos usar `packages/ui` directamente**: Los componentes compartidos de Web/Desktop (como `OkrWidget`) están construidos con elementos DOM (`div`, `span`, `html-tags`), por lo que **no son compatibles** con React Native.
- **Solución requerida**: Debemos usar componentes nativos (`View`, `Text`) y componer layouts específicos para tablet usando los mismos datos.

## 💡 Propuesta de Mejora (Tablet Dashboard)

Transformar el Dashboard en un layout **Responsivo Híbrido** usando `useWindowDimensions`.

### Layout Propuesto (Breakpoint: `width >= 768px`)

```
┌──────────────────┬─────────────────┐
│ Header (Saludo)  │ ⚡ Streak Widget│
└──────────────────┴─────────────────┘
┌────────────────────────────────────┐
│ 📊 Stats Grid (4 columnas)         │
│ [Pend] [Comp] [Hoy] [Racha]        │
└────────────────────────────────────┘
┌──────────────────┬─────────────────┐
│ IZQUIERDA (60%)  │ DERECHA (40%)   │
│                  │                 │
│ 📋 Filtros       │ 🕐 Timer Widget │
│                  │    (Expanded)   |
│ 📝 Lista Tareas  │                 │
│    (Grid 2 col?) │ ⭐ Hábitos      │
│                  │    (Lista vert) │
│                  │                 │
│                  │ 📈 Analytics    │
│                  │    (Mini Chart) │
└──────────────────┴─────────────────┘
```

### Cambios Específicos

1.  **Nuevo Hook**: `useIsTablet()`
    - Detecta `width >= 768dp`.

2.  **Adaptación de Widgets**:
    - **Stats**: Pasar de scroll horizontal a Grid estático.
    - **Hábitos**: Pasar de scroll horizontal a lista vertical en columna derecha.
    - **Timer**: Mostrar versión "Medium" (más controles) en columna derecha en lugar de "Mini".

3.  **Navegación**:
    - Idealmente, en Tablet moveríamos la navegación a un **Sidebar Vertical a la izquierda** en lugar de Bottom Tabs. (Esto requiere cambios en `_layout.tsx`).

## 📋 Plan de Acción

1.  Crear `apps/mobile/app/hooks/use-media-query.ts`
2.  Refactorizar `Dashboard` (`index.tsx`) para soportar renderizado condicional.
3.  Crear contenedores: `TabletDashboardLayout` vs `MobileDashboardLayout`.
