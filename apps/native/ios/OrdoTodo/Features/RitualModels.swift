import Foundation

/// Ritual diario de 60 s (ODD 052): espejo de `RitualModels.kt` +
/// `RitualLogic.kt` de Android. Mañana (top 3 del día) y noche (cierre:
/// mañana / fecha / archivar), con racha. Sin SwiftUI.

enum RitualPhase {
    case morning, evening, none
}

struct RitualStreak: Codable, Equatable {
    var current: Int = 0
    var longest: Int = 0

    var label: String {
        switch current {
        case ...0: return NSLocalizedString(
            "Comienza tu racha con el ritual de hoy", comment: "")
        case 1: return NSLocalizedString("Racha: 1 día", comment: "")
        default: return L("Racha: %d días", current)
        }
    }
}

struct RitualDayState: Codable, Equatable {
    var morningStatus: String = "PENDING"
    var morningAt: String?
    var morningTop3: [String] = []
    var morningPlannedAt: String?
    var eveningStatus: String = "PENDING"
    var eveningAt: String?
}

struct RitualMorningView: Codable, Equatable {
    struct OverdueTask: Codable, Equatable {
        var taskId: String
        var title: String
        var dueDateKey: String = ""
    }
    var overdue: [OverdueTask] = []
    var suggestedTop3: [String] = []
    var ritual: RitualDayState?
}

struct RitualEveningView: Codable, Equatable {
    struct EveningTask: Codable, Equatable, Identifiable {
        var taskId: String
        var title: String
        var id: String { taskId }
    }
    var completed: [EveningTask] = []
    var pending: [EveningTask] = []
    var ritual: RitualDayState?
}

struct RitualEveningMove: Codable, Equatable {
    var taskId: String
    var destination: String = "tomorrow" // tomorrow | date | archived
    var date: String?
    var reason: String = "overran"
}

/// Top 3 (máx. 3): tocar quita, tocar otro añade.
func toggleTop3(current: [String], taskId: String) -> [String] {
    if current.contains(taskId) { return current.filter { $0 != taskId } }
    return current.count < 3 ? current + [taskId] : current
}

/// Fase activa: mañana pendiente antes de las 17 h, noche pendiente después.
/// Hecho u omitido cierra su mitad.
func activeRitualPhase(morning: String, evening: String,
                       hour: Int) -> RitualPhase {
    let morningPending = morning != "DONE" && morning != "SKIPPED"
    let eveningPending = evening != "DONE" && evening != "SKIPPED"
    switch (morningPending, eveningPending, hour) {
    case (true, _, ..<17): return .morning
    case (_, true, 17...): return .evening
    default: return .none
    }
}
