import { useEffect, useState } from "react";
import DesignCard from "./DesignCard";
import DesignModel from "./DesignModel";
import DesignForm from "./DesignForm";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../Firebase";
import {
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function DesignDashboard() {
  const [visibleCount, setVisibleCount] = useState(3);
  const designCategories = [
    { label: "Modular Kitchen", value: "Modular-Kitchen-Designs" },
    { label: "Wardrobe", value: "Wardrobe-Designs" },
    { label: "Bedroom", value: "Bedroom-Designs" },
    { label: "Living Room", value: "Living-Room-Designs" },
    { label: "Dining Room", value: "Dining-Room-Designs" },
    { label: "Home Office", value: "Home-Office-Designs" },
    { label: "Kids Bedroom", value: "Kids-Bedroom-Designs" },
    { label: "Bathroom", value: "Bathroom-Designs" },
    { label: "1BHK", value: "1BHK-Designs" },
    { label: "2BHK", value: "2BHK-Designs" },
    { label: "3BHK", value: "3BHK-Designs" },
  ];
  const [user, setUser] = useState(null);

  const designTypes = ["Normal", "Luxury", "Ultra Premium"];

  const [selectedCategory, setSelectedCategory] = useState(
    "Modular-Kitchen-Designs"
  );
  const [selectedType, setSelectedType] = useState("Normal");
  const [designToDelete, setDesignToDelete] = useState(null);

  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  // --- Track logged-in user ---

  useEffect(() => {
    const auth = getAuth();

    console.log("🔄 Setting up Firebase Auth listener...");

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("👤 Auth state changed:", currentUser);

      if (currentUser) {
        try {
          // Step 1: Get user email
          const userEmail = currentUser.email;
          console.log("📧 Logged-in email:", userEmail);

          // Step 2: Query Firestore where email == userEmail
          const adminsCollection = collection(db, "admins");
          const q = query(adminsCollection, where("email", "==", userEmail));
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const adminData = querySnapshot.docs[0].data();
            console.log("✅ Admin record found:", adminData);
            setUser({ ...currentUser, role: adminData.role });
          } else {
            console.log(
              "⚠️ No admin record found → assigning default 'user' role"
            );
            setUser({ ...currentUser, role: "user" });
          }
        } catch (error) {
          console.error("❌ Error fetching admin role:", error);
        }
      } else {
        console.log("🚪 User signed out");
        setUser(null);
      }
    });

    return () => {
      console.log("🧹 Cleaning up Firebase Auth listener");
      unsubscribe();
    };
  }, []);

  // --- Fetch data from Firestore ---
  useEffect(() => {
    const fetchDesigns = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "designs"));
        const fetchedDesigns = [];
        querySnapshot.forEach((docSnap) =>
          fetchedDesigns.push({ id: docSnap.id, ...docSnap.data() })
        );
        // Apply filter for category and type
        const filtered = fetchedDesigns.filter(
          (d) => d.category === selectedCategory && d.type === selectedType
        );
        setDesigns(filtered);
      } catch (error) {
        console.error("Error loading designs:", error);
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [selectedCategory, selectedType]);

  // --- Update design ---
  const handleUpdateDesign = async (updatedDesign) => {
    try {
      const { id, ...dataToUpdate } = updatedDesign; // remove 'id' before updating
      const designRef = doc(db, "designs", id);
      await updateDoc(designRef, dataToUpdate);

      setDesigns((prev) =>
        prev.map((d) => (d.id === id ? { id, ...dataToUpdate } : d))
      );

      setSelectedDesign(null);
    } catch (error) {
      console.error("Error updating design:", error);
    }
  };

  // --- Delete design ---
  const handleDeleteDesign = async (id) => {
    try {
      const design = designs.find((d) => d.id === id);
      console.log("Deleting:", id, design);

      if (design?.images) {
        for (const img of design.images) {
          if (img.deleteUrl) {
            const res = await fetch("/.netlify/functions/deleteImg", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ deleteUrl: img.deleteUrl }),
            });
            const data = await res.json();
            console.log("ImgBB delete:", data);
          }
        }
      }

      await deleteDoc(doc(db, "designs", id));
      console.log("Deleted from Firestore");
      setDesigns((prev) => prev.filter((d) => d.id !== id));
    } catch (error) {
      console.error("Error deleting design:", error);
    }
  };

  return (
    <div className="container py-4">
      {/* --- Header --- */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Design Management</h2>
        <button
          className="btn btn-primary position-relative"
          onClick={() => setShowForm(!showForm)}
          disabled={user?.role !== "super-admin"} // ✅ role-based control
          style={{
            opacity: user?.role !== "super-admin" ? 0.6 : 1,
            cursor: user?.role !== "super-admin" ? "not-allowed" : "pointer",
          }}
          title={
            user?.role !== "super-admin"
              ? "Only Super Admins can add new designs"
              : ""
          }
        >
          {showForm ? "Close Form" : "Add Design"}
        </button>
      </div>

      {/* --- Filters --- */}
      <div className="d-flex flex-wrap gap-3 mb-4">
        <div>
          <label className="form-label fw-semibold">Category</label>
          <select
            className="form-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {designCategories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label fw-semibold">Type</label>
          <select
            className="form-select"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            {designTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* --- Add Form --- */}
      {showForm && (
        <DesignForm
          onSave={(newDesign) => setDesigns([...designs, newDesign])}
          selectedCategory={selectedCategory}
          selectedType={selectedType}
        />
      )}

      {/* --- Designs Grid --- */}
      {loading ? (
        <p className="text-muted">Loading designs...</p>
      ) : designs.length === 0 ? (
        <p className="text-muted">No designs found for this category/type.</p>
      ) : (
        <>
          <div className="row g-4 mt-2">
            {designs.slice(0, visibleCount).map((design) => (
              <div className="col-md-4" key={design.id}>
                <DesignCard
                  design={design}
                  onView={() => setSelectedDesign(design)}
                  onDelete={() => setDesignToDelete(design)}
                  currentUser={user}
                />
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < designs.length && (
            <div className="text-center mt-4">
              <button
                className="btn btn-primary px-4 py-2"
                onClick={() => setVisibleCount((prev) => prev + 3)}
              >
                Load More
              </button>
            </div>
          )}
        </>
      )}

      {/* --- Modal --- */}
      {selectedDesign && (
        <DesignModel
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onSave={handleUpdateDesign}
        />
      )}

      {designToDelete && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDesignToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <b>{designToDelete.title}</b>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setDesignToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleDeleteDesign(designToDelete.id);
                    setDesignToDelete(null);
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
