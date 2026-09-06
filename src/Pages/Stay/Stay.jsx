import React,{useState} from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import data from "./city";
import ShowCalender from "./ShowCalender";
import { Button,} from "@chakra-ui/react";
import "./StayData.css";
import {Link} from "react-router-dom";
import { useDispatch } from "react-redux";
import { selectCity } from "../../Redux/StayReducer/action";

function Stay() {
  const [selectedCity, setSelectedCity] = useState("");
  const dispatch = useDispatch();
  const handleOnSearch = (string, results) => {
    // onSearch will have as the first callback parameter
    // the string searched and for the second the results.
    console.log(string, results);
  };

  const handleOnHover = (result) => {
    // the item hovered
    console.log(result);
  };

  const handleOnSelect = (data) => {
    // the item selected
    console.log(data.name);
    setSelectedCity(data.name);
    dispatch(selectCity(data.name));
  };

  const handleOnFocus = () => {
    console.log("Focused");
  };

  const formatResult = (data) => {
    return (
      <>
        {/* <span style={{ display: 'block', textAlign: 'left' }}>id: {data.id}</span> */}
        <span style={{ display: "block", textAlign: "left" }}>{data.name}</span>
      </>
    );
  };

  return (
    <div className="stay-search-panel">
      <h2 className="search-panel-title">Find your stay</h2>
      <header className="stay-destination">
        <div className="stay-destination-input">
          <ReactSearchAutocomplete
            items={data}
            onSearch={handleOnSearch}
            onHover={handleOnHover}
            onSelect={handleOnSelect}
            onFocus={handleOnFocus}
            formatResult={formatResult}
            showIcon={false}
            placeholder={"Going to"}
            styling={{
              height: "44px",
              border: "1px solid #dfe1e5",
              borderRadius: "6px",
              backgroundColor: "var(--surface)",
              boxShadow: "none",
              hoverBackgroundColor: "var(--soft-green)",
              color: "var(--ink)",
              fontSize: "16px",
              fontFamily: "Arial",
              searchIconMargin: "0 0 0 16px",
            }}
          />
        </div>
      </header>
      <div className="calenderWrapper">
        <div className="stay-calendar">
        <ShowCalender />
        </div>
        
          <Button
            colorScheme="orange"
            size="lg"
            className="accent-button"
            style={{margin:"auto"}}
          >
            <Link to={{ pathname: '/stay' }}>Search</Link>
          
          </Button >
       
      </div>
    </div>
  );
}

export default Stay;