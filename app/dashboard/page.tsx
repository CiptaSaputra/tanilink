"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const DashboardApp = dynamic(
  () => import("@/components/dashboard/DashboardApp"),
  { ssr: false },
);

export default function DashboardPage() {
  return (
    <ErrorBoundary name="DashboardApp">
      <DashboardApp />
    </ErrorBoundary>
  );
}
