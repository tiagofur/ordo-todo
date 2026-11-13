import SwiftUI

/// Búsqueda global (ODD 052 S4): `GET /search/quick` con debounce, alcance a
/// una mano en iPhone (placement automático → campo abajo en Liquid Glass).
/// Tarea → detalle con push; proyecto → filtra la pestaña Tareas.
struct SearchTabView: View {
    @Environment(SessionStore.self) private var session
    @State private var vm: SearchTabViewModel?
    @State private var selectedTaskId: String?
    @State private var query = ""

    var body: some View {
        Group {
            if let vm {
                SearchResults(vm: vm, selectedTaskId: $selectedTaskId)
                    .searchable(text: $query, placement: .automatic,
                                prompt: "Tareas y proyectos")
                    .onChange(of: query) { _, value in
                        vm.setQuery(value)
                    }
                    .searchSuggestions {
                        Text("Hoy").searchCompletion("hoy")
                        Text("Vencidas").searchCompletion("vencidas")
                    }
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task { vm = SearchTabViewModel(session: session) }
            }
        }
        .navigationTitle("Buscar")
        .navigationDestination(item: $selectedTaskId) { id in
            TaskDetailView(taskId: id)
        }
    }
}

private struct SearchResults: View {
    @Bindable var vm: SearchTabViewModel
    @Binding var selectedTaskId: String?

    var body: some View {
        Group {
            if vm.query.trimmingCharacters(in: .whitespaces).count < 2 {
                ContentUnavailableView.search
            } else if vm.searching && vm.results.isEmpty {
                ProgressView("Buscando…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if vm.results.isEmpty {
                ContentUnavailableView.search(text: vm.query)
            } else {
                List(vm.results) { hit in
                    QuickResultRow(hit: hit) {
                        if hit.isProject {
                            NotificationCenter.default.post(
                                name: .ordoFilterProject,
                                object: hit.id)
                        } else {
                            selectedTaskId = hit.id
                        }
                    }
                }
                .refreshable { await vm.research() }
            }
        }
    }
}

@Observable
final class SearchTabViewModel {
    private let client: ApiClient

    var query = ""
    var results: [QuickResult] = []
    var searching = false
    private var searchTask: Task<Void, Never>?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    @MainActor
    func setQuery(_ value: String) {
        query = value
        searchTask?.cancel()
        guard shouldSearchServer(value) else {
            results = []
            searching = false
            return
        }
        let needle = value
        searching = true
        searchTask = Task { @MainActor in
            try? await Task.sleep(nanoseconds: 400_000_000)
            guard !Task.isCancelled, self.query == needle else { return }
            do {
                let encoded = needle.addingPercentEncoding(
                    withAllowedCharacters: .urlQueryAllowed) ?? needle
                let raw = String(data: try await self.client.getData(
                    "/search/quick?q=\(encoded)"), encoding: .utf8) ?? ""
                self.results = parseQuickResults(raw)
            } catch {
                self.results = []
            }
            self.searching = false
        }
    }

    @MainActor
    func research() async {
        let q = query
        setQuery("")
        setQuery(q)
    }
}

/// Proyecto elegido en Buscar → la pestaña Tareas lo filtra.
extension Notification.Name {
    static let ordoFilterProject = Notification.Name("ordoFilterProject")
}
