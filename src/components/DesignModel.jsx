import { useState } from "react";

export default function DesignModal({ design, onClose, onSave }) {
  const [formData, setFormData] = useState({
    ...design,
    featuresInput: (design.features || []).join(", "),
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "featuresInput") {
      setFormData((prev) => ({
        ...prev,
        featuresInput: value,
        features: value
          .split(",")
          .map((f) => f.trim())
          .filter(Boolean),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = () => {
    const { featuresInput, ...dataToSave } = formData;
    onSave(dataToSave);
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
            <h5 className="modal-title">Edit Design</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <label className="form-label fw-semibold">Title</label>
            <input
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="form-control mb-3"
            />

            <label className="form-label fw-semibold">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="form-control mb-3"
              rows="3"
            />

            <label className="form-label fw-semibold">Type</label>
            <div className="d-flex gap-3 mb-3">
              {["Normal", "Luxury", "Ultra Premium"].map((type) => (
                <div key={type} className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="type"
                    id={type}
                    value={type}
                    checked={formData.type === type}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor={type}>
                    {type}
                  </label>
                </div>
              ))}
            </div>

            <label className="form-label fw-semibold">
              Features <span className="text-muted">(comma separated)</span>
            </label>
            <input
              name="featuresInput"
              value={formData.featuresInput || ""}
              onChange={handleChange}
              className="form-control mb-3"
              placeholder="e.g. Soft sliding doors, Mirror panels, Compact design"
            />
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
