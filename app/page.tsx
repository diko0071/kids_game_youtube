import Image from "next/image";
import MainView from "./components/main_view";
import { Suspense } from "react";
export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MainView />
    </Suspense>
  )
}