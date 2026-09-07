import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import {
  flightService,
  hotelService,
  packageService,
} from "../../01_firebase/firestore";
import { addCartItem } from "../../utils/cart";
import "./packages.css";

export default function Packages() {
  const [searchParams] = useSearchParams();
  const [packages, setPackages] = useState([]);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [sort, setSort] = useState("name");
  const [discount, setDiscount] = useState("");
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);
  const query = searchParams.get("query") || "";

  useEffect(() => {
    Promise.all([
      packageService.getAll(),
      flightService.getAll(),
      hotelService.getAll(),
    ])
      .then(([packageData, flightData, hotelData]) => {
        setPackages(packageData);
        setFlights(flightData);
        setHotels(hotelData);
      })
      .catch((error) => console.error("Unable to load holiday packages.", error))
      .finally(() => setLoading(false));
  }, []);

  const results = useMemo(() => packages
    .filter((item) => item.name?.toLowerCase().includes(query.toLowerCase()))
    .filter((item) => !discount || Number(item.discountPercentage) >= Number(discount))
    .sort((a, b) => sort === "discount"
      ? Number(b.discountPercentage) - Number(a.discountPercentage)
      : String(a.name).localeCompare(String(b.name))), [packages, query, discount, sort]);

  const getFlight = (id) => flights.find((flight) => String(flight.id) === String(id));
  const getHotel = (id) => hotels.find((hotel) => String(hotel.id) === String(id));
  const addPackageToCart = async (item) => {
    const flight = getFlight(item.flightId);
    const hotel = getHotel(item.hotelId);
    const nights = Math.max(1, Math.round((new Date(item.returnDate) - new Date(item.departureDate)) / 86400000));
    const fullPrice = (Number(flight?.price) || 0) + ((Number(hotel?.price) || 0) * nights);
    const discountedPrice = fullPrice * (1 - (Number(item.discountPercentage) || 0) / 100);
    try {
      await addCartItem(activeUser, {
        type: "package",
        itemId: item.id,
        title: item.name,
        item,
        flight: flight || null,
        hotel: hotel || null,
        nights,
        fullPrice,
        totalPrice: discountedPrice,
      });
      toast({ title: "Package added to cart", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Unable to add package", description: error.message, status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <main className="packages-page">
      <div className="packages-heading">
        <div>
          <span className="eyebrow">Prelude collections</span>
          <h1>Holiday packages</h1>
          <p>Combine flights and stays into one easy trip.</p>
        </div>
        <Link className="catalog-action packages-back" to="/">New search</Link>
      </div>
      <section className="packages-catalog">
        <aside className="packages-filters">
          <h2>Sort and filter</h2>
          <label>Sort by<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="name">Name</option><option value="discount">Discount</option></select></label>
          <label>Minimum discount (%)<input type="number" min="0" max="100" value={discount} onChange={(event) => setDiscount(event.target.value)} /></label>
        </aside>
        <div className="packages-results">
          <p className="packages-count">{loading ? "Loading packages..." : `${results.length} packages`}</p>
          {!loading && results.map((item) => (
            <article className="package-card" key={item.id}>
              <div>
                <span className="package-badge">{item.discountPercentage || 0}% off</span>
                <h2>{item.name}</h2>
                <p>
                  Flight: {getFlight(item.flightId)?.number || getFlight(item.flightId)?.flightNumber || "Selected flight"}
                  {getFlight(item.flightId)?.from && ` · ${getFlight(item.flightId).from} to ${getFlight(item.flightId).to}`}
                </p>
                <p>Stay: {getHotel(item.hotelId)?.name || "Selected stay"}</p>
              </div>
              <div className="package-dates">
                <strong>{item.departureDate}</strong>
                <span>Departure</span>
                <strong>{item.returnDate}</strong>
                <span>Return</span>
              </div>
              <button className="catalog-action package-cart-button" type="button" onClick={() => addPackageToCart(item)}>
                Add to cart
              </button>
            </article>
          ))}
          {!loading && !results.length && <p className="packages-empty">No packages match those filters.</p>}
        </div>
      </section>
    </main>
  );
}
