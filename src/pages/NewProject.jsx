import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import DiscoveryPanel from '../components/DiscoveryPanel';
import ziplogicLogo from '../images/ziplogic.png';

// Config
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8001';
const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PARTICLE FIELD â€” same as landing page
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const ParticleField = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId, particles = [];

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

    const createParticles = () => {
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 120);
      const colors = ['#00ff88', '#00ddff', '#8844ff', '#00ff88', '#00ff88', '#00ddff'];
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2 + 0.4, o: Math.random() * 0.5 + 0.15,
        pulse: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * 6)]
      }));
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mouse = mouseRef.current;

      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        const po = p.o * (0.6 + 0.4 * Math.sin(p.pulse));
        const h = p.color;
        const r = parseInt(h.slice(1, 3), 16), g = parseInt(h.slice(3, 5), 16), b = parseInt(h.slice(5, 7), 16);

        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r},${g},${b},${po})`; ctx.fill();

        for (let j = i + 1; j < Math.min(i + 8, particles.length); j++) {
          const q = particles[j];
          const dx = p.x - q.x, dy = p.y - q.y, d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(0,255,136,${0.06 * (1 - d / 130)})`; ctx.lineWidth = 0.5; ctx.stroke();
          }
        }

        const mdx = p.x - mouse.x, mdy = p.y - mouse.y, md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 160) {
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0,255,136,${0.18 * (1 - md / 160)})`; ctx.fill();
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    const onMove = (e) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };
    const handleResize = () => { resize(); createParticles(); };

    resize(); createParticles(); animate();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', onMove); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   ALIEN MASCOT â€” same as landing page style
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const AlienMascot = ({ size = 80, mood = 'neutral' }) => {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    const i = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3000 + Math.random() * 2000);
    return () => clearInterval(i);
  }, []);

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.5))' }}>
      <defs>
        <linearGradient id="agBody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88" /><stop offset="50%" stopColor="#00dd77" /><stop offset="100%" stopColor="#00aa55" /></linearGradient>
        <linearGradient id="agBodyDark" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00cc66" /><stop offset="100%" stopColor="#008844" /></linearGradient>
        <radialGradient id="agEye" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#fff" /><stop offset="30%" stopColor="#00ffff" /><stop offset="100%" stopColor="#0088aa" /></radialGradient>
      </defs>
      <ellipse cx="103" cy="148" rx="45" ry="18" fill="#000" opacity="0.3" />
      <path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill="url(#agBodyDark)" />
      <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#agBody)" />
      <ellipse cx="70" cy="85" rx="22" ry="18" fill="#002815" />
      <ellipse cx="130" cy="85" rx="22" ry="18" fill="#002815" />
      <ellipse cx="70" cy="85" rx="18" ry={blink ? 2 : 14} fill="url(#agEye)" />
      <ellipse cx="130" cy="85" rx="18" ry={blink ? 2 : 14} fill="url(#agEye)" />
      {!blink && <>
        <ellipse cx="72" cy="85" rx="7" ry="9" fill="#001a1a" /><ellipse cx="68" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9" />
        <ellipse cx="132" cy="85" rx="7" ry="9" fill="#001a1a" /><ellipse cx="128" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9" />
      </>}
      <path d="M100 25 Q100 15 100 10" stroke="#00dd77" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="8" r="5" fill="#00ffff"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" /></circle>
      {mood === 'happy' ? <path d="M80 120 Q100 142 120 120" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round" /> :
        mood === 'working' ? <ellipse cx="100" cy="118" rx="6" ry="4" fill="#003322" /> :
          <path d="M85 118 Q100 130 115 118" stroke="#003322" strokeWidth="3" fill="none" strokeLinecap="round" />}
      <g style={{ transformOrigin: '55px 135px', animation: mood === 'happy' ? 'wave 2s ease-in-out infinite' : 'none' }}>
        <ellipse cx="55" cy="140" rx="8" ry="6" fill="#00dd77" /><circle cx="50" cy="138" r="3" fill="#00cc66" /><circle cx="53" cy="134" r="2.5" fill="#00cc66" />
      </g>
      <g><ellipse cx="145" cy="140" rx="8" ry="6" fill="#00dd77" /><circle cx="150" cy="138" r="3" fill="#00cc66" /><circle cx="147" cy="134" r="2.5" fill="#00cc66" /></g>
    </svg>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   FILE BROWSER â€” landing page themed
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const FileBrowser = ({ files, selectedFile, onSelectFile, isStreaming }) => {
  const [expanded, setExpanded] = useState(['frontend', 'backend', 'frontend/src', 'frontend/src/pages', 'frontend/src/components', 'src', 'src/pages', 'src/components']);
  const toggle = (p) => setExpanded(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const getIcon = (p) => p.endsWith('.jsx') || p.endsWith('.tsx') ? 'âš›ï¸' : p.endsWith('.js') ? 'ðŸ“œ' : p.endsWith('.css') ? 'ðŸŽ¨' : p.endsWith('.json') ? 'ðŸ“‹' : 'ðŸ“„';

  const buildTree = () => {
    const tree = {};
    files.forEach(f => {
      const parts = f.path.split('/');
      let curr = tree;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) curr[part] = f;
        else curr = curr[part] = curr[part] || {};
      });
    });
    return tree;
  };

  const renderTree = (node, path = '', depth = 0) => Object.entries(node).sort(([a], [b]) => {
    const aF = node[a].path !== undefined, bF = node[b].path !== undefined;
    if (aF !== bF) return aF ? 1 : -1;
    return a.localeCompare(b);
  }).map(([name, val]) => {
    const full = path ? `${path}/${name}` : name;
    const isFile = val.path !== undefined;
    const isExp = expanded.includes(full);
    const isNew = val.isNew;
    return isFile ? (
      <div key={full} onClick={() => onSelectFile(val)}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded text-sm transition-all
          ${selectedFile?.path === val.path ? 'bg-[rgba(0,255,136,0.15)] text-[#00ff88] border border-[rgba(0,255,136,0.3)]' : 'text-white/70 hover:bg-white/[0.06]'}
          ${isNew ? 'animate-pulse bg-[rgba(0,255,136,0.08)]' : ''}`}
        style={{ paddingLeft: depth * 12 + 8 }}>
        <span>{getIcon(name)}</span><span className="font-[Space_Mono,monospace] truncate flex-1 text-[0.8rem]">{name}</span>
        {isNew && <span className="text-[#00ff88] text-xs font-[Orbitron,sans-serif] tracking-wider">NEW</span>}
      </div>
    ) : (
      <div key={full}>
        <div onClick={() => toggle(full)} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-white/80 hover:bg-white/[0.04] rounded text-sm" style={{ paddingLeft: depth * 12 + 8 }}>
          <span style={{ transform: isExp ? 'rotate(90deg)' : '', transition: '0.15s', fontSize: '10px', color: '#00ff88' }}>â–¶</span>
          <span>ðŸ“</span><span className="font-semibold font-[Rajdhani,sans-serif]">{name}</span>
          <span className="ml-auto text-white/30 text-xs font-[Space_Mono,monospace]">{Object.keys(val).length}</span>
        </div>
        {isExp && renderTree(val, full, depth + 1)}
      </div>
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/[0.08] flex items-center justify-between bg-black/20">
        <h3 className="text-[#00ff88] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px]">// FILES ({files.length})</h3>
        {isStreaming && (
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
            <span className="text-[0.65rem] text-[#00ff88] font-[Space_Mono,monospace]">Streaming</span>
          </span>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
        {files.length === 0
          ? <div className="text-white/30 text-sm text-center py-8 font-[Space_Mono,monospace]">Waiting for files...</div>
          : renderTree(buildTree())}
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   CODE VIEWER â€” landing page themed
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const CodeViewer = ({ file, content }) => !file ? (
  <div className="h-full flex items-center justify-center text-white/30 flex-col gap-3">
    <span className="text-5xl">ðŸ‘ˆ</span>
    <span className="font-[Space_Mono,monospace] text-sm">Select a file to view</span>
  </div>
) : (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-white/[0.08] bg-black/30 flex justify-between items-center">
      <span className="text-[#00ff88] font-[Space_Mono,monospace] text-sm truncate">{file.path}</span>
      <button onClick={() => navigator.clipboard.writeText(content || '')}
        className="text-xs text-white/50 hover:text-[#00ff88] px-3 py-1 border border-white/[0.15] rounded-lg hover:border-[rgba(0,255,136,0.4)] transition-all font-[Space_Mono,monospace]">
        Copy
      </button>
    </div>
    <div className="flex-1 overflow-auto p-4 bg-black/20">
      <pre className="text-sm font-[Space_Mono,monospace] text-white/90 whitespace-pre-wrap leading-relaxed">{content || 'Loading...'}</pre>
    </div>
  </div>
);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   LIVE PREVIEW â€” unchanged logic, landing page theme
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const LivePreview = ({ projectId, status }) => {
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  const startedRef = useRef(false);
  const [isFixing, setIsFixing] = useState(false);
  const [fixMessage, setFixMessage] = useState('');
  const [fixCount, setFixCount] = useState(0);
  const fixingRef = useRef(false);
  const MAX_FIXES = 5;

  const startPreview = useCallback(async () => {
    if (!projectId || startedRef.current) return;
    startedRef.current = true;
    setPreviewStatus('starting'); setError(null); setIframeLoaded(false);
    try {
      const response = await api.post(`/preview/start/${projectId}/`);
      if (response.data.success) {
        const preview = response.data.preview;
        const rawUrl = preview.url || preview.frontend_url || `/api/preview/render/${projectId}/`;
        const finalUrl = rawUrl.startsWith('http') ? rawUrl : `${BACKEND_BASE}${rawUrl}`;
        setPreviewUrl(finalUrl); setPreviewStatus('running');
      } else { setPreviewStatus('error'); setError(response.data.message || 'Preview generation failed'); startedRef.current = false; }
    } catch (e) { setPreviewStatus('error'); setError(e.response?.data?.message || e.message); startedRef.current = false; }
  }, [projectId]);

  useEffect(() => { if (status === 'completed' && projectId && previewStatus === 'idle') startPreview(); }, [status, projectId, previewStatus, startPreview]);

  useEffect(() => {
    const handleMsg = async (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'ZIPLOGIC_REQUEST_FIX') {
        if (fixingRef.current || fixCount >= MAX_FIXES || !projectId) return;
        fixingRef.current = true; setIsFixing(true); setFixMessage('ðŸ”§ AI is analyzing the error...'); setFixCount(prev => prev + 1);
        try {
          const errorData = event.data.error || {};
          const response = await api.post(`/preview/fix/${projectId}/`, { error: errorData.message || 'Unknown error', component_stack: errorData.componentStack || errorData.stack || '', stack: errorData.stack || '' });
          if (response.data.success) {
            setFixMessage(`âœ… Fixed: ${response.data.fixed_file}`);
            setTimeout(() => { if (iframeRef.current) { setIframeLoaded(false); iframeRef.current.src = iframeRef.current.src; } setTimeout(() => setFixMessage(''), 3000); }, 600);
          } else { setFixMessage(`âŒ Fix failed: ${response.data.message}`); setTimeout(() => setFixMessage(''), 5000); }
        } catch (err) { setFixMessage('âŒ Fix request failed'); setTimeout(() => setFixMessage(''), 5000); }
        finally { fixingRef.current = false; setIsFixing(false); }
      }
    };
    window.addEventListener('message', handleMsg);
    return () => window.removeEventListener('message', handleMsg);
  }, [projectId, fixCount]);

  useEffect(() => { setFixCount(0); setFixMessage(''); setPreviewStatus('idle'); setPreviewUrl(null); startedRef.current = false; }, [projectId]);
  useEffect(() => { return () => { if (projectId && previewStatus === 'running') api.post(`/preview/stop/${projectId}/`).catch(() => {}); }; }, [projectId, previewStatus]);

  const handleIframeLoad = () => setIframeLoaded(true);
  const reloadPreview = () => { if (iframeRef.current && previewUrl) { setIframeLoaded(false); iframeRef.current.src = previewUrl; } };

  if (status !== 'completed') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-white/[0.08] bg-black/30 flex justify-between items-center">
          <h3 className="text-[#00ddff] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px]">// DOCKER_PREVIEW</h3>
          <span className="text-[0.65rem] text-white/40 font-[Space_Mono,monospace]">Waiting for build...</span>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center"><div className="text-6xl mb-4">ðŸ³</div><p className="text-white/50 font-[Rajdhani,sans-serif]">Preview will be available</p><p className="text-white/30 text-sm font-[Space_Mono,monospace]">after project generation completes</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/[0.08] bg-black/30 flex justify-between items-center">
        <h3 className="text-[#00ddff] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px]">// DOCKER_PREVIEW</h3>
        <div className="flex items-center gap-3">
          {previewStatus === 'running' && (<>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" /><span className="text-[0.65rem] text-[#00ff88] font-[Space_Mono,monospace]">Running</span></span>
            <button onClick={reloadPreview} className="text-xs text-white/40 hover:text-white/70 transition-colors" title="Reload">ðŸ”„</button>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-[0.7rem] text-[#00ddff] hover:text-[#00ff88] font-[Space_Mono,monospace] transition-colors">Open â†—</a>
          </>)}
          {previewStatus === 'idle' && <button onClick={startPreview} className="text-xs bg-[rgba(0,221,255,0.1)] text-[#00ddff] px-3 py-1 rounded-lg border border-[rgba(0,221,255,0.25)] hover:bg-[rgba(0,221,255,0.2)] transition-all font-[Space_Mono,monospace]">ðŸ³ Start Preview</button>}
          {previewStatus === 'starting' && <span className="text-xs text-[#00ddff] flex items-center gap-2 font-[Space_Mono,monospace]"><span className="animate-spin">âš™ï¸</span> Starting...</span>}
          {previewStatus === 'error' && <button onClick={() => { startedRef.current = false; startPreview(); }} className="text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-lg border border-red-500/20 hover:bg-red-500/20 transition-all font-[Space_Mono,monospace]">ðŸ”„ Retry</button>}
        </div>
      </div>

      {(isFixing || fixMessage) && (
        <div className={`px-4 py-2 text-sm flex items-center gap-2 border-b ${isFixing ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : fixMessage.startsWith('âœ…') ? 'bg-[rgba(0,255,136,0.08)] border-[rgba(0,255,136,0.2)] text-[#00ff88]' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          {isFixing && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          <span className="font-[Space_Mono,monospace] text-xs">{fixMessage}</span>
          {fixCount > 0 && <span className="ml-auto text-xs opacity-60 font-[Space_Mono,monospace]">Fix {fixCount}/{MAX_FIXES}</span>}
        </div>
      )}

      <div className="flex-1 overflow-hidden relative">
        {previewStatus === 'idle' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">ðŸ³</div><p className="text-white/50 mb-4 font-[Rajdhani,sans-serif]">Preview is starting automatically...</p>
            <button onClick={startPreview} className="px-6 py-2 rounded-lg font-[Orbitron,sans-serif] text-[0.75rem] font-bold tracking-[1px] transition-all hover:-translate-y-0.5" style={{ background: 'linear-gradient(135deg,#00ddff,#0088cc)', color: '#000', boxShadow: '0 0 25px rgba(0,221,255,0.3)' }}>Start Preview</button></div></div>
        )}
        {previewStatus === 'starting' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4 animate-bounce">ðŸ³</div><p className="text-white/50 mb-2 font-[Rajdhani,sans-serif]">Generating preview...</p><p className="text-white/30 text-sm font-[Space_Mono,monospace]">Usually takes less than a second</p>
            <div className="mt-4 flex justify-center gap-2"><div className="w-2 h-2 bg-[#00ddff] rounded-full animate-pulse" /><div className="w-2 h-2 bg-[#00ddff] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} /><div className="w-2 h-2 bg-[#00ddff] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} /></div></div></div>
        )}
        {previewStatus === 'running' && previewUrl && (<>
          {!iframeLoaded && <div className="absolute inset-0 z-10 flex items-center justify-center"><div className="text-center"><div className="w-8 h-8 border-2 border-[#00ddff] border-t-transparent rounded-full animate-spin mx-auto mb-3" /><p className="text-white/40 text-sm font-[Space_Mono,monospace]">Loading preview...</p></div></div>}
          <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0" title="Project Preview" onLoad={handleIframeLoad} />
        </>)}
        {previewStatus === 'error' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">âŒ</div><p className="text-red-400 mb-2 font-[Rajdhani,sans-serif] text-lg">Failed to start preview</p><p className="text-white/40 text-sm max-w-md font-[Space_Mono,monospace]">{error}</p>
            <button onClick={() => { startedRef.current = false; startPreview(); }} className="mt-4 px-4 py-2 bg-[rgba(0,221,255,0.1)] text-[#00ddff] rounded-lg border border-[rgba(0,221,255,0.25)] hover:bg-[rgba(0,221,255,0.2)] text-sm transition-all font-[Space_Mono,monospace]">ðŸ”„ Try again</button></div></div>
        )}
      </div>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   PIPELINE â€” landing page themed
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const Pipeline = ({ step, progress, status }) => {
  const steps = [
    { id: 'planning', icon: 'ðŸ—ï¸', label: 'PLANNER' },
    { id: 'generating', icon: 'âš¡', label: 'DEVELOPER' },
    { id: 'testing', icon: 'ðŸ§ª', label: 'EXECUTOR' },
    { id: 'completed', icon: 'âœ…', label: 'COMPLETE' }
  ];
  const order = ['planning', 'generating', 'testing', 'completed'];
  const getStatus = (id) => { const ci = order.indexOf(status), si = order.indexOf(id); return si < ci ? 'done' : si === ci ? 'active' : 'pending'; };

  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-5">
        {steps.map((s, i) => {
          const st = getStatus(s.id);
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all border-2
                  ${st === 'done' ? 'bg-[rgba(0,255,136,0.1)] border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)]'
                    : st === 'active' ? 'bg-[rgba(0,221,255,0.1)] border-[#00ddff] shadow-[0_0_20px_rgba(0,221,255,0.2)] animate-pulse'
                      : 'bg-white/[0.03] border-white/[0.15]'}`}>
                  {s.icon}
                </div>
                <span className={`text-[0.65rem] mt-2 font-[Orbitron,sans-serif] tracking-[1px]
                  ${st === 'done' ? 'text-[#00ff88]' : st === 'active' ? 'text-[#00ddff]' : 'text-white/30'}`}>
                  {s.label}
                </span>
              </div>
              {i < 3 && (
                <div className={`flex-1 h-[2px] mx-3 rounded ${getStatus(steps[i + 1].id) !== 'pending'
                  ? 'bg-gradient-to-r from-[#00ff88] to-[#00ddff] shadow-[0_0_8px_rgba(0,255,136,0.3)]'
                  : 'bg-white/[0.08]'}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00ff88, #00ddff, #8844ff)', boxShadow: '0 0 15px rgba(0,255,136,0.4)' }} />
      </div>
      <p className="text-center text-white/50 text-sm mt-3 font-[Space_Mono,monospace]">{step || 'Initializing...'}</p>
    </div>
  );
};

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
   MAIN â€” NewProject
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
const NewProject = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGen, setIsGen] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('');
  const [files, setFiles] = useState([]);
  const [contents, setContents] = useState({});
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('code');
  const [mood, setMood] = useState('neutral');
  const [isStreaming, setIsStreaming] = useState(false);
  const [discoveryMode, setDiscoveryMode] = useState(false);
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  /* â”€â”€ WebSocket â”€â”€ */
  const connectWebSocket = useCallback((pid) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${BACKEND_PORT}/ws/project/${pid}/`;
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => { setIsStreaming(true); if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          switch (data.type) {
            case 'connected': break;
            case 'generation_status': case 'status': setStatus(data.status); setStep(data.step || data.message || ''); break;
            case 'generation_progress': case 'progress': setProgress(data.progress); setStep(data.step || data.message || ''); setStatus('generating'); setMood('working'); break;
            case 'file_generated': case 'file': {
              const filePath = data.path;
              const fileType = data.file_type || (filePath.includes('backend') ? 'backend' : 'frontend');
              setFiles(prev => prev.find(f => f.path === filePath) ? prev : [...prev, { path: filePath, type: fileType, isNew: true }]);
              if (data.content) setContents(prev => ({ ...prev, [filePath]: data.content }));
              setTimeout(() => setFiles(prev => prev.map(f => f.path === filePath ? { ...f, isNew: false } : f)), 2000);
              break;
            }
            case 'generation_complete': case 'complete': setStatus('completed'); setProgress(100); setStep('Complete!'); setMood('happy'); setIsStreaming(false); break;
            case 'generation_error': case 'error': setStatus('error'); setError(data.message); setMood('neutral'); setIsStreaming(false); break;
          }
        } catch (e) { console.error('WS parse error:', e); }
      };
      ws.onerror = () => setIsStreaming(false);
      ws.onclose = () => setIsStreaming(false);
      wsRef.current = ws;
    } catch (e) { console.log('WebSocket not available:', e); }
  }, []);

  /* â”€â”€ Polling fallback â”€â”€ */
  const startPolling = useCallback((pid) => {
    pollRef.current = setInterval(async () => {
      try {
        const r = await api.get(`/projects/${pid}/`);
        const p = r.data.project;
        setStatus(p.status); setProgress(p.progress || 0); setStep(p.current_step || '');
        if (p.status === 'generating') setMood('working');
        if (p.status === 'completed') {
          clearInterval(pollRef.current); setMood('happy');
          const fr = await api.get(`/projects/${pid}/files/`);
          if (fr.data.success) setFiles([...(fr.data.frontend_files || []).map(f => ({ path: `frontend/${f}`, type: 'frontend' })), ...(fr.data.backend_files || []).map(f => ({ path: `backend/${f}`, type: 'backend' }))]);
        } else if (p.status === 'failed') { clearInterval(pollRef.current); setError(p.error_message); setMood('neutral'); }
      } catch (e) { console.error('Poll error:', e); }
    }, 1500);
  }, []);

  useEffect(() => () => { if (wsRef.current) wsRef.current.close(); if (pollRef.current) clearInterval(pollRef.current); }, []);

  /* ── Submit → enters discovery mode ── */
  const submit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setDiscoveryMode(true);
  };

  /* ── Start Build (called after discovery OR skip) ── */
  const startBuild = async (finalPrompt) => {
    setDiscoveryMode(false);
    setIsGen(true); setStatus('planning'); setProgress(5); setStep('Analyzing requirements...'); setFiles([]); setContents({}); setError(null); setMood('working');
    try {
      const r = await api.post('/projects/', { prompt, enriched_prompt: finalPrompt });
      if (r.data.success) { const pid = r.data.project.id; setProjectId(pid); connectWebSocket(pid); setTimeout(() => { if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) startPolling(pid); }, 2000); }
      else throw new Error(r.data.message);
    } catch (e) { setError(e.response?.data?.message || e.message); setStatus('error'); setIsGen(false); setMood('neutral'); }
  };

  /* â”€â”€ Select file â”€â”€ */
  const selectFile = async (f) => {
    setSelected(f);
    if (contents[f.path] || !projectId) return;
    try {
      const cleanPath = f.path.replace(/^(frontend|backend)\//, '');
      const r = await api.get(`/projects/${projectId}/file/?path=${encodeURIComponent(cleanPath)}&type=${f.type}`);
      if (r.data.success) setContents(prev => ({ ...prev, [f.path]: r.data.content }));
    } catch (e) { console.error('Fetch file error:', e); }
  };

  /* â”€â”€ Download â”€â”€ */
  const download = async () => {
    if (!projectId) return;
    try { const r = await api.get(`/projects/${projectId}/download/`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = 'project.zip'; a.click(); }
    catch (e) { console.error('Download error:', e); }
  };

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     RENDER
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  return (
    <div className="min-h-screen text-white" style={{ background: '#040810' }}>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
*{font-family:'Rajdhani',sans-serif}
::selection{background:rgba(0,255,136,.3);color:#fff}
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:#040810}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#00ff88,#00ddff);border-radius:3px}
@keyframes wave{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes nebPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.5}}
.gradient-text{background:linear-gradient(135deg,#00ff88,#00ddff,#8844ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.btn-shine{position:relative;overflow:hidden}
.btn-shine::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);transition:left .5s}
.btn-shine:hover::before{left:100%}
      `}</style>

      <ParticleField />

      {/* Nebulas */}
      <div className="fixed rounded-full pointer-events-none z-0 w-[500px] h-[500px] -top-[10%] -right-[5%]" style={{ background: 'radial-gradient(circle,rgba(136,68,255,0.15),transparent 70%)', filter: 'blur(120px)', animation: 'nebPulse 12s ease-in-out infinite' }} />
      <div className="fixed rounded-full pointer-events-none z-0 w-[400px] h-[400px] bottom-[10%] -left-[5%]" style={{ background: 'radial-gradient(circle,rgba(0,221,255,0.1),transparent 70%)', filter: 'blur(120px)', animation: 'nebPulse 16s ease-in-out infinite', animationDelay: '-6s' }} />

      {/* â”€â”€ NAV â”€â”€ */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-[24px] border-b border-white/[0.08] h-[72px]" style={{ background: 'rgba(4,8,16,0.8)' }}>
        <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <span className="relative">
              <div className="absolute -inset-0.5 rounded-[10px] bg-[rgba(0,255,136,0.25)]" style={{ animation: 'ping 2s cubic-bezier(0,0,0.2,1) infinite' }} />
              <img src={ziplogicLogo} alt="ZipLogic AI" width="45" height="45" className="rounded-[10px] relative z-[1]" />
            </span>
            <span className="font-[Orbitron,sans-serif] font-bold text-lg">
              <span className="text-white">ZipLogic</span>{' '}
              <span className="gradient-text">AI</span>
            </span>
            <span className="inline-block px-2.5 py-0.5 bg-[rgba(0,255,136,0.12)] border border-[rgba(0,255,136,0.25)] rounded-[20px] font-[Space_Mono,monospace] text-[0.55rem] text-[#00ff88] tracking-[2px]">BETA</span>
          </div>
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-white/50 hover:text-[#00ff88] transition-colors font-[Space_Mono,monospace] text-sm border border-white/[0.1] px-4 py-2 rounded-xl hover:border-[rgba(0,255,136,0.3)]">
            â† Dashboard
          </button>
        </div>
      </nav>

      {/* â”€â”€ CONTENT â”€â”€ */}
      <div className="relative z-20 pt-[96px] px-6 pb-12 max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-[#00ff88] text-[0.65rem] font-[Space_Mono,monospace] tracking-[3px] mb-2 opacity-80">// NEW_PROJECT</p>
            <h1 className="text-3xl font-[Orbitron,sans-serif] font-bold">
              <span className="text-white">Create </span>
              <span className="gradient-text">Something Amazing</span>
            </h1>
          </div>
          <AlienMascot size={80} mood={mood} />
        </div>

        {/* â”€â”€ PROMPT FORM â”€â”€ */}
        {!isGen && !discoveryMode ? (
          <form onSubmit={submit} className="mb-8">
            <div className="p-6 rounded-[20px] border border-white/[0.08] backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <label className="block text-[#00ff88] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px] mb-3">DESCRIBE_YOUR_PROJECT</label>
              <textarea
                value={prompt} onChange={e => setPrompt(e.target.value)}
                placeholder="Build a modern e-commerce website with product listings, shopping cart, user authentication, checkout flow, and admin dashboard..."
                rows={5}
                className="w-full px-4 py-4 rounded-2xl bg-black/30 border border-white/[0.12] text-white placeholder:text-white/25 focus:outline-none focus:border-[rgba(0,255,136,0.4)] focus:shadow-[0_0_20px_rgba(0,255,136,0.1)] resize-none font-[Space_Mono,monospace] text-sm transition-all"
              />
              <div className="flex justify-between mt-4 items-center">
                <p className="text-white/35 text-sm font-[Rajdhani,sans-serif]">Be specific about features, pages, and functionality.</p>
                <button type="submit" disabled={!prompt.trim()}
                  className="btn-shine inline-flex items-center gap-2 px-8 py-3 rounded-xl font-[Orbitron,sans-serif] text-[0.78rem] font-bold tracking-[1px] border-none cursor-pointer transition-all hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: 'linear-gradient(135deg,#00ff88,#00cc66)', color: '#000', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
                  âš¡ START BUILD
                </button>
              </div>
            </div>
          </form>
        ) : discoveryMode ? (
          <DiscoveryPanel
            prompt={prompt}
            onComplete={(enriched) => startBuild(enriched)}
            onSkip={() => startBuild(prompt)}
            onBack={() => setDiscoveryMode(false)}
          />
        ) : (
          <div className="space-y-5">
            {/* Pipeline */}
            <div className="p-4 rounded-[20px] border border-white/[0.08] backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Pipeline step={step} progress={progress} status={status} />
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-red-400 font-[Space_Mono,monospace] text-sm flex items-center gap-2">
                <span className="text-[#00ddff]">ERROR:</span> {error}
              </div>
            )}

            {/* Main workspace */}
            <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
              {/* File browser */}
              <div className="col-span-3 rounded-[16px] border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(8,12,22,0.9)' }}>
                <FileBrowser files={files} selectedFile={selected} onSelectFile={selectFile} isStreaming={isStreaming} />
              </div>

              {/* Code / Preview panel */}
              <div className="col-span-9 rounded-[16px] border border-white/[0.08] flex flex-col overflow-hidden" style={{ background: 'rgba(8,12,22,0.9)' }}>
                {/* Tabs */}
                <div className="flex border-b border-white/[0.08]">
                  <button onClick={() => setTab('code')}
                    className={`px-6 py-3 text-sm font-[Space_Mono,monospace] transition-all ${tab === 'code'
                      ? 'text-[#00ff88] border-b-2 border-[#00ff88] bg-white/[0.03]'
                      : 'text-white/40 hover:text-white/70'}`}>
                    ðŸ“ Code
                  </button>
                  <button onClick={() => setTab('preview')}
                    className={`px-6 py-3 text-sm font-[Space_Mono,monospace] transition-all ${tab === 'preview'
                      ? 'text-[#00ddff] border-b-2 border-[#00ddff] bg-white/[0.03]'
                      : 'text-white/40 hover:text-white/70'}`}>
                    ðŸ³ Docker Preview
                  </button>

                  {status === 'completed' && (
                    <button onClick={download}
                      className="ml-auto mr-4 my-2 px-4 py-1.5 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.25)] rounded-xl text-[#00ff88] text-sm font-[Space_Mono,monospace] hover:bg-[rgba(0,255,136,0.15)] transition-all">
                      â¬‡ï¸ Download
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  {tab === 'code'
                    ? <CodeViewer file={selected} content={selected ? contents[selected.path] : null} />
                    : <LivePreview projectId={projectId} status={status} />}
                </div>
              </div>
            </div>

            {/* Build complete banner */}
            {status === 'completed' && (
              <div className="flex items-center justify-center gap-6 p-6 rounded-[20px] border border-[rgba(0,255,136,0.2)]"
                style={{ background: 'linear-gradient(135deg,rgba(0,255,136,0.05),rgba(0,221,255,0.03),rgba(136,68,255,0.03))' }}>
                <AlienMascot size={60} mood="happy" />
                <div>
                  <h3 className="text-xl font-[Orbitron,sans-serif] font-bold gradient-text">BUILD COMPLETE!</h3>
                  <p className="text-white/50 font-[Rajdhani,sans-serif]">{files.length} files generated successfully.</p>
                </div>
                <button onClick={download}
                  className="btn-shine px-8 py-3 rounded-xl font-[Orbitron,sans-serif] text-[0.78rem] font-bold tracking-[1px] border-none cursor-pointer transition-all hover:-translate-y-0.5"
                  style={{ background: 'linear-gradient(135deg,#00ff88,#00cc66)', color: '#000', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
                  â¬‡ï¸ Download Project
                </button>
                <button onClick={() => navigate(`/project/${projectId}`)}
                  className="px-6 py-3 rounded-xl border border-white/[0.15] text-white hover:border-[rgba(0,255,136,0.3)] hover:text-[#00ff88] transition-all font-[Rajdhani,sans-serif] font-semibold">
                  View Details â†’
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProject;