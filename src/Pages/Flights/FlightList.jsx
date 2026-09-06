import React, { useEffect, useState } from "react";
import FlightCard from "./FlightCard";
import { flightService } from "../../01_firebase/firestore";

export default function FlightList({ page, priceValue, from, to }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFlights() {
      setError("");
      try {
        const flights = await flightService.search({
          from: from || undefined,
          to: to || undefined,
          limitN: 50,
        });
        if (!active) return;

        const pageSize = 5;
        const minimumPrice = Math.max(0, (Number(priceValue) - 2) * 1000);
        const maximumPrice = Number(priceValue) * 1000;
        const matchingFlights = flights.filter((flight) => {
          const price = Number(flight.price) || 0;
          return price >= minimumPrice && price <= maximumPrice;
        });
        const start = (page - 1) * pageSize;
        setData(matchingFlights.slice(start, start + pageSize));
      } catch (requestError) {
        if (!active) return;
        console.error("Unable to load flights from Firestore.", requestError);
        setData([]);
        setError("Flights are temporarily unavailable. Please try again.");
      }
    }

    loadFlights();
    return () => {
      active = false;
    };
  }, [from, page, priceValue, to]);

  if (error) {
    return <p className="flight-results-message">{error}</p>;
  }

  if (data.length === 0) {
    return (
      <p className="flight-results-message">
        No flights match this route and price range.
      </p>
    );
  }

  return (
    <div>
      {data.map((item) => (
        <div key={item.id}>
          <FlightCard data={item} />
        </div>
      ))}
    </div>
  );
}
