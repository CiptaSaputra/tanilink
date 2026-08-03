import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  doublePrecision,
  jsonb,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: varchar("id").primaryKey(),
  name: varchar("name").notNull(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").notNull(),
  region: varchar("region").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const harvests = pgTable("harvests", {
  id: varchar("id").primaryKey(),
  farmerId: varchar("farmer_id").notNull(),
  farmerName: varchar("farmer_name").notNull(),
  commodity: varchar("commodity").notNull(),
  landArea: doublePrecision("land_area").notNull(),
  expectedVolume: doublePrecision("expected_volume").notNull(),
  askingPrice: doublePrecision("asking_price").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  region: varchar("region").notNull(),
  plantingDate: varchar("planting_date").notNull(),
  expectedHarvestDate: varchar("expected_harvest_date").notNull(),
  weatherRiskLevel: varchar("weather_risk_level").default("LOW").notNull(),
  isPublished: boolean("is_published").default(true).notNull(),
  status: varchar("status").notNull(),
  notes: text("notes"),
  addressDetail: text("address_detail"),
});

export const demands = pgTable("demands", {
  id: varchar("id").primaryKey(),
  buyerId: varchar("buyer_id").notNull(),
  buyerName: varchar("buyer_name").notNull(),
  commodity: varchar("commodity").notNull(),
  requiredVolume: doublePrecision("required_volume").notNull(),
  offerPrice: doublePrecision("offer_price").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  region: varchar("region").notNull(),
  dateRequired: varchar("date_required").notNull(),
  status: varchar("status").notNull(),
  notes: text("notes"),
  addressDetail: text("address_detail"),
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey(),
  harvestId: varchar("harvest_id").notNull(),
  demandId: varchar("demand_id").notNull(),
  score: doublePrecision("score").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  scoreDetails: jsonb("score_details").notNull(),
  status: varchar("status").notNull(),
  bidVolume: doublePrecision("bid_volume"),
  bidPrice: doublePrecision("bid_price"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const preOrders = pgTable("pre_orders", {
  id: varchar("id").primaryKey(),
  matchId: varchar("match_id").notNull(),
  harvestId: varchar("harvest_id").notNull(),
  demandId: varchar("demand_id").notNull(),
  agreedPricePerKg: doublePrecision("agreed_price_per_kg").notNull(),
  agreedVolumeKg: doublePrecision("agreed_volume_kg").notNull(),
  farmerName: varchar("farmer_name").notNull(),
  buyerName: varchar("buyer_name").notNull(),
  commodity: varchar("commodity").notNull(),
  deliveryMode: varchar("delivery_mode").notNull(),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const harvestBatches = pgTable("harvest_batches", {
  id: varchar("id").primaryKey(),
  plantingId: varchar("planting_id").notNull(),
  farmerId: varchar("farmer_id").notNull(),
  farmerName: varchar("farmer_name").notNull(),
  commodity: varchar("commodity").notNull(),
  region: varchar("region").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  preOrderId: varchar("pre_order_id"),
  actualVolumeKg: doublePrecision("actual_volume_kg").notNull(),
  harvestDate: varchar("harvest_date").notNull(),
  shelfLifeDays: integer("shelf_life_days").notNull(),
  priorityScore: doublePrecision("priority_score").notNull(),
  status: varchar("status").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey(),
  matchId: varchar("match_id").notNull(),
  farmerUserId: varchar("farmer_user_id").notNull(),
  buyerUserId: varchar("buyer_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey(),
  conversationId: varchar("conversation_id").notNull(),
  senderUserId: varchar("sender_user_id").notNull(),
  content: text("content").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});

export const paymentConfirmations = pgTable("payment_confirmations", {
  id: varchar("id").primaryKey(),
  preOrderId: varchar("pre_order_id").notNull(),
  proofImageUrl: varchar("proof_image_url"),
  status: varchar("status").notNull(),
  notes: text("notes"),
  bankName: varchar("bank_name"),
  accountNumber: varchar("account_number"),
  accountName: varchar("account_name"),
  amount: doublePrecision("amount"),
  paidAt: varchar("paid_at"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey(),
  preOrderId: varchar("pre_order_id").notNull(),
  reviewerUserId: varchar("reviewer_user_id").notNull(),
  revieweeUserId: varchar("reviewee_user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketPrices = pgTable("market_prices", {
  id: varchar("id").primaryKey(),
  commodity: varchar("commodity").notNull(),
  region: varchar("region").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  dateRecorded: varchar("date_recorded").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const marketplaceListings = pgTable("marketplace_listings", {
  id: varchar("id").primaryKey(),
  harvestId: varchar("harvest_id"),
  batchId: varchar("batch_id"),
  farmerId: varchar("farmer_id").notNull(),
  farmerName: varchar("farmer_name").notNull(),
  commodity: varchar("commodity").notNull(),
  volumeKg: doublePrecision("volume_kg").notNull(),
  pricePerKg: doublePrecision("price_per_kg").notNull(),
  region: varchar("region").notNull(),
  latitude: doublePrecision("latitude").notNull(),
  longitude: doublePrecision("longitude").notNull(),
  status: varchar("status").notNull().default("open"), // open | sold | expired
  notes: text("notes"),
  listedAt: timestamp("listed_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  type: varchar("type").notNull(), // match | preorder | batch | weather | system
  message: text("message").notNull(),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Hash-chain ledger — tamper-evident riwayat transaksi PO selesai */
export const salesLedger = pgTable("sales_ledger", {
  id: varchar("id").primaryKey(),
  preOrderId: varchar("pre_order_id").notNull(),
  recordData: text("record_data").notNull(), // JSON: komoditas, volume, harga, pihak
  previousHash: varchar("previous_hash").notNull().default("GENESIS"),
  currentHash: varchar("current_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/** Konten edukasi budidaya — dipublikasi PPL/BPP per wilayah binaan */
export const educationalContents = pgTable("educational_contents", {
  id: varchar("id").primaryKey(),
  pplUserId: varchar("ppl_user_id").notNull(),
  pplName: varchar("ppl_name").notNull(),
  region: varchar("region").notNull(),
  title: varchar("title").notNull(),
  body: text("body").notNull(),
  status: varchar("status").notNull().default("pending"), // pending | published | rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
