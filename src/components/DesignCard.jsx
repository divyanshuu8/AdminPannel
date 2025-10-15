export default function DesignCard({ design, onView, onDelete }) {
  return (
    <div className="card shadow-sm border-0">
      <img
        src={design.images[0]?.url}
        alt={design.title}
        className="card-img-top rounded"
        style={{ height: "220px", objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title fw-bold">{design.title}</h5>
        <p className="text-muted small mb-2">{design.type}</p>
        <button
          className="btn btn-outline-primary btn-sm me-2"
          onClick={onView}
        >
          View / Edit
        </button>
        <button className="btn btn-outline-danger btn-sm" onClick={onDelete}>
          Delete
        </button>
      </div>
    </div>
  );
}
