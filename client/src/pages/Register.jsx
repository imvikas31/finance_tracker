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
        y: canvas.height * (0.3 + li * 0.2) + Math.sin(i * (0.25 + li * 0.08)) * (28 + li * 10),
      })),
      color: ['rgba(139,92,246,0.45)', 'rgba(99,102,241,0.28)', 'rgba(245,158,11,0.18)'][li],
      fill: ['rgba(139,92,246,0.06)', 'rgba(99,102,241,0.04)', 'rgba(245,158,11,0.02)'][li],
      speed: 0.003 + li * 0.0025,
    }));

    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 1200, y: Math.random() * 900,
      r: Math.random() * 1.6 + 0.3,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      alpha: Math.random() * 0.45 + 0.08,
      color: Math.random() > 0.5 ? '139,92,246' : '99,102,241',
    }));

    let t = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 1;

      lines.forEach((line) => {
        const pts = line.points.map((p, i) => ({
          x: p.x,
          y: p.y + Math.sin(t * line.speed + i * 0.2) * 24
            + Math.sin(t * line.speed * 0.55 + i * 0.09) * 13,
        }));
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

      // subtle grid
      ctx.strokeStyle = 'rgba(139,92,246,0.035)';
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

// ── Password strength meter ────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: '6+ characters', pass: password.length >= 6 },
    { label: 'Uppercase', pass: /[A-Z]/.test(password) },
    { label: 'Number', pass: /[0-9]/.test(password) },
    { label: 'Symbol', pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  if (!password) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            flex: 1, height: 3, borderRadius: 99,
            background: i <= score ? colors[score] : 'rgba(255,255,255,0.08)',
            transition: 'background 0.3s ease',
          }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {checks.map((c) => (
            <span key={c.label} style={{
              fontSize: 10, fontWeight: 500,
              color: c.pass ? '#34d399' : 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', gap: 3,
              transition: 'color 0.2s',
            }}>
              {c.pass ? '✓' : '○'} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: colors[score] }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Floating card ──────────────────────────────────────────────────────────
function FloatingCard({ style, children }) {
  return (
    <div style={{
      background: 'rgba(12,12,35,0.88)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      backdropFilter: 'blur(20px)',
      padding: '14px 18px',
      boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
      ...style,
    }}>
      {children}
    </div>
  );
}

// ── Step indicator ─────────────────────────────────────────────────────────
function StepDots({ total, current }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6,
          height: 6,
          borderRadius: 99,
          background: i === current
            ? 'linear-gradient(90deg, #6366f1, #8b5cf6)'
            : i < current
              ? 'rgba(99,102,241,0.5)'
              : 'rgba(255,255,255,0.1)',
          transition: 'all 0.3s ease',
        }} />
      ))}
    </div>
  );
}

// ── Main Register Page ─────────────────────────────────────────────────────
const Register = () => {
  // ── Your original logic — untouched ──
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', currency: 'INR' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));
  // ── End original logic ──

  const [mounted, setMounted] = useState(false);
  const [focusedField, setFocusedField] = useState('');

  // track which step visually (for the step dots UX feel)
  const filledCount = [form.name, form.email, form.password, form.currency !== 'INR' ? form.currency : ''].filter(Boolean).length;
  const currentStep = Math.min(filledCount, 3);

  useEffect(() => { setTimeout(() => setMounted(true), 80); }, []);

  const currencies = [
    { value: 'INR', label: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { value: 'USD', label: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { value: 'EUR', label: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
    { value: 'GBP', label: 'GBP', symbol: '£', name: 'British Pound', flag: '🇬🇧' },
  ];

  const inputStyle = (field) => ({
    background: focusedField === field ? 'rgba(139,92,246,0.08)' : 'rgba(255,255,255,0.04)',
    border: `1.5px solid ${focusedField === field ? 'rgba(139,92,246,0.7)' : 'rgba(255,255,255,0.08)'}`,
    borderRadius: 14,
    padding: '0 16px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    transition: 'all 0.2s ease',
    boxShadow: focusedField === field ? '0 0 0 4px rgba(139,92,246,0.12)' : 'none',
  });

  const inputElStyle = {
    flex: 1, border: 'none', background: 'transparent',
    color: '#fff', fontSize: 14, padding: '13px 0',
    outline: 'none', fontFamily: 'inherit',
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #04041a 0%, #080824 45%, #0e0830 75%, #060418 100%)',
      display: 'flex',
      fontFamily: "'Inter', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes floatA { 0%,100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-10px) rotate(-1deg); } }
        @keyframes floatB { 0%,100% { transform: translateY(0) rotate(2deg); } 50% { transform: translateY(-14px) rotate(2deg); } }
        @keyframes floatC { 0%,100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-8px) rotate(-2deg); } }
        @keyframes glow { 0%,100% { opacity:0.5; } 50% { opacity:1; } }
        @keyframes slideUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0% { background-position:-200% center; } 100% { background-position:200% center; } }
        @keyframes checkPop { 0% { transform:scale(0); } 70% { transform:scale(1.2); } 100% { transform:scale(1); } }
        ::placeholder { color: rgba(255,255,255,0.18) !important; }
        input:-webkit-autofill {
          -webkit-box-shadow: 0 0 0 100px rgba(139,92,246,0.08) inset !important;
          -webkit-text-fill-color: #fff !important;
        }
        select option { background: #0e0830; color: #fff; }
      `}</style>

      {/* Canvas */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <MarketCanvas />
      </div>

      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-5%', right: '25%', width: 550, height: 550, background: 'radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 65%)', borderRadius: '50%', animation: 'glow 6s ease-in-out infinite', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-10%', left: '10%', width: 450, height: 450, background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)', borderRadius: '50%', animation: 'glow 8s ease-in-out infinite 2s', pointerEvents: 'none' }} />

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 64 }}>
          <div style={{
            width: 38, height: 38,
            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            borderRadius: 11,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
            boxShadow: '0 4px 20px rgba(139,92,246,0.5)',
          }}>💎</div>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 18, fontFamily: "'Sora', sans-serif", letterSpacing: -0.5 }}>FinTrack</span>
        </div>

        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(139,92,246,0.1)',
          border: '1px solid rgba(139,92,246,0.25)',
          borderRadius: 99, padding: '5px 14px',
          marginBottom: 22, width: 'fit-content',
        }}>
          <span style={{ width: 6, height: 6, background: '#a78bfa', borderRadius: '50%', display: 'inline-block', boxShadow: '0 0 8px #a78bfa', animation: 'glow 2s infinite' }} />
          <span style={{ color: '#c4b5fd', fontSize: 12, fontWeight: 600 }}>Free forever — no credit card needed</span>
        </div>

        {/* Headline */}
        <h1 style={{
          fontFamily: "'Sora', sans-serif",
          fontSize: 'clamp(2rem, 3.2vw, 3rem)',
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -1.5,
          marginBottom: 18,
          color: '#fff',
        }}>
          Join 12,000 people<br />
          <span style={{
            background: 'linear-gradient(135deg, #c4b5fd 0%, #8b5cf6 40%, #f59e0b 100%)',
            backgroundSize: '200% auto',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            animation: 'shimmer 4s linear infinite',
          }}>spending smarter.</span>
        </h1>

        <p style={{
          color: 'rgba(255,255,255,0.38)',
          fontSize: 15,
          lineHeight: 1.75,
          maxWidth: 370,
          marginBottom: 44,
        }}>
          Set up in 60 seconds. Track income, expenses, and savings goals with beautiful real-time charts.
        </p>

        {/* What you get list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 52 }}>
          {[
            { icon: '✦', text: 'Unlimited transaction tracking' },
            { icon: '✦', text: 'Smart category auto-detection' },
            { icon: '✦', text: 'Monthly reports & analytics' },
            { icon: '✦', text: 'Budget goal alerts' },
          ].map((f, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'none' : 'translateX(-16px)',
              transition: `all 0.55s ease ${0.25 + i * 0.08}s`,
            }}>
              <span style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700 }}>{f.icon}</span>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>{f.text}</span>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div style={{
          background: 'rgba(139,92,246,0.07)',
          border: '1px solid rgba(139,92,246,0.15)',
          borderRadius: 16,
          padding: '18px 20px',
          maxWidth: 380,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.8s ease 0.6s',
        }}>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.65, marginBottom: 12, fontStyle: 'italic' }}>
            "FinTrack helped me save ₹40,000 in my first 3 months. The budget alerts are a game changer."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14,
            }}>👩</div>
            <div>
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: 600 }}>Priya Mehta</p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>Software Engineer, Bangalore</p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 1 }}>
              {'★★★★★'.split('').map((s, i) => <span key={i} style={{ color: '#f59e0b', fontSize: 11 }}>{s}</span>)}
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <FloatingCard style={{
          position: 'absolute', bottom: '20%', left: '52%',
          animation: 'floatA 5.5s ease-in-out infinite',
          minWidth: 175,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600 }}>New member bonus</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🎁</span>
            <div>
              <p style={{ color: '#c4b5fd', fontWeight: 700, fontSize: 13 }}>30-day Pro trial</p>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>Unlocked on signup</p>
            </div>
          </div>
        </FloatingCard>

        <FloatingCard style={{
          position: 'absolute', top: '18%', right: '3%',
          animation: 'floatB 7s ease-in-out infinite 1s',
          minWidth: 165,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <div style={{ width: 6, height: 6, background: '#34d399', borderRadius: '50%', boxShadow: '0 0 6px #34d399' }} />
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Live signups</span>
          </div>
          <p style={{ color: '#fff', fontWeight: 700, fontSize: 18, fontFamily: 'monospace' }}>+24 <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 400 }}>today</span></p>
        </FloatingCard>

        <FloatingCard style={{
          position: 'absolute', top: '42%', right: '1%',
          animation: 'floatC 6s ease-in-out infinite 0.5s',
          minWidth: 150,
        }}>
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 10, marginBottom: 6 }}>Avg. setup time</p>
          <p style={{ color: '#f59e0b', fontWeight: 800, fontSize: 20, fontFamily: 'monospace' }}>47<span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontWeight: 400 }}>s</span></p>
          <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: 10 }}>That's all it takes</p>
        </FloatingCard>
      </div>

      {/* ── RIGHT PANEL — Form ── */}
      <div style={{
        width: '100%',
        maxWidth: 490,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 48px 40px 20px',
        position: 'relative',
        zIndex: 2,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'none' : 'translateX(30px)',
        transition: 'all 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s',
      }}>
        <div style={{
          width: '100%',
          background: 'rgba(8,8,28,0.72)',
          border: '1px solid rgba(139,92,246,0.18)',
          borderRadius: 28,
          padding: '36px 38px 32px',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Inner glow */}
          <div style={{ position: 'absolute', top: -60, left: -60, width: 180, height: 180, background: 'radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

          {/* Header */}
          <div style={{ marginBottom: 28, position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase' }}>
                Create account
              </p>
              <StepDots total={4} current={currentStep} />
            </div>
            <h2 style={{
              color: '#fff',
              fontFamily: "'Sora', sans-serif",
              fontSize: 24,
              fontWeight: 800,
              letterSpacing: -0.8,
              marginBottom: 6,
            }}>
              Start for free
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
              Already have an account?{' '}
              <Link to="/login" style={{ color: '#c4b5fd', fontWeight: 600, textDecoration: 'none' }}>
                Sign in →
              </Link>
            </p>
          </div>

          {/* ── Form — your original logic ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.28)',
                borderRadius: 12,
                padding: '12px 16px',
                animation: 'slideUp 0.3s ease',
              }}>
                <p style={{ color: '#fca5a5', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>⚠️</span> {error}
                </p>
              </div>
            )}

            {/* Full Name */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: 0.3 }}>
                Full Name
              </label>
              <div style={inputStyle('name')}>
                <span style={{ fontSize: 15, opacity: 0.45 }}>👤</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={set('name')}
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Rahul Sharma"
                  required
                  style={inputElStyle}
                />
                {form.name.length > 1 && (
                  <span style={{ color: '#34d399', fontSize: 14, animation: 'checkPop 0.3s ease' }}>✓</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: 0.3 }}>
                Email address
              </label>
              <div style={inputStyle('email')}>
                <span style={{ fontSize: 15, opacity: 0.45 }}>✉️</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={set('email')}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField('')}
                  placeholder="you@example.com"
                  required
                  style={inputElStyle}
                />
                {form.email.includes('@') && form.email.includes('.') && (
                  <span style={{ color: '#34d399', fontSize: 14, animation: 'checkPop 0.3s ease' }}>✓</span>
                )}
              </div>
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: 0.3 }}>
                Password
              </label>
              <div style={inputStyle('password')}>
                <span style={{ fontSize: 15, opacity: 0.45 }}>🔑</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField('')}
                  placeholder="Min. 6 characters"
                  required
                  minLength={6}
                  style={inputElStyle}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.3)', padding: 0, display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <PasswordStrength password={form.password} />
            </div>

            {/* Currency */}
            <div>
              <label style={{ display: 'block', color: 'rgba(255,255,255,0.45)', fontSize: 12, fontWeight: 600, marginBottom: 7, letterSpacing: 0.3 }}>
                Currency
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {currencies.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setForm((p) => ({ ...p, currency: c.value }))}
                    style={{
                      background: form.currency === c.value
                        ? 'rgba(139,92,246,0.15)'
                        : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${form.currency === c.value ? 'rgba(139,92,246,0.6)' : 'rgba(255,255,255,0.07)'}`,
                      borderRadius: 12,
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all 0.2s',
                      boxShadow: form.currency === c.value ? '0 0 0 3px rgba(139,92,246,0.12)' : 'none',
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{c.flag}</span>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ color: form.currency === c.value ? '#c4b5fd' : 'rgba(255,255,255,0.55)', fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{c.symbol} {c.label}</p>
                      <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, marginTop: 2 }}>{c.name}</p>
                    </div>
                    {form.currency === c.value && (
                      <span style={{ marginLeft: 'auto', color: '#a78bfa', fontSize: 12 }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px 0',
                marginTop: 4,
                background: loading
                  ? 'rgba(139,92,246,0.35)'
                  : 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                border: 'none',
                borderRadius: 14,
                color: '#fff',
                fontSize: 15,
                fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer',
                fontFamily: 'inherit',
                letterSpacing: 0.2,
                boxShadow: loading ? 'none' : '0 8px 32px rgba(139,92,246,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(139,92,246,0.6)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = loading ? 'none' : '0 8px 32px rgba(139,92,246,0.45)'; }}
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
                  Creating your account...
                </>
              ) : (
                'Create free account →'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
            <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
          </div>

          {/* Google */}
          <button
            type="button"
            style={{
              width: '100%',
              padding: '13px 0',
              background: 'rgba(255,255,255,0.04)',
              border: '1.5px solid rgba(255,255,255,0.08)',
              borderRadius: 14,
              color: 'rgba(255,255,255,0.6)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Sign up with Google
          </button>

          {/* Trust */}
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.18)', fontSize: 11, marginTop: 20, lineHeight: 1.7 }}>
            By creating an account you agree to our{' '}
            <span style={{ color: '#c4b5fd', cursor: 'pointer' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: '#c4b5fd', cursor: 'pointer' }}>Privacy Policy</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
