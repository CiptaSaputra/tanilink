/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/dashboard/DashboardApp.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Client-only dashboard component. Dibungkus dengan dynamic(ssr:false) agar
 * tidak di-render di server (mencegah "window is not defined").
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import { Info, X, CheckCircle, AlertCircle } from "lucide-react";

import { AuthProvider, useAuth } from "@/context/AuthContext";
import { UIProvider, useUI } from "@/context/UIContext";
import { DataProvider } from "@/context/DataContext";
import { ChatProvider } from "@/context/ChatContext";
import { PaymentProvider } from "@/context/PaymentContext";
import { ReviewProvider } from "@/context/ReviewContext";
import ErrorBoundary from "@/components/shared/ErrorBoundary";
import Navbar from "@/components/Navbar";
import InteractiveMap from "@/components/InteractiveMap";
import FarmerView from "@/components/FarmerView";
import BuyerView from "@/components/BuyerView";
import DinasView from "@/components/DinasView";
import AdminView from "@/components/AdminView";
import PPLView from "@/components/PPLView";
import KolektorView from "@/components/KolektorView";

// ─── Auth Gate ─────────────────────────────────────────────────────────────────

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-nat-light-cream/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-nat-green border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-nat-sage">
            Memverifikasi sesi...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}

// ─── Dashboard Content ─────────────────────────────────────────────────────────

function DashboardContent() {
  const { activeRole, notification, dismissNotification } = useUI();

  const [mapLat, setMapLat] = useState<number | undefined>(undefined);
  const [mapLng, setMapLng] = useState<number | undefined>(undefined);
  const [mapRegion, setMapRegion] = useState<string | undefined>(undefined);

  const handleSelectCoords = (lat: number, lng: number, region: string) => {
    setMapLat(lat);
    setMapLng(lng);
    setMapRegion(region);
  };

  const handleClearCoords = () => {
    setMapLat(undefined);
    setMapLng(undefined);
    setMapRegion(undefined);
  };

  return (
    <div className="min-h-screen bg-nat-light-cream/50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <ErrorBoundary name="InteractiveMap">
          <InteractiveMap
            onSelectCoords={
              activeRole === "PETANI" ||
              activeRole === "PEMBELI" ||
              activeRole === "PPL"
                ? handleSelectCoords
                : undefined
            }
            selectedLat={mapLat}
            selectedLng={mapLng}
          />
        </ErrorBoundary>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeRole}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.18 }}
          >
            {activeRole === "PETANI" && (
              <ErrorBoundary name="FarmerView">
                <FarmerView
                  mapLat={mapLat}
                  mapLng={mapLng}
                  mapRegion={mapRegion}
                  clearMapSelection={handleClearCoords}
                />
              </ErrorBoundary>
            )}
            {activeRole === "PEMBELI" && (
              <ErrorBoundary name="BuyerView">
                <BuyerView
                  mapLat={mapLat}
                  mapLng={mapLng}
                  mapRegion={mapRegion}
                  clearMapSelection={handleClearCoords}
                />
              </ErrorBoundary>
            )}
            {activeRole === "PPL" && (
              <ErrorBoundary name="PPLView">
                <PPLView />
              </ErrorBoundary>
            )}
            {activeRole === "DINAS" && (
              <ErrorBoundary name="DinasView">
                <DinasView />
              </ErrorBoundary>
            )}
            {activeRole === "ADMIN" && (
              <ErrorBoundary name="AdminView">
                <AdminView />
              </ErrorBoundary>
            )}
            {activeRole === "KOLEKTOR" && (
              <ErrorBoundary name="KolektorView">
                <KolektorView />
              </ErrorBoundary>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Toast notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 30, transition: { duration: 0.15 } }}
            className={`fixed top-20 right-6 z-[9999] flex items-center space-x-3 px-4 py-3.5 rounded-xl shadow-xl border border-nat-border text-xs font-semibold select-none min-w-[320px] max-w-md transition-all ${
              notification.type === "success"
                ? "bg-nat-light-cream text-emerald-900 border-l-4 border-l-nat-green"
                : notification.type === "warning"
                  ? "bg-nat-light-cream text-amber-900 border-l-4 border-l-nat-brown"
                  : "bg-sky-50 text-sky-900 border-l-4 border-l-sky-500"
            }`}
          >
            {notification.type === "success" && (
              <CheckCircle className="w-4 h-4 text-nat-green shrink-0" />
            )}
            {notification.type === "warning" && (
              <AlertCircle className="w-4 h-4 text-nat-brown shrink-0" />
            )}
            {notification.type === "info" && (
              <Info className="w-4 h-4 text-sky-600 shrink-0" />
            )}
            <span className="flex-1 font-medium">{notification.message}</span>
            <button
              onClick={dismissNotification}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                notification.type === "success"
                  ? "hover:bg-nat-cream text-nat-green"
                  : notification.type === "warning"
                    ? "hover:bg-nat-cream text-nat-brown"
                    : "hover:bg-sky-100 text-sky-600"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Export ─────────────────────────────────────────────────────────────────────

export default function DashboardApp() {
  return (
    <AuthProvider>
      <AuthGuard>
        <UIProvider>
          <DataProvider>
            <ChatProvider>
              <PaymentProvider>
                <ReviewProvider>
                  <DashboardContent />
                </ReviewProvider>
              </PaymentProvider>
            </ChatProvider>
          </DataProvider>
        </UIProvider>
      </AuthGuard>
    </AuthProvider>
  );
}
