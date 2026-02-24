import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { subscriptionsAPI } from "../services/api";
import { useAuthStore } from '../services/authStore';
import ziplogicLogo from "../images/ziplogic.png";

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   FAQ sub-component
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border-b border-white/10 transition-all ${open ? "open" : ""}`}>
      <button
        className="w-full py-6 bg-transparent border-none text-[var(--text-primary)] cursor-pointer flex items-center justify-between text-lg font-semibold text-left font-[Rajdhani,sans-serif] transition-colors hover:text-[var(--green)]"
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {q}
        <span
          className={`text-xl transition-transform duration-300 text-[var(--text-muted)] ${open ? "rotate-45 !text-[var(--green)]" : ""}`}
        >
          +
        </span>
      </button>
      <div
        className={`overflow-hidden transition-[max-height] duration-400 ease-in-out ${open ? "max-h-[200px]" : "max-h-0"}`}
      >
        <div className="pb-6 text-[var(--text-body)] leading-[1.7] text-[0.95rem]">{a}</div>
      </div>
    </div>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   LANDING PAGE
   â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuthStore();

  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: -999, y: -999 });

  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "dark";
    return localStorage.getItem("ziplogic-theme") || "dark";
  });

  const [payLoading, setPayLoading] = useState({ plan: null, error: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Plans from API
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // â”€â”€ Minimal CSS that Tailwind can't cover (animations, CSS vars, pseudo-elements) â”€â”€
  const css = useMemo(
    () => `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Rajdhani:wght@300;400;500;600;700&family=Space+Mono:wght@400;700&display=swap');

:root{--green:#00ff88;--cyan:#00ddff;--purple:#8844ff}

[data-theme="dark"]{
  --bg:#040810;--bg-rgb:4,8,16;
  --surface:rgba(255,255,255,0.05);--surface-hover:rgba(255,255,255,0.08);
  --border:rgba(255,255,255,0.1);--border-hover:rgba(0,255,136,0.25);
  --text-primary:#fff;--text-secondary:rgba(255,255,255,0.75);
  --text-body:rgba(255,255,255,0.65);--text-muted:rgba(255,255,255,0.45);
  --text-faint:rgba(255,255,255,0.3);
  --nav-bg:rgba(4,8,16,0.6);--nav-bg-scroll:rgba(4,8,16,0.95);
  --terminal-bg:rgba(8,12,22,0.92);--terminal-inner:rgba(0,0,0,0.3);
  --card-shadow:rgba(0,0,0,0.3);
  --footer-text:rgba(255,255,255,0.55);--footer-link:rgba(255,255,255,0.5);--footer-muted:rgba(255,255,255,0.35);
  --canvas-particle-line:0,255,136;--scrollbar-track:#040810;
}

[data-theme="light"]{
  --bg:#f0f2f5;--bg-rgb:240,242,245;
  --surface:rgba(0,0,0,0.04);--surface-hover:rgba(0,0,0,0.07);
  --border:rgba(0,0,0,0.1);--border-hover:rgba(0,150,80,0.3);
  --text-primary:#0a0f1a;--text-secondary:#1a2030;
  --text-body:#2a3344;--text-muted:#4a5568;--text-faint:#718096;
  --nav-bg:rgba(240,242,245,0.7);--nav-bg-scroll:rgba(240,242,245,0.97);
  --terminal-bg:rgba(15,20,35,0.95);--terminal-inner:rgba(0,0,0,0.4);
  --card-shadow:rgba(0,0,0,0.08);
  --footer-text:#4a5568;--footer-link:#4a5568;--footer-muted:#718096;
  --canvas-particle-line:0,180,100;--scrollbar-track:#e2e5ea;
  --green:#00cc6a;--cyan:#0099cc;--purple:#6633cc;
}

*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{font-family:'Rajdhani',sans-serif;background:var(--bg);color:var(--text-primary);overflow-x:hidden;-webkit-font-smoothing:antialiased;transition:background .4s,color .4s}
::selection{background:rgba(0,255,136,.3);color:#fff}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--scrollbar-track)}
::-webkit-scrollbar-thumb{background:linear-gradient(180deg,var(--green),var(--cyan));border-radius:3px}

/* Keyframes */
@keyframes nebPulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.3);opacity:.5}}
@keyframes shoot{0%{opacity:0;transform:translateX(0) rotate(-30deg)}3%{opacity:1}12%{opacity:0;transform:translateX(400px) rotate(-30deg)}100%{opacity:0}}
@keyframes flyL{0%{left:108%}100%{left:-18%}}
@keyframes flyR{0%{left:-18%}100%{left:108%}}
@keyframes maFloat{0%,100%{transform:translateY(0) rotate(0)}33%{transform:translateY(-15px) rotate(3deg)}66%{transform:translateY(-8px) rotate(-2deg)}}
@keyframes planetFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
@keyframes wave{0%,100%{transform:rotate(-10deg)}50%{transform:rotate(10deg)}}
@keyframes fadeInUp{from{opacity:0;transform:translateY(25px)}to{opacity:1;transform:translateY(0)}}
@keyframes ping{75%,100%{transform:scale(1.6);opacity:0}}
@keyframes blink{50%{opacity:.3}}
@keyframes tlFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
@keyframes cBlink{50%{opacity:0}}
@keyframes rPop{from{opacity:0;transform:translateX(-6px)}to{opacity:1;transform:translateX(0)}}
@keyframes borderSpin{to{transform:rotate(360deg)}}

/* Terminal typing lines */
.tl{opacity:0;animation:tlFade .4s forwards}
.tl:nth-child(1){animation-delay:.8s}.tl:nth-child(2){animation-delay:1.5s}.tl:nth-child(3){animation-delay:2.2s}
.tl:nth-child(4){animation-delay:3s}.tl:nth-child(5){animation-delay:3.8s}.tl:nth-child(6){animation-delay:4.5s}.tl:nth-child(7){animation-delay:5.2s}
.cursor-b::after{content:'â–ˆ';animation:cBlink 1s step-end infinite;color:#00ff88}
.right-item{opacity:0;animation:rPop .3s forwards}
.right-item:nth-child(2){animation-delay:5.5s}.right-item:nth-child(3){animation-delay:5.8s}
.right-item:nth-child(4){animation-delay:6.1s}.right-item:nth-child(5){animation-delay:6.4s}.right-item:nth-child(6){animation-delay:6.7s}

/* Gradient text helper */
.gradient{background:linear-gradient(135deg,var(--green) 0%,var(--cyan) 50%,var(--purple) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.gradient-gc{background:linear-gradient(135deg,var(--green),var(--cyan));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

/* Scroll reveal */
.reveal{opacity:0;transform:translateY(30px);transition:all .8s cubic-bezier(.16,1,.3,1)}
.reveal.vis{opacity:1;transform:translateY(0)}
.reveal-d1{transition-delay:.1s}.reveal-d2{transition-delay:.2s}.reveal-d3{transition-delay:.3s}

/* Btn shine */
.btn-shine{position:relative;overflow:hidden}
.btn-shine::before{content:'';position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.3),transparent);transition:left .5s}
.btn-shine:hover::before{left:100%}

/* CTA box border spin */
.cta-box::before{content:'';position:absolute;inset:-2px;border-radius:28px;background:conic-gradient(var(--green),var(--cyan),var(--purple),var(--green));z-index:-1;opacity:.1;animation:borderSpin 8s linear infinite}

/* Price card popular badge */
.price-pop::before{content:'MOST POPULAR';position:absolute;top:-12px;left:50%;transform:translateX(-50%);padding:4px 16px;background:linear-gradient(135deg,var(--green),var(--cyan));color:#000;font-family:'Orbitron',sans-serif;font-size:.58rem;font-weight:700;border-radius:8px;letter-spacing:2px;white-space:nowrap}

/* Nav scrolled */
nav.scrolled{background:var(--nav-bg-scroll)!important;box-shadow:0 4px 40px rgba(0,0,0,.15)}

/* Feat card top line */
.feat-card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,var(--green),transparent);opacity:0;transition:opacity .4s}
.feat-card:hover::before{opacity:1}

/* Responsive */
/* Mobile menu */
.mobile-menu-overlay{position:fixed;inset:0;z-index:99;background:rgba(0,0,0,0.6);backdrop-filter:blur(8px);opacity:0;pointer-events:none;transition:opacity .3s ease}
.mobile-menu-overlay.open{opacity:1;pointer-events:auto}
.mobile-menu-panel{position:fixed;top:0;right:0;bottom:0;z-index:101;width:min(320px,85vw);background:var(--nav-bg-scroll);border-left:1px solid var(--border);transform:translateX(100%);transition:transform .35s cubic-bezier(.32,.72,0,1);display:flex;flex-direction:column;overflow-y:auto}
.mobile-menu-panel.open{transform:translateX(0)}
.mobile-menu-link{display:block;padding:18px 28px;color:var(--text-secondary);text-decoration:none;font-family:'Rajdhani',sans-serif;font-size:1.1rem;font-weight:600;border-bottom:1px solid var(--border);transition:background .2s,color .2s;letter-spacing:0.5px}
.mobile-menu-link:hover,.mobile-menu-link:active{background:rgba(0,255,136,0.06);color:var(--green)}
.hamburger-btn{display:none;width:44px;height:44px;border-radius:12px;border:1px solid var(--border);background:var(--surface);cursor:pointer;align-items:center;justify-content:center;flex-shrink:0;position:relative;z-index:102}
.hamburger-line{display:block;width:20px;height:2px;background:var(--text-muted);border-radius:2px;transition:all .3s ease;position:absolute;left:50%;transform:translateX(-50%)}
.hamburger-line:nth-child(1){top:13px}.hamburger-line:nth-child(2){top:20px}.hamburger-line:nth-child(3){top:27px}
.hamburger-btn.active .hamburger-line:nth-child(1){top:20px;transform:translateX(-50%) rotate(45deg)}
.hamburger-btn.active .hamburger-line:nth-child(2){opacity:0;transform:translateX(-50%) scaleX(0)}
.hamburger-btn.active .hamburger-line:nth-child(3){top:20px;transform:translateX(-50%) rotate(-45deg)}

@media(max-width:900px){
  .pipeline-grid,.audience-grid{grid-template-columns:1fr!important;max-width:480px!important;margin-left:auto!important;margin-right:auto!important}
  .pricing-grid{grid-template-columns:repeat(2,1fr)!important;max-width:700px!important;margin-left:auto!important;margin-right:auto!important}
  .price-pop{transform:none!important}
  .pipeline-line{display:none!important}
  .features-grid{grid-template-columns:1fr!important;max-width:520px!important;margin-left:auto!important;margin-right:auto!important}
  .terminal-body{grid-template-columns:1fr!important}
  .terminal-left{border-right:none!important;border-bottom:1px solid rgba(255,255,255,.06)!important}
  .hamburger-btn{display:flex}
  .desktop-nav-links{display:none!important}
  .mini-alien,.planet{display:none!important}
}
@media(max-width:600px){
  .hero-actions{flex-direction:column!important;width:100%!important}
  .hero-actions>*{width:100%!important;justify-content:center!important}
  .pricing-grid{grid-template-columns:1fr!important;max-width:400px!important}
  .footer-cols{flex-direction:column!important;gap:2rem!important}
  .footer-bottom{flex-direction:column!important;gap:0.5rem!important;text-align:center!important}
}
`,
    []
  );

  /* â”€â”€â”€ Helpers â”€â”€â”€ */
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));
  const go = (path) => navigate(path);
  const scrollToId = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleNavigation = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  const mobileScrollTo = (id) => {
    setMobileMenuOpen(false);
    setTimeout(() => scrollToId(id), 100);
  };

  const mobileNavigate = (path) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  /* â”€â”€â”€ Stripe checkout â”€â”€â”€ */
  const startCheckout = async (planId, planSlug) => {
    setPayLoading({ plan: planSlug, error: null });

    if (!isAuthenticated || !token) {
      try {
        localStorage.setItem("post_login_intent", JSON.stringify({ type: "checkout", plan: planSlug, plan_id: planId }));
      } catch {}
      go("/login");
      setPayLoading({ plan: null, error: null });
      return;
    }

    try {
      const res = await subscriptionsAPI.createCheckout({
        plan_id: planId,
        billing_cycle: 'monthly',
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url: `${window.location.origin}/pricing?payment=cancelled`
      });
      const data = res?.data;
      const checkoutUrl = data?.url;
      if (!checkoutUrl) throw new Error(data?.error || "Checkout URL missing");
      window.location.href = checkoutUrl;
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to start checkout";
      setPayLoading({ plan: null, error: String(msg) });
    }
  };

  /* â”€â”€â”€ Theme apply â”€â”€â”€ */
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("ziplogic-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  /* â”€â”€â”€ Auto checkout after login redirect â”€â”€â”€ */
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    try {
      const raw = localStorage.getItem("post_login_intent");
      if (!raw) return;
      const intent = JSON.parse(raw);
      if (intent?.type === "checkout" && intent?.plan_id) {
        localStorage.removeItem("post_login_intent");
        startCheckout(intent.plan_id, intent.plan);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  /* â”€â”€â”€ Fetch plans from API â”€â”€â”€ */
  useEffect(() => {
    const fetchPlans = async () => {
      console.log('[Landing] Starting to fetch plans...');
      try {
        const response = await subscriptionsAPI.getPlans();
        console.log('[Landing] Plans API Response:', response);
        console.log('[Landing] Response data:', response.data);
        
        // Handle paginated response (results) or direct array
        let apiPlans = [];
        if (response.data && Array.isArray(response.data.results)) {
          apiPlans = response.data.results;
          console.log('[Landing] Using paginated results:', apiPlans.length, 'plans');
        } else if (Array.isArray(response.data)) {
          apiPlans = response.data;
          console.log('[Landing] Using direct array:', apiPlans.length, 'plans');
        } else {
          console.warn('[Landing] Unexpected API response format:', response.data);
        }
        
        // Transform API data to match component structure
        const transformedPlans = apiPlans.map(plan => ({
          id: plan.id,
          name: plan.name,
          slug: plan.slug,
          price_monthly: parseFloat(plan.price_monthly) || 0,
          price_yearly: parseFloat(plan.price_yearly) || 0,
          description: plan.description || '',
          max_projects: plan.max_projects || 1,
          features: Array.isArray(plan.features) ? plan.features : [],
          is_popular: plan.is_popular || false,
          support_level: plan.support_level || 'Community',
          team_seats: plan.team_seats || 1,
          max_ai_builds_per_month: plan.max_ai_builds_per_month || 5,
        }));
        
        console.log('[Landing] Setting plans state with:', transformedPlans.length, 'plans');
        setPlans(transformedPlans);
      } catch (error) {
        console.error('[Landing] Failed to fetch plans:', error);
        console.error('[Landing] Error details:', error.message);
        if (error.response) {
          console.error('[Landing] Error response:', error.response.data);
        }
      } finally {
        setPlansLoading(false);
        console.log('[Landing] Plans loading finished');
      }
    };
    fetchPlans();
  }, []);

  /* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
     WEBCONTAINER PRE-BOOT - Makes NewProject page instant!
     Boot WebContainer in background while user reads landing page
     â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */
  useEffect(() => {
    const timer = setTimeout(() => {
      // Skip if already booted or booting
      if (window.__webContainerInstance || window.__webContainerBooting) {
        console.log('[Landing] WebContainer already ready/booting');
        return;
      }
      
      // Dynamically import and boot WebContainer
      import('@webcontainer/api').then(wc => {
        console.log('[Landing] ðŸš€ Pre-booting WebContainer in background...');
        window.__webContainerBooting = wc.WebContainer.boot().then(instance => {
          window.__webContainerInstance = instance;
          window.__webContainerBooting = null;
          console.log('[Landing] âœ… WebContainer pre-booted & cached!');
          return instance;
        }).catch(err => {
          window.__webContainerBooting = null;
          console.log('[Landing] WebContainer boot skipped:', err.message);
        });
      }).catch(() => {
        console.log('[Landing] WebContainer API not available');
      });
    }, 3000);  // Wait 3 seconds after page load
    
    return () => clearTimeout(timer);
  }, []);

  /* â”€â”€â”€ Particles â”€â”€â”€ */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };

    const initParticles = () => {
      resizeCanvas();
      const isDark = document.documentElement.dataset.theme === "dark";
      const n = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 150);
      const colors = isDark
        ? ["#00ff88","#00ddff","#8844ff","#00ff88","#00ff88","#00ddff"]
        : ["#00aa55","#0088aa","#6633cc","#00aa55","#00aa55","#0088aa"];
      particlesRef.current = Array.from({ length: n }).map(() => ({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45, vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2 + 0.4, o: Math.random() * (isDark ? 0.5 : 0.35) + 0.15,
        pulse: Math.random() * Math.PI * 2,
        color: colors[Math.floor(Math.random() * 6)],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lineRGB = getComputedStyle(document.documentElement).getPropertyValue("--canvas-particle-line").trim();
      const P = particlesRef.current;
      const mouse = mouseRef.current;
      P.forEach((p, i) => {
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
        for (let j = i + 1; j < Math.min(i + 8, P.length); j++) {
          const q = P[j]; const dx = p.x - q.x; const dy = p.y - q.y; const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.strokeStyle = `rgba(${lineRGB},${0.06 * (1 - d / 130)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
        const mdx = p.x - mouse.x; const mdy = p.y - mouse.y; const md = Math.sqrt(mdx * mdx + mdy * mdy);
        if (md < 160) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.5, 0, Math.PI * 2); ctx.fillStyle = `rgba(${lineRGB},${0.18 * (1 - md / 160)})`; ctx.fill(); }
      });
      rafRef.current = requestAnimationFrame(draw);
    };

    const onResize = () => initParticles();
    const onMove = (e) => (mouseRef.current = { x: e.clientX, y: e.clientY });
    initParticles(); draw();
    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener("resize", onResize); window.removeEventListener("mousemove", onMove); };
  }, [theme]);

  /* â”€â”€â”€ Scroll, Reveal, Alien Eyes, Blink â”€â”€â”€ */
  useEffect(() => {
    const onScroll = () => {
      const nav = document.getElementById("mainNav");
      if (nav) nav.classList.toggle("scrolled", window.scrollY > 60);
    };
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("vis")),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    
    return () => {
      window.removeEventListener("scroll", onScroll);
      obs.disconnect();
    };
  }, []);
  
  /* â”€â”€â”€ Re-observe reveal elements when plans load â”€â”€â”€ */
  useEffect(() => {
    if (!plansLoading && plans.length > 0) {
      console.log('[Landing] Re-observing reveal elements after plans load');
      const obs = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("vis")),
        { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
      );
      // Only observe reveal elements in the pricing section
      document.querySelectorAll("#pricing .reveal").forEach((el) => obs.observe(el));
      return () => obs.disconnect();
    }
  }, [plansLoading, plans]);

  /* â”€â”€â”€ Alien Eyes Animation â”€â”€â”€ */
  useEffect(() => {
    const eyeL = document.getElementById("eyeL");
    const eyeR = document.getElementById("eyeR");
    const pupilGroup = document.getElementById("pupilGroup");
    const mouth = document.getElementById("mouth");
    const blushL = document.getElementById("blushL");
    const blushR = document.getElementById("blushR");

    const blinkTimer = setInterval(() => {
      if (!eyeL || !eyeR) return;
      eyeL.setAttribute("ry", "2"); eyeR.setAttribute("ry", "2");
      if (pupilGroup) pupilGroup.style.opacity = "0";
      setTimeout(() => { eyeL.setAttribute("ry", "14"); eyeR.setAttribute("ry", "14"); if (pupilGroup) pupilGroup.style.opacity = "1"; }, 150);
    }, 3000 + Math.random() * 2000);

    const smileTimer = setInterval(() => {
      if (!mouth) return;
      mouth.setAttribute("d", "M80 120 Q100 142 120 120"); mouth.setAttribute("stroke-width", "4");
      blushL?.setAttribute("opacity", "0.35"); blushR?.setAttribute("opacity", "0.35");
      setTimeout(() => { mouth.setAttribute("d", "M85 118 Q100 130 115 118"); mouth.setAttribute("stroke-width", "3"); blushL?.setAttribute("opacity", "0"); blushR?.setAttribute("opacity", "0"); }, 2000);
    }, 7000 + Math.random() * 4000);

    const onEyeMove = (e) => {
      if (!pupilGroup) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 14;
      const y = (e.clientY / window.innerHeight - 0.5) * 10;
      pupilGroup.style.transform = `translate(${x}px,${y}px)`;
      pupilGroup.style.transition = "transform 0.12s ease-out";
    };
    window.addEventListener("mousemove", onEyeMove);

    const miniBlinkTimer = setInterval(() => {
      document.querySelectorAll(".ma-eye").forEach((el) => {
        el.setAttribute("ry", "1");
        setTimeout(() => el.setAttribute("ry", "5"), 120);
      });
    }, 2500 + Math.random() * 2000);

    return () => {
      window.removeEventListener("mousemove", onEyeMove);
      clearInterval(blinkTimer); clearInterval(smileTimer); clearInterval(miniBlinkTimer);
    };
  }, []);

  /* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
     RENDER
     â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* â•â•â• BG FX â•â•â• */}
      <canvas id="particles-canvas" ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />

      {/* Grid overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(0,255,136,0.025) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.025) 1px,transparent 1px)",
          backgroundSize: "80px 80px",
          maskImage: "radial-gradient(ellipse 80% 50% at 50% 30%,black 20%,transparent 70%)",
        }}
      />

      {/* Nebulas */}
      <div className="fixed rounded-full pointer-events-none z-0 blur-[120px] w-[700px] h-[700px] -top-[15%] -right-[10%]" style={{ background: "radial-gradient(circle,rgba(136,68,255,0.18),transparent 70%)", animation: "nebPulse 12s ease-in-out infinite" }} />
      <div className="fixed rounded-full pointer-events-none z-0 blur-[120px] w-[600px] h-[600px] bottom-[5%] -left-[10%]" style={{ background: "radial-gradient(circle,rgba(0,221,255,0.12),transparent 70%)", animation: "nebPulse 16s ease-in-out infinite", animationDelay: "-6s" }} />
      <div className="fixed rounded-full pointer-events-none z-0 blur-[120px] w-[500px] h-[500px] top-[35%] left-[30%]" style={{ background: "radial-gradient(circle,rgba(0,255,136,0.08),transparent 70%)", animation: "nebPulse 20s ease-in-out infinite", animationDelay: "-12s" }} />

      {/* Shooting stars */}
      {[
        { top: "12%", left: "15%", dur: "5s", delay: "0.5s", rot: "-30deg" },
        { top: "40%", left: "55%", dur: "6s", delay: "3s", rot: "-20deg" },
        { top: "65%", left: "25%", dur: "7s", delay: "6s", rot: "-35deg" },
        { top: "25%", left: "70%", dur: "5.5s", delay: "8s", rot: "-25deg" },
      ].map((s, i) => (
        <div
          key={`star-${i}`}
          className="fixed w-[150px] h-[2px] opacity-0 pointer-events-none z-[1] rounded-sm"
          style={{
            background: "linear-gradient(90deg,var(--green),var(--cyan),transparent)",
            top: s.top, left: s.left,
            animation: `shoot ${s.dur} linear infinite`,
            animationDelay: s.delay,
            transform: `rotate(${s.rot})`,
          }}
        />
      ))}

      {/* Planets */}
      <div className="planet fixed rounded-full pointer-events-none z-[1] w-[80px] h-[80px] top-[15%] right-[8%]" style={{ background: "radial-gradient(circle at 35% 35%,#2a1a4a,#0a0520)", boxShadow: "inset -8px -8px 20px rgba(136,68,255,0.3),0 0 40px rgba(136,68,255,0.15)", animation: "planetFloat 20s ease-in-out infinite" }} />
      <div className="planet fixed rounded-full pointer-events-none z-[1] w-[50px] h-[50px] bottom-[20%] left-[5%]" style={{ background: "radial-gradient(circle at 30% 30%,#1a3a2a,#051510)", boxShadow: "inset -5px -5px 15px rgba(0,255,136,0.2),0 0 25px rgba(0,255,136,0.1)", animation: "planetFloat 25s ease-in-out infinite", animationDelay: "-8s" }} />
      <div className="planet fixed rounded-full pointer-events-none z-[1] w-[35px] h-[35px] top-[50%] right-[3%]" style={{ background: "radial-gradient(circle at 30% 30%,#1a2a3a,#050f1a)", boxShadow: "inset -4px -4px 10px rgba(0,221,255,0.2),0 0 20px rgba(0,221,255,0.08)", animation: "planetFloat 18s ease-in-out infinite", animationDelay: "-4s" }} />

      {/* â•â•â• BIG UFOS â•â•â• */}
      <svg className="fixed z-[2] pointer-events-none top-[10%]" style={{ filter: "drop-shadow(0 0 30px rgba(0,255,136,0.5))", animation: "flyL 22s linear infinite" }} width="120" height="60" viewBox="0 0 120 60">
        <defs><linearGradient id="ufg1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00ff88" /><stop offset="100%" stopColor="#006633" /></linearGradient></defs>
        <ellipse cx="60" cy="25" rx="50" ry="15" fill="url(#ufg1)" /><ellipse cx="60" cy="20" rx="25" ry="15" fill="#88ffcc" opacity="0.6" /><ellipse cx="60" cy="18" rx="20" ry="12" fill="#aaffdd" opacity="0.4" /><ellipse cx="60" cy="30" rx="40" ry="8" fill="#004422" />
        {[20,40,60,80,100].map((cx,i)=>(<circle key={i} cx={cx} cy={cx===60?33:cx===40||cx===80?32:30} r="4" fill="#00ffff"><animate attributeName="opacity" values="0.3;1;0.3" dur={`${0.8+i*0.1}s`} repeatCount="indefinite"/></circle>))}
      </svg>

      <svg className="fixed z-[2] pointer-events-none top-[55%]" style={{ filter: "drop-shadow(0 0 30px rgba(0,255,136,0.5))", animation: "flyR 30s linear infinite", animationDelay: "-10s" }} width="100" height="50" viewBox="0 0 120 60">
        <defs><linearGradient id="ufg2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00ddff" /><stop offset="100%" stopColor="#003366" /></linearGradient></defs>
        <ellipse cx="60" cy="25" rx="50" ry="15" fill="url(#ufg2)" /><ellipse cx="60" cy="20" rx="25" ry="15" fill="#88ddff" opacity="0.5" /><ellipse cx="60" cy="30" rx="40" ry="8" fill="#002244" />
        {[25,50,75,95].map((cx,i)=>(<circle key={i} cx={cx} cy={cx<=25||cx>=95?30:33} r="4" fill={i%2===0?"#00ffff":"#00ff88"}><animate attributeName="opacity" values="0.3;1;0.3" dur={`${0.8+i*0.1}s`} repeatCount="indefinite"/></circle>))}
      </svg>

      <svg className="fixed z-[2] pointer-events-none top-[78%]" style={{ filter: "drop-shadow(0 0 30px rgba(0,255,136,0.5))", animation: "flyL 38s linear infinite", animationDelay: "-22s" }} width="80" height="40" viewBox="0 0 120 60">
        <defs><linearGradient id="ufg3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#8844ff" /><stop offset="100%" stopColor="#331166" /></linearGradient></defs>
        <ellipse cx="60" cy="25" rx="50" ry="15" fill="url(#ufg3)" /><ellipse cx="60" cy="20" rx="25" ry="15" fill="#bb88ff" opacity="0.4" /><ellipse cx="60" cy="30" rx="40" ry="8" fill="#220044" />
        {[30,60,90].map((cx,i)=>(<circle key={i} cx={cx} cy={cx===60?33:31} r="3.5" fill="#cc88ff"><animate attributeName="opacity" values="0.3;0.9;0.3" dur={`${0.8+i*0.2}s`} repeatCount="indefinite"/></circle>))}
      </svg>

      <svg className="fixed z-[2] pointer-events-none top-[30%] opacity-60" style={{ filter: "drop-shadow(0 0 30px rgba(0,255,136,0.5))", animation: "flyR 26s linear infinite", animationDelay: "-5s" }} width="70" height="35" viewBox="0 0 120 60">
        <ellipse cx="60" cy="25" rx="50" ry="15" fill="url(#ufg1)" opacity="0.7" /><ellipse cx="60" cy="20" rx="25" ry="15" fill="#88ffcc" opacity="0.4" /><ellipse cx="60" cy="30" rx="40" ry="8" fill="#004422" opacity="0.7" />
        {[35,60,85].map((cx,i)=>(<circle key={i} cx={cx} cy={cx===60?33:31} r="3" fill="#00ffff" opacity="0.5"><animate attributeName="opacity" values="0.2;0.7;0.2" dur={`${1+i*0.15}s`} repeatCount="indefinite"/></circle>))}
      </svg>

      {/* â•â•â• MINI ALIENS â•â•â• */}
      {[
        { cls: "mini-alien top-[18%] left-[8%]", anim: "maFloat 5s ease-in-out infinite", w: 50, h: 55, fill1: "#00dd66", fill2: "#00ff88", stroke: "#00ff88", cr: 3, cd: "1.5s" },
        { cls: "mini-alien top-[45%] right-[6%]", anim: "maFloat 6s ease-in-out infinite", w: 45, h: 50, fill1: "#00cc55", fill2: "#00ee77", stroke: "#00ee77", cr: 2.5, cd: "1.8s", ad: "-2s" },
        { cls: "mini-alien top-[72%] left-[12%]", anim: "maFloat 5.5s ease-in-out infinite", w: 40, h: 45, fill1: "#00bb44", fill2: "#00dd66", stroke: "#00dd66", cr: 2, cd: "2s", ad: "-4s", op: 0.8 },
      ].map((a, i) => (
        <svg key={`ma-${i}`} className={`fixed z-[2] pointer-events-none ${a.cls}`} style={{ filter: "drop-shadow(0 0 12px rgba(0,255,136,0.4))", animation: a.anim, animationDelay: a.ad || "0s" }} width={a.w} height={a.h} viewBox="0 0 50 55">
          <ellipse cx="25" cy="30" rx="18" ry="15" fill={a.fill1} opacity={a.op || 1} />
          <ellipse cx="25" cy="24" rx="15" ry="12" fill={a.fill2} opacity={a.op || 1} />
          <ellipse className="ma-eye" cx="18" cy="24" rx="6" ry="5" fill="#000" />
          <ellipse className="ma-eye" cx="32" cy="24" rx="6" ry="5" fill="#000" />
          <ellipse cx="18" cy="23" rx="3" ry="2.5" fill="#00ffff" />
          <ellipse cx="32" cy="23" rx="3" ry="2.5" fill="#00ffff" />
          <line x1="25" y1="12" x2="25" y2={i===0?"5":"6"} stroke={a.stroke} strokeWidth="2" strokeLinecap="round" />
          <circle cx="25" cy={i===0?4:5} r={a.cr} fill="#00ffff"><animate attributeName="opacity" values={`${i===2?"0.4":"0.5"};${i===2?"0.9":"1"};${i===2?"0.4":"0.5"}`} dur={a.cd} repeatCount="indefinite" /></circle>
        </svg>
      ))}

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          NAV
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <nav
        id="mainNav"
        className="fixed top-0 left-0 right-0 z-[100] px-8 h-[72px] flex items-center justify-between backdrop-blur-[24px] border-b transition-all duration-300"
        style={{ background: "var(--nav-bg)", borderColor: "var(--border)" }}
      >
        <a
          href="#"
          className="flex items-center gap-2.5 font-[Orbitron,sans-serif] font-bold text-[1.05rem] no-underline"
          style={{ color: "var(--text-primary)" }}
          onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        >
         <span className="relative">
            <div className="absolute -inset-0.5 rounded-[10px] bg-[rgba(0,255,136,0.25)]" style={{ animation: "ping 2s cubic-bezier(0,0,0.2,1) infinite" }} />
            <img src={ziplogicLogo} alt="ZipLogic AI" width="50" height="34" className="rounded-[10px] relative z-[1]" />
          </span>
          ZipLogic AI
          <span className="inline-block px-2.5 py-0.5 bg-[rgba(0,255,136,0.12)] border border-[rgba(0,255,136,0.25)] rounded-[20px] font-[Space_Mono,monospace] text-[0.6rem] text-[var(--green)] tracking-[2px]">
            BETA
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-7">
          <div className="desktop-nav-links" style={{display:"flex",alignItems:"center",gap:"1.75rem"}}>
          <a href="#how-it-works" className=" text-[var(--text-muted)] no-underline text-[0.92rem] font-medium transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("how-it-works"); }}>How It Works</a>
          <a href="#features" className="text-[var(--text-muted)] no-underline text-[0.92rem] font-medium transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("features"); }}>Features</a>
          <a href="#pricing" className="text-[var(--text-muted)] no-underline text-[0.92rem] font-medium transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("pricing"); }}>Pricing</a>
          <a href="#faq" className="text-[var(--text-muted)] no-underline text-[0.92rem] font-medium transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("faq"); }}>FAQ</a>
          </div>

          <button
            className="w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer text-lg transition-all border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === "light" ? "â˜€ï¸" : "ðŸŒ™"}
          </button>

          <button
            className="desktop-nav-links btn-shine inline-flex items-center gap-2 px-6 py-2.5 rounded-[10px] font-[Orbitron,sans-serif] text-[0.75rem] font-bold tracking-[1.5px] cursor-pointer border-none transition-all hover:-translate-y-0.5"
            style={{ background: "linear-gradient(135deg,var(--green),#00cc66)", color: "#000", boxShadow: "0 0 25px rgba(0,255,136,0.3)" }}
            type="button"
            onClick={() => go(isAuthenticated ? "/dashboard" : "/login")}
          >
            OPEN APP â†’
          </button>
        

          <button
            className={`hamburger-btn ${mobileMenuOpen ? "active" : ""}`}
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((v) => !v)}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        </div>
      </nav>

      
      {/* MOBILE MENU */}
      <div
        className={`mobile-menu-overlay ${mobileMenuOpen ? "open" : ""}`}
        onClick={() => setMobileMenuOpen(false)}
      />
      <div className={`mobile-menu-panel ${mobileMenuOpen ? "open" : ""}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: "var(--border)" }}>
          <span className="font-[Orbitron,sans-serif] text-[0.8rem] font-bold tracking-[2px]" style={{ color: "var(--green)" }}>NAVIGATE</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-9 h-9 rounded-lg flex items-center justify-center cursor-pointer border"
            style={{ background: "var(--surface)", borderColor: "var(--border)", color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l8 8M12 4l-8 8" /></svg>
          </button>
        </div>
        <a href="#how-it-works" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileScrollTo("how-it-works"); }}>
          <span style={{ color: "var(--green)", marginRight: 10, fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>01</span> How It Works
        </a>
        <a href="#features" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileScrollTo("features"); }}>
          <span style={{ color: "var(--cyan)", marginRight: 10, fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>02</span> Features
        </a>
        <a href="#pricing" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileScrollTo("pricing"); }}>
          <span style={{ color: "var(--purple)", marginRight: 10, fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>03</span> Pricing
        </a>
        <a href="#faq" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileScrollTo("faq"); }}>
          <span style={{ color: "var(--green)", marginRight: 10, fontFamily: "Space Mono, monospace", fontSize: "0.7rem" }}>04</span> FAQ
        </a>
        <div style={{ borderTop: "1px solid var(--border)", margin: "8px 0" }} />
        <a href="/about" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileNavigate("/about"); }}>About</a>
        <a href="/contact" className="mobile-menu-link" onClick={(e) => { e.preventDefault(); mobileNavigate("/contact"); }}>Contact</a>
        <div className="mt-auto p-6 border-t" style={{ borderColor: "var(--border)" }}>
          <button
            className="btn-shine w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-[Orbitron,sans-serif] text-[0.75rem] font-bold tracking-[1.5px] cursor-pointer border-none"
            style={{ background: "linear-gradient(135deg,var(--green),#00cc66)", color: "#000", boxShadow: "0 0 25px rgba(0,255,136,0.3)" }}
            type="button"
            onClick={() => { setMobileMenuOpen(false); go(isAuthenticated ? "/dashboard" : "/login"); }}
          >
            {isAuthenticated ? "OPEN DASHBOARD" : "GET STARTED FREE"}
          </button>
        </div>
      </div>

{/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HERO
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center pt-[120px] pb-20 px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-[18px] py-1.5 bg-[rgba(0,255,136,0.08)] border border-[rgba(0,255,136,0.15)] rounded-[30px] font-[Space_Mono,monospace] text-[0.68rem] text-[var(--green)] tracking-[2px] mb-8" style={{ animation: "fadeInUp 0.8s ease both" }}>
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--green)]" style={{ animation: "blink 1.5s infinite" }} />
          BETA LIVE â€” BUILDING THE FUTURE
        </div>

        {/* Alien mascot */}
        <div className="relative mb-10" style={{ animation: "fadeInUp 0.8s ease 0s both" }}>
          <svg id="alienSvg" width="200" height="200" viewBox="0 0 200 200" style={{ filter: "drop-shadow(0 0 25px rgba(0,255,136,0.5))" }}>
            <defs>
              <filter id="alienGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
              <linearGradient id="alienBody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#00ff88" /><stop offset="50%" stopColor="#00dd77" /><stop offset="100%" stopColor="#00aa55" /></linearGradient>
              <linearGradient id="alienBodyDark" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#00cc66" /><stop offset="100%" stopColor="#008844" /></linearGradient>
              <radialGradient id="alienEye" cx="30%" cy="30%" r="70%"><stop offset="0%" stopColor="#ffffff" /><stop offset="30%" stopColor="#00ffff" /><stop offset="100%" stopColor="#0088aa" /></radialGradient>
              <radialGradient id="alienShine" cx="30%" cy="20%" r="60%"><stop offset="0%" stopColor="#88ffcc" stopOpacity="0.6" /><stop offset="100%" stopColor="#00ff88" stopOpacity="0" /></radialGradient>
            </defs>
            <ellipse cx="103" cy="148" rx="45" ry="18" fill="#000" opacity="0.3" />
            <g filter="url(#alienGlow)">
              <path d="M70 110 Q60 140 70 165 Q85 180 100 180 Q115 180 130 165 Q140 140 130 110" fill="url(#alienBodyDark)" />
              <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#alienBody)" />
              <ellipse cx="100" cy="75" rx="55" ry="50" fill="url(#alienShine)" />
              <path d="M60 55 Q100 45 140 55" stroke="#00aa55" strokeWidth="1" fill="none" opacity="0.5" />
              <path d="M55 70 Q100 60 145 70" stroke="#00aa55" strokeWidth="1" fill="none" opacity="0.3" />
            </g>
            <g opacity="0.5"><path d="M78 48 L122 48 L85 70 L122 70" stroke="#003322" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" /></g>
            <ellipse cx="70" cy="85" rx="22" ry="18" fill="#002815" />
            <ellipse cx="130" cy="85" rx="22" ry="18" fill="#002815" />
            <ellipse id="eyeL" cx="70" cy="85" rx="18" ry="14" fill="url(#alienEye)" />
            <ellipse id="eyeR" cx="130" cy="85" rx="18" ry="14" fill="url(#alienEye)" />
            <g id="pupilGroup">
              <ellipse cx="72" cy="85" rx="7" ry="9" fill="#001a1a" /><ellipse cx="68" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9" /><ellipse cx="75" cy="88" rx="2" ry="1.5" fill="#fff" opacity="0.5" />
              <ellipse cx="132" cy="85" rx="7" ry="9" fill="#001a1a" /><ellipse cx="128" cy="81" rx="4" ry="3" fill="#fff" opacity="0.9" /><ellipse cx="135" cy="88" rx="2" ry="1.5" fill="#fff" opacity="0.5" />
            </g>
            <path d="M100 25 Q100 15 100 10" stroke="#00dd77" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="8" r="5" fill="#00ffff"><animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.7;1;0.7" dur="2s" repeatCount="indefinite" /></circle>
            <circle cx="100" cy="8" r="3" fill="#fff" opacity="0.6" />
            <path d="M55 45 Q45 35 40 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round" /><circle cx="38" cy="28" r="3" fill="#00ffaa"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" /></circle>
            <path d="M145 45 Q155 35 160 30" stroke="#00cc66" strokeWidth="2" fill="none" strokeLinecap="round" /><circle cx="162" cy="28" r="3" fill="#00ffaa"><animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" begin="0.5s" /></circle>
            <path id="mouth" d="M85 118 Q100 130 115 118" stroke="#003322" strokeWidth="3" fill="none" strokeLinecap="round" />
            <ellipse id="blushL" cx="55" cy="100" rx="8" ry="5" fill="#ff8888" opacity="0" />
            <ellipse id="blushR" cx="145" cy="100" rx="8" ry="5" fill="#ff8888" opacity="0" />
            <path d="M75 145 L100 160 L125 145" stroke="#004433" strokeWidth="2" fill="none" strokeLinecap="round" />
            <g id="wavingHand" style={{ transformOrigin: "55px 135px", animation: "wave 2s ease-in-out infinite" }}>
              <ellipse cx="55" cy="140" rx="8" ry="6" fill="#00dd77" /><circle cx="50" cy="138" r="3" fill="#00cc66" /><circle cx="53" cy="134" r="2.5" fill="#00cc66" /><circle cx="57" cy="133" r="2.5" fill="#00cc66" />
            </g>
            <g><ellipse cx="145" cy="140" rx="8" ry="6" fill="#00dd77" /><circle cx="150" cy="138" r="3" fill="#00cc66" /><circle cx="147" cy="134" r="2.5" fill="#00cc66" /><circle cx="143" cy="133" r="2.5" fill="#00cc66" /></g>
          </svg>
        </div>

        <h1 className="font-[Orbitron,sans-serif] text-[clamp(2.6rem,6vw,4.5rem)] font-extrabold leading-[1.12] mb-6" style={{ color: "var(--text-primary)", animation: "fadeInUp 0.8s ease 0.15s both" }}>
          NO HYPE.<br /><span className="gradient">REAL CODE.</span>
        </h1>

        <p className="text-[1.18rem] leading-[1.75] max-w-[600px] mx-auto mb-10" style={{ color: "var(--text-body)", animation: "fadeInUp 0.8s ease 0.3s both" }}>
          ZipLogic AI is an autonomous multi-agent system that plans, writes, and assembles full working applications from a single prompt. Real code. Instant preview. No setup required.
        </p>

        <div className="hero-actions flex gap-4 items-center justify-center flex-wrap mb-12" style={{ animation: "fadeInUp 0.8s ease 0.45s both" }}>
          <button
            className="btn-shine inline-flex items-center gap-2.5 px-9 py-4 rounded-[14px] border-none cursor-pointer font-[Orbitron,sans-serif] text-[0.85rem] font-bold tracking-[1.5px] transition-all hover:-translate-y-[3px] no-underline"
            style={{ background: "linear-gradient(135deg,var(--green),#00cc66)", color: "#000", boxShadow: "0 0 35px rgba(0,255,136,0.3),0 4px 20px rgba(0,0,0,0.3)" }}
            type="button"
            onClick={() => go(isAuthenticated ? "/dashboard" : "/login")}
          >
            START BUILDING FREE
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 8h10M9 4l4 4-4 4" /></svg>
          </button>
          <button
            className="inline-flex items-center gap-2.5 px-7 py-4 rounded-[14px] cursor-pointer text-[0.95rem] font-semibold transition-all hover:-translate-y-0.5 no-underline border"
            style={{ background: "var(--surface)", color: "var(--text-primary)", borderColor: "var(--border)" }}
            type="button"
            onClick={() => scrollToId("how-it-works")}
          >
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="9" r="8" /><path d="M7 6l5 3-5 3V6z" fill="currentColor" /></svg>
            See How It Works
          </button>
        </div>

        {/* Terminal */}
        <div className="w-full max-w-[750px]" style={{ animation: "fadeInUp 0.8s ease 0.6s both" }}>
          <div className="rounded-2xl overflow-hidden backdrop-blur-[20px] border border-white/[0.08]" style={{ background: "var(--terminal-bg)", boxShadow: "0 25px 80px rgba(0,0,0,0.5),0 0 60px rgba(0,255,136,0.06)", animation: "float 7s ease-in-out infinite", animationDelay: "-2s" }}>
            <div className="flex items-center gap-2 px-5 py-3.5 bg-white/[0.03] border-b border-white/[0.06]">
              <div className="w-[11px] h-[11px] rounded-full bg-[#ff5f57]" />
              <div className="w-[11px] h-[11px] rounded-full bg-[#febc2e]" />
              <div className="w-[11px] h-[11px] rounded-full bg-[#28c840]" />
              <div className="flex-1 text-center font-[Space_Mono,monospace] text-[0.7rem] text-white/30">ziplogic_agent_v1.exe</div>
              <div className="w-[50px]" />
            </div>
            <div className="terminal-body grid grid-cols-2 min-h-[280px]">
              <div className="terminal-left p-[22px_24px] border-r border-white/[0.06] font-[Space_Mono,monospace] text-[0.75rem] leading-8">
                <div className="tl"><span className="text-white/[0.35]">$</span> <span className="text-[#00ff88]">ziplogic</span> <span className="text-white/85">generate</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-[#00ddff]">Analyzing requirements...</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-white/85">Planning architecture</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-[#00ff88]">âœ“</span> <span className="text-white/85">React frontend scaffolded</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-[#00ff88]">âœ“</span> <span className="text-white/85">API routes generated</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-[#00ff88]">âœ“</span> <span className="text-white/85">Database models created</span></div>
                <div className="tl"><span className="text-white/[0.35]">â€º</span> <span className="text-[#00ff88]">âœ“ Build complete</span> <span className="text-white/[0.35]">â€” 47s</span><span className="cursor-b"></span></div>
              </div>
              <div className="p-[22px_24px] font-[Space_Mono,monospace] text-[0.75rem]">
                <div className="text-[0.65rem] text-white/[0.35] tracking-[2px] mb-3.5">AGENT_NETWORK</div>
                <div className="right-item flex items-center gap-2.5 py-1.5 text-white/70"><span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" /><span className="text-white/85">Created project structure</span></div>
                <div className="right-item flex items-center gap-2.5 py-1.5 text-white/70"><span className="w-2 h-2 rounded-full bg-[#00ddff] shadow-[0_0_8px_#00ddff]" /><span className="text-white/85">Starting container with deps</span></div>
                <div className="right-item flex items-center gap-2.5 py-1.5 text-white/70"><span className="w-2 h-2 rounded-full bg-[#00ff88] shadow-[0_0_8px_#00ff88]" /><span className="text-white/85">Full build validated</span></div>
                <div className="right-item flex items-center gap-2.5 py-1.5 text-white/70"><span className="w-2 h-2 rounded-full bg-[#8844ff] shadow-[0_0_8px_#8844ff]" /><span className="text-white/85">Deploy-ready application</span></div>
                <div className="right-item flex items-center gap-2.5 py-1.5 text-white/70 mt-4" style={{ animationDelay: "7.2s" }}>
                  <span className="text-white/[0.35] text-[0.68rem]">INFO: Deploy to production â€” npm run build.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hero stats */}
        <div className="flex flex-wrap gap-6 sm:gap-12 justify-center mt-12 pt-8 border-t border-[var(--border)]" style={{ animation: "fadeInUp 0.8s ease 0.75s both" }}>
          {[
            { num: "~60s", label: "AVG BUILD TIME" },
            { num: "FULL-STACK", label: "FRONTEND + BACKEND" },
            { num: "LIVE", label: "REAL-TIME STREAMING" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-[Orbitron,sans-serif] text-[1.3rem] font-bold gradient-gc">{s.num}</div>
              <div className="text-[0.75rem] text-[var(--text-muted)] mt-1 tracking-[1px]">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          HOW IT WORKS
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="how-it-works" className="relative z-10 py-[120px] px-8">
        <div className="text-center">
          <div className="font-[Space_Mono,monospace] text-[0.7rem] text-[var(--green)] tracking-[3px] mb-3 opacity-80 reveal">// EXECUTION_PIPELINE</div>
          <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold mb-4 text-[var(--text-primary)] reveal">MULTI-AGENT <span className="gradient">PIPELINE</span></h2>
          <p className="text-[var(--text-body)] text-[1.05rem] max-w-[560px] mx-auto leading-[1.7] reveal">Three specialized agents, one autonomous workflow. Describe it. We build it.</p>
        </div>

        <div className="pipeline-grid max-w-[1100px] mx-auto mt-16 grid grid-cols-3 gap-8 relative">
          <div className="pipeline-line absolute top-[55px] left-[16%] right-[16%] h-[2px]" style={{ background: "linear-gradient(90deg,transparent,var(--green),var(--cyan),var(--purple),transparent)", opacity: 0.2 }} />
          {[
            { n: "01", cls: "n1", title: "PLANNER", desc: "Analyzes your prompt. Maps requirements to architecture, decides tech stack, and produces a structured build plan â€” before a single line of code is written.", bg: "rgba(0,255,136,0.1)", color: "var(--green)", border: "rgba(0,255,136,0.2)" },
            { n: "02", cls: "n2", title: "DEVELOPER", desc: "Generates production-grade code file by file â€” frontend, backend, database schemas, auth, and API routes. Streamed to you in real time via WebSocket.", bg: "rgba(0,221,255,0.1)", color: "var(--cyan)", border: "rgba(0,221,255,0.2)" },
            { n: "03", cls: "n3", title: "EXECUTOR", desc: "Spins up a Docker container, installs dependencies, runs your project, and gives you a live preview link. Fully reproducible. Every time.", bg: "rgba(136,68,255,0.1)", color: "var(--purple)", border: "rgba(136,68,255,0.2)" },
          ].map((c, i) => (
            <div key={c.n} className={`text-center p-12 px-8 rounded-[20px] transition-all duration-400 hover:-translate-y-2 hover:shadow-[0_25px_70px_var(--card-shadow)] border reveal reveal-d${i + 1}`} style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-[52px] h-[52px] mx-auto mb-6 rounded-2xl flex items-center justify-center font-[Orbitron,sans-serif] font-extrabold text-[1.15rem] border" style={{ background: c.bg, color: c.color, borderColor: c.border }}>{c.n}</div>
              <h3 className="font-[Orbitron,sans-serif] text-[0.95rem] font-semibold mb-3 tracking-[1px] text-[var(--text-primary)]">{c.title}</h3>
              <p className="text-[var(--text-body)] text-[0.92rem] leading-[1.65]">{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FEATURES
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="features" className="relative z-10 py-[120px] px-8">
        <div className="text-center">
          <div className="font-[Space_Mono,monospace] text-[0.7rem] text-[var(--green)] tracking-[3px] mb-3 opacity-80 reveal">// SYSTEM_CAPABILITIES</div>
          <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold mb-4 text-[var(--text-primary)] reveal">WHAT <span className="gradient">ZIPLOGIC AI</span> DOES</h2>
          <p className="text-[var(--text-body)] text-[1.05rem] max-w-[560px] mx-auto leading-[1.7] reveal">Autonomous development that delivers real, working software.</p>
        </div>

        <div className="features-grid max-w-[1100px] mx-auto mt-16 grid grid-cols-2 gap-6">
          {[
            { icon: "âš¡", title: "FULL APPLICATION GENERATION", desc: "From a single prompt to a complete working application â€” frontend views, backend logic, database, and authentication. Not scaffolding. Real code." },
            { icon: "ðŸ“¡", title: "REAL-TIME STREAMING", desc: "Watch your application being built live. Every file streams via WebSocket â€” you see exactly what's being generated, as it happens." },
            { icon: "ðŸ§ ", title: "MULTI-AGENT ARCHITECTURE", desc: "Three specialized AI agents collaborate: the Planner architects, the Developer codes, the Executor runs. Each optimized for its job." },
            { icon: "ðŸ³", title: "INSTANT DOCKER PREVIEW", desc: "Every project runs in an isolated Docker container. See your working app within seconds. No local setup required." },
            { icon: "ðŸŽ¯", title: "SMART TEMPLATES + CUSTOM CODE", desc: "Uses proven templates when they fit, generates fully custom code when needed. Best of both worlds â€” speed and flexibility." },
            { icon: "ðŸ”„", title: "DETERMINISTIC & REPRODUCIBLE", desc: "Same prompt, same output. Fully testable, auditable, version-controlled. Ship with confidence." },
          ].map((f, i) => (
            <div key={f.title} className={`feat-card p-10 rounded-[20px] transition-all duration-400 relative overflow-hidden hover:-translate-y-1 hover:shadow-[0_15px_50px_var(--card-shadow)] border reveal ${i % 2 === 0 ? "reveal-d1" : "reveal-d2"}`} style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="w-12 h-12 mb-5 rounded-[14px] flex items-center justify-center text-[1.3rem] border border-[rgba(0,255,136,0.12)]" style={{ background: "linear-gradient(135deg,rgba(0,255,136,0.1),rgba(0,255,136,0.02))" }}>{f.icon}</div>
              <h3 className="font-[Orbitron,sans-serif] text-[0.9rem] font-semibold mb-3 tracking-[0.5px] text-[var(--text-primary)]">{f.title}</h3>
              <p className="text-[var(--text-body)] text-[0.9rem] leading-[1.65]">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          AUDIENCE
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-[120px] px-8">
        <div className="text-center">
          <div className="font-[Space_Mono,monospace] text-[0.7rem] text-[var(--green)] tracking-[3px] mb-3 opacity-80 reveal">// TARGET_OPERATORS</div>
          <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold mb-4 text-[var(--text-primary)] reveal">BUILT FOR <span className="gradient">BUILDERS</span></h2>
          <p className="text-[var(--text-body)] text-[1.05rem] max-w-[560px] mx-auto leading-[1.7] reveal">If you ship software, this is for you.</p>
        </div>

        <div className="audience-grid max-w-[1100px] mx-auto mt-16 grid grid-cols-3 gap-6">
          {[
            { emoji: "ðŸ¢", title: "AGENCIES", items: ["Ship client projects faster", "Consistent code quality across projects", "Turn your process into repeatable workflows"] },
            { emoji: "ðŸš€", title: "STARTUPS", items: ["MVP in days, not weeks", "Production quality from day one", "Iterate fast without breaking things"] },
            { emoji: "ðŸ’»", title: "DEVELOPERS", items: ["Eliminate boilerplate forever", "Stay in the zone â€” focus on logic", "Reproducible, sharable starting points"] },
          ].map((c, i) => (
            <div key={c.title} className={`p-12 px-8 rounded-[20px] text-center transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_60px_var(--card-shadow)] border reveal reveal-d${i + 1}`} style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <span className="text-[2.5rem] mb-5 block">{c.emoji}</span>
              <h3 className="font-[Orbitron,sans-serif] text-[0.9rem] font-semibold mb-4 tracking-[1px] text-[var(--text-primary)]">{c.title}</h3>
              <ul className="list-none p-0 text-left">
                {c.items.map((item) => (
                  <li key={item} className="py-1.5 text-[var(--text-body)] text-[0.9rem] flex items-start gap-2.5">
                    <span className="text-[var(--green)] font-semibold shrink-0">â†’</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

     {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
    PRICING
   â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
<section id="pricing" className="relative z-10 py-[120px] px-8">
  <div className="text-center">
    <div className="font-[Space_Mono,monospace] text-[0.7rem] text-[var(--green)] tracking-[3px] mb-3 opacity-80 reveal">// PRICING_MATRIX</div>
    <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold mb-4 text-[var(--text-primary)] reveal">SIMPLE, <span className="gradient">TRANSPARENT</span> PRICING</h2>
    <p className="text-[var(--text-body)] text-[1.05rem] max-w-[560px] mx-auto leading-[1.7] reveal">Start free, upgrade when you need more. No hidden fees.</p>
  </div>

   <div className="pricing-grid max-w-[1200px] mx-auto mt-16 grid grid-cols-4 gap-5">
     {(() => {
       console.log('[Landing RENDER] plansLoading:', plansLoading, 'plans.length:', plans?.length, 'plans:', plans);
       return null;
     })()}
     {plansLoading ? (
       <div className="col-span-full text-center py-20">
         <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--green)]"></div>
         <p className="mt-4 font-[Space_Mono,monospace] text-[var(--green)]">Loading plans...</p>
       </div>
     ) : plans.length === 0 ? (
       <div className="col-span-full text-center py-20 text-[var(--text-muted)]">
         No plans available at the moment.
       </div>
     ) : (
       plans.map((plan, index) => {
        const isPopular = plan.is_popular;
        const isFree = plan.price_monthly === 0;
        const delayClass = index === 0 ? 'reveal-d1' : index === 1 ? 'reveal-d2' : index === 2 ? 'reveal-d3' : 'reveal-d1';
        
        return (
          <div 
            key={plan.id} 
            className={`p-[2.2rem_1.8rem] rounded-[20px] transition-all duration-400 relative flex flex-col hover:-translate-y-1.5 hover:shadow-[0_20px_60px_var(--card-shadow)] border reveal ${delayClass} ${isPopular ? 'price-pop scale-[1.03]' : ''}`}
            style={{ 
              background: isPopular ? "rgba(0,255,136,0.03)" : "var(--surface)", 
              borderColor: isPopular ? "rgba(0,255,136,0.3)" : "var(--border)",
              boxShadow: isPopular ? "0 0 60px rgba(0,255,136,0.06)" : undefined
            }}
          >
            <div className="font-[Space_Mono,monospace] text-[0.65rem] text-[var(--text-muted)] tracking-[3px] mb-3">{plan.name.toUpperCase()}</div>
            <div className={`font-[Orbitron,sans-serif] text-[2.2rem] font-extrabold mb-0.5 ${isPopular ? 'gradient-gc' : 'text-[var(--text-primary)]'}`}>
              ${isFree ? '0' : plan.price_monthly}
            </div>
            <div className="text-[var(--text-muted)] text-[0.82rem] mb-2.5">{isFree ? 'forever' : 'per month'}</div>
            <div className="text-[var(--text-body)] text-[0.88rem] mb-6 leading-[1.4]">{plan.description}</div>
            <ul className="list-none p-0 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="py-1.5 text-[var(--text-body)] text-[0.84rem] flex items-center gap-2">
                  <span className="text-[var(--green)] font-bold shrink-0">âœ“</span>{feature}
                </li>
              ))}
            </ul>
            {isFree ? (
              <button 
                className="w-full py-3.5 rounded-xl font-[Orbitron,sans-serif] text-[0.72rem] font-bold tracking-[1px] transition-all cursor-default opacity-70 border" 
                style={{ background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border)" }} 
                type="button"
              >
                CURRENT PLAN
              </button>
            ) : (
              <button
                className="w-full py-3.5 rounded-xl font-[Orbitron,sans-serif] text-[0.72rem] font-bold tracking-[1px] transition-all cursor-pointer border-none hover:shadow-[0_0_45px_rgba(0,255,136,0.4)] hover:-translate-y-0.5 disabled:opacity-75 disabled:cursor-not-allowed"
                style={{ background: "linear-gradient(135deg,var(--green),#00cc66)", color: "#000", boxShadow: "0 0 20px rgba(0,255,136,0.2)" }}
                type="button"
                disabled={payLoading.plan === plan.slug}
                onClick={() => startCheckout(plan.id, plan.slug)}
              >
                {payLoading.plan === plan.slug ? "REDIRECTINGâ€¦" : "UPGRADE NOW"}
              </button>
            )}
          </div>
        );
      })
    )}
  </div>

  {payLoading.error && (
    <p className="text-center mt-4 text-[var(--text-body)] text-[0.92rem]">
      <span className="text-[var(--cyan)] font-[Space_Mono,monospace]">PAYMENTS_ERROR:</span> {payLoading.error}
    </p>
  )}

  <p className="text-center mt-10 text-[var(--text-body)] text-[0.92rem] reveal">
    All plans include unlimited downloads and project exports. Questions?{" "}
    <a href="#" className="text-[var(--green)] no-underline font-semibold hover:opacity-80 transition-opacity" onClick={(e) => e.preventDefault()}>Contact us</a>
  </p>
</section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FAQ
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section id="faq" className="relative z-10 py-[120px] px-8">
        <div className="text-center">
          <div className="font-[Space_Mono,monospace] text-[0.7rem] text-[var(--green)] tracking-[3px] mb-3 opacity-80 reveal">// COMMON_QUESTIONS</div>
          <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.8rem,3.5vw,2.8rem)] font-bold mb-4 text-[var(--text-primary)] reveal"><span className="gradient">FAQ</span></h2>
        </div>
        <div className="max-w-[720px] mx-auto mt-12">
          <FaqItem q="What is ZipLogic AI?" a="ZipLogic AI is an autonomous multi-agent system that generates complete, production-ready web applications from natural language descriptions. It plans, writes code, and runs everything in Docker â€” in about 60 seconds." />
          <FaqItem q="What kind of apps can it build?" a="Full-stack web applications including dashboards, CRUD apps, SaaS tools, landing pages, admin panels, and more. Generates React frontends, Node.js or Django backends, database models, and authentication." />
          <FaqItem q="Do I own the generated code?" a="Yes, 100%. Every line of code is yours to use, modify, and deploy commercially. Download it, push it to your repo, deploy it anywhere." />
          <FaqItem q="How is this different from other AI coding tools?" a="Most AI tools help you write individual files or answer questions. ZipLogic builds entire applications end-to-end â€” a multi-agent pipeline handling architecture, generation, and execution as one autonomous workflow." />
          <FaqItem q="Is the beta free to try?" a="Yes. The free tier gives you 5 builds per month. No credit card required." />
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          CTA
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <section className="relative z-10 py-[120px] px-8">
        <div className="cta-box max-w-[720px] mx-auto p-[4.5rem_3rem] rounded-[28px] text-center relative overflow-hidden border border-[rgba(0,255,136,0.12)] reveal" style={{ background: "linear-gradient(135deg,rgba(0,255,136,0.05),rgba(0,221,255,0.03),rgba(136,68,255,0.03))" }}>
          <h2 className="font-[Orbitron,sans-serif] text-[clamp(1.5rem,3vw,2.2rem)] font-bold mb-4 text-[var(--text-primary)]">READY TO <span className="gradient">BUILD</span>?</h2>
          <p className="text-[var(--text-body)] text-[1.05rem] mb-8 leading-[1.6]">Stop writing boilerplate. Describe what you want and let the agents handle the rest.</p>
          <button
            className="btn-shine inline-flex items-center gap-2.5 px-10 py-4 rounded-[14px] border-none cursor-pointer font-[Orbitron,sans-serif] text-[0.88rem] font-bold tracking-[1.5px] transition-all hover:-translate-y-[3px]"
            style={{ background: "linear-gradient(135deg,var(--green),#00cc66)", color: "#000", boxShadow: "0 0 35px rgba(0,255,136,0.3),0 4px 20px rgba(0,0,0,0.3)" }}
            type="button"
            onClick={() => go(isAuthenticated ? "/dashboard" : "/login")}
          >
            OPEN ZIPLOGIC AI
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 9h12M10 4l5 5-5 5" /></svg>
          </button>
        </div>
      </section>

      {/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
          FOOTER
         â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <footer className="relative z-10 px-8 pt-[60px] pb-[30px] border-t border-[var(--border)]">
        <div className="footer-cols max-w-[1100px] mx-auto flex justify-between items-start flex-wrap gap-12">
          <div>
            <a
              href="#"
              className="flex items-center gap-2.5 font-[Orbitron,sans-serif] font-bold text-[1.05rem] no-underline mb-2"
              style={{ color: "var(--text-primary)" }}
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            >
<img src={ziplogicLogo} alt="ZipLogic AI" width="60" height="28" className="rounded-[8px]" />              
ZipLogic AI
            </a>
            <p className="text-[var(--footer-text)] text-[0.88rem] mt-2.5 max-w-[280px] leading-[1.6]">Autonomous software engineering. Turn your ideas into complete, deployable web applications.</p>
          </div>

          <div>
  <h4 className="font-[Orbitron,sans-serif] text-[0.72rem] font-semibold tracking-[2px] mb-4 text-[var(--text-secondary)]">PRODUCT</h4>
  <a href="#features" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("features"); }}>Features</a>
  <a href="#pricing" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("pricing"); }}>Pricing</a>
  <a href="#faq" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); scrollToId("faq"); }}>FAQ</a>
  <a href="/dashboard" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => { e.preventDefault(); navigate(isAuthenticated ? "/dashboard" : "/login"); }}>Dashboard</a>
</div>

<div>
  <h4 className="font-[Orbitron,sans-serif] text-[0.72rem] font-semibold tracking-[2px] mb-4 text-[var(--text-secondary)]">COMPANY</h4>
  <a href="/about" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => handleNavigation(e, "/about")}>About</a>
  <a href="/contact" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => handleNavigation(e, "/contact")}>Contact</a>
  <a href="/privacy" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => handleNavigation(e, "/privacy")}>Privacy</a>
  <a href="/terms" className="block text-[var(--footer-link)] no-underline text-[0.9rem] mb-3 transition-colors hover:text-[var(--green)]" onClick={(e) => handleNavigation(e, "/terms")}>Terms</a>
</div>
        </div>

        <div className="footer-bottom max-w-[1100px] mx-auto mt-12 pt-8 border-t border-[var(--border)] flex justify-between text-[var(--footer-muted)] text-[0.8rem]">
          <span>&copy; 2026 ZipLogic AI. All rights reserved.</span>
          <span>
            Designed by{" "}
            <a href="#" className="text-[var(--green)] no-underline font-semibold" onClick={(e) => e.preventDefault()}>Pascat Graphics &amp; Marketing Company</a>
          </span>
        </div>
      </footer>
    </>
  );
}