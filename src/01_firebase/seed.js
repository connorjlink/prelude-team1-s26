/**
 * Firestore Seeder
 * Uploads db.json data into Firestore collections.
 *
 * Usage:
 *   npm run seed              -> seeds from db.json via node
 *   or in browser console:   import { seedAll } from "./01_firebase/seed"; await seedAll();
 *
 * Requires: Firebase already initialized via config_firebase.js
 * Run with: node src/01_firebase/seed.js  (use --experimental-modules if needed)
 * Or via:  npm run seed
 *
 * For substance over correctness this is idempotent - uses setDoc with custom IDs.
 */

import { db } from "./config_firebase.js";
import { doc, writeBatch, serverTimestamp } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_MAP = {
  users: "users",
  hotel: "hotels",
  flight: "flights",
  giftcards: "giftcards",
  hotelcart: "hotelcart",
  flightcart: "flightcart",
};

async function seedCollection(colName, items) {
  if (!items || items.length === 0) {
    console.log(`[seed] skip ${colName}: no items`);
    return;
  }
  console.log(`[seed] seeding ${colName} with ${items.length} docs...`);
  // Firestore batch limit is 500 writes
  const chunkSize = 400;
  for (let i = 0; i < items.length; i += chunkSize) {
    const chunk = items.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    chunk.forEach((item) => {
      const id = item.id ? String(item.id) : undefined;
      // giftcards use string ids like WeddingGiftCard
      const ref = id ? doc(db, colName, id) : doc(db, colName);
      const { id: _omit, ...rest } = item;
      batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: true });
    });
    await batch.commit();
    console.log(`[seed] ${colName} chunk ${i / chunkSize + 1} committed`);
  }
}

export async function seedAll(jsonPath) {
  const resolvedPath = jsonPath || path.resolve(__dirname, "../../db.json");
  const raw = fs.readFileSync(resolvedPath, "utf-8");
  const data = JSON.parse(raw);

  // Seed each collection
  for (const [jsonKey, colName] of Object.entries(COLLECTION_MAP)) {
    if (data[jsonKey]) {
      await seedCollection(colName, data[jsonKey]);
    }
  }

  // Also seed admins collection with a default admin (for substance)
  await seedCollection("admins", [
    { id: "admin1", email: "admin@expedia.com", password: "admin123", role: "admin", name: "Super Admin" },
  ]);

  // Seed sample bookings to show structure
  await seedCollection("bookings", [
    { id: "sample_booking_1", userId: "1", type: "hotel", itemId: "4", status: "confirmed", totalPrice: 2673, guests: 2 },
    { id: "sample_booking_2", userId: "2", type: "flight", itemId: "1", status: "confirmed", totalPrice: 6999, guests: 1 },
  ]);

  console.log("[seed] Done!");
}

// Allow direct execution: node src/01_firebase/seed.js
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  seedAll().catch((e) => {
    console.error("[seed] failed", e);
    process.exit(1);
  });
}
