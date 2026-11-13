import SwiftUI

/// Pestaña Tareas (ODD 052 T3): large title + búsqueda nativa + control
/// segmentado (Próximas · Sin fecha · Proyectos). Traducción HIG de
/// `TasksScreen.kt`: el segmentado ES el ámbito (sin scope bar aparte).
struct TasksView: View {
    @Environment(SessionStore.self) private var session
    @State private var vm: TasksViewModel?
    @State private var showCapture = false

    var body: some View {
        Group {
            if let vm {
                TasksContent(vm: vm)
                    .searchable(text: Binding(
                        get: { vm.query },
                        set: { vm.setQuery($0) }
                    ), placement: .navigationBarDrawer(displayMode: .always))
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task { vm = TasksViewModel(session: session) }
            }
        }
        .navigationTitle("Tareas")
        .navigationDestination(for: TodayTask.self) { task in
            TaskDetailView(taskId: task.id)
        }
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Añadir tarea", systemImage: "plus") {
                    showCapture = true
                }
                .accessibilityLabel("Añadir tarea")
            }
        }
        .sheet(isPresented: $showCapture) {
            CaptureSheet {
                Task { await vm?.load() }
            }
        }
    }
}

private struct TasksContent: View {
    @Bindable var vm: TasksViewModel
    @Environment(FocusViewModel.self) private var focus

    var body: some View {
        List {
            if vm.isSearchingServer && !vm.serverResults.isEmpty {
                Section("Resultados") {
                    ForEach(vm.serverResults) { hit in
                        QuickResultRow(hit: hit) { vm.openServerResult(hit) }
                    }
                }
            }
            if vm.bucket == .projects && vm.projectFilter == nil {
                Section("Proyectos") {
                    ForEach(vm.projects) { project in
                        Button {
                            vm.projectFilter = project
                        } label: {
                            HStack {
                                Circle()
                                    .fill(Color(hex: project.color) ?? .purple)
                                    .frame(width: 10, height: 10)
                                    .accessibilityHidden(true)
                                Text(project.name)
                                Spacer()
                            }
                        }
                        .buttonStyle(.plain)
                    }
                }
            } else {
                ForEach(vm.sections, id: \.kind) { section in
                    if !section.tasks.isEmpty {
                        Section(sectionTitle(section.kind)) {
                            ForEach(section.tasks) { task in
                                NavigationLink(value: task) {
                                    TaskRow(
                                        task: task,
                                        onToggle: { vm.toggle(task) },
                                        onDelete: { vm.remove(task) },
                                        onFocus: {
                                            focus.start(taskId: task.id,
                                                        title: task.title)
                                        }
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }
                }
            }
        }
        .overlay(alignment: .top) {
            Picker("Filtro", selection: $vm.bucket) {
                ForEach(TasksViewModel.Bucket.allCases, id: \.self) { bucket in
                    Text(bucket.title).tag(bucket)
                }
            }
            .pickerStyle(.segmented)
            .padding(.horizontal)
            .padding(.top, 4)
            .background(.bar)
        }
        .refreshable { await vm.load() }
        .task { await vm.load() }
        .onReceive(NotificationCenter.default.publisher(
            for: .ordoFilterProject)) { note in
            if let id = note.object as? String {
                vm.filterByProject(id: id)
            }
        }
        .toolbar {
            if vm.projectFilter != nil {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Todos los proyectos") { vm.clearProject() }
                }
            }
        }
    }

    private func sectionTitle(_ kind: TasksSectionKind) -> String {
        switch kind {
        case .upcoming: return vm.bucket == .projects
            ? L("%@ · %@", TasksViewModel.Bucket.upcoming.title,
                vm.projectFilter?.name ?? "") : TasksViewModel.Bucket
            .upcoming.title
        case .undated: return TasksViewModel.Bucket.undated.title
        case .done: return NSLocalizedString("Hechas", comment: "")
        }
    }
}

/// La fila compartida vive en `TaskRow.swift` (`QuickResultRow`).
