import Foundation

/// Ajustes locales (ODD 052): espejo de `AppSettings` + `SettingsLogic` de
/// Android. `UserDefaults` en vez de DataStore. iOS sigue al sistema en
/// apariencia e idioma (HIG): aquí solo horas, antelación y avisos.
@Observable
final class AppSettings {
    static let shared = AppSettings()

    private let defaults: UserDefaults
    private enum Key {
        static let availableMinutes = "ordo.availableMinutes"
        static let reminderLead = "ordo.reminderLeadMinutes"
        static let habitReminders = "ordo.habitReminders"
        static let planning = "ordo.planning"
        static let planningHour = "ordo.planningHour"
        static let planningMinute = "ordo.planningMinute"
    }

    init(defaults: UserDefaults = .standard) {
        self.defaults = defaults
        if defaults.object(forKey: Key.availableMinutes) == nil {
            defaults.set(480, forKey: Key.availableMinutes)
        }
        if defaults.object(forKey: Key.reminderLead) == nil {
            defaults.set(0, forKey: Key.reminderLead)
        }
        if defaults.object(forKey: Key.habitReminders) == nil {
            defaults.set(true, forKey: Key.habitReminders)
        }
        if defaults.object(forKey: Key.planning) == nil {
            defaults.set(true, forKey: Key.planning)
        }
        if defaults.object(forKey: Key.planningHour) == nil {
            defaults.set(8, forKey: Key.planningHour)
        }
        if defaults.object(forKey: Key.planningMinute) == nil {
            defaults.set(0, forKey: Key.planningMinute)
        }
    }

    var availableMinutes: Int {
        get { min(max(defaults.integer(forKey: Key.availableMinutes), 60), 1440) }
        set { defaults.set(min(max(newValue, 60), 1440),
                            forKey: Key.availableMinutes) }
    }

    /// Antelación de avisos en minutos (0 = a la hora, 10, 30).
    var reminderLeadMinutes: Int {
        get {
            let v = defaults.integer(forKey: Key.reminderLead)
            return [0, 10, 30].contains(v) ? v : 0
        }
        set { defaults.set([0, 10, 30].contains(newValue) ? newValue : 0,
                            forKey: Key.reminderLead) }
    }

    var habitRemindersEnabled: Bool {
        get { defaults.bool(forKey: Key.habitReminders) }
        set { defaults.set(newValue, forKey: Key.habitReminders) }
    }

    var planningEnabled: Bool {
        get { defaults.bool(forKey: Key.planning) }
        set { defaults.set(newValue, forKey: Key.planning) }
    }

    var planningHour: Int {
        get { min(max(defaults.integer(forKey: Key.planningHour), 0), 23) }
        set { defaults.set(min(max(newValue, 0), 23),
                            forKey: Key.planningHour) }
    }

    var planningMinute: Int {
        get { min(max(defaults.integer(forKey: Key.planningMinute), 0), 59) }
        set { defaults.set(min(max(newValue, 0), 59),
                            forKey: Key.planningMinute) }
    }
}
