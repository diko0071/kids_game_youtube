import SwiftUI

@main
struct KidsTubeNativeApp: App {
    var body: some Scene {
        WindowGroup("Мира и Люк") { KidsRootView() }
    }
}

struct KidsRootView: View {
    @StateObject private var model = KidsBrowserModel()
    @Environment(\.scenePhase) private var scenePhase
    #if DEBUG
    @State private var showDiagnostics = false
    #endif

    var body: some View {
        VStack(spacing: 0) {
            ZStack {
                if model.webView != nil { BrowserSurface(model: model) }
                if let error = model.error {
                    VStack(spacing: 20) {
                        Text(error).multilineTextAlignment(.center)
                        Button("Открыть снова") { model.reload() }.buttonStyle(.borderedProminent)
                    }.padding(30).frame(maxWidth: .infinity, maxHeight: .infinity).background(.background)
                } else if model.loading {
                    ProgressView("Открываем мультфильмы").padding(24).background(.regularMaterial).clipShape(RoundedRectangle(cornerRadius: 20))
                }
            }
            #if DEBUG
            HStack {
                Button(showDiagnostics ? "Скрыть проверку" : "Проверка плеера") { showDiagnostics.toggle() }
                Spacer()
                #if os(macOS)
                Button("Вертикально") { resize(width: 390, height: 844) }
                Button("Горизонтально") { resize(width: 844, height: 390) }
                #endif
            }.font(.caption).padding(8)
            if showDiagnostics {
                Text("\(model.diagnostics)\nЗакрыто переходов: \(model.blockedNavigations)")
                    .font(.caption.monospaced()).textSelection(.enabled).padding(8)
            }
            #endif
        }
        .preferredColorScheme(.light)
        .onChange(of: scenePhase) { _, phase in
            if phase != .active { model.pauseForBackground() }
        }
        #if os(macOS)
        .frame(minWidth: 360, minHeight: 320)
        #endif
    }

    #if os(macOS) && DEBUG
    private func resize(width: CGFloat, height: CGFloat) {
        NSApp.windows.first(where: { $0.isVisible })?.setContentSize(NSSize(width: width, height: height))
    }
    #endif
}
