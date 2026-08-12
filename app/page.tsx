import { Suspense } from "react";
import KidsTubeApp from "@/app/components/KidsTubeApp";

export default function Home() {
  return (
    <Suspense fallback={<div className="app-loading">Готовим мультиигру…</div>}>
      <KidsTubeApp />
    </Suspense>
  );
}
