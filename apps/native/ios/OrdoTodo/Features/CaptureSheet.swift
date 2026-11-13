import SwiftUI

/// Captura exprés (ODD 052): un solo campo con foco y teclado al abrir,
/// subrayado en vivo de lo entendido, chips de fecha/hora/prioridad y
/// selector de proyecto para el hint `#tag`. Intro = guardar y seguir.
/// Sin botón de voz propio: el dictado del teclado cubre la entrada oral.
struct CaptureSheet: View {
    @Environment(SessionStore.self) private var session
    @State private var saver: CaptureSaver?
    @State private var text = ""
    @State private var added = 0
    @State private var saving = false
    @State private var enhancing = false
    @State private var saveError: String?
    @FocusState private var focused: Bool
    @Environment(\.dismiss) private var dismiss

    var onSaved: () -> Void

    /// `initialText` pre-rellena desde Share extension / intents (T8).
    init(initialText: String = "", onSaved: @escaping () -> Void) {
        _text = State(initialValue: initialText)
        self.onSaved = onSaved
    }

    var body: some View {
        NavigationStack {
            Form {
                Section {
                    TextField("Añadir tarea…", text: $text, axis: .vertical)
                        .focused($focused)
                        .submitLabel(.done)
                        .onSubmit { Task { await save() } }
                        .accessibilityLabel("Captura rápida")
                    HStack {
                        highlightedPreview
                        Spacer()
                        if enhancing {
                            ProgressView()
                                .accessibilityLabel("Mejorando con IA")
                        } else {
                            Button {
                                Task { await enhance() }
                            } label: {
                                Label("Mejorar con IA",
                                      systemImage: "sparkles")
                                    .font(.caption)
                            }
                            .disabled(text.trimmingCharacters(
                                in: .whitespaces).isEmpty)
                        }
                    }
                }
                parsedChips
                if let saver, !saver.projects.isEmpty {
                    Section("Proyecto") {
                        Picker("Proyecto", selection: Binding(
                            get: { saver.forcedProjectId },
                            set: { saver.forcedProjectId = $0 }
                        )) {
                            Text("Según #tag").tag(nil as String?)
                            ForEach(saver.projects) { project in
                                Text(project.name).tag(project.id as String?)
                            }
                        }
                    }
                }
                if added > 0 {
                    Section {
                        Text(added == 1
                             ? L("%d añadida", added)
                             : L("%d añadidas", added))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                if let saveError {
                    Section {
                        Text(LocalizedStringKey(saveError))
                            .foregroundStyle(.red)
                            .font(.caption)
                    }
                }
            }
            .navigationTitle("Captura")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cerrar") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Añadir") { Task { await save() } }
                        .disabled(saving || text.trimmingCharacters(
                            in: .whitespaces).isEmpty)
                }
            }
            .task {
                let saver = CaptureSaver(session: session)
                self.saver = saver
                await saver.loadProjects()
                focused = true
            }
        }
    }

    private var parsed: ParsedCapture {
        parseCapture(text)
    }

    @ViewBuilder
    private var highlightedPreview: some View {
        let (_, spans) = parseCaptureWithSpans(text)
        if !spans.isEmpty, !text.trimmingCharacters(
            in: .whitespaces).isEmpty {
            Text(attributed(text, spans: spans))
                .font(.caption)
                .foregroundStyle(.secondary)
                .accessibilityLabel(L("Entendido: %@", summaryLine))
        }
    }

    private var summaryLine: String {
        let p = parsed
        var parts: [String] = []
        if let d = p.scheduledDate { parts.append(d) }
        if let t = p.scheduledTime { parts.append(t) }
        if let pr = p.priority { parts.append(pr) }
        if let h = p.projectHint { parts.append("#\(h)") }
        return parts.isEmpty ? "solo título" : parts.joined(separator: " · ")
    }

    @ViewBuilder
    private var parsedChips: some View {
        let p = parsed
        if p.scheduledDate != nil || p.scheduledTime != nil
            || p.priority != nil || p.projectHint != nil {
            Section("Entendido") {
                WrapChips(items: chips(for: p))
            }
        }
    }

    private func chips(for p: ParsedCapture) -> [String] {
        var out: [String] = []
        if let d = p.scheduledDate { out.append(L("Fecha %@", d)) }
        if let t = p.scheduledTime { out.append(L("Hora %@", t)) }
        if let pr = p.priority { out.append(priorityName(pr)) }
        if let h = p.projectHint { out.append("#" + h) }
        return out
    }

    private func priorityName(_ raw: String) -> String {
        switch raw {
        case "URGENT": return NSLocalizedString("Prioridad urgente",
                                                comment: "")
        case "HIGH": return NSLocalizedString("Prioridad alta", comment: "")
        case "MEDIUM": return NSLocalizedString("Prioridad media",
                                                comment: "")
        default: return NSLocalizedString("Prioridad baja", comment: "")
        }
    }

    private func attributed(_ text: String,
                            spans: [CaptureSpan]) -> AttributedString {
        var result = AttributedString(text)
        for span in spans {
            let start = result.index(result.startIndex,
                                     offsetByCharacters: span.start)
            let end = result.index(start,
                                   offsetByCharacters: span.end - span.start)
            result[start..<end].underlineStyle = .single
        }
        return result
    }

    private func enhance() async {
        guard let saver, !enhancing else { return }
        enhancing = true
        saveError = nil
        defer { enhancing = false }
        if let refined = await saver.enhance(text: text) {
            text = refined
            focused = true
        } else {
            saveError = saver.lastError
        }
    }

    private func save() async {
        guard let saver,
              !text.trimmingCharacters(in: .whitespaces).isEmpty,
              !saving
        else { return }
        saving = true
        saveError = nil
        defer { saving = false }
        if await saver.save(text: text) {
            added += 1
            text = ""
            focused = true
            onSaved()
        } else {
            saveError = saver.lastError ?? "No se pudo guardar"
        }
    }
}

/// Flujo de fichas envueltas para los chips de la captura.
private struct WrapChips: View {
    let items: [String]

    var body: some View {
        FlowLayout {
            ForEach(items, id: \.self) { item in
                Text(item)
                    .font(.caption)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(.quaternary, in: .capsule)
                    .accessibilityLabel(item)
            }
        }
    }
}

private struct FlowLayout: Layout {
    func sizeThatFits(proposal: ProposedViewSize,
                      subviews: Subviews, cache: inout ()) -> CGSize {
        layout(proposal: proposal, subviews: subviews).size
    }

    func placeSubviews(in bounds: CGRect, proposal: ProposedViewSize,
                       subviews: Subviews, cache: inout ()) {
        let placed = layout(proposal: proposal, subviews: subviews)
        for (index, point) in placed.points.enumerated() {
            subviews[index].place(at: CGPoint(x: bounds.minX + point.x,
                                             y: bounds.minY + point.y),
                                  proposal: .unspecified)
        }
    }

    private func layout(proposal: ProposedViewSize, subviews: Subviews)
        -> (size: CGSize, points: [CGPoint]) {
        let width = proposal.width ?? 320
        var x: CGFloat = 0
        var y: CGFloat = 0
        var rowHeight: CGFloat = 0
        var points: [CGPoint] = []
        for view in subviews {
            let size = view.sizeThatFits(.unspecified)
            if x + size.width > width {
                x = 0
                y += rowHeight + 6
                rowHeight = 0
            }
            points.append(CGPoint(x: x, y: y))
            x += size.width + 6
            rowHeight = max(rowHeight, size.height)
        }
        return (CGSize(width: width, height: y + rowHeight), points)
    }
}

@Observable
final class CaptureSaver {
    private let client: ApiClient
    var projects: [TodayProject] = []
    var forcedProjectId: String?
    var lastError: String?

    init(session: SessionStore, baseURL: URL = OrdoConfig.baseURL) {
        self.client = ApiClient(baseURL: baseURL, session: session)
    }

    @MainActor
    func loadProjects() async {
        do {
            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            let data = try await client.getData("/projects/all")
            projects = try decoder.decode([TodayProject].self, from: data)
        } catch { /* el hint #tag sigue funcionando a mano */ }
    }

    /// Guarda lo parseado; `forcedProjectId` manda sobre el `#tag`.
    /// Omite nulos para que `@IsOptional()` aplique sus defectos.
    /// Sin red, la captura entra en cola y sube al abrir (D3).
    @MainActor
    func save(text: String) async -> Bool {
        let parsed = parseCapture(text)
        guard !parsed.title.isEmpty else { return false }
        let projectId = forcedProjectId
            ?? resolveProjectId(hint: parsed.projectHint, projects: projects)
        var dict: [String: Any] = ["title": parsed.title]
        if let d = parsed.scheduledDate { dict["scheduledDate"] = d }
        if let t = parsed.scheduledTime { dict["scheduledTime"] = t }
        if let p = parsed.priority { dict["priority"] = p }
        if let pid = projectId { dict["projectId"] = pid }
        do {
            let body = try JSONSerialization.data(withJSONObject: dict)
            _ = try await client.post("/tasks", body: body)
            await drainQuietly()
            return true
        } catch let error as ApiError {
            if case .network = error {
                Outbox.shared.enqueue(.createTask(
                    localId: UUID().uuidString, title: parsed.title,
                    date: parsed.scheduledDate, time: parsed.scheduledTime,
                    priority: parsed.priority, projectId: projectId,
                    at: Date().timeIntervalSince1970))
                await drainQuietly()
                lastError = nil
                return true
            }
            lastError = "No se pudo guardar"
            return false
        } catch {
            lastError = "No se pudo guardar"
            return false
        }
    }

    @MainActor
    private func drainQuietly() async {
        _ = await Outbox.shared.drain(client: client)
    }

    /// Refina el texto con `POST /ai/parse-task`; el resultado vuelve por
    /// el parser local. Fallo = mensaje de red, nunca texto roto.
    @MainActor
    func enhance(text: String) async -> String? {
        let trimmed = text.trimmingCharacters(in: .whitespaces)
        guard !trimmed.isEmpty else { return nil }
        do {
            let body = try JSONEncoder().encode(["input": trimmed])
            let data = try await client.post("/ai/parse-task", body: body)
            guard let raw = String(data: data, encoding: .utf8),
                  let parsed = parseAiTask(raw)
            else {
                lastError = "Sin conexión: inténtalo de nuevo"
                return nil
            }
            return renderEnhancedText(parsed)
        } catch {
            lastError = "Sin conexión: inténtalo de nuevo"
            return nil
        }
    }
}
