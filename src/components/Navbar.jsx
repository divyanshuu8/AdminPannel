import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { FaGoogle } from "react-icons/fa";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);

  // 🔹 Track authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, [auth]);

  // 🔹 Logout handler
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav
      className="shadow-sm position-sticky top-0 w-100 z-3"
      style={{
        background: user ? "#fff" : "linear-gradient(90deg, #141E30, #243B55)", // fancy gradient when not logged in
        transition: "all 0.3s ease",
      }}
    >
      <div className="container d-flex flex-column flex-md-row align-items-center justify-content-between py-3">
        {/* 🔹 Logo Section */}
        <Link
          to="/"
          className="d-flex align-items-center text-decoration-none mb-2 mb-md-0"
        >
          <img
            src="/logo192.png"
            alt="CircuitWave Logo"
            height="40"
            className="me-2"
            style={{
              filter: user ? "none" : "invert(1)",
            }}
          />
          <span
            className="fw-bold fs-5"
            style={{
              color: user ? "#272631" : "#fff",
              letterSpacing: "0.5px",
            }}
          >
            CircuitWave
          </span>
        </Link>

        {/* 🔹 Right Section */}
        {user ? (
          // ✅ Logged-in Navbar (same as before)
          <div className="d-flex flex-column flex-md-row align-items-center gap-3">
            <div className="d-flex flex-column flex-md-row gap-2 mb-2 mb-md-0">
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

            <button
              onClick={handleLogout}
              className="btn btn-outline-danger rounded-pill px-3 py-2"
            >
              Log Out
            </button>
          </div>
        ) : (
          // 🚀 When user is NOT logged in
          <div className="d-flex align-items-center gap-3">
            <span
              className="text-light d-none d-md-inline"
              style={{ opacity: 0.8 }}
            >
              Empower your business with smart tools
            </span>

            <Link
              to="/"
              className="btn d-flex align-items-center gap-2 text-white fw-semibold rounded-pill px-4 py-2"
              style={{
                background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.25)";
              }}
            >
              <FaGoogle /> Sign in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
