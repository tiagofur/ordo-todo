import Foundation

/// Caché de lectura offline (ODD 052): espejo del `DayStore` de Android.
/// Guarda el último Hoy + hábitos en Application Support; sin red, la app
/// muestra la copia con aviso en vez de una pantalla de error.
struct CachedDay: Codable {
    var savedAt: Double = 0
    var today: TodayResponse?
    var habits: [HabitToday] = []
}

final class DayCache {
    static let shared = DayCache()
    private let file: URL
    private let decoder = JSONDecoder()
    private let encoder = JSONEncoder()

    init(filename: String = "ordo-day-cache.json") {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory,
                                           in: .userDomainMask).first!
        try? FileManager.default.createDirectory(at: dir,
                                                 withIntermediateDirectories: true)
        self.file = dir.appendingPathComponent(filename)
    }

    func load() -> CachedDay {
        guard let data = try? Data(contentsOf: file),
              let cached = try? decoder.decode(CachedDay.self, from: data)
        else { return CachedDay() }
        return cached
    }

    func save(today: TodayResponse? = nil, habits: [HabitToday]? = nil) {
        var cached = load()
        if let today { cached.today = today }
        if let habits { cached.habits = habits }
        cached.savedAt = Date().timeIntervalSince1970
        try? encoder.encode(cached).write(to: file, options: .atomic)
    }

    func clear() {
        try? FileManager.default.removeItem(at: file)
    }
}
