import { useState } from "react";
import { db, storage } from "../Firebase";
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

export default function DesignForm({
  onSave,
  existingDesign,
  selectedCategory,
}) {
  const [title, setTitle] = useState(existingDesign?.title || "");
  const [type, setType] = useState(existingDesign?.type || "Normal");
  const [images, setImages] = useState([]);
  const [description, setDescription] = useState(
    existingDesign?.description || ""
  );
  const [features, setFeatures] = useState(existingDesign?.features || [""]);

  const handleFeatureChange = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const handleAddFeature = () => setFeatures([...features, ""]);

  const handleImageChange = (e) => {
    setImages([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Upload images to Firebase Storage
    const uploadedUrls = [];
    for (const image of images) {
      const storageRef = ref(storage, `designs/${Date.now()}-${image.name}`);
      const uploadTask = await uploadBytesResumable(storageRef, image);
      const url = await getDownloadURL(uploadTask.ref);
      uploadedUrls.push(url);
    }

    // If no images uploaded, show alert and return
    if (uploadedUrls.length === 0) {
      alert("Please upload at least one image.");
      return;
    }

    const designData = {
      title,
      type,
      description,
      features,
      images: uploadedUrls,
      createdAt: new Date(),
      category: selectedCategory, // <-- Add category here
    };

    try {
      if (existingDesign) {
        // Update existing
        const docRef = doc(db, "designs", existingDesign.id);
        await updateDoc(docRef, designData);
        onSave({ ...existingDesign, ...designData });
      } else {
        // Add new design
        const docRef = await addDoc(collection(db, "designs"), designData);
        onSave({ ...designData, id: docRef.id });
      }
    } catch (error) {
      console.error("Error saving design:", error);
      alert("Error saving design. Please check your connection and try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border p-3 rounded mb-4">
      <div className="mb-2">
        <label className="form-label">Title</label>
        <input
          type="text"
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Type</label>
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
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Features</label>
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
          Add Feature
        </button>
      </div>

      <div className="mb-3">
        <label className="form-label">Images</label>
        <input
          type="file"
          multiple
          className="form-control"
          onChange={handleImageChange}
        />
      </div>

      <button type="submit" className="btn btn-success">
        {existingDesign ? "Update Design" : "Add Design"}
      </button>
    </form>
  );
}
