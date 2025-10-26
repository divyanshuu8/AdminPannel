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

export default function PartnerManagement() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const partnersCollection = collection(db, "partners");

  // Fetch partners from Firestore
  const fetchPartners = async () => {
    try {
      const snapshot = await getDocs(partnersCollection);
      const partnerList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPartners(partnerList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching partners:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // Add new partner
  const handleAddPartner = async () => {
    if (!name || !email) {
      toast.error("Name and Email are required!");
      return;
    }
    try {
      await addDoc(partnersCollection, { name, email });
      toast.success("Partner added successfully!");
      setName("");
      setEmail("");
      fetchPartners();
    } catch (err) {
      toast.error("Error adding partner: " + err.message);
    }
  };

  // Delete partner
  const handleDeletePartner = async (id) => {
    try {
      await deleteDoc(doc(db, "partners", id));
      toast.success("Partner deleted successfully!");
      fetchPartners();
    } catch (err) {
      toast.error("Error deleting partner: " + err.message);
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
            backgroundColor: "#28a745",
            borderTopLeftRadius: "16px",
            borderTopRightRadius: "16px",
          }}
        >
          <h5 className="mb-0">🤝 Partner Management</h5>
          <span className="badge bg-light text-success">
            Total Partners: {partners.length}
          </span>
        </div>

        {/* Add Partner Form */}
        <div className="card-body">
          <div className="row g-2 mb-4">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="Partner Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <input
                type="email"
                className="form-control"
                placeholder="Partner Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="col-md-4">
              <button
                className="btn btn-success w-100"
                onClick={handleAddPartner}
              >
                Add Partner
              </button>
            </div>
          </div>

          {/* Partner Table */}
          <div className="table-responsive">
            <table className="table align-middle table-bordered mb-0">
              <thead
                style={{
                  backgroundColor: "#d4edda",
                  color: "#155724",
                  fontWeight: "600",
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {partners.length > 0 ? (
                  partners.map((p, index) => (
                    <tr key={p.id} className="text-center">
                      <td>{index + 1}</td>
                      <td className="fw-semibold">{p.name}</td>
                      <td>{p.email}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDeletePartner(p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-4 text-muted">
                      No partner data available.
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
            backgroundColor: "#e6f4ea",
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
