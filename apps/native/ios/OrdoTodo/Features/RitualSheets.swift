import SwiftUI

/// Ritual en Hoy (ODD 052): pancarta según fase + hojas de mañana y noche.
/// Mañana = top 3 del día en 60 s; noche = cierre (mañana / fecha / archivo).
struct RitualBanner: View {
    @Bindable var ritual: RitualViewModel
    let todayTasks: [TodayTask]
    @State private var sheet: RitualSheet?

    var body: some View {
        Group {
            switch ritual.phase {
            case .morning:
                Button {
                    sheet = .morning
                } label: {
                    RitualBannerLabel(
                        title: "Ritual de mañana",
                        subtitle: "Elige tu top 3 en 60 segundos",
                        streak: ritual.streak.label)
                }
                .buttonStyle(.plain)
            case .evening:
                Button {
                    sheet = .evening
                } label: {
                    RitualBannerLabel(
                        title: "Cierre del día",
                        subtitle: "Mueve lo pendiente y descansa",
                        streak: ritual.streak.label)
                }
                .buttonStyle(.plain)
            case .none:
                EmptyView()
            }
        }
        .sheet(item: $sheet) { mode in
            switch mode {
            case .morning:
                MorningSheet(ritual: ritual, todayTasks: todayTasks)
            case .evening:
                EveningSheet(ritual: ritual)
            }
        }
    }
}

private enum RitualSheet: Identifiable {
    case morning, evening
    var id: String { self == .morning ? "morning" : "evening" }
}

private struct RitualBannerLabel: View {
    let title: String
    let subtitle: String
    let streak: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "sunrise")
                .font(.title2)
                .foregroundStyle(.purple)
                .accessibilityHidden(true)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                Text(streak)
                    .font(.caption)
                    .foregroundStyle(.green)
            }
            Spacer()
            Image(systemName: "chevron.right")
                .foregroundStyle(.secondary)
                .accessibilityHidden(true)
        }
        .accessibilityElement(children: .combine)
        .accessibilityAddTraits(.isButton)
    }
}

private struct MorningSheet: View {
    @Bindable var ritual: RitualViewModel
    let todayTasks: [TodayTask]
    @Environment(\.dismiss) private var dismiss
    @State private var top3: [String] = []

    var body: some View {
        NavigationStack {
            List {
                if !ritual.morning.suggestedTop3.isEmpty {
                    Section("Sugeridas") {
                        Text(ritual.morning.suggestedTop3
                            .joined(separator: ", "))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                Section(L("Tu top 3 (%d/3)", top3.count)) {
                    ForEach(todayTasks.filter { !$0.isDone }) { task in
                        Button {
                            top3 = toggleTop3(current: top3, taskId: task.id)
                        } label: {
                            HStack {
                                Text(task.title).lineLimit(1)
                                Spacer()
                                if top3.contains(task.id) {
                                    Image(systemName:
                                        "checkmark.circle.fill")
                                        .foregroundStyle(.purple)
                                }
                            }
                        }
                        .buttonStyle(.plain)
                        .accessibilityLabel(top3Label(task))
                    }
                }
                if !ritual.morning.overdue.isEmpty {
                    Section("Vencidas") {
                        ForEach(ritual.morning.overdue, id: \.taskId) { over in
                            Text(over.title)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
            .navigationTitle("Ritual de mañana")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Omitir") {
                        Task {
                            await ritual.skipMorning()
                            dismiss()
                        }
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Empezar el día") {
                        Task {
                            if await ritual.completeMorning(top3: top3) {
                                dismiss()
                            }
                        }
                    }
                }
            }
            .task { top3 = ritual.morning.ritual?.morningTop3 ?? [] }
        }
    }

    private func top3Label(_ task: TodayTask) -> String {
        let state = top3.contains(task.id)
            ? NSLocalizedString("en el top 3", comment: "")
            : NSLocalizedString("fuera del top 3", comment: "")
        return L("%@, %@", task.title, state)
    }
}

private struct EveningSheet: View {
    @Bindable var ritual: RitualViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var moves: [String: EveningChoice] = [:]

    var body: some View {
        NavigationStack {
            List {
                Section(L("Hechas (%d)",
                            ritual.evening.completed.count)) {
                    ForEach(ritual.evening.completed) { task in
                        Label(task.title, systemImage: "checkmark.circle")
                            .foregroundStyle(.secondary)
                    }
                }
                Section("Pendientes") {
                    ForEach(ritual.evening.pending) { task in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(task.title).lineLimit(2)
                            Picker("Destino", selection: Binding(
                                get: { moves[task.taskId, default: .tomorrow] },
                                set: { moves[task.taskId] = $0 }
                            )) {
                                Text("Mañana").tag(EveningChoice.tomorrow)
                                Text("Archivar").tag(EveningChoice.archived)
                                Text("Otra fecha").tag(EveningChoice.date)
                            }
                            .pickerStyle(.segmented)
                            if moves[task.taskId, default: .tomorrow] == .date {
                                DatePicker("Fecha", selection: Binding(
                                    get: {
                                        dates[task.taskId] ?? Calendar.current
                                            .date(byAdding: .day, value: 1,
                                                   to: Date()) ?? Date()
                                    },
                                    set: { dates[task.taskId] = $0 }
                                ), displayedComponents: .date)
                            }
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("Cierre del día")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Omitir") {
                        Task {
                            await ritual.skipEvening()
                            dismiss()
                        }
                    }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Cerrar el día") {
                        Task {
                            if await ritual.completeEvening(moves:
                                ritual.evening.pending.map {
                                    moveFor($0.taskId)
                                }) {
                                dismiss()
                            }
                        }
                    }
                }
            }
        }
    }

    private enum EveningChoice {
        case tomorrow, archived, date
    }

    @State private var dates: [String: Date] = [:]

    private func moveFor(_ id: String) -> RitualEveningMove {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        f.locale = Locale(identifier: "en_US_POSIX")
        switch moves[id, default: .tomorrow] {
        case .tomorrow:
            return RitualEveningMove(taskId: id, destination: "tomorrow")
        case .archived:
            return RitualEveningMove(taskId: id, destination: "archived")
        case .date:
            let fallback = Calendar.current.date(byAdding: .day, value: 1,
                                                 to: Date()) ?? Date()
            return RitualEveningMove(taskId: id, destination: "date",
                                     date: f.string(from: dates[id]
                                        ?? fallback))
        }
    }
}
