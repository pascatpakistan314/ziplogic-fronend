import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { paymentsAPI } from '../services/api'
import { Check, Zap, Rocket, Building, Crown } from 'lucide-react'
import { ButtonLoading } from '../components/Loading'
import toast from 'react-hot-toast'

// ==================== DATA ====================
const PLANS = [
  {
    name: 'Free', price: { m: 0, y: 0 }, plan: 'free', tier: 'free',
    desc: 'Get a taste of autonomous AI development. One project to explore.', projects: 1, barW: '4%',
    features: ['1 active project', '5 AI builds per month', 'Community support', 'Standard build queue', 'yourname.ziplogicai.com'],
    icon: Zap, color: 'text-slate-400', bg: 'bg-slate-400', border: 'border-slate-600',
    btnClass: 'bg-slate-800 text-slate-300 border border-slate-600 hover:bg-slate-700',
  },
  {
    name: 'Builder', price: { m: 49, y: 39 }, plan: 'builder', tier: 'builder',
    desc: 'For indie hackers and solo devs shipping real products.', projects: 3, barW: '12%',
    features: ['3 active projects', '50 AI builds per month', 'Auto deployment', 'Branded subdomain', 'Email support'],
    icon: Rocket, color: 'text-cyan-400', bg: 'bg-cyan-400', border: 'border-cyan-800',
    btnClass: 'bg-cyan-900/50 text-cyan-400 border border-cyan-700 hover:bg-cyan-800/50',
  },
  {
    name: 'Pro', price: { m: 129, y: 103 }, plan: 'pro', tier: 'pro',
    desc: 'For teams building at scale with priority infrastructure.', projects: 10, barW: '40%',
    features: ['10 active projects', '200 AI builds per month', 'Priority build queue', '3 team seats', 'Branded subdomains', 'API access', 'Priority support'],
    icon: Building, color: 'text-emerald-400', bg: 'bg-emerald-400', border: 'border-emerald-800',
    btnClass: 'bg-emerald-400 text-emerald-950 font-black hover:bg-emerald-300',
  },
  {
    name: 'Agency', price: { m: 299, y: 239 }, plan: 'agency', tier: 'agency', popular: true,
    desc: 'Maximum clearance. For agencies managing client portfolios.', projects: 25, barW: '100%',
    features: ['25 active projects', '500 AI builds per month', '10 team seats', 'Branded subdomains', 'White-label add-on available', 'API access', '24/7 dedicated support', 'Priority everything'],
    icon: Crown, color: 'text-fuchsia-400', bg: 'bg-fuchsia-400', border: 'border-fuchsia-800',
    btnClass: 'bg-gradient-to-r from-fuchsia-500 to-cyan-500 text-gray-950 font-black hover:from-fuchsia-400 hover:to-cyan-400',
  },
]

const COMPARE = [
  { name: 'Active Projects', f: '1', b: '3', p: '10', a: '25' },
  { name: 'AI Builds / Month', f: '5', b: '50', p: '200', a: '500' },
  { name: 'Multi-Agent Orchestration', f: false, b: true, p: true, a: true },
  { name: 'Auto Deployment', f: false, b: true, p: true, a: true },
  { name: 'Custom Domains', f: false, b: false, p: false, a: 'Add-on' },
  { name: 'Branded Subdomains', f: true, b: true, p: true, a: true },
  { name: 'Priority Build Queue', f: false, b: false, p: true, a: true },
  { name: 'Team Collaboration', f: false, b: false, p: '3 seats', a: '10 seats' },
  { name: 'White-Label Branding', f: false, b: false, p: false, a: 'Add-on' },
  { name: 'Dedicated Support', f: 'Community', b: 'Email', p: 'Priority', a: '24/7 Direct' },
  { name: 'API Access', f: false, b: false, p: true, a: true },
]

const FAQS = [
  { q: 'Can I switch plans anytime?', a: 'Yes — upgrade or downgrade at any time. Prorated billing on upgrades.' },
  { q: 'What happens if I downgrade?', a: 'Projects remain intact but read-only beyond your new limit.' },
  { q: 'Do you offer refunds?', a: '14-day money-back guarantee on all paid plans.' },
  { q: 'Is there an enterprise plan?', a: 'Contact us for custom integrations and higher limits.' },
  { q: 'What payment methods?', a: 'All major credit cards via Stripe, PayPal, and wire transfer for annual Agency.' },
  { q: 'How does AI generation work?', a: 'Multi-agent pipeline: Architect → Developer → Tester → Reviewer.' },
]

// ==================== BOOT OVERLAY ====================
function BootOverlay({ onDone }) {
  const [lines, setLines] = useState([])
  const [progress, setProgress] = useState(0)
  const [hide, setHide] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const data = [
      ['INIT PRICING ENGINE...', 'ok'], ['LOADING STRIPE GATEWAY...', 'ok'],
      ['CONNECTING AGENT PIPELINE...', 'ok'], ['ALL SYSTEMS GO', 'ok'],
    ]
    let i = 0
    const iv = setInterval(() => {
      if (i < data.length) {
        const current = data[i]
        setLines(p => [...p, current])
        setProgress(((i + 1) / data.length) * 100)
        i++
      } else {
        clearInterval(iv)
        if (!doneRef.current) {
          doneRef.current = true
          setTimeout(() => {
            setHide(true)
            setTimeout(() => { onDone() }, 800)
          }, 300)
        }
      }
    }, 200)
    return () => clearInterval(iv)
  }, [])

  return (
    <div className={`fixed inset-0 bg-black z-[10000] flex flex-col items-center justify-center transition-opacity duration-700 ${hide ? 'opacity-0 pointer-events-none' : ''}`}>
      <div className="text-3xl md:text-4xl font-black tracking-[8px] text-cyan-400" style={{ textShadow: '0 0 40px rgba(0,240,255,0.25)' }}>
        ZIP LOGIC AI
      </div>
      <div className="mt-8 font-mono text-xs text-cyan-200/70 text-left w-[400px] max-w-[90vw]">
        {lines.map(([t, s], i) => (
          <div key={i} className="mb-1">{'> '}{t} <span className={s === 'ok' ? 'text-emerald-400' : 'text-amber-400'}>[{s.toUpperCase()}]</span></div>
        ))}
      </div>
      <div className="mt-6 w-[300px] h-0.5 bg-slate-800 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 transition-all duration-150" style={{ width: `${progress}%`, boxShadow: '0 0 10px #00f0ff' }} />
      </div>
    </div>
  )
}

// ==================== HEX GRID BG ====================
function HexGrid() {
  const ref = useRef(null)
  const mouse = useRef({ x: -999, y: -999 })

  useEffect(() => {
    const c = ref.current, ctx = c.getContext('2d')
    let raf
    const rs = () => { c.width = innerWidth; c.height = innerHeight }
    rs(); window.addEventListener('resize', rs)
    const mv = (e) => { mouse.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', mv)
    const sz = 30, hx = sz * 1.732, hy = sz * 1.5
    const draw = () => {
      ctx.clearRect(0, 0, c.width, c.height)
      for (let r = -1; r < c.height / hy + 2; r++)
        for (let cl = -1; cl < c.width / hx + 2; cl++) {
          const px = cl * hx + (r % 2 ? hx / 2 : 0), py = r * hy
          const g = Math.max(0, 1 - Math.hypot(mouse.current.x - px, mouse.current.y - py) / 200)
          ctx.beginPath()
          for (let i = 0; i < 6; i++) { const a = Math.PI / 3 * i - Math.PI / 6; i ? ctx.lineTo(px + sz * Math.cos(a), py + sz * Math.sin(a)) : ctx.moveTo(px + sz * Math.cos(a), py + sz * Math.sin(a)) }
          ctx.closePath(); ctx.strokeStyle = `rgba(0,240,255,${0.03 + g * 0.12})`; ctx.lineWidth = 0.5; ctx.stroke()
        }
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', rs); window.removeEventListener('mousemove', mv) }
  }, [])

  return <canvas ref={ref} className="fixed inset-0 z-0 pointer-events-none" />
}

// ==================== SPACE GAME ====================
function SpaceGame({ setKills }) {
  const ref = useRef(null)
  const s = useRef({ mx: 0, my: 0, sx: 0, sy: 0, sa: 0, thr: 0, trail: [], bullets: [], ufos: [], booms: [], debris: [], nums: [], mDown: false, lastFire: 0, ufoT: 0, shake: 0, shX: 0, shY: 0, kills: 0 })

  useEffect(() => {
    const cv = ref.current, X = cv.getContext('2d')
    let W, H, raf
    const st = s.current
    const rs = () => { W = cv.width = innerWidth; H = cv.height = innerHeight; st.sx = W / 2; st.sy = H / 2; st.mx = W / 2; st.my = H / 2 }
    rs(); window.addEventListener('resize', rs)
    const onM = e => { st.mx = e.clientX; st.my = e.clientY }
    const onD = e => { if (!e.button) st.mDown = true }
    const onU = e => { if (!e.button) st.mDown = false }
    const onC = e => e.preventDefault()
    window.addEventListener('mousemove', onM); window.addEventListener('mousedown', onD); window.addEventListener('mouseup', onU); window.addEventListener('contextmenu', onC)

    const fire = () => {
      const now = performance.now(); if (now - st.lastFire < 100) return; st.lastFire = now
      const c = Math.cos(st.sa), sn = Math.sin(st.sa)
      st.bullets.push({ x: st.sx + c * 24 - sn * 4, y: st.sy + sn * 24 + c * 4, vx: c * 18, vy: sn * 18, life: 50 })
      st.bullets.push({ x: st.sx + c * 24 + sn * 4, y: st.sy + sn * 24 - c * 4, vx: c * 18, vy: sn * 18, life: 50 })
      st.shake = Math.max(st.shake, 1.5)
    }
    const spawnUFO = () => {
      const side = Math.random() * 4 | 0, sp = 0.6 + Math.random() * 0.7
      let ux, uy, vx, vy
      if (side === 0) { ux = -50; uy = Math.random() * H; vx = sp; vy = (Math.random() - 0.5) * 0.4 }
      else if (side === 1) { ux = W + 50; uy = Math.random() * H; vx = -sp; vy = (Math.random() - 0.5) * 0.4 }
      else if (side === 2) { ux = Math.random() * W; uy = -50; vx = (Math.random() - 0.5) * 0.4; vy = sp }
      else { ux = Math.random() * W; uy = H + 50; vx = (Math.random() - 0.5) * 0.4; vy = -sp }
      st.ufos.push({ x: ux, y: uy, vx, vy, sz: 16 + Math.random() * 8, hp: 3, ph: Math.random() * 6.28, fl: 0, t: 0 })
    }
    const explode = (ex, ey, sz) => {
      for (let i = 0; i < 12; i++) { const a = Math.random() * 6.28, sp = 2 + Math.random() * 6; st.booms.push({ x: ex, y: ey, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 1, dec: 0.02 + Math.random() * 0.02, sz: 2 + Math.random() * 4, c: ['#ff3344', '#ff6600', '#ffaa00', '#00f0ff', '#ff00cc'][Math.random() * 5 | 0] }) }
      st.booms.push({ x: ex, y: ey, vx: 0, vy: 0, life: 1, dec: 0.03, sz: 0, c: 'ring', rad: 0 })
      st.shake = Math.max(st.shake, 5 + sz * 0.3)
    }

    const drawShip = c => {
      c.save(); c.translate(st.sx + st.shX, st.sy + st.shY); c.rotate(st.sa)
      const eg = c.createRadialGradient(-18, 0, 2, -18, 0, 12 + st.thr * 6); eg.addColorStop(0, 'rgba(0,240,255,.9)'); eg.addColorStop(0.4, 'rgba(0,255,136,.4)'); eg.addColorStop(1, 'transparent')
      c.fillStyle = eg; c.beginPath(); c.ellipse(-16, 0, 6 + st.thr * 8, 3 + st.thr * 2, 0, 0, 6.28); c.fill()
      c.beginPath(); c.moveTo(22, 0); c.lineTo(8, -7); c.lineTo(-14, -5); c.lineTo(-18, 0); c.lineTo(-14, 5); c.lineTo(8, 7); c.closePath()
      const bg = c.createLinearGradient(-18, 0, 22, 0); bg.addColorStop(0, '#0a2040'); bg.addColorStop(0.5, '#0e3060'); bg.addColorStop(1, '#1a4a80')
      c.fillStyle = bg; c.fill(); c.strokeStyle = 'rgba(0,240,255,.5)'; c.lineWidth = 1; c.stroke()
      c.beginPath(); c.ellipse(10, 0, 5, 3, 0, 0, 6.28); const cg = c.createRadialGradient(10, 0, 1, 10, 0, 5); cg.addColorStop(0, 'rgba(0,240,255,.8)'); cg.addColorStop(1, 'rgba(0,240,255,.15)'); c.fillStyle = cg; c.fill()
      c.beginPath(); c.moveTo(4, -7); c.lineTo(-6, -14); c.lineTo(-12, -11); c.lineTo(-8, -6); c.closePath(); c.fillStyle = '#0c2850'; c.fill()
      c.beginPath(); c.moveTo(4, 7); c.lineTo(-6, 14); c.lineTo(-12, 11); c.lineTo(-8, 6); c.closePath(); c.fill()
      c.beginPath(); c.arc(22, 0, 2, 0, 6.28); c.fillStyle = '#00f0ff'; c.shadowColor = '#00f0ff'; c.shadowBlur = 8; c.fill(); c.shadowBlur = 0
      c.restore()
    }
    const drawUFO = (c, u) => {
      const bob = Math.sin(u.t * 0.03 + u.ph) * 8, ry = u.y + bob
      c.beginPath(); c.ellipse(u.x, ry, u.sz * 1.2, u.sz * 0.35, 0, 0, 6.28)
      const sg = c.createLinearGradient(u.x, ry - u.sz * 0.35, u.x, ry + u.sz * 0.35); sg.addColorStop(0, '#2a1a4a'); sg.addColorStop(1, '#1a1040')
      c.fillStyle = sg; c.fill(); c.strokeStyle = u.fl > 0 ? 'rgba(255,255,255,.8)' : 'rgba(255,0,204,.4)'; c.lineWidth = u.fl > 0 ? 2 : 1; c.stroke()
      c.beginPath(); c.ellipse(u.x, ry - u.sz * 0.2, u.sz * 0.5, u.sz * 0.4, 0, Math.PI, 0)
      const dg = c.createRadialGradient(u.x, ry - u.sz * 0.3, 2, u.x, ry - u.sz * 0.2, u.sz * 0.5); dg.addColorStop(0, 'rgba(0,240,255,.6)'); dg.addColorStop(1, 'rgba(0,240,255,.1)'); c.fillStyle = dg; c.fill()
      const bw = u.sz * 1.5, bx = u.x - bw / 2, by = ry - u.sz * 0.7
      c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(bx, by, bw, 3); c.fillStyle = u.hp > 1 ? '#00ff88' : '#ff3344'; c.fillRect(bx, by, bw * (u.hp / 3), 3)
    }

    const frame = () => {
      X.clearRect(0, 0, W, H)
      const dx = st.mx - st.sx, dy = st.my - st.sy, dist = Math.hypot(dx, dy)
      let da = Math.atan2(dy, dx) - st.sa; while (da > Math.PI) da -= 6.28; while (da < -Math.PI) da += 6.28
      st.sa += da * 0.08; st.thr += (Math.min(dist / 100, 1) - st.thr) * 0.1
      const speed = Math.min(dist * 0.06, 18); st.sx += Math.cos(st.sa) * speed; st.sy += Math.sin(st.sa) * speed
      st.trail.push({ x: st.sx - Math.cos(st.sa) * 18, y: st.sy - Math.sin(st.sa) * 18, a: 1 }); if (st.trail.length > 40) st.trail.shift()
      if (st.mDown) fire()
      st.ufoT++; if (st.ufoT > 150) { st.ufoT = 0; spawnUFO(); if (st.kills > 5) spawnUFO() }
      if (st.shake > 0.1) { st.shX = (Math.random() - 0.5) * st.shake; st.shY = (Math.random() - 0.5) * st.shake; st.shake *= 0.85 } else { st.shX = st.shY = 0 }

      st.trail.forEach(p => { p.a *= 0.93; if (p.a > 0.01) { X.beginPath(); X.arc(p.x, p.y, 2 * p.a, 0, 6.28); X.fillStyle = `rgba(0,240,255,${p.a * 0.3})`; X.fill() } })

      for (let i = st.bullets.length - 1; i >= 0; i--) {
        const b = st.bullets[i]; b.x += b.vx; b.y += b.vy; b.life--
        if (b.life <= 0 || b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) { st.bullets.splice(i, 1); continue }
        X.beginPath(); X.moveTo(b.x, b.y); X.lineTo(b.x - b.vx / 18 * 8, b.y - b.vy / 18 * 8); X.strokeStyle = `rgba(0,240,255,${b.life / 50})`; X.lineWidth = 2; X.stroke()
        X.beginPath(); X.arc(b.x, b.y, 2, 0, 6.28); X.fillStyle = `rgba(0,240,255,${b.life / 50})`; X.shadowColor = '#00f0ff'; X.shadowBlur = 6; X.fill(); X.shadowBlur = 0
        for (let j = st.ufos.length - 1; j >= 0; j--) {
          const u = st.ufos[j], uy = u.y + Math.sin(u.t * 0.03 + u.ph) * 8
          if (Math.hypot(b.x - u.x, b.y - uy) < u.sz * 1.2) {
            u.hp--; u.fl = 6; st.bullets.splice(i, 1)
            st.nums.push({ x: u.x, y: uy - u.sz, t: u.hp <= 0 ? 'BOOM!' : 'HIT!', life: 40, vy: -2, c: u.hp <= 0 ? '#ff3344' : '#ffaa00' })
            if (u.hp <= 0) { explode(u.x, uy, u.sz); st.kills++; setKills(st.kills); st.ufos.splice(j, 1) }
            break
          }
        }
      }

      for (let i = st.ufos.length - 1; i >= 0; i--) { const u = st.ufos[i]; u.x += u.vx; u.y += u.vy; u.t++; if (u.fl > 0) u.fl--; if (u.x < -100 || u.x > W + 100 || u.y < -100 || u.y > H + 100) { st.ufos.splice(i, 1); continue }; drawUFO(X, u) }
      for (let i = st.booms.length - 1; i >= 0; i--) { const b = st.booms[i]; b.life -= b.dec; b.x += b.vx; b.y += b.vy; b.vx *= 0.96; b.vy *= 0.96; if (b.life <= 0) { st.booms.splice(i, 1); continue }; if (b.c === 'ring') { b.rad = (b.rad || 0) + 6; X.beginPath(); X.arc(b.x, b.y, b.rad, 0, 6.28); X.strokeStyle = `rgba(0,240,255,${b.life * 0.5})`; X.lineWidth = 2; X.stroke() } else { X.beginPath(); X.arc(b.x, b.y, b.sz * b.life, 0, 6.28); X.fillStyle = b.c; X.globalAlpha = b.life; X.fill(); X.globalAlpha = 1 } }
      for (let i = st.nums.length - 1; i >= 0; i--) { const d = st.nums[i]; d.life--; d.y += d.vy; if (d.life <= 0) { st.nums.splice(i, 1); continue }; X.font = '900 14px "Arial Black",sans-serif'; X.textAlign = 'center'; X.fillStyle = d.c; X.globalAlpha = Math.min(1, d.life / 20); X.fillText(d.t, d.x, d.y); X.globalAlpha = 1 }

      drawShip(X)
      // Crosshair
      X.beginPath(); X.arc(st.mx, st.my, 12, 0, 6.28); X.strokeStyle = 'rgba(0,240,255,.3)'; X.lineWidth = 1; X.stroke()
      X.beginPath(); X.moveTo(st.mx - 16, st.my); X.lineTo(st.mx - 8, st.my); X.moveTo(st.mx + 8, st.my); X.lineTo(st.mx + 16, st.my); X.moveTo(st.mx, st.my - 16); X.lineTo(st.mx, st.my - 8); X.moveTo(st.mx, st.my + 8); X.lineTo(st.mx, st.my + 16)
      X.strokeStyle = 'rgba(0,240,255,.5)'; X.lineWidth = 1; X.stroke()
      X.beginPath(); X.arc(st.mx, st.my, 2, 0, 6.28); X.fillStyle = 'rgba(255,51,68,.8)'; X.fill()
      raf = requestAnimationFrame(frame)
    }
    frame(); setTimeout(() => { spawnUFO(); spawnUFO() }, 3000)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', rs); window.removeEventListener('mousemove', onM); window.removeEventListener('mousedown', onD); window.removeEventListener('mouseup', onU); window.removeEventListener('contextmenu', onC) }
  }, [setKills])

  return <canvas ref={ref} className="fixed inset-0 z-[2] pointer-events-none" />
}

// ==================== TOP BAR GRADIENT ====================
const topBarGradient = (tier) => {
  if (tier === 'free') return 'bg-gradient-to-r from-slate-400 to-transparent'
  if (tier === 'builder') return 'bg-gradient-to-r from-cyan-400 to-transparent'
  if (tier === 'pro') return 'bg-gradient-to-r from-emerald-400 via-cyan-400 to-transparent'
  return 'bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400'
}

// ==================== AGENCY NAME GRADIENT ====================
const nameStyle = (tier) => {
  if (tier === 'agency') return { background: 'linear-gradient(135deg, #d946ef, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  return {}
}

const amountStyle = (tier) => {
  if (tier === 'agency') return { background: 'linear-gradient(135deg, #d946ef, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  return {}
}

const projCountStyle = (tier) => {
  if (tier === 'agency') return { background: 'linear-gradient(135deg, #d946ef, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }
  return {}
}

const projBarFillClass = (tier) => {
  if (tier === 'free') return 'bg-slate-400'
  if (tier === 'builder') return 'bg-cyan-400'
  if (tier === 'pro') return 'bg-emerald-400'
  return ''
}

const projBarFillStyle = (tier, barW) => {
  const base = { width: barW, transition: 'width 1.5s' }
  if (tier === 'agency') return { ...base, background: 'linear-gradient(90deg, #d946ef, #22d3ee)' }
  return base
}

// ==================== MAIN COMPONENT ====================
export default function Pricing() {
  const { isAuthenticated, user } = useAuthStore()
  const [loading, setLoading] = useState(null)
  const [yearly, setYearly] = useState(false)
  const [booted, setBooted] = useState(false)
  const [openFaq, setOpenFaq] = useState(null)
  const [kills, setKills] = useState(0)
  const navigate = useNavigate()

  const handleBoot = useCallback(() => setBooted(true), [])

  // Safety fallback - auto skip boot after 3s if stuck
  useEffect(() => {
    const fallback = setTimeout(() => {
      if (!booted) setBooted(true)
    }, 3000)
    return () => clearTimeout(fallback)
  }, [booted])

  // Animate cards on boot
  useEffect(() => {
    if (!booted) return
    const t = setTimeout(() => {
      document.querySelectorAll('[data-plan-card]').forEach((el, i) => {
        setTimeout(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)' }, i * 150)
      })
    }, 300)
    return () => clearTimeout(t)
  }, [booted])

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) { navigate('/register'); return }
    if (plan === 'free') { toast.success('You are already on the Free plan!'); return }
    if (user?.subscription_plan === plan) { toast.success(`You are already on the ${plan} plan!`); return }
    setLoading(plan)
    try {
      const res = await paymentsAPI.createCheckout({ plan })
      if (res.data.checkout_url) window.location.href = res.data.checkout_url
      else toast.error('Failed to create checkout')
    } catch { toast.error('Failed to start checkout') }
    finally { setLoading(null) }
  }

  const cell = (v) => v === true ? <span className="text-emerald-400">✓</span> : v === false ? <span className="text-slate-600">—</span> : v

  return (
    <div className="bg-[#020810] text-gray-200 min-h-screen relative">
      {!booted && <BootOverlay onDone={handleBoot} />}
      <HexGrid />
      <SpaceGame setKills={setKills} />

      {/* HUD Corners */}
      <div className="fixed top-3 left-1 w-12 h-12 border-t border-l border-cyan-500/25 z-50 pointer-events-none" />
      <div className="fixed top-3 right-1 w-12 h-12 border-t border-r border-cyan-500/25 z-50 pointer-events-none" />
      <div className="fixed bottom-8 left-1 w-12 h-12 border-b border-l border-cyan-500/25 z-50 pointer-events-none" />
      <div className="fixed bottom-8 right-1 w-12 h-12 border-b border-r border-cyan-500/25 z-50 pointer-events-none" />

      {/* Kill HUD */}
      <div className={`fixed top-5 right-5 z-[1000] text-right pointer-events-none font-black transition-opacity duration-500 ${booted ? 'opacity-100' : 'opacity-0'}`}>
        <div className="text-[9px] tracking-[3px] text-cyan-200/60">// KILLS</div>
        <div className="text-3xl text-red-500" style={{ textShadow: '0 0 20px rgba(255,51,68,.4)' }}>{kills}</div>
        <div className="font-mono text-[10px] text-cyan-200/30 mt-2">CLICK TO FIRE</div>
      </div>

      {/* MAIN */}
      <main className={`relative z-10 max-w-[1440px] mx-auto px-4 md:px-8 py-10 transition-opacity duration-700 ${booted ? 'opacity-100' : 'opacity-0'}`}>

        {/* Hero */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-[2px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/25 px-5 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#00ff88] animate-pulse" />
            PRICING MATRIX — SELECT CLEARANCE LEVEL
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-[6px] uppercase leading-tight mb-4">
            CHOOSE YOUR{' '}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">MISSION TIER</span>
          </h1>
          <p className="font-mono text-sm text-cyan-200/60 max-w-xl mx-auto leading-relaxed">
            From solo builders to full-scale agencies. Every plan includes AI-powered project generation, deployment, and mission control.
          </p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className={`font-mono text-xs tracking-[2px] transition-colors ${!yearly ? 'text-cyan-400' : 'text-slate-500'}`}>MONTHLY</span>
          <div onClick={() => setYearly(!yearly)} className={`w-[52px] h-[26px] rounded-full cursor-pointer relative border transition-all ${yearly ? 'bg-cyan-500/10 border-cyan-500/25' : 'bg-slate-800 border-slate-700'}`}>
            <div className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(0,240,255,.25)] transition-transform duration-300 ${yearly ? 'translate-x-[26px]' : ''}`} style={{ transitionTimingFunction: 'cubic-bezier(.68,-.55,.27,1.55)' }} />
          </div>
          <span className={`font-mono text-xs tracking-[2px] transition-colors ${yearly ? 'text-cyan-400' : 'text-slate-500'}`}>YEARLY</span>
          <span className="font-black text-[9px] tracking-wider text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5">SAVE 20%</span>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-16">
          {PLANS.map((p) => {
            const isCurr = user?.subscription_plan === p.plan
            const price = yearly ? p.price.y : p.price.m
            const orig = yearly ? p.price.m : null
            return (
              <div key={p.name} data-plan-card className={`relative bg-[#071020] border overflow-hidden transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,240,255,.08)] ${p.popular ? 'border-fuchsia-500/30 xl:order-last' : 'border-slate-800 hover:border-cyan-500/25'}`}
                style={{ opacity: 0, transform: 'translateY(24px)', transition: 'opacity 0.5s, transform 0.5s' }}>

                {/* Top gradient bar */}
                <div className={`h-[3px] ${topBarGradient(p.tier)}`} />

                {/* Popular banner */}
                {p.popular && (
                  <div className="text-center py-2 bg-gradient-to-r from-fuchsia-500/20 to-cyan-500/10 text-fuchsia-400 font-black text-[9px] tracking-[3px] border-b border-fuchsia-500/20">
                    ★ MOST POPULAR — BEST VALUE ★
                  </div>
                )}

                <div className="p-6">
                  {/* Plan Name */}
                  <div className={`font-black text-sm tracking-[3px] uppercase mb-1.5 ${p.tier !== 'agency' ? p.color : ''}`} style={nameStyle(p.tier)}>
                    {p.name}
                  </div>

                  {/* Description */}
                  <div className="font-mono text-xs text-cyan-200/60 mb-5 min-h-[36px] leading-relaxed">{p.desc}</div>

                  {/* Price */}
                  <div className="mb-6">
                    {price === 0 ? (
                      <>
                        <span className={`text-4xl font-black ${p.color}`}>$0</span>
                        <span className="font-mono text-xs text-slate-500 ml-1">/forever</span>
                      </>
                    ) : (
                      <>
                        <span className="font-black text-base opacity-60">$</span>
                        <span className={`text-4xl font-black ${p.tier !== 'agency' ? p.color : ''}`} style={amountStyle(p.tier)}>{price}</span>
                        <span className="font-mono text-xs text-slate-500 ml-1">/mo</span>
                        {yearly && orig && (
                          <>
                            <span className="font-mono text-sm text-slate-600 line-through ml-2">${orig}</span>
                            <span className="font-black text-[9px] text-emerald-400 bg-emerald-500/20 px-2 py-0.5 ml-2">-20%</span>
                          </>
                        )}
                      </>
                    )}
                  </div>

                  {/* Project bar */}
                  <div className="flex items-center gap-3 py-3.5 border-t border-b border-slate-800 mb-5">
                    <div className={`font-black text-2xl ${p.tier !== 'agency' ? p.color : ''}`} style={projCountStyle(p.tier)}>
                      {p.projects}
                    </div>
                    <div className="font-mono text-xs text-cyan-200/60 tracking-wider">PROJECTS</div>
                    <div className="flex-1 h-1 bg-slate-800 rounded overflow-hidden">
                      <div className={`h-full rounded ${projBarFillClass(p.tier)}`} style={projBarFillStyle(p.tier, p.barW)} />
                    </div>
                  </div>

                  {/* Features */}
                  <ul className="mb-6 space-y-0">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 font-mono text-xs text-cyan-200/60 py-1.5 border-b border-slate-800/50 last:border-0">
                        <span className={`text-[10px] ${p.tier === 'agency' ? 'text-fuchsia-400' : p.color}`}>✓</span> {f}
                        {p.popular && i >= 5 && <span className="ml-auto font-black text-[8px] tracking-wider text-amber-400 bg-amber-500/20 px-1.5 py-0.5">NEW</span>}
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handleSelectPlan(p.plan)}
                    disabled={loading === p.plan || isCurr}
                    className={`w-full py-3.5 font-black text-xs tracking-[2px] uppercase transition-all disabled:opacity-60 ${isCurr ? 'bg-emerald-500/15 text-emerald-400' : p.btnClass}`}
                    style={{ clipPath: 'polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%)' }}
                  >
                    {loading === p.plan ? <ButtonLoading /> : isCurr ? 'CURRENT PLAN' : price === 0 ? 'START FREE' : `SELECT ${p.name.toUpperCase()}`}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Compare Table */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 text-sm" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}>C</div>
          <span className="font-black text-sm tracking-[3px] uppercase">Feature Comparison</span>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
        </div>
        <div className="overflow-x-auto mb-16">
          <table className="w-full font-mono text-xs border-collapse">
            <thead>
              <tr>
                <th className="text-left font-black text-[10px] tracking-[2px] p-3.5 border-b-2 border-slate-800">Feature</th>
                <th className="text-center font-black text-[10px] tracking-[2px] p-3.5 border-b-2 border-slate-800">Free</th>
                <th className="text-center font-black text-[10px] tracking-[2px] p-3.5 border-b-2 border-slate-800">Builder</th>
                <th className="text-center font-black text-[10px] tracking-[2px] p-3.5 border-b-2 border-slate-800">Pro</th>
                <th className="text-center font-black text-[10px] tracking-[2px] p-3.5 border-b-2 border-slate-800 text-fuchsia-400 bg-fuchsia-500/5">Agency ★</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r, i) => (
                <tr key={i} className="hover:bg-cyan-500/5">
                  <td className="text-left p-3 border-b border-slate-800/50 text-gray-300">{r.name}</td>
                  <td className="text-center p-3 border-b border-slate-800/50 text-cyan-200/60">{cell(r.f)}</td>
                  <td className="text-center p-3 border-b border-slate-800/50 text-cyan-200/60">{cell(r.b)}</td>
                  <td className="text-center p-3 border-b border-slate-800/50 text-cyan-200/60">{cell(r.p)}</td>
                  <td className="text-center p-3 border-b border-slate-800/50 bg-fuchsia-500/5 font-bold">{cell(r.a)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* FAQ */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 flex items-center justify-center bg-cyan-500/10 text-sm" style={{ clipPath: 'polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)' }}>?</div>
          <span className="font-black text-sm tracking-[3px] uppercase">Frequently Asked</span>
          <div className="flex-1 h-px bg-gradient-to-r from-slate-800 to-transparent" />
        </div>
        <div className="grid md:grid-cols-2 gap-4 mb-16">
          {FAQS.map((f, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="bg-[#071020] border border-slate-800 p-5 cursor-pointer transition-all hover:border-cyan-500/25">
              <div className="font-black text-xs tracking-wider flex justify-between items-center">
                {f.q} <span className={`text-cyan-400 transition-transform duration-300 text-[10px] ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </div>
              <div className={`font-mono text-xs text-cyan-200/60 leading-relaxed overflow-hidden transition-all duration-400 ${openFaq === i ? 'max-h-40 pt-2' : 'max-h-0'}`}>
                {f.a}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="relative bg-[#071020] border border-cyan-500/25 p-12 text-center overflow-hidden mb-10">
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(#00f0ff 1px, transparent 1px), linear-gradient(90deg, #00f0ff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <h2 className="relative z-10 font-black text-2xl tracking-[4px] uppercase mb-3">READY TO BUILD THE FUTURE?</h2>
          <p className="relative z-10 font-mono text-xs text-cyan-200/60 mb-6">Start free. Upgrade when you need more power. No credit card required.</p>
          <button onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')} className="relative z-10 font-black text-xs tracking-[3px] bg-gradient-to-r from-cyan-400 to-emerald-400 text-gray-950 px-12 py-4 transition-all hover:-translate-y-1 hover:shadow-[0_0_40px_rgba(0,240,255,.25)]" style={{ clipPath: 'polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)' }}>
            LAUNCH YOUR FIRST PROJECT
          </button>
        </div>

        {/* Footer text */}
        <div className="text-center font-mono text-xs text-cyan-200/50 pb-10">
          <p>All plans include unlimited downloads and project exports.</p>
          <p className="mt-2">Questions? <a href="mailto:support@ziplogic.ai" className="text-cyan-400 hover:text-cyan-300">Contact us</a></p>
        </div>
      </main>

      {/* System Bar */}
      <div className="fixed bottom-0 inset-x-0 h-7 bg-[#071020] border-t border-slate-800 flex items-center justify-between px-5 font-mono text-[11px] text-cyan-300/50 tracking-wider z-[500]">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_#00ff88]" /> CORE: STABLE</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff]" /> API: CONNECTED</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_6px_#ffaa00]" /> WEAPONS: ARMED</span>
        </div>
      </div>
    </div>
  )
}