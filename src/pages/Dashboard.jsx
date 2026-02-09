import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { projectsAPI, dashboardAPI } from '../services/api'
import api from '../services/api'
import { FullPageLoading } from '../components/Loading'
import toast from 'react-hot-toast'
import ziplogicLogo from '../images/ziplogic.png'

// Config
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8001'
const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`

/* ══════════════════════════════════════════════════════════════
   INJECTED GLOBAL STYLES (animations + fonts + scrollbar)
   ══════════════════════════════════════════════════════════════ */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
    ::selection { background: rgba(0,255,136,.3); color: #fff; }
    ::-webkit-scrollbar { width: 5px; }
    ::-webkit-scrollbar-track { background: #020810; }
    ::-webkit-scrollbar-thumb { background: linear-gradient(180deg,#00ff88,#00ddff); border-radius: 3px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes corePulse { 0%,100% { box-shadow: 0 0 20px rgba(0,240,255,0.08); } 50% { box-shadow: 0 0 40px rgba(0,240,255,0.25); } }
    @keyframes previewScan { 0% { top: -2px; } 50% { top: 100%; } 100% { top: -2px; } }
    @keyframes navSweep { 0%,100% { opacity: .3; } 50% { opacity: 1; } }
    @keyframes bootFadeIn { to { opacity: 1; transform: translateY(0); } }
    @keyframes wave { 0%,100% { transform: rotate(-10deg); } 50% { transform: rotate(10deg); } }
    @keyframes headerLine { 0%,100% { width: 240px; opacity: .6; } 50% { width: 360px; opacity: 1; } }
    @keyframes titleShimmer { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
    @keyframes scanDrift { from { background-position: 0 0; } to { background-position: 0 120px; } }
    @keyframes nebPulse { 0%,100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.3); opacity: .5; } }
    @keyframes boltFlicker { 0%,100%{opacity:1}42%{opacity:.3}44%{opacity:1}82%{opacity:.5}84%{opacity:1} }
    @keyframes dotOrbit { from{transform:rotate(0) translateX(68px) rotate(0)}to{transform:rotate(360deg) translateX(68px) rotate(-360deg)} }
    @keyframes dotOrbit2 { from{transform:rotate(0) translateX(56px) rotate(0)}to{transform:rotate(-360deg) translateX(56px) rotate(360deg)} }
    .font-orbitron { font-family: 'Orbitron', sans-serif; }
    .font-rajdhani { font-family: 'Rajdhani', sans-serif; }
    .font-mono-space { font-family: 'Space Mono', monospace; }
    .gradient-text-v2 {
      background: linear-gradient(135deg, #00f0ff, #60d0ff, #00f0ff);
      background-size: 200% 200%;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: titleShimmer 4s ease-in-out infinite;
    }
    .clip-hex { clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%); }
    .clip-skew { clip-path: polygon(8px 0,100% 0,calc(100% - 8px) 100%,0 100%); }
    .clip-skew-lg { clip-path: polygon(14px 0,100% 0,calc(100% - 14px) 100%,0 100%); }
    .clip-skew-sm { clip-path: polygon(6px 0,100% 0,calc(100% - 6px) 100%,0 100%); }
  `}</style>
)

/* ══════════════════════════════════════════════════════════════
   PARTICLE FIELD (canvas)
   ══════════════════════════════════════════════════════════════ */
const ParticleField = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId, particles = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    const createParticles = () => {
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 14000), 120)
      const colors = ['#00ff88','#00ddff','#8844ff','#00ff88','#00ff88','#00ddff']
      particles = Array.from({ length: n }, () => ({
        x: Math.random()*canvas.width, y: Math.random()*canvas.height,
        vx: (Math.random()-0.5)*0.4, vy: (Math.random()-0.5)*0.4,
        r: Math.random()*2+0.4, o: Math.random()*0.5+0.15,
        pulse: Math.random()*Math.PI*2,
        color: colors[Math.floor(Math.random()*6)]
      }))
    }
    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height)
      const mouse = mouseRef.current
      particles.forEach((p,i) => {
        p.x+=p.vx; p.y+=p.vy; p.pulse+=0.015
        if(p.x<-10) p.x=canvas.width+10; if(p.x>canvas.width+10) p.x=-10
        if(p.y<-10) p.y=canvas.height+10; if(p.y>canvas.height+10) p.y=-10
        const po=p.o*(0.6+0.4*Math.sin(p.pulse))
        const h=p.color, r=parseInt(h.slice(1,3),16), g=parseInt(h.slice(3,5),16), b=parseInt(h.slice(5,7),16)
        ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2)
        ctx.fillStyle=`rgba(${r},${g},${b},${po})`; ctx.fill()
        for(let j=i+1;j<Math.min(i+8,particles.length);j++){
          const q=particles[j], dx=p.x-q.x, dy=p.y-q.y, d=Math.sqrt(dx*dx+dy*dy)
          if(d<130){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.strokeStyle=`rgba(0,255,136,${0.06*(1-d/130)})`;ctx.lineWidth=0.5;ctx.stroke()}
        }
        const mdx=p.x-mouse.x, mdy=p.y-mouse.y, md=Math.sqrt(mdx*mdx+mdy*mdy)
        if(md<160){ctx.beginPath();ctx.arc(p.x,p.y,p.r*2.5,0,Math.PI*2);ctx.fillStyle=`rgba(0,255,136,${0.18*(1-md/160)})`;ctx.fill()}
      })
      animationId=requestAnimationFrame(animate)
    }
    const onMove=(e)=>{mouseRef.current={x:e.clientX,y:e.clientY}}
    const handleResize=()=>{resize();createParticles()}
    resize();createParticles();animate()
    window.addEventListener('resize',handleResize)
    window.addEventListener('mousemove',onMove)
    return()=>{cancelAnimationFrame(animationId);window.removeEventListener('resize',handleResize);window.removeEventListener('mousemove',onMove)}
  },[])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

/* ══════════════════════════════════════════════════════════════
   HEX GRID (canvas)
   ══════════════════════════════════════════════════════════════ */
const HexGrid = () => {
  const canvasRef = useRef(null)
  const mouseRef = useRef({ x:-999, y:-999 })

  useEffect(() => {
    const c = canvasRef.current, ctx = c.getContext('2d')
    let w, h
    const resize = () => { w=c.width=window.innerWidth; h=c.height=window.innerHeight }
    resize()
    const onResize = () => resize()
    const onMove = (e) => { mouseRef.current = { x:e.clientX, y:e.clientY } }
    window.addEventListener('resize', onResize)
    window.addEventListener('mousemove', onMove)
    const sz=30, hx=sz*Math.sqrt(3), hy=sz*1.5
    const draw = () => {
      ctx.clearRect(0,0,w,h)
      const mx=mouseRef.current.x, my=mouseRef.current.y
      const cols=Math.ceil(w/hx)+2, rows=Math.ceil(h/hy)+2
      for(let r=-1;r<rows;r++){
        for(let cl=-1;cl<cols;cl++){
          const x=cl*hx+(r%2?hx/2:0), y=r*hy
          const d=Math.hypot(mx-x,my-y), g=Math.max(0,1-d/200)
          ctx.beginPath()
          for(let i=0;i<6;i++){const a=Math.PI/3*i-Math.PI/6;const px=x+sz*Math.cos(a),py=y+sz*Math.sin(a);i===0?ctx.moveTo(px,py):ctx.lineTo(px,py)}
          ctx.closePath()
          ctx.strokeStyle=`rgba(0,240,255,${0.03+g*0.12})`; ctx.lineWidth=0.5; ctx.stroke()
          if(g>0.3){ctx.fillStyle=`rgba(0,240,255,${g*0.03})`;ctx.fill()}
        }
      }
      requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize',onResize); window.removeEventListener('mousemove',onMove) }
  },[])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />
}

/* ══════════════════════════════════════════════════════════════
   ALIEN MASCOT (SVG)
   ══════════════════════════════════════════════════════════════ */
const AlienMascot = ({ size=80, mood='neutral' }) => {
  const [blink,setBlink] = useState(false)
  useEffect(() => {
    const i = setInterval(()=>{setBlink(true);setTimeout(()=>setBlink(false),150)},3000+Math.random()*2000)
    return () => clearInterval(i)
  },[])

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className="drop-shadow-[0_0_20px_rgba(0,255,136,0.5)]">
      <defs>
        <linearGradient id="dAB" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88"/><stop offset="50%" stopColor="#00dd77"/><stop offset="100%" stopColor="#00aa55"/></linearGradient>
        <linearGradient id="dABD" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00cc66"/><stop offset="100%" stopColor="#008844"/></linearGradient>
        <radialGradient id="dAE" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#fff"/><stop offset="30%" stopColor="#00ffff"/><stop offset="100%" stopColor="#0088aa"/></radialGradient>
      </defs>
      <ellipse cx="103" cy="148" rx="45" ry="18" fill="#000" opacity="0.3"/>
      <path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill="url(#dABD)"/>
      <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#dAB)"/>
      <ellipse cx="70" cy="85" rx="22" ry="18" fill="#002815"/>
      <ellipse cx="130" cy="85" rx="22" ry="18" fill="#002815"/>
      <ellipse cx="70" cy="85" rx="18" ry={blink?2:14} fill="url(#dAE)"/>
      <ellipse cx="130" cy="85" rx="18" ry={blink?2:14} fill="url(#dAE)"/>
      {!blink&&<><ellipse cx="72" cy="85" rx="7" ry="9" fill="#001a1a"/><ellipse cx="68" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9"/><ellipse cx="132" cy="85" rx="7" ry="9" fill="#001a1a"/><ellipse cx="128" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9"/></>}
      <path d="M100 25 Q100 15 100 10" stroke="#00dd77" strokeWidth="3" fill="none" strokeLinecap="round"/>
      <circle cx="100" cy="8" r="5" fill="#00ffff"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite"/><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite"/></circle>
      {mood==='happy'?<path d="M80 120 Q100 142 120 120" stroke="#003322" strokeWidth="4" fill="none" strokeLinecap="round"/>:mood==='working'?<ellipse cx="100" cy="118" rx="6" ry="4" fill="#003322"/>:<path d="M85 118 Q100 130 115 118" stroke="#003322" strokeWidth="3" fill="none" strokeLinecap="round"/>}
      <g style={{transformOrigin:'55px 135px',animation:mood==='happy'?'wave 2s ease-in-out infinite':'none'}}><ellipse cx="55" cy="140" rx="8" ry="6" fill="#00dd77"/><circle cx="50" cy="138" r="3" fill="#00cc66"/><circle cx="53" cy="134" r="2.5" fill="#00cc66"/></g>
      <g><ellipse cx="145" cy="140" rx="8" ry="6" fill="#00dd77"/><circle cx="150" cy="138" r="3" fill="#00cc66"/><circle cx="147" cy="134" r="2.5" fill="#00cc66"/></g>
    </svg>
  )
}

/* ══════════════════════════════════════════════════════════════
   LIVE PREVIEW CARD — Docker preview per project
   (Same logic from NewProject.jsx LivePreview)
   ══════════════════════════════════════════════════════════════ */
const LivePreviewCard = ({ projectId, status }) => {
  const [previewStatus, setPreviewStatus] = useState('idle')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const iframeRef = useRef(null)
  const startedRef = useRef(false)
  const [isFixing, setIsFixing] = useState(false)
  const [fixMessage, setFixMessage] = useState('')
  const [fixCount, setFixCount] = useState(0)
  const fixingRef = useRef(false)
  const MAX_FIXES = 5

  const startPreview = useCallback(async () => {
    if (!projectId || startedRef.current) return
    startedRef.current = true
    setPreviewStatus('starting'); setError(null); setIframeLoaded(false)
    try {
      const response = await api.post(`/preview/start/${projectId}/`)
      if (response.data.success) {
        const preview = response.data.preview
        const rawUrl = preview.url || preview.frontend_url || `/api/preview/render/${projectId}/`
        const finalUrl = rawUrl.startsWith('http') ? rawUrl : `${BACKEND_BASE}${rawUrl}`
        setPreviewUrl(finalUrl); setPreviewStatus('running')
      } else {
        setPreviewStatus('error'); setError(response.data.message || 'Preview generation failed'); startedRef.current = false
      }
    } catch (e) {
      setPreviewStatus('error'); setError(e.response?.data?.message || e.message); startedRef.current = false
    }
  }, [projectId])

  useEffect(() => {
    if (status === 'completed' && projectId && previewStatus === 'idle') startPreview()
  }, [status, projectId, previewStatus, startPreview])

  useEffect(() => {
    const handleMsg = async (event) => {
      if (!event.data || typeof event.data !== 'object') return
      if (event.data.type === 'ZIPLOGIC_REQUEST_FIX') {
        if (fixingRef.current || fixCount >= MAX_FIXES || !projectId) return
        fixingRef.current = true; setIsFixing(true); setFixMessage('🔧 AI is analyzing the error...'); setFixCount(prev => prev + 1)
        try {
          const errorData = event.data.error || {}
          const response = await api.post(`/preview/fix/${projectId}/`, {
            error: errorData.message || 'Unknown error',
            component_stack: errorData.componentStack || errorData.stack || '',
            stack: errorData.stack || ''
          })
          if (response.data.success) {
            setFixMessage(`✅ Fixed: ${response.data.fixed_file}`)
            setTimeout(() => {
              if (iframeRef.current) { setIframeLoaded(false); iframeRef.current.src = iframeRef.current.src }
              setTimeout(() => setFixMessage(''), 3000)
            }, 600)
          } else {
            setFixMessage(`❌ Fix failed: ${response.data.message}`)
            setTimeout(() => setFixMessage(''), 5000)
          }
        } catch (err) {
          setFixMessage('❌ Fix request failed')
          setTimeout(() => setFixMessage(''), 5000)
        } finally {
          fixingRef.current = false; setIsFixing(false)
        }
      }
    }
    window.addEventListener('message', handleMsg)
    return () => window.removeEventListener('message', handleMsg)
  }, [projectId, fixCount])

  useEffect(() => {
    setFixCount(0); setFixMessage(''); setPreviewStatus('idle'); setPreviewUrl(null); startedRef.current = false
  }, [projectId])

  useEffect(() => {
    return () => { if (projectId && previewStatus === 'running') api.post(`/preview/stop/${projectId}/`).catch(() => {}) }
  }, [projectId, previewStatus])

  const handleIframeLoad = () => setIframeLoaded(true)
  const reloadPreview = () => { if (iframeRef.current && previewUrl) { setIframeLoaded(false); iframeRef.current.src = previewUrl } }

  return (
    <div className="h-full flex flex-col">
      {/* Header Bar */}
      <div className="px-3 py-2 border-b border-white/[0.08] bg-black/30 flex justify-between items-center">
        <span className="font-mono-space text-[0.6rem] tracking-[1.5px] text-cyan-400">// DOCKER_PREVIEW</span>
        <div className="flex items-center gap-2">
          {previewStatus === 'running' && (
            <>
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff88]" />
                <span className="font-mono-space text-[0.6rem] text-green-400">Live</span>
              </span>
              <button onClick={reloadPreview} className="text-white/40 hover:text-white/70 transition-colors text-xs" title="Reload">🔄</button>
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="font-mono-space text-[0.6rem] text-cyan-400 hover:text-green-400 transition-colors">↗</a>
            </>
          )}
          {previewStatus === 'idle' && (
            <button onClick={startPreview} className="font-mono-space text-[0.6rem] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/25 hover:bg-cyan-500/20 transition-all">🐳 Start</button>
          )}
          {previewStatus === 'starting' && (
            <span className="font-mono-space text-[0.6rem] text-cyan-400 flex items-center gap-1"><span className="animate-spin">⚙️</span> Starting...</span>
          )}
          {previewStatus === 'error' && (
            <button onClick={() => { startedRef.current = false; startPreview() }} className="font-mono-space text-[0.6rem] bg-red-500/10 text-red-400 px-2 py-0.5 rounded border border-red-500/20 hover:bg-red-500/20 transition-all">🔄 Retry</button>
          )}
        </div>
      </div>

      {/* Fix Banner */}
      {(isFixing || fixMessage) && (
        <div className={`px-3 py-1.5 text-[0.65rem] flex items-center gap-2 border-b font-mono-space ${isFixing ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' : fixMessage.startsWith('✅') ? 'bg-green-500/[0.08] border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-300'}`}>
          {isFixing && <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />}
          <span>{fixMessage}</span>
          {fixCount > 0 && <span className="ml-auto opacity-60">Fix {fixCount}/{MAX_FIXES}</span>}
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden relative">
        {previewStatus === 'idle' && status !== 'completed' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center"><div className="text-4xl mb-3">🐳</div><p className="text-white/40 text-sm font-rajdhani">Preview available after build</p></div>
          </div>
        )}
        {previewStatus === 'idle' && status === 'completed' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center"><div className="text-4xl mb-3">🐳</div><p className="text-white/40 text-sm mb-3 font-rajdhani">Starting preview...</p>
              <div className="flex justify-center gap-1.5"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]" /></div>
            </div>
          </div>
        )}
        {previewStatus === 'starting' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center"><div className="text-4xl mb-3 animate-bounce">🐳</div><p className="text-white/40 text-sm font-rajdhani">Generating preview...</p>
              <div className="mt-3 flex justify-center gap-1.5"><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" /><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.2s]" /><div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse [animation-delay:0.4s]" /></div>
            </div>
          </div>
        )}
        {previewStatus === 'running' && previewUrl && (
          <>
            {!iframeLoaded && (
              <div className="absolute inset-0 z-10 flex items-center justify-center">
                <div className="text-center"><div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" /><p className="text-white/40 text-xs font-mono-space">Loading...</p></div>
              </div>
            )}
            <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-0" title="Project Preview" onLoad={handleIframeLoad} />
          </>
        )}
        {previewStatus === 'error' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4"><div className="text-4xl mb-3">❌</div><p className="text-red-400 text-sm mb-1 font-rajdhani">Preview failed</p><p className="text-white/30 text-xs font-mono-space max-w-[200px] mx-auto">{error}</p>
              <button onClick={() => { startedRef.current = false; startPreview() }} className="mt-3 px-3 py-1.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/25 hover:bg-cyan-500/20 text-xs transition-all font-mono-space">🔄 Try again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   FULLSCREEN PREVIEW MODAL
   ══════════════════════════════════════════════════════════════ */
const PreviewModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/85 backdrop-blur-lg" onClick={onClose}>
      <div className="w-[90vw] h-[85vh] max-w-[1400px] overflow-hidden relative border border-cyan-500/30 bg-[#071020]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[rgba(5,13,24,0.9)]">
          <span className="font-orbitron text-xs font-semibold tracking-[2px] text-cyan-400">{project.name?.toUpperCase()}</span>
          <div className="flex items-center gap-3">
            <span className="font-mono-space text-xs text-white/50">{project.name}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/60 hover:border-red-500/50 hover:text-red-400 transition-all text-sm">✕</button>
          </div>
        </div>
        <div className="w-full" style={{ height: 'calc(100% - 52px)' }}>
          <LivePreviewCard projectId={project.id} status={project.status} />
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   POWER CORE (animated ring)
   ══════════════════════════════════════════════════════════════ */
const PowerCore = ({ percentage }) => {
  const [displayPct, setDisplayPct] = useState(0)
  useEffect(() => {
    let val = 0
    const iv = setInterval(() => { val++; setDisplayPct(val); if (val >= percentage) clearInterval(iv) }, 30)
    return () => clearInterval(iv)
  }, [percentage])

  return (
    <div className="relative w-40 h-40">
      {/* Ring 1 */}
      <div className="absolute inset-0 rounded-full border border-cyan-500/25" style={{ animation: 'spin 10s linear infinite' }} />
      {/* Ring 2 */}
      <div className="absolute inset-3 rounded-full border border-green-500/25" style={{ animation: 'spin 8s linear infinite reverse' }} />
      {/* Ring 3 */}
      <div className="absolute inset-6 rounded-full border border-cyan-500/25" style={{ animation: 'spin 6s linear infinite' }} />
      {/* Center */}
      <div className="absolute inset-9 rounded-full flex items-center justify-center flex-col bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent)]" style={{ animation: 'corePulse 3s ease-in-out infinite' }}>
        <span className="font-orbitron text-[22px] font-black text-cyan-400 drop-shadow-[0_0_20px_rgba(0,240,255,0.5)]">{displayPct}%</span>
        <span className="font-mono-space text-[8px] tracking-[2px] text-[#a4cceb] mt-0.5">CORE POWER</span>
      </div>
      {/* Orbital dots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" style={{ animation: 'dotOrbit 8s linear infinite' }} />
      <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#00ff88]" style={{ animation: 'dotOrbit2 6s linear infinite' }} />
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   STAT CARD
   ══════════════════════════════════════════════════════════════ */
const StatCard = ({ label, value, sub, color, barWidth }) => {
  const cm = {
    cyan:    { text:'text-cyan-400',    border:'border-cyan-500/15', top:'bg-cyan-400',    bar:'bg-cyan-400    shadow-[0_0_6px_#00f0ff]' },
    green:   { text:'text-green-400',   border:'border-green-500/15', top:'bg-green-400',   bar:'bg-green-400   shadow-[0_0_6px_#00ff88]' },
    amber:   { text:'text-amber-400',   border:'border-amber-500/15', top:'bg-amber-400',   bar:'bg-amber-400   shadow-[0_0_6px_#ffaa00]' },
    magenta: { text:'text-fuchsia-500', border:'border-fuchsia-500/15', top:'bg-fuchsia-500', bar:'bg-fuchsia-500 shadow-[0_0_6px_#ff00cc]' },
  }
  const c = cm[color] || cm.cyan
  const [animW, setAnimW] = useState(0)
  useEffect(() => { setTimeout(() => setAnimW(barWidth), 600) }, [barWidth])

  return (
    <div className={`relative overflow-hidden p-4 bg-[#071020] border ${c.border} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.top}`} />
      <div className="font-mono-space text-[10px] tracking-[2px] uppercase text-[#a4cceb] mb-1.5">// {label}</div>
      <div className={`font-orbitron text-[28px] font-extrabold leading-none ${c.text}`}>{value}</div>
      <div className="text-xs text-[#a4cceb] mt-1">{sub}</div>
      <div className="mt-2.5 h-[3px] bg-[#0e1e38] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-[2s] ease-out ${c.bar}`} style={{ width: `${animW}%` }} />
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   PROJECT CARD — with Live Preview
   ══════════════════════════════════════════════════════════════ */
const ProjectCard = ({ project, onDelete, onFullPreview, viewMode }) => {
  const statusColor = project.status === 'completed' ? 'bg-green-400 shadow-[0_0_6px_#00ff88] text-green-400' : project.status === 'failed' ? 'bg-red-500 shadow-[0_0_6px_#ff3344] text-red-400' : 'bg-amber-400 shadow-[0_0_6px_#ffaa00] text-amber-400'
  const statusLabel = project.status === 'completed' ? 'ONLINE' : project.status === 'failed' ? 'FAILED' : 'BUILDING'
  const tags = ['REACT', 'NODE.JS', 'DOCKER']

  const download = async () => {
    try {
      const r = await api.get(`/projects/${project.id}/download/`, { responseType: 'blob' })
      const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([r.data])); a.download = `${project.name||'project'}.zip`; a.click()
    } catch { toast.error('Download failed') }
  }

  return (
    <div className={`relative overflow-hidden transition-all duration-300 hover:-translate-y-1 group bg-[#071020] border border-[#0e1e38] ${viewMode==='list'?'flex flex-row':''}`}
      style={{ borderTop: '2px solid rgba(0,255,136,0.4)' }}>

      {/* Preview Area */}
      <div className={`relative overflow-hidden bg-[#0a0e18] ${viewMode==='list'?'w-80 h-[200px] flex-shrink-0':'w-full h-[260px]'}`}>
        <LivePreviewCard projectId={project.id} status={project.status} />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[rgba(2,8,16,0.95)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <div className="flex gap-2 translate-y-2 group-hover:translate-y-0 transition-transform">
            <button onClick={() => onFullPreview(project)} className="clip-skew-sm px-4 py-2 font-orbitron text-[9px] font-bold tracking-[1.5px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 shadow-[0_0_16px_rgba(0,240,255,0.3)] cursor-pointer border-none">⊞ FULL PREVIEW</button>
            <Link to={`/project/${project.id}`} className="clip-skew-sm px-4 py-2 font-orbitron text-[9px] font-bold tracking-[1.5px] uppercase text-cyan-400 bg-cyan-500/10 no-underline cursor-pointer">↗ DETAILS</Link>
          </div>
        </div>
        {/* Scan line */}
        <div className="absolute left-0 right-0 h-0.5 z-10 pointer-events-none bg-gradient-to-r from-transparent via-cyan-500/25 to-transparent" style={{ animation: 'previewScan 4s ease-in-out infinite' }} />
      </div>

      {/* Info */}
      <div className={`p-4 ${viewMode==='list'?'flex-1':''}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusColor.split(' ').slice(0,2).join(' ')}`} />
            <span className={`font-mono-space text-[10px] tracking-[1px] ${statusColor.split(' ').slice(2).join(' ')}`}>{statusLabel}</span>
          </div>
          <span className="font-mono-space text-[10px] text-[#a4cceb]">{project.execution_time?.toFixed(1)}s</span>
        </div>
        <div className="font-rajdhani text-lg font-bold tracking-wide mb-1">{project.name}</div>
        <div className="font-mono-space text-[11px] text-[#a4cceb] flex gap-3 flex-wrap">
          <span>📁 {project.total_files || 0} files</span>
        </div>
        <div className="flex gap-1.5 mt-2.5 flex-wrap">
          {tags.map(t => (
            <span key={t} className="font-mono-space text-[9px] tracking-[1px] px-2 py-0.5 border border-[#0e1e38] text-[#a4cceb] transition-all hover:border-cyan-500/30 hover:text-cyan-400">{t}</span>
          ))}
        </div>
        {/* Actions */}
        <div className="flex gap-1.5 mt-3 pt-3 border-t border-[#0e1e38]">
          <button onClick={() => onFullPreview(project)} className="flex-1 font-orbitron text-[9px] font-semibold tracking-[1.5px] uppercase py-2 border border-[#0e1e38] bg-transparent text-[#a4cceb] cursor-pointer transition-all hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-500/5">⊞ Preview</button>
          <Link to={`/project/${project.id}`} className="flex-1 font-orbitron text-[9px] font-semibold tracking-[1.5px] uppercase py-2 border border-[#0e1e38] bg-transparent text-[#a4cceb] no-underline text-center transition-all hover:border-cyan-500/30 hover:text-cyan-400 hover:bg-cyan-500/5">⚙ Details</Link>
          {project.status === 'completed' && (
            <button onClick={download} className="flex-1 font-orbitron text-[9px] font-semibold tracking-[1.5px] uppercase py-2 border border-[#0e1e38] bg-transparent text-[#a4cceb] cursor-pointer transition-all hover:border-green-500/30 hover:text-green-400 hover:bg-green-500/5">⬇ Download</button>
          )}
          <button onClick={() => onDelete(project.id)} className="flex-1 font-orbitron text-[9px] font-semibold tracking-[1.5px] uppercase py-2 border border-[#0e1e38] bg-transparent text-[#a4cceb] cursor-pointer transition-all hover:border-red-500/30 hover:text-red-400 hover:bg-red-500/5">✕ Remove</button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   SYSTEM STATUS BAR
   ══════════════════════════════════════════════════════════════ */
const SystemBar = () => {
  const [time, setTime] = useState('')
  const [latency, setLatency] = useState(42)
  useEffect(() => {
    const update = () => {
      const n = new Date()
      setTime([n.getHours(),n.getMinutes(),n.getSeconds()].map(v=>String(v).padStart(2,'0')).join(':'))
      setLatency(38+Math.floor(Math.random()*12))
    }
    update(); const iv = setInterval(update, 1000); return () => clearInterval(iv)
  }, [])

  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 bg-[#071020] border-t border-[#0e1e38] flex items-center justify-between px-5 font-mono-space text-[11px] tracking-[1px] text-[#95bbd8] z-[500]">
      <div className="flex items-center gap-5">
        <span className="flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff88]" /> CORE: STABLE</span>
        <span className="flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#00f0ff] [animation-delay:1s]" /> API: CONNECTED</span>
        <span className="flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff88]" /> DOCKER: READY</span>
        <span className="flex items-center gap-1.5"><span className="w-[5px] h-[5px] rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_#ffaa00] [animation-delay:2s]" /> GPU: STANDBY</span>
      </div>
      <div className="flex items-center gap-5">
        <span>PING: {latency}ms</span>
        <span>{time}</span>
        <span>SECTOR: US-EAST-1</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════
   MAIN DASHBOARD
   ══════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [modalProject, setModalProject] = useState(null)
  const [booted, setBooted] = useState(false)
  const [bootLines, setBootLines] = useState([])
  const [bootProgress, setBootProgress] = useState(0)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/login')
    toast.success('Logged out successfully')
  }

  // ── Load data (SAME API logic as original Dashboard) ──
  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [projectsRes, statsRes] = await Promise.all([
        projectsAPI.list(),
        dashboardAPI.getStats()
      ])
      setProjects(projectsRes.data.projects || [])
      setStats(statsRes.data.stats)
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project?')) return
    try {
      await projectsAPI.delete(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
      toast.success('Project deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  // ── Boot sequence ──
  useEffect(() => {
    if (loading) return
    const lines = [
      ['INIT CORE SYSTEMS...','ok'],['LOADING NEURAL INTERFACE v3.0...','ok'],
      ['CONNECTING API GATEWAY...','ok'],['DOCKER ORCHESTRATOR ONLINE...','ok'],
      ['SCANNING PROJECT MANIFESTS...','ok'],['ENCRYPTING CHANNELS — AES-256...','ok'],
      ['GPU CLUSTER HANDSHAKE...','warn'],['RENDERING HOLOGRAPHIC DISPLAY...','ok'],
      ['ALL SYSTEMS NOMINAL — WELCOME BACK, COMMANDER','ok'],
    ]
    let i = 0
    const runLine = () => {
      if (i >= lines.length) { setTimeout(() => setBooted(true), 400); return }
      setBootLines(prev => [...prev, lines[i]])
      setBootProgress(((i+1)/lines.length)*100)
      i++
      setTimeout(runLine, 120+Math.random()*180)
    }
    setTimeout(runLine, 300)
  }, [loading])

  if (loading) return <FullPageLoading text="Loading dashboard..." />

  const projectLimit = stats?.project_limit || 5
  const projectsUsed = stats?.projects_generated || 0
  const corePercent = projectLimit > 0 ? Math.round((projectsUsed/projectLimit)*100) : 0

  return (
    <div className="min-h-screen text-white bg-[#020810] cursor-crosshair">
      <GlobalStyles />
      <HexGrid />
      <ParticleField />

      {/* Scanline + Vignette overlays */}
      <div className="fixed inset-0 pointer-events-none z-[999]" style={{ background:'repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,240,255,0.015) 3px,rgba(0,240,255,0.015) 4px)', animation:'scanDrift 12s linear infinite' }} />
      <div className="fixed inset-0 pointer-events-none z-[998] bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.6))]" />

      {/* HUD Corners */}
      <div className="fixed top-[60px] left-1 w-[50px] h-[50px] z-50 pointer-events-none border-t border-l border-cyan-500/25" />
      <div className="fixed top-[60px] right-1 w-[50px] h-[50px] z-50 pointer-events-none border-t border-r border-cyan-500/25" />
      <div className="fixed bottom-8 left-1 w-[50px] h-[50px] z-50 pointer-events-none border-b border-l border-cyan-500/25" />
      <div className="fixed bottom-8 right-1 w-[50px] h-[50px] z-50 pointer-events-none border-b border-r border-cyan-500/25" />

      {/* ═══ BOOT OVERLAY ═══ */}
      {!booted && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black transition-opacity duration-[800ms]" style={{ opacity: booted?0:1, pointerEvents: booted?'none':'all' }}>
          <div className="font-orbitron text-[42px] font-black tracking-[8px] text-cyan-400 drop-shadow-[0_0_40px_rgba(0,240,255,0.25)]" style={{ animation:'bootFadeIn .6s .3s forwards', opacity:0 }}>⚡ ZIP LOGIC AI</div>
          <div className="mt-8 font-mono-space text-xs text-[#a4cceb] text-left w-[400px] max-w-[90vw]">
            {bootLines.map(([text, status], i) => (
              <div key={i} className="whitespace-nowrap overflow-hidden" style={{ animation:'bootFadeIn .2s forwards' }}>
                {'> '}{text} <span className={status==='ok'?'text-green-400':'text-amber-400'}>[{status.toUpperCase()}]</span>
              </div>
            ))}
          </div>
          <div className="mt-6 w-[300px] max-w-[80vw] h-0.5 bg-[#0e1e38] overflow-hidden rounded-sm" style={{ animation:'bootFadeIn .3s .5s forwards', opacity:0 }}>
            <div className="h-full rounded-sm bg-gradient-to-r from-cyan-400 to-green-400 shadow-[0_0_10px_#00f0ff] transition-[width] duration-150" style={{ width:`${bootProgress}%` }} />
          </div>
        </div>
      )}

      {/* ═══ NAV ═══ */}
      <nav className="fixed top-0 left-0 right-0 h-14 bg-[rgba(5,13,24,0.85)] backdrop-blur-xl border-b border-[#0e1e38] flex items-center justify-between px-7 z-[500]">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" style={{ animation:'navSweep 6s ease-in-out infinite' }} />

        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <div className="relative w-7 h-7 flex items-center justify-center">
            <div className="absolute -inset-0.5 border border-cyan-500/25 clip-hex" style={{ animation:'spin 8s linear infinite' }} />
            <img src={ziplogicLogo} alt="ZipLogic AI" width="24" height="24" className="rounded relative z-[1]" />
          </div>
          <span className="font-orbitron font-extrabold text-[17px] tracking-[4px] uppercase">Zip Logic AI</span>
        </div>

        <div className="flex items-center gap-5">
          <Link to="/pricing" className="hidden sm:block font-mono-space text-[11px] tracking-[2px] uppercase text-[#8ab4d4] no-underline hover:text-cyan-400 transition-all">Pricing</Link>
          <span className="hidden sm:block font-mono-space text-[11px] tracking-[2px] uppercase text-cyan-400 relative pb-1.5 shadow-[0_0_8px_rgba(0,240,255,0.25)]">
            Dashboard
            <span className="absolute bottom-0 left-0 right-0 h-px bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
          </span>
          <Link to="/new-project" className="clip-skew font-orbitron text-[10px] font-bold tracking-[2px] uppercase text-[#020810] bg-cyan-400 px-5 py-2 no-underline shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:bg-white hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all">⚡ NEW PROJECT</Link>
          
          {/* User Avatar with Dropdown */}
          <div className="relative" ref={userMenuRef}>
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full border border-cyan-500/25 bg-[#071020] flex items-center justify-center font-orbitron text-[11px] text-cyan-400 cursor-pointer hover:border-cyan-400 hover:bg-cyan-500/10 transition-all"
            >
              {user?.username?.[0]?.toUpperCase() || 'Z'}
            </button>
            
            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-[#071020] border border-cyan-500/25 shadow-[0_0_20px_rgba(0,240,255,0.15)] z-[600]">
                <div className="px-4 py-3 border-b border-[#0e1e38]">
                  <p className="font-mono-space text-[10px] text-[#a4cceb] tracking-[1px] uppercase">Signed in as</p>
                  <p className="font-rajdhani text-sm text-white font-semibold truncate">{user?.username || 'User'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left font-mono-space text-[11px] tracking-[1px] text-[#a4cceb] hover:bg-red-500/10 hover:text-red-400 transition-all flex items-center gap-2"
                >
                  <span>🚪</span> LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ═══ FULLSCREEN PREVIEW MODAL ═══ */}
      <PreviewModal project={modalProject} isOpen={!!modalProject} onClose={() => setModalProject(null)} />

      {/* ═══ MAIN CONTENT ═══ */}
      <main className="relative z-[2] pt-[76px] pb-16 px-4 sm:px-8 max-w-[1440px] mx-auto transition-opacity duration-[800ms]" style={{ opacity: booted?1:0 }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-7 pb-5 relative border-b border-[#0e1e38]">
          <div className="absolute bottom-[-1px] left-0 h-px bg-gradient-to-r from-cyan-400 to-transparent" style={{ animation:'headerLine 4s ease-in-out infinite' }} />
          <div>
            <h1 className="font-orbitron text-2xl sm:text-[30px] font-extrabold tracking-[5px] uppercase gradient-text-v2">COMMAND CENTER</h1>
            <p className="font-mono-space text-[11px] text-[#a4cceb] tracking-[1px] mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse shadow-[0_0_8px_#00ff88]" />
              SYSTEMS NOMINAL — WELCOME BACK, {user?.username?.toUpperCase() || 'COMMANDER'}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            <AlienMascot size={60} mood="happy" />
            <Link to="/new-project" className="clip-skew-lg font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 px-8 py-3.5 no-underline shadow-[0_0_24px_rgba(0,240,255,0.25)] hover:shadow-[0_0_48px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 transition-all">
              + INITIALIZE PROJECT
            </Link>
          </div>
        </div>

        {/* ═══ TELEMETRY ROW ═══ */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-4 mb-8 items-stretch">
            <div className="flex flex-col gap-3">
              <StatCard label="Projects Deployed" value={<>{projectsUsed}<span className="text-base opacity-40">/{projectLimit}</span></>} sub="Capacity utilization" color="cyan" barWidth={projectLimit>0?(projectsUsed/projectLimit)*100:0} />
              <StatCard label="Total Missions" value={stats.total_projects} sub="All time operations" color="green" barWidth={100} />
            </div>
            <div className="flex items-center justify-center py-5 lg:py-0">
              <PowerCore percentage={corePercent} />
            </div>
            <div className="flex flex-col gap-3">
              <StatCard label="Completed" value={stats.completed_projects} sub={`${stats.total_projects>0?Math.round((stats.completed_projects/stats.total_projects)*100):0}% success rate`} color="amber" barWidth={stats.total_projects>0?(stats.completed_projects/stats.total_projects)*100:0} />
              <StatCard label="Clearance Level" value={stats.subscription_plan?.toUpperCase()||'FREE'} sub={stats.subscription_plan==='free'?'Standard access tier':'Enhanced access tier'} color="magenta" barWidth={stats.subscription_plan==='free'?20:stats.subscription_plan==='pro'?70:100} />
            </div>
          </div>
        )}

        {/* ═══ PROJECTS SECTION HEADER ═══ */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-[30px] h-[30px] flex items-center justify-center text-[13px] clip-hex bg-cyan-500/[0.08]">📂</div>
          <span className="font-orbitron text-[13px] font-semibold tracking-[3px] uppercase">Active Projects</span>
          <span className="font-mono-space text-[10px] text-cyan-400 bg-cyan-500/[0.08] px-2.5 py-0.5 rounded-sm">{projects.length} DEPLOYED</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#0e1e38] to-transparent" />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 mb-4">
          <button onClick={() => setViewMode('grid')} className={`font-mono-space text-[10px] tracking-[1px] px-4 py-1.5 border transition-all ${viewMode==='grid'?'border-cyan-500/25 text-cyan-400 bg-cyan-500/[0.08]':'border-[#0e1e38] text-[#a4cceb] bg-transparent hover:border-cyan-500/25 hover:text-cyan-400'}`}>⊞ GRID</button>
          <button onClick={() => setViewMode('list')} className={`font-mono-space text-[10px] tracking-[1px] px-4 py-1.5 border transition-all ${viewMode==='list'?'border-cyan-500/25 text-cyan-400 bg-cyan-500/[0.08]':'border-[#0e1e38] text-[#a4cceb] bg-transparent hover:border-cyan-500/25 hover:text-cyan-400'}`}>☰ LIST</button>
        </div>

        {/* ═══ PROJECTS GRID ═══ */}
        {projects.length === 0 ? (
          <div className="bg-[#071020] border border-[#0e1e38] p-12 text-center">
            <div className="text-6xl mb-4">📂</div>
            <h3 className="font-orbitron text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-[#a4cceb] mb-6 font-rajdhani">Create your first project to get started</p>
            <Link to="/new-project" className="clip-skew-lg inline-flex items-center gap-2 font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 px-8 py-3 no-underline shadow-[0_0_24px_rgba(0,240,255,0.25)]">
              ⚡ Create Project
            </Link>
          </div>
        ) : (
          <div className={`grid gap-4 mb-8 ${viewMode==='list'?'grid-cols-1':'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'}`}>
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDelete}
                onFullPreview={(p) => setModalProject(p)}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* ═══ UPGRADE CTA ═══ */}
        {stats?.subscription_plan === 'free' && (
          <div className="relative bg-[#071020] border border-cyan-500/25 p-7 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden mb-10">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage:'linear-gradient(rgba(0,240,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,1) 1px,transparent 1px)', backgroundSize:'40px 40px', animation:'scanDrift 20s linear infinite' }} />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-fuchsia-500/[0.08] opacity-40" />
            {/* Floating orb */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent_70%)] pointer-events-none" style={{ animation:'nebPulse 6s ease-in-out infinite' }} />

            <div className="relative z-10">
              <div className="font-orbitron text-[15px] font-bold tracking-[2px] uppercase gradient-text-v2 mb-1.5">Unlock Full Clearance</div>
              <div className="font-mono-space text-[11px] text-[#a4cceb] tracking-[0.5px]">// UPGRADE TO PRO — 50 PROJECT SLOTS PER CYCLE</div>
            </div>
            <Link to="/pricing" className="clip-skew-lg relative z-10 font-orbitron text-[10px] font-bold tracking-[2px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 px-8 py-3 no-underline shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_48px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 transition-all">
              VIEW PLANS
            </Link>
          </div>
        )}
      </main>

      {/* ═══ FOOTER ═══ */}
      {/* <footer className="border-t border-[#0e1e38] pt-9 pb-6 px-8 max-w-[1440px] mx-auto relative z-[2]">
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr_1fr] gap-10 mb-7">
          <div>
            <div className="font-orbitron font-bold text-sm tracking-[3px] text-cyan-400 mb-2.5">⚡ ZIP LOGIC AI</div>
            <p className="text-xs text-[#a4cceb] leading-relaxed max-w-[340px]">Turn your ideas into complete, deployable software systems with AI-powered planning, memory, and accountability.</p>
          </div>
          <div>
            <h4 className="font-orbitron text-[10px] font-semibold tracking-[3px] uppercase mb-3.5">Product</h4>
            <Link to="/pricing" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">Pricing</Link>
            <Link to="/dashboard" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">Dashboard</Link>
            <a href="#" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">Documentation</a>
          </div>
          <div>
            <h4 className="font-orbitron text-[10px] font-semibold tracking-[3px] uppercase mb-3.5">Company</h4>
            <a href="#" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">About</a>
            <a href="#" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">Contact</a>
            <a href="#" className="block text-xs text-[#a4cceb] no-underline py-0.5 hover:text-cyan-400 hover:translate-x-1 transition-all">Privacy</a>
          </div>
        </div>
        <div className="font-mono-space text-[10px] text-[#8aadcc] tracking-[1px] pt-4 border-t border-[#0e1e38]">
          © 2026 ZIP LOGIC AI — ALL RIGHTS RESERVED — SYS.BUILD.v3.0.0
        </div>
      </footer> */}

      {/* ═══ SYSTEM BAR ═══ */}
      <SystemBar />
    </div>
  )
}