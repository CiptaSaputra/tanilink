import { pgTable, text, varchar, timestamp, boolean, integer, doublePrecision, jsonb } from "drizzle-orm/pg-core";

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
  isPublished: boolean("is_published").default(true).notNull(),
  status: varchar("status").notNull(),
  notes: text("notes"),
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
});

export const matches = pgTable("matches", {
  id: varchar("id").primaryKey(),
  harvestId: varchar("harvest_id").notNull(),
  demandId: varchar("demand_id").notNull(),
  score: doublePrecision("score").notNull(),
  distanceKm: doublePrecision("distance_km").notNull(),
  scoreDetails: jsonb("score_details").notNull(),
  status: varchar("status").notNull(),
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
