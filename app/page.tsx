'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Stats {
  claimsThisWeek: number
  totalBusinesses: number
  totalSlots: number
  totalClaims: number
}

function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00E676"/>
      <rect x="8" y="10" width="24" height="3" rx="1.5" fill="#050505"/>
      <rect x="8" y="17" width="15" height="3" rx="1.5" fill="#050505"/>
      <rect x="8" y="24" width="19" height="3" rx="1.5" fill="#050505"/>
      <circle cx="30" cy="30" r="7" fill="#050505"/>
      <rect x="29" y="26" width="2" height="5" rx="1" fill="#00E676"/>
      <rect x="29" y="32" width="2" height="2" rx="1" fill="#00E676"/>
    </svg>
  )
}

const CATEGORY_PHOTOS: Record<string, string> = {
  'Salon & barber':  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
  'Fitness':         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=600&q=80',
  'Golf':            'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=600&q=80',
  'Spa':             'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=600&q=80',
  'Dining':          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=600&q=80',
  'Services':        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80',
}

const WAITLIST_CITIES = [
  'New York, NY', 'Baltimore, MD', 'Washington, DC',
  'Wilmington, DE', 'Trenton, NJ', 'Cherry Hill, NJ',
  'Atlantic City, NJ', 'Other city',
]

export default function Home() {
  const router = useRouter()
  const [dark, setDark] = useState(true)
  const [stats, setStats] = useState<Stats>({ claimsThisWeek: 0, totalBusinesses: 0, totalSlots: 0, totalClaims: 0 })
  const [area, setArea] = useState('')
  const [when, setWhen] = useState('')
  const [heroLoaded, setHeroLoaded] = useState(false)
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistCity, setWaitlistCity] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
    setTimeout(() => setHeroLoaded(true), 100)
  }, [])

  function handleFind(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (area) params.set('area', area)
    if (when) params.set('when', when)
    router.push(`/board${params.toString() ? '?' + params.toString() : ''}`)
  }

  async function handleWaitlist(e: React.FormEvent) {
    e.preventDefault()
    if (!waitlistEmail || !waitlistCity) return
    setWaitlistLoading(true)
    await fetch('/api/waitlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: waitlistEmail, city: waitlistCity }),
    })
    setWaitlistDone(true)
    setWaitlistLoading(false)
  }

  const t = {
    bg:          dark ? '#050505' : '#ffffff',
    bgAlt:       dark ? '#0d0d0d' : '#f8f9fa',
    bgCard:      dark ? '#111111' : '#ffffff',
    border:      dark ? '#222222' : '#e5e7eb',
    borderFaint: dark ? '#191919' : '#f3f4f6',
    text:        dark ? '#f0f0f0' : '#0a0a0a',
    textSub:     dark ? '#a0a0a0' : '#4b5563',
    textMuted:   dark ? '#666666' : '#9ca3af',
    greenText:   dark ? '#00E676' : '#059669',
    greenDim:    dark ? 'rgba(0,230,118,0.12)' : 'rgba(0,180,90,0.08)',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Outfit', sans-serif; }
        body { background: ${t.bg}; transition: background 0.3s; }

        /* Hero */
        .hero { position: relative; width: 100%; height: 100vh; min-height: 600px; overflow: hidden; display: flex; flex-direction: column; }
        .hero-bg { position: absolute; inset: 0; background-image: url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1920&q=80'); background-size: cover; background-position: center; transition: transform 8s ease-out; }
        .hero-bg.loaded { transform: scale(1.04); }
        .hero-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.85) 100%); }
        .hero-content { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 0 24px; text-align: center; }

        /* Nav overlay on hero */
        .hero-nav { position: absolute; top: 0; left: 0; right: 0; z-index: 10; padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; }

        /* Search bar */
        .search-bar { background: white; border-radius: 14px; display: flex; align-items: stretch; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1); max-width: 560px; width: 100%; }
        .search-select { flex: 1; padding: 0 18px; border: none; outline: none; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 500; color: #111; background: transparent; cursor: pointer; appearance: none; -webkit-appearance: none; min-width: 0; }
        .search-divider { width: 1px; background: #e5e7eb; margin: 12px 0; flex-shrink: 0; }
        .search-btn { background: #00E676; color: #050505; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 15px; padding: 18px 28px; border: none; cursor: pointer; white-space: nowrap; flex-shrink: 0; transition: background 0.15s; }
        .search-btn:hover { background: #00cc66; }

        /* Scroll cue */
        .scroll-cue { position: absolute; bottom: 28px; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; flex-direction: column; align-items: center; gap: 6px; opacity: 0.6; animation: bounce 2s infinite; }
        @keyframes bounce { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }

        /* Hero headline animation */
        .hero-tagline { opacity: 0; transform: translateY(20px); animation: fadeUp 0.6s ease 0.2s forwards; }
        .hero-h1 { opacity: 0; transform: translateY(20px); animation: fadeUp 0.7s ease 0.35s forwards; }
        .hero-search { opacity: 0; transform: translateY(20px); animation: fadeUp 0.7s ease 0.5s forwards; }
        .hero-meta { opacity: 0; animation: fadeUp 0.7s ease 0.65s forwards; }
        @keyframes fadeUp { to { opacity: 1; transform: translateY(0); } }

        /* Live slots ticker */
        .live-ticker { display: flex; align-items: center; gap: 8px; background: rgba(0,230,118,0.15); border: 1px solid rgba(0,230,118,0.3); border-radius: 20px; padding: 6px 14px; }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #00E676; animation: lpulse 2s infinite; }
        @keyframes lpulse { 0%,100%{opacity:1} 50%{opacity:0.4} }

        /* Toggle btn */
        .toggle-btn { background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: rgba(255,255,255,0.8); font-family: 'Outfit', sans-serif; font-size: 12px; padding: 7px 13px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 5px; backdrop-filter: blur(8px); transition: all 0.15s; }
        .toggle-btn:hover { background: rgba(255,255,255,0.2); }

        /* Section styles */
        .section { padding: 80px 24px; }
        .section-title { font-size: 40px; font-weight: 800; color: ${t.text}; line-height: 1.05; margin-bottom: 12px; }
        .section-sub { font-size: 16px; color: ${t.textSub}; margin-bottom: 48px; max-width: 520px; }
        .eyebrow { font-size: 12px; font-weight: 600; color: ${t.greenText}; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 12px; }

        /* Cards */
        .market-card { position: relative; border-radius: 16px; overflow: hidden; cursor: pointer; }
        .market-card img { width: 100%; height: 260px; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .market-card:hover img { transform: scale(1.04); }
        .market-card-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 60%); display: flex; flex-direction: column; justify-content: flex-end; padding: 24px; }

        .how-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 16px; overflow: hidden; transition: border-color 0.2s; }
        .how-card:hover { border-color: rgba(0,230,118,0.25); }
        .how-card img { width: 100%; height: 140px; object-fit: cover; }
        .how-card-body { padding: 22px; }

        .pilot-box { background: ${dark ? 'linear-gradient(135deg,#0a1800,#050d00)' : 'linear-gradient(135deg,#f0fdf4,#ecfdf5)'}; border: 1px solid ${dark ? 'rgba(0,230,118,0.15)' : 'rgba(5,150,105,0.2)'}; border-radius: 20px; padding: 48px; }

        .waitlist-input { background: ${t.bgCard}; border: 1.5px solid ${t.border}; color: ${t.text}; font-family: 'Outfit', sans-serif; font-size: 14px; padding: 12px 16px; border-radius: 10px; outline: none; transition: border-color 0.15s; }
        .waitlist-input:focus { border-color: ${t.greenText}; }
        .waitlist-input::placeholder { color: ${t.textMuted}; }

        .city-chip { padding: 7px 14px; border-radius: 20px; font-family: 'Outfit', sans-serif; font-size: 13px; cursor: pointer; border: 1.5px solid ${t.border}; background: transparent; color: ${t.textSub}; transition: all 0.12s; white-space: nowrap; }
        .city-chip.sel { border-color: ${t.greenText}; color: ${t.greenText}; background: ${t.greenDim}; font-weight: 600; }

        .btn-primary { background: ${t.greenText}; color: ${dark ? '#050505' : '#fff'}; font-family: 'Outfit', sans-serif; font-weight: 700; padding: 14px 28px; border-radius: 10px; border: none; cursor: pointer; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(0,230,118,0.35); }
        .btn-ghost { background: transparent; color: ${t.text}; font-family: 'Outfit', sans-serif; font-weight: 500; padding: 14px 28px; border-radius: 10px; border: 1.5px solid ${t.border}; cursor: pointer; font-size: 15px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: all 0.15s; }
        .btn-ghost:hover { border-color: ${t.greenText}; color: ${t.greenText}; }

        .marquee-track { display: flex; width: max-content; animation: lmarquee 28s linear infinite; }
        @keyframes lmarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .feat-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${t.borderFaint}; }
        .feat-row:last-child { border-bottom: none; }

        /* ─── MOBILE ─── */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }

          .hero { height: 100svh; min-height: 580px; }
          .hero-nav { padding: 16px 18px; }
          .hero-h1 { font-size: 36px !important; }
          .search-bar { flex-direction: column; border-radius: 14px; }
          .search-select { padding: 16px 18px; border-bottom: 1px solid #e5e7eb; font-size: 16px; }
          .search-select:last-of-type { border-bottom: none; }
          .search-divider { display: none; }
          .search-btn { padding: 16px; font-size: 16px; border-radius: 0 0 14px 14px; }

          .mob-section { padding: 36px 18px; }
          .mob-section-title { font-size: 28px; font-weight: 800; color: ${t.text}; line-height: 1.1; margin-bottom: 8px; }
          .mob-section-sub { font-size: 14px; color: ${t.textSub}; margin-bottom: 20px; }

          .mob-cities { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 12px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .mob-cities::-webkit-scrollbar { display: none; }

          .mob-input { background: ${t.bgCard}; border: 1.5px solid ${t.border}; color: ${t.text}; font-family: 'Outfit', sans-serif; font-size: 15px; padding: 14px 16px; border-radius: 10px; outline: none; width: 100%; }
          .mob-input:focus { border-color: ${t.greenText}; }
          .mob-input::placeholder { color: ${t.textMuted}; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════
          HERO — full screen, background image
      ═══════════════════════════════════════ */}
      <section className="hero" ref={heroRef}>
        <div className={`hero-bg ${heroLoaded ? 'loaded' : ''}`} />
        <div className="hero-overlay" />

        {/* Nav — floats on top of hero */}
        <div className="hero-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <LogoMark size={34} />
            <span style={{ color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: '-0.3px' }}>Open Slot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/board" style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, textDecoration: 'none', padding: '0 8px' }}>Browse all</Link>
            <Link href="/apply" style={{ background: '#00E676', color: '#050505', fontFamily: 'Outfit, sans-serif', fontWeight: 700, padding: '9px 18px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>
              List your business
            </Link>
            <button className="toggle-btn" onClick={() => setDark(p => !p)}>
              {dark ? '☀' : '🌙'}
            </button>
          </div>
        </div>

        {/* Hero content — centered */}
        <div className="hero-content">

          <div className="hero-tagline" style={{ marginBottom: 16 }}>
            <div className="live-ticker">
              <span className="live-dot" />
              <span style={{ color: '#00E676', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>
                {stats.totalSlots || 14} open slots · Philadelphia & South Jersey
              </span>
            </div>
          </div>

          <h1 className="hero-h1" style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, color: '#fff', lineHeight: 1.05, marginBottom: 12, textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
            Last-minute deals.<br />
            <span style={{ color: '#00E676' }}>Near you. Right now.</span>
          </h1>

          <p className="hero-h1" style={{ fontSize: 16, color: 'rgba(255,255,255,0.65)', marginBottom: 36, fontWeight: 400, maxWidth: 440, lineHeight: 1.6, animation: 'fadeUp 0.7s ease 0.45s both' }}>
            Local businesses post empty appointment slots at a discount. Claim yours in seconds.
          </p>

          {/* THE SEARCH BAR — this is the whole point */}
          <form className="hero-search" onSubmit={handleFind} style={{ maxWidth: 560, width: '100%' }}>
            <div className="search-bar">
              <select
                className="search-select"
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="">📍 Any area</option>
                <option value="philadelphia">Philadelphia, PA</option>
                <option value="south-jersey">South Jersey, NJ</option>
              </select>
              <div className="search-divider" />
              <select
                className="search-select"
                value={when}
                onChange={e => setWhen(e.target.value)}
              >
                <option value="">🕐 Any time</option>
                <option value="today">Today</option>
                <option value="tomorrow">Tomorrow</option>
                <option value="this-week">This week</option>
              </select>
              <button type="submit" className="search-btn">
                Find open slots →
              </button>
            </div>
          </form>

          {/* Quick category links */}
          <div className="hero-meta" style={{ display: 'flex', gap: 8, marginTop: 20, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Salon & barber', 'Spa', 'Fitness', 'Golf', 'Dining'].map(cat => (
              <Link key={cat} href={`/board?category=${encodeURIComponent(cat)}`}
                style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)', padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none', transition: 'all 0.15s' }}>
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="scroll-cue">
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>Scroll</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          BELOW THE FOLD — tight, scannable
      ═══════════════════════════════════════ */}
      <div style={{ background: t.bg }}>

        {/* Stats strip */}
        <div style={{ background: dark ? '#080808' : '#f1f5f9', borderBottom: `1px solid ${t.borderFaint}`, padding: '20px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { val: stats.claimsThisWeek || 47, label: 'claimed this week' },
              { val: stats.totalBusinesses || 8, label: 'businesses live' },
              { val: '41%', label: 'average discount' },
              { val: '$0', label: 'free for consumers' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 24px', borderLeft: i > 0 ? `1px solid ${t.borderFaint}` : 'none' }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: t.greenText, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: t.textMuted, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div style={{ background: '#00E676', padding: '10px 0', overflow: 'hidden' }}>
          <div className="marquee-track">
            {[...Array(2)].map((_, ri) =>
              ['Salons','Barbershops','Golf Courses','Fitness Studios','Spas','Massage','Restaurants','Tax Services','Yoga Studios','Nail Salons','Personal Trainers','Tattoo Artists'].map((c, i) => (
                <span key={`${ri}-${i}`} style={{ fontWeight: 700, fontSize: 12, color: '#050505', letterSpacing: '0.5px', whiteSpace: 'nowrap', padding: '0 18px' }}>{c} ·</span>
              ))
            )}
          </div>
        </div>

        {/* Markets */}
        <section className="section" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="eyebrow">Where we're live</div>
          <h2 className="section-title" style={{ color: t.text }}>Now open in 2 cities.</h2>
          <p className="section-sub" style={{ color: t.textSub }}>More launching soon. Get on the waitlist for your city below.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 0 }}>
            <div className="market-card">
              <img src="https://openslot-six.vercel.app/board/phillyphoto.jpg" alt="Philadelphia" />
              <div className="market-card-overlay">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 10, width: 'fit-content' }}>
                  <span className="live-dot" />
                  <span style={{ color: '#00E676', fontSize: 11, fontWeight: 600 }}>LIVE NOW</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Philadelphia, PA</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>Greater Philadelphia & suburbs</div>
                <Link href="/board" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', display: 'inline-flex' }}>See open slots →</Link>
              </div>
            </div>

            <div className="market-card">
              <img src="https://openslot-six.vercel.app/board/southjersey.jpg" alt="South Jersey" />
              <div className="market-card-overlay">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 20, padding: '4px 12px', marginBottom: 10, width: 'fit-content' }}>
                  <span className="live-dot" />
                  <span style={{ color: '#00E676', fontSize: 11, fontWeight: 600 }}>LIVE NOW</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 800, color: '#fff', marginBottom: 4 }}>South Jersey, NJ</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12 }}>Gloucester, Camden & Burlington counties</div>
                <Link href="/board" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px', display: 'inline-flex' }}>See open slots →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works — tight */}
        <section style={{ background: t.bgAlt, borderTop: `1px solid ${t.borderFaint}`, borderBottom: `1px solid ${t.borderFaint}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div className="eyebrow">How it works</div>
            <h2 className="section-title" style={{ color: t.text, marginBottom: 40 }}>Three steps. Both sides win.</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { n: '01', title: 'Business posts a slot', body: 'An approved local business posts empty time with a deal price — takes 60 seconds.', cat: 'Salon & barber' },
                { n: '02', title: 'You see it instantly', body: 'It appears on the live board the moment it\'s posted. Price watch users get emailed.', cat: 'Fitness' },
                { n: '03', title: 'Claim it. Show up.', body: 'You pay the deal price. The chair gets filled. Both sides win.', cat: 'Dining' },
              ].map(s => (
                <div key={s.n} className="how-card">
                  <div style={{ position: 'relative' }}>
                    <img src={CATEGORY_PHOTOS[s.cat]} alt={s.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'flex-end', padding: '14px 18px' }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: 'rgba(0,230,118,0.5)', lineHeight: 1 }}>{s.n}</span>
                    </div>
                  </div>
                  <div className="how-card-body">
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: t.text, marginBottom: 8, lineHeight: 1.2 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: t.textSub, lineHeight: 1.7 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For businesses + consumers — minimal */}
        <section className="section" style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <div style={{ background: '#00E676', borderRadius: 16, padding: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', color: 'rgba(0,0,0,0.5)', background: 'rgba(0,0,0,0.1)', padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 20 }}>FOR BUSINESSES</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 12 }}>Fill empty time.<br />Keep the revenue.</h2>
              <p style={{ fontSize: 15, color: 'rgba(0,0,0,0.6)', lineHeight: 1.65, marginBottom: 24 }}>Post an open slot in 60 seconds. Get notified when someone claims it. Zero fees for your first 3 months.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
                {['Salon & barber','Fitness','Golf','Dining'].map(cat => (
                  <div key={cat} style={{ position: 'relative', height: 64 }}>
                    <img src={CATEGORY_PHOTOS[cat]} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{cat}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/apply" style={{ background: '#050505', color: '#fff', padding: '13px 22px', borderRadius: 8, textDecoration: 'none', fontSize: 14, fontWeight: 600, display: 'inline-block' }}>Apply free — founding pilot →</Link>
            </div>

            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 36 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1px', color: t.textMuted, background: t.bgAlt, border: `1px solid ${t.border}`, padding: '4px 12px', borderRadius: 20, display: 'inline-block', marginBottom: 20 }}>FOR CONSUMERS</div>
              <h2 style={{ fontSize: 30, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 12 }}>Great services.<br />Last-minute prices.</h2>
              <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.65, marginBottom: 24 }}>Browse real-time deals from vetted local businesses. Set a price watch. Post what you need. Always free.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, borderRadius: 10, overflow: 'hidden', marginBottom: 24 }}>
                {[
                  { photo: CATEGORY_PHOTOS['Spa'], label: 'Massages from $45' },
                  { photo: CATEGORY_PHOTOS['Golf'], label: 'Golf from $22' },
                  { photo: CATEGORY_PHOTOS['Salon & barber'], label: 'Cuts from $15' },
                  { photo: CATEGORY_PHOTOS['Dining'], label: 'Dining from $25' },
                ].map(item => (
                  <div key={item.label} style={{ position: 'relative', height: 64 }}>
                    <img src={item.photo} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ color: '#fff', fontSize: 11, fontWeight: 600 }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/board" className="btn-ghost" style={{ fontSize: 14, padding: '12px 22px' }}>Browse open slots →</Link>
            </div>
          </div>
        </section>

        {/* Pilot callout */}
        <section style={{ padding: '0 24px 72px', maxWidth: 1100, margin: '0 auto' }}>
          <div className="pilot-box" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(255,230,0,0.08)' : 'rgba(180,150,0,0.08)', border: `1px solid ${dark ? 'rgba(255,230,0,0.2)' : 'rgba(180,150,0,0.2)'}`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
                <span>🚀</span>
                <span style={{ color: dark ? '#FFE000' : '#92400e', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>FOUNDING LAUNCH PILOT</span>
              </div>
              <h2 style={{ fontSize: 34, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 12 }}>
                First 3 months.<br /><span style={{ color: t.greenText }}>Completely free.</span>
              </h2>
              <p style={{ fontSize: 15, color: t.textSub, lineHeight: 1.7 }}>
                Zero platform fees during our founding pilot. For businesses and consumers. After the pilot, just 5% when a slot is claimed — and consumers are always free.
              </p>
            </div>
            <div>
              {[
                { text: 'Free to list your business', sub: 'No credit card, no commitment' },
                { text: 'Zero fees for 3 months', sub: 'Keep 100% of every claim during pilot' },
                { text: 'Founding member placement', sub: 'Early businesses rank higher forever' },
                { text: 'Direct builder support', sub: 'Real help while we grow together' },
                { text: 'Consumers always free', sub: 'Browse and claim with no account needed' },
              ].map((f, i) => (
                <div key={i} className="feat-row">
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.greenDim, border: `1px solid rgba(0,230,118,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: t.greenText, fontSize: 11, fontWeight: 700 }}>✓</span>
                  </div>
                  <div>
                    <div style={{ color: t.text, fontSize: 14, fontWeight: 600 }}>{f.text}</div>
                    <div style={{ color: t.textMuted, fontSize: 12 }}>{f.sub}</div>
                  </div>
                </div>
              ))}
              <Link href="/apply" className="btn-primary" style={{ marginTop: 24 }}>Join the pilot →</Link>
            </div>
          </div>
        </section>

        {/* Waitlist */}
        <section style={{ background: t.bgAlt, borderTop: `1px solid ${t.borderFaint}`, padding: '72px 24px' }}>
          <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
            <div className="eyebrow" style={{ textAlign: 'center' }}>Coming soon</div>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: t.text, marginBottom: 12 }}>Not in your city yet?</h2>
            <p style={{ color: t.textSub, fontSize: 16, marginBottom: 36 }}>
              We're expanding fast. Drop your email and we'll let you know the moment Open Slot hits your area.
            </p>

            {waitlistDone ? (
              <div style={{ background: t.greenDim, border: `1px solid rgba(0,230,118,0.3)`, borderRadius: 14, padding: '20px 24px', color: t.greenText, fontSize: 16, fontWeight: 600 }}>
                ✓ You're on the list! We'll email you when we launch near you.
              </div>
            ) : (
              <form onSubmit={handleWaitlist}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 20 }}>
                  {WAITLIST_CITIES.map(c => (
                    <button key={c} type="button"
                      className={`city-chip ${waitlistCity === c ? 'sel' : ''}`}
                      onClick={() => setWaitlistCity(c)}
                    >{c}</button>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 10, maxWidth: 440, margin: '0 auto' }}>
                  <input
                    type="email"
                    required
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={e => setWaitlistEmail(e.target.value)}
                    className="waitlist-input"
                    style={{ flex: 1 }}
                  />
                  <button type="submit" disabled={waitlistLoading || !waitlistCity}
                    className="btn-primary"
                    style={{ opacity: !waitlistCity ? 0.5 : 1, padding: '12px 20px', fontSize: 14 }}
                  >
                    {waitlistLoading ? '...' : 'Notify me'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ background: '#00E676', padding: '72px 24px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 44, fontWeight: 800, color: '#050505', marginBottom: 16 }}>Ready to find a deal?</h2>
          <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: 16, marginBottom: 32 }}>Vetted local businesses. Real discounts. Right now.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/board" style={{ background: '#050505', color: '#fff', padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 15, fontWeight: 600 }}>Browse open slots →</Link>
            <Link href="/apply" style={{ background: 'transparent', color: '#050505', padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 15, fontWeight: 500, border: '2px solid rgba(0,0,0,0.2)' }}>List your business</Link>
          </div>
        </section>

        <footer style={{ background: t.bg, borderTop: `1px solid ${t.borderFaint}`, padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogoMark size={18} />
            <span style={{ color: t.textMuted, fontSize: 12 }}>Open Slot · Philadelphia & South Jersey · Founding Launch 2026</span>
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE — always dark
      ═══════════════════════════════════════ */}
      <div className="mobile-only" style={{ background: '#050505' }}>

        {/* Hero — full screen on mobile too */}
        <section style={{ position: 'relative', height: '100svh', minHeight: 600, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: "url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1200&q=80')", backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 60%, rgba(0,0,0,0.95) 100%)' }} />

          {/* Mobile nav */}
          <div style={{ position: 'relative', zIndex: 10, padding: '16px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <LogoMark size={30} />
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>Open Slot</span>
            </div>
            <Link href="/apply" style={{ background: '#00E676', color: '#050505', padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 700 }}>List biz →</Link>
          </div>

          {/* Mobile hero content */}
          <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '24px 18px 32px' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 16 }}>
              <span className="live-dot" />
              <span style={{ color: '#00E676', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>{stats.totalSlots || 14} OPEN SLOTS NEAR YOU</span>
            </div>

            <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.0, marginBottom: 12, textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
              Last-minute deals.<br /><span style={{ color: '#00E676' }}>Right now.</span>
            </h1>

            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, marginBottom: 24 }}>
              Local businesses. Empty slots. Real discounts. Claim yours in seconds.
            </p>

            {/* Mobile search */}
            <form onSubmit={handleFind}>
              <div style={{ background: 'white', borderRadius: 14, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginBottom: 14 }}>
                <select value={area} onChange={e => setArea(e.target.value)}
                  style={{ width: '100%', padding: '16px 18px', border: 'none', outline: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 500, color: '#111', background: 'transparent', borderBottom: '1px solid #e5e7eb', appearance: 'none', WebkitAppearance: 'none' }}>
                  <option value="">📍 Any area</option>
                  <option value="philadelphia">Philadelphia, PA</option>
                  <option value="south-jersey">South Jersey, NJ</option>
                </select>
                <select value={when} onChange={e => setWhen(e.target.value)}
                  style={{ width: '100%', padding: '16px 18px', border: 'none', outline: 'none', fontFamily: 'Outfit, sans-serif', fontSize: 15, fontWeight: 500, color: '#111', background: 'transparent', appearance: 'none', WebkitAppearance: 'none' }}>
                  <option value="">🕐 Any time</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="this-week">This week</option>
                </select>
                <button type="submit" style={{ width: '100%', padding: '17px', background: '#00E676', color: '#050505', border: 'none', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, cursor: 'pointer' }}>
                  Find open slots →
                </button>
              </div>
            </form>

            {/* Quick categories */}
            <div style={{ display: 'flex', gap: 8, overflow: 'hidden', flexWrap: 'wrap' }}>
              {['Haircut', 'Massage', 'Golf', 'Yoga', 'Dining'].map(cat => (
                <Link key={cat} href={`/board?category=${cat}`}
                  style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', padding: '6px 12px', borderRadius: 20, fontSize: 12, fontWeight: 500, textDecoration: 'none' }}>
                  {cat}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Mobile stats */}
        <div style={{ background: '#080808', borderBottom: '1px solid #191919', padding: '16px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { val: stats.claimsThisWeek || 47, label: 'this week' },
              { val: stats.totalBusinesses || 8, label: 'businesses' },
              { val: '41%', label: 'avg off' },
              { val: '$0', label: 'for you' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#00E676', lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontSize: 10, color: '#666', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile how it works */}
        <div style={{ padding: '32px 18px', borderBottom: '1px solid #111' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#00E676', letterSpacing: '1.5px', marginBottom: 12 }}>HOW IT WORKS</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f0', marginBottom: 20 }}>Three steps. Both sides win.</h2>
          {[
            { n: '01', title: 'Business posts', body: 'Approved business posts empty time with a deal price in 60 seconds.', photo: CATEGORY_PHOTOS['Salon & barber'] },
            { n: '02', title: 'You see it', body: 'Shows on the live board instantly. Price watch alerts your email.', photo: CATEGORY_PHOTOS['Fitness'] },
            { n: '03', title: 'Claim it', body: 'Pay the deal price. Show up. Both sides win.', photo: CATEGORY_PHOTOS['Dining'] },
          ].map(s => (
            <div key={s.n} style={{ display: 'flex', gap: 14, padding: '14px 0', borderBottom: '1px solid #111' }}>
              <div style={{ width: 60, height: 60, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <img src={s.photo} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: '#00E676', fontSize: 16, fontWeight: 800 }}>{s.n}</span>
                </div>
              </div>
              <div>
                <div style={{ color: '#f0f0f0', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ color: '#888', fontSize: 13, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile markets */}
        <div style={{ padding: '32px 18px', borderBottom: '1px solid #111' }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#00E676', letterSpacing: '1.5px', marginBottom: 12 }}>WHERE WE'RE LIVE</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f0', marginBottom: 16 }}>2 cities. More coming.</h2>
          {[
            { city: 'Philadelphia, PA', desc: 'Greater Philadelphia area', photo: 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?auto=format&fit=crop&w=600&q=80' },
            { city: 'South Jersey, NJ', desc: 'Gloucester, Camden & Burlington counties', photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
          ].map(m => (
            <div key={m.city} style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', marginBottom: 10 }}>
              <img src={m.photo} alt={m.city} style={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '14px 16px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.35)', borderRadius: 20, padding: '3px 10px', marginBottom: 6, width: 'fit-content' }}>
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  <span style={{ color: '#00E676', fontSize: 10, fontWeight: 600 }}>LIVE NOW</span>
                </div>
                <div style={{ color: '#fff', fontSize: 18, fontWeight: 800 }}>{m.city}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile pilot */}
        <div style={{ padding: '32px 18px', borderBottom: '1px solid #111', background: '#080808' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,230,0,0.08)', border: '1px solid rgba(255,230,0,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 14 }}>
            <span>🚀</span>
            <span style={{ color: '#FFE000', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px' }}>FOUNDING PILOT</span>
          </div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#f0f0f0', lineHeight: 1.1, marginBottom: 10 }}>
            First 3 months.<br /><span style={{ color: '#00E676' }}>Completely free.</span>
          </h2>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.65, marginBottom: 20 }}>
            Zero fees for businesses and consumers during our founding pilot. After that, just 5% when a slot is claimed. Consumers are always free.
          </p>
          <Link href="/apply" style={{ display: 'block', background: '#00E676', color: '#050505', padding: '15px', borderRadius: 12, textDecoration: 'none', fontSize: 16, fontWeight: 700, textAlign: 'center' }}>
            Apply as a business — free →
          </Link>
        </div>

        {/* Mobile waitlist */}
        <div style={{ padding: '32px 18px', borderBottom: '1px solid #111' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#f0f0f0', marginBottom: 8 }}>Not in your city?</h2>
          <p style={{ color: '#888', fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Join the waitlist. We'll email you the moment we launch near you.</p>
          {waitlistDone ? (
            <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 12, padding: 16, color: '#00E676', fontSize: 15, fontWeight: 500, textAlign: 'center' }}>
              ✓ You're on the list!
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', gap: 8, overflow: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' as any }}>
                {WAITLIST_CITIES.map(c => (
                  <button key={c} type="button"
                    onClick={() => setWaitlistCity(c)}
                    style={{ flexShrink: 0, padding: '7px 14px', borderRadius: 20, fontFamily: 'Outfit, sans-serif', fontSize: 13, cursor: 'pointer', border: `1.5px solid ${waitlistCity === c ? '#00E676' : '#222'}`, background: 'transparent', color: waitlistCity === c ? '#00E676' : '#888', fontWeight: waitlistCity === c ? 600 : 400, whiteSpace: 'nowrap' }}>
                    {c}
                  </button>
                ))}
              </div>
              <input type="email" required placeholder="your@email.com" value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                style={{ background: '#111', border: `1.5px solid #222`, color: '#f0f0f0', fontFamily: 'Outfit, sans-serif', fontSize: 15, padding: '14px 16px', borderRadius: 10, outline: 'none', width: '100%' }} />
              <button type="submit" disabled={waitlistLoading || !waitlistCity}
                style={{ padding: '15px', background: !waitlistCity ? '#222' : '#00E676', color: !waitlistCity ? '#555' : '#050505', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 10, cursor: waitlistCity ? 'pointer' : 'default' }}>
                {waitlistLoading ? 'Joining...' : 'Notify me when you launch →'}
              </button>
            </form>
          )}
        </div>

        {/* Mobile CTA */}
        <div style={{ background: '#00E676', padding: '32px 18px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: '#050505', marginBottom: 10 }}>Ready to find a deal?</h2>
          <p style={{ color: 'rgba(0,0,0,0.55)', fontSize: 14, marginBottom: 20 }}>Browse live slots from vetted local businesses.</p>
          <Link href="/board" style={{ display: 'block', background: '#050505', color: '#fff', padding: '16px', borderRadius: 12, textDecoration: 'none', fontSize: 16, fontWeight: 700 }}>
            Browse open slots →
          </Link>
        </div>

        <div style={{ background: '#050505', borderTop: '1px solid #111', padding: '20px 18px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogoMark size={18} />
            <span style={{ color: '#444', fontSize: 11 }}>Open Slot · Philadelphia & South Jersey · 2026</span>
          </div>
        </div>
      </div>
    </>
  )
}