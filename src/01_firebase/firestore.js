/**
 * Firestore service layer
 * Covers collections: users, admins, hotels, flights, things_todo, bookings, giftcards, hotelcart, flightcart
 * Provides CRUD + query helpers + real-time listeners
 * 
 * Usage:
 *   import { db } from "./config_firebase";
 *   import { hotelService, flightService, userService } from "./firestore";
 *   const hotels = await hotelService.getAll();
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config_firebase";

// ---------------------------------------------------------------------------
// Collection names - single source of truth
// ---------------------------------------------------------------------------
export const COLLECTIONS = {
  USERS: "users",
  ADMINS: "admins",
  HOTELS: "hotels", // canonical name (migrated from json-server "hotel")
  FLIGHTS: "flights", // canonical name (migrated from "flight")
  THINGS_TODO: "things_todo",
  PACKAGES: "packages",
  HOTEL_CART: "hotelcart",
  FLIGHT_CART: "flightcart",
  BOOKINGS: "bookings", // unified bookings for hotels+flights
  GIFTCARDS: "giftcards",
  REVIEWS: "reviews", // subcollection under hotels
};

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
function col(name) {
  return collection(db, name);
}

function docRef(colName, id) {
  return doc(db, colName, String(id));
}

async function getAll(colName, { orderByField, orderDir = "asc", limitN, queries = [] } = {}) {
  let q = col(colName);
  let constraints = [...queries];
  if (orderByField) constraints.push(orderBy(orderByField, orderDir));
  if (limitN) constraints.push(limit(limitN));
  if (constraints.length > 0) {
    q = query(q, ...constraints);
  }
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

async function getById(colName, id) {
  const snap = await getDoc(docRef(colName, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

async function create(colName, data, customId = null) {
  const payload = { ...data, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
  if (customId) {
    await setDoc(docRef(colName, customId), payload);
    return { id: String(customId), ...payload };
  }
  const ref = await addDoc(col(colName), payload);
  return { id: ref.id, ...payload };
}

async function update(colName, id, data) {
  await updateDoc(docRef(colName, id), { ...data, updatedAt: serverTimestamp() });
}

async function remove(colName, id) {
  await deleteDoc(docRef(colName, id));
}

function subscribe(colName, callback, opts = {}) {
  let q = col(colName);
  const constraints = [];
  if (opts.where) constraints.push(where(...opts.where));
  if (opts.orderBy) constraints.push(orderBy(...opts.orderBy));
  if (opts.limit) constraints.push(limit(opts.limit));
  if (constraints.length) q = query(q, ...constraints);
  return onSnapshot(q, (snap) => {
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(data);
  });
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export const userService = {
  collection: COLLECTIONS.USERS,
  getAll: (opts) => getAll(COLLECTIONS.USERS, opts),
  getById: (id) => getById(COLLECTIONS.USERS, id),
  getByPhone: async (phoneNumber) => {
    const q = query(col(COLLECTIONS.USERS), where("number", "==", String(phoneNumber)));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }))[0] || null;
  },
  create: (data) => create(COLLECTIONS.USERS, {
    number: data.number,
    user_name: data.user_name || data.userName || "",
    password: data.password || "",
    email: data.email || "",
    dob: data.dob || "",
    gender: data.gender || "",
    marital_status: data.marital_status ?? null,
    role: data.role || "user",
    ...data,
  }),
  createWithId: (id, data) => create(COLLECTIONS.USERS, data, id),
  update: (id, data) => update(COLLECTIONS.USERS, id, data),
  remove: (id) => remove(COLLECTIONS.USERS, id),
  subscribe: (cb, opts) => subscribe(COLLECTIONS.USERS, cb, opts),
  // bookings subcollection under user: users/{userId}/bookings
  getBookings: (userId) => getAll(`${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.BOOKINGS}`),
  addBooking: (userId, bookingData) => create(`${COLLECTIONS.USERS}/${userId}/${COLLECTIONS.BOOKINGS}`, bookingData),
};

// ---------------------------------------------------------------------------
// Admins - separate collection with role guard metadata
// ---------------------------------------------------------------------------
export const adminService = {
  collection: COLLECTIONS.ADMINS,
  getAll: (opts) => getAll(COLLECTIONS.ADMINS, opts),
  getById: (id) => getById(COLLECTIONS.ADMINS, id),
  create: (data) => create(COLLECTIONS.ADMINS, { role: "admin", ...data }),
  update: (id, data) => update(COLLECTIONS.ADMINS, id, data),
  remove: (id) => remove(COLLECTIONS.ADMINS, id),
};

// ---------------------------------------------------------------------------
// Hotels
// ---------------------------------------------------------------------------
export const hotelService = {
  collection: COLLECTIONS.HOTELS,
  getAll: (opts) => getAll(COLLECTIONS.HOTELS, opts),
  getById: (id) => getById(COLLECTIONS.HOTELS, id),
  search: async ({ city, minPrice, maxPrice, limitN = 20 } = {}) => {
    const constraints = [];
    if (city) constraints.push(where("place", "==", city));
    // price filters need to be combined; Firestore only allows one range per query,
    // so for substance we handle one bound in query and filter other in memory if needed
    if (minPrice != null) constraints.push(where("price", ">=", Number(minPrice)));
    if (maxPrice != null) constraints.push(where("price", "<=", Number(maxPrice)));
    constraints.push(orderBy("price", "asc"));
    if (limitN) constraints.push(limit(limitN));
    return getAll(COLLECTIONS.HOTELS, { queries: constraints });
  },
  create: (data) => create(COLLECTIONS.HOTELS, {
    name: data.name,
    place: data.place || data.location || "",
    location: data.location || data.place || "",
    description: data.description || "",
    price: Number(data.price) || 0,
    taxes: Number(data.taxes) || 0,
    rating: Number(data.rating) || 0,
    ratingtext: data.ratingtext || "",
    ratingcomment: data.ratingcomment || "",
    image: data.image || "",
    img1: data.img1 || data.image || "",
    img2: data.img2 || "",
    img3: data.img3 || "",
    img4: data.img4 || "",
    additional: data.additional || "",
    additional1: data.additional1 || "",
    additional2: data.additional2 || "",
    amenities: data.amenities || [],
    availableRooms: data.availableRooms ?? 5,
    ...data,
  }),
  update: (id, data) => update(COLLECTIONS.HOTELS, id, data),
  remove: (id) => remove(COLLECTIONS.HOTELS, id),
  subscribe: (cb, opts) => subscribe(COLLECTIONS.HOTELS, cb, opts),
  paginated: async (pageSize = 10, lastDoc = null) => {
    let q = query(col(COLLECTIONS.HOTELS), orderBy("createdAt", "desc"), limit(pageSize));
    if (lastDoc) q = query(col(COLLECTIONS.HOTELS), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(pageSize));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return { data, lastDoc: snap.docs[snap.docs.length - 1] || null };
  },
};

// ---------------------------------------------------------------------------
// Flights
// ---------------------------------------------------------------------------
export const flightService = {
  collection: COLLECTIONS.FLIGHTS,
  getAll: (opts) => getAll(COLLECTIONS.FLIGHTS, opts),
  getById: (id) => getById(COLLECTIONS.FLIGHTS, id),
  search: async ({ from, to, airline, limitN = 20 } = {}) => {
    const constraints = [];
    if (from) constraints.push(where("from", "==", from.toUpperCase()));
    if (to) constraints.push(where("to", "==", to.toUpperCase()));
    if (airline) constraints.push(where("airline", "==", airline));
    if (limitN) constraints.push(limit(limitN));
    return getAll(COLLECTIONS.FLIGHTS, { queries: constraints });
  },
  create: (data) => create(COLLECTIONS.FLIGHTS, {
    airline: data.airline,
    number: data.number || data.flightNumber || "",
    from: (data.from || "").toUpperCase(),
    to: (data.to || "").toUpperCase(),
    departure: data.departure || "",
    arrival: data.arrival || "",
    price: Number(data.price) || 0,
    totalTime: data.totalTime || "",
    availableSeats: data.availableSeats ?? 60,
    ...data,
  }),
  update: (id, data) => update(COLLECTIONS.FLIGHTS, id, data),
  remove: (id) => remove(COLLECTIONS.FLIGHTS, id),
  subscribe: (cb, opts) => subscribe(COLLECTIONS.FLIGHTS, cb, opts),
};

// ---------------------------------------------------------------------------
// Popular Attractions
// ---------------------------------------------------------------------------
export const thingsToDoService = {
  collection: COLLECTIONS.THINGS_TODO,
  getAll: (opts) => getAll(COLLECTIONS.THINGS_TODO, opts),
  search: async ({ place, limitN = 50 } = {}) => {
    const constraints = [];
    if (place) constraints.push(where("place", "==", place));
    if (limitN) constraints.push(limit(limitN));
    return getAll(COLLECTIONS.THINGS_TODO, { queries: constraints });
  },
};

// ---------------------------------------------------------------------------
// Holiday packages
// ---------------------------------------------------------------------------
export const packageService = {
  collection: COLLECTIONS.PACKAGES,
  getAll: (opts) => getAll(COLLECTIONS.PACKAGES, opts),
  create: (data) => create(COLLECTIONS.PACKAGES, {
    name: data.name,
    flightId: String(data.flightId),
    hotelId: String(data.hotelId),
    departureDate: data.departureDate,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    returnDate: data.returnDate,
    discountPercentage: Number(data.discountPercentage) || 0,
  }),
  update: (id, data) => update(COLLECTIONS.PACKAGES, id, data),
  remove: (id) => remove(COLLECTIONS.PACKAGES, id),
};

// ---------------------------------------------------------------------------
// Bookings (unified top-level collection + user subcollection mirror)
// ---------------------------------------------------------------------------
export const bookingService = {
  collection: COLLECTIONS.BOOKINGS,
  getAll: (opts) => getAll(COLLECTIONS.BOOKINGS, opts),
  getByUser: async (userId) => {
    const q = query(col(COLLECTIONS.BOOKINGS), where("userId", "==", String(userId)));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  getById: (id) => getById(COLLECTIONS.BOOKINGS, id),
  create: async (data) => {
    // data: { userId, type: 'hotel'|'flight', itemId, checkIn, checkOut, guests, totalPrice, status }
    const toTimestamp = (value) => {
      if (!value) return null;
      const date = value instanceof Date ? value : new Date(value);
      return Number.isNaN(date.getTime()) ? null : Timestamp.fromDate(date);
    };
    const payload = {
      ...data,
      userId: String(data.userId),
      type: data.type, // 'hotel' | 'flight' | 'giftcard'
      itemId: String(data.itemId ?? ""),
      status: data.status || "confirmed",
      totalPrice: Number(data.totalPrice) || 0,
      guests: data.guests || 1,
      checkIn: toTimestamp(data.checkIn),
      checkOut: toTimestamp(data.checkOut),
      flightDetails: data.flightDetails || null,
      hotelDetails: data.hotelDetails || null,
    };
    const created = await create(COLLECTIONS.BOOKINGS, payload);
    // mirror to user subcollection for quick lookup
    if (data.userId) {
      try {
        await setDoc(doc(db, `${COLLECTIONS.USERS}/${data.userId}/${COLLECTIONS.BOOKINGS}`, created.id), payload);
      } catch (_) {}
    }
    return created;
  },
  update: (id, data) => update(COLLECTIONS.BOOKINGS, id, data),
  remove: (id) => remove(COLLECTIONS.BOOKINGS, id),
};

// ---------------------------------------------------------------------------
// Giftcards
// ---------------------------------------------------------------------------
export const giftcardService = {
  collection: COLLECTIONS.GIFTCARDS,
  getAll: (opts) => getAll(COLLECTIONS.GIFTCARDS, opts),
  getByCategory: async (category) => {
    const q = query(col(COLLECTIONS.GIFTCARDS), where("category", "==", category));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  },
  create: (data) => create(COLLECTIONS.GIFTCARDS, data, data.id || null),
  update: (id, data) => update(COLLECTIONS.GIFTCARDS, id, data),
  remove: (id) => remove(COLLECTIONS.GIFTCARDS, id),
};

// ---------------------------------------------------------------------------
// Cart helpers (hotelcart / flightcart)
// ---------------------------------------------------------------------------
export const cartService = {
  getForUser: async (userId) => {
    if (!userId) return [];
    const user = await userService.getById(userId);
    return Array.isArray(user?.cart) ? user.cart : [];
  },
  saveForUser: async (userId, cart) => {
    if (!userId) throw new Error("A signed-in user is required to save a cart.");
    await userService.update(userId, { cart });
    return cart;
  },
  addForUser: async (userId, item) => {
    const cart = await cartService.getForUser(userId);
    const nextItem = { ...item, cartItemId: item.cartItemId || `${item.type}-${item.itemId}-${Date.now()}` };
    return cartService.saveForUser(userId, [...cart, nextItem]);
  },
  removeForUser: async (userId, cartItemId) => {
    const cart = await cartService.getForUser(userId);
    return cartService.saveForUser(userId, cart.filter((item) => item.cartItemId !== cartItemId));
  },
  clearForUser: (userId) => cartService.saveForUser(userId, []),
  hotelCart: {
    getAll: (opts) => getAll(COLLECTIONS.HOTEL_CART, opts),
    add: (data) => create(COLLECTIONS.HOTEL_CART, data),
    remove: (id) => remove(COLLECTIONS.HOTEL_CART, id),
  },
  flightCart: {
    getAll: (opts) => getAll(COLLECTIONS.FLIGHT_CART, opts),
    add: (data) => create(COLLECTIONS.FLIGHT_CART, data),
    remove: (id) => remove(COLLECTIONS.FLIGHT_CART, id),
  },
};

// ---------------------------------------------------------------------------
// Batch seed helper - used by seed.js
// ---------------------------------------------------------------------------
export async function batchWrite(colName, items, useCustomId = false) {
  const batch = writeBatch(db);
  items.forEach((item) => {
    const id = useCustomId && item.id ? String(item.id) : undefined;
    const ref = id ? doc(db, colName, id) : doc(col(colName));
    const { id: _omit, ...rest } = item;
    batch.set(ref, { ...rest, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
