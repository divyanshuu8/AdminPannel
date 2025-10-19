import { useEffect, useState } from "react";
import { db } from "../../Firebase";
import {
  collection,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ProjectForm from "./ProjectForm";
import ProjectCard from "./ProjectCard";
import ProjectModal from "./ProjectModel";

export default function RecentProjectsDashboard() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);

  // Fetch projects from Firestore
  useEffect(() => {
    const fetchProjects = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, "recentProjects"));
        const fetched = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(fetched);
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
      setLoading(false);
    };

    fetchProjects();
  }, []);

  // Update project
  const handleUpdateProject = async (updatedProject) => {
    try {
      const { id, ...data } = updatedProject;
      await updateDoc(doc(db, "recentProjects", id), data);
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { id, ...data } : p))
      );
      setSelectedProject(null);
    } catch (err) {
      console.error("Error updating project:", err);
    }
  };

  // Delete project
  const handleDeleteProject = async (id) => {
    try {
      await deleteDoc(doc(db, "recentProjects", id));
      setProjects((prev) => prev.filter((p) => p.id !== id));
      setProjectToDelete(null);
    } catch (err) {
      console.error("Error deleting project:", err);
    }
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold">Recent Projects</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Close Form" : "Add Project"}
        </button>
      </div>

      {showForm && (
        <ProjectForm
          onSave={(project) => setProjects([...projects, project])}
        />
      )}

      {loading ? (
        <p>Loading projects...</p>
      ) : projects.length === 0 ? (
        <p>No projects added yet.</p>
      ) : (
        <div className="row g-4">
          {projects.map((project) => (
            <div className="col-md-4" key={project.id}>
              <ProjectCard
                project={project}
                onView={() => setSelectedProject(project)}
                onDelete={() => setProjectToDelete(project)}
              />
            </div>
          ))}
        </div>
      )}

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
          onSave={handleUpdateProject}
        />
      )}

      {projectToDelete && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirm Delete</h5>
                <button
                  className="btn-close"
                  onClick={() => setProjectToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Are you sure you want to delete <b>{projectToDelete.name}</b>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setProjectToDelete(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDeleteProject(projectToDelete.id)}
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
