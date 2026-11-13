import SwiftUI

/// Foco a pantalla completa (ODD 052): numerales grandes, anillo de avance,
/// la tarea con controles pausar/reanudar · terminar · saltar descanso.
/// Se abre desde el mini-reproductor; se cierra deslizando (la sesión sigue).
struct FocusView: View {
    @Bindable var vm: FocusViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var confirmStop = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 20) {
                Text(vm.phaseLabel)
                    .font(.headline)
                    .foregroundStyle(.secondary)
                ZStack {
                    Gauge(value: vm.progress) { Text(vm.phaseLabel) }
                        .gaugeStyle(.accessoryCircular)
                        .tint(vm.mode == .work ? .purple : .green)
                        .scaleEffect(3)
                        .frame(width: 200, height: 200)
                    Text(vm.remainingText)
                        .font(.system(size: 54, weight: .bold, design: .rounded))
                        .monospacedDigit()
                }
                .padding(.vertical, 24)
                if let title = vm.taskTitle {
                    Text(title)
                        .font(.title3)
                        .lineLimit(2)
                        .multilineTextAlignment(.center)
                }
                Text(vm.pomodoroLine)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                controls
                Spacer()
            }
            .padding()
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
                ToolbarItem(placement: .destructiveAction) {
                    Button("Detener", role: .destructive) {
                        confirmStop = true
                    }
                    .alert("Detener el foco", isPresented: $confirmStop) {
                        Button("Cancelar", role: .cancel) {}
                        Button("Detener", role: .destructive) {
                            vm.stopToIdle()
                            dismiss()
                        }
                    }
                }
            }
        }
    }

    @ViewBuilder
    private var controls: some View {
        HStack(spacing: 28) {
            if vm.pausedRemaining != nil {
                Button("Reanudar", systemImage: "play.fill") { vm.resume() }
                    .buttonStyle(.borderedProminent)
            } else {
                Button("Pausar", systemImage: "pause.fill") { vm.pause() }
                    .buttonStyle(.borderedProminent)
            }
            Button("Terminar", systemImage: "stop.fill") { vm.finish() }
                .buttonStyle(.bordered)
            if vm.mode != .work {
                Button("Saltar", systemImage: "forward.fill") { vm.skipBreak() }
                    .buttonStyle(.bordered)
            }
        }
        .font(.title3)
        .labelStyle(.iconOnly)
    }
}
