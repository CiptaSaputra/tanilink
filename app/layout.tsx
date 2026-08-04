/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata, Viewport } from "next";
import { Instrument_Serif, IBM_Plex_Mono } from "next/font/google";
import "../src/index.css";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TaniLink — Platform Sinergi Hulu-Hilir Pertanian",
  description:
    "Platform yang menghubungkan petani kecil-menengah dengan pembeli institusional sejak tahap rencana tanam",
};

/** Viewport meta — krusial agar tampil baik di HP */
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
    <html
      lang="id"
      className={`${instrumentSerif.variable} ${ibmPlexMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
