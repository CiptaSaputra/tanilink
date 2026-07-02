/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import type { Metadata } from 'next';
import '../src/index.css';

export const metadata: Metadata = {
  title: 'TaniLink — Platform Sinergi Hulu-Hilir Pertanian',
  description: 'Platform yang menghubungkan petani kecil-menengah dengan pembeli institusional sejak tahap rencana tanam',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
