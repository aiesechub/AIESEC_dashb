// src/components/EventsFeature.jsx
// Infinite auto-scrolling carousel of featured (starred) polaroid cards.
// Cards tilt gently as they drift right; hover pauses & un-tilts the hovered card.

import { useState, useEffect, useRef } from 'react';
import { getEvents } from '../lib/supabase';

// ─── Design tokens ────────────────────────────────────────────────────────────
const COLOR_MAP = {
  yellow: { bg: '#EAB308', light: '#FEF9C3' },
  rose:   { bg: '#F43F5E', light: '#FFF1F2' },
  teal:   { bg: '#0D9488', light: '#F0FDFA' },
  orange: { bg: '#F97316', light: '#FFF7ED' },
  blue:   { bg: '#3B82F6', light: '#EFF6FF' },
  indigo: { bg: '#4F46E5', light: '#EEF2FF' },
  green:  { bg: '#22C55E', light: '#F0FDF4' },
  red:    { bg: '#DC2626', light: '#FEF2F2' },
};

// Each card gets a slightly different rotation so the strip feels organic.
const TILT_SEQUENCE = [-2, 1, -1, 2, -2, 0, 1, -1, 2, -2];

// ─── Skeleton card ────────────────────────────────────────────────────────────
function EventCardSkeleton() {
  return (
    <div style={{ flexShrink: 0, width: 200, padding: '20px 14px' }}>
      <div style={{
        background: 'white', border: '3px solid #e5e7eb', padding: 8,
        boxShadow: '4px 4px 0 rgba(0,0,0,0.08)',
      }}>
        <div style={{ aspectRatio: '1/1', background: '#f3f4f6' }} />
        <div style={{ padding: '10px 4px 6px', display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div style={{ height: 10, width: 48, background: '#e5e7eb', borderRadius: 3 }} />
          <div style={{ height: 16, width: 80, background: '#f3f4f6', borderRadius: 3 }} />
          <div style={{ height: 10, width: 64, background: '#f9fafb', borderRadius: 3 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Single polaroid card ─────────────────────────────────────────────────────
function PolaroidCard({ event, tiltDeg, isHovered, onMouseEnter, onMouseLeave }) {
  const c = COLOR_MAP[event.color] || COLOR_MAP.yellow;
  const transform = isHovered
    ? 'rotate(0deg) translateY(-14px) scale(1.05)'
    : `rotate(${tiltDeg}deg)`;

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ flexShrink: 0, width: 200, padding: '20px 14px', cursor: 'default' }}
    >
      <div style={{
        position: 'relative',
        background: 'white',
        border: '3px solid black',
        padding: 8,
        boxShadow: isHovered
          ? '8px 8px 0 rgba(0,0,0,1)'
          : '4px 4px 0 rgba(0,0,0,0.85)',
        transform,
        transition: 'transform 0.45s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
        willChange: 'transform',
      }}>
        {/* Date badge */}
        <div style={{
          position: 'absolute', top: -14, right: -14, zIndex: 20,
          width: 40, height: 40,
          background: 'white', border: '2px solid black', borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '1px 1px 0 black',
        }}>
          <span style={{
            fontFamily: 'system-ui, sans-serif', fontWeight: 900,
            fontSize: 9, lineHeight: 1.1, textAlign: 'center',
          }}>
            {(event.date || '').split(' ')[0]}
          </span>
        </div>

        {/* Image */}
        <div style={{
          position: 'relative', aspectRatio: '1/1',
          overflow: 'hidden', border: '2px solid black',
          background: c.light,
        }}>
          {event.image_url ? (
            <img
              src={event.image_url}
              alt={event.title}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                filter: isHovered ? 'grayscale(0%)' : 'grayscale(100%)',
                transform: isHovered ? 'scale(1.08)' : 'scale(1)',
                transition: 'filter 0.5s ease, transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: '"Impact", sans-serif', fontSize: 10,
              textTransform: 'uppercase', letterSpacing: 2,
              color: c.bg, opacity: 0.6,
            }}>No Photo</div>
          )}
          {/* Color overlay fades out on hover */}
          <div style={{
            position: 'absolute', inset: 0,
            background: c.bg, mixBlendMode: 'multiply',
            opacity: isHovered ? 0 : 0.18,
            transition: 'opacity 0.4s ease',
          }} />
        </div>

        {/* Text */}
        <div style={{ padding: '10px 4px 4px' }}>
          <span style={{
            display: 'inline-block',
            fontFamily: 'system-ui, sans-serif', fontWeight: 800,
            fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'white', padding: '2px 6px',
            background: c.bg, border: '1px solid black', marginBottom: 4,
          }}>{event.tag}</span>
          <p style={{
            fontFamily: '"Barabara", "Impact", "Arial Black", sans-serif',
            fontSize: 14, textTransform: 'uppercase', lineHeight: 1.15,
            margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{event.title}</p>
          <p style={{
            fontFamily: 'system-ui, sans-serif', fontWeight: 700,
            fontSize: 10, color: '#6b7280', margin: '3px 0 0',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{event.location}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function EventsFeature() {
  const [events,     setEvents]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const trackRef  = useRef(null);
  const rafRef    = useRef(null);
  const offsetRef = useRef(0);
  const pausedRef = useRef(false);

  const SPEED = 0.5; // px per frame — slow drift

  useEffect(() => {
    getEvents()
      .then(data => setEvents(data.filter(e => e.is_featured === true && e.is_active === true)))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Infinite rAF scroll loop ───────────────────────────────────────────────
  useEffect(() => {
    if (!events.length) return;
    const track = trackRef.current;
    if (!track) return;

    let halfWidth = 0;

    const measure = () => {
      halfWidth = track.scrollWidth / 4;
    };

    measure();

    const animate = () => {
      if (!pausedRef.current) {
        offsetRef.current += SPEED;
        if (halfWidth > 0 && offsetRef.current >= halfWidth) {
          offsetRef.current -= halfWidth;
        }
        track.style.transform = `translateX(-${offsetRef.current}px)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', measure);
    };
  }, [events]);

  const displayEvents = events.length
    ? [...events, ...events, ...events, ...events]
    : [];

  return (
    <section style={{
      position: 'relative',
      width: '100%',
      paddingBottom: 56,
      background: '#FFFBEB',
      borderTop: '4px solid black',
      borderBottom: '4px solid black',
      overflow: 'hidden',
    }}>

      {/* ── Dot texture ── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.10) 1.5px, transparent 1.5px)',
        backgroundSize: '20px 20px',
      }} />

      {/* ── Header ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
      }}>

        {/* Top accent bar — full-width colour stripe */}
        <div style={{
          height: 8,
          background: 'linear-gradient(to right, #EF3340, #FFD100, #00A651, #009BD6, #F58220)',
          border: '2px solid black',
          borderTop: 'none',
          marginBottom: 0,
        }} />

        <div style={{
          display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', justifyContent: 'space-between',
          gap: 16,
          padding: '28px 0 24px',
          borderBottom: '4px solid black',
          marginBottom: 8,
        }}>

          {/* Left — heading stack */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {/* Pre-label pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center' }}>
              <span style={{
                fontFamily: '"Barabara", "Impact", "Arial Black", sans-serif',
                fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.25em',
                color: 'black', background: '#FFD100',
                padding: '3px 14px',
                border: '2px solid black',
                borderRadius: 999,
                boxShadow: '3px 3px 0 black',
              }}>
                📸 Throwback Collection
              </span>
            </div>

            {/* Main heading — brutalist slab */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {/* Red shadow layer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: '#EF3340',
                transform: 'translate(6px, 7px) skewX(-2deg)',
                border: '3px solid black',
                borderRadius: 4,
              }} />
              {/* Yellow mid layer */}
              <div style={{
                position: 'absolute', inset: 0,
                background: '#FFD100',
                transform: 'translate(3px, 4px) skewX(-1deg)',
                border: '3px solid black',
                borderRadius: 4,
              }} />
              {/* Front face */}
              <div style={{
                position: 'relative',
                background: '#20a2ec',
                border: '3px solid black',
                borderRadius: 4,
                padding: '10px 24px 10px 20px',
                transform: 'skewX(-1.5deg)',
              }}>
                {/* Diagonal hatch accent on right edge */}
                <div style={{
                  position: 'absolute', top: 0, right: 0, bottom: 0, width: 10,
                  backgroundImage: 'repeating-linear-gradient(45deg, #FFD100 0px, #FFD100 3px, transparent 3px, transparent 9px)',
                  borderLeft: '2px solid black',
                }} />
                <h2 style={{
                  fontFamily: '"Barabara", "Impact", "Arial Black", sans-serif',
                  fontSize: 'clamp(2rem, 5vw, 3.2rem)',
                  fontWeight: 900, textTransform: 'uppercase',
                  lineHeight: 1, margin: 0,
                  color: 'white',
                  transform: 'skewX(1.5deg)',
                  display: 'inline-block',
                  textShadow: '3px 3px 0 rgba(0,0,0,0.2)',
                }}>
                  Featured{' '}
                  <span style={{ color: '#FFD100' }}>Photos</span>
                </h2>
              </div>
            </div>
          </div>

          {/* Right — View All button */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {/* Shadow layers */}
            <div style={{
              position: 'absolute', inset: 0,
              background: '#EF3340',
              transform: 'translate(6px, 6px)',
              border: '3px solid black',
              borderRadius: 6,
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: '#FFD100',
              transform: 'translate(3px, 3px)',
              border: '3px solid black',
              borderRadius: 6,
            }} />
            <button
              style={{
                position: 'relative',
                padding: '12px 24px',
                background: '#009BD6',
                border: '3px solid black',
                borderRadius: 6,
                fontFamily: '"Barabara", "Impact", "Arial Black", sans-serif',
                fontSize: 14, textTransform: 'uppercase',
                letterSpacing: '0.12em', cursor: 'pointer',
                color: 'white',
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translate(-2px,-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translate(0,0)'}
            >
              View All Photos ✦
            </button>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <p style={{
          textAlign: 'center', color: '#EF3340',
          fontWeight: 700, fontSize: 13, padding: '0 0 24px',
        }}>
          Couldn't load photos: {error}
        </p>
      )}

      {/* ── Carousel strip ── UNTOUCHED ── */}
      {/* Edge fade masks */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 100, zIndex: 20,
        background: 'linear-gradient(to right, #FFFBEB 30%, transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 100, zIndex: 20,
        background: 'linear-gradient(to left, #FFFBEB 30%, transparent)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            {[1,2,3,4].map(n => <EventCardSkeleton key={n} />)}
          </div>
        ) : events.length === 0 && !error ? (
          <p style={{
            textAlign: 'center', padding: '64px 0',
            fontFamily: 'system-ui, sans-serif', fontWeight: 700,
            fontSize: 13, textTransform: 'uppercase',
            letterSpacing: '0.2em', color: '#9ca3af',
          }}>
            No featured photos yet — check back soon!
          </p>
        ) : (
          <div
            ref={trackRef}
            style={{
              display: 'flex',
              alignItems: 'center',
              willChange: 'transform',
              padding: '8px 0 20px',
            }}
          >
            {displayEvents.map((event, i) => {
              const originalIdx = i % events.length;
              const tiltDeg = TILT_SEQUENCE[originalIdx % TILT_SEQUENCE.length];
              return (
                <PolaroidCard
                  key={`${event.id}-${i}`}
                  event={event}
                  tiltDeg={tiltDeg}
                  isHovered={hoveredIdx === i}
                  onMouseEnter={() => { pausedRef.current = true; setHoveredIdx(i); }}
                  onMouseLeave={() => { pausedRef.current = false; setHoveredIdx(null); }}
                />
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}