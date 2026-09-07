import React from "react";
import { Link } from "react-router-dom";

export default function AdminNav() {
  return (
    <aside className="adminSideBr">
      <Link to="/admin">Dashboard</Link>
      <Link to="/admin/adminflight">Add Flight</Link>
      <Link to="/admin/adminstay">Add Stay</Link>
      <Link to="/admin/adminpackage">Add Package</Link>
      <Link to="/admin/products">View Flights</Link>
      <Link to="/admin/hotels">View Stays</Link>
      <Link to="/admin/packages">View Packages</Link>
      <Link to="/admin/users">View Users</Link>
      <Link to="/admin/bookings">View Bookings</Link>
      <Link to="/">Exit admin</Link>
    </aside>
  );
}
