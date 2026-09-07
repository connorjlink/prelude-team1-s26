import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  flightService,
  hotelService,
  thingsToDoService,
  userService,
} from "../../01_firebase/firestore";
import "./AdminDashboard.Module.css";


export const AdminDashboard = () => {
  const [flight, setFlight] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [users, setUsers] = useState(0);
  const [things, setThings] = useState(0);
 const [error, setError] = useState("");

 useEffect(() => {
   let active = true;
   Promise.all([
     flightService.getAll(),
     hotelService.getAll(),
     userService.getAll(),
     thingsToDoService.getAll(),
   ])
     .then(([flights, hotels, usersData, things]) => {
       if (!active) return;
       setFlight(flights.length);
       setHotel(hotels.length);
       setUsers(usersData.length);
       setThings(things.length);
     })
     .catch((requestError) => {
       if (!active) return;
       console.error("Unable to load admin dashboard counts from Firestore.", requestError);
       setError("Dashboard data is temporarily unavailable.");
     });
   return () => {
     active = false;
   };
 }, []);

  return (
    <>
      <div className="mainAdminLandingpage">
        <div className="adminSideBr">
          <h1><Link to={"/admin"}>Home</Link></h1>
          <h1><Link to={"/admin/adminflight"}>Add Flight</Link></h1>
          <h1><Link to={"/admin/adminstay"}>Add Stays</Link></h1>
          <h1><Link to={"/admin/products"}>All Flights</Link></h1>
          <h1><Link to={"/admin/hotels"}>All Hotels</Link></h1>
          <h1><Link to={"/"}>Log out</Link></h1>
        </div>
        <div className="mainBox">
          <div className="mainBoxHead">
            <h1>Admin Dashboard</h1>
            <hr />
            <hr />
            <hr />
          </div>
          <div className="DataBoxes">
            {error && <p role="alert">{error}</p>}
            {/*  */}
            <div className="dataBx">
              <h1>View Hotels</h1>
              {<h1>{hotel}</h1>}
              <Link to="/admin/hotels">View</Link>
            </div>
            <div className="dataBx">
              <h1>View Flights</h1>
              {<h1>{flight}</h1>}
              <Link to="/admin/products">View</Link>
            </div>
            <div className="dataBx">
              <h1>View Users</h1>
              {<h1>{users}</h1>}
              <Link to="/admin">View</Link>
            </div>
            <div className="dataBx">
              <h1>View Popular Attractions</h1>
              {<h1>{things}</h1>}
              <Link to="/setThings">View</Link>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </>
  );
};
