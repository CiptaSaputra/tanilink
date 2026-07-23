/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";

function AuthRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="min-h-screen bg-nat-light-cream/50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-nat-green" />
        <p className="text-sm font-medium text-nat-sage">Memuat...</p>
      </div>
    </div>
  );
}

export default function RootApp() {
  return (
    <AuthProvider>
      <AuthRedirect />
    </AuthProvider>
  );
}
