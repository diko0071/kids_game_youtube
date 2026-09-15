import Foundation

@main
struct NavigationPolicyTests {
    static func main() throws {
        let catalog = try JSONDecoder().decode(ApprovedCatalog.self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
        let policy = NavigationPolicy(catalog: catalog)
        var checks = 0
        for id in catalog.catalogIDs {
            precondition(policy.allows(URL(string: "https://kids-game-youtube.vercel.app/?video=\(id)")!, mainFrame: true))
            checks += 1
        }
        for id in catalog.playbackIDs {
            precondition(policy.allows(URL(string: "https://www.youtube.com/embed/\(id)")!, mainFrame: false))
            checks += 1
        }
        let blocked = [
            "https://kids-game-youtube.vercel.app.evil.example/",
            "https://kids-game-youtube.vercel.app@evil.example/",
            "http://kids-game-youtube.vercel.app/",
            "https://kids-game-youtube.vercel.app:444/",
            "https://kids-game-youtube.vercel.app/?video=",
            "https://kids-game-youtube.vercel.app/?video=arbitrary",
            "https://kids-game-youtube.vercel.app/?video=\(catalog.catalogIDs[0])&video=arbitrary",
            "https://www.youtube.com/watch?v=\(catalog.playbackIDs[0])",
            "https://www.youtube.com/embed/arbitrary",
            "https://www.youtube.com/channel/anything",
            "youtube://watch?v=\(catalog.playbackIDs[0])", "javascript:alert(1)",
        ]
        for raw in blocked {
            let url = URL(string: raw)!
            precondition(!policy.allows(url, mainFrame: true), raw)
            precondition(!policy.allows(url, mainFrame: false), raw)
            checks += 2
        }
        precondition(policy.allows(URL(string: "about:blank")!, mainFrame: false))
        precondition(!policy.allows(URL(string: "about:blank")!, mainFrame: true))
        print("Navigation policy: \(checks + 2) checks passed, \(catalog.catalogIDs.count) catalog IDs and \(catalog.playbackIDs.count) playback IDs enumerated")
    }
}
