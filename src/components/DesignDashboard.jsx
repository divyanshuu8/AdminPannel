import { useEffect, useState } from "react";
import DesignCard from "./DesignCard";
import DesignModel from "./DesignModel";
import DesignForm from "./DesignForm";
import { db } from "../Firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

export default function DesignDashboard() {
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

  const designTypes = ["Normal", "Luxury", "Ultra Premium"];

  const [selectedCategory, setSelectedCategory] = useState(
    "Modular-Kitchen-Designs"
  );
  const [selectedType, setSelectedType] = useState("Normal");
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

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
        console.log(fetchedDesigns);

        // const filtered = fetchedDesigns.filter(
        //   (d) => d.category === selectedCategory && d.type === selectedType
        // );
        // setDesigns(filtered);

        setDesigns(fetchedDesigns); // Show all designs
      } catch (error) {
        console.error("Error loading designs:", error);
      }
      setLoading(false);
    };

    fetchDesigns();
  }, [selectedCategory, selectedType]);

  // --- Add new design ---
  const handleAddDesign = async (newDesign) => {
    try {
      const docRef = await addDoc(collection(db, "designs"), newDesign);
      setDesigns([...designs, { ...newDesign, id: docRef.id }]);
      setShowForm(false);
    } catch (error) {
      console.error("Error adding design:", error);
    }
  };

  // --- Update design ---
  const handleUpdateDesign = async (updatedDesign) => {
    try {
      const designRef = doc(db, "designs", updatedDesign.id);
      await updateDoc(designRef, updatedDesign);
      setDesigns((prev) =>
        prev.map((d) => (d.id === updatedDesign.id ? updatedDesign : d))
      );
      setSelectedDesign(null);
    } catch (error) {
      console.error("Error updating design:", error);
    }
  };

  // --- Delete design ---
  const handleDeleteDesign = async (id) => {
    try {
      await deleteDoc(doc(db, "designs", id));
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
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
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
          onSave={handleAddDesign}
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
        <div className="row g-4 mt-2">
          {designs.map((design) => (
            <div className="col-md-4" key={design.id}>
              <DesignCard
                design={design}
                onView={() => setSelectedDesign(design)}
                onDelete={() => handleDeleteDesign(design.id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* --- Modal --- */}
      {selectedDesign && (
        <DesignModel
          design={selectedDesign}
          onClose={() => setSelectedDesign(null)}
          onSave={handleUpdateDesign}
        />
      )}
    </div>
  );
}
