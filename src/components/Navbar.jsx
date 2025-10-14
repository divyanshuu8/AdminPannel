// src/components/Navbar.jsx
import React from "react";

function Navbar() {
  return (
    <nav className="navbar bg-light shadow-sm">
      <div className="container justify-content-center">
        <a className="navbar-brand" href="#">
          <img
            src="/logo192.png" // 🔹 Replace with your logo path
            alt="Logo"
            height="40"
            className="d-inline-block align-text-top"
          />
        </a>
      </div>
    </nav>
  );
}

export default Navbar;
