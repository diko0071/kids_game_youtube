import Foundation

struct ApprovedCatalog: Decodable {
    let catalogIDs: [String]
    let playbackIDs: [String]
}

struct NativeRecommendation: Codable {
    let id: String
    let title: String
    let durationLabel: String?
}

struct NativeRecommendationBatch: Codable {
    let sourceVideoId: String
    let videos: [NativeRecommendation]
}

struct NavigationPolicy {
    static let appHost = "kids-game-youtube.vercel.app"
    let catalog: ApprovedCatalog
    var appURL = URL(string: "https://kids-game-youtube.vercel.app/")!
    private(set) var currentPlaybackID: String?
    private(set) var recommendedIDs = Set<String>()

    private var playableIDs: Set<String> {
        Set(catalog.playbackIDs).union(recommendedIDs).union(currentPlaybackID.map { [$0] } ?? [])
    }

    mutating func beginPlayback(_ id: String) {
        guard playableIDs.contains(id) else { return }
        if currentPlaybackID != id { recommendedIDs = []; currentPlaybackID = id }
    }

    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: only the active embed's first two recommendations grant temporary playback; language and catalog membership do not affect rank.
    mutating func accept(_ batch: NativeRecommendationBatch) -> NativeRecommendationBatch? {
        guard batch.sourceVideoId == currentPlaybackID else { return nil }
        var ids = Set<String>()
        let videos = batch.videos.prefix(2).filter { item in
            item.id.range(of: "^[A-Za-z0-9_-]{11}$", options: .regularExpression) != nil &&
            item.id != currentPlaybackID && !item.title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty &&
            item.title.count <= 300 && (item.durationLabel?.count ?? 0) < 20 && ids.insert(item.id).inserted
        }.prefix(2)
        recommendedIDs = Set(videos.map(\.id))
        return NativeRecommendationBatch(sourceVideoId: batch.sourceVideoId, videos: Array(videos))
    }

    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: only the app's parent search may leave the WebView; YouTube frames cannot use this exception.
    func allowsExternalSearch(_ url: URL, sourceURL: URL?, mainFrame: Bool) -> Bool {
        guard mainFrame, let sourceURL, allows(sourceURL, mainFrame: true),
              url.scheme == "https", url.host == "www.youtube.com", url.port == nil || url.port == 443,
              url.user == nil, url.password == nil, url.fragment == nil, url.path == "/results",
              let items = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems,
              items.count == 1, items[0].name == "search_query", let query = items[0].value else { return false }
        return !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty && query.count <= 200
    }

    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: match parsed hosts and IDs, never URL prefixes that accept lookalike domains or an arbitrary watch link.
    func allows(_ url: URL, mainFrame: Bool) -> Bool {
        if !mainFrame && url.absoluteString == "about:blank" { return true }
        guard url.user == nil, url.password == nil else { return false }
        if mainFrame {
            guard url.scheme == appURL.scheme, url.host == appURL.host,
                  (url.port ?? 443) == (appURL.port ?? 443), url.path == "/" || url.path.isEmpty else { return false }
            let values = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?
                .filter { $0.name == "video" } ?? []
            let allowed = Set(catalog.catalogIDs).union(recommendedIDs).union(currentPlaybackID.map { [$0] } ?? [])
            return values.isEmpty || (values.count == 1 && allowed.contains(values[0].value ?? ""))
        }
        guard url.scheme == "https", url.port == nil || url.port == 443 else { return false }
        guard ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].contains(url.host ?? "") else { return false }
        let path = url.path.split(separator: "/")
        return path.count == 2 && path[0] == "embed" && playableIDs.contains(String(path[1]))
    }
}
