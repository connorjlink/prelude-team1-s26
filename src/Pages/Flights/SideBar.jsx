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

  const pageBtn={
    marginTop: "3%",
    // width:"164px",
    padding:"15px",
    height: "43px",
    background: "var(--coral)",
    color:" #FFFFFF",
    bordeRadius: "0.5rem",
    position: "relative",
    marginBottom:"1rem"
}

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
          />

          {/* Pagination Part UI Start */}
          <Stack className="flight-pagination" spacing={4} direction='row' align='center'>

          {/* <Flex m="5" align="center"> */}
            <Button 
              style={pageBtn}
              onClick={() => setPage(page - 1)}
              isDisabled={page === 1}
            >
              Previous
            </Button>
            <Button style={pageBtn}>
              {page}
            </Button>
            <Button
              style={pageBtn}
              isDisabled={page === 4}
              onClick={() => setPage(page + 1)}
              >
              Next
            </Button>
          {/* </Flex> */}
              </Stack>
          {/* Pagination Part UI End */}

          <FlightList page={page} priceValue={priceValue} from={from} to={to} />
        </Box>
      </Box>
  );
};

export default SideBar;
