import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';

// Config — change once, works everywhere
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8001';
const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`;

// Particle Background
const ParticleField = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationId, particles = [];
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const createParticles = () => {
      particles = Array.from({ length: 50 }, () => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2, vy: (Math.random() - 0.5) * 0.2,
        radius: Math.random() * 1.5 + 0.5, color: ['#00ff88', '#00ddff', '#8844ff'][Math.floor(Math.random() * 3)]
      }));
    };
    const animate = () => {
      ctx.fillStyle = 'rgba(0,0,0,0.05)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color; ctx.shadowBlur = 8; ctx.shadowColor = p.color; ctx.fill(); ctx.shadowBlur = 0;
      });
      animationId = requestAnimationFrame(animate);
    };
    const handleResize = () => { resize(); createParticles(); };
    resize(); createParticles(); animate();
    window.addEventListener('resize', handleResize);
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" style={{ background: 'linear-gradient(180deg, #000, #050510, #0a0520)' }} />;
};

// Alien Mascot
const AlienMascot = ({ size = 80, mood = 'neutral' }) => {
  const [blink, setBlink] = useState(false);
  useEffect(() => { const i = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150); }, 3000); return () => clearInterval(i); }, []);
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ filter: 'drop-shadow(0 0 20px rgba(0,255,136,0.5))' }}>
      <defs><linearGradient id="ag" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88"/><stop offset="100%" stopColor="#00aa55"/></linearGradient></defs>
      <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#ag)"/><path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill="#00aa55"/>
      <ellipse cx="70" cy="85" rx="18" ry={blink ? 2 : 14} fill="#00ffff"/><ellipse cx="130" cy="85" rx="18" ry={blink ? 2 : 14} fill="#00ffff"/>
      {!blink && <><ellipse cx="72" cy="85" rx="6" ry="8" fill="#001a1a"/><ellipse cx="132" cy="85" rx="6" ry="8" fill="#001a1a"/></>}
      <circle cx="100" cy="8" r="5" fill="#00ffff" className="animate-pulse"/>
      {mood === 'happy' ? <path d="M80 120 Q100 140 120 120" stroke="#003322" strokeWidth="4" fill="none"/> : mood === 'working' ? <ellipse cx="100" cy="118" rx="6" ry="4" fill="#003322"/> : <path d="M85 118 Q100 128 115 118" stroke="#003322" strokeWidth="3" fill="none"/>}
    </svg>
  );
};

// File Browser
const FileBrowser = ({ files, selectedFile, onSelectFile, isStreaming }) => {
  const [expanded, setExpanded] = useState(['frontend', 'backend', 'frontend/src', 'frontend/src/pages', 'frontend/src/components', 'src', 'src/pages', 'src/components']);
  const toggle = (p) => setExpanded(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  const getIcon = (p) => p.endsWith('.jsx') || p.endsWith('.tsx') ? '⚛️' : p.endsWith('.js') ? '📜' : p.endsWith('.css') ? '🎨' : p.endsWith('.json') ? '📋' : '📄';

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
    const aIsFile = node[a].path !== undefined;
    const bIsFile = node[b].path !== undefined;
    if (aIsFile !== bIsFile) return aIsFile ? 1 : -1;
    return a.localeCompare(b);
  }).map(([name, val]) => {
    const full = path ? `${path}/${name}` : name;
    const isFile = val.path !== undefined;
    const isExp = expanded.includes(full);
    const isNew = val.isNew;
    return isFile ? (
      <div key={full} onClick={() => onSelectFile(val)} className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded text-sm transition-all ${selectedFile?.path === val.path ? 'bg-emerald-500/30 text-emerald-300' : 'text-white/70 hover:bg-white/10'} ${isNew ? 'animate-pulse bg-emerald-500/10' : ''}`} style={{ paddingLeft: depth * 12 + 8 }}>
        <span>{getIcon(name)}</span><span className="font-mono truncate flex-1">{name}</span>
        {isNew && <span className="text-emerald-400 text-xs">NEW</span>}
      </div>
    ) : (
      <div key={full}>
        <div onClick={() => toggle(full)} className="flex items-center gap-2 px-2 py-1.5 cursor-pointer text-white/80 hover:bg-white/5 rounded text-sm" style={{ paddingLeft: depth * 12 + 8 }}>
          <span style={{ transform: isExp ? 'rotate(90deg)' : '', transition: '0.15s', fontSize: '10px' }}>▶</span>
          <span>📁</span><span className="font-semibold">{name}</span>
          <span className="ml-auto text-white/30 text-xs">{Object.keys(val).length}</span>
        </div>
        {isExp && renderTree(val, full, depth + 1)}
      </div>
    );
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <h3 className="text-emerald-400 text-xs font-mono">// FILES ({files.length})</h3>
        {isStreaming && <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/><span className="text-xs text-emerald-400">Streaming</span></span>}
      </div>
      <div className="flex-1 overflow-y-auto p-2">{files.length === 0 ? <div className="text-white/40 text-sm text-center py-8">Waiting for files...</div> : renderTree(buildTree())}</div>
    </div>
  );
};

// Code Viewer
const CodeViewer = ({ file, content }) => !file ? (
  <div className="h-full flex items-center justify-center text-white/40 flex-col gap-2"><span className="text-4xl">👈</span><span>Select a file to view</span></div>
) : (
  <div className="h-full flex flex-col">
    <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
      <span className="text-emerald-400 font-mono text-sm truncate">{file.path}</span>
      <button onClick={() => navigator.clipboard.writeText(content || '')} className="text-xs text-white/50 hover:text-white px-3 py-1 border border-white/20 rounded hover:border-emerald-500/50 transition-all">Copy</button>
    </div>
    <div className="flex-1 overflow-auto p-4 bg-black/20"><pre className="text-sm font-mono text-white/90 whitespace-pre-wrap leading-relaxed">{content || 'Loading...'}</pre></div>
  </div>
);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Live Preview with Self-Healing AI Fix
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const LivePreview = ({ projectId, status }) => {
  const [previewStatus, setPreviewStatus] = useState('idle');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  const startedRef = useRef(false);

  // Self-Healing State
  const [isFixing, setIsFixing] = useState(false);
  const [fixMessage, setFixMessage] = useState('');
  const [fixCount, setFixCount] = useState(0);
  const fixingRef = useRef(false);
  const MAX_FIXES = 5;

  // Start preview
  const startPreview = useCallback(async () => {
    if (!projectId || startedRef.current) return;
    startedRef.current = true;
    setPreviewStatus('starting');
    setError(null);
    setIframeLoaded(false);

    try {
      const response = await api.post(`/preview/start/${projectId}/`);

      if (response.data.success) {
        const preview = response.data.preview;
        // ★ FIX: Backend returns ABSOLUTE url via build_absolute_uri()
        // Detect and handle both absolute and relative URLs
        const rawUrl = preview.url || preview.frontend_url || `/api/preview/render/${projectId}/`;
        const finalUrl = rawUrl.startsWith('http') ? rawUrl : `${BACKEND_BASE}${rawUrl}`;
        console.log('🔗 Preview URL:', finalUrl);
        setPreviewUrl(finalUrl);
        setPreviewStatus('running');
      } else {
        setPreviewStatus('error');
        setError(response.data.message || 'Preview generation failed');
        startedRef.current = false;
      }
    } catch (e) {
      setPreviewStatus('error');
      setError(e.response?.data?.message || e.message);
      startedRef.current = false;
    }
  }, [projectId]);

  // ★ AUTO-START when build completes
  useEffect(() => {
    if (status === 'completed' && projectId && previewStatus === 'idle') {
      startPreview();
    }
  }, [status, projectId, previewStatus, startPreview]);

  // Self-Healing: Listen for postMessage from preview iframe
  useEffect(() => {
    const handlePreviewMessage = async (event) => {
      if (!event.data || typeof event.data !== 'object') return;
      if (event.data.type === 'ZIPLOGIC_REQUEST_FIX') {
        if (fixingRef.current || fixCount >= MAX_FIXES || !projectId) return;
        fixingRef.current = true;
        setIsFixing(true);
        setFixMessage('🔧 AI is analyzing the error...');
        setFixCount(prev => prev + 1);
        try {
          const errorData = event.data.error || {};
          console.log(`🔧 Fix attempt ${fixCount + 1}/${MAX_FIXES}:`, errorData.message);
          const response = await api.post(`/preview/fix/${projectId}/`, {
            error: errorData.message || 'Unknown error',
            component_stack: errorData.componentStack || errorData.stack || '',
            stack: errorData.stack || '',
          });
          if (response.data.success) {
            setFixMessage(`✅ Fixed: ${response.data.fixed_file}`);
            setTimeout(() => {
              if (iframeRef.current) { setIframeLoaded(false); iframeRef.current.src = iframeRef.current.src; }
              setTimeout(() => setFixMessage(''), 3000);
            }, 600);
          } else {
            setFixMessage(`❌ Fix failed: ${response.data.message}`);
            setTimeout(() => setFixMessage(''), 5000);
          }
        } catch (err) {
          console.error('Fix API error:', err);
          setFixMessage('❌ Fix request failed');
          setTimeout(() => setFixMessage(''), 5000);
        } finally { fixingRef.current = false; setIsFixing(false); }
      }
      if (event.data.type === 'ZIPLOGIC_PREVIEW_ERROR') {
        console.warn('Preview error:', event.data.error?.message);
      }
    };
    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [projectId, fixCount]);

  // Reset when project changes
  useEffect(() => { setFixCount(0); setFixMessage(''); setPreviewStatus('idle'); setPreviewUrl(null); startedRef.current = false; }, [projectId]);

  // Stop on unmount
  useEffect(() => {
    return () => { if (projectId && previewStatus === 'running') api.post(`/preview/stop/${projectId}/`).catch(() => {}); };
  }, [projectId, previewStatus]);

  const handleIframeLoad = () => { setIframeLoaded(true); console.log('✅ Preview iframe loaded'); };
  const reloadPreview = () => { if (iframeRef.current && previewUrl) { setIframeLoaded(false); iframeRef.current.src = previewUrl; } };

  if (status !== 'completed') {
    return (
      <div className="h-full flex flex-col">
        <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
          <h3 className="text-cyan-400 text-xs font-mono">// DOCKER_PREVIEW</h3>
          <span className="text-xs text-white/50">Waiting for build...</span>
        </div>
        <div className="flex-1 flex items-center justify-center bg-slate-900">
          <div className="text-center"><div className="text-6xl mb-4">🐳</div><p className="text-white/60">Preview will be available</p><p className="text-white/40 text-sm">after project generation completes</p></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-white/10 bg-black/30 flex justify-between items-center">
        <h3 className="text-cyan-400 text-xs font-mono">// DOCKER_PREVIEW</h3>
        <div className="flex items-center gap-3">
          {previewStatus === 'running' && (<>
            <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/><span className="text-xs text-emerald-400">Running</span></span>
            <button onClick={reloadPreview} className="text-xs text-white/40 hover:text-white/70" title="Reload">🔄</button>
            <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 hover:text-cyan-300">Open in new tab ↗</a>
          </>)}
          {previewStatus === 'idle' && <button onClick={startPreview} className="text-xs bg-cyan-500/20 text-cyan-400 px-3 py-1 rounded border border-cyan-500/30 hover:bg-cyan-500/30 transition-all">🐳 Start Preview</button>}
          {previewStatus === 'starting' && <span className="text-xs text-yellow-400 flex items-center gap-2"><span className="animate-spin">⚙️</span> Starting...</span>}
          {previewStatus === 'error' && <button onClick={() => { startedRef.current = false; startPreview(); }} className="text-xs bg-red-500/20 text-red-400 px-3 py-1 rounded border border-red-500/30 hover:bg-red-500/30 transition-all">🔄 Retry</button>}
        </div>
      </div>

      {(isFixing || fixMessage) && (
        <div className={`px-4 py-2 text-sm flex items-center gap-2 border-b ${isFixing ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300' : fixMessage.startsWith('✅') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-red-500/10 border-red-500/30 text-red-300'}`}>
          {isFixing && <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          <span className="font-mono text-xs">{fixMessage}</span>
          {fixCount > 0 && <span className="ml-auto text-xs opacity-60 font-mono">Fix {fixCount}/{MAX_FIXES}</span>}
        </div>
      )}

      <div className="flex-1 bg-slate-900 overflow-hidden relative">
        {previewStatus === 'idle' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">🐳</div><p className="text-white/60 mb-4">Preview is starting automatically...</p>
            <button onClick={startPreview} className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/20 transition-all">Start Preview</button></div></div>
        )}
        {previewStatus === 'starting' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4 animate-bounce">🐳</div><p className="text-white/60 mb-2">Generating preview...</p><p className="text-white/40 text-sm">Usually takes less than a second</p>
            <div className="mt-4 flex justify-center gap-2"><div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"/><div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay:'0.2s'}}/><div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" style={{animationDelay:'0.4s'}}/></div></div></div>
        )}
        {previewStatus === 'running' && previewUrl && (<>
          {!iframeLoaded && <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900"><div className="text-center"><div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"/><p className="text-white/50 text-sm">Loading preview...</p></div></div>}
          <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0" title="Project Preview" onLoad={handleIframeLoad}/>
        </>)}
        {previewStatus === 'error' && (
          <div className="h-full flex items-center justify-center"><div className="text-center"><div className="text-6xl mb-4">❌</div><p className="text-red-400 mb-2">Failed to start preview</p><p className="text-white/40 text-sm max-w-md">{error}</p>
            <button onClick={() => { startedRef.current = false; startPreview(); }} className="mt-4 px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg border border-cyan-500/30 hover:bg-cyan-500/30 text-sm transition-all">🔄 Try again</button></div></div>
        )}
      </div>
    </div>
  );
};

// Progress Pipeline
const Pipeline = ({ step, progress, status }) => {
  const steps = [{ id: 'planning', icon: '🏗️', label: 'Planning' }, { id: 'generating', icon: '⚡', label: 'Generating' }, { id: 'testing', icon: '🧪', label: 'Testing' }, { id: 'completed', icon: '✅', label: 'Complete' }];
  const order = ['planning', 'generating', 'testing', 'completed'];
  const getStatus = (id) => { const ci = order.indexOf(status), si = order.indexOf(id); return si < ci ? 'done' : si === ci ? 'active' : 'pending'; };
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        {steps.map((s, i) => { const st = getStatus(s.id); return (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-2xl transition-all ${st === 'done' ? 'bg-emerald-500/20 border-2 border-emerald-500' : st === 'active' ? 'bg-cyan-500/20 border-2 border-cyan-500 animate-pulse' : 'bg-white/5 border-2 border-white/20'}`}>{s.icon}</div>
              <span className={`text-xs mt-2 font-mono ${st === 'done' ? 'text-emerald-400' : st === 'active' ? 'text-cyan-400' : 'text-white/40'}`}>{s.label}</span>
            </div>
            {i < 3 && <div className={`flex-1 h-1 mx-3 rounded ${getStatus(steps[i + 1].id) !== 'pending' ? 'bg-gradient-to-r from-emerald-500 to-cyan-500' : 'bg-white/10'}`}/>}
          </React.Fragment>
        );})}
      </div>
      <div className="h-2 bg-black/30 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300" style={{ width: `${progress}%` }}/></div>
      <p className="text-center text-white/60 text-sm mt-3">{step || 'Initializing...'}</p>
    </div>
  );
};

// Main Component
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
  const wsRef = useRef(null);
  const pollRef = useRef(null);

  const connectWebSocket = useCallback((pid) => {
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.hostname}:${BACKEND_PORT}/ws/project/${pid}/`;
    console.log('🔌 Connecting WebSocket:', wsUrl);
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => { console.log('✅ WebSocket connected!'); setIsStreaming(true); if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; } };
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('📨 WS message:', data.type);
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
      ws.onerror = () => { console.log('❌ WebSocket error'); setIsStreaming(false); };
      ws.onclose = () => { console.log('🔌 WebSocket closed'); setIsStreaming(false); };
      wsRef.current = ws;
    } catch (e) { console.log('WebSocket not available:', e); }
  }, []);

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

  const submit = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setIsGen(true); setStatus('planning'); setProgress(5); setStep('Analyzing requirements...'); setFiles([]); setContents({}); setError(null); setMood('working');
    try {
      const r = await api.post('/projects/', { prompt });
      if (r.data.success) { const pid = r.data.project.id; setProjectId(pid); connectWebSocket(pid); setTimeout(() => { if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) startPolling(pid); }, 2000); }
      else throw new Error(r.data.message);
    } catch (e) { setError(e.response?.data?.message || e.message); setStatus('error'); setIsGen(false); setMood('neutral'); }
  };

  const selectFile = async (f) => {
    setSelected(f);
    if (contents[f.path] || !projectId) return;
    try {
      const cleanPath = f.path.replace(/^(frontend|backend)\//, '');
      const r = await api.get(`/projects/${projectId}/file/?path=${encodeURIComponent(cleanPath)}&type=${f.type}`);
      if (r.data.success) setContents(prev => ({ ...prev, [f.path]: r.data.content }));
    } catch (e) { console.error('Fetch file error:', e); }
  };

  const download = async () => {
    if (!projectId) return;
    try { const r = await api.get(`/projects/${projectId}/download/`, { responseType: 'blob' }); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = 'project.zip'; a.click(); }
    catch (e) { console.error('Download error:', e); }
  };

  return (
    <div className="min-h-screen text-white">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&family=Space+Mono&display=swap');*{font-family:'Rajdhani',sans-serif}h1,h2,h3,.font-display{font-family:'Orbitron',sans-serif}.font-mono{font-family:'Space Mono',monospace}.text-gradient{background:linear-gradient(135deg,#00ff88,#00ddff,#8844ff);-webkit-background-clip:text;-webkit-text-fill-color:transparent}.cyber-button:hover{transform:translateY(-2px);box-shadow:0 0 30px rgba(0,255,136,0.5)}`}</style>
      <ParticleField/>
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-black/40 border-b border-emerald-500/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <svg viewBox="0 0 64 64" className="w-10 h-10" style={{ filter: 'drop-shadow(0 0 10px rgba(0,255,136,0.5))' }}><rect width="64" height="64" rx="12" fill="#0a1628"/><path d="M16 18h32l-24 28h24v-6H24l24-28H16v6z" fill="#fff"/><ellipse cx="20" cy="52" rx="6" ry="4" fill="#00ffaa"/><ellipse cx="44" cy="52" rx="6" ry="4" fill="#00ffaa"/></svg>
            <span className="font-display font-bold text-xl"><span className="text-gradient">ZIPLOGIC</span> AI</span>
          </div>
          <button onClick={() => navigate('/dashboard')} className="text-white/60 hover:text-white">← Dashboard</button>
        </div>
      </nav>
      <div className="relative z-20 pt-24 px-6 pb-12 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><p className="text-emerald-400 text-xs font-mono mb-2">// NEW_PROJECT</p><h1 className="text-3xl font-display font-bold"><span className="text-white">Create</span> <span className="text-gradient">Something Amazing</span></h1></div>
          <AlienMascot size={80} mood={mood}/>
        </div>
        {!isGen ? (
          <form onSubmit={submit} className="mb-8">
            <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
              <label className="block text-emerald-400 text-xs font-mono mb-3">DESCRIBE_YOUR_PROJECT</label>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Build a modern e-commerce website with product listings, shopping cart, user authentication, checkout flow, and admin dashboard..." rows={5} className="w-full px-4 py-4 rounded-xl bg-black/30 border border-white/20 text-white placeholder:text-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-sm"/>
              <div className="flex justify-between mt-4 items-center">
                <p className="text-white/40 text-sm">Be specific about features, pages, and functionality.</p>
                <button type="submit" disabled={!prompt.trim()} className="cyber-button bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-3 rounded-lg font-bold disabled:opacity-50 transition-all">⚡ START BUILD</button>
              </div>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"><Pipeline step={step} progress={progress} status={status}/></div>
            {error && <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">Error: {error}</div>}
            <div className="grid grid-cols-12 gap-4" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
              <div className="col-span-3 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm overflow-hidden"><FileBrowser files={files} selectedFile={selected} onSelectFile={selectFile} isStreaming={isStreaming}/></div>
              <div className="col-span-9 rounded-xl border border-white/10 bg-black/40 backdrop-blur-sm flex flex-col overflow-hidden">
                <div className="flex border-b border-white/10">
                  <button onClick={() => setTab('code')} className={`px-6 py-3 text-sm font-mono transition-all ${tab === 'code' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>📝 Code</button>
                  <button onClick={() => setTab('preview')} className={`px-6 py-3 text-sm font-mono transition-all ${tab === 'preview' ? 'text-cyan-400 border-b-2 border-cyan-400 bg-white/5' : 'text-white/50 hover:text-white/80'}`}>🐳 Docker Preview</button>
                  {status === 'completed' && <button onClick={download} className="ml-auto mr-4 my-2 px-4 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm font-mono hover:bg-emerald-500/30 transition-all">⬇️ Download</button>}
                </div>
                <div className="flex-1 overflow-hidden">
                  {tab === 'code' ? <CodeViewer file={selected} content={selected ? contents[selected.path] : null}/> : <LivePreview projectId={projectId} status={status}/>}
                </div>
              </div>
            </div>
            {status === 'completed' && (
              <div className="flex items-center justify-center gap-6 p-6 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
                <AlienMascot size={60} mood="happy"/>
                <div><h3 className="text-xl font-display font-bold text-gradient">BUILD COMPLETE!</h3><p className="text-white/60">{files.length} files generated successfully.</p></div>
                <button onClick={download} className="cyber-button bg-gradient-to-r from-emerald-500 to-cyan-500 text-black px-8 py-3 rounded-lg font-bold transition-all">⬇️ Download Project</button>
                <button onClick={() => navigate(`/project/${projectId}`)} className="px-6 py-3 rounded-lg border border-white/20 text-white hover:border-white/40 transition-all">View Details →</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewProject;
