"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dynamic from "next/dynamic";

const RootApp = dynamic(() => import("@/components/RootApp"), { ssr: false });

export default function HomePage() {
  return <RootApp />;
}
