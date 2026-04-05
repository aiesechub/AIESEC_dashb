// src/admin/pages/OutgoingProducts.jsx
// Full CRUD admin dashboard for Outgoing Volunteer, Outgoing Talent, Outgoing Teacher opportunities.
// Redesigned: white + #037ef3 blue modern admin — matches EventsManager design system.
// Description texts use "DM Serif Display" for an editorial, refined feel.

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import {
  Plus, Pencil, Trash2, X, Save, Search, RefreshCw,
  Eye, EyeOff, Star, ChevronDown, AlertTriangle, Check,
  Heart, Users, BookOpen, Briefcase, Globe, Loader2, Upload, Image,
} from 'lucide-react';

// ── Supabase client ───────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ── Design tokens — matches EventsManager ─────────────────────────────────────
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
  // brand colors kept for FiestaStripe
  brandRed:    '#EF3340',
  brandYellow: '#FFD100',
  brandGreen:  '#00A651',
  brandBlue:   '#009BD6',
  brandOrange: '#F58220',
};

// ── Typography ────────────────────────────────────────────────────────────────
const F = {
  bara:       '"Barabara", "Impact", "Arial Black", sans-serif',
  cubao:      '"Cubao", "Impact", "Arial Black", sans-serif',
  pipanganan: '"Pipanganan", "Impact", "Arial Black", sans-serif',
  rounded:    '"Varela Round", sans-serif',
  body:       '"Inter", system-ui, sans-serif',
  // Editorial serif for description/note texts — refined contrast to the display fonts
  desc:       '"DM Serif Display", "Georgia", "Times New Roman", serif',
};

// ── Product definitions ───────────────────────────────────────────────────────
const PRODUCTS = [
  {
    key: 'volunteer', label: 'OG Volunteer', shortLabel: 'OV',
    color: '#e03131', lightBg: '#fff5f5', tabBg: '#fff0f0',
    icon: Heart,
    categories: ['Community Development', 'Sustainability', 'Education', 'Healthcare', 'Cultural Exchange'],
    durations: ['2 weeks', '4 weeks', '6 weeks', '8 weeks'],
    specificField: { key: 'impact_area', label: 'Impact Area', placeholder: 'e.g. Rural Development' },
    badgeField:    { key: 'badge_text',  label: 'Badge Text',  placeholder: 'e.g. 🌍 Impact' },
  },
  {
    key: 'talent', label: 'OG Talent', shortLabel: 'OT',
    color: C.blue, lightBg: C.blueLight, tabBg: '#eef6fe',
    icon: Briefcase,
    categories: ['Internship', 'Consulting', 'Project Management', 'Digital Marketing', 'Engineering'],
    durations: ['2 months', '3 months', '6 months', '12 months'],
    specificField: { key: 'compensation', label: 'Compensation', placeholder: 'Paid / Volunteer / Stipend' },
    badgeField:    { key: 'badge_text',   label: 'Badge Text',    placeholder: 'e.g. Paid Internship' },
  },
  {
    key: 'teacher', label: 'OG Teacher', shortLabel: 'OTe',
    color: '#d97706', lightBg: '#fffbeb', tabBg: '#fffaeb',
    icon: BookOpen,
    categories: ['Language Teaching', 'STEM Education', 'Arts & Culture', 'Special Education', 'Youth Development'],
    durations: ['1 month', '2 months', '3 months', '6 months'],
    specificField: { key: 'accommodation', label: 'Accommodation', placeholder: 'Provided / Self-funded' },
    badgeField:    { key: 'badge_text',    label: 'Badge Text',     placeholder: 'e.g. 🏠 Provided' },
  },
];

const emptyForm = (productType = 'volunteer') => ({
  product_type: productType,
  title: '', organization: '', city: '', region: '', country: '',
  category: '', duration: '', spots_left: '',
  tags: '', badge_text: '', badge_color: '#10b981',
  footer_label: '', image_url: '',
  is_featured: false, is_visible: true,
  impact_area: '', compensation: '', accommodation: '', notes: '',
  application_deadline: '', external_link: '',
});

// ── FiestaStripe — brand element, kept exactly ────────────────────────────────
const FiestaStripe = ({ height = 4 }) => (
  <div style={{
    height, flexShrink: 0,
    background: `linear-gradient(to right, ${C.brandRed}, ${C.brandYellow}, ${C.brandGreen}, ${C.brandBlue}, ${C.brandOrange}, ${C.brandRed})`,
  }} />
);

// ── Shared form atoms ─────────────────────────────────────────────────────────
const FieldLabel = ({ children, required }) => (
  <label style={{
    display: 'block', fontFamily: F.rounded, fontWeight: 700,
    fontSize: 11, letterSpacing: '0.04em', color: C.textMid, marginBottom: 5,
  }}>
    {children}{required && <span style={{ color: C.red, marginLeft: 3 }}>*</span>}
  </label>
);

const FieldError = ({ children }) => (
  <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.red, margin: '4px 0 0' }}>✕ {children}</p>
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
      disabled={disabled} style={{ ...inputBase(focused, error), opacity: disabled ? 0.6 : 1 }}
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

function ModernTextarea({ value, onChange, placeholder, rows = 3 }) {
  const [focused, setFocused] = useState(false);
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      style={{
        ...inputBase(focused),
        resize: 'vertical', lineHeight: 1.6,
        // Description textarea uses the editorial serif font
        fontFamily: F.desc, fontSize: 13, fontWeight: 400,
      }}
      onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />
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

// ── Image Uploader ────────────────────────────────────────────────────────────
function ImageUploader({ currentUrl, onUploaded, prodColor }) {
  const [uploading, setUploading] = useState(false);
  const [pct, setPct] = useState(0);
  const [err, setErr] = useState('');
  const fileRef = React.useRef();

  const handleFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) { setErr('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setErr('Image must be under 5 MB.'); return; }
    setErr(''); setUploading(true); setPct(10);
    const ticker = setInterval(() => setPct(p => Math.min(p + 15, 85)), 300);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `opportunity-${Date.now()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('opportunity-images')
        .upload(fileName, file, { upsert: true });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage
        .from('opportunity-images')
        .getPublicUrl(fileName);
      clearInterval(ticker); setPct(100);
      setTimeout(() => { onUploaded(publicUrl); setUploading(false); setPct(0); }, 400);
    } catch (e) {
      clearInterval(ticker); setErr(e.message || 'Upload failed.');
      setUploading(false); setPct(0);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <FieldLabel>Cover Image</FieldLabel>
      {currentUrl && (
        <div style={{ position: 'relative', border: `1px solid ${C.border}`, overflow: 'hidden', height: 130, borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.07)' }}>
          <img src={currentUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button onClick={() => onUploaded('')} style={{
            position: 'absolute', top: 8, right: 8, background: C.red,
            color: '#fff', border: 'none', padding: '5px 12px',
            fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
            cursor: 'pointer', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
          }}>✕ Remove</button>
        </div>
      )}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
        style={{
          border: `2px dashed ${uploading ? prodColor : C.border}`,
          borderRadius: 10, padding: '28px 20px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          cursor: 'pointer', backgroundColor: uploading ? prodColor + '08' : C.surface,
          transition: 'all .2s', textAlign: 'center',
        }}
        onMouseEnter={e => { if (!uploading) e.currentTarget.style.borderColor = prodColor; }}
        onMouseLeave={e => { if (!uploading) e.currentTarget.style.borderColor = C.border; }}
      >
        {uploading ? (
          <>
            <Loader2 size={24} color={prodColor} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: prodColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Uploading…</span>
            <div style={{ width: '100%', height: 6, backgroundColor: prodColor + '20', borderRadius: 99, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: prodColor, width: pct + '%', transition: 'width .3s', borderRadius: 99 }} />
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 48, height: 48, backgroundColor: C.blueLight, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Image size={22} color={C.blue} />
            </div>
            <div>
              <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, color: C.blue, margin: '0 0 4px' }}>
                {currentUrl ? 'Replace image' : 'Drop image here or click to browse'}
              </p>
              <p style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, margin: 0 }}>PNG · JPG · WEBP · max 5MB</p>
            </div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
      <div>
        <FieldLabel>Or paste image URL</FieldLabel>
        <ModernInput value={currentUrl || ''} onChange={e => onUploaded(e.target.value)} placeholder="https://…" />
      </div>
      {err && <FieldError>{err}</FieldError>}
    </div>
  );
}

// ── Opportunity Card Preview ───────────────────────────────────────────────────
function OpportunityCardPreview({ form, prod }) {
  const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
  return (
    <div style={{
      background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14,
      overflow: 'hidden', boxShadow: `0 8px 24px rgba(0,0,0,0.09)`,
      maxWidth: 260, width: '100%',
    }}>
      {/* Image area */}
      <div style={{
        height: 140, background: prod.lightBg, position: 'relative',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', borderBottom: `1px solid ${C.border}`,
      }}>
        {form.image_url
          ? <img src={form.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, opacity: 0.4 }}>
              <Image size={28} color={prod.color} />
              <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 9, color: prod.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>No Image</span>
            </div>
        }
        {form.badge_text && (
          <div style={{
            position: 'absolute', top: 10, left: 10,
            background: form.badge_color, color: '#fff',
            borderRadius: 20, padding: '3px 10px',
            fontFamily: F.rounded, fontWeight: 700, fontSize: 9,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
          }}>{form.badge_text}</div>
        )}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: prod.color, color: '#fff',
          borderRadius: 6, padding: '2px 8px',
          fontFamily: F.rounded, fontWeight: 700, fontSize: 9,
          textTransform: 'uppercase', boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        }}>{prod.shortLabel}</div>
      </div>

      <div style={{ padding: '14px 16px' }}>
        {form.category && (
          <span style={{
            background: prod.color + '15', border: `1px solid ${prod.color}40`,
            color: prod.color, borderRadius: 99, padding: '2px 10px',
            fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.08em',
            display: 'inline-block', marginBottom: 8,
          }}>{form.category}</span>
        )}
        <p style={{
          fontFamily: F.pipanganan, fontSize: 15, textTransform: 'uppercase',
          lineHeight: 1.1, margin: '0 0 4px', color: C.text,
        }}>{form.title || 'Opportunity Title'}</p>
        {/* Organization uses the editorial serif — the "description" level */}
        <p style={{ fontFamily: F.desc, fontSize: 12, color: C.textMid, margin: '0 0 10px', fontStyle: 'italic' }}>
          {form.organization || 'Organization'}
        </p>

        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 8 }}>
          {form.city && (
            <span style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 10, color: C.textMid, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: '2px 7px' }}>
              📍 {form.city}
            </span>
          )}
          {form.duration && (
            <span style={{ fontFamily: F.rounded, fontWeight: 600, fontSize: 10, color: C.textMid, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 5, padding: '2px 7px' }}>
              ⏱ {form.duration}
            </span>
          )}
          {form.spots_left && (
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: C.green, background: C.greenLight, border: `1px solid ${C.green}30`, borderRadius: 5, padding: '2px 7px' }}>
              {form.spots_left} spots left
            </span>
          )}
        </div>

        {tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 8 }}>
            {tags.slice(0, 3).map(t => (
              <span key={t} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 99, padding: '1px 8px', fontSize: 9, color: C.textMid, fontFamily: F.rounded, fontWeight: 600 }}>
                {t}
              </span>
            ))}
          </div>
        )}

        {form.footer_label && (
          <p style={{ fontFamily: F.desc, fontSize: 11, color: C.textMuted, margin: '8px 0 0', borderTop: `1px solid ${C.border}`, paddingTop: 8, fontStyle: 'italic' }}>
            {form.footer_label}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Section badge (matches EventsManager) ────────────────────────────────────
function SectionBadge({ children, color = C.blue, bg = C.blueLight, border = C.blueMid }) {
  return (
    <span style={{
      display: 'inline-block', fontFamily: F.rounded, fontWeight: 800, fontSize: 10,
      textTransform: 'uppercase', letterSpacing: '0.12em',
      color, backgroundColor: bg, padding: '3px 12px', borderRadius: 99,
      border: `1px solid ${border}`,
    }}>{children}</span>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function OutgoingProducts() {
  const [activeProduct, setActiveProduct] = useState('volunteer');
  const [opps, setOpps] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState('details');
  const [editRow, setEditRow] = useState(null);
  const [form, setForm] = useState(emptyForm('volunteer'));
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);

  const prod = PRODUCTS.find(p => p.key === activeProduct);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOpps = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('outgoing_opportunities')
      .select('*')
      .eq('product_type', activeProduct)
      .order('created_at', { ascending: false });
    if (error) showToast(error.message, 'error');
    else setOpps(data || []);
    setLoading(false);
  }, [activeProduct]);

  useEffect(() => { fetchOpps(); }, [fetchOpps]);

  const openNew = () => {
    setEditRow(null);
    setForm(emptyForm(activeProduct));
    setModalTab('details');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditRow(row);
    setForm({
      ...emptyForm(activeProduct),
      ...row,
      tags: Array.isArray(row.tags) ? row.tags.join(', ') : (row.tags || ''),
    });
    setModalTab('details');
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      product_type: activeProduct,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      spots_left: form.spots_left ? parseInt(form.spots_left, 10) : null,
    };
    let error;
    if (editRow) {
      ({ error } = await supabase.from('outgoing_opportunities').update(payload).eq('id', editRow.id));
    } else {
      const { id, ...rest } = payload;
      ({ error } = await supabase.from('outgoing_opportunities').insert(rest));
    }
    setSaving(false);
    if (error) { showToast(error.message, 'error'); return; }
    showToast(editRow ? 'Opportunity updated!' : 'Opportunity created!');
    setModalOpen(false);
    fetchOpps();
  };

  const handleDelete = async (id) => {
    const { error } = await supabase.from('outgoing_opportunities').delete().eq('id', id);
    if (error) showToast(error.message, 'error');
    else { showToast('Deleted.'); fetchOpps(); }
    setDeleteId(null);
  };

  const toggleVisibility = async (row) => {
    const { error } = await supabase.from('outgoing_opportunities').update({ is_visible: !row.is_visible }).eq('id', row.id);
    if (!error) fetchOpps();
  };

  const toggleFeatured = async (row) => {
    const { error } = await supabase.from('outgoing_opportunities').update({ is_featured: !row.is_featured }).eq('id', row.id);
    if (!error) fetchOpps();
  };

  const filtered = opps.filter(o => {
    const q = search.toLowerCase();
    return !q || o.title?.toLowerCase().includes(q) || o.organization?.toLowerCase().includes(q) || o.city?.toLowerCase().includes(q);
  });

  const F_ = (key) => ({ value: form[key] ?? '', onChange: e => setForm(p => ({ ...p, [key]: e.target.value })) });

  const liveCount = opps.filter(o => o.is_visible).length;
  const featCount = opps.filter(o => o.is_featured).length;

  const MODAL_TABS = [
    { id: 'details', label: 'Details', icon: '①' },
    { id: 'media',   label: 'Media',   icon: '②' },
    { id: 'style',   label: 'Style',   icon: '③' },
  ];

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: C.surface, fontFamily: F.body }}>

      {/* ── HEADER — matches EventsManager navy header ── */}
      <div style={{ flexShrink: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'stretch', minHeight: 60,
          backgroundColor: C.navy, borderBottom: `3px solid ${C.blue}`,
          overflow: 'hidden',
        }}>
          {/* Brand block */}
          <div style={{ padding: '0 22px', display: 'flex', alignItems: 'center', gap: 12, borderRight: `1px solid rgba(255,255,255,0.1)`, flexShrink: 0 }}>
            <div style={{ width: 36, height: 36, backgroundColor: `${C.blue}25`, border: `1px solid ${C.blue}50`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Globe size={18} color={C.blue} strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontFamily: F.bara, color: C.white, fontSize: 15, textTransform: 'uppercase', letterSpacing: '0.1em', lineHeight: 1 }}>AIESEC Products</div>
              <div style={{ fontFamily: F.rounded, fontWeight: 600, color: 'rgba(255,255,255,0.4)', fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', marginTop: 3 }}>Outgoing Opportunities</div>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px' }}>
            {[
              { val: opps.length, label: 'Total',    accent: 'rgba(255,255,255,0.9)' },
              { val: liveCount,   label: 'Live',     accent: C.green  },
              { val: featCount,   label: 'Featured', accent: C.amber  },
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
          <button onClick={fetchOpps} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0 18px', background: 'transparent', border: 'none', borderLeft: `1px solid rgba(255,255,255,0.08)`, fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: 'rgba(255,255,255,0.45)', cursor: 'pointer', transition: 'all .15s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}>
            <RefreshCw size={13} /> Refresh
          </button>

          {/* Add */}
          <button onClick={openNew} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 22px', background: C.blue, color: 'white', border: 'none', borderLeft: `1px solid ${C.blueDark}`, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', cursor: 'pointer', transition: 'filter .15s', flexShrink: 0 }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.12)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
            <Plus size={15} /> Add Opportunity
          </button>
        </div>
        <FiestaStripe height={4} />
      </div>

      {/* ── PRODUCT TABS ── */}
      <div style={{
        backgroundColor: C.white, borderBottom: `1px solid ${C.border}`,
        padding: '0 20px', display: 'flex', gap: 0, flexShrink: 0, overflowX: 'auto',
      }}>
        {PRODUCTS.map(p => {
          const active = p.key === activeProduct;
          const Icon = p.icon;
          return (
            <button
              key={p.key}
              onClick={() => { setActiveProduct(p.key); setSearch(''); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                fontFamily: F.rounded, fontWeight: 700, fontSize: 12,
                padding: '14px 20px', flexShrink: 0,
                border: 'none', borderBottom: active ? `3px solid ${p.color}` : '3px solid transparent',
                backgroundColor: 'transparent',
                color: active ? p.color : C.textMuted,
                cursor: 'pointer', transition: 'all .15s',
                marginBottom: -1,
              }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.color = p.color; e.currentTarget.style.backgroundColor = p.lightBg; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.color = C.textMuted; e.currentTarget.style.backgroundColor = 'transparent'; } }}
            >
              <Icon size={14} />
              {p.label}
              {active && (
                <span style={{ fontFamily: F.rounded, fontWeight: 800, fontSize: 10, backgroundColor: p.color + '15', color: p.color, padding: '1px 7px', borderRadius: 99, border: `1px solid ${p.color}30` }}>
                  {opps.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── SEARCH + COUNT ── */}
      <div style={{
        padding: '10px 20px', display: 'flex', alignItems: 'center',
        gap: 12, flexShrink: 0, backgroundColor: C.white,
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden', transition: 'all .15s' }}>
          <Search size={13} style={{ marginLeft: 10, color: C.textMuted, flexShrink: 0 }} />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search title, org, city…"
            style={{ flex: 1, padding: '8px 10px', fontSize: 12, fontWeight: 600, border: 'none', outline: 'none', background: 'transparent', fontFamily: F.body, color: C.text }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 10px', color: C.textMuted }}>
              <X size={12} />
            </button>
          )}
        </div>
        <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 11, color: C.textMuted }}>
          {loading ? 'Loading…' : `${filtered.length} of ${opps.length}`}
        </span>
      </div>

      {/* ── TABLE ── */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 12 }}>
            <Loader2 size={22} color={prod.color} style={{ animation: 'spin 1s linear infinite' }} />
            <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 13, color: prod.color, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ width: 60, height: 60, backgroundColor: C.blueLight, borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 26 }}>📭</div>
            <p style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 14, color: C.textMid, marginBottom: 6 }}>
              {opps.length === 0 ? 'No opportunities yet' : 'No results found'}
            </p>
            <p style={{ fontFamily: F.desc, fontSize: 14, color: C.textMuted, fontStyle: 'italic', marginBottom: 20 }}>
              {opps.length === 0 ? 'Create your first opportunity to get started.' : 'Try adjusting your search query.'}
            </p>
            {opps.length === 0 && (
              <button onClick={openNew} style={{ backgroundColor: prod.color, color: 'white', border: 'none', padding: '10px 24px', fontFamily: F.rounded, fontWeight: 800, fontSize: 13, cursor: 'pointer', borderRadius: 8, boxShadow: `0 4px 14px ${prod.color}40`, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Plus size={14} /> Add First Opportunity
              </button>
            )}
          </div>
        ) : (
          <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, fontFamily: F.body }}>
              <thead>
                <tr style={{ backgroundColor: C.navy, borderBottom: `2px solid ${C.blue}` }}>
                  {['', 'Title & Org', 'Location', 'Category', 'Tags', 'Status', 'Actions'].map((h, i) => (
                    <th key={h + i} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontFamily: F.rounded, fontWeight: 700, fontSize: 10,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      color: 'rgba(255,255,255,0.5)', whiteSpace: 'nowrap',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <TableRow
                    key={row.id}
                    row={row}
                    prod={prod}
                    isLast={i === filtered.length - 1}
                    onEdit={() => openEdit(row)}
                    onDelete={() => setDeleteId(row.id)}
                    onToggleVisibility={() => toggleVisibility(row)}
                    onToggleFeatured={() => toggleFeatured(row)}
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
            position: 'relative', width: '100%', maxWidth: 840,
            maxHeight: '92vh', display: 'flex', flexDirection: 'column',
            background: C.surface, border: `1px solid ${C.border}`,
            borderRadius: 16, boxShadow: `0 24px 60px rgba(3,126,243,0.12), 0 8px 30px rgba(0,0,0,0.18)`,
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{ background: C.navy, display: 'flex', alignItems: 'stretch', borderBottom: `3px solid ${prod.color}`, flexShrink: 0 }}>
              {/* Traffic lights */}
              <div style={{ padding: '0 18px', display: 'flex', alignItems: 'center', gap: 7, borderRight: `1px solid rgba(255,255,255,0.1)` }}>
                {[C.brandRed, C.brandYellow, C.green].map((col, i) => (
                  <div key={i} style={{ width: 11, height: 11, borderRadius: '50%', backgroundColor: col, opacity: 0.85 }} />
                ))}
              </div>
              <div style={{ flex: 1, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 28, height: 28, backgroundColor: prod.color + '25', border: `1px solid ${prod.color}50`, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {React.createElement(prod.icon, { size: 14, color: prod.color })}
                </div>
                <span style={{ fontFamily: F.bara, color: C.white, fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                  {editRow ? 'Edit Opportunity' : 'New Opportunity'}
                </span>
                <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, color: prod.color, backgroundColor: prod.color + '20', borderRadius: 99, padding: '2px 10px', border: `1px solid ${prod.color}30` }}>
                  {prod.label}
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

            {/* Body: form left, preview right */}
            <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
              {/* Form side */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: `1px solid ${C.border}`, backgroundColor: C.white }}>
                {/* Tabs */}
                <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0, backgroundColor: C.surface }}>
                  {MODAL_TABS.map(t => {
                    const active = modalTab === t.id;
                    return (
                      <button key={t.id} onClick={() => setModalTab(t.id)}
                        style={{
                          flex: 1, padding: '12px 0',
                          fontFamily: F.rounded, fontWeight: 700, fontSize: 11, letterSpacing: '0.04em',
                          cursor: 'pointer', border: 'none',
                          borderBottom: active ? `2px solid ${prod.color}` : '2px solid transparent',
                          backgroundColor: active ? C.white : 'transparent',
                          color: active ? prod.color : C.textMuted, transition: 'all .15s',
                        }}>
                        {t.icon} {t.label}
                      </button>
                    );
                  })}
                </div>

                <form onSubmit={handleSave} style={{ flex: 1, overflow: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 15 }}>

                  {/* ── DETAILS TAB ── */}
                  {modalTab === 'details' && (<>
                    <div>
                      <FieldLabel required>Title</FieldLabel>
                      <ModernInput {...F_('title')} placeholder="e.g. Environmental Education Volunteer" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><FieldLabel required>Organization</FieldLabel><ModernInput {...F_('organization')} placeholder="e.g. DENR Community Outreach" /></div>
                      <div><FieldLabel>City</FieldLabel><ModernInput {...F_('city')} placeholder="e.g. Quezon City" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><FieldLabel>Region</FieldLabel><ModernInput {...F_('region')} placeholder="e.g. Metro Manila" /></div>
                      <div><FieldLabel>Country</FieldLabel><ModernInput {...F_('country')} placeholder="e.g. Philippines" /></div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div>
                        <FieldLabel required>Category</FieldLabel>
                        <ModernSelect {...F_('category')}>
                          <option value="">— Select —</option>
                          {prod.categories.map(c => <option key={c} value={c}>{c}</option>)}
                        </ModernSelect>
                      </div>
                      <div>
                        <FieldLabel required>Duration</FieldLabel>
                        <ModernSelect {...F_('duration')}>
                          <option value="">— Select —</option>
                          {prod.durations.map(d => <option key={d} value={d}>{d}</option>)}
                        </ModernSelect>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      <div><FieldLabel>Spots Left</FieldLabel><ModernInput {...F_('spots_left')} type="number" placeholder="e.g. 4" /></div>
                      <div><FieldLabel>Application Deadline</FieldLabel><ModernInput {...F_('application_deadline')} placeholder="e.g. Jan 31, 2026" /></div>
                    </div>
                    <div><FieldLabel>External Link / Apply URL</FieldLabel><ModernInput {...F_('external_link')} placeholder="https://aiesec.org/opportunity/…" /></div>
                    <div><FieldLabel>Tags (comma-separated)</FieldLabel><ModernInput {...F_('tags')} placeholder="e.g. Environment, Youth, SDG 13" /></div>
                    <div><FieldLabel>{prod.specificField.label}</FieldLabel><ModernInput {...F_(prod.specificField.key)} placeholder={prod.specificField.placeholder} /></div>
                    <div>
                      <FieldLabel>Internal Notes</FieldLabel>
                      {/* Notes uses editorial serif */}
                      <ModernTextarea {...F_('notes')} placeholder="Admin-only notes about this opportunity…" />
                      <p style={{ fontFamily: F.rounded, fontSize: 9, color: C.textMuted, margin: '4px 0 0', textAlign: 'right' }}>Admin-only · not shown publicly</p>
                    </div>
                  </>)}

                  {/* ── MEDIA TAB ── */}
                  {modalTab === 'media' && (
                    <ImageUploader
                      currentUrl={form.image_url}
                      onUploaded={url => setForm(p => ({ ...p, image_url: url }))}
                      prodColor={prod.color}
                    />
                  )}

                  {/* ── STYLE TAB ── */}
                  {modalTab === 'style' && (<>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'end' }}>
                      <div>
                        <FieldLabel>{prod.badgeField.label}</FieldLabel>
                        <ModernInput {...F_('badge_text')} placeholder={prod.badgeField.placeholder} />
                      </div>
                      <div>
                        <FieldLabel>Badge Color</FieldLabel>
                        <input
                          type="color" value={form.badge_color}
                          onChange={e => setForm(p => ({ ...p, badge_color: e.target.value }))}
                          style={{ width: 52, height: 40, border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', padding: 3, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Footer Label</FieldLabel>
                      <ModernInput {...F_('footer_label')} placeholder="e.g. Quezon City, NCR" />
                    </div>

                    {/* Visibility + Featured toggles */}
                    <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
                      {[
                        { key: 'is_visible',  label: 'Visible on site', icon: Eye,  onColor: C.green, onBg: C.greenLight },
                        { key: 'is_featured', label: 'Featured',        icon: Star, onColor: C.amber, onBg: C.amberLight },
                      ].map(({ key, label, icon: Icon, onColor, onBg }) => (
                        <button
                          key={key} type="button"
                          onClick={() => setForm(p => ({ ...p, [key]: !p[key] }))}
                          style={{
                            flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            gap: 8, fontFamily: F.rounded, fontWeight: 700, fontSize: 11,
                            padding: '10px 14px', border: `1px solid ${form[key] ? onColor : C.border}`,
                            borderRadius: 8, cursor: 'pointer',
                            background: form[key] ? onBg : C.surface,
                            color: form[key] ? onColor : C.textMuted,
                            boxShadow: form[key] ? `0 2px 8px ${onColor}30` : '0 1px 3px rgba(0,0,0,0.05)',
                            transition: 'all .15s',
                          }}
                        >
                          <Icon size={13} fill={form[key] && key === 'is_featured' ? onColor : 'none'} color={form[key] ? onColor : C.textMuted} />
                          {label}
                        </button>
                      ))}
                    </div>

                    {/* Style note — uses editorial serif */}
                    <div style={{ padding: '12px 14px', backgroundColor: C.blueLight, border: `1px solid ${C.blueMid}`, borderRadius: 8 }}>
                      <p style={{ fontFamily: F.desc, fontSize: 13, color: C.blue, margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>
                        Badge and footer label appear on the public-facing opportunity card. Keep them short and scannable.
                      </p>
                    </div>
                  </>)}

                  {/* Footer actions */}
                  <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 12, borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
                    <button type="button" onClick={() => setModalOpen(false)}
                      style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: C.white, color: C.textMid, display: 'flex', alignItems: 'center', gap: 6, transition: 'all .12s', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = C.surface}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = C.white}>
                      <X size={13} /> Cancel
                    </button>
                    <button type="submit" disabled={saving}
                      style={{ padding: '9px 22px', border: `1px solid ${prod.color}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 800, fontSize: 12, cursor: saving ? 'not-allowed' : 'pointer', backgroundColor: prod.color, color: 'white', display: 'flex', alignItems: 'center', gap: 6, boxShadow: `0 4px 14px ${prod.color}35`, opacity: saving ? 0.7 : 1, transition: 'filter .12s' }}
                      onMouseEnter={e => { if (!saving) e.currentTarget.style.filter = 'brightness(1.1)'; }}
                      onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                      {saving ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={13} />}
                      {saving ? 'Saving…' : editRow ? 'Save Changes' : 'Create Opportunity'}
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview side */}
              <div style={{
                width: 310, flexShrink: 0, display: 'flex', flexDirection: 'column',
                backgroundColor: C.surface,
                backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.07) 1px, transparent 1px)',
                backgroundSize: '18px 18px',
              }}>
                <div style={{ padding: '10px 16px', backgroundColor: C.white, borderBottom: `1px solid ${C.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: C.green }} />
                  <span style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: C.textMuted }}>Live Preview</span>
                </div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, overflow: 'auto' }}>
                  <OpportunityCardPreview form={form} prod={prod} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── DELETE CONFIRM ── */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,22,40,0.75)', backdropFilter: 'blur(6px)' }} onClick={() => setDeleteId(null)} />
          <div style={{
            position: 'relative', background: C.white,
            border: `1px solid ${C.border}`, borderRadius: 14,
            boxShadow: `0 20px 50px rgba(0,0,0,0.2), 0 0 0 1px ${C.border}`,
            padding: 32, maxWidth: 360, width: '100%', textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, backgroundColor: C.redLight, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 24 }}>🗑️</div>
            <p style={{ fontFamily: F.bara, fontSize: 16, textTransform: 'uppercase', letterSpacing: '0.08em', color: C.text, marginBottom: 8 }}>
              Delete Opportunity?
            </p>
            {/* Serif for the body copy */}
            <p style={{ fontFamily: F.desc, fontSize: 14, color: C.textMuted, marginBottom: 24, lineHeight: 1.6, fontStyle: 'italic' }}>
              This action cannot be undone. The opportunity will be permanently removed.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button onClick={() => setDeleteId(null)} style={{ padding: '9px 20px', border: `1px solid ${C.border}`, borderRadius: 8, fontFamily: F.rounded, fontWeight: 700, fontSize: 12, cursor: 'pointer', backgroundColor: C.white, color: C.textMid, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', transition: 'all .12s' }}
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

      {/* Load DM Serif Display from Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Table Row (extracted for clarity) ────────────────────────────────────────
function TableRow({ row, prod, isLast, onEdit, onDelete, onToggleVisibility, onToggleFeatured }) {
  const [hovered, setHovered] = useState(false);

  return (
    <tr
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderBottom: !isLast ? `1px solid ${C.border}` : 'none',
        backgroundColor: hovered ? C.surface : C.white,
        opacity: row.is_visible ? 1 : 0.55,
        transition: 'background .12s',
      }}
    >
      {/* Thumb */}
      <td style={{ padding: '10px 10px 10px 16px', width: 52 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 8,
          border: `1px solid ${C.border}`, overflow: 'hidden',
          backgroundColor: prod.lightBg, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {row.image_url
            ? <img src={row.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <Image size={16} color={prod.color} opacity={0.4} />
          }
        </div>
      </td>

      {/* Title + Org */}
      <td style={{ padding: '10px 14px', maxWidth: 240 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7 }}>
          {row.is_featured && (
            <span style={{
              backgroundColor: C.amberLight, border: `1px solid ${C.amber}`,
              borderRadius: 5, padding: '1px 6px', fontSize: 8,
              fontFamily: F.rounded, fontWeight: 800, color: C.amber,
              flexShrink: 0, marginTop: 2, textTransform: 'uppercase',
            }}>★ feat</span>
          )}
          <div>
            <div style={{ fontFamily: F.pipanganan, fontSize: 13, textTransform: 'uppercase', lineHeight: 1.15, color: C.text }}>{row.title}</div>
            {/* Organization — editorial serif */}
            <div style={{ fontFamily: F.desc, fontSize: 11, color: C.textMuted, marginTop: 2, fontStyle: 'italic' }}>{row.organization}</div>
          </div>
        </div>
      </td>

      {/* Location */}
      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
        <div style={{ fontFamily: F.rounded, fontWeight: 700, fontSize: 12, color: C.text }}>{row.city}</div>
        <div style={{ fontFamily: F.rounded, fontSize: 10, color: C.textMuted, marginTop: 2 }}>{row.duration}</div>
      </td>

      {/* Category */}
      <td style={{ padding: '10px 14px' }}>
        <span style={{
          backgroundColor: prod.color + '12', border: `1px solid ${prod.color}35`,
          color: prod.color, borderRadius: 99, padding: '3px 10px',
          fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap',
        }}>{row.category}</span>
      </td>

      {/* Tags */}
      <td style={{ padding: '10px 14px', maxWidth: 140 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {(Array.isArray(row.tags) ? row.tags : []).slice(0, 2).map(t => (
            <span key={t} style={{
              backgroundColor: C.surface, border: `1px solid ${C.border}`,
              borderRadius: 99, padding: '2px 8px',
              fontSize: 9, color: C.textMid, fontFamily: F.rounded, fontWeight: 600,
            }}>{t}</span>
          ))}
        </div>
      </td>

      {/* Status */}
      <td style={{ padding: '10px 14px', whiteSpace: 'nowrap' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          <button onClick={onToggleVisibility} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            backgroundColor: row.is_visible ? C.greenLight : C.redLight,
            border: `1px solid ${row.is_visible ? C.green : C.red}`,
            borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
            fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
            color: row.is_visible ? C.green : C.red, transition: 'all .12s',
          }}>
            {row.is_visible ? <Eye size={10} /> : <EyeOff size={10} />}
            {row.is_visible ? 'Live' : 'Hidden'}
          </button>
          <button onClick={onToggleFeatured} style={{
            display: 'flex', alignItems: 'center', gap: 5,
            backgroundColor: row.is_featured ? C.amberLight : C.surface,
            border: `1px solid ${row.is_featured ? C.amber : C.border}`,
            borderRadius: 6, padding: '3px 9px', cursor: 'pointer',
            fontSize: 9, fontFamily: F.rounded, fontWeight: 700,
            color: row.is_featured ? C.amber : C.textMuted, transition: 'all .12s',
          }}>
            <Star size={9} fill={row.is_featured ? C.amber : 'none'} color={row.is_featured ? C.amber : C.textMuted} />
            {row.is_featured ? 'Featured' : 'Normal'}
          </button>
        </div>
      </td>

      {/* Actions */}
      <td style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>
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