import AppIntents
import SwiftUI
import WidgetKit

/// Paridad con el Quick Settings Tile de Android (ODD 052 T8):
/// control del Centro de control que abre la captura rápida.
struct CaptureControl: ControlWidget {
    static let kind = "dev.creapolis.ordotodo.capture"

    var body: some ControlWidgetConfiguration {
        StaticControlConfiguration(kind: Self.kind) {
            ControlWidgetButton(action: CaptureTaskIntent(text: "")) {
                Label("Captura rápida", systemImage: "plus.circle")
            }
        }
        .displayName("Captura rápida")
        .description("Captura una tarea en Ordo")
    }
}
