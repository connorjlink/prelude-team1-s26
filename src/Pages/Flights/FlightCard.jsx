import { Box, Image, Flex, Button } from "@chakra-ui/react";
import { useToast } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { formatCurrency } from "../../utils/currency";
import { addCartItem } from "../../utils/cart";

export default function FlightCard({ data }) {
  const { id, airline, from, to, departure, arrival, price, totalTime } = data;
  const toast = useToast();
  const activeUser = useSelector((store) => store.LoginReducer.activeUser);
  const navigate = useNavigate();

  const handleClick = async () => {
    try {
      await addCartItem(activeUser, {
        type: "flight",
        itemId: id,
        title: `${from} to ${to}`,
        item: data,
        totalPrice: Number(price) || 0,
      });
      toast({ title: "Flight added to cart", status: "success", duration: 3000, isClosable: true });
      navigate("/checkout");
    } catch (error) {
      toast({ title: "Unable to add flight", description: error.message, status: "error", duration: 4000, isClosable: true });
    }
  };

  

  return (
    <Box className="flight-result-card"
      key={id}
    >
      <Box gap={"30px"}>
        <Image
          src="https://play-lh.googleusercontent.com/OhZSLjRDLvFLqtDp9bIgcvAweZIg5V5uIMI_7kOaS-9nPR043DUfoibkn1BgwG7Ai1U=w240-h480-rw"
          width={"35px"}
          height="30px"
          fallbackSrc="https://via.placeholder.com/35x30?text=%E2%9C%88"
          onError={(e) => {
            e.target.style.display = "none";
          }}
          alt={airline || "Airline"}
        />
        <h1>{airline}</h1>
      </Box>
      <Flex className="flight-card-section" display={"flex"} flexDirection="column">
        <h3 style={{ fontSize: "10px", fontWeight: "bold" }}>Departure</h3>
        <h3>{departure}</h3>
        <b>{from} </b>
      </Flex>
      <Flex className="flight-card-section" display={"flex"} flexDirection="column">
        <h3 style={{ fontSize: "10px", fontWeight: "bold" }}>Arrival</h3>
        <h3>{arrival}</h3>
        <b style={{ fontSize: "14px" }}>{to} </b>
      </Flex>
      <Flex className="flight-card-section" display={"flex"} flexDirection="column">
        <h3>Duration</h3>
        <b>{totalTime}</b>
      </Flex>
      <Flex className="flight-card-section" display={"flex"} flexDirection="column">
        <h3>Price</h3>
        <b>{formatCurrency(price)}</b>
      </Flex>
      <Button className="accent-button" onClick={handleClick}>
       Add to cart
      </Button>
    </Box>
  );
}
