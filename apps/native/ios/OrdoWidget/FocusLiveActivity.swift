import ActivityKit
import SwiftUI
import WidgetKit

/// Foco en la Isla Dinámica y la pantalla de bloqueo (ODD 052):
/// fase + cuenta atrás + tarea. Solo lectura en esta versión.
struct FocusLiveActivity: Widget {
    var body: some WidgetConfiguration {
        ActivityConfiguration(for: FocusAttributes.self) { context in
            FocusLockScreen(state: context.state)
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
                    Text(context.state.phaseLabel)
                        .font(.caption)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Text(FocusLiveActivity.text(
                        seconds: context.state.remainingSeconds))
                        .font(.caption)
                        .monospacedDigit()
                }
                DynamicIslandExpandedRegion(.bottom) {
                    if let title = context.state.taskTitle {
                        Text(title)
                            .font(.caption)
                            .lineLimit(1)
                    }
                }
            } compactLeading: {
                Image(systemName: "timer")
            } compactTrailing: {
                Text(FocusLiveActivity.text(
                    seconds: context.state.remainingSeconds))
                    .monospacedDigit()
            } minimal: {
                Image(systemName: "timer")
            }
        }
    }

    static func text(seconds: Int) -> String {
        String(format: "%d:%02d", seconds / 60, seconds % 60)
    }
}

private struct FocusLockScreen: View {
    let state: FocusAttributes.ContentState

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: "timer")
                .font(.title2)
                .foregroundStyle(.purple)
            VStack(alignment: .leading, spacing: 2) {
                Text(state.phaseLabel)
                    .font(.headline)
                if let title = state.taskTitle {
                    Text(title)
                        .font(.subheadline)
                        .lineLimit(1)
                }
            }
            Spacer()
            Text(FocusLiveActivity.text(seconds: state.remainingSeconds))
                .font(.title2)
                .monospacedDigit()
        }
        .padding()
    }
}
