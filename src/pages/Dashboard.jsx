import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { projectsAPI, dashboardAPI } from '../services/api'
import api from '../services/api'
import { FullPageLoading } from '../components/Loading'
import toast from 'react-hot-toast'
import ziplogicLogo from '../images/ziplogic.png'
import { 
  Play, Square, RefreshCw, ExternalLink, Loader2, Terminal, 
  Zap, Server, AlertCircle, CheckCircle, Monitor, Download,
  Plus, Grid, List, LogOut, Trash2, Eye, ChevronRight, X,
  Sparkles, Maximize2, Folder, Crown, Calendar, Wrench, TrendingUp
} from 'lucide-react'

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// VERSION - Cloudflare Preview System (No WebContainer!)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ZIPLOGIC_VERSION = 'v3.0.0-CLOUDFLARE'
console.log('%c[ZipLogic] ðŸš€ Dashboard.jsx ' + ZIPLOGIC_VERSION, 'background: #00ddff; color: black; font-size: 14px; padding: 4px 8px; border-radius: 4px;')

// Config
const BACKEND_PORT = import.meta.env.VITE_BACKEND_PORT || '8001'
const BACKEND_BASE = `${window.location.protocol}//${window.location.hostname}:${BACKEND_PORT}`

/* ============================================
   INJECTED GLOBAL STYLES (animations + fonts + scrollbar)
   ============================================ */
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
    @keyframes previewPulse { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.1); } }
    @keyframes progressBar { 0% { width: 5%; } 50% { width: 60%; } 100% { width: 95%; } }
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

/* ============================================
   PARTICLE FIELD (canvas)
   ============================================ */
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
    resize(); createParticles(); animate()
    window.addEventListener('resize', handleResize)
    window.addEventListener('mousemove', onMove)
    return () => { cancelAnimationFrame(animationId); window.removeEventListener('resize', handleResize); window.removeEventListener('mousemove', onMove) }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />
}

/* ============================================
   HEX GRID BG (animated)
   ============================================ */
const HexGrid = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,240,255,.25) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 70%, rgba(0,240,255,0.06), transparent 50%)' }} />
    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(136,68,255,0.04), transparent 50%)' }} />
  </div>
)

/* ============================================
   ALIEN MASCOT
   ============================================ */
const AlienMascot = ({ size = 60, mood = 'happy' }) => {
  const [blink, setBlink] = useState(false)
  useEffect(() => {
    const interval = setInterval(() => { setBlink(true); setTimeout(() => setBlink(false), 150) }, 3000 + Math.random() * 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={{ filter: 'drop-shadow(0 0 15px rgba(0,255,136,0.4))' }}>
      <defs>
        <linearGradient id="abg2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88" /><stop offset="50%" stopColor="#00dd77" /><stop offset="100%" stopColor="#00aa55" /></linearGradient>
        <linearGradient id="aey2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#000" /><stop offset="100%" stopColor="#001a0a" /></linearGradient>
        <filter id="agl2"><feGaussianBlur stdDeviation="2" result="g" /><feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      </defs>
      <ellipse cx="100" cy="115" rx="50" ry="45" fill="url(#abg2)" filter="url(#agl2)" />
      <ellipse cx="78" cy="107" rx="15" ry={blink ? 2 : 19} fill="url(#aey2)" />
      <ellipse cx="122" cy="107" rx="15" ry={blink ? 2 : 19} fill="url(#aey2)" />
      {!blink && <><ellipse cx="80" cy="103" rx="4" ry="5" fill="#00ff88" opacity="0.8" /><ellipse cx="124" cy="103" rx="4" ry="5" fill="#00ff88" opacity="0.8" /></>}
      <path d={mood === 'happy' ? 'M 82 132 Q 100 145 118 132' : 'M 86 135 L 114 135'} stroke="#004422" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <ellipse cx="58" cy="90" rx="7" ry="10" fill="url(#abg2)" transform="rotate(-20 58 90)" />
      <ellipse cx="142" cy="90" rx="7" ry="10" fill="url(#abg2)" transform="rotate(20 142 90)" />
      {mood === 'happy' && <g style={{ animation: 'wave 0.4s ease-in-out infinite', transformOrigin: '155px 100px' }}><ellipse cx="155" cy="100" rx="9" ry="16" fill="url(#abg2)" /></g>}
    </svg>
  )
}

/* ============================================
   SYSTEM BAR (bottom)
   ============================================ */
const SystemBar = () => {
  const [time, setTime] = useState(new Date())
  useEffect(() => { const iv = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(iv) }, [])
  return (
    <div className="fixed bottom-0 left-0 right-0 h-7 bg-[rgba(2,8,16,0.95)] backdrop-blur-sm border-t border-[#0e1e38] flex items-center justify-between px-4 z-[500]">
      <div className="flex items-center gap-4">
        <span className="font-mono-space text-[9px] text-[#6a8ba8] tracking-[1px]">SYS.OK</span>
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_6px_#00ff88]" />
        <span className="font-mono-space text-[9px] text-[#6a8ba8]">MEM: 64%</span>
        <span className="font-mono-space text-[9px] text-[#6a8ba8]">CPU: 23%</span>
      </div>
      <div className="font-mono-space text-[9px] text-cyan-400 tracking-[1px]">{time.toLocaleTimeString('en-US', { hour12: false })}</div>
    </div>
  )
}

/* ============================================
   LIVE PREVIEW CARD - Cloudflare Tunnel (No WebContainer!)
   ============================================ */
const LivePreviewCard = ({ projectId, status, autoStart = false }) => {
  const [previewStatus, setPreviewStatus] = useState('idle')
  const [previewUrl, setPreviewUrl] = useState(null)
  const [error, setError] = useState(null)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const [runMode, setRunMode] = useState(null)
  const [isFixing, setIsFixing] = useState(false)
  const [fixMessage, setFixMessage] = useState('')
  const [consoleLogs, setConsoleLogs] = useState([])
  const iframeRef = useRef(null)
  const startedRef = useRef(false)
  const pollIntervalRef = useRef(null)
  const [aiFixing, setAiFixing] = useState(false)
  const [aiFixStatus, setAiFixStatus] = useState('')

  const handleAiFix = async () => {
    const errorLogs = consoleLogs.filter(l => l.type === 'error')
    if (errorLogs.length === 0 && !error) return
    
    const errorText = error || errorLogs[errorLogs.length - 1]?.text || 'Unknown error'
    
    setAiFixing(true)
    setAiFixStatus('fixing')
    addLog('info', '🤖 AI Fix triggered — Universal Agent working...')
    
    try {
      const response = await api.post('/agents_v3/preview/browser-errors/fix/', {
        project_id: projectId,
        error_message: errorText,
        error_file: '',
        error_stack: errorLogs.map(l => l.text).join('\n'),
        page_url: previewUrl || ''
      })
      
      if (response.data.success) {
        setAiFixStatus('fixed')
        addLog('success', '✅ AI Fix applied! Reloading...')
        setTimeout(() => {
          if (iframeRef.current) iframeRef.current.src = iframeRef.current.src
          setAiFixStatus('')
        }, 3000)
      } else {
        setAiFixStatus('failed')
        addLog('error', `❌ AI Fix failed: ${response.data.message || 'Unknown'}`)
        setTimeout(() => setAiFixStatus(''), 3000)
      }
    } catch (err) {
      setAiFixStatus('failed')
      addLog('error', `❌ AI Fix error: ${err.message}`)
      setTimeout(() => setAiFixStatus(''), 3000)
    } finally {
      setAiFixing(false)
    }
  }

  const hasErrors = consoleLogs.some(l => l.type === 'error') || !!error

  const addLog = (type, text) => {
    console.log(`[Preview] [${type}]`, text)
    setConsoleLogs(prev => [...prev.slice(-50), { type, text, time: new Date().toLocaleTimeString() }])
  }

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // START PREVIEW - Cloudflare Tunnel API
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const startPreview = useCallback(async () => {
    if (!projectId || startedRef.current) return
    startedRef.current = true
    
    setPreviewStatus('starting')
    setRunMode('cloudflare')
    setError(null)
    setIframeLoaded(false)
    addLog('info', `ðŸš€ Starting preview... (${ZIPLOGIC_VERSION})`)

    try {
      addLog('info', 'ðŸ“¡ Calling backend preview API...')
      
      const response = await api.post('/agents_v3/preview/start/', {
        project_id: projectId
      })

      if (response.data.success) {
        const url = response.data.local_url || response.data.url
        const local = response.data.local_url
        
        addLog('success', `âœ… Preview URL: ${url}`)
        addLog('info', `ðŸ“ Local: ${local}`)
        
        setPreviewUrl(url)
        setPreviewStatus('running')
        
        // Start polling for logs (for AI Fixer status)
        startLogPolling()
      } else {
        throw new Error(response.data.error || 'Preview failed to start')
      }
    } catch (err) {
      console.error('Preview error:', err)
      const errMsg = err.response?.data?.error || err.message || 'Failed to start preview'
      addLog('error', `âŒ ${errMsg}`)
      setError(errMsg)
      setPreviewStatus('error')
      startedRef.current = false
    }
  }, [projectId])

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // STOP PREVIEW
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const stopPreview = useCallback(async () => {
    if (!projectId) return
    
    addLog('info', 'ðŸ›‘ Stopping preview...')
    
    try {
      await api.post('/agents_v3/preview/stop/', {
        project_id: projectId
      })
      addLog('success', 'âœ… Preview stopped')
    } catch (err) {
      console.error('Stop preview error:', err)
    }
    
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
    
    setPreviewStatus('idle')
    setPreviewUrl(null)
    startedRef.current = false
  }, [projectId])

  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  // POLL LOGS - Check for AI Fixer activity
  // â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
  const startLogPolling = useCallback(() => {
    if (pollIntervalRef.current) return
    
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/agents_v3/preview/logs/?project_id=${projectId}&last=20`)
        if (response.data.success && response.data.logs) {
          response.data.logs.forEach(log => {
            if (log.text && log.text.includes('AI Fix')) {
              setIsFixing(true)
              setFixMessage(log.text)
              setTimeout(() => {
                setIsFixing(false)
                setFixMessage('')
              }, 5000)
            }
          })
        }
      } catch (err) {
        // Silently fail - just polling
      }
    }, 5000)
  }, [projectId])

  // Auto-start when status=completed and autoStart=true
  useEffect(() => {
    if (autoStart && status === 'completed' && projectId && previewStatus === 'idle') {
      startPreview()
    }
  }, [autoStart, status, projectId, previewStatus, startPreview])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [])

  // Reset when project changes
  useEffect(() => {
    setPreviewStatus('idle')
    setPreviewUrl(null)
    startedRef.current = false
    setFixMessage('')
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current)
      pollIntervalRef.current = null
    }
  }, [projectId])

  const handleIframeLoad = () => setIframeLoaded(true)
  const reloadPreview = () => {
    if (iframeRef.current && previewUrl) {
      setIframeLoaded(false)
      iframeRef.current.src = previewUrl
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0e18]">
      {/* Header */}
      <div className="p-2 border-b border-white/[0.08] bg-black/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Monitor size={12} className="text-cyan-400" />
          <span className="font-mono-space text-[9px] text-cyan-400 tracking-[1px]">LIVE PREVIEW</span>
          {runMode && (
            <span className="px-1.5 py-0.5 rounded text-[8px] bg-cyan-500/20 text-cyan-400">
              CLOUDFLARE
            </span>
          )}
        </div>
        {previewStatus === 'running' && (
          <div className="flex items-center gap-1">
            <button onClick={reloadPreview} className="p-1 border border-white/10 rounded hover:border-cyan-500/30 transition-all" title="Reload">
              <RefreshCw size={10} className="text-white/50" />
            </button>
            <button onClick={stopPreview} className="p-1 border border-red-500/20 rounded hover:border-red-500/40 transition-all" title="Stop">
              <Square size={10} className="text-red-400" />
            </button>
            {previewUrl && (
              <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="p-1 border border-white/10 rounded hover:border-cyan-500/30 transition-all" title="Open">
                <ExternalLink size={10} className="text-white/50" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Preview content */}
      <div className="flex-1 relative overflow-hidden">
        {/* Fix message */}
        {fixMessage && (
          <div className="absolute top-0 inset-x-0 px-2 py-1 bg-purple-500/20 border-b border-purple-500/30 z-20 flex items-center gap-2">
            {isFixing ? <Loader2 size={10} className="animate-spin text-purple-400" /> : <Sparkles size={10} className="text-purple-400" />}
            <span className="text-purple-400 text-[9px] font-mono-space">{fixMessage}</span>
          </div>
        )}

        {/* IDLE */}
        {previewStatus === 'idle' && (
          <div className="h-full flex items-center justify-center">
            <button onClick={startPreview}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 hover:bg-cyan-500/20 transition-all font-mono-space text-[10px]">
              <Play size={12} /> START PREVIEW
            </button>
          </div>
        )}

        {/* STARTING */}
        {previewStatus === 'starting' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 size={32} className="mx-auto mb-3 text-cyan-400 animate-spin" />
              <p className="text-cyan-400 text-[10px] font-mono-space tracking-[1px]">STARTING SERVER...</p>
              <p className="text-white/40 text-[9px] font-mono-space mt-1">Installing deps & creating tunnel</p>
            </div>
          </div>
        )}

        {/* RUNNING */}
        {previewStatus === 'running' && previewUrl && (
          <div className="h-full relative">
            {!iframeLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
                <Loader2 size={24} className="text-cyan-400 animate-spin" />
              </div>
            )}
            <iframe
              ref={iframeRef}
              src={previewUrl}
              onLoad={handleIframeLoad}
              className="w-full h-full border-none bg-white"
              title="Live Preview"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />

            {/* AI Fix Button */}
            {hasErrors && (
              <div className="absolute top-2 right-2 z-20">
                {aiFixStatus === 'fixing' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 text-white rounded-md text-[9px] font-mono-space animate-pulse">
                    <Loader2 size={10} className="animate-spin" /> Agent fixing...
                  </div>
                ) : aiFixStatus === 'fixed' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-md text-[9px] font-mono-space">
                    <CheckCircle size={10} /> Fixed! Reloading...
                  </div>
                ) : aiFixStatus === 'failed' ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white rounded-md text-[9px] font-mono-space">
                    <AlertCircle size={10} /> Could not fix
                  </div>
                ) : (
                  <button
                    onClick={handleAiFix}
                    disabled={aiFixing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-md text-[9px] font-mono-space tracking-wider cursor-pointer border-none transition-all hover:scale-105"
                  >
                    <Zap size={10} /> AI FIX
                  </button>
                )}
              </div>
            )}

            {/* URL overlay at bottom */}
            <div className="absolute bottom-0 inset-x-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
              <div className="flex items-center justify-between">
                <span className="font-mono-space text-[8px] text-cyan-400/70 truncate max-w-[200px]">{previewUrl}</span>
                <button onClick={stopPreview}
                  className="font-mono-space text-[8px] text-red-400/60 hover:text-red-400 transition-colors border border-red-500/20 hover:border-red-500/40 px-2 py-1 bg-transparent cursor-pointer flex items-center gap-1">
                  <Square size={8} /> STOP
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ERROR */}
        {previewStatus === 'error' && (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <AlertCircle size={32} className="mx-auto mb-3 text-red-400" />
              <p className="text-red-400 text-sm mb-1 font-rajdhani font-semibold">Preview failed</p>
              <p className="text-white/30 text-[10px] font-mono-space max-w-[200px] mx-auto mb-3">{error}</p>
              <button onClick={() => { startedRef.current = false; startPreview() }}
                className="clip-skew-sm px-4 py-2 font-orbitron text-[9px] font-bold tracking-[1.5px] uppercase text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 hover:bg-cyan-500/20 transition-all cursor-pointer flex items-center gap-2 mx-auto">
                <RefreshCw size={10} /> Try again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   FULLSCREEN PREVIEW MODAL
   ============================================ */
const PreviewModal = ({ project, isOpen, onClose }) => {
  if (!isOpen || !project) return null
  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/85 backdrop-blur-lg" onClick={onClose}>
      <div className="w-[90vw] h-[85vh] max-w-[1400px] overflow-hidden relative border border-cyan-500/30 bg-[#071020]" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.08] bg-[rgba(5,13,24,0.9)]">
          <span className="font-orbitron text-xs font-semibold tracking-[2px] text-cyan-400">{project.name?.toUpperCase()}</span>
          <div className="flex items-center gap-3">
            <span className="font-mono-space text-xs text-white/50">{project.name}</span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/60 hover:border-red-500/50 hover:text-red-400 transition-all">
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="w-full" style={{ height: 'calc(100% - 52px)' }}>
          <LivePreviewCard projectId={project.id} status={project.status} autoStart={true} />
        </div>
      </div>
    </div>
  )
}

/* ============================================
   POWER CORE (animated ring) - NOW SHOWS BUILDS USAGE
   ============================================ */
const PowerCore = ({ percentage, label = "CORE POWER" }) => {
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
        <span className="font-mono-space text-[8px] tracking-[2px] text-[#a4cceb] mt-0.5">{label}</span>
      </div>
      {/* Orbital dots */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" />
      <div className="absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00f0ff]" style={{ animation: 'dotOrbit 8s linear infinite' }} />
      <div className="absolute top-6 left-6 w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_#00ff88]" style={{ animation: 'dotOrbit2 6s linear infinite' }} />
    </div>
  )
}

/* ============================================
   STAT CARD - UPDATED FOR USAGE API
   ============================================ */
const StatCard = ({ label, value, sub, color, barWidth, icon: Icon }) => {
  const cm = {
    cyan:    { text:'text-cyan-400',    border:'border-cyan-500/15', top:'bg-cyan-400',    bar:'bg-cyan-400    shadow-[0_0_6px_#00f0ff]' },
    green:   { text:'text-green-400',   border:'border-green-500/15', top:'bg-green-400',   bar:'bg-green-400   shadow-[0_0_6px_#00ff88]' },
    amber:   { text:'text-amber-400',   border:'border-amber-500/15', top:'bg-amber-400',   bar:'bg-amber-400   shadow-[0_0_6px_#ffaa00]' },
    magenta: { text:'text-fuchsia-500', border:'border-fuchsia-500/15', top:'bg-fuchsia-500', bar:'bg-fuchsia-500 shadow-[0_0_6px_#ff00cc]' },
    purple:  { text:'text-purple-400',  border:'border-purple-500/15', top:'bg-purple-400',  bar:'bg-purple-400  shadow-[0_0_6px_#aa44ff]' },
    red:     { text:'text-red-400',     border:'border-red-500/15', top:'bg-red-400',     bar:'bg-red-400     shadow-[0_0_6px_#ff4444]' },
  }
  const c = cm[color] || cm.cyan
  const [animW, setAnimW] = useState(0)
  useEffect(() => { setTimeout(() => setAnimW(barWidth), 600) }, [barWidth])

  // Color bar based on usage percentage
  const barColor = barWidth > 80 ? 'bg-red-400 shadow-[0_0_6px_#ff4444]' : barWidth > 50 ? 'bg-amber-400 shadow-[0_0_6px_#ffaa00]' : c.bar

  return (
    <div className={`relative overflow-hidden p-4 bg-[#071020] border ${c.border} transition-all duration-300 hover:-translate-y-0.5`}>
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.top}`} />
      <div className="flex items-center justify-between mb-1.5">
        <div className="font-mono-space text-[10px] tracking-[2px] uppercase text-[#a4cceb]">// {label}</div>
        {Icon && <Icon size={14} className={c.text} />}
      </div>
      <div className={`font-orbitron text-[28px] font-extrabold leading-none ${c.text}`}>{value}</div>
      <div className="text-xs text-[#a4cceb] mt-1">{sub}</div>
      <div className="mt-2.5 h-[3px] bg-[#0e1e38] rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-[2s] ease-out ${barColor}`} style={{ width: `${animW}%` }} />
      </div>
    </div>
  )
}

/* ============================================
   PROJECT CARD - with Live Preview
   ============================================ */
const ProjectCard = ({ project, onDelete, onFullPreview, viewMode }) => {
  const statusColor = project.status === 'completed' ? 'bg-green-400 shadow-[0_0_6px_#00ff88] text-green-400' : project.status === 'failed' ? 'bg-red-500 shadow-[0_0_6px_#ff3344] text-red-400' : 'bg-amber-400 shadow-[0_0_6px_#ffaa00] text-amber-400'
  const statusLabel = project.status === 'completed' ? 'ONLINE' : project.status === 'failed' ? 'FAILED' : 'BUILDING'
  const tags = ['REACT', 'NODE.JS', 'LIVE']

  const download = async () => {
    try {
      const r = await api.get(`/agents_v3/project/${project.id}/download/`, { responseType: 'blob' })
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
            <button onClick={() => onFullPreview(project)} className="clip-skew-sm px-4 py-2 font-orbitron text-[9px] font-bold tracking-[1.5px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 shadow-[0_0_16px_rgba(0,240,255,0.3)] cursor-pointer border-none flex items-center gap-1">
              <Maximize2 size={10} /> FULL PREVIEW
            </button>
            <Link to={`/project/${project.id}`} className="clip-skew-sm px-4 py-2 font-orbitron text-[9px] font-bold tracking-[1.5px] uppercase text-cyan-400 bg-cyan-500/10 no-underline cursor-pointer flex items-center gap-1">
              <ChevronRight size={10} /> DETAILS
            </Link>
          </div>
        </div>
      </div>

      {/* Info area */}
      <div className={`p-4 border-t border-[#0e1e38] ${viewMode==='list'?'flex-1 border-t-0 border-l':''}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="font-orbitron text-[13px] font-semibold tracking-[1px] text-white mb-0.5 truncate max-w-[180px]">{project.name || 'Untitled Project'}</h3>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor.split(' ')[0]} ${statusColor.split(' ')[1]}`} />
              <span className={`font-mono-space text-[9px] tracking-[1px] ${statusColor.split(' ')[2]}`}>{statusLabel}</span>
            </div>
          </div>
          <button onClick={() => onDelete(project.id)} className="w-7 h-7 flex items-center justify-center border border-[#0e1e38] text-[#6a8ba8] hover:border-red-500/50 hover:text-red-400 transition-all" title="Delete">
            <Trash2 size={12} />
          </button>
        </div>

        <p className="text-[11px] text-[#a4cceb] mb-3 line-clamp-2 leading-relaxed font-rajdhani">{project.prompt?.slice(0,80)}{project.prompt?.length > 80 ? '...' : ''}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map(tag => (
            <span key={tag} className="font-mono-space text-[8px] tracking-[1px] px-2 py-0.5 bg-cyan-500/[0.08] text-cyan-400/80">{tag}</span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#0e1e38]">
          <span className="font-mono-space text-[9px] text-[#6a8ba8]">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</span>
          <button onClick={download} disabled={project.status !== 'completed'}
            className={`font-mono-space text-[9px] tracking-[1px] px-3 py-1.5 border transition-all flex items-center gap-1 ${project.status === 'completed' ? 'border-green-500/25 text-green-400 bg-green-500/[0.08] hover:bg-green-500/20 cursor-pointer' : 'border-[#0e1e38] text-[#6a8ba8] cursor-not-allowed opacity-50'}`}>
            <Download size={10} /> DOWNLOAD
          </button>
        </div>
      </div>
    </div>
  )
}

/* ============================================
   MAIN DASHBOARD COMPONENT
   ============================================ */
export default function Dashboard() {
  const navigate = useNavigate()
  const { user, logout, token } = useAuthStore()
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState(null)
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('grid')
  const [modalProject, setModalProject] = useState(null)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)

  // Boot sequence
  const [booted, setBooted] = useState(false)
  const [bootLines, setBootLines] = useState([])
  const [bootProgress, setBootProgress] = useState(0)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsRes, statsRes, usageRes] = await Promise.all([
          projectsAPI.list(),
          dashboardAPI.stats(),
          api.get('/agents_v3/usage/')
        ])
        setProjects(projectsRes.data.projects || [])
        setStats(statsRes.data)
        
        if (usageRes.data.success) {
          setUsage(usageRes.data.usage)
        }
      } catch (e) {
        console.error('Dashboard fetch error:', e)
        if (e.response?.status === 401) {
          logout()
          navigate('/login')
        }
      } finally {
        setLoading(false)
      }
    }
    if (token) fetchData()
    else { logout(); navigate('/login') }
  }, [token, logout, navigate])

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project?')) return
    try {
      await projectsAPI.delete(id)
      setProjects(prev => prev.filter(p => p.id !== id))
      toast.success('Project deleted')
    } catch (e) {
      toast.error('Delete failed')
    }
  }

  // Handle logout
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Close menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Boot sequence animation
  const bootSequence = [
    ['Initializing neural cores', 'ok'],
    ['Loading project matrix', 'ok'],
    ['Syncing user telemetry', 'ok'],
    ['Calibrating AI agents', 'ok'],
    ['Boot complete', 'ok']
  ]

  const runLine = useCallback(() => {
    const idx = bootLines.length
    if (idx < bootSequence.length) {
      setBootLines(prev => [...prev, bootSequence[idx]])
      setBootProgress(((idx + 1) / bootSequence.length) * 100)
      if (idx === bootSequence.length - 1) {
        setTimeout(() => setBooted(true), 800)
      }
    }
  }, [bootLines.length])

  useEffect(() => {
    if (loading) return
    setTimeout(runLine, 300)
  }, [loading, runLine])

  if (loading) return <FullPageLoading text="Loading dashboard..." />

  // Use usage API data if available, fallback to stats
  const projectLimit = usage?.projects_limit || stats?.project_limit || 5
  const projectsUsed = usage?.projects_used || stats?.projects_generated || 0
  const buildsUsed = usage?.builds_used || 0
  const buildsLimit = usage?.builds_limit || 3
  const fixesUsed = usage?.fixes_used || 0
  const fixesLimit = usage?.fixes_limit || 10
  const corePercent = usage?.builds_percent || (buildsLimit > 0 ? Math.round((buildsUsed/buildsLimit)*100) : 0)

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

      {/* === BOOT OVERLAY === */}
      {!booted && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-black transition-opacity duration-[800ms]" style={{ opacity: booted?0:1, pointerEvents: booted?'none':'all' }}>
          <div className="font-orbitron text-[42px] font-black tracking-[8px] text-cyan-400 drop-shadow-[0_0_40px_rgba(0,240,255,0.25)] flex items-center gap-3" style={{ animation:'bootFadeIn .6s .3s forwards', opacity:0 }}>
            <Zap size={36} /> ZIP LOGIC AI
          </div>
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

      {/* === NAV === */}
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
          <Link to="/new-project" className={`clip-skew font-orbitron text-[10px] font-bold tracking-[2px] uppercase px-5 py-2 no-underline transition-all flex items-center gap-1 ${
            usage && !usage.can_create_project 
              ? 'text-[#6a8ba8] bg-[#0e1e38] cursor-not-allowed' 
              : 'text-[#020810] bg-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:bg-white hover:shadow-[0_0_40px_rgba(0,240,255,0.25)]'
          }`}
            onClick={(e) => usage && !usage.can_create_project && e.preventDefault()}
          >
            <Zap size={12} /> NEW PROJECT
          </Link>
          
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
                  <LogOut size={12} /> LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* === FULLSCREEN PREVIEW MODAL === */}
      <PreviewModal project={modalProject} isOpen={!!modalProject} onClose={() => setModalProject(null)} />

      {/* === MAIN CONTENT === */}
      <main className="relative z-[2] pt-[76px] pb-16 px-4 sm:px-8 max-w-[1440px] mx-auto transition-opacity duration-[800ms]" style={{ opacity: booted?1:0 }}>

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-7 pb-5 relative border-b border-[#0e1e38]">
          <div className="absolute bottom-[-1px] left-0 h-px bg-gradient-to-r from-cyan-400 to-transparent" style={{ animation:'headerLine 4s ease-in-out infinite' }} />
          <div>
            <h1 className="font-orbitron text-2xl sm:text-[30px] font-extrabold tracking-[5px] uppercase gradient-text-v2">COMMAND CENTER</h1>
            <p className="font-mono-space text-[11px] text-[#a4cceb] tracking-[1px] mt-1.5 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse shadow-[0_0_8px_#00ff88]" />
              SYSTEMS NOMINAL - WELCOME BACK, {user?.username?.toUpperCase() || 'COMMANDER'}
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4 sm:mt-0">
            {/* Plan Badge */}
            {usage && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/25">
                <Crown size={14} className="text-amber-400" />
                <span className="font-mono-space text-[10px] text-amber-400 tracking-[1px] uppercase">{usage.plan_name}</span>
                {usage.days_until_reset && (
                  <span className="font-mono-space text-[9px] text-amber-400/60">â€¢ {usage.days_until_reset}d reset</span>
                )}
              </div>
            )}
            <AlienMascot size={60} mood="happy" />
          </div>
        </div>

        {/* === LIMIT WARNING === */}
        {usage && !usage.can_create_project && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-400" />
              <div>
                <p className="font-orbitron text-[11px] font-semibold text-red-400 tracking-[1px]">PROJECT LIMIT REACHED</p>
                <p className="font-mono-space text-[10px] text-red-400/70">Upgrade your plan to create more projects this month</p>
              </div>
            </div>
            <Link to="/pricing" className="clip-skew-sm px-4 py-2 bg-red-500 text-white font-orbitron text-[9px] font-bold tracking-[1.5px] no-underline">
              UPGRADE NOW
            </Link>
          </div>
        )}

        {/* === TELEMETRY ROW - UPDATED WITH USAGE API === */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px_1fr] gap-4 mb-8 items-stretch">
          <div className="flex flex-col gap-3">
            <StatCard 
              label="Projects" 
              value={<>{projectsUsed}<span className="text-base opacity-40">/{projectLimit === 99999 ? 'âˆž' : projectLimit}</span></>} 
              sub={`${usage?.projects_remaining || 0} remaining this month`}
              color="cyan" 
              barWidth={usage?.projects_percent || 0} 
              icon={Folder}
            />
            <StatCard 
              label="AI Builds" 
              value={<>{buildsUsed}<span className="text-base opacity-40">/{buildsLimit === 99999 ? 'âˆž' : buildsLimit}</span></>} 
              sub={`${usage?.builds_remaining || 0} remaining this month`}
              color="purple" 
              barWidth={usage?.builds_percent || 0} 
              icon={Zap}
            />
          </div>
          <div className="flex items-center justify-center py-5 lg:py-0">
            <PowerCore percentage={corePercent} label="AI USAGE" />
          </div>
          <div className="flex flex-col gap-3">
            <StatCard 
              label="AI Fixes" 
              value={<>{fixesUsed}<span className="text-base opacity-40">/{fixesLimit === 99999 ? 'âˆž' : fixesLimit}</span></>} 
              sub={`${usage?.fixes_remaining || 0} remaining this month`}
              color="green" 
              barWidth={usage?.fixes_percent || 0} 
              icon={Wrench}
            />
            <StatCard 
              label="Clearance Level" 
              value={usage?.plan_name?.toUpperCase() || stats?.subscription_plan?.toUpperCase() || 'FREE'} 
              sub={usage?.plan === 'free' ? 'Standard access tier' : `$${usage?.plan_price || 0}/month`}
              color="magenta" 
              barWidth={usage?.plan === 'free' ? 20 : usage?.plan === 'pro' ? 70 : 100} 
              icon={Crown}
            />
          </div>
        </div>

        {/* === ALL-TIME STATS === */}
        {usage && (
          <div className="mb-6 p-4 bg-[#071020] border border-[#0e1e38]">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-cyan-400" />
              <span className="font-mono-space text-[10px] tracking-[2px] text-[#a4cceb] uppercase">// All-Time Statistics</span>
            </div>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2">
                <Folder size={16} className="text-cyan-400" />
                <span className="font-orbitron text-lg font-bold text-white">{usage.total_projects}</span>
                <span className="font-mono-space text-[10px] text-[#a4cceb]">projects</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-purple-400" />
                <span className="font-orbitron text-lg font-bold text-white">{usage.total_builds}</span>
                <span className="font-mono-space text-[10px] text-[#a4cceb]">builds</span>
              </div>
              <div className="flex items-center gap-2">
                <Wrench size={16} className="text-green-400" />
                <span className="font-orbitron text-lg font-bold text-white">{usage.total_fixes}</span>
                <span className="font-mono-space text-[10px] text-[#a4cceb]">fixes</span>
              </div>
            </div>
          </div>
        )}

        {/* === PROJECTS SECTION HEADER === */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-[30px] h-[30px] flex items-center justify-center clip-hex bg-cyan-500/[0.08]">
            <Folder size={13} className="text-cyan-400" />
          </div>
          <span className="font-orbitron text-[13px] font-semibold tracking-[3px] uppercase">Active Projects</span>
          <span className="font-mono-space text-[10px] text-cyan-400 bg-cyan-500/[0.08] px-2.5 py-0.5 rounded-sm">{projects.length} DEPLOYED</span>
          <div className="flex-1 h-px bg-gradient-to-r from-[#0e1e38] to-transparent" />
        </div>

        {/* View Toggle */}
        <div className="flex gap-1 mb-4">
          <button onClick={() => setViewMode('grid')} className={`font-mono-space text-[10px] tracking-[1px] px-4 py-1.5 border transition-all flex items-center gap-1 ${viewMode==='grid'?'border-cyan-500/25 text-cyan-400 bg-cyan-500/[0.08]':'border-[#0e1e38] text-[#a4cceb] bg-transparent hover:border-cyan-500/25 hover:text-cyan-400'}`}>
            <Grid size={10} /> GRID
          </button>
          <button onClick={() => setViewMode('list')} className={`font-mono-space text-[10px] tracking-[1px] px-4 py-1.5 border transition-all flex items-center gap-1 ${viewMode==='list'?'border-cyan-500/25 text-cyan-400 bg-cyan-500/[0.08]':'border-[#0e1e38] text-[#a4cceb] bg-transparent hover:border-cyan-500/25 hover:text-cyan-400'}`}>
            <List size={10} /> LIST
          </button>
        </div>

        {/* === PROJECTS GRID === */}
        {projects.length === 0 ? (
          <div className="bg-[#071020] border border-[#0e1e38] p-12 text-center">
            <Folder size={48} className="mx-auto mb-4 text-cyan-400/30" />
            <h3 className="font-orbitron text-xl font-medium mb-2">No projects yet</h3>
            <p className="text-[#a4cceb] mb-6 font-rajdhani">Create your first project to get started</p>
            <Link to="/new-project" className="clip-skew-lg inline-flex items-center gap-2 font-orbitron text-[11px] font-bold tracking-[2px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 px-8 py-3 no-underline shadow-[0_0_24px_rgba(0,240,255,0.25)]">
              <Zap size={14} /> Create Project
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

        {/* === UPGRADE CTA === */}
        {(usage?.plan === 'free' || stats?.subscription_plan === 'free') && (
          <div className="relative bg-[#071020] border border-cyan-500/25 p-7 flex flex-col md:flex-row items-center justify-between gap-4 overflow-hidden mb-10">
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage:'linear-gradient(rgba(0,240,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,1) 1px,transparent 1px)', backgroundSize:'40px 40px', animation:'scanDrift 20s linear infinite' }} />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.08] via-transparent to-fuchsia-500/[0.08] opacity-40" />
            {/* Floating orb */}
            <div className="absolute right-16 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[radial-gradient(circle,rgba(0,240,255,0.25),transparent_70%)] pointer-events-none" style={{ animation:'nebPulse 6s ease-in-out infinite' }} />

            <div className="relative z-10">
              <div className="font-orbitron text-[15px] font-bold tracking-[2px] uppercase gradient-text-v2 mb-1.5">Unlock Full Clearance</div>
              <div className="font-mono-space text-[11px] text-[#a4cceb] tracking-[0.5px]">// UPGRADE TO PRO - 50 PROJECT SLOTS PER CYCLE</div>
            </div>
            <Link to="/pricing" className="clip-skew-lg relative z-10 font-orbitron text-[10px] font-bold tracking-[2px] uppercase text-[#020810] bg-gradient-to-br from-cyan-400 to-green-400 px-8 py-3 no-underline shadow-[0_0_20px_rgba(0,240,255,0.25)] hover:shadow-[0_0_48px_rgba(0,240,255,0.25)] hover:-translate-y-0.5 transition-all">
              VIEW PLANS
            </Link>
          </div>
        )}
      </main>

      {/* === SYSTEM BAR === */}
      <SystemBar />
    </div>
  )
}