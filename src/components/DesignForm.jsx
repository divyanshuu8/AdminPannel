import { useState } from "react";
import { db } from "../Firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function DesignForm({
  onSave,
  existingDesign,
  selectedCategory,
}) {
  const [title, setTitle] = useState(existingDesign?.title || "");
  const [type, setType] = useState(existingDesign?.type || "Normal");
  const [images, setImages] = useState(existingDesign?.images || []);
  const [description, setDescription] = useState(
    existingDesign?.description || ""
  );
  const [features, setFeatures] = useState(existingDesign?.features || [""]);
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState(existingDesign?.ytUrl || ""); // 👈 NEW
  const handleFeatureChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleAddFeature = () => setFeatures([...features, ""]);

  const handleImageChange = async (e) => {
    const files = Array.from(e.target.files);

    // Check if adding these files exceeds the limit
    if (images.length + files.length > 10) {
      alert(
        `You can only upload up to 10 images. You already have ${images.length}.`
      );
      return;
    }

    // Filter out files larger than 5MB
    const filteredFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(
          `File "${file.name}" is larger than 5MB and will not be uploaded.`
        );
        return false;
      }
      return true;
    });

    if (filteredFiles.length === 0) return;

    setUploading(true);

    try {
      const uploadedUrls = [];

      for (const file of filteredFiles) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch(
          `https://api.imgbb.com/1/upload?key=bd847668268f2ce1588c112b23d28efc`,
          { method: "POST", body: formData }
        );

        const data = await res.json();
        if (data.success) {
          uploadedUrls.push({
            url: data.data.url,
            deleteUrl: data.data.delete_url,
          });
        } else {
          console.error("Upload failed:", data);
        }
      }

      setImages((prev) => [...prev, ...uploadedUrls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      alert("❌ Image upload failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (uploading) return;
    setUploading(true);

    try {
      if (images.length === 0 && !existingDesign) {
        alert("Please select at least one image.");
        setUploading(false);
        return;
      }

      // Check for duplicate title in the same category
      if (!existingDesign) {
        const q = query(
          collection(db, "designs"),
          where("title", "==", title),
          where("category", "==", selectedCategory)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          alert("A design with this title already exists in this category!");
          setUploading(false);
          return;
        }
      }

      // 🔧 Don't include "id" in designData
      const designData = {
        title,
        type,
        description,
        features,
        ytUrl, // 👈 Added here
        images,
        createdAt: new Date(),
        category: selectedCategory,
      };

      if (existingDesign?.id) {
        // ✅ Update existing design
        const docRef = doc(db, "designs", existingDesign.id);
        await updateDoc(docRef, designData);
        onSave({ ...existingDesign, ...designData });
      } else {
        // ✅ Create a new one
        const docRef = await addDoc(collection(db, "designs"), designData);
        onSave({ ...designData, id: docRef.id });
      }

      alert("✅ Design saved successfully!");
      setTitle("");
      setDescription("");
      setFeatures([""]);
      setYtUrl(""); // 👈 Reset
      setImages([]);
    } catch (error) {
      console.error("Error saving design:", error);
      alert("❌ Save failed. Check console for details.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border p-3 rounded mb-4 bg-white shadow-sm"
    >
      <div className="mb-2">
        <label className="form-label fw-semibold">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">Type</label>
        <select
          className="form-select"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="Normal">Normal</option>
          <option value="Luxury">Luxury</option>
          <option value="Ultra Premium">Ultra Premium</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">Features</label>
        {features.map((feature, idx) => (
          <input
            key={idx}
            type="text"
            className="form-control mb-1"
            value={feature}
            onChange={(e) => handleFeatureChange(idx, e.target.value)}
          />
        ))}
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary mt-1"
          onClick={handleAddFeature}
        >
          + Add Feature
        </button>
      </div>

      <div className="mb-2">
        <label className="form-label fw-semibold">
          YouTube Video URL (optional)
        </label>
        <input
          type="url"
          className="form-control"
          placeholder="e.g. https://www.youtube.com/watch?v=abcd1234"
          value={ytUrl}
          onChange={(e) => setYtUrl(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Images</label>
        <small className="text-muted d-block mb-1">
          You can upload up to 10 images. Each image must be under 5MB.
        </small>

        <input
          type="file"
          multiple
          className="form-control"
          onChange={handleImageChange}
          disabled={uploading}
        />
        <div className="d-flex flex-wrap mt-2 gap-2">
          {images.map((img, idx) => (
            <img
              key={idx}
              src={img.url}
              alt={`Design ${idx}`}
              style={{ width: 80, height: 80, objectFit: "cover" }}
              className="rounded"
            />
          ))}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-success w-100"
        disabled={uploading}
      >
        {uploading
          ? "Uploading..."
          : existingDesign
          ? "Update Design"
          : "Add Design"}
      </button>
    </form>
  );
}
