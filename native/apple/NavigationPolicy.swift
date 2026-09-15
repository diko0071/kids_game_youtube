import Foundation

struct ApprovedCatalog: Decodable {
    let catalogIDs: [String]
    let playbackIDs: [String]
}

struct NavigationPolicy {
    static let appHost = "kids-game-youtube.vercel.app"
    let catalog: ApprovedCatalog

    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: match parsed hosts and IDs, never URL prefixes that accept lookalike domains or an arbitrary watch link.
    func allows(_ url: URL, mainFrame: Bool) -> Bool {
        if !mainFrame && url.absoluteString == "about:blank" { return true }
        guard url.scheme == "https", url.user == nil, url.password == nil,
              url.port == nil || url.port == 443 else { return false }
        if mainFrame {
            guard url.host == Self.appHost, url.path == "/" || url.path.isEmpty else { return false }
            let values = URLComponents(url: url, resolvingAgainstBaseURL: false)?.queryItems?
                .filter { $0.name == "video" } ?? []
            return values.isEmpty || (values.count == 1 && catalog.catalogIDs.contains(values[0].value ?? ""))
        }
        guard ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com"].contains(url.host ?? "") else { return false }
        let path = url.path.split(separator: "/")
        return path.count == 2 && path[0] == "embed" && catalog.playbackIDs.contains(String(path[1]))
    }
}
