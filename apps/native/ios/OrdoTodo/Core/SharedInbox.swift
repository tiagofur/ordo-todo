import Foundation

/// Buzón compartido vía App Group (ODD 052 T8).
/// Productores: Share extension (`OrdoShare`) y App Intents.
/// Consumidor: la app, al activarse (`DeepLinkRouter.consumeSharedInbox()`).
/// Solo texto y destino: el token de sesión nunca sale del Keychain de la app.
enum SharedInbox {
    static let suiteID = "group.dev.creapolis.ordotodo"

    private static var defaults: UserDefaults {
        UserDefaults(suiteName: suiteID) ?? .standard
    }

    private enum Key {
        static let shareText = "pendingShareText"
        static let shareDate = "pendingShareDate"
        static let destination = "pendingDestination"
    }

    enum Destination: String {
        case captura
        case hoy
        case tareas
        case habitos
        case foco
    }

    /// Guarda texto compartido (Share extension, intent de captura).
    static func saveShare(text: String) {
        let clean = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !clean.isEmpty else { return }
        defaults.set(clean, forKey: Key.shareText)
        defaults.set(Date().timeIntervalSince1970, forKey: Key.shareDate)
    }

    /// Pide abrir la app en un destino (atajos, control).
    static func requestDestination(_ destination: Destination) {
        defaults.set(destination.rawValue, forKey: Key.destination)
    }

    /// Consume y limpia todo lo pendiente. Llamar al activarse la app.
    static func take() -> (text: String?, destination: Destination?) {
        let text = defaults.string(forKey: Key.shareText)
        let destination = defaults.string(forKey: Key.destination)
            .flatMap(Destination.init(rawValue:))
        defaults.removeObject(forKey: Key.shareText)
        defaults.removeObject(forKey: Key.shareDate)
        defaults.removeObject(forKey: Key.destination)
        return (text, destination)
    }

    /// Solo para tests.
    static func clear() {
        defaults.removeObject(forKey: Key.shareText)
        defaults.removeObject(forKey: Key.shareDate)
        defaults.removeObject(forKey: Key.destination)
    }
}
