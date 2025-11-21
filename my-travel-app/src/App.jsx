import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";

import Navbar from "./pages/navbar.jsx";
import Home from "./pages/index2.jsx";
import Booking from "./pages/booking.jsx";
import Feedback from "./pages/feedback.jsx";
import Login from "./pages/login.jsx";

export default function App() {
  const [savedList, setSavedList] = useState([]);

  function addToList(destination) {
    if (!savedList.includes(destination)) {
      setSavedList([...savedList, destination]);
    }
  }

  function removeFromList(item) {
    setSavedList(savedList.filter((x) => x !== item));
  }

  return (
    <>
      <Navbar savedList={savedList} removeFromList={removeFromList} />
      <Routes>
        <Route path="/" element={<Home addToList={addToList} savedList={savedList} />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </>
  );
}
