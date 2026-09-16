import Foundation

@main
struct NavigationPolicyTests {
    static func main() throws {
        let catalog = try JSONDecoder().decode(ApprovedCatalog.self, from: Data(contentsOf: URL(fileURLWithPath: CommandLine.arguments[1])))
        let policy = NavigationPolicy(catalog: catalog)
        var checks = 0
        for id in catalog.catalogIDs {
            precondition(policy.allows(URL(string: "https://kids.dkravt.ai/?video=\(id)")!, mainFrame: true))
            checks += 1
        }
        for id in catalog.playbackIDs {
            precondition(policy.allows(URL(string: "https://www.youtube.com/embed/\(id)")!, mainFrame: false))
            checks += 1
        }
        let blocked = [
            "https://kids.dkravt.ai.evil.example/",
            "https://kids.dkravt.ai@evil.example/",
            "http://kids.dkravt.ai/",
            "https://kids.dkravt.ai:444/",
            "https://kids.dkravt.ai/?video=",
            "https://kids.dkravt.ai/?video=arbitrary",
            "https://kids.dkravt.ai/?video=\(catalog.catalogIDs[0])&video=arbitrary",
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
        var dynamic = NavigationPolicy(catalog: catalog)
        let source = catalog.playbackIDs[0]
        let first = NativeRecommendation(id: "ZcZVtt-baas", title: "Маша и Медведь", durationLabel: "1:00")
        let second = NativeRecommendation(id: "testVideo02", title: "Second", durationLabel: nil)
        let third = NativeRecommendation(id: "testVideo03", title: "Third", durationLabel: nil)
        let batch = NativeRecommendationBatch(sourceVideoId: source, videos: [first, second, third])
        precondition(dynamic.accept(batch) == nil)
        dynamic.beginPlayback(source)
        precondition(dynamic.accept(batch)?.videos.count == 2)
        precondition(dynamic.recommendedIDs == Set([first.id, second.id]))
        precondition(dynamic.allows(URL(string: "https://www.youtube.com/embed/\(first.id)")!, mainFrame: false))
        precondition(dynamic.allows(URL(string: "https://kids.dkravt.ai/?video=\(first.id)")!, mainFrame: true))
        precondition(!dynamic.allows(URL(string: "https://www.youtube.com/embed/\(third.id)")!, mainFrame: false))
        dynamic.beginPlayback(first.id)
        precondition(dynamic.currentPlaybackID == first.id && dynamic.recommendedIDs.isEmpty)
        precondition(dynamic.accept(batch) == nil)
        precondition(dynamic.allows(URL(string: "https://www.youtube.com/embed/\(first.id)")!, mainFrame: false))
        precondition(!dynamic.allows(URL(string: "https://www.youtube.com/embed/\(second.id)")!, mainFrame: false))
        dynamic.beginPlayback(third.id)
        precondition(dynamic.currentPlaybackID == first.id)
        dynamic.beginPlayback(source)
        let invalid = NativeRecommendation(id: "invalid", title: "Bad", durationLabel: nil)
        precondition(dynamic.accept(NativeRecommendationBatch(sourceVideoId: source, videos: [invalid, first, third]))?.videos.map(\.id) == [first.id])
        precondition(dynamic.accept(NativeRecommendationBatch(sourceVideoId: source, videos: [first, first]))?.videos.count == 1)
        // A direct URL cannot reuse a recommendation grant from the previous video.
        dynamic.beginPlayback(catalog.playbackIDs[1])
        precondition(!dynamic.allows(URL(string: "https://www.youtube.com/embed/ZcZVtt-baas")!, mainFrame: false))
        precondition(!dynamic.allows(URL(string: "https://kids.dkravt.ai/?video=ZcZVtt-baas")!, mainFrame: true))
        let preview = NavigationPolicy(catalog: catalog, appURL: URL(string: "http://127.0.0.1:3017/")!)
        precondition(preview.allows(URL(string: "http://127.0.0.1:3017/?menu=grid")!, mainFrame: true))
        precondition(!preview.allows(URL(string: "http://127.0.0.1:3018/")!, mainFrame: true))
        precondition(!policy.allows(URL(string: "http://127.0.0.1:3017/")!, mainFrame: true))
        let search = URL(string: "https://www.youtube.com/results?search_query=excavator")!
        precondition(policy.allowsExternalSearch(search, sourceURL: policy.appURL, mainFrame: true))
        precondition(!policy.allowsExternalSearch(search, sourceURL: policy.appURL, mainFrame: false))
        precondition(!policy.allowsExternalSearch(search, sourceURL: URL(string: "https://www.youtube.com/embed/\(source)")!, mainFrame: true))
        precondition(!policy.allowsExternalSearch(search, sourceURL: nil, mainFrame: true))
        for raw in [
            "https://www.youtube.com.evil.example/results?search_query=excavator",
            "http://www.youtube.com/results?search_query=excavator",
            "https://www.youtube.com:444/results?search_query=excavator",
            "https://user@www.youtube.com/results?search_query=excavator",
            "https://www.youtube.com/watch?v=\(source)",
            "https://www.youtube.com/results?search_query=",
            "https://www.youtube.com/results?search_query=%20",
            "https://www.youtube.com/results?search_query=a&search_query=b",
            "https://www.youtube.com/results?search_query=a&redirect=evil",
            "https://www.youtube.com/results?search_query=a#fragment",
            "https://www.youtube.com/results?search_query=\(String(repeating: "a", count: 201))",
        ] {
            precondition(!policy.allowsExternalSearch(URL(string: raw)!, sourceURL: policy.appURL, mainFrame: true), raw)
            checks += 1
        }
        checks += 4
        checks += 18
        print("Navigation policy: \(checks + 2) checks passed, \(catalog.catalogIDs.count) catalog IDs and \(catalog.playbackIDs.count) playback IDs enumerated")
    }
}
