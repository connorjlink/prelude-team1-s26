/**
 * Firestore Seeder - Option B (hardened, idempotent)
 * Uploads db.json data into Firestore collections.
 *
 * Usage:
 *   node src/01_firebase/seed.js                 # upsert (merge, overwrite stale fields)
 *   node src/01_firebase/seed.js --skip-existing # only create missing docs, preserve manual edits
 *   node src/01_firebase/seed.js --dry-run       # no writes, log what would happen
 *   node src/01_firebase/seed.js --clean         # delete collection contents before seeding (destructive!)
 *   node src/01_firebase/seed.js --clean --dry-run # preview clean
 *   node src/01_firebase/seed.js --force         # alias for default upsert, overwrites even with skipExisting
 *
 * Or in browser console (import without fs):
 *   import { seedAllBrowser } from "./01_firebase/seed.browser"; await seedAllBrowser(dbJsonObject)
 *
 * Security: seeder respects Firestore rules. Run only with test-mode rules or an
 * authenticated admin context. See firestore.rules.
 */

import { db } from "./config_firebase.js";
import { doc, writeBatch, serverTimestamp, getDoc, getDocs, collection, deleteDoc } from "firebase/firestore";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const COLLECTION_MAP = {
  users: "users",
  hotel: "hotels",
  flight: "flights",
  Things_todo: "things_todo",
  giftcards: "giftcards",
  hotelcart: "hotelcart",
  flightcart: "flightcart",
};

function parseArgs(argv = process.argv.slice(2)) {
  const opts = { force: false, skipExisting: false, dryRun: false, clean: false };
  for (const a of argv) {
    if (a === "--force") opts.force = true;
    if (a === "--skip-existing") opts.skipExisting = true;
    if (a === "--dry-run") opts.dryRun = true;
    if (a === "--clean") opts.clean = true;
  }
  // --force overrides skipExisting (explicit overwrite)
  if (opts.force) opts.skipExisting = false;
  return opts;
}

function deterministicIdFallback(item, colName) {
  // Guard auto-ID path that would cause duplicates on re-run
  if (item.id) return String(item.id);
  // Derive stable id from business keys
  if (colName === "users" && item.number) return `phone_${String(item.number)}`;
  if (colName === "giftcards" && item.title) return item.title.replace(/\s+/g, "_");
  if (item.title && item.place) return `${item.title.replace(/\s+/g, "_")}_${item.place}`;
  if (item.name) return item.name.replace(/\s+/g, "_").slice(0, 80);
  return null; // will trigger warning + auto-ID (caller should handle)
}

async function cleanCollection(colName, dryRun) {
  const snap = await getDocs(collection(db, colName));
  if (snap.empty) {
    console.log(`[seed] clean ${colName}: already empty`);
    return;
  }
  console.log(`[seed] clean ${colName}: deleting ${snap.size} docs${dryRun ? " (dry-run, not deleted)" : ""}`);
  if (dryRun) return;
  const chunkSize = 400;
  for (let i = 0; i < snap.docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + chunkSize).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
}

async function seedCollection(colName, items, opts) {
  if (!items || items.length === 0) {
    console.log(`[seed] skip ${colName}: no items`);
    return { written: 0, skipped: 0, warnings: 0 };
  }

  if (opts.clean) {
    await cleanCollection(colName, opts.dryRun);
  }

  // Deduplicate within batch by derived id (e.g., duplicate phones in db.json)
  const seenIds = new Set();
  const seenPhones = new Set();
  let warnings = 0;

  // Filter duplicates inside db.json for users
  let filtered = items;
  if (colName === "users") {
    filtered = [];
    for (const item of items) {
      const phone = String(item.number || "");
      if (phone && seenPhones.has(phone)) {
        console.warn(`[seed] warn ${colName}: duplicate phone ${phone} (id ${item.id}) - keeping first, skipping duplicate`);
        warnings++;
        continue;
      }
      if (phone) seenPhones.add(phone);
      filtered.push(item);
    }
  }

  console.log(`[seed] seeding ${colName} with ${filtered.length} docs (from ${items.length}) opts=${JSON.stringify(opts)}`);

  if (opts.dryRun) {
    console.log(`[seed] dry-run ${colName}: would write ${filtered.length} docs`);
    return { written: 0, skipped: 0, warnings };
  }

  const chunkSize = 400;
  let written = 0;
  let skipped = 0;

  for (let i = 0; i < filtered.length; i += chunkSize) {
    const chunk = filtered.slice(i, i + chunkSize);
    const batch = writeBatch(db);
    let batchOps = 0;

    for (const item of chunk) {
      let id = item.id ? String(item.id) : deterministicIdFallback(item, colName);
      if (!id) {
        console.warn(`[seed] warn ${colName}: item missing id and no deterministic fallback, using auto-ID (will duplicate on re-run)`, item);
        warnings++;
        const ref = doc(collection(db, colName));
        const { id: _omit, ...rest } = item;
        batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
        batchOps++;
        continue;
      }

      if (seenIds.has(id)) {
        console.warn(`[seed] warn ${colName}: duplicate id ${id} within batch - skipping duplicate`);
        warnings++;
        continue;
      }
      seenIds.add(id);

      // skipExisting: check existence first (costs 1 read per doc, preserves manual edits)
      if (opts.skipExisting) {
        const existing = await getDoc(doc(db, colName, id));
        if (existing.exists()) {
          skipped++;
          continue;
        }
      }

      const ref = doc(db, colName, id);
      const { id: _omit, ...rest } = item;
      // Fix timestamps: don't overwrite createdAt on re-run when merge
      // For new docs, set both. For existing with merge, only updatedAt changes.
      // Firestore serverTimestamp handles it; we use merge:true so createdAt not clobbered if we omit?
      // Simpler: always set updatedAt, set createdAt only if not skipExisting path with existing doc.
      // With merge:true, existing createdAt preserved if we don't send it? But we do send it -> overwrite.
      // So when not skipExisting, we intentionally overwrite (force). When skipExisting we already skipped.
      // So here we are in force/upsert path: send both timestamps (overwrite).
      batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() }, { merge: !!opts.force || !opts.skipExisting ? true : false });
      // Note: merge:true is idempotent; merge:false would fail if exists but batch.set with merge:true is upsert.
      // We use merge:true for force path to allow upsert. For strict create-only, we'd use merge:false.
      batchOps++;
    }

    if (batchOps > 0) {
      await batch.commit();
      written += batchOps;
      console.log(`[seed] ${colName} chunk ${Math.floor(i / chunkSize) + 1} committed ${batchOps} writes (${written} total, ${skipped} skipped)`);
    } else {
      console.log(`[seed] ${colName} chunk ${Math.floor(i / chunkSize) + 1} skipped (all existed)`);
    }
  }

  return { written, skipped, warnings };
}

export async function seedAll(jsonPathOrOpts, maybeOpts) {
  // Allow seedAll({skipExisting:true}) or seedAll("/path/db.json", opts)
  let jsonPath = path.resolve(__dirname, "../../db.json");
  let opts = parseArgs();
  if (typeof jsonPathOrOpts === "string") jsonPath = jsonPathOrOpts;
  else if (jsonPathOrOpts && typeof jsonPathOrOpts === "object") opts = { ...opts, ...jsonPathOrOpts };
  if (maybeOpts) opts = { ...opts, ...maybeOpts };

  const raw = fs.readFileSync(jsonPath, "utf-8");
  const data = JSON.parse(raw);

  let totalWritten = 0;
  let totalSkipped = 0;

  for (const [jsonKey, colName] of Object.entries(COLLECTION_MAP)) {
    if (data[jsonKey]) {
      const res = await seedCollection(colName, data[jsonKey], opts);
      totalWritten += res.written;
      totalSkipped += res.skipped;
    }
  }

  // Seed admins (preserve existing admins if skipExisting)
  const adminRes = await seedCollection("admins", [
    { id: "admin1", email: "admin@expedia.com", password: "admin123", role: "admin", name: "Super Admin" },
  ], opts);
  totalWritten += adminRes.written;
  totalSkipped += adminRes.skipped;

  // Seed sample bookings
  const bookingRes = await seedCollection("bookings", [
    { id: "sample_booking_1", userId: "1", type: "hotel", itemId: "4", status: "confirmed", totalPrice: 2673, guests: 2 },
    { id: "sample_booking_2", userId: "2", type: "flight", itemId: "1", status: "confirmed", totalPrice: 6999, guests: 1 },
  ], opts);
  totalWritten += bookingRes.written;
  totalSkipped += bookingRes.skipped;

  console.log(`[seed] Done! written=${totalWritten} skipped=${totalSkipped} opts=${JSON.stringify(opts)}`);
  return { written: totalWritten, skipped: totalSkipped };
}

// Allow direct execution: node src/01_firebase/seed.js [--flags]
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const opts = parseArgs();
  seedAll(undefined, opts).catch((e) => {
    console.error("[seed] failed", e);
    // Hint about security
    if (String(e.message).includes("permission") || String(e.code).includes("permission")) {
      console.error("[seed] HINT: Firestore rules denied write. Ensure firestore.rules allows write or run with an authenticated admin. For test, set allow read, write: if true; then revert.");
    }
    process.exit(1);
  });
}
