import React, { useEffect, useState } from "react";
import "./adminProduct.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "font-awesome/css/font-awesome.min.css";
import { shallowEqual, useDispatch, useSelector } from "react-redux";

import { DeleteHotel, fetchingHotels, updateHotel } from "../../Redux/AdminHotel/action";
import AdminNav from "./AdminNav";

export const AllHotels = () => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { isLoading, data } = useSelector((store) => {
    return {
      isLoading: store.HotelReducer.isLoading,
      data: store.HotelReducer.data,
    };
  }, shallowEqual);
  // console.log(data);

  const handleDeleteHotel = (deleteId) => {
    dispatch(DeleteHotel(deleteId));
    // alert(deleteId);
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

  const saveHotel = (event) => {
    event.preventDefault();
    dispatch(updateHotel(editing.id, editing));
    setEditing(null);
  };

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();
  const filteredHotels = data.filter((hotel) =>
    [
      hotel.name,
      hotel.place,
      hotel.location,
      hotel.description,
      hotel.price,
    ].some((value) =>
      String(value ?? "").toLowerCase().includes(normalizedSearchTerm)
    )
  );

  useEffect(() => {
    dispatch(fetchingHotels());
  }, [dispatch]);

  return (
    <>
      <ToastContainer />
      <div className="adminProductMain">
        <AdminNav />
        <div className="adminProductbox">
          <div className="filterProdcut">
            <input
              placeholder="Search Hotels"
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
            <button type="button">Search</button>
          </div>
          <div className="head"><h1>All Hotels</h1></div>

          {/*  */}
          {isLoading ? <h1>Please wait...</h1> : ""}
          {filteredHotels.map((ele) => (
            <div key={ele.id} className="adminProductlist">
             {editing?.id === ele.id ? (
               <form className="admin-edit-form" onSubmit={saveHotel}>
                 {["image", "name", "place", "price", "description", "additional"].map((field) => (
                   <input key={field} name={field} value={editing[field] || ""} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })} />
                 ))}
                 <button type="submit">Save</button>
                 <button type="button" onClick={() => setEditing(null)}>Cancel</button>
               </form>
             ) : (
               <>
              <span>
                <img src={ele.image} alt="" />
              </span>
              <span>
                {/* {ele.name == "" ? "Default" : ""} */}
                {ele.name.length > 10
                  ? `${ele.name.substring(0, 10)}...`
                  : ele.name}
              </span>
              <span>{ele.place}</span>
              <span>${ele.taxes}</span>
              <span>${ele.price}</span>
              <span>{ele.number}</span>
              <span>
                <button onClick={() => handleDeleteHotel(ele.id)}>
                  Delete <i className="fa fa-trash"></i>
                </button>
                <button type="button" onClick={() => setEditing({ ...ele })}>
                  Edit <i className="fa fa-pencil"></i>
                </button>
              </span>
               </>
             )}
            </div>
          ))}
          {/*  */}
        </div>
      </div>
    </>
  );
};
