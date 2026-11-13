import Foundation

/// Ciclo Pomodoro (ODD 052): espejo de `PomodoroCycle.kt` de Android.
/// Fase acreditada si llega al ≥80 % o al fin natural; las abiertas
/// (sin duración) acreditan con ≥60 s. Sin SwiftUI (verificable con `swiftc`).

enum PomodoroMode: String, Codable {
    case work, shortBreak, longBreak
}

struct PomodoroConfig: Equatable {
    var workDurationMinutes: Int = 25
    var shortBreakMinutes: Int = 5
    var longBreakMinutes: Int = 15
    var pomodorosUntilLongBreak: Int = 4

    func durationMs(_ mode: PomodoroMode) -> Int {
        switch mode {
        case .work: return workDurationMinutes * 60_000
        case .shortBreak: return shortBreakMinutes * 60_000
        case .longBreak: return longBreakMinutes * 60_000
        }
    }
}

struct PhaseTransition: Equatable {
    var nextMode: PomodoroMode
    var completedPomodoros: Int
    var durationMs: Int
    var wasCredited: Bool
}

func isCredited(elapsedMs: Int, plannedMs: Int?) -> Bool {
    guard let plannedMs, plannedMs > 0 else { return elapsedMs >= 60_000 }
    return elapsedMs * 100 / plannedMs >= 80
}

func transition(mode: PomodoroMode, completedPomodoros: Int,
                config: PomodoroConfig, credited: Bool) -> PhaseTransition {
    switch mode {
    case .work:
        let count = credited ? completedPomodoros + 1 : completedPomodoros
        let next: PomodoroMode =
            (count > 0 && count % config.pomodorosUntilLongBreak == 0)
            ? .longBreak : .shortBreak
        return PhaseTransition(nextMode: next, completedPomodoros: count,
                               durationMs: config.durationMs(next),
                               wasCredited: credited)
    case .shortBreak, .longBreak:
        return PhaseTransition(nextMode: .work,
                               completedPomodoros: completedPomodoros,
                               durationMs: config.durationMs(.work),
                               wasCredited: credited)
    }
}
