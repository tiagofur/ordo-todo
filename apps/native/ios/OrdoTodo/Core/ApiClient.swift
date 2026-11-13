import Foundation

/// Errores del cliente HTTP compartido (`/api/v1`), espejo de ApiClient.kt (Android).
enum ApiError: Error, Equatable {
    case unauthorized
    case network(Error?)
    case server(status: Int, message: String)

    static func == (lhs: ApiError, rhs: ApiError) -> Bool {
        switch (lhs, rhs) {
        case (.unauthorized, .unauthorized): return true
        case (.server(let a, _), .server(let b, _)): return a == b
        default: return false
        }
    }
}

/// Cliente JSON mínimo contra el NestJS compartido.
/// Bearer + refresh de un solo uso con puerta serializada (igual que RefreshGate.kt).
actor ApiClient {
    let baseURL: URL
    private let session: SessionStore
    private let decoder: JSONDecoder
    private var refreshing = false

    init(baseURL: URL, session: SessionStore) {
        self.baseURL = baseURL
        self.session = session
        self.decoder = JSONDecoder()
        self.decoder.keyDecodingStrategy = .convertFromSnakeCase
    }

    func get<T: Decodable>(_ path: String, as type: T.Type = T.self) async throws -> T where T: Decodable {
        try await request("GET", path, body: nil, as: type)
    }

    func getData(_ path: String) async throws -> Data {
        try await requestData("GET", path, body: nil)
    }

    func post(_ path: String, body: Data? = nil) async throws -> Data {
        try await requestData("POST", path, body: body)
    }

    func patch(_ path: String, body: Data? = nil) async throws {
        _ = try await requestData("PATCH", path, body: body)
    }

    func delete(_ path: String) async throws {
        _ = try await requestData("DELETE", path, body: nil)
    }

    // MARK: - Privado

    private func request<T: Decodable>(
        _ method: String, _ path: String, body: Data?, as type: T.Type
    ) async throws -> T {
        let data = try await requestData(method, path, body: body)
        return try decoder.decode(T.self, from: data)
    }

    private func requestData(_ method: String, _ path: String, body: Data?) async throws -> Data {
        let token = session.accessToken
        do {
            return try await perform(method, path, body: body, token: token)
        } catch ApiError.unauthorized where token != nil {
            try await refreshOnce()
            return try await perform(method, path, body: body, token: session.accessToken)
        }
    }

    private func perform(
        _ method: String, _ path: String, body: Data?, token: String?
    ) async throws -> Data {
        var url = baseURL
        for part in path.split(separator: "/") { url.appendPathComponent(String(part)) }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.httpBody = body
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        let (data, response): (Data, URLResponse)
        do {
            (data, response) = try await URLSession.shared.data(for: req)
        } catch {
            throw ApiError.network(error)
        }
        guard let http = response as? HTTPURLResponse else { throw ApiError.network(nil) }
        switch http.statusCode {
        case 200..<300: return data
        case 401: throw ApiError.unauthorized
        default:
            let msg = String(data: data, encoding: .utf8) ?? "HTTP \(http.statusCode)"
            throw ApiError.server(status: http.statusCode, message: msg)
        }
    }

    /// Refresco serializado: una sola rotación ante N 401 concurrentes.
    private func refreshOnce() async throws {
        while refreshing { try await Task.sleep(nanoseconds: 50_000_000) }
        refreshing = true
        defer { refreshing = false }
        guard let refresh = session.refreshToken else { throw ApiError.unauthorized }
        var url = baseURL
        url.appendPathComponent("auth")
        url.appendPathComponent("refresh")
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        req.httpBody = try JSONEncoder().encode(["refreshToken": refresh])
        let (data, response) = try await URLSession.shared.data(for: req)
        guard let http = response as? HTTPURLResponse, 200..<300 ~= http.statusCode else {
            if (response as? HTTPURLResponse)?.statusCode == 401 {
                session.clear()
                throw ApiError.unauthorized
            }
            throw ApiError.network(nil)
        }
        struct Pair: Decodable { let accessToken: String; let refreshToken: String }
        let pair = try decoder.decode(Pair.self, from: data)
        session.save(access: pair.accessToken, refresh: pair.refreshToken)
    }
}
