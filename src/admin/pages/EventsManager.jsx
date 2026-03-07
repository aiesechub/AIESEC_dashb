// src/admin/pages/EventsManager.jsx
// Full CRUD admin for Featured Photos / Events.
// Features: drag-to-reorder, Supabase Storage photo upload with progress,
// live card preview, color & rotation picker, hide/show toggle.

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus, Trash2, GripVertical, Eye, EyeOff,
  Save, X, Loader2, CheckCircle, AlertCircle,
  Upload, Image, ToggleLeft, ToggleRight, RefreshCw,
} from 'lucide-react';
import {
  getAllEvents, createEvent, updateEvent,
  deleteEvent, reorderEvents,
  uploadEventPhoto, deleteEventPhoto,
} from '../../lib/supabase';

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────
const EMPTY_EVENT = {
  title: '',
  date: '',
  location: '',
  image_url: '',
  tag: '',
  color: 'bg-yellow-500',
  rotation: '-rotate-1',
  display_order: 0,
  is_active: true,
};

const COLOR_OPTIONS = [
  { label: 'Yellow',  value: 'bg-yellow-500',  hex: '#EAB308' },
  { label: 'Rose',    value: 'bg-rose-500',    hex: '#F43F5E' },
  { label: 'Teal',    value: 'bg-teal-600',    hex: '#0D9488' },
  { label: 'Orange',  value: 'bg-orange-500',  hex: '#F97316' },
  { label: 'Blue',    value: 'bg-blue-500',    hex: '#3B82F6' },
  { label: 'Indigo',  value: 'bg-indigo-600',  hex: '#4F46E5' },
  { label: 'Green',   value: 'bg-green-500',   hex: '#22C55E' },
  { label: 'Red',     value: 'bg-red-600',     hex: '#DC2626' },
];

const ROTATION_OPTIONS = [
  { label: '–2°', value: '-rotate-2' },
  { label: '–1°', value: '-rotate-1' },
  { label: '0°',  value: 'rotate-0'  },
  { label: '+1°', value: 'rotate-1'  },
  { label: '+2°', value: 'rotate-2'  },
];

// Tailwind class → CSS degrees map for the live preview
// (Tailwind classes don't work dynamically in inline style, so we map them)
const ROTATION_DEG = {
  '-rotate-2': '-2deg',
  '-rotate-1': '-1deg',
  'rotate-0':  '0deg',
  'rotate-1':  '1deg',
  'rotate-2':  '2deg',
};

// Tailwind bg class → CSS hex (for divs that can't use Tailwind dynamically in preview)
const COLOR_HEX = Object.fromEntries(COLOR_OPTIONS.map(c => [c.value, c.hex]));

// ─────────────────────────────────────────────────────────────
// LIVE PREVIEW CARD
// ─────────────────────────────────────────────────────────────
const PreviewCard = ({ event }) => {
  const { title, date, location, image_url, tag, color, rotation } = event;
  const hex = COLOR_HEX[color] || '#EAB308';
  const deg = ROTATION_DEG[rotation] || '0deg';

  return (
    <div
      className="relative bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all w-full max-w-[200px]"
      style={{ transform: `rotate(${deg})` }}
    >
      {/* Date badge */}
      <div className="absolute -top-3 -right-3 z-20 w-10 h-10 bg-white border-2 border-black rounded-full flex items-center justify-center shadow-sm">
        <span className="text-center font-bold leading-none text-[10px]">
          {date ? date.split(' ')[0] : '—'}
        </span>
      </div>

      {/* Image */}
      <div
        className="relative aspect-square overflow-hidden border-2 border-black flex items-center justify-center"
        style={{ backgroundColor: '#e5e7eb' }}
      >
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Image size={28} />
            <span className="text-[9px] font-bold uppercase tracking-widest">No Photo</span>
          </div>
        )}
        <div
          className="absolute inset-0 mix-blend-multiply opacity-20"
          style={{ backgroundColor: hex }}
        />
      </div>

      {/* Info */}
      <div className="pt-2 pb-1">
        <span
          className="inline-block text-[10px] font-bold uppercase tracking-wider text-white px-1.5 py-0.5 border border-black mb-1"
          style={{ backgroundColor: hex }}
        >
          {tag || 'Tag'}
        </span>
        <p className="text-base font-black leading-none uppercase truncate">
          {title || 'Title'}
        </p>
        <p className="text-[11px] font-bold text-gray-500 mt-1 truncate">
          {location || 'Location'}
        </p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// PHOTO UPLOADER
// ─────────────────────────────────────────────────────────────
const PhotoUploader = ({ currentUrl, onUploaded }) => {
  const inputRef                  = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [error, setError]         = useState('');

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024)   { setError('Image must be under 5 MB.');    return; }

    setError('');
    setUploading(true);
    setProgress(10);

    try {
      // Fake progress ticks while upload runs
      const ticker = setInterval(() => setProgress(p => Math.min(p + 15, 85)), 300);
      const url    = await uploadEventPhoto(file);
      clearInterval(ticker);
      setProgress(100);
      setTimeout(() => { setProgress(0); setUploading(false); }, 600);
      onUploaded(url);
    } catch (err) {
      setError(err.message);
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-3">
      {/* Current photo preview */}
      {currentUrl && (
        <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-gray-200 bg-gray-50">
          <img src={currentUrl} alt="Current" className="w-full h-full object-cover" />
          <button
            onClick={() => onUploaded('')}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black text-white rounded-full p-1 transition-colors"
            title="Remove photo"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#312783] hover:bg-indigo-50/40 transition-colors"
      >
        {uploading ? (
          <>
            <Loader2 size={24} className="animate-spin text-[#312783]" />
            <p className="text-xs font-bold text-gray-600">Uploading…</p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
              <div
                className="bg-[#312783] h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload size={24} className="text-gray-400" />
            <p className="text-xs font-bold text-gray-600">
              {currentUrl ? 'Replace photo' : 'Upload photo'}
            </p>
            <p className="text-[10px] text-gray-400">PNG, JPG, WEBP · max 5 MB · click or drag</p>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => handleFile(e.target.files[0])}
      />

      {error && (
        <p className="text-red-500 text-xs flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// FIELD HELPERS
// ─────────────────────────────────────────────────────────────
const Field = ({ label, error, children }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-bold uppercase tracking-widest text-gray-500">{label}</label>
    {children}
    {error && (
      <p className="text-red-500 text-xs flex items-center gap-1">
        <AlertCircle size={12} /> {error}
      </p>
    )}
  </div>
);

const Input = ({ value, onChange, placeholder, className = '' }) => (
  <input
    value={value}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    className={`w-full bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#312783] transition-colors ${className}`}
  />
);

// ─────────────────────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────────────────────
const Toast = ({ message, type, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
    className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border-2 shadow-xl font-medium text-sm
      ${type === 'success' ? 'bg-green-50 border-green-400 text-green-800' : 'bg-red-50 border-red-400 text-red-800'}`}
  >
    {type === 'success' ? <CheckCircle size={18} className="text-green-500" /> : <AlertCircle size={18} className="text-red-500" />}
    {message}
    <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100"><X size={14} /></button>
  </motion.div>
);

// ─────────────────────────────────────────────────────────────
// VALIDATION
// ─────────────────────────────────────────────────────────────
function validate(form) {
  const e = {};
  if (!form.title.trim())    e.title    = 'Title is required';
  if (!form.date.trim())     e.date     = 'Date is required (e.g. MAR 15)';
  if (!form.location.trim()) e.location = 'Location is required';
  if (!form.tag.trim())      e.tag      = 'Tag is required';
  return e;
}

// ─────────────────────────────────────────────────────────────
// EVENT EDITOR DRAWER
// ─────────────────────────────────────────────────────────────
const EventEditor = ({ event, onSave, onCancel, isSaving }) => {
  const [form, setForm]     = useState(event);
  const [errors, setErrors] = useState({});
  const [tab, setTab]       = useState('details');

  const set = key => val => setForm(f => ({ ...f, [key]: val }));

  const handleSave = () => {
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSave(form);
  };

  return (
    <div className="flex h-full">

      {/* ── LEFT: FORM ── */}
      <div className="w-[400px] shrink-0 flex flex-col border-r-2 border-gray-100 h-full">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a144f] border-b-2 border-[#312783]">
          <div>
            <h3 className="font-black text-white text-lg uppercase tracking-wide">
              {event.id ? 'Edit Event' : 'New Event'}
            </h3>
            <p className="text-indigo-300 text-xs mt-0.5">Live preview updates as you type →</p>
          </div>
          <button onClick={onCancel} className="text-white/60 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-gray-100 bg-white">
          {['details', 'photo', 'style'].map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-b-2 -mb-0.5
                ${tab === t ? 'border-[#312783] text-[#312783]' : 'border-transparent text-gray-400 hover:text-gray-700'}`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white">

          {tab === 'details' && (
            <>
              <Field label="Title" error={errors.title}>
                <Input value={form.title} onChange={set('title')} placeholder="e.g. Concert" />
              </Field>
              <Field label="Date" error={errors.date}>
                <Input value={form.date} onChange={set('date')} placeholder="e.g. MAR 15" />
              </Field>
              <Field label="Location" error={errors.location}>
                <Input value={form.location} onChange={set('location')} placeholder="e.g. Cubao Expo" />
              </Field>
              <Field label="Tag" error={errors.tag}>
                <Input value={form.tag} onChange={set('tag')} placeholder="e.g. Live Band" />
              </Field>
              <Field label="Display Order">
                <input
                  type="number"
                  value={form.display_order}
                  onChange={e => set('display_order')(Number(e.target.value))}
                  className="w-24 bg-white border-2 border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#312783]"
                />
              </Field>
              <div className="flex items-center justify-between py-2 border-t border-dashed border-gray-200">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">Visible on Site</p>
                  <p className="text-xs text-gray-400">Hidden events won't appear publicly</p>
                </div>
                <button onClick={() => set('is_active')(!form.is_active)}>
                  {form.is_active
                    ? <ToggleRight size={32} className="text-green-500" />
                    : <ToggleLeft  size={32} className="text-gray-300" />}
                </button>
              </div>
            </>
          )}

          {tab === 'photo' && (
            <PhotoUploader
              currentUrl={form.image_url}
              onUploaded={url => set('image_url')(url)}
            />
          )}

          {tab === 'style' && (
            <>
              {/* Color picker */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Card Accent Color</p>
                <div className="grid grid-cols-4 gap-2">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c.value}
                      onClick={() => set('color')(c.value)}
                      title={c.label}
                      className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all
                        ${form.color === c.value ? 'border-[#312783] bg-indigo-50' : 'border-gray-100 hover:border-gray-300'}`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c.hex }} />
                      <span className="text-[10px] font-bold text-gray-600">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rotation picker */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-3">Card Rotation</p>
                <div className="flex gap-2 flex-wrap">
                  {ROTATION_OPTIONS.map(r => (
                    <button
                      key={r.value}
                      onClick={() => set('rotation')(r.value)}
                      className={`px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition-all
                        ${form.rotation === r.value
                          ? 'border-[#312783] bg-indigo-50 text-[#312783]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-400'}`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t-2 border-gray-100 flex gap-3 bg-gray-50">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 bg-[#312783] border-2 border-[#312783] rounded-lg text-sm font-bold text-white hover:bg-[#231d5e] transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? 'Saving…' : 'Save Event'}
          </button>
        </div>
      </div>

      {/* ── RIGHT: LIVE PREVIEW ── */}
      <div className="flex-1 flex flex-col bg-[#fcfbf7]">
        <div className="px-6 py-4 bg-white border-b-2 border-gray-100 flex items-center gap-2">
          <Eye size={16} className="text-gray-400" />
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
            Live Preview
          </span>
        </div>

        {/* Section background matching the real site */}
        <div
          className="flex-1 flex items-center justify-center p-10"
          style={{ backgroundImage: 'radial-gradient(#444 1px, transparent 1px)', backgroundSize: '15px 15px', backgroundColor: '#fcfbf7' }}
        >
          <PreviewCard event={form} />
        </div>
      </div>

    </div>
  );
};

// ─────────────────────────────────────────────────────────────
// EVENT ROW (list)
// ─────────────────────────────────────────────────────────────
const EventRow = ({ event, onEdit, onDelete, onToggleActive }) => {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const hex = COLOR_HEX[event.color] || '#EAB308';

  return (
    <Reorder.Item
      value={event}
      className="bg-white border-2 border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 transition-colors"
    >
      <div className="flex items-center gap-4 p-4">
        <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
          <GripVertical size={20} />
        </div>

        {/* Thumbnail */}
        <div
          className="h-12 w-12 rounded-xl border-2 border-black/10 shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center"
          style={{ backgroundColor: hex + '33' }}
        >
          {event.image_url
            ? <img src={event.image_url} alt="" className="h-full w-full object-cover" />
            : <Image size={20} style={{ color: hex }} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{event.title}</p>
          <p className="text-xs text-gray-400 truncate">{event.date} · {event.location}</p>
        </div>

        {/* Tag badge */}
        <span
          className="hidden md:inline-block text-[10px] font-bold uppercase px-2 py-1 rounded-full border text-white shrink-0"
          style={{ backgroundColor: hex, borderColor: hex }}
        >
          {event.tag}
        </span>

        {/* Visibility */}
        <button
          onClick={() => onToggleActive(event)}
          className={`shrink-0 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border transition-colors
            ${event.is_active
              ? 'bg-green-50 border-green-300 text-green-700 hover:bg-green-100'
              : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'}`}
        >
          {event.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
          {event.is_active ? 'Live' : 'Hidden'}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onEdit(event)}
            className="px-3 py-1.5 bg-[#312783] text-white text-xs font-bold rounded-lg hover:bg-[#231d5e] transition-colors"
          >
            Edit
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1.5">
              <button onClick={() => onDelete(event)} className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600">Confirm</button>
              <button onClick={() => setConfirmDelete(false)} className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg">Cancel</button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>
    </Reorder.Item>
  );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
export default function EventsManager() {
  const [events, setEvents]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast]     = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try   { setEvents(await getAllEvents()); }
    catch (err) { showToast(err.message, 'error'); }
    finally     { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (form) => {
    setIsSaving(true);
    try {
      if (form.id) {
        const updated = await updateEvent(form.id, form);
        setEvents(es => es.map(e => e.id === updated.id ? updated : e));
        showToast('Event updated!');
      } else {
        const created = await createEvent(form);
        setEvents(es => [...es, created]);
        showToast('Event created!');
      }
      setEditing(null);
    } catch (err) { showToast(err.message, 'error'); }
    finally       { setIsSaving(false); }
  };

  const handleDelete = async (event) => {
    try {
      // Delete photo from storage first if it's a Supabase URL
      if (event.image_url) await deleteEventPhoto(event.image_url);
      await deleteEvent(event.id);
      setEvents(es => es.filter(e => e.id !== event.id));
      showToast('Event deleted.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleToggleActive = async (event) => {
    try {
      const updated = await updateEvent(event.id, { is_active: !event.is_active });
      setEvents(es => es.map(e => e.id === updated.id ? updated : e));
      showToast(updated.is_active ? 'Event is now live.' : 'Event hidden from site.');
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleReorder = async (newOrder) => {
    const reindexed = newOrder.map((e, i) => ({ ...e, display_order: i + 1 }));
    setEvents(reindexed);
    try   { await reorderEvents(reindexed.map(({ id, display_order }) => ({ id, display_order }))); }
    catch { showToast('Failed to save new order.', 'error'); load(); }
  };

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full bg-gray-50 font-sans">

      {/* EDITOR OVERLAY */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-stretch justify-center"
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-5xl bg-white shadow-2xl flex flex-col mt-10 rounded-t-2xl overflow-hidden"
            >
              <EventEditor
                event={editing}
                onSave={handleSave}
                onCancel={() => setEditing(null)}
                isSaving={isSaving}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PAGE HEADER */}
      <div className="bg-white border-b-2 border-gray-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Featured Photos</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {events.filter(e => e.is_active).length} of {events.length} events visible on site
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={load} className="p-2 text-gray-400 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100" title="Refresh">
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setEditing({ ...EMPTY_EVENT, display_order: events.length + 1 })}
            className="flex items-center gap-2 bg-[#312783] text-white font-bold px-5 py-2.5 rounded-xl hover:bg-[#231d5e] transition-colors text-sm shadow-sm"
          >
            <Plus size={18} /> Add Event
          </button>
        </div>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto p-8">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 size={32} className="animate-spin text-[#312783]" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 text-lg">No events yet.</p>
            <button onClick={() => setEditing({ ...EMPTY_EVENT })} className="mt-4 text-[#312783] font-bold hover:underline text-sm">
              Add your first event →
            </button>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-400 font-bold uppercase tracking-widest">
              <GripVertical size={14} /> Drag to reorder · saves automatically
            </div>
            <Reorder.Group axis="y" values={events} onReorder={handleReorder} className="space-y-3">
              {events.map(event => (
                <EventRow
                  key={event.id}
                  event={event}
                  onEdit={e => setEditing({ ...e })}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                />
              ))}
            </Reorder.Group>
            <p className="text-center text-xs text-gray-300 mt-8">
              {events.length} event{events.length !== 1 ? 's' : ''} total
            </p>
          </div>
        )}
      </div>

      {/* TOAST */}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}