import Foundation

/// Ritual diario (ODD 052): `GET /ritual/streak|morning|evening`,
/// `POST /ritual/morning/complete {top3} |skip|timebox/accept`,
/// `POST /ritual/evening/complete {moves} |skip`.
@Observable
@MainActor
final class RitualViewModel {
    private let client: ApiClient

    var streak = RitualStreak()
    var morning = RitualMorningView()
    var evening = RitualEveningView()
    var isLoading = false
    var errorMessage: String?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var phase: RitualPhase {
        let hour = Calendar.current.component(.hour, from: Date())
        return activeRitualPhase(
            morning: morning.ritual?.morningStatus ?? "PENDING",
            evening: evening.ritual?.eveningStatus ?? "PENDING",
            hour: hour)
    }

    @MainActor
    func load() async {
        isLoading = true
        defer { isLoading = false }
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        do {
            let data = try await client.getData("/ritual/streak")
            if !data.isEmpty {
                streak = (try? decoder.decode(RitualStreak.self,
                                              from: data)) ?? RitualStreak()
            }
        } catch { /* la racha es accesoria */ }
        do {
            let data = try await client.getData("/ritual/morning")
            morning = try decoder.decode(RitualMorningView.self, from: data)
        } catch {
            if morning.ritual == nil { errorMessage = "Sin ritual de mañana" }
        }
        do {
            let data = try await client.getData("/ritual/evening")
            evening = try decoder.decode(RitualEveningView.self, from: data)
        } catch { /* la noche puede esperar */ }
    }

    @MainActor
    func completeMorning(top3: [String]) async -> Bool {
        do {
            let body = try JSONEncoder().encode(["top3": top3])
            _ = try await client.post("/ritual/morning/complete", body: body)
            await load()
            return true
        } catch {
            errorMessage = "No se pudo cerrar la mañana"
            return false
        }
    }

    @MainActor
    func skipMorning() async {
        try? await client.post("/ritual/morning/skip", body: Data())
        await load()
    }

    @MainActor
    func acceptTimebox() async {
        try? await client.post("/ritual/morning/timebox/accept", body: Data())
        await load()
    }

    @MainActor
    func completeEvening(moves: [RitualEveningMove]) async -> Bool {
        struct Move: Encodable {
            var taskId: String
            var destination: String
            var date: String?
            var reason: String
        }
        do {
            let body = try JSONEncoder().encode([
                "moves": moves.map {
                    Move(taskId: $0.taskId, destination: $0.destination,
                         date: $0.date, reason: $0.reason)
                }
            ])
            _ = try await client.post("/ritual/evening/complete", body: body)
            await load()
            return true
        } catch {
            errorMessage = "No se pudo cerrar la noche"
            return false
        }
    }

    @MainActor
    func skipEvening() async {
        try? await client.post("/ritual/evening/skip", body: Data())
        await load()
    }
}
