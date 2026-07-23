import { db } from "./index";
import { users, harvests, demands } from "./schema";
import { SEED_USERS } from "../data/users";
import { SEED_HARVESTS, SEED_DEMANDS } from "../data/seed";

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

    console.log("Database seeded successfully!");
  } catch (err) {
    console.error("Error seeding database:", err);
  } finally {
    process.exit(0);
  }
}

seed();
