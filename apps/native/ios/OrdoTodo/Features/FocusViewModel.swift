import ActivityKit
import Foundation
import UserNotifications

/// Foco (ODD 052): el servidor es dueño de la sesión (`POST /timers/start`,
/// `pause`, `resume`, `stop`, `GET /timers/active`, `GET /timers/stats`);
/// este VM lleva la cuenta atrás local, el ciclo Pomodoro, la persistencia
/// mínima y el aviso de fin. Sin foreground service: iOS avisa con
/// notificación time-sensitive; la Live Activity llega con el Widget.
@MainActor
@Observable
final class FocusViewModel {
    struct SessionPayload: Decodable {
        var id: String
        var taskId: String?
        var startedAt: String
        var totalPauseTime: Int = 0
        var currentPauseStart: String?
        var elapsedSeconds: Int = 0
        var isPaused: Bool = false
        var type: String?
        var durationMinutes: Int?
    }

    struct Stats: Decodable {
        var totalWorkMinutes: Int = 0
        var completedPomodoros: Int = 0
    }

    private let client: ApiClient
    private var timer: Timer?
    private var activity: Activity<FocusAttributes>?
    private var lastLiveMinute = -1

    var taskId: String?
    var taskTitle: String?
    var mode: PomodoroMode = .work
    var endsAt: Date?
    var pausedRemaining: Int?
    var now = Date()
    var config = PomodoroConfig()
    var completedPomodoros = 0
    var starting = false
    var errorMessage: String?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.client = ApiClient(baseURL: baseURL, session: session)
        Task { await self.boot() }
    }

    var isActive: Bool { endsAt != nil || pausedRemaining != nil }

    var remainingSeconds: Int {
        if let paused = pausedRemaining { return max(0, paused) }
        guard let endsAt else { return 0 }
        return max(0, Int(endsAt.timeIntervalSince(now)))
    }

    var totalSeconds: Int { (phaseMinutes ?? config.workDurationMinutes) * 60 }
    var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return 1 - Double(remainingSeconds) / Double(totalSeconds)
    }

    var remainingText: String {
        let s = remainingSeconds
        return String(format: "%d:%02d", s / 60, s % 60)
    }

    var phaseLabel: String {
        switch mode {
        case .work: return NSLocalizedString("Foco", comment: "")
        case .shortBreak: return NSLocalizedString("Descanso", comment: "")
        case .longBreak: return NSLocalizedString("Descanso largo",
                                                  comment: "")
        }
    }

    var pomodoroLine: String {
        L("Pomodoro %d de %d",
          min(completedPomodoros + 1, max(config.pomodorosUntilLongBreak, 1)),
          config.pomodorosUntilLongBreak)
    }

    // MARK: - Ciclo de vida

    func start(taskId: String? = nil, title: String? = nil,
               minutes: Int? = nil) {
        guard !isActive else { return }
        starting = true
        Task {
            defer { starting = false }
            do {
                try await requestNotificationPermission()
                if mode != .work { mode = .work }
                let mins = minutes ?? config.workDurationMinutes
                var dict: [String: Any] = ["type": "WORK"]
                if let taskId { dict["taskId"] = taskId }
                dict["durationMinutes"] = mins
                let body = try JSONSerialization.data(withJSONObject: dict)
                let data = try await client.post("/timers/start", body: body)
                let payload = try decode(SessionPayload.self, from: data)
                self.taskId = taskId
                self.taskTitle = title
                self.phaseMinutes = payload.durationMinutes ?? mins
                self.endsAt = Date().addingTimeInterval(
                    Double((payload.durationMinutes ?? mins) * 60))
                self.pausedRemaining = nil
                self.phaseStart = Date()
                self.startTicking()
                await self.scheduleEndNotification()
                self.startLiveActivity()
            } catch {
                errorMessage = "No se pudo empezar el foco"
            }
        }
    }

    func pause() {
        Task {
            do {
                _ = try await client.post("/timers/pause",
                                          body: Data("{}".utf8))
                pausedRemaining = remainingSeconds
                endsAt = nil
                stopTicking()
                cancelEndNotification()
            } catch {
                errorMessage = "No se pudo pausar"
            }
        }
    }

    func resume() {
        Task {
            do {
                let iso = ISO8601DateFormatter().string(from: Date())
                let body = try JSONEncoder().encode(["pauseStartedAt": iso])
                _ = try await client.post("/timers/resume", body: body)
                if let paused = pausedRemaining {
                    endsAt = Date().addingTimeInterval(Double(paused))
                    pausedRemaining = nil
                    startTicking()
                    await scheduleEndNotification()
                }
            } catch {
                errorMessage = "No se pudo reanudar"
            }
        }
    }

    func finish() {
        endPhase(completed: true)
    }

    /// Detiene sin avanzar de fase (salir del foco).
    func stopToIdle() {
        stopTicking()
        cancelEndNotification()
        endLiveActivity()
        endsAt = nil
        pausedRemaining = nil
        taskId = nil
        taskTitle = nil
        Task {
            do {
                let body = try JSONEncoder().encode(["wasCompleted": false])
                try await self.client.post("/timers/stop", body: body)
            } catch { /* salir igual */ }
        }
    }

    func skipBreak() {
        guard mode != .work else { return }
        advance(credited: false)
    }

    // MARK: - Fin natural y transiciones

    private var phaseMinutes: Int?
    private var phaseStart = Date()

    private func tick() {
        now = Date()
        let minute = remainingSeconds / 60
        if minute != lastLiveMinute {
            lastLiveMinute = minute
            updateLiveActivity()
        }
        if pausedRemaining == nil, let endsAt, now >= endsAt {
            let elapsedMs = Int(Date().timeIntervalSince(phaseStart) * 1000)
            let plannedMs = (phaseMinutes ?? 0) * 60_000
            endPhase(completed: true,
                     credited: isCredited(elapsedMs: elapsedMs,
                                          plannedMs: phaseMinutes == nil
                                            ? nil : plannedMs))
        }
    }

    private func endPhase(completed: Bool, credited: Bool? = nil) {
        let elapsedMs = Int(Date().timeIntervalSince(phaseStart) * 1000)
        let plannedMs = (phaseMinutes ?? 0) * 60_000
        let credit = credited ?? isCredited(
            elapsedMs: elapsedMs,
            plannedMs: phaseMinutes == nil ? nil : plannedMs)
        stopTicking()
        cancelEndNotification()
        let finishedMode = mode
        let finishedTask = taskId
        endsAt = nil
        pausedRemaining = nil
        Task {
            do {
                let body = try JSONEncoder().encode(["wasCompleted": completed])
                try await self.client.post("/timers/stop", body: body)
            } catch { /* el servidor manda; el ciclo local sigue */ }
            let result = transition(mode: finishedMode,
                                    completedPomodoros: completedPomodoros,
                                    config: config, credited: credit)
            self.completedPomodoros = result.completedPomodoros
            self.mode = result.nextMode
            if completed {
                self.startPhase(minutes: result.durationMs / 60_000,
                                taskId: finishedTask, silent: true)
            }
        }
    }

    private func advance(credited: Bool) {
        let result = transition(mode: mode,
                                completedPomodoros: completedPomodoros,
                                config: config, credited: credited)
        completedPomodoros = result.completedPomodoros
        mode = result.nextMode
        startPhase(minutes: result.durationMs / 60_000, taskId: taskId,
                   silent: true)
    }

    private func startPhase(minutes: Int, taskId: String?, silent: Bool) {
        Task {
            do {
                var dict: [String: Any] = [
                    "type": mode == .work ? "WORK" : "BREAK"]
                if let taskId, mode == .work { dict["taskId"] = taskId }
                dict["durationMinutes"] = minutes
                let body = try JSONSerialization.data(withJSONObject: dict)
                _ = try await self.client.post("/timers/start", body: body)
            } catch { /* sigue local */ }
            self.phaseMinutes = minutes
            self.phaseStart = Date()
            self.endsAt = Date().addingTimeInterval(Double(minutes * 60))
            self.pausedRemaining = nil
            self.startTicking()
            await self.scheduleEndNotification()
            self.updateLiveActivity()
        }
    }

    // MARK: - Actividad en vivo

    private func liveState() -> FocusAttributes.ContentState {
        FocusAttributes.ContentState(remainingSeconds: remainingSeconds,
                                     phaseLabel: phaseLabel,
                                     taskTitle: taskTitle)
    }

    private func startLiveActivity() {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else { return }
        endLiveActivity(silent: true)
        let attributes = FocusAttributes(
            sessionId: UUID().uuidString)
        lastLiveMinute = remainingSeconds / 60
        activity = try? Activity.request(
            attributes: attributes,
            content: .init(state: liveState(), staleDate: nil))
    }

    private func updateLiveActivity() {
        guard let activity else { return }
        let state = liveState()
        Task { await activity.update(.init(state: state, staleDate: nil)) }
    }

    private func endLiveActivity(silent: Bool = false) {
        guard let running = activity else { return }
        activity = nil
        if silent { return }
        Task { await running.end(nil, dismissalPolicy: .immediate) }
    }

    // MARK: - Arranque y restauración

    private func boot() async {
        for running in Activity<FocusAttributes>.activities {
            await running.end(nil, dismissalPolicy: .immediate)
        }
        await loadConfig()
        await restore()
        if isActive { startLiveActivity() }
    }

    private func loadConfig() async {
        do {
            struct Wire: Decodable {
                var pomodoroDuration: Int?
                var shortBreakDuration: Int?
                var longBreakDuration: Int?
                var pomodorosUntilLongBreak: Int?
            }
            let data = try await client.getData("/users/me/preferences")
            if data.isEmpty { return }
            let wire = try decode(Wire.self, from: data)
            config = PomodoroConfig(
                workDurationMinutes: wire.pomodoroDuration ?? 25,
                shortBreakMinutes: wire.shortBreakDuration ?? 5,
                longBreakMinutes: wire.longBreakDuration ?? 15,
                pomodorosUntilLongBreak: wire.pomodorosUntilLongBreak ?? 4)
        } catch { /* valores por defecto */ }
    }

    private func restore() async {
        do {
            let data = try await client.getData("/timers/active")
            if data.isEmpty || String(data: data, encoding: .utf8) == "null" {
                return
            }
            let payload = try decode(SessionPayload.self, from: data)
            let mins = payload.durationMinutes ?? config.workDurationMinutes
            phaseMinutes = mins
            if payload.isPaused {
                pausedRemaining = max(0, mins * 60 - payload.elapsedSeconds)
            } else {
                endsAt = Date().addingTimeInterval(
                    Double(max(0, mins * 60 - payload.elapsedSeconds)))
                startTicking()
                await scheduleEndNotification()
            }
            taskId = payload.taskId
        } catch { /* sin sesión activa */ }
    }

    private func decode<T: Decodable>(_ type: T.Type,
                                      from data: Data) throws -> T {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        return try decoder.decode(type, from: data)
    }

    // MARK: - Ticker y avisos

    private func startTicking() {
        stopTicking()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) {
            [weak self] _ in
            Task { @MainActor in self?.tick() }
        }
    }

    private func stopTicking() {
        timer?.invalidate()
        timer = nil
    }

    private func requestNotificationPermission() async throws {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .notDetermined else { return }
        _ = try await center.requestAuthorization(options: [.alert, .sound])
    }

    private func scheduleEndNotification() async {
        cancelEndNotification()
        guard remainingSeconds > 1 else { return }
        let content = UNMutableNotificationContent()
        content.title = mode == .work
            ? NSLocalizedString("Foco terminado", comment: "")
            : NSLocalizedString("Descanso terminado", comment: "")
        content.body = mode == .work
            ? NSLocalizedString("Toca para empezar el descanso", comment: "")
            : NSLocalizedString("Toca para volver al foco", comment: "")
        content.sound = .default
        content.interruptionLevel = .timeSensitive
        let trigger = UNTimeIntervalNotificationTrigger(
            timeInterval: Double(remainingSeconds), repeats: false)
        try? await UNUserNotificationCenter.current().add(
            UNNotificationRequest(identifier: "ordo-focus-end",
                                  content: content, trigger: trigger))
    }

    private func cancelEndNotification() {
        UNUserNotificationCenter.current()
            .removePendingNotificationRequests(withIdentifiers: ["ordo-focus-end"])
    }
}
