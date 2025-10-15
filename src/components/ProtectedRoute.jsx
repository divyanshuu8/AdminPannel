import { Navigate } from "react-router-dom";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../Firebase";

export default function ProtectedRoute({ children }) {
  const [user, loading] = useAuthState(auth);

  if (loading) return <p className="text-center mt-5">Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
