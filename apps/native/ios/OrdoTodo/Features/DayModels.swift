import Foundation

/// Modelos del día (ODD 052 T2): espejo de `GET /tasks/today` y de
/// `Sections.kt` / `DayCapacity.kt` de Android. Sin SwiftUI para que la
/// lógica sea verificable con `swiftc` fuera de Xcode.

// MARK: - Payloads (`GET /tasks/today`)

struct TodaySubTask: Codable, Equatable, Hashable {
    var id: String
    var status: String = "TODO"
}

struct TodayProject: Codable, Equatable, Hashable, Identifiable {
    var id: String
    var name: String
    var slug: String?
    var color: String?
    var workspaceId: String?
}

struct TodayTask: Codable, Equatable, Hashable, Identifiable {
    var id: String
    var title: String
    var status: String = "TODO"
    var priority: String = "MEDIUM"
    var dueDate: String?
    var doDate: String?
    var scheduledDate: String?
    var scheduledTime: String?
    var estimatedMinutes: Int?
    var project: TodayProject?
    var subTasks: [TodaySubTask] = []
    /// Capturada offline, aún no en el servidor (nunca la envía la API).
    /// `decodeIfPresent`: la API jamás manda esta clave (T9 E2E).
    var pendingSync: Bool = false

    enum CodingKeys: String, CodingKey {
        case id, title, status, priority, dueDate, doDate
        case scheduledDate, scheduledTime, estimatedMinutes
        case project, subTasks, pendingSync
    }

    init(id: String, title: String, status: String = "TODO",
         priority: String = "MEDIUM", dueDate: String? = nil,
         doDate: String? = nil, scheduledDate: String? = nil,
         scheduledTime: String? = nil, estimatedMinutes: Int? = nil,
         project: TodayProject? = nil, subTasks: [TodaySubTask] = [],
         pendingSync: Bool = false) {
        self.id = id
        self.title = title
        self.status = status
        self.priority = priority
        self.dueDate = dueDate
        self.doDate = doDate
        self.scheduledDate = scheduledDate
        self.scheduledTime = scheduledTime
        self.estimatedMinutes = estimatedMinutes
        self.project = project
        self.subTasks = subTasks
        self.pendingSync = pendingSync
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        id = try c.decode(String.self, forKey: .id)
        title = try c.decode(String.self, forKey: .title)
        status = try c.decodeIfPresent(String.self, forKey: .status) ?? "TODO"
        priority = try c.decodeIfPresent(String.self,
                                         forKey: .priority) ?? "MEDIUM"
        dueDate = try c.decodeIfPresent(String.self, forKey: .dueDate)
        doDate = try c.decodeIfPresent(String.self, forKey: .doDate)
        scheduledDate = try c.decodeIfPresent(String.self,
                                              forKey: .scheduledDate)
        scheduledTime = try c.decodeIfPresent(String.self,
                                              forKey: .scheduledTime)
        estimatedMinutes = try c.decodeIfPresent(Int.self,
                                                 forKey: .estimatedMinutes)
        project = try c.decodeIfPresent(TodayProject.self, forKey: .project)
        subTasks = try c.decodeIfPresent([TodaySubTask].self,
                                         forKey: .subTasks) ?? []
        pendingSync = try c.decodeIfPresent(Bool.self,
                                            forKey: .pendingSync) ?? false
    }

    var isDone: Bool { status == "COMPLETED" || status == "CANCELLED" }
    var doneSubTasks: Int { subTasks.filter { $0.status == "COMPLETED" }.count }
}

struct TodayResponse: Codable, Equatable {
    var overdue: [TodayTask] = []
    var dueToday: [TodayTask] = []
    var scheduledToday: [TodayTask] = []
    var available: [TodayTask] = []
    var notYetAvailable: [TodayTask] = []
}

// MARK: - Secciones (orden de muestra)

/// Vencidas abren el día, las hechas siempre lo cierran.
enum DaySectionKind: String, CaseIterable {
    case overdue, morning, afternoon, evening, anytime, done

    var titleKey: String {
        switch self {
        case .overdue: return NSLocalizedString("Vencidas", comment: "")
        case .morning: return NSLocalizedString("Mañana", comment: "")
        case .afternoon: return NSLocalizedString("Tarde", comment: "")
        case .evening: return NSLocalizedString("Noche", comment: "")
        case .anytime: return NSLocalizedString("Cuando sea", comment: "")
        case .done: return NSLocalizedString("Hechas", comment: "")
        }
    }
}

struct DaySection: Equatable {
    var kind: DaySectionKind
    var tasks: [TodayTask]
}

private func hourOf(_ task: TodayTask) -> Int? {
    guard let time = task.scheduledTime else { return nil }
    let hour = time.split(separator: ":").first.flatMap { Int($0) }
    return hour.flatMap { (0...23).contains($0) ? $0 : nil }
}

private func place(_ task: TodayTask) -> DaySectionKind {
    switch hourOf(task) {
    case nil: return .anytime
    case .some(0...11): return .morning
    case .some(12...19): return .afternoon
    default: return .evening
    }
}

/// Agrupa un payload de `GET /tasks/today` en secciones de muestra.
/// Las vacías se omiten; `notYetAvailable` nunca sale en Hoy.
func sectionToday(_ response: TodayResponse) -> [DaySection] {
    var ordered: [DaySectionKind: [TodayTask]] = Dictionary(
        uniqueKeysWithValues: DaySectionKind.allCases.map { ($0, []) })
    for task in response.overdue {
        ordered[task.isDone ? .done : .overdue, default: []].append(task)
    }
    for task in response.dueToday + response.scheduledToday + response.available {
        ordered[task.isDone ? .done : place(task), default: []].append(task)
    }
    return DaySectionKind.allCases.compactMap { kind in
        let tasks = ordered[kind, default: []]
        return tasks.isEmpty ? nil : DaySection(kind: kind, tasks: tasks)
    }
}

// MARK: - Capacidad del día

struct DayCapacity: Equatable {
    var estimatedMinutes: Int
    var availableMinutes: Int

    var progress: Double {
        guard availableMinutes > 0 else { return 0 }
        return Double(estimatedMinutes) / Double(availableMinutes)
    }
    var clampedProgress: Double { min(max(progress, 0), 1) }
    var isOverloaded: Bool { estimatedMinutes > availableMinutes }
    var overageMinutes: Int { max(estimatedMinutes - availableMinutes, 0) }
}

/// Minutos estimados de pendientes frente a minutos disponibles del día.
/// Hechas/canceladas no cuentan.
func calculateDayCapacity(
    _ tasks: [TodayTask], availableMinutes: Int = 480
) -> DayCapacity {
    let total = tasks.filter { !$0.isDone }
        .reduce(0) { $0 + ($1.estimatedMinutes ?? 0) }
    return DayCapacity(
        estimatedMinutes: total, availableMinutes: max(availableMinutes, 1))
}

func formatMinutes(_ minutes: Int) -> String {
    if minutes <= 0 { return "0m" }
    let hours = minutes / 60
    let rem = minutes % 60
    switch (hours, rem) {
    case (let h, let r) where h > 0 && r > 0: return "\(h)h \(r)m"
    case (let h, _) where h > 0: return "\(h)h"
    default: return "\(rem)m"
    }
}
