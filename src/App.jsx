import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, Menu, X, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Users, Zap, Star } from 'lucide-react';

// Asset imports
import aiesecWhiteLogo from './assets/logos/aiesec-white-logo.png';
import volLogo from './assets/logos/global-volunteer.png';
import talentLogo from './assets/logos/global-talent.png';
import teachLogo from './assets/logos/global-teacher.png';
import aiesecLogo from './assets/logos/AIESEC-white.png';
import banderitas from './assets/graphics/banderitas-nobg.png';

// Parallax hero layers
import mayonSky from './assets/images/homeBg/mayon_sky.png';
import mabuhayText from './assets/images/homeBg/mabuhay.png';
import mayonCone from './assets/images/homeBg/mayon_cone.png';
import pilipinasText from './assets/images/homeBg/pilipinas.png';
import mayonLake from './assets/images/homeBg/mayon_lake.png';
import blueSmoke from './assets/images/homeBg/blue_smoke.png';

import EventsFeature from './components/EventsFeature';

const colors = {
  indigo: 'rgb(49, 39, 131)',
  red: '#EF3340',
  green: '#00A651',
  yellow: '#FFD100',
  blue: '#009BD6',
  orange: '#F58220',
  cream: '#FFFBEB',
};

// --- COMPONENTS ---

// Shared intro state — Hero controls timing, Navbar reads it
const useIntroSequence = () => {
  const [phase, setPhase] = useState(0);
  // phase 0 = nothing visible
  // phase 1 = sky in (t=0)
  // phase 2 = cone + lake in (t=800ms)
  // phase 3 = smoke in (t=1400ms)
  // phase 4 = text in (t=1800ms)
  // phase 5 = navbar in (t=2400ms)
  useEffect(() => {
    const timings = [0, 800, 1400, 1800, 2400];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setPhase(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return phase;
};

// Context so Navbar can read the phase without prop drilling
const IntroContext = React.createContext(0);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const phase = React.useContext(IntroContext);
  const navLinks = ['Why Philippines', 'Our Products', 'Testimonials'];
  const tilts = ['-rotate-2', 'rotate-1', '-rotate-1'];

  useEffect(() => {
    const handleScroll = () => {
      const breakEl = document.getElementById('next-section');
      if (breakEl) {
        const breakTop = breakEl.getBoundingClientRect().top + window.scrollY;
        setScrolled(window.scrollY >= breakTop);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Navbar only appears at phase 5
  const navVisible = phase >= 5;

  return (
    <nav
      className="fixed w-full px-6 py-5"
      style={{
        zIndex: 9999,
        // Gradient fades in on scroll past Break — smooth CSS transition
        background: scrolled
          ? 'linear-gradient(to bottom, rgba(255,251,235,1) 0%, rgba(255,251,235,0.6) 50%, transparent 100%)'
          : 'transparent',
        transition: 'background 0.7s ease, opacity 0.8s ease, transform 0.8s cubic-bezier(0.22,1,0.36,1)',
        opacity: navVisible ? 1 : 0,
        transform: navVisible ? 'translateY(0)' : 'translateY(-18px)',
        pointerEvents: navVisible ? 'auto' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center">

        {/* Logo — blue brutalist box tilts, img stays upright */}
        <div className="cursor-pointer mr-auto relative">
          <motion.div
            className="relative"
            initial={{ rotate: -3 }}
            whileHover={{ rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black rounded-lg" />
            <div className="relative bg-[#037ef3] px-4 py-2 rounded-lg border-2 border-black">
              <motion.img
                src={aiesecWhiteLogo}
                alt="AIESEC PH"
                className="h-10 w-auto object-contain"
                initial={{ rotate: 3 }}
                whileHover={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              />
            </div>
          </motion.div>
        </div>

        {/* Desktop nav links — each in a brutalist tilted box */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {navLinks.map((item, i) => (
            <a key={item} href="#" className="relative group">
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-md" />
              <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-[#FFD100] rounded-md border border-black" />
              <div
                className={`relative bg-white border-2 border-black px-3 py-1 rounded-md ${tilts[i]} group-hover:rotate-0 transition-transform duration-200`}
              >
                <span className="font-barabara text-xs text-black uppercase tracking-wide group-hover:text-[#037ef3] transition-colors duration-200">
                  {item}
                </span>
              </div>
            </a>
          ))}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 border border-white/40 bg-white/10 rounded-md backdrop-blur-sm"
        >
          {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/80 backdrop-blur-md border-b border-white/20 p-4 space-y-3">
          {navLinks.map((item) => (
            <div
              key={item}
              className="font-barabara text-white border border-white/20 bg-white/10 p-3 text-center uppercase tracking-widest text-lg"
              style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = ({ phase }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const heroRef = useRef(null);
  const rafRef = useRef(null);
  const targetPos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      currentPos.current.x = lerp(currentPos.current.x, targetPos.current.x, 0.06);
      currentPos.current.y = lerp(currentPos.current.y, targetPos.current.y, 0.06);
      setMousePos({ x: currentPos.current.x, y: currentPos.current.y });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    targetPos.current = {
      x: ((e.clientX - rect.left) / rect.width - 0.5) * 2,
      y: ((e.clientY - rect.top) / rect.height - 0.5) * 2,
    };
  };

  // Normal layers: move OPPOSITE to cursor
  const layer = (depth) => ({
    transform: `translate(${mousePos.x * depth * -1}px, ${mousePos.y * depth * -1}px) scale(1.15)`,
    willChange: 'transform',
  });

  // Text layers: move WITH cursor
  const layerFollow = (depth) => ({
    transform: `translate(${mousePos.x * depth}px, ${mousePos.y * depth}px) scale(1.15)`,
    willChange: 'transform',
  });

  return (
    <section
      ref={heroRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen overflow-hidden flex items-end justify-center"
    >
      {/* Layer 0 — Sky */}
      <div
        className="absolute inset-0 z-0"
        style={{
          ...layer(3),
          opacity: phase >= 1 ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <img src={mayonSky} alt="" className="w-full h-full object-cover" />
      </div>

      {/* Layer 1 — "mabuhay" — FOLLOWS cursor */}
      <div
        className="absolute inset-0 z-10 flex items-start justify-center"
        style={{
          ...layer(60),
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <img
          src={mabuhayText}
          alt="mabuhay"
          className="w-full max-w-6xl object-contain"
          style={{ marginTop: '4%', marginRight: '30%' }}
        />
      </div>

      {/* Layer 2 — Mayon volcano cone — opposite */}
      <div
        className="absolute inset-0 z-20 flex items-end justify-center"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0px)' : 'translateY(60px)',
          transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{ ...layer(16), width: '100%' }}>
          <img src={mayonCone} alt="Mayon Volcano" className="w-full object-contain object-bottom" />
        </div>
      </div>

      {/* Layer 3 — "PILIPINAS" — FOLLOWS cursor */}
      <div
        className="absolute inset-0 z-30 flex items-start justify-center"
        style={{
          ...layerFollow(50),
          opacity: phase >= 4 ? 1 : 0,
          transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1) 0.15s',
        }}
      >
        <img
          src={pilipinasText}
          alt="Pilipinas"
          className="w-full object-contain"
          style={{ marginTop: '-3%', width: '110%', maxWidth: '100vw' }}
        />
      </div>

      {/* Layer 3.5 — Blue smoke — opposite */}
      <div
        className="absolute inset-0 z-35 pointer-events-none"
        style={{
          ...layer(19),
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 1.2s ease',
        }}
      >
        <img src={blueSmoke} alt="" className="w-full h-full object-cover" style={{ marginTop: '-3%' }} />
      </div>

      {/* Layer 4 — Lake pinned to bottom — opposite */}
      {/* Wrapper handles intro fade+slide; inner div drives mouse parallax with no transition */}
      <div
        className="absolute bottom-0 left-0 w-full z-40"
        style={{
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0px)' : 'translateY(80px)',
          transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.1s',
          transformOrigin: 'bottom center',
        }}
      >
        <div
          style={{
            transform: `translateX(${mousePos.x * 37 * -1}px) translateY(${mousePos.y * 10 * -1}px) scale(1.15)`,
            willChange: 'transform',
            transformOrigin: 'bottom center',
          }}
        >
          <img src={mayonLake} alt="" className="w-full block" />
        </div>
      </div>

      {/* Smooth bottom fade — blends lake edge into cream background */}
      <div
        className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{
          zIndex: 55,
          height: '220px',
          background: 'linear-gradient(to bottom, transparent 0%, rgba(255,251,235,0.55) 50%, rgba(255,251,235,1) 100%)',
        }}
      />

      {/* CTA chevron — appears with text at phase 4 */}
      <div
        className="relative mb-10 text-center"
        style={{
          zIndex: 75,
          opacity: phase >= 4 ? 1 : 0,
          transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s',
        }}
      >
        <motion.div
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }}
          className="cursor-pointer inline-block relative"
          onClick={() => document.getElementById('next-section')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-md" />
          <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-[#FFD100] rounded-md border border-black" />
          <div className="relative bg-white border-2 border-black rounded-md px-3 py-2">
            <svg
              width="16"
              height="10"
              viewBox="0 0 16 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1 L8 9 L15 1"
                stroke="black"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const InfoSections = () => {
  return (
    <div className="font-sans text-gray-900">

      <section className="py-24 relative overflow-hidden border-b-4 border-black bg-orange-100">
        <div
          className="absolute top-0 left-0 w-full h-62 opacity-100 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${banderitas})`,
            backgroundRepeat: 'repeat-x',
            backgroundPosition: 'top center',
            backgroundSize: 'auto 100%'
          }}
        />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div className="space-y-8">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-yellow-400 translate-x-2 translate-y-2 border-2 border-black rounded-sm"></div>
                <div className="relative bg-black text-white px-6 py-2 border-2 border-black rounded-sm">
                  <h2 className="font-barabara text-4xl md:text-5xl font-black tracking-tighter">
                    WHAT IS <span className="text-yellow-400">AIESEC?</span>
                  </h2>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border-2 border-black p-6 rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-red-500/80 rotate-1"></div>
                <p className="text-lg md:text-xl leading-relaxed font-medium">
                  We are <span className="font-bold text-blue-600">AIESEC in the Philippines</span>.
                  Since 1968, we've been the "training ground" for young Filipino leaders.
                </p>
                <p className="mt-4 text-gray-600">
                  Think of us as your global <span className="italic font-bold text-red-500">Barkada</span>.
                  We don't just send people abroad; we build bridges. We connect the warmth of Filipino
                  hospitality with the diversity of the world, creating leaders who are globally minded
                  but <span className="font-bold">proudly Pinoy at heart.</span>
                </p>
              </div>
            </div>

            <div className="relative h-[400px] w-full flex items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="absolute w-64 h-80 bg-blue-500 rounded-2xl border-4 border-black shadow-[12px_12px_0px_#000] rotate-[-6deg] z-10 overflow-hidden"
              >
                <img className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300" src="/api/placeholder/400/320" alt="Member 1" />
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.05, rotate: -2 }}
                className="absolute w-64 h-80 bg-yellow-400 rounded-2xl border-4 border-black shadow-[12px_12px_0px_#000] rotate-[6deg] z-20 translate-x-12 translate-y-8 overflow-hidden"
              >
                <img className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300" src="/api/placeholder/400/320" alt="Member 2" />
                <div className="absolute bottom-4 right-4 bg-red-600 text-white font-black text-xs px-2 py-1 rotate-[-12deg] border border-white shadow-sm">SINCE 1968</div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-[#009BD6] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="font-barabara text-5xl md:text-7xl font-black text-white uppercase drop-shadow-[4px_4px_0px_#000]">
              Why Go <span className="text-yellow-400 underline decoration-wavy decoration-4 underline-offset-8">Global</span>?
            </h2>
            <p className="mt-6 text-xl text-white font-medium max-w-2xl mx-auto bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              Placeholder
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card title="THE EXPERIENCE" filipinoTrait="Diskarte" description="Step out of your comfort zone. Learn to navigate new cities, cultures, and challenges with pure Filipino resourcefulness." icon={Globe} accentColor="bg-[#E7354C]" rotate="-rotate-2" />
            <Card title="THE GROWTH" filipinoTrait="Tibay ng Loob" description="Resilience is in our DNA. Develop leadership skills that stick by solving real-world problems in a foreign environment." icon={Zap} accentColor="bg-[#F0822B]" rotate="rotate-2" />
            <Card title="THE FAMILY" filipinoTrait="Pakikisama" description="Make friends from 100+ countries. You won't just be a tourist; you'll be part of a global barkada that lasts a lifetime." icon={Users} accentColor="bg-[#FCB634]" rotate="-rotate-1" />
          </div>
        </div>
      </section>
    </div>
  );
};

const Card = ({ title, filipinoTrait, description, icon: Icon, accentColor, rotate }) => {
  return (
    <motion.div whileHover={{ y: -10, scale: 1.02 }} className={`relative group h-full ${rotate}`}>
      <div className={`absolute inset-0 ${accentColor} rounded-2xl translate-x-3 translate-y-3 border-4 border-black`}></div>
      <div className="relative bg-white h-full rounded-2xl border-4 border-black p-8 flex flex-col items-center text-center">
        <div className={`w-20 h-20 ${accentColor} rounded-full border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]`}>
          <Icon size={32} className="text-black" strokeWidth={2.5} />
        </div>
        <h3 className="text-3xl font-black uppercase mb-1">{title}</h3>
        <p className="text-sm font-bold uppercase tracking-widest mb-4 px-3 py-1 bg-black text-white rounded-full">Trait: {filipinoTrait}</p>
        <p className="text-gray-700 font-medium leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
};

// Break component — high z-index so it overlaps sections cleanly
const Break = () => {
  const squares = Array.from({ length: 28 }, (_, i) => i + 1);
  return (
    <div id="next-section" className="w-full flex relative" style={{ zIndex: 70 }}>
      {squares.map((num) => (
        <img key={num} src={`/break/${num}.svg`} alt="" className="flex-1 w-0 h-auto object-cover" />
      ))}
    </div>
  );
};

const JeepneyMarquee = () => {
  const [selectedRoute, setSelectedRoute] = useState(null);

  const routes = [
    { text: "UST ESPAÑA", est: "1611", address: "España Blvd, Sampaloc, Manila" },
    { text: "DLSU TAFT", est: "1911", address: "2401 Taft Ave, Malate, Manila" },
    { text: "ADMU KATIPUNAN", est: "1859", address: "Katipunan Ave, Quezon City" },
    { text: "UA&P PASIG", est: "1967", address: "Pearl Drive, Ortigas, Pasig" },
    { text: "UP LOS BAÑOS", est: "1909", address: "Pedro R. Sandoval Ave, Los Baños" },
    { text: "UP DILIMAN", est: "1949", address: "Diliman, Quezon City" },
    { text: "UP CLARK", est: "1979", address: "Clark Freeport Zone, Pampanga" },
    { text: "UP MANILA", est: "1908", address: "Ermita, Manila" },
    { text: "DLSU CSB", est: "1988", address: "2544 Taft Avenue, Malate, Manila" }
  ];

  return (
    <section className="relative z-30 font-bold">
      <div className="bg-[#1a1a1a] border-y-4 border-yellow-400 py-6 px-4 relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
          <div className="flex items-center gap-4 group">
            <div className="bg-[#009BD6] p-3 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform">
              <MapPin size={32} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-cubao text-5xl text-white leading-none tracking-wide drop-shadow-[2px_2px_0px_#000]">9 <span className="text-[#009BD6]">Local Committee</span></h3>
              <p className="text-gray-400 text-sm tracking-widest uppercase">Local Chapters Nationwide</p>
            </div>
          </div>
          <div className="hidden md:block w-1 h-16 bg-white/20 rotate-12"></div>
          <div className="flex items-center gap-4 group">
            <div className="bg-[#F58220] p-3 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform rotate-6 group-hover:rotate-0 transition-transform">
              <Users size={32} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-cubao text-5xl text-white leading-none tracking-wide drop-shadow-[2px_2px_0px_#000]">400+ <span className="text-[#F58220]">Members</span></h3>
              <p className="text-gray-400 text-sm tracking-widest uppercase">Active Members & Alumni</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white py-6 overflow-hidden border-b-4 border-black relative z-10">
        <motion.div
          className="flex whitespace-nowrap gap-6 pl-6"
          animate={{ x: [0, -1000] }}
          style={{ animationPlayState: selectedRoute ? 'paused' : 'running' }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...routes, ...routes, ...routes].map((route, i) => {
            const parts = route.text.split(' ');
            const topLine = parts[0];
            const bottomLine = parts.slice(1).join(' ');
            const uniqueId = `route-${i}`;
            return (
              <motion.div
                layoutId={uniqueId}
                key={i}
                onClick={() => setSelectedRoute({ ...route, id: uniqueId })}
                className="bg-black border-4 border-white/20 hover:border-white/60 px-6 py-4 flex flex-col items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.1)] min-w-[200px] shrink-0 rounded-md transform transition-all hover:scale-105 cursor-pointer group"
              >
                <span className="font-cubao text-5xl leading-[0.85] tracking-wide text-[#FFD100] block text-center drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">{topLine}</span>
                <span className="font-cubao text-4xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-1">{bottomLine}</span>
                <span className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-sans">Press route for info</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 perspective-[1000px]">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedRoute(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" />
            <motion.div layoutId={selectedRoute.id} className="w-full max-w-md aspect-[4/3] relative z-10" transition={{ duration: 0.5, ease: "easeInOut" }}>
              <motion.div initial={{ rotateY: 0 }} animate={{ rotateY: 180 }} exit={{ rotateY: 0 }} transition={{ duration: 0.6, delay: 0.2 }} className="w-full h-full relative [transform-style:preserve-3d]">
                <div className="absolute inset-0 bg-black border-4 border-white/40 flex flex-col items-center justify-center rounded-xl shadow-2xl [backface-visibility:hidden]">
                  <span className="font-cubao text-7xl md:text-8xl leading-[0.85] tracking-wide text-[#FFD100] block text-center">{selectedRoute.text.split(' ')[0]}</span>
                  <span className="font-cubao text-5xl md:text-6xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-2">{selectedRoute.text.split(' ').slice(1).join(' ')}</span>
                </div>
                <div className="absolute inset-0 bg-[#222] border-4 border-[#FFD100] flex flex-col items-center justify-center rounded-xl shadow-2xl p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <div className="absolute top-4 right-4">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoute(null); }} className="text-white hover:text-yellow-400 transition-colors"><X size={24} /></button>
                  </div>
                  <h3 className="font-cubao text-3xl text-white mb-6 tracking-wider">DESTINATION INFO</h3>
                  <div className="space-y-6 w-full">
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <span className="block text-xs text-gray-400 uppercase tracking-widest font-sans mb-1">Established</span>
                      <span className="font-cubao text-3xl text-[#FFD100]">{selectedRoute.est}</span>
                    </div>
                    <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                      <span className="block text-xs text-gray-400 uppercase tracking-widest font-sans mb-1">Address</span>
                      <span className="font-sans font-bold text-xl text-white">{selectedRoute.address}</span>
                    </div>
                  </div>
                  <p className="mt-6 text-gray-500 text-xs uppercase tracking-widest">AIESEC in the Philippines</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

const Programs = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #312783 2px, transparent 2.5px)', backgroundSize: '16px 16px' }}></div>
      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-pipanganan text-6xl md:text-7xl text-black tracking-wider uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">CHOOSE YOUR <span className="text-[#FFD100]">ADVENTURE</span></h2>
          <p className="text-xl mt-4 max-w-2xl mx-auto text-gray-600">Find the product that matches your vibe.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
            <div className="h-full bg-[#FFF0F1] border-4 border-[#EF3340] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#EF3340] flex flex-col items-center text-center">
              <div className="h-24 mb-6 flex items-center justify-center"><img src={volLogo} alt="Global Volunteer" className="h-full object-contain drop-shadow-sm" /></div>
              <h3 className="font-pipanganan text-3xl text-[#EF3340] mb-2 uppercase leading-none">The Spirit of <br /> Bayanihan</h3>
              <p className="text-gray-700 mb-8 flex-grow">Experience the Filipino culture of communal unity. Volunteer to help communities lift each other up.</p>
              <button className="w-full bg-[#EF3340] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#EF3340] hover:bg-white hover:text-[#EF3340] transition-all shadow-md">Start Volunteering</button>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
            <div className="h-full bg-[#E0F4FB] border-4 border-[#52BCC6] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#52BCC6] flex flex-col items-center text-center">
              <div className="h-24 mb-6 flex items-center justify-center"><img src={talentLogo} alt="Global Talent" className="h-full object-contain drop-shadow-sm" /></div>
              <h3 className="font-pipanganan text-3xl text-[#52BCC6] mb-2 uppercase leading-none">Innovate with <br /> Diskarte</h3>
              <p className="text-gray-700 mb-8 flex-grow">Showcase your Filipino resourcefulness in a global professional setting.</p>
              <button className="w-full bg-[#52BCC6] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#52BCC6] hover:bg-white hover:text-[#009BD6] transition-all shadow-md">Find Opportunities</button>
            </div>
          </motion.div>
          <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
            <div className="h-full bg-[#FFF8E1] border-4 border-[#F58220] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#F58220] flex flex-col items-center text-center">
              <div className="h-24 mb-6 flex items-center justify-center"><img src={teachLogo} alt="Global Teacher" className="h-full object-contain drop-shadow-sm" /></div>
              <h3 className="font-pipanganan text-3xl text-[#F58220] mb-2 uppercase leading-none">Nurture with <br /> Pag-aaruga</h3>
              <p className="text-gray-700 mb-8 flex-grow">Embody the Filipino trait of nurturing care and foster growth in classrooms abroad.</p>
              <button className="w-full bg-[#F58220] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#F58220] hover:bg-white hover:text-[#F58220] transition-all shadow-md">Start Teaching</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <div className="flex flex-col relative">
    <div className="h-4 w-full bg-[linear-gradient(to_right,#EF3340,#FFD100,#00A651,#009BD6)]"></div>
    <footer className="bg-[#312783] text-white py-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        <div className="space-y-6 text-sm opacity-90">
          <img src={aiesecLogo} alt="AIESEC Logo" className="h-8 w-auto mb-4" />
          <p className="leading-relaxed text-indigo-100">AIESEC is a non-governmental not-for-profit organisation in consultative status with the United Nations Economic and Social Council (ECOSOC), affiliated with the UN DPI, member of ICMYO, and is recognised by UNESCO. AIESEC International is registered as a Foundation (Stichting), RSIN #807103895 in Rotterdam, The Netherlands.</p>
          <p className="leading-relaxed text-indigo-100">We are AIESEC in the Philippines, a youth leadership movement that is passionately driven by one cause: peace and fulfillment of humankind's potential. We are registered in the official bodies of the Philippines as a non-stock, non-profit organization.</p>
        </div>
        <div className="space-y-8">
          <div>
            <h3 className="font-barabara text-3xl tracking-wide text-[#FFD100] mb-6 uppercase">Tara, Let's Connect!</h3>
            <div className="flex gap-5">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="bg-white/10 p-3 rounded-full hover:bg-[#FFD100] hover:text-[#312783] transition-all transform hover:-translate-y-1"><Icon size={24} /></a>
              ))}
            </div>
          </div>
          <div className="space-y-4 text-base text-indigo-50">
            <div className="flex items-center gap-3 group cursor-pointer"><Mail className="text-[#FFD100]" size={20} /><span className="group-hover:text-white transition-colors">hello@aiesecph.org</span></div>
            <div className="flex items-start gap-3 group cursor-pointer"><MapPin className="text-[#FFD100] shrink-0 mt-1" size={20} /><span className="group-hover:text-white transition-colors">Unit 201, Example Building, Metro Manila, Philippines.</span></div>
          </div>
          <div className="text-xs text-indigo-300 space-y-4 pt-6 border-t border-indigo-700/50">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Privacy Notice</a>
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Cookie Policy</a>
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Terms of Service</a>
            </div>
            <p>This site is protected by reCAPTCHA and Google's Privacy Policy applies.</p>
          </div>
        </div>
      </div>
    </footer>
    <div className="bg-[#1a144f] text-indigo-200 py-4 text-center text-sm px-4">
      <p className="flex items-center justify-center gap-2 flex-wrap">
        <span>© 2026 AIESEC Philippines.</span>
        <span className="hidden md:inline">|</span>
        <span>Maraming Salamat! Made with <Heart size={14} className="inline text-[#EF3340] fill-current" /> and plenty of rice. 🍚</span>
      </p>
    </div>
  </div>
);

export default function App() {
  const phase = useIntroSequence();
  return (
    <IntroContext.Provider value={phase}>
      <div className="antialiased text-gray-900 bg-[#FFFBEB] overflow-x-hidden selection:bg-[#FFD100] selection:text-black">
      <Navbar />
      <Hero phase={phase} />
      <Break />
      <InfoSections />
      <JeepneyMarquee />
      <EventsFeature />
      <Programs />
      <Footer />
    </div>
    </IntroContext.Provider>
  );
}