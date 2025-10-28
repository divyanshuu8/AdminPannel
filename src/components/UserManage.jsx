import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, where, addDoc } from "firebase/firestore";
import { db, auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [newAdminCity, setNewAdminCity] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminSnap = await getDocs(
            query(collection(db, "admins"), where("email", "==", user.email))
          );

          if (!adminSnap.empty) {
            const adminData = adminSnap.docs[0].data();
            setCurrentAdmin(adminData);
            console.log("✅ Admin data fetched:", adminData);
            await fetchUsers(adminData);
          } else {
            console.warn("⚠️ No admin record found for this user.");
            setCurrentAdmin(null);
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      } else {
        setCurrentAdmin(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async (adminData) => {
    try {
      let q;

      if (adminData.role === "super-admin") {
        q = query(collection(db, "users"), where("role", "!=", "super-admin"));
      } else if (adminData.role === "admin") {
        q = query(
          collection(db, "users"),
          where("location", "==", adminData.city),
          where("role", "==", "user")
        );
      } else {
        setUsers([]);
        return;
      }

      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleAddAdmin = async (e) => {
    e.preventDefault();

    if (!newAdminEmail || !newAdminCity) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "admins"), {
        email: newAdminEmail,
        city: newAdminCity,
        role: "admin",
        createdAt: new Date(),
      });

      toast.success("✅ New admin added successfully!");
      setShowModal(false);
      setNewAdminEmail("");
      setNewAdminCity("");
    } catch (error) {
      console.error("Error adding admin:", error);
      toast.error("Error adding admin: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );

  if (!currentAdmin)
    return (
      <div className="text-center mt-5 text-danger">
        Please log in with an admin account to view users.
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
          <h5 className="mb-0">📋 User Information</h5>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-light text-primary">
              Total Users: {users.length}
            </span>

            {/* ✅ Add Admin Button (Only for Super Admins) */}
            {currentAdmin.role === "super-admin" && (
              <button
                className="btn btn-light btn-sm fw-semibold"
                onClick={() => setShowModal(true)}
              >
                + Add Admin
              </button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="card-body p-0">
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
                  <th>Name</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Property Type</th>
                  <th>Location</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((u, index) => (
                    <tr key={u.id} className="text-center">
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{u.name}</td>
                      <td>{u.mobile}</td>
                      <td>{u.email || "-"}</td>
                      <td>
                        <span
                          className="badge rounded-pill text-dark"
                          style={{ backgroundColor: "#d1ecf1" }}
                        >
                          {u.propertyType}
                        </span>
                      </td>
                      <td>{u.location}</td>
                      <td>
                        {u.createdAt?.seconds
                          ? new Date(
                              u.createdAt.seconds * 1000
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-4 text-muted">
                      No user data available.
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

      {/* ✅ Add Admin Modal */}
      {showModal && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog">
            <div className="modal-content border-0 rounded-4 shadow-lg">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">Add New Admin</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>

              <form onSubmit={handleAddAdmin}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter admin email"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">City</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter city"
                      value={newAdminCity}
                      onChange={(e) => setNewAdminCity(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Add Admin
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
