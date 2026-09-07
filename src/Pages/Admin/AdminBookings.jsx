import React, { useEffect, useState } from "react";
import { bookingService } from "../../01_firebase/firestore";
import AdminNav from "./AdminNav";
import "./adminProduct.css";

const displayDate = (value) => {
  if (!value) return "—";
  const date = value.toDate ? value.toDate() : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString();
};

export function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    bookingService.getAll()
      .then(setBookings)
      .catch((requestError) => {
        console.error("Unable to load admin bookings.", requestError);
        setError("Unable to load bookings.");
      });
  }, []);

  return (
    <div className="adminProductMain">
      <AdminNav />
      <main className="adminProductbox">
        <div className="head"><h1>Bookings</h1></div>
        {error && <p role="alert">{error}</p>}
        {bookings.map((booking) => (
          <div className="adminProductlist booking-row" key={booking.id}>
            <span><strong>{booking.type || "Booking"}</strong></span>
            <span>Booking: {booking.id}</span>
            <span>User: {booking.userId || "—"}</span>
            <span>Status: {booking.status || "—"}</span>
            <span>{displayDate(booking.checkIn)} – {displayDate(booking.checkOut)}</span>
            <span>${Number(booking.totalPrice || 0).toLocaleString()}</span>
          </div>
        ))}
        {!bookings.length && !error && <p>No bookings found.</p>}
      </main>
    </div>
  );
}
