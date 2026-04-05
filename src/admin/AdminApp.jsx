// src/admin/AdminApp.jsx

import aiesecLogo from '.././assets/logos/AIESEC-white.png';
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import EventsManager      from "./pages/EventsManager";
import IncomingProducts    from "./pages/IncomingProducts";
import OutgoingProducts    from "./pages/OutgoingProducts";
import ExternalsDashboard from "./pages/ExternalsDashboard";
import InternalsDashboard from "./pages/InternalsDashboard";

const F = {
  barabara: '"Barabara", "Impact", "Arial Black", sans-serif',
  body:     '"Inter", system-ui, sans-serif',
};

const BRAND = {
  blue:       "#037ef3",
  blueDark:   "#0260c4",
  blueLight:  "#e8f3ff",
  blueMid:    "#b8d9fd",
  blueGhost:  "#f0f7ff",
  white:      "#ffffff",
  offWhite:   "#f4f7fc",
  border:     "#dce8fb",
  borderSoft: "#eaf2ff",
  text:       "#0d1f3c",
  textMid:    "#3a547a",
  textLight:  "#8eaacb",
  danger:     "#e53935",
  sidebar:    "#ffffff",
};

// Noise SVG overlay
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

function Spinner({ size = 22, color = BRAND.blue }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2.5px solid ${color}22`,
      borderTopColor: color,
      borderRadius: "50%",
      display: "inline-block",
      animation: "spin 0.7s linear infinite",
      flexShrink: 0,
    }} />
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
    } catch (err) { setErr(err.message || "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F.body,
      backgroundColor: BRAND.offWhite,
      backgroundImage: NOISE_SVG,
      position: "relative", overflow: "hidden",
    }}>
      {/* Soft background blobs */}
      <div style={{ position: "absolute", top: "-8rem", right: "-6rem", width: "30rem", height: "30rem", borderRadius: "9999px", background: `radial-gradient(circle, ${BRAND.blueMid}55 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-6rem", left: "-4rem", width: "24rem", height: "24rem", borderRadius: "9999px", background: `radial-gradient(circle, ${BRAND.blueLight}88 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Card wrapper */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420, padding: "0 20px", boxSizing: "border-box" }}>

        <div style={{
          position: "relative",
          backgroundColor: BRAND.white,
          border: `1.5px solid ${BRAND.border}`,
          borderRadius: 20,
          padding: "38px 32px",
          boxShadow: "0 0 20px rgba(3, 126, 243, 0.3)",
          backgroundImage: NOISE_SVG,
        }}>
          {/* Logo */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              backgroundColor: BRAND.blue,
              padding: "10px 22px", borderRadius: 14,
              display: "inline-flex", alignItems: "center",
              boxShadow: `0 6px 20px ${BRAND.blue}40`,
            }}>
              <img src="/src/assets/logos/AIESEC-white.png" alt="AIESEC PH"
                style={{ height: "1.9rem", width: "auto", objectFit: "contain" }} />
            </div>
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <h1 style={{ fontFamily: F.barabara, fontSize: 19, margin: 0, color: BRAND.text, letterSpacing: "0.07em", textTransform: "uppercase" }}>
              Admin Portal
            </h1>
            <p style={{ fontFamily: F.body, fontSize: 13, color: BRAND.textLight, margin: "6px 0 0" }}>
              Sign in to manage your content
            </p>
          </div>

          <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: BRAND.textMid, marginBottom: 7 }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@aiesec.ph" autoComplete="email"
                style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${BRAND.border}`, borderRadius: 12, padding: "11px 15px", fontFamily: F.body, fontSize: 14, color: BRAND.text, backgroundColor: BRAND.blueGhost, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
                onFocus={e => { e.target.style.borderColor = BRAND.blue; e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}1a`; }}
                onBlur={e => { e.target.style.borderColor = BRAND.border; e.target.style.boxShadow = "none"; }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.13em", color: BRAND.textMid, marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={pw} onChange={e => setPw(e.target.value)}
                  placeholder="••••••••" autoComplete="current-password"
                  style={{ width: "100%", boxSizing: "border-box", border: `1.5px solid ${BRAND.border}`, borderRadius: 12, padding: "11px 52px 11px 15px", fontFamily: F.body, fontSize: 14, color: BRAND.text, backgroundColor: BRAND.blueGhost, outline: "none", transition: "border-color 0.15s, box-shadow 0.15s" }}
                  onFocus={e => { e.target.style.borderColor = BRAND.blue; e.target.style.boxShadow = `0 0 0 3px ${BRAND.blue}1a`; }}
                  onBlur={e => { e.target.style.borderColor = BRAND.border; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 13, top: "50%", transform: "translateY(-50%)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: BRAND.textLight, border: "none", background: "none", cursor: "pointer", padding: 4 }}>
                  {showPw ? "HIDE" : "SHOW"}
                </button>
              </div>
            </div>

            {err && (
              <div style={{ backgroundColor: "#fff4f4", border: `1.5px solid ${BRAND.danger}33`, borderRadius: 10, padding: "10px 14px", fontSize: 12, color: BRAND.danger, fontWeight: 600 }}>
                ✕ {err}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{
                marginTop: 4, backgroundColor: BRAND.blue, color: "white", border: "none", borderRadius: 13,
                padding: "13px", fontFamily: F.barabara, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.14em",
                cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.75 : 1,
                boxShadow: `0 5px 18px ${BRAND.blue}44`, transition: "all 0.15s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${BRAND.blue}55`; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 5px 18px ${BRAND.blue}44`; }}>
              {loading && <Spinner size={14} color="white" />}
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <p style={{ textAlign: "center", fontSize: 11, color: BRAND.textLight, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 24, marginBottom: 0 }}>
            AIESEC in the Philippines · Admin Only
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id: "events",       icon: "📸", label: "Photo Collection"    },
  { id: "incoming",     icon: "🌏", label: "Incoming Products"   },
  { id: "outgoing",     icon: "✈️", label: "Outgoing Products"   },
];

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <div style={{ width: 16, height: 12, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(5px) rotate(45deg)" : "none", transformOrigin: "center" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, opacity: open ? 0 : 1, transition: "opacity 0.15s" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(-5px) rotate(-45deg)" : "none", transformOrigin: "center" }} />
    </div>
  );
}

// ─── SECTION SELECTOR ─────────────────────────────────────────────────────────
function SectionSelector({ onSelectSection }) {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontFamily: F.body,
      backgroundColor: BRAND.offWhite,
      backgroundImage: NOISE_SVG,
      position: "relative", overflow: "hidden",
    }}>
      {/* Soft background blobs */}
      <div style={{ position: "absolute", top: "-8rem", right: "-6rem", width: "30rem", height: "30rem", borderRadius: "9999px", background: `radial-gradient(circle, ${BRAND.blueMid}55 0%, transparent 70%)`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-6rem", left: "-4rem", width: "24rem", height: "24rem", borderRadius: "9999px", background: `radial-gradient(circle, ${BRAND.blueLight}88 0%, transparent 70%)`, pointerEvents: "none" }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 560, padding: "0 20px", boxSizing: "border-box" }}>
        {/* Logo */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 40 }}>
          <div style={{
            backgroundColor: BRAND.blue,
            padding: "10px 22px", borderRadius: 14,
            display: "inline-flex", alignItems: "center",
            boxShadow: `0 6px 20px ${BRAND.blue}40`,
          }}>
            <img src="/src/assets/logos/AIESEC-white.png" alt="AIESEC PH"
              style={{ height: "1.9rem", width: "auto", objectFit: "contain" }} />
          </div>
        </div>

        {/* Title */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1 style={{ fontFamily: F.barabara, fontSize: 26, margin: 0, color: BRAND.text, letterSpacing: "0.07em", textTransform: "uppercase" }}>
            Site Manager
          </h1>
          <p style={{ fontFamily: F.body, fontSize: 14, color: BRAND.textLight, margin: "12px 0 0", lineHeight: 1.6 }}>
            Choose which portal you'd like to manage
          </p>
        </div>

        {/* Button Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Externals */}
          <button
            onClick={() => onSelectSection("externals")}
            style={{
              padding: "40px 24px",
              border: `2px solid ${BRAND.blue}`,
              borderRadius: 16,
              backgroundColor: BRAND.white,
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              boxShadow: `0 0 0 0 ${BRAND.blue}00`,
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = `0 12px 28px ${BRAND.blue}22`;
              e.currentTarget.style.backgroundColor = BRAND.blueGhost;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "none";
              e.currentTarget.style.boxShadow = `0 0 0 0 ${BRAND.blue}00`;
              e.currentTarget.style.backgroundColor = BRAND.white;
            }}>
            <span style={{ fontSize: 48 }}>🌍</span>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: F.barabara, fontSize: 18, margin: 0, color: BRAND.text, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Externals
              </h2>
              <p style={{ fontFamily: F.body, fontSize: 12, color: BRAND.textLight, margin: "6px 0 0" }}>
                Global products & events
              </p>
            </div>
          </button>

          {/* Internals */}
          <button
            onClick={() => onSelectSection("internals")}
            style={{
              padding: "40px 24px",
              border: `2px solid ${BRAND.border}`,
              borderRadius: 16,
              backgroundColor: BRAND.white,
              cursor: "pointer",
              transition: "all 0.25s ease",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
              opacity: 0.6,
              textDecoration: "none",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.opacity = "0.6";
            }}>
            <span style={{ fontSize: 48 }}>🏢</span>
            <div style={{ textAlign: "center" }}>
              <h2 style={{ fontFamily: F.barabara, fontSize: 18, margin: 0, color: BRAND.textMid, letterSpacing: "0.05em", textTransform: "uppercase" }}>
                Internals
              </h2>
              <p style={{ fontFamily: F.body, fontSize: 12, color: BRAND.textLight, margin: "6px 0 0" }}>
                Coming soon
              </p>
            </div>
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [session, setSession] = useState(undefined);
  const [selectedSection, setSelectedSection] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleBack = () => setSelectedSection(null);

  if (session === undefined) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: BRAND.offWhite }}>
      <Spinner size={36} />
    </div>
  );
  
  if (!session) return <LoginScreen />;
  
  if (!selectedSection) {
    return <SectionSelector onSelectSection={setSelectedSection} />;
  }
  
  if (selectedSection === "externals") {
    return <ExternalsDashboard session={session} onBack={handleBack} />;
  }
  
  if (selectedSection === "internals") {
    return <InternalsDashboard session={session} onBack={handleBack} />;
  }
  
  // Fallback - shouldn't reach here
  return <SectionSelector onSelectSection={setSelectedSection} />;
}