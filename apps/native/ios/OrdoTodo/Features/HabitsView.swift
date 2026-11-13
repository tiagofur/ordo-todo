import SwiftUI

/// Pestaña Hábitos (ODD 052): lista por momento con check-in, crear/editar
/// y línea de estaciones. La estación de hoy ES el control: tocarla cumple
/// el hábito y la línea crece. HIG: `List` agrupada, sheet para el formulario.
struct HabitsView: View {
    @Environment(SessionStore.self) private var session
    @State private var vm: HabitsViewModel?
    @State private var sheet: HabitSheetMode?

    var body: some View {
        Group {
            if let vm {
                HabitsList(vm: vm, sheet: $sheet)
            } else {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .task { vm = HabitsViewModel(session: session) }
            }
        }
        .navigationTitle("Hábitos")
        .toolbar {
            ToolbarItem(placement: .primaryAction) {
                Button("Añadir hábito", systemImage: "plus") {
                    sheet = .create
                }
            }
        }
        .sheet(item: $sheet) { mode in
            if let vm {
                HabitSheet(vm: vm, mode: mode)
            }
        }
    }
}

enum HabitSheetMode: Identifiable {
    case create
    case edit(HabitToday)

    var id: String {
        switch self {
        case .create: return "create"
        case .edit(let habit): return habit.id
        }
    }
}

private struct HabitsList: View {
    @Bindable var vm: HabitsViewModel
    @Binding var sheet: HabitSheetMode?

    var body: some View {
        Group {
            if vm.isLoading && vm.habits.isEmpty {
                ProgressView("Cargando hábitos…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let message = vm.errorMessage, vm.habits.isEmpty {
                ContentUnavailableView(
                    "Sin conexión",
                    systemImage: "wifi.slash",
                    description: Text(LocalizedStringKey(message)))
            } else {
                List {
                    if vm.isStale {
                        Label("Sin conexión: copia guardada",
                              systemImage: "wifi.slash")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                    ForEach(vm.grouped, id: \.0) { moment, habits in
                        Section(momentTitle(moment)) {
                            ForEach(habits) { habit in
                                HabitRowView(
                                    habit: habit,
                                    onToggle: { vm.toggle(habit) },
                                    onEdit: { sheet = .edit(habit) }
                                )
                            }
                        }
                    }
                }
                .refreshable { await vm.load() }
            }
        }
        .task { await vm.load() }
    }
}

/// Fila de hábito compartida (pestaña + sección de Hoy): círculo de
/// check-in esmeralda, nombre, hora y racha. Sin emoji como icono.
struct HabitRowView: View {
    let habit: HabitToday
    let showsStations: Bool
    let onToggle: () -> Void
    let onEdit: (() -> Void)?

    init(habit: HabitToday, showsStations: Bool = true,
         onToggle: @escaping () -> Void, onEdit: (() -> Void)? = nil) {
        self.habit = habit
        self.showsStations = showsStations
        self.onToggle = onToggle
        self.onEdit = onEdit
    }

    var body: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation { onToggle() }
            } label: {
                if habit.targetCount > 1 && !habit.doneToday
                    && habit.todayFraction > 0 {
                    Gauge(value: habit.todayFraction) { Text(habit.name) }
                        .gaugeStyle(.accessoryCircularCapacity)
                        .tint(.green)
                        .accessibilityLabel(L(
                            "Marcar %@: %d de %d", habit.name,
                            habit.completions.count, habit.targetCount))
                } else {
                    Image(systemName: habit.doneToday
                          ? "checkmark.circle.fill" : "circle")
                        .font(.title2)
                        .foregroundStyle(
                            habit.doneToday ? Color.green : Color.secondary)
                        .accessibilityLabel(
                            habit.doneToday
                                ? L("Desmarcar %@", habit.name)
                                : L("Cumplir %@", habit.name))
                }
            }
            .buttonStyle(.plain)
            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .strikethrough(habit.doneToday)
                    .foregroundStyle(habit.doneToday ? .secondary : .primary)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    if let time = habit.preferredTime {
                        Text(time)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                    if habit.currentStreak > 0 {
                        Text(L("racha %d", habit.currentStreak))
                            .font(.caption)
                            .foregroundStyle(.green)
                    }
                }
                if showsStations {
                    StationsStrip(days: last7Stations(
                        dates: habit.completions.compactMap(\.day),
                        today: Date()))
                }
            }
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(habit.doneToday ? "Desmarcar" : "Cumplir",
                   systemImage: habit.doneToday
                     ? "arrow.uturn.backward" : "checkmark") {
                withAnimation { onToggle() }
            }
            .tint(.green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            if let onEdit {
                Button("Editar", systemImage: "pencil") { onEdit() }
            }
        }
        .contextMenu {
            Button(habit.doneToday ? "Desmarcar" : "Cumplir",
                   systemImage: habit.doneToday
                     ? "arrow.uturn.backward" : "checkmark") { onToggle() }
            if let onEdit {
                Button("Editar", systemImage: "pencil") { onEdit() }
            }
        }
    }
}

/// Línea de estaciones: últimos 7 días, llena = cumplido (esmeralda).
struct StationsStrip: View {
    let days: [Bool]

    var body: some View {
        HStack(spacing: 5) {
            ForEach(days.indices, id: \.self) { index in
                Circle()
                    .fill(days[index] ? Color.green : Color.clear)
                    .frame(width: 9, height: 9)
                    .overlay {
                        Circle()
                            .stroke(Color.green, lineWidth: 1.2)
                    }
                    .accessibilityHidden(index < days.count - 1)
                    .accessibilityLabel(index == days.count - 1
                        ? (days[index] ? "Hoy cumplido" : "Hoy pendiente") : "")
            }
        }
        .padding(.top, 2)
        .accessibilityElement(children: .combine)
    }
}

/// Crear/editar hábito: nombre, momento, hora y veces por día.
/// Al editar carga el detalle para la línea de estaciones completa.
struct HabitSheet: View {
    @Bindable var vm: HabitsViewModel
    let mode: HabitSheetMode
    @Environment(\.dismiss) private var dismiss

    @State private var name = ""
    @State private var moment: String? = nil
    @State private var time = ""
    @State private var count = ""
    @State private var detail: HabitToday?
    @State private var saving = false
    @State private var confirmDelete = false

    private var original: HabitToday? {
        if case .edit(let habit) = mode { return habit }
        return nil
    }

    var body: some View {
        NavigationStack {
            Form {
                if let detail {
                    Section {
                        StationsStrip(days: last7Stations(
                            dates: detail.completions.compactMap(\.day),
                            today: Date()))
                            .frame(maxWidth: .infinity, alignment: .center)
                        if detail.currentStreak > 0 {
                            Text(detail.currentStreak == 1
                                ? NSLocalizedString("Racha: 1 día", comment: "")
                                : L("Racha: %d días", detail.currentStreak))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity, alignment: .center)
                        }
                    }
                }
                Section("Hábito") {
                    TextField("Nombre", text: $name)
                    Picker("Momento", selection: $moment) {
                        Text("Cuando sea").tag(nil as String?)
                        Text("Mañana").tag("MORNING" as String?)
                        Text("Tarde").tag("AFTERNOON" as String?)
                        Text("Noche").tag("EVENING" as String?)
                    }
                    TextField("Hora (HH:mm, opcional)", text: $time)
                        .keyboardType(.numbersAndPunctuation)
                        .monospacedDigit()
                    TextField("Veces al día (1–10, opcional)", text: $count)
                        .keyboardType(.numberPad)
                }
                if case .edit = mode {
                    Section {
                        Button("Eliminar hábito", role: .destructive) {
                            confirmDelete = true
                        }
                        .alert("Eliminar hábito", isPresented: $confirmDelete) {
                            Button("Cancelar", role: .cancel) {}
                            Button("Eliminar", role: .destructive) {
                                Task {
                                    if let original,
                                       await vm.remove(original) { dismiss() }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle(original == nil ? "Nuevo hábito" : "Editar hábito")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Guardar") { Task { await save() } }
                        .disabled(saving || name
                            .trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
            .task { await prepare() }
        }
    }

    private func prepare() async {
        if let original {
            name = original.name
            moment = original.timeOfDay
            time = original.preferredTime ?? ""
            count = original.targetCount > 1
                ? String(original.targetCount) : ""
            detail = await vm.detail(original)
        }
    }

    private func save() async {
        saving = true
        defer { saving = false }
        if let original {
            if await vm.update(original, name: name, timeOfDay: moment,
                               timeText: time, countText: count) { dismiss() }
        } else if let draft = buildHabitCreate(
            title: name, timeOfDay: moment, timeText: time, countText: count),
            await vm.create(draft) {
            dismiss()
        }
    }
}
