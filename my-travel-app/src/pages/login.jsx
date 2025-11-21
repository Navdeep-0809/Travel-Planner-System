import React, { useState } from "react";
import "./login.css";


export default function Login() {
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");


function handleSubmit(e) {
e.preventDefault();
alert("Logged in successfully!");
}


return (
<div className="login-container">
<div className="login-card">
<h2>Welcome Back</h2>
<p className="subtitle">Login to continue your journey</p>


<form onSubmit={handleSubmit}>
<label>Email</label>
<input
type="email"
placeholder="Enter your email"
value={email}
onChange={(e) => setEmail(e.target.value)}
required
/>


<label>Password</label>
<input
type="password"
placeholder="Enter your password"
value={password}
onChange={(e) => setPassword(e.target.value)}
required
/>


<button type="submit" className="login-btn">Login</button>
</form>

</div>
</div>
);
}


