import { CartoonVideo, getVideo } from "../data/catalog";

export interface RecommendationBatch {
  sourceVideoId: string;
  videos: { id: string; title: string; durationLabel?: string }[];
}

export function parseRecommendations(value: unknown): RecommendationBatch | null {
  if (!value || typeof value !== "object") return null;
  const batch = value as Partial<RecommendationBatch>;
  if (typeof batch.sourceVideoId !== "string" || !/^[\w-]{11}$/.test(batch.sourceVideoId) || !Array.isArray(batch.videos)) return null;
  const ids = new Set<string>();
  const videos: RecommendationBatch["videos"] = [];
  for (const item of batch.videos.slice(0, 20)) {
    if (!item || typeof item.id !== "string" || !/^[\w-]{11}$/.test(item.id) || item.id === batch.sourceVideoId || ids.has(item.id)) continue;
    if (typeof item.title !== "string" || !item.title.trim() || item.title.length > 300) continue;
    // Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: a recommendation title or its source video's language cannot establish the audio language of an unknown video.
    if (getVideo(item.id)?.language !== "en") continue;
    ids.add(item.id);
    videos.push({ id: item.id, title: item.title.trim(), ...(typeof item.durationLabel === "string" && item.durationLabel.length < 20 ? { durationLabel: item.durationLabel } : {}) });
    if (videos.length === 2) break;
  }
  return { sourceVideoId: batch.sourceVideoId, videos };
}

// Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: retain YouTube's rank among approved English editions; duplicates never consume extra slots.
export function buildForYou(catalog: CartoonVideo[], recommendations: CartoonVideo[], currentId?: string) {
  const ids = new Set<string>();
  const first = recommendations.filter(video => video.id !== currentId && getVideo(video.id)?.language === "en" && !ids.has(video.id) && ids.add(video.id)).slice(0, 2);
  const seen = new Set(first.map(video => video.id));
  return [...first, ...catalog.filter(video => !seen.has(video.id))];
}
