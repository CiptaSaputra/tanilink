/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Sprout,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  MapPin,
  AlertCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { RegisterData, Role } from "../../types";

interface RegisterPageProps {
  onNavigateToLogin: () => void;
}

type RegisterableRole = Extract<
  Role,
  "PETANI" | "PEMBELI" | "PPL" | "KOLEKTOR"
>;

const REGISTERABLE_ROLES: {
  value: RegisterableRole;
  label: string;
  desc: string;
}[] = [
  {
    value: "PETANI",
    label: "Petani",
    desc: "Input data tanam, kelola hasil panen, pre-order",
  },
  {
    value: "PEMBELI",
    label: "Pembeli / Koperasi",
    desc: "Publish permintaan, matching, pre-order",
  },
  {
    value: "PPL",
    label: "PPL / BPP",
    desc: "Monitoring wilayah binaan (read-only)",
  },
  {
    value: "KOLEKTOR",
    label: "Kolektor",
    desc: "Lihat rute rekomendasi, update status batch",
  },
];

const REGIONS = [
  "Brebes",
  "Garut",
  "Malang",
  "Magelang",
  "Semarang",
  "Cirebon",
  "Bandung",
  "Yogyakarta",
  "Surabaya",
  "Jakarta",
  "Medan",
  "Makassar",
  "Jawa Tengah",
  "Jawa Barat",
  "Jawa Timur",
  "Sumatera Utara",
];

export default function RegisterPage({ onNavigateToLogin }: RegisterPageProps) {
  const { register } = useAuth();
  const router = useRouter();

  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "PETANI",
    region: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof RegisterData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    // Hapus error field yang diubah
    if (fieldErrors[name as keyof RegisterData]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (error) setError(null);
  };

  const validate = (): boolean => {
    const errors: Partial<Record<keyof RegisterData, string>> = {};
    if (!form.name.trim()) errors.name = "Nama wajib diisi.";
    if (!form.email.trim()) {
      errors.email = "Email wajib diisi.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = "Format email tidak valid.";
    }
    if (form.password.length < 6)
      errors.password = "Password minimal 6 karakter.";
    if (form.password !== form.confirmPassword)
      errors.confirmPassword = "Konfirmasi password tidak cocok.";
    if (!form.region) errors.region = "Wilayah wajib dipilih.";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setError(null);

    const result = await register(form);
    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error ?? "Pendaftaran gagal. Silakan coba lagi.");
    }
    setIsSubmitting(false);
  };

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
          <div className="inline-flex items-center justify-center w-14 h-14 bg-nat-green rounded-2xl shadow-lg shadow-nat-green/20 mb-4">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-nat-dark">
            Daftar ke TaniLink
          </h1>
          <p className="text-sm text-nat-sage mt-1">
            Buat akun untuk mulai menggunakan platform
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-nat-border p-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error global */}
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

            {/* Nama */}
            <div className="space-y-1.5">
              <label
                htmlFor="name"
                className="block text-sm font-medium text-nat-dark"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Nama lengkap Anda"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-nat-dark placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors ${fieldErrors.name ? "border-red-400 bg-red-50" : "border-nat-border bg-white"}`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-600">{fieldErrors.name}</p>
              )}
            </div>

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
                  value={form.email}
                  onChange={handleChange}
                  placeholder="nama@email.com"
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-nat-dark placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors ${fieldErrors.email ? "border-red-400 bg-red-50" : "border-nat-border bg-white"}`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-1.5">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-nat-dark"
              >
                Peran
              </label>
              <div className="relative">
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full pl-4 pr-10 py-2.5 rounded-xl border border-nat-border bg-white text-sm text-nat-dark focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors appearance-none cursor-pointer"
                >
                  {REGISTERABLE_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-[11px] text-nat-sage">
                {REGISTERABLE_ROLES.find((r) => r.value === form.role)?.desc}
              </p>
            </div>

            {/* Wilayah */}
            <div className="space-y-1.5">
              <label
                htmlFor="region"
                className="block text-sm font-medium text-nat-dark"
              >
                Wilayah / Kabupaten
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <select
                  id="region"
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm text-nat-dark focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors appearance-none cursor-pointer ${fieldErrors.region ? "border-red-400 bg-red-50" : "border-nat-border bg-white"}`}
                >
                  <option value="" disabled>
                    Pilih wilayah...
                  </option>
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              {fieldErrors.region && (
                <p className="text-xs text-red-600">{fieldErrors.region}</p>
              )}
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-nat-dark placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors ${fieldErrors.password ? "border-red-400 bg-red-50" : "border-nat-border bg-white"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nat-sage hover:text-nat-dark transition-colors cursor-pointer"
                  aria-label={showPassword ? "Sembunyikan" : "Tampilkan"}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-red-600">{fieldErrors.password}</p>
              )}
            </div>

            {/* Konfirmasi Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-nat-dark"
              >
                Konfirmasi Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nat-sage pointer-events-none" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi password"
                  className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm text-nat-dark placeholder:text-nat-sage/60 focus:outline-none focus:ring-2 focus:ring-nat-green/30 focus:border-nat-green transition-colors ${fieldErrors.confirmPassword ? "border-red-400 bg-red-50" : "border-nat-border bg-white"}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-nat-sage hover:text-nat-dark transition-colors cursor-pointer"
                  aria-label={showConfirm ? "Sembunyikan" : "Tampilkan"}
                >
                  {showConfirm ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-red-600">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Catatan Admin/Dinas */}
            <p className="text-[11px] text-nat-sage bg-nat-light-cream rounded-lg px-3 py-2">
              ℹ️ Akun <strong>Admin</strong> dan{" "}
              <strong>Dinas Pertanian</strong> tidak tersedia untuk pendaftaran
              mandiri.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 bg-nat-green hover:bg-nat-green-hover text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan...</span>
                </>
              ) : (
                "Daftar"
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="mt-5 text-center text-sm text-nat-sage">
            Sudah punya akun?{" "}
            <button
              onClick={onNavigateToLogin}
              className="font-semibold text-nat-green hover:text-nat-green-hover transition-colors cursor-pointer"
            >
              Masuk di sini
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
