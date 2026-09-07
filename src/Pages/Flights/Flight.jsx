// import { Footer } from "../../components/Footer";
import { useEffect, useState } from "react";
import React from "react";
import { Button,} from "@chakra-ui/react";
import { Link, useSearchParams } from "react-router-dom";
import "./homePage.css";
// import SideBar from "./SideBar";

const initialState = {
  from: "",
  to: "",
  passenger: 1,
  departureDate: "",
  returnDate: "",
  tripType: "roundTrip",
};

export default function Flights() {
  const [searchParams] = useSearchParams();
  const [PassengerData, setPassengerData] = useState(() => ({
    ...initialState,
    from: searchParams.get("from") || "",
    to: searchParams.get("to") || "",
    departureDate: searchParams.get("departureDate") || "",
    returnDate: searchParams.get("returnDate") || "",
    tripType: searchParams.get("tripType") || initialState.tripType,
  }));

  useEffect(() => {
    setPassengerData((current) => ({
      ...current,
      from: searchParams.get("from") || "",
      to: searchParams.get("to") || "",
      departureDate: searchParams.get("departureDate") || "",
      returnDate: searchParams.get("returnDate") || "",
      tripType: searchParams.get("tripType") || initialState.tripType,
    }));
  }, [searchParams]);

  const handleChange = (e) => {
    const nextData = { ...PassengerData, [e.target.name]: e.target.value };
    if (e.target.name === "tripType" && e.target.value === "oneWay") {
      nextData.returnDate = "";
    }
    setPassengerData(nextData);
  };

  const handleClick = () => {
    console.log(PassengerData);
  };
const swapValuehandler = () => {
    setPassengerData({
      ...PassengerData,
      from: PassengerData.to,
      to: PassengerData.from,
    });
  };

  return (
    <div>
      <div className="homeTop flight-search-panel" style={{ marginBottom: "30px" }}>
        <div className="homeTopCard">
          <h2 className="search-panel-title">Search flights</h2>
          <div className="homeInputBx flight-type-tabs">
            <div className="flight-type-options">
              <div className="homeInputs">
                <input name="tripType" value="oneWay" checked={PassengerData.tripType === "oneWay"} onChange={handleChange} type="radio" id="inputs" />
                <label htmlFor="inputs">ONE WAY</label>
              </div>
              <div className="homeInputs">
                <input name="tripType" value="roundTrip" checked={PassengerData.tripType === "roundTrip"} onChange={handleChange} type="radio" id="inputs2" />
                <label htmlFor="inputs2">ROUND TRIP</label>
              </div>
              <div className="homeInputs">
                <input name="tripType" value="multiCity" checked={PassengerData.tripType === "multiCity"} onChange={handleChange} type="radio" id="inputs3" />
                <label htmlFor="inputs3">MULTI CITY</label>
              </div>
            </div>
          </div>
          {/*  */}
          <div className="homeMainSearchInput">
            <div className="MainSearchinputBx">
              <span>FROM</span>

              {/* from search input */}
              <select
                name="from"
                id="from"
                value={PassengerData.from}
                onChange={handleChange}
              >
                <option value="">From</option>
                <option value="DELHI">DELHI</option>
                <option value="MUMBAI">MUMBAI</option>
                <option value="BANGLURU">BANGLURU</option>
                <option value="PUNE">PUNE</option>
              </select>

              <button onClick={swapValuehandler}>
                <i className="fa fa-exchange"></i>
              </button>
            </div>
            <div className="MainSearchinputBx">
              <span>TO</span>

              {/*to search input tag */}

              <select
                name="to"
                id="fromto"
                value={PassengerData.to}
                onChange={handleChange}
              >
                <option value="">To</option>
                <option value="DELHI">DELHI</option>
                <option value="MUMBAI">MUMBAI</option>
                <option value="BANGLURU">BANGLURU</option>
                <option value="PUNE">PUNE</option>
              </select>
            </div>
            <div className="MainSearchinputBx">
              <span>DEPARTURE</span>
              <input
                type="date"
                name="departureDate"
                value={PassengerData.departureDate}
                onChange={handleChange}
              />
            </div>
            <div className="MainSearchinputBx">
              <span>RETURN</span>
              <input
                type="date"
                name="returnDate"
                value={PassengerData.returnDate}
                onChange={handleChange}
                disabled={PassengerData.tripType === "oneWay"}
              />
            </div>
            <div className="MainSearchinputBx">
              <span>TRAVELLERS & CLASS</span>

              <input
                type="number"
                value={PassengerData.passenger}
                onChange={handleChange}
                name="passenger"
              />
            </div>
          </div>
          <div className="homeSearchButtonBx">
          <Button
            colorScheme="orange"
            size="lg"
            className="accent-button"
            onClick={handleClick}
            
          >
            <Link
              to={{
                pathname: "/flight",
                search: new URLSearchParams({
                  from: PassengerData.from,
                  to: PassengerData.to,
                  departureDate: PassengerData.departureDate,
                  returnDate: PassengerData.returnDate,
                  tripType: PassengerData.tripType,
                }).toString(),
              }}
            >
              Search
            </Link>
          
          </Button >
            {/* <button >Search</button> */}
          </div>
        </div>
      </div>

      {/* <SideBar /> */}
      {/* <Footer /> */}
    </div>
  );
}
