import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const dummyData = [
  {
    _id: "1",
    name: "Riya Patel",
    mobile: "9876543210",
    email: "riya@example.com",
    propertyType: "2 BHK",
    location: "Ahmedabad",
    createdAt: "2025-10-18T12:30:00Z",
  },
  {
    _id: "2",
    name: "Amit Sharma",
    mobile: "9988776655",
    email: "amitsharma@gmail.com",
    propertyType: "3 BHK",
    location: "Mumbai",
    createdAt: "2025-10-17T09:45:00Z",
  },
  {
    _id: "3",
    name: "Priya Nair",
    mobile: "9123456789",
    email: "priya.nair@yahoo.com",
    propertyType: "4+ BHK / Duplex",
    location: "Bangalore",
    createdAt: "2025-10-16T18:15:00Z",
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/estimates")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setUsers(data);
        else setUsers(dummyData);
      })
      .catch(() => setUsers(dummyData));
  }, []);

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
          <h5 className="mb-0">📋 Collected User Information</h5>
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
                    <tr key={u._id} className="text-center">
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
                      <td>{new Date(u.createdAt).toLocaleDateString()}</td>
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
