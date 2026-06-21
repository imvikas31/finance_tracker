import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Animated canvas background ─────────────────────────────────────────────
function MarketCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const lines = Array.from({ length: 3 }, (_, li) => ({
      points: Array.from({ length: 120 }, (_, i) => ({
        x: (i / 119) * canvas.width,
        y: canvas.height * (0.35 + li * 0.18) + Math.sin(i * (0.3 + li * 0.1)) * (30 + li * 12),
      })),
      color: ['rgba(99,102,241,0.5)', 'rgba(139,92,246,0.3)', 'rgba(245,158,11,0.2)'][li],
      fill: ['rgba(99,102,241,0.06)', 'rgba(139,92,246,0.04)', 'rgba(245,158,11,0.03)'][li],
      speed: 0.004 + li * 0.002,
    }));

    const particles = Array.from({ length: 55 }, () => ({
      x: Math.random() * 1200, y: Math.random() * 800,
      r: Math.random() * 1.8 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.5 + 0.1,
      color: Math.random() > 0.6 ? '139,92,246' : '99,102,241',
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      lines.forEach((line) => {
        const pts = line.points.map((p, i) => ({
          x: p.x,
          y: p.y + Math.sin((t * line.speed) + i * 0.18) * 22
            + Math.sin((t * line.speed * 0.6) + i * 0.08) * 14,
        }));

        // Fill
        ctx.beginPath();
        ctx.moveTo(pts[0].x, canvas.height);
        ctx.lineTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const cx = (pts[i].x + pts[i + 1].x) / 2;
          const cy = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, cx, cy);
        }
        ctx.lineTo(pts[pts.length - 1].x, canvas.height);
        ctx.closePath();
        ctx.fillStyle = line.fill;
        ctx.fill();

        // Stroke
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length - 1; i++) {
          const cx = (pts[i].x + pts[i + 1].x) / 2;
          const cy = (pts[i].y + pts[i + 1].y) / 2;
          ctx.quadraticCurveTo(pts[i].x, pts[i].y, cx, cy);
        }
        ctx.strokeStyle = line.color;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // Particles
      particles.forEach((p) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });

      // Grid lines (subtle)
      ctx.strokeStyle = 'rgba(99,102,241,0.04)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

// ── Animated stat ticker ───────────────────────────────────────────────────
function StatTicker() {
  const stats = [
    { label: 'Avg. savings rate', value: '34%', icon: '📈', up: true },
    { label: 'Transactions tracked', value: '2.4M+', icon: '⚡', up: true },
    { label: 'Active users', value: '12,000', icon: '👥', up: true },
    { label: 'Money managed', value: '₹840Cr', icon: '💰', up: true },
  ];
  const [idx, setIdx] = useState(0);
  const [animIn, setAnimIn] = useState(true);

  useEffect(() => {
    const id = setInterval(() => {
      setAnimIn(false);
      setTimeout(() => { setIdx((i) => (i + 1) % stats.length); setAnimIn(true); }, 350);
    }, 2800);
    return () => clearInterval(id);
  }, []);

  const s = stats[idx];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 99, padding: '6px 16px 6px 8px',
      marginBottom: 28,
      width: 'fit-content',
    }}>
      <span style={{
        background: 'rgba(99,102,241,0.2)', borderRadius: 99,
        padding: '2px 8px', fontSize: 11, color: '#a5b4fc', fontWeight: 700,
      }}>LIVE</span>
      <span style={{
        fontSize: 13, color: '#fff',
        opacity: animIn ? 1 : 0,
        transform: animIn ? 'translateY(0)' : 'translateY(6px)',
        transition: 'all 0.35s ease',
        display: 'inline-block',
      }}>
        <span style={{ color: '#34d399', fontWeight: 700 }}>{s.value}</span>
        <span style={{ color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>{s.label}</span>
      </span>
    </div>
  );
}

// ── Floating mini card ─────────────────────────────────────────────────────
function FloatingCard({ style, children }) {
  return (
    <div style={{
      background: 'rgba(15,15,40,0.85)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      backdropFilter: 'blur(20px)',
      padding: '12px 16px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────
const Login = () => {
  // ── Your original logic — untouched ──
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.');
    } finally {
      setLoading(false);
    }
  };
  // ── End original logic ──

  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #04041a 0%, #080820 45%, #0c0828 75%, #08041a 100%)',
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatY { 0%,100% { transform: translateY(0px) rotate(-2deg); } 50% { transform: translateY(-12px) rotate(-2deg); } }
        @keyframes floatY2 { 0%,100% { transform: translateY(0px) rotate(2deg); } 50% { transform: translateY(-8px) rotate(2deg); } }
        @keyframes glow-pulse { 0%,100% { opacity: 0.5; } 50% { opacity: 1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        ::placeholder { color: rgba(255,255,255,0.18) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(99,102,241,0.08) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
      `}</style>

      {/* Canvas BG */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MarketCanvas />
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)', borderRadius: '50%', animation: 'glow-pulse 5s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-15%', right: '30%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.10) 0%, transparent 65%)', borderRadius: '50%', animation: 'glow-pulse 7s ease-in-out infinite 1s', pointerEvents: 'none' }} />

      {/* ── LEFT PANEL ── */}
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px 40px 60px 80px',
        position: 'relative',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(-30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17, boxShadow: '0 4px 20px rgba(99,102,241,0.5)',
          }}>💎</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif", letterSpacing: -0.5 }}>FinTrack</span>
        </div>

        {/* Live ticker */}
        <StatTicker />

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(2.2rem, 3.5vw, 3.2rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          marginBottom: 18,
          color: '#fff',
        }}>
          Take control of<br />
          <span style={{
            background: 'linear-gradient(135deg, #a5b4fc 0%, #8b5cf6 40%, #f59e0b 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 4s linear infinite',
          }}>your finances.</span>
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.38)',
          fontSize: 15,
          lineHeight: 1.75,
          maxWidth: 380,
          marginBottom: 48,
        }}>
          See every rupee clearly. Track spending, grow savings, and make smarter money decisions — starting today.
        </p>

        {/* Feature list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 56 }}>
          {[
            { icon: '📊', title: 'Real-time analytics', desc: 'Visual dashboards updated instantly' },
            { icon: '🔒', title: 'Bank-grade security', desc: '256-bit encryption on all your data' },
            { icon: '🎯', title: 'Smart budget goals', desc: 'Set targets and get alerts when near limits' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateX(-20px)',
              transition: `all 0.6s ease ${0.3 + i * 0.1}s`,
            }}>
              <div style={{
                width: 40, height: 40, flexShrink: 0,
                background: 'rgba(99,102,241,0.12)',
                border: '1px solid rgba(99,102,241,0.2)',
                borderRadius: 12,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 18,
              }}>{f.icon}</div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 600, marginBottom: 1 }}>{f.title}</p>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Social proof */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex' }}>
            {['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'].map((c, i) => (
              <div key={i} style={{
                width: 30, height: 30, borderRadius: '50%',
                background: `linear-gradient(135deg, ${c}, ${c}99)`,
                border: '2px solid #04041a',
                marginLeft: i === 0 ? 0 : -8,
                zIndex: 4 - i, position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12,
              }}>
                {['😊', '🧑', '👩', '😎'][i]}
              </div>
            ))}
          </div>
          <div>
            <div style={{ display: 'flex', gap: 1, marginBottom: 2 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 11 }}>{s}</span>)}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Loved by 12,000+ users</p>
          </div>
        </div>

        {/* Floating cards */}
        <FloatingCard style={{
          position: 'absolute', bottom: '18%', left: '55%',
          animation: 'floatY 5s ease-in-out infinite',
          minWidth: 190,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', boxShadow: '0 0 8px #34d399' }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>This month</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20 }}>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 3 }}>Saved</p>
              <p style={{ color: '#34d399', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>₹24,500</p>
            </div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 3 }}>Spent</p>
              <p style={{ color: '#f87171', fontWeight: 700, fontFamily: 'monospace', fontSize: 15 }}>₹38,200</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard style={{
          position: 'absolute', top: '22%', right: '2%',
          animation: 'floatY2 6s ease-in-out infinite 0.8s',
          minWidth: 160,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 6 }}>Savings goal</p>
          <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
            <div style={{ height: '100%', width: '68%', background: 'linear-gradient(90deg, #6366f1, #a78bfa)', borderRadius: 99 }} />
          </div>
          <p style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 700 }}>68% of ₹1,00,000</p>
        </FloatingCard>
      </div>

      {/* ── RIGHT PANEL — Auth Form ── */}
      <div style={{
        width: '100%',
        maxWidth: 480,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px 40px 24px',
        position: 'relative',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(8,8,28,0.7)',
          border: '1px solid rgba(99,102,241,0.18)',
          borderRadius: 28,
          padding: 40,
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner glow */}
          <div style={{ position: 'absolute', top: -80, right: -80, width: 200, height: 200, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Form header */}
          <div style={{ marginBottom: 32, position: 'relative' }}>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              Welcome back
            </p>
            <h2 style={{
              color: '#fff',
              fontFamily: "'Sora', sans-serif",
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: -0.8,
              marginBottom: 6,
            }}>
              Sign in to FinTrack
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#a5b4fc', fontWeight: 600, textDecoration: 'none' }}>
                Sign up free →
              </Link>
            </p>
          </div>

          {/* ── Form — your original logic ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

            {/* Error message */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 12,
                padding: '12px 16px',
                animation: 'slideUp 0.3s ease',
              }}>
                <p style={{ color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}

            {/* Email field */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, marginBottom: 8, letterSpacing: 0.3 }}>
                Email address
              </label>
              <div style={{
                background: focusedField === 'email' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${focusedField === 'email' ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: focusedField === 'email' ? '0 0 0 4px rgba(99,102,241,0.12)' : 'none',
              }}>
                <span style={{ fontSize: 16, opacity: 0.5 }}>✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    color: '#fff', fontSize: 14, padding: '14px 0',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
                  Password
                </label>
                <button type="button" style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#a5b4fc', fontSize: 12, fontWeight: 600, padding: 0,
                  fontFamily: 'inherit',
                }}>
                  Forgot password?
                </button>
              </div>
              <div style={{
                background: focusedField === 'password' ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${focusedField === 'password' ? 'rgba(99,102,241,0.7)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 14,
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                transition: 'all 0.2s ease',
                boxShadow: focusedField === 'password' ? '0 0 0 4px rgba(99,102,241,0.12)' : 'none',
              }}>
                <span style={{ fontSize: 16, opacity: 0.5 }}>🔑</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  style={{
                    flex: 1, border: 'none', background: 'transparent',
                    color: '#fff', fontSize: 14, padding: '14px 0',
                    outline: 'none', fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'rgba(255,255,255,0.3)', padding: 0,
                    display: 'flex', alignItems: 'center',
                    transition: 'color 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px 0',
                marginTop: 4,
                background: loading
                  ? 'rgba(99,102,241,0.4)'
                  : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: 0.2,
                boxShadow: loading ? 'none' : '0 8px 32px rgba(99,102,241,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; if (!loading) e.currentTarget.style.boxShadow = '0 12px 40px rgba(99,102,241,0.6)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 32px rgba(99,102,241,0.45)'; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18,
                    border: '2.5px solid rgba(255,255,255,0.25)',
                    borderTopColor: '#fff',
                    borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Signing in...
                </>
              ) : (
                'Sign in to FinTrack →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          </div>

          {/* Google button */}
          <button
            type="button"
            style={{
              width: '100%',
              padding: '13px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.09)',
              borderRadius: 14,
              color: 'rgba(255,255,255,0.65)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.09)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Trust footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 }}>
            {['🔒 Encrypted', '🛡️ Secure', '✅ Trusted'].map((t) => (
              <span key={t} style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, fontWeight: 500 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
