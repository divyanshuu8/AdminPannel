import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DesignDashboard from "./components/DesignDashboard";
import Navbar from "./components/Navbar";
import Login from "./components/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./components/UserManage";
import RecentProjectsDashboard from "./components/RecentProject/RecentProjectsDashboard";

function App() {
  return (
    <Router>
      <Navbar />
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

        {/* add recent projects */}
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
