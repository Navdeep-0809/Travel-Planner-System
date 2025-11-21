import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import "./navbar.css";

export default function Navbar({ savedList, removeFromList }) {
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const active = (path) => (location.pathname === path ? "active" : "");

  return (
    <nav className="navbar">
      <h1 className="logo">🌍 TripZilla</h1>

      <ul>
        <li><Link className={active("/")} to="/">Home</Link></li>
        <li><Link className={active("/booking")} to="/booking">Booking</Link></li>
        <li><Link className={active("/login")} to="/login">Login</Link></li>
        <li><Link className={active("/feedback")} to="/feedback">Feedback</Link></li>
      </ul>

      {/* LIST ICON */}
      <div className="list-icon-wrapper">
        <button className="list-icon" onClick={() => setOpen(!open)}>
          📌 {savedList.length}
        </button>

        {open && (
          <div className="list-dropdown">
            <h4>Saved Destinations</h4>

            {savedList.length === 0 ? (
              <p className="empty">No destinations added</p>
            ) : (
              savedList.map((item) => (
                <div className="list-item" key={item}>
                  <span>{item}</span>
                  <button onClick={() => removeFromList(item)}>✖</button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </nav>
  );
}


