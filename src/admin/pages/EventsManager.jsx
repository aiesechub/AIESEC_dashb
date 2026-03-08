// src/admin/pages/EventsManager.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Fully inline-styled — matches the AdminApp.jsx design system exactly.
// Changes vs previous version:
//   • Required-field validation before save (title, date, location, tag, photo)
//   • Custom brutalist calendar date-picker (outputs "DEC 14, 2025" format)
//   • Delete works on both DB row AND stored image
//   • SitePreview replaced with moving carousel (mirrors EventsFeature.jsx)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  getAllEvents, createEvent, updateEvent,
  deleteEvent, reorderEvents,
  uploadEventPhoto, deleteEventPhoto,
} from '../../lib/supabase';

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const F = {
  barabara:   '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:      '"Cubao", "Impact", "Arial Black", sans-serif',
  pipanganan: '"Pipanganan", "Impact", "Arial Black", sans-serif',
  body:       'system-ui, sans-serif',
};

const BRAND = {
  indigo: '#312783', red: '#EF3340', green: '#00A651',
  yellow: '#FFD100', blue: '#009BD6', orange: '#F58220',
  cream:  '#FFFBEB', dark: '#1a144f',
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

const FEATURED_LIMIT   = 10;
const LIBRARY_PAGE_SIZE = 10;
const MODAL_PAGE_SIZE   = 10;

// For the carousel tilt sequence (mirrors EventsFeature.jsx)
const TILT_SEQUENCE = [-2, 1, -1, 2, -2, 0, 1, -1, 2, -2];

const MONTHS_SHORT = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];

const EMPTY_EVENT = {
  title: '', date: '', location: '', image_url: '',
  tag: '', color: 'yellow', rotation: -1,
  display_order: 0, is_active: true, is_featured: false,
  description: '',
};

const normalise = (row) => ({
  ...row,
  color:       TAILWIND_TO_KEY[row.color]    ?? row.color    ?? 'yellow',
  rotation:    TAILWIND_TO_DEG[row.rotation] ?? row.rotation ?? -1,
  is_featured: row.is_featured ?? false,
  description: row.description ?? '',
});

const denormalise = (form) => ({ ...form });
const getColor    = (colorKey) => COLOR_MAP[colorKey] || COLOR_MAP.yellow;

// ─── SHARED PRIMITIVES ────────────────────────────────────────────────────────
const FiestaStripe = () => (
  <div style={{
    height: 5, flexShrink: 0,
    background: `linear-gradient(to right,${BRAND.red},${BRAND.yellow},${BRAND.green},${BRAND.blue},${BRAND.orange},${BRAND.red})`,
  }} />
);

function Spinner({ size = 20, color = 'white' }) {
  return (
    <span style={{
      width: size, height: size,
      border: `3px solid ${color}`, borderTopColor: 'transparent',
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
      padding: '12px 20px',
      backgroundColor: type === 'success' ? BRAND.green : BRAND.red,
      border: '4px solid black', boxShadow: '5px 5px 0 0 black',
      fontFamily: F.barabara, fontSize: 14, textTransform: 'uppercase',
      letterSpacing: '0.1em', color: 'white', animation: 'toastIn 0.3s ease',
      maxWidth: 'calc(100vw - 48px)',
    }}>
      {type === 'success' ? '✓' : '✕'} {msg}
    </div>
  );
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, padding: '10px 14px', borderTop: '2px solid #f3f4f6', flexShrink: 0 }}>
      <button onClick={() => onPage(page - 1)} disabled={page === 1}
        style={{ width: 26, height: 26, border: '2px solid black', backgroundColor: page === 1 ? '#f3f4f6' : 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', fontFamily: F.cubao, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === 1 ? '#d1d5db' : 'black', boxShadow: page === 1 ? 'none' : '2px 2px 0 0 black' }}>‹</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => onPage(p)}
          style={{ width: 22, height: 22, border: `2px solid ${p === page ? 'black' : '#e5e7eb'}`, backgroundColor: p === page ? BRAND.indigo : 'white', color: p === page ? 'white' : '#6b7280', cursor: 'pointer', fontFamily: F.barabara, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: p === page ? '2px 2px 0 0 black' : 'none', transition: 'all 0.1s' }}>{p}</button>
      ))}
      <button onClick={() => onPage(page + 1)} disabled={page === totalPages}
        style={{ width: 26, height: 26, border: '2px solid black', backgroundColor: page === totalPages ? '#f3f4f6' : 'white', cursor: page === totalPages ? 'not-allowed' : 'pointer', fontFamily: F.cubao, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: page === totalPages ? '#d1d5db' : 'black', boxShadow: page === totalPages ? 'none' : '2px 2px 0 0 black' }}>›</button>
    </div>
  );
}

// ─── BRUTALIST DATE PICKER ────────────────────────────────────────────────────
// Outputs format "DEC 14, 2025"
function DatePicker({ value, onChange, error }) {
  const [open,        setOpen]        = useState(false);
  const [viewYear,    setViewYear]    = useState(() => {
    if (value) {
      const parts = value.split(' ');
      return parts.length === 3 ? parseInt(parts[2]) : new Date().getFullYear();
    }
    return new Date().getFullYear();
  });
  const [viewMonth,   setViewMonth]   = useState(() => {
    if (value) {
      const parts = value.split(' ');
      const idx = MONTHS_SHORT.indexOf(parts[0]);
      return idx >= 0 ? idx : new Date().getMonth();
    }
    return new Date().getMonth();
  });
  const ref = useRef();

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Parse selected day from value
  const selectedDay  = value ? parseInt(value.split(' ')[1]) : null;
  const selectedMon  = value ? MONTHS_SHORT.indexOf(value.split(' ')[0]) : null;
  const selectedYear = value ? parseInt(value.split(' ')[2]) : null;

  // Build calendar grid
  const firstDay = new Date(viewYear, viewMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const selectDay = (d) => {
    const formatted = `${MONTHS_SHORT[viewMonth]} ${String(d).padStart(2,'0')}, ${viewYear}`;
    onChange(formatted);
    setOpen(false);
  };

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d) =>
    selectedDay === d && selectedMon === viewMonth && selectedYear === viewYear;

  const today = new Date();
  const isToday = (d) =>
    today.getDate() === d && today.getMonth() === viewMonth && today.getFullYear() === viewYear;

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>
        Date <span style={{ color: BRAND.red }}>*</span>
      </label>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', boxSizing: 'border-box',
          border: `3px solid ${error ? BRAND.red : 'black'}`,
          padding: '10px 12px', fontFamily: F.body, fontSize: 13, fontWeight: 700,
          backgroundColor: BRAND.cream, outline: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          textAlign: 'left',
          color: value ? 'black' : '#9ca3af',
          boxShadow: open ? `0 0 0 3px ${BRAND.yellow}` : 'none',
          transition: 'box-shadow 0.15s',
        }}
      >
        <span>{value || 'Pick a date…'}</span>
        <span style={{ fontSize: 14 }}>📅</span>
      </button>
      {error && <p style={{ fontFamily: F.barabara, fontSize: 9, color: BRAND.red, textTransform: 'uppercase', margin: '4px 0 0', letterSpacing: '0.05em' }}>✕ {error}</p>}

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 200,
          backgroundColor: 'white', border: '4px solid black',
          boxShadow: `6px 6px 0 0 ${BRAND.yellow}`,
          width: 280, padding: 0, overflow: 'hidden',
        }}>
          {/* Month/Year nav */}
          <div style={{ backgroundColor: BRAND.dark, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px' }}>
            <button onClick={prevMonth} style={{ background: 'none', border: '2px solid rgba(255,255,255,0.25)', color: 'white', cursor: 'pointer', width: 26, height: 26, fontFamily: F.cubao, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: F.barabara, color: BRAND.yellow, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{MONTHS_SHORT[viewMonth]}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', marginTop: 2 }}>
                <button onClick={() => setViewYear(y => y - 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 10, padding: '0 2px', fontFamily: F.cubao }}>−</button>
                <span style={{ fontFamily: F.cubao, color: 'white', fontSize: 13 }}>{viewYear}</span>
                <button onClick={() => setViewYear(y => y + 1)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: 10, padding: '0 2px', fontFamily: F.cubao }}>+</button>
              </div>
            </div>
            <button onClick={nextMonth} style={{ background: 'none', border: '2px solid rgba(255,255,255,0.25)', color: 'white', cursor: 'pointer', width: 26, height: 26, fontFamily: F.cubao, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </div>
          <FiestaStripe />

          {/* Day-of-week headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
            {['SU','MO','TU','WE','TH','FR','SA'].map(d => (
              <div key={d} style={{ fontFamily: F.barabara, fontSize: 8, textAlign: 'center', padding: '5px 0', color: '#9ca3af', letterSpacing: '0.05em' }}>{d}</div>
            ))}
          </div>

          {/* Days grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0, padding: '6px' }}>
            {/* Empty cells for offset */}
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
              <button
                key={d}
                onClick={() => selectDay(d)}
                style={{
                  aspectRatio: '1/1', border: isSelected(d) ? '3px solid black' : '2px solid transparent',
                  backgroundColor: isSelected(d) ? BRAND.indigo : isToday(d) ? BRAND.cream : 'white',
                  color: isSelected(d) ? BRAND.yellow : isToday(d) ? BRAND.indigo : '#374151',
                  fontFamily: F.barabara, fontSize: 10,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: isSelected(d) ? '2px 2px 0 0 black' : 'none',
                  transition: 'all 0.1s',
                  fontWeight: isToday(d) ? 900 : 'normal',
                }}
                onMouseEnter={e => { if (!isSelected(d)) { e.currentTarget.style.backgroundColor = '#EEF2FF'; e.currentTarget.style.borderColor = BRAND.indigo; } }}
                onMouseLeave={e => { if (!isSelected(d)) { e.currentTarget.style.backgroundColor = isToday(d) ? BRAND.cream : 'white'; e.currentTarget.style.borderColor = 'transparent'; } }}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Clear button */}
          {value && (
            <div style={{ borderTop: '2px solid #e5e7eb', padding: '6px 8px' }}>
              <button onClick={() => { onChange(''); setOpen(false); }}
                style={{ width: '100%', padding: '6px 0', border: '2px solid #e5e7eb', fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', backgroundColor: 'white', color: '#9ca3af' }}>
                ✕ Clear Date
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── PREVIEW CARD ─────────────────────────────────────────────────────────────
function PreviewCard({ event, tiltDeg, isHovered, onMouseEnter, onMouseLeave }) {
  const c = getColor(event.color);
  // If tiltDeg provided (carousel mode), use it; otherwise use event.rotation
  const deg = tiltDeg !== undefined ? tiltDeg : (event.rotation ?? 0);
  const transform = isHovered !== undefined
    ? (isHovered ? 'rotate(0deg) translateY(-12px) scale(1.04)' : `rotate(${deg}deg)`)
    : `rotate(${deg}deg)`;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        transform: tiltDeg !== undefined ? undefined : `rotate(${deg}deg)`,
        transition: 'all 0.25s', display: 'inline-block',
        flexShrink: tiltDeg !== undefined ? 0 : undefined,
        width: tiltDeg !== undefined ? 160 : undefined,
        padding: tiltDeg !== undefined ? '18px 12px' : undefined,
        cursor: tiltDeg !== undefined ? 'default' : undefined,
      }}
    >
      <div style={{
        backgroundColor: 'white', border: '3px solid black',
        padding: 6,
        boxShadow: isHovered ? '8px 8px 0 0 black' : '4px 4px 0 0 black',
        width: tiltDeg !== undefined ? '100%' : 130,
        position: 'relative',
        transform: tiltDeg !== undefined ? transform : undefined,
        transition: tiltDeg !== undefined ? 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease' : undefined,
        willChange: tiltDeg !== undefined ? 'transform' : undefined,
      }}>
        <div style={{
          position: 'absolute', top: -12, right: -12, zIndex: 20,
          width: 36, height: 36, backgroundColor: 'white',
          border: '2px solid black', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '1px 1px 0 0 black',
        }}>
          <span style={{ fontFamily: F.cubao, fontSize: 9, lineHeight: 1.1, textAlign: 'center' }}>
            {(event.date || '—').split(' ')[0]}
          </span>
        </div>
        <div style={{
          aspectRatio: '1/1', overflow: 'hidden', border: '2px solid black',
          backgroundColor: c.light, display: 'flex', alignItems: 'center',
          justifyContent: 'center', position: 'relative',
        }}>
          {event.image_url
            ? <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)', transform: isHovered ? 'scale(1.08)' : 'scale(1)', transition: 'filter 0.5s ease, transform 0.5s ease' }} />
            : <span style={{ fontFamily: F.barabara, color: c.bg, fontSize: 9, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6 }}>NO PHOTO</span>}
          <div style={{ position: 'absolute', inset: 0, backgroundColor: c.bg, mixBlendMode: 'multiply', opacity: isHovered ? 0 : 0.2, transition: 'opacity 0.4s ease' }} />
        </div>
        <div style={{ paddingTop: 7, paddingBottom: 3 }}>
          <span style={{
            fontFamily: F.barabara, display: 'inline-block', fontSize: 9,
            textTransform: 'uppercase', letterSpacing: 1, color: 'white',
            padding: '2px 5px', backgroundColor: c.bg, border: '1px solid black', marginBottom: 3,
          }}>{event.tag || 'Tag'}</span>
          <p style={{ fontFamily: F.pipanganan, fontSize: 12, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.title || 'Title'}
          </p>
          <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, color: '#6b7280', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {event.location || 'Location'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── SITE PREVIEW — MOVING CAROUSEL ──────────────────────────────────────────
function SitePreview({ events }) {
  const featured = events.filter(e => e.is_featured && e.is_active);
  const trackRef  = useRef(null);
  const rafRef    = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const SPEED = 0.4;

  // Stable key that changes whenever the visible set or any active state changes
  const featuredKey = featured.map(e => `${e.id}:${e.is_active}`).join(',');

  // Duplicate 4× for seamless loop
  const displayEvents = featured.length
    ? [...featured, ...featured, ...featured, ...featured]
    : [];

  useEffect(() => {
    if (!featured.length) return;
    const track = trackRef.current;
    if (!track) return;
    // Reset position whenever the visible set changes
    offsetRef.current = 0;
    track.style.transform = 'translateX(0px)';
    let loopLen = 0;
    const measure = () => { loopLen = track.scrollWidth / 4; };
    // Measure after paint so DOM is settled
    const rafMeasure = requestAnimationFrame(() => { measure(); });
    const animate = () => {
      if (!pausedRef.current) {
        offsetRef.current += SPEED;
        if (loopLen > 0 && offsetRef.current >= loopLen) offsetRef.current -= loopLen;
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(rafMeasure);
      window.removeEventListener('resize', measure);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featuredKey]);

  return (
    <div style={{ marginTop: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16, paddingBottom: 12, borderBottom: '4px solid black' }}>
        <span style={{ fontFamily: F.barabara, backgroundColor: 'black', color: BRAND.yellow, padding: '4px 14px', fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.2em' }}>Site Preview</span>
        <span style={{ fontFamily: F.body, fontSize: 10, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Live carousel preview</span>
      </div>

      <div style={{ border: '4px solid black', backgroundColor: '#fcfbf7', backgroundImage: 'radial-gradient(#44444420 1px,transparent 1px)', backgroundSize: '15px 15px', overflow: 'hidden', position: 'relative' }}>
        {/* Header row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 16px 10px', borderBottom: '2px dashed black' }}>
          <div>
            <h2 style={{ fontFamily: F.barabara, margin: 0, fontSize: 20, color: BRAND.red, textTransform: 'uppercase', textShadow: '2px 2px 0 black' }}>Featured Photos</h2>
            <p style={{ fontFamily: F.body, margin: '2px 0 0', fontSize: 8, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#475569' }}>Throwback Collection</p>
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', inset: 0, backgroundColor: 'black', transform: 'translate(2px,2px)' }} />
            <span style={{ fontFamily: F.barabara, position: 'relative', display: 'block', padding: '4px 10px', backgroundColor: BRAND.yellow, border: '2px solid black', fontSize: 9, textTransform: 'uppercase' }}>View All Photos</span>
          </div>
        </div>

        {featured.length === 0 ? (
          <p style={{ fontFamily: F.barabara, padding: '24px 0', textAlign: 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af', margin: 0 }}>
            No starred events · click ☆ on any event to feature it
          </p>
        ) : (
          <div style={{ position: 'relative', overflow: 'hidden', padding: '0' }}>
            {/* Edge fades */}
            <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 60, zIndex: 10, background: 'linear-gradient(to right, #fcfbf7 20%, transparent)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 60, zIndex: 10, background: 'linear-gradient(to left, #fcfbf7 20%, transparent)', pointerEvents: 'none' }} />
            <div ref={trackRef} style={{ display: 'flex', alignItems: 'center', willChange: 'transform', padding: '6px 0 14px' }}>
              {displayEvents.map((ev, i) => {
                const origIdx  = i % featured.length;
                const tiltDeg  = TILT_SEQUENCE[origIdx % TILT_SEQUENCE.length];
                return (
                  <PreviewCard
                    key={`${ev.id}-${i}`}
                    event={ev}
                    tiltDeg={tiltDeg}
                    isHovered={hoveredIdx === i}
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

// ─── PHOTO UPLOADER ───────────────────────────────────────────────────────────
function PhotoUploader({ currentUrl, onUploaded, error }) {
  const [uploading, setUploading] = useState(false);
  const [pct,       setPct]       = useState(0);
  const [err,       setErr]       = useState('');
  const fileRef = useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)    { setErr('Image must be under 5 MB.');    return; }
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
      <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 8 }}>
        Photo <span style={{ color: BRAND.red }}>*</span>
      </label>
      {currentUrl && (
        <div style={{ position: 'relative', border: '4px solid black', overflow: 'hidden', aspectRatio: '16/9', marginBottom: 12 }}>
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onUploaded('')} style={{ position: 'absolute', top: 8, right: 8, backgroundColor: BRAND.red, color: 'white', border: '3px solid black', padding: '4px 8px', fontFamily: F.barabara, fontSize: 10, cursor: 'pointer', textTransform: 'uppercase' }}>✕ Remove</button>
        </div>
      )}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{ border: `4px dashed ${error && !currentUrl ? BRAND.red : uploading ? BRAND.indigo : '#d1d5db'}`, padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, cursor: 'pointer', backgroundColor: uploading ? '#EEF2FF' : BRAND.cream, transition: 'all 0.2s', textAlign: 'center' }}>
        {uploading ? (
          <>
            <Spinner size={28} color={BRAND.indigo} />
            <p style={{ fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: BRAND.indigo, margin: 0 }}>Uploading…</p>
            <div style={{ width: '100%', height: 8, border: '2px solid black', backgroundColor: 'white' }}>
              <div style={{ height: '100%', backgroundColor: BRAND.indigo, width: pct + '%', transition: 'width 0.3s' }} />
            </div>
          </>
        ) : (
          <>
            <span style={{ fontSize: 32 }}>📸</span>
            <p style={{ fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#374151', margin: 0 }}>{currentUrl ? 'Replace photo' : 'Drop photo here'}</p>
            <p style={{ fontFamily: F.body, fontSize: 10, color: '#9ca3af', fontWeight: 700, margin: 0 }}>PNG · JPG · WEBP · max 5 MB · click or drag</p>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div style={{ marginTop: 10 }}>
        <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>Or Paste Image URL</label>
        <input value={currentUrl || ''} onChange={e => onUploaded(e.target.value)} placeholder="https://…"
          style={{ width: '100%', boxSizing: 'border-box', border: `3px solid ${error && !currentUrl ? BRAND.red : 'black'}`, padding: '10px 12px', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
      </div>
      {error && !currentUrl && <p style={{ fontFamily: F.barabara, fontSize: 9, color: BRAND.red, textTransform: 'uppercase', margin: '6px 0 0', letterSpacing: '0.05em' }}>✕ {error}</p>}
      {err && <p style={{ fontFamily: F.barabara, fontSize: 10, color: BRAND.red, textTransform: 'uppercase', margin: '6px 0 0' }}>✕ {err}</p>}
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

  // ── Validation ──────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title?.trim())    e.title    = 'Title is required';
    if (!form.date?.trim())     e.date     = 'Date is required';
    if (!form.location?.trim()) e.location = 'Location is required';
    if (!form.tag?.trim())      e.tag      = 'Tag is required';
    if (!form.image_url?.trim()) e.image_url = 'Photo is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (validate()) onSave(form);
  };

  // Clear individual error when field is filled
  const setField = (k) => (v) => {
    set(k)(v);
    if (errors[k] && v?.trim?.()) setErrors(e => { const n = { ...e }; delete n[k]; return n; });
  };

  const TABS = [
    { id: 'details', label: '① Details' },
    { id: 'photo',   label: '② Photo'   },
    { id: 'style',   label: '③ Style'   },
  ];

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        style={{ width: '100%', maxWidth: 1060, backgroundColor: BRAND.cream, border: '4px solid black', borderBottom: 'none', boxShadow: `0 -8px 0 0 ${BRAND.yellow}`, height: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Title bar */}
        <div style={{ display: 'flex', borderBottom: '4px solid black', flexShrink: 0 }}>
          <div style={{ backgroundColor: BRAND.dark, padding: '0 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
            {[BRAND.yellow, BRAND.red, BRAND.green].map((col, i) => (
              <div key={i} style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: col, border: '2px solid rgba(0,0,0,0.3)' }} />
            ))}
          </div>
          <div style={{ flex: 1, backgroundColor: 'black', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.barabara, color: BRAND.yellow, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {event.id ? `✎ EDITING: ${(event.title || '').toUpperCase()}` : '✚ NEW EVENT'}
            </span>
            {hasErrors && (
              <span style={{ fontFamily: F.barabara, fontSize: 10, backgroundColor: BRAND.red, color: 'white', padding: '3px 10px', textTransform: 'uppercase', letterSpacing: '0.1em', border: '2px solid rgba(255,255,255,0.3)' }}>
                ✕ {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? 's' : ''} required
              </span>
            )}
          </div>
          <div style={{ backgroundColor: BRAND.yellow, padding: '0 18px', display: 'flex', alignItems: 'center', borderLeft: '4px solid black' }}>
            <span style={{ fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.18em', color: 'black' }}>Live Preview →</span>
          </div>
          <button onClick={onCancel} style={{ backgroundColor: BRAND.red, color: 'white', border: 'none', borderLeft: '4px solid black', padding: '0 20px', fontFamily: F.barabara, fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <FiestaStripe />

        <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
          {/* Form panel */}
          <div style={{ width: 370, flexShrink: 0, display: 'flex', flexDirection: 'column', borderRight: '4px solid black', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '4px solid black', flexShrink: 0 }}>
              {TABS.map((t, i) => {
                // Show error dot on tab if it has errors
                const tabHasError =
                  (t.id === 'details' && (errors.title || errors.date || errors.location || errors.tag)) ||
                  (t.id === 'photo'   && errors.image_url);
                return (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    style={{ flex: 1, padding: '12px 0', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', border: 'none', borderRight: i < 2 ? '3px solid black' : 'none', backgroundColor: tab === t.id ? BRAND.yellow : 'white', color: tab === t.id ? 'black' : '#9ca3af', position: 'relative' }}>
                    {t.label}
                    {tabHasError && <span style={{ position: 'absolute', top: 6, right: 8, width: 7, height: 7, borderRadius: '50%', backgroundColor: BRAND.red, border: '1px solid white' }} />}
                  </button>
                );
              })}
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: 20, backgroundColor: 'white', display: 'flex', flexDirection: 'column', gap: 15 }}>
              {tab === 'details' && (
                <>
                  {/* Title */}
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>
                      Event Title <span style={{ color: BRAND.red }}>*</span>
                    </label>
                    <input value={form.title || ''} onChange={e => setField('title')(e.target.value)} placeholder="e.g. ACAMP"
                      style={{ width: '100%', boxSizing: 'border-box', border: `3px solid ${errors.title ? BRAND.red : 'black'}`, padding: '10px 12px', fontFamily: F.body, fontSize: 13, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
                    {errors.title && <p style={{ fontFamily: F.barabara, fontSize: 9, color: BRAND.red, textTransform: 'uppercase', margin: '4px 0 0', letterSpacing: '0.05em' }}>✕ {errors.title}</p>}
                  </div>

                  {/* Date picker */}
                  <DatePicker value={form.date || ''} onChange={v => setField('date')(v)} error={errors.date} />

                  {/* Location */}
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>
                      Location <span style={{ color: BRAND.red }}>*</span>
                    </label>
                    <input value={form.location || ''} onChange={e => setField('location')(e.target.value)} placeholder="e.g. Cubao Expo"
                      style={{ width: '100%', boxSizing: 'border-box', border: `3px solid ${errors.location ? BRAND.red : 'black'}`, padding: '10px 12px', fontFamily: F.body, fontSize: 13, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
                    {errors.location && <p style={{ fontFamily: F.barabara, fontSize: 9, color: BRAND.red, textTransform: 'uppercase', margin: '4px 0 0', letterSpacing: '0.05em' }}>✕ {errors.location}</p>}
                  </div>

                  {/* Tag */}
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>
                      Tag / Label <span style={{ color: BRAND.red }}>*</span>
                    </label>
                    <input value={form.tag || ''} onChange={e => setField('tag')(e.target.value)} placeholder="e.g. AIESEC IN UST"
                      style={{ width: '100%', boxSizing: 'border-box', border: `3px solid ${errors.tag ? BRAND.red : 'black'}`, padding: '10px 12px', fontFamily: F.body, fontSize: 13, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
                    {errors.tag && <p style={{ fontFamily: F.barabara, fontSize: 9, color: BRAND.red, textTransform: 'uppercase', margin: '4px 0 0', letterSpacing: '0.05em' }}>✕ {errors.tag}</p>}
                  </div>

                  {/* Description */}
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 5 }}>
                      Description <span style={{ fontFamily: F.body, fontSize: 8, color: '#9ca3af', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
                    </label>
                    <textarea
                      value={form.description || ''}
                      onChange={e => set('description')(e.target.value)}
                      placeholder="A short summary of the event shown on detail pages…"
                      rows={4}
                      style={{ width: '100%', boxSizing: 'border-box', border: '3px solid black', padding: '10px 12px', fontFamily: F.body, fontSize: 12, fontWeight: 500, backgroundColor: BRAND.cream, outline: 'none', resize: 'vertical', lineHeight: 1.5, color: '#374151' }}
                    />
                    <p style={{ fontFamily: F.body, fontSize: 8, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '4px 0 0', textAlign: 'right' }}>
                      {(form.description || '').length} chars
                    </p>
                  </div>
                  <div style={{ borderTop: '3px dashed #e5e7eb', paddingTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', margin: 0 }}>Visibility</p>
                      <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: form.is_active ? BRAND.green : '#9ca3af', margin: '4px 0 0' }}>
                        {form.is_active ? '● Visible on site' : '○ Hidden from site'}
                      </p>
                    </div>
                    <button onClick={() => set('is_active')(!form.is_active)}
                      style={{ padding: '8px 16px', border: '4px solid black', fontFamily: F.barabara, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', backgroundColor: form.is_active ? BRAND.green : '#e5e7eb', color: form.is_active ? 'white' : '#6b7280', boxShadow: '3px 3px 0 0 black' }}>
                      {form.is_active ? 'LIVE' : 'HIDDEN'}
                    </button>
                  </div>
                </>
              )}

              {tab === 'photo' && (
                <PhotoUploader
                  currentUrl={form.image_url}
                  onUploaded={url => { set('image_url')(url); if (errors.image_url && url?.trim()) setErrors(e => { const n = { ...e }; delete n.image_url; return n; }); }}
                  error={errors.image_url}
                />
              )}

              {tab === 'style' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 10 }}>Accent Color</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                      {Object.entries(COLOR_MAP).map(([key, val]) => (
                        <button key={key} onClick={() => set('color')(key)}
                          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '10px 6px', border: form.color === key ? '4px solid black' : '3px solid #e5e7eb', backgroundColor: form.color === key ? val.light : 'white', cursor: 'pointer', boxShadow: form.color === key ? '3px 3px 0 0 black' : 'none', transition: 'all 0.12s' }}>
                          <div style={{ width: 28, height: 28, backgroundColor: val.bg, border: '2px solid rgba(0,0,0,0.2)' }} />
                          <span style={{ fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', color: '#374151' }}>{val.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280', marginBottom: 10 }}>Card Tilt</label>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {[-2, -1, 0, 1, 2].map(r => (
                        <button key={r} onClick={() => set('rotation')(r)}
                          style={{ flex: 1, padding: '10px 0', border: form.rotation === r ? '4px solid black' : '3px solid #e5e7eb', fontFamily: F.cubao, fontSize: 13, cursor: 'pointer', backgroundColor: form.rotation === r ? BRAND.yellow : 'white', boxShadow: form.rotation === r ? '3px 3px 0 0 black' : 'none', transition: 'all 0.12s' }}>
                          {r > 0 ? `+${r}°` : r === 0 ? '0°' : `${r}°`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{ border: '4px solid black', padding: 14, backgroundColor: c.light, display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 44, height: 44, backgroundColor: c.bg, border: '4px solid black', flexShrink: 0 }} />
                    <div>
                      <p style={{ fontFamily: F.barabara, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.1em', margin: 0 }}>{c.label} Scheme</p>
                      <p style={{ fontFamily: F.body, fontSize: 10, color: '#6b7280', fontWeight: 700, margin: '3px 0 0' }}>Card overlay + tag badge</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div style={{ display: 'flex', borderTop: '4px solid black', flexShrink: 0 }}>
              <button onClick={onCancel}
                style={{ flex: 1, padding: 16, border: 'none', borderRight: '4px solid black', fontFamily: F.barabara, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', backgroundColor: 'white', color: '#374151' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
                Cancel
              </button>
              <button onClick={handleSave} disabled={isSaving}
                style={{ flex: 1, padding: 16, border: 'none', fontFamily: F.barabara, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: isSaving ? 'not-allowed' : 'pointer', backgroundColor: BRAND.indigo, color: BRAND.yellow, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: isSaving ? 0.7 : 1 }}
                onMouseEnter={e => { if (!isSaving) e.currentTarget.style.backgroundColor = '#231d5e'; }}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND.indigo}>
                {isSaving ? <Spinner size={14} /> : '✓'}
                {isSaving ? 'Saving…' : 'Save Event'}
              </button>
            </div>
          </div>

          {/* Live preview */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 20px', borderBottom: '3px solid black', backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: BRAND.green }} />
              <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#6b7280' }}>Live Preview — Updates As You Type</span>
              <span style={{ marginLeft: 'auto', fontFamily: F.barabara, fontSize: 10, color: form.is_active ? BRAND.green : '#9ca3af' }}>
                {form.is_active ? '● VISIBLE ON SITE' : '○ HIDDEN'}
              </span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#fcfbf7', backgroundImage: 'radial-gradient(#44444422 1px,transparent 1px)', backgroundSize: '15px 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
              <PreviewCard event={form} />
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
      style={{ width: sz, height: sz, border: `2px solid ${isFeatured ? '#EAB308' : hovered ? '#EAB308' : '#d1d5db'}`, backgroundColor: isFeatured ? '#FEF9C3' : hovered ? '#fffbeb' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: size === 'sm' ? 12 : 14, transition: 'all 0.15s', boxShadow: isFeatured ? '2px 2px 0 0 black' : 'none', flexShrink: 0 }}>
      {isFeatured ? '⭐' : '☆'}
    </button>
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
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', backgroundColor: 'white', border: '4px solid black', boxShadow: hovered ? 'none' : '4px 4px 0 0 black', transform: hovered ? 'translate(4px,4px)' : 'none', transition: 'all 0.12s' }}>
        <div style={{ cursor: 'grab', color: '#d1d5db', fontSize: 18, flexShrink: 0, lineHeight: 1 }}>⠿</div>
        <div style={{ flexShrink: 0, width: 24 }}>
          <div style={{ width: 24, height: 24, backgroundColor: c.bg, border: '2px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.cubao, fontSize: 13, color: 'white' }}>{idx}</div>
        </div>
        <StarButton isFeatured={isFeatured} onClick={() => onToggleFeatured(event)} />
        <div style={{ width: 48, height: 48, flexShrink: 0, border: '3px solid black', overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {event.image_url
            ? <img src={event.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'grayscale(1)' }} />
            : <span style={{ fontFamily: F.barabara, fontSize: 10, color: c.bg }}>?</span>}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: F.barabara, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{event.title}</span>
            <span style={{ fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '2px 7px', backgroundColor: c.bg, color: 'white', border: '2px solid black' }}>{event.tag}</span>
          </div>
          <p style={{ fontFamily: F.body, fontSize: 11, fontWeight: 700, color: '#6b7280', margin: '3px 0 0' }}>{event.date} · {event.location}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <button onClick={() => onToggleActive(event)}
            style={{ padding: '6px 10px', border: '3px solid black', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', backgroundColor: event.is_active ? BRAND.green : '#e5e7eb', color: event.is_active ? 'white' : '#6b7280', boxShadow: '2px 2px 0 0 black' }}>
            {event.is_active ? '● LIVE' : '○ HIDDEN'}
          </button>
          <button onClick={() => onEdit(event)}
            style={{ padding: '6px 12px', border: '3px solid black', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', backgroundColor: BRAND.indigo, color: BRAND.yellow, boxShadow: '2px 2px 0 0 black' }}>
            ✎ Edit
          </button>
          {confirmDel ? (
            <div style={{ display: 'flex', gap: 4 }}>
              <button onClick={() => { setConfirmDel(false); onDelete(event); }}
                style={{ padding: '6px 8px', border: '3px solid black', backgroundColor: BRAND.red, color: 'white', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '2px 2px 0 0 black' }}>
                ✕ Delete
              </button>
              <button onClick={() => setConfirmDel(false)}
                style={{ padding: '6px 8px', border: '3px solid black', backgroundColor: 'white', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDel(true)}
              style={{ padding: '6px 10px', border: '3px solid black', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', cursor: 'pointer', backgroundColor: 'white', color: '#d1d5db', letterSpacing: '0.1em' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF0F1'; e.currentTarget.style.color = BRAND.red; e.currentTarget.style.borderColor = BRAND.red; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.borderColor = 'black'; }}>
              🗑 Del
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
}

// ─── PHOTO LIBRARY PANEL ──────────────────────────────────────────────────────
function PhotoLibrary({ events, featuredIds, onEdit, onToggleActive, onToggleFeatured, onDelete, onOpenViewAll }) {
  const [search,      setSearch]      = useState('');
  const [filterVis,   setFilterVis]   = useState('ALL');
  const [filterStar,  setFilterStar]  = useState('STARRED');
  const [filterTag,   setFilterTag]   = useState('ALL');
  const [filterColor, setFilterColor] = useState('ALL');
  const [page,        setPage]        = useState(1);

  const allTags = ['ALL', ...Array.from(new Set(events.map(e => e.tag).filter(Boolean)))];

  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch = !q || (ev.title||'').toLowerCase().includes(q) || (ev.location||'').toLowerCase().includes(q) || (ev.tag||'').toLowerCase().includes(q) || (ev.date||'').toLowerCase().includes(q);
    const matchVis   = filterVis   === 'ALL' || (filterVis === 'LIVE' ? ev.is_active : !ev.is_active);
    const matchStar  = filterStar  === 'ALL' || (filterStar === 'STARRED' ? featuredIds.has(ev.id) : !featuredIds.has(ev.id));
    const matchTag   = filterTag   === 'ALL' || ev.tag   === filterTag;
    const matchColor = filterColor === 'ALL' || ev.color === filterColor;
    return matchSearch && matchVis && matchStar && matchTag && matchColor;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / LIBRARY_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * LIBRARY_PAGE_SIZE, safePage * LIBRARY_PAGE_SIZE);
  const setFilter  = (setter) => (val) => { setter(val); setPage(1); };
  const featuredCount = events.filter(e => e.is_featured).length;

  return (
    <div style={{ width: 480, flexShrink: 0, display: 'flex', flexDirection: 'column', borderLeft: '4px solid black', backgroundColor: 'white', overflow: 'hidden' }}>
      <div style={{ backgroundColor: BRAND.dark, padding: '12px 14px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontFamily: F.barabara, color: BRAND.yellow, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em' }}>📁 Photo Library</span>
          <span style={{ fontFamily: F.cubao, color: 'white', fontSize: 18 }}>{events.length}</span>
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: BRAND.green, backgroundColor: 'rgba(0,166,81,0.2)', padding: '2px 7px', border: `1px solid ${BRAND.green}` }}>{events.filter(e => e.is_active).length} Live</span>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 7px', border: '1px solid rgba(255,255,255,0.2)' }}>{events.length - events.filter(e => e.is_active).length} Hidden</span>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#FEF9C3', backgroundColor: 'rgba(234,179,8,0.2)', padding: '2px 7px', border: '1px solid #EAB308' }}>⭐ {featuredCount}/{FEATURED_LIMIT} Featured</span>
        </div>
      </div>
      <FiestaStripe />

      {/* Search */}
      <div style={{ padding: '10px 12px', borderBottom: '3px solid #e5e7eb', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>🔍</span>
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search title, tag, date…"
            style={{ width: '100%', boxSizing: 'border-box', border: '3px solid black', padding: '8px 28px 8px 28px', fontFamily: F.body, fontSize: 11, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
          {search && <button onClick={() => { setSearch(''); setPage(1); }} style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 13, fontFamily: F.barabara }}>✕</button>}
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '8px 12px', borderBottom: '3px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: 7, flexShrink: 0 }}>
        {/* Star filter row */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[
            { val: 'STARRED', label: '⭐ Starred',  activeBg: '#FEF9C3', activeBorder: '#EAB308', activeColor: '#78350f' },
            { val: 'ALL',     label: '☆ All',       activeBg: 'black',   activeBorder: 'black',   activeColor: 'white'   },
            { val: 'UNSTARRED', label: '✕ Unstarred', activeBg: '#f3f4f6', activeBorder: 'black',   activeColor: '#374151' },
          ].map(({ val, label, activeBg, activeBorder, activeColor }) => {
            const active = filterStar === val;
            return (
              <button key={val} onClick={() => setFilter(setFilterStar)(val)}
                style={{ flex: 1, padding: '5px 0', border: `2px solid ${active ? activeBorder : '#e5e7eb'}`, fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', backgroundColor: active ? activeBg : 'white', color: active ? activeColor : '#9ca3af', boxShadow: active ? '2px 2px 0 0 black' : 'none', transition: 'all 0.1s' }}>
                {label}
              </button>
            );
          })}
        </div>
        {/* Visibility filter row */}
        <div style={{ display: 'flex', gap: 4 }}>
          {['ALL', 'LIVE', 'HIDDEN'].map(v => {
            const active = filterVis === v;
            const bg  = active ? (v === 'LIVE' ? BRAND.green : v === 'HIDDEN' ? '#e5e7eb' : 'black') : 'white';
            const col = active ? (v === 'HIDDEN' ? '#374151' : 'white') : '#9ca3af';
            return <button key={v} onClick={() => setFilter(setFilterVis)(v)} style={{ flex: 1, padding: '5px 0', border: `2px solid ${active ? 'black' : '#e5e7eb'}`, fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', backgroundColor: bg, color: col, boxShadow: active ? '2px 2px 0 0 black' : 'none', transition: 'all 0.1s' }}>{v}</button>;
          })}
        </div>
        <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {allTags.map(t => {
            const active = filterTag === t;
            return <button key={t} onClick={() => setFilter(setFilterTag)(t)} style={{ padding: '2px 7px', border: `2px solid ${active ? 'black' : '#e5e7eb'}`, fontFamily: F.barabara, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.04em', cursor: 'pointer', backgroundColor: active ? BRAND.indigo : 'white', color: active ? 'white' : '#6b7280', boxShadow: active ? '2px 2px 0 0 black' : 'none', transition: 'all 0.1s' }}>{t}</button>;
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>Color:</span>
          <button onClick={() => setFilter(setFilterColor)('ALL')} style={{ width: 22, height: 18, border: `2px solid ${filterColor === 'ALL' ? 'black' : '#e5e7eb'}`, backgroundColor: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: filterColor === 'ALL' ? '2px 2px 0 0 black' : 'none' }}>
            <span style={{ fontFamily: F.barabara, fontSize: 7, color: 'white' }}>ALL</span>
          </button>
          {Object.entries(COLOR_MAP).map(([key, val]) => (
            <button key={key} onClick={() => setFilter(setFilterColor)(key)} title={val.label} style={{ width: 18, height: 18, border: `2px solid ${filterColor === key ? 'black' : 'white'}`, backgroundColor: val.bg, cursor: 'pointer', boxShadow: filterColor === key ? '2px 2px 0 0 black' : 'none', transition: 'all 0.1s', transform: filterColor === key ? 'scale(1.15)' : 'scale(1)' }} />
          ))}
        </div>
      </div>

      <div style={{ padding: '4px 12px', backgroundColor: '#f9fafb', borderBottom: '2px solid #f3f4f6', flexShrink: 0 }}>
        <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{filtered.length} of {events.length} · page {safePage}/{totalPages}</span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '36px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: F.barabara, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af', margin: 0 }}>No events found</p>
          </div>
        ) : paginated.map(ev => {
          const c = getColor(ev.color);
          const isFeat = featuredIds.has(ev.id);
          return <LibraryRow key={ev.id} ev={ev} c={c} isFeat={isFeat} onEdit={onEdit} onToggleActive={onToggleActive} onToggleFeatured={onToggleFeatured} onDelete={onDelete} />;
        })}
      </div>
      <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />

      <div style={{ borderTop: '4px solid black', padding: 10, flexShrink: 0, backgroundColor: BRAND.cream }}>
        <button onClick={onOpenViewAll}
          style={{ width: '100%', padding: '10px 0', border: '4px solid black', fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', backgroundColor: BRAND.yellow, color: 'black', boxShadow: '3px 3px 0 0 black', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.12s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translate(3px,3px)'; e.currentTarget.style.boxShadow = 'none'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '3px 3px 0 0 black'; }}>
          🖼 View All Photos
        </button>
      </div>
    </div>
  );
}

function LibraryRow({ ev, c, isFeat, onEdit, onToggleActive, onToggleFeatured, onDelete }) {
  const [hovered,    setHovered]    = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => { setHovered(false); }}
      style={{ display: 'flex', gap: 12, padding: '10px 14px', borderBottom: '2px solid #f3f4f6', alignItems: 'center', backgroundColor: hovered ? '#f9fafb' : 'transparent', transition: 'background 0.1s' }}>
      <div style={{ width: 64, height: 64, flexShrink: 0, border: '2px solid black', overflow: 'hidden', backgroundColor: c.light, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: F.barabara, fontSize: 8, color: c.bg, textTransform: 'uppercase' }}>?</span>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
        <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, color: '#6b7280', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <span style={{ fontFamily: F.barabara, fontSize: 7, textTransform: 'uppercase', letterSpacing: '0.06em', padding: '1px 4px', backgroundColor: c.bg, color: 'white', border: '1px solid black' }}>{ev.tag}</span>
          <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, color: ev.is_active ? BRAND.green : '#9ca3af' }}>{ev.is_active ? '● LIVE' : '○ HIDDEN'}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flexShrink: 0 }}>
        <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
        <button onClick={() => onEdit(ev)} style={{ width: 22, height: 22, backgroundColor: BRAND.indigo, color: BRAND.yellow, border: '2px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: F.barabara, fontSize: 10 }}>✎</button>
        <button onClick={() => onToggleActive(ev)} style={{ width: 22, height: 22, backgroundColor: ev.is_active ? '#dcfce7' : '#f3f4f6', color: ev.is_active ? BRAND.green : '#6b7280', border: `2px solid ${ev.is_active ? BRAND.green : '#e5e7eb'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
          {ev.is_active ? '●' : '○'}
        </button>
        {confirmDel ? (
          <>
            <button onClick={() => { setConfirmDel(false); onDelete(ev); }}
              style={{ width: 22, height: 22, backgroundColor: BRAND.red, color: 'white', border: '2px solid black', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontFamily: F.barabara }}
              title="Confirm delete">✓</button>
            <button onClick={() => setConfirmDel(false)}
              style={{ width: 22, height: 22, backgroundColor: 'white', color: '#6b7280', border: '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}
              title="Cancel">✕</button>
          </>
        ) : (
          <button onClick={() => setConfirmDel(true)}
            style={{ width: 22, height: 22, backgroundColor: 'white', color: '#d1d5db', border: '2px solid #e5e7eb', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, transition: 'all 0.12s' }}
            title="Delete event"
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF0F1'; e.currentTarget.style.color = BRAND.red; e.currentTarget.style.borderColor = BRAND.red; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
            🗑
          </button>
        )}
      </div>
    </div>
  );
}

// Small stateful delete button for grid cards (two-click confirm)
function ModalDeleteButton({ ev, onDelete }) {
  const [confirm, setConfirm] = useState(false);
  if (confirm) {
    return (
      <div style={{ display: 'flex', gap: 2 }}>
        <button onClick={() => { setConfirm(false); onDelete(ev); }}
          style={{ padding: '4px 5px', border: '2px solid black', backgroundColor: BRAND.red, color: 'white', fontFamily: F.barabara, fontSize: 7, textTransform: 'uppercase', cursor: 'pointer', boxShadow: '2px 2px 0 0 black' }}
          title="Confirm delete">OK</button>
        <button onClick={() => setConfirm(false)}
          style={{ padding: '4px 5px', border: '2px solid #e5e7eb', backgroundColor: 'white', color: '#6b7280', fontFamily: F.barabara, fontSize: 7, textTransform: 'uppercase', cursor: 'pointer' }}
          title="Cancel">✕</button>
      </div>
    );
  }
  return (
    <button onClick={() => setConfirm(true)}
      style={{ padding: '4px 6px', border: '2px solid #e5e7eb', backgroundColor: 'white', color: '#d1d5db', fontSize: 10, cursor: 'pointer', transition: 'all 0.12s' }}
      title="Delete event"
      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FFF0F1'; e.currentTarget.style.color = BRAND.red; e.currentTarget.style.borderColor = BRAND.red; }}
      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'white'; e.currentTarget.style.color = '#d1d5db'; e.currentTarget.style.borderColor = '#e5e7eb'; }}>
      🗑
    </button>
  );
}

// ─── VIEW ALL PHOTOS MODAL ────────────────────────────────────────────────────
function ViewAllModal({ events, featuredIds, onClose, onEdit, onToggleActive, onToggleFeatured, onDelete }) {
  const [search,    setSearch]    = useState('');
  const [filterVis, setFilterVis] = useState('ALL');
  const [filterTag, setFilterTag] = useState('ALL');
  const [page,      setPage]      = useState(1);

  const allTags = ['ALL', ...Array.from(new Set(events.map(e => e.tag).filter(Boolean)))];
  const filtered = events.filter(ev => {
    const q = search.toLowerCase();
    const matchSearch = !q || (ev.title||'').toLowerCase().includes(q) || (ev.location||'').toLowerCase().includes(q) || (ev.tag||'').toLowerCase().includes(q) || (ev.date||'').toLowerCase().includes(q);
    const matchVis = filterVis === 'ALL' || (filterVis === 'LIVE' ? ev.is_active : !ev.is_active);
    const matchTag = filterTag === 'ALL' || ev.tag === filterTag;
    return matchSearch && matchVis && matchTag;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / MODAL_PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * MODAL_PAGE_SIZE, safePage * MODAL_PAGE_SIZE);
  const setFilter  = (setter) => (val) => { setter(val); setPage(1); };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} transition={{ type: 'spring', damping: 28, stiffness: 320 }}
        style={{ width: '90vw', maxWidth: 1100, height: '88vh', backgroundColor: 'white', border: '4px solid black', boxShadow: `10px 10px 0 0 ${BRAND.yellow}`, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '4px solid black', flexShrink: 0 }}>
          <div style={{ flex: 1, backgroundColor: 'black', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: F.barabara, color: BRAND.yellow, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em' }}>🖼 View All Photos</span>
            <span style={{ fontFamily: F.cubao, color: 'white', fontSize: 14 }}>{filtered.length} / {events.length}</span>
          </div>
          <button onClick={onClose} style={{ backgroundColor: BRAND.red, color: 'white', border: 'none', borderLeft: '4px solid black', padding: '0 20px', fontSize: 18, cursor: 'pointer' }}>✕</button>
        </div>
        <FiestaStripe />
        <div style={{ padding: '10px 18px', borderBottom: '3px solid black', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0, backgroundColor: 'white' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 160 }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: '#9ca3af' }}>🔍</span>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search events…"
              style={{ width: '100%', boxSizing: 'border-box', border: '3px solid black', padding: '7px 10px 7px 30px', fontFamily: F.body, fontSize: 11, fontWeight: 700, backgroundColor: BRAND.cream, outline: 'none' }} />
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {['ALL', 'LIVE', 'HIDDEN'].map(v => {
              const active = filterVis === v;
              return <button key={v} onClick={() => setFilter(setFilterVis)(v)} style={{ padding: '6px 10px', border: `2px solid ${active ? 'black' : '#e5e7eb'}`, fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', backgroundColor: active ? (v === 'LIVE' ? BRAND.green : v === 'HIDDEN' ? '#e5e7eb' : 'black') : 'white', color: active ? (v === 'HIDDEN' ? '#374151' : 'white') : '#9ca3af', boxShadow: active ? '2px 2px 0 0 black' : 'none' }}>{v}</button>;
            })}
          </div>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {allTags.map(t => {
              const active = filterTag === t;
              return <button key={t} onClick={() => setFilter(setFilterTag)(t)} style={{ padding: '4px 9px', border: `2px solid ${active ? 'black' : '#e5e7eb'}`, fontFamily: F.barabara, fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.06em', cursor: 'pointer', backgroundColor: active ? BRAND.indigo : 'white', color: active ? 'white' : '#6b7280', boxShadow: active ? '2px 2px 0 0 black' : 'none' }}>{t}</button>;
            })}
          </div>
        </div>
        <div style={{ padding: '6px 18px', backgroundColor: '#EFF6FF', borderBottom: '2px solid #BFDBFE', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12 }}>ℹ️</span>
            <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Featured on homepage: ⭐ starred events (max {FEATURED_LIMIT}). All events appear here.</p>
          </div>
          <span style={{ fontFamily: F.body, fontSize: 9, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>Page {safePage}/{totalPages}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, backgroundColor: '#f9fafb' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: F.barabara, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af' }}>No events match your filters</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
              {paginated.map(ev => {
                const c = getColor(ev.color);
                const isFeat = featuredIds.has(ev.id);
                return (
                  <div key={ev.id} style={{ position: 'relative' }}>
                    {isFeat && (
                      <div style={{ position: 'absolute', top: -7, left: -7, zIndex: 10, backgroundColor: BRAND.yellow, border: '2px solid black', padding: '1px 6px', boxShadow: '2px 2px 0 0 black', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 8 }}>⭐</span>
                        <span style={{ fontFamily: F.barabara, fontSize: 7, textTransform: 'uppercase' }}>Featured</span>
                      </div>
                    )}
                    <div style={{ backgroundColor: 'white', border: '2px solid #e5e7eb', overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '1/1', overflow: 'hidden', backgroundColor: c.light, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {ev.image_url ? <img src={ev.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontFamily: F.barabara, fontSize: 10, color: c.bg, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.6 }}>No Photo</span>}
                        <div style={{ position: 'absolute', top: 5, right: 5 }}>
                          <span style={{ fontFamily: F.body, fontSize: 7, fontWeight: 700, color: 'white', backgroundColor: ev.is_active ? BRAND.green : 'rgba(0,0,0,0.4)', padding: '1px 5px' }}>{ev.is_active ? '● LIVE' : '○ HIDDEN'}</span>
                        </div>
                      </div>
                        <div style={{ padding: '7px 9px', borderTop: '2px solid #e5e7eb' }}>
                          <span style={{ fontFamily: F.barabara, display: 'inline-block', fontSize: 7, textTransform: 'uppercase', letterSpacing: 1, color: 'white', padding: '1px 4px', backgroundColor: c.bg, border: '1px solid black', marginBottom: 3 }}>{ev.tag}</span>
                          <p style={{ fontFamily: F.pipanganan, fontSize: 10, textTransform: 'uppercase', lineHeight: 1.1, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                          <p style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, color: '#6b7280', margin: '2px 0 5px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.date} · {ev.location}</p>
                          <div style={{ display: 'flex', gap: 3 }}>
                            <button onClick={() => onEdit(ev)} style={{ flex: 1, padding: '4px 0', border: '2px solid black', fontFamily: F.barabara, fontSize: 8, textTransform: 'uppercase', cursor: 'pointer', backgroundColor: BRAND.indigo, color: BRAND.yellow, boxShadow: '2px 2px 0 0 black' }}>✎ Edit</button>
                            <StarButton isFeatured={isFeat} onClick={() => onToggleFeatured(ev)} size="sm" />
                            <button onClick={() => onToggleActive(ev)} style={{ padding: '4px 6px', border: '2px solid black', fontFamily: F.barabara, fontSize: 8, cursor: 'pointer', backgroundColor: ev.is_active ? '#dcfce7' : '#f3f4f6', color: ev.is_active ? BRAND.green : '#6b7280', boxShadow: '2px 2px 0 0 black' }}>
                              {ev.is_active ? '●' : '○'}
                            </button>
                            <ModalDeleteButton ev={ev} onDelete={onDelete} />
                          </div>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <div style={{ borderTop: '3px solid black', backgroundColor: 'white', flexShrink: 0 }}>
          <Pagination page={safePage} totalPages={totalPages} onPage={setPage} />
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EventsManager() {
  const [events,      setEvents]      = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [editing,     setEditing]     = useState(null);
  const [isSaving,    setIsSaving]    = useState(false);
  const [toast,       setToast]       = useState(null);
  const [viewAllOpen, setViewAllOpen] = useState(false);

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

  // ── DELETE: removes DB row AND stored image ──────────────────────────────
  const handleDelete = async (event) => {
    try {
      // Delete image from storage first (if it's a Supabase storage URL)
      if (event.image_url) {
        try { await deleteEventPhoto(event.image_url); } catch (_) { /* ok if already gone */ }
      }
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
      showToast(`Max ${FEATURED_LIMIT} featured photos. Remove a ⭐ first.`, 'error');
      return;
    }
    const next = !isFeatured;
    setEvents(es => es.map(e => e.id === event.id ? { ...e, is_featured: next } : e));
    try {
      await updateEvent(event.id, { is_featured: next });
      showToast(next ? '⭐ Added to Featured!' : 'Removed from Featured.');
    } catch (err) {
      setEvents(es => es.map(e => e.id === event.id ? { ...e, is_featured: isFeatured } : e));
      showToast(err.message || 'Failed to update.', 'error');
    }
  };

  const handleReorder = async (newOrder) => {
    const reindexed = newOrder.map((e, i) => ({ ...e, display_order: i + 1 }));
    setEvents(reindexed);
    try   { await reorderEvents(reindexed.map(({ id, display_order }) => ({ id, display_order }))); }
    catch { showToast('Failed to save new order.', 'error'); load(); }
  };

  const featuredIds   = new Set(events.filter(e => e.is_featured).map(e => e.id));
  const liveCount     = events.filter(e => e.is_active).length;
  const hiddenCount   = events.length - liveCount;
  const featuredCount = events.filter(e => e.is_featured).length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', backgroundColor: BRAND.cream }}>
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

      {/* Header bar */}
      <div style={{ margin: '14px 16px 0', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: BRAND.yellow, border: '4px solid black', transform: 'translate(5px,5px)' }} />
          <div style={{ position: 'relative', display: 'flex', alignItems: 'stretch', border: '4px solid black', overflow: 'hidden', backgroundColor: BRAND.indigo }}>
            <div style={{ backgroundColor: 'black', borderRight: `4px solid ${BRAND.yellow}`, padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 20, lineHeight: 1 }}>📸</span>
              <span style={{ fontFamily: F.barabara, color: BRAND.yellow, fontSize: 18, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>Event Photos</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0 16px', flexWrap: 'wrap' }}>
              {[
                { dot: BRAND.green, val: liveCount, label: 'Live', col: 'white', dimCol: 'rgba(255,255,255,0.5)' },
                { dot: '#6b7280',   val: hiddenCount, label: 'Hidden', col: 'rgba(255,255,255,0.5)', dimCol: 'rgba(255,255,255,0.35)' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <div style={{ width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.15)', marginRight: 7 }} />}
                  <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.dot, border: '2px solid rgba(255,255,255,0.3)', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontFamily: F.cubao, fontSize: 20, color: s.col, lineHeight: 1 }}>{s.val}</span>
                  <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: s.dimCol }}>{s.label}</span>
                </div>
              ))}
              <div style={{ width: 1, height: 22, backgroundColor: 'rgba(255,255,255,0.15)' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{ fontSize: 14, lineHeight: 1 }}>⭐</span>
                <span style={{ fontFamily: F.cubao, fontSize: 20, color: BRAND.yellow, lineHeight: 1 }}>{featuredCount}</span>
                <span style={{ fontFamily: F.body, fontSize: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'rgba(255,255,255,0.5)' }}>/{FEATURED_LIMIT} Featured</span>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <button onClick={load}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 14px', backgroundColor: 'white', border: 'none', borderLeft: '4px solid black', fontFamily: F.barabara, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', color: '#374151', transition: 'all 0.12s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = BRAND.cream}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'white'}>
              ↺ Refresh
            </button>
            <button onClick={() => setEditing({ ...EMPTY_EVENT, display_order: events.length + 1 })}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '0 18px', backgroundColor: BRAND.red, color: 'white', border: 'none', borderLeft: '4px solid black', fontFamily: F.barabara, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.12s', flexShrink: 0 }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#c41a26'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = BRAND.red}>
              ✚ Add Event
            </button>
          </div>
        </div>
        <div style={{ marginTop: 10 }}><FiestaStripe /></div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', marginTop: 4 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 28px' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', gap: 16 }}>
              <Spinner size={32} color={BRAND.indigo} />
              <span style={{ fontFamily: F.barabara, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', color: BRAND.indigo }}>Loading…</span>
            </div>
          ) : events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <p style={{ fontFamily: F.barabara, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#9ca3af' }}>No events yet</p>
              <button onClick={() => setEditing({ ...EMPTY_EVENT })}
                style={{ marginTop: 12, backgroundColor: BRAND.indigo, color: BRAND.yellow, border: '4px solid black', padding: '10px 24px', fontFamily: F.barabara, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.15em', cursor: 'pointer', boxShadow: '4px 4px 0 0 black' }}>
                ✚ Add your first event
              </button>
            </div>
          ) : (
            <>
              <SitePreview events={events} />

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 14px', border: '3px dashed #d1d5db', backgroundColor: 'rgba(255,255,255,0.6)', marginBottom: 14, marginTop: 20 }}>
                <span style={{ color: '#9ca3af', fontSize: 13 }}>↕</span>
                <p style={{ fontFamily: F.body, fontSize: 9, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#6b7280', margin: 0 }}>
                  {events.filter(e => e.is_featured).length} featured · Drag to reorder ·{' '}
                  <span style={{ fontFamily: F.barabara, color: BRAND.indigo }}>✎ Edit</span> to open editor ·{' '}
                  <span style={{ fontFamily: F.barabara, color: '#EAB308' }}>☆</span> to feature (max {FEATURED_LIMIT}) ·{' '}
                  <span style={{ fontFamily: F.barabara, color: BRAND.red }}>🗑 Del</span> to permanently delete
                </p>
              </div>

              {(() => {
                const featuredEvents    = events.filter(e => e.is_featured);
                const nonFeaturedCount  = events.length - featuredEvents.length;
                return (
                  <>
                    {featuredEvents.length === 0 ? (
                      <div style={{ padding: '24px 0', textAlign: 'center', border: '3px dashed #d1d5db', backgroundColor: 'rgba(255,255,255,0.6)' }}>
                        <p style={{ fontFamily: F.barabara, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9ca3af', margin: 0 }}>
                          No featured events yet — click ☆ on any event in the Photo Library to feature it here
                        </p>
                      </div>
                    ) : (
                      <Reorder.Group axis="y" values={featuredEvents} onReorder={handleReorder}
                        style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none', padding: 0, margin: 0 }}>
                        {featuredEvents.map((ev, i) => (
                          <EventRow key={ev.id} event={ev} idx={i + 1} isFeatured={true}
                            onEdit={e => setEditing({ ...e })}
                            onDelete={handleDelete}
                            onToggleActive={handleToggleActive}
                            onToggleFeatured={handleToggleFeatured}
                          />
                        ))}
                      </Reorder.Group>
                    )}
                    {nonFeaturedCount > 0 && (
                      <div style={{ marginTop: 10, padding: '7px 14px', border: '2px dashed #d1d5db', backgroundColor: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontFamily: F.barabara, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9ca3af' }}>
                          📁 {nonFeaturedCount} more event{nonFeaturedCount > 1 ? 's' : ''} in the Photo Library — star them to feature here
                        </span>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>

        <PhotoLibrary events={events} featuredIds={featuredIds}
          onEdit={e => setEditing({ ...e })}
          onToggleActive={handleToggleActive}
          onToggleFeatured={handleToggleFeatured}
          onDelete={handleDelete}
          onOpenViewAll={() => setViewAllOpen(true)}
        />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes toastIn { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @media (max-width: 768px) {
          .events-body { flex-direction: column !important; }
          .photo-library { width: 100% !important; border-left: none !important; border-top: 4px solid black !important; max-height: 400px; }
        }
      `}</style>
    </div>
  );
}