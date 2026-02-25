import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
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
  FaPen,
  FaRobot,
  FaImage,
  FaSearch,
} from "react-icons/fa";
import ImageUpload from "./ImageUpload";
import { db } from "../Firebase";
import { uploadImage } from "../utils/imageKit";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  orderBy,
} from "firebase/firestore";

// ─── Quill toolbar configuration ──────────────────────────────────────────────
const quillModules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["blockquote", "link"],
      [{ align: [] }],
      ["clean"],
    ],
  },
};

const quillFormats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "list",
  "bullet",
  "blockquote",
  "link",
  "image",
  "align",
];

// ─── Helper ────────────────────────────────────────────────────────────────────
const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");

const todayStr = () => {
  const d = new Date();
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Default empty manual form
const emptyManualData = () => ({
  title: "",
  author: "",
  category: "",
  slug: "",
  date: todayStr(),
  readingTime: 5,
  excerpt: "",
  image: "",
  content: "",
  metaDescription: "",
  metaKeywords: [""],
  ogTitle: "",
  ogDescription: "",
  ogImage: "",
  published: false,
});

// ══════════════════════════════════════════════════════════════════════════════
function BlogGeneration() {
  const [view, setView] = useState("generate"); // 'generate','manual','list','edit','view'
  const [formData, setFormData] = useState({ topic: "", keywords: "", category: "" });

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

  // Manual mode state
  const [manualData, setManualData] = useState(emptyManualData());
  const [savingManual, setSavingManual] = useState(false);
  const [insertingImage, setInsertingImage] = useState(false);
  const quillRef = useRef(null);
  const contentImageInputRef = useRef(null);

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

  // ── Load blogs when switching to list ──────────────────────────────────────
  useEffect(() => {
    if (view === "list") loadBlogs();
  }, [view]);

  // ── Generation progress simulator ─────────────────────────────────────────
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
      let i = 0;
      const interval = setInterval(() => {
        if (i < stages.length) {
          setGenerationProgress(stages[i].percent);
          setGenerationStage(stages[i].text);
          i++;
        }
      }, 2000);
      return () => clearInterval(interval);
    } else {
      setGenerationProgress(0);
      setGenerationStage("");
    }
  }, [loading]);

  // ── Auto-slug from title ───────────────────────────────────────────────────
  useEffect(() => {
    if (manualData.title && !manualData._slugEdited) {
      setManualData((prev) => ({ ...prev, slug: slugify(prev.title) }));
    }
  }, [manualData.title, manualData._slugEdited]);

  // ─────────────────────────────────────────────────────────────────────────
  const loadBlogs = async () => {
    setLoadingBlogs(true);
    try {
      const blogsRef = collection(db, "blogs");
      const q = query(blogsRef, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setBlogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load blogs");
    } finally {
      setLoadingBlogs(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("metaKeywords")) {
      const idx = parseInt(name.split("-")[1]);
      const kw = [...editFormData.metaKeywords];
      kw[idx] = value;
      setEditFormData({ ...editFormData, metaKeywords: kw });
    } else {
      setEditFormData({
        ...editFormData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  // ── Manual form handlers ───────────────────────────────────────────────────
  const handleManualChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "slug") {
      setManualData((p) => ({ ...p, slug: value, _slugEdited: true }));
    } else if (name.startsWith("manualKw")) {
      const idx = parseInt(name.split("-")[1]);
      const kw = [...manualData.metaKeywords];
      kw[idx] = value;
      setManualData((p) => ({ ...p, metaKeywords: kw }));
    } else {
      setManualData((p) => ({
        ...p,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const addManualKeyword = () =>
    setManualData((p) => ({ ...p, metaKeywords: [...p.metaKeywords, ""] }));

  const removeManualKeyword = (idx) =>
    setManualData((p) => ({
      ...p,
      metaKeywords: p.metaKeywords.filter((_, i) => i !== idx),
    }));

  // ── Insert image into Quill at cursor ─────────────────────────────────────
  const handleContentImageInsert = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const result = await uploadImage(file);
      const url = result.url;
      const editor = quillRef.current?.getEditor();
      if (editor) {
        const range = editor.getSelection(true);
        editor.insertEmbed(range ? range.index : 0, "image", url);
        editor.setSelection((range ? range.index : 0) + 1);
      }
      setManualData((p) => ({ ...p, content: quillRef.current?.getEditor().root.innerHTML || p.content }));
      toast.success("Image inserted into content!");
    } catch (err) {
      toast.error("Failed to upload image");
    } finally {
      setInsertingImage(false);
      e.target.value = "";
    }
  };

  // ── Save manual blog to Firestore ─────────────────────────────────────────
  const handleManualSave = async (e) => {
    e.preventDefault();
    if (!manualData.title.trim()) { toast.error("Title is required"); return; }
    if (!manualData.category) { toast.error("Please select a category"); return; }
    if (!manualData.content || manualData.content === "<p><br></p>") {
      toast.error("Content cannot be empty");
      return;
    }

    setSavingManual(true);
    try {
      const { _slugEdited, ...payload } = manualData;
      await addDoc(collection(db, "blogs"), {
        ...payload,
        slug: manualData.slug || slugify(manualData.title),
        createdAt: new Date(),
        views: 0,
      });
      toast.success("Blog saved successfully! 🎉");
      setManualData(emptyManualData());
      setView("list");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save blog");
    } finally {
      setSavingManual(false);
    }
  };

  // ── AI Generate ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.topic.trim() || !formData.keywords.trim() || !formData.category) {
      toast.error("Please fill in all fields");
      return;
    }
    setLoading(true);
    setGeneratedBlog(null);
    setGenerationProgress(0);
    const dataToSubmit = { ...formData };
    try {
      const response = await fetch("http://api.interiorji.com:5000/api/blogs/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
          setFormData({ topic: "", keywords: "", category: "" });
        }, 500);
      } else {
        toast.error(data.message || "Failed to generate blog");
      }
    } catch (err) {
      toast.error("Failed to connect to the server. Please ensure the backend is running.");
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (blogId) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;
    try {
      await deleteDoc(doc(db, "blogs", blogId));
      toast.success("Blog deleted successfully");
      loadBlogs();
    } catch (err) {
      toast.error("Failed to delete blog");
    }
  };

  // ── Edit Save ─────────────────────────────────────────────────────────────
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, "blogs", selectedBlog.id), {
        ...editFormData,
        updatedAt: new Date(),
      });
      toast.success("Blog updated successfully");
      setView("list");
      loadBlogs();
    } catch (err) {
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

  const viewBlog = (blog) => { setSelectedBlog(blog); setView("view"); };
  const addKeywordField = () =>
    setEditFormData({ ...editFormData, metaKeywords: [...editFormData.metaKeywords, ""] });
  const removeKeywordField = (i) =>
    setEditFormData({ ...editFormData, metaKeywords: editFormData.metaKeywords.filter((_, j) => j !== i) });

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Generate View
  // ══════════════════════════════════════════════════════════════════════════
  const renderGenerateView = () => (
    <div className="container">
      {/* Header */}
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 className="h1 fw-bold text-dark mb-2">📝 Blog Generation</h1>
          <p className="text-muted">
            Generate blogs with AI or write manually with full formatting control
          </p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={() => { setManualData(emptyManualData()); setView("manual"); }}>
            <FaPen className="me-2" />
            Write Manually
          </button>
          <button className="btn btn-outline-primary" onClick={() => setView("list")}>
            <FaList className="me-2" />
            View All Blogs
          </button>
        </div>
      </div>

      <div className="row g-4">
        {/* Form Section */}
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm p-4 rounded-3 border-0">
            <div className="d-flex align-items-center mb-4">
              <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                <FaRobot className="text-primary" style={{ fontSize: "1.2rem" }} />
              </div>
              <h3 className="h5 fw-semibold text-dark mb-0">AI-Generate Blog</h3>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaNewspaper className="me-2 text-primary" />Topic
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
                <small className="text-muted">Main topic or title for your blog post</small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaKeyboard className="me-2 text-primary" />Keywords
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
                <small className="text-muted">Relevant keywords (comma-separated)</small>
              </div>

              <div className="mb-4">
                <label className="form-label fw-bold d-flex align-items-center">
                  <FaTag className="me-2 text-primary" />Category
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
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <><FaSpinner className="spinner-border spinner-border-sm" /><span>Generating Blog...</span></>
                ) : (
                  <><FaRobot /><span>Generate Blog with AI</span></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Preview/Progress Section */}
        <div className="col-12 col-lg-6">
          {loading ? (
            <div className="card shadow-sm p-4 rounded-3 border-0">
              <div className="text-center">
                <div className="mb-4">
                  <FaSpinner className="text-primary spinner-border" style={{ fontSize: "3rem" }} />
                </div>
                <h3 className="h5 fw-semibold mb-3">Generating Your Blog</h3>
                <p className="text-muted mb-4">{generationStage}</p>
                <div className="progress mb-3" style={{ height: "30px" }}>
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
                <h3 className="h5 fw-semibold text-success mb-0">Blog Generated Successfully!</h3>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="mb-2"><strong>Topic:</strong> {submittedData?.topic || "N/A"}</p>
                <p className="mb-2"><strong>Keywords:</strong> {submittedData?.keywords || "N/A"}</p>
                <p className="mb-2"><strong>Category:</strong> {submittedData?.category || "N/A"}</p>
                <p className="mb-0 text-muted small">Your blog has been generated and saved to the database.</p>
              </div>
            </div>
          ) : (
            <div className="card shadow-sm p-4 rounded-3 border-0 bg-light h-100">
              {/* Manual Mode Info */}
              <div className="text-center py-3 mb-4 border-bottom">
                <FaPen className="text-success mb-3" style={{ fontSize: "3rem", opacity: 0.6 }} />
                <h5 className="fw-semibold text-dark">Write Manually</h5>
                <p className="text-muted small mb-3">
                  Full control over content, formatting, and images
                </p>
                <button
                  className="btn btn-success"
                  onClick={() => { setManualData(emptyManualData()); setView("manual"); }}
                >
                  <FaPen className="me-2" />
                  Start Writing
                </button>
              </div>
              <div className="text-center py-2">
                <FaNewspaper className="text-muted mb-3" style={{ fontSize: "2.5rem", opacity: 0.3 }} />
                <p className="text-muted small">
                  Or fill the form on the left and click "Generate Blog with AI"
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="row mt-5">
        <div className="col-12">
          <div className="card shadow-sm p-4 rounded-3 border-0">
            <h3 className="h6 fw-semibold text-dark mb-3">ℹ️ How it works</h3>
            <ul className="mb-0 text-muted">
              <li className="mb-2"><strong>AI Mode:</strong> Enter a topic, keywords, and category — the AI writes a full SEO-optimized post</li>
              <li className="mb-2"><strong>Manual Mode:</strong> Write with a rich text editor, add formatting, insert images anywhere in content</li>
              <li>Both modes save to the same blog database and appear on your website</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Manual Blog Writing View
  // ══════════════════════════════════════════════════════════════════════════
  const renderManualBlogView = () => (
    <div className="container">
      {/* Header */}
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <button className="btn btn-outline-secondary btn-sm mb-2" onClick={() => setView("generate")}>
            <FaArrowLeft className="me-2" />Back
          </button>
          <h1 className="h2 fw-bold text-dark mb-1">
            <FaPen className="me-2 text-success" />
            Write Blog Manually
          </h1>
          <p className="text-muted">Create a fully formatted blog post with images and SEO</p>
        </div>
        <button className="btn btn-outline-primary" onClick={() => setView("list")}>
          <FaList className="me-2" />View All Blogs
        </button>
      </div>

      <form onSubmit={handleManualSave}>
        <div className="row g-4">

          {/* ── CARD 1: Basic Info ─────────────────────────────────────────── */}
          <div className="col-12">
            <div className="card shadow-sm border-0 p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <span className="badge bg-primary me-2">1</span>Basic Information
              </h5>
              <div className="row g-3">

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Title <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    name="title"
                    value={manualData.title}
                    onChange={handleManualChange}
                    placeholder="e.g., 10 Stunning Bedroom Design Ideas for 2025"
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Author</label>
                  <input
                    type="text"
                    className="form-control"
                    name="author"
                    value={manualData.author}
                    onChange={handleManualChange}
                    placeholder="e.g., Interiorji Team"
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Category <span className="text-danger">*</span>
                  </label>
                  <select
                    className="form-select"
                    name="category"
                    value={manualData.category}
                    onChange={handleManualChange}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Slug (URL)
                    <small className="text-muted fw-normal ms-1">(auto-generated)</small>
                  </label>
                  <div className="input-group">
                    <span className="input-group-text text-muted small">/blog/</span>
                    <input
                      type="text"
                      className="form-control"
                      name="slug"
                      value={manualData.slug}
                      onChange={handleManualChange}
                      placeholder="my-blog-post-slug"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Date</label>
                  <input
                    type="text"
                    className="form-control"
                    name="date"
                    value={manualData.date}
                    onChange={handleManualChange}
                    placeholder="February 25, 2025"
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Reading Time (min)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="readingTime"
                    value={manualData.readingTime}
                    onChange={handleManualChange}
                    min="1"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Excerpt / Summary</label>
                  <textarea
                    className="form-control"
                    name="excerpt"
                    value={manualData.excerpt}
                    onChange={handleManualChange}
                    rows="3"
                    placeholder="A brief description of the blog post that appears in listings..."
                  />
                </div>

                <div className="col-12">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      name="published"
                      id="manualPublished"
                      checked={manualData.published}
                      onChange={handleManualChange}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="manualPublished">
                      Publish immediately (visible on website)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── CARD 2: Main / Featured Image ─────────────────────────────── */}
          <div className="col-12">
            <div className="card shadow-sm border-0 p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <span className="badge bg-primary me-2">2</span>
                <FaImage className="me-2 text-primary" />
                Main / Featured Image
              </h5>
              <ImageUpload
                currentImage={manualData.image}
                onUpload={(url) => setManualData((p) => ({ ...p, image: url }))}
                label="Upload Featured Image"
              />
              {manualData.image && (
                <div className="mt-3">
                  <img
                    src={manualData.image}
                    alt="Featured"
                    className="img-fluid rounded shadow-sm"
                    style={{ maxHeight: "300px", objectFit: "cover", width: "100%" }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ── CARD 3: Content (Rich Text) ───────────────────────────────── */}
          <div className="col-12">
            <div className="card shadow-sm border-0 p-4">
              <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
                <h5 className="fw-bold mb-0 d-flex align-items-center">
                  <span className="badge bg-primary me-2">3</span>Blog Content
                </h5>

                {/* Insert image into content button */}
                <div>
                  <label
                    className={`btn btn-outline-success btn-sm ${insertingImage ? "disabled" : ""}`}
                    title="Upload an image and insert it at the cursor position in the editor"
                  >
                    {insertingImage ? (
                      <><FaSpinner className="spinner-border spinner-border-sm me-2" />Uploading...</>
                    ) : (
                      <><FaImages className="me-2" />Insert Image into Content</>
                    )}
                    <input
                      ref={contentImageInputRef}
                      type="file"
                      className="d-none"
                      accept="image/*"
                      onChange={handleContentImageInsert}
                      disabled={insertingImage}
                    />
                  </label>
                  <small className="text-muted d-block mt-1" style={{ fontSize: "0.7rem" }}>
                    Places image at cursor position
                  </small>
                </div>
              </div>

              {/* Formatting guide */}
              <div className="alert alert-info py-2 px-3 small mb-3">
                <strong>Formatting:</strong> Use the toolbar for{" "}
                <strong>Bold</strong>, <em>Italic</em>, Headings (H1-H3), Bullet lists, Ordered lists, Blockquotes, and Links.
                Click <strong>Insert Image into Content</strong> to add images anywhere in the body.
              </div>

              <div style={{ minHeight: "400px" }}>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={manualData.content}
                  onChange={(val) => setManualData((p) => ({ ...p, content: val }))}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="Start writing your amazing blog post here..."
                  style={{ height: "380px", marginBottom: "44px" }}
                />
              </div>
            </div>
          </div>

          {/* ── CARD 4: SEO ───────────────────────────────────────────────── */}
          <div className="col-12">
            <div className="card shadow-sm border-0 p-4">
              <h5 className="fw-bold mb-4 d-flex align-items-center">
                <span className="badge bg-primary me-2">4</span>
                <FaSearch className="me-2 text-primary" />
                SEO & Social Sharing
              </h5>

              <div className="row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Meta Description
                    <small className="text-muted fw-normal ms-1">(recommended: 150-160 chars)</small>
                  </label>
                  <textarea
                    className="form-control"
                    name="metaDescription"
                    value={manualData.metaDescription}
                    onChange={handleManualChange}
                    rows="2"
                    placeholder="Brief description for search engine results..."
                    maxLength={160}
                  />
                  <small className="text-muted">
                    {manualData.metaDescription.length}/160 characters
                  </small>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Meta Keywords</label>
                  {manualData.metaKeywords.map((kw, idx) => (
                    <div key={idx} className="input-group mb-2">
                      <input
                        type="text"
                        className="form-control"
                        name={`manualKw-${idx}`}
                        value={kw}
                        onChange={handleManualChange}
                        placeholder={`Keyword ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-danger"
                        onClick={() => removeManualKeyword(idx)}
                        disabled={manualData.metaKeywords.length === 1}
                      >
                        <FaTimes />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={addManualKeyword}
                  >
                    <FaPlus className="me-1" />Add Keyword
                  </button>
                </div>

                <div className="col-12">
                  <hr className="my-2" />
                  <p className="fw-semibold text-muted small mb-3">
                    Open Graph (Social Sharing Preview)
                  </p>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">OG Title</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ogTitle"
                    value={manualData.ogTitle}
                    onChange={handleManualChange}
                    placeholder="Title for Facebook / Twitter cards (defaults to blog title)"
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">OG Description</label>
                  <textarea
                    className="form-control"
                    name="ogDescription"
                    value={manualData.ogDescription}
                    onChange={handleManualChange}
                    rows="2"
                    placeholder="Description for social sharing cards..."
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">OG Image</label>
                  <ImageUpload
                    currentImage={manualData.ogImage}
                    onUpload={(url) => setManualData((p) => ({ ...p, ogImage: url }))}
                    label="Upload OG / Social Share Image"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Save Buttons ─────────────────────────────────────────────── */}
          <div className="col-12">
            <div className="card shadow-sm border-0 p-4 bg-light">
              <div className="d-flex flex-wrap gap-3 align-items-center">
                <button
                  type="submit"
                  className="btn btn-success btn-lg d-flex align-items-center gap-2"
                  disabled={savingManual}
                >
                  {savingManual ? (
                    <><FaSpinner className="spinner-border spinner-border-sm" />Saving...</>
                  ) : (
                    <><FaCheckCircle />Save Blog</>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-lg"
                  onClick={() => setView("generate")}
                  disabled={savingManual}
                >
                  Cancel
                </button>
                <div className="ms-auto">
                  <span className="badge bg-secondary">
                    {manualData.published ? "📢 Will be Published" : "📝 Saving as Draft"}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </form>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Blog List View
  // ══════════════════════════════════════════════════════════════════════════
  const renderListView = () => (
    <div className="container">
      <div className="mb-4 d-flex flex-wrap justify-content-between align-items-center gap-2">
        <div>
          <h1 className="h1 fw-bold text-dark mb-2">📚 All Blogs</h1>
          <p className="text-muted">Manage your blog posts — view, edit, or delete</p>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={() => { setManualData(emptyManualData()); setView("manual"); }}>
            <FaPen className="me-2" />Write Manually
          </button>
          <button className="btn btn-primary" onClick={() => setView("generate")}>
            <FaRobot className="me-2" />AI Generate
          </button>
        </div>
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
          <p className="text-muted">Generate your first blog or write one manually to get started</p>
        </div>
      ) : (
        <div className="row g-4">
          {blogs.map((blog) => (
            <div key={blog.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0" style={{ transition: "transform 0.2s" }}>
                <img
                  src={blog.image || "https://via.placeholder.com/400x200"}
                  className="card-img-top"
                  alt={blog.title}
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <div className="mb-2">
                    <span className="badge bg-primary">{blog.category}</span>
                    <span className={`badge ms-2 ${blog.published ? "bg-success" : "bg-secondary"}`}>
                      {blog.published ? "Published" : "Draft"}
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
                    <button className="btn btn-sm btn-outline-primary flex-fill" onClick={() => viewBlog(blog)}>
                      <FaEye className="me-1" />View
                    </button>
                    <button className="btn btn-sm btn-outline-warning flex-fill" onClick={() => startEdit(blog)}>
                      <FaEdit className="me-1" />Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(blog.id)}>
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: View Single Blog
  // ══════════════════════════════════════════════════════════════════════════
  const renderViewBlog = () => (
    <div className="container">
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => setView("list")}>
          <FaArrowLeft className="me-2" />Back to List
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
                <span className={`badge ms-2 ${selectedBlog.published ? "bg-success" : "bg-secondary"}`}>
                  {selectedBlog.published ? "Published" : "Draft"}
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
                <button className="btn btn-warning" onClick={() => startEdit(selectedBlog)}>
                  <FaEdit className="me-2" />Edit Blog
                </button>
                <button className="btn btn-danger" onClick={() => { handleDelete(selectedBlog.id); setView("list"); }}>
                  <FaTrash className="me-2" />Delete Blog
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Edit Blog View
  // ══════════════════════════════════════════════════════════════════════════
  const renderEditView = () => (
    <div className="container">
      <div className="mb-4">
        <button className="btn btn-outline-secondary mb-3" onClick={() => setView("list")}>
          <FaArrowLeft className="me-2" />Back to List
        </button>
        <h1 className="h2 fw-bold text-dark mb-2">
          <FaEdit className="me-2" />Edit Blog
        </h1>
        <p className="text-muted">Update blog details and metadata</p>
      </div>

      {editFormData && (
        <form onSubmit={handleEditSubmit}>
          <div className="row g-4">
            {/* Basic Info */}
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-4">Basic Information</h5>
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Title</label>
                    <input type="text" className="form-control" name="title" value={editFormData.title} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Author</label>
                    <input type="text" className="form-control" name="author" value={editFormData.author} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select" name="category" value={editFormData.category} onChange={handleEditChange} required>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Slug</label>
                    <input type="text" className="form-control" name="slug" value={editFormData.slug} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Reading Time (min)</label>
                    <input type="number" className="form-control" name="readingTime" value={editFormData.readingTime} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input type="text" className="form-control" name="date" value={editFormData.date} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Excerpt</label>
                    <textarea className="form-control" name="excerpt" value={editFormData.excerpt} onChange={handleEditChange} rows="3" required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Featured Image</label>
                    <ImageUpload
                      currentImage={editFormData.image}
                      onUpload={(url) => setEditFormData({ ...editFormData, image: url })}
                      label="Upload Featured Image"
                    />
                  </div>
                  <div className="col-md-12">
                    <div className="form-check">
                      <input type="checkbox" className="form-check-input" name="published" checked={editFormData.published} onChange={handleEditChange} id="publishedCheck" />
                      <label className="form-check-label" htmlFor="publishedCheck">Published</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
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
                    <FaImages className="me-2 text-primary" />Manage Content Images
                  </h6>
                  <div className="alert alert-info small">
                    Below are images detected in your blog content. Upload a new image to replace them instantly.
                  </div>
                  <div className="row g-3">
                    {(() => {
                      const parser = new DOMParser();
                      const parsed = parser.parseFromString(editFormData.content, "text/html");
                      const images = Array.from(parsed.querySelectorAll("img"));
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
                                    const newContent = editFormData.content.replace(src, newUrl);
                                    setEditFormData({ ...editFormData, content: newContent });
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

            {/* SEO */}
            <div className="col-12">
              <div className="card shadow-sm border-0 p-4">
                <h5 className="fw-bold mb-4">SEO Metadata</h5>
                <div className="row g-3">
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Meta Description</label>
                    <textarea className="form-control" name="metaDescription" value={editFormData.metaDescription} onChange={handleEditChange} rows="2" required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Meta Keywords</label>
                    {editFormData.metaKeywords.map((keyword, index) => (
                      <div key={index} className="input-group mb-2">
                        <input type="text" className="form-control" name={`metaKeywords-${index}`} value={keyword} onChange={handleEditChange} placeholder="Keyword" />
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeKeywordField(index)}><FaTimes /></button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addKeywordField}>
                      <FaPlus className="me-1" />Add Keyword
                    </button>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Title</label>
                    <input type="text" className="form-control" name="ogTitle" value={editFormData.ogTitle} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Description</label>
                    <textarea className="form-control" name="ogDescription" value={editFormData.ogDescription} onChange={handleEditChange} rows="2" required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Image URL</label>
                    <input type="url" className="form-control" name="ogImage" value={editFormData.ogImage} onChange={handleEditChange} required />
                    {editFormData.ogImage && (
                      <img src={editFormData.ogImage} alt="OG Preview" className="mt-2 rounded" style={{ maxWidth: "300px", height: "auto" }} />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="col-12">
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary btn-lg">
                  <FaCheckCircle className="me-2" />Save Changes
                </button>
                <button type="button" className="btn btn-outline-secondary btn-lg" onClick={() => setView("list")}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-vh-100 bg-light p-4 p-md-5">
      {view === "generate" && renderGenerateView()}
      {view === "manual"   && renderManualBlogView()}
      {view === "list"     && renderListView()}
      {view === "edit"     && renderEditView()}
      {view === "view"     && renderViewBlog()}
    </div>
  );
}

export default BlogGeneration;
