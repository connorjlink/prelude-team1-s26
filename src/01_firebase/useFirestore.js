import { useEffect, useState } from "react";
import { hotelService, flightService, userService, bookingService } from "./firestore";

/**
 * Example hooks showing how to consume Firestore in components.
 * Substance over correctness - simple, reusable.
 */

export function useHotels(opts) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let unsub;
    setLoading(true);
    // real-time subscription
    unsub = hotelService.subscribe((docs) => {
      setData(docs);
      setLoading(false);
    }, opts);
    // fallback to one-time fetch if subscription fails
    hotelService.getAll(opts).then(setData).catch(() => {}).finally(() => setLoading(false));
    return () => unsub && unsub();
  }, [JSON.stringify(opts)]);
  return { data, loading };
}

export function useFlights(opts) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    flightService.getAll(opts).then(setData).finally(() => setLoading(false));
  }, [JSON.stringify(opts)]);
  return { data, loading };
}

export function useBookings(userId) {
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!userId) return;
    bookingService.getByUser(userId).then(setData);
  }, [userId]);
  return data;
}
