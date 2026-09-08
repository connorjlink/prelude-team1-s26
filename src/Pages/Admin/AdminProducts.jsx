import React, { useEffect, useState } from "react";
import "./adminProduct.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import {
  DeleteFlightProducts,
  fetchFlightProducts,
  updateFlight,
} from "../../Redux/AdminFlights/action";
import AdminNav from "./AdminNav";

export const AdminProducts = () => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoading, data } = useSelector((store) => {
    return {
      isLoading: store.FlightReducer.isLoading,
      data: store.FlightReducer.data,
    };
  }, shallowEqual);

  const handleDeleteFlights = (deleteId) => {
    dispatch(DeleteFlightProducts(deleteId));
    toast.success("Flight Removed", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
  };

  const saveFlight = (event) => {
    event.preventDefault();
    dispatch(updateFlight(editing.id, editing));
    setEditing(null);
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredFlights = data.filter((flight) =>
    [
      flight.airline,
      flight.number,
      flight.from,
      flight.to,
      flight.departure,
      flight.arrival,
      flight.price,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearchTerm)
    )
  );

  //   console.log(limit);
  useEffect(() => {
    dispatch(fetchFlightProducts());
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <div className="adminProductMain">
        <AdminNav />
        <div className="adminProductbox">
          <div className="filterProdcut">
            <input
              placeholder="Search Flight"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="button">Search</button>
          </div>
          <div className="head"><h1>All Flights</h1></div>
          {/*  */}
          {isLoading ? <h1>Please wait...</h1> : ""}
          {filteredFlights.map((ele) => (
            <div key={ele.id} className="adminProductlist">
              {editing?.id === ele.id ? (
                <form className="admin-edit-form" onSubmit={saveFlight}>
                  {["airline", "from", "to", "price", "number"].map((field) => (
                    <input key={field} name={field} value={editing[field] || ""} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })} />
                  ))}
                  <button type="submit">Save</button>
                  <button type="button" onClick={() => setEditing(null)}>Cancel</button>
                </form>
              ) : (
                <>
                  <span>{ele.airline}</span>
                  <span>{ele.from}</span>
                  <span>{ele.to}</span>
                  <span>{ele.price}</span>
                  <span>{ele.number}</span>
                </>
              )}
              <span>
                <button onClick={() => handleDeleteFlights(ele.id)}>
                  Delete <i className="fa fa-trash"></i>
                </button>
                <button type="button" onClick={() => setEditing({ ...ele })}>
                  Edit <i className="fa fa-pencil"></i>
                </button>
              </span>
            </div>
          ))}
          {/*  */}
        </div>
      </div>
    </>
  );
};
