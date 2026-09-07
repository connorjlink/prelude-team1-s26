import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  flightService,
  hotelService,
  thingsToDoService,
  userService,
  packageService,
  bookingService,
} from "../../01_firebase/firestore";
import "./AdminDashboard.Module.css";
import AdminNav from "./AdminNav";


export const AdminDashboard = () => {
  const [flight, setFlight] = useState(0);
  const [hotel, setHotel] = useState(0);
  const [users, setUsers] = useState(0);
  const [things, setThings] = useState(0);
  const [packages, setPackages] = useState(0);
  const [bookings, setBookings] = useState(0);
 const [error, setError] = useState("");

 useEffect(() => {
   let active = true;
   Promise.all([
     flightService.getAll(),
     hotelService.getAll(),
     userService.getAll(),
     thingsToDoService.getAll(),
     packageService.getAll(),
     bookingService.getAll(),
   ])
     .then(([flights, hotels, usersData, things, packageData, bookingData]) => {
       if (!active) return;
       setFlight(flights.length);
       setHotel(hotels.length);
       setUsers(usersData.length);
       setThings(things.length);
       setPackages(packageData.length);
       setBookings(bookingData.length);
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
        <AdminNav />
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
              <Link to="/admin/users">View</Link>
            </div>
            <div className="dataBx">
              <h1>View Popular Attractions</h1>
              {<h1>{things}</h1>}
              <Link to="/setThings">View</Link>
            </div>
            <div className="dataBx">
              <h1>View Packages</h1>
              {<h1>{packages}</h1>}
              <Link to="/admin/packages">View</Link>
            </div>
            <div className="dataBx dataBxHighlight">
              <h1>View Bookings</h1>
              <h1>{bookings}</h1>
              <Link to="/admin/bookings">View</Link>
            </div>
            {/*  */}
          </div>
        </div>
      </div>
    </>
  );
};
