import React, { useState, useEffect, useRef, useCallback } from 'react';

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PARTICLE FIELD
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current, ctx = canvas.getContext('2d');
    let raf, particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const init = () => {
      particles = Array.from({ length: Math.floor((canvas.width * canvas.height) / 22000) }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 0.5, opacity: Math.random() * 0.5 + 0.2,
        pulse: Math.random() * Math.PI * 2,
        color: Math.random() > 0.7 ? '#00ff88' : Math.random() > 0.5 ? '#00ddff' : '#8844ff'
      }));
    };
    const draw = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.02;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const po = p.opacity * (0.5 + 0.5 * Math.sin(p.pulse));
        const r = parseInt(p.color.slice(1,3),16), g = parseInt(p.color.slice(3,5),16), b = parseInt(p.color.slice(5,7),16);
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius*(1+0.3*Math.sin(p.pulse)), 0, Math.PI*2);
        ctx.fillStyle = `rgba(${r},${g},${b},${po})`; ctx.shadowBlur = 15; ctx.shadowColor = p.color; ctx.fill(); ctx.shadowBlur = 0;
        particles.slice(i+1, i+8).forEach(p2 => {
          const dx = p.x-p2.x, dy = p.y-p2.y, dist = Math.sqrt(dx*dx+dy*dy);
          if (dist < 100) { ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.strokeStyle = `rgba(0,255,136,${0.1*(1-dist/100)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    resize(); init(); draw();
    const onR = () => { resize(); init(); };
    window.addEventListener('resize', onR);
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', onR); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, #000000 0%, #020a14 30%, #041220 60%, #000a10 100%)' }} />;
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ALIEN MASCOT
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AlienMascot = ({ size = 200, className = '', style = {} }) => {
  const [blink, setBlink] = useState(false);
  const [look, setLook] = useState({ x: 0, y: 0 });
  const [happy, setHappy] = useState(false);
  const u = useRef('a' + Math.random().toString(36).slice(2,7)).current;
  useEffect(() => {
    const b = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3000 + Math.random()*2000);
    const h = setInterval(() => { setHappy(true); setTimeout(() => setHappy(false), 2000); }, 8000 + Math.random()*4000);
    const m = (e) => setLook({ x: (e.clientX/window.innerWidth-0.5)*15, y: (e.clientY/window.innerHeight-0.5)*10 });
    window.addEventListener('mousemove', m);
    return () => { clearInterval(b); clearInterval(h); window.removeEventListener('mousemove', m); };
  }, []);
  return (
    <div className={`relative ${className}`} style={{ width: size, height: size, ...style }}>
      <svg viewBox="0 0 200 200" className="w-full h-full">
        <defs>
          <filter id={`glow${u}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          <linearGradient id={`bg${u}`} x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88"/><stop offset="50%" stopColor="#00dd77"/><stop offset="100%" stopColor="#00aa55"/></linearGradient>
          <linearGradient id={`bd${u}`} x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00cc66"/><stop offset="100%" stopColor="#008844"/></linearGradient>
          <radialGradient id={`eg${u}`} cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff"/><stop offset="30%" stopColor="#00ffff"/><stop offset="100%" stopColor="#0088aa"/></radialGradient>
          <radialGradient id={`hs${u}`} cx="30%" cy="20%" r="60%"><stop offset="0%" stopColor="#88ffcc" stopOpacity="0.6"/><stop offset="100%" stopColor="#00ff88" stopOpacity="0"/></radialGradient>
        </defs>
        <ellipse cx="103" cy="145" rx="45" ry="20" fill="#000" opacity="0.3"/>
        <g filter={`url(#glow${u})`}>
          <path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill={`url(#bd${u})`}/>
          <ellipse cx="100" cy="75" rx="55" ry="50" fill={`url(#bg${u})`}/>
          <ellipse cx="100" cy="75" rx="55" ry="50" fill={`url(#hs${u})`}/>
        </g>
        <g opacity="0.6"><path d="M75 45 L125 45 L82 72 L125 72" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round"/></g>
        <ellipse cx="70" cy="85" rx="22" ry="18" fill="#002815"/><ellipse cx="130" cy="85" rx="22" ry="18" fill="#002815"/>
        <g style={{ transform: `translate(${look.x}px, ${look.y}px)`, transition: 'transform 0.1s ease-out' }}>
          <ellipse cx="70" cy="85" rx="18" ry={blink?2:14} fill={`url(#eg${u})`} className="transition-all duration-100"/>
          {!blink&&<><ellipse cx="72" cy="85" rx="7" ry="9" fill="#001a1a"/><ellipse cx="68" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9"/></>}
          <ellipse cx="130" cy="85" rx="18" ry={blink?2:14} fill={`url(#eg${u})`} className="transition-all duration-100"/>
          {!blink&&<><ellipse cx="132" cy="85" rx="7" ry="9" fill="#001a1a"/><ellipse cx="128" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9"/></>}
        </g>
        <g><path d="M100 25 Q100 15 100 10" stroke="#00dd77" strokeWidth="3" fill="none" strokeLinecap="round"/><circle cx="100" cy="8" r="5" fill="#00ffff" className="animate-pulse"/></g>
        <g opacity="0.8">
          <path d="M55 45 Q45 35 40 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="38" cy="28" r="3" fill="#00ffaa" className="animate-pulse" style={{animationDelay:'0.5s'}}/>
          <path d="M145 45 Q155 35 160 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round"/><circle cx="162" cy="28" r="3" fill="#00ffaa" className="animate-pulse" style={{animationDelay:'1s'}}/>
        </g>
        {happy?<path d="M80 120 Q100 140 120 120" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round"/>:<path d="M85 118 Q100 130 115 118" stroke="#003322" strokeWidth="3" fill="none" strokeLinecap="round"/>}
        <g className="origin-center" style={{animation:'wave 2s ease-in-out infinite'}}><ellipse cx="55" cy="140" rx="8" ry="6" fill="#00dd77"/><circle cx="50" cy="138" r="3" fill="#00cc66"/></g>
        <g><ellipse cx="145" cy="140" rx="8" ry="6" fill="#00dd77"/><circle cx="150" cy="138" r="3" fill="#00cc66"/></g>
      </svg>
    </div>
  );
};

const ShootingStars = () => (<div className="fixed inset-0 pointer-events-none overflow-hidden z-0">{[...Array(4)].map((_,i)=>(<div key={i} className="absolute w-1 h-1 bg-white rounded-full" style={{top:`${Math.random()*50}%`,left:`${Math.random()*100}%`,animation:`shootingStar ${2+Math.random()*2}s linear infinite`,animationDelay:`${i*3+Math.random()*5}s`,boxShadow:'0 0 6px 2px rgba(255,255,255,0.5),-30px 0 20px 2px rgba(255,255,255,0.3)'}}/>))}</div>);
const ScanLine = () => (<div className="fixed inset-0 pointer-events-none z-20 overflow-hidden"><div className="absolute w-full h-px bg-emerald-400/[0.07]" style={{animation:'scanline 6s linear infinite'}}/></div>);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   HUD COMPONENTS
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const cn = (...c) => c.filter(Boolean).join(' ');

const HUDFrame = ({children, className='', color='#00ff88'}) => (
  <div className={`relative ${className}`}>
    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2" style={{borderColor:color}}/>
    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2" style={{borderColor:color}}/>
    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2" style={{borderColor:color}}/>
    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2" style={{borderColor:color}}/>
    {children}
  </div>
);

const TerminalBlock = ({tag, children}) => (
  <div className="rounded-xl overflow-hidden border border-cyan-500/20 bg-black/70 backdrop-blur-md">
    <div className="flex items-center gap-2 px-5 py-3 border-b border-cyan-500/10 bg-cyan-500/[0.03]">
      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80"/><span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"/><span className="w-2.5 h-2.5 rounded-full bg-green-500/80"/>
      <span className="text-cyan-400/60 text-[10px] font-mono ml-3 tracking-widest">{tag}</span>
      <span className="ml-auto text-emerald-400 text-[10px] font-mono animate-pulse flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>LIVE</span>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

const Collapse = ({title, children, defaultOpen=false, badge}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-cyan-500/10 rounded-lg overflow-hidden bg-cyan-500/[0.02] hover:border-cyan-500/20 transition-colors">
      <button onClick={()=>setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-cyan-500/[0.03] transition-colors">
        <span className={cn("text-emerald-400 font-mono text-xs transition-transform duration-300",open&&"rotate-90")}>â–¶</span>
        <span className="text-white font-semibold text-sm tracking-wide flex-1">{title}</span>
        {badge&&<span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded border border-yellow-500/30 text-yellow-400/70 bg-yellow-500/[0.05]">{badge}</span>}
        <span className={cn("text-[10px] font-mono tracking-widest",open?"text-emerald-400":"text-white/15")}>{open?"[OPEN]":"[LOCKED]"}</span>
      </button>
      <div className={cn("grid transition-all duration-500",open?"grid-rows-[1fr] opacity-100":"grid-rows-[0fr] opacity-0")}><div className="overflow-hidden">
        <div className="px-5 pb-5 text-white/70 text-sm leading-relaxed space-y-3 border-t border-cyan-500/10 pt-4">{children}</div>
      </div></div>
    </div>
  );
};

const EmojiRating = ({value, onChange}) => (
  <div className="flex gap-3 flex-wrap">{[{e:'ðŸ˜¤',l:'HOSTILE',v:1},{e:'ðŸ˜•',l:'ROUGH',v:2},{e:'ðŸ˜',l:'NEUTRAL',v:3},{e:'ðŸ˜Š',l:'SOLID',v:4},{e:'ðŸ¤©',l:'LETHAL',v:5}].map(o=>(
    <button key={o.v} onClick={()=>onChange(o.v)} className={cn("flex flex-col items-center gap-1.5 px-4 py-3 rounded-lg border transition-all duration-300",value===o.v?"border-emerald-400 bg-emerald-500/10 scale-110":"border-cyan-500/10 hover:border-cyan-500/30 bg-cyan-500/[0.02] hover:scale-105")}>
      <span className="text-3xl">{o.e}</span><span className="text-[10px] text-cyan-400/50 font-mono tracking-wider">{o.l}</span>
    </button>
  ))}</div>
);

const NPSScale = ({value, onChange}) => (
  <div className="space-y-3">
    <div className="flex gap-1">{[...Array(11)].map((_,i)=>(
      <button key={i} onClick={()=>onChange(i)} className={cn("flex-1 py-3 rounded text-xs font-mono transition-all duration-200 border",value===i?"border-emerald-400 bg-emerald-500/20 text-emerald-400 scale-110":"border-cyan-500/10 bg-cyan-500/[0.02] text-cyan-400/30 hover:border-cyan-500/30")}>{i}</button>
    ))}</div>
    <div className="flex justify-between text-[10px] text-cyan-400/20 font-mono tracking-widest"><span>WOULD NOT DEPLOY</span><span>WOULD DIE FOR</span></div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   NAV CONFIG
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const NAV = [
  { group:'RED_CLEARANCE', color:'#ff4444', items:[
    {id:'privacy',icon:'ðŸ›¡ï¸',label:'Privacy Shield (GDPR)'},
    {id:'terms',icon:'ðŸ“œ',label:'Terms of Service'},
    {id:'bug-report',icon:'ðŸ›',label:'Incident Report'},
    {id:'feedback',icon:'ðŸ’¬',label:'Beta Intel'},
  ]},
  { group:'EU_COMPLIANCE', color:'#0088ff', items:[
    {id:'gdpr',icon:'ðŸ‡ªðŸ‡º',label:'GDPR Compliance'},
    {id:'ai-act',icon:'ðŸ¤–',label:'EU AI Act'},
    {id:'dsa',icon:'ðŸ“¡',label:'Digital Services Act'},
    {id:'data-act',icon:'ðŸ’¾',label:'EU Data Act'},
    {id:'dpa',icon:'ðŸ“‹',label:'Data Processing Agmt'},
  ]},
  { group:'YELLOW_CLEARANCE', color:'#ffaa00', items:[
    {id:'acceptable-use',icon:'âš–ï¸',label:'Rules of Engagement'},
    {id:'cookies',icon:'ðŸª',label:'Cookie Protocol'},
    {id:'contact',icon:'ðŸ“¡',label:'Comms Channel'},
    {id:'about',icon:'ðŸ›¸',label:'Ship Manifest'},
    {id:'docs',icon:'ðŸ“–',label:'Tech Manual'},
  ]},
  { group:'GREEN_CLEARANCE', color:'#00ff88', items:[
    {id:'changelog',icon:'ðŸ“‹',label:'Ship Log'},
    {id:'status',icon:'ðŸ“Š',label:'Diagnostics'},
  ]},
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN COMMAND CENTER
â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
export default function CommandCenter() {
  const [active, setActive] = useState('privacy');
  const [sideOpen, setSideOpen] = useState(false);
  const mainRef = useRef(null);
  const [kills, setKills] = useState(0);
  const [time, setTime] = useState('');

  const [bugForm, setBugForm] = useState({category:'',severity:'',description:'',steps:'',project:'',email:''});
  const [bugDone, setBugDone] = useState(false);
  const [fbForm, setFbForm] = useState({rating:null,changes:'',feature:'',hadBugs:null,bugDetail:'',nps:null});
  const [fbDone, setFbDone] = useState(false);
  const [cForm, setCForm] = useState({name:'',email:'',subject:'',message:''});
  const [cDone, setCDone] = useState(false);

  const [speech, setSpeech] = useState('Welcome aboard, human!');
  const speeches = {'privacy':'Your data is safe with us! ðŸ›¡ï¸','terms':'Read the fine print, pilot!','bug-report':'Report hostile anomalies! ðŸ”§','feedback':'Intel requested, soldier!','gdpr':'GDPR fortress activated! ðŸ‡ªðŸ‡º','ai-act':'AI Act compliance online! ðŸ¤–','dsa':'Digital Services Act loaded!','data-act':'Data Act protocols engaged! ðŸ’¾','dpa':'Processing agreement ready! ðŸ“‹','acceptable-use':'Rules of engagement active! âš–ï¸','cookies':'Digital rations scanned! ðŸª','contact':'Open comms channel! ðŸ“¡','about':'Ship manifest loaded! ðŸ›¸','docs':'Study the manual, recruit! ðŸ“–','changelog':'Mission log updated! âœ¨','status':'All systems nominal! ðŸš€'};

  useEffect(() => {
    const t = setInterval(() => setTime(new Date().toLocaleTimeString('en-US',{hour12:false})), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const el = mainRef.current; if (!el) return;
    const onScroll = () => {
      const secs = el.querySelectorAll('section[id]'); let cur = active;
      secs.forEach(s => { if (s.offsetTop - el.scrollTop < 250) cur = s.id; });
      if (cur !== active) { setActive(cur); setSpeech(speeches[cur]||'Exploring...'); }
    };
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, [active]);

  const goTo = useCallback((id) => {
    setActive(id); setSideOpen(false); setSpeech(speeches[id]||'');
    setKills(k => k + 1);
    document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
  }, []);

  const inp = "w-full bg-cyan-500/[0.04] border border-cyan-500/15 rounded-lg px-4 py-3.5 text-white text-sm font-mono placeholder:text-cyan-400/20 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20 transition-all duration-300";
  const btnP = "cyber-button bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-3.5 rounded-lg font-display font-bold text-xs tracking-[0.2em]";

  return (
    <div className="h-screen w-full bg-black text-white overflow-hidden flex flex-col">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
        *{font-family:'Rajdhani',sans-serif;box-sizing:border-box}
        html{scroll-behavior:smooth}
        h1,h2,h3,h4,.font-display{font-family:'Orbitron',sans-serif}
        .font-mono{font-family:'Space Mono',monospace}
        .text-gradient{background:linear-gradient(135deg,#00ff88 0%,#00ddff 50%,#8844ff 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
        .cyber-button{position:relative;overflow:hidden;transition:all 0.3s ease}
        .cyber-button::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent);transition:left 0.5s ease}
        .cyber-button:hover::before{left:100%}
        .cyber-button:hover{transform:translateY(-2px);box-shadow:0 0 40px rgba(0,255,136,0.5)}
        .card-hover{transition:all 0.4s cubic-bezier(0.175,0.885,0.32,1.275)}
        .card-hover:hover{transform:translateY(-6px) scale(1.01);box-shadow:0 0 40px rgba(0,255,136,0.1)}
        @keyframes float{0%,100%{transform:translateY(0px)}50%{transform:translateY(-20px)}}
        @keyframes shootingStar{0%{transform:translateX(0) translateY(0);opacity:1}100%{transform:translateX(-200px) translateY(200px);opacity:0}}
        @keyframes wave{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
        @keyframes scanline{0%{top:-2%}100%{top:102%}}
        @keyframes holo{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00ff88,#00ddff);border-radius:2px}
      `}</style>

      <ParticleField/><ShootingStars/><ScanLine/>

      {/* â•â•â• TOP BAR â•â•â• */}
      {/* <header className="relative z-50 flex items-center gap-4 px-4 sm:px-6 py-2.5 border-b border-cyan-500/15 bg-black/70 backdrop-blur-xl shrink-0">
        <button onClick={()=>setSideOpen(!sideOpen)} className="lg:hidden p-2 rounded border border-cyan-500/20 hover:border-emerald-500/40 transition-all">
          <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sideOpen?"M6 18L18 6M6 6l12 12":"M4 6h16M4 12h16M4 18h16"}/></svg>
        </button>
        <div className="flex items-center gap-3">
          <AlienMascot size={32}/>
          <div>
            <h1 className="font-display text-xs sm:text-sm font-bold tracking-[0.15em]"><span className="text-gradient">ZIP LOGIC AI</span></h1>
            <p className="text-[9px] text-cyan-400/30 font-mono tracking-[0.3em]">COMMAND CENTER // EU COMPLIANT</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-5">
          <div className="hidden sm:block text-right">
            <p className="text-[9px] font-mono text-cyan-400/30 tracking-widest">// SECTIONS</p>
            <p className="font-display text-2xl font-black text-emerald-400 leading-none" style={{textShadow:'0 0 20px rgba(0,255,136,0.4)'}}>{kills}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded border border-emerald-500/20 bg-emerald-500/[0.03]">
            <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative rounded-full h-2 w-2 bg-emerald-500"/></span>
            <span className="text-emerald-400 text-[10px] font-mono tracking-widest">BETA v0.9</span>
          </div>
          <a href="/" className="text-cyan-400/30 hover:text-emerald-400 text-[10px] font-mono tracking-widest transition-colors">â† BRIDGE</a>
        </div>
      </header> */}

      {/* â•â•â• BODY â•â•â• */}
      <div className="flex flex-1 overflow-hidden relative z-10">

        {/* â•â•â• SIDEBAR â•â•â• */}
        <aside className={cn(
          "absolute lg:relative z-30 h-full w-72 border-r border-cyan-500/10 bg-black/95 lg:bg-[#020a14]/80 backdrop-blur-2xl transition-transform duration-300 shrink-0 flex flex-col",
          sideOpen?"translate-x-0":"-translate-x-full lg:translate-x-0"
        )}>
          <div className="px-4 pt-4 pb-3 border-b border-cyan-500/10">
            <div className="flex items-start gap-3">
              <AlienMascot size={48} style={{animation:'float 4s ease-in-out infinite'}}/>
              <div className="flex-1 bg-cyan-500/[0.05] border border-cyan-500/15 rounded-xl rounded-bl-none px-3 py-2">
                <p className="text-emerald-400 text-[11px] font-mono leading-tight">{speech}</p>
              </div>
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-5">
            {NAV.map(g=>(
              <div key={g.group}>
                <p className="text-[9px] font-mono tracking-[0.25em] px-2 mb-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor:g.color,boxShadow:`0 0 6px ${g.color}60`}}/>
                  <span style={{color:g.color,opacity:0.5}}>{g.group}</span>
                </p>
                <div className="space-y-0.5">{g.items.map(item=>(
                  <button key={item.id} onClick={()=>goTo(item.id)} className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-sm transition-all duration-300",
                    active===item.id?"bg-emerald-500/[0.08] border border-emerald-500/25 text-emerald-400":"text-cyan-400/40 hover:text-cyan-400/80 hover:bg-cyan-500/[0.03] border border-transparent"
                  )}>
                    <span className="text-sm">{item.icon}</span><span className="tracking-wide text-[13px]">{item.label}</span>
                    {active===item.id&&<span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" style={{boxShadow:'0 0 8px rgba(0,255,136,0.8)'}}/>}
                  </button>
                ))}</div>
              </div>
            ))}
          </nav>
          <div className="px-4 py-3 border-t border-cyan-500/10 space-y-2">
            <div className="flex items-center justify-between text-[9px] font-mono text-cyan-400/20 tracking-widest"><span>SHIELDS</span><span className="text-emerald-400">ARMED</span></div>
            <div className="h-1 bg-cyan-500/10 rounded-full overflow-hidden"><div className="h-full w-full rounded-full" style={{background:'linear-gradient(90deg,#00ff88,#00ddff,#8844ff)',backgroundSize:'200% 100%',animation:'holo 3s ease infinite'}}/></div>
          </div>
        </aside>

        {sideOpen&&<div className="lg:hidden absolute inset-0 z-20 bg-black/80 backdrop-blur-sm" onClick={()=>setSideOpen(false)}/>}

        {/* â•â•â• MAIN â•â•â• */}
        <main ref={mainRef} className="flex-1 overflow-y-auto relative">
          <div className="relative z-10 max-w-4xl mx-auto px-5 sm:px-8 py-10 space-y-24">

            {/* â•â•â• PRIVACY SHIELD â•â•â• */}
            <section id="privacy" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6"><span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative rounded-full h-2 w-2 bg-emerald-400"/></span><span className="text-emerald-400 text-[10px] font-mono tracking-[0.3em]">PRIVACY MATRIX â€” GDPR ALIGNED</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2 tracking-wide">PRIVACY <span className="text-gradient">SHIELD</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">LAST_UPDATED: 2026-02-06 // GDPR + ePrivacy Directive // CLASSIFICATION: PUBLIC</p>

              <HUDFrame color="#00ddff" className="p-6 mb-8 bg-cyan-500/[0.03]"><div className="flex items-start gap-5">
                <div className="shrink-0 hidden sm:block"><AlienMascot size={70} style={{animation:'float 4s ease-in-out infinite'}}/></div>
                <div className="text-white/80 leading-relaxed space-y-2">
                  <p>ZipLogic AI, operated by <span className="text-emerald-400 font-semibold">Pascat Graphics & Marketing Company</span> (20+ years in business), protects your data in full compliance with the <strong className="text-cyan-400">EU General Data Protection Regulation (GDPR)</strong>, the <strong className="text-cyan-400">ePrivacy Directive</strong>, and applicable EU/EEA privacy frameworks.</p>
                  <p className="text-cyan-400/40 text-xs">This policy governs data collected through ziplogic.ai and all related services, including our AI-powered autonomous code generation platform.</p>
                </div>
              </div></HUDFrame>

              <div className="space-y-2">
                <Collapse title="1. DATA CONTROLLER & CONTACT" defaultOpen>
                  <p><strong className="text-emerald-400">Controller:</strong> Pascat Graphics & Marketing Company</p>
                  <p><strong className="text-cyan-400">Data Protection Contact:</strong> <span className="font-mono">privacy@ziplogic.ai</span></p>
                  <p><strong className="text-purple-400">EU Representative:</strong> If required under GDPR Art. 27, our designated EU representative can be reached at <span className="font-mono">eu-rep@ziplogic.ai</span></p>
                  <p className="text-cyan-400/40 text-xs">We are committed to appointing a Data Protection Officer (DPO) as our EU operations scale, in accordance with GDPR Art. 37.</p>
                </Collapse>
                <Collapse title="2. DATA WE COLLECT" badge="ART. 13/14">
                  <p><strong className="text-emerald-400">Identity Data:</strong> Name, email, username, encrypted password (bcrypt/argon2). Stripe handles payment â€” we <em>never</em> store card numbers, CVVs, or full card details.</p>
                  <p><strong className="text-cyan-400">Operations Data:</strong> Projects generated, API tokens consumed, subscription tier, feature usage metrics.</p>
                  <p><strong className="text-purple-400">Technical Data:</strong> Browser type, device info, IP address (anonymized after 30 days), session cookies for authentication.</p>
                  <p><strong className="text-pink-400">AI Interaction Data:</strong> Prompts submitted and code generated through the platform, stored for service delivery and quality improvement.</p>
                  <p><strong className="text-yellow-400">Feedback Data:</strong> Bug reports, ratings, feature requests submitted during beta phase.</p>
                </Collapse>
                <Collapse title="3. LAWFUL BASIS FOR PROCESSING" badge="ART. 6">
                  <p><strong className="text-emerald-400">Contract Performance (Art. 6(1)(b)):</strong> Account management, service delivery, code generation, payment processing.</p>
                  <p><strong className="text-cyan-400">Legitimate Interest (Art. 6(1)(f)):</strong> Platform security, fraud prevention, usage analytics (with balancing test documented), license enforcement, code protection fingerprinting.</p>
                  <p><strong className="text-purple-400">Consent (Art. 6(1)(a)):</strong> Marketing communications, non-essential cookies, analytics tracking. You may withdraw consent at any time.</p>
                  <p><strong className="text-pink-400">Legal Obligation (Art. 6(1)(c)):</strong> Tax/accounting records, responding to lawful government requests, security incident reporting.</p>
                </Collapse>
                <Collapse title="4. CODE PROTECTION FINGERPRINTING">
                  <p>Generated code contains digital fingerprints, license keys, and tracking honeypots solely for <strong>license enforcement</strong>, not surveillance. This processing is based on our legitimate interest in protecting intellectual property (Art. 6(1)(f)).</p>
                  <p className="text-cyan-400/40 text-xs">We have conducted a Legitimate Interest Assessment (LIA) for this processing activity. A copy is available upon request.</p>
                </Collapse>
                <Collapse title="5. DATA PROCESSORS & TRANSFERS" badge="ART. 28/46">
                  <p><strong className="text-emerald-400">Stripe Inc.</strong> â€” Payment processing (US-based, EU-US Data Privacy Framework certified)</p>
                  <p><strong className="text-cyan-400">AI/LLM Providers</strong> â€” Code generation engines (Standard Contractual Clauses + supplementary measures in place)</p>
                  <p><strong className="text-purple-400">Email Service Provider</strong> â€” Transactional email delivery</p>
                  <p><strong className="text-pink-400">Cloud Infrastructure</strong> â€” Hosting and compute services</p>
                  <p>All processors operate under GDPR-compliant Data Processing Agreements (Art. 28). For transfers outside the EEA, we rely on: EU-US Data Privacy Framework adequacy decision, Standard Contractual Clauses (2021/914, updated 2025 SCCs), and Transfer Impact Assessments (TIAs) as required post-Schrems II.</p>
                  <p className="text-red-400 font-semibold text-xs">We do NOT sell personal data. Ever.</p>
                </Collapse>
                <Collapse title="6. DATA RETENTION & LIFECYCLE" badge="ART. 5(1)(e)">
                  <p><strong className="text-emerald-400">Active accounts:</strong> Data retained for the lifetime of your account plus 30 days post-deletion.</p>
                  <p><strong className="text-cyan-400">IP addresses:</strong> Anonymized after 30 days.</p>
                  <p><strong className="text-purple-400">Generated code/prompts:</strong> Retained for 90 days for debugging, then deleted or anonymized.</p>
                  <p><strong className="text-pink-400">Financial records:</strong> 7 years (tax/legal compliance).</p>
                  <p><strong className="text-yellow-400">Immediate purge request:</strong> Email <span className="font-mono text-emerald-400">privacy@ziplogic.ai</span> â€” processed within 30 days.</p>
                </Collapse>
                <Collapse title="7. YOUR RIGHTS (EEA/UK)" badge="ART. 15-22">
                  <p>Under GDPR, you have the right to:</p>
                  <p><strong className="text-emerald-400">Access (Art. 15)</strong> â€” Request a copy of all personal data we hold about you.</p>
                  <p><strong className="text-cyan-400">Rectification (Art. 16)</strong> â€” Correct inaccurate or incomplete data.</p>
                  <p><strong className="text-purple-400">Erasure (Art. 17)</strong> â€” Request deletion ("right to be forgotten") where legally applicable.</p>
                  <p><strong className="text-pink-400">Restriction (Art. 18)</strong> â€” Limit how we process your data while disputes are resolved.</p>
                  <p><strong className="text-yellow-400">Portability (Art. 20)</strong> â€” Receive your data in a structured, machine-readable format (JSON/CSV).</p>
                  <p><strong className="text-orange-400">Object (Art. 21)</strong> â€” Object to processing based on legitimate interests, including profiling.</p>
                  <p><strong className="text-red-400">Automated Decisions (Art. 22)</strong> â€” Right not to be subject to decisions based solely on automated processing with legal/significant effects. Our AI code generation does not make such decisions about individuals.</p>
                  <p>To exercise any right: <span className="font-mono text-emerald-400">privacy@ziplogic.ai</span> â€” Response within 30 days (extendable by 60 days for complex requests per Art. 12(3)).</p>
                  <p><strong>Right to Lodge a Complaint:</strong> You may lodge a complaint with your local Data Protection Authority (e.g., CNIL in France, BfDI in Germany, ICO in the UK).</p>
                </Collapse>
                <Collapse title="8. CCPA / US STATE PRIVACY RIGHTS">
                  <p><strong>California (CCPA/CPRA):</strong> Right to know, right to delete, right to opt out of sale/sharing. We do NOT sell or share personal information for cross-context behavioral advertising.</p>
                  <p><strong>Virginia (VCDPA), Colorado, Connecticut, + 16 more states:</strong> We honor opt-out preference signals (Global Privacy Control) and provide comparable rights to access, delete, and correct data.</p>
                  <p>Opt-out: <span className="font-mono text-emerald-400">privacy@ziplogic.ai</span> or use GPC in your browser.</p>
                </Collapse>
                <Collapse title="9. CHILDREN & SECURITY" badge="ART. 8 / ART. 32">
                  <p><strong className="text-red-400">Age Restriction:</strong> ZipLogic AI is not intended for users under 16 (aligned with GDPR Art. 8 default; 13 in some member states). We do not knowingly collect data from minors.</p>
                  <p><strong className="text-emerald-400">Security Measures (Art. 32):</strong> TLS 1.3 encryption in transit, AES-256 at rest, bcrypt/argon2 password hashing, rate limiting, OTP/2FA authentication, regular security audits, access controls on a need-to-know basis, automated vulnerability scanning.</p>
                  <p><strong className="text-cyan-400">Breach Notification (Art. 33/34):</strong> We will notify the relevant supervisory authority within 72 hours (moving to 96 hours once Digital Omnibus is adopted) and affected individuals without undue delay when required.</p>
                </Collapse>
                <Collapse title="10. AI-SPECIFIC TRANSPARENCY" badge="EU AI ACT">
                  <p>ZipLogic AI uses artificial intelligence (large language models) to generate code. Under the EU AI Act (Regulation 2024/1689):</p>
                  <p><strong className="text-emerald-400">Disclosure:</strong> You are interacting with AI-generated outputs. All code is produced by AI agents, not human developers.</p>
                  <p><strong className="text-cyan-400">Risk Classification:</strong> Our AI code generation is classified as <strong>limited risk</strong> under the AI Act, subject to transparency obligations (Art. 50) effective August 2, 2026.</p>
                  <p><strong className="text-purple-400">Human Oversight:</strong> Generated code passes through automated review agents (Tester, Reviewer) but is ultimately deployed at your discretion. You maintain full control.</p>
                  <p><strong className="text-pink-400">No Prohibited Practices:</strong> We do not engage in any AI practices prohibited under the AI Act (social scoring, subliminal manipulation, exploitation of vulnerabilities, real-time biometric identification).</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• TERMS OF SERVICE â•â•â• */}
            <section id="terms" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#00ddff"><span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"/><span className="text-cyan-400 text-[10px] font-mono tracking-[0.3em]">ENGAGEMENT PROTOCOL â€” BINDING AGREEMENT</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">TERMS OF <span className="text-gradient">SERVICE</span></h2>

              <TerminalBlock tag="terms_of_service.v2.exe"><p className="text-cyan-400/60 text-sm font-mono">Effective: February 6, 2026 // By creating an account, you accept these terms. These terms are governed by applicable law. EU consumer protection rights are not affected.</p></TerminalBlock>

              <div className="space-y-2 mt-6">
                <Collapse title="1. PILOT REQUIREMENTS" defaultOpen>
                  <p>Age 16+ (or local minimum under GDPR Art. 8 in your member state, minimum 13). Accurate credentials required. One pilot per account. You are responsible for all activity under your account. Parental/guardian consent required for users under 18 where applicable.</p>
                </Collapse>
                <Collapse title="2. MISSION TIERS & BILLING" badge="EU CONSUMER RIGHTS">
                  <p><strong className="text-emerald-400">Free:</strong> 1 project. <strong className="text-cyan-400">Builder:</strong> $29/mo (5 projects). <strong className="text-purple-400">Pro:</strong> $79/mo (15 projects). <strong className="text-pink-400">Agency:</strong> $149/mo (30 projects).</p>
                  <p>Billing via Stripe. All prices displayed include applicable taxes for EU customers. Upgrade, downgrade, or cancel anytime.</p>
                  <p><strong className="text-yellow-400">EU Right of Withdrawal:</strong> Under the EU Consumer Rights Directive (2011/83/EU), you have a 14-day cooling-off period for distance contracts. By requesting immediate service delivery upon subscription, you acknowledge that the right of withdrawal may be lost once the service is fully performed. You will be informed before any charge.</p>
                  <p><strong>Refund Policy:</strong> Refund requests within 14 days of initial purchase processed within 10 business days.</p>
                </Collapse>
                <Collapse title="3. CODE OWNERSHIP & LICENSING">
                  <p><strong className="text-emerald-400">Your prompts:</strong> Yours. We claim no ownership. <strong className="text-cyan-400">Generated code:</strong> Licensed to you for one project/mission per generation. You may modify, deploy, and profit from generated code within that scope.</p>
                  <p className="text-red-400">Prohibited: redistribution, resale, or stripping of code protection measures.</p>
                  <p><strong>Open Source:</strong> If generated code incorporates open-source components, their respective licenses apply.</p>
                </Collapse>
                <Collapse title="4. DEFENSE SYSTEMS â€” CODE PROTECTION">
                  <p>Code ships with digital fingerprints, license keys, honeypots, and optional obfuscation â€” for license enforcement only. Tampering with protection = account termination + legal action.</p>
                </Collapse>
                <Collapse title="5. RULES OF ENGAGEMENT">
                  <p>No weapons-grade code (malware, exploits, phishing). No IP theft. No plan hacking. See full Acceptable Use Policy below.</p>
                </Collapse>
                <Collapse title="6. BETA OPS & DISCLAIMER">
                  <p>"As-is" during beta. No uptime guarantees. Features may change. Generated code is provided WITHOUT WARRANTY. Test thoroughly before deploying to production.</p>
                  <p><strong>EU Consumer Note:</strong> Mandatory consumer warranty rights under EU Directive 2019/771 are not affected by this disclaimer where applicable to digital content/services.</p>
                </Collapse>
                <Collapse title="7. LIABILITY" badge="EU LAW">
                  <p>To the maximum extent permitted by applicable law, total liability capped at fees paid in the 12 months preceding the claim. This limitation does not apply to liability that cannot be excluded under EU/member state law (e.g., gross negligence, wilful misconduct, death/personal injury).</p>
                </Collapse>
                <Collapse title="8. TERMINATION & DISPUTES">
                  <p>You may terminate at any time. We may suspend or terminate accounts for Terms violations with notice where possible.</p>
                  <p><strong className="text-emerald-400">Governing Law:</strong> These terms are governed by applicable law. For EU consumers, mandatory consumer protection laws of your country of residence apply.</p>
                  <p><strong className="text-cyan-400">Dispute Resolution:</strong> Negotiation â†’ Mediation â†’ Arbitration. EU consumers may use the Online Dispute Resolution platform: <span className="font-mono">https://ec.europa.eu/consumers/odr</span></p>
                  <p><strong className="text-purple-400">Jurisdiction:</strong> EU consumers retain the right to bring proceedings in the courts of their member state of residence.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• BUG REPORT â•â•â• */}
            <section id="bug-report" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#ff4444"><span className="w-2 h-2 rounded-full bg-red-400 animate-pulse"/><span className="text-red-400 text-[10px] font-mono tracking-[0.3em]">HOSTILE ANOMALY â€” FILE REPORT</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">INCIDENT <span className="text-gradient">REPORT</span></h2>
              <p className="text-cyan-400/40 mb-8 text-sm">Found a bug? Report it. Every bug squashed makes the ship stronger.</p>

              {!bugDone ? (
                <HUDFrame color="#ff4444" className="p-6 sm:p-8 bg-red-500/[0.02] space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div><label className="block text-red-400 text-[10px] font-mono tracking-widest mb-2">THREAT_TYPE *</label>
                      <select value={bugForm.category} onChange={e=>setBugForm({...bugForm,category:e.target.value})} className={cn(inp,"appearance-none cursor-pointer")}>
                        <option value="" className="bg-black">Classify threat...</option><option value="gen" className="bg-black">ðŸ¤– Generation Failed</option><option value="code" className="bg-black">ðŸ’» Code Malfunction</option><option value="preview" className="bg-black">ðŸ‘ï¸ Visual Anomaly</option><option value="dl" className="bg-black">ðŸ“¥ Download Failure</option><option value="acct" className="bg-black">ðŸ‘¤ Account Issue</option><option value="perf" className="bg-black">âš¡ Performance</option><option value="ws" className="bg-black">ðŸ”Œ Stream Disruption</option><option value="privacy" className="bg-black">ðŸ›¡ï¸ Privacy/Data Concern</option><option value="other" className="bg-black">ðŸ”§ Unclassified</option>
                      </select></div>
                    <div><label className="block text-orange-400 text-[10px] font-mono tracking-widest mb-2">THREAT_LEVEL *</label>
                      <select value={bugForm.severity} onChange={e=>setBugForm({...bugForm,severity:e.target.value})} className={cn(inp,"appearance-none cursor-pointer")}>
                        <option value="" className="bg-black">Assess severity...</option><option value="blocker" className="bg-black">ðŸ”´ CRITICAL</option><option value="major" className="bg-black">ðŸŸ  MAJOR</option><option value="minor" className="bg-black">ðŸŸ¡ MINOR</option><option value="cosmetic" className="bg-black">ðŸŸ¢ LOW</option>
                      </select></div>
                  </div>
                  <div><label className="block text-cyan-400 text-[10px] font-mono tracking-widest mb-2">AFFECTED_MISSION</label><input placeholder="Project name or ID" value={bugForm.project} onChange={e=>setBugForm({...bugForm,project:e.target.value})} className={inp}/></div>
                  <div><label className="block text-emerald-400 text-[10px] font-mono tracking-widest mb-2">SITUATION_REPORT *</label><textarea rows={4} placeholder="What happened vs. what should have happened..." value={bugForm.description} onChange={e=>setBugForm({...bugForm,description:e.target.value})} className={cn(inp,"resize-none")}/></div>
                  <div><label className="block text-purple-400 text-[10px] font-mono tracking-widest mb-2">REPRODUCTION_SEQUENCE</label><textarea rows={3} placeholder={"1. Navigate to...\n2. Execute...\n3. Observe anomaly..."} value={bugForm.steps} onChange={e=>setBugForm({...bugForm,steps:e.target.value})} className={cn(inp,"resize-none")}/></div>
                  <div><label className="block text-cyan-400 text-[10px] font-mono tracking-widest mb-2">COMMS_LINK (optional)</label><input type="email" placeholder="Email for resolution updates" value={bugForm.email} onChange={e=>setBugForm({...bugForm,email:e.target.value})} className={inp}/></div>
                  <p className="text-[9px] font-mono text-cyan-400/20">Bug reports are processed under legitimate interest (GDPR Art. 6(1)(f)). Minimal data collected. See Privacy Shield.</p>
                  <button onClick={()=>{if(bugForm.category&&bugForm.severity&&bugForm.description){setBugDone(true);setKills(k=>k+1);}}} className={cn(btnP,"w-full sm:w-auto",(!bugForm.category||!bugForm.severity||!bugForm.description)&&"opacity-30 cursor-not-allowed")}>ðŸŽ¯ FIRE REPORT</button>
                </HUDFrame>
              ) : (
                <HUDFrame color="#00ff88" className="p-10 bg-emerald-500/[0.03] text-center">
                  <AlienMascot size={90} className="mx-auto mb-4" style={{animation:'float 3s ease-in-out infinite'}}/>
                  <h3 className="font-display text-2xl font-bold mb-2"><span className="text-gradient">TARGET ACQUIRED!</span></h3>
                  <p className="text-cyan-400/40 text-sm font-mono">Tracking: <span className="text-emerald-400">BUG-{Date.now().toString(36).toUpperCase()}</span></p>
                  <button onClick={()=>{setBugDone(false);setBugForm({category:'',severity:'',description:'',steps:'',project:'',email:''});}} className="mt-4 text-emerald-400 text-xs font-mono hover:underline tracking-widest">FILE_ANOTHER â†’</button>
                </HUDFrame>
              )}
            </section>

            {/* â•â•â• FEEDBACK â•â•â• */}
            <section id="feedback" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#8844ff"><span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse"/><span className="text-purple-400 text-[10px] font-mono tracking-[0.3em]">INTELLIGENCE GATHERING â€” BETA OPERATIVES</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">BETA <span className="text-gradient">INTEL</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">// YOUR_FEEDBACK = OUR_AMMUNITION</p>

              {!fbDone ? (
                <HUDFrame color="#8844ff" className="p-6 sm:p-8 bg-purple-500/[0.02] space-y-7">
                  <div><label className="block text-emerald-400 text-[10px] font-mono tracking-widest mb-4">OUTPUT_ASSESSMENT</label><EmojiRating value={fbForm.rating} onChange={v=>setFbForm({...fbForm,rating:v})}/></div>
                  <div><label className="block text-cyan-400 text-[10px] font-mono tracking-widest mb-2">TACTICAL_IMPROVEMENTS</label><textarea rows={3} placeholder="UI, code quality, speed, structure..." value={fbForm.changes} onChange={e=>setFbForm({...fbForm,changes:e.target.value})} className={cn(inp,"resize-none")}/></div>
                  <div><label className="block text-purple-400 text-[10px] font-mono tracking-widest mb-2">WEAPON_REQUEST</label><textarea rows={2} placeholder="One feature to add to the arsenal..." value={fbForm.feature} onChange={e=>setFbForm({...fbForm,feature:e.target.value})} className={cn(inp,"resize-none")}/></div>
                  <div>
                    <label className="block text-pink-400 text-[10px] font-mono tracking-widest mb-3">HOSTILE_ENCOUNTERS?</label>
                    <div className="flex gap-3">{[{v:true,l:'ðŸ› Affirmative'},{v:false,l:'âœ¨ Negative'}].map(o=>(<button key={String(o.v)} onClick={()=>setFbForm({...fbForm,hadBugs:o.v})} className={cn("px-5 py-3 rounded-lg border text-xs font-mono tracking-wider transition-all",fbForm.hadBugs===o.v?"border-emerald-400 bg-emerald-500/10 text-emerald-400":"border-cyan-500/10 text-cyan-400/40 hover:border-cyan-500/30")}>{o.l}</button>))}</div>
                    {fbForm.hadBugs===true&&<textarea rows={2} placeholder="Debrief..." value={fbForm.bugDetail} onChange={e=>setFbForm({...fbForm,bugDetail:e.target.value})} className={cn(inp,"resize-none mt-3")}/>}
                  </div>
                  <div><label className="block text-cyan-400 text-[10px] font-mono tracking-widest mb-4">DEPLOYMENT_RECOMMENDATION</label><NPSScale value={fbForm.nps} onChange={v=>setFbForm({...fbForm,nps:v})}/></div>
                  <button onClick={()=>{setFbDone(true);setKills(k=>k+1);}} className={cn(btnP,"w-full sm:w-auto")}>ðŸ“¡ TRANSMIT INTEL</button>
                </HUDFrame>
              ) : (
                <HUDFrame color="#00ff88" className="p-10 bg-emerald-500/[0.03] text-center">
                  <AlienMascot size={90} className="mx-auto mb-4" style={{animation:'float 3s ease-in-out infinite'}}/>
                  <h3 className="font-display text-2xl font-bold"><span className="text-gradient">INTEL SECURED!</span></h3>
                  <p className="text-cyan-400/40 text-sm mt-2">Direct feed to command.</p>
                  <button onClick={()=>{setFbDone(false);setFbForm({rating:null,changes:'',feature:'',hadBugs:null,bugDetail:'',nps:null});}} className="mt-4 text-emerald-400 text-xs font-mono hover:underline tracking-widest">MORE_INTEL â†’</button>
                </HUDFrame>
              )}
            </section>

            {/* â•â•â• GDPR COMPLIANCE â•â•â• */}
            <section id="gdpr" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#0088ff"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/><span className="text-blue-400 text-[10px] font-mono tracking-[0.3em]">ðŸ‡ªðŸ‡º GDPR COMPLIANCE MATRIX â€” REGULATION (EU) 2016/679</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">GDPR <span className="text-gradient">COMPLIANCE</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">CUMULATIVE FINES ACROSS EU SINCE 2018: â‚¬5.88 BILLION // TAKE THIS SERIOUSLY</p>

              <HUDFrame color="#0088ff" className="p-6 mb-6 bg-blue-500/[0.03]">
                <p className="text-white/80 leading-relaxed">The General Data Protection Regulation (GDPR) is the cornerstone of EU data protection law. It applies to ZipLogic AI because we process personal data of individuals in the EEA, regardless of our place of establishment. Below is our comprehensive compliance framework.</p>
              </HUDFrame>

              <div className="space-y-2">
                <Collapse title="GDPR PRINCIPLES WE UPHOLD (Art. 5)" defaultOpen badge="CORE">
                  <p><strong className="text-emerald-400">Lawfulness, Fairness, Transparency:</strong> All processing has a documented lawful basis. We are transparent about what we do with your data.</p>
                  <p><strong className="text-cyan-400">Purpose Limitation:</strong> Data collected for specific, explicit purposes and not processed incompatibly.</p>
                  <p><strong className="text-purple-400">Data Minimization:</strong> We collect only what is necessary for each processing purpose.</p>
                  <p><strong className="text-pink-400">Accuracy:</strong> We keep data accurate and up to date; you can correct data via your account or contacting us.</p>
                  <p><strong className="text-yellow-400">Storage Limitation:</strong> Data retained only as long as necessary (see retention schedule in Privacy Shield).</p>
                  <p><strong className="text-orange-400">Integrity & Confidentiality:</strong> TLS 1.3, AES-256, hashed passwords, access controls, regular audits.</p>
                  <p><strong className="text-red-400">Accountability:</strong> We maintain Records of Processing Activities (RoPA), conduct DPIAs for high-risk processing, and document all compliance measures.</p>
                </Collapse>
                <Collapse title="DATA PROCESSING AGREEMENTS (Art. 28)" badge="CONTRACTS">
                  <p>Every third-party processor we use is bound by a GDPR-compliant Data Processing Agreement specifying: processing scope and purpose, technical/organizational measures, sub-processor authorization, breach notification obligations, audit rights, and data return/deletion procedures.</p>
                </Collapse>
                <Collapse title="DATA PROTECTION IMPACT ASSESSMENTS (Art. 35)" badge="DPIAs">
                  <p>We conduct DPIAs for processing likely to result in high risk to individuals, including: AI-powered code generation using personal prompts, new technology deployments, and large-scale processing operations. DPIAs document risks, mitigation measures, and ongoing monitoring procedures.</p>
                </Collapse>
                <Collapse title="INTERNATIONAL DATA TRANSFERS (Art. 44-49)" badge="TRANSFERS">
                  <p><strong className="text-emerald-400">Primary Mechanism:</strong> EU-US Data Privacy Framework (adequacy decision adopted July 2023) for US-based processors certified under the framework.</p>
                  <p><strong className="text-cyan-400">Fallback:</strong> Standard Contractual Clauses (Commission Decision 2021/914, updated 2025 SCCs) with supplementary measures where needed.</p>
                  <p><strong className="text-purple-400">Transfer Impact Assessments:</strong> Conducted for all transfers to third countries to verify adequate protection, considering Schrems II requirements.</p>
                </Collapse>
                <Collapse title="BREACH NOTIFICATION (Art. 33/34)" badge="72 HOURS">
                  <p>In the event of a personal data breach, we will: notify the relevant supervisory authority within 72 hours of becoming aware (unless unlikely to result in risk), notify affected individuals without undue delay when the breach is likely to result in high risk, and document all breaches in our breach register regardless of notification requirement.</p>
                  <p className="text-cyan-400/40 text-xs">Note: The proposed Digital Omnibus (Nov 2025) would extend the authority notification deadline to 96 hours and raise the threshold to "high risk" only. We will update our procedures when adopted.</p>
                </Collapse>
                <Collapse title="AI & GDPR INTERSECTION" badge="2026">
                  <p><strong className="text-emerald-400">Automated Decision-Making (Art. 22):</strong> Our code generation does not produce decisions with legal or similarly significant effects on individuals. If this changes, we will implement safeguards including human review, right to contest, and meaningful information about logic involved.</p>
                  <p><strong className="text-cyan-400">AI Training Data:</strong> The EDPB has clarified that LLMs rarely achieve anonymization standards. We rely on contract performance and legitimate interest for processing; data subjects retain the right to object (Art. 21).</p>
                  <p><strong className="text-purple-400">Digital Omnibus (Proposed Nov 2025):</strong> If adopted, would explicitly recognize AI development/deployment as a legitimate interest under GDPR, with required balancing test and safeguards. We monitor this legislation actively.</p>
                </Collapse>
                <Collapse title="2026 ENFORCEMENT PRIORITIES">
                  <p><strong className="text-red-400">Transparency & Information (Art. 12-14):</strong> EDPB's 2026 coordinated enforcement action targets compliance with transparency obligations. We have updated all notices accordingly.</p>
                  <p><strong className="text-orange-400">Dark Patterns:</strong> Regulators are actively penalizing manipulative consent UX. Our consent interfaces provide equal prominence to accept and reject options.</p>
                  <p><strong className="text-yellow-400">Vendor Oversight:</strong> Increased scrutiny on controller liability for processor failures. All our vendor contracts include audit rights and security requirements.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• EU AI ACT â•â•â• */}
            <section id="ai-act" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#0088ff"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/><span className="text-blue-400 text-[10px] font-mono tracking-[0.3em]">ðŸ¤– EU AI ACT â€” REGULATION (EU) 2024/1689</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">EU AI <span className="text-gradient">ACT</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">ENTERED INTO FORCE: AUG 1, 2024 // FULL APPLICATION: AUG 2, 2026 // PENALTIES: UP TO â‚¬35M or 7% GLOBAL REVENUE</p>

              <TerminalBlock tag="ai_act_compliance.config">
                <div className="space-y-4 text-sm">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20">
                    <span className="text-xl">âœ…</span>
                    <div><span className="text-emerald-400 font-semibold">Feb 2, 2025 â€” COMPLETED:</span><span className="text-cyan-400/50 ml-2">Prohibited practices ceased. AI literacy obligations addressed.</span></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/20">
                    <span className="text-xl">âœ…</span>
                    <div><span className="text-emerald-400 font-semibold">Aug 2, 2025 â€” COMPLETED:</span><span className="text-cyan-400/50 ml-2">GPAI governance rules and obligations for general-purpose AI models.</span></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-yellow-500/[0.05] border border-yellow-500/20">
                    <span className="text-xl">â³</span>
                    <div><span className="text-yellow-400 font-semibold">Aug 2, 2026 â€” IN PROGRESS:</span><span className="text-cyan-400/50 ml-2">Full application. Transparency obligations (Art. 50). High-risk rules for standalone systems.</span></div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/10">
                    <span className="text-xl">ðŸ“‹</span>
                    <div><span className="text-cyan-400 font-semibold">Aug 2, 2027:</span><span className="text-cyan-400/50 ml-2">High-risk AI embedded in regulated products. GPAI models placed on market before Aug 2025 must fully comply.</span></div>
                  </div>
                </div>
              </TerminalBlock>

              <div className="space-y-2 mt-6">
                <Collapse title="OUR AI RISK CLASSIFICATION" defaultOpen badge="LIMITED RISK">
                  <p>ZipLogic AI's code generation platform is classified as <strong className="text-yellow-400">limited risk</strong> under the AI Act's tiered framework. Our AI generates software code based on user prompts â€” it does not make decisions about individuals' rights, access to services, employment, education, or other high-risk categories listed in Annex III.</p>
                  <p><strong className="text-emerald-400">We are NOT high-risk because:</strong> We do not operate in biometric identification, critical infrastructure, education/vocational training admission, employment/worker management, essential services access, law enforcement, migration/asylum, or justice/democratic processes.</p>
                  <p><strong className="text-cyan-400">Transparency obligation (Art. 50):</strong> We clearly disclose that users are interacting with AI-generated outputs. All generated code is labeled as AI-produced.</p>
                </Collapse>
                <Collapse title="PROHIBITED PRACTICES â€” CONFIRMED COMPLIANCE" badge="ART. 5">
                  <p>We confirm ZipLogic AI does NOT engage in:</p>
                  <p>âŒ Subliminal manipulation or deceptive techniques harmful to users</p>
                  <p>âŒ Exploitation of age, disability, or social/economic vulnerabilities</p>
                  <p>âŒ Social scoring systems</p>
                  <p>âŒ Real-time remote biometric identification in public spaces</p>
                  <p>âŒ Emotion recognition in workplace/education settings</p>
                  <p>âŒ Untargeted facial recognition scraping</p>
                  <p>âŒ Predictive policing based solely on profiling</p>
                </Collapse>
                <Collapse title="GENERAL-PURPOSE AI (GPAI) CONSIDERATIONS" badge="ART. 51-56">
                  <p>ZipLogic AI integrates third-party GPAI models (LLMs) as deployers, not providers. Our obligations include: verifying our GPAI providers comply with Art. 53 requirements (technical documentation, training data summaries, EU copyright compliance), maintaining transparency about AI use, and monitoring outputs for quality.</p>
                  <p>The GPAI Code of Practice (published July 2025) provides the compliance framework our providers follow.</p>
                </Collapse>
                <Collapse title="AI-GENERATED CONTENT LABELING" badge="ART. 50">
                  <p>Effective August 2, 2026, we will ensure: all AI-generated code carries metadata/watermarks identifying it as AI-produced (per the Dec 2025 draft Code of Practice on marking and labelling), clear user-facing disclosure that outputs are AI-generated, and no misrepresentation of AI outputs as human-written.</p>
                </Collapse>
                <Collapse title="DIGITAL OMNIBUS ON AI (PROPOSED NOV 2025)">
                  <p>The European Commission proposed simplifications to the AI Act in November 2025. Key proposed changes we are monitoring: dropping the AI literacy obligation for providers/deployers (shifting to member states), postponing some transparency obligations, adjusting high-risk timelines to link with availability of harmonised standards (long-stop dates: Dec 2027 / Aug 2028). These proposals are under legislative review and not yet law.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• DIGITAL SERVICES ACT â•â•â• */}
            <section id="dsa" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#0088ff"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/><span className="text-blue-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“¡ DIGITAL SERVICES ACT â€” REGULATION (EU) 2022/2065</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">DIGITAL SERVICES <span className="text-gradient">ACT</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">IN FORCE SINCE FEB 17, 2024 // FINES UP TO 6% GLOBAL ANNUAL TURNOVER</p>

              <div className="space-y-2">
                <Collapse title="APPLICABILITY TO ZIPLOGIC AI" defaultOpen>
                  <p>The DSA applies to all digital intermediary services in the EU. As a SaaS platform providing hosting services (storing user-submitted prompts and generated code), ZipLogic AI qualifies as a <strong className="text-cyan-400">hosting service provider</strong> under the DSA's tiered framework. We are NOT a Very Large Online Platform (VLOP) as we do not have 45 million+ monthly active users in the EU.</p>
                </Collapse>
                <Collapse title="OUR DSA OBLIGATIONS" badge="HOSTING PROVIDER">
                  <p><strong className="text-emerald-400">Terms of Service Transparency:</strong> Our ToS clearly describes content moderation policies, restrictions on service use, and algorithmic decision-making processes.</p>
                  <p><strong className="text-cyan-400">Notice & Action Mechanism:</strong> We maintain accessible mechanisms for reporting illegal content. Reports are processed promptly with decisions communicated to both reporter and affected user.</p>
                  <p><strong className="text-purple-400">Transparency Reporting:</strong> Annual transparency report on content moderation activities, as required. First harmonised reports under the Nov 2024 implementing regulation due beginning 2026.</p>
                  <p><strong className="text-pink-400">Single Point of Contact:</strong> Designated for communication with authorities, users, and the European Commission.</p>
                  <p><strong className="text-yellow-400">Legal Representative in EU:</strong> If required under Art. 13 (non-EU establishment serving EU), we designate a legal representative in an EU member state.</p>
                </Collapse>
                <Collapse title="CONTENT MODERATION & ILLEGAL CONTENT">
                  <p>We act expeditiously upon receiving actual knowledge of illegal content hosted on our platform (generated malware, IP-infringing code, etc.). Our code generation guardrails prevent generation of prohibited content categories including malware, exploits, and phishing tools.</p>
                  <p>Users who believe content was wrongfully removed may appeal through our internal complaint-handling system.</p>
                </Collapse>
                <Collapse title="ADVERTISING TRANSPARENCY">
                  <p>ZipLogic AI does not serve targeted advertising. If we introduce any promotional content, we will ensure compliance with DSA advertising transparency requirements including clear labeling, identification of the promoter, and no targeted ads based on sensitive personal data.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• EU DATA ACT â•â•â• */}
            <section id="data-act" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#0088ff"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/><span className="text-blue-400 text-[10px] font-mono tracking-[0.3em]">ðŸ’¾ EU DATA ACT â€” REGULATION (EU) 2023/2854</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">EU DATA <span className="text-gradient">ACT</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">KEY OBLIGATIONS EFFECTIVE: SEP 12, 2025 // SWITCHING CHARGES BANNED: JAN 2027</p>

              <div className="space-y-2">
                <Collapse title="APPLICABILITY TO ZIPLOGIC AI" defaultOpen badge="SaaS PROVIDER">
                  <p>As a Software-as-a-Service (SaaS) provider, ZipLogic AI falls within the EU Data Act's scope for "data processing services." The Act applies regardless of where our business is based, as long as we serve EU customers.</p>
                </Collapse>
                <Collapse title="SERVICE SWITCHING RIGHTS (Ch. VI)" badge="EFFECTIVE SEP 2025">
                  <p><strong className="text-emerald-400">Switching Support:</strong> Customers can switch away from ZipLogic AI with reasonable notice. We provide data export in machine-readable formats (JSON, ZIP archives of generated code).</p>
                  <p><strong className="text-cyan-400">No Switching Charges:</strong> From January 12, 2027, switching charges are fully prohibited. We commit to no lock-in: you can export your projects and data at any time.</p>
                  <p><strong className="text-purple-400">Transition Period:</strong> Maximum 30 days for data portability upon switching request.</p>
                </Collapse>
                <Collapse title="DATA PORTABILITY & INTEROPERABILITY" badge="Ch. III">
                  <p>Generated code is delivered in standard, open formats (source code files). We do not use proprietary formats that prevent portability. Our API supports programmatic data export for enterprise users.</p>
                </Collapse>
                <Collapse title="FAIR CONTRACT TERMS (Ch. IV)">
                  <p>The Data Act prohibits unfair terms in data-related contracts. Our Terms of Service have been reviewed to ensure no clauses: unilaterally determine what data constitutes a trade secret, limit liability for intentional acts or gross negligence, allow unilateral changes to data access terms without reasonable notice, or prevent users from using their own data.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• DATA PROCESSING AGREEMENT â•â•â• */}
            <section id="dpa" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#0088ff"><span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"/><span className="text-blue-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“‹ DATA PROCESSING AGREEMENT â€” GDPR ART. 28</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">DATA PROCESSING <span className="text-gradient">AGREEMENT</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">FOR CUSTOMERS WHERE ZIPLOGIC AI ACTS AS DATA PROCESSOR</p>

              <div className="space-y-2">
                <Collapse title="SCOPE & ROLES" defaultOpen>
                  <p>When you use ZipLogic AI and submit prompts containing personal data (e.g., developing applications that process your end-users' data), <strong className="text-emerald-400">you are the Data Controller</strong> and <strong className="text-cyan-400">ZipLogic AI acts as Data Processor</strong>.</p>
                  <p>This DPA governs ZipLogic AI's processing of personal data on your behalf in connection with service delivery.</p>
                </Collapse>
                <Collapse title="PROCESSING DETAILS" badge="ART. 28(3)">
                  <p><strong>Subject Matter:</strong> AI-powered code generation, preview rendering, and project hosting.</p>
                  <p><strong>Duration:</strong> For the term of your subscription, plus data deletion period.</p>
                  <p><strong>Nature & Purpose:</strong> Processing prompts and generating code as instructed by you.</p>
                  <p><strong>Types of Personal Data:</strong> As determined by you; may include names, email addresses, and any data included in prompts.</p>
                  <p><strong>Data Subjects:</strong> Your end users, customers, employees, or any individuals whose data you include in prompts.</p>
                </Collapse>
                <Collapse title="PROCESSOR OBLIGATIONS" badge="BINDING">
                  <p>ZipLogic AI commits to: process personal data only on your documented instructions, ensure all personnel with access are bound by confidentiality, implement appropriate technical and organizational measures (Art. 32), engage sub-processors only with your prior authorization and binding contracts, assist with data subject rights requests, assist with DPIAs and prior consultation with supervisory authorities, delete or return all personal data upon contract termination, and make available all information necessary to demonstrate compliance.</p>
                </Collapse>
                <Collapse title="SUB-PROCESSORS">
                  <p>Current authorized sub-processors: AI/LLM providers (for code generation), cloud hosting providers, Stripe (payment processing). Changes to sub-processors communicated with 30 days notice. You may object to new sub-processors.</p>
                </Collapse>
                <Collapse title="BREACH NOTIFICATION">
                  <p>We notify you of any personal data breach without undue delay (target: within 24 hours of discovery), providing: nature of the breach, data categories and approximate number of subjects affected, likely consequences, and measures taken or proposed to mitigate.</p>
                </Collapse>
                <Collapse title="REQUEST A DPA">
                  <p>Enterprise and Pro customers can request a signed DPA. Contact: <span className="font-mono text-emerald-400">legal@ziplogic.ai</span></p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• ACCEPTABLE USE â•â•â• */}
            <section id="acceptable-use" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#ffaa00"><span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"/><span className="text-yellow-400 text-[10px] font-mono tracking-[0.3em]">RULES OF ENGAGEMENT â€” MANDATORY BRIEFING</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">RULES OF <span className="text-gradient">ENGAGEMENT</span></h2>
              <div className="space-y-2">
                <Collapse title="ðŸš« PROHIBITED: WEAPONS-GRADE CODE" defaultOpen><p>No malware, ransomware, viruses, exploits, phishing, keyloggers, spyware, DDoS tools, botnets, or command-and-control infrastructure. Period.</p></Collapse>
                <Collapse title="ðŸš« PROHIBITED: ENEMY IP"><p>No cloning proprietary software, infringing patents/copyrights/trademarks, or circumventing DRM/technical protection measures (violates both EU Copyright Directive 2019/790 and platform terms).</p></Collapse>
                <Collapse title="ðŸš« PROHIBITED: MUTINY"><p>No multi-accounting, bots/scrapers, reverse-engineering our pipeline, disrupting operations, or attempting to extract training data from our AI models.</p></Collapse>
                <Collapse title="ðŸš« PROHIBITED: ARMOR PIERCING"><p>No removing digital fingerprints, stripping license keys, disabling honeypots, or redistributing/reselling generated code.</p></Collapse>
                <Collapse title="ðŸš« PROHIBITED: ILLEGAL CONTENT"><p>No generating content that is illegal under EU or member state law, including but not limited to: CSAM, terrorist content, illegal hate speech (as defined under EU Framework Decision 2008/913/JHA), or content violating the Digital Services Act.</p></Collapse>
                <Collapse title="âš¡ ENFORCEMENT PROTOCOL"><p><span className="text-yellow-400">1st offense:</span> Warning + 24h suspension. <span className="text-orange-400">2nd:</span> 30-day suspension + license revocation. <span className="text-red-400">3rd/severe:</span> Permanent termination + legal action. Report abuse: <span className="text-emerald-400 font-mono">abuse@ziplogic.ai</span></p></Collapse>
              </div>
            </section>

            {/* â•â•â• COOKIES â•â•â• */}
            <section id="cookies" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#ffaa00"><span className="text-amber-400 text-[10px] font-mono tracking-[0.3em]">ðŸª COOKIE & TRACKING PROTOCOL â€” ePrivacy Directive + GDPR</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-2">COOKIE <span className="text-gradient">PROTOCOL</span></h2>
              <p className="text-cyan-400/30 text-[10px] font-mono mb-8 tracking-[0.3em]">ePRIVACY DIRECTIVE 2002/58/EC (AS AMENDED) // GDPR CONSENT STANDARDS // UPDATED FEB 2026</p>

              <HUDFrame color="#ffaa00" className="p-5 mb-6 bg-yellow-500/[0.02]">
                <p className="text-white/70 text-sm leading-relaxed"><strong className="text-yellow-400">Important:</strong> The ePrivacy Regulation was formally withdrawn by the European Commission in February 2025. The existing ePrivacy Directive remains the legal framework for cookies and tracking. We block ALL non-essential cookies until you provide explicit opt-in consent â€” no dark patterns, no pre-ticked boxes, no consent walls.</p>
              </HUDFrame>

              <TerminalBlock tag="cookie_manifest.sys"><div className="overflow-x-auto"><table className="w-full text-sm">
                <thead><tr className="border-b border-cyan-500/10"><th className="text-left px-3 py-2 text-emerald-400 font-mono text-[9px] tracking-widest">COOKIE</th><th className="text-left px-3 py-2 text-cyan-400 font-mono text-[9px]">CATEGORY</th><th className="text-left px-3 py-2 text-purple-400 font-mono text-[9px]">PURPOSE</th><th className="text-left px-3 py-2 text-pink-400 font-mono text-[9px]">LIFESPAN</th><th className="text-left px-3 py-2 text-yellow-400 font-mono text-[9px]">CONSENT?</th></tr></thead>
                <tbody className="text-cyan-400/50">{[
                  ['auth_token','Strictly Necessary','User authentication & session','Session','No â€” Essential'],
                  ['csrf_token','Strictly Necessary','Cross-site request forgery defense','Session','No â€” Essential'],
                  ['session_id','Strictly Necessary','Session state management','24 hours','No â€” Essential'],
                  ['cookie_consent','Strictly Necessary','Stores your consent preferences','12 months','No â€” Essential'],
                  ['_ga / _gid','Analytics','Usage patterns & page views','2yr / 24h','YES â€” Opt-in'],
                  ['__stripe_*','Payment (3rd party)','Payment processing security','Varies','No â€” Essential'],
                ].map(([c,t,p,d,consent],i)=>(
                  <tr key={i} className="border-b border-cyan-500/5 hover:bg-cyan-500/[0.02]">
                    <td className="px-3 py-3 font-mono text-[11px] text-emerald-400/60">{c}</td>
                    <td className="px-3 py-3">{t}</td>
                    <td className="px-3 py-3">{p}</td>
                    <td className="px-3 py-3 font-mono text-[11px]">{d}</td>
                    <td className="px-3 py-3 font-mono text-[11px]" style={{color:consent.includes('YES')?'#ffaa00':'#00ff88'}}>{consent}</td>
                  </tr>
                ))}</tbody>
              </table></div></TerminalBlock>

              <div className="space-y-2 mt-6">
                <Collapse title="CONSENT MECHANISM" badge="GDPR ART. 7">
                  <p>Our cookie consent banner provides: granular per-category controls (necessary, analytics, marketing), equally prominent "Accept" and "Reject All" buttons (no dark patterns), ability to modify preferences at any time via a persistent settings link, prior blocking of all non-essential cookies before consent is given, and consent logging with timestamp for audit compliance.</p>
                </Collapse>
                <Collapse title="THIRD-PARTY COOKIES & TRACKING PIXELS">
                  <p>We do not use tracking pixels in emails. If introduced, separate consent will be obtained per CNIL 2025 guidance. Third-party cookies (Google Analytics) are blocked until consent. We honor Global Privacy Control (GPC) signals and Do Not Track headers.</p>
                </Collapse>
                <Collapse title="UPCOMING: DIGITAL OMNIBUS COOKIE REFORMS">
                  <p>The Nov 2025 Digital Omnibus proposal would move cookie rules into GDPR (new Art. 88a), potentially allowing legitimate interest for some analytics cookies and introducing mandatory browser-based preference signals. If adopted (estimated earliest 2027), we will update our practices accordingly. Until then, we maintain strict opt-in consent.</p>
                </Collapse>
              </div>
            </section>

            {/* â•â•â• CONTACT â•â•â• */}
            <section id="contact" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6"><span className="text-emerald-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“¡ OPEN COMMS â€” ALL FREQUENCIES</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">COMMS <span className="text-gradient">CHANNEL</span></h2>
              <div className="grid md:grid-cols-5 gap-6">
                <div className="md:col-span-3">{!cDone?(
                  <HUDFrame color="#00ddff" className="p-6 sm:p-8 bg-cyan-500/[0.02] space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div><label className="block text-emerald-400 text-[10px] font-mono tracking-widest mb-2">CALLSIGN</label><input placeholder="Your name" value={cForm.name} onChange={e=>setCForm({...cForm,name:e.target.value})} className={inp}/></div>
                      <div><label className="block text-cyan-400 text-[10px] font-mono tracking-widest mb-2">FREQUENCY</label><input type="email" placeholder="you@base.com" value={cForm.email} onChange={e=>setCForm({...cForm,email:e.target.value})} className={inp}/></div>
                    </div>
                    <div><label className="block text-purple-400 text-[10px] font-mono tracking-widest mb-2">SUBJECT</label><input placeholder="Mission briefing..." value={cForm.subject} onChange={e=>setCForm({...cForm,subject:e.target.value})} className={inp}/></div>
                    <div><label className="block text-pink-400 text-[10px] font-mono tracking-widest mb-2">TRANSMISSION</label><textarea rows={4} placeholder="Speak freely, pilot..." value={cForm.message} onChange={e=>setCForm({...cForm,message:e.target.value})} className={cn(inp,"resize-none")}/></div>
                    <p className="text-[9px] font-mono text-cyan-400/20">Contact form data processed under legitimate interest (GDPR Art. 6(1)(f)) to respond to your inquiry. Data deleted after resolution + 90 days.</p>
                    <button onClick={()=>{setCDone(true);setKills(k=>k+1);}} className={cn(btnP,"w-full sm:w-auto")}>ðŸ“¡ FIRE TRANSMISSION</button>
                  </HUDFrame>
                ):(
                  <HUDFrame color="#00ff88" className="p-10 bg-emerald-500/[0.03] text-center">
                    <AlienMascot size={70} className="mx-auto mb-3" style={{animation:'float 3s ease-in-out infinite'}}/>
                    <h3 className="font-display text-xl font-bold text-gradient mb-2">TRANSMISSION SENT!</h3><p className="text-cyan-400/40 text-sm font-mono">ETA: 24 hours</p>
                  </HUDFrame>
                )}</div>
                <div className="md:col-span-2 space-y-3">
                  {[{l:'GENERAL',v:'hello@ziplogic.ai',i:'ðŸ“§'},{l:'SUPPORT',v:'support@ziplogic.ai',i:'ðŸ› ï¸'},{l:'PRIVACY / DPO',v:'privacy@ziplogic.ai',i:'ðŸ›¡ï¸'},{l:'ABUSE / DSA',v:'abuse@ziplogic.ai',i:'âš ï¸'},{l:'LEGAL / DPA',v:'legal@ziplogic.ai',i:'âš–ï¸'},{l:'EU REPRESENTATIVE',v:'eu-rep@ziplogic.ai',i:'ðŸ‡ªðŸ‡º'}].map(c=>(
                    <div key={c.l} className="card-hover p-4 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.02]">
                      <p className="text-[9px] font-mono text-cyan-400/20 tracking-widest mb-1">{c.i} {c.l}</p><p className="text-emerald-400 text-sm font-mono">{c.v}</p>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg border border-yellow-500/10 bg-yellow-500/[0.02]">
                    <p className="text-[9px] font-mono text-yellow-400/30 tracking-widest mb-1">ðŸŒ EU ODR PLATFORM</p>
                    <p className="text-yellow-400/70 text-xs font-mono break-all">https://ec.europa.eu/consumers/odr</p>
                  </div>
                </div>
              </div>
            </section>

            {/* â•â•â• ABOUT â•â•â• */}
            <section id="about" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#8844ff"><span className="text-purple-400 text-[10px] font-mono tracking-[0.3em]">ðŸ›¸ SHIP MANIFEST â€” CREW DOSSIER</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">SHIP <span className="text-gradient">MANIFEST</span></h2>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex-1 space-y-6">
                  <HUDFrame className="p-6 bg-cyan-500/[0.03]"><p className="text-lg text-white/90 leading-relaxed font-light">Autonomous multi-agent software engineering. Prompt in, working app out. <span className="text-emerald-400 font-semibold">EU-compliant from day one.</span></p></HUDFrame>
                  <TerminalBlock tag="agent_squadron.config"><div className="space-y-3">
                    {[{a:'Architect',c:'text-emerald-400',t:'Plans structure & dependencies'},{a:'Developer',c:'text-cyan-400',t:'Writes production code'},{a:'Tester',c:'text-purple-400',t:'Validates functionality'},{a:'Reviewer',c:'text-pink-400',t:'QA & optimization'}].map((s,i)=>(
                      <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-cyan-500/[0.03] border border-cyan-500/10">
                        <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-display text-[10px] font-bold">{String(i+1).padStart(2,'0')}</div>
                        <div><span className={`${s.c} font-semibold`}>{s.a}</span><span className="text-cyan-400/30 ml-2">â€” {s.t}</span></div>
                        <span className="ml-auto text-emerald-400/30 text-[9px] font-mono tracking-widest">DEPLOYED</span>
                      </div>
                    ))}
                  </div></TerminalBlock>
                  <div className="p-6 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.02]">
                    <p className="text-emerald-400 text-[10px] font-mono tracking-[0.3em] mb-3">MOTHERSHIP</p>
                    <p className="text-white font-semibold text-lg">Pascat Graphics & Marketing Company</p>
                    <p className="text-cyan-400/40 text-sm mt-1">20+ years â€” Design, dev, and AI infrastructure for next-gen software.</p>
                  </div>
                </div>
                <div className="shrink-0 hidden md:block">
                  <HUDFrame color="#00ff88" className="p-8 bg-emerald-500/[0.02] text-center">
                    <AlienMascot size={150} style={{animation:'float 4s ease-in-out infinite'}}/>
                    <p className="text-emerald-400 font-display text-xs tracking-[0.2em] mt-4">ZIPPY</p>
                    <p className="text-cyan-400/30 text-[10px] font-mono">Chief Vibes Officer</p>
                  </HUDFrame>
                </div>
              </div>
            </section>

            {/* â•â•â• DOCS â•â•â• */}
            <section id="docs" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6" color="#00ddff"><span className="text-cyan-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“– FIELD MANUAL</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">TECH <span className="text-gradient">MANUAL</span></h2>
              <div className="grid sm:grid-cols-2 gap-5">
                {[
                  {t:'LAUNCH SEQUENCE',i:'ðŸš€',s:['Register + verify identity','Dashboard â†’ New Mission','Describe target application','Monitor agent squadron','Inspect, approve, extract']},
                  {t:'AGENT SQUADRON',i:'ðŸ¤–',s:['Architect â€” plans structure','Developer â€” writes full codebase','Tester â€” validates & tests','Reviewer â€” optimizes & QA']},
                  {t:'WEAPON SYSTEMS',i:'âš™ï¸',s:['React, Vue, Next.js, HTML/CSS/JS','Django, Express, FastAPI, Node','PostgreSQL, MongoDB, SQLite','Tailwind, Bootstrap, custom CSS']},
                  {t:'TARGETING',i:'ðŸŽ¯',s:['Be precise â€” features, pages, models','Specify tech stack preference','Describe visual identity','Reference existing targets for style']},
                ].map(d=>(
                  <div key={d.t} className="card-hover p-6 rounded-lg border border-cyan-500/10 bg-cyan-500/[0.02]">
                    <div className="flex items-center gap-3 mb-4"><span className="text-xl">{d.i}</span><h4 className="font-display text-[11px] font-bold tracking-[0.15em] text-emerald-400">{d.t}</h4></div>
                    <ol className="space-y-2">{d.s.map((s,i)=><li key={i} className="flex items-start gap-3 text-sm text-cyan-400/50"><span className="text-emerald-400/40 font-mono text-[10px] mt-0.5 shrink-0">{String(i+1).padStart(2,'0')}</span>{s}</li>)}</ol>
                  </div>
                ))}
              </div>
            </section>

            {/* â•â•â• CHANGELOG â•â•â• */}
            <section id="changelog" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6"><span className="text-emerald-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“‹ MISSION LOG</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">SHIP <span className="text-gradient">LOG</span></h2>
              {[
                {v:'v0.9.1-beta',d:'2026-02-06',cur:true,ch:[{t:'âœ¨ Deployed',items:['Full EU compliance framework: GDPR, AI Act, DSA, Data Act, ePrivacy','Data Processing Agreement (DPA) template','EU AI Act risk classification & timeline','Digital Services Act hosting obligations','EU Data Act switching rights & portability','Updated cookie consent to strict opt-in with GPC support','CCPA/CPRA + 16 US state privacy law compliance','EU ODR dispute resolution link','Legal representative for EU operations']},{t:'ðŸ”§ Patched',items:['Privacy policy expanded with lawful basis per processing activity','Cookie table now shows consent requirement per cookie','Contact page adds legal/DPA/EU-rep channels','Terms updated with EU Consumer Rights Directive withdrawal period']}]},
                {v:'v0.9.0-beta',d:'2025-02-05',ch:[{t:'âœ¨ Deployed',items:['Command Center HQ','Incident reporting system','Beta intel collection','Initial legal framework']},{t:'ðŸ”§ Patched',items:['Dead nav links eliminated','Navigation restructured']}]},
                {v:'v0.8.0-beta',d:'2025-01-15',ch:[{t:'âœ¨ Deployed',items:['Code defense system â€” fingerprints, keys, honeypots','Obfuscation armor','Admin war room']},{t:'ðŸ”§ Patched',items:['Generation speed +40%','Stream stability reinforced']}]},
              ].map(r=>(
                <div key={r.v} className="mb-10 last:mb-0">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={cn("font-display font-bold text-lg tracking-wider",r.cur?"text-emerald-400":"text-cyan-400/30")}>{r.v}</span>
                    <span className="text-cyan-400/20 font-mono text-xs">{r.d}</span>
                    {r.cur&&<span className="px-2.5 py-1 rounded border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-400 text-[9px] font-mono tracking-[0.2em] animate-pulse">ACTIVE</span>}
                  </div>
                  <div className="space-y-3 pl-5 border-l border-cyan-500/10">{r.ch.map(g=>(
                    <div key={g.t}><p className="text-sm font-semibold text-cyan-400/50 mb-1">{g.t}</p><ul className="space-y-1">{g.items.map((item,i)=><li key={i} className="text-sm text-cyan-400/35 flex items-start gap-2"><span className="text-emerald-400/30 mt-1">â†’</span>{item}</li>)}</ul></div>
                  ))}</div>
                </div>
              ))}
            </section>

            {/* â•â•â• STATUS â•â•â• */}
            <section id="status" className="scroll-mt-6">
              <HUDFrame className="inline-flex items-center gap-3 px-6 py-2 mb-6"><span className="text-emerald-400 text-[10px] font-mono tracking-[0.3em]">ðŸ“Š SYSTEM DIAGNOSTICS</span></HUDFrame>
              <h2 className="font-display text-3xl sm:text-5xl font-black mb-8">SHIP <span className="text-gradient">DIAGNOSTICS</span></h2>

              <HUDFrame color="#00ff88" className="p-5 bg-emerald-500/[0.03] flex items-center gap-4 mb-6">
                <div className="relative"><span className="absolute inline-flex h-6 w-6 rounded-full bg-emerald-400 opacity-20 animate-ping"/><span className="relative inline-flex h-6 w-6 rounded-full bg-emerald-400"/></div>
                <div><p className="font-display text-sm font-bold text-emerald-400 tracking-[0.15em]">ALL SYSTEMS NOMINAL</p><p className="text-cyan-400/30 text-[10px] font-mono">SWEEP: {time}</p></div>
              </HUDFrame>

              <TerminalBlock tag="hull_integrity.monitor"><div className="space-y-1">
                {['Web Application|99.9%','API & Auth|99.8%','Agent Squadron|99.5%','WebSocket Stream|99.2%','Code Engine|99.4%','Stripe Payments|99.9%','Email Relay|99.7%','Download CDN|99.8%','GDPR Compliance Engine|100%','Cookie Consent Manager|100%'].map(s=>{const[n,up]=s.split('|');return(
                  <div key={n} className="flex items-center gap-4 px-4 py-3 rounded-lg hover:bg-cyan-500/[0.03] transition-colors">
                    <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative rounded-full h-2 w-2 bg-emerald-400"/></span>
                    <span className="flex-1 text-sm text-cyan-400/50">{n}</span><span className="text-[10px] font-mono text-cyan-400/20">{up}</span><span className="text-[9px] font-mono text-emerald-400/40 tracking-widest">NOMINAL</span>
                  </div>
                );})}
              </div></TerminalBlock>
            </section>

            <div className="h-20"/>
          </div>
        </main>
      </div>

      {/* â•â•â• FOOTER â•â•â• */}
      <footer className="relative z-50 flex items-center gap-6 px-4 sm:px-6 py-2 border-t border-cyan-500/10 bg-black/80 backdrop-blur-xl shrink-0 text-[9px] font-mono tracking-[0.2em]">
        <span className="flex items-center gap-1.5 text-emerald-400/60"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400" style={{boxShadow:'0 0 4px #00ff88'}}/>CORE: STABLE</span>
        <span className="flex items-center gap-1.5 text-cyan-400/60"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400" style={{boxShadow:'0 0 4px #00ddff'}}/>GDPR: ARMED</span>
        <span className="hidden sm:flex items-center gap-1.5 text-blue-400/60"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" style={{boxShadow:'0 0 4px #0088ff'}}/>AI ACT: READY</span>
        <span className="hidden md:flex items-center gap-1.5 text-purple-400/60"><span className="w-1.5 h-1.5 rounded-full bg-purple-400" style={{boxShadow:'0 0 4px #8844ff'}}/>DSA: COMPLIANT</span>
        <span className="ml-auto text-cyan-400/30">{time}</span>
      </footer>
    </div>
  );
}