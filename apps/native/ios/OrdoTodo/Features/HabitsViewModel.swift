import Foundation

/// Hábitos (ODD 052): espejo de `HabitsRepository` + `HoyViewModel` (check-in)
/// + `HabitEdit` (crear/editar) de Android.
/// `POST /habits/:id/complete`, `DELETE /habits/:id/complete`,
/// `POST /habits`, `PATCH /habits/:id` (diff), `DELETE /habits/:id`,
/// `GET /habits/:id` (rachas). Sin cola offline (llega en T5).
@Observable
final class HabitsViewModel {
    private let client: ApiClient
    private let session: SessionStore

    var habits: [HabitToday] = []
    var isLoading = false
    var errorMessage: String?
    private(set) var isStale = false

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.session = session
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var grouped: [(String?, [HabitToday])] {
        groupHabitsByMoment(habits)
    }

    @MainActor
    func load() async {
        isLoading = habits.isEmpty
        errorMessage = nil
        defer { isLoading = false }
        await drain()
        if session.accessToken == nil { return }
        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/habits/today")
            let response = try decoder.decode(
                HabitsTodayResponse.self, from: data)
            if response.habits.isEmpty {
                let grouped = try decoder.decode(
                    HabitsGroupedResponse.self, from: data)
                habits = grouped.flattened()
            } else {
                habits = response.habits
            }
            isStale = false
            DayCache.shared.save(habits: habits)
        } catch {
            if habits.isEmpty {
                let cached = DayCache.shared.load()
                if !cached.habits.isEmpty {
                    habits = cached.habits
                    isStale = true
                    errorMessage = "Sin conexión: mostrando copia guardada"
                } else {
                    errorMessage = "No se pudieron cargar los hábitos"
                }
            }
        }
    }

    @MainActor
    func drain() async {
        switch await Outbox.shared.drain(client: client) {
        case .unauthorized:
            session.clear()
        case .network:
            if !Outbox.shared.pending.isEmpty {
                errorMessage = "Sin conexión: hay cambios pendientes"
            }
        case nil:
            break
        }
    }

    /// Check-in del día (la estación de hoy ES el control) + cola offline.
    @MainActor
    func toggle(_ habit: HabitToday) {
        let done = !habit.doneToday
        applyLocal(id: habit.id, done: done)
        Outbox.shared.enqueue(.habitCheck(id: habit.id, done: done,
                                           at: Date().timeIntervalSince1970))
        Task { @MainActor in await self.drain() }
    }

    @MainActor
    func create(_ draft: HabitCreate) async -> Bool {
        do {
            _ = try await client.post("/habits", body: draft.jsonData())
            await load()
            return true
        } catch {
            errorMessage = "No se pudo crear el hábito"
            return false
        }
    }

    @MainActor
    func update(_ habit: HabitToday, name: String, timeOfDay: String?,
                timeText: String, countText: String) async -> Bool {
        guard let patch = habitPatch(habit, name: name, timeOfDay: timeOfDay,
                                     timeText: timeText, countText: countText)
        else {
            errorMessage = "Revisa la hora (HH:mm) y las veces (1–10)"
            return false
        }
        if patch.isEmpty { return true }
        do {
            let body = try JSONSerialization.data(withJSONObject: patch)
            try await client.patch("/habits/\(habit.id)", body: body)
            await load()
            return true
        } catch {
            errorMessage = "No se pudo guardar el hábito"
            return false
        }
    }

    @MainActor
    func remove(_ habit: HabitToday) async -> Bool {
        habits.removeAll { $0.id == habit.id }
        do {
            try await client.delete("/habits/\(habit.id)")
            return true
        } catch {
            await load()
            errorMessage = "Sin conexión: no se eliminó"
            return false
        }
    }

    /// Detalle con últimas 30 completions para la línea de estaciones.
    func detail(_ habit: HabitToday) async -> HabitToday {
        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/habits/\(habit.id)")
            return try decoder.decode(HabitToday.self, from: data)
        } catch {
            return habit
        }
    }

    @MainActor
    private func applyLocal(id: String, done: Bool) {
        habits = habits.map {
            guard $0.id == id else { return $0 }
            var copy = $0
            copy.completions = done ? [HabitCompletion(day: "today")] : []
            return copy
        }
    }
}

/// Diff parcial de edición (espejo de `buildHabitPatch`): nulo si algo
/// presente es inválido; vacío cuando nada cambió.
func habitPatch(
    _ original: HabitToday, name: String, timeOfDay: String?,
    timeText: String, countText: String
) -> [String: Any]? {
    let timeBlank = timeText.trimmingCharacters(in: .whitespaces).isEmpty
    let countBlank = countText.trimmingCharacters(in: .whitespaces).isEmpty
    if !timeBlank, parseHabitTime(timeText) == nil { return nil }
    if !countBlank, parseHabitCount(countText) == nil { return nil }
    let time = timeBlank ? original.preferredTime : parseHabitTime(timeText)
    let count = countBlank ? original.targetCount : parseHabitCount(countText)
    var patch: [String: Any] = [:]
    let trimmed = name.trimmingCharacters(in: .whitespaces)
    if !trimmed.isEmpty, trimmed != original.name { patch["name"] = trimmed }
    if timeOfDay != original.timeOfDay, let timeOfDay { patch["timeOfDay"] = timeOfDay }
    if time != original.preferredTime, let time { patch["preferredTime"] = time }
    if count != original.targetCount, let count { patch["targetCount"] = count }
    return patch
}
