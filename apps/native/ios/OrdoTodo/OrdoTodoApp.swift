import SwiftUI

/// Punto de entrada de la app iOS nativa (ODD 052 T1).
/// SwiftUI + iOS 26+, mismo backend NestJS `/api/v1` que Android.
@main
struct OrdoTodoApp: App {
    @State private var session = SessionStore()
    @State private var router = DeepLinkRouter()
    @Environment(\.scenePhase) private var phase

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(session)
                .environment(router)
                .onOpenURL { router.open(url: $0) }
                .onAppear { router.consumeSharedInbox() }
        }
        .onChange(of: phase) { _, newPhase in
            if newPhase == .active {
                router.consumeSharedInbox()
            }
        }
    }
}
