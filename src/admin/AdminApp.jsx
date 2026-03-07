// src/admin/AdminApp.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Typography aligned with App.jsx:
//   font-barabara  → headings, section titles, nav labels, logo area, buttons
//   font-cubao     → large numbers/stats, jeepney-sign style route/event names
//   font-pipanganan→ card titles in preview (mirrors Programs section)
//   system-ui      → body copy, small labels, inputs
// ─────────────────────────────────────────────────────────────────────────────

import aiesecLogo from '.././assets/logos/AIESEC-white.png';
import sunLogo from '.././assets/graphics/sunpng.png';
import { useState, useEffect, useRef, useCallback } from "react";
import {
  supabase,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  uploadEventPhoto,
  deleteEventPhoto,
} from "../lib/supabase";

// ─── FONT HELPERS ─────────────────────────────────────────────────────────────
const F = {
  barabara:   '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:      '"Cubao", "Impact", "Arial Black", sans-serif',
  pipanganan: '"Pipanganan", "Impact", "Arial Black", sans-serif',
  body:       'system-ui, sans-serif',
};

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const COLOR_MAP = {
  yellow: { bg: "#EAB308", light: "#FEF9C3", label: "Yellow" },
  rose:   { bg: "#F43F5E", light: "#FFF1F2", label: "Rose"   },
  teal:   { bg: "#0D9488", light: "#F0FDFA", label: "Teal"   },
  orange: { bg: "#F97316", light: "#FFF7ED", label: "Orange" },
  blue:   { bg: "#3B82F6", light: "#EFF6FF", label: "Blue"   },
  indigo: { bg: "#4F46E5", light: "#EEF2FF", label: "Indigo" },
  green:  { bg: "#22C55E", light: "#F0FDF4", label: "Green"  },
  red:    { bg: "#DC2626", light: "#FEF2F2", label: "Red"    },
};

const BRAND = {
  indigo: "#312783", red: "#EF3340", green: "#00A651",
  yellow: "#FFD100", blue: "#009BD6", orange: "#F58220",
  cream:  "#FFFBEB",
};

const dbToUi = (row) => ({
  ...row,
  active: row.is_active,
  image:  row.image_url ?? "",
});

const uiToDb = (form) => ({
  title:         form.title,
  date:          form.date,
  location:      form.location,
  tag:           form.tag,
  color:         form.color,
  rotation:      form.rotation,
  is_active:     form.active,
  image_url:     form.image || null,
  display_order: form.display_order ?? 0,
});

const EMPTY_FORM = {
  title: "", date: "", location: "", tag: "",
  color: "yellow", rotation: -1, active: true, image: "",
  display_order: 0,
};

const noiseOverlay = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
};

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const FiestaStripe = () => (
  <div style={{ height: 5, flexShrink: 0, background: `linear-gradient(to right,${BRAND.red},${BRAND.yellow},${BRAND.green},${BRAND.blue},${BRAND.orange},${BRAND.red})` }} />
);

function Spinner({ size = 20, color = "white" }) {
  return (
    <span style={{ width: size, height: size, border: `3px solid ${color}`, borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:9999, display:"flex", alignItems:"center", gap:10, padding:"12px 20px", backgroundColor: type==="success" ? BRAND.green : BRAND.red, border:"4px solid black", boxShadow:"5px 5px 0 0 black", fontFamily: F.barabara, fontSize:14, textTransform:"uppercase", letterSpacing:"0.1em", color:"white", animation:"toastIn 0.3s ease" }}>
      {type==="success" ? "✓" : "✕"} {msg}
    </div>
  );
}

// ─── PREVIEW CARD ─────────────────────────────────────────────────────────────
function PreviewCard({ event }) {
  const c   = COLOR_MAP[event.color] || COLOR_MAP.yellow;
  const deg = `${event.rotation ?? 0}deg`;
  return (
    <div style={{ transform:`rotate(${deg})`, transition:"all 0.25s", display:"inline-block" }}>
      <div style={{ backgroundColor:"white", border:"3px solid black", padding:6, boxShadow:"4px 4px 0 0 black", width:155, position:"relative" }}>
        <div style={{ position:"absolute", top:-12, right:-12, zIndex:20, width:36, height:36, backgroundColor:"white", border:"2px solid black", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"1px 1px 0 0 black" }}>
          <span style={{ fontFamily: F.cubao, fontSize:9, fontWeight:500, lineHeight:1.1, textAlign:"center" }}>{(event.date||"—").split(" ")[0]}</span>
        </div>
        <div style={{ aspectRatio:"1/1", overflow:"hidden", border:"2px solid black", backgroundColor:c.light, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
          {event.image
            ? <img src={event.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"grayscale(100%)" }} />
            : <span style={{ fontFamily: F.barabara, color:c.bg, fontWeight:500, fontSize:10, textTransform:"uppercase", letterSpacing:2, opacity:0.6 }}>NO PHOTO</span>}
          <div style={{ position:"absolute", inset:0, backgroundColor:c.bg, mixBlendMode:"multiply", opacity:0.2 }} />
        </div>
        <div style={{ paddingTop:7, paddingBottom:3 }}>
          <span style={{ fontFamily: F.barabara, display:"inline-block", fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:1, color:"white", padding:"2px 5px", backgroundColor:c.bg, border:"1px solid black", marginBottom:3 }}>{event.tag||"Tag"}</span>
          <p style={{ fontFamily: F.pipanganan, fontSize:13, fontWeight:500, textTransform:"uppercase", lineHeight:1.1, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{event.title||"Title"}</p>
          <p style={{ fontFamily: F.body, fontSize:10, fontWeight:700, color:"#6b7280", margin:"2px 0 0", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{event.location||"Location"}</p>
        </div>
      </div>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────
function LoginScreen() {
  const [email,   setEmail]   = useState("");
  const [pw,      setPw]      = useState("");
  const [showPw,  setShowPw]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [err,     setErr]     = useState("");

  const submit = async (e) => {
    e.preventDefault();
    if (!email || !pw) { setErr("Please fill in both fields."); return; }
    setErr(""); setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
    } catch (err) {
      setErr(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", fontFamily: F.body }}>
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <img src="/src/assets/images/ph-beach.jpg" alt="Philippines Beach" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      </div>
      <div style={{ position:"absolute", inset:0, zIndex:1, backgroundColor:"hsla(219,33%,43%,0.40)", mixBlendMode:"multiply" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }} />
      <div style={{ position:"absolute", top:"5rem", right:0, width:"24rem", height:"24rem", backgroundColor:"#009BD6", borderRadius:"9999px", mixBlendMode:"overlay", filter:"blur(80px)", opacity:0.4, zIndex:3 }} />
      <div style={{ position:"absolute", bottom:0, left:0, width:"24rem", height:"24rem", backgroundColor:"#FFD100", borderRadius:"9999px", mixBlendMode:"overlay", filter:"blur(80px)", opacity:0.3, zIndex:3 }} />

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"4rem", display:"flex", zIndex:5 }}>
        {Array.from({ length:28 }, (_,i) => i+1).map(num => (
          <img key={num} src={`/break/${num}.svg`} alt="break" style={{ flex:1, width:0, height:"100%", objectFit:"cover", display:"block" }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:20 }}>
        <div style={{ position:"absolute", inset:0, backgroundColor:BRAND.yellow, transform:"translate(8px,8px)", border:"4px solid black" }} />
        <div style={{ position:"relative", backgroundColor:"white", border:"4px solid black", width:360, padding:"36px 32px", boxShadow:"8px 8px 0 0 black" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"relative", backgroundColor:"#037ef3", padding:"0.75rem 1.25rem", borderRadius:"0.5rem", transform:"rotate(-2deg)", transition:"transform 0.2s", display:"inline-flex", alignItems:"center", border:"3px solid black", boxShadow:"4px 4px 0 0 black" }}
              onMouseEnter={e=>e.currentTarget.style.transform="rotate(0deg)"}
              onMouseLeave={e=>e.currentTarget.style.transform="rotate(-2deg)"}>
              <img src="/src/assets/logos/AIESEC-white.png" alt="AIESEC PH" style={{ height:"2rem", width:"auto", objectFit:"contain" }} />
            </div>
          </div>
          <div style={{ textAlign:"center", marginTop:14, marginBottom:22 }}>
            <span style={{ fontFamily: F.barabara, display:"inline-block", backgroundColor:"black", color:BRAND.yellow, padding:"5px 18px", fontSize:13, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em" }}>
              SIGN IN TO ADMIN PORTAL
            </span>
          </div>
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#374151", marginBottom:5 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@aiesec.ph" autoComplete="email"
                style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 14px", fontFamily: F.body, fontSize:13, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
            </div>
            <div>
              <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#374151", marginBottom:5 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 52px 10px 14px", fontFamily: F.body, fontSize:13, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", color:"#9ca3af", border:"none", background:"none", cursor:"pointer", padding:4 }}>
                  {showPw?"HIDE":"SHOW"}
                </button>
              </div>
            </div>
            {err && (
              <div style={{ backgroundColor:"#FFF0F1", border:"3px solid "+BRAND.red, padding:"8px 12px", fontFamily: F.barabara, fontSize:11, fontWeight:500, color:BRAND.red, textTransform:"uppercase", letterSpacing:"0.05em" }}>✕ {err}</div>
            )}
            <button type="submit" disabled={loading}
              style={{ marginTop:4, backgroundColor:BRAND.indigo, color:"white", border:"4px solid black", padding:"14px", fontFamily: F.barabara, fontWeight:500, fontSize:15, textTransform:"uppercase", letterSpacing:"0.18em", cursor:loading?"not-allowed":"pointer", boxShadow:"5px 5px 0 0 "+BRAND.yellow, transition:"all 0.12s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.7:1 }}
              onMouseEnter={e=>{ if(!loading){e.currentTarget.style.transform="translate(5px,5px)";e.currentTarget.style.boxShadow="none";}}}
              onMouseLeave={e=>{ e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="5px 5px 0 0 "+BRAND.yellow;}}>
              {loading && <Spinner size={14} />}
              {loading ? "Signing In…" : "→ Sign In"}
            </button>
          </form>
          <p style={{ fontFamily: F.body, textAlign:"center", fontSize:9, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginTop:20 }}>
            AIESEC in the Philippines · Admin Only
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── PHOTO UPLOADER ───────────────────────────────────────────────────────────
function PhotoUploader({ currentUrl, onUploaded }) {
  const [uploading, setUploading] = useState(false);
  const [pct,       setPct]       = useState(0);
  const [err,       setErr]       = useState("");
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024)    { setErr("Image must be under 5 MB.");    return; }
    setErr(""); setUploading(true); setPct(10);
    const ticker = setInterval(() => setPct(p => Math.min(p + 15, 85)), 300);
    try {
      const url = await uploadEventPhoto(file);
      clearInterval(ticker); setPct(100);
      setTimeout(() => { onUploaded(url); setUploading(false); setPct(0); }, 500);
    } catch (e) {
      clearInterval(ticker);
      setErr(e.message || "Upload failed.");
      setUploading(false); setPct(0);
    }
  };

  return (
    <>
      {currentUrl && (
        <div style={{ position:"relative", border:"4px solid black", overflow:"hidden", aspectRatio:"16/9", marginBottom:12 }}>
          <img src={currentUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
          <button onClick={()=>onUploaded("")}
            style={{ position:"absolute", top:8, right:8, backgroundColor:BRAND.red, color:"white", border:"3px solid black", padding:"4px 8px", fontFamily: F.barabara, fontSize:10, fontWeight:500, cursor:"pointer", textTransform:"uppercase" }}>
            ✕ Remove
          </button>
        </div>
      )}
      <div
        onClick={()=>fileRef.current?.click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault(); handleFile(e.dataTransfer.files[0]);}}
        style={{ border:"4px dashed "+(uploading?BRAND.indigo:"#d1d5db"), padding:"30px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, cursor:"pointer", backgroundColor:uploading?"#EEF2FF":BRAND.cream, transition:"all 0.2s", textAlign:"center" }}>
        {uploading ? (
          <>
            <Spinner size={28} color={BRAND.indigo} />
            <p style={{ fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.15em", color:BRAND.indigo, margin:0 }}>Uploading to Supabase Storage…</p>
            <div style={{ width:"100%", height:8, border:"2px solid black", backgroundColor:"white" }}>
              <div style={{ height:"100%", backgroundColor:BRAND.indigo, width:pct+"%", transition:"width 0.3s" }} />
            </div>
            <p style={{ fontFamily: F.body, fontSize:10, color:"#6b7280", fontWeight:700, margin:0 }}>{pct}%</p>
          </>
        ) : (
          <>
            <span style={{ fontSize:32 }}>📸</span>
            <p style={{ fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.15em", color:"#374151", margin:0 }}>Drop photo here</p>
            <p style={{ fontFamily: F.body, fontSize:10, color:"#9ca3af", fontWeight:700, margin:0 }}>PNG · JPG · WEBP · max 5 MB · click or drag</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handleFile(e.target.files[0])} />
      <div style={{ marginTop:10 }}>
        <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280", marginBottom:5 }}>Or Paste Image URL</label>
        <input value={currentUrl||""} onChange={e=>onUploaded(e.target.value)} placeholder="https://… or /assets/images/…"
          style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 12px", fontFamily:"monospace", fontSize:11, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
      </div>
      {err && <p style={{ fontFamily: F.barabara, fontSize:10, fontWeight:500, color:BRAND.red, textTransform:"uppercase", margin:"6px 0 0" }}>✕ {err}</p>}
    </>
  );
}

// ─── EVENT EDITOR DRAWER ──────────────────────────────────────────────────────
function EventEditor({ event, isNew, onSave, onCancel, isSaving }) {
  const [form, setForm] = useState({ ...event });
  const [tab,  setTab]  = useState("details");

  const set  = k => v => setForm(f => ({ ...f, [k]: v }));
  const c    = COLOR_MAP[form.color] || COLOR_MAP.yellow;
  const TABS = [{ id:"details", label:"① Details" }, { id:"photo", label:"② Photo" }, { id:"style", label:"③ Style" }];

  return (
    <div style={{ position:"fixed", inset:0, zIndex:50, backgroundColor:"rgba(0,0,0,0.65)", backdropFilter:"blur(6px)", display:"flex", alignItems:"flex-end", justifyContent:"center", fontFamily: F.body }}>
      <div style={{ width:"100%", maxWidth:1060, backgroundColor:BRAND.cream, border:"4px solid black", borderBottom:"none", boxShadow:"0 -8px 0 0 "+BRAND.yellow, height:"90vh", display:"flex", flexDirection:"column", animation:"editorUp 0.35s cubic-bezier(0.16,1,0.3,1)" }}>

        <div style={{ display:"flex", borderBottom:"4px solid black", flexShrink:0 }}>
          <div style={{ backgroundColor:BRAND.indigo, padding:"0 18px", display:"flex", alignItems:"center", gap:8 }}>
            {[BRAND.yellow,BRAND.red,BRAND.green].map((col,i)=>(
              <div key={i} style={{ width:10, height:10, borderRadius:"50%", backgroundColor:col, border:"2px solid rgba(0,0,0,0.3)" }} />
            ))}
          </div>
          <div style={{ flex:1, backgroundColor:"black", padding:"14px 20px", display:"flex", alignItems:"center" }}>
            <span style={{ fontFamily: F.barabara, color:BRAND.yellow, fontWeight:500, fontSize:18, textTransform:"uppercase", letterSpacing:"0.1em" }}>
              {isNew ? "✚ NEW EVENT" : `✎  EDITING: ${event.title.toUpperCase()}`}
            </span>
          </div>
          <div style={{ backgroundColor:BRAND.yellow, padding:"0 18px", display:"flex", alignItems:"center", borderLeft:"4px solid black" }}>
            <span style={{ fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.18em", color:"black" }}>Live Preview →</span>
          </div>
          <button onClick={onCancel} style={{ backgroundColor:BRAND.red, color:"white", border:"none", borderLeft:"4px solid black", padding:"0 20px", fontFamily: F.barabara, fontSize:18, fontWeight:500, cursor:"pointer" }}>✕</button>
        </div>
        <FiestaStripe />

        <div style={{ flex:1, display:"flex", overflow:"hidden" }}>
          <div style={{ width:370, flexShrink:0, display:"flex", flexDirection:"column", borderRight:"4px solid black", overflow:"hidden" }}>
            <div style={{ display:"flex", borderBottom:"4px solid black", flexShrink:0 }}>
              {TABS.map((t,i)=>(
                <button key={t.id} onClick={()=>setTab(t.id)}
                  style={{ flex:1, padding:"12px 0", fontFamily: F.barabara, fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.15em", cursor:"pointer", border:"none", borderRight:i<2?"3px solid black":"none", backgroundColor:tab===t.id?BRAND.yellow:"white", color:tab===t.id?"black":"#9ca3af" }}>
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ flex:1, overflowY:"auto", padding:20, backgroundColor:"white", display:"flex", flexDirection:"column", gap:15 }}>
              {tab==="details" && (
                <>
                  {[
                    { label:"Event Title", key:"title",    ph:"e.g. Concert"    },
                    { label:"Date",        key:"date",     ph:"e.g. MAR 15"     },
                    { label:"Location",    key:"location", ph:"e.g. Cubao Expo" },
                    { label:"Tag / Label", key:"tag",      ph:"e.g. Live Band"  },
                  ].map(({ label, key, ph }) => (
                    <div key={key}>
                      <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280", marginBottom:5 }}>{label}</label>
                      <input value={form[key]||""} onChange={e=>set(key)(e.target.value)} placeholder={ph}
                        style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 12px", fontFamily: F.body, fontSize:13, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
                    </div>
                  ))}
                  <div style={{ borderTop:"3px dashed #e5e7eb", paddingTop:14, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                    <div>
                      <p style={{ fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280", margin:0 }}>Visibility</p>
                      <p style={{ fontFamily: F.body, fontSize:11, fontWeight:700, color:form.active?BRAND.green:"#9ca3af", margin:"4px 0 0" }}>{form.active?"● Visible on site":"○ Hidden from site"}</p>
                    </div>
                    <button onClick={()=>set("active")(!form.active)}
                      style={{ padding:"8px 16px", border:"4px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:12, textTransform:"uppercase", letterSpacing:"0.1em", cursor:"pointer", backgroundColor:form.active?BRAND.green:"#e5e7eb", color:form.active?"white":"#6b7280", boxShadow:"3px 3px 0 0 black" }}>
                      {form.active?"LIVE":"HIDDEN"}
                    </button>
                  </div>
                </>
              )}

              {tab==="photo" && (
                <PhotoUploader currentUrl={form.image} onUploaded={url => set("image")(url)} />
              )}

              {tab==="style" && (
                <>
                  <div>
                    <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280", marginBottom:10 }}>Accent Color</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                      {Object.entries(COLOR_MAP).map(([key,val])=>(
                        <button key={key} onClick={()=>set("color")(key)}
                          style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:6, padding:"10px 6px", border:form.color===key?"4px solid black":"3px solid #e5e7eb", backgroundColor:form.color===key?val.light:"white", cursor:"pointer", boxShadow:form.color===key?"3px 3px 0 0 black":"none", transition:"all 0.12s", fontFamily: F.body }}>
                          <div style={{ width:28, height:28, backgroundColor:val.bg, border:"2px solid rgba(0,0,0,0.2)" }} />
                          <span style={{ fontFamily: F.barabara, fontSize:9, fontWeight:500, textTransform:"uppercase", color:"#374151" }}>{val.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display:"block", fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280", marginBottom:10 }}>Card Tilt</label>
                    <div style={{ display:"flex", gap:6 }}>
                      {[-2,-1,0,1,2].map(r=>(
                        <button key={r} onClick={()=>set("rotation")(r)}
                          style={{ flex:1, padding:"10px 0", border:form.rotation===r?"4px solid black":"3px solid #e5e7eb", fontFamily: F.cubao, fontWeight:500, fontSize:13, cursor:"pointer", backgroundColor:form.rotation===r?BRAND.yellow:"white", boxShadow:form.rotation===r?"3px 3px 0 0 black":"none", transition:"all 0.12s" }}>
                          {r>0?`+${r}°`:r===0?"0°":`${r}°`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ border:"4px solid black", padding:14, backgroundColor:c.light, display:"flex", alignItems:"center", gap:14 }}>
                    <div style={{ width:44, height:44, backgroundColor:c.bg, border:"4px solid black", flexShrink:0 }} />
                    <div>
                      <p style={{ fontFamily: F.barabara, fontWeight:500, fontSize:13, textTransform:"uppercase", letterSpacing:"0.1em", margin:0 }}>{c.label} Scheme</p>
                      <p style={{ fontFamily: F.body, fontSize:10, color:"#6b7280", fontWeight:700, margin:"3px 0 0" }}>Card overlay + tag badge</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div style={{ display:"flex", borderTop:"4px solid black", flexShrink:0 }}>
              <button onClick={onCancel}
                style={{ flex:1, padding:16, border:"none", borderRight:"4px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", cursor:"pointer", backgroundColor:"white", color:"#374151" }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="#f3f4f6"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor="white"}>
                Cancel
              </button>
              <button onClick={()=>onSave(form)} disabled={isSaving}
                style={{ flex:1, padding:16, border:"none", fontFamily: F.barabara, fontWeight:500, fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", cursor:isSaving?"not-allowed":"pointer", backgroundColor:BRAND.indigo, color:BRAND.yellow, display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:isSaving?0.7:1 }}
                onMouseEnter={e=>{ if(!isSaving) e.currentTarget.style.backgroundColor="#231d5e"; }}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor=BRAND.indigo}>
                {isSaving ? <Spinner size={14} /> : <span>✓</span>}
                {isSaving ? "Saving…" : "Save Event"}
              </button>
            </div>
          </div>

          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"10px 20px", borderBottom:"3px solid black", backgroundColor:"white", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
              <div style={{ width:8, height:8, borderRadius:"50%", backgroundColor:BRAND.green }} />
              <span style={{ fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#6b7280" }}>Live Preview — Updates As You Type</span>
              <span style={{ marginLeft:"auto", fontFamily: F.barabara, fontSize:10, fontWeight:500, color:form.active?BRAND.green:"#9ca3af" }}>{form.active?"● VISIBLE ON SITE":"○ HIDDEN"}</span>
            </div>
            <div style={{ flex:1, overflow:"auto", backgroundColor:"#fcfbf7", backgroundImage:"radial-gradient(#44444422 1px,transparent 1px)", backgroundSize:"15px 15px" }}>
              <div style={{ padding:32 }}>
                <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:20, paddingBottom:18, borderBottom:"3px dashed black" }}>
                  <div>
                    <h2 style={{ fontFamily: F.barabara, margin:0, fontSize:"clamp(28px,4vw,40px)", fontWeight:500, color:BRAND.red, textTransform:"uppercase", lineHeight:1, textShadow:"2px 2px 0 black" }}>
                      Featured Photos
                    </h2>
                    <p style={{ fontFamily: F.body, fontSize:"0.75rem", fontWeight:700, color:"#475569", textTransform:"uppercase", letterSpacing:"0.2em", margin:"4px 0 0" }}>
                      Throwback Collection
                    </p>
                  </div>
                  <div style={{ position:"relative" }}>
                    <span style={{ position:"absolute", inset:0, backgroundColor:"black", transform:"translate(3px,3px)" }} />
                    <span style={{ fontFamily: F.barabara, position:"relative", display:"block", padding:"5px 12px", backgroundColor:BRAND.yellow, border:"2px solid black", fontSize:10, fontWeight:500, textTransform:"uppercase" }}>View All Photos</span>
                  </div>
                </div>
                <div style={{ display:"flex", alignItems:"flex-start", gap:16, flexWrap:"wrap" }}>
                  {[0,1,2].map(i=>(
                    <div key={i} style={{ opacity:0.18, transform:`rotate(${[-1,2,-2][i]}deg)` }}>
                      <div style={{ width:120, aspectRatio:"1/1", border:"3px dashed #9ca3af", backgroundColor:"white", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontFamily: F.barabara, fontSize:9, fontWeight:500, textTransform:"uppercase", color:"#9ca3af" }}>Card {i+1}</span>
                      </div>
                    </div>
                  ))}
                  <PreviewCard event={form} />
                </div>
                <div style={{ marginTop:24, border:"4px dashed "+BRAND.indigo, backgroundColor:"rgba(49,39,131,0.04)", padding:16 }}>
                  <p style={{ fontFamily: F.barabara, fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.18em", color:BRAND.indigo, margin:"0 0 10px" }}>↑ Card Metadata</p>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"6px 16px" }}>
                    {[["Title",form.title||"—"],["Date",form.date||"—"],["Location",form.location||"—"],["Tag",form.tag||"—"],["Color",(COLOR_MAP[form.color]||COLOR_MAP.yellow).label],["Tilt",(form.rotation>0?"+":"")+form.rotation+"°"]].map(([k,v])=>(
                      <div key={k} style={{ display:"flex", gap:6, fontSize:10 }}>
                        <span style={{ fontFamily: F.body, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", fontSize:9, letterSpacing:"0.1em", minWidth:52 }}>{k}:</span>
                        <span style={{ fontFamily: F.cubao, fontWeight:500, color:"black", fontSize:12 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── EVENT ROW ────────────────────────────────────────────────────────────────
function EventRow({ event, idx, onEdit, onDelete, onToggle }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const c = COLOR_MAP[event.color] || COLOR_MAP.yellow;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", backgroundColor:"white", border:"4px solid black", boxShadow:"4px 4px 0 0 black", transition:"all 0.12s" }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translate(4px,4px)";e.currentTarget.style.boxShadow="none";}}
      onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="4px 4px 0 0 black";}}>
      <div style={{ width:32, height:32, flexShrink:0, backgroundColor:c.bg, border:"3px solid black", display:"flex", alignItems:"center", justifyContent:"center", fontFamily: F.cubao, fontWeight:500, fontSize:15, color:"white" }}>{idx}</div>
      <div style={{ width:52, height:52, flexShrink:0, border:"3px solid black", overflow:"hidden", backgroundColor:c.light, display:"flex", alignItems:"center", justifyContent:"center" }}>
        {event.image
          ? <img src={event.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"grayscale(1)" }} />
          : <span style={{ fontFamily: F.barabara, fontSize:10, fontWeight:500, color:c.bg }}>?</span>}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          <span style={{ fontFamily: F.barabara, fontWeight:500, fontSize:15, textTransform:"uppercase", letterSpacing:"0.05em" }}>{event.title}</span>
          <span style={{ fontFamily: F.barabara, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", padding:"2px 7px", backgroundColor:c.bg, color:"white", border:"2px solid black" }}>{event.tag}</span>
        </div>
        <p style={{ fontFamily: F.body, fontSize:11, fontWeight:700, color:"#6b7280", margin:"3px 0 0" }}>{event.date} · {event.location}</p>
      </div>
      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <button onClick={()=>onToggle(event)}
          style={{ padding:"7px 12px", border:"3px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", cursor:"pointer", backgroundColor:event.active?BRAND.green:"#e5e7eb", color:event.active?"white":"#6b7280", boxShadow:"2px 2px 0 0 black" }}>
          {event.active?"● LIVE":"○ HIDDEN"}
        </button>
        <button onClick={()=>onEdit(event)}
          style={{ padding:"7px 14px", border:"3px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", cursor:"pointer", backgroundColor:BRAND.indigo, color:BRAND.yellow, boxShadow:"2px 2px 0 0 black" }}>
          ✎ Edit
        </button>
        {confirmDel ? (
          <div style={{ display:"flex", gap:4 }}>
            <button onClick={()=>{ setConfirmDel(false); onDelete(event); }}
              style={{ padding:"7px 10px", border:"3px solid black", backgroundColor:BRAND.red, color:"white", fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", cursor:"pointer" }}>Confirm</button>
            <button onClick={()=>setConfirmDel(false)}
              style={{ padding:"7px 10px", border:"3px solid black", backgroundColor:"white", fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", cursor:"pointer" }}>No</button>
          </div>
        ):(
          <button onClick={()=>setConfirmDel(true)}
            style={{ padding:"7px 10px", border:"3px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:13, cursor:"pointer", backgroundColor:"white", color:"#d1d5db" }}
            onMouseEnter={e=>{e.currentTarget.style.backgroundColor="#FFF0F1";e.currentTarget.style.color=BRAND.red;}}
            onMouseLeave={e=>{e.currentTarget.style.backgroundColor="white";e.currentTarget.style.color="#d1d5db";}}>✕</button>
        )}
      </div>
    </div>
  );
}

// ─── GRID PREVIEW ─────────────────────────────────────────────────────────────
function GridPreview({ events }) {
  const live = events.filter(e=>e.active);
  return (
    <div style={{ marginTop:36 }}>
      <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:18, paddingBottom:14, borderBottom:"4px solid black" }}>
        <span style={{ fontFamily: F.barabara, backgroundColor:"black", color:BRAND.yellow, padding:"4px 14px", fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.2em" }}>Site Preview</span>
        <span style={{ fontFamily: F.body, fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.1em" }}>How Featured Photos looks right now</span>
      </div>
      <div style={{ border:"4px solid black", backgroundColor:"#fcfbf7", backgroundImage:"radial-gradient(#44444420 1px,transparent 1px)", backgroundSize:"15px 15px", padding:20 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:16, paddingBottom:12, borderBottom:"2px dashed black" }}>
          <div>
            <h2 style={{ fontFamily: F.barabara, margin:0, fontSize:24, fontWeight:500, color:BRAND.red, textTransform:"uppercase", textShadow:"2px 2px 0 black" }}>Featured Photos</h2>
            <p style={{ fontFamily: F.body, margin:"2px 0 0", fontSize:8, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#475569" }}>Throwback Collection</p>
          </div>
          <div style={{ position:"relative" }}>
            <span style={{ position:"absolute", inset:0, backgroundColor:"black", transform:"translate(2px,2px)" }} />
            <span style={{ fontFamily: F.barabara, position:"relative", display:"block", padding:"4px 10px", backgroundColor:BRAND.yellow, border:"2px solid black", fontSize:9, fontWeight:500, textTransform:"uppercase" }}>View All Photos</span>
          </div>
        </div>
        {live.length===0 ? (
          <p style={{ fontFamily: F.barabara, padding:"32px 0", textAlign:"center", fontWeight:500, fontSize:12, textTransform:"uppercase", letterSpacing:"0.15em", color:"#9ca3af", margin:0 }}>No live events · toggle some to visible</p>
        ):(
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {live.slice(0,4).map(ev=>(
              <div key={ev.id} style={{ display:"flex", justifyContent:"center" }}>
                <PreviewCard event={ev} />
              </div>
            ))}
            {live.length > 4 && (
              <div style={{ gridColumn:"1 / -1", textAlign:"center", padding:"32px", fontFamily: F.barabara, color:"#9ca3af", fontWeight:500, fontSize:12, textTransform:"uppercase" }}>
                +{live.length - 4} more events (showing first 4)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── COMING SOON PLACEHOLDER ──────────────────────────────────────────────────
function ComingSoonPane({ item }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:20, padding:40 }}>
      {/* Decorative top band */}
      <div style={{ position:"relative", marginBottom:8 }}>
        <div style={{ position:"absolute", inset:0, backgroundColor:BRAND.yellow, transform:"translate(6px,6px)", border:"4px solid black" }} />
        <div style={{ position:"relative", backgroundColor:"black", padding:"18px 40px", border:"4px solid black", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:48, filter:"drop-shadow(2px 2px 0 rgba(255,255,255,0.2))" }}>{item?.icon}</span>
          <span style={{ fontFamily: F.barabara, color:BRAND.yellow, fontWeight:500, fontSize:20, textTransform:"uppercase", letterSpacing:"0.15em", whiteSpace:"nowrap" }}>
            {item?.label}
          </span>
        </div>
      </div>

      {/* "Coming Soon" stamp */}
      <div style={{ position:"relative", transform:"rotate(-2deg)" }}>
        <div style={{ border:"5px solid "+BRAND.red, padding:"10px 28px", display:"inline-block" }}>
          <span style={{ fontFamily: F.cubao, fontSize:26, fontWeight:500, color:BRAND.red, textTransform:"uppercase", letterSpacing:"0.1em", opacity:0.85 }}>
            COMING SOON
          </span>
        </div>
      </div>

      <p style={{ fontFamily: F.body, color:"#6b7280", fontWeight:700, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", textAlign:"center", maxWidth:280, lineHeight:1.6, margin:0 }}>
        This section is under construction and will be built next.
      </p>

      {/* Decorative fiesta stripe */}
      <div style={{ width:200, height:5, background:`linear-gradient(to right,${BRAND.red},${BRAND.yellow},${BRAND.green},${BRAND.blue},${BRAND.orange},${BRAND.red})`, marginTop:8 }} />
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ session, onLogout }) {
  const [events,    setEvents]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [editing,   setEditing]   = useState(null);
  const [isNew,     setIsNew]     = useState(false);
  const [isSaving,  setIsSaving]  = useState(false);
  const [toast,     setToast]     = useState(null);
  const [activeNav, setActiveNav] = useState("events");

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null), 2500); };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const rows = await getAllEvents();
      setEvents(rows.map(dbToUi));
    } catch (e) {
      showToast(e.message || "Failed to load events.", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const payload = uiToDb(form);
      if (isNew) {
        payload.display_order = events.length + 1;
        const created = await createEvent(payload);
        setEvents(es => [...es, dbToUi(created)]);
        showToast("Event created!");
      } else {
        const updated = await updateEvent(form.id, payload);
        setEvents(es => es.map(e => e.id === updated.id ? dbToUi(updated) : e));
        showToast("Event updated!");
      }
      setEditing(null);
    } catch (e) {
      showToast(e.message || "Save failed.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event) => {
    try {
      if (event.image) await deleteEventPhoto(event.image);
      await deleteEvent(event.id);
      setEvents(es => es.filter(e => e.id !== event.id));
      showToast("Event deleted.", "error");
    } catch (e) {
      showToast(e.message || "Delete failed.", "error");
    }
  };

  const handleToggle = async (event) => {
    setEvents(es => es.map(e => e.id === event.id ? { ...e, active: !e.active } : e));
    try {
      await updateEvent(event.id, { is_active: !event.active });
    } catch (e) {
      setEvents(es => es.map(e => e.id === event.id ? { ...e, active: event.active } : e));
      showToast(e.message || "Toggle failed.", "error");
    }
  };

  const handleLogout = async () => { await supabase.auth.signOut(); };
  const openNew = () => { setIsNew(true); setEditing({ ...EMPTY_FORM, display_order: events.length + 1 }); };
  const liveCount = events.filter(e => e.active).length;

  const NAV = [
    { id:"events",       icon:"📸", label:"Event Photos"       },
    { id:"products",     icon:"🌏", label:"AIESEC Products"     },
    { id:"routes",       icon:"🚌", label:"Entity Information"  },
    { id:"testimonials", icon:"✨", label:"Member Testimonials" },
  ];

  const activeItem = NAV.find(n => n.id === activeNav);

  return (
    <div style={{ height:"100vh", display:"flex", overflow:"hidden", fontFamily: F.body, backgroundColor:BRAND.cream }}>

      {/* ── SIDEBAR ── */}
      <aside style={{ width:216, flexShrink:0, backgroundColor:"#1a144f", borderRight:"4px solid black", display:"flex", flexDirection:"column", ...noiseOverlay }}>

        {/* Logo block */}
        <div style={{ padding:"20px 16px", borderBottom:"4px solid black" }}>
          <div style={{ display:"flex", justifyContent:"center" }}>
            <div style={{ position:"relative", backgroundColor:"#037ef3", padding:"0.5rem 1rem", borderRadius:"0.5rem", transform:"rotate(-2deg)", display:"inline-block", transition:"transform 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.transform="rotate(0deg)"}
              onMouseLeave={e=>e.currentTarget.style.transform="rotate(-2deg)"}>
              <img src={aiesecLogo} alt="AIESEC PH" style={{ height:"2rem", width:"auto", objectFit:"contain" }} />
            </div>
          </div>
          <div style={{ textAlign:"center", marginTop:10 }}>
            <span style={{ fontFamily: F.barabara, backgroundColor:"black", color:BRAND.yellow, padding:"3px 10px", fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.25em" }}>ADMIN PORTAL</span>
          </div>
        </div>
        <FiestaStripe />

        {/* Nav — cream background for the middle section */}
        <nav style={{ flex:1, padding:"10px 8px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto", backgroundColor:BRAND.cream }}>
          <p style={{ fontFamily: F.body, fontSize:8, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.25em", color:"#a18a2a", padding:"6px 8px 3px", margin:0 }}>Content</p>
          {NAV.map(item=>{
            const active = activeNav===item.id;
            return (
              <button key={item.id} onClick={()=>setActiveNav(item.id)}
                style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", border:active?"3px solid black":"3px solid transparent", fontFamily: F.barabara, fontWeight:500, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em", cursor:"pointer", backgroundColor:active?BRAND.indigo:"transparent", color:active?"white":"#5c4b00", boxShadow:active?"3px 3px 0 0 black":"none", transition:"all 0.12s", width:"100%" }}
                onMouseEnter={e=>{ if(!active){e.currentTarget.style.backgroundColor="rgba(49,39,131,0.08)";e.currentTarget.style.color=BRAND.indigo;} }}
                onMouseLeave={e=>{ if(!active){e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#5c4b00";} }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                <span style={{ flex:1, textAlign:"left" }}>{item.label}</span>
                {item.id==="events" && (
                  <span style={{ fontFamily: F.cubao, fontSize:11, fontWeight:500, padding:"1px 6px", border:active?"2px solid rgba(255,255,255,0.4)":"2px solid #c9a300", backgroundColor:active?"rgba(255,255,255,0.15)":"rgba(255,209,0,0.15)", color:active?"white":BRAND.indigo }}>{events.length}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user info + sign out only (no stats) */}
        <div style={{ borderTop:"4px solid black", padding:"12px 16px", backgroundColor:"#1a144f" }}>
          <p style={{ fontFamily: F.body, fontSize:8, color:"#6b61c0", fontWeight:700, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{session?.user?.email}</p>
          <button onClick={handleLogout}
            style={{ width:"100%", padding:"8px 0", border:"2px solid rgba(255,255,255,0.15)", fontFamily: F.barabara, fontSize:10, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.15em", cursor:"pointer", backgroundColor:"transparent", color:"#818cf8", transition:"all 0.12s" }}
            onMouseEnter={e=>{e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="white";}}
            onMouseLeave={e=>{e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#818cf8";}}>
            ← Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", backgroundColor:BRAND.cream, ...noiseOverlay }}>

        {/* Header bar — only shown on the Events tab */}
        {activeNav === "events" && (
          <>
            <header style={{ display:"flex", alignItems:"stretch", borderBottom:"4px solid black", flexShrink:0, backgroundColor:"white" }}>
              <div style={{ backgroundColor:"black", padding:"0 24px", display:"flex", alignItems:"center", gap:12 }}>
                <span style={{ fontSize:18 }}>📸</span>
                <span style={{ fontFamily: F.barabara, color:BRAND.yellow, fontWeight:500, fontSize:16, textTransform:"uppercase", letterSpacing:"0.12em" }}>Featured Photos</span>
              </div>
              <div style={{ backgroundColor:BRAND.yellow, padding:"0 16px", display:"flex", alignItems:"center", borderLeft:"4px solid black" }}>
                <span style={{ fontFamily: F.cubao, fontWeight:500, fontSize:12, textTransform:"uppercase", letterSpacing:"0.18em", color:"black" }}>
                  <span style={{ color:BRAND.green }}>{liveCount}</span> Live · <span style={{ color:"#6b7280" }}>{events.length-liveCount}</span> Hidden
                </span>
              </div>
              <div style={{ flex:1 }} />
              <button onClick={load} title="Refresh"
                style={{ padding:"0 16px", backgroundColor:"white", border:"none", borderLeft:"4px solid black", cursor:"pointer", fontSize:16, color:"#9ca3af" }}
                onMouseEnter={e=>{e.currentTarget.style.backgroundColor="#f3f4f6";e.currentTarget.style.color="black";}}
                onMouseLeave={e=>{e.currentTarget.style.backgroundColor="white";e.currentTarget.style.color="#9ca3af";}}>
                ↺
              </button>
              <button onClick={openNew}
                style={{ display:"flex", alignItems:"center", gap:8, padding:"0 24px", backgroundColor:BRAND.red, color:"white", border:"none", borderLeft:"4px solid black", fontFamily: F.barabara, fontWeight:500, fontSize:13, textTransform:"uppercase", letterSpacing:"0.12em", cursor:"pointer" }}
                onMouseEnter={e=>e.currentTarget.style.backgroundColor="#c41a26"}
                onMouseLeave={e=>e.currentTarget.style.backgroundColor=BRAND.red}>
                <span style={{ fontSize:15 }}>✚</span> Add Event
              </button>
            </header>
            <FiestaStripe />
          </>
        )}

        <div style={{ flex:1, overflowY:"auto", padding: activeNav === "events" ? "22px 26px" : 0 }}>
          {activeNav !== "events" ? (
            <ComingSoonPane item={activeItem} />
          ) : (
            <>
              {loading ? (
                <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:"40vh", gap:16 }}>
                  <Spinner size={32} color={BRAND.indigo} />
                  <span style={{ fontFamily: F.barabara, fontWeight:500, fontSize:13, textTransform:"uppercase", letterSpacing:"0.15em", color:BRAND.indigo }}>Refreshing...</span>
                </div>
              ):(
                <>
                  <div style={{ display:"flex", alignItems:"center", gap:12, padding:"10px 16px", border:"3px dashed #d1d5db", backgroundColor:"rgba(255,255,255,0.6)", marginBottom:18 }}>
                    <span style={{ color:"#9ca3af", fontSize:14 }}>↕</span>
                    <p style={{ fontFamily: F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", color:"#6b7280", margin:0 }}>
                      {events.length} events · Click <span style={{ fontFamily: F.barabara, color:BRAND.indigo }}>✎ Edit</span> to open live editor · Toggle <span style={{ fontFamily: F.barabara, color:BRAND.green }}>● LIVE</span> to show/hide
                    </p>
                  </div>

                  {events.length === 0 ? (
                    <div style={{ textAlign:"center", padding:"60px 0" }}>
                      <p style={{ fontFamily: F.barabara, fontWeight:500, fontSize:14, textTransform:"uppercase", letterSpacing:"0.15em", color:"#9ca3af" }}>No events yet</p>
                      <button onClick={openNew} style={{ marginTop:12, backgroundColor:BRAND.indigo, color:BRAND.yellow, border:"4px solid black", padding:"10px 24px", fontFamily: F.barabara, fontWeight:500, fontSize:13, textTransform:"uppercase", letterSpacing:"0.15em", cursor:"pointer", boxShadow:"4px 4px 0 0 black" }}>
                        ✚ Add your first event
                      </button>
                    </div>
                  ):(
                    <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:880 }}>
                      {events.slice(0,8).map((ev,i) => (
                        <EventRow key={ev.id} event={ev} idx={i+1}
                          onEdit={e=>{ setIsNew(false); setEditing({...e}); }}
                          onDelete={handleDelete}
                          onToggle={handleToggle} />
                      ))}
                    </div>
                  )}

                  <div style={{ maxWidth:880 }}>
                    <GridPreview events={events} />
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </main>

      {editing && <EventEditor event={editing} isNew={isNew} onSave={handleSave} onCancel={()=>setEditing(null)} isSaving={isSaving} />}
      {toast    && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`
        @keyframes spin    { to{transform:rotate(360deg);} }
        @keyframes toastIn { from{transform:translateY(16px);opacity:0}to{transform:translateY(0);opacity:1} }
        @keyframes editorUp{ from{transform:translateY(60px);opacity:0}to{transform:translateY(0);opacity:1} }
        *{box-sizing:border-box;}
      `}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:BRAND.cream }}>
        <Spinner size={36} color={BRAND.indigo} />
      </div>
    );
  }

  if (!session) return <LoginScreen />;
  return <Dashboard session={session} onLogout={()=>supabase.auth.signOut()} />;
}