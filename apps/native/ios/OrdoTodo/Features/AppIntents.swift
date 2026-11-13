import AppIntents

/// Paridad con los launcher shortcuts de Android (ODD 052 T8).
/// `capture` ("Nueva tarea") y `today` ("Hoy") + foco.
/// Todos abren la app: el token vive en el Keychain y nunca sale de ella;
/// el intent solo deja el texto/destino en `SharedInbox` y la app lo
/// consume al activarse (`DeepLinkRouter`).
struct CaptureTaskIntent: AppIntent {
    static var title: LocalizedStringResource = "Añadir tarea"
    static var description = IntentDescription(
        "Guarda una tarea en Ordo con el texto que le dictes o compartas")
    static var openAppWhenRun = true

    @Parameter(title: "Texto")
    var text: String

    init() {
        text = ""
    }

    init(text: String) {
        self.text = text
    }

    static var parameterSummary: some ParameterSummary {
        Summary("Añadir \(\.$text)")
    }

    func perform() async throws -> some IntentResult {
        SharedInbox.saveShare(text: text)
        SharedInbox.requestDestination(.captura)
        return .result()
    }
}

struct ShowTodayIntent: AppIntent {
    static var title: LocalizedStringResource = "Hoy"
    static var description = IntentDescription("Abre tu día en Ordo")
    static var openAppWhenRun = true

    func perform() async throws -> some IntentResult {
        SharedInbox.requestDestination(.hoy)
        return .result()
    }
}

struct StartFocusIntent: AppIntent {
    static var title: LocalizedStringResource = "Empezar foco"
    static var description = IntentDescription("Abre el temporizador de foco")
    static var openAppWhenRun = true

    func perform() async throws -> some IntentResult {
        SharedInbox.requestDestination(.foco)
        return .result()
    }
}

/// Atajos de la app (Siri, Spotlight, app Atajos): frases ES/EN/PT.
struct OrdoShortcuts: AppShortcutsProvider {
    static var appShortcuts: [AppShortcut] {
        AppShortcut(
            intent: CaptureTaskIntent(),
            phrases: [
                "Añadir tarea en \(.applicationName)",
                "Nueva tarea en \(.applicationName)",
                "Add task in \(.applicationName)",
                "New task in \(.applicationName)",
                "Adicionar tarefa em \(.applicationName)",
                "Nova tarefa em \(.applicationName)",
            ],
            shortTitle: "Añadir tarea",
            systemImageName: "plus.circle"
        )
        AppShortcut(
            intent: ShowTodayIntent(),
            phrases: [
                "Ver mi día en \(.applicationName)",
                "Abrir Hoy en \(.applicationName)",
                "Show my day in \(.applicationName)",
                "Open Today in \(.applicationName)",
                "Ver meu dia em \(.applicationName)",
                "Abrir Hoje em \(.applicationName)",
            ],
            shortTitle: "Hoy",
            systemImageName: "sun.max"
        )
        AppShortcut(
            intent: StartFocusIntent(),
            phrases: [
                "Empezar foco en \(.applicationName)",
                "Start focus in \(.applicationName)",
                "Começar foco em \(.applicationName)",
            ],
            shortTitle: "Empezar foco",
            systemImageName: "timer"
        )
    }
}
