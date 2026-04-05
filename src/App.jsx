import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Globe, Menu, X, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Users, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

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

import upperLeft  from './assets/images/globalBg/upper_left.png';
import upperRight from './assets/images/globalBg/upper_right.png';
import bottomLeft  from './assets/images/globalBg/bottom_left.png';
import bottomRight from './assets/images/globalBg/bottom_right.png';

import EventsFeature from './components/EventsFeature';
import aiesecCommunityPhoto from './assets/images/eventPhotos/IMG_8872.jpg';

// GlobalVolunteer, GlobalTalent, GlobalTeacher are imported directly in main.jsx

// ─── HOOKS ────────────────────────────────────────────────────────────────────

const useIntroSequence = () => {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    const timings = [0, 800, 1400, 1800, 2400];
    const timers = timings.map((delay, i) =>
      setTimeout(() => setPhase(i + 1), delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);
  return phase;
};

const IntroContext = React.createContext(0);

// ─── NAVBAR ───────────────────────────────────────────────────────────────────

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

  const navVisible = phase >= 5;

  const handleNavClick = (item) => {
    if (item === 'Our Products') {
      const el = document.getElementById('programs-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  return (
    <nav
      className="fixed w-full px-6 py-5"
      style={{
        zIndex: 9999,
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
        {/* Use plain <a> for logo — avoids any Router edge-case at the top of the tree */}
        <a href="/" className="cursor-pointer mr-auto relative" style={{ textDecoration: 'none' }}>
          <motion.div className="relative" initial={{ rotate: -3 }} whileHover={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
            <div className="absolute inset-0 translate-x-[5px] translate-y-[5px] bg-black rounded-lg" />
            <div className="relative bg-[#037ef3] px-4 py-2 rounded-lg border-2 border-black">
              <motion.img src={aiesecWhiteLogo} alt="AIESEC PH" className="h-10 w-auto object-contain"
                initial={{ rotate: 3 }} whileHover={{ rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} />
            </div>
          </motion.div>
        </a>

        <div className="hidden md:flex items-center gap-6 ml-auto">
          {navLinks.map((item, i) => (
            <button key={item} onClick={() => handleNavClick(item)} className="relative group">
              <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-md" />
              <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-[#FFD100] rounded-md border border-black" />
              <div className={`relative bg-white border-2 border-black px-3 py-1 rounded-md ${tilts[i]} group-hover:rotate-0 transition-transform duration-200`}>
                <span className="font-barabara text-xs text-black uppercase tracking-wide group-hover:text-[#037ef3] transition-colors duration-200">
                  {item}
                </span>
              </div>
            </button>
          ))}
        </div>

        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 border border-white/40 bg-white/10 rounded-md backdrop-blur-sm">
          {isOpen ? <X size={24} className="text-white" /> : <Menu size={24} className="text-white" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-black/80 backdrop-blur-md border-b border-white/20 p-4 space-y-3">
          {navLinks.map((item) => (
            <div key={item} onClick={() => handleNavClick(item)}
              className="font-barabara text-white border border-white/20 bg-white/10 p-3 text-center uppercase tracking-widest text-lg cursor-pointer"
              style={{ textShadow: '2px 2px 0px rgba(0,0,0,0.5)' }}>
              {item}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

// ─── HERO ─────────────────────────────────────────────────────────────────────

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

  const layer = (depth) => ({
    transform: `translate(${mousePos.x * depth * -1}px, ${mousePos.y * depth * -1}px) scale(1.15)`,
    willChange: 'transform',
  });

  const layerFollow = (depth) => ({
    transform: `translate(${mousePos.x * depth}px, ${mousePos.y * depth}px) scale(1.15)`,
    willChange: 'transform',
  });

  return (
    <section ref={heroRef} onMouseMove={handleMouseMove} className="relative min-h-screen overflow-hidden flex items-end justify-center">
      <div className="absolute inset-0 z-0" style={{ ...layer(68), opacity: phase >= 1 ? 1 : 0, transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1)' }}>
        <img src={mayonSky} alt="" className="w-full h-full object-cover" />
      </div>
      <div className="absolute inset-0 z-10 flex items-start justify-center"
        style={{ ...layer(90), opacity: phase >= 4 ? 1 : 0, transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1)' }}>
        <img src={mabuhayText} alt="mabuhay" className="w-full max-w-6xl object-contain" style={{ marginTop: '5%', marginRight: '40%', maxWidth: '30vw' }} />
      </div>
      <div className="absolute inset-0 z-20 flex items-end justify-center"
        style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0px)' : 'translateY(60px)', transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1), transform 1.3s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ ...layer(58), width: '100%' }}>
          <img src={mayonCone} alt="Mayon Volcano" className="w-full object-contain object-bottom" />
        </div>
      </div>
      <div className="absolute inset-0 z-30 flex items-start justify-center"
        style={{ ...layerFollow(70), opacity: phase >= 4 ? 1 : 0, transition: 'opacity 1s cubic-bezier(0.22,1,0.36,1) 0.15s' }}>
        <img src={pilipinasText} alt="Pilipinas" className="w-full object-contain" style={{ marginTop: '11%', width: '110%', maxWidth: '73vw' }} />
      </div>
      <div className="absolute inset-0 z-35 pointer-events-none"
        style={{ ...layer(19), opacity: phase >= 3 ? 1 : 0, transition: 'opacity 1.2s ease' }}>
        <img src={blueSmoke} alt="" className="w-full h-full object-cover" style={{ marginTop: '-3%' }} />
      </div>
      <div className="absolute bottom-0 left-0 w-full z-40"
        style={{ opacity: phase >= 2 ? 1 : 0, transform: phase >= 2 ? 'translateY(0px)' : 'translateY(80px)', transition: 'opacity 1.1s cubic-bezier(0.22,1,0.36,1) 0.1s, transform 1.3s cubic-bezier(0.22,1,0.36,1) 0.1s', transformOrigin: 'bottom center' }}>
        <div style={{ transform: `translateX(${mousePos.x * 67 * -1}px) translateY(${mousePos.y * 10 * -1}px) scale(1.15)`, willChange: 'transform', transformOrigin: 'bottom center' }}>
          <img src={mayonLake} alt="" className="w-full block" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 55, height: '220px', background: 'linear-gradient(to bottom, transparent 0%, rgba(255,251,235,0.55) 50%, rgba(255,251,235,1) 100%)' }} />
      <div className="relative mb-10 text-center"
        style={{ zIndex: 75, opacity: phase >= 4 ? 1 : 0, transform: phase >= 4 ? 'translateY(0)' : 'translateY(12px)', transition: 'opacity 0.8s ease 0.3s, transform 0.8s cubic-bezier(0.22,1,0.36,1) 0.3s' }}>
        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          whileHover={{ y: -5, transition: { duration: 0.2 } }} className="cursor-pointer inline-block relative"
          onClick={() => document.getElementById('next-section')?.scrollIntoView({ behavior: 'smooth' })}>
          <div className="absolute inset-0 translate-x-[4px] translate-y-[4px] bg-black rounded-md" />
          <div className="absolute inset-0 translate-x-[2px] translate-y-[2px] bg-[#FFD100] rounded-md border border-black" />
          <div className="relative bg-white border-2 border-black rounded-md px-3 py-2">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1 L8 9 L15 1" stroke="black" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ─── BREAK ─────────────────────────────────────────────────────────────────────

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

// ─── INFO SECTIONS ─────────────────────────────────────────────────────────────

const InfoSections = () => (
  <div className="font-sans text-gray-900">
    <section className="relative overflow-hidden border-b-4 border-black bg-white">
      <div className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, backgroundImage: 'radial-gradient(circle, rgba(0,0,0,0.06) 1.5px, transparent 1.5px)', backgroundSize: '24px 24px' }} />
      <div className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 3, height: '6px', background: 'linear-gradient(to right, #EF3340, #FFD100, #00A651, #009BD6, #F58220)' }} />
      <div className="absolute top-0 left-0 w-full pointer-events-none"
        style={{ zIndex: 2, height: '90px', backgroundImage: `url(${banderitas})`, backgroundRepeat: 'repeat-x', backgroundPosition: 'top center', backgroundSize: 'auto 100%' }} />
      <div className="absolute top-0 left-0 bottom-0 w-3 pointer-events-none" style={{ zIndex: 2, background: '#EF3340', borderRight: '2px solid #000' }} />
      <div className="absolute top-0 right-0 bottom-0 w-3 pointer-events-none" style={{ zIndex: 2, background: '#009BD6', borderLeft: '2px solid #000' }} />

      <div className="max-w-7xl mx-auto px-10 relative pt-32 pb-16" style={{ zIndex: 10 }}>
        <div className="grid md:grid-cols-2 gap-8 items-start mb-8">
          <div className="flex flex-col">
            <div className="inline-block mb-5 self-start">
              <div className="bg-[#FFD100] text-black font-barabara text-sm px-3 py-1 uppercase tracking-widest rounded-full"
                style={{ border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
                🇵🇭 Since 1968
              </div>
            </div>
            <div className="relative">
              <div className="relative px-8 py-6" style={{
                background: '#037ef3', border: '4px solid #000', borderRadius: '8px',
                outline: '3px dashed #FFD100', outlineOffset: '5px',
                boxShadow: '6px 6px 0px #EF3340, 9px 9px 0px #000',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              }}>
                <span className="absolute -top-3 -left-3 text-[#FFD100] text-lg leading-none select-none" style={{ textShadow: '1px 1px 0 #000' }}>★</span>
                <span className="absolute -top-3 -right-3 text-[#EF3340] text-lg leading-none select-none" style={{ textShadow: '1px 1px 0 #000' }}>★</span>
                <p className="font-barabara text-[10px] uppercase tracking-[0.4em] text-white/80 text-center mb-4">— Est. 1968 —</p>
                <h2 className="font-barabara text-4xl md:text-6xl font-black tracking-tight leading-none text-center">
                  <span className="text-white">WHAT IS </span>
                  <span style={{ color: '#FFD100' }}>AIESEC?</span>
                </h2>
                <div className="mt-3 flex items-center gap-2 justify-center w-full">
                  <div className="flex-1 h-px bg-white/40" />
                  <span className="text-white/70 text-xs font-barabara uppercase tracking-widest">AIESEC in the Philippines</span>
                  <div className="flex-1 h-px bg-white/40" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Youth-Led', 'Non-Profit', '126 Countries', 'Est. 1948'].map((tag, i) => {
                const tagColors = ['#EF3340', '#009BD6', '#00A651', '#F58220'];
                return (
                  <span key={tag} className="text-xs font-black uppercase px-4 py-1.5 rounded-full text-white border-2 border-black"
                    style={{ backgroundColor: tagColors[i], boxShadow: '2px 2px 0px #000' }}>
                    {tag}
                  </span>
                );
              })}
            </div>
          </div>

          <div className="bg-white border-4 border-black px-5 pt-8 pb-5 rounded-2xl relative flex flex-col justify-start mt-12"
            style={{ boxShadow: '7px 7px 0px #009BD6' }}>
            <div className="absolute -top-3.5 left-8 w-16 h-6 bg-[#FFD100] rotate-[-3deg] border-2 border-black rounded-sm" />
            <div className="absolute -top-3.5 left-24 w-10 h-6 bg-[#EF3340] rotate-[2deg] border-2 border-black rounded-sm" />
            <p className="text-base leading-relaxed font-semibold text-gray-900">
              We are <span className="font-pipanganan text-[#009BD6] text-xl">AIESEC in the Philippines</span>.
              Since 1968, we've been the "training ground" for young Filipino leaders.
            </p>
            <p className="mt-3 text-gray-600 leading-relaxed text-sm">
              Think of us as your global{' '}
              <span className="font-pipanganan text-[#EF3340] text-lg italic">Barkada</span>. We don't just send
              people abroad — we build bridges. We connect the warmth of Filipino hospitality with
              the diversity of the world, creating leaders who are globally minded but{' '}
              <span className="font-pipanganan text-gray-900">proudly Pinoy at heart.</span>
            </p>
            <div className="mt-3 pt-3 border-t-2 border-dashed border-gray-200 flex items-center gap-3">
              <div className="w-1 h-8 rounded-full bg-[#009BD6] border border-black flex-shrink-0" />
              <p className="text-xs italic text-gray-500 font-medium">
                "Activating leadership potential in young people through cross-cultural exchange."
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px] rounded-2xl" />
            <div className="relative rounded-2xl border-4 border-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-[#009BD6] text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-black uppercase tracking-widest" style={{ boxShadow: '2px 2px 0px #000' }}>
                  📸 AIESEC Community
                </div>
              </div>
              <img src={aiesecCommunityPhoto} alt="AIESEC community" className="w-full h-full object-cover"
                style={{ filter: 'grayscale(60%) sepia(30%) saturate(0.8) hue-rotate(180deg) brightness(0.85) contrast(1.1)' }} />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(3, 126, 243, 0.18)', mixBlendMode: 'multiply' }} />
            </div>
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-black translate-x-[6px] translate-y-[6px] rounded-2xl" />
            <div className="relative rounded-2xl border-4 border-black overflow-hidden" style={{ aspectRatio: '16/9' }}>
              <div className="absolute top-3 left-3 z-10">
                <div className="bg-[#EF3340] text-white font-black text-[10px] px-3 py-1 rounded-full border-2 border-black uppercase tracking-widest" style={{ boxShadow: '2px 2px 0px #000' }}>
                  ▶ Explore the Philippines
                </div>
              </div>
              <iframe src="https://www.youtube.com/embed/SpQpWCcNIlg?si=0TTnZGzeCWXC302a"
                title="AIESEC in the Philippines"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
    <WhyGoGlobal />
  </div>
);

// ─── WHY GO GLOBAL ─────────────────────────────────────────────────────────────

const WhyGoGlobal = () => {
  const sectionRef = useRef(null);
  const imgs = useRef([null, null, null, null]);
  const targets = useRef({ x: 0, y: 0 });
  const currents = useRef([{ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }]);
  const rafRef = useRef(null);
  const depths = [[-28, -22, 0.055], [35, -18, 0.07], [-22, 30, 0.06], [30, 25, 0.05]];

  useEffect(() => {
    const lerp = (a, b, t) => a + (b - a) * t;
    const tick = () => {
      currents.current.forEach((cur, i) => {
        const [xD, yD, speed] = depths[i];
        cur.x = lerp(cur.x, targets.current.x * xD, speed);
        cur.y = lerp(cur.y, targets.current.y * yD, speed);
        if (imgs.current[i]) imgs.current[i].style.transform = `translate(${cur.x}px, ${cur.y}px)`;
      });
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  const handleMouseMove = (e) => {
    const rect = sectionRef.current.getBoundingClientRect();
    targets.current.x = (e.clientX - rect.left) / rect.width - 0.5;
    targets.current.y = (e.clientY - rect.top) / rect.height - 0.5;
  };

  return (
    <section ref={sectionRef} className="py-28 bg-[#009BD6] relative overflow-hidden"
      onMouseMove={handleMouseMove} onMouseLeave={() => { targets.current = { x: 0, y: 0 }; }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ zIndex: 0, backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.18) 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />
      <img ref={el => imgs.current[0] = el} src={upperLeft} alt="" className="absolute pointer-events-none"
        style={{ width: 'clamp(560px, 70vw, 2580px)', top: 'clamp(-380px, -15vw, -60px)', left: 'clamp(-120px, -12vw, -60px)', zIndex: 1, willChange: 'transform' }} />
      <img ref={el => imgs.current[1] = el} src={upperRight} alt="" className="absolute pointer-events-none"
        style={{ width: 'clamp(840px, 70vw, 1920px)', top: 'clamp(-150px, -30vw, -50px)', right: 'clamp(-140px, -14vw, -70px)', zIndex: 1, willChange: 'transform' }} />
      <img ref={el => imgs.current[2] = el} src={bottomLeft} alt="" className="absolute pointer-events-none"
        style={{ width: 'clamp(580px, 80vw, 2200px)', bottom: 'clamp(-120px, -12vw, -70px)', left: 'clamp(-100px, -10vw, -50px)', zIndex: 1, willChange: 'transform' }} />
      <img ref={el => imgs.current[3] = el} src={bottomRight} alt="" className="absolute pointer-events-none"
        style={{ width: 'clamp(1200px, 85vw, 1840px)', bottom: 'clamp(-180px, -12vw, -60px)', right: 'clamp(-110px, -14vw, -60px)', zIndex: 1, willChange: 'transform' }} />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-6">
          <motion.div className="inline-block mb-4" initial={{ rotate: -3 }} whileHover={{ rotate: 0, scale: 1.04 }} transition={{ type: 'spring', stiffness: 300 }}>
            <div className="bg-[#FFD100] text-black font-barabara text-sm px-5 py-2 uppercase tracking-widest rounded-full"
              style={{ border: '3px solid #000', boxShadow: '3px 3px 0px #000' }}>
              ✈️ Your Next Chapter Starts Here
            </div>
          </motion.div>
          <h2 className="font-barabara text-5xl md:text-7xl font-black text-white uppercase drop-shadow-[4px_4px_0px_#000] leading-none">
            Why Go{' '}
            <span className="text-[#FFD100]" style={{ textDecoration: 'underline wavy', textDecorationColor: '#EF3340' }}>Global</span>?
          </h2>
          <div className="mt-6 max-w-2xl mx-auto relative">
            <div className="absolute inset-0 bg-black rounded-2xl translate-x-2 translate-y-2" />
            <p className="relative text-lg text-white font-semibold leading-relaxed p-5 rounded-2xl"
              style={{ background: 'rgba(0,0,0,0.35)', border: '3px solid #000', backdropFilter: 'blur(8px)' }}>
              Imagine unlocking your boldest self—
              <span className="text-[#FFD100] font-black">diskarte</span>,{' '}
              <span className="text-[#FFD100] font-black">tibay ng loob</span>, and{' '}
              <span className="text-[#FFD100] font-black">pakikisama</span>—through epic global
              adventures. The Philippines is your first step toward real growth. Ready to level up?
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-10 mt-14">
          <FlipCard title="THE EXPERIENCE" filipinoTrait="Diskarte" emoji="🌍"
            description="Step out of your comfort zone. Learn to navigate new cities, cultures, and challenges with pure Filipino resourcefulness."
            icon={Globe} frontBg="#EF3340" backBg="#1a1a2e" accentColor="#FFD100" rotate="-rotate-2" />
          <FlipCard title="THE GROWTH" filipinoTrait="Tibay ng Loob" emoji="⚡"
            description="Resilience is in our DNA. Develop leadership skills that stick by solving real-world problems in a foreign environment."
            icon={Zap} frontBg="#F58220" backBg="#0f2027" accentColor="#009BD6" rotate="rotate-2" />
          <FlipCard title="THE FAMILY" filipinoTrait="Pakikisama" emoji="🤝"
            description="Make friends from 100+ countries. You won't just be a tourist; you'll be part of a global barkada that lasts a lifetime."
            icon={Users} frontBg="#7B2FF7" backBg="#1a0533" accentColor="#FFD100" rotate="-rotate-1" />
        </div>
      </div>
    </section>
  );
};

// ─── FLIP CARD ─────────────────────────────────────────────────────────────────

const FlipCard = ({ title, filipinoTrait, emoji, description, icon: Icon, frontBg, backBg, accentColor, rotate }) => {
  const [flipped, setFlipped] = useState(false);
  return (
    <div className={`relative group ${rotate}`} style={{ perspective: '1000px', height: '340px' }}
      onMouseEnter={() => setFlipped(true)} onMouseLeave={() => setFlipped(false)}>
      <div className="absolute inset-0 rounded-2xl translate-x-3 translate-y-3 border-4 border-black" style={{ backgroundColor: '#000' }} />
      <div style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d', transition: 'transform 0.65s cubic-bezier(0.4, 0, 0.2, 1)', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div className="absolute inset-0 rounded-2xl border-4 border-black flex flex-col items-center justify-center p-8 text-center overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', backgroundColor: frontBg }}>
          <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(white 1.5px, transparent 1.5px)', backgroundSize: '18px 18px' }} />
          <div className="text-7xl mb-4 drop-shadow-md select-none">{emoji}</div>
          <h3 className="font-barabara text-3xl font-black text-white uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,0.6)] mb-3">{title}</h3>
          <div className="px-4 py-1 border-2 border-black text-black font-black text-xs uppercase tracking-widest rounded-full" style={{ backgroundColor: accentColor, boxShadow: '2px 2px 0px #000' }}>{filipinoTrait}</div>
          <p className="mt-5 text-white/70 text-xs uppercase tracking-widest font-semibold">Hover to reveal ✦</p>
        </div>
        <div className="absolute inset-0 rounded-2xl border-4 border-black flex flex-col items-center justify-center p-8 text-center overflow-hidden"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)', backgroundColor: backBg }}>
          <div className="absolute top-0 left-0 w-full h-2 border-b-2 border-black" style={{ backgroundColor: accentColor }} />
          <div className="w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-5" style={{ backgroundColor: accentColor, boxShadow: '4px 4px 0px #000' }}>
            <Icon size={28} className="text-black" strokeWidth={2.5} />
          </div>
          <h3 className="font-barabara text-2xl font-black text-white uppercase mb-2 drop-shadow-[1px_1px_0px_rgba(0,0,0,0.8)]">{title}</h3>
          <div className="px-3 py-1 border-2 border-black text-black font-black text-xs uppercase tracking-widest rounded-full mb-5" style={{ backgroundColor: accentColor, boxShadow: '2px 2px 0px #000' }}>Trait: {filipinoTrait}</div>
          <p className="text-white/90 font-medium leading-relaxed text-sm">{description}</p>
          <div className="absolute bottom-0 left-0 w-full h-2 border-t-2 border-black" style={{ backgroundColor: accentColor }} />
        </div>
      </div>
    </div>
  );
};

// ─── JEEPNEY MARQUEE ───────────────────────────────────────────────────────────

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
    { text: "DLSU CSB", est: "1988", address: "2544 Taft Avenue, Malate, Manila" },
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
          <div className="hidden md:block w-1 h-16 bg-white/20 rotate-12" />
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

      <div className="py-6 overflow-hidden border-b-4 border-black relative z-10"
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #b8e4f7 60%, #d4eef9 100%)' }}>
        <svg className="absolute top-2 left-[8%] opacity-80 pointer-events-none" width="90" height="40" viewBox="0 0 90 40" fill="none">
          <ellipse cx="45" cy="28" rx="40" ry="16" fill="white" /><ellipse cx="30" cy="22" rx="22" ry="18" fill="white" />
          <ellipse cx="58" cy="20" rx="20" ry="16" fill="white" /><ellipse cx="45" cy="16" rx="18" ry="14" fill="white" />
        </svg>
        <svg className="absolute top-1 left-[32%] opacity-70 pointer-events-none" width="70" height="32" viewBox="0 0 70 32" fill="none">
          <ellipse cx="35" cy="22" rx="30" ry="12" fill="white" /><ellipse cx="22" cy="17" rx="16" ry="14" fill="white" /><ellipse cx="46" cy="15" rx="15" ry="13" fill="white" />
        </svg>
        <svg className="absolute top-3 left-[58%] opacity-75 pointer-events-none" width="100" height="44" viewBox="0 0 100 44" fill="none">
          <ellipse cx="50" cy="30" rx="44" ry="18" fill="white" /><ellipse cx="34" cy="24" rx="24" ry="20" fill="white" />
          <ellipse cx="65" cy="22" rx="22" ry="18" fill="white" /><ellipse cx="50" cy="18" rx="20" ry="16" fill="white" />
        </svg>
        <svg className="absolute top-2 left-[82%] opacity-65 pointer-events-none" width="72" height="34" viewBox="0 0 72 34" fill="none">
          <ellipse cx="36" cy="24" rx="32" ry="13" fill="white" /><ellipse cx="24" cy="18" rx="18" ry="15" fill="white" /><ellipse cx="50" cy="16" rx="16" ry="13" fill="white" />
        </svg>
        <motion.div className="flex whitespace-nowrap gap-6 pl-6" animate={{ x: [-1000, 0] }}
          style={{ animationPlayState: selectedRoute ? 'paused' : 'running' }}
          transition={{ repeat: Infinity, duration: 25, ease: 'linear' }}>
          {[...routes, ...routes, ...routes].map((route, i) => {
            const parts = route.text.split(' ');
            const uniqueId = `route-${i}`;
            return (
              <motion.div layoutId={uniqueId} key={i} onClick={() => setSelectedRoute({ ...route, id: uniqueId })}
                className="bg-black border-4 border-white/20 hover:border-white/60 px-6 py-4 flex flex-col items-center justify-center min-w-[200px] shrink-0 rounded-md transform transition-all hover:scale-105 cursor-pointer group">
                <span className="font-cubao text-5xl leading-[0.85] tracking-wide text-[#FFD100] block text-center">{parts[0]}</span>
                <span className="font-cubao text-4xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-1">{parts.slice(1).join(' ')}</span>
                <span className="mt-3 text-[10px] text-white/50 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-sans">Press route for info</span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedRoute(null)} className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer" />
            <motion.div layoutId={selectedRoute.id} className="w-full max-w-md aspect-[4/3] relative z-10" transition={{ duration: 0.5, ease: 'easeInOut' }}>
              <motion.div initial={{ rotateY: 0 }} animate={{ rotateY: 180 }} exit={{ rotateY: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }} className="w-full h-full relative" style={{ transformStyle: 'preserve-3d' }}>
                <div className="absolute inset-0 bg-black border-4 border-white/40 flex flex-col items-center justify-center rounded-xl shadow-2xl" style={{ backfaceVisibility: 'hidden' }}>
                  <span className="font-cubao text-7xl md:text-8xl leading-[0.85] tracking-wide text-[#FFD100] block text-center">{selectedRoute.text.split(' ')[0]}</span>
                  <span className="font-cubao text-5xl md:text-6xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-2">{selectedRoute.text.split(' ').slice(1).join(' ')}</span>
                </div>
                <div className="absolute inset-0 bg-[#222] border-4 border-[#FFD100] flex flex-col items-center justify-center rounded-xl shadow-2xl p-8 text-center"
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                  <div className="absolute top-4 right-4">
                    <button onClick={(e) => { e.stopPropagation(); setSelectedRoute(null); }} className="text-white hover:text-yellow-400 transition-colors">
                      <X size={24} />
                    </button>
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

// ─── PROGRAMS ─────────────────────────────────────────────────────────────────
// Uses <Link> styled as buttons — zero dependency on useNavigate

const Programs = () => (
  <section id="programs-section" className="py-24 bg-white relative overflow-hidden">
    <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #312783 2px, transparent 2.5px)', backgroundSize: '16px 16px' }} />
    <div className="max-w-7xl mx-auto px-4 relative z-10">
      <div className="text-center mb-16">
        <h2 className="font-pipanganan text-6xl md:text-7xl text-black tracking-wider uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
          CHOOSE YOUR <span className="text-[#FFD100]">ADVENTURE</span>
        </h2>
        <p className="text-xl mt-4 max-w-2xl mx-auto text-gray-600">Find the product that matches your vibe.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">

        <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
          <div className="h-full bg-[#FFF0F1] border-4 border-[#EF3340] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#EF3340] flex flex-col items-center text-center">
            <div className="h-24 mb-6 flex items-center justify-center">
              <img src={volLogo} alt="Global Volunteer" className="h-full object-contain drop-shadow-sm" />
            </div>
            <h3 className="font-pipanganan text-3xl text-[#EF3340] mb-2 uppercase leading-none">The Spirit of <br /> Bayanihan</h3>
            <p className="text-gray-700 mb-8 flex-grow">Experience the Filipino culture of communal unity. Volunteer to help communities lift each other up.</p>
            <Link to="/global-volunteer" className="w-full block text-center bg-[#EF3340] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#EF3340] hover:bg-white hover:text-[#EF3340] transition-all shadow-md">
              Start Volunteering
            </Link>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
          <div className="h-full bg-[#E0F4FB] border-4 border-[#52BCC6] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#52BCC6] flex flex-col items-center text-center">
            <div className="h-24 mb-6 flex items-center justify-center">
              <img src={talentLogo} alt="Global Talent" className="h-full object-contain drop-shadow-sm" />
            </div>
            <h3 className="font-pipanganan text-3xl text-[#52BCC6] mb-2 uppercase leading-none">Innovate with <br /> Diskarte</h3>
            <p className="text-gray-700 mb-8 flex-grow">Showcase your Filipino resourcefulness in a global professional setting.</p>
            <Link to="/global-talent" className="w-full block text-center bg-[#52BCC6] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#52BCC6] hover:bg-white hover:text-[#009BD6] transition-all shadow-md">
              Find Opportunities
            </Link>
          </div>
        </motion.div>

        <motion.div whileHover={{ y: -10 }} className="group relative flex flex-col h-full">
          <div className="h-full bg-[#FFF8E1] border-4 border-[#F58220] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#F58220] flex flex-col items-center text-center">
            <div className="h-24 mb-6 flex items-center justify-center">
              <img src={teachLogo} alt="Global Teacher" className="h-full object-contain drop-shadow-sm" />
            </div>
            <h3 className="font-pipanganan text-3xl text-[#F58220] mb-2 uppercase leading-none">Nurture with <br /> Pag-aaruga</h3>
            <p className="text-gray-700 mb-8 flex-grow">Embody the Filipino trait of nurturing care and foster growth in classrooms abroad.</p>
            <Link to="/global-teacher" className="w-full block text-center bg-[#F58220] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#F58220] hover:bg-white hover:text-[#F58220] transition-all shadow-md">
              Start Teaching
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  </section>
);

// ─── FOOTER ───────────────────────────────────────────────────────────────────

const Footer = () => (
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
                <img src={aiesecLogo} alt="AIESEC Logo" className="h-7 w-auto" />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-gray-500 max-w-xl">
              AIESEC is a non-governmental not-for-profit organisation in consultative status with ECOSOC, affiliated with the UN DPI, member of ICMYO, and recognised by UNESCO. We are AIESEC in the Philippines — a youth leadership movement driven by one cause: peace and fulfillment of humankind's potential.
            </p>
            <div className="flex flex-wrap gap-3">
              {[{ Icon: Mail, text: 'hello@aiesecph.org' }, { Icon: MapPin, text: 'Unit 201, Example Building, Metro Manila' }].map(({ Icon, text }, i) => (
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
                  { Icon: Facebook, href: 'https://www.facebook.com/aiesecphl', label: 'Facebook' },
                  { Icon: Instagram, href: 'https://www.instagram.com/aiesec.ph/', label: 'Instagram' },
                  { Icon: Linkedin, href: 'https://www.linkedin.com/company/aiesecphl/', label: 'LinkedIn' },
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
            {['#EF3340', '#FFD100', '#00A651', '#037ef3', '#F58220'].map((c) => (
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

// ─── HOME PAGE ────────────────────────────────────────────────────────────────

const HomePage = () => {
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
};

// ─── APP ──────────────────────────────────────────────────────────────────────
// Renders HomePage directly. All routing (including /global-* and /admin/*)
// is handled in main.jsx — do NOT add Routes or BrowserRouter here.

export default function App() {
  return <HomePage />;
}