"use client";

import { useEffect, useState } from "react";
import { CartoonVideo, getPlaybackId, getVideo } from "../data/catalog";
import { parseRecommendations } from "../lib/recommendations";

declare global {
  interface Window { __kidsRecommendations?: unknown; }
}

export default function useNativeRecommendations(currentVideo: CartoonVideo) {
  const [recommendations, setRecommendations] = useState<CartoonVideo[]>([]);
  useEffect(() => {
    const receive = () => {
      const batch = parseRecommendations(window.__kidsRecommendations);
      if (!batch || batch.sourceVideoId !== getPlaybackId(currentVideo)) return;
      setRecommendations(batch.videos.map(video => {
        const approved = getVideo(video.id);
        return approved ?? { ...video, channel: "YouTube", language: "unknown", topicId: currentVideo.topicId };
      }));
    };
    setRecommendations([]);
    window.addEventListener("kids-recommendations", receive);
    receive();
    return () => window.removeEventListener("kids-recommendations", receive);
  }, [currentVideo.id, currentVideo.playbackId, currentVideo.language, currentVideo.topicId]);
  return recommendations;
}
