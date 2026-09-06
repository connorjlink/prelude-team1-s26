import React from 'react'
import { useSearchParams } from "react-router-dom";
import Flights from './Flight'
import SideBar from './SideBar'

const FlightData = () => {
  const [searchParams] = useSearchParams();
  return (
    <div>
            <Flights/>
            <SideBar
              from={searchParams.get("from") || ""}
              to={searchParams.get("to") || ""}
            />
    </div>
  )
}

export default FlightData