import React, { useState, useEffect, useRef } from 'react';

// Animated particle field background
const ParticleField = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId;
    let particles = [];
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 3;
    };
    
    const createParticles = () => {
      particles = [];
      const numParticles = Math.floor((canvas.width * canvas.height) / 20000);
      for (let i = 0; i < numParticles; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 2 + 0.5,
          opacity: Math.random() * 0.5 + 0.2,
          pulse: Math.random() * Math.PI * 2,
          color: Math.random() > 0.7 ? '#00ff88' : Math.random() > 0.5 ? '#00ddff' : '#8844ff'
        });
      }
    };
    
    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.pulse += 0.02;
        
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        
        const pulseOpacity = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        const hex = p.color;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * (1 + 0.3 * Math.sin(p.pulse)), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pulseOpacity})`;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        particles.slice(i + 1, i + 10).forEach(p2 => {
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0, 255, 136, ${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    resize();
    createParticles();
    animate();
    window.addEventListener('resize', () => { resize(); createParticles(); });
    return () => cancelAnimationFrame(animationId);
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #000000 0%, #050510 30%, #0a0520 60%, #000510 100%)' }} />;
};

// Animated Alien Mascot
const AlienMascot = ({ size = 200, className = '', style = {} }) => {
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [happy, setHappy] = useState(false);
  
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 150);
    }, 3000 + Math.random() * 2000);
    
    const happyInterval = setInterval(() => {
      setHappy(true);
      setTimeout(() => setHappy(false), 2000);
    }, 8000 + Math.random() * 4000);
    
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 15;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      setLook({ x, y });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      clearInterval(blinkInterval);
      clearInterval(happyInterval);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);
  
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id="alienGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
          <linearGradient id="alienBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="50%" stopColor="#00dd77" />
            <stop offset="100%" stopColor="#00aa55" />
          </linearGradient>
          <linearGradient id="alienBodyDark" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00cc66" />
            <stop offset="100%" stopColor="#008844" />
          </linearGradient>
          <radialGradient id="alienEyeGlow" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="30%" stopColor="#00ffff" />
            <stop offset="100%" stopColor="#0088aa" />
          </radialGradient>
          <radialGradient id="alienHeadShine" cx="30%" cy="20%" r="60%">
            <stop offset="0%" stopColor="#88ffcc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </radialGradient>
        </defs>
        
        <ellipse cx="103" cy="145" rx="45" ry="20" fill="#000" opacity="0.3" />
        
        <g filter="url(#alienGlow)">
          <path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill="url(#alienBodyDark)"/>
          <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#alienBodyGradient)" />
          <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#alienHeadShine)" />
          <path d="M60 55 Q100 45 140 55" stroke="#00aa55" strokeWidth="1" fill="none" opacity="0.5"/>
          <path d="M55 70 Q100 60 145 70" stroke="#00aa55" strokeWidth="1" fill="none" opacity="0.3"/>
        </g>
        
        <g opacity="0.6">
          <path d="M75 45 L125 45 L82 72 L125 72" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
        
        <ellipse cx="70" cy="85" rx="22" ry="18" fill="#002815" />
        <ellipse cx="130" cy="85" rx="22" ry="18" fill="#002815" />
        
        <g style={{ transform: `translate(${look.x}px, ${look.y}px)`, transition: 'transform 0.1s ease-out' }}>
          <ellipse cx="70" cy="85" rx="18" ry={blink ? 2 : 14} fill="url(#alienEyeGlow)" className="transition-all duration-100"/>
          {!blink && (
            <>
              <ellipse cx="72" cy="85" rx="7" ry="9" fill="#001a1a" />
              <ellipse cx="68" cy="81" rx="4" ry="3" fill="#ffffff" opacity="0.9" />
              <ellipse cx="75" cy="88" rx="2" ry="1.5" fill="#ffffff" opacity="0.5" />
            </>
          )}
          <ellipse cx="130" cy="85" rx="18" ry={blink ? 2 : 14} fill="url(#alienEyeGlow)" className="transition-all duration-100"/>
          {!blink && (
            <>
              <ellipse cx="132" cy="85" rx="7" ry="9" fill="#001a1a" />
              <ellipse cx="128" cy="81" rx="4" ry="3" fill="#ffffff" opacity="0.9" />
              <ellipse cx="135" cy="88" rx="2" ry="1.5" fill="#ffffff" opacity="0.5" />
            </>
          )}
        </g>
        
        <g>
          <path d="M100 25 Q100 15 100 10" stroke="#00dd77" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <circle cx="100" cy="8" r="5" fill="#00ffff" className="animate-pulse" />
          <circle cx="100" cy="8" r="3" fill="#ffffff" opacity="0.6" />
        </g>
        
        <g opacity="0.8">
          <path d="M55 45 Q45 35 40 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="38" cy="28" r="3" fill="#00ffaa" className="animate-pulse" style={{animationDelay: '0.5s'}} />
          <path d="M145 45 Q155 35 160 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round"/>
          <circle cx="162" cy="28" r="3" fill="#00ffaa" className="animate-pulse" style={{animationDelay: '1s'}} />
        </g>
        
        {happy ? (
          <path d="M80 120 Q100 140 120 120" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round"/>
        ) : (
          <path d="M85 118 Q100 130 115 118" stroke="#003322" strokeWidth="3" fill="none" strokeLinecap="round"/>
        )}
        
        {happy && (
          <>
            <ellipse cx="55" cy="100" rx="8" ry="5" fill="#ff8888" opacity="0.3" />
            <ellipse cx="145" cy="100" rx="8" ry="5" fill="#ff8888" opacity="0.3" />
          </>
        )}
        
        <path d="M75 145 L100 160 L125 145" stroke="#004433" strokeWidth="2" fill="none" strokeLinecap="round"/>
        
        <g className="origin-center" style={{ animation: 'wave 2s ease-in-out infinite' }}>
          <ellipse cx="55" cy="140" rx="8" ry="6" fill="#00dd77" />
          <circle cx="50" cy="138" r="3" fill="#00cc66" />
          <circle cx="53" cy="134" r="2.5" fill="#00cc66" />
          <circle cx="57" cy="133" r="2.5" fill="#00cc66" />
        </g>
        <g>
          <ellipse cx="145" cy="140" rx="8" ry="6" fill="#00dd77" />
          <circle cx="150" cy="138" r="3" fill="#00cc66" />
          <circle cx="147" cy="134" r="2.5" fill="#00cc66" />
          <circle cx="143" cy="133" r="2.5" fill="#00cc66" />
        </g>
      </svg>
    </div>
  );
};

// Flying UFO component
const FlyingUFO = ({ delay = 0, top = '20%', direction = 'left' }) => {
  return (
    <div 
      className="fixed pointer-events-none z-20"
      style={{ 
        top,
        animation: `${direction === 'left' ? 'flyLeft' : 'flyRight'} ${15 + Math.random() * 10}s linear infinite`,
        animationDelay: `${delay}s`
      }}
    >
      <svg width="120" height="60" viewBox="0 0 120 60" className="drop-shadow-[0_0_20px_rgba(0,255,136,0.6)]">
        <defs>
          <linearGradient id="ufoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#006633" />
          </linearGradient>
        </defs>
        <ellipse cx="60" cy="25" rx="50" ry="15" fill="url(#ufoGradient)" />
        <ellipse cx="60" cy="20" rx="25" ry="15" fill="#88ffcc" opacity="0.6" />
        <ellipse cx="60" cy="18" rx="20" ry="12" fill="#aaffdd" opacity="0.4" />
        {[20, 40, 60, 80, 100].map((x, i) => (
          <circle key={i} cx={x} cy="30" r="4" fill="#00ffff" className="animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
        <ellipse cx="60" cy="30" rx="40" ry="8" fill="#004422" />
      </svg>
    </div>
  );
};

// Mini aliens
const MiniAlien = ({ style, delay = 0 }) => {
  const [blink, setBlink] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 100);
    }, 2000 + Math.random() * 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute pointer-events-none" style={{ ...style, animation: `float ${4 + Math.random() * 2}s ease-in-out infinite`, animationDelay: `${delay}s` }}>
      <svg width="50" height="50" viewBox="0 0 50 50" className="drop-shadow-[0_0_10px_rgba(0,255,136,0.5)]">
        <ellipse cx="25" cy="28" rx="18" ry="15" fill="#00dd66" />
        <ellipse cx="25" cy="22" rx="15" ry="12" fill="#00ff88" />
        <ellipse cx="18" cy="22" rx="6" ry={blink ? 1 : 5} fill="#000" className="transition-all duration-75" />
        <ellipse cx="32" cy="22" rx="6" ry={blink ? 1 : 5} fill="#000" className="transition-all duration-75" />
        {!blink && (
          <>
            <ellipse cx="18" cy="21" rx="3" ry="2.5" fill="#00ffff" />
            <ellipse cx="32" cy="21" rx="3" ry="2.5" fill="#00ffff" />
          </>
        )}
        <line x1="25" y1="10" x2="25" y2="5" stroke="#00ff88" strokeWidth="2" />
        <circle cx="25" cy="4" r="2" fill="#00ffff" className="animate-pulse" />
      </svg>
    </div>
  );
};

// Shooting stars
const ShootingStars = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-white rounded-full"
          style={{
            top: `${Math.random() * 50}%`,
            left: `${Math.random() * 100}%`,
            animation: `shootingStar ${2 + Math.random() * 2}s linear infinite`,
            animationDelay: `${i * 3 + Math.random() * 5}s`,
            boxShadow: '0 0 6px 2px rgba(255,255,255,0.5), -30px 0 20px 2px rgba(255,255,255,0.3), -60px 0 30px 1px rgba(255,255,255,0.1)'
          }}
        />
      ))}
    </div>
  );
};

// Planet component
const Planet = ({ size, color, rings, top, left, right }) => (
  <div className="absolute pointer-events-none opacity-30" style={{ top, left, right, animation: 'float 20s ease-in-out infinite' }}>
    <div className="rounded-full" style={{ width: size, height: size, background: `radial-gradient(circle at 30% 30%, ${color}, #000)`, boxShadow: `inset -${size/10}px -${size/10}px ${size/5}px rgba(0,0,0,0.5), 0 0 ${size/2}px ${color}40` }} />
    {rings && (
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 opacity-50" style={{ width: size * 1.8, height: size * 0.4, borderColor: color, transform: 'translate(-50%, -50%) rotateX(75deg)' }} />
    )}
  </div>
);

// Animated border
const AnimatedBorder = ({ children, className = '' }) => (
  <div className={`relative ${className}`}>
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-purple-500 opacity-60 blur-sm" style={{ animation: 'borderPulse 3s ease-in-out infinite' }} />
    <div className="absolute inset-px rounded-2xl bg-black/95" />
    <div className="relative">{children}</div>
  </div>
);

// Glitch text
const GlitchText = ({ children, className = '' }) => {
  const [glitch, setGlitch] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 150);
    }, 4000 + Math.random() * 2000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <span className={`relative inline-block ${className}`}>
      <span className="relative z-10">{children}</span>
      {glitch && (
        <>
          <span className="absolute top-0 left-0 z-20 text-cyan-400" style={{ clipPath: 'inset(0 0 50% 0)', transform: 'translate(-2px, -1px)' }}>{children}</span>
          <span className="absolute top-0 left-0 z-20 text-fuchsia-500" style={{ clipPath: 'inset(50% 0 0 0)', transform: 'translate(2px, 1px)' }}>{children}</span>
        </>
      )}
    </span>
  );
};

// Typing effect
const useTypingEffect = (text, speed = 50, delay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [started, setStarted] = useState(false);
  
  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(startTimeout);
  }, [delay]);
  
  useEffect(() => {
    if (!started) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayText(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, started]);
  
  return displayText;
};

// UFO with tractor beam
const UFOWithBeam = () => {
  const [beamActive, setBeamActive] = useState(false);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setBeamActive(true);
      setTimeout(() => setBeamActive(false), 3000);
    }, 6000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 pointer-events-none">
      <svg width="200" height="300" viewBox="0 0 200 300" className="drop-shadow-[0_0_30px_rgba(0,255,136,0.5)]">
        <defs>
          <linearGradient id="beamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(0,255,200,0.8)" />
            <stop offset="50%" stopColor="rgba(0,255,200,0.3)" />
            <stop offset="100%" stopColor="rgba(0,255,200,0)" />
          </linearGradient>
          <linearGradient id="ufoMainGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" />
            <stop offset="100%" stopColor="#005533" />
          </linearGradient>
        </defs>
        
        {beamActive && (
          <polygon points="70,50 130,50 160,300 40,300" fill="url(#beamGradient)" className="animate-pulse" />
        )}
        
        <ellipse cx="100" cy="35" rx="70" ry="20" fill="url(#ufoMainGradient)" />
        <ellipse cx="100" cy="28" rx="35" ry="22" fill="#66ffaa" opacity="0.5" />
        <ellipse cx="100" cy="25" rx="28" ry="17" fill="#88ffcc" opacity="0.3" />
        <ellipse cx="100" cy="28" rx="12" ry="15" fill="#003322" opacity="0.6" />
        
        {[30, 55, 80, 105, 130, 155].map((x, i) => (
          <circle key={i} cx={x} cy="42" r="5" fill={beamActive ? "#00ffff" : "#00aa88"} className={beamActive ? "animate-ping" : "animate-pulse"} style={{ animationDelay: `${i * 0.15}s` }} />
        ))}
        
        <ellipse cx="100" cy="45" rx="55" ry="10" fill="#003322" />
        <ellipse cx="100" cy="50" rx="30" ry="5" fill="#002211" />
      </svg>
    </div>
  );
};

// Main Landing Page Component
const Landing = () => {
  const [formData, setFormData] = useState({ name: '', email: '', goal: '' });
  const [submitted, setSubmitted] = useState(false);
  const heroText = useTypingEffect('Autonomous software engineering that actually ships.', 40, 800);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono&display=swap');
        
        * { font-family: 'Rajdhani', sans-serif; }
        html { scroll-behavior: smooth; }
        h1, h2, h3, .font-display { font-family: 'Orbitron', sans-serif; }
        .font-mono { font-family: 'Space Mono', monospace; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes flyLeft {
          0% { left: 110%; }
          100% { left: -20%; }
        }
        
        @keyframes flyRight {
          0% { left: -20%; }
          100% { left: 110%; }
        }
        
        @keyframes shootingStar {
          0% { transform: translateX(0) translateY(0); opacity: 1; }
          100% { transform: translateX(-200px) translateY(200px); opacity: 0; }
        }
        
        @keyframes borderPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.8; }
        }
        
        @keyframes wave {
          0%, 100% { transform: rotate(-5deg); }
          50% { transform: rotate(5deg); }
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #00ff88 0%, #00ddff 50%, #8844ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .cyber-button {
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        
        .cyber-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s ease;
        }
        
        .cyber-button:hover::before { left: 100%; }
        
        .cyber-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 40px rgba(0, 255, 136, 0.6), 0 10px 40px rgba(0, 255, 136, 0.3);
        }
        
        .card-hover {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        
        .card-hover:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 0 50px rgba(0, 255, 136, 0.3);
        }
        
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #0a0a0a; }
        ::-webkit-scrollbar-thumb { background: linear-gradient(180deg, #00ff88, #00ddff); border-radius: 4px; }
      `}</style>
      
      <ParticleField />
      <ShootingStars />
      
      <Planet size={150} color="#8844ff" top="10%" left="5%" />
      <Planet size={80} color="#00ddff" rings top="60%" right="10%" />
      <Planet size={200} color="#00ff88" top="80%" left="20%" />
      
      <FlyingUFO delay={0} top="15%" direction="left" />
      <FlyingUFO delay={8} top="45%" direction="right" />
      <FlyingUFO delay={15} top="75%" direction="left" />
      
      <MiniAlien style={{ top: '25%', left: '5%' }} delay={0} />
      <MiniAlien style={{ top: '55%', right: '8%' }} delay={1} />
      <MiniAlien style={{ top: '85%', left: '15%' }} delay={2} />
      <MiniAlien style={{ top: '40%', left: '90%' }} delay={0.5} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/5 mb-8 backdrop-blur-sm">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-400 text-sm tracking-widest font-mono">PRE-RELEASE ACCESS OPEN</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black mb-6 leading-none">
                <GlitchText>
                  <span className="text-gradient">NO HYPE.</span>
                </GlitchText>
                <br />
                <span className="text-white">REAL CODE.</span>
              </h1>
              
              <div className="h-16 mb-8">
                <p className="text-xl sm:text-2xl text-white/90 font-light tracking-wide">
                  {heroText}
                  <span className="inline-block w-3 h-6 bg-emerald-400 ml-1 animate-pulse" />
                </p>
              </div>
              
              <p className="text-lg text-white/70 mb-10 max-w-xl leading-relaxed">
                ZipLogic AI is an autonomous multi-agent system that plans, writes, and assembles full working applications from a single prompt. Smart templates when useful, custom code when needed. No smoke and mirrors.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a href="#waitlist" className="cyber-button group relative bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-10 py-5 rounded-lg font-bold text-lg tracking-wider flex items-center justify-center gap-3 cursor-pointer">
                  <span>JOIN WAITLIST</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
                <a href="#systems" className="cyber-button border border-white/30 bg-white/5 backdrop-blur-sm text-white px-10 py-5 rounded-lg font-semibold text-lg tracking-wider hover:border-emerald-500/50 cursor-pointer">
                  VIEW ARCHITECTURE
                </a>
              </div>
            </div>
            
            <div className="relative flex justify-center items-center">
              <div className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-transparent to-transparent rounded-full blur-3xl" />
              <AlienMascot size={350} className="relative z-10" style={{ animation: 'float 4s ease-in-out infinite' }} />
              
              <div className="absolute w-full h-full" style={{ animation: 'spin 20s linear infinite' }}>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50" />
              </div>
              <div className="absolute w-[120%] h-[120%]" style={{ animation: 'spin 30s linear infinite reverse' }}>
                <div className="absolute top-1/4 right-0 w-3 h-3 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50" />
              </div>
              
              <div className="absolute -top-8 -right-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl rounded-bl-none px-4 py-2">
                <p className="text-emerald-400 text-sm font-mono">Hello, humans! 👋</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto mt-20">
            {[
              { label: 'ARCHITECTURE', value: 'Architect → Developer → Tester → Reviewer' },
              { label: 'OUTPUT', value: 'Full working applications' },
              { label: 'APPROACH', value: 'Deterministic & reproducible' }
            ].map((stat, i) => (
              <div key={i} className="p-4 rounded-lg border border-white/20 bg-white/5 backdrop-blur-sm text-center">
                <p className="text-emerald-400 text-xs tracking-widest mb-1 font-mono">{stat.label}</p>
                <p className="text-white text-sm">{stat.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/50 text-xs tracking-widest">SCROLL</span>
          <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Workflow Demo with UFO Beam */}
      <section id="protocol" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm tracking-widest font-mono mb-4">// EXECUTION_PROTOCOL</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">MULTI-AGENT</span> <span className="text-white">PIPELINE</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">Watch the autonomous loop execute: plan, write, test, review, deploy.</p>
          </div>

          <div className="relative">
            <UFOWithBeam />
            
            <AnimatedBorder className="max-w-4xl mx-auto mt-16">
              <div className="p-8 rounded-2xl">
                <div className="flex items-center gap-2 mb-6 pb-4 border-b border-white/20">
                  <div className="flex gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-white/60 text-sm font-mono ml-4">ziplogic_agent_v1.exe</span>
                  <span className="ml-auto text-emerald-400 text-xs font-mono animate-pulse">● LIVE</span>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <p className="text-emerald-400 text-xs tracking-widest mb-4 font-mono">AGENT_PIPELINE</p>
                    <div className="space-y-3">
                      {[
                        { agent: 'Architect', task: 'Plans structure & dependencies' },
                        { agent: 'Developer', task: 'Writes production code' },
                        { agent: 'Tester', task: 'Validates functionality' },
                        { agent: 'Reviewer', task: 'Quality assurance & optimization' }
                      ].map((step, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 rounded-lg bg-white/5 border border-white/20 hover:border-emerald-500/50 transition-colors">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <span className="text-white font-semibold">{step.agent}</span>
                            <span className="text-white/60 ml-2">— {step.task}</span>
                          </div>
                          <span className="text-emerald-400 text-xs font-mono">DONE</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-cyan-400 text-xs tracking-widest mb-4 font-mono">OUTPUT_ARTIFACTS</p>
                    <div className="p-6 rounded-lg bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-white/20">
                      <div className="space-y-4">
                        {[
                          { icon: '📁', label: 'Complete project structure' },
                          { icon: '⚙️', label: 'Working codebase with dependencies' },
                          { icon: '🧪', label: 'Test suite included' },
                          { icon: '🚀', label: 'Deploy-ready application' }
                        ].map((output, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xl">{output.icon}</span>
                            <span className="text-white/90">{output.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-6 p-4 rounded-lg border border-dashed border-purple-500/40 bg-purple-500/5">
                      <p className="text-sm text-white/70">
                        <span className="text-purple-400 font-mono text-xs">// NOTE:</span> Every run is <span className="text-emerald-400">deterministic</span> — same input always produces same output. Fully reproducible builds.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedBorder>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="systems" className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm tracking-widest font-mono mb-4">// SYSTEM_CAPABILITIES</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">WHAT</span> <span className="text-white">ZipLogic AI DOES</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">Autonomous development that delivers real, working software.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: '🏗️', title: 'FULL APPLICATION GENERATION', desc: 'From a single prompt to complete working applications. Architecture, code, tests, and documentation — generated through intelligent agent collaboration.', color: '#00ff88' },
              { icon: '🔄', title: 'SMART TEMPLATES + CUSTOM CODE', desc: 'Uses proven templates when they fit, generates custom code when needed. Best of both worlds for speed and flexibility.', color: '#00ddff' },
              { icon: '🤖', title: 'MULTI-AGENT ARCHITECTURE', desc: 'Built on LangGraph. Architect plans, Developer codes, Tester validates, Reviewer optimizes. Each agent specialized for its role.', color: '#8844ff' },
              { icon: '⚡', title: 'DETERMINISTIC & REPRODUCIBLE', desc: 'Same prompt always produces the same result. Fully testable, debuggable, and production-ready outputs.', color: '#ff4488' }
            ].map((feature, i) => (
              <div key={i} className="card-hover p-8 rounded-2xl border border-white/20 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm" style={{ borderColor: `${feature.color}40` }}>
                <span className="text-4xl mb-6 block">{feature.icon}</span>
                <h3 className="font-display font-bold text-xl mb-3 tracking-wide text-white">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="relative py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm tracking-widest font-mono mb-4">// TARGET_OPERATORS</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-white">BUILT FOR</span> <span className="text-gradient">BUILDERS</span>
            </h2>
            <p className="text-white/70 max-w-xl mx-auto">If you ship software, this is for you.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { title: 'AGENCIES', icon: '🏢', points: ['Ship client projects faster', 'Consistent code quality across projects', 'Turn your process into repeatable workflows'] },
              { title: 'STARTUPS', icon: '🚀', points: ['MVP in days, not weeks', 'Production-quality from day one', 'Iterate without rebuilding'] },
              { title: 'DEVELOPERS', icon: '💻', points: ['Extend and customize the output', 'Skip boilerplate, focus on logic', 'Reproducible starting points'] }
            ].map((persona, i) => (
              <div key={i} className="card-hover p-8 rounded-2xl border border-white/20 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm relative overflow-hidden">
                <span className="text-4xl mb-6 block">{persona.icon}</span>
                <h3 className="font-display font-bold text-xl mb-6 tracking-wide text-gradient">{persona.title}</h3>
                <ul className="space-y-4">
                  {persona.points.map((point, j) => (
                    <li key={j} className="flex items-start gap-3 text-white/80">
                      <span className="text-emerald-400 mt-1">→</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist Form */}
      <section id="waitlist" className="relative py-32 px-6">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-emerald-400 text-sm tracking-widest font-mono mb-4">// GET_ACCESS</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-white">JOIN THE</span> <span className="text-gradient">WAITLIST</span>
            </h2>
            <p className="text-white/70">Get notified when early access opens. We onboard in stages to ensure quality.</p>
          </div>

          <div className="relative">
            <div className="absolute -top-16 -right-8 z-20">
              <AlienMascot size={80} style={{ animation: 'float 3s ease-in-out infinite' }} />
            </div>

            {!submitted ? (
              <AnimatedBorder className="w-full">
                <form onSubmit={handleSubmit} className="p-8 rounded-2xl">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-emerald-400 text-xs tracking-widest mb-2 font-mono">YOUR_NAME</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-400 text-xs tracking-widest mb-2 font-mono">YOUR_EMAIL</label>
                      <input
                        type="email"
                        placeholder="you@company.com"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-emerald-400 text-xs tracking-widest mb-2 font-mono">WHAT_ARE_YOU_BUILDING</label>
                      <textarea
                        placeholder="What kind of applications do you want to generate?"
                        value={formData.goal}
                        onChange={(e) => setFormData({...formData, goal: e.target.value})}
                        rows={3}
                        className="w-full px-4 py-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none"
                      />
                    </div>
                    <button type="submit" className="cyber-button w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-black py-5 rounded-lg font-display font-bold text-lg tracking-wider">
                      🛸 JOIN WAITLIST
                    </button>
                  </div>
                  <p className="text-xs text-white/50 text-center mt-6 font-mono">
                    // No spam. Only access updates + milestone announcements.
                  </p>
                </form>
              </AnimatedBorder>
            ) : (
              <AnimatedBorder className="w-full">
                <div className="p-12 rounded-2xl text-center">
                  <div className="mb-6">
                    <AlienMascot size={120} className="mx-auto" />
                  </div>
                  <h3 className="font-display text-2xl font-bold mb-2 text-gradient">YOU'RE ON THE LIST!</h3>
                  <p className="text-white/70">We'll notify you when early access opens.</p>
                </div>
              </AnimatedBorder>
            )}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="relative py-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-emerald-400 text-sm tracking-widest font-mono mb-4">// COMMON_QUESTIONS</p>
            <h2 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              <span className="text-gradient">FAQ</span>
            </h2>
          </div>

          <div className="space-y-4">
            {[
              { q: 'What is ZipLogic AI?', a: 'ZipLogic AI is an autonomous multi-agent software engineering system built on LangGraph. It takes a single prompt and generates complete, working applications through a coordinated pipeline of specialized AI agents: Architect, Developer, Tester, and Reviewer.' },
              { q: 'Does it use templates?', a: 'Yes, intelligently. ZipLogic AI uses proven templates when they fit the task for speed and reliability, and generates custom code when needed for flexibility. It picks the best approach for each situation.' },
              { q: 'How is this different from other AI coding tools?', a: 'Most AI tools generate snippets or assist with code. ZipLogic AI generates entire applications end-to-end with a multi-agent pipeline. Our system is deterministic — same input always produces same output — making it reproducible and production-ready.' },
              { q: 'When does it launch?', a: "We're onboarding in stages. Waitlist members get notified first when access windows open. We prioritize quality over speed." }
            ].map((faq, i) => (
              <div key={i} className="p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm hover:border-emerald-500/30 transition-colors">
                <h3 className="font-display font-semibold text-lg mb-2 flex items-center gap-3 text-white">
                  <span className="text-emerald-400 font-mono text-sm">Q{i + 1}</span>
                  {faq.q}
                </h3>
                <p className="text-white/70 ml-8">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-6 border-t border-white/20">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 64 64" className="w-8 h-8 rounded-lg" style={{ filter: 'drop-shadow(0 0 10px rgba(0, 255, 136, 0.5))' }}>
              <rect x="0" y="0" width="64" height="64" rx="12" fill="#0a1628"/>
              <path d="M16 18h32l-24 28h24v-6H24l24-28H16v6z" fill="#ffffff"/>
              <ellipse cx="20" cy="52" rx="6" ry="4" fill="#00ffaa"/>
              <ellipse cx="44" cy="52" rx="6" ry="4" fill="#00ffaa"/>
            </svg>
            <span className="font-display font-semibold tracking-wide">
              <span className="text-gradient">ZIPLOGIC</span>
              <span className="text-white/60 ml-1">AI</span>
            </span>
          </div>
          <p className="text-sm text-white/50 font-mono">
            © 2025 ZIPLOGIC AI // AUTONOMOUS SOFTWARE ENGINEERING
          </p>
          <p className="text-xs text-white/40">
            Built by <span className="text-emerald-400/80 font-semibold">Pascat Graphics & Marketing Company</span>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
