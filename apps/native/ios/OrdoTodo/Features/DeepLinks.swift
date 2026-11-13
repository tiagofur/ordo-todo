import Foundation
import Observation

/// Pestañas seleccionables por enlace (la `Tab(role: .search)` del sistema
/// no es programable, igual que en T6).
enum OrdoTab: Hashable {
    case hoy
    case tareas
    case habitos
    case ajustes
    case buscar
}

/// Consume `SharedInbox` y `ordo://…` y los convierte en navegación
/// (ODD 052 T8). Vive en el entorno desde `OrdoTodoApp`.
@Observable
final class DeepLinkRouter {
    var selectedTab = OrdoTab.hoy
    var showCapture = false
    var captureText: String?
    var showFocus = false

    /// Esquema `ordo://captura|hoy|tareas|habitos|foco`.
    func open(url: URL) {
        guard url.scheme == "ordo" else { return }
        switch url.host {
        case "captura":
            captureText = nil
            showCapture = true
        case "hoy":
            selectedTab = .hoy
        case "tareas":
            selectedTab = .tareas
        case "habitos":
            selectedTab = .habitos
        case "foco":
            selectedTab = .hoy
            showFocus = true
        default:
            break
        }
    }

    /// Llamar en `scenePhase == .active`: trae lo que dejaron la Share
    /// extension o los intents y limpia el buzón.
    func consumeSharedInbox() {
        let pending = SharedInbox.take()
        if let destination = pending.destination {
            switch destination {
            case .captura:
                captureText = pending.text
                showCapture = true
            case .hoy:
                selectedTab = .hoy
            case .tareas:
                selectedTab = .tareas
            case .habitos:
                selectedTab = .habitos
            case .foco:
                selectedTab = .hoy
                showFocus = true
            }
        } else if let text = pending.text {
            captureText = text
            showCapture = true
        }
    }
}
