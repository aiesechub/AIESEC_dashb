// Shared design tokens for admin app
export const F = {
  barabara: '"Barabara", "Impact", "Arial Black", sans-serif',
  body:     '"Inter", system-ui, sans-serif',
};

export const BRAND = {
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
export const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E")`;

// Spinner component
export function Spinner({ size = 22, color = BRAND.blue }) {
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

// Hamburger icon component
export function HamburgerIcon({ open }) {
  return (
    <div style={{ width: 16, height: 12, position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(5px) rotate(45deg)" : "none", transformOrigin: "center" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, opacity: open ? 0 : 1, transition: "opacity 0.15s" }} />
      <span style={{ display: "block", width: 16, height: 2, backgroundColor: BRAND.blue, borderRadius: 2, transition: "transform 0.22s", transform: open ? "translateY(-5px) rotate(-45deg)" : "none", transformOrigin: "center" }} />
    </div>
  );
}

// Home icon component
export function HomeIcon({ size = 16, color = BRAND.textLight }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="9,22 9,12 15,12 15,22" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Sign out icon component
export function SignOutIcon({ size = 16, color = BRAND.danger }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16,17 21,12 16,7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="21" y1="12" x2="9" y2="12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// Eye icon component
export function EyeIcon({ size = 16, color = BRAND.textLight }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
    </svg>
  );
}