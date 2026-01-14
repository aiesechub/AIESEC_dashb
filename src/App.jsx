import React, {useState} from 'react';
import { motion, useScroll, useTransform, AnimatePresence} from 'framer-motion';
import { Heart, Globe, Briefcase, BookOpen, Menu, X, Sun, Sparkles, Facebook, Instagram, Linkedin, Twitter, Mail, MapPin, Users, Zap, Star} from 'lucide-react';
import volLogo from './assets/logos/global-volunteer.png';
import talentLogo from './assets/logos/global-talent.png';
import teachLogo from './assets/logos/global-teacher.png';
import aiesecLogo from './assets/logos/AIESEC-white.png';
import megaphone from './assets/graphics/megaphone-cartoon.png';
import phbeach from './assets/images/ph-beach.jpg'
import banderitas from './assets/graphics/banderitas-nobg.png'

// --- CUSTOM STYLES & TEXTURES ---
// Kept the noise, but made the base background warmer
const textureStyle = {
  backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E")`,
};

const weavePattern = {
  backgroundImage: `radial-gradient(#FFD100 2px, transparent 2px), radial-gradient(#FFD100 2px, transparent 2px)`,
  backgroundSize: '20px 20px',
  backgroundPosition: '0 0, 10px 10px',
  backgroundColor: '#FFFBEB'
};

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

const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  // Array of colors to cycle through for the menu items to create that "Mosaic" feel
  const navColors = [colors.red, colors.green, colors.blue, colors.orange];

  return (
    <nav className="fixed w-full z-50 bg-[#FFFBEB] border-b-2 border-black px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo styled like a retro sticker */}
        <div className="relative group cursor-pointer">
          <div className="relative bg-[#037ef3] px-4 py-2 rounded-lg transform -rotate-2 hover:rotate-0 transition-transform inline-block">
            <img
              src={aiesecLogo}
              alt="AIESEC PH"
              className="h-8 w-auto object-contain"
            />
          </div>
        </div>

        {/* Desktop Menu - Jeepney Sign Style with Mosaic Colors */}
        <div className="hidden md:flex space-x-4">
          {['Home', 'Why?', 'Testimonials', 'Products'].map((item, i) => (
            <a key={item} href="#" className="relative group">
              {/* Dynamic background color based on index to match the colorful blocks in the image */}
              <div
                className="absolute inset-0 translate-y-1 translate-x-1 border-2 border-black rounded-md transition-transform group-hover:translate-x-2 group-hover:translate-y-2"
                style={{ backgroundColor: navColors[i % navColors.length] }}
              ></div>
              <div className="font-barabara relative bg-white border-2 border-black px-4 py-1 rounded-md text-xl tracking-wide uppercase hover:-translate-y-1 transition-transform">
                {item}
              </div>
            </a>
          ))}
        </div>

        {/* Mobile Toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 border-2 border-black bg-[#FFD100] rounded-md">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#FFFBEB] border-b-4 border-black p-4 space-y-3">
          {['Home', 'Why PH', 'Stories', 'Programs'].map((item) => (
            <div key={item} className="bg-white border-2 border-black p-3 font-bold text-center uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {item}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
};

const Hero = () => {
  return (
    // Removed bg-[#FFFBEB] so the image shows through
    <section className="relative min-h-screen pt-24 flex items-center overflow-hidden">
      
      {/* --- 1. Background Image --- */}
      <div className="absolute inset-0 z-0">
        <img 
          src={phbeach} 
          alt="Philippines Beach" 
          className="w-full h-full object-cover"
        />
      </div>

      {/* --- 2. Blue Opaque Filter --- */}
      {/* bg-blue-900 provides the tint, /85 opacity ensures text readability */}
      <div className="absolute inset-0 z-0 bg-yellow-900/60 mix-blend-multiply"></div>

      {/* Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none z-20" style={textureStyle}></div>

      {/* Background Decorative Blobs - Changed blend mode to 'screen/overlay' to glow against dark background */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-[#009BD6] rounded-full mix-blend-overlay filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FFD100] rounded-full mix-blend-overlay filter blur-3xl opacity-30"></div>
      <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-[#EF3340] rounded-full mix-blend-overlay filter blur-3xl opacity-20"></div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 w-full grid md:grid-cols-2 gap-12 items-center relative z-10">

        <div className="space-y-6 text-center md:text-left">

          <h1 className="text-4xl md:text-8xl leading-[0.85] text-white drop-shadow-md">
            <span
              className="font-barabara font-bold drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] block"
              style={{
                // Gradient Text
                backgroundImage: 'linear-gradient(to right, #312783, #009BD6, #FFD100, #F58220, #EF3340)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                WebkitTextStroke: '2px white',
                lineHeight: '1.2', 
                paddingBottom: '10px'
              }}
            >
              MABUHAY!
            </span>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-4">
            {/* Primary Button */}
            <button className="bg-[#00A651] border-2 border-white px-8 py-4 text-xl uppercase tracking-wider shadow-[6px_6px_0px_0px_rgba(255,255,255,0.5)] hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all text-white font-bold">
              Tara, Let's Go!
            </button>
          </div>
        </div>

        {/* Right: Collage Style Image */}
        <div className="relative h-[500px] hidden md:block">
          {/* Back Layer - Fiesta Red */}
          <motion.div
            animate={{ rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-10 right-10 w-full h-full bg-[#EF3340] rounded-[2rem] border-4 border-white z-0"
          ></motion.div>

          {/* Middle Layer - Photo */}
          <motion.div
            animate={{ rotate: [0, -3, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-0 right-4 w-full h-full rounded-[2rem] overflow-hidden border-4 border-white z-10 bg-gray-200"
          >
            <img src="https://plus.unsplash.com/premium_photo-1700801936645-6315f8298c01?q=80&w=1170&auto=format&fit=crop" className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-500" alt="Filipino Youth" />
          </motion.div>

          {/* Front Layer - Sun Icon */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-10 -left-10 bg-[#FFD100] p-6 border-4 border-white rounded-full z-20 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)]"
          >
            <Sun size={64} strokeWidth={2.5} className="text-black" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const InfoSections = () => {
  return (
    <div className="font-sans text-gray-900">
      
      {/* SECTION 1: 
          - Changed bg-white to bg-orange-100 (Soft Orange)
          - Removed Sun and Star animations
      */}
      <section className="py-24 relative overflow-hidden border-b-4 border-black bg-orange-100">
        
        {/* BANDERITAS BACKGROUND LOGIC */}
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
            
            {/* Left: The Content */}
            <div className="space-y-8">
              {/* Header styled like a Jeepney Sign */}
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-yellow-400 translate-x-2 translate-y-2 border-2 border-black rounded-sm"></div>
                <div className="relative bg-black text-white px-6 py-2 border-2 border-black rounded-sm">
                  <h2 className="font-barabara text-4xl md:text-5xl font-black tracking-tighter">
                    WHAT IS <span className="text-yellow-400">AIESEC?</span>
                  </h2>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-sm border-2 border-black p-6 rounded-xl shadow-[8px_8px_0px_rgba(0,0,0,1)] relative">
                {/* Decorative Tape */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-32 h-6 bg-red-500/80 rotate-1"></div>
                
                <p className="text-lg md:text-xl leading-relaxed font-medium">
                  We are <span className="font-bold text-blue-600">AIESEC in the Philippines</span>. 
                  Since 1968, we’ve been the "training ground" for young Filipino leaders.
                </p>
                <p className="mt-4 text-gray-600">
                  Think of us as your global <span className="italic font-bold text-red-500">Barkada</span>. 
                  We don't just send people abroad; we build bridges. We connect the warmth of Filipino 
                  hospitality with the diversity of the world, creating leaders who are globally minded 
                  but <span className="font-bold">proudly Pinoy at heart.</span>
                </p>
              </div>

              <div className="flex gap-4">
                <div className="flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full border border-blue-300">
                  <Globe size={20} className="text-blue-600" />
                  <span className="font-bold text-blue-800 text-sm">100+ Countries</span>
                </div>
                <div className="flex items-center gap-2 bg-red-100 px-4 py-2 rounded-full border border-red-300">
                  <Heart size={20} className="text-red-600" />
                  <span className="font-bold text-red-800 text-sm">Made with Puso</span>
                </div>
              </div>
            </div>

            {/* Right: The Visual Collage */}
            <div className="relative h-[400px] w-full flex items-center justify-center">
               
               {/* Back Layer Photo */}
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: 2 }}
                 className="absolute w-64 h-80 bg-blue-500 rounded-2xl border-4 border-black shadow-[12px_12px_0px_#000] rotate-[-6deg] z-10 overflow-hidden"
               >
                 <img 
                   className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300" 
                   src="/api/placeholder/400/320" // Placeholder
                   alt="Member 1"
                 />
               </motion.div>

               {/* Front Layer Photo */}
               <motion.div 
                 whileHover={{ scale: 1.05, rotate: -2 }}
                 className="absolute w-64 h-80 bg-yellow-400 rounded-2xl border-4 border-black shadow-[12px_12px_0px_#000] rotate-[6deg] z-20 translate-x-12 translate-y-8 overflow-hidden"
               >
                 <img 
                    className="object-cover w-full h-full grayscale hover:grayscale-0 transition-all duration-300"
                    src="/api/placeholder/400/320" // Placeholder
                    alt="Member 2"
                 />
                 {/* "Sticker" Overlay */}
                 <div className="absolute bottom-4 right-4 bg-red-600 text-white font-black text-xs px-2 py-1 rotate-[-12deg] border border-white shadow-sm">
                   SINCE 1968
                 </div>
               </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: UNTOUCHED */}
      <section className="py-24 bg-[#009BD6] relative overflow-hidden">
        {/* Halftone Pattern Overlay */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(white 2px, transparent 2px)', backgroundSize: '30px 30px' }}></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          <div className="text-center mb-16">
            <h2 className="font-barabara text-5xl md:text-7xl font-black text-white uppercase drop-shadow-[4px_4px_0px_#000]">
              Why Go <span className="text-yellow-400 underline decoration-wavy decoration-4 underline-offset-8">Global</span>?
            </h2>
            <p className="mt-6 text-xl text-white font-medium max-w-2xl mx-auto bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/20">
              It’s more than just travel. It’s about bringing home a new version of yourself.
              <br/>This is your <span className="text-yellow-300 font-bold italic">"Baon"</span> for life.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Card 1: Experience */}
            <Card 
              title="THE EXPERIENCE" 
              filipinoTrait="Diskarte"
              description="Step out of your comfort zone. Learn to navigate new cities, cultures, and challenges with pure Filipino resourcefulness."
              icon={Globe}
              accentColor="bg-[#E7354C]"
              rotate="-rotate-2"
            />

            {/* Card 2: Leadership */}
            <Card 
              title="THE GROWTH" 
              filipinoTrait="Tibay ng Loob"
              description="Resilience is in our DNA. Develop leadership skills that stick by solving real-world problems in a foreign environment."
              icon={Zap}
              accentColor="bg-[#F0822B]"
              rotate="rotate-2"
            />

            {/* Card 3: Community */}
            <Card 
              title="THE FAMILY" 
              filipinoTrait="Pakikisama"
              description="Make friends from 100+ countries. You won't just be a tourist; you'll be part of a global barkada that lasts a lifetime."
              icon={Users}
              accentColor="bg-[#FCB634]"
              rotate="-rotate-1"
            />

          </div>
        </div>
      </section>
    </div>
  );
};

// Sub-component for the Cards to keep code clean
const Card = ({ title, filipinoTrait, description, icon: Icon, accentColor, rotate }) => {
  return (
    <motion.div 
      whileHover={{ y: -10, scale: 1.02 }}
      className={`relative group h-full ${rotate}`}
    >
      {/* The Shadow Block */}
      <div className={`absolute inset-0 ${accentColor} rounded-2xl translate-x-3 translate-y-3 border-4 border-black`}></div>
      
      {/* The Card Content */}
      <div className="relative bg-white h-full rounded-2xl border-4 border-black p-8 flex flex-col items-center text-center">
        
        {/* Icon Circle */}
        <div className={`w-20 h-20 ${accentColor} rounded-full border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_#000]`}>
          <Icon size={32} className="text-black" strokeWidth={2.5} />
        </div>

        <h3 className="text-3xl font-black uppercase mb-1">{title}</h3>
        <p className={`text-sm font-bold uppercase tracking-widest mb-4 px-3 py-1 bg-black text-white rounded-full`}>
           Trait: {filipinoTrait}
        </p>
        
        <p className="text-gray-700 font-medium leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
};

const Break = () => {
  // Generates an array [1, 2, 3, ... 28]
  const squares = Array.from({ length: 28 }, (_, i) => i + 1);

  return (
    <div className="w-full flex">
      {squares.map((num) => (
        <img
          key={num}
          // Note: In most frameworks (Next.js/Vite), remove '/public' from the src path
          src={`/break/${num}.svg`} 
          alt="image"
          // flex-1: makes them share available width equally
          // w-0: allows the image to shrink below its intrinsic size to fit the container
          // h-auto: scales the height automatically based on the new width to maintain aspect ratio
          className="flex-1 w-0 h-auto object-cover" 
        />
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
    { text: "UP DILIMAN", est: "1908", address: "Diliman, Quezon City" },
  ];

  return (
    <section className="relative z-30 font-bold">
      
      {/* --- STATS DASHBOARD --- */}
      <div className="bg-[#1a1a1a] border-y-4 border-yellow-400 py-6 px-4 relative z-20">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 md:gap-12">
          
          <div className="flex items-center gap-4 group">
            <div className="bg-[#009BD6] p-3 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform">
              <MapPin size={32} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-cubao text-5xl text-white leading-none tracking-wide drop-shadow-[2px_2px_0px_#000]">
                9 <span className="text-[#009BD6]">Local Committee</span>
              </h3>
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Local Chapters Nationwide
              </p>
            </div>
          </div>

          <div className="hidden md:block w-1 h-16 bg-white/20 rotate-12"></div>

          <div className="flex items-center gap-4 group">
             <div className="bg-[#F58220] p-3 rounded-full border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,0.5)] transform rotate-6 group-hover:rotate-0 transition-transform">
              <Users size={32} className="text-white" strokeWidth={3} />
            </div>
            <div>
              <h3 className="font-cubao text-5xl text-white leading-none tracking-wide drop-shadow-[2px_2px_0px_#000]">
                400+ <span className="text-[#F58220]">Members</span>
              </h3>
              <p className="text-gray-400 text-sm tracking-widest uppercase">
                Active Members & Alumni
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* --- SCROLLING MARQUEE --- */}
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
            const uniqueId = `route-${i}`; // Unique ID for layout animation

            return (
              <motion.div 
                layoutId={uniqueId} // This handles the "Pop out" movement
                key={i} 
                onClick={() => setSelectedRoute({ ...route, id: uniqueId })}
                className="
                  bg-black 
                  border-4 border-white/20 hover:border-white/60
                  px-6 py-4
                  flex flex-col items-center justify-center
                  shadow-[0_0_15px_rgba(0,0,0,0.1)]
                  min-w-[200px] shrink-0
                  rounded-md
                  transform transition-all hover:scale-105 cursor-pointer
                  group
                "
              >
                <span className="font-cubao text-5xl leading-[0.85] tracking-wide text-[#FFD100] block text-center drop-shadow-[2px_2px_0px_rgba(255,255,255,0.2)]">
                  {topLine}
                </span>
                <span className="font-cubao text-4xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-1">
                  {bottomLine}
                </span>
                <span className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity font-sans">
                  Press route for info
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* --- MODAL --- */}
      <AnimatePresence>
        {selectedRoute && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 perspective-[1000px]">
            
            {/* 1. Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedRoute(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-md cursor-pointer"
            />

            {/* 2. Layout Wrapper (Handles the move from marquee to center) */}
            <motion.div
              layoutId={selectedRoute.id}
              className="w-full max-w-md aspect-[4/3] relative z-10"
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {/* 3. Flip Wrapper (Handles the rotation independently) */}
              <motion.div
                initial={{ rotateY: 0 }}
                animate={{ rotateY: 180 }}
                exit={{ rotateY: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }} // Small delay helps visual clarity
                className="w-full h-full relative [transform-style:preserve-3d]"
              >
                
                {/* --- FRONT FACE (Jeepney Sign) --- */}
                <div 
                  className="absolute inset-0 bg-black border-4 border-white/40 flex flex-col items-center justify-center rounded-xl shadow-2xl [backface-visibility:hidden]"
                >
                  <span className="font-cubao text-7xl md:text-8xl leading-[0.85] tracking-wide text-[#FFD100] block text-center drop-shadow-[4px_4px_0px_rgba(255,255,255,0.2)]">
                    {selectedRoute.text.split(' ')[0]}
                  </span>
                  <span className="font-cubao text-5xl md:text-6xl leading-[0.85] tracking-wide text-[#EF3340] block text-center mt-2">
                    {selectedRoute.text.split(' ').slice(1).join(' ')}
                  </span>
                </div>

                {/* --- BACK FACE (Details) --- */}
                <div 
                  className="absolute inset-0 bg-[#222] border-4 border-[#FFD100] flex flex-col items-center justify-center rounded-xl shadow-2xl p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                >
                  <div className="absolute top-4 right-4">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent clicking backdrop
                        setSelectedRoute(null);
                      }} 
                      className="text-white hover:text-yellow-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                  </div>

                  <h3 className="font-cubao text-3xl text-white mb-6 tracking-wider">
                    DESTINATION INFO
                  </h3>

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
                  
                  <p className="mt-6 text-gray-500 text-xs uppercase tracking-widest">
                    AIESEC in the Philippines
                  </p>
                </div>

              </motion.div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

// --- PROGRAMS ---
const Programs = () => {
  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Texture (Halftone) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(circle, #312783 2px, transparent 2.5px)',
        backgroundSize: '16px 16px'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-pipanganan text-6xl md:text-7xl text-black tracking-wider uppercase drop-shadow-[4px_4px_0px_rgba(0,0,0,0.2)]">
            CHOOSE YOUR <span className="text-[#FFD100] text-stroke-black">ADVENTURE</span>
          </h2>
          <p className="text-xl mt-4 max-w-2xl mx-auto text-gray-600">
            Find the program that matches your vibe.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">

          {/* --- GLOBAL VOLUNTEER CARD (Red - "Love" Heart Color) --- */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative flex flex-col h-full"
          >
            <div className="h-full bg-[#FFF0F1] border-4 border-[#EF3340] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#EF3340] flex flex-col items-center text-center">

              <div className="h-24 mb-6 flex items-center justify-center">
                <img src={volLogo} alt="Global Volunteer" className="h-full object-contain drop-shadow-sm" />
              </div>

              <h3 className="font-pipanganan text-3xl text-[#EF3340] mb-2 uppercase leading-none">
                The Spirit of <br /> Bayanihan
              </h3>

              <p className="text-gray-700 mb-8 flex-grow">
                Experience the Filipino culture of communal unity. Volunteer to help communities lift each other up.
              </p>

              <button className="w-full bg-[#EF3340] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#EF3340] hover:bg-white hover:text-[#EF3340] transition-all shadow-md">
                Start Volunteering
              </button>
            </div>
          </motion.div>

          {/* --- GLOBAL TALENT CARD (Blue - "Love" Ocean Color) --- */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative flex flex-col h-full"
          >
            {/* Changed from Teal to the Azure Blue from the image */}
            <div className="h-full bg-[#E0F4FB] border-4 border-[#52BCC6] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#52BCC6] flex flex-col items-center text-center">

              <div className="h-24 mb-6 flex items-center justify-center">
                <img src={talentLogo} alt="Global Talent" className="h-full object-contain drop-shadow-sm" />
              </div>

              <h3 className="font-pipanganan text-3xl text-[#52BCC6] mb-2 uppercase leading-none">
                Innovate with <br /> Diskarte
              </h3>

              <p className="text-gray-700 mb-8 flex-grow">
                Showcase your Filipino resourcefulness in a global professional setting.
              </p>

              <button className="w-full bg-[#52BCC6] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#52BCC6] hover:bg-white hover:text-[#009BD6] transition-all shadow-md">
                Find Opportunities
              </button>
            </div>
          </motion.div>

          {/* --- GLOBAL TEACHER CARD (Yellow/Orange - "Love" Sun Color) --- */}
          <motion.div
            whileHover={{ y: -10 }}
            className="group relative flex flex-col h-full"
          >
            <div className="h-full bg-[#FFF8E1] border-4 border-[#F58220] rounded-2xl p-8 shadow-[8px_8px_0px_0px_#F58220] flex flex-col items-center text-center">

              <div className="h-24 mb-6 flex items-center justify-center">
                <img src={teachLogo} alt="Global Teacher" className="h-full object-contain drop-shadow-sm" />
              </div>

              <h3 className="font-pipanganan text-3xl text-[#F58220] mb-2 uppercase leading-none">
                Nurture with <br /> Pag-aaruga
              </h3>

              <p className="text-gray-700 mb-8 flex-grow">
                Embody the Filipino trait of nurturing care and foster growth in classrooms abroad.
              </p>

              <button className="w-full bg-[#F58220] text-white font-pipanganan text-xl py-3 rounded-lg uppercase border-2 border-[#F58220] hover:bg-white hover:text-[#F58220] transition-all shadow-md">
                Start Teaching
              </button>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

const Footer = () => (
  <div className="flex flex-col relative">
    
    {/* 1. "Bandaritas" Top Border - Using the Fiesta Palette (Red -> Yellow -> Green) */}
    <div className="h-4 w-full bg-[linear-gradient(to_right,#EF3340,#FFD100,#00A651,#009BD6)]"></div>

    {/* 2. Main Footer Background: Deep Indigo (#312783) */}
    <footer className="bg-[#312783] text-white py-16 px-4 relative overflow-hidden">
      
      {/* Optional: Subtle background texture to give it a 'woven' feel */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #FFF 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
      </div>

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 relative z-10">
        
        {/* Left Column: Organization Info */}
        <div className="space-y-6 text-sm opacity-90">
          {/* Logo - Sits naturally on the indigo background now */}
          <img src={aiesecLogo} alt="AIESEC Logo" className="h-8 w-auto mb-4" />

          <p className="leading-relaxed text-indigo-100">
            AIESEC is a non-governmental not-for-profit organisation in consultative status with the United Nations
            Economic and Social Council (ECOSOC), affiliated with the UN DPI, member of ICMYO, and is recognised
            by UNESCO. AIESEC International is registered as a Foundation (Stichting), RSIN #807103895 in
            Rotterdam, The Netherlands.
          </p>

          <p className="leading-relaxed text-indigo-100">
            We are AIESEC in the Philippines, a youth leadership movement that is passionately driven by one cause:
            peace and fulfillment of humankind's potential. We are registered in the official bodies of the Philippines
            as a non-stock, non-profit organization.
          </p>
        </div>

        {/* Right Column: Contact & Connect */}
        <div className="space-y-8">
          <div>
            <h3 className="font-barabara text-3xl tracking-wide text-[#FFD100] mb-6 uppercase">
              Tara, Let's Connect!
            </h3>
            
            {/* Social Icons - White with Mango Yellow Hover */}
            <div className="flex gap-5">
              {[Facebook, Instagram, Twitter, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="bg-white/10 p-3 rounded-full hover:bg-[#FFD100] hover:text-[#312783] transition-all transform hover:-translate-y-1">
                  <Icon size={24} />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4 text-base text-indigo-50">
            <div className="flex items-center gap-3 group cursor-pointer">
              <Mail className="text-[#FFD100]" size={20} />
              <span className="group-hover:text-white transition-colors">hello@aiesecph.org</span>
            </div>
            <div className="flex items-start gap-3 group cursor-pointer">
              <MapPin className="text-[#FFD100] shrink-0 mt-1" size={20} />
              <span className="group-hover:text-white transition-colors">
                Unit 201, Example Building, Metro Manila, Philippines.
              </span>
            </div>
          </div>

          {/* Legal Links - Styled subtly */}
          <div className="text-xs text-indigo-300 space-y-4 pt-6 border-t border-indigo-700/50">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Privacy Notice</a>
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Cookie Policy</a>
              <a href="#" className="hover:text-[#FFD100] transition-colors underline decoration-dotted">Terms of Service</a>
            </div>
            <p>
              This site is protected by reCAPTCHA and Google's Privacy Policy applies.
            </p>
          </div>
        </div>
      </div>
    </footer>

    {/* 3. Bottom Bar: "Made with Rice" Joke + Salamat */}
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
  return (
    <div className="antialiased text-gray-900 bg-[#FFFBEB] overflow-x-hidden selection:bg-[#FFD100] selection:text-black">
      <Navbar />
      <Hero />
      <Break />
      <InfoSections />
      <Break />
      <JeepneyMarquee />
      <Programs />
      <Footer />
    </div>
  );
}