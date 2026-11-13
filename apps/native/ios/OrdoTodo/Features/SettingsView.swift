import SwiftUI
import UserNotifications

/// Ajustes (ODD 052): cuenta, Pomodoro del servidor (`GET`+`PATCH`
/// `/users/me/preferences`), horas del día, avisos locales (antelación,
/// hábitos, planning), sistema (notificaciones, idioma, apariencia del
/// sistema) y zona de peligro. HIG: `Form` agrupado. Sin tema propio ni
/// Dynamic Color: iOS manda fondos del sistema y el frío vive en el tint.
struct SettingsView: View {
    @Environment(SessionStore.self) private var session
    @State private var vm: SettingsViewModel?

    var body: some View {
        Group {
            if let vm {
                SettingsForm(vm: vm)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task { vm = SettingsViewModel(session: session) }
            }
        }
        .navigationTitle("Ajustes")
    }
}

private struct SettingsForm: View {
    @Bindable var vm: SettingsViewModel
    @State private var showDelete = false

    var body: some View {
        Form {
            Section("Cuenta") {
                if let profile = vm.profile {
                    LabeledContent("Nombre", value: profile.displayName)
                    LabeledContent("Correo", value: profile.email)
                    LabeledContent("Plan", value: profile.plan)
                    Text("El plan se gestiona en la web")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                } else if vm.profileFailed {
                    Text("Sin conexión: no se pudo cargar el perfil")
                        .foregroundStyle(.secondary)
                }
                Button("Recuperar contraseña") {
                    Task { await vm.sendForgot() }
                }
                .disabled(vm.forgotEmail.isEmpty || vm.forgotBusy)
                if vm.forgotSent {
                    Text("Revisa tu correo para seguir los pasos")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }

            Section("Pomodoro") {
                HStack(spacing: 12) {
                    PomoField(label: "Foco", text: $vm.pomoWork)
                    PomoField(label: "Pausa", text: $vm.pomoShort)
                }
                HStack(spacing: 12) {
                    PomoField(label: "Pausa larga", text: $vm.pomoLong)
                    PomoField(label: "Rondas", text: $vm.pomoCount)
                }
                Button("Guardar Pomodoro") {
                    Task { await vm.savePomodoro() }
                }
                .disabled(!vm.pomoValid || vm.pomoSaving)
                if vm.pomoSaved {
                    Text("Pomodoro guardado")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
                if vm.pomoError {
                    Text("No se pudo guardar")
                        .font(.caption)
                        .foregroundStyle(.red)
                }
            }

            Section("Horas del día") {
                Stepper(L("Disponibles: %@",
                          vm.settings.availableMinutes.mins),
                        value: Binding(
                            get: { vm.settings.availableMinutes },
                            set: { vm.settings.availableMinutes = $0 }
                        ), in: 60...1440, step: 30)
                Text("Frente a esto se mide la carga del día en Hoy")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("Avisos") {
                Picker("Antelación", selection: Binding(
                    get: { vm.settings.reminderLeadMinutes },
                    set: { vm.settings.reminderLeadMinutes = $0 }
                )) {
                    Text("A la hora").tag(0)
                    Text("10 min antes").tag(10)
                    Text("30 min antes").tag(30)
                }
                .pickerStyle(.segmented)
                Toggle("Recordar hábitos", isOn: Binding(
                    get: { vm.settings.habitRemindersEnabled },
                    set: {
                        vm.settings.habitRemindersEnabled = $0
                        vm.applyNotificationSettings()
                    }
                ))
                Toggle("Resumen diario", isOn: Binding(
                    get: { vm.settings.planningEnabled },
                    set: {
                        vm.settings.planningEnabled = $0
                        vm.applyNotificationSettings()
                    }
                ))
                if vm.settings.planningEnabled {
                    DatePicker("Hora del resumen",
                               selection: Binding(
                                   get: { vm.planningTime },
                                   set: {
                                       vm.setPlanningTime($0)
                                       vm.applyNotificationSettings()
                                   }
                               ),
                               displayedComponents: .hourAndMinute)
                }
            }

            Section("Sistema") {
                Button {
                    vm.openSystemSettings()
                } label: {
                    LabeledContent("Notificaciones",
                                   value: vm.notificationsStatus)
                }
                Button {
                    vm.openSystemSettings()
                } label: {
                    LabeledContent("Idioma",
                                   value: Locale.current.identifier)
                }
                Text("Apariencia: la del sistema (claro/oscuro)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Section("Acerca de") {
                LabeledContent("Versión", value: "0.1.0")
            }

            Section {
                Button("Cerrar sesión", role: .destructive) {
                    vm.signOut()
                }
            }

            Section("Zona de peligro") {
                Button("Borrar cuenta", role: .destructive) {
                    showDelete = true
                }
                .alert("Borrar cuenta", isPresented: $showDelete) {
                    Button("Cancelar", role: .cancel) {}
                    Button("Borrar todo", role: .destructive) {
                        Task { await vm.deleteAccount() }
                    }
                } message: {
                    Text("Se borran tu cuenta y tus datos. No hay vuelta atrás.")
                }
                if vm.deleteFailed {
                    Text("No se pudo borrar: inténtalo de nuevo")
                        .font(.caption)
                        .foregroundStyle(.red)
                }
            }
        }
        .refreshable { await vm.load() }
        .task { await vm.load() }
    }
}

private struct PomoField: View {
    let label: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
            TextField("25", text: $text)
                .keyboardType(.numberPad)
                .textFieldStyle(.roundedBorder)
        }
    }
}

private extension Int {
    var mins: String {
        if self <= 0 { return L("%d min", 0) }
        let h = self / 60
        let r = self % 60
        if h > 0 && r > 0 { return L("%d h %d min", h, r) }
        if h > 0 { return L("%d h", h) }
        return L("%d min", r)
    }
}

@Observable
final class SettingsViewModel {
    struct Profile {
        var name: String
        var username: String
        var email: String
        var plan: String

        var displayName: String {
            !name.isEmpty ? name : (!username.isEmpty ? username : email)
        }
    }

    private let client: ApiClient
    private let session: SessionStore
    let settings: AppSettings

    var profile: Profile?
    var profileFailed = false
    var forgotSent = false
    var forgotBusy = false
    var deleteFailed = false
    var notificationsStatus = "…"

    var pomoWork = ""
    var pomoShort = ""
    var pomoLong = ""
    var pomoCount = ""
    var pomoSaving = false
    var pomoSaved = false
    var pomoError = false

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL,
         settings: AppSettings = .shared) {
        self.session = session
        self.settings = settings
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    var forgotEmail: String { profile?.email ?? "" }

    var pomoValid: Bool {
        let nums = [pomoWork, pomoShort, pomoLong, pomoCount]
            .map { Int($0) }
        guard nums.allSatisfy({ ($0 ?? 0) > 0 }) else { return false }
        return true
    }

    var planningTime: Date {
        var comps = DateComponents()
        comps.hour = settings.planningHour
        comps.minute = settings.planningMinute
        return Calendar.current.date(from: comps) ?? Date()
    }

    func setPlanningTime(_ date: Date) {
        let comps = Calendar.current.dateComponents([.hour, .minute],
                                                    from: date)
        settings.planningHour = comps.hour ?? 8
        settings.planningMinute = comps.minute ?? 0
    }

    @MainActor
    func load() async {
        await refreshNotificationStatus()
        profileFailed = false
        do {
            struct Wire: Decodable {
                var name: String = ""
                var username: String = ""
                var email: String = ""
                var subscription: Plan = Plan()
                struct Plan: Decodable { var plan: String = "FREE" }
            }
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/users/me/profile")
            let wire = try decoder.decode(Wire.self, from: data)
            profile = Profile(name: wire.name, username: wire.username,
                              email: wire.email, plan: wire.subscription.plan)
        } catch {
            if profile == nil { profileFailed = true }
        }
        do {
            struct Prefs: Decodable {
                var pomodoroDuration: Int?
                var shortBreakDuration: Int?
                var longBreakDuration: Int?
                var pomodorosUntilLongBreak: Int?
            }
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/users/me/preferences")
            if !data.isEmpty {
                let prefs = try decoder.decode(Prefs.self, from: data)
                pomoWork = String(prefs.pomodoroDuration ?? 25)
                pomoShort = String(prefs.shortBreakDuration ?? 5)
                pomoLong = String(prefs.longBreakDuration ?? 15)
                pomoCount = String(prefs.pomodorosUntilLongBreak ?? 4)
            }
        } catch { /* valores por defecto del formulario vacío */ }
    }

    @MainActor
    func savePomodoro() async {
        guard pomoValid, !pomoSaving else { return }
        pomoSaving = true
        pomoSaved = false
        pomoError = false
        defer { pomoSaving = false }
        do {
            let body = try JSONEncoder().encode([
                "pomodoroDuration": Int(pomoWork) ?? 25,
                "shortBreakDuration": Int(pomoShort) ?? 5,
                "longBreakDuration": Int(pomoLong) ?? 15,
                "pomodorosUntilLongBreak": Int(pomoCount) ?? 4,
            ])
            try await client.patch("/users/me/preferences", body: body)
            pomoSaved = true
        } catch {
            pomoError = true
        }
    }

    @MainActor
    func sendForgot() async {
        guard !forgotEmail.isEmpty else { return }
        forgotBusy = true
        defer { forgotBusy = false }
        do {
            let body = try JSONEncoder().encode(["email": forgotEmail])
            _ = try await client.post("/auth/forgot-password", body: body)
            forgotSent = true
        } catch {
            forgotSent = false
        }
    }

    @MainActor
    func applyNotificationSettings() {
        Task {
            try? await NotificationScheduler.requestIfNeeded()
            await refreshNotificationStatus()
        }
    }

    @MainActor
    func deleteAccount() async {
        deleteFailed = false
        do {
            try await client.delete("/users/me")
            session.clear()
        } catch {
            deleteFailed = true
        }
    }

    @MainActor
    func signOut() { session.clear() }

    @MainActor
    func openSystemSettings() {
        if let url = URL(string: UIApplication.openSettingsURLString) {
            UIApplication.shared.open(url)
        }
    }

    @MainActor
    private func refreshNotificationStatus() async {
        let settings = await UNUserNotificationCenter.current()
            .notificationSettings()
        notificationsStatus = switch settings.authorizationStatus {
        case .authorized, .provisional, .ephemeral:
            NSLocalizedString("Activadas", comment: "")
        case .denied: NSLocalizedString("Desactivadas", comment: "")
        default: NSLocalizedString("Sin decidir", comment: "")
        }
    }
}
