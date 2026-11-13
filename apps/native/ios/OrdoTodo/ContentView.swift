import SwiftUI

/// Shell nativo iOS (ODD 052 T2): TabView flotante Liquid Glass + búsqueda.
/// Traducción de la shell M3 de Android (NavigationBar/rail) a HIG:
/// tab bar cápsula que encoge al hacer scroll, search como destino dedicado,
/// accesorio inferior con el progreso del día.
struct ContentView: View {
    @Environment(SessionStore.self) private var session
    @Environment(DeepLinkRouter.self) private var router
    @State private var hoyVM: HoyViewModel?
    @State private var focusVM: FocusViewModel?
    @State private var searchText = ""

    var body: some View {
        @Bindable var router = router
        if !session.isSignedIn {
            AuthView()
        } else if let vm = hoyVM, let focus = focusVM {
            TabView(selection: $router.selectedTab) {
                Tab("Hoy", systemImage: "sun.max", value: OrdoTab.hoy) {
                    NavigationStack {
                        TodayView()
                            .environment(vm)
                    }
                }
                Tab("Tareas", systemImage: "checklist", value: OrdoTab.tareas) {
                    NavigationStack {
                        TasksView()
                    }
                }
                Tab("Hábitos", systemImage: "leaf", value: OrdoTab.habitos) {
                    NavigationStack {
                        HabitsView()
                    }
                }
                Tab("Ajustes", systemImage: "gearshape", value: OrdoTab.ajustes) {
                    NavigationStack {
                        SettingsView()
                    }
                }
                Tab("Buscar", systemImage: "magnifyingglass",
                    value: OrdoTab.buscar) {
                    NavigationStack {
                        SearchTabView()
                    }
                }
            }
            .tabBarMinimizeBehavior(.onScrollDown)
            .environment(focus)
            .tabViewBottomAccessory {
                if focus.isActive {
                    Button {
                        router.showFocus = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "timer")
                                .foregroundStyle(.purple)
                                .accessibilityHidden(true)
                            Text(focus.taskTitle ?? focus.phaseLabel)
                                .font(.caption)
                                .lineLimit(1)
                            Text(focus.remainingText)
                                .font(.caption)
                                .monospacedDigit()
                        }
                        .padding(.horizontal, 4)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel(
                        L("Abrir foco: %@ restantes",
                          focus.remainingText))
                } else if vm.allTasks.count > 0 {
                    HStack(spacing: 8) {
                        ProgressView(value: vm.capacity.clampedProgress)
                            .tint(.purple)
                        Text(vm.progressText)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                    .padding(.horizontal, 4)
                    .accessibilityElement(children: .combine)
                }
            }
            .fullScreenCover(isPresented: $router.showFocus) {
                FocusView(vm: focus)
            }
            .sheet(isPresented: $router.showCapture) {
                CaptureSheet(initialText: router.captureText ?? "") {
                    router.showCapture = false
                    Task { await vm.load() }
                }
            }
            .searchable(text: $searchText, placement: .automatic)
            .searchSuggestions {
                Text("Hoy").searchCompletion("hoy")
                Text("Vencidas").searchCompletion("vencidas")
            }
        } else {
            ProgressView()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
                .task {
                    hoyVM = HoyViewModel(session: session)
                    focusVM = FocusViewModel(session: session)
                }
        }
    }
}

/// El acceso vive en `AuthView.swift` (T4).
