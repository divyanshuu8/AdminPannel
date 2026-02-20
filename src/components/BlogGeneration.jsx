import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaNewspaper,
  FaKeyboard,
  FaTag,
  FaSpinner,
  FaCheckCircle,
  FaList,
  FaEdit,
  FaTrash,
  FaEye,
  FaTimes,
  FaArrowLeft,
  FaPlus,
  FaImages,
} from "react-icons/fa";
import ImageUpload from "./ImageUpload"; // Import ImageUpload component
import { db } from "../Firebase";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
} from "firebase/firestore";

function BlogGeneration() {
  const [view, setView] = useState("generate"); // 'generate', 'list', 'edit', 'view'
  const [formData, setFormData] = useState({
    topic: "",
    keywords: "",
    category: "",
  });

  const [loading, setLoading] = useState(false);
  const [generatedBlog, setGeneratedBlog] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStage, setGenerationStage] = useState("");

  // Blog list state
  const [blogs, setBlogs] = useState([]);
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [editFormData, setEditFormData] = useState(null);

  // Category options based on your existing design categories
  const categories = [
    "Bedroom Design Ideas",
    "Living Room Design Ideas",
    "Kitchen Design Ideas",
    "Bathroom Design Ideas",
    "Home Office Design Ideas",
    "Dining Room Design Ideas",
    "Kids Room Design Ideas",
    "Interior Design Tips",
    "Home Decor",
    "Space Saving Ideas",
  ];

  // Load blogs when switching to list view
  useEffect(() => {
    if (view === "list") {
      loadBlogs();
    }
  }, [view]);

  // Simulate generation progress
  useEffect(() => {
    if (loading) {
      const stages = [
        { percent: 10, text: "Analyzing topic and keywords..." },
        { percent: 25, text: "Researching content..." },
        { percent: 40, text: "Generating blog structure..." },
        { percent: 55, text: "Creating engaging content..." },
        { percent: 70, text: "Generating images..." },
        { percent: 85, text: "Optimizing SEO metadata..." },
        { percent: 95, text: "Finalizing blog post..." },
      ];

      let currentStage = 0;
      const interval = setInterval(() => {
        if (currentStage < stages.length) {
          setGenerationProgress(stages[currentStage].percent);
          setGenerationStage(stages[currentStage].text);
          currentStage++;
        }
      }, 2000);

      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
      setGenerationStage("");
    }
  }, [loading]);

  const loadBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(blogsRef, orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const blogsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setBlogs(blogsData);
    } catch (error) {
      console.error("Error loading blogs:", error);
      toast.error("Failed to load blogs");
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("metaKeywords")) {
      const index = parseInt(name.split("-")[1]);
      const newKeywords = [...editFormData.metaKeywords];
      newKeywords[index] = value;
      setEditFormData({
        ...editFormData,
        metaKeywords: newKeywords,
      });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.topic.trim() || !formData.keywords.trim() || !formData.category) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    setGeneratedBlog(null);
    setGenerationProgress(0);

    // Store submitted data for display
    const dataToSubmit = {
      topic: formData.topic,
      keywords: formData.keywords,
      category: formData.category,
    };

    try {
      const response = await fetch("https://cw-mailautointerior.onrender.com/api/blogs/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: `${formData.topic} - ${formData.keywords}`,
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGenerationProgress(100);
        setGenerationStage("Blog generated successfully!");
        setTimeout(() => {
          toast.success("Blog generated successfully! 🎉");
          setGeneratedBlog(data);
          setSubmittedData(dataToSubmit);
          // Reset form
          setFormData({
            topic: "",
            keywords: "",
            category: "",
          });
        }, 500);
      } else {
        toast.error(data.message || "Failed to generate blog");
      }
    } catch (error) {
      console.error("Error generating blog:", error);
      toast.error("Failed to connect to the server. Please ensure the backend is running.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "blogs", blogId));
      toast.success("Blog deleted successfully");
      loadBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const blogRef = doc(db, "blogs", selectedBlog.id);
      await updateDoc(blogRef, {
        ...editFormData,
        updatedAt: new Date(),
      });
      toast.success("Blog updated successfully");
      setView("list");
      loadBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      toast.error("Failed to update blog");
    }
  };

  const startEdit = (blog) => {
    setSelectedBlog(blog);
    setEditFormData({
      author: blog.author || "",
      category: blog.category || "",
      content: blog.content || "",
      date: blog.date || "",
      excerpt: blog.excerpt || "",
      image: blog.image || "",
      metaDescription: blog.metaDescription || "",
      metaKeywords: blog.metaKeywords || [""],
      ogDescription: blog.ogDescription || "",
      ogImage: blog.ogImage || "",
      ogTitle: blog.ogTitle || "",
      published: blog.published || false,
      readingTime: blog.readingTime || 0,
      slug: blog.slug || "",
      title: blog.title || "",
    });
    setView("edit");
  };

  const viewBlog = (blog) => {
    setSelectedBlog(blog);
    setView("view");
  };

  const addKeywordField = () => {
    setEditFormData({
      ...editFormData,
      metaKeywords: [...editFormData.metaKeywords, ""],
    });
  };

  const removeKeywordField = (index) => {
    const newKeywords = editFormData.metaKeywords.filter((_, i) => i !== index);
    setEditFormData({
      ...editFormData,
      metaKeywords: newKeywords,
    });
  };

  // Render blog generation view
  const renderGenerateView = () => (
    <div className="container">
      {/* Header */}
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h1 fw-bold text-dark mb-2">
            📝 Blog Generation
          </h1>
          <p className="text-muted">
            Generate engaging blog posts by providing a topic, keywords, and category
          </p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => setView("list")}
        >
          <FaList className="me-2" />
          View All Blogs
        </button>
      </div>

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm p-4 rounded-3 border-0">
            <h3 className="h5 fw-semibold text-dark mb-4">
              Create New Blog
            </h3>

            <form onSubmit={handleSubmit}>
              {/* Topic */}
              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaNewspaper className="me-2 text-primary" />
                  Topic
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g., Cozy Bedroom Ideas"
                  disabled={loading}
                />
                <small className="text-muted">
                  Main topic or title for your blog post
                </small>
              </div>

              {/* Keywords */}
              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaKeyboard className="me-2 text-primary" />
                  Keywords
                </label>
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="e.g., warm colors, soft lighting, minimalist"
                  disabled={loading}
                />
                <small className="text-muted">
                  Relevant keywords to include in the blog (comma-separated)
                </small>
              </div>

              {/* Category */}
              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaTag className="me-2 text-primary" />
                  Category
                </label>
                <select
                  className="form-select form-select-lg"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <small className="text-muted">
                  Choose the most relevant category
                </small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="spinner-border spinner-border-sm" />
                    <span>Generating Blog...</span>
                  </>
                ) : (
                  <>
                    <FaNewspaper />
                    <span>Generate Blog</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview/Success/Progress Section */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <div className="card shadow-sm p-4 rounded-3 border-0">
              <div className="text-center">
                <div className="mb-4">
                  <FaSpinner className="text-primary spinner-border" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h5 fw-semibold mb-3">Generating Your Blog</h3>
                <p className="text-muted mb-4">{generationStage}</p>
                
                {/* Progress Bar */}
                <div className="position-relative mb-3">
                  <div className="progress" style={{ height: "30px" }}>
                    <div
                      className="progress-bar progress-bar-striped progress-bar-animated bg-primary"
                      role="progressbar"
                      style={{ width: `${generationProgress}%` }}
                      aria-valuenow={generationProgress}
                      aria-valuemin="0"
                      aria-valuemax="100"
                    >
                      {generationProgress}%
                    </div>
                  </div>
                </div>

                {/* Fun Facts */}
                <div className="mt-4 p-3 bg-light rounded">
                  <p className="small text-muted mb-0">
                    💡 <strong>Did you know?</strong> A well-designed interior can increase property value by up to 15%
                  </p>
                </div>
              </div>
            </div>
          ) : generatedBlog ? (
            <div className="card shadow-sm p-4 rounded-3 border-0 bg-success bg-opacity-10 border-success">
              <div className="d-flex align-items-center mb-3">
                <FaCheckCircle className="text-success fs-3 me-2" />
                <h3 className="h5 fw-semibold text-success mb-0">
                  Blog Generated Successfully!
                </h3>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="mb-2">
                  <strong>Topic:</strong> {submittedData?.topic || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Keywords:</strong> {submittedData?.keywords || "N/A"}
                </p>
                <p className="mb-2">
                  <strong>Category:</strong> {submittedData?.category || "N/A"}
                </p>
                <p className="mb-0 text-muted small">
                  Your blog has been generated and saved to the database.
                </p>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm p-4 rounded-3 border-0 bg-light">
              <div className="text-center py-5">
                <FaNewspaper className="text-muted mb-3" style={{ fontSize: "4rem", opacity: 0.3 }} />
                <p className="text-muted">
                  Fill in the form and click "Generate Blog" to create a new blog post
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Section */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm p-4 rounded-3 border-0">
            <h3 className="h6 fw-semibold text-dark mb-3">ℹ️ How it works</h3>
            <ul className="mb-0 text-muted">
              <li className="mb-2">
                Enter a <strong>topic</strong> that describes the main subject of your blog post
              </li>
              <li className="mb-2">
                Add relevant <strong>keywords</strong> that should be included in the content
              </li>
              <li className="mb-2">
                Select a <strong>category</strong> to help organize your blog posts
              </li>
              <li>
                Click "Generate Blog" and the AI will create a complete blog post for you
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Render blog list view
  const renderListView = () => (
    <div className="container">
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <div>
          <h1 className="h1 fw-bold text-dark mb-2">
            📚 All Blogs
          </h1>
          <p className="text-muted">
            Manage your blog posts - view, edit, or delete
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => setView("generate")}
        >
          <FaPlus className="me-2" />
          Generate New Blog
        </button>
      </div>

      {loadingBlogs ? (
        <div className="text-center py-5">
          <FaSpinner className="spinner-border text-primary" style={{ fontSize: "3rem" }} />
          <p className="text-muted mt-3">Loading blogs...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="card shadow-sm p-5 rounded-3 border-0 text-center">
          <FaNewspaper className="text-muted mb-3" style={{ fontSize: "4rem", opacity: 0.3 }} />
          <h3 className="h5 text-muted">No blogs found</h3>
          <p className="text-muted">Generate your first blog to get started</p>
        </div>
      ) : (
        <div className="row g-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0 hover-lift" style={{ transition: "transform 0.2s" }}>
                <img
                  src={blog.image || "https://via.placeholder.com/400x200"}
                  className="card-img-top"
                  alt={blog.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-primary">{blog.category}</span>
                    <span className={`badge ms-2 ${blog.published ? 'bg-success' : 'bg-secondary'}`}>
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <h5 className="card-title fw-bold">{blog.title}</h5>
                  <p className="card-text text-muted small flex-grow-1">
                    {blog.excerpt?.substring(0, 120)}...
                  </p>
                  <div className="small text-muted mb-3">
                    <span>📅 {blog.date}</span>
                    <span className="ms-3">👁️ {blog.views || 0} views</span>
                    <span className="ms-3">⏱️ {blog.readingTime || 0} min read</span>
                  </div>
                  <div className="d-flex gap-2">
                    <button
                      className="btn btn-sm btn-outline-primary flex-fill"
                      onClick={() => viewBlog(blog)}
                    >
                      <FaEye className="me-1" />
                      View
                    </button>
                    <button
                      className="btn btn-sm btn-outline-warning flex-fill"
                      onClick={() => startEdit(blog)}
                    >
                      <FaEdit className="me-1" />
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(blog.id)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // Render blog view
  const renderViewBlog = () => (
    <div className="container">
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => setView("list")}
        >
          <FaArrowLeft className="me-2" />
          Back to List
        </button>
        
        {selectedBlog && (
          <div className="card shadow-sm border-0">
            <img
              src={selectedBlog.image}
              className="card-img-top"
              alt={selectedBlog.title}
              style={{ maxHeight: "400px", objectFit: "cover" }}
            />
            <div className="card-body">
              <div className="mb-3">
                <span className="badge bg-primary">{selectedBlog.category}</span>
                <span className={`badge ms-2 ${selectedBlog.published ? 'bg-success' : 'bg-secondary'}`}>
                  {selectedBlog.published ? 'Published' : 'Draft'}
                </span>
              </div>
              
              <h1 className="h2 fw-bold mb-3">{selectedBlog.title}</h1>
              
              <div className="text-muted mb-4">
                <span>✍️ {selectedBlog.author}</span>
                <span className="ms-3">📅 {selectedBlog.date}</span>
                <span className="ms-3">⏱️ {selectedBlog.readingTime} min read</span>
                <span className="ms-3">👁️ {selectedBlog.views || 0} views</span>
              </div>

              <div className="blog-content mb-4" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />

              <hr />
              
              <div className="mt-4">
                <h5 className="fw-bold mb-3">SEO Information</h5>
                <p><strong>Slug:</strong> {selectedBlog.slug}</p>
                <p><strong>Meta Description:</strong> {selectedBlog.metaDescription}</p>
                <p><strong>Meta Keywords:</strong> {selectedBlog.metaKeywords?.join(", ")}</p>
                <p><strong>OG Title:</strong> {selectedBlog.ogTitle}</p>
                <p><strong>OG Description:</strong> {selectedBlog.ogDescription}</p>
              </div>

              <div className="mt-4 d-flex gap-2">
                <button
                  className="btn btn-warning"
                  onClick={() => startEdit(selectedBlog)}
                >
                  <FaEdit className="me-2" />
                  Edit Blog
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleDelete(selectedBlog.id);
                    setView("list");
                  }}
                >
                  <FaTrash className="me-2" />
                  Delete Blog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render edit view
  const renderEditView = () => (
    <div className="container">
      <div className="mb-4">
        <button
          className="btn btn-outline-secondary mb-3"
          onClick={() => setView("list")}
        >
          <FaArrowLeft className="me-2" />
          Back to List
        </button>
        
        <h1 className="h2 fw-bold text-dark mb-2">
          <FaEdit className="me-2" />
          Edit Blog
        </h1>
        <p className="text-muted">Update blog details and metadata</p>
      </div>

      {editFormData && (
        <form onSubmit={handleEditSubmit}>
          <div className="row g-4">
            {/* Basic Information Card */}
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-4">Basic Information</h5>
                
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      value={editFormData.title}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Author</label>
                    <input
                      type="text"
                      className="form-control"
                      name="author"
                      value={editFormData.author}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select
                      className="form-select"
                      name="category"
                      value={editFormData.category}
                      onChange={handleEditChange}
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Slug</label>
                    <input
                      type="text"
                      className="form-control"
                      name="slug"
                      value={editFormData.slug}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Reading Time (minutes)</label>
                    <input
                      type="number"
                      className="form-control"
                      name="readingTime"
                      value={editFormData.readingTime}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input
                      type="text"
                      className="form-control"
                      name="date"
                      value={editFormData.date}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Excerpt</label>
                    <textarea
                      className="form-control"
                      name="excerpt"
                      value={editFormData.excerpt}
                      onChange={handleEditChange}
                      rows="3"
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Featured Image</label>
                    <ImageUpload
                      currentImage={editFormData.image}
                      onUpload={(url) => {
                        setEditFormData({
                          ...editFormData,
                          image: url,
                        });
                      }}
                      label="Upload Featured Image"
                    />
                  </div>

                  <div className="col-md-12">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        name="published"
                        checked={editFormData.published}
                        onChange={handleEditChange}
                        id="publishedCheck"
                      />
                      <label className="form-check-label" htmlFor="publishedCheck">
                        Published
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Card */}
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-4">Content</h5>
                <textarea
                  className="form-control"
                  name="content"
                  value={editFormData.content}
                  onChange={handleEditChange}
                  rows="15"
                  required
                  style={{ fontFamily: "monospace", fontSize: "0.9rem" }}
                />
                <small className="text-muted mt-2">HTML content for the blog post</small>

                {/* Content Images Management */}
                <div className="mt-4 border-top pt-4">
                  <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <FaImages className="me-2 text-primary" />
                    Manage Content Images
                  </h6>
                  <div className="alert alert-info small">
                    Below are images detected in your blog content. Upload a new image to replace them instantly.
                  </div>
                  
                  <div className="row g-3">
                    {(() => {
                      // Extract images from content
                      const parser = new DOMParser();
                      const doc = parser.parseFromString(editFormData.content, "text/html");
                      const images = Array.from(doc.querySelectorAll("img"));

                      if (images.length === 0) {
                        return <div className="col-12 text-muted fst-italic">No images found in content.</div>;
                      }

                      return images.map((img, idx) => {
                        const src = img.getAttribute("src");
                        if (!src) return null;

                        return (
                          <div key={idx} className="col-md-6 col-lg-4">
                            <div className="card h-100 border bg-light">
                              <div className="card-body">
                                <div className="mb-2 text-truncate small text-muted" title={src}>
                                  Current: {src.substring(0, 30)}...
                                </div>
                                <ImageUpload
                                  currentImage={src}
                                  onUpload={(newUrl) => {
                                    // Replace the specific image source in the content
                                    // We use a safe replacement strategy
                                    const currentContent = editFormData.content;
                                    // Replace only the first occurrence of this specific src to avoid replacing duplicates incorrectly if any
                                    // However, simpler is global replace if the src is unique enough.
                                    // Better: Regex replace.
                                    const newContent = currentContent.replace(src, newUrl);
                                    setEditFormData({
                                      ...editFormData,
                                      content: newContent
                                    });
                                    toast.success("Content image updated!");
                                  }}
                                  label={`Replace Image ${idx + 1}`}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* SEO Metadata Card */}
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-4">SEO Metadata</h5>
                
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Meta Description</label>
                    <textarea
                      className="form-control"
                      name="metaDescription"
                      value={editFormData.metaDescription}
                      onChange={handleEditChange}
                      rows="2"
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Meta Keywords</label>
                    {editFormData.metaKeywords.map((keyword, index) => (
                      <div key={index} className="input-group mb-2">
                        <input
                          type="text"
                          className="form-control"
                          name={`metaKeywords-${index}`}
                          value={keyword}
                          onChange={handleEditChange}
                          placeholder="Keyword"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => removeKeywordField(index)}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-primary"
                      onClick={addKeywordField}
                    >
                      <FaPlus className="me-1" />
                      Add Keyword
                    </button>
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ogTitle"
                      value={editFormData.ogTitle}
                      onChange={handleEditChange}
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Description</label>
                    <textarea
                      className="form-control"
                      name="ogDescription"
                      value={editFormData.ogDescription}
                      onChange={handleEditChange}
                      rows="2"
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      name="ogImage"
                      value={editFormData.ogImage}
                      onChange={handleEditChange}
                      required
                    />
                    {editFormData.ogImage && (
                      <img
                        src={editFormData.ogImage}
                        alt="OG Preview"
                        className="mt-2 rounded"
                        style={{ maxWidth: "300px", height: "auto" }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-lg">
                  <FaCheckCircle className="me-2" />
                  Save Changes
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => setView("list")}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  return (
    <div className="min-vh-100 bg-light p-4 p-md-5">
      {view === "generate" && renderGenerateView()}
      {view === "list" && renderListView()}
      {view === "edit" && renderEditView()}
      {view === "view" && renderViewBlog()}
    </div>
  );
}

export default BlogGeneration;
