import Foundation

/// Cola de escrituras offline (ODD 052, espejo de `Outbox.kt` + `StatusSync`
/// + `HabitSync` de Android, D3): una sola cola ordenada con coalescencia.
/// 4xx descarta, red espera. Vive en un JSON en Application Support.
enum OutboxOp: Codable, Equatable {
    case statusFlip(taskId: String, done: Bool, at: Double)
    case createTask(localId: String, title: String, date: String?,
                    time: String?, priority: String?, projectId: String?,
                    at: Double)
    case habitCheck(id: String, done: Bool, at: Double)
}

/// Resultado de drenar: lo que queda en cola.
enum OutboxDrainError: Error {
    case network
    case unauthorized
}

@Observable
final class Outbox {
    static let shared = Outbox()

    private let file: URL
    private(set) var pending: [OutboxOp] = []
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(filename: String = "ordo-outbox.json") {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory,
                                           in: .userDomainMask).first!
        try? FileManager.default.createDirectory(at: dir,
                                                 withIntermediateDirectories: true)
        self.file = dir.appendingPathComponent(filename)
        self.pending = (try? decoder.decode([OutboxOp].self,
                                            from: Data(contentsOf: file))) ?? []
        coalesce()
    }

    @MainActor
    func enqueue(_ op: OutboxOp) {
        pending.append(op)
        coalesce()
        persist()
    }

    /// Último flip por tarea gana; creados y checks se conservan en orden.
    private func coalesce() {
        var lastFlip: [String: OutboxOp] = [:]
        var order: [String] = []
        for op in pending {
            if case .statusFlip(let id, _, _) = op {
                if lastFlip[id] == nil { order.append("flip:\(id)") }
                lastFlip[id] = op
            }
        }
        var rest: [OutboxOp] = []
        for op in pending {
            if case .statusFlip(let id, _, _) = op {
                _ = id
                continue
            }
            rest.append(op)
        }
        var flips: [OutboxOp] = []
        for key in order {
            let id = String(key.dropFirst(5))
            if let op = lastFlip[id] { flips.append(op) }
        }
        pending = rest + flips
    }

    @MainActor
    func remove(_ op: OutboxOp) {
        pending.removeAll { $0 == op }
        persist()
    }

    @MainActor
    func clear() {
        pending.removeAll()
        persist()
    }

    private func persist() {
        try? encoder.encode(pending).write(to: file, options: .atomic)
    }

    /// Intenta cada op en orden contra el `client`. Devuelve las que quedan.
    func drain(client: ApiClient) async -> OutboxDrainError? {
        // Copia para iterar; las mutaciones van por MainActor.
        let ops = await MainActor.run { pending }
        for op in ops {
            do {
                switch op {
                case .statusFlip(let id, let done, _):
                    if done {
                        try await client.patch("/tasks/\(id)/complete")
                    } else {
                        let body = try JSONEncoder().encode(["status": "TODO"])
                        try await client.patch("/tasks/\(id)", body: body)
                    }
                case .createTask(_, let title, let date, let time,
                                 let priority, let projectId, _):
                    var dict: [String: Any] = ["title": title]
                    if let date { dict["scheduledDate"] = date }
                    if let time { dict["scheduledTime"] = time }
                    if let priority { dict["priority"] = priority }
                    if let projectId { dict["projectId"] = projectId }
                    let body = try JSONSerialization.data(withJSONObject: dict)
                    _ = try await client.post("/tasks", body: body)
                case .habitCheck(let id, let done, _):
                    if done {
                        _ = try await client.post("/habits/\(id)/complete",
                                                  body: Data("{}".utf8))
                    } else {
                        try await client.delete("/habits/\(id)/complete")
                    }
                }
                await MainActor.run { remove(op) }
            } catch let error as ApiError {
                switch error {
                case .unauthorized:
                    return .unauthorized
                case .server(let status, _):
                    // 4xx: el servidor manda; se descarta sin reintento.
                    if (400..<500).contains(status) {
                        await MainActor.run { remove(op) }
                    } else {
                        return .network
                    }
                case .network:
                    return .network
                }
            } catch {
                return .network
            }
        }
        return nil
    }
}
