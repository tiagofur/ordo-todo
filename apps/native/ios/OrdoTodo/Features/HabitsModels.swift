import Foundation

/// Modelos de hábitos (ODD 052): espejo de `HabitsRepository`,
/// `Stations.kt` (`last7Stations`), `HabitsScreen.groupHabitsByMoment` y
/// `HabitEdit.kt` de Android. Sin SwiftUI (verificable con `swiftc`).

// MARK: - Payloads (`GET /habits/today`, `GET /habits/:id`)

struct HabitCompletion: Codable, Equatable {
    var completedAt: String?
    var completedDate: String?
    /// Día ISO (`yyyy-MM-dd`) en ambas formas del payload.
    var day: String?

    init(day: String? = nil, completedAt: String? = nil,
         completedDate: String? = nil) {
        if let day { self.day = day }
        else { self.day = (completedDate ?? completedAt).map { String($0.prefix(10)) } }
        self.completedAt = completedAt
        self.completedDate = completedDate
    }
}

struct HabitToday: Codable, Equatable, Identifiable {
    var id: String
    var name: String
    var description: String?
    var icon: String?
    var color: String?
    var timeOfDay: String?
    var preferredTime: String?
    var targetCount: Int = 1
    var currentStreak: Int = 0
    var completions: [HabitCompletion] = []

    var doneToday: Bool { !completions.isEmpty }
    /// Fracción de hoy para cuantitativos (`targetCount > 1`).
    var todayFraction: Double {
        guard targetCount > 1 else { return doneToday ? 1 : 0 }
        return min(1, Double(completions.count) / Double(targetCount))
    }
}

struct HabitsTodayResponse: Codable {
    var habits: [HabitToday] = []
}

/// El backend a veces solo manda `grouped`: se aplana como lista.
struct HabitsGroupedResponse: Codable {
    var grouped: [String: [HabitToday]] = [:]

    func flattened() -> [HabitToday] {
        ["MORNING", "AFTERNOON", "EVENING", "ANYTIME"].flatMap {
            grouped[$0] ?? []
        }
    }
}

// MARK: - Agrupación por momento

/// Hábitos por momento del día; lo desconocido va al final.
func groupHabitsByMoment(
    _ habits: [HabitToday]
) -> [(String?, [HabitToday])] {
    let order: [String?] = ["MORNING", "AFTERNOON", "EVENING", nil]
    var buckets: [String?: [HabitToday]] = [:]
    for habit in habits {
        let key: String? = switch habit.timeOfDay {
        case "MORNING", "AFTERNOON", "EVENING": habit.timeOfDay
        default: nil
        }
        buckets[key, default: []].append(habit)
    }
    return order.compactMap { key in
        guard let list = buckets[key], !list.isEmpty else { return nil }
        return (key, list)
    }
}

/// Título de sección por momento (claves del catálogo trilingüe).
func momentTitle(_ moment: String?) -> String {
    switch moment {
    case "MORNING": return NSLocalizedString("Mañana", comment: "")
    case "AFTERNOON": return NSLocalizedString("Tarde", comment: "")
    case "EVENING": return NSLocalizedString("Noche", comment: "")
    default: return NSLocalizedString("Cuando sea", comment: "")
    }
}

// MARK: - Línea de estaciones (racha 7 días)

private let isoDay: DateFormatter = {
    let formatter = DateFormatter()
    formatter.dateFormat = "yyyy-MM-dd"
    formatter.timeZone = TimeZone(secondsFromGMT: 0)
    formatter.locale = Locale(identifier: "en_US_POSIX")
    return formatter
}()

/// Últimos 7 días (viejo a la izquierda, hoy a la derecha):
/// llena = cumplido, hueca = fallado. Compara días calendario (cadenas
/// ISO, como `LocalDate` en Android), nunca instantes: las zonas
/// horarias no mueven un día. El futuro se ignora.
func last7Stations(dates: [String], today: Date) -> [Bool] {
    let calendar = Calendar(identifier: .gregorian)
    let todayKey = isoDay.string(from: today)
    let done: Set<String> = Set(dates.map { String($0.prefix(10)) }
        .filter { $0 <= todayKey })
    return (0...6).reversed().map { back in
        guard let date = calendar.date(byAdding: .day, value: -back, to: today),
              isoDay.string(from: date) <= todayKey
        else { return false }
        return done.contains(isoDay.string(from: date))
    }
}

// MARK: - Formulario (crear/editar)

/// `HH:mm` en 24 h; vacío = ausente.
func parseHabitTime(_ text: String) -> String? {
    let trimmed = text.trimmingCharacters(in: .whitespaces)
    guard !trimmed.isEmpty else { return nil }
    let pattern = #"^([01]\d|2[0-3]):[0-5]\d$"#
    return trimmed.range(of: pattern, options: .regularExpression) != nil
        ? trimmed : nil
}

/// Veces por día (`targetCount`, 1...10). Vacío = ausente.
func parseHabitCount(_ text: String) -> Int? {
    let trimmed = text.trimmingCharacters(in: .whitespaces)
    guard !trimmed.isEmpty else { return nil }
    guard let count = Int(trimmed), (1...10).contains(count) else { return nil }
    return count
}

/// Cuerpo de creación (espejo de `CreateHabitDto`): lo ausente se omite,
/// nunca se envía como nulo. Nulo si el título está vacío o algo es inválido.
struct HabitCreate: Equatable {
    var name: String
    var timeOfDay: String?
    var preferredTime: String?
    var targetCount: Int?

    func jsonData() throws -> Data {
        var dict: [String: Any] = ["name": name]
        if let timeOfDay { dict["timeOfDay"] = timeOfDay }
        if let preferredTime { dict["preferredTime"] = preferredTime }
        if let targetCount { dict["targetCount"] = targetCount }
        return try JSONSerialization.data(withJSONObject: dict)
    }
}

func buildHabitCreate(
    title: String, timeOfDay: String?, timeText: String, countText: String
) -> HabitCreate? {
    let name = title.trimmingCharacters(in: .whitespaces)
    guard !name.isEmpty else { return nil }
    if !timeText.trimmingCharacters(in: .whitespaces).isEmpty,
       parseHabitTime(timeText) == nil { return nil }
    if !countText.trimmingCharacters(in: .whitespaces).isEmpty,
       parseHabitCount(countText) == nil { return nil }
    return HabitCreate(name: name, timeOfDay: timeOfDay,
                       preferredTime: parseHabitTime(timeText),
                       targetCount: parseHabitCount(countText))
}
