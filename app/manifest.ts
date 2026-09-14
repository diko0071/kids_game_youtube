import type { MetadataRoute } from "next";

// Session 01a09d4d-67ed-7d10-aa87-a5bd1f1c0c17: a stable root launch keeps the installed app independent of whichever video was open during installation.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Мира и Люк - мультики и игры",
    short_name: "Мира и Люк",
    description: "Любимые мультики, свой каталог и развивающие игры.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f7f6fc",
    theme_color: "#ffffff",
    lang: "ru",
    icons: [{ src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" }],
  };
}
