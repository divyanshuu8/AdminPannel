import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DesignDashboard from "./components/DesignDashboard";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./components/UserManage";
import RecentProjectsDashboard from "./components/RecentProject/RecentProjectsDashboard";
import { Toaster } from "react-hot-toast"; // ✅ Import Toaster
import PartnerManagement from "./components/PartnerManage";
import Analytics from "./components/Analytics";
import BlogGeneration from "./components/BlogGeneration";

function App() {
  return (
    <Router>
      <Navbar />
      {/* Global Toaster */}
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/design-management"
          element={
            <ProtectedRoute>
              <DesignDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user-management"
          element={
            <ProtectedRoute>
              <UserManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recent-projects"
          element={
            <ProtectedRoute>
              <RecentProjectsDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/partner-manage"
          element={
            <ProtectedRoute>
              <PartnerManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/blog-generation"
          element={
            <ProtectedRoute>
              <BlogGeneration />
            </ProtectedRoute>
          }
        />

        {/* add recent projects */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
