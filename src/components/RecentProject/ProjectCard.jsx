export default function ProjectCard({ project, onView, onDelete }) {
  return (
    <div className="card shadow-sm border-0">
      <img
        src={project.images[0]?.url}
        alt={project.name}
        className="card-img-top rounded"
        style={{ height: 220, objectFit: "cover" }}
      />
      <div className="card-body">
        <h5 className="card-title fw-bold">{project.name}</h5>
        <p className="text-muted small mb-2">Designed by {project.designer}</p>
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
