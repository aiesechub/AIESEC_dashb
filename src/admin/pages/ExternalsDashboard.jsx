import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import aiesecLogo from '../../assets/logos/AIESEC-white.png';
import EventsManager from "./EventsManager";
import IncomingProducts from "./IncomingProducts";
import OutgoingProducts from "./OutgoingProducts";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
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

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

const NAV = [
  { id: "events",       icon: "📸", label: "Photo Collection"    },
  { id: "incoming",     icon: "🌏", label: "Incoming Products"   },
  { id: "outgoing",     icon: "✈️", label: "Outgoing Products"   },
];

// ─── HAMBURGER ICON ───────────────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <div style={{ width: 16, height: 12, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(5px) rotate(45deg)" : "none", transformOrigin: "center" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, opacity: open ? 0 : 1, transition: "opacity 0.15s" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(-5px) rotate(-45deg)" : "none", transformOrigin: "center" }} />
    </div>
  );
}

// ─── SIDEBAR LOGO ─────────────────────────────────────────────────────────────
function SidebarLogo() {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 16px 16px" }}>
      <div style={{
        backgroundColor: BRAND.blue, padding: "8px 16px", borderRadius: 12,
        display: "inline-flex", alignItems: "center",
        boxShadow: `0 4px 14px ${BRAND.blue}38`,
      }}>
        <img src={aiesecLogo} alt="AIESEC PH" style={{ height: "1.6rem", width: "auto", objectFit: "contain" }} />
      </div>
    </div>
  );
}

// ─── EXTERNALS DASHBOARD ──────────────────────────────────────────────────────
export default function ExternalsDashboard({ session, onBack }) {
  const [activeNav,   setActiveNav]   = useState("events");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile,    setIsMobile]    = useState(false);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      setSidebarOpen(!mobile);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const navItem  = NAV.find(n => n.id === activeNav);
  const navLabel = navItem?.label || "";
  const navIcon  = navItem?.icon  || "";

  const handleNavSelect = (id) => {
    setActiveNav(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{
      height: "100vh", display: "flex", overflow: "hidden",
      fontFamily: F.body, backgroundColor: BRAND.offWhite,
      backgroundImage: NOISE_SVG, position: "relative",
    }}>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 40, backgroundColor: "rgba(13,31,60,0.35)", backdropFilter: "blur(5px)" }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 220 : (isMobile ? 0 : 60),
        flexShrink: 0,
        backgroundColor: BRAND.sidebar,
        borderRight: `1.5px solid ${BRAND.border}`,
        display: "flex", flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        position: isMobile ? "fixed" : "relative",
        left: 0, top: 0, bottom: 0,
        zIndex: isMobile ? 50 : "auto",
        boxShadow: sidebarOpen ? `4px 0 0 0 ${BRAND.blueMid}, 8px 0 28px rgba(3,126,243,0.06)` : "none",
        backgroundImage: NOISE_SVG,
      }}>

        {sidebarOpen ? (
          <>
            <SidebarLogo />
            <div style={{ padding: "0 18px 14px", textAlign: "center" }}>
              <span style={{ fontFamily: F.barabara, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.28em", color: BRAND.textLight }}>
                ADMIN PORTAL
              </span>
            </div>
            <div style={{ height: 1, backgroundColor: BRAND.borderSoft, flexShrink: 0, margin: "0 14px" }} />
          </>
        ) : (
          <div style={{ padding: "16px 10px", borderBottom: `1px solid ${BRAND.borderSoft}`, flexShrink: 0, display: "flex", justifyContent: "center" }}>
            <button onClick={() => setSidebarOpen(true)}
              style={{ backgroundColor: BRAND.blueGhost, border: `1.5px solid ${BRAND.border}`, borderRadius: 10, padding: "9px 10px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.15s" }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = BRAND.blueLight}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND.blueGhost}>
              <HamburgerIcon open={false} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: sidebarOpen ? "14px 10px" : "14px 8px", display: "flex", flexDirection: "column", gap: 3, overflowY: "auto" }}>
          {sidebarOpen && (
            <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.26em", color: BRAND.textLight, padding: "4px 8px 8px", margin: 0, whiteSpace: "nowrap" }}>Content</p>
          )}
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => handleNavSelect(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                style={{
                  display: "flex", alignItems: "center",
                  gap: sidebarOpen ? 11 : 0,
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                  padding: sidebarOpen ? "10px 12px" : "11px 8px",
                  border: "none", borderRadius: 12,
                  fontFamily: F.body, fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  backgroundColor: active ? BRAND.blue : "transparent",
                  color: active ? "white" : BRAND.textMid,
                  boxShadow: active ? `3px 3px 0 0 ${BRAND.blueDark}, 0 4px 14px ${BRAND.blue}33` : "none",
                  transition: "all 0.14s",
                  width: "100%", textAlign: "left",
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = BRAND.blueGhost; e.currentTarget.style.color = BRAND.blue; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = BRAND.textMid; } }}>
                <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ flex: 1, lineHeight: 1.35 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User / back button */}
        {sidebarOpen ? (
          <div style={{ borderTop: `1.5px solid ${BRAND.borderSoft}`, padding: "14px 16px", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, backgroundColor: BRAND.blueGhost, border: `1.5px solid ${BRAND.border}`, borderRadius: 11, padding: "8px 12px", marginBottom: 10 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", backgroundColor: BRAND.blue, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12, fontWeight: 700, color: "white" }}>
                {session?.user?.email?.[0]?.toUpperCase() || "A"}
              </div>
              <p style={{ fontFamily: F.body, fontSize: 11, color: BRAND.textMid, fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                {session?.user?.email}
              </p>
            </div>
            <button onClick={onBack} title="Back to Site Manager"
              style={{ width: "100%", padding: "9px 0", border: `1.5px solid ${BRAND.border}`, borderRadius: 11, fontFamily: F.body, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", backgroundColor: BRAND.white, color: BRAND.textLight, transition: "all 0.12s", boxShadow: `2px 2px 0 0 ${BRAND.border}`, marginBottom: 8 }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.blue + "66"; e.currentTarget.style.color = BRAND.blue; e.currentTarget.style.backgroundColor = BRAND.blueGhost; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.textLight; e.currentTarget.style.backgroundColor = BRAND.white; }}>
              ↲ Back
            </button>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={() => supabase.auth.signOut()} title="Sign Out"
                style={{ flex: 1, padding: "9px 0", border: `1.5px solid ${BRAND.border}`, borderRadius: 11, fontFamily: F.body, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", cursor: "pointer", backgroundColor: BRAND.white, color: BRAND.textLight, transition: "all 0.12s", boxShadow: `2px 2px 0 0 ${BRAND.border}` }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.danger + "66"; e.currentTarget.style.color = BRAND.danger; e.currentTarget.style.backgroundColor = "#fff4f4"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.textLight; e.currentTarget.style.backgroundColor = BRAND.white; }}>
                ← Out
              </button>
              <button onClick={() => setSidebarOpen(false)} title="Collapse sidebar"
                style={{
                  width: 32, height: 32, backgroundColor: BRAND.blueGhost,
                  border: `1.5px solid ${BRAND.border}`, borderRadius: 9,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  padding: 0, transition: "background-color 0.15s", flexShrink: 0,
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = BRAND.blueLight}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND.blueGhost}>
                <span style={{ color: BRAND.blue, fontSize: 13, lineHeight: 1 }}>←</span>
              </button>
            </div>
          </div>
        ) : !isMobile && (
          <div style={{ borderTop: `1.5px solid ${BRAND.borderSoft}`, padding: "10px 8px", flexShrink: 0, display: "flex", justifyContent: "center", flexDirection: "column", gap: 6 }}>
            <button onClick={onBack} title="Back to Site Manager"
              style={{ width: 40, height: 40, border: `1.5px solid ${BRAND.border}`, borderRadius: 9, fontSize: 14, cursor: "pointer", backgroundColor: BRAND.white, color: BRAND.textLight, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s" }}
              onMouseEnter={e => { e.currentTarget.style.color = BRAND.blue; e.currentTarget.style.backgroundColor = BRAND.blueGhost; }}
              onMouseLeave={e => { e.currentTarget.style.color = BRAND.textLight; e.currentTarget.style.backgroundColor = BRAND.white; }}>
              ↲
            </button>
            <button onClick={() => supabase.auth.signOut()} title="Sign Out"
              style={{ width: 40, height: 40, border: `1.5px solid ${BRAND.border}`, borderRadius: 11, fontSize: 14, cursor: "pointer", backgroundColor: BRAND.white, color: BRAND.textLight, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.12s", boxShadow: `2px 2px 0 0 ${BRAND.border}` }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = BRAND.danger + "66"; e.currentTarget.style.color = BRAND.danger; e.currentTarget.style.backgroundColor = "#fff4f4"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BRAND.border; e.currentTarget.style.color = BRAND.textLight; e.currentTarget.style.backgroundColor = BRAND.white; }}>
              ←
            </button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", backgroundColor: BRAND.offWhite, backgroundImage: NOISE_SVG, minWidth: 0 }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", backgroundColor: BRAND.white, borderBottom: `1.5px solid ${BRAND.border}`, flexShrink: 0, boxShadow: `0 2px 0 0 ${BRAND.blueMid}` }}>
            <button onClick={() => setSidebarOpen(v => !v)}
              style={{ backgroundColor: BRAND.blueGhost, border: `1.5px solid ${BRAND.border}`, borderRadius: 9, padding: "8px 9px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <HamburgerIcon open={sidebarOpen} />
            </button>
            <div style={{ backgroundColor: BRAND.blue, padding: "5px 12px", borderRadius: 10, display: "flex", alignItems: "center", boxShadow: `0 3px 10px ${BRAND.blue}33` }}>
              <img src={aiesecLogo} alt="AIESEC PH" style={{ height: "1.1rem", width: "auto", objectFit: "contain" }} />
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 15 }}>{navIcon}</span>
              <span style={{ fontFamily: F.body, color: BRAND.text, fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{navLabel}</span>
            </div>
            <button onClick={onBack}
              style={{ backgroundColor: BRAND.white, border: `1.5px solid ${BRAND.border}`, borderRadius: 8, padding: "6px 8px", fontFamily: F.body, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer", color: BRAND.textLight, flexShrink: 0, boxShadow: `2px 2px 0 0 ${BRAND.border}` }}>
              ↲ Back
            </button>
          </div>
        )}

        {activeNav === "events"    && <EventsManager />}
        {activeNav === "incoming"  && <IncomingProducts />}
        {activeNav === "outgoing"  && <OutgoingProducts />}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${BRAND.blueMid}; border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: ${BRAND.blue}88; }
      `}</style>
    </div>
  );
}
