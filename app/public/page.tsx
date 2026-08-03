/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * app/public/page.tsx — Dashboard Publik (tanpa login)
 * PRD: dashboard publik dapat diakses tanpa autentikasi.
 */

"use client";

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { DataProvider } from "@/context/DataContext";

const PublicDashboard = dynamic(
  () => import("@/components/PublicDashboard"),
  { ssr: false },
);

export default function PublicPage() {
  return (
    <AuthProvider>
      <UIProvider>
        <DataProvider>
          <div className="min-h-screen bg-nat-light-cream/50">
            <PublicDashboard />
          </div>
        </DataProvider>
      </UIProvider>
    </AuthProvider>
  );
}
