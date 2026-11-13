import Foundation

/// Auth por email (ODD 052): espejo de `AuthSession`/`AuthViewModel` de
/// Android. `POST /auth/login` y `POST /auth/register` devuelven
/// `{accessToken, refreshToken}`; OAuth queda en web (App Store 4.8
/// exige Apple allí de todos modos; el backend no tiene proveedor).
@Observable
final class AuthViewModel {
    enum Mode {
        case login, register
    }

    private let client: ApiClient
    private let session: SessionStore

    var mode: Mode = .login
    var email = ""
    var password = ""
    var username = ""
    var name = ""
    var inviteCode = ""
    var busy = false
    var errorMessage: String?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.session = session
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var isValid: Bool {
        guard email.trimmingCharacters(in: .whitespaces).contains("@"),
              !password.isEmpty
        else { return false }
        if mode == .register {
            return !username.trimmingCharacters(in: .whitespaces).isEmpty
                && !name.trimmingCharacters(in: .whitespaces).isEmpty
        }
        return true
    }

    @MainActor
    func submit() async {
        guard !busy, isValid else {
            errorMessage = "Revisa el correo y la contraseña"
            return
        }
        busy = true
        errorMessage = nil
        defer { busy = false }
        do {
            let body: Data
            let path: String
            if mode == .login {
                struct Login: Encodable { let email: String; let password: String }
                body = try JSONEncoder().encode(Login(
                    email: email.trimmingCharacters(in: .whitespaces),
                    password: password))
                path = "/auth/login"
            } else {
                struct Register: Encodable {
                    let email: String; let username: String; let name: String
                    let password: String; let inviteCode: String?
                }
                let code = inviteCode.trimmingCharacters(in: .whitespaces)
                body = try JSONEncoder().encode(Register(
                    email: email.trimmingCharacters(in: .whitespaces),
                    username: username.trimmingCharacters(in: .whitespaces),
                    name: name.trimmingCharacters(in: .whitespaces),
                    password: password,
                    inviteCode: code.isEmpty ? nil : code))
                path = "/auth/register"
            }
            struct Tokens: Decodable { let accessToken: String; let refreshToken: String }
            let data = try await client.post(path, body: body)
            let tokens = try JSONDecoder().decode(Tokens.self, from: data)
            session.save(access: tokens.accessToken, refresh: tokens.refreshToken)
        } catch let error as ApiError {
            switch error {
            case .unauthorized, .server:
                errorMessage = "Credenciales inválidas"
            case .network:
                errorMessage = "Sin conexión: inténtalo de nuevo"
            }
        } catch {
            errorMessage = "Algo falló: inténtalo de nuevo"
        }
    }
}
