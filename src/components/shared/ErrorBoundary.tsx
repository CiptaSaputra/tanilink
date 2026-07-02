/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * src/components/shared/ErrorBoundary.tsx
 * ────────────────────────────────────────────────────────────────────────────
 * Error boundary reusable component. Catches render errors dan menampilkan
 * fallback UI. Wrap di setiap role view agar crash tidak mematikan seluruh app.
 */

'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Label deskriptif untuk logging purposes (e.g. "FarmerView") */
  name?: string;
  /** Custom fallback — jika tidak ada, pakai default */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    const label = this.props.name ?? 'Unknown';
    console.error(`[ErrorBoundary:${label}]`, error, info.componentStack);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      const label = this.props.name ?? 'komponen';

      return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="bg-red-50 text-red-500 rounded-full p-4 mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-nat-brown mb-1">
            Terjadi Kesalahan
          </h3>
          <p className="text-sm text-nat-sage max-w-md mb-1">
            {label} mengalami error dan tidak dapat ditampilkan.
          </p>
          {this.state.error && (
            <p className="text-xs text-nat-sage/60 max-w-md mb-4 font-mono bg-nat-cream/50 px-3 py-1.5 rounded-lg">
              {this.state.error.message}
            </p>
          )}
          <button
            onClick={this.handleRetry}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-nat-green text-white text-sm font-semibold hover:bg-nat-green-dark transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Coba Lagi
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
