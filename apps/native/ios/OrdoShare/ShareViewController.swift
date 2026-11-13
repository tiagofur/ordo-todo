import Social
import UniformTypeIdentifiers

/// Paridad con el `ACTION_SEND` de Android (ODD 052 T8): recibe texto o URL
/// compartida, la deja en `SharedInbox` y la app la importa al abrirse.
/// Hoja estándar del sistema (`SLComposeServiceViewController`).
final class ShareViewController: SLComposeServiceViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        title = "Ordo Todo"
        placeholder = String(
            localized: "Añadir tarea…",
            table: nil,
            bundle: .main,
            comment: "")
    }

    override func didSelectPost() {
        loadSharedText { [weak self] text in
            if let text {
                SharedInbox.saveShare(text: text)
            }
            self?.extensionContext?.completeRequest(
                returningItems: nil, completionHandler: nil)
        }
    }

    override func didSelectCancel() {
        extensionContext?.cancelRequest(withError: NSError(
            domain: "dev.creapolis.ordotodo.share",
            code: 0))
    }

    private func loadSharedText(
        completion: @escaping (String?) -> Void
    ) {
        let items = extensionContext?.inputItems
            as? [NSExtensionItem] ?? []
        let providers = items.flatMap { $0.attachments ?? [] }
        let group = DispatchGroup()
        var candidates: [(uti: String, value: String)] = []
        for provider in providers {
            if provider.hasItemConformingToTypeIdentifier(
                UTType.plainText.identifier) {
                group.enter()
                provider.loadItem(
                    forTypeIdentifier: UTType.plainText.identifier,
                    options: nil
                ) { item, _ in
                    if let text = item as? String {
                        candidates.append((
                            uti: ShareExtractor.plainTextUTI,
                            value: text))
                    }
                    group.leave()
                }
            } else if provider.hasItemConformingToTypeIdentifier(
                UTType.url.identifier) {
                group.enter()
                provider.loadItem(
                    forTypeIdentifier: UTType.url.identifier,
                    options: nil
                ) { item, _ in
                    if let url = item as? URL {
                        candidates.append((
                            uti: ShareExtractor.urlUTI,
                            value: url.absoluteString))
                    } else if let text = item as? String {
                        candidates.append((
                            uti: ShareExtractor.urlUTI,
                            value: text))
                    }
                    group.leave()
                }
            }
        }
        group.notify(queue: .main) {
            completion(ShareExtractor.bestText(candidates))
        }
    }
}
