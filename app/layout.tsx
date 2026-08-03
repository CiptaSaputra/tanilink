/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata, Viewport } from "next";
import "../src/index.css";

export const metadata: Metadata = {
  title: "TaniLink — Platform Sinergi Hulu-Hilir Pertanian",
  description:
    "Platform yang menghubungkan petani kecil-menengah dengan pembeli institusional sejak tahap rencana tanam",
};

/** Viewport meta — krusial agar tampil baik di HP (tanpa ini mobile ter-zoom-out) */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#5F7444",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
