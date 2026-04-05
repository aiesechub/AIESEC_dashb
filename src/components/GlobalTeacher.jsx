// src/components/GlobalTeacher.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown, X, MapPin, Clock, Users, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ProductNavbar, ProductCarousel, ProductFooter, InquiryForm,
  FilterPill, OpportunityCard,
} from './ProductPage';

const ACCENT   = '#F58220';
const PROD_KEY = 'teacher';

const ALL_OPPS = [
  {
    id: 1, featured: true,
    title: 'English Language Teacher',
    organization: 'Ateneo de Manila University Outreach',
    tags: ['English', 'ESL', 'SDG 4'],
    footerLabel: 'Kids (6–12)',
    meta: [
      { icon: MapPin, label: 'Quezon City' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Users,  label: 'Kids 6–12' },
    ],
    category: 'English', duration: '6 weeks',
    badgeText: '🏠 Housing', badgeColor: '#F58220',
  },
  {
    id: 2, featured: false,
    title: 'STEM & Science Education Volunteer',
    organization: 'Department of Education – NCR',
    tags: ['STEM', 'Science', 'Math'],
    footerLabel: 'Teens (13–17)',
    meta: [
      { icon: MapPin, label: 'Manila City' },
      { icon: Clock,  label: '8 weeks' },
      { icon: Users,  label: 'Teens 13–17' },
    ],
    category: 'STEM', duration: '8 weeks',
    badgeText: 'Self-arranged', badgeColor: '#888',
  },
  {
    id: 3, featured: false,
    title: 'Early Childhood Development Educator',
    organization: 'Childhope Philippines Foundation',
    tags: ['ECD', 'Nursery', 'Care'],
    footerLabel: 'Kids (3–6)',
    meta: [
      { icon: MapPin, label: 'Cavite City' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Users,  label: 'Kids 3–6' },
    ],
    category: 'Early Childhood', duration: '6 weeks',
    badgeText: '🏠 Housing', badgeColor: '#F58220',
  },
  {
    id: 4, featured: true,
    title: 'Digital Skills & ICT Coach',
    organization: 'Cebu IT Park Learning Hub',
    tags: ['Technology', 'Digital', 'ICT'],
    footerLabel: 'Teens (13–17)',
    meta: [
      { icon: MapPin, label: 'Cebu City' },
      { icon: Clock,  label: '4 weeks' },
      { icon: Users,  label: 'Teens 13–17' },
    ],
    category: 'Technology', duration: '4 weeks',
    badgeText: 'Self-arranged', badgeColor: '#888',
  },
  {
    id: 5, featured: false,
    title: 'Creative Arts & Cultural Exchange Facilitator',
    organization: 'National Commission for Culture & Arts',
    tags: ['Arts', 'Culture', 'Creative'],
    footerLabel: 'Kids & Teens',
    meta: [
      { icon: MapPin, label: 'Intramuros, Manila' },
      { icon: Clock,  label: '6 weeks' },
      { icon: Users,  label: 'Mixed Age' },
    ],
    category: 'Arts', duration: '6 weeks',
    badgeText: '🏠 Housing', badgeColor: '#F58220',
  },
  {
    id: 6, featured: false,
    title: 'Sports & Physical Education Mentor',
    organization: 'Philippine Sports Commission Barangay Program',
    tags: ['Sports', 'Health', 'PE'],
    footerLabel: 'Teens (13–17)',
    meta: [
      { icon: MapPin, label: 'Davao City' },
      { icon: Clock,  label: '8 weeks' },
      { icon: Users,  label: 'Teens 13–17' },
    ],
    category: 'Physical Education', duration: '8 weeks',
    badgeText: 'Self-arranged', badgeColor: '#888',
  },
];

const SUBJECTS   = ['All', 'English', 'STEM', 'Arts', 'Technology', 'Early Childhood', 'Physical Education'];
const DURATIONS  = ['Any Duration', '4 weeks', '6 weeks', '8 weeks'];
const AGE_GROUPS = ['All Ages', 'Kids (3–6)', 'Kids (6–12)', 'Teens (13–17)', 'Mixed Age'];

export default function GlobalTeacher() {
  const navigate = useNavigate();
  const [dir, setDir]          = useState('left');
  const [search, setSearch]    = useState('');
  const [subj, setSubj]        = useState('All');
  const [dur, setDur]          = useState('Any Duration');
  const [age, setAge]          = useState('All Ages');
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
      (subj === 'All' || o.category === subj) &&
      (dur === 'Any Duration' || o.duration === dur) &&
      (age === 'All Ages' || o.footerLabel === age)
    );
  });

  return (
    <motion.div
      key="teacher"
      initial={{ opacity: 0, x: dir === 'right' ? 60 : -60 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="min-h-screen bg-[#FFFBEB] antialiased selection:bg-[#F58220] selection:text-white"
    >
      <ProductNavbar accentColor={ACCENT} />

      {/* ── HERO ── */}
      <section
        className="relative pt-24 pb-14 overflow-hidden border-b-4 border-black"
        style={{ background: 'linear-gradient(135deg, #F58220 0%, #c4611a 100%)' }}
      >
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.10) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
        <div className="absolute bottom-0 left-0 w-full h-1.5"
          style={{ background: 'linear-gradient(to right, #EF3340, #FFD100, #00A651, #009BD6)' }} />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-10">

            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-white/20 border-2 border-white/40 px-4 py-1.5 rounded-full mb-5">
                <BookOpen size={12} className="text-white" />
                <span className="font-barabara text-white text-xs uppercase tracking-widest">AIESEC in the Philippines · Global Teacher</span>
              </div>
              <h1 className="font-barabara text-5xl md:text-6xl font-black text-white uppercase leading-none drop-shadow-[4px_4px_0px_rgba(0,0,0,0.25)]">
                Teach & Inspire <br />in the <span className="text-[#FFD100]">Philippines.</span>
              </h1>
              <p className="mt-5 text-white/85 text-sm md:text-base font-semibold max-w-lg leading-relaxed">
                Step into Filipino classrooms. Share your knowledge and embrace the spirit of{' '}
                <span className="text-[#FFD100] font-black">Pag-aaruga</span> — nurturing the next generation.
              </p>
              <div className="flex flex-wrap gap-2 mt-5">
                {['4–8 Weeks', 'Manila · Cebu · Davao', 'No Prior Experience Needed', 'All Nationalities Welcome'].map(t => (
                  <span key={t} className="text-xs font-black uppercase px-3 py-1.5 bg-white text-[#F58220] border-2 border-black rounded-full" style={{ boxShadow: '2px 2px 0 #000' }}>{t}</span>
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
                <input type="text" placeholder="Search by subject, school, or city…" value={search}
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
            {SUBJECTS.map(s => <FilterPill key={s} label={s} active={subj === s} onClick={() => setSubj(s)} color={ACCENT} />)}
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
                    <p className="font-barabara text-[10px] uppercase tracking-widest text-gray-400 mb-1.5">Age Group</p>
                    <div className="flex flex-wrap gap-2">{AGE_GROUPS.map(a => <FilterPill key={a} label={a} active={age === a} onClick={() => setAge(a)} color={ACCENT} />)}</div>
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
          {(subj !== 'All' || search || dur !== 'Any Duration' || age !== 'All Ages') && (
            <button onClick={() => { setSubj('All'); setSearch(''); setDur('Any Duration'); setAge('All Ages'); }}
              className="text-xs font-bold underline underline-offset-2 hover:text-black" style={{ color: ACCENT }}>
              Clear filters
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📚</p>
            <p className="font-barabara text-2xl uppercase text-gray-400">No opportunities found</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((opp, i) => <OpportunityCard key={opp.id} opp={opp} index={i} accentColor={ACCENT} />)}
          </div>
        )}
      </section>

      <InquiryForm accentColor={ACCENT} productLabel="Global Teacher" />
      <ProductFooter />
    </motion.div>
  );
}