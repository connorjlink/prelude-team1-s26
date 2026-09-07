import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { flightService, hotelService, packageService } from "../../01_firebase/firestore";
import "./Admin.Module.css";
import AdminNav from "./AdminNav";

const initialState = {
  name: "",
  flightId: "",
  hotelId: "",
  departureDate: "",
  checkInDate: "",
  checkOutDate: "",
  returnDate: "",
  discountPercentage: 0,
};

export function AdminPackageForm() {
  const [form, setForm] = useState(initialState);
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    Promise.all([flightService.getAll(), hotelService.getAll()])
      .then(([flightData, hotelData]) => {
        setFlights(flightData);
        setHotels(hotelData);
      })
      .catch((error) => {
        console.error("Unable to load package options.", error);
        setMessage("Unable to load flights and stays.");
      });
  }, []);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name || !form.flightId || !form.hotelId || !form.departureDate || !form.checkInDate || !form.checkOutDate || !form.returnDate) {
      setMessage("Complete all package fields.");
      return;
    }
    if (form.checkInDate < form.departureDate || form.checkOutDate < form.checkInDate || form.returnDate < form.checkOutDate) {
      setMessage("Package dates must follow the flight and stay timeline.");
      return;
    }
    try {
      await packageService.create(form);
      setForm(initialState);
      setMessage("Holiday package created.");
    } catch (error) {
      console.error("Unable to create holiday package.", error);
      setMessage("Unable to create holiday package.");
    }
  };

  return (
    <div className="adminFlightMai">
      <AdminNav />
      <main className="adminFlightBox">
        <div className="adminHead"><h2>Add Holiday Package</h2></div>
        <form className="adminFlightInputs" onSubmit={submit}>
          {[
            ["name", "Package name", "text"],
            ["departureDate", "Departure date", "date"],
            ["checkInDate", "Check-in date", "date"],
            ["checkOutDate", "Check-out date", "date"],
            ["returnDate", "Return date", "date"],
            ["discountPercentage", "Discount (%)", "number"],
          ].map(([name, label, type]) => (
            <label className="adminFlightInputBx" key={name}>
              <span>{label}</span>
              <input name={name} type={type} min={type === "number" ? 0 : undefined} max={type === "number" ? 100 : undefined} value={form[name]} onChange={handleChange} />
            </label>
          ))}
          <label className="adminFlightInputBx"><span>Flight</span><select name="flightId" value={form.flightId} onChange={handleChange}><option value="">Select flight</option>{flights.map((item) => <option key={item.id} value={item.id}>{item.airline} · {item.from} to {item.to}</option>)}</select></label>
          <label className="adminFlightInputBx"><span>Stay</span><select name="hotelId" value={form.hotelId} onChange={handleChange}><option value="">Select stay</option>{hotels.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.place}</option>)}</select></label>
          <button type="submit">Add Package</button>
          {message && <p role="status">{message}</p>}
        </form>
      </main>
    </div>
  );
}

export function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [editing, setEditing] = useState(null);
  const load = () => packageService.getAll().then(setPackages).catch((error) => console.error("Unable to load packages.", error));
  useEffect(() => { load(); }, []);

  const save = async (event) => {
    event.preventDefault();
    await packageService.update(editing.id, { ...editing, discountPercentage: Number(editing.discountPercentage) || 0 });
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await packageService.remove(id);
    setPackages(packages.filter((item) => item.id !== id));
  };

  return (
    <div className="adminProductMain">
      <AdminNav />
      <main className="adminProductbox">
        <div className="head"><h1>Holiday Packages</h1></div>
        {packages.map((item) => editing?.id === item.id ? (
          <form className="admin-edit-form package-edit-form" key={item.id} onSubmit={save}>
            {["name", "flightId", "hotelId", "departureDate", "checkInDate", "checkOutDate", "returnDate", "discountPercentage"].map((field) => <input key={field} name={field} value={editing[field] || ""} onChange={(event) => setEditing({ ...editing, [field]: event.target.value })} />)}
            <button type="submit">Save</button><button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </form>
        ) : (
          <div className="adminProductlist package-row" key={item.id}>
            <span><strong>{item.name}</strong></span><span>Flight: {item.flightId}</span><span>Stay: {item.hotelId}</span><span>{item.checkInDate} - {item.checkOutDate}</span><span>{item.discountPercentage}% off</span>
            <span><button type="button" onClick={() => setEditing({ ...item })}>Edit</button><button type="button" onClick={() => remove(item.id)}>Delete</button></span>
          </div>
        ))}
      </main>
    </div>
  );
}
