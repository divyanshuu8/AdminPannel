import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  // Track auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/"); // Redirect to login page
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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

      {/* --- Navigation Section --- */}
      <div className="bg-white shadow-sm border-top">
        <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between py-2">
          {/* Navigation Links */}
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

          {/* Logout Button */}
          {user && (
            <button
              onClick={handleLogout}
              className="btn btn-outline-danger rounded-pill px-3 py-2"
            >
              Log Out
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
