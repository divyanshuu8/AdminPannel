import { useState } from "react";

export default function ProjectModal({ project, onClose, onSave }) {
  const [formData, setFormData] = useState({ ...project });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData); // Save only textual updates
    onClose();
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ background: "rgba(0,0,0,0.6)" }}
    >
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">Edit Project</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <div className="mb-2">
              <label className="form-label fw-semibold">Project Name</label>
              <input
                type="text"
                name="name"
                className="form-control"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Designed by</label>
              <input
                type="text"
                name="designer"
                className="form-control"
                value={formData.designer}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Project Area</label>
              <input
                type="text"
                name="area"
                className="form-control"
                value={formData.area}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Property Type</label>
              <input
                type="text"
                name="propertyType"
                className="form-control"
                value={formData.propertyType}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Timeline</label>
              <input
                type="text"
                name="timeline"
                className="form-control"
                value={formData.timeline}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Location</label>
              <input
                type="text"
                name="location"
                className="form-control"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="mb-2">
              <label className="form-label fw-semibold">Case Brief</label>
              <textarea
                name="caseBrief"
                className="form-control"
                rows={3}
                value={formData.caseBrief}
                onChange={handleChange}
              />
            </div>

            {/* Show existing images only */}
            <div className="mb-2">
              <label className="form-label fw-semibold">Existing Images</label>
              <div className="d-flex flex-wrap gap-2">
                {formData.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img.url}
                    alt={`Project ${idx}`}
                    style={{ width: 80, height: 80, objectFit: "cover" }}
                    className="rounded"
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
