// src/components/GlobalTalent.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, X, MapPin, Clock, TrendingUp, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ProductNavbar, ProductCarousel, ProductFooter, InquiryForm,
  FilterPill, OpportunityCard,
} from './ProductPage';

const ACCENT   = '#009BD6';
const PROD_KEY = 'talent';

const ALL_OPPS = [
  {
    id: 1, featured: true,
    title: 'UX/UI Design Intern',
    organization: 'Kumu Philippines',
    tags: ['Design', 'Tech', 'Figma'],
    footerLabel: 'Entry Level',
    meta: [
      { icon: MapPin,    label: 'BGC, Taguig' },
      { icon: Clock,     label: '3 months' },
      { icon: TrendingUp, label: 'Entry Level' },
    ],
    category: 'Design', duration: '3 months',
    badgeText: 'Paid', badgeColor: '#00A651',
  },
  {
    id: 2, featured: false,
    title: 'Digital Marketing & Growth Intern',
    organization: 'Sprout Solutions',
    tags: ['Marketing', 'Analytics', 'SEO'],
    footerLabel: 'Mid Level',
    meta: [
      { icon: MapPin,    label: 'Makati City' },
      { icon: Clock,     label: '6 months' },
      { icon: TrendingUp, label: 'Mid Level' },
    ],
    category: 'Marketing', duration: '6 months',
    badgeText: 'Paid', badgeColor: '#00A651',
  },
  {
    id: 3, featured: false,
    title: 'Software Engineering Trainee',
    organization: 'Exist Software Labs',
    tags: ['React', 'Node.js', 'Backend'],
    footerLabel: 'Entry Level',
    meta: [
      { icon: MapPin,    label: 'Pasig City' },
      { icon: Clock,     label: '3 months' },
      { icon: TrendingUp, label: 'Entry Level' },
    ],
    category: 'Technology', duration: '3 months',
    badgeText: 'Stipend', badgeColor: '#F58220',
  },
  {
    id: 4, featured: true,
    title: 'Business Development Associate',
    organization: 'Investagrams',
    tags: ['Sales', 'Strategy', 'Fintech'],
    footerLabel: 'Mid Level',
    meta: [
      { icon: MapPin,    label: 'Ortigas, Pasig' },
      { icon: Clock,     label: '4 months' },
      { icon: TrendingUp, label: 'Mid Level' },
    ],
    category: 'Business', duration: '4 months',
    badgeText: 'Paid', badgeColor: '#00A651',
  },
  {
    id: 5, featured: false,
    title: 'Data Analytics Intern',
    organization: 'Accenture Philippines',
    tags: ['Python', 'SQL', 'Data'],
    footerLabel: 'Entry Level',
    meta: [
      { icon: MapPin,    label: 'Taguig City' },
      { icon: Clock,     label: '3 months' },
      { icon: TrendingUp, label: 'Entry Level' },
    ],
    category: 'Technology', duration: '3 months',
    badgeText: 'Paid', badgeColor: '#00A651',
  },
  {
    id: 6, featured: false,
    title: 'HR & Talent Acquisition Intern',
    organization: 'First Circle',
    tags: ['HR', 'People', 'Recruitment'],
    footerLabel: 'Entry Level',
    meta: [
      { icon: MapPin,    label: 'Mandaluyong' },
      { icon: Clock,     label: '6 months' },
      { icon: TrendingUp, label: 'Entry Level' },
    ],
    category: 'Human Resources', duration: '6 months',
    badgeText: 'Unpaid', badgeColor: '#888',
  },
];

const CATEGORIES = ['All', 'Design', 'Marketing', 'Technology', 'Business', 'Human Resources'];
const DURATIONS  = ['Any Duration', '3 months', '4 months', '6 months'];
const LEVELS     = ['Any Level', 'Entry Level', 'Mid Level'];

export default function GlobalTalent() {
  const navigate = useNavigate();
  const [dir, setDir]          = useState('right');
  const [search, setSearch]    = useState('');
  const [cat, setCat]          = useState('All');
  const [dur, setDur]          = useState('Any Duration');
  const [level, setLevel]      = useState('Any Level');
  const [showFilters, setShow] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  const handleNav = (path, direction) => {
    setDir(direction);
    setTimeout(() => navigate(path), 10);
  };

  const filtered = ALL_OPPS.filter(o => {
    const q = search.toLowerCase();
    return (
      (o.title.toLowerCase().includes(q) || o.organization.toLowerCase().includes(q) || o.tags.some(t => t.toLowerCase().includes(q))) &&
      (cat === 'All' || o.category === cat) &&
      (dur === 'Any Duration' || o.duration === dur) &&
      (level === 'Any Level' || o.footerLabel === level)
    );
  });

  return (
    <motion.div
      key="talent"
      initial={{ opacity: 0, x: dir === 'right' ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#FFFBEB] antialiased selection:bg-[#009BD6] selection:text-white"
    >
      <ProductNavbar accentColor={ACCENT} />

      {/* ── HERO ── */}
      <section
        className="relative pt-24 pb-14 overflow-hidden border-b-4 border-black"
        style={{ background: 'linear-gradient(135deg, #009BD6 0%, #006fa3 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
        <div className="absolute bottom-0 left-0 w-full h-1.5"
          style={{ background: 'linear-gradient(to right, #EF3340, #FFD100, #00A651, #009BD6)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 border-2 border-white/40 px-4 py-1.5 rounded-full mb-5">
                <Briefcase size={12} className="text-white" />
                <span className="font-barabara text-white text-xs uppercase tracking-widest">AIESEC in the Philippines · Global Talent</span>
              </div>
              <h1 className="font-barabara text-5xl md:text-6xl font-black text-white uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
                Launch Your Career <br />in the <span className="text-[#FFD100]">Philippines.</span>
              </h1>
              <p className="mt-5 text-white/85 text-sm md:text-base font-semibold max-w-lg leading-relaxed">
                Intern at top Philippine companies. Bring your skills, experience real{' '}
                <span className="text-[#FFD100] font-black">diskarte</span>, and build a career with global impact.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['3–6 Months', 'BGC · Makati · Ortigas', 'Paid & Stipend Roles', 'All Nationalities Welcome'].map(t => (
                  <span key={t} className="text-xs font-black uppercase px-3 py-1.5 bg-white text-[#009BD6] border-2 border-black rounded-full" style={{ boxShadow: '2px 2px 0 #000' }}>{t}</span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <ProductCarousel currentKey={PROD_KEY} onNavigate={handleNav} />
            </div>
          </div>
        </div>
      </section>

      {/* ── SEARCH + FILTERS ── */}
      <section className="sticky top-0 z-50 bg-[#FFFBEB] py-3 px-6" style={{ borderBottom: '3px solid #000' }}>
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1">
              <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-xl" />
              <div className="relative flex items-center bg-white rounded-xl overflow-hidden" style={{ border: '3px solid black' }}>
                <Search size={16} className="ml-4 text-gray-400 shrink-0" />
                <input type="text" placeholder="Search by role, company, or skill…" value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm font-semibold bg-transparent outline-none placeholder-gray-400" />
                {search && <button onClick={() => setSearch('')} className="mr-3 text-gray-400 hover:text-black"><X size={14} /></button>}
              </div>
            </div>
            <button onClick={() => setShow(!showFilters)} className="relative group shrink-0">
              <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-xl" />
              <div className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-barabara text-xs uppercase tracking-wide"
                style={{ border: '3px solid black', backgroundColor: showFilters ? ACCENT : 'white', color: showFilters ? 'white' : '#111' }}>
                <SlidersHorizontal size={14} />
                Filters
                <ChevronDown size={12} style={{ transform: showFilters ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }} />
              </div>
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-0.5">
            {CATEGORIES.map(c => <FilterPill key={c} label={c} active={cat === c} onClick={() => setCat(c)} color={ACCENT} />)}
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-4 pt-1 pb-1">
                  <div>
                    <p className="font-barabara text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Duration</p>
                    <div className="flex flex-wrap gap-2">{DURATIONS.map(d => <FilterPill key={d} label={d} active={dur === d} onClick={() => setDur(d)} color={ACCENT} />)}</div>
                  </div>
                  <div>
                    <p className="font-barabara text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Level</p>
                    <div className="flex flex-wrap gap-2">{LEVELS.map(l => <FilterPill key={l} label={l} active={level === l} onClick={() => setLevel(l)} color={ACCENT} />)}</div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ── RESULTS ── */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6">
          <p className="font-barabara text-sm uppercase tracking-widest text-gray-500">
            <span className="text-black">{filtered.length}</span> opportunit{filtered.length !== 1 ? 'ies' : 'y'} in the Philippines
          </p>
          {(cat !== 'All' || search || dur !== 'Any Duration' || level !== 'Any Level') && (
            <button onClick={() => { setCat('All'); setSearch(''); setDur('Any Duration'); setLevel('Any Level'); }}
              className="text-xs font-bold underline underline-offset-2 hover:text-black" style={{ color: ACCENT }}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">💼</p>
            <p className="font-barabara text-2xl uppercase text-gray-400">No opportunities found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp, i) => <OpportunityCard key={opp.id} opp={opp} index={i} accentColor={ACCENT} />)}
          </div>
        )}
      </section>

      <InquiryForm accentColor={ACCENT} productLabel="Global Talent" />
      <ProductFooter />
    </motion.div>
  );
}