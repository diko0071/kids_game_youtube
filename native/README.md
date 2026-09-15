# Mira and Luke native prototype

The iOS app opens the existing catalog in WKWebView and injects `shared/player-policy.js` into YouTube embed frames at document start. It hides recommendation entry points and end-screen cards inside those frames. The website itself is unchanged. A macOS build of the same Swift/WebKit code supports local verification without starting an iOS simulator.

## Build

From the repository root, with Xcode and `npm ci` already installed:

```sh
node native/scripts/export-catalog.mjs
python3 native/scripts/build-apple.py mac
python3 native/scripts/build-apple.py ios
```

Outputs are under the ignored `build/native/` directory. Builds run one compiler at a time, stop after 120 seconds or 3 GiB of owned-process RSS, and stop on critical macOS memory pressure. The iOS command produces an unsigned device binary, not an installable signed app.

For signing and installing on an iPhone, use `apple/MiraAndLuke.xcodeproj`, choose the `MiraAndLuke` target, set your own Development Team under Signing & Capabilities, and select the connected, trusted iPhone. Developer Mode must be enabled on that device. No account credentials or team IDs are stored in this repository. Use Debug for the prototype; its bottom panel displays actual player DOM evidence. Release omits that panel and its message handler.

## Scope and boundaries

- `app/data/catalog.ts` remains the catalog source. Regenerate the native JSON after changing it; `export-catalog.mjs --check` detects drift.
- Main-frame navigation permits only HTTPS on the existing app host and catalog video IDs. YouTube frame navigation permits approved embed IDs. New windows, watch pages, channels, external links, and custom URL schemes are rejected.
- YouTube anchor clicks and context menus are blocked inside the embed. Recommendation controls are hidden by CSS, including dynamically created matching elements. Video rendering, pause/play, seeking, volume, captions, and playback settings remain with YouTube.
- Native media playback stays inline on iOS; picture-in-picture and AirPlay are disabled. Backgrounding pauses media. The app's own WebKit data store preserves parent settings between launches.
- This is a prototype against YouTube's current DOM, not a guarantee against future UI changes. Unknown new recommendation controls, consent flows, ad behavior, device playback, and app-store acceptance require separate verification. The DOM rules need maintenance when YouTube changes markup.
- Android is not implemented in this prototype. The shared policy file is separated for later reuse, but Android injection and navigation must be implemented and tested in its own WebView host.

## Verification

The native navigation test enumerates the bundled catalog IDs and checks rejected domains, ports, schemes, unknown IDs, watch URLs, channel URLs, and duplicate query parameters. Compile `apple/NavigationPolicy.swift` together with `tests/NavigationPolicyTests.swift`, then pass `shared/approved-catalog.json` to the resulting executable.

For live acceptance on each target device: initial play; pause and one-tap resume; portrait and landscape; switching catalog videos; end and replay; attempt a YouTube title/logo exit; background/foreground; relaunch with saved parent settings. In the Debug panel, `policy: true` and `recommendationsVisible: 0` are evidence for the matching DOM elements, not proof that every possible future recommendation UI is covered.

Implementation references: [WKUserScript](https://developer.apple.com/documentation/webkit/wkuserscript), [WKNavigationDelegate](https://developer.apple.com/documentation/webkit/wknavigationdelegate), [YouTube iframe API](https://developers.google.com/youtube/iframe_api_reference).

Session: 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17
