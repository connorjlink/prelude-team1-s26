import React from "react";
import {
  Flex,
  Button,
  Box,
  Image,
  Heading,
  RadioGroup,
  Stack,
  Radio,
} from "@chakra-ui/react";
import FlightList from "./FlightList";
import { useState } from "react";
import "./flightResults.css";

const SideBar = ({ from, to }) => {
  const [priceValue, setPriceValue] = useState(8);
  const [classes, setClasses] = useState("");
  const [page, setPage] = useState(1);
  const [Packaging, setpackaging] = useState("");

  return (
      <Box className="flight-results-shell">
        <Box
          className="flight-filter-panel"
        >
          <h1>Sort and filter</h1>

          <Box className="flight-filter-group">
            <Heading as="h5">
              Price Per Trip
            </Heading>
            <RadioGroup onChange={setPriceValue} value={priceValue}>
              <Stack direction="column">
                <Radio value="5">$4,000 - $5,000</Radio>
                <Radio value="6">$5,000 - $6,000</Radio>
                <Radio value="7">$6,000 - $7,000</Radio>
                <Radio value="8">$7,000 - $8,000</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Box className="flight-filter-group">
            <Heading as="h5">
              Filter Class
            </Heading>
            <RadioGroup onChange={setClasses} value={classes}>
              <Stack direction="column">
                <Radio value="eco">Ecomonic Class</Radio>
                <Radio value="business">Business Class</Radio>
                <Radio value="prime">Premium</Radio>
              </Stack>
            </RadioGroup>
          </Box>

          <Box className="flight-filter-group">
            <Heading as="h5">
              Packaging
            </Heading>
            <RadioGroup onChange={setpackaging} value={Packaging}>
              <Stack direction="column">
                <Radio value="eco">0 - 15 Kg</Radio>
                <Radio value="business"> 15 - 30 Kg</Radio>
                <Radio value="prime"> 30 kg +</Radio>
              </Stack>
            </RadioGroup>
          </Box>
        </Box>
        <Box className="flight-results-panel">
          <Image
            src="https://mmt.servedbyadbutler.com/getad.img/;libID=3737167"
            width={"90%"}
            margin="auto"
            marginBottom={"20px"}
            fallbackSrc="https://via.placeholder.com/728x90?text=Travel+Deals"
            onError={(e) => {
              e.target.style.display = "none";
            }}
            alt="Promotional banner"
          />

          {/* Pagination Part UI Start */}
          <Stack className="flight-pagination" direction="row" align="center">
            <Button
              onClick={() => setPage(page - 1)}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Button className="is-current-page" aria-current="page">
              {page}
            </Button>
            <Button
              isDisabled={page === 4}
              onClick={() => setPage(page + 1)}
              >
              Next
            </Button>
          </Stack>
          {/* Pagination Part UI End */}

          <FlightList page={page} priceValue={priceValue} from={from} to={to} />
        </Box>
      </Box>
  );
};

export default SideBar;
