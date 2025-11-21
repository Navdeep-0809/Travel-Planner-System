import React, { useState, useEffect } from "react";
import "./booking.css";

// DESTINATIONS DROPDOWN LIST
const destinationList = [
  "Paris",
  "Tokyo",
  "Bali",
  "New York",
  "London",
  "Sydney",
  "Maldives"
];

export default function Booking() {
  const [form, setForm] = useState({
    destination: "",
    type: "Reserve Table",
    name: "",
    email: "",
    date: "",
    guests: 1,
    days: 1,
  });

  const [price, setPrice] = useState(0);

  const bookingTypes = ["Reserve Table", "Book Hotel", "Book Flight"];

  // AUTO PRICE CALCULATION
  useEffect(() => {
    let total = 0;

    if (form.type === "Reserve Table") {
      total = form.guests * 500; // ₹500 per guest
    }

    if (form.type === "Book Hotel") {
      total = form.days * 2000 + form.guests * 300; // ₹2000/day + ₹300 per guest
    }

    if (form.type === "Book Flight") {
      total = form.guests * 4000; // ₹4000 per guest
    }

    setPrice(total);
  }, [form.type, form.guests, form.days]);

  // HANDLE INPUT CHANGES
  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    alert(`Booking Completed! Total Price: ₹${price}`);
  }

  return (
    <div className="booking-container">
      <h1>Booking Form</h1>

      <form className="booking-form" onSubmit={handleSubmit}>

        {/* DESTINATION DROPDOWN */}
        <label>Destination</label>
        <select
          name="destination"
          value={form.destination}
          onChange={handleChange}
        >
          <option value="">Select destination</option>
          {destinationList.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        {/* BOOKING TYPE */}
        <label>Booking Type</label>
        <select name="type" value={form.type} onChange={handleChange}>
          {bookingTypes.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* NAME + EMAIL */}
        <div className="two-col">
          <div>
            <label>Your Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* DATE + GUESTS */}
        <div className="two-col">
          <div>
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
            />
          </div>

          <div>
            <label>Number of Guests</label>
            <input
              type="number"
              name="guests"
              value={form.guests}
              min="1"
              onChange={handleChange}
            />
          </div>
        </div>

        {/* DAYS FIELD ONLY FOR HOTEL + FLIGHT */}
        {(form.type === "Book Hotel" || form.type === "Book Flight") && (
          <>
            <label>Number of Days</label>
            <input
              type="number"
              name="days"
              value={form.days}
              min="1"
              onChange={handleChange}
            />
          </>
        )}

        {/* TOTAL PRICE */}
        <div className="price-box">
          <h3>Total Price: ₹{price}</h3>
        </div>

        <button type="submit" className="booking-btn">
          Complete Booking
        </button>
      </form>
    </div>
  );
}



