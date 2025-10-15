// src/components/Navbar.jsx
import React from "react";

function Navbar() {
  return (
    <nav className="navbar bg-light shadow-sm py-3">
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-center">
        {/* Logo */}
        <a className="navbar-brand d-flex align-items-center" href="/">
          <img
            src="/logo192.png" // 🔹 Replace with your logo path
            alt="CircuitWave Logo"
            height="40"
            className="d-inline-block align-text-top me-2"
          />
          <span className="fw-bold" style={{ color: "#272631ff" }}>
            CircuitWave
          </span>
        </a>

        {/* Tagline */}
        <div className="mt-2 mt-md-0 text-center text-md-start">
          <small className="text-muted" style={{ fontStyle: "italic" }}>
            Designed & Developed by CircuitWave
          </small>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
