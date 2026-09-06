import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Grid, Center } from "@chakra-ui/react";
import DestinationCard from "./DestinationCard";
import { thingsToDoService } from "../../01_firebase/firestore";
import "./thingsTodo.css";

export const Destination = () => {
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const place = searchParams.get("place") || "";

  useEffect(() => {
    let active = true;

    async function loadPlaces() {
      setError("");
      try {
        const results = await thingsToDoService.search({ place });
        if (active) setPlaces(results);
      } catch (requestError) {
        if (!active) return;
        console.error("Unable to load things to do from Firestore.", requestError);
        setPlaces([]);
        setError("Things to do are temporarily unavailable. Please try again.");
      }
    }

    loadPlaces();
    return () => {
      active = false;
    };
  }, [place]);

  return (
    <div className="things-todo-page">
      <h1 className="search-panel-title">Things to do{place ? ` in ${place}` : ""}</h1>
      {error ? (
        <p className="flight-results-message">{error}</p>
      ) : (
        <Center>
          <Grid
            className="things-todo-grid"
            templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            columnGap={6}
            rowGap={6}
          >
            {places.map((item) => (
              <DestinationCard
                key={item.id}
                image={item.image}
                title={item.title}
                price={item.price}
                rating={Number(item.rating) || 0}
                place={item.place}
              />
            ))}
          </Grid>
        </Center>
      )}
    </div>
  );
};
