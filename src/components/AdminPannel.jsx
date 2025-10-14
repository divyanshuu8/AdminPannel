// src/components/AdminPanel.jsx
import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

function AdminPanel() {
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

  const [designs, setDesigns] = useState([]);
  const [newDesign, setNewDesign] = useState({
    id: "",
    category: "",
    type: "",
    title: "",
    description: "",
    features: "",
    images: [],
  });

  // Handle text inputs
  const handleChange = (e) => {
    setNewDesign({ ...newDesign, [e.target.name]: e.target.value });
  };

  // Handle image file selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const imagePreviews = files.map((file) => URL.createObjectURL(file));
    setNewDesign({ ...newDesign, images: imagePreviews });
  };

  // Handle add design
  const handleAddDesign = () => {
    if (!newDesign.title || !newDesign.type || !newDesign.category) {
      alert("Please fill all required fields (category, type, and title)");
      return;
    }

    const newEntry = {
      ...newDesign,
      id: designs.length + 1,
      features: newDesign.features
        ? newDesign.features.split(",").map((f) => f.trim())
        : [],
    };

    setDesigns([...designs, newEntry]);
    setNewDesign({
      id: "",
      category: "",
      type: "",
      title: "",
      description: "",
      features: "",
      images: [],
    });
  };

  const handleDelete = (id) => {
    setDesigns(designs.filter((d) => d.id !== id));
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">🛠 Admin Panel — Design Management</h2>

      {/* --- Add Form --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title mb-3">Add New Design</h5>
          <div className="row g-3">
            {/* Category */}
            <div className="col-md-6">
              <label className="form-label fw-bold">Category</label>
              <select
                className="form-select"
                name="category"
                value={newDesign.category}
                onChange={handleChange}
              >
                <option value="">Select Category</option>
                {designCategories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type - Radio buttons */}
            <div className="col-md-6">
              <label className="form-label fw-bold d-block">Type</label>
              {["Normal", "Luxury", "Ultra Premium"].map((t) => (
                <div className="form-check form-check-inline" key={t}>
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id={t}
                    value={t}
                    checked={newDesign.type === t}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={t}>
                    {t}
                  </label>
                </div>
              ))}
            </div>

            {/* Title */}
            <div className="col-12">
              <input
                type="text"
                className="form-control"
                placeholder="Title"
                name="title"
                value={newDesign.title}
                onChange={handleChange}
              />
            </div>

            {/* Description */}
            <div className="col-12">
              <textarea
                className="form-control"
                placeholder="Description"
                name="description"
                value={newDesign.description}
                onChange={handleChange}
              ></textarea>
            </div>

            {/* Features */}
            <div className="col-12">
              <input
                type="text"
                className="form-control"
                placeholder="Features (comma separated)"
                name="features"
                value={newDesign.features}
                onChange={handleChange}
              />
            </div>

            {/* Image Upload */}
            <div className="col-12">
              <label className="form-label fw-bold">Upload Images</label>
              <input
                type="file"
                className="form-control"
                multiple
                accept="image/*"
                onChange={handleImageChange}
              />
              <div className="d-flex gap-2 flex-wrap mt-2">
                {newDesign.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt="preview"
                    className="rounded border"
                    style={{
                      width: "100px",
                      height: "100px",
                      objectFit: "cover",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          <button className="btn btn-primary mt-3" onClick={handleAddDesign}>
            ➕ Add Design
          </button>
        </div>
      </div>

      {/* --- Designs List --- */}
      <div className="row">
        {designs.map((design) => (
          <div key={design.id} className="col-md-6 mb-4">
            <div className="card h-100 shadow-sm">
              {design.images.length > 0 && (
                <img
                  src={design.images[0]}
                  alt={design.title}
                  className="card-img-top"
                  style={{ height: "200px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{design.title}</h5>
                <p className="text-muted mb-1">
                  <b>Category:</b> {design.category}
                </p>
                <p className="text-muted mb-1">
                  <b>Type:</b> {design.type}
                </p>
                <p className="card-text mt-2">{design.description}</p>
                {design.features.length > 0 && (
                  <ul>
                    {design.features.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                )}
                <button
                  className="btn btn-danger btn-sm mt-2"
                  onClick={() => handleDelete(design.id)}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AdminPanel;
