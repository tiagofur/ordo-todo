import Foundation

/// Modelos de Tareas + búsqueda (ODD 052 T3): espejo de `SearchModels.kt` y
/// `TasksSectioning.kt` de Android. Sin SwiftUI (verificable con `swiftc`).

// MARK: - Búsqueda (`GET /search/quick`)

/// Un hit de búsqueda: tarea o proyecto.
struct QuickResult: Codable, Equatable, Identifiable {
    var id: String
    var type: String = "task"
    var title: String = ""
    var subtitle: String?

    var isProject: Bool { type == "project" }
}

private struct QuickResponse: Codable {
    var results: [QuickResult] = []
}

/// Parsea hits; lo inesperado son cero hits, nunca un crash.
func parseQuickResults(_ raw: String) -> [QuickResult] {
    guard let data = raw.data(using: .utf8) else { return [] }
    do {
        return try JSONDecoder().decode(QuickResponse.self, from: data).results
    } catch {
        return []
    }
}

/// El servidor necesita al menos 2 caracteres (`GET /search/quick`).
func shouldSearchServer(_ query: String) -> Bool {
    query.trimmingCharacters(in: .whitespacesAndNewlines).count >= 2
}

// MARK: - Secciones (pestaña Tareas)

enum TasksSectionKind {
    case upcoming, undated, done
}

struct TasksSection: Equatable {
    var kind: TasksSectionKind
    var tasks: [TodayTask]
}

/// Clave de orden: primero fecha planificada, luego límite; sin fecha al final.
func taskSortDate(_ task: TodayTask) -> String {
    task.scheduledDate ?? task.dueDate ?? "\u{FFFF}"
}

/// Bucketing puro de la pestaña Tareas: las hechas cierran, las fechadas
/// ordenan ascendente (Próximas), el resto queda Sin fecha. La query filtra
/// por título (insensible a mayúsculas); el proyecto estrecha por id.
func sectionTasks(
    _ tasks: [TodayTask], query: String, projectFilter: String?
) -> [TasksSection] {
    let needle = query.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let visible = tasks.filter { task in
        (projectFilter == nil || task.project?.id == projectFilter)
            && (needle.isEmpty || task.title.lowercased().contains(needle))
    }
    var done: [TodayTask] = []
    var open: [TodayTask] = []
    for task in visible {
        if task.isDone { done.append(task) } else { open.append(task) }
    }
    var dated: [TodayTask] = []
    var undated: [TodayTask] = []
    for task in open {
        if task.scheduledDate != nil || task.dueDate != nil {
            dated.append(task)
        } else {
            undated.append(task)
        }
    }
    return [
        TasksSection(kind: .upcoming,
                     tasks: dated.sorted { taskSortDate($0) < taskSortDate($1) }),
        TasksSection(kind: .undated,
                     tasks: undated.sorted { $0.title < $1.title }),
        TasksSection(kind: .done,
                     tasks: done.sorted { taskSortDate($0) < taskSortDate($1) }),
    ]
}
