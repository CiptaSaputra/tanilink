/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { LoginCredentials } from "../../types";

interface LoginPageProps {
  onNavigateToRegister: () => void;
}

export default function LoginPage({ onNavigateToRegister }: LoginPageProps) {
  const { login } = useAuth();
  const router = useRouter();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const result = await login(credentials);
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setError(result.error ?? "Login gagal. Silakan coba lagi.");
    }
    setIsSubmitting(false);
  };

  const handleDemoLogin = async (email: string) => {
    setIsSubmitting(true);
    setError(null);
    const result = await login({ email, password: "demo123" });
    if (result.success) {
      router.replace("/dashboard");
    } else {
      setError(result.error ?? "Login gagal.");
    }
    setIsSubmitting(false);
  };

  const demoAccounts = [
    {
      label: "Petani",
      email: "petani@demo.com",
      color: "text-nat-green border-nat-green/30 hover:bg-nat-green/5",
    },
    {
      label: "Pembeli",
      email: "pembeli@demo.com",
      color: "text-nat-brown border-nat-brown/30 hover:bg-nat-brown/5",
    },
    {
      label: "PPL",
      email: "ppl@demo.com",
      color: "text-teal-700 border-teal-300 hover:bg-teal-50",
    },
    {
      label: "Kolektor",
      email: "kolektor@demo.com",
      color: "text-amber-700 border-amber-300 hover:bg-amber-50",
    },
    {
      label: "Dinas",
      email: "dinas@demo.com",
      color: "text-nat-dark border-nat-border hover:bg-nat-light-cream",
    },
    {
      label: "Admin",
      email: "admin@demo.com",
      color: "text-nat-sage border-nat-sage/30 hover:bg-nat-sage/5",
    },
  ];

  return (
    <div className="min-h-screen bg-nat-light-cream/50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block">
            <img
              src="/logo.png"
              alt="Logo TaniLink"
              className="w-28 h-20 object-contain mx-auto mb-4 drop-shadow-sm hover:opacity-80 transition-opacity"
            />
          </a>
          <h1 className="text-2xl font-bold text-nat-dark">
            Masuk ke TaniLink
          </h1>
          <p className="text-sm text-nat-sage mt-1">
            Platform Sinergi Hulu-Hilir Pertanian
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-1.5 mt-3 text-xs text-nat-green hover:text-nat-green-hover font-semibold transition-colors"
          >
            ← Kembali ke Beranda
          </a>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-nat-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Error alert */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-nat-dark"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={credentials.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-nat-border bg-white text-nat-dark text-sm placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-nat-dark"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={handleChange}
                  placeholder="Masukkan password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-nat-border bg-white text-nat-dark text-sm placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nat-sage hover:text-nat-dark transition-colors cursor-pointer"
                  aria-label={
                    showPassword ? "Sembunyikan password" : "Tampilkan password"
                  }
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={
                isSubmitting || !credentials.email || !credentials.password
              }
              className="w-full flex items-center justify-center gap-2 bg-nat-green hover:bg-nat-green-hover text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memproses...</span>
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>

          {/* Register link */}
          <p className="mt-5 text-center text-sm text-nat-sage">
            Belum punya akun?{" "}
            <button
              onClick={onNavigateToRegister}
              className="font-semibold text-nat-green hover:text-nat-green-hover transition-colors cursor-pointer"
            >
              Daftar sekarang
            </button>
          </p>
        </div>

        {/* Demo accounts */}
        <div className="mt-6">
          <p className="text-center text-xs text-nat-sage mb-3 font-medium uppercase tracking-wider">
            Akun Demo — klik untuk langsung masuk
          </p>
          <div className="grid grid-cols-3 gap-2">
            {demoAccounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleDemoLogin(acc.email)}
                disabled={isSubmitting}
                className={`text-xs font-medium px-3 py-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${acc.color}`}
              >
                {acc.label}
              </button>
            ))}
          </div>
          <p className="text-center text-[11px] text-nat-sage/70 mt-2">
            Password semua:{" "}
            <code className="bg-nat-light-cream px-1 py-0.5 rounded text-nat-dark">
              demo123
            </code>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
