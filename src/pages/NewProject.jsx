import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../services/authStore';
import api from '../services/api';
import DiscoveryPanel from '../components/DiscoveryPanel';
import ziplogicLogo from '../images/ziplogic.png';
import {
  Play, Square, RefreshCw, ExternalLink, Loader2, Terminal,
  Zap, Server, AlertCircle, CheckCircle, Monitor, Download,
  FolderOpen, FileCode, ChevronRight, Code, Eye, ArrowLeft,
  Cpu, Rocket, TestTube, Copy, Sparkles
} from 'lucide-react';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// VERSION IDENTIFIER - Check this in browser console!
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ZIPLOGIC_VERSION = 'v3.1.0-NO-AUTO-START';
console.log('%c[ZipLogic] ðŸš€ NewProject.jsx ' + ZIPLOGIC_VERSION, 'background: #00ff88; color: black; font-size: 14px; padding: 4px 8px; border-radius: 4px;');
console.log('%c[ZipLogic] Preview: Manual Start Only (No Auto-Start)', 'color: #00ddff;');

// Config
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8000';
const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;

/* ============================================
   PARTICLE FIELD - same as landing page
   ============================================ */
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

/* ============================================
   ALIEN MASCOT - same as landing page style
   ============================================ */
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
        <linearGradient id="agEye" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#000" /><stop offset="100%" stopColor="#001a0a" /></linearGradient>
        <filter id="agGlow"><feGaussianBlur stdDeviation="3" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <ellipse cx="100" cy="115" rx="55" ry="50" fill="url(#agBody)" filter="url(#agGlow)" />
      <ellipse cx="75" cy="105" rx={blink ? 18 : 18} ry={blink ? 2 : 22} fill="url(#agEye)" />
      <ellipse cx="125" cy="105" rx={blink ? 18 : 18} ry={blink ? 2 : 22} fill="url(#agEye)" />
      {!blink && <><ellipse cx="78" cy="100" rx="5" ry="6" fill="#00ff88" opacity="0.8" /><ellipse cx="128" cy="100" rx="5" ry="6" fill="#00ff88" opacity="0.8" /></>}
      <path d={mood === 'happy' ? 'M 80 135 Q 100 150 120 135' : mood === 'working' ? 'M 85 138 L 115 138' : 'M 85 138 Q 100 142 115 138'} stroke="#004422" strokeWidth="3" fill="none" strokeLinecap="round" />
      <ellipse cx="55" cy="85" rx="8" ry="12" fill="url(#agBody)" transform="rotate(-20 55 85)" />
      <ellipse cx="145" cy="85" rx="8" ry="12" fill="url(#agBody)" transform="rotate(20 145 85)" />
      {mood === 'happy' && <g style={{ animation: 'wave 0.4s ease-in-out infinite', transformOrigin: '160px 100px' }}><ellipse cx="160" cy="100" rx="10" ry="18" fill="url(#agBody)" /><circle cx="165" cy="85" r="5" fill="#00ff88" opacity="0.7" /></g>}
    </svg>
  );
};

/* ============================================
   FILE BROWSER - Sci-fi themed
   ============================================ */
const FileBrowser = ({ files, selectedFile, onSelectFile, isStreaming }) => {
  const [expanded, setExpanded] = useState([]);
  const toggle = (path) => setExpanded(prev => prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]);

  const getIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    const icons = { js: <FileCode size={14} className="text-yellow-400" />, jsx: <FileCode size={14} className="text-cyan-400" />, ts: <FileCode size={14} className="text-blue-400" />, tsx: <FileCode size={14} className="text-blue-400" />, py: <FileCode size={14} className="text-green-400" />, css: <FileCode size={14} className="text-pink-400" />, html: <FileCode size={14} className="text-orange-400" />, json: <FileCode size={14} className="text-yellow-500" />, md: <FileCode size={14} className="text-gray-400" /> };
    return icons[ext] || <FileCode size={14} className="text-white/50" />;
  };

  const buildTree = () => {
    const tree = {};
    files.forEach(f => {
      const parts = f.path.split('/');
      let current = tree;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) current[part] = { ...f, isNew: f.isNew };
        else { if (!current[part]) current[part] = {}; current = current[part]; }
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
    const isFixed = val.isFixed;
    return isFile ? (
      <div key={full} onClick={() => onSelectFile(val)}
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded text-sm transition-all
          ${selectedFile?.path === val.path ? 'bg-[rgba(0,255,136,0.15)] text-[#00ff88] border border-[rgba(0,255,136,0.3)]' : 'text-white/70 hover:bg-white/[0.06]'}
          ${isNew ? 'animate-pulse bg-[rgba(0,255,136,0.08)]' : ''}
          ${isFixed ? 'animate-pulse bg-[rgba(136,68,255,0.08)]' : ''}`}
        style={{ paddingLeft: depth * 12 + 8 }}>
        <span>{getIcon(name)}</span><span className="font-[Space_Mono,monospace] truncate flex-1 text-[0.8rem]">{name}</span>
        {isNew && <span className="text-[#00ff88] text-xs font-[Orbitron,sans-serif] tracking-wider">NEW</span>}
        {isFixed && <span className="text-purple-400 text-xs font-[Orbitron,sans-serif] tracking-wider">FIXED</span>}
      </div>
    ) : (
      <div key={full}>
        <div onClick={() => toggle(full)} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-white/80 hover:bg-white/[0.04] rounded text-sm" style={{ paddingLeft: depth * 12 + 8 }}>
          <ChevronRight size={10} className={`text-[#00ff88] transition-transform ${isExp ? 'rotate-90' : ''}`} />
          <FolderOpen size={14} className="text-[#00ff88]" /><span className="font-semibold font-[Rajdhani,sans-serif]">{name}</span>
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

/* ============================================
   CODE VIEWER - landing page themed
   ============================================ */
const CodeViewer = ({ file, content }) => !file ? (
  <div className="h-full flex items-center justify-center text-white/30 flex-col gap-3">
    <Code size={48} className="text-white/20" />
    <span className="font-[Space_Mono,monospace] text-sm">Select a file to view</span>
  </div>
) : (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-white/[0.08] bg-black/30 flex justify-between items-center">
      <span className="text-[#00ff88] font-[Space_Mono,monospace] text-sm truncate">{file.path}</span>
      <button onClick={() => navigator.clipboard.writeText(content || '')}
        className="flex items-center gap-1 text-xs text-white/50 hover:text-[#00ff88] px-3 py-1 border border-white/[0.15] rounded-lg hover:border-[rgba(0,255,136,0.4)] transition-all font-[Space_Mono,monospace]">
        <Copy size={12} /> Copy
      </button>
    </div>
    <div className="flex-1 overflow-auto p-4 bg-black/20">
      <pre className="text-sm font-[Space_Mono,monospace] text-white/90 whitespace-pre-wrap leading-relaxed">{content || 'Loading...'}</pre>
    </div>
  </div>
);

/* ============================================
   LIVE PREVIEW - FIXED: No Auto-Start!
   ============================================ */
const LivePreview = ({ projectId, status, files: contents = {}, techStack = {}, agentStatus, agentMessage }) => {
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [runMode, setRunMode] = useState(null);
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [showConsole, setShowConsole] = useState(false);
  const iframeRef = useRef(null);
  const [isFixing, setIsFixing] = useState(false);
  const [fixMessage, setFixMessage] = useState('');
  const [fixCount, setFixCount] = useState(0);
  const pollIntervalRef = useRef(null);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // IMPORTANT: Track if API call is in progress to prevent duplicates
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const isStartingRef = useRef(false);

  const addLog = (type, text) => {
    console.log(`[Preview] [${type}]`, text);
    setConsoleLogs(prev => [...prev.slice(-100), { type, text, time: new Date().toLocaleTimeString() }]);
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // START PREVIEW - ONLY called on button click!
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const startPreview = useCallback(async () => {
    // Prevent duplicate calls
    if (!projectId) {
      console.log('[Preview] No projectId, skipping');
      return;
    }

    if (isStartingRef.current) {
      console.log('[Preview] Already starting, skipping duplicate call');
      return;
    }

    if (previewStatus === 'running' || previewStatus === 'starting') {
      console.log('[Preview] Already running/starting, skipping');
      return;
    }

    // Set flag to prevent duplicate calls
    isStartingRef.current = true;

    setPreviewStatus('starting');
    setRunMode('cloudflare');
    setError(null);
    setIframeLoaded(false);
    addLog('info', `ðŸš€ Starting preview... (${ZIPLOGIC_VERSION})`);

    try {
      addLog('info', 'ðŸ“¡ Calling backend preview API...');

      const response = await api.post('/agents_v3/preview/start/', {
        project_id: projectId
      });

      if (response.data.success) {
        const url = response.data.url;
        const local = response.data.local_url;

        addLog('success', `âœ… Preview URL: ${url}`);
        addLog('info', `ðŸ“ Local: ${local}`);

        setPreviewUrl(url);
        setPreviewStatus('running');

        // Start polling for logs
        startLogPolling();
      } else {
        throw new Error(response.data.error || 'Preview failed to start');
      }
    } catch (err) {
      console.error('Preview error:', err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to start preview';
      addLog('error', `âŒ ${errMsg}`);
      setError(errMsg);
      setPreviewStatus('error');
    } finally {
      // Reset flag after call completes
      isStartingRef.current = false;
    }
  }, [projectId, previewStatus]);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STOP PREVIEW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const stopPreview = useCallback(async () => {
    if (!projectId) return;

    addLog('info', 'ðŸ›‘ Stopping preview...');

    try {
      await api.post('/agents_v3/preview/stop/', {
        project_id: projectId
      });
      addLog('success', 'âœ… Preview stopped');
    } catch (err) {
      console.error('Stop preview error:', err);
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }

    setPreviewStatus('idle');
    setPreviewUrl(null);
    isStartingRef.current = false;
  }, [projectId]);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // POLL LOGS
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const startLogPolling = useCallback(() => {
    if (pollIntervalRef.current) return;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/agents_v3/preview/logs/?project_id=${projectId}&last=20`);
        if (response.data.success && response.data.logs) {
          response.data.logs.forEach(log => {
            if (log.text && log.text.includes('AI Fix')) {
              setIsFixing(true);
              setFixMessage(log.text);
              setTimeout(() => {
                setIsFixing(false);
                setFixMessage('');
              }, 5000);
            }
          });
        }
      } catch (err) {
        // Silently fail
      }
    }, 5000);
  }, [projectId]);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // NO AUTO-START! Removed the useEffect that was auto-starting
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // REMOVED: useEffect that called startPreview on status === 'completed'

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Reset when project changes
  useEffect(() => {
    setFixCount(0);
    setFixMessage('');
    setPreviewStatus('idle');
    setPreviewUrl(null);
    isStartingRef.current = false;
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, [projectId]);

  const handleIframeLoad = () => setIframeLoaded(true);
  const reloadPreview = () => {
    if (iframeRef.current && previewUrl) {
      setIframeLoaded(false);
      iframeRef.current.src = previewUrl;
    }
  };

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // Handle button click - ONLY way to start preview
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const handleStartClick = () => {
    console.log('[Preview] Start button clicked');
    startPreview();
  };

  if (status !== 'completed') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-white/[0.08] bg-black/20">
          <h3 className="text-[#00ff88] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px] flex items-center gap-2">
            <Monitor size={14} /> // LIVE_PREVIEW
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 size={40} className="mx-auto mb-4 text-[#00ddff] animate-spin" />
            <p className="text-white/50 font-[Space_Mono,monospace] text-sm">Waiting for build to complete...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/[0.08] bg-black/20 flex items-center justify-between">
        <h3 className="text-[#00ff88] text-[0.65rem] font-[Space_Mono,monospace] tracking-[2px] flex items-center gap-2">
          <Monitor size={14} /> // LIVE_PREVIEW
          {runMode && (
            <span className={`ml-2 px-2 py-0.5 rounded text-[0.5rem] ${runMode === 'cloudflare' ? 'bg-[rgba(0,221,255,0.2)] text-cyan-400' : 'bg-[rgba(136,68,255,0.2)] text-purple-400'}`}>
              {runMode === 'cloudflare' ? <><Server size={8} className="inline mr-1" />CLOUDFLARE</> : <><Zap size={8} className="inline mr-1" />INSTANT</>}
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          {previewStatus === 'running' && (
            <>
              <button onClick={() => setShowConsole(!showConsole)} className="p-1.5 border border-white/[0.15] rounded hover:border-[rgba(0,255,136,0.4)] transition-all" title="Console">
                <Terminal size={14} className="text-white/60" />
              </button>
              <button onClick={reloadPreview} className="p-1.5 border border-white/[0.15] rounded hover:border-[rgba(0,255,136,0.4)] transition-all" title="Reload">
                <RefreshCw size={14} className="text-white/60" />
              </button>
              <button onClick={stopPreview} className="p-1.5 border border-red-500/30 rounded hover:border-red-500/50 transition-all" title="Stop">
                <Square size={14} className="text-red-400" />
              </button>
              {previewUrl && (
                <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 border border-white/[0.15] rounded hover:border-[rgba(0,255,136,0.4)] transition-all" title="Open in new tab">
                  <ExternalLink size={14} className="text-white/60" />
                </a>
              )}
            </>
          )}
        </div>
      </div>

      {fixMessage && (
        <div className="px-3 py-2 bg-[rgba(136,68,255,0.1)] border-b border-purple-500/20 flex items-center gap-2">
          {isFixing ? <Loader2 size={14} className="animate-spin text-purple-400" /> : <Sparkles size={14} className="text-purple-400" />}
          <span className="text-purple-400 text-xs font-[Space_Mono,monospace]">{fixMessage}</span>
        </div>
      )}

      {agentStatus && (
        <div className={`px-3 py-2 border-b flex items-center gap-2 ${agentStatus === 'fixing' ? 'bg-[rgba(136,68,255,0.15)] border-purple-500/30 animate-pulse' :
          agentStatus === 'fixed' ? 'bg-[rgba(0,255,136,0.1)] border-[rgba(0,255,136,0.3)]' :
            'bg-[rgba(255,68,68,0.1)] border-red-500/20'
          }`}>
          {agentStatus === 'fixing' ? (
            <><Loader2 size={14} className="animate-spin text-purple-400" /><span className="text-purple-400 text-xs font-[Space_Mono,monospace]">🤖 {agentMessage}</span></>
          ) : agentStatus === 'fixed' ? (
            <><Sparkles size={14} className="text-[#00ff88]" /><span className="text-[#00ff88] text-xs font-[Space_Mono,monospace]">🤖 {agentMessage}</span></>
          ) : (
            <><AlertCircle size={14} className="text-red-400" /><span className="text-red-400 text-xs font-[Space_Mono,monospace]">🤖 {agentMessage}</span></>
          )}
        </div>
      )}

      <div className="flex-1 relative">
        {showConsole && (
          <div className="absolute inset-x-0 bottom-0 h-40 bg-black/90 border-t border-white/[0.1] z-10 overflow-auto p-2">
            <div className="font-[Space_Mono,monospace] text-xs">
              {consoleLogs.map((log, i) => (
                <div key={i} className={`py-0.5 ${log.type === 'error' ? 'text-red-400' : log.type === 'success' ? 'text-green-400' : 'text-white/60'}`}>
                  <span className="text-white/30 mr-2">[{log.time}]</span>{log.text}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
            IDLE STATE - Show "Start Preview" button
            â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
        {previewStatus === 'idle' && (
          <div className="h-full flex items-center justify-center">
            <button
              onClick={handleStartClick}
              disabled={isStartingRef.current}
              className="flex items-center gap-2 px-6 py-3 bg-[rgba(0,255,136,0.1)] border border-[rgba(0,255,136,0.3)] rounded-xl text-[#00ff88] hover:bg-[rgba(0,255,136,0.2)] transition-all font-[Space_Mono,monospace] disabled:opacity-50 disabled:cursor-not-allowed">
              <Play size={16} /> Start Preview
            </button>
          </div>
        )}

        {previewStatus === 'starting' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={40} className="mx-auto mb-4 text-[#00ddff] animate-spin" />
              <p className="text-[#00ddff] font-[Space_Mono,monospace] text-sm">Starting preview server...</p>
              <p className="text-white/40 font-[Space_Mono,monospace] text-xs mt-2">Installing dependencies & creating tunnel</p>
            </div>
          </div>
        )}

        {previewStatus === 'running' && previewUrl && (
          <div className="h-full relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                <Loader2 size={32} className="text-[#00ff88] animate-spin" />
              </div>
            )}
            <iframe ref={iframeRef} src={previewUrl} onLoad={handleIframeLoad}
              className="w-full h-full border-none bg-white" title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          </div>
        )}

        {previewStatus === 'error' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
              <p className="text-red-400 mb-2 font-[Rajdhani,sans-serif] text-lg">Failed to start preview</p>
              <p className="text-white/40 text-sm max-w-md font-[Space_Mono,monospace]">{error}</p>
              <button
                onClick={handleStartClick}
                disabled={isStartingRef.current}
                className="mt-4 px-4 py-2 bg-[rgba(0,221,255,0.1)] text-[#00ddff] rounded-lg border border-[rgba(0,221,255,0.25)] hover:bg-[rgba(0,221,255,0.2)] text-sm transition-all font-[Space_Mono,monospace] flex items-center gap-2 mx-auto disabled:opacity-50">
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================
   PIPELINE - landing page themed
   ============================================ */
const Pipeline = ({ step, progress, status }) => {
  const steps = [
    { id: 'planning', icon: <Cpu size={20} />, label: 'PLANNER' },
    { id: 'generating', icon: <Zap size={20} />, label: 'DEVELOPER' },
    { id: 'testing', icon: <TestTube size={20} />, label: 'EXECUTOR' },
    { id: 'completed', icon: <CheckCircle size={20} />, label: 'COMPLETE' }
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
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2
                  ${st === 'done' ? 'bg-[rgba(0,255,136,0.1)] border-[#00ff88] shadow-[0_0_20px_rgba(0,255,136,0.2)] text-[#00ff88]'
                    : st === 'active' ? 'bg-[rgba(0,221,255,0.1)] border-[#00ddff] shadow-[0_0_20px_rgba(0,221,255,0.2)] animate-pulse text-[#00ddff]'
                      : 'bg-white/[0.03] border-white/[0.15] text-white/30'}`}>
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

      <div className="h-2 bg-black/30 rounded-full overflow-hidden border border-white/[0.06]">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #00ff88, #00ddff, #8844ff)', boxShadow: '0 0 15px rgba(0,255,136,0.4)' }} />
      </div>
      <p className="text-center text-white/50 text-sm mt-3 font-[Space_Mono,monospace]">{step || 'Initializing...'}</p>
    </div>
  );
};

/* ============================================
   MAIN - NewProject
   ============================================ */
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
  const [techStack, setTechStack] = useState({});
  const [agentStatus, setAgentStatus] = useState(null);
  const [agentMessage, setAgentMessage] = useState('');
  const [agentFixedFiles, setAgentFixedFiles] = useState([]);
  const wsRef = useRef(null);

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // WEBSOCKET - Fixed to handle both message formats
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const connectWebSocket = useCallback((pid) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${BACKEND_PORT}/ws/v3/project/${pid}/`;

    console.log('ðŸ”Œ WebSocket connecting:', wsUrl);

    try {
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('âœ… WebSocket connected');
        setIsStreaming(true);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

          // Handle both {type, data: {...}} and {type, ...} formats
          const type = msg.type;
          const data = msg.data || msg;  // â† FIX: Use msg.data if exists, else msg

          console.log('ðŸ“¨ WS:', type);

          switch (type) {
            case 'connected':
              break;

            case 'generation_status':
            case 'status':
              setStatus(data.status || msg.status);
              setStep(data.step || data.message || msg.step || msg.message || '');
              break;

            case 'generation_progress':
            case 'progress':
              setProgress(data.progress || msg.progress || 0);
              setStep(data.step || data.message || msg.step || msg.message || '');
              if ((data.progress || msg.progress) > 10) setStatus('generating');
              setMood('working');
              break;

            case 'files_batch':
              // Template files batch
              const batchFiles = data.files || msg.files || [];
              console.log('ðŸ“¦ Files batch:', batchFiles.length, 'files');
              batchFiles.forEach(f => {
                const filePath = f.path;
                setFiles(prev => prev.find(p => p.path === filePath) ? prev : [...prev, { path: filePath, type: 'frontend', isNew: false }]);
                if (f.content) setContents(prev => ({ ...prev, [filePath]: f.content }));
              });
              break;

            case 'file_generated':
            case 'file':
              // Single file
              const filePath = data.path || msg.path;
              const fileType = data.file_type || msg.file_type || (filePath?.includes('backend') ? 'backend' : 'frontend');
              const fileContent = data.content || msg.content;
              const isFixedFile = data.isFixed || msg.isFixed || false;

              console.log('📄 File:', filePath, isFixedFile ? '(FIXED by Universal Agent)' : '');

              if (filePath) {
                if (isFixedFile) {
                  // File was fixed by Universal Agent — update or add with FIXED badge
                  setFiles(prev => {
                    const existing = prev.find(f => f.path === filePath);
                    if (existing) return prev.map(f => f.path === filePath ? { ...f, isFixed: true } : f);
                    return [...prev, { path: filePath, type: fileType, isNew: false, isFixed: true }];
                  });
                  setTimeout(() => setFiles(prev => prev.map(f => f.path === filePath ? { ...f, isFixed: false } : f)), 5000);
                } else {
                  setFiles(prev => prev.find(f => f.path === filePath) ? prev : [...prev, { path: filePath, type: fileType, isNew: true }]);
                  setTimeout(() => setFiles(prev => prev.map(f => f.path === filePath ? { ...f, isNew: false } : f)), 2000);
                }
                if (fileContent) setContents(prev => ({ ...prev, [filePath]: fileContent }));
              }
              break;

            case 'generation_complete':
            case 'complete':
              setStatus('completed');
              setProgress(100);
              setStep('Complete!');
              setMood('happy');
              setIsStreaming(false);
              if (data.tech_stack || msg.tech_stack) setTechStack(data.tech_stack || msg.tech_stack);
              break;

            case 'agent_status':
              // Universal Agent status updates
              const aStatus = data.status || msg.status;
              const aMessage = data.message || msg.message || '';
              setAgentStatus(aStatus);
              setAgentMessage(aMessage);
              console.log('🤖 Universal Agent:', aStatus, aMessage);
              if (aStatus === 'fixed') {
                setAgentFixedFiles(data.files_fixed || msg.files_fixed || []);
                setTimeout(() => { setAgentStatus(null); setAgentMessage(''); }, 8000);
              } else if (aStatus === 'failed' || aStatus === 'error' || aStatus === 'max_retries') {
                setTimeout(() => { setAgentStatus(null); setAgentMessage(''); }, 6000);
              }
              break;

            case 'generation_error':
            case 'error':
              setStatus('error'); // Corrected: set status to 'error' string
              setError(data.message || data.error || msg.message || msg.error || 'Unknown error');
              setMood('neutral');
              setIsStreaming(false);
              break;
          }
        } catch (e) {
          console.error('WS parse error:', e);
        }
      };

      ws.onerror = () => setIsStreaming(false);
      ws.onclose = () => setIsStreaming(false);
      wsRef.current = ws;
    } catch (e) {
      console.log('WebSocket error:', e);
    }
  }, []);

  useEffect(() => () => { if (wsRef.current) wsRef.current.close(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setDiscoveryMode(true);
  };

  const startBuild = async (finalPrompt, projectName = '') => {
    setDiscoveryMode(false);
    setIsGen(true);
    setStatus('planning');
    setProgress(5);
    setStep('Analyzing requirements...');
    setFiles([]);
    setContents({});
    setError(null);
    setMood('working');

    try {
      const payload = {
        prompt,
        enriched_prompt: finalPrompt
      };

      // Add project_name if provided
      if (projectName && projectName.trim()) {
        payload.project_name = projectName.trim();
      }

      const r = await api.post('/agents_v3/generate/', payload);
      if (r.data.success) {
        const pid = r.data.project.id;
        setProjectId(pid);
        connectWebSocket(pid);
      } else {
        throw new Error(r.data.message);
      }
    } catch (e) {
      setError(e.response?.data?.message || e.message);
      setStatus('error');
      setIsGen(false);
      setMood('neutral');
    }
  };

  const selectFile = async (f) => {
    setSelected(f);
    if (contents[f.path] || !projectId) return;
    try {
      const cleanPath = f.path.replace(/^(frontend|backend)\//, '');
      const r = await api.get(`/agents_v3/project/${projectId}/file/?path=${encodeURIComponent(cleanPath)}&type=${f.type}`);
      if (r.data.success) setContents(prev => ({ ...prev, [f.path]: r.data.content }));
    } catch (e) {
      console.error('Fetch file error:', e);
    }
  };

  const download = async () => {
    if (!projectId) return;
    try {
      const r = await api.get(`/agents_v3/project/${projectId}/download/`, { responseType: 'blob' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([r.data]));
      a.download = 'project.zip';
      a.click();
    } catch (e) {
      console.error('Download error:', e);
    }
  };

  const getFilesObject = () => {
    const obj = {};
    files.forEach(f => { if (contents[f.path]) obj[f.path] = contents[f.path]; });
    return obj;
  };

  /* ============================================
     RENDER
     ============================================ */
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

      <div className="fixed rounded-full pointer-events-none z-0 w-[500px] h-[500px] -top-[10%] -right-[5%]" style={{ background: 'radial-gradient(circle,rgba(136,68,255,0.15),transparent 70%)', filter: 'blur(120px)', animation: 'nebPulse 12s ease-in-out infinite' }} />
      <div className="fixed rounded-full pointer-events-none z-0 w-[400px] h-[400px] bottom-[10%] -left-[5%]" style={{ background: 'radial-gradient(circle,rgba(0,221,255,0.1),transparent 70%)', filter: 'blur(120px)', animation: 'nebPulse 16s ease-in-out infinite', animationDelay: '-6s' }} />

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
            <ArrowLeft size={14} /> Dashboard
          </button>
        </div>
      </nav>

      <div className="relative z-20 pt-[96px] px-6 pb-12 max-w-7xl mx-auto">
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
                  <Rocket size={16} /> START BUILD
                </button>
              </div>
            </div>
          </form>
        ) : discoveryMode ? (
          <DiscoveryPanel
            prompt={prompt}
            onComplete={(enriched, projectName) => startBuild(enriched, projectName)}
            onSkip={(projectName) => startBuild(prompt, projectName)}
            onBack={() => setDiscoveryMode(false)}
          />
        ) : (
          <div className="space-y-5">
            <div className="p-4 rounded-[20px] border border-white/[0.08] backdrop-blur-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
              <Pipeline step={step} progress={progress} status={status} />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-500/[0.06] border border-red-500/20 text-red-400 font-[Space_Mono,monospace] text-sm flex items-center gap-2">
                <AlertCircle size={16} className="text-[#00ddff]" /> ERROR: {error}
              </div>
            )}

            <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
              <div className="col-span-3 rounded-[16px] border border-white/[0.08] overflow-hidden" style={{ background: 'rgba(8,12,22,0.9)' }}>
                <FileBrowser files={files} selectedFile={selected} onSelectFile={selectFile} isStreaming={isStreaming} />
              </div>

              <div className="col-span-9 rounded-[16px] border border-white/[0.08] flex flex-col overflow-hidden" style={{ background: 'rgba(8,12,22,0.9)' }}>
                <div className="flex border-b border-white/[0.08]">
                  <button onClick={() => setTab('code')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-[Space_Mono,monospace] transition-all ${tab === 'code'
                      ? 'text-[#00ff88] border-b-2 border-[#00ff88] bg-white/[0.03]'
                      : 'text-white/40 hover:text-white/70'}`}>
                    <Code size={14} /> Code
                  </button>
                  <button onClick={() => setTab('preview')}
                    className={`flex items-center gap-2 px-6 py-3 text-sm font-[Space_Mono,monospace] transition-all ${tab === 'preview'
                      ? 'text-[#00ddff] border-b-2 border-[#00ddff] bg-white/[0.03]'
                      : 'text-white/40 hover:text-white/70'}`}>
                    <Eye size={14} /> Live Preview
                  </button>

                  {status === 'completed' && (
                    <button onClick={download}
                      className="ml-auto mr-4 my-2 px-4 py-1.5 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.25)] rounded-xl text-[#00ff88] text-sm font-[Space_Mono,monospace] hover:bg-[rgba(0,255,136,0.15)] transition-all flex items-center gap-2">
                      <Download size={14} /> Download
                    </button>
                  )}
                </div>

                <div className="flex-1 overflow-hidden">
                  {tab === 'code'
                    ? <CodeViewer file={selected} content={selected ? contents[selected.path] : null} />
                    : <LivePreview projectId={projectId} status={status} files={getFilesObject()} techStack={techStack} agentStatus={agentStatus} agentMessage={agentMessage} />}
                </div>
              </div>
            </div>

            {status === 'completed' && (
              <div className="flex items-center justify-center gap-6 p-6 rounded-[20px] border border-[rgba(0,255,136,0.2)]"
                style={{ background: 'linear-gradient(135deg,rgba(0,255,136,0.05),rgba(0,221,255,0.03),rgba(136,68,255,0.03))' }}>
                <AlienMascot size={60} mood="happy" />
                <div>
                  <h3 className="text-xl font-[Orbitron,sans-serif] font-bold gradient-text">BUILD COMPLETE!</h3>
                  <p className="text-white/50 font-[Rajdhani,sans-serif]">{files.length} files generated successfully.</p>
                </div>
                <button onClick={download}
                  className="btn-shine px-8 py-3 rounded-xl font-[Orbitron,sans-serif] text-[0.78rem] font-bold tracking-[1px] border-none cursor-pointer transition-all hover:-translate-y-0.5 flex items-center gap-2"
                  style={{ background: 'linear-gradient(135deg,#00ff88,#00cc66)', color: '#000', boxShadow: '0 0 30px rgba(0,255,136,0.3)' }}>
                  <Download size={16} /> Download Project
                </button>
                <button onClick={() => navigate(`/project/${projectId}`)}
                  className="px-6 py-3 rounded-xl border border-white/[0.15] text-white hover:border-[rgba(0,255,136,0.3)] hover:text-[#00ff88] transition-all font-[Rajdhani,sans-serif] font-semibold flex items-center gap-2">
                  View Details <ChevronRight size={16} />
                </button>
                <button onClick={() => navigate(`/project/${projectId}/editor`)}
                  className="px-6 py-3 rounded-xl border border-purple-500/30 text-purple-400 hover:border-purple-400/50 hover:text-purple-300 transition-all font-[Rajdhani,sans-serif] font-semibold flex items-center gap-2">
                  ✏️ Edit Project
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