"use client";

import dynamic from "next/dynamic";

// SSR disabled karena komponen landing pakai leaflet & framer-motion
const LandingPage = dynamic(
  () => import("@/components/landing/LandingPage"),
  { ssr: false }
);

export default function HomePage() {
  return <LandingPage />;
}
