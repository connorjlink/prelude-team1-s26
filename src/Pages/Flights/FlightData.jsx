import React from 'react'
import { useSearchParams } from "react-router-dom";
import Flights from './Flight'
import SideBar from './SideBar'
import { Link } from "react-router-dom";

const FlightData = () => {
  const [searchParams] = useSearchParams();
  return (
    <div>
            <div className="catalog-heading">
              <div>
                <span className="eyebrow">Prelude collections</span>
                <h1>Flights</h1>
                <p>Compare routes and find the right way to travel.</p>
              </div>
              <Link className="catalog-action" to="/">New search</Link>
            </div>
            <div className="flight-catalog-search">
              <Flights/>
            </div>
            <SideBar
              from={searchParams.get("from") || ""}
              to={searchParams.get("to") || ""}
            />
    </div>
  )
}

export default FlightData