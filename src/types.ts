/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Role =
  "PETANI" | "PEMBELI" | "PPL" | "DINAS" | "ADMIN" | "KOLEKTOR" | "PUBLIK";

// ─── Auth Types ────────────────────────────────────────────────────────────────

/** Entitas user yang disimpan di localStorage (password di-hash sederhana, bukan plaintext) */
export interface User {
  id: string;
  name: string;
  email: string;
  /** Password di-hash dengan btoa (cukup untuk demo tanpa backend) */
  passwordHash: string;
  role: Role;
  region: string;
  /** Nomor WA format internasional tanpa '+', contoh: 6281234567890 */
  phone?: string;
  createdAt: string;
}

/** User aktif yang tersedia di session — tanpa passwordHash */
export type AuthUser = Omit<User, "passwordHash">;

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: Extract<Role, "PETANI" | "PEMBELI" | "PPL" | "KOLEKTOR">; // Admin & Dinas tidak bisa self-register
  region: string;
}

export interface AuthContextProps {
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    credentials: LoginCredentials,
  ) => Promise<{ success: boolean; error?: string }>;
  register: (
    data: RegisterData,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export type Komoditas =
  | "Cabai Merah"
  | "Bawang Merah"
  | "Tomat"
  | "Kentang"
  | "Kubis"
  | "Padi"
  | "Jagung";

export interface CommodityMetadata {
  name: Komoditas;
  typicalDurationDays: number; // days from planting to harvest
  typicalYieldKgPerHectare: number;
  shelfLifeDays: number; // days before spoiling/loss post-harvest
  averagePricePerKg: number; // in IDR
  color: string; // for UI charts
}

export interface Harvest {
  id: string;
  farmerId: string;
  farmerName: string;
  commodity: Komoditas;
  landArea: number; // in hectares
  expectedVolume: number; // in Kg
  askingPrice: number; // in IDR per Kg
  latitude: number;
  longitude: number;
  region: string; // e.g., 'Brebes', 'Garut', 'Malang'
  plantingDate: string; // YYYY-MM-DD
  expectedHarvestDate: string; // YYYY-MM-DD
  weatherRiskLevel?: "LOW" | "MEDIUM" | "HIGH";
  isPublished: boolean; // opt-in publikasi
  status: "ACTIVE" | "MATCHED" | "HARVESTED" | "EXPIRED";
  notes?: string;
  addressDetail?: string;
}

export interface Demand {
  id: string;
  buyerId: string;
  buyerName: string;
  commodity: Komoditas;
  requiredVolume: number; // in Kg
  offerPrice: number; // in IDR per Kg
  latitude: number;
  longitude: number;
  region: string;
  dateRequired: string; // YYYY-MM-DD
  status: "ACTIVE" | "FULFILLED" | "CANCELLED";
  notes?: string;
  addressDetail?: string;
}

export interface MatchScoreDetails {
  distanceScore: number; // 0 - 100
  volumeScore: number; // 0 - 100
  priceScore: number; // 0 - 100
  totalScore: number; // 0 - 100
  distanceKm: number;
}

export interface Match {
  id: string;
  harvestId: string;
  demandId: string;
  score: number; // Overall Score 0 - 100
  distanceKm: number;
  scoreDetails: MatchScoreDetails;
  status:
    | "PENDING"
    | "WAITING_BUYER_APPROVAL"  // Petani sudah ajukan penawaran, menunggu pembeli
    | "ACCEPTED_BY_BUYER"
    | "CONFIRMED"
    | "REJECTED"               // Pembeli menolak penawaran petani
    | "DISPUTED";
  /** Volume yang ditawarkan petani (kg) — diisi saat farmer bid */
  bidVolume?: number;
  /** Harga per kg yang ditawarkan petani — diisi saat farmer bid */
  bidPrice?: number;
  createdAt: string;
}

export interface MatchWeights {
  wLocation: number; // e.g., 0.4
  wVolume: number; // e.g., 0.3
  wPrice: number; // e.g., 0.3
}

export interface RegionStats {
  regionName: string;
  totalHarvestKg: number;
  totalDemandKg: number;
  activeFarmers: number;
  activeBuyers: number;
  surplusRiskIndex: number; // 0 to 100, showing risk of waste
  unmatchedSurplusKg: number;
}

export interface PreOrder {
  id: string;
  matchId: string;
  harvestId: string;
  demandId: string;
  agreedPricePerKg: number;
  agreedVolumeKg: number;
  farmerName: string;
  buyerName: string;
  commodity: Komoditas;
  deliveryMode: "direct" | "consolidated"; // jual langsung atau ikut konsolidasi
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

export interface Conversation {
  id: string;
  matchId: string;
  farmerUserId: string;
  buyerUserId: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  content: string;
  sentAt: string;
}

export interface PaymentConfirmation {
  id: string;
  preOrderId: string;
  proofImageUrl?: string;
  status: "not_submitted" | "submitted" | "confirmed";
  notes?: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  amount?: number;
  paidAt?: string;
}

export interface Review {
  id: string;
  preOrderId: string;
  reviewerUserId: string;
  revieweeUserId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt: string;
}

export interface HarvestBatch {
  id: string;
  plantingId: string; // references Harvest.id
  farmerId: string;
  farmerName: string;
  commodity: Komoditas;
  region: string;
  latitude: number;
  longitude: number;
  preOrderId?: string; // if linked to a confirmed pre-order
  actualVolumeKg: number;
  harvestDate: string; // YYYY-MM-DD
  shelfLifeDays: number;
  priorityScore: number; // computed: 0-100, higher = more urgent
  status: "READY" | "IN_TRANSIT" | "DELIVERED" | "PICKED_UP_DIRECTLY"; // PICKED_UP_DIRECTLY = pembeli jemput langsung
  createdAt: string;
}

/** Listing terbuka di marketplace — batch panen yang tidak ter-match */
export interface MarketplaceListing {
  id: string;
  harvestId?: string;
  batchId?: string;
  farmerId: string;
  farmerName: string;
  commodity: Komoditas;
  volumeKg: number;
  pricePerKg: number;
  region: string;
  latitude: number;
  longitude: number;
  status: "open" | "sold" | "expired";
  notes?: string;
  listedAt: string;
}

/** Notifikasi ter-persist (riwayat) per user */
export interface NotificationItem {
  id: string;
  userId: string;
  type: "match" | "preorder" | "batch" | "weather" | "system";
  message: string;
  read: boolean;
  createdAt: string;
}

/** Entri hash-chain ledger (tamper-evident riwayat transaksi) */
export interface LedgerEntry {
  id: string;
  preOrderId: string;
  recordData: string;
  previousHash: string;
  currentHash: string;
  createdAt: string;
}

/** Konten edukasi budidaya yang dipublikasi PPL/BPP */
export interface EducationalContent {
  id: string;
  pplUserId: string;
  pplName: string;
  region: string;
  title: string;
  body: string;
  status: "pending" | "published" | "rejected";
  createdAt: string;
}
