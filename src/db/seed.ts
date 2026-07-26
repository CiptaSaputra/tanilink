import { db } from "./index";
import { users, harvests, demands, matches, preOrders } from "./schema";
import { SEED_USERS } from "../data/users";
import { SEED_HARVESTS, SEED_DEMANDS, SEED_MATCHES, SEED_PREORDERS } from "../data/seed";

async function seed() {
  console.log("Seeding database...");
  try {
    console.log("Seeding users...");
    for (const user of SEED_USERS) {
      await db
        .insert(users)
        .values({
          ...user,
          createdAt: new Date(user.createdAt),
        })
        .onConflictDoNothing();
    }

    console.log("Seeding harvests...");
    for (const harvest of SEED_HARVESTS) {
      await db.insert(harvests).values(harvest).onConflictDoNothing();
    }

    console.log("Seeding demands...");
    for (const demand of SEED_DEMANDS) {
      await db.insert(demands).values(demand).onConflictDoNothing();
    }

    console.log("Seeding matches...");
    for (const match of SEED_MATCHES) {
      await db.insert(matches).values({
        ...match,
        createdAt: new Date(match.createdAt),
      }).onConflictDoNothing();
    }

    console.log("Seeding pre-orders...");
    for (const po of SEED_PREORDERS) {
      await db
        .insert(preOrders)
        .values({
          ...po,
          createdAt: new Date(),
        })
        .onConflictDoNothing();
    }

    console.log("Seeding market prices...");
    const { marketPrices } = await import("./schema");
    const regions = ["Brebes", "Garut", "Malang"];
    const commodities = ["Bawang Merah", "Cabai Merah", "Tomat", "Kentang", "Kubis", "Padi", "Jagung"];
    const basePrices: Record<string, number> = {
      "Bawang Merah": 25000,
      "Cabai Merah": 40000,
      "Tomat": 8000,
      "Kentang": 12000,
      "Kubis": 5000,
      "Padi": 6000,
      "Jagung": 4500,
    };
    
    // Generate last 30 days of prices
    for (const r of regions) {
      for (const c of commodities) {
        let currentPrice = basePrices[c];
        for (let i = 30; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          
          // Random walk for price
          const change = (Math.random() - 0.5) * 1000;
          currentPrice += change;
          if (currentPrice < basePrices[c] * 0.5) currentPrice = basePrices[c] * 0.5; // Floor
          
          await db.insert(marketPrices).values({
            id: `mp_${r}_${c}_${i}`.replace(/\s+/g, '_').toLowerCase(),
            commodity: c,
            region: r,
            pricePerKg: Math.round(currentPrice / 100) * 100,
            dateRecorded: d.toISOString().split("T")[0],
          }).onConflictDoNothing();
        }
      }
    }

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    process.exit(0);
  }
}

seed();
