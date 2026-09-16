// Session 23e476f9-ecb7-468a-9457-509cfc36dde6: in the browser this is a no-op; the handler exists only inside the native WKWebView host.
interface SearchResultsHandler { postMessage: (body: string) => void }

interface NativeWindow extends Window {
  webkit?: { messageHandlers?: { kidsSearchResults?: SearchResultsHandler } };
}

export function notifyNativeSearchResults(ids: string[]): void {
  if (typeof window === "undefined") return;
  const handler = (window as NativeWindow).webkit?.messageHandlers?.kidsSearchResults;
  if (!handler) return;
  try {
    handler.postMessage(JSON.stringify(ids));
  } catch {
    // A missing or rejecting bridge must never break the search UI.
  }
}
