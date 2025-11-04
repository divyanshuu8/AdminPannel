import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db, auth } from "../Firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

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

      if (adminData.role === "superadmin") {
        q = query(collection(db, "users"), where("role", "!=", "superadmin"));
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
          <span className="badge bg-light text-primary">
            Total Users: {users.length}
          </span>
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
    </div>
  );
}
