import ActivityKit
import Foundation

/// Foco en vivo (ODD 052): la app abre/actualiza/cierra la actividad al
/// cambiar de fase; el Widget la dibuja en la Isla Dinámica y la pantalla
/// de bloqueo. Sin botones (llegan con App Intents): informativa.
struct FocusAttributes: ActivityAttributes {
    struct ContentState: Codable & Hashable {
        var remainingSeconds: Int
        var phaseLabel: String
        var taskTitle: String?
    }

    var sessionId: String
}
