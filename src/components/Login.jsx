import { useState } from "react";
import { auth } from "../Firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import toast from "react-hot-toast";

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const googleProvider = new GoogleAuthProvider();

  // 🔹 Google Login
  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      toast.success(`Welcome, ${user.displayName}!`);
      navigate("/design-management");
    } catch (error) {
      toast.error("Google login failed: " + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center text-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)", // deep gradient
        padding: "20px",
      }}
    >
      <div
        className="shadow-lg p-5 rounded-4"
        style={{
          maxWidth: "420px",
          width: "100%",
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          color: "#fff",
        }}
      >
        <h2
          className="fw-bold mb-3"
          style={{
            fontSize: "1.8rem",
            background: "linear-gradient(90deg, #7dd3fc, #60a5fa, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Admin Panel
        </h2>
        <p className="text-light mb-4" style={{ opacity: 0.8 }}>
          Sign in securely with your Google account to continue
        </p>

        <button
          onClick={handleGoogleLogin}
          className="btn w-100 d-flex align-items-center justify-content-center py-2 fs-5"
          style={{
            background: "white",
            color: "#333",
            fontWeight: 600,
            borderRadius: "12px",
            boxShadow:
              "0px 4px 12px rgba(255, 255, 255, 0.15), 0 0 10px rgba(0,0,0,0.2)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.transform = "scale(1.03)")
          }
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          disabled={loading}
        >
          <FaGoogle className="me-2" style={{ color: "#DB4437" }} />
          {loading ? "Signing in..." : "Sign in with Google"}
        </button>

        <p
          className="mt-4"
          style={{ fontSize: "0.9rem", color: "#cbd5e1", opacity: 0.8 }}
        >
          © {new Date().getFullYear()} Circuitwave Solutions
        </p>
      </div>
    </div>
  );
}
