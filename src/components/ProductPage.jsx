// src/components/ProductPage.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu, X, Heart, Mail, MapPin, Facebook, Instagram, Linkedin,
  Search, SlidersHorizontal, ChevronDown, ExternalLink, Loader2,
  ChevronLeft, ChevronRight, Send,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

import aiesecWhiteLogo from '../assets/logos/aiesec-white-logo.png';
import aiesecLogo      from '../assets/logos/AIESEC-white.png';
import volLogo         from '../assets/logos/global-volunteer.png';
import talentLogo      from '../assets/logos/global-talent.png';
import teachLogo       from '../assets/logos/global-teacher.png';

// ── PRODUCTS ──────────────────────────────────────────────────────────────────
export const PRODUCTS = [
  { key: 'volunteer', path: '/global-volunteer', label: 'Global Volunteer', color: '#EF3340', lightBg: '#FFF0F1', logo: volLogo,    count: 6 },
  { key: 'talent',    path: '/global-talent',    label: 'Global Talent',    color: '#009BD6', lightBg: '#E0F4FB', logo: talentLogo, count: 6 },
  { key: 'teacher',   path: '/global-teacher',   label: 'Global Teacher',   color: '#F58220', lightBg: '#FFF8E1', logo: teachLogo,  count: 6 },
];

// ── NAVBAR — no product tabs, just logo + nav links ───────────────────────────
export const ProductNavbar = ({ accentColor = '#037ef3' }) => {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navLinks = ['Why Philippines', 'Our Products', 'Testimonials'];
  const tilts    = ['-rotate-2', 'rotate-1', '-rotate-1'];
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleNavClick = (item) => {
    if (item === 'Our Products') {
      navigate('/');
      setTimeout(() => {
        document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' });
      }, 120);
    }
    setIsOpen(false);
  };

  return (
    <nav
      className="fixed w-full px-6 py-4"
      style={{
        zIndex: 9999,
        background: scrolled
          ? 'rgba(255,251,235,0.97)'
          : 'rgba(255,251,235,0.97)',
        borderBottom: scrolled ? '3px solid #000' : '3px solid transparent',
        backdropFilter: 'blur(8px)',
        transition: 'border-color 0.35s ease',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Logo */}
        <a href="/" style={{ textDecoration: 'none' }} className="shrink-0">
          <motion.div
            className="relative"
            initial={{ rotate: -3 }}
            whileHover={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black rounded-lg" />
            <div className="relative bg-[#037ef3] px-4 py-2 rounded-lg border-2 border-black">
              <img src={aiesecWhiteLogo} alt="AIESEC in the Philippines" className="h-9 w-auto object-contain" />
            </div>
          </motion.div>
        </a>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Nav links — desktop */}
        <div className="hidden md:flex items-center gap-3">
          {navLinks.map((item, i) => (
            <button key={item} onClick={() => handleNavClick(item)} className="relative group">
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-md" />
              <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-[#FFD100] rounded-md border border-black" />
              <div className={`relative bg-white border-2 border-black px-3 py-1 rounded-md ${tilts[i]} group-hover:rotate-0 transition-transform duration-200`}>
                <span className="font-barabara text-[11px] text-black uppercase tracking-wide group-hover:text-[#037ef3] transition-colors duration-200">
                  {item}
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Hamburger — mobile */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 border-2 border-black bg-white rounded-md">
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#FFFBEB] border-b-4 border-black p-4 space-y-2">
          {navLinks.map(item => (
            <div key={item} onClick={() => handleNavClick(item)}
              className="font-barabara text-black border border-black/10 bg-white p-3 text-center uppercase tracking-widest text-xs rounded-md cursor-pointer hover:bg-[#FFD100] transition-colors">
              {item}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

// ── PRODUCT CAROUSEL ──────────────────────────────────────────────────────────
// Renders the product logo card with left/right arrows that cycle through
// all three products. Clicking arrows navigates to the next/prev page.
export const ProductCarousel = ({ currentKey, onNavigate }) => {
  const idx  = PRODUCTS.findIndex(p => p.key === currentKey);
  const prev = PRODUCTS[(idx - 1 + PRODUCTS.length) % PRODUCTS.length];
  const next = PRODUCTS[(idx + 1) % PRODUCTS.length];
  const cur  = PRODUCTS[idx];

  return (
    <div className="flex items-center gap-4 justify-center md:justify-start">

      {/* ← Prev arrow */}
      <button
        onClick={() => onNavigate(prev.path, 'left')}
        aria-label={`Go to ${prev.label}`}
        className="relative group shrink-0"
      >
        <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-2xl" />
        <div
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl border-3 border-black flex flex-col items-center justify-center gap-1 transition-transform group-hover:translate-x-[2px] group-hover:translate-y-[2px]"
          style={{ border: '3px solid black', backgroundColor: prev.color }}
        >
          <ChevronLeft size={20} className="text-white" strokeWidth={3} />
          <span className="font-barabara text-[8px] text-white/90 uppercase tracking-wide leading-none text-center px-1 hidden sm:block">
            {prev.label.split(' ')[1]}
          </span>
        </div>
      </button>

      {/* Centre card — the current product's logo card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={cur.key}
          initial={{ opacity: 0, scale: 0.88, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.88, y: -8 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative shrink-0"
        >
          {/* brutalist shadow */}
          <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black rounded-3xl" />
          <div
            className="relative bg-white border-4 border-black rounded-3xl px-8 py-6 text-center"
            style={{ minWidth: '200px' }}
          >
            <img src={cur.logo} alt={cur.label} className="h-20 mx-auto object-contain drop-shadow-sm" />
            <p className="font-barabara text-xs uppercase tracking-widest mt-3" style={{ color: cur.color }}>
              {cur.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5 font-semibold">{cur.count} openings · Philippines</p>

            {/* dot indicators */}
            <div className="flex justify-center gap-1.5 mt-3">
              {PRODUCTS.map((p, i) => (
                <button
                  key={p.key}
                  onClick={() => i !== idx && onNavigate(p.path, i > idx ? 'right' : 'left')}
                  className="rounded-full border-2 border-black transition-all duration-200"
                  style={{
                    width:  i === idx ? 20 : 8,
                    height: 8,
                    backgroundColor: i === idx ? cur.color : '#ddd',
                  }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* → Next arrow */}
      <button
        onClick={() => onNavigate(next.path, 'right')}
        aria-label={`Go to ${next.label}`}
        className="relative group shrink-0"
      >
        <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-2xl" />
        <div
          className="relative w-14 h-14 md:w-16 md:h-16 rounded-2xl border-3 border-black flex flex-col items-center justify-center gap-1 transition-transform group-hover:translate-x-[2px] group-hover:translate-y-[2px]"
          style={{ border: '3px solid black', backgroundColor: next.color }}
        >
          <ChevronRight size={20} className="text-white" strokeWidth={3} />
          <span className="font-barabara text-[8px] text-white/90 uppercase tracking-wide leading-none text-center px-1 hidden sm:block">
            {next.label.split(' ')[1]}
          </span>
        </div>
      </button>
    </div>
  );
};

// ── FILTER PILL ───────────────────────────────────────────────────────────────
export const FilterPill = ({ label, active, onClick, color }) => (
  <button onClick={onClick} className="relative group shrink-0">
    {!active && <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-black rounded-full" />}
    <div
      className="relative px-4 py-1.5 rounded-full border-2 border-black font-barabara text-xs uppercase tracking-wide transition-all duration-150"
      style={{
        backgroundColor: active ? color : 'white',
        color:           active ? 'white' : '#111',
        transform:       active ? 'translate(2px,2px)' : undefined,
      }}
    >
      {label}
    </div>
  </button>
);

// ── OPPORTUNITY CARD ──────────────────────────────────────────────────────────
export const OpportunityCard = ({ opp, index, accentColor, badge }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.35 }}
    className="relative group flex flex-col"
  >
    {opp.featured && (
      <div
        className="absolute -top-2 -right-2 z-10 bg-[#FFD100] text-black font-black text-[9px] uppercase tracking-widest px-2 py-0.5 border-2 border-black rotate-2"
        style={{ boxShadow: '1px 1px 0 #000' }}
      >
        ★ Featured
      </div>
    )}
    <div className="absolute inset-0 bg-black translate-x-[5px] translate-y-[5px] rounded-2xl" />
    <div className="relative bg-white border-4 border-black rounded-2xl p-5 flex flex-col gap-3 h-full transition-transform duration-200 group-hover:-translate-y-1">

      {/* Title then org + badge on separate row — badge is shrink-0 so it never inflates */}
      <div className="flex flex-col gap-1.5">
        <h3 className="font-barabara text-base uppercase leading-snug text-black">{opp.title}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-xs text-gray-500 font-semibold flex-1 min-w-0 truncate">{opp.organization}</p>
          <span
            className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full border-2 border-black text-white shrink-0"
            style={{ backgroundColor: opp.badgeColor, boxShadow: '1px 1px 0 #000' }}
          >
            {opp.badgeText}
          </span>
        </div>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-2">
        {opp.meta.map((m, i) => (
          <span key={i} className="flex items-center gap-1 text-[11px] font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2.5 py-0.5">
            {m.icon && <m.icon size={10} className="shrink-0" style={{ color: accentColor }} />}
            {m.label}
          </span>
        ))}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5">
        {opp.tags.map(t => (
          <span
            key={t}
            className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border-2"
            style={{ backgroundColor: accentColor + '18', borderColor: accentColor + '60', color: accentColor }}
          >
            {t}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-3 border-t-2 border-dashed border-gray-200">
        <span className="text-[11px] text-gray-400 font-semibold">{opp.footerLabel}</span>
        <button className="relative group/btn">
          <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-lg" />
          <div
            className="relative text-white font-barabara text-xs uppercase tracking-wide px-4 py-1.5 rounded-lg border-2 border-black flex items-center gap-1.5 transition-transform group-hover/btn:translate-x-[1px] group-hover/btn:translate-y-[1px]"
            style={{ backgroundColor: accentColor }}
          >
            Apply Now <ExternalLink size={11} />
          </div>
        </button>
      </div>
    </div>
  </motion.div>
);

// ── INQUIRY FORM ──────────────────────────────────────────────────────────────
export const InquiryForm = ({ accentColor, productLabel }) => {
  const [form,   setForm]   = useState({ name: '', email: '', country: '', message: '' });
  const [status, setStatus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    await new Promise(r => setTimeout(r, 1500));
    setStatus('sent');
  };

  const Field = ({ label, name, type = 'text', placeholder, textarea }) => (
    <div className="flex flex-col gap-1.5">
      <label className="font-barabara text-[10px] uppercase tracking-widest text-gray-500">{label}</label>
      <div className="relative">
        <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-xl" />
        {textarea ? (
          <textarea
            rows={4} name={name} placeholder={placeholder} value={form[name]}
            onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
            className="relative w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none placeholder-gray-300 resize-none"
            style={{ border: '3px solid black' }}
          />
        ) : (
          <input
            type={type} name={name} placeholder={placeholder} value={form[name]}
            onChange={e => setForm(p => ({ ...p, [name]: e.target.value }))}
            className="relative w-full bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none placeholder-gray-300"
            style={{ border: '3px solid black' }}
          />
        )}
      </div>
    </div>
  );

  return (
    <section className="relative overflow-hidden border-t-4 border-black" style={{ background: '#FFFBEB' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.05) 1.5px, transparent 1.5px)', backgroundSize: '22px 22px' }} />
      <div className="absolute top-0 left-0 w-full h-1.5 pointer-events-none"
        style={{ background: `linear-gradient(to right, ${accentColor}, #FFD100, #00A651, #009BD6)` }} />

      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* Left — copy */}
          <div>
            <div className="inline-block mb-5">
              <div className="bg-[#FFD100] text-black font-barabara text-xs px-4 py-1.5 uppercase tracking-widest rounded-full"
                style={{ border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
                ✉️ Get in Touch
              </div>
            </div>
            <h2 className="font-barabara text-4xl md:text-5xl font-black uppercase leading-none mb-4">
              Interested in <br />
              <span style={{ color: accentColor }}>{productLabel}?</span>
            </h2>
            <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
              Have questions about opportunities in the Philippines? Drop us a message — our team at <strong>AIESEC in the Philippines</strong> will get back to you within 48 hours. 🇵🇭
            </p>
            <div className="mt-8 space-y-3">
              {[{ icon: Mail, label: 'hello@aiesecph.org' }, { icon: MapPin, label: 'Metro Manila, Philippines' }].map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-black rounded-md" />
                    <div className="relative w-8 h-8 border-2 border-black rounded-md flex items-center justify-center" style={{ backgroundColor: accentColor }}>
                      <Icon size={14} className="text-white" />
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-gray-700">{label}</span>
                </div>
              ))}
            </div>
            <div className="mt-10 inline-block relative rotate-[-4deg]">
              <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black rounded-2xl" />
              <div className="relative px-6 py-4 rounded-2xl border-4 border-black" style={{ backgroundColor: accentColor }}>
                <p className="font-barabara text-white text-sm uppercase tracking-widest">Mabuhay! 🌺</p>
                <p className="font-barabara text-white/80 text-xs uppercase tracking-widest mt-0.5">We'd love to hear from you</p>
              </div>
            </div>
          </div>

          {/* Right — form */}
          <div className="relative">
            <div className="absolute inset-0 translate-x-[6px] translate-y-[6px] bg-black rounded-2xl" />
            <div className="relative bg-white border-4 border-black rounded-2xl p-7">
              <div className="absolute -top-3 left-8 w-14 h-5 rotate-[-3deg] border-2 border-black rounded-sm" style={{ backgroundColor: accentColor + 'cc' }} />
              <div className="absolute -top-3 left-24 w-9 h-5 rotate-[2deg] bg-[#FFD100] border-2 border-black rounded-sm" />

              {status === 'sent' ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-10 text-center gap-4">
                  <div className="text-5xl">🎉</div>
                  <h3 className="font-barabara text-2xl uppercase">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">We'll get back to you within 48 hours. Salamat!</p>
                  <button onClick={() => { setStatus(null); setForm({ name: '', email: '', country: '', message: '' }); }} className="relative group mt-2">
                    <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-lg" />
                    <div className="relative px-6 py-2 border-2 border-black rounded-lg font-barabara text-xs uppercase tracking-wide text-white transition-transform group-hover:translate-x-[1px] group-hover:translate-y-[1px]"
                      style={{ backgroundColor: accentColor }}>Send Another</div>
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Your Name"      name="name"    placeholder="Juan dela Cruz" />
                    <Field label="Email Address"  name="email"   type="email" placeholder="you@email.com" />
                  </div>
                  <Field label="Country / Nationality" name="country" placeholder="e.g. Japan, Germany…" />
                  <Field label="Your Message" name="message" placeholder={`Tell us about your interest in ${productLabel}…`} textarea />
                  <button type="submit" disabled={status === 'sending'} className="relative group mt-1">
                    <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-xl" />
                    <div className="relative w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-black font-barabara uppercase tracking-widest text-sm text-white transition-transform group-hover:translate-x-[2px] group-hover:translate-y-[2px]"
                      style={{ backgroundColor: status === 'sending' ? '#aaa' : accentColor }}>
                      {status === 'sending' ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : <><Send size={14} /> Send Inquiry</>}
                    </div>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center">
                    Sent to <span className="font-bold">hello@aiesecph.org</span> · AIESEC in the Philippines
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// ── FOOTER ────────────────────────────────────────────────────────────────────
export const ProductFooter = () => (
  <div className="flex flex-col relative font-sans">
    <div className="h-3 w-full" style={{ background: 'linear-gradient(to right, #EF3340, #FFD100, #00A651, #037ef3)' }} />
    <footer className="bg-white border-t-4 border-black relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, rgba(3,126,243,0.06) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        <div className="grid md:grid-cols-[1fr_auto] gap-10 items-start">
          <div className="space-y-5">
            <div className="inline-block relative">
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-lg" />
              <div className="relative bg-[#037ef3] px-4 py-2.5 rounded-lg border-2 border-black">
                <img src={aiesecLogo} alt="AIESEC in the Philippines" className="h-7 w-auto" />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 max-w-xl">
              AIESEC is a non-governmental not-for-profit organisation in consultative status with ECOSOC, affiliated with the UN DPI, member of ICMYO, and recognised by UNESCO. We are <strong>AIESEC in the Philippines</strong> — a youth leadership movement driven by one cause: peace and fulfillment of humankind's potential.
            </p>
            <div className="flex flex-wrap gap-3">
              {[{ Icon: Mail, text: 'hello@aiesecph.org' }, { Icon: MapPin, text: 'Metro Manila, Philippines' }].map(({ Icon, text }, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 group cursor-pointer">
                  <div className="w-6 h-6 rounded-md border-2 border-black flex items-center justify-center flex-shrink-0" style={{ background: '#037ef3', boxShadow: '2px 2px 0px #000' }}>
                    <Icon size={12} className="text-white" />
                  </div>
                  <span className="group-hover:text-[#037ef3] transition-colors">{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-6 min-w-[180px]">
            <div>
              <div className="inline-block relative mb-3">
                <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-[#037ef3] rounded" style={{ border: '2px solid black' }} />
                <div className="relative bg-black px-3 py-1 rounded" style={{ border: '2px solid black' }}>
                  <p className="font-barabara text-xs uppercase tracking-[0.2em] text-[#FFD100]">Tara? Let's Connect!</p>
                </div>
              </div>
              <div className="flex gap-2">
                {[
                  { Icon: Facebook, href: 'https://www.facebook.com/aiesecphl',           label: 'Facebook'  },
                  { Icon: Instagram, href: 'https://www.instagram.com/aiesec.ph/',         label: 'Instagram' },
                  { Icon: Linkedin,  href: 'https://www.linkedin.com/company/aiesecphl/',  label: 'LinkedIn'  },
                ].map(({ Icon, href, label }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="relative group transition-transform hover:-translate-y-1">
                    <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] bg-black rounded-lg" />
                    <div className="relative w-10 h-10 bg-[#037ef3] border-2 border-black rounded-lg flex items-center justify-center">
                      <Icon size={18} className="text-white" strokeWidth={2} />
                    </div>
                  </a>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              {[{ label: 'Privacy Notice', href: '#' }, { label: 'Cookie Policy', href: '#' }, { label: 'Terms of Service', href: '#' }].map(({ label, href }) => (
                <a key={label} href={href} className="flex items-center gap-2 text-xs text-gray-400 hover:text-[#037ef3] transition-colors group">
                  <span className="w-1 h-1 rounded-full bg-[#037ef3] group-hover:bg-[#EF3340] transition-colors flex-shrink-0" />
                  {label}
                </a>
              ))}
              <p className="text-[10px] text-gray-300 pt-1 leading-relaxed">Protected by reCAPTCHA. Google's Privacy Policy applies.</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-5 border-t-2 border-black flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex gap-1.5 items-center">
            {['#EF3340', '#FFD100', '#00A651', '#037ef3', '#F58220'].map(c => (
              <div key={c} className="w-4 h-4 rounded-sm border border-black" style={{ background: c, boxShadow: '1px 1px 0px #000' }} />
            ))}
          </div>
          <p className="flex items-center gap-2 text-xs text-gray-400 flex-wrap justify-center">
            <span className="text-black text-xs font-bold">© 2026 AIESEC in the Philippines.</span>
            <span className="hidden md:inline text-gray-200">|</span>
            <span>Maraming Salamat! Made with <Heart size={11} className="inline text-[#EF3340] fill-current mx-0.5" /> and plenty of rice. 🍚</span>
          </p>
        </div>
      </div>
    </footer>
  </div>
);