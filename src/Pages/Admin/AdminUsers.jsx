import React, { useEffect, useMemo, useState } from "react";
import { cartService, userService } from "../../01_firebase/firestore";
import AdminNav from "./AdminNav";
import "./adminProduct.css";

const ownerId = (item) => String(item.userId ?? item.user_id ?? item.uid ?? "");

const cartLabel = (item) =>
  item.name || item.title || item.airline || item.place || item.from
    ? [item.name || item.title || item.airline, item.place || (item.from && `${item.from} to ${item.to || ""}`)]
        .filter(Boolean)
        .join(" · ")
    : "Cart item";

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [carts, setCarts] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([userService.getAll(), cartService.hotelCart.getAll(), cartService.flightCart.getAll()])
      .then(async ([userData, hotelCart, flightCart]) => {
        const embeddedCarts = await Promise.all(
          userData.map(async (user) => ({
            userId: user.id,
            items: await cartService.getForUser(user.id),
          }))
        );
        setUsers(userData);
        setCarts([
          ...hotelCart.map((item) => ({ ...item, cartType: "Stay" })),
          ...flightCart.map((item) => ({ ...item, cartType: "Flight" })),
          ...embeddedCarts.flatMap(({ userId, items }) =>
            items.map((item) => ({ ...item, userId, cartType: item.type || "Cart" }))
          ),
        ]);
      })
      .catch((requestError) => {
        console.error("Unable to load admin users.", requestError);
        setError("Unable to load users and cart contents.");
      });
  }, []);

  const cartsByUser = useMemo(
    () => carts.reduce((groups, item) => {
      const id = ownerId(item);
      if (!groups[id]) groups[id] = [];
      groups[id].push(item);
      return groups;
    }, {}),
    [carts]
  );

  const removeUser = async (id) => {
    if (!window.confirm("Delete this user account?")) return;
    try {
      await userService.remove(id);
      setUsers((current) => current.filter((user) => user.id !== id));
    } catch (requestError) {
      console.error("Unable to delete user.", requestError);
      setError("Unable to delete this account.");
    }
  };

  return (
    <div className="adminProductMain">
      <AdminNav />
      <main className="adminProductbox">
        <div className="head"><h1>Users</h1></div>
        {error && <p role="alert">{error}</p>}
        {users.map((user) => {
          const userCarts = cartsByUser[String(user.id)] || [];
          return (
            <section className="adminUserCard" key={user.id}>
              <div>
                <strong>{user.user_name || user.userName || "Unnamed user"}</strong>
                <span>Account ID: {user.id}</span>
                <span>{user.email || "No email"} · {user.number || "No phone"}</span>
              </div>
              <div>
                <strong>Shopping cart ({userCarts.length})</strong>
                {userCarts.length ? userCarts.map((item) => (
                  <span key={`${item.cartType}-${item.id}`}>{item.cartType}: {cartLabel(item)}</span>
                )) : <span>No items in cart</span>}
              </div>
              <button type="button" onClick={() => removeUser(user.id)}>Delete account</button>
            </section>
          );
        })}
        {!users.length && !error && <p>No user accounts found.</p>}
      </main>
    </div>
  );
}
