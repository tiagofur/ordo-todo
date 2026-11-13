import SwiftUI

/// `L()` = `NSLocalizedString` con formato: las vistas pasan literales
/// (claves del catálogo `Localizable.xcstrings`: ES/EN/PT) y los datos van
/// como argumentos. Sin texto de interfaz fuera del catálogo.
func L(_ key: String, _ args: CVarArg...) -> String {
    String(format: NSLocalizedString(key, comment: ""), arguments: args)
}

/// Marca Ordo en un solo lugar: morado `#AD46FF` solo identidad, violeta
/// semántico como voz de acción (`#7C3AED` claro / `#A78BFA` oscuro).
extension Color {
    static let ordoBrand = Color(red: 173 / 255, green: 70 / 255, blue: 1)
    static let ordoAction = Color(
        light: Color(red: 124 / 255, green: 58 / 255, blue: 237 / 255),
        dark: Color(red: 167 / 255, green: 139 / 255, blue: 250 / 255))
}

private extension Color {
    init(light: Color, dark: Color) {
        self.init(UIColor { traits in
            traits.userInterfaceStyle == .dark
                ? UIColor(dark) : UIColor(light)
        })
    }
}
