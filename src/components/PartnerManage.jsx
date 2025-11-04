import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { db } from "../Firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import toast from "react-hot-toast";

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");

  const adminsCollection = collection(db, "admins");

  // Fetch admins from Firestore
  const fetchAdmins = async () => {
    try {
      const snapshot = await getDocs(adminsCollection);
      const adminList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAdmins(adminList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching admins:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Add new admin
  const handleAddAdmin = async () => {
    if (!email || !city) {
      toast.error("Email and City are required!");
      return;
    }

    try {
      await addDoc(adminsCollection, {
        email,
        city,
        role: "admin",
        createdAt: new Date(),
      });
      toast.success("✅ Admin added successfully!");
      setEmail("");
      setCity("");
      fetchAdmins();
    } catch (err) {
      toast.error("Error adding admin: " + err.message);
    }
  };

  // Delete admin
  const handleDeleteAdmin = async (id) => {
    try {
      await deleteDoc(doc(db, "admins", id));
      toast.success("🗑️ Admin deleted successfully!");
      fetchAdmins();
    } catch (err) {
      toast.error("Error deleting admin: " + err.message);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  return (
    <div className="container mt-5">
      <div
        className="card shadow-sm border-0"
        style={{
          borderRadius: "16px",
          backgroundColor: "#f9fbff",
        }}
      >
        {/* Header */}
        <div
          className="card-header text-white d-flex justify-content-between align-items-center"
          style={{
            backgroundColor: "#007bff",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <h5 className="mb-0">🛠️ Admin Management</h5>
          <span className="badge bg-light text-primary">
            Total Admins: {admins.length}
          </span>
        </div>

        {/* Add Admin Form */}
        <div className="card-body">
          <div className="row g-2 mb-4">
            <div className="col-md-4">
              <input
                type="email"
                className="form-control"
                placeholder="Admin Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Admin City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-primary w-100"
                onClick={handleAddAdmin}
              >
                Add Admin
              </button>
            </div>
          </div>

          {/* Admin Table */}
          <div className="table-responsive">
            <table className="table align-middle table-bordered mb-0">
              <thead
                style={{
                  backgroundColor: "#e3f2fd",
                  color: "#004085",
                  fontWeight: "600",
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Email</th>
                  <th>City</th>
                  <th>Role</th>
                  <th>Date Added</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.length > 0 ? (
                  admins.map((a, index) => (
                    <tr key={a.id} className="text-center">
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{a.email}</td>
                      <td>{a.city || "-"}</td>
                      <td>
                        <span
                          className="badge rounded-pill text-dark"
                          style={{ backgroundColor: "#d1ecf1" }}
                        >
                          {a.role}
                        </span>
                      </td>
                      <td>
                        {a.createdAt?.seconds
                          ? new Date(
                              a.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeleteAdmin(a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      No admin data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div
          className="card-footer text-center text-muted"
          style={{
            backgroundColor: "#f1f5ff",
            borderBottomLeftRadius: "16px",
            borderBottomRightRadius: "16px",
          }}
        >
          Last Updated: {new Date().toLocaleString()}
        </div>
      </div>
    </div>
  );
}
