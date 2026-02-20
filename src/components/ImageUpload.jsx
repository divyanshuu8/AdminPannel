import React, { useState } from "react";
import { FaCloudUploadAlt, FaSpinner, FaCheck, FaTimes, FaImage } from "react-icons/fa";
import { uploadImage } from "../utils/imageKit";
import { toast } from "react-hot-toast";

const ImageUpload = ({ currentImage, onUpload, label = "Upload Image" }) => {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    setUploading(true);
    try {
      const result = await uploadImage(file);
      onUpload(result.url);
      toast.success("Image uploaded successfully!");
    } catch (error) {
      console.error("Upload failed", error);
      toast.error("Failed to upload image. Please try again.");
      setPreview(null); // Reset preview on failure
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label fw-semibold">{label}</label>
      
      <div className="d-flex flex-column gap-3">
        {/* Current/Preview Image */}
        {(preview || currentImage) && (
          <div className="position-relative" style={{ maxWidth: "300px" }}>
            <img 
              src={preview || currentImage} 
              alt="Preview" 
              className="img-fluid rounded border shadow-sm"
              style={{ maxHeight: "200px", objectFit: "cover", width: "100%" }}
            />
            {uploading && (
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-white bg-opacity-75 d-flex align-items-center justify-content-center rounded">
                <FaSpinner className="spinner-border text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Upload Button */}
        <div className="d-flex align-items-center gap-2">
          <label className={`btn ${uploading ? 'btn-secondary disabled' : 'btn-outline-primary'}`}>
            {uploading ? (
              <>
                <FaSpinner className="spinner-border spinner-border-sm me-2" />
                Uploading...
              </>
            ) : (
              <>
                <FaCloudUploadAlt className="me-2" />
                {currentImage ? "Change Image" : "Upload Image"}
              </>
            )}
            <input 
              type="file" 
              className="d-none" 
              accept="image/*"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
          
          {currentImage && !uploading && (
             <span className="text-muted small">
               <FaCheck className="text-success me-1" /> 
               Click to replace
             </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageUpload;
