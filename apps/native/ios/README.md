# Ordo Todo — iOS nativo (ODD 052)

App SwiftUI, iOS 26+, Xcode 26+ SDK. Mismo backend NestJS `/api/v1` que Android.
Diseño 100% HIG + Liquid Glass: componentes del sistema, nada de piel M3.

## Abrir y compilar

```sh
open apps/native/ios/OrdoTodo.xcodeproj
```

Compilación de verificación (sin firma):

```sh
xcodebuild -project apps/native/ios/OrdoTodo.xcodeproj \
  -scheme OrdoTodo -sdk iphonesimulator \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro Max' \
  CODE_SIGNING_ALLOWED=NO build
```

## Estructura

- `OrdoTodo/OrdoTodoApp.swift` — punto de entrada, `SessionStore` en environment.
- `OrdoTodo/ContentView.swift` — `TabView` (Hoy·Tareas·Hábitos·Ajustes + Search),
  `.tabBarMinimizeBehavior(.onScrollDown)`, `.searchable` global.
- `OrdoTodo/Features/TodayView.swift` — Hoy real (secciones, anillo, swipe actions).
- `OrdoTodo/Features/DayModels.swift` — payloads `/tasks/today`, secciones, DayCapacity (lógica pura, verificable con `swiftc`).
- `OrdoTodo/Features/` — Hoy, Tareas + búsqueda, Hábitos, Foco, Captura (parser trilingüe ES/EN/PT), Detalle, Ritual mañana/noche, Search global, Ajustes completos, Auth por email.
- Lógica pura verificable con `swiftc`: `DayModels`, `TasksModels`, `HabitsModels`, `FocusModels`, `CaptureModels`, `RitualModels` (harnesses en `/tmp/*test`, 57 casos).
- `OrdoTodo/Core/` — `ApiClient` (Bearer + refresh serializado), `SessionStore` (Keychain), `AppSettings` (`UserDefaults`), `Outbox` (cola offline), `Notifications` (hábitos + planning, 100 % locales), `OrdoTheme` (marca).
- `OrdoWidget/` — extensión WidgetKit: widget de Hoy + Live Activity del foco (`OrdoWidget.appex` embebido; App Group `group.dev.creapolis.ordotodo` pendiente de aprovisionar para datos en vivo en dispositivo).
