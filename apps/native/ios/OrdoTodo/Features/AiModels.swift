import Foundation

/// IA como mejora progresiva (ODD 052): espejo de `AiRepository.kt`.
/// `POST /ai/parse-task` refina la captura; `POST /ai/decompose-task`
/// propone subtítulos. Fallos = nulo/vacío, nunca un crash.

struct AiParsedTask: Equatable {
    var title: String
    var dueDate: String?
    var priority: String?
}

private struct AiParseResponse: Decodable {
    var title: String = ""
    var dueDate: String?
    var priority: String?
}

private struct DecomposeSuggestion: Decodable {
    var title: String = ""
}

private struct DecomposeResponse: Decodable {
    var subtasks: [DecomposeSuggestion] = []
}

/// Parse usable, o nulo cuando no hay título que guardar.
func parseAiTask(_ raw: String) -> AiParsedTask? {
    guard let data = raw.data(using: .utf8),
          let parsed = try? JSONDecoder().decode(AiParseResponse.self,
                                                 from: data)
    else { return nil }
    let title = parsed.title.trimmingCharacters(in: .whitespaces)
    guard !title.isEmpty else { return nil }
    let priority = (parsed.priority ?? "").trimmingCharacters(
        in: .whitespaces)
    return AiParsedTask(title: title,
                        dueDate: parsed.dueDate.map { String($0.prefix(10)) },
                        priority: priority.isEmpty ? nil : priority)
}

private func priorityToken(_ priority: String) -> String {
    switch priority {
    case "URGENT": return "p1"
    case "HIGH": return "p2"
    case "LOW": return "p4"
    default: return ""
    }
}

/// Reconstruye el texto de captura con fechas ISO y p-tokens para que el
/// parser local (y la cola offline) lo reinterprete limpio. MEDIUM no
/// añade token: ya es el defecto.
func renderEnhancedText(_ ai: AiParsedTask) -> String {
    var parts = [ai.title]
    if let due = ai.dueDate, !due.isEmpty { parts.append(due) }
    if let priority = ai.priority, priority != "MEDIUM" {
        let token = priorityToken(priority)
        if !token.isEmpty { parts.append(token) }
    }
    return parts.joined(separator: " ")
}

/// Títulos de subtareas sugeridos; blancos y basura = sin sugerencias.
func parseDecomposeSuggestions(_ raw: String) -> [String] {
    guard let data = raw.data(using: .utf8),
          let response = try? JSONDecoder().decode(DecomposeResponse.self,
                                                   from: data)
    else { return [] }
    return response.subtasks
        .map { $0.title.trimmingCharacters(in: .whitespaces) }
        .filter { !$0.isEmpty }
}
