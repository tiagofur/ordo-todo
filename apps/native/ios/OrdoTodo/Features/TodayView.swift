import SwiftUI
import WidgetKit

/// Vista Hoy (ODD 052 T2): large title que colapsa a inline con el scroll,
/// secciones Vencidas/Mañana/Tarde/Noche/Cuando sea/Hechas, anillo de
/// progreso y pull-to-refresh. Traducción HIG de `HoyScreen.kt`.
struct TodayView: View {
    @Environment(HoyViewModel.self) private var vm
    @Environment(FocusViewModel.self) private var focus
    @Environment(SessionStore.self) private var session
    @State private var habitsVM: HabitsViewModel?
    @State private var ritualVM: RitualViewModel?
    @State private var showCapture = false

    var body: some View {
        Group {
            if vm.isLoading && vm.response == nil {
                ProgressView("Cargando tu día…")
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let message = vm.errorMessage, vm.response == nil {
                ContentUnavailableView(
                    "Sin conexión",
                    systemImage: "wifi.slash",
                    description: Text(LocalizedStringKey(message))
                )
                .overlay(alignment: .bottom) {
                    Button("Reintentar") { Task { await vm.load() } }
                        .buttonStyle(.borderedProminent)
                        .padding(.bottom, 32)
                }
            } else {
                List {
                    DayProgressHeader()
                    if vm.isStale {
                        Label("Sin conexión: copia guardada",
                              systemImage: "wifi.slash")
                            .font(.caption)
                            .foregroundStyle(.orange)
                            .accessibilityLabel(
                                "Sin conexión, mostrando copia guardada")
                    }
                    if let ritualVM, ritualVM.phase != .none {
                        RitualBanner(ritual: ritualVM,
                                     todayTasks: vm.allTasks)
                    }
                    ForEach(vm.sections, id: \.kind) { section in
                        Section(section.kind.titleKey) {
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
                    if let habitsVM, !habitsVM.habits.isEmpty {
                        Section("Hábitos") {
                            ForEach(habitsVM.habits) { habit in
                                HabitRowView(
                                    habit: habit,
                                    showsStations: false,
                                    onToggle: { habitsVM.toggle(habit) }
                                )
                            }
                        }
                    }
                    if vm.sections.isEmpty,
                       habitsVM?.habits.isEmpty != false,
                       !vm.isLoading, vm.response != nil {
                        ContentUnavailableView(
                            "Día despejado",
                            systemImage: "sun.max",
                            description: Text(
                                "Añade tu primera tarea del día."))
                    }
                }
                .refreshable {
                    await vm.load()
                    await habitsVM?.load()
                    await ritualVM?.load()
                    reschedule()
                }
            }
        }
        .navigationTitle("Hoy")
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
                Task { await vm.load() }
            }
        }
        .task {
            await vm.load()
            if habitsVM == nil {
                let habits = HabitsViewModel(session: session)
                habitsVM = habits
                await habits.load()
            }
            if ritualVM == nil {
                let ritual = RitualViewModel(session: session)
                ritualVM = ritual
                await ritual.load()
            }
            reschedule()
        }
    }

    /// Reprograma hábitos + planning tras cada pull (self-heal) y guarda
    /// la foto del día para el Widget.
    private func reschedule() {
        NotificationScheduler.reschedule(habits: habitsVM?.habits ?? [],
                                         day: vm.response)
        let open = vm.allTasks.filter { !$0.isDone }.prefix(3).map {
            DaySnapshotTask(title: $0.title, time: $0.scheduledTime,
                            done: $0.isDone)
        }
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        DaySnapshot(dateKey: f.string(from: Date()), done: vm.doneCount,
                    total: vm.allTasks.count,
                    focusMinutes: vm.capacity.estimatedMinutes,
                    tasks: Array(open)).save()
        WidgetCenter.shared.reloadTimelines(
            ofKind: "dev.creapolis.ordotodo.today")
    }
}

/// Cabecera: anillo de avance + minutos estimados (firma del cockpit sereno).
private struct DayProgressHeader: View {
    @Environment(HoyViewModel.self) private var vm

    var body: some View {
        HStack(spacing: 12) {
            Gauge(value: vm.capacity.clampedProgress) {
                Text("Avance del día")
            } currentValueLabel: {
                Text(L("%d/%d", vm.doneCount, vm.allTasks.count))
            }
            .gaugeStyle(.accessoryCircularCapacity)
            .tint(vm.capacity.isOverloaded ? .orange : .purple)
            .accessibilityLabel("Avance del día")
            Text(vm.progressText)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .accessibilityElement(children: .combine)
    }
}

/// Fila compartida en `TaskRow.swift` (Hoy y Tareas usan la misma).
