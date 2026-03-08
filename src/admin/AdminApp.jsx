// src/admin/AdminApp.jsx

import aiesecLogo from '.././assets/logos/AIESEC-white.png';
import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

import EventsManager      from "./pages/EventsManager";
import AiesecProducts     from "./pages/AiesecProducts";
import EntityInformation  from "./pages/EntityInformation";
import MemberTestimonials from "./pages/MemberTestimonials";

const F = {
  barabara: '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:    '"Cubao", "Impact", "Arial Black", sans-serif',
  body:     'system-ui, sans-serif',
};

const BRAND = {
  indigo: "#312783", red: "#EF3340", green: "#00A651",
  yellow: "#FFD100", blue: "#009BD6", orange: "#F58220",
  cream:  "#FFFBEB", dark: "#1a144f",
};

const noiseOverlay = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E")`,
};

function Spinner({ size=20, color="white" }) {
  return <span style={{ width:size, height:size, border:`3px solid ${color}`, borderTopColor:"transparent", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite", flexShrink:0 }} />;
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
    } catch(err) { setErr(err.message || "Login failed. Check your credentials."); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", fontFamily:F.body }}>
      <div style={{ position:"absolute", inset:0, zIndex:0 }}>
        <img src="/src/assets/images/ph-beach.jpg" alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
      </div>
      <div style={{ position:"absolute", inset:0, zIndex:1, backgroundColor:"hsla(219,33%,43%,0.40)", mixBlendMode:"multiply" }} />
      <div style={{ position:"absolute", inset:0, pointerEvents:"none", zIndex:2, backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")` }} />
      <div style={{ position:"absolute", top:"5rem", right:0, width:"24rem", height:"24rem", backgroundColor:"#009BD6", borderRadius:"9999px", mixBlendMode:"overlay", filter:"blur(80px)", opacity:0.4, zIndex:3 }} />
      <div style={{ position:"absolute", bottom:0, left:0, width:"24rem", height:"24rem", backgroundColor:"#FFD100", borderRadius:"9999px", mixBlendMode:"overlay", filter:"blur(80px)", opacity:0.3, zIndex:3 }} />

      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"4rem", display:"flex", zIndex:5 }}>
        {Array.from({length:28},(_,i)=>i+1).map(num=>(
          <img key={num} src={`/break/${num}.svg`} alt="" style={{ flex:1, width:0, height:"100%", objectFit:"cover", display:"block" }} />
        ))}
      </div>

      <div style={{ position:"relative", zIndex:20, width:"100%", maxWidth:400, padding:"0 16px", boxSizing:"border-box" }}>
        <div style={{ position:"absolute", inset:0, backgroundColor:BRAND.yellow, transform:"translate(8px,8px)", border:"4px solid black" }} />
        <div style={{ position:"relative", backgroundColor:"white", border:"4px solid black", padding:"32px 28px", boxShadow:"8px 8px 0 0 black" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ position:"relative", backgroundColor:"#037ef3", padding:"0.75rem 1.25rem", borderRadius:"0.5rem", transform:"rotate(-2deg)", transition:"transform 0.2s", display:"inline-flex", alignItems:"center", border:"3px solid black", boxShadow:"4px 4px 0 0 black" }}
              onMouseEnter={e=>e.currentTarget.style.transform="rotate(0deg)"} onMouseLeave={e=>e.currentTarget.style.transform="rotate(-2deg)"}>
              <img src="/src/assets/logos/AIESEC-white.png" alt="AIESEC PH" style={{ height:"2rem", width:"auto", objectFit:"contain" }} />
            </div>
          </div>
          <div style={{ textAlign:"center", marginTop:14, marginBottom:22 }}>
            <span style={{ fontFamily:F.barabara, display:"inline-block", backgroundColor:"black", color:BRAND.yellow, padding:"5px 18px", fontSize:13, textTransform:"uppercase", letterSpacing:"0.2em" }}>SIGN IN TO ADMIN PORTAL</span>
          </div>
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ display:"block", fontFamily:F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#374151", marginBottom:5 }}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@aiesec.ph" autoComplete="email"
                style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 14px", fontFamily:F.body, fontSize:13, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
            </div>
            <div>
              <label style={{ display:"block", fontFamily:F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.2em", color:"#374151", marginBottom:5 }}>Password</label>
              <div style={{ position:"relative" }}>
                <input type={showPw?"text":"password"} value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" autoComplete="current-password"
                  style={{ width:"100%", boxSizing:"border-box", border:"3px solid black", padding:"10px 52px 10px 14px", fontFamily:F.body, fontSize:13, fontWeight:700, backgroundColor:BRAND.cream, outline:"none" }} />
                <button type="button" onClick={()=>setShowPw(v=>!v)}
                  style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", fontFamily:F.body, fontSize:9, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.1em", color:"#9ca3af", border:"none", background:"none", cursor:"pointer", padding:4 }}>
                  {showPw?"HIDE":"SHOW"}
                </button>
              </div>
            </div>
            {err && <div style={{ backgroundColor:"#FFF0F1", border:"3px solid "+BRAND.red, padding:"8px 12px", fontFamily:F.barabara, fontSize:11, color:BRAND.red, textTransform:"uppercase", letterSpacing:"0.05em" }}>✕ {err}</div>}
            <button type="submit" disabled={loading}
              style={{ marginTop:4, backgroundColor:BRAND.indigo, color:"white", border:"4px solid black", padding:"14px", fontFamily:F.barabara, fontSize:15, textTransform:"uppercase", letterSpacing:"0.18em", cursor:loading?"not-allowed":"pointer", boxShadow:"5px 5px 0 0 "+BRAND.yellow, transition:"all 0.12s", display:"flex", alignItems:"center", justifyContent:"center", gap:8, opacity:loading?0.7:1 }}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.transform="translate(5px,5px)";e.currentTarget.style.boxShadow="none";}}}
              onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="5px 5px 0 0 "+BRAND.yellow;}}>
              {loading && <Spinner size={14} />}
              {loading ? "Signing In…" : "→ Sign In"}
            </button>
          </form>
          <p style={{ fontFamily:F.body, textAlign:"center", fontSize:9, color:"#9ca3af", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.15em", marginTop:20 }}>AIESEC in the Philippines · Admin Only</p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── NAV ──────────────────────────────────────────────────────────────────────
const NAV = [
  { id:"events",       icon:"📸", label:"Photo Collection"       },
  { id:"products",     icon:"🌏", label:"AIESEC Products"     },
  { id:"routes",       icon:"🚌", label:"Entity Information"  },
  { id:"testimonials", icon:"✨", label:"Member Testimonials" },
];

// ─── HAMBURGER ────────────────────────────────────────────────────────────────
function HamburgerIcon({ open }) {
  return (
    <div style={{ width:14, height:11, position:'relative', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <span style={{ display:'block', width:14, height:2, backgroundColor:BRAND.yellow, transition:'transform 0.22s ease', transform:open?'translateY(4.5px) rotate(45deg)':'none', transformOrigin:'center' }} />
      <span style={{ display:'block', width:14, height:2, backgroundColor:BRAND.yellow, transition:'opacity 0.15s ease', opacity:open?0:1 }} />
      <span style={{ display:'block', width:14, height:2, backgroundColor:BRAND.yellow, transition:'transform 0.22s ease', transform:open?'translateY(-4.5px) rotate(-45deg)':'none', transformOrigin:'center' }} />
    </div>
  );
}

// ─── SIDEBAR LOGO ─────────────────────────────────────────────────────────────
// Blue container tilts, logo stays upright. Collapse button sits top-right of the container.
function SidebarLogo({ onCollapse }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'flex-start', position:'relative', padding:'20px 14px 16px' }}>
      {/* Tilted blue container — logo counter-rotates to stay upright */}
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'relative',
          backgroundColor: '#037ef3',
          padding: '0.6rem 1.1rem',
          borderRadius: '0.5rem',
          border: '3px solid black',
          boxShadow: hovered ? '3px 3px 0 0 black' : '5px 5px 0 0 black',
          transform: hovered ? 'rotate(0deg)' : 'rotate(-2deg)',
          transition: 'transform 0.22s ease, box-shadow 0.22s ease',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Logo counter-rotates to always stay upright */}
        <img
          src={aiesecLogo}
          alt="AIESEC PH"
          style={{
            height: '1.9rem',
            width: 'auto',
            objectFit: 'contain',
            transform: hovered ? 'rotate(0deg)' : 'rotate(2deg)',
            transition: 'transform 0.22s ease',
            display: 'block',
          }}
        />

        {/* Collapse button — small, top-right corner of the container */}
        <button
          onClick={onCollapse}
          title="Collapse sidebar"
          style={{
            position: 'absolute',
            top: -10,
            right: -10,
            width: 20,
            height: 20,
            backgroundColor: BRAND.dark,
            border: '2px solid rgba(255,255,255,0.25)',
            borderRadius: '50%',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            // counter-rotate so it stays upright regardless of parent tilt
            transform: hovered ? 'rotate(0deg)' : 'rotate(2deg)',
            transition: 'transform 0.22s ease, background-color 0.15s',
            zIndex: 10,
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = BRAND.indigo}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND.dark}
        >
          <span style={{ color: BRAND.yellow, fontSize: 10, lineHeight: 1, display: 'block' }}>←</span>
        </button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ session }) {
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
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const navLabel = NAV.find(n=>n.id===activeNav)?.label || '';
  const navIcon  = NAV.find(n=>n.id===activeNav)?.icon  || '';

  const handleNavSelect = (id) => {
    setActiveNav(id);
    if (isMobile) setSidebarOpen(false);
  };

  return (
    <div style={{ height:"100vh", display:"flex", overflow:"hidden", fontFamily:F.body, backgroundColor:BRAND.cream, position:'relative' }}>

      {/* Mobile backdrop */}
      {isMobile && sidebarOpen && (
        <div onClick={()=>setSidebarOpen(false)}
          style={{ position:'fixed', inset:0, zIndex:40, backgroundColor:'rgba(0,0,0,0.55)', backdropFilter:'blur(3px)' }} />
      )}

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: sidebarOpen ? 200 : (isMobile ? 0 : 54),
        flexShrink: 0,
        backgroundColor: BRAND.dark,
        borderRight: sidebarOpen || !isMobile ? "4px solid black" : "none",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        position: isMobile ? 'fixed' : 'relative',
        left: 0, top: 0, bottom: 0,
        zIndex: isMobile ? 50 : 'auto',
        ...noiseOverlay,
      }}>

        {/* Logo section */}
        {sidebarOpen ? (
          <>
            <SidebarLogo onCollapse={() => setSidebarOpen(false)} />
            <div style={{ textAlign:"center", paddingBottom: 12, flexShrink: 0 }}>
              <span style={{ fontFamily:F.barabara, display:'inline-block', color:BRAND.yellow, padding:"3px 10px", fontSize:10, textTransform:"uppercase", letterSpacing:"0.25em", whiteSpace:'nowrap', border: '2px solid rgba(255,255,255,0.15)', boxShadow: '3px 3px 0 0 black' }}>ADMIN PORTAL</span>
            </div>
            <div style={{ height: 4, flexShrink: 0, backgroundColor: 'rgba(255,255,255,0.06)', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
          </>
        ) : (
          <div style={{ padding:"14px 8px", borderBottom:"4px solid rgba(255,255,255,0.08)", flexShrink:0, display:'flex', justifyContent:'center' }}>
            <button onClick={()=>setSidebarOpen(true)}
              style={{ backgroundColor:'transparent', border:'2px solid rgba(255,255,255,0.15)', borderRadius:4, padding:'8px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <HamburgerIcon open={false} />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex:1, padding: sidebarOpen ? "10px 8px" : "10px 6px", display:"flex", flexDirection:"column", gap:3, overflowY:"auto", backgroundColor:BRAND.cream }}>
          {sidebarOpen && (
            <p style={{ fontFamily:F.body, fontSize:8, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.25em", color:"#a18a2a", padding:"6px 8px 3px", margin:0, whiteSpace:'nowrap' }}>Content</p>
          )}
          {NAV.map(item => {
            const active = activeNav === item.id;
            return (
              <button key={item.id} onClick={()=>handleNavSelect(item.id)} title={!sidebarOpen ? item.label : undefined}
                style={{
                  display:"flex", alignItems:"center",
                  gap: sidebarOpen ? 10 : 0,
                  justifyContent: sidebarOpen ? 'flex-start' : 'center',
                  padding: sidebarOpen ? "10px 12px" : "10px 6px",
                  border: active ? "3px solid black" : "3px solid transparent",
                  fontFamily:F.barabara, fontSize:11, textTransform:"uppercase", letterSpacing:"0.1em",
                  cursor:"pointer",
                  backgroundColor: active ? BRAND.indigo : "transparent",
                  color: active ? BRAND.yellow : "#5c4b00",
                  boxShadow: active ? "3px 3px 0 0 black" : "none",
                  transition:"all 0.12s",
                  width:"100%",
                  whiteSpace:'normal',
                  alignItems:'flex-start',
                }}
                onMouseEnter={e=>{ if(!active){e.currentTarget.style.backgroundColor="rgba(49,39,131,0.08)"; e.currentTarget.style.color=BRAND.indigo;} }}
                onMouseLeave={e=>{ if(!active){e.currentTarget.style.backgroundColor="transparent"; e.currentTarget.style.color="#5c4b00";} }}>
                <span style={{ fontSize:14, flexShrink:0, marginTop:1 }}>{item.icon}</span>
                {sidebarOpen && <span style={{ flex:1, textAlign:"left", lineHeight:1.3 }}>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User / sign-out */}
        {sidebarOpen ? (
          <div style={{ borderTop:"4px solid black", padding:"12px 14px", backgroundColor:"#1a144f", flexShrink:0 }}>
            <p style={{ fontFamily:F.body, fontSize:9, color:BRAND.yellow, fontWeight:700, margin:"0 0 8px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{session?.user?.email}</p>
            <button onClick={()=>supabase.auth.signOut()}
              style={{ width:"100%", padding:"8px 0", border:"2px solid rgba(255,255,255,0.15)", fontFamily:F.barabara, fontSize:10, textTransform:"uppercase", letterSpacing:"0.15em", cursor:"pointer", backgroundColor:"transparent", color:"#818cf8", transition:"all 0.12s" }}
              onMouseEnter={e=>{e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#818cf8";}}>
              ← Sign Out
            </button>
          </div>
        ) : !isMobile && (
          <div style={{ borderTop:"4px solid black", padding:"10px 6px", backgroundColor:"#1a144f", flexShrink:0, display:'flex', justifyContent:'center' }}>
            <button onClick={()=>supabase.auth.signOut()} title="Sign Out"
              style={{ width:34, height:34, border:"2px solid rgba(255,255,255,0.15)", fontFamily:F.barabara, fontSize:14, cursor:"pointer", backgroundColor:"transparent", color:"#818cf8", display:'flex', alignItems:'center', justifyContent:'center', borderRadius:4 }}
              onMouseEnter={e=>{e.currentTarget.style.backgroundColor="rgba(255,255,255,0.1)";e.currentTarget.style.color="white";}}
              onMouseLeave={e=>{e.currentTarget.style.backgroundColor="transparent";e.currentTarget.style.color="#818cf8";}}>←</button>
          </div>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden", backgroundColor:BRAND.cream, ...noiseOverlay, minWidth:0 }}>

        {/* Mobile top bar */}
        {isMobile && (
          <div style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 14px', backgroundColor:BRAND.dark, borderBottom:'4px solid black', flexShrink:0 }}>
            <button onClick={()=>setSidebarOpen(v=>!v)}
              style={{ backgroundColor:'transparent', border:'2px solid rgba(255,255,255,0.2)', borderRadius:4, padding:'7px 9px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <HamburgerIcon open={sidebarOpen} />
            </button>
            <div style={{ backgroundColor:"#037ef3", padding:"4px 10px", borderRadius:"6px", border:"2px solid black", display:'flex', alignItems:'center' }}>
              <img src={aiesecLogo} alt="AIESEC PH" style={{ height:"1.2rem", width:"auto", objectFit:"contain" }} />
            </div>
            <div style={{ flex:1, display:'flex', alignItems:'center', gap:8, minWidth:0 }}>
              <span style={{fontSize:16}}>{navIcon}</span>
              <span style={{ fontFamily:F.barabara, color:BRAND.yellow, fontSize:13, textTransform:'uppercase', letterSpacing:'0.08em', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{navLabel}</span>
            </div>
            <button onClick={()=>supabase.auth.signOut()}
              style={{ backgroundColor:'transparent', border:'2px solid rgba(255,255,255,0.15)', padding:'6px 10px', fontFamily:F.barabara, fontSize:9, textTransform:'uppercase', letterSpacing:'0.1em', cursor:'pointer', color:'#818cf8', flexShrink:0, borderRadius:3 }}>← Out</button>
          </div>
        )}

        {activeNav==="events"       && <EventsManager />}
        {activeNav==="products"     && <AiesecProducts />}
        {activeNav==="routes"       && <EntityInformation />}
        {activeNav==="testimonials" && <MemberTestimonials />}
      </main>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function AdminApp() {
  const [session, setSession] = useState(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({data})=>setSession(data.session));
    const { data:{subscription} } = supabase.auth.onAuthStateChange((_,s)=>setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  if (session===undefined) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", backgroundColor:BRAND.cream }}>
      <Spinner size={36} color={BRAND.indigo} />
    </div>
  );
  if (!session) return <LoginScreen />;
  return <Dashboard session={session} />;
}