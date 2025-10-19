import React from "react";
import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  return (
    <nav className="bg-light shadow-sm">
      {/* --- Top Section --- */}
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between py-3">
        {/* Logo */}
        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none mb-2 mb-md-0"
        >
          <img
            src="/logo192.png"
            alt="CircuitWave Logo"
            height="40"
            className="me-2"
          />
          <span className="fw-bold" style={{ color: "#272631" }}>
            CircuitWave
          </span>
        </Link>

        {/* Tagline */}
        <div className="text-center text-md-end">
          <small className="text-muted fst-italic">
            Designed & Developed by CircuitWave
          </small>
        </div>
      </div>

      <div className="bg-white shadow-sm border-top">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between py-2">
          {/* Navigation Options */}
          <div className="d-flex flex-column flex-md-row gap-2 gap-md-3 mb-2 mb-md-0">
            <Link
              to="/design-management"
              className={`btn rounded-pill text-center px-3 py-2 ${
                location.pathname === "/design-management"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
            >
              Design Management
            </Link>

            <Link
              to="/user-management"
              className={`btn rounded-pill text-center px-3 py-2 ${
                location.pathname === "/user-management"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
            >
              User Management
            </Link>

            <Link
              to="/recent-projects"
              className={`btn rounded-pill text-center px-3 py-2 ${
                location.pathname === "/recent-projects"
                  ? "btn-primary"
                  : "btn-outline-primary"
              }`}
            >
              Recent Projects
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
