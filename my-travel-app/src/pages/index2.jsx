import React, { useState } from "react";
import "./index2.css";

export default function Home({ addToList, savedList }) {
  // ======================
  // DESTINATIONS DATA
  // ======================
   const destinations = [
  {
    name: "Paris",
    img: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34",
    desc: "The city of lights.",
    more:
      "Paris is known for its art, fashion, and culture. Famous places include the Eiffel Tower, Louvre Museum, Notre-Dame Cathedral, and Champs-Élysées.",
  },
  {
    name: "Tokyo",
    img: "https://images.unsplash.com/photo-1549693578-d683be217e58",
    desc: "Where tech meets tradition.",
    more:
      "Tokyo blends ancient culture with modern technology. Famous places include Shibuya Crossing, Tokyo Tower, Senso-ji Temple, and Akihabara.",
  },
  {
    name: "Bali",
    img: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
    desc: "Tropical paradise.",
    more:
      "Bali is famous for beaches, temples, and nature. Must-visit places include Ubud, Tanah Lot Temple, Seminyak Beach, and Mount Batur.",
  },

  // ⭐ NEW DESTINATION 1 — NEW YORK
  {
    name: "New York",
    img: "https://images.unsplash.com/photo-1534447677768-be436bb09401",
    desc: "The city that never sleeps.",
    more:
      "New York is famous for Times Square, the Statue of Liberty, Central Park, Broadway, and its iconic skyline.",
  },

  // ⭐ NEW DESTINATION 2 — LONDON
  {
    name: "London",
    img: "https://images.unsplash.com/photo-1469474968028-56623f02e42e",
    desc: "Historic and modern combined.",
    more:
      "London is known for Big Ben, Tower Bridge, Buckingham Palace, the London Eye, and world-class museums.",
  },

  // ⭐ NEW DESTINATION 3 — SYDNEY
  {
  name: "Maldives",
  img: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  desc: "Heavenly islands surrounded by turquoise water.",
  more:
    "The Maldives is known for luxury water villas, coral reefs, clear lagoons, and white-sand beaches. Popular places include Maafushi, Vaadhoo Island (Sea of Stars), and Male City.",
}

];


  // ======================
  // STATES
  // ======================
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [expanded, setExpanded] = useState({}); // <-- REQUIRED

  // ======================
  // WEATHER API
  // ======================
  const API_KEY = "b10c555572b7566179b9fb70248ba877";

  async function getWeather() {
    if (!city.trim()) return alert("Enter a city name");

    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
      );

      if (!response.ok) {
        alert("City not found");
        return;
      }

      const data = await response.json();

      setWeather({
        name: data.name,
        temp: data.main.temp,
        desc: data.weather[0].description,
      });
    } catch (err) {
      alert("Network error");
      console.error(err);
    }
  }

  // ======================
  // UI
  // ======================
  return (
    <>
      {/* HERO SECTION */}
      <section className="hero">
        <video autoPlay muted loop className="hero-video">
          <source src="/bgvideo.mp4" type="video/mp4" />
        </video>

        <div className="overlay"></div>

        <div className="hero-content">
          <h1>Discover the World with Ease</h1>
          <p>Plan smarter, travel better.</p>
          <a href="/booking" className="btn">
            Start Your Journey
          </a>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="section">
        <h2>Popular Destinations</h2>

        <div className="dest-grid">
          {destinations.map((dest) => (
            <div className="dest-card" key={dest.name}>
              <img src={dest.img} alt={dest.name} />

              <h3>{dest.name}</h3>
              <p>{dest.desc}</p>

              {/* ADD TO LIST */}
              {savedList.includes(dest.name) ? (
                <button className="added">✓ Added to List</button>
              ) : (
                <button
                  onClick={() => addToList(dest.name)}
                  className="add-btn"
                >
                  Add to List
                </button>
              )}

              {/* EXPLORE MORE */}
              <button
                className="explore-btn"
                onClick={() =>
                  setExpanded((prev) => ({
                    ...prev,
                    [dest.name]: !prev[dest.name],
                  }))
                }
              >
                {expanded[dest.name] ? "Show Less ▲" : "Explore More ▼"}
              </button>

              {expanded[dest.name] && (
                <div className="more-info">
                  <p>{dest.more}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* WEATHER */}
      <section className="section">
        <h2>🌦 Weather Info</h2>

        <div className="weather-box">
          <input
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button onClick={getWeather}>Check</button>
        </div>

        {weather && (
          <div className="weather-result">
            <h3>{weather.name}</h3>
            <p>
              {weather.temp}°C — {weather.desc}
            </p>
          </div>
        )}
      </section>

      {/* GUIDES */}
      <section className="section">
  <h2>Local Guides & Emergency Contacts</h2>

  <div className="guide-grid">
    <div className="guide-card">
      <h3>🇫🇷 Paris</h3>
      <p>📞 Guide: +33 6 12 34 56 78</p>
    </div>
    <div className="guide-card">
      <h3>🇯🇵 Tokyo</h3>
      <p>📞 Guide: +81 90 1234 5678</p>
    </div>
    <div className="guide-card">
      <h3>🇮🇩 Bali</h3>
      <p>📞 Guide: +62 812 3456 7890</p>
    </div>

    {/* ⭐ NEW GUIDE 1 — NEW YORK */}
    <div className="guide-card">
      <h3>🇺🇸 New York</h3>
      <p>📞 Guide: +1 917 555 7842</p>
    </div>

    {/* ⭐ NEW GUIDE 2 — LONDON */}
    <div className="guide-card">
      <h3>🇬🇧 London</h3>
      <p>📞 Guide: +44 7700 900123</p>
    </div>

    {/* ⭐ NEW GUIDE 3 — SYDNEY */}
    <div className="guide-card">
      <h3>🇦🇺 Sydney</h3>
      <p>📞 Guide: +61 412 345 678</p>
    </div>
  </div>
</section>

    </>
  );
}
