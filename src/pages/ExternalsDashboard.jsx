import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase";
import aiesecLogo from './../assets/logos/AIESEC-white.png';
import { F, HamburgerIcon, HomeIcon, SignOutIcon, EyeIcon } from "../lib/constants.jsx";
import EventsManager from "./EventsManager";
import Opportunities from "./Opportunities";

const NAV = [
  { id: "events", icon: <PhotoIcon />, label: "Photos" },
  { id: "opportunities", icon: <EarthIcon />, label: "Global" },
];

// ─── MINIMAL ICONS ──────────────────────────────────────────────────────
function PhotoIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>; }
function EarthIcon() { return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>; }

export default function ExternalsDashboard({ session, onBack }) {
  const [activeNav, setActiveNav] = useState("events");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const eventsRef = useRef(null);
  const opportunitiesRef = useRef(null);

  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setSidebarOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const appBg = "#f4f7fa";

  return (
    <div style={{
      height: "100vh", display: "flex", overflow: "hidden",
      fontFamily: F.body, backgroundColor: appBg, position: "relative",
    }}>

      {/* ── FLOATING HAMBURGER (Top Left when closed) ── */}
      {!sidebarOpen && (
        <button 
          onClick={() => setSidebarOpen(true)}
          style={{
            position: "absolute", top: "24px", left: "24px", zIndex: 100,
            width: "42px", height: "42px", borderRadius: "10px",
            backgroundColor: "white", border: "1px solid #e5e7eb",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", color: "#037ef3"
          }}>
          <HamburgerIcon open={false} />
        </button>
      )}

      {/* ── SIDEBAR (Slim & Sleek) ── */}
      <aside style={{
        width: sidebarOpen ? "220px" : "0px",
        opacity: sidebarOpen ? 1 : 0,
        transform: sidebarOpen ? "translateX(0)" : "translateX(-20px)",
        flexShrink: 0,
        display: "flex", flexDirection: "column",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        position: isMobile ? "fixed" : "relative",
        zIndex: 90, height: "100%", 
        padding: sidebarOpen ? "24px 16px" : "24px 0",
      }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{
            backgroundColor: "#037ef3", padding: "10px", borderRadius: "12px",
            display: "inline-flex", boxShadow: "0 8px 16px rgba(3, 126, 243, 0.2)"
          }}>
            <img src={aiesecLogo} alt="AIESEC" style={{ height: "1rem" }} />
          </div>
          <p style={{ 
            marginTop: "14px", fontSize: "9px", fontWeight: "900", 
            color: "#94a3b8", textTransform: "uppercase", letterSpacing: "2.5px" 
          }}>
            Externals
          </p>
        </div>

        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={() => { setActiveNav(item.id); if (isMobile) setSidebarOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px",
                  border: "none", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s",
                  backgroundColor: active ? "#037ef3" : "transparent",
                  color: active ? "white" : "#64748b", fontWeight: active ? "600" : "500",
                  boxShadow: active ? "0 4px 12px rgba(3, 126, 243, 0.2)" : "none",
                }}>
                {item.icon}
                {sidebarOpen && <span style={{ fontSize: "13.5px" }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "20px" }}>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={onBack} title="Home"
              style={{ flex: 1, height: "38px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
              <HomeIcon size={18} />
            </button>
            <button onClick={() => setSidebarOpen(false)} title="Collapse"
              style={{ flex: 1, height: "38px", borderRadius: "10px", border: "1px solid #e2e8f0", backgroundColor: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b" }}>
              <EyeIcon size={18} />
            </button>
          </div>

          <button 
            onClick={() => supabase.auth.signOut()}
            style={{
              width: "100%", padding: "12px", borderRadius: "10px",
              backgroundColor: "#ef4444", color: "white", border: "none",
              fontWeight: "700", fontSize: "11px", textTransform: "uppercase",
              letterSpacing: "1px", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center", gap: "8px",
            }}
          >
            <SignOutIcon size={16} /> {sidebarOpen && "SIGN OUT"}
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT CANVAS ── */}
      <main style={{ 
        flex: 1, position: "relative",
        padding: isMobile ? "0" : "16px 16px 16px 0", 
        display: "flex", flexDirection: "column",
        transition: "padding 0.4s ease",
        minWidth: 0,
      }}>
        <div style={{
          flex: 1, backgroundColor: "white",
          borderRadius: isMobile ? "0" : "24px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.03)",
          border: "1px solid #edf2f7",
          overflow: "hidden", 
          display: "flex", flexDirection: "column",
          padding: isMobile ? "80px 20px 20px" : "0",
          minWidth: 0,
        }}>
          {/* LOAD THE SELECTED PAGE COMPONENT HERE */}
          <section style={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 }}>
            {activeNav === "events" && <EventsManager ref={eventsRef} />}
            {activeNav === "opportunities" && <Opportunities ref={opportunitiesRef} />}
          </section>
        </div>
      </main>

      <style>{`
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #037ef3; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}