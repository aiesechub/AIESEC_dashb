// src/components/LoadingScreen.jsx

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const BG    = "#037ef3";
const CREAM = "#FFFBEB";

// ─────────────────────────────────────────────────────────────────────────────
// SPINNING SPOKE OVERLAYS
// In 520-wide viewBox: front wheel cx=110 (21.15%), rear cx=400 (76.92%)
// Wheel centre y=178 of 220 total → top% = 178/220 = 80.9%
// ─────────────────────────────────────────────────────────────────────────────
function SpinningSpokes() {
  const R = 13; // hub radius in px
  const wheels = [
    { left: "21.15%" },
    { left: "76.92%" },
  ];
  return (
    <>
      {wheels.map((w, i) => (
        <div key={i} style={{
          position:        "absolute",
          top:             `calc(${(178 / 220) * 100}% - ${R}px)`,
          left:            `calc(${w.left} - ${R}px)`,
          width:           R * 2,
          height:          R * 2,
          animation:       "jeeSpoke 0.48s linear infinite",
          transformOrigin: `${R}px ${R}px`,
          pointerEvents:   "none",
          zIndex:          4,
        }}>
          <svg viewBox={`0 0 ${R*2} ${R*2}`} width={R*2} height={R*2}>
            {[0, 30, 60, 90, 120, 150].map(a => {
              const rad = a * Math.PI / 180;
              return (
                <line key={a}
                  x1={R + 3 * Math.cos(rad)} y1={R + 3 * Math.sin(rad)}
                  x2={R + (R-1) * Math.cos(rad)} y2={R + (R-1) * Math.sin(rad)}
                  stroke={BG} strokeWidth="2" strokeLinecap="round"/>
              );
            })}
          </svg>
        </div>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROAD DASHES
// ─────────────────────────────────────────────────────────────────────────────
function RoadDashes() {
  return (
    <div style={{
      position: "absolute", bottom: -4,
      left: "-25%", right: "-25%",
      height: 4, display: "flex", gap: 34,
      overflow: "hidden", alignItems: "center",
    }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{
          flexShrink: 0, width: 52, height: 3, borderRadius: 2,
          backgroundColor: "rgba(255,255,255,0.28)",
          animation: `jeeRoad 0.55s linear ${-i * 0.04}s infinite`,
        }}/>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN ROOT
// ─────────────────────────────────────────────────────────────────────────────
export default function LoadingScreen({ show }) {
  const [phase, setPhase] = useState("in");
  const prevRef = useRef(true);

  useEffect(() => {
    if (prevRef.current === true && show === false) {
      setPhase("out");
      setTimeout(() => setPhase("done"), 1700);
    }
    prevRef.current = show;
  }, [show]);

  if (phase === "done") return null;
  const isOut = phase === "out";

  return (
    <>
      <style>{`
        @keyframes jeeSpoke {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes jeeRoad {
          from { transform: translateX(0); }
          to   { transform: translateX(-86px); }
        }
        @keyframes jeeSmoke {
          0%   { transform: translate(0,0) scale(0.2); opacity: 0; }
          15%  { opacity: 0.65; }
          55%  { transform: translate(var(--sx), calc(var(--sy)*0.5)) scale(1.7); opacity: 0.4; }
          100% { transform: translate(calc(var(--sx)*1.3), var(--sy)) scale(3); opacity: 0; }
        }
        @keyframes jeeBgFade {
          from { opacity: 1; } to { opacity: 0; }
        }
        @keyframes jeeBloom {
          0%   { width:50px;height:50px;margin-left:-25px;margin-top:-25px;border-radius:50%;opacity:.95; }
          100% { width:360vmax;height:360vmax;margin-left:-180vmax;margin-top:-180vmax;border-radius:0%;opacity:1; }
        }
      `}</style>

      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        backgroundColor: BG, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        pointerEvents: isOut ? "none" : "auto",
        animation: isOut ? "jeeBgFade 0.4s ease 1.3s forwards" : "none",
      }}>

        {/* Dot grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "radial-gradient(rgba(255,255,255,0.13) 1.5px, transparent 1.5px)",
          backgroundSize: "26px 26px",
        }}/>
        {/* Vignette */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.16) 100%)",
        }}/>

        <AnimatePresence>
          {!isOut && (
            <motion.div
              key="scene"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ position: "relative", width: "min(440px, 82vw)", userSelect: "none" }}
            >
              {/* Road */}
              <div style={{
                position: "absolute", bottom: -1,
                left: "-25%", right: "-25%",
                height: 2, backgroundColor: "rgba(255,255,255,0.18)",
              }}/>
              <RoadDashes/>

              {/* ── SCENE: wheels (static) + body (bobbing) stacked in same SVG coordinate space ── */}
              <div style={{ position: "relative", width: "100%" }}>

                {/* ── LAYER 1: Static wheels SVG (same viewBox as body) ── */}
                <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
                  <svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "100%", height: "auto", display: "block" }} aria-hidden>
                    <rect x="110" y="175" width="290" height="6" rx="3" fill="white" opacity="0.25"/>
                    {/* Front wheel */}
                    <circle cx="110" cy="178" r="36" fill="white"/>
                    <circle cx="110" cy="178" r="22" fill={BG}/>
                    <circle cx="110" cy="178" r="14" fill="white"/>
                    <circle cx="110" cy="178" r="7"  fill={BG}/>
                    <circle cx="110" cy="178" r="3"  fill="white"/>
                    {/* Rear wheel */}
                    <circle cx="400" cy="178" r="36" fill="white"/>
                    <circle cx="400" cy="178" r="22" fill={BG}/>
                    <circle cx="400" cy="178" r="14" fill="white"/>
                    <circle cx="400" cy="178" r="7"  fill={BG}/>
                    <circle cx="400" cy="178" r="3"  fill="white"/>
                  </svg>
                </div>

                {/* ── LAYER 2: Spinning spokes (static position, CSS spin) ── */}
                <div style={{ position: "absolute", inset: 0, zIndex: 2 }}>
                  <SpinningSpokes/>
                </div>

                {/* ── LAYER 3: Body SVG (same viewBox, bobs up/down) ── */}
                {/* This SVG has a transparent "placeholder" for the wheel area 
                    so it takes up the same space, keeping layers aligned */}
                <motion.div
                  style={{ position: "relative", width: "100%", zIndex: 3 }}
                  animate={{
                    y:      [0, -9, -3, -11, -2, 0],
                    rotate: [0, 0.4, -0.2, 0.5, -0.1, 0],
                  }}
                  transition={{
                    duration: 1.5, repeat: Infinity,
                    ease: "easeInOut", repeatType: "mirror",
                  }}
                >
                  <svg viewBox="0 0 520 220" xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "100%", height: "auto", display: "block", overflow: "visible" }} aria-hidden>

                    {/* ── ROOF RACK ── */}
                    <rect x="62"  y="8"  width="338" height="9"  rx="3" fill="white"/>
                    <rect x="65"  y="8"  width="6" height="22" fill="white"/>
                    <rect x="148" y="8"  width="6" height="22" fill="white"/>
                    <rect x="231" y="8"  width="6" height="22" fill="white"/>
                    <rect x="314" y="8"  width="6" height="22" fill="white"/>
                    <rect x="393" y="8"  width="6" height="22" fill="white"/>
                    {/* Antenna */}
                    <rect x="67" y="0"  width="4" height="10" fill="white"/>
                    <polygon points="71,1 85,5 71,9" fill="white"/>

                    {/* ── MAIN CABIN ── */}
                    <rect x="62" y="28" width="358" height="122" rx="5" fill="white"/>

                    {/* ── FRONT HOOD (stepped) ── */}
                    <rect x="26" y="50" width="40" height="18" rx="2" fill="white"/>
                    <rect x="10" y="68" width="56" height="82" rx="3" fill="white"/>
                    <polygon points="62,28 62,68 26,68 26,50 40,50 40,28" fill="white"/>
                    {/* Grille */}
                    <rect x="14" y="76" width="4" height="62" rx="1" fill={BG} opacity="0.5"/>
                    <rect x="22" y="76" width="4" height="62" rx="1" fill={BG} opacity="0.5"/>
                    <rect x="30" y="76" width="4" height="62" rx="1" fill={BG} opacity="0.5"/>
                    <rect x="38" y="76" width="4" height="62" rx="1" fill={BG} opacity="0.5"/>
                    <rect x="46" y="76" width="4" height="62" rx="1" fill={BG} opacity="0.5"/>
                    {/* Headlight */}
                    <circle cx="28" cy="130" r="10" fill={BG}/>
                    <circle cx="28" cy="130" r="6"  fill="white"/>
                    {/* Bumper */}
                    <rect x="6" y="142" width="62" height="8" rx="3" fill="white"/>

                    {/* ── WINDSHIELD ── */}
                    <polygon points="74,32 74,100 120,100 120,32" fill={BG}/>
                    <circle cx="98" cy="50" r="10" fill="white"/>
                    <path d="M86,62 Q98,55 112,60 L116,100 L80,100 Z" fill="white"/>

                    {/* ── PASSENGER WINDOW 1 ── */}
                    <rect x="134" y="32" width="108" height="70" rx="4" fill={BG}/>
                    <circle cx="156" cy="52" r="10" fill="white"/>
                    <path d="M144,66 Q156,58 168,66 L170,102 L142,102 Z" fill="white"/>
                    <circle cx="188" cy="52" r="10" fill="white"/>
                    <path d="M176,66 Q188,58 200,66 L202,102 L174,102 Z" fill="white"/>
                    <circle cx="220" cy="52" r="10" fill="white"/>
                    <path d="M208,66 Q220,58 232,66 L234,102 L206,102 Z" fill="white"/>

                    {/* ── PASSENGER WINDOW 2 ── */}
                    <rect x="254" y="32" width="108" height="70" rx="4" fill={BG}/>
                    <circle cx="276" cy="52" r="10" fill="white"/>
                    <path d="M264,66 Q276,58 288,66 L290,102 L262,102 Z" fill="white"/>
                    <circle cx="308" cy="52" r="10" fill="white"/>
                    <path d="M296,66 Q308,58 320,66 L322,102 L294,102 Z" fill="white"/>
                    <circle cx="340" cy="52" r="10" fill="white"/>
                    <path d="M328,66 Q340,58 352,66 L354,102 L326,102 Z" fill="white"/>

                    {/* ── REAR SECTION ── */}
                    <rect x="376" y="28" width="9"  height="122" rx="2" fill={BG}/>
                    <rect x="394" y="28" width="9"  height="122" rx="2" fill={BG}/>
                    <rect x="378" y="38" width="12" height="34"  rx="2" fill={BG}/>
                    <rect x="374" y="140" width="48" height="10" rx="2" fill="white"/>

                    {/* ── EXHAUST ── */}
                    <rect x="422" y="132" width="36" height="8" rx="3" fill="white"/>
                    <ellipse cx="458" cy="136" rx="5" ry="7" fill="white"/>
                  </svg>

                  {/* Smoke puffs from exhaust */}
                  <div style={{
                    position: "absolute",
                    right: "7%",
                    bottom: "30%",
                    width: 60, height: 130,
                    pointerEvents: "none", overflow: "visible",
                  }}>
                    {[
                      { delay: 0,    size: 16, sx:  8,  sy: -80  },
                      { delay: 0.35, size: 22, sx: -10, sy: -98  },
                      { delay: 0.68, size: 18, sx:  14, sy: -88  },
                      { delay: 1.02, size: 26, sx: -6,  sy: -106 },
                      { delay: 1.36, size: 18, sx:  10, sy: -84  },
                      { delay: 1.70, size: 24, sx: -12, sy: -102 },
                    ].map((p, i) => (
                      <div key={i} style={{
                        position: "absolute", bottom: 0, left: 4,
                        width: p.size, height: p.size, borderRadius: "50%",
                        border: "2px solid rgba(255,255,255,0.5)",
                        backgroundColor: "rgba(255,255,255,0.07)",
                        animation: `jeeSmoke 2.4s ease-out ${p.delay}s infinite`,
                        "--sx": `${p.sx}px`, "--sy": `${p.sy}px`,
                      }}/>
                    ))}
                  </div>
                </motion.div>

              </div>

              {/* Ground shadow */}
              <motion.div
                style={{
                  position: "absolute", bottom: -8,
                  left: "8%", right: "8%", height: 10,
                  borderRadius: "50%",
                  backgroundColor: "rgba(0,0,0,0.2)",
                  filter: "blur(7px)",
                }}
                animate={{ scaleX: [1, 0.87, 1.07, 0.84, 1], opacity: [0.55, 0.3, 0.65, 0.32, 0.55] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* EXIT BLOOM */}
        <AnimatePresence>
          {isOut && (
            <div key="bloom" aria-hidden style={{
              position: "absolute",
              top: "53%",
              left: "calc(50% + min(440px,82vw) * 0.44)",
              backgroundColor: CREAM,
              animation: "jeeBloom 1.15s cubic-bezier(0.16,1,0.3,1) forwards",
              pointerEvents: "none",
            }}/>
          )}
        </AnimatePresence>

      </div>
    </>
  );
}