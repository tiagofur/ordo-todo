import SwiftUI
import WidgetKit

/// Widget del día (ODD 052): anillo de avance + próximas 3 tareas pendientes.
/// Se refresca al abrir la app (la app guarda la foto y pide recarga).
struct TodayProvider: TimelineProvider {
    func placeholder(in context: Context) -> DayEntry {
        DayEntry(date: Date(), snapshot: .placeholder())
    }

    func getSnapshot(in context: Context,
                     completion: @escaping (DayEntry) -> Void) {
        completion(DayEntry(date: Date(),
                            snapshot: DaySnapshot.load() ?? .placeholder()))
    }

    func getTimeline(in context: Context,
                     completion: @escaping (Timeline<DayEntry>) -> Void) {
        let entry = DayEntry(date: Date(),
                             snapshot: DaySnapshot.load() ?? .placeholder())
        let next = Calendar.current.date(byAdding: .day, value: 1,
                                         to: Calendar.current.startOfDay(
                                            for: Date())) ?? Date()
        completion(Timeline(entries: [entry],
                            policy: .after(next)))
    }
}

struct DayEntry: TimelineEntry {
    let date: Date
    let snapshot: DaySnapshot
}

struct TodayWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: "dev.creapolis.ordotodo.today",
                            provider: TodayProvider()) { entry in
            TodayWidgetView(entry: entry)
        }
        .configurationDisplayName("Hoy en Ordo")
        .description("Tu avance y próximas tareas.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

private struct TodayWidgetView: View {
    let entry: DayEntry
    private var progress: Double {
        guard entry.snapshot.total > 0 else { return 0 }
        return min(1, Double(entry.snapshot.done)
            / Double(entry.snapshot.total))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 8) {
                Gauge(value: progress) { Text("Hoy") } currentValueLabel: {
                    Text("\(entry.snapshot.done)/\(entry.snapshot.total)")
                }
                .gaugeStyle(.accessoryCircularCapacity)
                .tint(.purple)
                VStack(alignment: .leading) {
                    Text("Hoy")
                        .font(.headline)
                    Text(String(format: NSLocalizedString(
                        "%d min de foco", comment: ""),
                        entry.snapshot.focusMinutes))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }
            ForEach(Array(entry.snapshot.tasks.prefix(3).enumerated()),
                    id: \.offset) { _, task in
                HStack(spacing: 6) {
                    Image(systemName: task.done
                          ? "checkmark.circle.fill" : "circle")
                        .foregroundStyle(task.done
                            ? Color.secondary : Color.purple)
                        .font(.caption)
                    Text(task.title)
                        .font(.caption)
                        .lineLimit(1)
                    Spacer()
                    if let time = task.time {
                        Text(time)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                }
            }
            Spacer(minLength: 0)
        }
    }
}
