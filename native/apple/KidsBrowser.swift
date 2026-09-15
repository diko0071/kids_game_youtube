import SwiftUI
import WebKit

@MainActor
private final class WeakDiagnosticsHandler: NSObject, WKScriptMessageHandler {
    weak var owner: KidsBrowserModel?
    init(_ owner: KidsBrowserModel) { self.owner = owner }
    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        owner?.userContentController(userContentController, didReceive: message)
    }
}

@MainActor
final class KidsBrowserModel: NSObject, ObservableObject, WKNavigationDelegate, WKUIDelegate, WKScriptMessageHandler {
    @Published var loading = true
    @Published var error: String?
    @Published var diagnostics = "Ожидаем плеер"
    @Published var blockedNavigations = 0
    private(set) var webView: WKWebView!
    private var policy: NavigationPolicy!

    override init() {
        super.init()
        do {
            guard let catalogURL = Bundle.main.url(forResource: "approved-catalog", withExtension: "json"),
                  let scriptURL = Bundle.main.url(forResource: "player-policy", withExtension: "js") else {
                throw CocoaError(.fileNoSuchFile)
            }
            policy = NavigationPolicy(catalog: try JSONDecoder().decode(ApprovedCatalog.self, from: Data(contentsOf: catalogURL)))
            let controller = WKUserContentController()
            controller.addUserScript(WKUserScript(source: try String(contentsOf: scriptURL, encoding: .utf8), injectionTime: .atDocumentStart, forMainFrameOnly: false))
            #if DEBUG
            controller.add(WeakDiagnosticsHandler(self), name: "kidsDiagnostics")
            #endif
            let configuration = WKWebViewConfiguration()
            configuration.userContentController = controller
            configuration.websiteDataStore = .default()
            configuration.mediaTypesRequiringUserActionForPlayback = []
            #if os(iOS)
            configuration.allowsInlineMediaPlayback = true
            configuration.allowsPictureInPictureMediaPlayback = false
            configuration.allowsAirPlayForMediaPlayback = false
            #endif
            webView = WKWebView(frame: .zero, configuration: configuration)
            webView.navigationDelegate = self
            webView.uiDelegate = self
            webView.allowsBackForwardNavigationGestures = false
            #if os(iOS)
            webView.scrollView.contentInsetAdjustmentBehavior = .never
            #endif
            reload()
        } catch {
            self.error = "Не удалось загрузить настройки приложения."
            loading = false
        }
    }

    func reload() {
        guard webView != nil else { return }
        error = nil
        loading = true
        webView.load(URLRequest(url: URL(string: "https://\(NavigationPolicy.appHost)/")!))
    }

    func pauseForBackground() {
        webView?.pauseAllMediaPlayback(completionHandler: nil)
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        guard let target = action.targetFrame, let url = action.request.url,
              policy.allows(url, mainFrame: target.isMainFrame) else {
            blockedNavigations += 1
            decisionHandler(.cancel)
            return
        }
        decisionHandler(.allow)
    }

    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration, for action: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? { nil }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { loading = false }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        if (error as NSError).code == NSURLErrorCancelled { return }
        self.error = "Не удалось открыть мультфильмы. Проверь подключение к интернету."
        loading = false
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        self.webView(webView, didFailProvisionalNavigation: navigation, withError: error)
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        error = "Плеер остановился. Можно открыть мультфильмы снова."
        loading = false
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        #if DEBUG
        guard ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].contains(message.frameInfo.securityOrigin.host),
              let text = message.body as? String, text.utf8.count < 2048 else { return }
        diagnostics = text
        #endif
    }
}

#if os(iOS)
struct BrowserSurface: UIViewRepresentable {
    let model: KidsBrowserModel
    func makeUIView(context: Context) -> WKWebView { model.webView }
    func updateUIView(_ view: WKWebView, context: Context) {}
}
#else
struct BrowserSurface: NSViewRepresentable {
    let model: KidsBrowserModel
    func makeNSView(context: Context) -> WKWebView { model.webView }
    func updateNSView(_ view: WKWebView, context: Context) {}
}
#endif
