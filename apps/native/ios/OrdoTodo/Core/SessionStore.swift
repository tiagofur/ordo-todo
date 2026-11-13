import Foundation
import Security

/// Sesión guardada en Keychain (equivalente iOS del SessionStore cifrado de Android).
/// Solo guarda tokens; la cola offline vive en `DayStore` (T5).
@Observable
final class SessionStore {
    private static let service = "dev.creapolis.ordotodo"
    private static let account = "session"

    var accessToken: String?
    var refreshToken: String?

    var isSignedIn: Bool { accessToken != nil }

    init() {
        let (access, refresh) = Self.read()
        self.accessToken = access
        self.refreshToken = refresh
    }

    func save(access: String, refresh: String) {
        accessToken = access
        refreshToken = refresh
        Self.write(access: access, refresh: refresh)
    }

    /// Cierra la sesión y purga datos locales (caché + cola offline).
    func clear() {
        accessToken = nil
        refreshToken = nil
        Self.delete()
        DayCache.shared.clear()
        Task { @MainActor in Outbox.shared.clear() }
    }

    // MARK: - Keychain

    private static func read() -> (String?, String?) {
        var item: CFTypeRef?
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecReturnData as String: true,
        ]
        guard SecItemCopyMatching(query as CFDictionary, &item) == errSecSuccess,
            let data = item as? Data,
            let joined = String(data: data, encoding: .utf8)
        else { return (nil, nil) }
        let parts = joined.split(separator: "\n", maxSplits: 1).map(String.init)
        return (parts.first, parts.count > 1 ? parts[1] : nil)
    }

    private static func write(access: String, refresh: String) {
        delete()
        let data = "\(access)\n\(refresh)".data(using: .utf8)!
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
            kSecValueData as String: data,
            kSecAttrAccessible as String: kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly,
        ]
        SecItemAdd(query as CFDictionary, nil)
    }

    private static func delete() {
        let query: [String: Any] = [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account,
        ]
        SecItemDelete(query as CFDictionary)
    }
}
