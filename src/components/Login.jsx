import { useState } from "react";
import { auth } from "../Firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/design-management");
    } catch (error) {
      alert("Login failed: " + error.message);
      console.error(error);
    }
    setLoading(false);
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center"
      style={{
        minHeight: "calc(100vh - 82px)", // assuming your navbar height is ~70px
        background: "linear-gradient(135deg, #FFEDD5, #3816f9ff, #3c9ffbff)",
        paddingTop: "20px", // optional, some spacing from navbar
        paddingBottom: "20px",
      }}
    >
      <div
        className="card shadow-lg p-4"
        style={{ maxWidth: "400px", width: "100%" }}
      >
        <h2 className="text-center mb-4" style={{ color: "#210cc2ff" }}>
          Admin-Pannel
        </h2>
        <p className="text-center text-muted mb-4">
          Empower your business with smart tools
        </p>

        <form onSubmit={handleLogin}>
          <div className="mb-3 input-group">
            <span className="input-group-text bg-orange-200 border-0">
              <FaEnvelope style={{ color: "#2516f9ff" }} />
            </span>
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="mb-3 input-group">
            <span className="input-group-text bg-orange-200 border-0">
              <FaLock style={{ color: "#4716f9ff" }} />
            </span>
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn w-100 text-white"
            style={{
              background: "linear-gradient(90deg, #1684f9ff, #3c49fbff)",
              border: "none",
            }}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
