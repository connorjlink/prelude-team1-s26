import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { Grid, Center } from "@chakra-ui/react";
import DestinationCard from "./DestinationCard";
import { thingsToDoService } from "../../01_firebase/firestore";
import "./thingsTodo.css";
import { useSelector } from "react-redux";
import { useToast } from "@chakra-ui/react";
import { addCartItem } from "../../utils/cart";
import { parsePrice } from "../../utils/currency";

export const Destination = () => {
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const place = searchParams.get("place") || "";
  const toast = useToast();
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);

  useEffect(() => {
    let active = true;

    async function loadPlaces() {
      setError("");
      try {
        const results = await thingsToDoService.search({ place });
        if (active) setPlaces(results);
      } catch (requestError) {
        if (!active) return;
        console.error("Unable to load Popular Attractions from Firestore.", requestError);
        setPlaces([]);
        setError("Popular Attractions are temporarily unavailable. Please try again.");
      }
    }

    loadPlaces();
    return () => {
      active = false;
    };
  }, [place]);

  const handleAddToCart = async (item) => {
    try {
      await addCartItem(activeUser, {
        type: "attraction",
        itemId: item.id,
        title: item.title,
        item: { ...item, price: parsePrice(item.price) },
        totalPrice: parsePrice(item.price),
      });
      toast({ title: "Attraction added to cart", status: "success", duration: 3000, isClosable: true });
    } catch (error) {
      toast({ title: "Unable to add attraction", description: error.message, status: "error", duration: 4000, isClosable: true });
    }
  };

  return (
    <div className="things-todo-page">
      <div className="catalog-heading">
        <div>
          <span className="eyebrow">Prelude collections</span>
          <h1>Popular Attractions{place ? ` in ${place}` : ""}</h1>
          <p>Discover memorable experiences wherever you go.</p>
        </div>
        <Link className="catalog-action" to="/">New search</Link>
      </div>
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
                onAdd={() => handleAddToCart(item)}
              />
            ))}
          </Grid>
        </Center>
      )}
    </div>
  );
};
