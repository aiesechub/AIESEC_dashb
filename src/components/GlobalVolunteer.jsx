// src/components/GlobalVolunteer.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, X, MapPin, Clock, Globe, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ProductNavbar, ProductCarousel, ProductFooter, InquiryForm,
  FilterPill, OpportunityCard,
} from './ProductPage';

const ACCENT   = '#EF3340';
const PROD_KEY = 'volunteer';

const ALL_OPPS = [
  {
    id: 1, featured: true,
    title: 'Environmental Education Volunteer',
    organization: 'DENR Community Outreach Program',
    tags: ['Environment', 'Education', 'SDG 13'],
    footerLabel: 'Quezon City',
    meta: [
      { icon: MapPin, label: 'Quezon City, PH' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Globe,  label: '4 spots left' },
    ],
    category: 'Environment', duration: '6 weeks',
    badgeText: 'SDG 13', badgeColor: '#00A651',
  },
  {
    id: 2, featured: false,
    title: 'Community Health & Wellness Advocate',
    organization: 'Tondo Health Foundation',
    tags: ['Health', 'Community', 'SDG 3'],
    footerLabel: 'Manila',
    meta: [
      { icon: MapPin, label: 'Tondo, Manila' },
      { icon: Clock,  label: '8 weeks' },
      { icon: Globe,  label: '3 spots left' },
    ],
    category: 'Health', duration: '8 weeks',
    badgeText: 'SDG 3', badgeColor: '#009BD6',
  },
  {
    id: 3, featured: true,
    title: 'Youth Leadership & Empowerment Facilitator',
    organization: 'Gawad Kalinga Youth',
    tags: ['Youth', 'Leadership', 'SDG 4'],
    footerLabel: 'Bulacan',
    meta: [
      { icon: MapPin, label: 'Bulacan, PH' },
      { icon: Clock,  label: '4 weeks' },
      { icon: Globe,  label: '6 spots left' },
    ],
    category: 'Education', duration: '4 weeks',
    badgeText: 'SDG 4', badgeColor: '#EF3340',
  },
  {
    id: 4, featured: false,
    title: 'Coastal & Marine Conservation Volunteer',
    organization: 'Save Philippine Seas',
    tags: ['Marine', 'Conservation', 'SDG 14'],
    footerLabel: 'Cebu',
    meta: [
      { icon: MapPin, label: 'Cebu City, PH' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Globe,  label: '5 spots left' },
    ],
    category: 'Environment', duration: '6 weeks',
    badgeText: 'SDG 14', badgeColor: '#009BD6',
  },
  {
    id: 5, featured: false,
    title: 'Digital Literacy Trainer for Rural Communities',
    organization: 'Ideaspace Foundation',
    tags: ['Technology', 'Digital', 'SDG 9'],
    footerLabel: 'Davao',
    meta: [
      { icon: MapPin, label: 'Davao City, PH' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Globe,  label: '4 spots left' },
    ],
    category: 'Technology', duration: '6 weeks',
    badgeText: 'SDG 9', badgeColor: '#F58220',
  },
  {
    id: 6, featured: false,
    title: 'Women Empowerment & Livelihood Mentor',
    organization: 'Kabalikat para sa Maunlad na Buhay',
    tags: ['Women', 'Livelihood', 'SDG 5'],
    footerLabel: 'Laguna',
    meta: [
      { icon: MapPin, label: 'Santa Rosa, Laguna' },
      { icon: Clock,  label: '8 weeks' },
      { icon: Globe,  label: '3 spots left' },
    ],
    category: 'Entrepreneurship', duration: '8 weeks',
    badgeText: 'SDG 5', badgeColor: '#7B2FF7',
  },
];

const CATEGORIES = ['All', 'Environment', 'Health', 'Education', 'Technology', 'Entrepreneurship'];
const DURATIONS  = ['Any Duration', '4 weeks', '6 weeks', '8 weeks'];
const REGIONS    = ['All Regions', 'Metro Manila', 'Cebu', 'Davao', 'Luzon', 'Visayas'];

export default function GlobalVolunteer() {
  const navigate = useNavigate();
  const [dir, setDir]          = useState('right');
  const [search, setSearch]    = useState('');
  const [cat, setCat]          = useState('All');
  const [dur, setDur]          = useState('Any Duration');
  const [region, setRegion]    = useState('All Regions');
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
      (dur === 'Any Duration' || o.duration === dur)
    );
  });

  return (
    <motion.div
      key="volunteer"
      initial={{ opacity: 0, x: dir === 'right' ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#FFFBEB] antialiased selection:bg-[#EF3340] selection:text-white"
    >
      <ProductNavbar accentColor={ACCENT} />

      {/* ── HERO ── */}
      <section
        className="relative pt-24 pb-14 overflow-hidden border-b-4 border-black"
        style={{ background: 'linear-gradient(135deg, #EF3340 0%, #c41a23 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
        <div className="absolute bottom-0 left-0 w-full h-1.5"
          style={{ background: 'linear-gradient(to right, #FFD100, #EF3340, #00A651, #009BD6)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">

            {/* Left — copy */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 border-2 border-white/40 px-4 py-1.5 rounded-full mb-5">
                <Heart size={12} className="text-white fill-white" />
                <span className="font-barabara text-white text-xs uppercase tracking-widest">AIESEC in the Philippines · Global Volunteer</span>
              </div>
              <h1 className="font-barabara text-5xl md:text-6xl font-black text-white uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
                Make Your <br /><span className="text-[#FFD100]">Mark</span> in<br />the Philippines.
              </h1>
              <p className="mt-5 text-white/85 text-sm md:text-base font-semibold max-w-lg leading-relaxed">
                Come volunteer in the Philippines. Solve real problems, live the spirit of{' '}
                <span className="text-[#FFD100] font-black">Bayanihan</span>, and go home changed.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['4–8 Weeks', 'Metro Manila · Cebu · Davao', 'NGO-Backed', 'All Nationalities Welcome'].map(t => (
                  <span key={t} className="text-xs font-black uppercase px-3 py-1.5 bg-white text-[#EF3340] border-2 border-black rounded-full" style={{ boxShadow: '2px 2px 0 #000' }}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right — carousel */}
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
                <input type="text" placeholder="Search by role, city, or keyword…" value={search}
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
                    <p className="font-barabara text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Region</p>
                    <div className="flex flex-wrap gap-2">{REGIONS.map(r => <FilterPill key={r} label={r} active={region === r} onClick={() => setRegion(r)} color={ACCENT} />)}</div>
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
          {(cat !== 'All' || search || dur !== 'Any Duration') && (
            <button onClick={() => { setCat('All'); setSearch(''); setDur('Any Duration'); setRegion('All Regions'); }}
              className="text-xs font-bold underline underline-offset-2 hover:text-black" style={{ color: ACCENT }}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🌏</p>
            <p className="font-barabara text-2xl uppercase text-gray-400">No opportunities found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp, i) => <OpportunityCard key={opp.id} opp={opp} index={i} accentColor={ACCENT} />)}
          </div>
        )}
      </section>

      <InquiryForm accentColor={ACCENT} productLabel="Global Volunteer" />
      <ProductFooter />
    </motion.div>
  );
}