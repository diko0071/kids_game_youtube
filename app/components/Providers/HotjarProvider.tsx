"use client";

import { useHotjar } from "@/app/hooks/useHotjar";

export default function HotjarProvider() {
  useHotjar();
  return null;
}