import React, { useState } from "react";
import "./feedback.css";

export default function Feedback() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    rating: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="feedback-container">
      <div className="feedback-card">
        <h2>We Value Your Feedback</h2>
        <p className="sub">Help us improve your travel experience</p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            {/* Name */}
            <label>Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter your name"
              value={form.name}
              onChange={handleChange}
              required
            />

            {/* Email */}
            <label>Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={handleChange}
              required
            />

            {/* Rating */}
            <label>Rating</label>
            <select name="rating" value={form.rating} onChange={handleChange} required>
              <option value="">Select rating</option>
              <option value="5">⭐ ⭐ ⭐ ⭐ ⭐ (Excellent)</option>
              <option value="4">⭐ ⭐ ⭐ ⭐ (Good)</option>
              <option value="3">⭐ ⭐ ⭐ (Average)</option>
              <option value="2">⭐ ⭐ (Poor)</option>
              <option value="1">⭐ (Very Bad)</option>
            </select>

            {/* Message */}
            <label>Feedback</label>
            <textarea
              name="message"
              placeholder="Write your feedback here..."
              value={form.message}
              onChange={handleChange}
              required
            ></textarea>

            <button className="feedback-btn">Submit Feedback</button>
          </form>
        ) : (
          <div className="success-box">
            <h3>🎉 Thank You!</h3>
            <p>Your feedback has been submitted successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
}




