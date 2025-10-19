import { useState } from "react";
import { db } from "../../Firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";

export default function ProjectForm({ onSave, existingProject }) {
  const [name, setName] = useState(existingProject?.name || "");
  const [designer, setDesigner] = useState(existingProject?.designer || "");
  const [area, setArea] = useState(existingProject?.area || "");
  const [propertyType, setPropertyType] = useState(
    existingProject?.propertyType || ""
  );
  const [timeline, setTimeline] = useState(existingProject?.timeline || "");
  const [location, setLocation] = useState(existingProject?.location || "");
  const [caseBrief, setCaseBrief] = useState(existingProject?.caseBrief || "");
  const [images, setImages] = useState(existingProject?.images || []);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      alert(`You can only upload up to 4 images.`);
      return;
    }

    const uploaded = [];
    setUploading(true);

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=bd847668268f2ce1588c112b23d28efc`,
        { method: "POST", body: formData }
      );
      const data = await res.json();
      if (data.success)
        uploaded.push({ url: data.data.url, deleteUrl: data.data.delete_url });
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const projectData = {
      name,
      designer,
      area,
      propertyType,
      timeline,
      location,
      caseBrief,
      images,
      createdAt: new Date(),
    };

    try {
      if (existingProject?.id) {
        await updateDoc(
          doc(db, "recentProjects", existingProject.id),
          projectData
        );
        onSave({ ...existingProject, ...projectData });
      } else {
        const docRef = await addDoc(
          collection(db, "recentProjects"),
          projectData
        );
        onSave({ ...projectData, id: docRef.id });
      }

      // Reset form
      setName("");
      setDesigner("");
      setArea("");
      setPropertyType("");
      setTimeline("");
      setLocation("");
      setCaseBrief("");
      setImages([]);
    } catch (err) {
      console.error(err);
      alert("Failed to save project");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-3 rounded mb-4 bg-white shadow-sm"
    >
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Designed by"
        value={designer}
        onChange={(e) => setDesigner(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Project Area"
        value={area}
        onChange={(e) => setArea(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Property Type"
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Timeline"
        value={timeline}
        onChange={(e) => setTimeline(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        required
      />
      <textarea
        className="form-control mb-2"
        placeholder="Case Brief"
        rows={3}
        value={caseBrief}
        onChange={(e) => setCaseBrief(e.target.value)}
        required
      />

      <input
        type="file"
        multiple
        className="form-control mb-2"
        onChange={handleImageChange}
        disabled={uploading}
      />
      <div className="d-flex flex-wrap gap-2 mb-2">
        {images.map((img, idx) => (
          <img
            key={idx}
            src={img.url}
            alt={`Project ${idx}`}
            style={{ width: 80, height: 80, objectFit: "cover" }}
            className="rounded"
          />
        ))}
      </div>

      <button
        type="submit"
        className="btn btn-success w-100"
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : existingProject
          ? "Update Project"
          : "Add Project"}
      </button>
    </form>
  );
}
