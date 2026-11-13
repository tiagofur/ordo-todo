import Foundation

/// Foto del día compartida con el Widget (ODD 052): la app la escribe en el
/// contenedor del App Group tras cada pull; el Widget la lee (grupo
/// `group.dev.creapolis.ordotodo`). Sin grupo aprovisionado, el Widget
/// muestra su placeholder: nunca rompe. Este archivo compila en la app y
/// en la extensión (sin duplicar el formato).
struct DaySnapshotTask: Codable, Equatable {
    var title: String
    var time: String?
    var done: Bool = false
}

struct DaySnapshot: Codable, Equatable {
    var dateKey: String
    var done: Int = 0
    var total: Int = 0
    var focusMinutes: Int = 0
    var tasks: [DaySnapshotTask] = []

    static let appGroup = "group.dev.creapolis.ordotodo"
    private static let filename = "ordo-day.json"

    static var container: URL? {
        FileManager.default.containerURL(
            forSecurityApplicationGroupIdentifier: appGroup)?
            .appendingPathComponent(filename)
    }

    static func load() -> DaySnapshot? {
        guard let url = container,
              let data = try? Data(contentsOf: url)
        else { return nil }
        return try? JSONDecoder().decode(DaySnapshot.self, from: data)
    }

    func save() {
        guard let url = Self.container else { return }
        try? JSONEncoder().encode(self).write(to: url, options: .atomic)
    }

    static func placeholder() -> DaySnapshot {
        DaySnapshot(dateKey: "hoy", done: 3, total: 9, focusMinutes: 75,
                    tasks: [
                        DaySnapshotTask(title: "Revisar el plan",
                                        time: "09:00"),
                        DaySnapshotTask(title: "Llamar al banco",
                                        time: "12:30"),
                        DaySnapshotTask(title: "Leer 20 minutos",
                                        time: "21:00"),
                    ])
    }
}
