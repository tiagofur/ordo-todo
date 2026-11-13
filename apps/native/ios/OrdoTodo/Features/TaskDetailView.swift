import SwiftUI

/// Detalle de tarea (ODD 052): formulario agrupado HIG con push desde la
/// lista. Título, notas, planificada frente a límite, bloque horario,
/// recurrencia (preajustes; la avanzada vive en la web), proyecto,
/// etiquetas, prioridad, subtareas y estimación; asignados y comentarios
/// en solo lectura; acción primaria «Empezar foco».
struct TaskDetailView: View {
    @Environment(SessionStore.self) private var session
    @Environment(FocusViewModel.self) private var focus
    @Environment(\.dismiss) private var dismiss
    @State private var vm: TaskDetailViewModel?
    @State private var baseline: TaskDetailViewModel.Edited?
    @State private var newSubtask = ""
    @State private var confirmDelete = false
    let taskId: String

    init(taskId: String) {
        self.taskId = taskId
    }

    var body: some View {
        Group {
            if let vm {
                DetailForm(vm: vm, baseline: $baseline,
                           newSubtask: $newSubtask,
                           confirmDelete: $confirmDelete,
                           focus: focus, dismiss: dismiss)
            } else {
                ProgressView("Cargando tarea…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task {
                        let created = TaskDetailViewModel(
                            taskId: taskId, session: session)
                        vm = created
                        await created.load()
                        baseline = created.edited()
                    }
            }
        }
        .navigationTitle("Detalle")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct DetailForm: View {
    @Bindable var vm: TaskDetailViewModel
    @Binding var baseline: TaskDetailViewModel.Edited?
    @Binding var newSubtask: String
    @Binding var confirmDelete: Bool
    let focus: FocusViewModel
    let dismiss: DismissAction

    var body: some View {
        Group {
            if vm.isLoading {
                ProgressView("Cargando tarea…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if vm.loadFailed {
                ContentUnavailableView(
                    "Sin conexión",
                    systemImage: "wifi.slash",
                    description: Text(
                        "No se pudo cargar la tarea. Reintenta."))
            } else {
                Form {
                    Section {
                        TextField("Título", text: $vm.title, axis: .vertical)
                        TextField("Notas", text: $vm.notes, axis: .vertical)
                        Button {
                            focus.start(taskId: vm.taskId,
                                        title: vm.detail?.title)
                        } label: {
                            Label("Empezar foco", systemImage: "timer")
                                .frame(maxWidth: .infinity)
                        }
                        .buttonStyle(.borderedProminent)
                        Button(vm.detail?.isDone == true
                               ? "Reabrir" : "Completar") {
                            Task { await vm.toggleComplete() }
                        }
                    }
                    Section("Planificación") {
                        DateRow(label: "Planificada", value: $vm.scheduledDate)
                        HStack {
                            Text("Hora del bloque")
                            Spacer()
                            TextField("HH:mm", text: $vm.scheduledTime)
                                .multilineTextAlignment(.trailing)
                                .monospacedDigit()
                                .keyboardType(.numbersAndPunctuation)
                                .frame(width: 80)
                        }
                        DateRow(label: "Fecha límite", value: $vm.dueDate)
                    }
                    Section("Organización") {
                        Picker("Prioridad", selection: $vm.priority) {
                            Text("Urgente").tag("URGENT")
                            Text("Alta").tag("HIGH")
                            Text("Media").tag("MEDIUM")
                            Text("Baja").tag("LOW")
                        }
                        Picker("Proyecto", selection: $vm.projectId) {
                            Text("Sin proyecto").tag(nil as String?)
                            ForEach(vm.projects) { project in
                                Text(project.name).tag(project.id as String?)
                            }
                        }
                        HStack {
                            Text("Estimación")
                            Spacer()
                            if vm.estimatedMinutes != nil {
                                EstimateStepper(minutes: Binding(
                                    get: { vm.estimatedMinutes ?? 25 },
                                    set: { vm.estimatedMinutes = $0 }
                                ))
                            } else {
                                Button("Añadir") {
                                    vm.estimatedMinutes = 25
                                }
                            }
                        }
                        if vm.estimatedMinutes != nil {
                            Button("Quitar estimación", role: .destructive) {
                                vm.estimatedMinutes = nil
                            }
                            .font(.caption)
                        }
                        Picker("Repetición", selection: Binding(
                            get: { vm.recurrence?.pattern },
                            set: {
                                vm.recurrence = $0.map {
                                    RecurrenceConfig(pattern: $0)
                                }
                            }
                        )) {
                            Text("Sin repetición").tag(nil as String?)
                            Text("Diaria").tag("DAILY" as String?)
                            Text("Semanal").tag("WEEKLY" as String?)
                            Text("Mensual").tag("MONTHLY" as String?)
                        }
                    }
                    Section("Subtareas") {
                        HStack {
                            if vm.decomposing {
                                ProgressView("Descomponiendo…")
                                    .font(.caption)
                            } else {
                                Button {
                                    Task { await vm.suggestSubtasks() }
                                } label: {
                                    Label("Descomponer con IA",
                                          systemImage: "sparkles")
                                        .font(.caption)
                                }
                            }
                            Spacer()
                        }
                        if let suggestions = vm.suggestions {
                            ForEach(suggestions, id: \.self) { title in
                                HStack {
                                    Text(title)
                                        .font(.body)
                                        .foregroundStyle(.secondary)
                                    Spacer()
                                    Button("Añadir") {
                                        Task {
                                            await vm.acceptSuggestion(title)
                                        }
                                    }
                                    .font(.caption)
                                    Button(role: .destructive) {
                                        vm.suggestions = suggestions
                                            .filter { $0 != title }
                                        if vm.suggestions?.isEmpty == true {
                                            vm.suggestions = nil
                                        }
                                    } label: {
                                        Image(systemName: "xmark")
                                            .foregroundStyle(.secondary)
                                    }
                                    .buttonStyle(.plain)
                                    .accessibilityLabel(
                                        "Descartar sugerencia \(title)")
                                }
                            }
                        }
                        ForEach(vm.detail?.subTasks ?? []) { sub in
                            SubtaskRow(
                                sub: sub,
                                onToggle: { Task { await vm.toggleSubtask(sub) } },
                                onDelete: { Task { await vm.deleteSubtask(sub) } }
                            )
                        }
                        HStack {
                            TextField("Nueva subtarea", text: $newSubtask)
                                .submitLabel(.done)
                                .onSubmit { addSubtask() }
                            Button("Añadir") { addSubtask() }
                                .disabled(newSubtask.trimmingCharacters(
                                    in: .whitespaces).isEmpty)
                        }
                    }
                    if let tags = vm.detail?.tags, !tags.isEmpty {
                        Section("Etiquetas") {
                            FlowChips(items: tags.map(\.name))
                        }
                    }
                    if !vm.comments.isEmpty {
                        Section("Comentarios") {
                            ForEach(vm.comments) { comment in
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(comment.content)
                                        .font(.body)
                                    Text("\(comment.author) · \(comment.date)")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                                .padding(.vertical, 2)
                            }
                        }
                    }
                    Section {
                        Button("Eliminar tarea", role: .destructive) {
                            confirmDelete = true
                        }
                        .alert("Eliminar tarea", isPresented: $confirmDelete) {
                            Button("Cancelar", role: .cancel) {}
                            Button("Eliminar", role: .destructive) {
                                Task {
                                    if await vm.remove() { dismiss() }
                                }
                            }
                        }
                    }
                    if let message = vm.errorMessage {
                        Section {
                            Text(LocalizedStringKey(message))
                                .font(.caption)
                                .foregroundStyle(.red)
                        }
                    }
                }
                .refreshable { await vm.load() }
            }
        }
        .toolbar {
            ToolbarItem(placement: .confirmationAction) {
                Button("Guardar") {
                    Task {
                        if await vm.save() {
                            baseline = vm.edited()
                        }
                    }
                }
                .disabled(vm.saving || !isDirty)
            }
        }
        .task { await vm.load() }
    }

    private var isDirty: Bool {
        guard let baseline else { return false }
        return baseline != vm.edited()
    }

    private func addSubtask() {
        let title = newSubtask
        newSubtask = ""
        Task { await vm.addSubtask(title: title) }
    }
}

/// Fila de subtarea con completar y eliminar.
private struct SubtaskRow: View {
    let sub: SubtaskItem
    let onToggle: () -> Void
    let onDelete: () -> Void

    var body: some View {
        HStack {
            Button(action: onToggle) {
                SubtaskCheck(done: sub.isDone)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(sub.isDone
                ? "Reabrir subtarea" : "Completar subtarea")
            SubtaskTitle(title: sub.title, done: sub.isDone)
            Spacer()
            Button(role: .destructive, action: onDelete) {
                Image(systemName: "trash")
                    .foregroundStyle(.secondary)
            }
            .buttonStyle(.plain)
            .accessibilityLabel(L("Eliminar subtarea %@", sub.title))
        }
    }
}

private struct SubtaskCheck: View {
    let done: Bool

    var body: some View {
        Image(systemName: done ? "checkmark.circle.fill" : "circle")
            .foregroundStyle(done ? Color.secondary : Color.purple)
    }
}

private struct SubtaskTitle: View {
    let title: String
    let done: Bool

    var body: some View {
        Text(title)
            .strikethrough(done)
            .foregroundStyle(done ? Color.secondary : Color.primary)
            .lineLimit(2)
    }
}

/// Paso de estimación en bloques de 5 minutos.
private struct EstimateStepper: View {
    @Binding var minutes: Int

    var body: some View {
        Stepper(L("%d min", minutes), value: $minutes, in: 5...480, step: 5)
    }
}

/// Fecha `yyyy-MM-dd` opcional con `DatePicker` nativo y botón de limpiar.
private struct DateRow: View {
    let label: String
    @Binding var value: String // yyyy-MM-dd o vacío

    var body: some View {
        HStack {
            Text(label)
            Spacer()
            if value.isEmpty {
                Button("Añadir fecha") {
                    let f = DateFormatter()
                    f.dateFormat = "yyyy-MM-dd"
                    f.locale = Locale(identifier: "en_US_POSIX")
                    value = f.string(from: Date())
                }
                .font(.caption)
            } else {
                DatePicker("", selection: Binding(
                    get: { Self.date(from: value) ?? Date() },
                    set: { value = Self.key(from: $0) }
                ), displayedComponents: .date)
                .labelsHidden()
                Button(role: .destructive) { value = "" } label: {
                    Image(systemName: "xmark.circle")
                        .foregroundStyle(.secondary)
                }
                .buttonStyle(.plain)
                .accessibilityLabel(L("Quitar %@", label))
            }
        }
    }

    private static func date(from key: String) -> Date? {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        return f.date(from: key)
    }

    private static func key(from date: Date) -> String {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        return f.string(from: date)
    }
}

private struct FlowChips: View {
    let items: [String]
    private let columns = [GridItem(.adaptive(minimum: 80))]

    var body: some View {
        LazyVGrid(columns: columns, alignment: .leading, spacing: 6) {
            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(.quaternary, in: .capsule)
            }
        }
    }
}
