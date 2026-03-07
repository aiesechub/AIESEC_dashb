// src/components/EventsFeature.jsx
// Fetches active event data from Supabase and renders the Featured Photos section.
//
// Data shape from Supabase (via AdminApp):
//   color    → string key: "yellow" | "rose" | "teal" | "orange" | "blue" | "indigo" | "green" | "red"
//   rotation → number: -2 | -1 | 0 | 1 | 2
//   is_active → boolean (getEvents() already filters to active only)

import { useState, useEffect } from 'react';
import { getEvents } from '../lib/supabase';

// ─── Color map: key → { bg (hex), light (hex) } ──────────────────────────────
// Mirrors COLOR_MAP in AdminApp so the preview and live site are identical.
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

// ─── Rotation map: number → CSS transform string ─────────────────────────────
const ROTATION_MAP = {
  '-2': 'rotate(-2deg)',
  '-1': 'rotate(-1deg)',
   '0': 'rotate(0deg)',
   '1': 'rotate(1deg)',
   '2': 'rotate(2deg)',
};

// Skeleton card — matches card dimensions to prevent layout shift
const EventCardSkeleton = () => (
  <div className="group relative flex flex-col animate-pulse">
    <div className="relative bg-white border-2 border-gray-100 p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.08)]">
      <div className="aspect-square bg-gray-200" />
      <div className="pt-3 pb-1 space-y-2">
        <div className="h-3 w-12 bg-gray-200 rounded" />
        <div className="h-5 w-24 bg-gray-200 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

export default function EventsFeature() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    getEvents()
      .then(setEvents)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="relative w-full py-10 bg-[#fcfbf7] text-slate-900 border-y-4 border-black">
      {/* Background Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '15px 15px' }}
      />

      <div className="container mx-auto px-4 relative z-10 max-w-6xl">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 border-b-2 border-black pb-6 border-dashed">
          <div className="text-left">
            <h2
              className="text-5xl font-black tracking-tighter uppercase leading-none text-rose-600 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]"
              style={{ fontFamily: '"Barabara", "Impact", sans-serif' }}
            >
              Featured Photos
            </h2>
            <p className="text-sm font-bold text-slate-600 uppercase tracking-widest mt-1">
              Throwback Collection
            </p>
          </div>

          <button className="group relative">
            <span className="absolute inset-0 bg-black translate-x-1 translate-y-1" />
            <span className="relative block px-4 py-2 bg-yellow-400 border-2 border-black text-sm font-black uppercase hover:-translate-y-0.5 hover:-translate-x-0.5 transition-transform">
              View All Photos
            </span>
          </button>
        </div>

        {/* Error state */}
        {error && (
          <p className="text-center py-10 text-red-500 font-bold text-sm">
            Couldn't load photos: {error}
          </p>
        )}

        {/* Cards grid — overflow visible so rotated card corners are never clipped */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6" style={{ overflow: 'visible' }}>
          {loading
            ? [1, 2, 3, 4].map(n => <EventCardSkeleton key={n} />)
            : events.map(event => {
                const c = COLOR_MAP[event.color] || COLOR_MAP.yellow;
                const rotationCss = ROTATION_MAP[String(event.rotation)] ?? 'rotate(-1deg)';

                return (
                  // The padding on this wrapper is what gives the rotated card's
                  // corners room — they stay within the grid cell and never overlap
                  // adjacent cards' text
                  <div
                    key={event.id}
                    className="group flex items-start justify-center"
                    style={{ padding: '16px 12px' }}
                  >
                    {/* The entire card rotates — content, image, text, everything */}
                    <div
                      className="relative bg-white border-[3px] border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full transition-[box-shadow,transform] duration-200 hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                      style={{ transform: rotationCss }}
                    >
                      {/* Date Badge */}
                      <div className="absolute -top-4 -right-4 z-20 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                        <span className="text-center font-bold leading-none text-[10px]">
                          {(event.date || '').split(' ')[0]}
                        </span>
                      </div>

                      {/* Image */}
                      <div
                        className="relative aspect-square overflow-hidden border-2 border-black"
                        style={{ backgroundColor: c.light }}
                      >
                        {event.image_url ? (
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover grayscale transition-all duration-500 group-hover:scale-110 group-hover:grayscale-0"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-xs font-bold uppercase tracking-widest opacity-60"
                            style={{ color: c.bg }}
                          >
                            No Photo
                          </div>
                        )}
                        <div
                          className="absolute inset-0 mix-blend-multiply opacity-20 group-hover:opacity-0 transition-opacity"
                          style={{ backgroundColor: c.bg }}
                        />
                      </div>

                      {/* Card text */}
                      <div className="pt-3 pb-2 px-1">
                        <span
                          className="inline-block text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 border border-black mb-1"
                          style={{ backgroundColor: c.bg }}
                        >
                          {event.tag}
                        </span>
                        <h3
                          className="text-lg font-black leading-tight uppercase truncate mt-1"
                          style={{ fontFamily: '"Barabara", "Impact", sans-serif' }}
                        >
                          {event.title}
                        </h3>
                        <p className="mt-1 text-xs font-bold text-gray-500 truncate">
                          {event.location}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>

        {/* Empty state */}
        {!loading && !error && events.length === 0 && (
          <p className="text-center py-16 font-bold text-sm uppercase tracking-widest text-gray-400">
            No featured photos yet — check back soon!
          </p>
        )}

      </div>
    </section>
  );
}