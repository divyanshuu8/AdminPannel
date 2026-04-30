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
  FaLink,
  FaRegSave,
  FaExternalLinkAlt,
  FaBars,
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
  imageAlt: "",
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
  const [view, setView] = useState("generate"); // 'generate','manual','list','edit','view','landingPage'
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
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const quillRef = useRef(null);
  const contentImageInputRef = useRef(null);
  const htmlEditorRef = useRef(null);

  // Landing Page state
  const [landingHtml, setLandingHtml] = useState("");
  const [landingSlug, setLandingSlug] = useState("");
  const [landingPreviewKey, setLandingPreviewKey] = useState(0);
  const [savingLanding, setSavingLanding] = useState(false);

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

  // ── Insert image into Quill or HTML at cursor (with description/alt) ─────────────
  const handleContentImageInsert = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setInsertingImage(true);
    try {
      const result = await uploadImage(file);
      const url = result.url;
      // Ask for image description / alt text
      const description = window.prompt(
        "Enter a description for this image (used as alt text for SEO & accessibility):",
        file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ")
      );
      const alt = (description || "").trim();
      const imgTag = `<img src="${url}" alt="${alt}" style="max-width:100%;height:auto;display:block;margin:12px 0;" />`;

      if (isHtmlMode) {
        // For HTML textarea, append or insert at cursor if possible
        const textarea = htmlEditorRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const content = manualData.content;
          const newContent = content.substring(0, start) + imgTag + content.substring(end);
          setManualData((p) => ({ ...p, content: newContent }));
        } else {
          setManualData((p) => ({ ...p, content: p.content + imgTag }));
        }
      } else {
        const editor = quillRef.current?.getEditor();
        if (editor) {
          const range = editor.getSelection(true);
          const idx = range ? range.index : 0;
          // Insert as HTML so we can include alt text
          editor.clipboard.dangerouslyPasteHTML(idx, imgTag);
          editor.setSelection(idx + 1);
        }
        setManualData((p) => ({ ...p, content: quillRef.current?.getEditor().root.innerHTML || p.content }));
      }
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
                <input
                  type="text"
                  className="form-control form-control-lg"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g., Bedroom Design Ideas"
                  disabled={loading}
                />
                <small className="text-muted">Type any category for this blog post</small>
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

  // Local state for sidebar
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [focusKeyword, setFocusKeyword] = useState("");
  const [sidebarAiTopic, setSidebarAiTopic] = useState("");

  const analyzeSEO = () => {
    const textContent = (manualData.content || "").replace(/<[^>]*>?/gm, " ");
    const words = textContent.trim().split(/\s+/).filter(w => w.length > 0).length;
    const h1Count = (manualData.content.match(/<h1[^>]*>/g) || []).length;
    const h2Count = (manualData.content.match(/<h2[^>]*>/g) || []).length;
    const linksMatch = manualData.content.match(/href="([^"]*)"/g) || [];
    let internalLinksCount = 0;
    const parsedLinks = [];
    linksMatch.forEach(l => {
      const href = l.replace('href="', '').replace('"', '');
      const isInternal = href.startsWith('/') || href.includes('interiorji.com');
      if (isInternal) internalLinksCount++;
      parsedLinks.push({ href: href, isInternal });
    });
    
    let score = 0;
    if (manualData.title.length >= 30 && manualData.title.length <= 60) score += 20;
    if (manualData.metaDescription.length >= 100 && manualData.metaDescription.length <= 160) score += 20;
    if (h1Count > 0) score += 20;
    if (h2Count > 0) score += 10;
    if (internalLinksCount > 0) score += 10;
    if (words > 300) score += 20;
    
    return { words, h1Count, h2Count, internalLinksCount, score, parsedLinks };
  };

  const seoData = analyzeSEO();

  const handleClearHTML = () => setManualData(p => ({ ...p, content: "" }));
  
  useEffect(() => {
    if (isHtmlMode && !manualData.content) {
      setManualData(p => ({...p, content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Untitled</title>
  <style>
    body{font-family:'DM Sans',sans-serif;max-width:820px;margin:0 auto;padding:40px 24px;background:#fff;color:#1a1a2e;line-height:1.8;}
    h1{font-family:'DM Serif Display',serif;font-size:2.2rem;font-weight:400;margin:0 0 20px;color:#0e0f1e;}
    h2{font-family:'DM Serif Display',serif;font-size:1.5rem;font-weight:400;margin:32px 0 12px;color:#0e0f1e;}
    h3{font-size:1.1rem;font-weight:600;margin:24px 0 10px;}
    p{margin-bottom:14px;color:#2c2e3e;}
    a{color:#c8a96e;text-decoration:underline;}
    img{max-width:100%;border-radius:8px;margin:16px 0;}
    blockquote{border-left:3px solid #c8a96e;padding:12px 20px;background:#faf5ec;border-radius:0 8px 8px 0;margin:20px 0;font-style:italic;}
  </style>
</head>
<body>
  <h1>Welcome</h1>
</body>
</html>`}));
    }
  }, [isHtmlMode, manualData.content]);

  // Styles specific for dark Content Studio
  const studioStyles = {
    bg: "transparent",
    panelBg: "rgba(30, 41, 59, 0.4)",
    border: "rgba(255, 255, 255, 0.1)",
    textPrimary: "#f8fafc",
    textSecondary: "#94a3b8",
    accent: "#3b82f6", // Blue primary
  };

  const renderManualBlogView = () => (
    <div className="w-100 m-0 p-0" style={{ backgroundColor: studioStyles.bg, color: studioStyles.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      {/* Top Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: `1px solid ${studioStyles.border}`, backgroundColor: "rgba(15,23,42,0.8)", backdropFilter: "blur(12px)" }}>
        <div className="d-flex align-items-center gap-4">
          <h2 className="m-0 fs-4 fw-bold" style={{ color: "#fff" }}>
            <span style={{ color: studioStyles.accent }}>Interiorji</span> Content Studio
          </h2>
          <div className="btn-group" role="group">
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: !isHtmlMode ? "rgba(59,130,246,0.2)" : "transparent",
                color: !isHtmlMode ? "#3b82f6" : studioStyles.textSecondary,
                border: `1px solid ${studioStyles.border}`,
                borderRadius: "6px 0 0 6px"
              }}
              onClick={() => setIsHtmlMode(false)}
            >
              <FaPen className="me-2" /> Editor Mode
            </button>
            <button
              type="button"
              className="btn btn-sm"
              style={{
                backgroundColor: isHtmlMode ? "rgba(59,130,246,0.2)" : "transparent",
                color: isHtmlMode ? "#3b82f6" : studioStyles.textSecondary,
                border: `1px solid ${studioStyles.border}`,
                borderRadius: "0 6px 6px 0"
              }}
              onClick={() => setIsHtmlMode(true)}
            >
              &lt;/&gt; HTML Mode
            </button>
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm"
            style={{ color: "#f59e0b", backgroundColor: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px", fontWeight: "600", fontSize: "0.78rem", padding: "4px 12px" }}
            onClick={() => setView("landingPage")}
            title="Open Landing Page Editor"
          >
            🚀 Landing Page
          </button>
          <button className="btn btn-sm" style={{ color: studioStyles.textSecondary, backgroundColor: "transparent", border: "none" }} onClick={() => setView("list")}>
            Cancel
          </button>
          <button className="btn btn-sm glass-input" onClick={(e) => { setManualData(p => ({...p, published: false})); handleManualSave(e); }}>
            <FaRegSave className="me-2" /> Save Draft
          </button>
          <button type="button" className="btn btn-sm glass-input" onClick={() => { setSelectedBlog(manualData); setView("view"); }}>
            <FaEye className="me-2" /> Preview
          </button>
          <button className="btn btn-sm premium-gradient-btn fw-bold px-3 py-1" onClick={(e) => { setManualData(p => ({...p, published: true})); handleManualSave(e); }}>
            <FaExternalLinkAlt className="me-2" /> Publish
          </button>
        </div>
      </div>

      <div className="container-fluid p-4">
        <form onSubmit={handleManualSave}>
          <div className="row g-4">
            
            {/* Left Column - Main Editor */}
            <div className="col-12 col-xl-8">
              <div className="d-flex flex-column gap-3">
                
                {/* Inputs area */}
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex align-items-center">
                    <div style={{ width: "100px", color: studioStyles.textSecondary, fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "1px" }}>TITLE</div>
                    <div className="flex-grow-1 position-relative">
                      <input 
                        type="text" 
                        name="title" 
                        value={manualData.title} 
                        onChange={handleManualChange} 
                        className="form-control glass-input"
                        style={{ paddingRight: "50px" }}
                        placeholder="Enter SEO-optimized title.."
                        maxLength={60}
                      />
                      <span className="position-absolute top-50 translate-middle-y end-0 pe-3" style={{ color: studioStyles.textSecondary, fontSize: "0.8rem" }}>
                        {manualData.title.length}/60
                      </span>
                    </div>
                  </div>

                  <div className="d-flex align-items-center">
                    <div style={{ width: "100px", color: studioStyles.textSecondary, fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "1px" }}>SLUG</div>
                    <div className="flex-grow-1">
                      <input 
                        type="text" 
                        name="slug" 
                        value={manualData.slug} 
                        onChange={handleManualChange} 
                        className="form-control glass-input"
                        
                        placeholder="url-friendly-slug"
                      />
                    </div>
                  </div>

                  <div className="d-flex align-items-start">
                    <div className="pt-2" style={{ width: "100px", color: studioStyles.textSecondary, fontSize: "0.85rem", fontWeight: "bold", letterSpacing: "1px" }}>META DESC</div>
                    <div className="flex-grow-1 position-relative">
                      <textarea 
                        name="metaDescription" 
                        value={manualData.metaDescription} 
                        onChange={handleManualChange} 
                        className="form-control glass-input"
                        style={{ paddingRight: "50px", minHeight: "60px" }}
                        placeholder="Write a compelling meta description..."
                        maxLength={160}
                      />
                      <span className="position-absolute top-0 end-0 pt-2 pe-3" style={{ color: studioStyles.textSecondary, fontSize: "0.8rem" }}>
                        {manualData.metaDescription.length}/160
                      </span>
                    </div>
                  </div>
                </div>

                {/* Editor Surface */}
                <div className="mt-4">
                  <div className="d-flex justify-content-between align-items-center mb-0 px-3 py-2" style={{ backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(12px)", border: `1px solid ${studioStyles.border}`, borderBottom: "none", borderRadius: "12px 12px 0 0" }}>
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px" }}>
                      {isHtmlMode ? "HTML EDITOR" : "RICH TEXT EDITOR"}
                    </div>
                    <div className="d-flex gap-2 align-items-center">
                      {isHtmlMode && (
                        <>
                          <button type="button" className="btn btn-sm glass-input">Format HTML</button>
                          <button type="button" className="btn btn-sm glass-input" onClick={handleClearHTML}>Clear</button>
                        </>
                      )}
                      
                      {/* Image Upload available in BOTH modes */}
                      <label className="btn btn-sm glass-input mb-0" style={{ cursor: "pointer" }}>
                        {insertingImage ? (
                          <><FaSpinner className="spinner-border spinner-border-sm me-2" />Uploading...</>
                        ) : (
                          <><FaImages className="me-2" />Insert Image</>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="d-none"
                          onChange={handleContentImageInsert}
                          disabled={insertingImage}
                        />
                      </label>

                      {isHtmlMode && (
                        <>
                          <button type="button" className="btn btn-sm premium-gradient-btn ms-2">&larr; Sync to Editor</button>
                          <button type="button" className="btn btn-sm premium-gradient-btn fw-bold">Live Preview &rarr;</button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ border: `1px solid ${studioStyles.border}`, borderRadius: "0 0 12px 12px", minHeight: "600px", backgroundColor: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)", overflow: "hidden" }}>
                    {isHtmlMode ? (
                      <textarea
                        ref={htmlEditorRef}
                        className="form-control font-monospace p-4"
                        style={{ border: "none", backgroundColor: "transparent", color: "#A9DC76", minHeight: "600px", fontSize: "14px", lineHeight: "1.6", outline: "none", boxShadow: "none" }}
                        value={manualData.content}
                        onChange={(e) => setManualData((p) => ({ ...p, content: e.target.value }))}
                        spellCheck="false"
                      />
                    ) : (
                      <div style={{ padding: "0", height: "600px", color: "black", backgroundColor: "#fff" }}>
                        <ReactQuill
                          ref={quillRef}
                          theme="snow"
                          value={manualData.content}
                          onChange={(val) => setManualData((p) => ({ ...p, content: val }))}
                          modules={quillModules}
                          formats={quillFormats}
                          placeholder="Start writing your amazing blog post here..."
                          style={{ height: "558px", border: "none" }}
                        />
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Right Column - Sidebars */}
            <div className="col-12 col-xl-4 d-flex flex-column gap-4">

              {/* AI BLOG GENERATOR */}
              <div className="card p-4 shadow-sm border-0 mb-4" style={{ borderRadius: "12px", background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)" }}>
                <div className="d-flex align-items-center mb-3 text-uppercase" style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px" }}>
                  <FaRobot className="me-2 text-warning" /> AI BLOG GENERATOR
                </div>
                <div className="d-flex gap-2 mb-3">
                  <input 
                    type="text" 
                    className="form-control glass-input"
                    
                    placeholder="e.g. luxury living room design tre..."
                    value={sidebarAiTopic}
                    onChange={(e) => setSidebarAiTopic(e.target.value)}
                  />
                  <button type="button" className="btn premium-gradient-btn fw-bold ms-2" onClick={() => {
                     setFormData({ topic: sidebarAiTopic, keywords: "", category: "Auto" });
                     handleSubmit(new Event('submit'));
                  }}>Generate</button>
                </div>
                <div className="d-flex flex-wrap gap-2">
                  {["Bedroom HYD", "Kitchen MUM", "Smart Home BLR", "Vastu Tips", "Styles 2026"].map(tag => (
                    <span key={tag} className="badge" style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: studioStyles.textSecondary, fontWeight: "normal", padding: "6px 10px", cursor: "pointer" }} onClick={() => setSidebarAiTopic(tag)}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* SEO ANALYZER */}
              <div className="card p-4 shadow-sm border-0 mb-4" style={{ borderRadius: "12px", background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)" }}>
                <div className="d-flex align-items-center mb-4 text-uppercase" style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px" }}>
                  <FaSearch className="me-2" style={{ color: "#EAA451" }} /> SEO ANALYZER
                </div>
                
                <div className="d-flex align-items-center gap-4 mb-4">
                  <div className="rounded-circle d-flex flex-column align-items-center justify-content-center" style={{ width: "70px", height: "70px", border: `3px solid ${seoData.score > 50 ? studioStyles.accent : studioStyles.border}` }}>
                    <span className="fs-4 fw-bold" style={{ color: "#fff" }}>{seoData.score}</span>
                    <span style={{ fontSize: "0.55rem", color: studioStyles.textSecondary }}>SCORE</span>
                  </div>
                  <div style={{ color: studioStyles.textSecondary, fontSize: "0.9rem" }}>
                    Start writing to analyze
                  </div>
                </div>

                <div className="d-flex gap-2 mb-4">
                  <input 
                    type="text" 
                    className="form-control glass-input"
                    
                    placeholder="Focus keyword.."
                    value={focusKeyword}
                    onChange={(e) => setFocusKeyword(e.target.value)}
                  />
                  <button type="button" className="btn glass-input">Analyze</button>
                </div>

                <ul className="list-unstyled d-flex flex-column gap-3 mb-0" style={{ fontSize: "0.9rem" }}>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: (manualData.title.length >= 30 && manualData.title.length <= 60) ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      Title length (30 - 60 chars)
                    </span>
                    <span style={{ color: (manualData.title.length >= 30 && manualData.title.length <= 60) ? "#4CAF50" : "#F44336" }}>{manualData.title.length} chars</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: (manualData.metaDescription.length >= 100 && manualData.metaDescription.length <= 160) ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      Meta description (100 - 160)
                    </span>
                    <span style={{ color: (manualData.metaDescription.length >= 100 && manualData.metaDescription.length <= 160) ? "#4CAF50" : "#F44336" }}>{manualData.metaDescription.length} chars</span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: seoData.h1Count > 0 ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      H1 tag (found: {seoData.h1Count})
                    </span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: seoData.h2Count > 0 ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      H2 headings (found: {seoData.h2Count})
                    </span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: seoData.internalLinksCount > 0 ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      Internal links ({seoData.internalLinksCount})
                    </span>
                  </li>
                  <li className="d-flex justify-content-between align-items-center">
                    <span style={{ color: studioStyles.textSecondary }}>
                      <span style={{ color: seoData.words > 300 ? "#4CAF50" : "#F44336", marginRight: "8px" }}>●</span>
                      Word count (~{seoData.words})
                    </span>
                  </li>
                </ul>
              </div>

              {/* INTERNAL LINKS */}
              <div className="card p-4 shadow-sm border-0 mb-4" style={{ borderRadius: "12px", background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)" }}>
                <div className="d-flex align-items-center mb-3 text-uppercase" style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px" }}>
                  <FaLink className="me-2" style={{ color: "#EAA451" }} /> INTERNAL LINKS
                </div>
                {seoData.parsedLinks.length === 0 ? (
                  <div style={{ fontSize: "0.85rem", color: studioStyles.textSecondary, fontStyle: "italic" }}>No links found in content.</div>
                ) : (
                  <ul className="list-unstyled mb-0 d-flex flex-column gap-2">
                    {seoData.parsedLinks.map((link, i) => (
                      <li key={i} className="d-flex justify-content-between align-items-center p-2 rounded" style={{ border: `1px solid ${studioStyles.border}`, backgroundColor: "transparent" }}>
                        <div className="text-truncate" style={{ maxWidth: "200px", fontSize: "0.85rem", color: studioStyles.textSecondary }}>
                          {link.href}
                        </div>
                        <span className="badge glass-input" style={{ color: link.isInternal ? "#4CAF50" : studioStyles.textSecondary, borderColor: link.isInternal ? "#4CAF50" : "rgba(255,255,255,0.1)" }}>
                          {link.isInternal ? "Internal" : "External"}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* IMAGE UPLOAD & ADVANCED SETTINGS */}
              <div className="card p-4 shadow-sm border-0 mb-4" style={{ borderRadius: "12px", background: "rgba(30, 41, 59, 0.4)", backdropFilter: "blur(12px)" }}>
                <div className="d-flex align-items-center mb-3 text-uppercase" style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px" }}>
                  <FaImage className="me-2 text-warning" /> IMAGE UPLOAD
                </div>
                <ImageUpload
                  currentImage={manualData.image}
                  onUpload={(url) => setManualData((p) => ({ ...p, image: url }))}
                  label="Upload Featured Image"
                />
                
                <hr style={{ borderColor: studioStyles.border, margin: "24px 0" }} />
                
                <div 
                  className="d-flex align-items-center justify-content-between text-uppercase" 
                  style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.textSecondary, letterSpacing: "1px", cursor: "pointer" }}
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  <div><FaBars className="me-2" /> ADVANCED SETTINGS</div>
                  <div style={{ fontSize: "1.2rem" }}>{showAdvanced ? "-" : "+"}</div>
                </div>

                {showAdvanced && (
                  <div className="mt-4 pt-3 border-top d-flex flex-column gap-3" style={{ borderColor: studioStyles.border }}>
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Category</label>
                      <input type="text" className="form-control form-control-sm glass-input" name="category" value={manualData.category} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Author</label>
                      <input type="text" className="form-control form-control-sm glass-input" name="author" value={manualData.author} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Excerpt</label>
                      <textarea className="form-control form-control-sm glass-input" name="excerpt" value={manualData.excerpt} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff", minHeight: "80px" }} />
                    </div>
                    {/* Additional fields hidden in layout but preserved in state */}
                    <div className="d-flex gap-2">
                       <div className="w-50">
                          <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Date</label>
                          <input type="text" className="form-control form-control-sm glass-input" name="date" value={manualData.date} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                       </div>
                       <div className="w-50">
                          <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Read Time</label>
                          <input type="number" className="form-control form-control-sm glass-input" name="readingTime" value={manualData.readingTime} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                       </div>
                    </div>

                    <hr className="my-2" style={{ borderColor: studioStyles.border }} />
                    <div style={{ fontSize: "0.85rem", fontWeight: "bold", color: studioStyles.accent, letterSpacing: "1px" }}>SOCIAL SE0 / OG TAGS</div>
                    
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>OG Title</label>
                      <input type="text" className="form-control form-control-sm glass-input" name="ogTitle" value={manualData.ogTitle} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>OG Description</label>
                      <textarea className="form-control form-control-sm glass-input" name="ogDescription" value={manualData.ogDescription} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff", minHeight: "60px" }} />
                    </div>
                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>OG Image URL</label>
                      <input type="text" className="form-control form-control-sm glass-input" name="ogImage" value={manualData.ogImage} onChange={handleManualChange} style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }} />
                    </div>

                    <div>
                      <label className="form-label" style={{ color: studioStyles.textSecondary, fontSize: "0.85rem" }}>Meta Keywords</label>
                      {manualData.metaKeywords.map((kw, i) => (
                        <div key={i} className="d-flex mb-2">
                          <input
                            type="text"
                            className="form-control form-control-sm glass-input me-2"
                            value={kw}
                            onChange={(e) => {
                              const newKw = [...manualData.metaKeywords];
                              newKw[i] = e.target.value;
                              setManualData((p) => ({ ...p, metaKeywords: newKw }));
                            }}
                            style={{ backgroundColor: "transparent", border: `1px solid ${studioStyles.border}`, color: "#fff" }}
                          />
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeManualKeyword(i)}
                          >
                            X
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-primary w-100"
                        style={{ border: `1px dashed ${studioStyles.accent}`, color: studioStyles.accent }}
                        onClick={addManualKeyword}
                      >
                        + Add Keyword
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </form>
      </div>
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER: Landing Page View
  // ══════════════════════════════════════════════════════════════════════════
  const defaultLandingHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Landing Page</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; }
    .hero { background: linear-gradient(135deg, #c8a96e 0%, #1a1a2e 100%); color: #fff; text-align: center; padding: 80px 24px; }
    .hero h1 { font-size: 2.5rem; margin-bottom: 16px; }
    .hero p { font-size: 1.1rem; opacity: 0.85; }
    .cta { display: inline-block; margin-top: 28px; padding: 14px 36px; background: #fff; color: #1a1a2e; border-radius: 50px; font-weight: 700; text-decoration: none; }
  </style>
</head>
<body>
  <section class="hero">
    <h1>Welcome to Interiorji</h1>
    <p>Premium Interior Design for your dream home</p>
    <a href="#" class="cta">Get Started</a>
  </section>
</body>
</html>`;

  const handleLandingPreview = () => {
    setLandingPreviewKey(k => k + 1);
  };

  const handleSaveLandingPage = async () => {
    if (!landingHtml.trim()) { toast.error("HTML code cannot be empty"); return; }
    if (!landingSlug.trim()) { toast.error("Slug is required (e.g. my-landing-page)"); return; }
    const finalSlug = slugify(landingSlug);
    setSavingLanding(true);
    try {
      await addDoc(collection(db, "landingPages"), {
        html: landingHtml,
        slug: finalSlug,
        url: `lp/${finalSlug}`,
        createdAt: new Date(),
        published: true,
      });
      toast.success(`Landing page uploaded! Live at: /lp/${finalSlug} 🚀`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload landing page");
    } finally {
      setSavingLanding(false);
    }
  };

  const renderLandingPageView = () => (
    <div className="w-100 m-0 p-0" style={{ backgroundColor: "#0f172a", color: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", backgroundColor: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", flexWrap: "wrap", gap: "12px" }}>
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-sm"
            style={{ color: "#94a3b8", backgroundColor: "transparent", border: "none" }}
            onClick={() => setView("manual")}
          >
            <FaArrowLeft className="me-2" /> Back to Studio
          </button>
          <div style={{ width: "1px", height: "24px", backgroundColor: "rgba(255,255,255,0.1)" }} />
          <h2 className="m-0" style={{ fontSize: "1.1rem", fontWeight: "700", color: "#fff" }}>
            <span style={{ color: "#f59e0b" }}>🚀</span> Landing Page Editor
          </h2>
        </div>

        {/* Slug input + URL preview */}
        <div className="d-flex align-items-center gap-2" style={{ flex: "1", maxWidth: "420px" }}>
          <div style={{ position: "relative", flex: 1 }}>
            <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "#475569", pointerEvents: "none", whiteSpace: "nowrap" }}>
              /lp/
            </span>
            <input
              type="text"
              value={landingSlug}
              onChange={(e) => setLandingSlug(slugify(e.target.value) || e.target.value.toLowerCase().replace(/\s+/g, "-"))}
              placeholder="your-page-slug"
              style={{
                width: "100%",
                paddingLeft: "38px",
                paddingRight: "10px",
                paddingTop: "6px",
                paddingBottom: "6px",
                backgroundColor: "rgba(30,41,59,0.8)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "6px",
                color: "#f8fafc",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
          </div>
          {landingSlug && (
            <span style={{ fontSize: "0.72rem", color: "#22c55e", whiteSpace: "nowrap", backgroundColor: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "4px", padding: "3px 8px" }}>
              website/lp/{slugify(landingSlug) || landingSlug}
            </span>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: "rgba(59,130,246,0.15)", color: "#3b82f6", border: "1px solid rgba(59,130,246,0.3)", borderRadius: "6px" }}
            onClick={handleLandingPreview}
          >
            <FaEye className="me-2" /> Preview
          </button>
          <button
            type="button"
            className="btn btn-sm"
            style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "6px", fontWeight: "600" }}
            onClick={handleSaveLandingPage}
            disabled={savingLanding}
          >
            {savingLanding ? (<><FaSpinner className="spinner-border spinner-border-sm me-2" />Uploading...</>) : (<><FaExternalLinkAlt className="me-2" />Upload Landing Page</>)}
          </button>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="d-flex" style={{ height: "calc(100vh - 62px)" }}>
        {/* Left: Code Editor */}
        <div className="d-flex flex-column" style={{ width: "50%", borderRight: "1px solid rgba(255,255,255,0.08)" }}>
          <div className="px-4 py-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: "rgba(15,23,42,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#64748b", letterSpacing: "1px" }}>HTML CODE</span>
            <button
              type="button"
              className="btn btn-sm"
              style={{ fontSize: "0.75rem", color: "#64748b", backgroundColor: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "4px" }}
              onClick={() => setLandingHtml(defaultLandingHtml)}
            >
              Load Template
            </button>
          </div>
          <textarea
            className="form-control font-monospace flex-grow-1"
            style={{
              border: "none",
              borderRadius: "0",
              backgroundColor: "#0d1117",
              color: "#A9DC76",
              fontSize: "13.5px",
              lineHeight: "1.65",
              outline: "none",
              boxShadow: "none",
              resize: "none",
              padding: "20px 24px",
            }}
            value={landingHtml}
            onChange={(e) => setLandingHtml(e.target.value)}
            placeholder={`Paste your full HTML code here...\n\nExample:\n<!DOCTYPE html>\n<html>\n  <body>\n    <h1>My Landing Page</h1>\n  </body>\n</html>`}
            spellCheck="false"
          />
        </div>

        {/* Right: Live Preview */}
        <div className="d-flex flex-column" style={{ width: "50%" }}>
          <div className="px-4 py-2 d-flex justify-content-between align-items-center" style={{ backgroundColor: "rgba(15,23,42,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ fontSize: "0.78rem", fontWeight: "700", color: "#64748b", letterSpacing: "1px" }}>LIVE PREVIEW — as shown on main website</span>
            <div className="d-flex align-items-center gap-2">
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#ef4444", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#f59e0b", display: "inline-block" }} />
              <span style={{ width: "10px", height: "10px", borderRadius: "50%", backgroundColor: "#22c55e", display: "inline-block" }} />
            </div>
          </div>
          <div style={{ flex: 1, backgroundColor: "#1e293b", position: "relative" }}>
            {landingHtml.trim() ? (
              <iframe
                key={landingPreviewKey}
                title="Landing Page Preview"
                srcDoc={landingHtml}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  backgroundColor: "#fff",
                }}
                sandbox="allow-scripts allow-same-origin"
              />
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100" style={{ color: "#475569" }}>
                <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.4 }}>🖥️</div>
                <p style={{ fontSize: "0.95rem", textAlign: "center", maxWidth: "220px", lineHeight: 1.6 }}>
                  Paste your HTML on the left and click <strong style={{ color: "#3b82f6" }}>Preview</strong> to see it here
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
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
                    <input type="text" className="form-control glass-input" name="title" value={editFormData.title} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Author</label>
                    <input type="text" className="form-control glass-input" name="author" value={editFormData.author} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Category</label>
                    <select className="form-select" name="category" value={editFormData.category} onChange={handleEditChange} required>
                      {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Slug</label>
                    <input type="text" className="form-control glass-input" name="slug" value={editFormData.slug} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Reading Time (min)</label>
                    <input type="number" className="form-control glass-input" name="readingTime" value={editFormData.readingTime} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label fw-semibold">Date</label>
                    <input type="text" className="form-control glass-input" name="date" value={editFormData.date} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Excerpt</label>
                    <textarea className="form-control glass-input" name="excerpt" value={editFormData.excerpt} onChange={handleEditChange} rows="3" required />
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
                  className="form-control glass-input"
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
                    <textarea className="form-control glass-input" name="metaDescription" value={editFormData.metaDescription} onChange={handleEditChange} rows="2" required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">Meta Keywords</label>
                    {editFormData.metaKeywords.map((keyword, index) => (
                      <div key={index} className="input-group mb-2">
                        <input type="text" className="form-control glass-input" name={`metaKeywords-${index}`} value={keyword} onChange={handleEditChange} placeholder="Keyword" />
                        <button type="button" className="btn btn-outline-danger" onClick={() => removeKeywordField(index)}><FaTimes /></button>
                      </div>
                    ))}
                    <button type="button" className="btn btn-sm btn-outline-primary" onClick={addKeywordField}>
                      <FaPlus className="me-1" />Add Keyword
                    </button>
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Title</label>
                    <input type="text" className="form-control glass-input" name="ogTitle" value={editFormData.ogTitle} onChange={handleEditChange} required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Description</label>
                    <textarea className="form-control glass-input" name="ogDescription" value={editFormData.ogDescription} onChange={handleEditChange} rows="2" required />
                  </div>
                  <div className="col-md-12">
                    <label className="form-label fw-semibold">OG Image URL</label>
                    <input type="url" className="form-control glass-input" name="ogImage" value={editFormData.ogImage} onChange={handleEditChange} required />
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
      {view === "generate"    && renderGenerateView()}
      {view === "manual"      && renderManualBlogView()}
      {view === "list"        && renderListView()}
      {view === "edit"        && renderEditView()}
      {view === "view"        && renderViewBlog()}
      {view === "landingPage" && renderLandingPageView()}
    </div>
  );
}

export default BlogGeneration;
