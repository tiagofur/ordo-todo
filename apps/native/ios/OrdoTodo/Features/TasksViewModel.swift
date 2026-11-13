import Foundation

/// Pestaña Tareas (ODD 052 T3): espejo de `TasksViewModel` de Android.
/// Una descarga (`GET /tasks`, filtro opcional de proyecto) alimenta
/// secciones, búsqueda local y agrupación; la búsqueda de servidor
/// (`GET /search/quick`, ≥2 caracteres, debounce 400 ms) es silenciosa
/// ante fallos. Toggle optimista con reversión; la cola offline llega en T5.
@Observable
final class TasksViewModel {
    enum Bucket: String, CaseIterable {
        case upcoming, undated, projects

        var title: String {
            switch self {
            case .upcoming: return NSLocalizedString("Próximas", comment: "")
            case .undated: return NSLocalizedString("Sin fecha", comment: "")
            case .projects: return NSLocalizedString("Proyectos", comment: "")
            }
        }
    }

    private let client: ApiClient
    private let session: SessionStore

    var tasks: [TodayTask] = []
    var projects: [TodayProject] = []
    var query = "" {
        didSet {
            if oldValue != query { scheduleServerSearch() }
        }
    }
    var bucket: Bucket = .upcoming
    var projectFilter: TodayProject?
    var serverResults: [QuickResult] = []
    var isLoading = false
    var errorMessage: String?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.session = session
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var sections: [TasksSection] {
        sectionTasks(tasks, query: query, projectFilter: projectFilter?.id)
            .filter { section in
                switch bucket {
                case .upcoming: return section.kind != .undated
                case .undated: return section.kind != .upcoming
                case .projects: return true
                }
            }
    }

    var isSearchingServer: Bool { shouldSearchServer(query) }

    @MainActor
    func load() async {
        isLoading = true
        errorMessage = nil
        defer { isLoading = false }
        await drain()
        if session.accessToken == nil { return }
        do {
            let path = projectFilter.map { "/tasks?projectId=\($0.id)" } ?? "/tasks"
            let data = try await client.getData(path)
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            tasks = try decoder.decode([TodayTask].self, from: data)
        } catch {
            if tasks.isEmpty { errorMessage = "No se pudieron cargar las tareas" }
        }
        do {
            let data = try await client.getData("/projects/all")
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            projects = try decoder.decode([TodayProject].self, from: data)
        } catch {
            // Proyectos en silencio: se conserva la lista anterior.
        }
    }

    @MainActor
    func setQuery(_ value: String) { query = value }

    @MainActor
    func clearProject() { projectFilter = nil }

    /// La búsqueda global entrega un id de proyecto: filtra la pestaña.
    @MainActor
    func filterByProject(id: String) {
        projectFilter = projects.first { $0.id == id }
            ?? TodayProject(id: id, name: id)
        bucket = .projects
        query = ""
        serverResults = []
        Task { await load() }
    }

    /// Un hit de servidor: proyecto → filtro; tarea → localiza por título
    /// (el detalle navegable llega en T5).
    @MainActor
    func openServerResult(_ result: QuickResult) {
        if result.isProject {
            projectFilter = projects.first { $0.id == result.id }
                ?? TodayProject(id: result.id, name: result.title)
            bucket = .projects
            query = ""
            serverResults = []
        } else {
            serverResults = []
            query = result.title
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

    @MainActor
    func toggle(_ task: TodayTask) {
        let done = !task.isDone
        applyLocal(id: task.id, done: done)
        Outbox.shared.enqueue(.statusFlip(taskId: task.id, done: done,
                                           at: Date().timeIntervalSince1970))
        Task { @MainActor in await self.drain() }
    }

    @MainActor
    func remove(_ task: TodayTask) {
        tasks.removeAll { $0.id == task.id }
        Task { @MainActor in
            do {
                try await self.client.delete("/tasks/\(task.id)")
            } catch {
                await self.load()
                self.errorMessage = "Sin conexión: no se eliminó"
            }
        }
    }

    // MARK: - Búsqueda de servidor con debounce

    private var searchTask: Task<Void, Never>?

    private func scheduleServerSearch() {
        searchTask?.cancel()
        guard shouldSearchServer(query) else {
            serverResults = []
            return
        }
        let needle = query
        searchTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled, self.query == needle else { return }
            do {
                let encoded = needle.addingPercentEncoding(
                    withAllowedCharacters: .urlQueryAllowed) ?? needle
                let raw = String(data: try await self.client.getData(
                    "/search/quick?q=\(encoded)"), encoding: .utf8) ?? ""
                self.serverResults = parseQuickResults(raw)
            } catch {
                self.serverResults = []
            }
        }
    }

    @MainActor
    private func applyLocal(id: String, done: Bool) {
        tasks = tasks.map { $0.id == id
            ? TodayTask(id: $0.id, title: $0.title,
                        status: done ? "COMPLETED" : "TODO",
                        priority: $0.priority, dueDate: $0.dueDate,
                        doDate: $0.doDate, scheduledDate: $0.scheduledDate,
                        scheduledTime: $0.scheduledTime,
                        estimatedMinutes: $0.estimatedMinutes,
                        project: $0.project, subTasks: $0.subTasks)
            : $0 }
    }
}
