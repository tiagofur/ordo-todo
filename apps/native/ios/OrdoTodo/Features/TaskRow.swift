import SwiftUI

/// Fila de tarea compartida Hoy/Tareas (ODD 052 T3): círculo iOS, título a
/// 2 líneas, hora y punto de proyecto. Acciones por closures para no acoplar
/// los ViewModels. El detalle con vista previa llega en T5.
struct TaskRow: View {
    let task: TodayTask
    let onToggle: () -> Void
    let onDelete: () -> Void
    var onFocus: (() -> Void)? = nil

    var body: some View {
        HStack(spacing: 12) {
            Button {
                withAnimation { onToggle() }
            } label: {
                Image(systemName: task.isDone ? "checkmark.circle.fill" : "circle")
                    .font(.title2)
                    .foregroundStyle(task.isDone ? Color.secondary : Color.purple)
                    .accessibilityLabel(task.isDone ? "Reabrir" : "Completar")
            }
            .buttonStyle(.plain)
            VStack(alignment: .leading, spacing: 2) {
                Text(task.title)
                    .strikethrough(task.isDone)
                    .foregroundStyle(task.isDone ? .secondary : .primary)
                    .lineLimit(2)
                HStack(spacing: 6) {
                    if let time = task.scheduledTime {
                        Text(time)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .monospacedDigit()
                    }
                    if let project = task.project {
                        HStack(spacing: 4) {
                            Circle()
                                .fill(Color(hex: project.color) ?? .purple)
                                .frame(width: 8, height: 8)
                                .accessibilityHidden(true)
                            Text(project.name)
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    if task.pendingSync {
                        Text("Pendiente")
                            .font(.caption)
                            .foregroundStyle(.orange)
                    }
                }
            }
        }
        .swipeActions(edge: .leading, allowsFullSwipe: true) {
            Button(task.isDone ? "Reabrir" : "Completar",
                   systemImage: task.isDone ? "arrow.uturn.backward" : "checkmark") {
                withAnimation { onToggle() }
            }
            .tint(.green)
        }
        .swipeActions(edge: .trailing, allowsFullSwipe: false) {
            Button("Eliminar", systemImage: "trash", role: .destructive) {
                withAnimation { onDelete() }
            }
        }
        .contextMenu {
            Button(task.isDone ? "Reabrir" : "Completar",
                   systemImage: task.isDone ? "arrow.uturn.backward" : "checkmark") {
                onToggle()
            }
            if let onFocus, !task.isDone {
                Button("Empezar foco", systemImage: "timer") {
                    onFocus()
                }
            }
            Button("Eliminar", systemImage: "trash", role: .destructive) {
                onDelete()
            }
        }
    }
}

/// Un hit de `GET /search/quick`: proyecto (carpeta) o tarea (lupa),
/// compartido por Tareas y la búsqueda global.
struct QuickResultRow: View {
    let hit: QuickResult
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 10) {
                Image(systemName: hit.isProject ? "folder" : "magnifyingglass")
                    .foregroundStyle(.secondary)
                    .accessibilityHidden(true)
                VStack(alignment: .leading, spacing: 2) {
                    Text(hit.title).lineLimit(1)
                    if let subtitle = hit.subtitle {
                        Text(subtitle)
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
            }
        }
        .buttonStyle(.plain)
    }
}

/// Hex de proyecto (`#RRGGBB`) a Color del sistema. Sin hex a mano en vistas.
extension Color {
    init?(hex: String?) {
        guard let h = hex?.trimmingCharacters(in: .whitespacesAndNewlines)
            .replacingOccurrences(of: "#", with: ""),
              h.count == 6, let v = UInt64(h, radix: 16)
        else { return nil }
        self.init(red: Double((v >> 16) & 0xFF) / 255,
                  green: Double((v >> 8) & 0xFF) / 255,
                  blue: Double(v & 0xFF) / 255)
    }
}
