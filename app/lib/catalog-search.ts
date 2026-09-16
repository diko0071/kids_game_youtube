import { CartoonVideo, getTopic } from "../data/catalog";

const normalize = (value: string): string =>
  value.normalize("NFKD").toLocaleLowerCase("ru-RU").replace(/\s+/g, " ").trim();

export function filterCatalog(videos: CartoonVideo[], query: string): CartoonVideo[] {
  const terms = normalize(query).split(" ").filter(Boolean);
  if (terms.length === 0) return videos;

  return videos.filter((video) => {
    const topic = getTopic(video.topicId);
    const index = normalize([
      video.title,
      video.channel,
      topic?.title ?? "",
      topic?.shortTitle ?? "",
      topic?.description ?? "",
      ...(video.searchTerms ?? []),
    ].join(" "));
    return terms.every((term) => index.includes(term));
  });
}
