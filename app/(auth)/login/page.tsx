"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const LoginApp = dynamic(() => import("@/components/auth/LoginApp"), {
  ssr: false,
});

export default function LoginRoute() {
  return (
    <ErrorBoundary name="LoginPage">
      <LoginApp />
    </ErrorBoundary>
  );
}
