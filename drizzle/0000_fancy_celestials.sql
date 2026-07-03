CREATE TABLE "conversations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"match_id" varchar NOT NULL,
	"farmer_user_id" varchar NOT NULL,
	"buyer_user_id" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "demands" (
	"id" varchar PRIMARY KEY NOT NULL,
	"buyer_id" varchar NOT NULL,
	"buyer_name" varchar NOT NULL,
	"commodity" varchar NOT NULL,
	"required_volume" double precision NOT NULL,
	"offer_price" double precision NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"region" varchar NOT NULL,
	"date_required" varchar NOT NULL,
	"status" varchar NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "harvest_batches" (
	"id" varchar PRIMARY KEY NOT NULL,
	"planting_id" varchar NOT NULL,
	"farmer_id" varchar NOT NULL,
	"farmer_name" varchar NOT NULL,
	"commodity" varchar NOT NULL,
	"region" varchar NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"pre_order_id" varchar,
	"actual_volume_kg" double precision NOT NULL,
	"harvest_date" varchar NOT NULL,
	"shelf_life_days" integer NOT NULL,
	"priority_score" double precision NOT NULL,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "harvests" (
	"id" varchar PRIMARY KEY NOT NULL,
	"farmer_id" varchar NOT NULL,
	"farmer_name" varchar NOT NULL,
	"commodity" varchar NOT NULL,
	"land_area" double precision NOT NULL,
	"expected_volume" double precision NOT NULL,
	"asking_price" double precision NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"region" varchar NOT NULL,
	"planting_date" varchar NOT NULL,
	"expected_harvest_date" varchar NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"status" varchar NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "matches" (
	"id" varchar PRIMARY KEY NOT NULL,
	"harvest_id" varchar NOT NULL,
	"demand_id" varchar NOT NULL,
	"score" double precision NOT NULL,
	"distance_km" double precision NOT NULL,
	"score_details" jsonb NOT NULL,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" varchar PRIMARY KEY NOT NULL,
	"conversation_id" varchar NOT NULL,
	"sender_user_id" varchar NOT NULL,
	"content" text NOT NULL,
	"sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payment_confirmations" (
	"id" varchar PRIMARY KEY NOT NULL,
	"pre_order_id" varchar NOT NULL,
	"proof_image_url" varchar,
	"status" varchar NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "pre_orders" (
	"id" varchar PRIMARY KEY NOT NULL,
	"match_id" varchar NOT NULL,
	"harvest_id" varchar NOT NULL,
	"demand_id" varchar NOT NULL,
	"agreed_price_per_kg" double precision NOT NULL,
	"agreed_volume_kg" double precision NOT NULL,
	"farmer_name" varchar NOT NULL,
	"buyer_name" varchar NOT NULL,
	"commodity" varchar NOT NULL,
	"delivery_mode" varchar NOT NULL,
	"status" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviews" (
	"id" varchar PRIMARY KEY NOT NULL,
	"pre_order_id" varchar NOT NULL,
	"reviewer_user_id" varchar NOT NULL,
	"reviewee_user_id" varchar NOT NULL,
	"rating" integer NOT NULL,
	"comment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY NOT NULL,
	"name" varchar NOT NULL,
	"email" varchar NOT NULL,
	"password_hash" varchar NOT NULL,
	"role" varchar NOT NULL,
	"region" varchar NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
