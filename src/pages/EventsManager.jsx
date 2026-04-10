// src/admin/pages/EventsManager.jsx

import { useState, useEffect, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  getAllEvents, createEvent, updateEvent,
  deleteEvent, reorderEvents,
  uploadEventPhoto, deleteEventPhoto,
} from '../lib/supabase';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const F = {
  bara:       '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:      '"Cubao", "Impact", "Arial Black", sans-serif',
  pipanganan: '"Pipanganan", "Impact", "Arial Black", sans-serif',
  rounded:    '"Varela Round", system-ui, sans-serif',
  body:       '"Inter", system-ui, sans-serif',
};

// ── Core palette ──────────────────────────────────────────────────────────────
const C = {
  blue:       '#037ef3',
  blueDark:   '#0262c0',
  blueLight:  '#e8f3fd',
  blueMid:    '#cce4fb',
  navy:       '#0a1628',
  navyMid:    '#122040',
  white:      '#ffffff',
  surface:    '#f8fafc',
  border:     '#e2e8f0',
  borderMid:  '#cbd5e1',
  text:       '#0f172a',
  textMid:    '#475569',
  textMuted:  '#94a3b8',
  green:      '#10b981',
  greenLight: '#d1fae5',
  red:        '#ef4444',
  redLight:   '#fee2e2',
  amber:      '#f59e0b',
  amberLight: '#fef3c7',
  // keep original brand colors for FiestaStripe & polaroid tints
  brandRed:   '#EF3340',
  brandYellow:'#FFD100',
  brandGreen: '#00A651',
  brandBlue:  '#009BD6',
  brandOrange:'#F58220',
};

// Keep original color map for polaroid cards (unchanged)
const COLOR_MAP = {
  yellow: { bg: '#EAB308', light: '#FEF9C3', label: 'Yellow' },
  rose:   { bg: '#F43F5E', light: '#FFF1F2', label: 'Rose'   },
  teal:   { bg: '#0D9488', light: '#F0FDFA', label: 'Teal'   },
  orange: { bg: '#F97316', light: '#FFF7ED', label: 'Orange' },
  blue:   { bg: '#3B82F6', light: '#EFF6FF', label: 'Blue'   },
  indigo: { bg: '#4F46E5', light: '#EEF2FF', label: 'Indigo' },
  green:  { bg: '#22C55E', light: '#F0FDF4', label: 'Green'  },
  red:    { bg: '#DC2626', light: '#FEF2F2', label: 'Red'    },
};

const TAILWIND_TO_KEY = {
  'bg-yellow-500': 'yellow', 'bg-rose-500': 'rose',
  'bg-teal-600':   'teal',   'bg-orange-500': 'orange',
  'bg-blue-500':   'blue',   'bg-indigo-600': 'indigo',
  'bg-green-500':  'green',  'bg-red-600': 'red',
};

const TAILWIND_TO_DEG = {
  '-rotate-2': -2, '-rotate-1': -1,
  'rotate-0': 0, 'rotate-1': 1, 'rotate-2': 2,
};

const FEATURED_LIMIT    = 10;
const LIBRARY_PAGE_SIZE = 10;
const MODAL_PAGE_SIZE   = 10;
const TILT_SEQUENCE     = [-2, 1, -1, 2, -2, 0, 1, -1, 2, -2];
const MONTHS_SHORT      = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const EMPTY_EVENT = {
  title: '', date: '', location: '', image_url: '',
  tag: '', color: 'yellow', rotation: -1,
  display_order: 0, is_active: true, is_featured: false, description: '',
};

const normalise = (row) => ({
  ...row,
  color:       TAILWIND_TO_KEY[row.color]    ?? row.color    ?? 'yellow',
  rotation:    TAILWIND_TO_DEG[row.rotation] ?? row.rotation ?? -1,
  is_featured: row.is_featured ?? false,
  description: row.description ?? '',
});

const denormalise = (form) => ({ ...form });
const getColor    = (k) => COLOR_MAP[k] || COLOR_MAP.yellow;

// ─── HELPERS ──────────────────────────────────────────────────────────────────

// FiestaStripe — kept exactly as brand element
const FiestaStripe = ({ height = 5 }) => (
  <div style={{
    height, flexShrink: 0,
    background: `linear-gradient(to right, ${C.brandRed}, ${C.brandYellow}, ${C.brandGreen}, ${C.brandBlue}, ${C.brandOrange}, ${C.brandRed})`,
  }} />
);

function Spinner({ size = 20, color = C.blue }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}20`, borderTopColor: color,
      borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.7s linear infinite', flexShrink: 0,
    }} />
  );
}

function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '12px 18px',
      backgroundColor: type === 'success' ? C.navy : C.red,
      border: `1px solid ${type === 'success' ? C.blue : C.redLight}`,
      boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      fontFamily: F.rounded, fontWeight: 700, fontSize: 12,
      color: 'white', borderRadius: 10,
      animation: 'toastIn 0.3s ease', maxWidth: 'calc(100vw - 48px)',
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        backgroundColor: type === 'success' ? C.green : C.redLight,
        color: type === 'success' ? C.white : C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
      }}>{type === 'success' ? '✓' : '✕'}</span>
      {msg}
    </div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 14px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <PaginationBtn onClick={() => onPage(page - 1)} disabled={page === 1} label="‹" />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          width: 26, height: 26, border: `1px solid ${p === page ? C.blue : C.border}`,
          backgroundColor: p === page ? C.blue : C.white,
          color: p === page ? C.white : C.textMuted,
          cursor: 'pointer', fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 6, transition: 'all 0.15s',
          boxShadow: p === page ? `0 2px 6px ${C.blue}40` : 'none',
        }}>{p}</button>
      ))}
      <PaginationBtn onClick={() => onPage(page + 1)} disabled={page === totalPages} label="›" />
    </div>
  );
}

function PaginationBtn({ onClick, disabled, label }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      width: 28, height: 28, border: `1px solid ${disabled ? C.border : C.borderMid}`,
      backgroundColor: disabled ? C.surface : C.white,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F.body, fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: disabled ? C.textMuted : C.text, borderRadius: 6,
      transition: 'all 0.15s', boxShadow: disabled ? 'none' : '0 1px 3px rgba(0,0,0,0.06)',
    }}>{label}</button>
  );
}

// ─── MODERN DATE PICKER ────────────────────────────────────────────────────────
function DatePicker({ value, onChange, error }) {
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => {
    if (value) { const p = value.split(' '); return p.length === 3 ? parseInt(p[2]) : new Date().getFullYear(); }
    return new Date().getFullYear();
  });
  const [viewMonth, setViewMonth] = useState(() => {
    if (value) { const p = value.split(' '); const idx = MONTHS_SHORT.indexOf(p[0]); return idx >= 0 ? idx : new Date().getMonth(); }
    return new Date().getMonth();
  });
  const ref = useRef();

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const selDay  = value ? parseInt(value.split(' ')[1]) : null;
  const selMon  = value ? MONTHS_SHORT.indexOf(value.split(' ')[0]) : null;
  const selYear = value ? parseInt(value.split(' ')[2]) : null;
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();

  const selectDay = (d) => {
    onChange(`${MONTHS_SHORT[viewMonth]} ${String(d).padStart(2,'0')}, ${viewYear}`);
    setOpen(false);
  };
  const prevMonth = () => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); };
  const nextMonth = () => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); };
  const isSelected = (d) => selDay === d && selMon === viewMonth && selYear === viewYear;
  const isToday    = (d) => today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <FieldLabel required>Date</FieldLabel>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', boxSizing: 'border-box',
        border: `1px solid ${error ? C.red : open ? C.blue : C.border}`,
        borderRadius: 8, padding: '9px 12px',
        fontFamily: F.body, fontSize: 13, fontWeight: 600,
        backgroundColor: C.white, outline: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: value ? C.text : C.textMuted,
        boxShadow: open ? `0 0 0 3px ${C.blue}20` : '0 1px 3px rgba(0,0,0,0.06)',
        transition: 'all 0.15s',
      }}>
        <span>{value || 'Pick a date…'}</span>
        <span style={{ fontSize: 14 }}>📅</span>
      </button>
      {error && <FieldError>{error}</FieldError>}

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: 'white', border: `1px solid ${C.border}`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.14)', width: 280,
          overflow: 'hidden', borderRadius: 12,
        }}>
          <div style={{ backgroundColor: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px' }}>
            <CalNavBtn onClick={prevMonth}>‹</CalNavBtn>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: F.bara, color: C.blue, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{MONTHS_SHORT[viewMonth]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 3 }}>
                <button onClick={() => setViewYear(y => y - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 11, fontFamily: F.body }}>−</button>
                <span style={{ fontFamily: F.body, fontWeight: 700, color: 'white', fontSize: 13 }}>{viewYear}</span>
                <button onClick={() => setViewYear(y => y + 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.45)', cursor: 'pointer', fontSize: 11, fontFamily: F.body }}>+</button>
              </div>
            </div>
            <CalNavBtn onClick={nextMonth}>›</CalNavBtn>
          </div>
          <FiestaStripe height={3} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', backgroundColor: C.surface, borderBottom: `1px solid ${C.border}` }}>
            {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
              <div key={d} style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, textAlign: 'center', padding: '6px 0', color: C.textMuted, letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '6px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <button key={d} onClick={() => selectDay(d)} style={{
                aspectRatio: '1/1', border: isSelected(d) ? `2px solid ${C.blue}` : '1px solid transparent',
                backgroundColor: isSelected(d) ? C.blue : isToday(d) ? C.blueLight : 'white',
                color: isSelected(d) ? 'white' : isToday(d) ? C.blue : C.text,
                fontFamily: F.rounded, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, transition: 'all 0.12s',
              }}
                onMouseEnter={e => { if (!isSelected(d)) e.currentTarget.style.backgroundColor = C.blueLight; }}
                onMouseLeave={e => { if (!isSelected(d)) e.currentTarget.style.backgroundColor = isToday(d) ? C.blueLight : 'white'; }}
              >{d}</button>
            ))}
          </div>
          {value && (
            <div style={{ borderTop: `1px solid ${C.border}`, padding: '6px 8px' }}>
              <button onClick={() => { onChange(''); setOpen(false); }} style={{ width: '100%', padding: '6px 0', border: `1px solid ${C.border}`, borderRadius: 6, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: 'white', color: C.textMuted }}>
                ✕ Clear Date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CalNavBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', cursor: 'pointer', width: 28, height: 28, fontFamily: F.body, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, transition: 'all 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
    >{children}</button>
  );
}

// ─── REUSABLE FORM ATOMS ──────────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontFamily: F.rounded, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', color: C.textMid, marginBottom: 5 }}>
      {children} {required && <span style={{ color: C.red }}>*</span>}
    </label>
  );
}

function FieldError({ children }) {
  return <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0' }}>✕ {children}</p>;
}

function ModernInput({ value, onChange, placeholder, error, multiline, rows }) {
  const shared = {
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${error ? C.red : C.border}`,
    borderRadius: 8, padding: '9px 12px',
    fontFamily: F.body, fontSize: 13, fontWeight: 600,
    backgroundColor: C.white, outline: 'none', color: C.text,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)', transition: 'all 0.15s',
    lineHeight: 1.5,
  };
  if (multiline) return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows || 4}
      style={{ ...shared, resize: 'vertical' }}
      onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20`; }}
      onBlur={e => { e.target.style.borderColor = error ? C.red : C.border; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    />
  );
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={shared}
      onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = `0 0 0 3px ${C.blue}20`; }}
      onBlur={e => { e.target.style.borderColor = error ? C.red : C.border; e.target.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'; }}
    />
  );
}

// ─── POLAROID PREVIEW — UNCHANGED (mirrors EventsFeature.jsx exactly) ─────────
const B = {
  black: '#0a0a0a', cream: '#FFFBEB',
  indigo: '#312783', red: '#EF3340', yellow: '#FFD100', blue: '#009BD6',
  rounded: '"Varela Round", system-ui, sans-serif',
  bara: '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao: '"Cubao", "Impact", "Arial Black", sans-serif',
  pipanganan: '"Pipanganan", "Impact", "Arial Black", sans-serif',
};

function PolaroidPreviewCard({ event, tiltDeg, isHovered, onMouseEnter, onMouseLeave, inCarousel }) {
  const c = getColor(event.color);
  const deg = tiltDeg !== undefined ? tiltDeg : (event.rotation ?? 0);
  const transform = isHovered
    ? 'rotate(0deg) translateY(-14px) scale(1.05)'
    : `rotate(${deg}deg)`;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        flexShrink: inCarousel ? 0 : undefined,
        width: inCarousel ? 200 : undefined,
        padding: inCarousel ? '20px 14px' : undefined,
        cursor: inCarousel ? 'default' : undefined,
        display: inCarousel ? undefined : 'inline-block',
        transform: inCarousel ? undefined : `rotate(${deg}deg)`,
        transition: inCarousel ? undefined : 'all 0.25s',
      }}
    >
      <div style={{
        position: 'relative',
        background: 'white', border: `3px solid ${B.black}`, padding: 8,
        boxShadow: isHovered ? '8px 8px 0 rgba(0,0,0,1)' : '4px 4px 0 rgba(0,0,0,0.85)',
        width: inCarousel ? '100%' : 130,
        transform: inCarousel ? transform : undefined,
        transition: inCarousel ? 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease' : undefined,
        willChange: inCarousel ? 'transform' : undefined,
      }}>
        {/* Date badge */}
        <div style={{
          position: 'absolute', top: -14, right: -14, zIndex: 20,
          width: 40, height: 40, background: 'white',
          border: `2px solid ${B.black}`, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `1px 1px 0 ${B.black}`,
        }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 900, fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>
            {(event.date || '—').split(' ')[0]}
          </span>
        </div>

        {/* Image */}
        <div style={{
          position: 'relative', aspectRatio: '1/1', overflow: 'hidden',
          border: `2px solid ${B.black}`, background: c.light,
        }}>
          {event.image_url
            ? <img src={event.image_url} alt={event.title} style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'filter 0.5s ease, transform 0.5s ease',
              }} />
            : <div style={{
                width: '100%', height: '100%', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontFamily: F.bara, fontSize: 8, textTransform: 'uppercase',
                letterSpacing: 2, color: c.bg, opacity: 0.6,
              }}>No Photo</div>
          }
          <div style={{
            position: 'absolute', inset: 0, background: c.bg,
            mixBlendMode: 'multiply', opacity: isHovered ? 0 : 0.18,
            transition: 'opacity 0.4s ease',
          }} />
        </div>

        {/* Text */}
        <div style={{ padding: '10px 4px 4px' }}>
          <span style={{
            display: 'inline-block', fontFamily: F.rounded, fontWeight: 800,
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'white', padding: '2px 6px',
            background: c.bg, border: `1px solid ${B.black}`, marginBottom: 4,
          }}>{event.tag || 'Tag'}</span>
          <p style={{
            fontFamily: F.pipanganan, fontSize: inCarousel ? 14 : 12,
            textTransform: 'uppercase', lineHeight: 1.15, margin: 0,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{event.title || 'Title'}</p>
          <p style={{
            fontFamily: F.rounded, fontWeight: 700, fontSize: inCarousel ? 10 : 9,
            color: '#6b7280', margin: '3px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{event.location || 'Location'}</p>
        </div>
      </div>
    </div>
  );
}

// ─── PHOTO UPLOADER ───────────────────────────────────────────────────────────
function PhotoUploader({ currentUrl, onUploaded, error }) {
  const [uploading, setUploading] = useState(false);
  const [pct, setPct]             = useState(0);
  const [err, setErr]             = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setErr('Image must be under 5 MB.'); return; }
    setErr(''); setUploading(true); setPct(10);
    const ticker = setInterval(() => setPct(p => Math.min(p + 15, 85)), 300);
    try {
      const url = await uploadEventPhoto(file);
      clearInterval(ticker); setPct(100);
      setTimeout(() => { onUploaded(url); setUploading(false); setPct(0); }, 500);
    } catch (e) {
      clearInterval(ticker); setErr(e.message || 'Upload failed.');
      setUploading(false); setPct(0);
    }
  };

  return (
    <>
      <FieldLabel required>Photo</FieldLabel>
      {currentUrl && (
        <div style={{ position: 'relative', border: `1px solid ${C.border}`, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 12, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onUploaded('')} style={{
            position: 'absolute', top: 8, right: 8, backgroundColor: C.red, color: 'white',
            border: 'none', padding: '5px 12px',
            fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', borderRadius: 6,
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}>✕ Remove</button>
        </div>
      )}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${error && !currentUrl ? C.red : uploading ? C.blue : C.border}`,
          borderRadius: 10, padding: '28px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          cursor: 'pointer', backgroundColor: uploading ? C.blueLight : C.surface,
          transition: 'all 0.2s', textAlign: 'center',
        }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = C.blue; }}
        onMouseLeave={e => { if (!uploading) e.currentTarget.style.borderColor = error && !currentUrl ? C.red : C.border; }}
      >
        {uploading ? (
          <>
            <Spinner size={26} color={C.blue} />
            <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.blue, margin: 0 }}>Uploading…</p>
            <div style={{ width: '100%', height: 6, backgroundColor: C.blueLight, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', backgroundColor: C.blue, width: pct + '%', transition: 'width 0.3s', borderRadius: 99 }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 48, height: 48, backgroundColor: C.blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>📸</div>
            <div>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, color: C.blue, margin: '0 0 4px' }}>
                {currentUrl ? 'Replace photo' : 'Drop photo here or click to browse'}
              </p>
              <p style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, margin: 0 }}>PNG · JPG · WEBP · max 5MB</p>
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div style={{ marginTop: 12 }}>
        <FieldLabel>Or paste image URL</FieldLabel>
        <ModernInput value={currentUrl || ''} onChange={e => onUploaded(e.target.value)} placeholder="https://…" error={error && !currentUrl} />
      </div>
      {error && !currentUrl && <FieldError>{error}</FieldError>}
      {err && <FieldError>{err}</FieldError>}
    </>
  );
}

// ─── EVENT EDITOR DRAWER ──────────────────────────────────────────────────────
function EventEditor({ event, onSave, onCancel, isSaving }) {
  const [form,   setForm]   = useState({ ...event });
  const [tab,    setTab]    = useState('details');
  const [errors, setErrors] = useState({});

  const set = k => v => setForm(f => ({ ...f, [k]: v }));
  const c   = getColor(form.color);

  const validate = () => {
    const e = {};
    if (!form.title?.trim())     e.title    = 'Title is required';
    if (!form.date?.trim())      e.date     = 'Date is required';
    if (!form.location?.trim())  e.location = 'Location is required';
    if (!form.tag?.trim())       e.tag      = 'Tag is required';
    if (!form.image_url?.trim()) e.image_url = 'Photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const setField = (k) => (v) => {
    set(k)(v);
    if (errors[k] && v?.trim?.()) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const hasErrors = Object.keys(errors).length > 0;
  const TABS = [
    { id: 'details', label: 'Details',  icon: '①' },
    { id: 'photo',   label: 'Photo',    icon: '②' },
    { id: 'style',   label: 'Style',    icon: '③' },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 1080, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderBottom: 'none', boxShadow: '0 -24px 60px rgba(3,126,243,0.12)', height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '16px 16px 0 0', overflow: 'hidden' }}
      >
        {/* Title bar */}
        <div style={{ display: 'flex', background: C.navy, borderBottom: `3px solid ${C.blue}`, flexShrink: 0 }}>
          {/* Traffic lights */}
          <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 7, borderRight: `1px solid rgba(255,255,255,0.1)` }}>
            {[C.brandRed, C.brandYellow, C.green].map((col, i) => (
              <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: col, opacity: 0.85 }} />
            ))}
          </div>
          {/* Title */}
          <div style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.bara, color: C.white, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {event.id ? `✎ EDITING: ${(event.title || '').toUpperCase()}` : '✚ NEW EVENT'}
            </span>
            {hasErrors && (
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, backgroundColor: C.red, color: 'white', padding: '3px 10px', borderRadius: 99 }}>
                ✕ {Object.keys(errors).length} required
              </span>
            )}
          </div>
          {/* Live preview label */}
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', borderLeft: `1px solid rgba(255,255,255,0.1)` }}>
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted }}>Live Preview →</span>
          </div>
          {/* Close */}
          <button onClick={onCancel} style={{ backgroundColor: 'transparent', color: C.textMuted, border: 'none', borderLeft: `1px solid rgba(255,255,255,0.1)`, padding: '0 22px', fontSize: 20, cursor: 'pointer', transition: 'all .15s', lineHeight: 1 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.red; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.textMuted; }}>✕</button>
        </div>
        <FiestaStripe />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Form panel */}
          <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${C.border}`, overflow: 'hidden', backgroundColor: C.white }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0, backgroundColor: C.surface }}>
              {TABS.map((t, i) => {
                const tabHasError =
                  (t.id === 'details' && (errors.title || errors.date || errors.location || errors.tag)) ||
                  (t.id === 'photo'   && errors.image_url);
                const isActive = tab === t.id;
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{
                      flex: 1, padding: '12px 0',
                      fontFamily: F.rounded, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
                      cursor: 'pointer', border: 'none',
                      borderBottom: isActive ? `2px solid ${C.blue}` : '2px solid transparent',
                      backgroundColor: isActive ? C.white : 'transparent',
                      color: isActive ? C.blue : C.textMuted, position: 'relative',
                      transition: 'all 0.15s',
                    }}>
                    {t.icon} {t.label}
                    {tabHasError && <span style={{ position: 'absolute', top: 6, right: 8, width: 6, height: 6, borderRadius: '50%', backgroundColor: C.red }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {tab === 'details' && (<>
                <div>
                  <FieldLabel required>Event Title</FieldLabel>
                  <ModernInput value={form.title || ''} onChange={e => setField('title')(e.target.value)} placeholder="e.g. ACAMP" error={errors.title} />
                  {errors.title && <FieldError>{errors.title}</FieldError>}
                </div>

                <DatePicker value={form.date || ''} onChange={v => setField('date')(v)} error={errors.date} />

                <div>
                  <FieldLabel required>Location</FieldLabel>
                  <ModernInput value={form.location || ''} onChange={e => setField('location')(e.target.value)} placeholder="e.g. Cubao Expo" error={errors.location} />
                  {errors.location && <FieldError>{errors.location}</FieldError>}
                </div>

                <div>
                  <FieldLabel required>Tag / Label</FieldLabel>
                  <ModernInput value={form.tag || ''} onChange={e => setField('tag')(e.target.value)} placeholder="e.g. AIESEC IN UST" error={errors.tag} />
                  {errors.tag && <FieldError>{errors.tag}</FieldError>}
                </div>

                <div>
                  <FieldLabel>Description <span style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, fontWeight: 400, letterSpacing: 0 }}>(optional)</span></FieldLabel>
                  <ModernInput value={form.description || ''} onChange={e => set('description')(e.target.value)} placeholder="A short summary…" multiline rows={4} />
                  <p style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, margin: '4px 0 0', textAlign: 'right' }}>{(form.description || '').length} chars</p>
                </div>

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: C.textMid, margin: 0 }}>Visibility</p>
                    <p style={{ fontFamily: F.rounded, fontSize: 11, fontWeight: 700, color: form.is_active ? C.green : C.textMuted, margin: '4px 0 0' }}>
                      {form.is_active ? '● Visible on site' : '○ Hidden from site'}
                    </p>
                  </div>
                  <button onClick={() => set('is_active')(!form.is_active)} style={{
                    padding: '8px 18px', border: `1px solid ${form.is_active ? C.green : C.border}`, borderRadius: 8,
                    fontFamily: F.rounded, fontWeight: 700, fontSize: 12,
                    cursor: 'pointer', backgroundColor: form.is_active ? C.greenLight : C.surface,
                    color: form.is_active ? C.green : C.textMid, transition: 'all .15s',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}>
                    {form.is_active ? '● LIVE' : '○ HIDDEN'}
                  </button>
                </div>
              </>)}

              {tab === 'photo' && (
                <PhotoUploader
                  currentUrl={form.image_url}
                  onUploaded={url => { set('image_url')(url); if (errors.image_url && url?.trim()) setErrors(e => { const n = { ...e }; delete n.image_url; return n; }); }}
                  error={errors.image_url}
                />
              )}

              {tab === 'style' && (<>
                <div>
                  <FieldLabel>Accent Color</FieldLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                    {Object.entries(COLOR_MAP).map(([key, val]) => (
                      <button key={key} onClick={() => set('color')(key)}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                          padding: '10px 6px', border: form.color === key ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                          backgroundColor: form.color === key ? C.blueLight : C.white,
                          cursor: 'pointer', borderRadius: 10, transition: 'all 0.12s',
                          boxShadow: form.color === key ? `0 2px 8px ${C.blue}30` : '0 1px 3px rgba(0,0,0,0.05)',
                        }}>
                        <div style={{ width: 28, height: 28, backgroundColor: val.bg, border: `2px solid ${form.color === key ? C.blue : 'transparent'}`, borderRadius: 6 }} />
                        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: C.textMid }}>{val.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <FieldLabel>Card Tilt</FieldLabel>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[-2, -1, 0, 1, 2].map(r => (
                      <button key={r} onClick={() => set('rotation')(r)}
                        style={{
                          flex: 1, padding: '10px 0', border: form.rotation === r ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                          fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 8,
                          backgroundColor: form.rotation === r ? C.blue : C.white,
                          color: form.rotation === r ? 'white' : C.textMid,
                          boxShadow: form.rotation === r ? `0 2px 8px ${C.blue}40` : '0 1px 3px rgba(0,0,0,0.05)',
                          transition: 'all 0.12s',
                        }}>
                        {r > 0 ? `+${r}°` : r === 0 ? '0°' : `${r}°`}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ border: `1px solid ${C.border}`, padding: 14, backgroundColor: C.blueLight, display: 'flex', alignItems: 'center', gap: 14, borderRadius: 10, boxShadow: `0 2px 8px ${C.blue}15` }}>
                  <div style={{ width: 44, height: 44, backgroundColor: c.bg, flexShrink: 0, borderRadius: 8 }} />
                  <div>
                    <p style={{ fontFamily: F.rounded, fontWeight: 800, fontSize: 13, margin: 0, color: C.text }}>{c.label} Scheme</p>
                    <p style={{ fontFamily: F.rounded, fontSize: 11, color: C.textMid, margin: '3px 0 0' }}>Card overlay + tag badge</p>
                  </div>
                </div>
              </>)}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, flexShrink: 0, backgroundColor: C.white }}>
              <button onClick={onCancel}
                style={{ flex: 1, padding: 16, border: 'none', borderRight: `1px solid ${C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: 'white', color: C.textMid, transition: 'all .12s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                Cancel
              </button>
              <button
                onClick={() => { if (validate()) onSave(form); }} disabled={isSaving}
                style={{ flex: 1, padding: 16, border: 'none', fontFamily: F.rounded, fontWeight: 800, fontSize: 12, cursor: isSaving ? 'not-allowed' : 'pointer', backgroundColor: C.blue, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSaving ? 0.7 : 1, transition: 'filter .15s', boxShadow: `0 2px 12px ${C.blue}40` }}
                onMouseEnter={e => { if (!isSaving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                {isSaving ? <Spinner size={14} color="white" /> : '✓'}
                {isSaving ? 'Saving…' : 'Save Event'}
              </button>
            </div>
          </div>

          {/* Live preview — exact replica of EventsFeature.jsx card */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{
              padding: '10px 20px', borderBottom: `1px solid ${C.border}`,
              backgroundColor: C.white, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: C.green }} />
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.textMuted }}>
                Live Preview — Exact Card Output
              </span>
              <span style={{ marginLeft: 'auto', fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: form.is_active ? C.green : C.textMuted }}>
                {form.is_active ? '● VISIBLE ON SITE' : '○ HIDDEN'}
              </span>
            </div>

            {/* Mirrors EventsFeature.jsx section background exactly */}
            <div style={{
              flex: 1, overflow: 'auto',
              backgroundColor: '#FFFBEB',
              backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.10) 1.5px, transparent 1.5px)',
              backgroundSize: '20px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 32,
            }}>
              <PolaroidPreviewCard event={form} />
            </div>

            <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                ↑ Exact replica of how this card appears in the Featured Photos carousel on the website
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── STAR BUTTON ──────────────────────────────────────────────────────────────
function StarButton({ isFeatured, onClick, size = 'md' }) {
  const [hovered, setHovered] = useState(false);
  const sz = size === 'sm' ? 22 : 28;
  return (
    <button onClick={onClick} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      title={isFeatured ? 'Remove from Featured' : 'Add to Featured'}
      style={{
        width: sz, height: sz,
        border: `1px solid ${isFeatured ? C.amber : hovered ? C.amber : C.border}`,
        backgroundColor: isFeatured ? C.amberLight : hovered ? '#fffbeb' : C.white,
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size === 'sm' ? 12 : 14, transition: 'all 0.15s',
        boxShadow: isFeatured ? `0 2px 6px ${C.amber}40` : 'none',
        flexShrink: 0, borderRadius: 6,
      }}>
      {isFeatured ? '⭐' : '☆'}
    </button>
  );
}

// ─── SITE PREVIEW — MOVING CAROUSEL (UNCHANGED) ───────────────────────────────
function SitePreview({ events }) {
  const featured  = events.filter(e => e.is_featured && e.is_active);
  const trackRef  = useRef(null);
  const rafRef    = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const SPEED = 0.4;
  const featuredKey = featured.map(e => `${e.id}:${e.is_active}`).join(',');
  const displayEvents = featured.length ? [...featured, ...featured, ...featured, ...featured] : [];

  useEffect(() => {
    if (!featured.length) return;
    const track = trackRef.current;
    if (!track) return;
    offsetRef.current = 0;
    track.style.transform = 'translateX(0px)';
    let loopLen = 0;
    const rafMeasure = requestAnimationFrame(() => { loopLen = track.scrollWidth / 4; });
    const animate = () => {
      if (!pausedRef.current) {
        offsetRef.current += SPEED;
        if (loopLen > 0 && offsetRef.current >= loopLen) offsetRef.current -= loopLen;
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    const measure = () => { loopLen = track.scrollWidth / 4; };
    window.addEventListener('resize', measure);
    return () => { cancelAnimationFrame(rafRef.current); cancelAnimationFrame(rafMeasure); window.removeEventListener('resize', measure); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredKey]);

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <SectionBadge>Site Preview</SectionBadge>
        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live carousel</span>
      </div>

      {/* Exactly mirrors EventsFeature.jsx section styles */}
      <div style={{
        border: `1px solid ${C.border}`, borderRadius: 12,
        backgroundColor: '#FFFBEB',
        backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.10) 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
        overflow: 'hidden', position: 'relative',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
      }}>
        {/* Header row — mirrors EventsFeature heading */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          padding: '14px 18px 12px', borderBottom: '2px dashed rgba(0,0,0,0.12)',
        }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{
                fontFamily: F.bara, fontSize: 9, textTransform: 'uppercase',
                letterSpacing: '0.25em', color: B.black, background: B.yellow,
                padding: '2px 12px', border: `2px solid ${B.black}`, borderRadius: 999,
                boxShadow: `2px 2px 0 ${B.black}`,
              }}>📸 Throwback Collection</span>
            </div>
            <h2 style={{ fontFamily: F.bara, margin: 0, fontSize: 22, color: B.red, textTransform: 'uppercase', textShadow: `2px 2px 0 ${B.black}` }}>
              Featured <span style={{ color: B.blue }}>Photos</span>
            </h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', inset: 0, background: B.red, transform: 'translate(4px,4px)', borderRadius: 4, border: `2px solid ${B.black}` }} />
            <div style={{ position: 'absolute', inset: 0, background: B.yellow, transform: 'translate(2px,2px)', borderRadius: 4, border: `2px solid ${B.black}` }} />
            <span style={{ fontFamily: F.bara, position: 'relative', display: 'block', padding: '5px 12px', backgroundColor: B.blue, border: `2px solid ${B.black}`, fontSize: 9, textTransform: 'uppercase', color: 'white', borderRadius: 4 }}>View All Photos ✦</span>
          </div>
        </div>

        {featured.length === 0 ? (
          <p style={{ fontFamily: F.rounded, fontWeight: 700, padding: '28px 0', textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted, margin: 0 }}>
            No starred events · click ☆ on any event to feature it
          </p>
        ) : (
          <div style={{ position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 80, zIndex: 10, background: 'linear-gradient(to right, #FFFBEB 30%, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 80, zIndex: 10, background: 'linear-gradient(to left, #FFFBEB 30%, transparent)', pointerEvents: 'none' }} />
            <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', willChange: 'transform', padding: '6px 0 14px' }}>
              {displayEvents.map((ev, i) => {
                const origIdx = i % featured.length;
                const tiltDeg = TILT_SEQUENCE[origIdx % TILT_SEQUENCE.length];
                return (
                  <PolaroidPreviewCard
                    key={`${ev.id}-${i}`}
                    event={ev}
                    tiltDeg={tiltDeg}
                    isHovered={hoveredIdx === i}
                    inCarousel={true}
                    onMouseEnter={() => { pausedRef.current = true; setHoveredIdx(i); }}
                    onMouseLeave={() => { pausedRef.current = false; setHoveredIdx(null); }}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SECTION BADGE ────────────────────────────────────────────────────────────
function SectionBadge({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      fontFamily: F.rounded, fontWeight: 800, fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '0.12em',
      color: C.blue, backgroundColor: C.blueLight,
      padding: '3px 12px', borderRadius: 99,
      border: `1px solid ${C.blueMid}`,
    }}>{children}</span>
  );
}

// ─── EVENT ROW ────────────────────────────────────────────────────────────────
function EventRow({ event, idx, isFeatured, onEdit, onDelete, onToggleActive, onToggleFeatured }) {
  const [confirmDel, setConfirmDel] = useState(false);
  const [hovered,    setHovered]    = useState(false);
  const c = getColor(event.color);

  return (
    <Reorder.Item value={event} style={{ listStyle: 'none' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          backgroundColor: hovered ? C.surface : C.white,
          border: `1px solid ${hovered ? C.blue : C.border}`, borderRadius: 10,
          boxShadow: hovered ? `0 0 0 3px ${C.blue}15, 0 4px 12px rgba(0,0,0,0.06)` : '0 1px 4px rgba(0,0,0,0.05)',
          transition: 'all 0.15s',
        }}>
        <div style={{ cursor: 'grab', color: C.textMuted, fontSize: 18, flexShrink: 0, lineHeight: 1 }}>⠿</div>
        <div style={{ flexShrink: 0, width: 26 }}>
          <div style={{
            width: 26, height: 26, backgroundColor: C.blue, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: F.rounded, fontWeight: 800, fontSize: 11, color: 'white',
          }}>{idx}</div>
        </div>
        <StarButton isFeatured={isFeatured} onClick={() => onToggleFeatured(event)} />
        <div style={{ width: 50, height: 50, flexShrink: 0, border: `1px solid ${C.border}`, overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
          {event.image_url
            ? <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
            : <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: c.bg }}>?</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: F.pipanganan, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.text }}>{event.title}</span>
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', padding: '2px 8px', backgroundColor: c.light, color: c.bg, border: `1px solid ${c.bg}20`, borderRadius: 99 }}>{event.tag}</span>
          </div>
          <p style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.textMuted, margin: '3px 0 0' }}>{event.date} · {event.location}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <StatusBadge active={event.is_active} onClick={() => onToggleActive(event)} />
          <ActionBtn onClick={() => onEdit(event)} variant="primary">✎ Edit</ActionBtn>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <ActionBtn onClick={() => { setConfirmDel(false); onDelete(event); }} variant="danger">✕ Delete</ActionBtn>
              <ActionBtn onClick={() => setConfirmDel(false)} variant="ghost">Cancel</ActionBtn>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ padding: '6px 10px', border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: 'white', color: C.textMuted, transition: 'all .12s' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.redLight; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
              🗑
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── SMALL SHARED COMPONENTS ──────────────────────────────────────────────────
function StatusBadge({ active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 10px', border: `1px solid ${active ? C.green : C.border}`, borderRadius: 7,
      fontFamily: F.rounded, fontWeight: 700, fontSize: 10,
      cursor: 'pointer', backgroundColor: active ? C.greenLight : C.surface,
      color: active ? C.green : C.textMuted, transition: 'all .15s',
    }}>
      {active ? '● LIVE' : '○ HIDDEN'}
    </button>
  );
}

function ActionBtn({ onClick, children, variant = 'ghost' }) {
  const styles = {
    primary: { bg: C.blue, color: 'white', border: C.blue, hover: C.blueDark },
    danger:  { bg: C.red,  color: 'white', border: C.red,  hover: '#dc2626' },
    ghost:   { bg: C.white, color: C.textMid, border: C.border, hover: C.surface },
  }[variant];
  return (
    <button onClick={onClick}
      style={{ padding: '6px 12px', border: `1px solid ${styles.border}`, borderRadius: 7, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: styles.bg, color: styles.color, boxShadow: variant === 'primary' ? `0 2px 6px ${C.blue}30` : '0 1px 3px rgba(0,0,0,0.05)', transition: 'filter .12s' }}
      onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.9)'}
      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
      {children}
    </button>
  );
}

// ─── LIBRARY ROW ─────────────────────────────────────────────────────────────
function LibraryRow({ ev, c, isFeat, onEdit, onToggleActive, onToggleFeatured, onDelete }) {
  const [hovered,    setHovered]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', backgroundColor: hovered ? C.surface : 'transparent', transition: 'background 0.1s' }}>
      <div style={{ width: 56, height: 56, flexShrink: 0, border: `1px solid ${C.border}`, overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
        {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, color: c.bg, textTransform: 'uppercase' }}>?</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.pipanganan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{ev.title}</p>
        <p style={{ fontFamily: F.rounded, fontSize: 10, fontWeight: 600, color: C.textMuted, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', padding: '1px 7px', backgroundColor: c.light, color: c.bg, borderRadius: 99, border: `1px solid ${c.bg}20` }}>{ev.tag}</span>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: ev.is_active ? C.green : C.textMuted }}>{ev.is_active ? '● LIVE' : '○ HIDDEN'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
        <LibIconBtn onClick={() => onEdit(ev)} bg={C.blue} color="white" title="Edit">✎</LibIconBtn>
        <LibIconBtn onClick={() => onToggleActive(ev)} bg={ev.is_active ? C.greenLight : C.surface} color={ev.is_active ? C.green : C.textMuted} title="Toggle visibility">
          {ev.is_active ? '●' : '○'}
        </LibIconBtn>
        {confirmDel ? (
          <>
            <LibIconBtn onClick={() => { setConfirmDel(false); onDelete(ev); }} bg={C.red} color="white" title="Confirm delete">✓</LibIconBtn>
            <LibIconBtn onClick={() => setConfirmDel(false)} bg={C.surface} color={C.textMid} title="Cancel">✕</LibIconBtn>
          </>
        ) : (
          <LibIconBtn onClick={() => setConfirmDel(true)} bg="white" color={C.textMuted} title="Delete"
            hoverBg={C.redLight} hoverColor={C.red}>🗑</LibIconBtn>
        )}
      </div>
    </div>
  );
}

function LibIconBtn({ onClick, bg, color, title, children, hoverBg, hoverColor }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 22, height: 22, backgroundColor: bg, color, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, borderRadius: 5, transition: 'all .12s' }}
      onMouseEnter={e => { if (hoverBg) { e.currentTarget.style.backgroundColor = hoverBg; e.currentTarget.style.color = hoverColor; } }}
      onMouseLeave={e => { if (hoverBg) { e.currentTarget.style.backgroundColor = bg; e.currentTarget.style.color = color; } }}>
      {children}
    </button>
  );
}

// ─── PHOTO LIBRARY ────────────────────────────────────────────────────────────
function PhotoLibrary({ events, featuredIds, onEdit, onToggleActive, onToggleFeatured, onDelete, onOpenViewAll }) {
  const [search,      setSearch]      = useState('');
  const [filterVis,   setFilterVis]   = useState('ALL');
  const [filterStar,  setFilterStar]  = useState('STARRED');
  const [filterTag,   setFilterTag]   = useState('ALL');
  const [filterColor, setFilterColor] = useState('ALL');
  const [page,        setPage]        = useState(1);

  const allTags    = ['ALL', ...Array.from(new Set(events.map(e => e.tag).filter(Boolean)))];
  const filtered   = events.filter(ev => {
    const q         = search.toLowerCase();
    const mSearch   = !q || (ev.title||'').toLowerCase().includes(q) || (ev.location||'').toLowerCase().includes(q) || (ev.tag||'').toLowerCase().includes(q) || (ev.date||'').toLowerCase().includes(q);
    const mVis      = filterVis   === 'ALL' || (filterVis   === 'LIVE'     ? ev.is_active          : !ev.is_active);
    const mStar     = filterStar  === 'ALL' || (filterStar  === 'STARRED'  ? featuredIds.has(ev.id) : !featuredIds.has(ev.id));
    const mTag      = filterTag   === 'ALL' || ev.tag   === filterTag;
    const mColor    = filterColor === 'ALL' || ev.color === filterColor;
    return mSearch && mVis && mStar && mTag && mColor;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIBRARY_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * LIBRARY_PAGE_SIZE, safePage * LIBRARY_PAGE_SIZE);
  const setFilter  = setter => val => { setter(val); setPage(1); };
  const featuredCount = events.filter(e => e.is_featured).length;

  const FilterBtn = ({ active, onClick, children, activeBg = C.blue }) => (
    <button onClick={onClick} style={{
      padding: '4px 10px', border: `1px solid ${active ? activeBg : C.border}`,
      fontFamily: F.rounded, fontWeight: 700, fontSize: 10,
      cursor: 'pointer', borderRadius: 6,
      backgroundColor: active ? activeBg : C.white,
      color: active ? 'white' : C.textMid,
      boxShadow: active ? `0 2px 6px ${activeBg}30` : 'none',
      transition: 'all 0.1s',
    }}>{children}</button>
  );

  return (
    <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${C.border}`, backgroundColor: C.white, overflow: 'hidden' }}>
      {/* Library header */}
      <div style={{ background: C.navy, padding: '16px', flexShrink: 0, borderBottom: `3px solid ${C.blue}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, backgroundColor: `${C.blue}25`, border: `1px solid ${C.blue}40`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>📁</div>
            <div>
              <p style={{ fontFamily: F.rounded, fontWeight: 800, color: C.white, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>Photo Library</p>
              <p style={{ fontFamily: F.rounded, fontSize: 10, color: 'rgba(255,255,255,0.45)', margin: '2px 0 0' }}>{events.length} total events</p>
            </div>
          </div>
          <div style={{ fontFamily: F.rounded, fontWeight: 800, color: C.blue, fontSize: 28, lineHeight: 1 }}>{events.length}</div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <LibStatChip color={C.green} bg={`${C.green}20`}>{events.filter(e => e.is_active).length} Live</LibStatChip>
          <LibStatChip color="rgba(255,255,255,0.6)" bg="rgba(255,255,255,0.1)">{events.length - events.filter(e => e.is_active).length} Hidden</LibStatChip>
          <LibStatChip color={C.amber} bg={`${C.amber}20`}>⭐ {featuredCount}/{FEATURED_LIMIT}</LibStatChip>
        </div>
      </div>
      <FiestaStripe height={4} />

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', transition: 'all 0.15s' }}
          onFocus={() => {}} // handled per input
        >
          <span style={{ padding: '0 10px', fontSize: 13, color: C.textMuted, flexShrink: 0 }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, tag, date…"
            style={{ flex: 1, padding: '8px 4px', fontFamily: F.rounded, fontSize: 12, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: C.text }} />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: C.textMuted, fontSize: 14 }}>✕</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <FilterBtn active={filterStar === 'STARRED'} onClick={() => setFilter(setFilterStar)('STARRED')} activeBg={C.amber}>⭐ Starred</FilterBtn>
          <FilterBtn active={filterStar === 'ALL'} onClick={() => setFilter(setFilterStar)('ALL')}>☆ All</FilterBtn>
          <FilterBtn active={filterStar === 'UNSTARRED'} onClick={() => setFilter(setFilterStar)('UNSTARRED')} activeBg="#64748b">✕ Unstarred</FilterBtn>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['ALL','LIVE','HIDDEN'].map(v => (
            <FilterBtn key={v} active={filterVis === v} onClick={() => setFilter(setFilterVis)(v)}
              activeBg={v === 'LIVE' ? C.green : v === 'HIDDEN' ? '#64748b' : C.blue}>
              {v}
            </FilterBtn>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {allTags.map(t => (
            <FilterBtn key={t} active={filterTag === t} onClick={() => setFilter(setFilterTag)(t)}>{t}</FilterBtn>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted }}>Color:</span>
          <button onClick={() => setFilter(setFilterColor)('ALL')} style={{ padding: '2px 8px', border: `1px solid ${filterColor === 'ALL' ? C.blue : C.border}`, backgroundColor: filterColor === 'ALL' ? C.blue : C.surface, cursor: 'pointer', fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: filterColor === 'ALL' ? 'white' : C.textMuted, borderRadius: 5 }}>ALL</button>
          {Object.entries(COLOR_MAP).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(setFilterColor)(key)} title={val.label}
              style={{ width: 18, height: 18, border: `2px solid ${filterColor === key ? C.blue : 'transparent'}`, backgroundColor: val.bg, cursor: 'pointer', borderRadius: 4, transform: filterColor === key ? 'scale(1.2)' : 'scale(1)', transition: 'all .1s' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '5px 12px', backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted }}>{filtered.length} of {events.length} · page {safePage}/{totalPages}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0
          ? <div style={{ padding: '36px 20px', textAlign: 'center' }}>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>No events found</p>
            </div>
          : paginated.map(ev => {
              const c = getColor(ev.color);
              return <LibraryRow key={ev.id} ev={ev} c={c} isFeat={featuredIds.has(ev.id)} onEdit={onEdit} onToggleActive={onToggleActive} onToggleFeatured={onToggleFeatured} onDelete={onDelete} />;
            })
        }
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />

      <div style={{ borderTop: `1px solid ${C.border}`, padding: 12, flexShrink: 0, backgroundColor: C.surface }}>
        <button onClick={onOpenViewAll} style={{
          width: '100%', padding: '11px 0', border: `1px solid ${C.blue}`,
          fontFamily: F.rounded, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em',
          cursor: 'pointer', backgroundColor: C.blue, color: 'white',
          boxShadow: `0 4px 14px ${C.blue}35`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
          🖼 View All Photos
        </button>
      </div>
    </div>
  );
}

function LibStatChip({ color, bg, children }) {
  return (
    <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color, backgroundColor: bg, padding: '3px 10px', borderRadius: 99, border: `1px solid ${color}20` }}>{children}</span>
  );
}

// ─── VIEW ALL MODAL ───────────────────────────────────────────────────────────
function ViewAllModal({ events, featuredIds, onClose, onEdit, onToggleActive, onToggleFeatured, onDelete }) {
  const [search,    setSearch]    = useState('');
  const [filterVis, setFilterVis] = useState('ALL');
  const [filterTag, setFilterTag] = useState('ALL');
  const [page,      setPage]      = useState(1);

  const allTags  = ['ALL', ...Array.from(new Set(events.map(e => e.tag).filter(Boolean)))];
  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const mSearch = !q || (ev.title||'').toLowerCase().includes(q) || (ev.location||'').toLowerCase().includes(q) || (ev.tag||'').toLowerCase().includes(q) || (ev.date||'').toLowerCase().includes(q);
    const mVis    = filterVis === 'ALL' || (filterVis === 'LIVE' ? ev.is_active : !ev.is_active);
    const mTag    = filterTag === 'ALL' || ev.tag === filterTag;
    return mSearch && mVis && mTag;
  });
  const totalPages = Math.max(1, Math.ceil(filtered.length / MODAL_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * MODAL_PAGE_SIZE, safePage * MODAL_PAGE_SIZE);
  const setFilter  = setter => val => { setter(val); setPage(1); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(10,22,40,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ width: '90vw', maxWidth: 1100, height: '88vh', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 16, boxShadow: `0 24px 60px rgba(3,126,243,0.15), 0 8px 30px rgba(0,0,0,0.18)`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ display: 'flex', backgroundColor: C.navy, borderBottom: `3px solid ${C.blue}`, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.bara, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🖼 View All Photos</span>
            <span style={{ fontFamily: F.rounded, fontWeight: 700, color: C.blue, fontSize: 13, backgroundColor: `${C.blue}20`, padding: '2px 10px', borderRadius: 99 }}>{filtered.length}/{events.length}</span>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', color: C.textMuted, border: 'none', borderLeft: `1px solid rgba(255,255,255,0.1)`, padding: '0 22px', fontSize: 20, cursor: 'pointer', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.red; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.textMuted; }}>✕</button>
        </div>
        <FiestaStripe />

        {/* Filter bar */}
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, backgroundColor: C.surface }}>
          <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', background: C.white, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
            <span style={{ padding: '0 10px', fontSize: 13, color: C.textMuted }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…"
              style={{ flex: 1, padding: '8px 4px', fontFamily: F.rounded, fontSize: 11, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', color: C.text }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL','LIVE','HIDDEN'].map(v => {
              const active = filterVis === v;
              const bg = active ? (v === 'LIVE' ? C.green : v === 'HIDDEN' ? '#64748b' : C.navy) : C.white;
              return <button key={v} onClick={() => setFilter(setFilterVis)(v)} style={{ padding: '6px 12px', border: `1px solid ${active ? 'transparent' : C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer', borderRadius: 7, backgroundColor: bg, color: active ? 'white' : C.textMid, boxShadow: active ? '0 2px 6px rgba(0,0,0,0.12)' : 'none', transition: 'all 0.12s' }}>{v}</button>;
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {allTags.map(t => {
              const active = filterTag === t;
              return <button key={t} onClick={() => setFilter(setFilterTag)(t)} style={{ padding: '4px 10px', border: `1px solid ${active ? C.blue : C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer', borderRadius: 6, backgroundColor: active ? C.blue : C.white, color: active ? 'white' : C.textMid, transition: 'all 0.12s' }}>{t}</button>;
            })}
          </div>
        </div>

        <div style={{ padding: '6px 18px', backgroundColor: C.blueLight, borderBottom: `1px solid ${C.blueMid}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.blue, margin: 0 }}>
            ℹ️ Featured on homepage: ⭐ starred events (max {FEATURED_LIMIT}) · All events appear here
          </p>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted }}>Page {safePage}/{totalPages}</span>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 18, backgroundColor: C.surface }}>
          {filtered.length === 0
            ? <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em', color: C.textMuted }}>No events match filters</p>
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 14 }}>
                {paginated.map(ev => {
                  const c = getColor(ev.color);
                  const isFeat = featuredIds.has(ev.id);
                  return (
                    <div key={ev.id} style={{ position: 'relative' }}>
                      {isFeat && (
                        <div style={{ position: 'absolute', top: -6, left: -6, zIndex: 10, backgroundColor: C.amberLight, border: `1px solid ${C.amber}`, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3, borderRadius: 6, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}>
                          <span style={{ fontSize: 9 }}>⭐</span>
                          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, color: C.amber }}>Featured</span>
                        </div>
                      )}
                      <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, overflow: 'hidden', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 4px 16px ${C.blue}20, 0 2px 8px rgba(0,0,0,0.08)`; e.currentTarget.style.borderColor = C.blue; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = C.border; }}>
                        <div style={{ aspectRatio: '1/1', overflow: 'hidden', backgroundColor: c.light, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: c.bg, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 }}>No Photo</span>}
                          <div style={{ position: 'absolute', top: 5, right: 5 }}>
                            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, color: 'white', backgroundColor: ev.is_active ? C.green : 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: 4 }}>{ev.is_active ? '● LIVE' : '○ HIDDEN'}</span>
                          </div>
                        </div>
                        <div style={{ padding: '8px 10px', borderTop: `1px solid ${C.border}` }}>
                          <span style={{ fontFamily: F.rounded, fontWeight: 800, display: 'inline-block', fontSize: 8, textTransform: 'uppercase', padding: '2px 7px', backgroundColor: c.light, color: c.bg, borderRadius: 99, marginBottom: 4 }}>{ev.tag}</span>
                          <p style={{ fontFamily: F.pipanganan, fontSize: 11, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{ev.title}</p>
                          <p style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 9, color: C.textMuted, margin: '2px 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => onEdit(ev)} style={{ flex: 1, padding: '5px 0', border: `1px solid ${C.blue}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 9, cursor: 'pointer', backgroundColor: C.blue, color: 'white', borderRadius: 5, transition: 'filter .12s' }}
                              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>✎ Edit</button>
                            <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
                            <button onClick={() => onToggleActive(ev)} style={{ padding: '5px 7px', border: `1px solid ${C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 9, cursor: 'pointer', backgroundColor: ev.is_active ? C.greenLight : C.surface, color: ev.is_active ? C.green : C.textMuted, borderRadius: 5, transition: 'all .12s' }}>
                              {ev.is_active ? '●' : '○'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
          }
        </div>
        <div style={{ borderTop: `1px solid ${C.border}`, backgroundColor: C.white, flexShrink: 0 }}>
          <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EventsManager = forwardRef(function EventsManager(props, ref) {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [toast,       setToast]       = useState(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [libraryVisible, setLibraryVisible] = useState(true);

  useImperativeHandle(ref, () => ({
    add: () => setEditing({ ...EMPTY_EVENT, display_order: events.length + 1 })
  }), [events.length]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try   { const rows = await getAllEvents(); setEvents(rows.map(normalise)); }
    catch (err) { showToast(err.message || 'Failed to load.', 'error'); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      const payload = denormalise(form);
      if (form.id) {
        const updated = await updateEvent(form.id, payload);
        setEvents(es => es.map(e => e.id === updated.id ? normalise(updated) : e));
        showToast('Event updated!');
      } else {
        payload.display_order = events.length + 1;
        const created = await createEvent(payload);
        setEvents(es => [...es, normalise(created)]);
        showToast('Event created!');
      }
      setEditing(null);
    } catch (err) { showToast(err.message || 'Save failed.', 'error'); }
    finally       { setIsSaving(false); }
  };

  const handleDelete = async (event) => {
    try {
      if (event.image_url) { try { await deleteEventPhoto(event.image_url); } catch (_) {} }
      await deleteEvent(event.id);
      setEvents(es => es.filter(e => e.id !== event.id));
      showToast('Event deleted.', 'error');
    } catch (err) { showToast(err.message || 'Delete failed.', 'error'); }
  };

  const handleToggleActive = async (event) => {
    const next = !event.is_active;
    setEvents(es => es.map(e => e.id === event.id ? { ...e, is_active: next } : e));
    try {
      await updateEvent(event.id, { is_active: next });
      showToast(next ? 'Event is now live.' : 'Event hidden from site.');
    } catch (err) {
      setEvents(es => es.map(e => e.id === event.id ? { ...e, is_active: event.is_active } : e));
      showToast(err.message || 'Toggle failed.', 'error');
    }
  };

  const handleToggleFeatured = async (event) => {
    const currentFeatured = events.filter(e => e.is_featured);
    const isFeatured = event.is_featured;
    if (!isFeatured && currentFeatured.length >= FEATURED_LIMIT) {
      showToast(`Max ${FEATURED_LIMIT} featured. Remove a ⭐ first.`, 'error'); return;
    }
    const next = !isFeatured;
    setEvents(es => es.map(e => e.id === event.id ? { ...e, is_featured: next } : e));
    try {
      await updateEvent(event.id, { is_featured: next });
      showToast(next ? '⭐ Added to Featured!' : 'Removed from Featured.');
    } catch (err) {
      setEvents(es => es.map(e => e.id === event.id ? { ...e, is_featured: isFeatured } : e));
      showToast(err.message || 'Failed.', 'error');
    }
  };

  const handleReorder = async (newOrder) => {
    const reindexed = newOrder.map((e, i) => ({ ...e, display_order: i + 1 }));
    setEvents(reindexed);
    try   { await reorderEvents(reindexed.map(({ id, display_order }) => ({ id, display_order }))); }
    catch { showToast('Failed to save order.', 'error'); load(); }
  };

  const featuredIds   = new Set(events.filter(e => e.is_featured).map(e => e.id));
  const liveCount     = events.filter(e => e.is_active).length;
  const hiddenCount   = events.length - liveCount;
  const featuredCount = events.filter(e => e.is_featured).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: C.surface, fontFamily: F.body }}>
      <AnimatePresence>
        {editing && <EventEditor event={editing} onSave={handleSave} onCancel={() => setEditing(null)} isSaving={isSaving} />}
      </AnimatePresence>
      <AnimatePresence>
        {viewAllOpen && (
          <ViewAllModal events={events} featuredIds={featuredIds} onClose={() => setViewAllOpen(false)}
            onEdit={e => { setViewAllOpen(false); setEditing({ ...e }); }}
            onToggleActive={handleToggleActive} onToggleFeatured={handleToggleFeatured}
            onDelete={handleDelete} />
        )}
      </AnimatePresence>

      {/* ── HEADER BAR ── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', minHeight: 60,
          backgroundColor: C.navy, borderBottom: `3px solid ${C.blue}`,
          overflow: 'hidden',
        }}>
          {/* Brand block */}
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `1px solid rgba(255,255,255,0.1)`, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, backgroundColor: `${C.blue}25`, border: `1px solid ${C.blue}50`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>📸</div>
            <div>
              <div style={{ fontFamily: F.bara, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>Event Photos</div>
              <div style={{ fontFamily: F.rounded, fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>Photo Manager</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            {[
              { val: liveCount,     label: 'Live',     accent: C.green  },
              { val: hiddenCount,   label: 'Hidden',   accent: 'rgba(255,255,255,0.35)' },
              { val: featuredCount, label: `/ ${FEATURED_LIMIT} Featured`, accent: C.amber },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 18px', borderRight: `1px solid rgba(255,255,255,0.08)`, height: '100%' }}>
                <div>
                  <div style={{ fontFamily: F.rounded, fontWeight: 800, fontSize: 22, color: s.accent, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Refresh */}
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid rgba(255,255,255,0.08)`, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            ↺ Refresh
          </button>

          {/* Add button */}
          <button onClick={() => setEditing({ ...EMPTY_EVENT, display_order: events.length + 1 })} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', background: C.blue, color: 'white', border: 'none', borderLeft: `1px solid ${C.blueDark}`, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'filter .15s', flexShrink: 0, boxShadow: `inset -1px 0 0 ${C.blueDark}` }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
            <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> Add Event
          </button>

          {/* Toggle Library */}
          <button onClick={() => setLibraryVisible(v => !v)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid rgba(255,255,255,0.08)`, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            {libraryVisible ? '📁' : '👁️'} {libraryVisible ? 'Hide' : 'Show'} Library
          </button>
        </div>
        <FiestaStripe height={4} />
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', marginTop: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: 14 }}>
              <Spinner size={28} color={C.blue} />
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em', color: C.blue }}>Loading…</span>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 60, height: 60, backgroundColor: C.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, margin: '0 auto 16px' }}>📸</div>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 15, color: C.textMid, marginBottom: 6 }}>No events yet</p>
              <p style={{ fontFamily: F.rounded, fontSize: 12, color: C.textMuted, marginBottom: 20 }}>Create your first event to get started.</p>
              <button onClick={() => setEditing({ ...EMPTY_EVENT })} style={{ backgroundColor: C.blue, color: 'white', border: 'none', padding: '12px 28px', fontFamily: F.rounded, fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: `0 4px 14px ${C.blue}40`, borderRadius: 10 }}>
                + Add your first event
              </button>
            </div>
          ) : (
            <>
              <SitePreview events={events} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: `1px dashed ${C.border}`, borderRadius: 8, backgroundColor: C.white, marginBottom: 14, marginTop: 20 }}>
                <span style={{ color: C.textMuted, fontSize: 13 }}>↕</span>
                <p style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.textMuted, margin: 0 }}>
                  {events.filter(e => e.is_featured).length} featured · Drag to reorder ·{' '}
                  <span style={{ color: C.blue, fontWeight: 700 }}>✎ Edit</span> to open editor ·{' '}
                  <span style={{ color: C.amber, fontWeight: 700 }}>☆</span> to feature (max {FEATURED_LIMIT})
                </p>
              </div>

              {(() => {
                const featuredEvents   = events.filter(e => e.is_featured);
                const nonFeaturedCount = events.length - featuredEvents.length;
                return (
                  <>
                    {featuredEvents.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: 10, backgroundColor: C.white }}>
                        <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0 }}>
                          No featured events yet — click ☆ in the Photo Library to feature an event here
                        </p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={featuredEvents} onReorder={handleReorder}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                        {featuredEvents.map((ev, i) => (
                          <EventRow key={ev.id} event={ev} idx={i + 1} isFeatured
                            onEdit={e => setEditing({ ...e })}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                            onToggleFeatured={handleToggleFeatured}
                          />
                        ))}
                      </Reorder.Group>
                    )}
                    {nonFeaturedCount > 0 && (
                      <div style={{ marginTop: 10, padding: '8px 14px', border: `1px dashed ${C.border}`, borderRadius: 8, backgroundColor: C.surface, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.textMuted }}>
                          📁 {nonFeaturedCount} more event{nonFeaturedCount > 1 ? 's' : ''} in the Photo Library — star to feature here
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {libraryVisible && <PhotoLibrary events={events} featuredIds={featuredIds}
          onEdit={e => setEditing({ ...e })}
          onToggleActive={handleToggleActive}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDelete}
          onOpenViewAll={() => setViewAllOpen(true)}
        />}
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
});

export default EventsManager;