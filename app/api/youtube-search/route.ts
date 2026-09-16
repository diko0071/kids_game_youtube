import { buildYouTubeApiUrl, normalizeYouTubeQuery, parseYouTubeSearchResponse } from "@/app/lib/youtube-search";

export async function GET(request: Request) {
  const query = normalizeYouTubeQuery(new URL(request.url).searchParams.get("q") ?? "");
  if (query.length < 2) {
    return Response.json({ error: "Введите хотя бы 2 символа." }, { status: 400 });
  }

  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "Поиск YouTube пока не подключён." }, { status: 503 });
  }

  try {
    const response = await fetch(buildYouTubeApiUrl(query, apiKey), {
      next: { revalidate: 300 },
    });
    if (!response.ok) {
      return Response.json({ error: "YouTube сейчас не ответил. Попробуйте ещё раз." }, { status: 502 });
    }

    const items = parseYouTubeSearchResponse(await response.json());
    return Response.json(
      { items },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch {
    return Response.json({ error: "YouTube сейчас не ответил. Попробуйте ещё раз." }, { status: 502 });
  }
}
