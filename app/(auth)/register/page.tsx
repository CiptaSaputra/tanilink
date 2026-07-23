"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import dynamic from "next/dynamic";
import ErrorBoundary from "@/components/shared/ErrorBoundary";

const RegisterApp = dynamic(() => import("@/components/auth/RegisterApp"), {
  ssr: false,
});

export default function RegisterRoute() {
  return (
    <ErrorBoundary name="RegisterPage">
      <RegisterApp />
    </ErrorBoundary>
  );
}
