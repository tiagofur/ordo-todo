import Foundation

/// Elige el mejor texto de adjuntos ya cargados (ODD 052 T8).
/// Pura y testeable sin UIKit: el `ShareViewController` solo la alimenta.
enum ShareExtractor {
    static let plainTextUTI = "public.plain-text"
    static let textUTI = "public.text"
    static let urlUTI = "public.url"

    /// Prioriza texto plano sobre URLs; ignora vacíos.
    static func bestText(
        _ candidates: [(uti: String, value: String)]
    ) -> String? {
        let blanks = CharacterSet.whitespacesAndNewlines
        let texts = candidates
            .filter { $0.uti == plainTextUTI || $0.uti == textUTI }
            .map { $0.value.trimmingCharacters(in: blanks) }
            .filter { !$0.isEmpty }
        if let first = texts.first {
            return first
        }
        return candidates.map { $0.value.trimmingCharacters(in: blanks) }
            .first(where: { !$0.isEmpty })
    }
}
