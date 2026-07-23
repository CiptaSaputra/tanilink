import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://admin:password123@127.0.0.1:5434/tanilink",
});

const db = drizzle(pool);

async function main() {
  console.log("Migration started...");
  await migrate(db, { migrationsFolder: "./drizzle" });
  console.log("Migration completed.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
