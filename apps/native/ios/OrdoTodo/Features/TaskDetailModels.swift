import Foundation

/// Detalle de tarea (ODD 052): espejo de `TaskDetails.kt` + `TaskComments.kt`
/// de Android. `GET /tasks/:id` trae la entidad; comentarios van aparte en
/// `GET /tasks/:id/comments` (array tolerante). Sin SwiftUI.

// MARK: - Payloads

struct RecurrenceConfig: Codable, Equatable {
    var pattern: String = "DAILY"
    var interval: Int = 1
    var daysOfWeek: [Int]?
    var dayOfMonth: Int?
}

struct SubtaskItem: Codable, Equatable, Identifiable {
    var id: String
    var title: String
    var status: String = "TODO"

    var isDone: Bool { status == "COMPLETED" || status == "CANCELLED" }
}

struct TaskTag: Codable, Equatable, Identifiable {
    var id: String
    var name: String
    var color: String?
    var workspaceId: String?
}

struct TaskComment: Equatable, Identifiable {
    var id: String
    var content: String
    var author: String
    var date: String
}

private struct CommentPayload: Decodable {
    struct Author: Decodable {
        var name: String?
        var email: String = ""
    }
    var id: String = ""
    var content: String = ""
    var author: Author = Author()
    var createdAt: String = ""
}

/// Normaliza comentarios; lo inesperado son cero comentarios, nunca un crash.
func parseTaskComments(_ data: Data) -> [TaskComment] {
    let decoder = JSONDecoder()
    decoder.keyDecodingStrategy = .convertFromSnakeCase
    guard let payloads = try? decoder.decode([CommentPayload].self,
                                             from: data)
    else { return [] }
    return payloads
        .filter { !$0.id.isEmpty && !$0.content.isEmpty }
        .map {
            let name = ($0.author.name ?? "").trimmingCharacters(
                in: .whitespaces)
            return TaskComment(
                id: $0.id, content: $0.content,
                author: name.isEmpty ? $0.author.email : name,
                date: String($0.createdAt.prefix(10)))
        }
}

struct TaskDetailResponse: Codable, Equatable {
    var id: String
    var title: String
    var description: String?
    var status: String = "TODO"
    var priority: String = "MEDIUM"
    var dueDate: String?
    var scheduledDate: String?
    var scheduledTime: String?
    var projectId: String?
    var project: TodayProject?
    var estimatedMinutes: Int?
    var recurrence: RecurrenceConfig?
    var subTasks: [SubtaskItem] = []
    var tags: [TaskTag] = []

    var isDone: Bool { status == "COMPLETED" || status == "CANCELLED" }
}
