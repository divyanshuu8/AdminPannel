import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import {
  FaTrash, FaExternalLinkAlt, FaSpinner, FaPlus,
  FaGlobe, FaToggleOn, FaToggleOff, FaCalendarAlt,
  FaLink, FaSearch, FaRocket,
} from "react-icons/fa";
import { db } from "../Firebase";
import {
  collection, getDocs, doc, deleteDoc, updateDoc, query, orderBy,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const SITE_BASE = "https://interiorji.com";

// ── palette ──────────────────────────────────────────────────────────────────
const C = {
  pageBg:   "#f8fafc",
  white:    "#ffffff",
  border:   "#e2e8f0",
  text:     "#0f172a",
  muted:    "#64748b",
  indigo:   "#6366f1",
  green:    "#22c55e",
  amber:    "#f59e0b",
  red:      "#ef4444",
  gold:     "#b45309",
  goldBg:   "linear-gradient(135deg,#c8a96e,#a07840)",
  shadow:   "0 1px 6px rgba(0,0,0,0.07)",
  shadowHov:"0 4px 20px rgba(0,0,0,0.11)",
};

const card = {
  backgroundColor: C.white,
  border: `1px solid ${C.border}`,
  borderRadius: "14px",
  boxShadow: C.shadow,
  color: C.text,
  backdropFilter: "none",
};

export default function LandingPageManage() {
  const navigate = useNavigate();
  const [pages, setPages]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const loadPages = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "landingPages"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setPages(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch { toast.error("Failed to load landing pages"); }
    finally  { setLoading(false); }
  };

  useEffect(() => { loadPages(); }, []);

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, "landingPages", id));
      toast.success("Landing page deleted");
      setPages((p) => p.filter((x) => x.id !== id));
    } catch { toast.error("Failed to delete"); }
    finally { setDeletingId(null); setConfirmDel(null); }
  };

  const handleToggle = async (page) => {
    setTogglingId(page.id);
    try {
      await updateDoc(doc(db, "landingPages", page.id), { published: !page.published });
      setPages((p) => p.map((x) => x.id === page.id ? { ...x, published: !x.published } : x));
      toast.success(page.published ? "Set to Draft" : "Published!");
    } catch { toast.error("Failed to update"); }
    finally { setTogglingId(null); }
  };

  const filtered = pages.filter((p) =>
    (p.slug || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.url  || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fmtDate = (ts) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  };

  const stats = [
    { label:"Total Pages", value: pages.length,                     color: C.indigo, icon:<FaRocket /> },
    { label:"Published",   value: pages.filter(p=>p.published).length, color: C.green,  icon:<FaGlobe /> },
    { label:"Drafts",      value: pages.filter(p=>!p.published).length, color: C.amber,  icon:<FaToggleOff /> },
  ];

  return (
    <div style={{ minHeight:"100vh", backgroundColor: C.pageBg, padding:"32px 24px", fontFamily:"'Inter',sans-serif" }}>

      {/* ── Header ── */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h1 style={{ fontSize:"1.75rem", fontWeight:700, color: C.text, marginBottom:"4px" }}>
            🚀 Landing Pages
          </h1>
          <p style={{ color: C.muted, margin:0, fontSize:"0.88rem" }}>
            Manage all pages deployed on{" "}
            <a href={SITE_BASE} target="_blank" rel="noreferrer" style={{ color:"#c8a96e" }}>
              interiorji.com
            </a>
          </p>
        </div>
        <button
          onClick={() => navigate("/blog-generation")}
          style={{
            background: C.goldBg, color:"#fff", border:"none",
            borderRadius:"10px", padding:"10px 20px", fontWeight:600,
            fontSize:"0.88rem", display:"flex", alignItems:"center", gap:"8px",
            boxShadow:"0 4px 14px rgba(200,169,110,0.35)", cursor:"pointer",
          }}
        >
          <FaPlus /> Create New LP
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="row g-3 mb-4">
        {stats.map((s,i) => (
          <div className="col-4" key={i}>
            <div style={{ ...card, padding:"16px 20px" }}>
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width:40, height:40, borderRadius:"10px",
                  backgroundColor: s.color+"18", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  color: s.color, fontSize:"1rem",
                }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontSize:"1.5rem", fontWeight:700, color: C.text, lineHeight:1 }}>{s.value}</div>
                  <div style={{ fontSize:"0.75rem", color: C.muted }}>{s.label}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search ── */}
      <div style={{ position:"relative", maxWidth:"380px", marginBottom:"20px" }}>
        <FaSearch style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)", color: C.muted, fontSize:"0.8rem" }} />
        <input
          type="text"
          placeholder="Search by slug or URL..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width:"100%", paddingLeft:"36px", paddingRight:"12px",
            paddingTop:"9px", paddingBottom:"9px",
            borderRadius:"10px", border:`1px solid ${C.border}`,
            backgroundColor: C.white, color: C.text,
            fontSize:"0.85rem", outline:"none",
            boxShadow: C.shadow,
          }}
        />
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="text-center py-5">
          <FaSpinner className="spinner-border" style={{ fontSize:"2rem", color: C.indigo }} />
          <p style={{ color: C.muted, marginTop:"12px" }}>Loading landing pages...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ ...card, padding:"48px", textAlign:"center" }}>
          <FaRocket style={{ fontSize:"3rem", color:"#cbd5e1", marginBottom:"16px" }} />
          <h4 style={{ color: C.muted, fontWeight:600 }}>
            {searchTerm ? "No results found" : "No landing pages yet"}
          </h4>
          <p style={{ color: C.muted, margin:0, fontSize:"0.85rem" }}>
            {searchTerm ? "Try a different search term" : "Create your first landing page using Blog Generation"}
          </p>
        </div>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {filtered.map((page) => {
            const pub    = page.published;
            const accent = pub ? C.green : C.amber;
            const liveUrl = `${SITE_BASE}/${page.url || `lp/${page.slug}`}`;

            return (
              <div
                key={page.id}
                style={{
                  ...card, position:"relative",
                  padding:"16px 20px 16px 28px",
                  display:"flex", alignItems:"center",
                  flexWrap:"wrap", gap:"12px",
                  transition:"box-shadow 0.2s",
                  overflow:"hidden",
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = C.shadowHov}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = C.shadow}
              >
                {/* accent bar */}
                <div style={{
                  position:"absolute", left:0, top:0, bottom:0,
                  width:"4px", backgroundColor: accent, borderRadius:"14px 0 0 14px",
                }} />

                {/* icon */}
                <div style={{
                  width:44, height:44, borderRadius:"11px", flexShrink:0,
                  backgroundColor: accent+"18", display:"flex",
                  alignItems:"center", justifyContent:"center",
                  color: accent, fontSize:"1.1rem",
                }}>
                  <FaRocket />
                </div>

                {/* info */}
                <div style={{ flex:1, minWidth:"200px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px", flexWrap:"wrap", marginBottom:"4px" }}>
                    <code style={{ fontSize:"0.88rem", fontWeight:600, color: C.text }}>
                      /{page.url || `lp/${page.slug}`}
                    </code>
                    <span style={{
                      fontSize:"0.68rem", fontWeight:700, borderRadius:"999px",
                      padding:"2px 10px", border:`1px solid ${accent}55`,
                      backgroundColor: accent+"14", color: pub ? "#15803d" : "#b45309",
                      letterSpacing:"0.4px",
                    }}>
                      {pub ? "PUBLISHED" : "DRAFT"}
                    </span>
                  </div>
                  <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", fontSize:"0.76rem", color: C.muted }}>
                    <span><FaCalendarAlt style={{ marginRight:4 }} />{fmtDate(page.createdAt)}</span>
                    <a href={liveUrl} target="_blank" rel="noreferrer"
                      style={{ color: C.indigo, textDecoration:"none" }}>
                      <FaLink style={{ marginRight:4 }} />{liveUrl.replace("https://","")}
                    </a>
                  </div>
                </div>

                {/* actions */}
                <div style={{ display:"flex", alignItems:"center", gap:"8px", flexShrink:0, flexWrap:"wrap" }}>
                  {/* Live */}
                  <a href={liveUrl} target="_blank" rel="noreferrer" style={{
                    display:"flex", alignItems:"center", gap:"5px",
                    padding:"6px 12px", borderRadius:"8px", fontSize:"0.78rem", fontWeight:600,
                    backgroundColor: C.indigo+"14", color: C.indigo,
                    border:`1px solid ${C.indigo}33`, textDecoration:"none",
                  }}>
                    <FaExternalLinkAlt /> Live
                  </a>

                  {/* Toggle */}
                  <button
                    disabled={togglingId === page.id}
                    onClick={() => handleToggle(page)}
                    style={{
                      display:"flex", alignItems:"center", gap:"5px",
                      padding:"6px 12px", borderRadius:"8px", fontSize:"0.78rem", fontWeight:600,
                      backgroundColor: accent+"14", color: pub ? "#15803d" : "#b45309",
                      border:`1px solid ${accent}33`, cursor:"pointer",
                    }}
                  >
                    {togglingId === page.id
                      ? <FaSpinner className="spinner-border spinner-border-sm" />
                      : pub ? <><FaToggleOn /> Published</> : <><FaToggleOff /> Draft</>}
                  </button>

                  {/* Delete */}
                  {confirmDel === page.id ? (
                    <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                      <span style={{ fontSize:"0.75rem", color: C.red, fontWeight:600 }}>Sure?</span>
                      <button
                        disabled={deletingId === page.id}
                        onClick={() => handleDelete(page.id)}
                        style={{
                          padding:"5px 10px", borderRadius:"8px", fontSize:"0.75rem",
                          backgroundColor: C.red, color:"#fff", border:"none", cursor:"pointer", fontWeight:600,
                        }}
                      >
                        {deletingId === page.id ? <FaSpinner className="spinner-border spinner-border-sm" /> : "Delete"}
                      </button>
                      <button
                        onClick={() => setConfirmDel(null)}
                        style={{
                          padding:"5px 10px", borderRadius:"8px", fontSize:"0.75rem",
                          backgroundColor:"transparent", color: C.muted,
                          border:`1px solid ${C.border}`, cursor:"pointer",
                        }}
                      >Cancel</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDel(page.id)}
                      style={{
                        display:"flex", alignItems:"center", gap:"5px",
                        padding:"6px 12px", borderRadius:"8px", fontSize:"0.78rem", fontWeight:600,
                        backgroundColor: C.red+"14", color: C.red,
                        border:`1px solid ${C.red}33`, cursor:"pointer",
                      }}
                    >
                      <FaTrash /> Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
