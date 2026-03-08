// src/admin/tabs/MemberTestimonials.jsx
const BRAND = {
  indigo: "#312783", red: "#EF3340", green: "#00A651",
  yellow: "#FFD100", blue: "#009BD6", orange: "#F58220",
  cream:  "#FFFBEB",
};
const F = {
  barabara:   '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:      '"Cubao", "Impact", "Arial Black", sans-serif',
  body:       'system-ui, sans-serif',
};

export default function MemberTestimonials() {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"100%", gap:20, padding:40 }}>
      <div style={{ position:"relative", marginBottom:8 }}>
        <div style={{ position:"absolute", inset:0, backgroundColor:BRAND.yellow, transform:"translate(6px,6px)", border:"4px solid black" }} />
        <div style={{ position:"relative", backgroundColor:"black", padding:"18px 40px", border:"4px solid black", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <span style={{ fontSize:48, filter:"drop-shadow(2px 2px 0 rgba(255,255,255,0.2))" }}>✨</span>
          <span style={{ fontFamily: F.barabara, color:BRAND.yellow, fontWeight:500, fontSize:20, textTransform:"uppercase", letterSpacing:"0.15em", whiteSpace:"nowrap" }}>
            Member Testimonials
          </span>
        </div>
      </div>
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
      <div style={{ width:200, height:5, background:`linear-gradient(to right,${BRAND.red},${BRAND.yellow},${BRAND.green},${BRAND.blue},${BRAND.orange},${BRAND.red})`, marginTop:8 }} />
    </div>
  );
}