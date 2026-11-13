import Foundation
import UserNotifications

/// Avisos 100 % locales (ODD 052): espejo de `HabitReminders` (self-heal por
/// `preferredTime`) + planning diario de Android. Sin push: el backend no
/// tiene APNs/FCM. Identificadores con prefijo para no pisar el fin de foco.
enum NotificationScheduler {
    private static let habitPrefix = "ordo.habit."
    private static let planningId = "ordo.planning"

    /// Reprograma hábitos (hora preferida) + resumen diario. Llamar tras
    /// cada pull de Hoy/Hábitos (self-heal como en Android).
    static func reschedule(habits: [HabitToday], day: TodayResponse?,
                           settings: AppSettings = .shared) {
        let center = UNUserNotificationCenter.current()
        center.getPendingNotificationRequests { pending in
            let keep = Set([FocusEndRequestId] + pending
                .map(\.identifier)
                .filter { !$0.hasPrefix(habitPrefix) && $0 != planningId })
            _ = keep
            center.removePendingNotificationRequests(withIdentifiers: pending
                .map(\.identifier)
                .filter { $0.hasPrefix(habitPrefix) || $0 == planningId })
            Task {
                do {
                    try await requestIfNeeded()
                    if settings.habitRemindersEnabled {
                        for habit in habits {
                            scheduleHabit(habit,
                                          lead: settings.reminderLeadMinutes)
                        }
                    }
                    if settings.planningEnabled {
                        schedulePlanning(day: day, settings: settings)
                    }
                } catch { /* sin permiso: la app sigue igual */ }
            }
        }
    }

    static func requestIfNeeded() async throws {
        let center = UNUserNotificationCenter.current()
        let settings = await center.notificationSettings()
        guard settings.authorizationStatus == .notDetermined else { return }
        _ = try await center.requestAuthorization(options: [.alert, .sound])
    }

    private static func scheduleHabit(_ habit: HabitToday, lead: Int) {
        guard let clock = habit.preferredTime,
              let (hour, minute) = parseClock(clock)
        else { return }
        var date = DateComponents()
        date.hour = hour
        date.minute = max(0, minute - lead)
        let content = UNMutableNotificationContent()
        content.title = habit.name
        content.body = NSLocalizedString("Toca para marcar tu hábito de hoy",
                                         comment: "")
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: date,
                                                    repeats: true)
        let request = UNNotificationRequest(
            identifier: habitPrefix + habit.id, content: content,
            trigger: trigger)
        UNUserNotificationCenter.current().add(request)
    }

    private static func schedulePlanning(day: TodayResponse?,
                                         settings: AppSettings) {
        let tasks = (day?.overdue ?? []) + (day?.dueToday ?? [])
            + (day?.scheduledToday ?? [])
        let open = tasks.filter { !$0.isDone }
        guard !open.isEmpty else { return }
        var date = DateComponents()
        date.hour = settings.planningHour
        date.minute = settings.planningMinute
        let content = UNMutableNotificationContent()
        content.title = NSLocalizedString("Tu día en Ordo", comment: "")
        content.body = open.count == 1
            ? NSLocalizedString("Tienes 1 tarea pendiente hoy", comment: "")
            : String(format: NSLocalizedString(
                "Tienes %d tareas pendientes hoy", comment: ""),
                open.count)
        content.sound = .default
        let trigger = UNCalendarNotificationTrigger(dateMatching: date,
                                                    repeats: true)
        UNUserNotificationCenter.current().add(UNNotificationRequest(
            identifier: planningId, content: content, trigger: trigger))
    }

    private static func parseClock(_ clock: String) -> (Int, Int)? {
        let parts = clock.split(separator: ":").compactMap { Int($0) }
        guard parts.count == 2,
              (0...23).contains(parts[0]), (0...59).contains(parts[1])
        else { return nil }
        return (parts[0], parts[1])
    }
}

/// El aviso de fin de foco vive en `FocusViewModel` con este identificador.
let FocusEndRequestId = "ordo-focus-end"
