import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { bookingService, cartService } from "../01_firebase/firestore";
import { formatCurrency } from "../utils/currency";
import { getActiveUserId } from "../utils/cart";
import "./CheckoutPage.css";

function getLineTotal(item) {
  if (item.type === "package") {
    const fullPrice = Number(item.fullPrice) || 0;
    return {
      fullPrice,
      total: Number(item.totalPrice) || fullPrice,
      detail: `${item.nights || 1} nights · ${item.item?.discountPercentage || 0}% discount`,
    };
  }
  if (item.type === "hotel") {
    const nights = Number(item.nights) || 1;
    return { fullPrice: (Number(item.item?.price) || 0) * nights, total: (Number(item.item?.price) || 0) * nights, detail: `${nights} night${nights === 1 ? "" : "s"}` };
  }
  return { fullPrice: Number(item.totalPrice) || Number(item.item?.price) || 0, total: Number(item.totalPrice) || Number(item.item?.price) || 0, detail: item.type === "flight" ? "Flight fare" : "Admission" };
}

export default function CheckoutPage() {
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);
  const userId = getActiveUserId(activeUser);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", card: "", cvv: "" });
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState(null);

  useEffect(() => {
    if (!userId) {
      setCart([]);
      setLoading(false);
      return undefined;
    }
    let active = true;
    cartService.getForUser(userId)
      .then((items) => { if (active) setCart(items); })
      .catch((requestError) => {
        console.error("Unable to load the shopping cart.", requestError);
        if (active) setError("Your cart could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const lines = useMemo(() => cart.map((item) => ({ item, pricing: getLineTotal(item) })), [cart]);
  const grandTotal = lines.reduce((sum, line) => sum + line.pricing.total, 0);

  const removeItem = async (cartItemId) => {
    try {
      const nextCart = await cartService.removeForUser(userId, cartItemId);
      setCart(nextCart);
    } catch (requestError) {
      console.error("Unable to remove cart item.", requestError);
      setError("That item could not be removed.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const card = form.card.replace(/\D/g, "");
    const cvv = form.cvv.replace(/\D/g, "");
    if (!form.name.trim() || (card.length !== 16 && card.length !== 15) || (cvv.length !== 3 && cvv.length !== 4)) {
      setError("Enter a name, a 15- or 16-digit card number, and a 3- or 4-digit CVV.");
      return;
    }
    setError("");
    try {
      const bookings = await Promise.all(lines.map(({ item, pricing }) => bookingService.create({
        userId,
        type: item.type,
        itemId: item.itemId,
        totalPrice: pricing.total,
        status: "confirmed",
        checkIn: item.item?.checkInDate || item.item?.departureDate,
        checkOut: item.item?.checkOutDate || item.item?.returnDate,
        itemDetails: item.item,
      })));
      await cartService.clearForUser(userId);
      setCart([]);
      setReceipt({ bookings, total: grandTotal, paidAt: new Date().toLocaleString() });
    } catch (requestError) {
      console.error("Unable to complete the booking.", requestError);
      setError("We could not complete the booking. Please try again.");
    }
  };

  if (!userId) {
    return <main className="checkout-page"><div className="catalog-heading checkout-heading"><div><span className="eyebrow">Prelude journeys</span><h1>Your cart</h1><p>Sign in to view and save travel plans.</p></div></div><section className="checkout-empty"><Link className="catalog-action" to="/login">Sign in to continue</Link></section></main>;
  }

  if (receipt) {
    return <main className="checkout-page"><div className="catalog-heading checkout-heading"><div><span className="eyebrow">Prelude journeys</span><h1>Booking confirmed</h1><p>Your mock payment was accepted and your itinerary is reserved.</p></div></div><section className="checkout-card receipt-card"><h2>Receipt</h2><p>Confirmation date: {receipt.paidAt}</p><div className="checkout-total checkout-total-final"><span>Total paid</span><b>{formatCurrency(receipt.total)}</b></div><Link className="catalog-action" to="/">Continue exploring</Link></section></main>;
  }

  return (
    <main className="checkout-page">
      <div className="catalog-heading checkout-heading"><div><span className="eyebrow">Prelude journeys</span><h1>Your cart</h1><p>Review your travel plans before completing the mock payment.</p></div></div>
      {error && <p className="checkout-error" role="alert">{error}</p>}
      {loading ? <section className="checkout-empty">Loading your cart...</section> : !cart.length ? <section className="checkout-empty">Your cart is empty. <Link to="/">Start a new search</Link></section> : (
        <div className="checkout-grid">
          <form className="checkout-main" onSubmit={handleSubmit}>
            <section className="checkout-card"><h2>Payment method</h2><p className="checkout-muted">For example purposes only. No charge will be made.</p><div className="checkout-form-grid"><label>Name on card<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label>Card number<input inputMode="numeric" maxLength="19" required value={form.card} onChange={(event) => setForm({ ...form, card: event.target.value })} placeholder="1234 5678 9012 3456" /></label><label>CVV<input inputMode="numeric" maxLength="4" required value={form.cvv} onChange={(event) => setForm({ ...form, cvv: event.target.value })} /></label></div></section>
            <button className="catalog-action checkout-submit" type="submit">Complete booking · {formatCurrency(grandTotal)}</button>
          </form>
          <aside className="checkout-summary"><h2>Trip summary</h2>{lines.map(({ item, pricing }) => <div className="cart-line" key={item.cartItemId}><div><strong>{item.title || item.type}</strong><span>{pricing.detail}</span>{item.type === "package" && pricing.fullPrice > pricing.total && <small>Full price {formatCurrency(pricing.fullPrice)}</small>}</div><div><b className={pricing.fullPrice > pricing.total ? "discounted-price" : ""}>{formatCurrency(pricing.total)}</b><button type="button" onClick={() => removeItem(item.cartItemId)} aria-label={`Remove ${item.title || item.type}`}>Remove</button></div></div>)}<div className="checkout-total checkout-total-final"><span>Grand total</span><b>{formatCurrency(grandTotal)}</b></div></aside>
        </div>
      )}
    </main>
  );
}
