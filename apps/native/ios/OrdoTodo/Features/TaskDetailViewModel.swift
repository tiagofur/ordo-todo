import Foundation

/// Detalle de tarea (ODD 052): `GET /tasks/:id` + comentarios,
/// `PATCH /tasks/:id` con diff (solo lo cambiado; nulo explícito limpia),
/// subtareas CRUD, borrado y restauración (`POST /tasks/:id/restore`).
@Observable
@MainActor
final class TaskDetailViewModel {
    private let client: ApiClient
    let taskId: String

    var detail: TaskDetailResponse?
    var comments: [TaskComment] = []
    var isLoading = true
    var loadFailed = false
    var saving = false
    var errorMessage: String?

    // Campos editables (yyyy-MM-dd o vacío; proyecto nulo = exprés).
    var title = ""
    var notes = ""
    var scheduledDate = ""
    var scheduledTime = ""
    var dueDate = ""
    var priority = "MEDIUM"
    var projectId: String?
    var estimatedMinutes: Int?
    var recurrence: RecurrenceConfig?
    var projects: [TodayProject] = []

    init(taskId: String, session: SessionStore,
         baseURL: URL = OrdoConfig.baseURL) {
        self.taskId = taskId
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    func load() async {
        isLoading = detail == nil
        loadFailed = false
        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/tasks/\(taskId)")
            let fresh = try decoder.decode(TaskDetailResponse.self,
                                           from: data)
            detail = fresh
            title = fresh.title
            notes = fresh.description ?? ""
            scheduledDate = String((fresh.scheduledDate ?? "").prefix(10))
            scheduledTime = String((fresh.scheduledTime ?? "").prefix(5))
            dueDate = String((fresh.dueDate ?? "").prefix(10))
            priority = fresh.priority
            projectId = fresh.projectId ?? fresh.project?.id
            estimatedMinutes = fresh.estimatedMinutes
            recurrence = fresh.recurrence
            async let commentsData = try? await client.getData(
                "/tasks/\(taskId)/comments")
            async let projectsData = try? await client.getData("/projects/all")
            if let raw = await commentsData {
                comments = parseTaskComments(raw)
            }
            if let raw = await projectsData {
                projects = (try? decoder.decode([TodayProject].self,
                                                from: raw)) ?? []
            }
        } catch {
            if detail == nil { loadFailed = true }
            else { errorMessage = "Sin conexión: mostrando copia" }
        }
        isLoading = false
    }

    /// Guarda el diff; nulo cuando nada cambió.
    func save() async -> Bool {
        guard let original = detail, !saving else { return false }
        guard let patch = buildTaskPatch(original: original, edited: edited())
        else { return true }
        saving = true
        defer { saving = false }
        do {
            let body = try JSONSerialization.data(
                withJSONObject: patch, options: [.fragmentsAllowed])
            try await client.patch("/tasks/\(taskId)", body: body)
            await load()
            return true
        } catch {
            errorMessage = "No se pudo guardar"
            return false
        }
    }

    func remove() async -> Bool {
        do {
            try await client.delete("/tasks/\(taskId)")
            return true
        } catch {
            errorMessage = "No se pudo eliminar"
            return false
        }
    }

    func toggleComplete() async {
        guard let detail else { return }
        do {
            if detail.isDone {
                let body = try JSONEncoder().encode(["status": "TODO"])
                try await client.patch("/tasks/\(taskId)", body: body)
            } else {
                try await client.patch("/tasks/\(taskId)/complete")
            }
            await load()
        } catch {
            errorMessage = "Sin conexión: cambio revertido"
        }
    }

    func addSubtask(title: String) async {
        let name = title.trimmingCharacters(in: .whitespaces)
        guard !name.isEmpty else { return }
        do {
            let body = try JSONEncoder().encode(["title": name])
            _ = try await client.post("/tasks/\(taskId)/subtasks",
                                      body: body)
            await load()
        } catch {
            errorMessage = "No se pudo añadir la subtarea"
        }
    }

    func toggleSubtask(_ sub: SubtaskItem) async {
        do {
            if sub.isDone {
                let body = try JSONEncoder().encode(["status": "TODO"])
                try await client.patch("/tasks/\(sub.id)", body: body)
            } else {
                try await client.patch("/tasks/\(sub.id)/complete")
            }
            await load()
        } catch {
            errorMessage = "Sin conexión"
        }
    }

    func deleteSubtask(_ sub: SubtaskItem) async {
        do {
            try await client.delete("/tasks/\(sub.id)")
            await load()
        } catch {
            errorMessage = "No se pudo eliminar"
        }
    }

    // MARK: - IA: descomponer en subtareas

    var suggestions: [String]?
    var decomposing = false

    /// Pide a la IA que parta la tarea; el fallo muestra error de red.
    func suggestSubtasks() async {
        guard let detail, !detail.title
            .trimmingCharacters(in: .whitespaces).isEmpty,
              !decomposing
        else { return }
        decomposing = true
        defer { decomposing = false }
        do {
            struct DecomposeRequest: Encodable {
                var taskTitle: String
                var taskDescription: String
                var maxSubtasks: Int
            }
            let body = try JSONEncoder().encode(DecomposeRequest(
                taskTitle: detail.title,
                taskDescription: detail.description ?? "",
                maxSubtasks: 8))
            let data = try await client.post("/ai/decompose-task",
                                             body: body)
            guard let raw = String(data: data, encoding: .utf8) else {
                errorMessage = "Sin conexión: inténtalo de nuevo"
                return
            }
            let titles = parseDecomposeSuggestions(raw)
            suggestions = titles.isEmpty ? nil : titles
        } catch {
            errorMessage = "Sin conexión: inténtalo de nuevo"
        }
    }

    /// Añade la sugerencia como subtarea real y la retira de la propuesta.
    func acceptSuggestion(_ title: String) async {
        await addSubtask(title: title)
        let remaining = (suggestions ?? []).filter { $0 != title }
        suggestions = remaining.isEmpty ? nil : remaining
    }

    func dismissSuggestions() {
        suggestions = nil
    }

    // MARK: - Diff (espejo de `buildTaskPatch`)

    struct Edited: Equatable {
        var title: String
        var description: String
        var scheduledDate: String
        var scheduledTime: String
        var dueDate: String
        var priority: String
        var projectId: String?
        var estimatedMinutes: Int?
        var recurrence: RecurrenceConfig?
    }

    func edited() -> Edited {
        Edited(title: title, description: notes, scheduledDate: scheduledDate,
               scheduledTime: scheduledTime, dueDate: dueDate,
               priority: priority, projectId: projectId,
               estimatedMinutes: estimatedMinutes, recurrence: recurrence)
    }

    /// Solo lo cambiado; ausente = "dejarlo". Nulo cuando nada cambió.
    func buildTaskPatch(original: TaskDetailResponse,
                        edited: Edited) -> [String: Any]? {
        var changed = false
        var body: [String: Any] = [:]
        func day(_ iso: String?) -> String {
            String((iso ?? "").prefix(10))
        }
        if edited.title != original.title {
            body["title"] = edited.title
            changed = true
        }
        if edited.description != (original.description ?? "") {
            body["description"] = edited.description
            changed = true
        }
        if edited.scheduledDate != day(original.scheduledDate) {
            body["scheduledDate"] = edited.scheduledDate.isEmpty
                ? NSNull() : edited.scheduledDate
            changed = true
        }
        if edited.scheduledTime
            != String((original.scheduledTime ?? "").prefix(5)) {
            body["scheduledTime"] = edited.scheduledTime.isEmpty
                ? NSNull() : edited.scheduledTime
            changed = true
        }
        if edited.dueDate != day(original.dueDate) {
            body["dueDate"] = edited.dueDate.isEmpty
                ? NSNull() : edited.dueDate
            changed = true
        }
        if edited.priority != original.priority {
            body["priority"] = edited.priority
            changed = true
        }
        let originalProject = original.projectId ?? original.project?.id
        if edited.projectId != originalProject {
            body["projectId"] = edited.projectId ?? NSNull()
            changed = true
        }
        if edited.estimatedMinutes != original.estimatedMinutes {
            body["estimatedMinutes"] = edited.estimatedMinutes ?? NSNull()
            changed = true
        }
        if edited.recurrence != original.recurrence {
            if let recurrence = edited.recurrence {
                var rec: [String: Any] = ["pattern": recurrence.pattern,
                                          "interval": recurrence.interval]
                if let days = recurrence.daysOfWeek {
                    rec["daysOfWeek"] = days
                }
                if let dom = recurrence.dayOfMonth {
                    rec["dayOfMonth"] = dom
                }
                body["recurrence"] = rec
            } else {
                body["recurrence"] = NSNull()
            }
            changed = true
        }
        return changed ? body : nil
    }
}
