# Ordo Todo · Android — documento de diseño

> **Material 3 Expressive.** Esta app habla Material 3 del sistema, incluida su
> evolución Expressive. A noviembre de 2026 la versión estable es **material3
> 1.4.0** (la que resuelve el BOM de Compose 2026.09.00 de este proyecto); la
> línea Expressive va en **1.5.0-rc01**. Expressive es parte de Material 3 —
> **no existe Material 4**. Todo lo que contradiga M3 en este documento o en
> el código se corrige en ambos lados para no dejar confusiones futuras.

## Autoridad

- Brief vigente: `odd/tasks/050-native-mobile-apps.md` (brief de diseño) y
  `odd/tasks/051-android-daily.md` (construcción por fases). El boceto
  `apps/native/design/lista-del-dia.html` es copia versionada histórica: fija
  composición y densidad, pero donde su dibujo contradiga M3, manda M3.
- Mundo visual heredado: `apps/web/DESIGN.md` («El cockpit sereno») traducido
  a roles de color M3; la marca vive en color, firmas y contenido.

## Traducción del boceto a Material 3

| Boceto | Android (M3) |
|---|---|
| Título «Hoy» + fecha | `MediumTopAppBar` colapsable; fecha larga localizada |
| Anillo de avance | `DayRing` violeta primario como acción del app bar |
| Botón «+» | `ExtendedFloatingActionButton` tonal (colores M3 por defecto) |
| Secciones | `LazyColumn` con contenedores tonales por momento |
| Checkbox de tarea | `Checkbox` M3 (cuadrado redondeado); el círculo dibujado a mano vive solo en iOS |
| Hábito | Estación/anillo esmeralda + línea de racha en Canvas (firma compartida) |
| Bloque de foco | Fila con barra azul a la izquierda en contenedor tonal |
| Mini-reproductor | Barra sobre la `NavigationBar` en rol `inverseSurface` |
| Pestañas | `NavigationBar` (rail en pantallas expandidas) |

## Reglas que ya mordieron

- Trilingüe ES/EN/PT sin textos en duro: todo sale de `packages/i18n` vía
  `native-codegen` a `strings.xml`.
- `Checkbox` M3 con su target táctil y semántica del sistema; nada de
  controles dibujados donde el sistema ya da uno.
- Formularios como listas M3 fluidas, sin tarjetas anidadas.
- TalkBack de primera clase: toda acción de gesto existe como acción de
  accesibilidad.
