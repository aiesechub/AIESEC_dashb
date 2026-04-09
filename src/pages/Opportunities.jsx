// src/admin/pages/Opportunities.jsx
// CRUD admin dashboard for the `opportunities` table.
// Schema: opportunity_id, title, location, direction, external_link, program_id, created_at, is_active

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, Pencil, Trash2, X, Save, Search, RefreshCw,
  Eye, EyeOff, ChevronDown, Loader2, Globe, Link,
  MapPin, ArrowLeftRight, Hash, Calendar, ToggleLeft, ToggleRight,
} from 'lucide-react';

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Design tokens ─────────────────────────────────────────────────────────────
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
  brandRed:    '#EF3340',
  brandYellow: '#FFD100',
  brandGreen:  '#00A651',
  brandBlue:   '#009BD6',
  brandOrange: '#F58220',
};

const F = {
  bara:    '"Barabara", "Impact", "Arial Black", sans-serif',
  rounded: '"Varela Round", sans-serif',
  body:    '"Inter", system-ui, sans-serif',
  desc:    '"DM Serif Display", "Georgia", "Times New Roman", serif',
};

// ── Direction options ─────────────────────────────────────────────────────────
const DIRECTIONS = ['Incoming', 'Outgoing'];

// ── Empty form matching DB schema ─────────────────────────────────────────────
const emptyForm = () => ({
  title:         '',
  location:      '',
  direction:     '',
  external_link: '',
  program_id:    '',
  is_active:     true,
});

// ── FiestaStripe ──────────────────────────────────────────────────────────────
const FiestaStripe = ({ height = 4 }) => (
  <div style={{
    height, flexShrink: 0,
    background: `linear-gradient(to right, ${C.brandRed}, ${C.brandYellow}, ${C.brandGreen}, ${C.brandBlue}, ${C.brandOrange}, ${C.brandRed})`,
  }} />
);

// ── Field atoms ───────────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label style={{
    display: 'block', fontFamily: F.rounded, fontWeight: 700,
    fontSize: 11, letterSpacing: '0.04em', color: C.textMid, marginBottom: 5,
  }}>
    {children}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
  </label>
);

const inputBase = (focused, error) => ({
  width: '100%', boxSizing: 'border-box',
  border: `1px solid ${error ? C.red : focused ? C.blue : C.border}`,
  borderRadius: 8, padding: '9px 12px',
  fontFamily: F.body, fontSize: 13, fontWeight: 600,
  backgroundColor: C.white, outline: 'none', color: C.text,
  boxShadow: focused ? `0 0 0 3px ${C.blue}20` : '0 1px 3px rgba(0,0,0,0.05)',
  transition: 'all 0.15s',
});

function ModernInput({ value, onChange, placeholder, type = 'text', disabled, error }) {
  const [focused, setFocused] = useState(false);
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder}
      disabled={disabled}
      style={{ ...inputBase(focused, error), opacity: disabled ? 0.6 : 1 }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
  );
}

function ModernSelect({ value, onChange, children, disabled }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select value={value} onChange={onChange} disabled={disabled}
        style={{ ...inputBase(focused), appearance: 'none', cursor: 'pointer', paddingRight: 32 }}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}>
        {children}
      </select>
      <ChevronDown size={13} style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: C.textMuted }} />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 99999,
      backgroundColor: type === 'error' ? C.red : C.navy,
      color: '#fff', border: `1px solid ${type === 'error' ? C.redLight : C.blue}`,
      borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
      padding: '12px 18px', fontFamily: F.rounded, fontWeight: 700,
      fontSize: 12, display: 'flex', alignItems: 'center', gap: 10,
    }}>
      <span style={{
        width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
        backgroundColor: type === 'error' ? C.redLight : C.green,
        color: type === 'error' ? C.red : C.white,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10,
      }}>
        {type === 'error' ? '✕' : '✓'}
      </span>
      {msg}
    </div>
  );
}

// ── Direction badge ───────────────────────────────────────────────────────────
function DirectionBadge({ direction }) {
  const isIncoming = direction?.toLowerCase() === 'incoming';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: isIncoming ? C.blueLight : C.amberLight,
      border: `1px solid ${isIncoming ? C.blueMid : C.amber + '60'}`,
      color: isIncoming ? C.blue : C.amber,
      borderRadius: 99, padding: '3px 10px',
      fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.07em',
    }}>
      {direction || '—'}
    </span>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function OpportunitiesManager() {
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState({});
  const [search, setSearch] = useState('');
  const [filterDirection, setFilterDirection] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchOpps = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) showToast(error.message, 'error');
    else setOpps(data || []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);

  // ── Modal helpers ──────────────────────────────────────────────────────────
  const openNew = () => {
    setEditRow(null);
    setForm(emptyForm());
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      title:         row.title         || '',
      location:      row.location      || '',
      direction:     row.direction     || '',
      external_link: row.external_link || '',
      program_id:    row.program_id    != null ? String(row.program_id) : '',
      is_active:     row.is_active     ?? true,
    });
    setErrors({});
    setModalOpen(true);
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {};
    if (!form.title.trim())     e.title     = 'Title is required.';
    if (!form.direction)        e.direction = 'Direction is required.';
    if (form.program_id && isNaN(Number(form.program_id))) e.program_id = 'Must be a number.';
    return e;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setSaving(true);
    const payload = {
      title:         form.title.trim(),
      location:      form.location.trim() || null,
      direction:     form.direction       || null,
      external_link: form.external_link.trim() || null,
      program_id:    form.program_id !== '' ? parseInt(form.program_id, 10) : null,
      is_active:     form.is_active,
    };

    let error;
    if (editRow) {
      ({ error } = await supabase
        .from('opportunities')
        .update(payload)
        .eq('opportunity_id', editRow.opportunity_id));
    } else {
      ({ error } = await supabase.from('opportunities').insert(payload));
    }

    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(editRow ? 'Opportunity updated!' : 'Opportunity created!');
    setModalOpen(false);
    fetchOpps();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const { error } = await supabase
      .from('opportunities')
      .delete()
      .eq('opportunity_id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Deleted.'); fetchOpps(); }
    setDeleteId(null);
  };

  // ── Toggle active ──────────────────────────────────────────────────────────
  const toggleActive = async (row) => {
    const { error } = await supabase
      .from('opportunities')
      .update({ is_active: !row.is_active })
      .eq('opportunity_id', row.opportunity_id);
    if (!error) fetchOpps();
  };

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = opps.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      o.title?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q) ||
      o.direction?.toLowerCase().includes(q);
    const matchDir    = !filterDirection || o.direction === filterDirection;
    const matchActive = filterActive === '' ? true
      : filterActive === 'active'   ? o.is_active === true
      : o.is_active === false;
    return matchSearch && matchDir && matchActive;
  });

  const f = (key) => ({
    value: form[key] ?? '',
    onChange: e => {
      setForm(p => ({ ...p, [key]: e.target.value }));
      if (errors[key]) setErrors(p => ({ ...p, [key]: '' }));
    },
  });

  const activeCount  = opps.filter(o => o.is_active).length;
  const incomingCount = opps.filter(o => o.direction?.toLowerCase() === 'incoming').length;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.surface, fontFamily: F.body }}>

      {/* ── HEADER ── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', minHeight: 60,
          backgroundColor: C.navy, borderBottom: `3px solid ${C.blue}`,
        }}>
          {/* Brand */}
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `1px solid rgba(255,255,255,0.1)`, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, backgroundColor: `${C.blue}25`, border: `1px solid ${C.blue}50`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} color={C.blue} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: F.bara, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>Opportunities</div>
              <div style={{ fontFamily: F.rounded, fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>Admin · CRUD Manager</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            {[
              { val: opps.length,    label: 'Total',    accent: 'rgba(255,255,255,0.9)' },
              { val: activeCount,    label: 'Active',   accent: C.green  },
              { val: incomingCount,  label: 'Incoming', accent: C.blue   },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '0 18px', borderRight: `1px solid rgba(255,255,255,0.08)`, height: '100%' }}>
                <div>
                  <div style={{ fontFamily: F.rounded, fontWeight: 800, fontSize: 22, color: s.accent, lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          <button onClick={fetchOpps} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid rgba(255,255,255,0.08)`, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            <RefreshCw size={13} /> Refresh
          </button>

          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', background: C.blue, color: 'white', border: 'none', borderLeft: `1px solid ${C.blueDark}`, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'filter .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
            <Plus size={15} /> Add Opportunity
          </button>
        </div>
        <FiestaStripe height={4} />
      </div>

      {/* ── SEARCH + FILTERS ── */}
      <div style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0, backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1, minWidth: 200, maxWidth: 340, display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <Search size={13} style={{ marginLeft: 10, color: C.textMuted, flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, location, direction…"
            style={{ flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', fontFamily: F.body, color: C.text }} />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: C.textMuted }}>
              <X size={12} />
            </button>
          )}
        </div>

        {/* Direction filter */}
        <select value={filterDirection} onChange={e => setFilterDirection(e.target.value)}
          style={{ padding: '8px 28px 8px 10px', fontSize: 11, fontWeight: 700, fontFamily: F.rounded, border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.textMid, cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          <option value="">All Directions</option>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {/* Active filter */}
        <select value={filterActive} onChange={e => setFilterActive(e.target.value)}
          style={{ padding: '8px 28px 8px 10px', fontSize: 11, fontWeight: 700, fontFamily: F.rounded, border: `1px solid ${C.border}`, borderRadius: 8, background: C.surface, color: C.textMid, cursor: 'pointer', outline: 'none', appearance: 'none', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2394a3b8'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: C.textMuted, marginLeft: 'auto' }}>
          {loading ? 'Loading…' : `${filtered.length} of ${opps.length}`}
        </span>
      </div>

      {/* ── TABLE ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
            <Loader2 size={22} color={C.blue} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 13, color: C.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 60, height: 60, backgroundColor: C.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>📭</div>
            <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 14, color: C.textMid, marginBottom: 6 }}>
              {opps.length === 0 ? 'No opportunities yet' : 'No results found'}
            </p>
            <p style={{ fontFamily: F.desc, fontSize: 14, color: C.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
              {opps.length === 0 ? 'Create your first opportunity to get started.' : 'Try adjusting your search or filters.'}
            </p>
            {opps.length === 0 && (
              <button onClick={openNew} style={{ backgroundColor: C.blue, color: 'white', border: 'none', padding: '10px 24px', fontFamily: F.rounded, fontWeight: 800, fontSize: 13, cursor: 'pointer', borderRadius: 8, boxShadow: `0 4px 14px ${C.blue}40`, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={14} /> Add First Opportunity
              </button>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: F.body }}>
              <thead>
                <tr style={{ backgroundColor: C.navy, borderBottom: `2px solid ${C.blue}` }}>
                  {[
                    { label: 'ID',           icon: Hash          },
                    { label: 'Title',        icon: Globe         },
                    { label: 'Location',     icon: MapPin        },
                    { label: 'Direction',    icon: ArrowLeftRight },
                    { label: 'Program ID',   icon: Hash          },
                    { label: 'External Link',icon: Link          },
                    { label: 'Created',      icon: Calendar      },
                    { label: 'Status',       icon: Eye           },
                    { label: 'Actions',      icon: null          },
                  ].map(({ label, icon: Icon }) => (
                    <th key={label} style={{ padding: '10px 14px', textAlign: 'left', fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        {Icon && <Icon size={10} color='rgba(255,255,255,0.3)' />}
                        {label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <OppRow
                    key={row.opportunity_id}
                    row={row}
                    isLast={i === filtered.length - 1}
                    onEdit={() => openEdit(row)}
                    onDelete={() => setDeleteId(row.opportunity_id)}
                    onToggleActive={() => toggleActive(row)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL ── */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(8px)' }} onClick={() => !saving && setModalOpen(false)} />
          <div style={{
            position: 'relative', width: '100%', maxWidth: 560,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, boxShadow: `0 24px 60px rgba(3,126,243,0.12), 0 8px 30px rgba(0,0,0,0.18)`,
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{ background: C.navy, display: 'flex', alignItems: 'stretch', borderBottom: `3px solid ${C.blue}`, flexShrink: 0 }}>
              <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 7, borderRight: `1px solid rgba(255,255,255,0.1)` }}>
                {[C.brandRed, C.brandYellow, C.green].map((col, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: col, opacity: 0.85 }} />
                ))}
              </div>
              <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, backgroundColor: `${C.blue}25`, border: `1px solid ${C.blue}50`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={14} color={C.blue} />
                </div>
                <span style={{ fontFamily: F.bara, color: C.white, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {editRow ? `Edit #${editRow.opportunity_id}` : 'New Opportunity'}
                </span>
              </div>
              <button onClick={() => !saving && setModalOpen(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: C.textMuted, padding: '0 20px', fontSize: 20, transition: 'all .15s', lineHeight: 1 }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.red; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = C.textMuted; }}>
                ✕
              </button>
            </div>
            <FiestaStripe />

            {/* Form */}
            <form onSubmit={handleSave} style={{ flex: 1, overflow: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Title */}
              <div>
                <FieldLabel required>Title</FieldLabel>
                <ModernInput {...f('title')} placeholder="e.g. Environmental Education Volunteer" error={errors.title} />
                {errors.title && <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0' }}>✕ {errors.title}</p>}
              </div>

              {/* Location */}
              <div>
                <FieldLabel>Location</FieldLabel>
                <ModernInput {...f('location')} placeholder="e.g. Quezon City, Philippines" />
              </div>

              {/* Direction */}
              <div>
                <FieldLabel required>Direction</FieldLabel>
                <ModernSelect value={form.direction} onChange={e => { setForm(p => ({ ...p, direction: e.target.value })); if (errors.direction) setErrors(p => ({ ...p, direction: '' })); }}>
                  <option value="">— Select Direction —</option>
                  {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </ModernSelect>
                {errors.direction && <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0' }}>✕ {errors.direction}</p>}
              </div>

              {/* Program ID */}
              <div>
                <FieldLabel>Program ID</FieldLabel>
                <ModernInput {...f('program_id')} type="number" placeholder="1 - Volunteer, 2 - Talent, 3 - Teacher" error={errors.program_id} />
                {errors.program_id && <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0' }}>✕ {errors.program_id}</p>}
                <p style={{ fontFamily: F.rounded, fontSize: 9, color: C.textMuted, margin: '4px 0 0' }}>1 - Volunteer, 2 - Talent, 3 - Teacher</p>
              </div>

              {/* External Link */}
              <div>
                <FieldLabel>External Link</FieldLabel>
                <ModernInput {...f('external_link')} placeholder="https://aiesec.org/opportunity/…" />
              </div>

              {/* is_active toggle */}
              <div>
                <FieldLabel>Status</FieldLabel>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, is_active: !p.is_active }))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '10px 16px', borderRadius: 8, cursor: 'pointer',
                    border: `1px solid ${form.is_active ? C.green : C.border}`,
                    background: form.is_active ? C.greenLight : C.surface,
                    color: form.is_active ? C.green : C.textMuted,
                    fontFamily: F.rounded, fontWeight: 700, fontSize: 12,
                    transition: 'all .15s', width: '100%', justifyContent: 'center',
                    boxShadow: form.is_active ? `0 2px 8px ${C.green}25` : 'none',
                  }}
                >
                  {form.is_active
                    ? <ToggleRight size={18} color={C.green} />
                    : <ToggleLeft size={18} color={C.textMuted} />}
                  {form.is_active ? 'Active — visible on site' : 'Inactive — hidden from site'}
                </button>
              </div>

              {/* Footer */}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 8, borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
                <button type="button" onClick={() => setModalOpen(false)}
                  style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: C.white, color: C.textMid, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .12s' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = C.white}>
                  <X size={13} /> Cancel
                </button>
                <button type="submit" disabled={saving}
                  style={{ padding: '9px 22px', border: `1px solid ${C.blue}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: C.blue, color: 'white', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 14px ${C.blue}35`, opacity: saving ? 0.7 : 1, transition: 'filter .12s' }}
                  onMouseEnter={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                  onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                  {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                  {saving ? 'Saving…' : editRow ? 'Save Changes' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => setDeleteId(null)} />
          <div style={{ position: 'relative', background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, boxShadow: `0 20px 50px rgba(0,0,0,0.2)`, padding: 32, maxWidth: 360, width: '100%', textAlign: 'center' }}>
            <div style={{ width: 56, height: 56, backgroundColor: C.redLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🗑️</div>
            <p style={{ fontFamily: F.bara, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text, marginBottom: 8 }}>Delete Opportunity?</p>
            <p style={{ fontFamily: F.desc, fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6, fontStyle: 'italic' }}>
              This action cannot be undone. The record will be permanently removed from the database.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: C.white, color: C.textMid, transition: 'all .12s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = C.white}>
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteId)} style={{ padding: '9px 20px', border: `1px solid ${C.red}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, cursor: 'pointer', backgroundColor: C.red, color: 'white', boxShadow: `0 4px 14px ${C.red}35`, display: 'flex', alignItems: 'center', gap: 6, transition: 'filter .12s' }}
                onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.08)'}
                onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Table Row ─────────────────────────────────────────────────────────────────
function OppRow({ row, isLast, onEdit, onDelete, onToggleActive }) {
  const [hovered, setHovered] = useState(false);

  const createdDate = row.created_at
    ? new Date(row.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: !isLast ? `1px solid ${C.border}` : 'none',
        backgroundColor: hovered ? C.surface : C.white,
        opacity: row.is_active ? 1 : 0.55,
        transition: 'background .12s',
      }}
    >
      {/* ID */}
      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: F.rounded, fontWeight: 800, fontSize: 11, color: C.textMuted, backgroundColor: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: '2px 8px' }}>
          #{row.opportunity_id}
        </span>
      </td>

      {/* Title */}
      <td style={{ padding: '12px 14px', maxWidth: 200 }}>
        <div style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 13, color: C.text, lineHeight: 1.3 }}>{row.title || '—'}</div>
      </td>

      {/* Location */}
      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
        {row.location
          ? <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: F.rounded, fontWeight: 600, fontSize: 12, color: C.textMid }}>
              <MapPin size={11} color={C.textMuted} />
              {row.location}
            </div>
          : <span style={{ color: C.textMuted, fontSize: 11 }}>—</span>
        }
      </td>

      {/* Direction */}
      <td style={{ padding: '12px 14px' }}>
        <DirectionBadge direction={row.direction} />
      </td>

      {/* Program ID */}
      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
        {row.program_id != null
          ? <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: C.blue, backgroundColor: C.blueLight, border: `1px solid ${C.blueMid}`, borderRadius: 5, padding: '2px 8px' }}>{row.program_id}</span>
          : <span style={{ color: C.textMuted, fontSize: 11 }}>—</span>
        }
      </td>

      {/* External Link */}
      <td style={{ padding: '12px 14px', maxWidth: 160 }}>
        {row.external_link
          ? <a href={row.external_link} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: F.rounded, fontWeight: 600, fontSize: 11, color: C.blue, textDecoration: 'none', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <Link size={10} /> {row.external_link.replace(/^https?:\/\//, '').slice(0, 28)}{row.external_link.length > 35 ? '…' : ''}
            </a>
          : <span style={{ color: C.textMuted, fontSize: 11 }}>—</span>
        }
      </td>

      {/* Created */}
      <td style={{ padding: '12px 14px', whiteSpace: 'nowrap' }}>
        <span style={{ fontFamily: F.rounded, fontSize: 11, color: C.textMuted }}>{createdDate}</span>
      </td>

      {/* Status */}
      <td style={{ padding: '12px 14px' }}>
        <button onClick={onToggleActive} style={{
          display: 'flex', alignItems: 'center', gap: 5,
          backgroundColor: row.is_active ? C.greenLight : C.redLight,
          border: `1px solid ${row.is_active ? C.green : C.red}`,
          borderRadius: 6, padding: '4px 10px', cursor: 'pointer',
          fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
          color: row.is_active ? C.green : C.red, transition: 'all .12s',
          whiteSpace: 'nowrap',
        }}>
          {row.is_active ? <Eye size={10} /> : <EyeOff size={10} />}
          {row.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>

      {/* Actions */}
      <td style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={onEdit} style={{
            display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
            border: `1px solid ${C.blue}`, borderRadius: 7,
            fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
            backgroundColor: C.blue, color: 'white', cursor: 'pointer',
            boxShadow: `0 2px 6px ${C.blue}30`, transition: 'filter .12s',
          }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
            <Pencil size={11} /> Edit
          </button>
          <button onClick={onDelete} style={{
            display: 'flex', alignItems: 'center', padding: '6px 10px',
            border: `1px solid ${C.border}`, borderRadius: 7,
            fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
            backgroundColor: C.white, color: C.textMuted, cursor: 'pointer',
            transition: 'all .12s',
          }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.redLight; e.currentTarget.style.color = C.red; e.currentTarget.style.borderColor = C.red; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = C.white; e.currentTarget.style.color = C.textMuted; e.currentTarget.style.borderColor = C.border; }}>
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}