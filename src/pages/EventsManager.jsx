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
  body:       '"DM Sans", "Inter", system-ui, sans-serif',
  mono:       '"JetBrains Mono", "Fira Code", monospace',
};

const C = {
  blue:        '#037ef3',
  blueDark:    '#0262c0',
  blueLight:   '#e8f3fd',
  blueMid:     '#cce4fb',
  blueGlow:    'rgba(3,126,243,0.15)',
  navy:        '#080f1e',
  navyMid:     '#0d1a30',
  navyLight:   '#122040',
  navyBorder:  'rgba(255,255,255,0.07)',
  white:       '#ffffff',
  surface:     '#f6f8fb',
  surfaceCard: '#ffffff',
  border:      '#e4e9f0',
  borderMid:   '#c8d3e0',
  text:        '#0c1523',
  textMid:     '#3d5068',
  textMuted:   '#8a9ab0',
  green:       '#10b981',
  greenLight:  '#d1fae5',
  greenDark:   '#059669',
  red:         '#ef4444',
  redLight:    '#fee2e2',
  amber:       '#f59e0b',
  amberLight:  '#fef3c7',
  // Brand
  brandRed:    '#EF3340',
  brandYellow: '#FFD100',
  brandGreen:  '#00A651',
  brandBlue:   '#009BD6',
  brandOrange: '#F58220',
};

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

// ─── SVG ICONS ────────────────────────────────────────────────────────────────
const Icons = {
  refresh: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
      <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
    </svg>
  ),
  plus: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  panelOpen: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="15" y1="3" x2="15" y2="21"/>
    </svg>
  ),
  panelClose: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/>
    </svg>
  ),
  edit: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  trash: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
      <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
    </svg>
  ),
  eye: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  eyeOff: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  star: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  starFilled: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  grip: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/>
      <circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/>
      <circle cx="9" cy="17" r="1" fill="currentColor"/><circle cx="15" cy="17" r="1" fill="currentColor"/>
    </svg>
  ),
  photo: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  folder: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
    </svg>
  ),
  check: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  x: (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  images: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="15" height="15" rx="2"/><path d="M17 2h5v5"/><path d="M22 2L12 12"/>
    </svg>
  ),
  upload: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  search: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  calendar: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const FiestaStripe = ({ height = 4 }) => (
  <div style={{
    height, flexShrink: 0,
    background: `linear-gradient(to right, ${C.brandRed}, ${C.brandYellow}, ${C.brandGreen}, ${C.brandBlue}, ${C.brandOrange}, ${C.brandRed})`,
  }} />
);

function Spinner({ size = 18, color = C.blue }) {
  return (
    <span style={{
      width: size, height: size,
      border: `2px solid ${color}25`, borderTopColor: color,
      borderRadius: '50%', display: 'inline-block',
      animation: 'spin 0.65s linear infinite', flexShrink: 0,
    }} />
  );
}

function Toast({ msg, type }) {
  const isSuccess = type === 'success';
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      style={{
        position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '12px 18px',
        background: C.navy,
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
        boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 0 1px ${isSuccess ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)'}`,
        fontFamily: F.rounded, fontWeight: 700, fontSize: 12,
        color: 'white', borderRadius: 12,
        maxWidth: 'calc(100vw - 56px)',
        backdropFilter: 'blur(12px)',
      }}>
      <span style={{
        width: 22, height: 22, borderRadius: 6, flexShrink: 0,
        backgroundColor: isSuccess ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
        color: isSuccess ? C.green : C.red,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `1px solid ${isSuccess ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}>{isSuccess ? Icons.check : Icons.x}</span>
      {msg}
    </motion.div>
  );
}

function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '10px 14px', borderTop: `1px solid ${C.border}`, flexShrink: 0 }}>
      <PaginationBtn onClick={() => onPage(page - 1)} disabled={page === 1} label="‹" />
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)} style={{
          width: 28, height: 28,
          border: `1px solid ${p === page ? C.blue : C.border}`,
          backgroundColor: p === page ? C.blue : 'transparent',
          color: p === page ? C.white : C.textMuted,
          cursor: 'pointer', fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 7, transition: 'all 0.15s',
          boxShadow: p === page ? `0 2px 8px ${C.blue}35` : 'none',
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
      backgroundColor: disabled ? 'transparent' : C.surfaceCard,
      cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F.body, fontSize: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: disabled ? C.textMuted : C.textMid, borderRadius: 7,
      transition: 'all 0.15s',
    }}>{label}</button>
  );
}

// ─── DATE PICKER ──────────────────────────────────────────────────────────────
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
        borderRadius: 9, padding: '9px 12px',
        fontFamily: F.body, fontSize: 13, fontWeight: 600,
        backgroundColor: C.white, outline: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        color: value ? C.text : C.textMuted,
        boxShadow: open ? `0 0 0 3px ${C.blue}20` : 'none',
        transition: 'all 0.15s',
      }}>
        <span>{value || 'Pick a date…'}</span>
        <span style={{ color: C.textMuted, display: 'flex' }}>{Icons.calendar}</span>
      </button>
      {error && <FieldError>{error}</FieldError>}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          background: C.navy, border: `1px solid ${C.navyBorder}`,
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)', width: 280,
          overflow: 'hidden', borderRadius: 14,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
            <CalNavBtn onClick={prevMonth}>‹</CalNavBtn>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: F.pipanganan, color: C.blue, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{MONTHS_SHORT[viewMonth]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginTop: 2 }}>
                <button onClick={() => setViewYear(y => y - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 12, fontFamily: F.body }}>−</button>
                <span style={{ fontFamily: F.rounded, fontWeight: 700, color: 'white', fontSize: 13 }}>{viewYear}</span>
                <button onClick={() => setViewYear(y => y + 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.35)', cursor: 'pointer', fontSize: 12, fontFamily: F.body }}>+</button>
              </div>
            </div>
            <CalNavBtn onClick={nextMonth}>›</CalNavBtn>
          </div>
          <FiestaStripe height={2} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', backgroundColor: 'rgba(255,255,255,0.04)', borderBottom: `1px solid ${C.navyBorder}` }}>
            {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
              <div key={d} style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, textAlign: 'center', padding: '7px 0', color: 'rgba(255,255,255,0.3)', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', padding: '6px' }}>
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <button key={d} onClick={() => selectDay(d)} style={{
                aspectRatio: '1/1', border: 'none',
                backgroundColor: isSelected(d) ? C.blue : isToday(d) ? 'rgba(3,126,243,0.15)' : 'transparent',
                color: isSelected(d) ? 'white' : isToday(d) ? C.blue : 'rgba(255,255,255,0.7)',
                fontFamily: F.rounded, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 6, transition: 'all 0.12s',
              }}
                onMouseEnter={e => { if (!isSelected(d)) e.currentTarget.style.backgroundColor = 'rgba(3,126,243,0.2)'; }}
                onMouseLeave={e => { if (!isSelected(d)) e.currentTarget.style.backgroundColor = isToday(d) ? 'rgba(3,126,243,0.15)' : 'transparent'; }}
              >{d}</button>
            ))}
          </div>
          {value && (
            <div style={{ borderTop: `1px solid ${C.navyBorder}`, padding: '6px 8px' }}>
              <button onClick={() => { onChange(''); setOpen(false); }} style={{ width: '100%', padding: '7px 0', border: `1px solid ${C.navyBorder}`, borderRadius: 7, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                {Icons.x} Clear Date
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
    <button onClick={onClick} style={{ background: 'rgba(255,255,255,0.07)', border: `1px solid ${C.navyBorder}`, color: 'rgba(255,255,255,0.6)', cursor: 'pointer', width: 28, height: 28, fontFamily: F.body, fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 7, transition: 'all 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.14)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'}
    >{children}</button>
  );
}

// ─── FORM ATOMS ───────────────────────────────────────────────────────────────
function FieldLabel({ children, required }) {
  return (
    <label style={{ display: 'block', fontFamily: F.rounded, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em', color: C.textMid, marginBottom: 5, textTransform: 'uppercase' }}>
      {children} {required && <span style={{ color: C.red }}>*</span>}
    </label>
  );
}

function FieldError({ children }) {
  return (
    <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 4 }}>
      {Icons.x} {children}
    </p>
  );
}

function ModernInput({ value, onChange, placeholder, error, multiline, rows }) {
  const shared = {
    width: '100%', boxSizing: 'border-box',
    border: `1px solid ${error ? C.red : C.border}`,
    borderRadius: 9, padding: '9px 12px',
    fontFamily: F.body, fontSize: 13, fontWeight: 500,
    backgroundColor: C.white, outline: 'none', color: C.text,
    transition: 'all 0.15s', lineHeight: 1.5,
  };
  const focusStyle = { borderColor: C.blue, boxShadow: `0 0 0 3px ${C.blue}18` };
  const blurStyle  = { borderColor: error ? C.red : C.border, boxShadow: 'none' };
  if (multiline) return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows || 4}
      style={{ ...shared, resize: 'vertical' }}
      onFocus={e => Object.assign(e.target.style, focusStyle)}
      onBlur={e => Object.assign(e.target.style, blurStyle)}
    />
  );
  return (
    <input value={value} onChange={onChange} placeholder={placeholder}
      style={shared}
      onFocus={e => Object.assign(e.target.style, focusStyle)}
      onBlur={e => Object.assign(e.target.style, blurStyle)}
    />
  );
}

// ─── POLAROID PREVIEW (mirrors EventsFeature.jsx) ─────────────────────────────
const B = {
  black: '#0a0a0a', cream: '#FFFBEB',
  indigo: '#312783', red: '#EF3340', yellow: '#FFD100', blue: '#009BD6',
  rounded: '"Varela Round", system-ui, sans-serif',
  bara: '"Barabara", "Impact", "Arial Black", sans-serif',
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
        <div style={{ position: 'absolute', top: -14, right: -14, zIndex: 20, width: 40, height: 40, background: 'white', border: `2px solid ${B.black}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `1px 1px 0 ${B.black}` }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 900, fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>{(event.date || '—').split(' ')[0]}</span>
        </div>
        <div style={{ position: 'relative', aspectRatio: '1/1', overflow: 'hidden', border: `2px solid ${B.black}`, background: c.light }}>
          {event.image_url
            ? <img src={event.image_url} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)', transform: isHovered ? 'scale(1.08)' : 'scale(1)', transition: 'filter 0.5s ease, transform 0.5s ease' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.bara, fontSize: 8, textTransform: 'uppercase', letterSpacing: 2, color: c.bg, opacity: 0.6 }}>No Photo</div>
          }
          <div style={{ position: 'absolute', inset: 0, background: c.bg, mixBlendMode: 'multiply', opacity: isHovered ? 0 : 0.18, transition: 'opacity 0.4s ease' }} />
        </div>
        <div style={{ padding: '10px 4px 4px' }}>
          <span style={{ display: 'inline-block', fontFamily: F.rounded, fontWeight: 800, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'white', padding: '2px 6px', background: c.bg, border: `1px solid ${B.black}`, marginBottom: 4 }}>{event.tag || 'Tag'}</span>
          <p style={{ fontFamily: F.pipanganan, fontSize: inCarousel ? 14 : 12, textTransform: 'uppercase', lineHeight: 1.15, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title || 'Title'}</p>
          <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: inCarousel ? 10 : 9, color: '#6b7280', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.location || 'Location'}</p>
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
        <div style={{ position: 'relative', border: `1px solid ${C.border}`, overflow: 'hidden', aspectRatio: '16/9', marginBottom: 12, borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onUploaded('')} style={{
            position: 'absolute', top: 8, right: 8, backgroundColor: C.red, color: 'white',
            border: 'none', padding: '5px 12px', borderRadius: 7,
            fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', gap: 5,
          }}>{Icons.x} Remove</button>
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
            <div style={{ width: '100%', height: 4, backgroundColor: C.blueMid, borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: `linear-gradient(to right, ${C.blue}, ${C.brandBlue})`, width: pct + '%', transition: 'width 0.3s', borderRadius: 99 }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 48, height: 48, backgroundColor: C.blueLight, border: `1px solid ${C.blueMid}`, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>{Icons.upload}</div>
            <div>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, color: C.blue, margin: '0 0 4px' }}>
                {currentUrl ? 'Replace photo' : 'Drop photo here or click to browse'}
              </p>
              <p style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, margin: 0 }}>PNG · JPG · WEBP · max 5 MB</p>
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
    { id: 'details', label: 'Details' },
    { id: 'photo',   label: 'Photo'   },
    { id: 'style',   label: 'Style'   },
  ];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 1100, backgroundColor: C.surface, borderTop: `1px solid ${C.border}`, boxShadow: '0 -32px 80px rgba(0,0,0,0.25)', height: '90vh', display: 'flex', flexDirection: 'column', borderRadius: '18px 18px 0 0', overflow: 'hidden' }}
      >
        {/* Title bar */}
        <div style={{ display: 'flex', background: C.navy, flexShrink: 0, borderBottom: `1px solid ${C.navyBorder}` }}>
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, borderRight: `1px solid ${C.navyBorder}` }}>
            {[C.brandRed, C.brandYellow, C.green].map((col, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col }} />
            ))}
          </div>
          <div style={{ flex: 1, padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.pipanganan, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {event.id ? `Editing: ${(event.title || '').toUpperCase()}` : 'New Event'}
            </span>
            {hasErrors && (
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, backgroundColor: 'rgba(239,68,68,0.15)', color: C.red, border: `1px solid rgba(239,68,68,0.3)`, padding: '3px 10px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 4 }}>
                {Icons.x} {Object.keys(errors).length} required
              </span>
            )}
          </div>
          <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', borderLeft: `1px solid ${C.navyBorder}` }}>
            <span style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.3)' }}>Live Preview →</span>
          </div>
          <button onClick={onCancel} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', borderLeft: `1px solid ${C.navyBorder}`, padding: '0 22px', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = C.red; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
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
                      fontFamily: F.rounded, fontWeight: 700, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase',
                      cursor: 'pointer', border: 'none',
                      borderBottom: isActive ? `2px solid ${C.blue}` : '2px solid transparent',
                      backgroundColor: isActive ? C.white : 'transparent',
                      color: isActive ? C.blue : C.textMuted, position: 'relative',
                      transition: 'all 0.15s',
                    }}>
                    {i + 1}. {t.label}
                    {tabHasError && <span style={{ position: 'absolute', top: 7, right: 10, width: 5, height: 5, borderRadius: '50%', backgroundColor: C.red }} />}
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
                  <FieldLabel>Description <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: C.textMuted }}>(optional)</span></FieldLabel>
                  <ModernInput value={form.description || ''} onChange={e => set('description')(e.target.value)} placeholder="A short summary…" multiline rows={4} />
                  <p style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, margin: '4px 0 0', textAlign: 'right' }}>{(form.description || '').length} chars</p>
                </div>
                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: C.textMid, margin: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Visibility</p>
                    <p style={{ fontFamily: F.rounded, fontSize: 11, fontWeight: 700, color: form.is_active ? C.green : C.textMuted, margin: '4px 0 0', display: 'flex', alignItems: 'center', gap: 5 }}>
                      {form.is_active ? Icons.eye : Icons.eyeOff}
                      {form.is_active ? 'Visible on site' : 'Hidden from site'}
                    </p>
                  </div>
                  <button onClick={() => set('is_active')(!form.is_active)} style={{
                    padding: '8px 16px', border: `1px solid ${form.is_active ? C.green : C.border}`, borderRadius: 9,
                    fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
                    cursor: 'pointer', backgroundColor: form.is_active ? C.greenLight : C.surface,
                    color: form.is_active ? C.greenDark : C.textMid, transition: 'all .15s',
                    display: 'flex', alignItems: 'center', gap: 5,
                  }}>
                    {form.is_active ? Icons.eye : Icons.eyeOff}
                    {form.is_active ? 'Live' : 'Hidden'}
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
                          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                          padding: '10px 6px', border: form.color === key ? `2px solid ${C.blue}` : `1px solid ${C.border}`,
                          backgroundColor: form.color === key ? C.blueLight : C.white,
                          cursor: 'pointer', borderRadius: 10, transition: 'all 0.12s',
                          boxShadow: form.color === key ? `0 2px 12px ${C.blue}25` : '0 1px 3px rgba(0,0,0,0.04)',
                        }}>
                        <div style={{ width: 26, height: 26, backgroundColor: val.bg, borderRadius: 7, border: form.color === key ? `2px solid ${C.blue}` : '2px solid transparent' }} />
                        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: C.textMid, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{val.label}</span>
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
                          fontFamily: F.mono, fontWeight: 700, fontSize: 11, cursor: 'pointer', borderRadius: 9,
                          backgroundColor: form.rotation === r ? C.blue : C.white,
                          color: form.rotation === r ? 'white' : C.textMid,
                          boxShadow: form.rotation === r ? `0 2px 10px ${C.blue}35` : 'none',
                          transition: 'all 0.12s',
                        }}>
                        {r > 0 ? `+${r}°` : r === 0 ? '0°' : `${r}°`}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ border: `1px solid ${C.border}`, padding: 14, backgroundColor: C.blueLight, display: 'flex', alignItems: 'center', gap: 14, borderRadius: 10 }}>
                  <div style={{ width: 40, height: 40, backgroundColor: c.bg, flexShrink: 0, borderRadius: 10 }} />
                  <div>
                    <p style={{ fontFamily: F.pipanganan, fontSize: 14, margin: 0, color: C.text }}>{c.label} Scheme</p>
                    <p style={{ fontFamily: F.rounded, fontSize: 11, color: C.textMid, margin: '2px 0 0' }}>Card overlay + tag badge</p>
                  </div>
                </div>
              </>)}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', borderTop: `1px solid ${C.border}`, flexShrink: 0, backgroundColor: C.white }}>
              <button onClick={onCancel}
                style={{ flex: 1, padding: 16, border: 'none', borderRight: `1px solid ${C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: 'white', color: C.textMid, transition: 'all .12s', textTransform: 'uppercase', letterSpacing: '0.06em' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                Cancel
              </button>
              <button
                onClick={() => { if (validate()) onSave(form); }} disabled={isSaving}
                style={{ flex: 1, padding: 16, border: 'none', fontFamily: F.rounded, fontWeight: 800, fontSize: 12, cursor: isSaving ? 'not-allowed' : 'pointer', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSaving ? 0.7 : 1, transition: 'filter .15s', boxShadow: `0 2px 14px ${C.blue}45`, textTransform: 'uppercase', letterSpacing: '0.06em' }}
                onMouseEnter={e => { if (!isSaving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                {isSaving ? <Spinner size={14} color="white" /> : Icons.check}
                {isSaving ? 'Saving…' : 'Save Event'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}`, backgroundColor: C.white, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: C.green }} />
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.textMuted }}>Live Preview — Exact Card Output</span>
              <span style={{ marginLeft: 'auto', fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: form.is_active ? C.green : C.textMuted, display: 'flex', alignItems: 'center', gap: 5 }}>
                {form.is_active ? Icons.eye : Icons.eyeOff}
                {form.is_active ? 'VISIBLE ON SITE' : 'HIDDEN'}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#FFFBEB', backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.10) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <PolaroidPreviewCard event={form} />
            </div>
            <div style={{ padding: '10px 20px', borderTop: `1px solid ${C.border}`, background: C.surface, flexShrink: 0 }}>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
                ↑ Exact replica of how this card appears in the Featured Photos carousel
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
        backgroundColor: isFeatured ? C.amberLight : hovered ? '#fffbeb' : 'white',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: isFeatured ? C.amber : hovered ? C.amber : C.textMuted,
        transition: 'all 0.15s',
        boxShadow: isFeatured ? `0 2px 8px ${C.amber}35` : 'none',
        flexShrink: 0, borderRadius: 7,
      }}>
      {isFeatured ? Icons.starFilled : Icons.star}
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
    <div style={{ marginTop: 0, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <SectionBadge>Site Preview</SectionBadge>
        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live carousel</span>
      </div>
      <div style={{ border: `1px solid ${C.border}`, borderRadius: 14, backgroundColor: '#FFFBEB', backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.10) 1.5px, transparent 1.5px)', backgroundSize: '20px 20px', overflow: 'hidden', position: 'relative', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '14px 18px 12px', borderBottom: '2px dashed rgba(0,0,0,0.12)' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: F.bara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.25em', color: B.black, background: B.yellow, padding: '2px 12px', border: `2px solid ${B.black}`, borderRadius: 999, boxShadow: `2px 2px 0 ${B.black}` }}>📸 Throwback Collection</span>
            </div>
            <h2 style={{ fontFamily: F.bara, margin: 0, fontSize: 22, color: B.red, textTransform: 'uppercase', textShadow: `2px 2px 0 ${B.black}` }}>Featured <span style={{ color: B.blue }}>Photos</span></h2>
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
                  <PolaroidPreviewCard key={`${ev.id}-${i}`} event={ev} tiltDeg={tiltDeg} isHovered={hoveredIdx === i} inCarousel={true}
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
          border: `1px solid ${hovered ? C.blue : C.border}`, borderRadius: 11,
          boxShadow: hovered ? `0 0 0 3px ${C.blue}12, 0 4px 14px rgba(0,0,0,0.06)` : '0 1px 4px rgba(0,0,0,0.04)',
          transition: 'all 0.15s',
        }}>
        {/* Drag handle */}
        <div style={{ cursor: 'grab', color: C.textMuted, display: 'flex', flexShrink: 0, opacity: 0.5 }}>{Icons.grip}</div>

        {/* Order badge */}
        <div style={{ flexShrink: 0, width: 26, height: 26, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.rounded, fontWeight: 800, fontSize: 11, color: 'white', boxShadow: `0 2px 6px ${C.blue}35` }}>{idx}</div>

        <StarButton isFeatured={isFeatured} onClick={() => onToggleFeatured(event)} />

        {/* Thumbnail */}
        <div style={{ width: 48, height: 48, flexShrink: 0, border: `1px solid ${C.border}`, overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9 }}>
          {event.image_url
            ? <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
            : <span style={{ color: c.bg, display: 'flex' }}>{Icons.photo}</span>}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: F.pipanganan, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: C.text }}>{event.title}</span>
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', padding: '2px 8px', backgroundColor: c.light, color: c.bg, border: `1px solid ${c.bg}25`, borderRadius: 99 }}>{event.tag}</span>
          </div>
          <p style={{ fontFamily: F.body, fontWeight: 500, fontSize: 11, color: C.textMuted, margin: '3px 0 0' }}>{event.date} · {event.location}</p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <VisToggleBtn active={event.is_active} onClick={() => onToggleActive(event)} />
          <ActionBtn onClick={() => onEdit(event)} variant="primary">{Icons.edit} Edit</ActionBtn>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <ActionBtn onClick={() => { setConfirmDel(false); onDelete(event); }} variant="danger">{Icons.check} Delete</ActionBtn>
              <ActionBtn onClick={() => setConfirmDel(false)} variant="ghost">{Icons.x}</ActionBtn>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)} style={{ width: 30, height: 30, padding: 0, border: `1px solid ${C.border}`, borderRadius: 7, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: 'white', color: C.textMuted, transition: 'all .12s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.redLight; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = C.red; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
              {Icons.trash}
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
function VisToggleBtn({ active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 10px', border: `1px solid ${active ? C.green : C.border}`, borderRadius: 7,
      fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer',
      backgroundColor: active ? C.greenLight : C.surface,
      color: active ? C.greenDark : C.textMuted, transition: 'all .15s',
      display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.05em',
    }}>
      {active ? Icons.eye : Icons.eyeOff}
      {active ? 'Live' : 'Hidden'}
    </button>
  );
}

function ActionBtn({ onClick, children, variant = 'ghost' }) {
  const styles = {
    primary: { bg: C.blue,  color: 'white',    border: C.blue  },
    danger:  { bg: C.red,   color: 'white',    border: C.red   },
    ghost:   { bg: C.white, color: C.textMid,  border: C.border },
  }[variant];
  return (
    <button onClick={onClick}
      style={{ padding: '6px 12px', border: `1px solid ${styles.border}`, borderRadius: 7, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, cursor: 'pointer', backgroundColor: styles.bg, color: styles.color, boxShadow: variant === 'primary' ? `0 2px 8px ${C.blue}30` : 'none', transition: 'filter .12s', display: 'flex', alignItems: 'center', gap: 5, textTransform: 'uppercase', letterSpacing: '0.04em' }}
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
      style={{ display: 'flex', gap: 10, padding: '10px 14px', borderBottom: `1px solid ${C.border}`, alignItems: 'center', backgroundColor: hovered ? C.surface : 'transparent', transition: 'background 0.12s' }}>
      <div style={{ width: 52, height: 52, flexShrink: 0, border: `1px solid ${C.border}`, overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9 }}>
        {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: c.bg, display: 'flex' }}>{Icons.photo}</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.pipanganan, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{ev.title}</p>
        <p style={{ fontFamily: F.body, fontWeight: 500, fontSize: 10, color: C.textMuted, margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
        <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, textTransform: 'uppercase', padding: '1px 7px', backgroundColor: c.light, color: c.bg, borderRadius: 99, border: `1px solid ${c.bg}20` }}>{ev.tag}</span>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: ev.is_active ? C.green : C.textMuted, display: 'flex', alignItems: 'center', gap: 3 }}>
            {ev.is_active ? Icons.eye : Icons.eyeOff}
            {ev.is_active ? 'Live' : 'Hidden'}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
        <LibIconBtn onClick={() => onEdit(ev)} bg={C.blue} color="white" title="Edit">{Icons.edit}</LibIconBtn>
        <LibIconBtn onClick={() => onToggleActive(ev)} bg={ev.is_active ? C.greenLight : C.surface} color={ev.is_active ? C.greenDark : C.textMuted} title="Toggle visibility">
          {ev.is_active ? Icons.eye : Icons.eyeOff}
        </LibIconBtn>
        {confirmDel ? (
          <>
            <LibIconBtn onClick={() => { setConfirmDel(false); onDelete(ev); }} bg={C.red} color="white" title="Confirm delete">{Icons.check}</LibIconBtn>
            <LibIconBtn onClick={() => setConfirmDel(false)} bg={C.surface} color={C.textMid} title="Cancel">{Icons.x}</LibIconBtn>
          </>
        ) : (
          <LibIconBtn onClick={() => setConfirmDel(true)} bg="white" color={C.textMuted} title="Delete" hoverBg={C.redLight} hoverColor={C.red}>{Icons.trash}</LibIconBtn>
        )}
      </div>
    </div>
  );
}

function LibIconBtn({ onClick, bg, color, title, children, hoverBg, hoverColor }) {
  return (
    <button onClick={onClick} title={title} style={{ width: 22, height: 22, backgroundColor: bg, color, border: `1px solid ${C.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 5, transition: 'all .12s' }}
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

  const allTags  = ['ALL', ...Array.from(new Set(events.map(e => e.tag).filter(Boolean)))];
  const filtered = events.filter(ev => {
    const q       = search.toLowerCase();
    const mSearch = !q || (ev.title||'').toLowerCase().includes(q) || (ev.location||'').toLowerCase().includes(q) || (ev.tag||'').toLowerCase().includes(q) || (ev.date||'').toLowerCase().includes(q);
    const mVis    = filterVis   === 'ALL' || (filterVis   === 'LIVE'     ? ev.is_active           : !ev.is_active);
    const mStar   = filterStar  === 'ALL' || (filterStar  === 'STARRED'  ? featuredIds.has(ev.id) : !featuredIds.has(ev.id));
    const mTag    = filterTag   === 'ALL' || ev.tag   === filterTag;
    const mColor  = filterColor === 'ALL' || ev.color === filterColor;
    return mSearch && mVis && mStar && mTag && mColor;
  });

  const totalPages    = Math.max(1, Math.ceil(filtered.length / LIBRARY_PAGE_SIZE));
  const safePage      = Math.min(page, totalPages);
  const paginated     = filtered.slice((safePage - 1) * LIBRARY_PAGE_SIZE, safePage * LIBRARY_PAGE_SIZE);
  const setFilter     = setter => val => { setter(val); setPage(1); };
  const featuredCount = events.filter(e => e.is_featured).length;

  const FilterChip = ({ active, onClick, children, activeBg = C.blue }) => (
    <button onClick={onClick} style={{
      padding: '4px 10px', border: `1px solid ${active ? activeBg : C.border}`,
      fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer', borderRadius: 99,
      backgroundColor: active ? activeBg : 'transparent',
      color: active ? 'white' : C.textMid, transition: 'all 0.12s',
      display: 'flex', alignItems: 'center', gap: 4,
    }}>{children}</button>
  );

  return (
    <div style={{ width: 420, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: `1px solid ${C.border}`, backgroundColor: C.white, overflow: 'hidden' }}>
      {/* Library header */}
      <div style={{ background: C.navy, padding: '16px 18px', flexShrink: 0, borderBottom: `1px solid ${C.navyBorder}` }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 34, height: 34, backgroundColor: 'rgba(3,126,243,0.15)', border: `1px solid rgba(3,126,243,0.25)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>{Icons.folder}</div>
            <div>
              <p style={{ fontFamily: F.pipanganan, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, lineHeight: 1 }}>Photo Library</p>
              <p style={{ fontFamily: F.rounded, fontSize: 10, color: 'rgba(255,255,255,0.35)', margin: '4px 0 0' }}>{events.length} total events</p>
            </div>
          </div>
          <div style={{ fontFamily: F.pipanganan, color: C.blue, fontSize: 32, lineHeight: 1, letterSpacing: '-0.02em' }}>{events.length}</div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <LibStatChip color={C.green} bg="rgba(16,185,129,0.12)" border="rgba(16,185,129,0.2)">{Icons.eye} {events.filter(e => e.is_active).length} Live</LibStatChip>
          <LibStatChip color="rgba(255,255,255,0.45)" bg="rgba(255,255,255,0.07)" border={C.navyBorder}>{Icons.eyeOff} {events.length - events.filter(e => e.is_active).length} Hidden</LibStatChip>
          <LibStatChip color={C.amber} bg="rgba(245,158,11,0.12)" border="rgba(245,158,11,0.2)">{Icons.starFilled} {featuredCount}/{FEATURED_LIMIT}</LibStatChip>
        </div>
      </div>
      <FiestaStripe height={3} />

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden', transition: 'all 0.15s' }}>
          <span style={{ padding: '0 10px', color: C.textMuted, display: 'flex', flexShrink: 0 }}>{Icons.search}</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, tag, date…"
            style={{ flex: 1, padding: '8px 4px', fontFamily: F.body, fontSize: 12, fontWeight: 500, border: 'none', outline: 'none', background: 'transparent', color: C.text }} />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: C.textMuted, display: 'flex', alignItems: 'center' }}>{Icons.x}</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderBottom: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <FilterChip active={filterStar === 'STARRED'} onClick={() => setFilter(setFilterStar)('STARRED')} activeBg={C.amber}>{Icons.starFilled} Starred</FilterChip>
          <FilterChip active={filterStar === 'ALL'} onClick={() => setFilter(setFilterStar)('ALL')}>All</FilterChip>
          <FilterChip active={filterStar === 'UNSTARRED'} onClick={() => setFilter(setFilterStar)('UNSTARRED')} activeBg={C.textMid}>{Icons.star} Unstarred</FilterChip>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['ALL','LIVE','HIDDEN'].map(v => (
            <FilterChip key={v} active={filterVis === v} onClick={() => setFilter(setFilterVis)(v)}
              activeBg={v === 'LIVE' ? C.green : v === 'HIDDEN' ? C.textMid : C.blue}>
              {v === 'LIVE' ? <>{Icons.eye} Live</> : v === 'HIDDEN' ? <>{Icons.eyeOff} Hidden</> : 'All'}
            </FilterChip>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {allTags.map(t => (
            <FilterChip key={t} active={filterTag === t} onClick={() => setFilter(setFilterTag)(t)}>{t}</FilterChip>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Color:</span>
          <button onClick={() => setFilter(setFilterColor)('ALL')} style={{ padding: '2px 8px', border: `1px solid ${filterColor === 'ALL' ? C.blue : C.border}`, backgroundColor: filterColor === 'ALL' ? C.blue : 'transparent', cursor: 'pointer', fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: filterColor === 'ALL' ? 'white' : C.textMuted, borderRadius: 99, textTransform: 'uppercase' }}>ALL</button>
          {Object.entries(COLOR_MAP).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(setFilterColor)(key)} title={val.label}
              style={{ width: 18, height: 18, border: `2px solid ${filterColor === key ? C.blue : 'transparent'}`, backgroundColor: val.bg, cursor: 'pointer', borderRadius: 5, transform: filterColor === key ? 'scale(1.25)' : 'scale(1)', transition: 'all .12s', outline: filterColor === key ? `2px solid ${C.blue}` : 'none', outlineOffset: 2 }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '5px 12px', backgroundColor: C.surface, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.textMuted }}>{filtered.length} of {events.length} · page {safePage}/{totalPages}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0
          ? <div style={{ padding: '40px 20px', textAlign: 'center' }}>
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
          width: '100%', padding: '11px 0', border: 'none',
          fontFamily: F.rounded, fontWeight: 800, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em',
          cursor: 'pointer', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: 'white',
          boxShadow: `0 4px 16px ${C.blue}30`, borderRadius: 9,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          transition: 'all .15s',
        }}
          onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
          onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
          {Icons.images} View All Photos
        </button>
      </div>
    </div>
  );
}

function LibStatChip({ color, bg, border, children }) {
  return (
    <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color, backgroundColor: bg, padding: '4px 10px', borderRadius: 99, border: `1px solid ${border || 'transparent'}`, display: 'inline-flex', alignItems: 'center', gap: 5 }}>{children}</span>
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
    const q       = search.toLowerCase();
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(5,10,20,0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.96, y: 24 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, y: 24 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ width: '90vw', maxWidth: 1100, height: '88vh', backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 18, boxShadow: `0 32px 80px rgba(0,0,0,0.3), 0 0 0 1px ${C.border}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', backgroundColor: C.navy, borderBottom: `1px solid ${C.navyBorder}`, flexShrink: 0 }}>
          <div style={{ flex: 1, padding: '15px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.pipanganan, color: C.white, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: 10 }}>
              {Icons.images} View All Photos
            </span>
            <span style={{ fontFamily: F.rounded, fontWeight: 700, color: C.blue, fontSize: 12, backgroundColor: 'rgba(3,126,243,0.15)', padding: '2px 10px', borderRadius: 99, border: '1px solid rgba(3,126,243,0.25)' }}>{filtered.length}/{events.length}</span>
          </div>
          <button onClick={onClose} style={{ backgroundColor: 'transparent', color: 'rgba(255,255,255,0.4)', border: 'none', borderLeft: `1px solid ${C.navyBorder}`, padding: '0 22px', cursor: 'pointer', transition: 'all .15s', display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.15)'; e.currentTarget.style.color = C.red; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
            {Icons.x}
          </button>
        </div>
        <FiestaStripe />

        {/* Filter bar */}
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, backgroundColor: C.surface }}>
          <div style={{ flex: 1, minWidth: 160, display: 'flex', alignItems: 'center', background: C.white, border: `1px solid ${C.border}`, borderRadius: 9, overflow: 'hidden' }}>
            <span style={{ padding: '0 10px', color: C.textMuted, display: 'flex', flexShrink: 0 }}>{Icons.search}</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…"
              style={{ flex: 1, padding: '8px 4px', fontFamily: F.body, fontSize: 11, fontWeight: 500, border: 'none', outline: 'none', background: 'transparent', color: C.text }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL','LIVE','HIDDEN'].map(v => {
              const active = filterVis === v;
              const bg = active ? (v === 'LIVE' ? C.green : v === 'HIDDEN' ? C.textMid : C.navy) : 'transparent';
              return (
                <button key={v} onClick={() => setFilter(setFilterVis)(v)} style={{ padding: '6px 12px', border: `1px solid ${active ? 'transparent' : C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer', borderRadius: 99, backgroundColor: bg, color: active ? 'white' : C.textMid, display: 'flex', alignItems: 'center', gap: 5, transition: 'all 0.12s' }}>
                  {v === 'LIVE' ? <>{Icons.eye} Live</> : v === 'HIDDEN' ? <>{Icons.eyeOff} Hidden</> : 'All'}
                </button>
              );
            })}
          </div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {allTags.map(t => {
              const active = filterTag === t;
              return <button key={t} onClick={() => setFilter(setFilterTag)(t)} style={{ padding: '4px 10px', border: `1px solid ${active ? C.blue : C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 10, cursor: 'pointer', borderRadius: 99, backgroundColor: active ? C.blue : 'transparent', color: active ? 'white' : C.textMid, transition: 'all 0.12s' }}>{t}</button>;
            })}
          </div>
        </div>

        <div style={{ padding: '6px 18px', backgroundColor: C.blueLight, borderBottom: `1px solid ${C.blueMid}`, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.blue, margin: 0, display: 'flex', alignItems: 'center', gap: 5 }}>
            {Icons.starFilled} Featured on homepage: starred events (max {FEATURED_LIMIT}) · All events appear here
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
                        <div style={{ position: 'absolute', top: -6, left: -6, zIndex: 10, backgroundColor: C.amberLight, border: `1px solid ${C.amber}`, padding: '2px 7px', display: 'flex', alignItems: 'center', gap: 3, borderRadius: 99, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                          {Icons.starFilled}
                          <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, color: C.amber }}>Featured</span>
                        </div>
                      )}
                      <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, overflow: 'hidden', borderRadius: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.05)', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 6px 20px ${C.blue}18, 0 2px 8px rgba(0,0,0,0.06)`; e.currentTarget.style.borderColor = C.blue; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)'; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = 'translateY(0)'; }}>
                        <div style={{ aspectRatio: '1/1', overflow: 'hidden', backgroundColor: c.light, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ color: c.bg, opacity: 0.7 }}>{Icons.photo}</span>}
                          <div style={{ position: 'absolute', top: 5, right: 5 }}>
                            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 8, color: 'white', backgroundColor: ev.is_active ? C.green : 'rgba(0,0,0,0.4)', padding: '2px 7px', borderRadius: 99, display: 'flex', alignItems: 'center', gap: 3 }}>
                              {ev.is_active ? Icons.eye : Icons.eyeOff} {ev.is_active ? 'Live' : 'Hidden'}
                            </span>
                          </div>
                        </div>
                        <div style={{ padding: '8px 10px', borderTop: `1px solid ${C.border}` }}>
                          <span style={{ fontFamily: F.rounded, fontWeight: 800, display: 'inline-block', fontSize: 8, textTransform: 'uppercase', padding: '2px 7px', backgroundColor: c.light, color: c.bg, borderRadius: 99, marginBottom: 4 }}>{ev.tag}</span>
                          <p style={{ fontFamily: F.pipanganan, fontSize: 11, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: C.text }}>{ev.title}</p>
                          <p style={{ fontFamily: F.body, fontWeight: 500, fontSize: 9, color: C.textMuted, margin: '2px 0 8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
                          <div style={{ display: 'flex', gap: 4 }}>
                            <button onClick={() => onEdit(ev)} style={{ flex: 1, padding: '5px 0', border: 'none', fontFamily: F.rounded, fontWeight: 700, fontSize: 9, cursor: 'pointer', background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: 'white', borderRadius: 6, transition: 'filter .12s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}
                              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
                              onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>{Icons.edit} Edit</button>
                            <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
                            <button onClick={() => onToggleActive(ev)} style={{ padding: '5px 7px', border: `1px solid ${C.border}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 9, cursor: 'pointer', backgroundColor: ev.is_active ? C.greenLight : C.surface, color: ev.is_active ? C.greenDark : C.textMuted, borderRadius: 6, transition: 'all .12s', display: 'flex', alignItems: 'center' }}>
                              {ev.is_active ? Icons.eye : Icons.eyeOff}
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
  const [events,         setEvents]         = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [editing,        setEditing]        = useState(null);
  const [isSaving,       setIsSaving]       = useState(false);
  const [toast,          setToast]          = useState(null);
  const [viewAllOpen,    setViewAllOpen]    = useState(false);
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
      showToast(`Max ${FEATURED_LIMIT} featured. Remove a star first.`, 'error'); return;
    }
    const next = !isFeatured;
    setEvents(es => es.map(e => e.id === event.id ? { ...e, is_featured: next } : e));
    try {
      await updateEvent(event.id, { is_featured: next });
      showToast(next ? 'Added to Featured!' : 'Removed from Featured.');
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
        <div style={{ display: 'flex', alignItems: 'stretch', minHeight: 58, backgroundColor: C.navy, borderBottom: `1px solid ${C.navyBorder}`, overflow: 'hidden' }}>

          {/* Brand */}
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `1px solid ${C.navyBorder}`, flexShrink: 0 }}>
            <div style={{ width: 34, height: 34, backgroundColor: 'rgba(3,126,243,0.15)', border: `1px solid rgba(3,126,243,0.25)`, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue }}>{Icons.photo}</div>
            <div>
              <div style={{ fontFamily: F.pipanganan, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.08em', lineHeight: 1 }}>Event Photos</div>
              <div style={{ fontFamily: F.rounded, fontWeight: 600, color: 'rgba(255,255,255,0.3)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>Photo Manager</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px' }}>
            {[
              { val: liveCount,     label: 'Live',          accent: C.green, icon: Icons.eye         },
              { val: hiddenCount,   label: 'Hidden',        accent: 'rgba(255,255,255,0.3)', icon: Icons.eyeOff },
              { val: featuredCount, label: `/ ${FEATURED_LIMIT} Featured`, accent: C.amber, icon: Icons.starFilled },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 16px', borderRight: `1px solid ${C.navyBorder}`, height: '100%' }}>
                <div style={{ color: s.accent, display: 'flex', opacity: 0.7 }}>{s.icon}</div>
                <div>
                  <div style={{ fontFamily: F.pipanganan, fontSize: 20, color: s.accent, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Refresh */}
          <button onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid ${C.navyBorder}`, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.06em' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.4)'; }}>
            {Icons.refresh} Refresh
          </button>

          {/* Add button */}
          <button onClick={() => setEditing({ ...EMPTY_EVENT, display_order: events.length + 1 })}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', background: `linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`, color: 'white', border: 'none', borderLeft: `1px solid ${C.blueDark}`, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'filter .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
            {Icons.plus} Add Event
          </button>

          {/* Toggle Library */}
          <button
            onClick={() => setLibraryVisible(v => !v)}
            title={libraryVisible ? 'Hide Library' : 'Show Library'}
            style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid ${C.navyBorder}`, color: libraryVisible ? C.blue : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = libraryVisible ? C.blue : 'rgba(255,255,255,0.35)'; }}>
            {libraryVisible ? Icons.panelClose : Icons.panelOpen}
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              {libraryVisible ? 'Hide' : 'Show'}
            </span>
          </button>
        </div>
        <FiestaStripe height={3} />
      </div>

      {/* ── BODY ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
        <div style={{ flex: 1, minWidth: 0, overflowY: 'auto', padding: '20px 24px 32px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: 14, flexDirection: 'column' }}>
              <Spinner size={32} color={C.blue} />
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', color: C.textMuted }}>Loading events…</span>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ width: 64, height: 64, backgroundColor: C.blueLight, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.blue, margin: '0 auto 18px' }}>{Icons.photo}</div>
              <p style={{ fontFamily: F.pipanganan, fontSize: 18, color: C.textMid, marginBottom: 6, textTransform: 'uppercase' }}>No events yet</p>
              <p style={{ fontFamily: F.rounded, fontSize: 12, color: C.textMuted, marginBottom: 22 }}>Create your first event to get started.</p>
              <button onClick={() => setEditing({ ...EMPTY_EVENT })} style={{ background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: 'white', border: 'none', padding: '13px 30px', fontFamily: F.rounded, fontWeight: 800, fontSize: 13, cursor: 'pointer', boxShadow: `0 6px 20px ${C.blue}40`, borderRadius: 11, textTransform: 'uppercase', letterSpacing: '0.08em', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                {Icons.plus} Add your first event
              </button>
            </div>
          ) : (
            <>
              <SitePreview events={events} />

              {/* Hint strip */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: `1px solid ${C.border}`, borderRadius: 9, backgroundColor: C.white, marginBottom: 14, marginTop: 22 }}>
                <span style={{ color: C.textMuted, display: 'flex' }}>{Icons.grip}</span>
                <p style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.textMuted, margin: 0 }}>
                  {events.filter(e => e.is_featured).length} featured · Drag to reorder ·{' '}
                  <span style={{ color: C.blue, fontWeight: 700 }}>Edit</span> to open editor ·{' '}
                  <span style={{ color: C.amber, fontWeight: 700 }}>Star</span> to feature (max {FEATURED_LIMIT})
                </p>
              </div>

              {(() => {
                const featuredEvents   = events.filter(e => e.is_featured);
                const nonFeaturedCount = events.length - featuredEvents.length;
                return (
                  <>
                    {featuredEvents.length === 0 ? (
                      <div style={{ padding: '24px', textAlign: 'center', border: `1px dashed ${C.border}`, borderRadius: 11, backgroundColor: C.white }}>
                        <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.textMuted, margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                          {Icons.star} No featured events yet — star an event in the Photo Library to feature it here
                        </p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={featuredEvents} onReorder={handleReorder}
                        style={{ display: 'flex', flexDirection: 'column', gap: 7, listStyle: 'none', padding: 0, margin: 0 }}>
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
                      <div style={{ marginTop: 10, padding: '8px 14px', border: `1px dashed ${C.border}`, borderRadius: 9, backgroundColor: C.surface, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ color: C.textMuted, display: 'flex' }}>{Icons.folder}</span>
                        <span style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.textMuted }}>
                          {nonFeaturedCount} more event{nonFeaturedCount > 1 ? 's' : ''} in the Photo Library — star to feature here
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        {libraryVisible && (
          <PhotoLibrary events={events} featuredIds={featuredIds}
            onEdit={e => setEditing({ ...e })}
            onToggleActive={handleToggleActive}
            onToggleFeatured={handleToggleFeatured}
            onDelete={handleDelete}
            onOpenViewAll={() => setViewAllOpen(true)}
          />
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast key={toast.msg} msg={toast.msg} type={toast.type} />}
      </AnimatePresence>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
});

export default EventsManager;