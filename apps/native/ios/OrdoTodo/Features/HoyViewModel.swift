import Foundation

/// Configuración compartida: mismo backend NestJS que Android (`/api/v1`).
enum OrdoConfig {
    static let baseURL = URL(string: "https://api.ordotodo.app/api/v1")!
}

/// Estado de Hoy (ODD 052 T2): espejo de `HoyViewModel`/`HoyUiState` de Android.
/// Carga `GET /tasks/today`, agrupa en secciones y alterna completar/reabrir
/// con cola offline (`Outbox`): 4xx descarta, red espera y reintenta.
@Observable
final class HoyViewModel {
    private let client: ApiClient
    private let session: SessionStore
    private let settings: AppSettings

    private(set) var response: TodayResponse?
    private(set) var isLoading = false
    private(set) var errorMessage: String?
    private(set) var isStale = false

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL,
         settings: AppSettings = .shared) {
        self.session = session
        self.settings = settings
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var sections: [DaySection] {
        guard let response else { return [] }
        return sectionToday(response)
    }

    var allTasks: [TodayTask] {
        guard let response else { return [] }
        return response.overdue + response.dueToday
            + response.scheduledToday + response.available
    }

    var doneCount: Int { allTasks.filter(\.isDone).count }
    var capacity: DayCapacity {
        calculateDayCapacity(allTasks,
                             availableMinutes: settings.availableMinutes)
    }

    var progressText: String {
        let total = allTasks.count
        guard total > 0 else { return NSLocalizedString("Día despejado",
                                                        comment: "") }
        return L("%d de %d · %@ de foco", doneCount, total,
                 formatMinutes(capacity.estimatedMinutes))
    }

    @MainActor
    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        // La cola manda primero: los cambios offline suben al abrir.
        await drain()
        if session.accessToken == nil { return }
        do {
            let fresh: TodayResponse = try await client.get("/tasks/today")
            response = fresh
            isStale = false
            DayCache.shared.save(today: fresh)
        } catch {
            if response == nil {
                let cached = DayCache.shared.load()
                if let today = cached.today {
                    response = today
                    isStale = true
                    errorMessage = "Sin conexión: mostrando copia guardada"
                } else {
                    errorMessage = "No se pudo cargar el día"
                }
            }
        }
    }

    /// Drena la cola; 401 cierra sesión, red deja pendiente y avisa.
    @MainActor
    func drain() async {
        switch await Outbox.shared.drain(client: client) {
        case .unauthorized:
            session.clear()
        case .network:
            if !(Outbox.shared.pending.isEmpty) {
                errorMessage = "Sin conexión: hay cambios pendientes"
            }
        case nil:
            break
        }
    }

    /// Alterna completar/reabrir: optimista + cola (4xx descarta, red espera).
    @MainActor
    func toggle(_ task: TodayTask) {
        let targetDone = !task.isDone
        applyLocal(id: task.id, done: targetDone)
        Outbox.shared.enqueue(.statusFlip(taskId: task.id, done: targetDone,
                                           at: Date().timeIntervalSince1970))
        Task { @MainActor in await self.drain() }
    }

    /// Elimina con reversión si la red falla (deshacer con re-tap llega en T3).
    @MainActor
    func remove(_ task: TodayTask) {
        removeLocal(id: task.id)
        Task { @MainActor in
            do {
                try await self.client.delete("/tasks/\(task.id)")
            } catch {
                await self.load()
                self.errorMessage = "Sin conexión: no se eliminó"
            }
        }
    }

    // MARK: - Local

    @MainActor
    private func applyLocal(id: String, done: Bool) {
        guard var response else { return }
        func flip(_ tasks: [TodayTask]) -> [TodayTask] {
            tasks.map { $0.id == id
                ? TodayTask(id: $0.id, title: $0.title,
                            status: done ? "COMPLETED" : "TODO",
                            priority: $0.priority, dueDate: $0.dueDate,
                            doDate: $0.doDate, scheduledDate: $0.scheduledDate,
                            scheduledTime: $0.scheduledTime,
                            estimatedMinutes: $0.estimatedMinutes,
                            project: $0.project, subTasks: $0.subTasks)
                : $0 }
        }
        response = TodayResponse(
            overdue: flip(response.overdue), dueToday: flip(response.dueToday),
            scheduledToday: flip(response.scheduledToday),
            available: flip(response.available),
            notYetAvailable: response.notYetAvailable)
        self.response = response
    }

    @MainActor
    private func removeLocal(id: String) {
        guard let response else { return }
        func drop(_ tasks: [TodayTask]) -> [TodayTask] {
            tasks.filter { $0.id != id }
        }
        self.response = TodayResponse(
            overdue: drop(response.overdue), dueToday: drop(response.dueToday),
            scheduledToday: drop(response.scheduledToday),
            available: drop(response.available),
            notYetAvailable: response.notYetAvailable)
    }
}
