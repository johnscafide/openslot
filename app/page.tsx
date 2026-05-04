'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  claimsThisWeek: number
  totalBusinesses: number
  totalSlots: number
  totalClaims: number
}

// Logo mark component
function LogoMark({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
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

function LogoFull({ dark }: { dark: boolean }) {
  const text = dark ? '#fff' : '#0a0a0a'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <LogoMark size={34} />
      <svg width="110" height="22" viewBox="0 0 110 22" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text fontFamily="'Outfit', sans-serif" fontWeight="700" fontSize="18" fill={text} y="17">Open Slot</text>
      </svg>
    </div>
  )
}

// Unsplash photo IDs for each category
const CATEGORY_PHOTOS: Record<string, string> = {
  'Salon & barber':  'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=400&q=80',
  'Fitness':         'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=400&q=80',
  'Golf':            'https://images.unsplash.com/photo-1587174486073-ae5e5cff23aa?auto=format&fit=crop&w=400&q=80',
  'Spa':             'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80',
  'Dining':          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=400&q=80',
  'Services':        'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=400&q=80',
}

const ACTIVE_MARKETS = ['Philadelphia, PA', 'South Jersey, NJ']

const WAITLIST_CITIES = [
  'New York, NY', 'Baltimore, MD', 'Washington, DC',
  'Wilmington, DE', 'Trenton, NJ', 'Cherry Hill, NJ',
  'Atlantic City, NJ', 'Other city',
]

const PREVIEW_SLOTS = [
  { biz: "Mario's Barbershop", svc: "Men's cut + fade", time: "Today · 2:30 PM", orig: 35, deal: 20, disc: 43, cat: 'Salon & barber', urgent: true },
  { biz: "Serenity Spa", svc: "60-min deep tissue", time: "Today · 3:00 PM", orig: 95, deal: 60, disc: 37, cat: 'Spa', urgent: false },
  { biz: "Eagle Ridge Golf", svc: "9 holes + cart", time: "Today · 5:00 PM", orig: 55, deal: 30, disc: 45, cat: 'Golf', urgent: false },
]

export default function Home() {
  const [dark, setDark] = useState(true)
  const [stats, setStats] = useState<Stats>({ claimsThisWeek: 0, totalBusinesses: 0, totalSlots: 0, totalClaims: 0 })
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistCity, setWaitlistCity] = useState('')
  const [waitlistDone, setWaitlistDone] = useState(false)
  const [waitlistLoading, setWaitlistLoading] = useState(false)

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

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
    bg:           dark ? '#050505' : '#ffffff',
    bgAlt:        dark ? '#0d0d0d' : '#f8f9fa',
    bgCard:       dark ? '#111111' : '#ffffff',
    border:       dark ? '#222222' : '#e5e7eb',
    borderFaint:  dark ? '#191919' : '#f3f4f6',
    text:         dark ? '#f0f0f0' : '#0a0a0a',
    textSub:      dark ? '#a0a0a0' : '#4b5563',
    textMuted:    dark ? '#666666' : '#9ca3af',
    green:        '#00E676',
    greenDim:     dark ? 'rgba(0,230,118,0.12)' : 'rgba(0,180,90,0.08)',
    greenText:    dark ? '#00E676' : '#059669',
    navBg:        dark ? 'rgba(5,5,5,0.95)' : 'rgba(255,255,255,0.95)',
    heroBg:       dark ? '#050505' : '#f8f9fa',
    heroGlow:     dark ? 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(0,230,118,0.1) 0%, transparent 70%)' : 'none',
  }

  const df = `'Outfit', sans-serif`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; transition: background 0.3s; }

        .btn-primary { background: ${t.greenText}; color: ${dark ? '#050505' : '#fff'}; font-family: ${df}; font-weight: 600; padding: 13px 26px; border-radius: 8px; border: none; cursor: pointer; font-size: 15px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px ${t.greenText}40; }
        .btn-ghost { background: transparent; color: ${t.text}; font-family: ${df}; font-weight: 500; padding: 13px 26px; border-radius: 8px; border: 1.5px solid ${t.border}; cursor: pointer; font-size: 15px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-ghost:hover { border-color: ${t.greenText}; color: ${t.greenText}; }

        .prev-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 12px; overflow: hidden; position: relative; transition: all 0.3s; }
        .prev-stripe { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${t.greenText}; }
        .prev-stripe.urgent { background: #FF5252; }

        .how-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 14px; padding: 28px; transition: border-color 0.2s; }
        .how-card:hover { border-color: ${t.greenText}50; }

        .market-card { border-radius: 14px; overflow: hidden; position: relative; }
        .market-photo { width: 100%; height: 160px; object-fit: cover; display: block; }
        .market-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%); }

        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: ${t.greenText}; animation: lpulse 2s infinite; display: inline-block; }
        @keyframes lpulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        .marquee-track { display: flex; gap: 0; width: max-content; animation: lmarquee 28s linear infinite; }
        @keyframes lmarquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        .feat-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid ${t.borderFaint}; }
        .feat-row:last-child { border-bottom: none; }

        .city-chip { padding: 8px 16px; border-radius: 20px; font-family: ${df}; font-size: 13px; cursor: pointer; border: 1.5px solid ${t.border}; background: transparent; color: ${t.textSub}; transition: all 0.12s; white-space: nowrap; }
        .city-chip.selected { border-color: ${t.greenText}; color: ${t.greenText}; background: ${t.greenDim}; font-weight: 600; }

        .waitlist-input { background: ${t.bgCard}; border: 1.5px solid ${t.border}; color: ${t.text}; font-family: ${df}; font-size: 14px; padding: 12px 16px; border-radius: 8px; outline: none; transition: border-color 0.15s; }
        .waitlist-input:focus { border-color: ${t.greenText}; }
        .waitlist-input::placeholder { color: ${t.textMuted}; }

        /* ── DESKTOP ONLY ── */
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }

        /* ── MOBILE ONLY ── */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }

          .mob-nav { background: rgba(5,5,5,0.97); padding: 12px 18px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1a1a1a; position: sticky; top: 0; z-index: 50; }
          .mob-pilot { background: rgba(255,230,0,0.08); border-bottom: 1px solid rgba(255,230,0,0.15); padding: 9px 18px; text-align: center; }
          .mob-hero { background: #050505; padding: 28px 18px 24px; }
          .mob-h1 { font-family: 'Outfit', sans-serif; font-size: 42px; font-weight: 800; color: #f0f0f0; line-height: 1.0; margin-bottom: 14px; }
          .mob-sub { font-family: 'Outfit', sans-serif; color: #888; font-size: 15px; line-height: 1.65; margin-bottom: 24px; }
          .mob-cta-col { display: flex; flex-direction: column; gap: 10px; margin-bottom: 28px; }
          .mob-btn-g { background: #00E676; color: #050505; font-family: 'Outfit', sans-serif; font-weight: 700; padding: 16px; border-radius: 10px; border: none; font-size: 16px; text-align: center; text-decoration: none; display: block; }
          .mob-btn-o { background: rgba(255,255,255,0.05); color: #ccc; font-family: 'Outfit', sans-serif; font-weight: 500; padding: 14px; border-radius: 10px; border: 1.5px solid #222; font-size: 15px; text-align: center; text-decoration: none; display: block; }
          .mob-stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 24px; }
          .mob-stat { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 12px; padding: 14px; }
          .mob-stat-val { font-family: 'Outfit', sans-serif; font-size: 30px; font-weight: 800; color: #00E676; line-height: 1; margin-bottom: 4px; }
          .mob-stat-label { font-family: 'Outfit', sans-serif; color: #666; font-size: 11px; }
          .mob-slot-preview { background: #0f0f0f; border: 1px solid #1e1e1e; border-radius: 12px; overflow: hidden; margin-bottom: 10px; display: flex; align-items: stretch; }
          .mob-slot-img { width: 70px; height: 80px; object-fit: cover; flex-shrink: 0; }
          .mob-slot-body { flex: 1; padding: 10px 12px; }
          .mob-section { padding: 32px 18px; border-top: 1px solid #111; }
          .mob-section-bg { background: #0a0a0a; }
          .mob-section-title { font-family: 'Outfit', sans-serif; font-size: 28px; font-weight: 800; color: #f0f0f0; line-height: 1.1; margin-bottom: 8px; }
          .mob-section-sub { font-family: 'Outfit', sans-serif; color: #777; font-size: 14px; margin-bottom: 20px; }
          .mob-feat-card { background: #111; border: 1px solid #1e1e1e; border-radius: 14px; padding: 18px; margin-bottom: 10px; display: flex; gap: 14px; align-items: flex-start; }
          .mob-step { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid #111; }
          .mob-step:last-child { border-bottom: none; }
          .mob-market-card { border-radius: 14px; overflow: hidden; margin-bottom: 10px; position: relative; }
          .mob-market-img { width: 100%; height: 140px; object-fit: cover; display: block; }
          .mob-market-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 100%); display: flex; flex-direction: column; justify-content: flex-end; padding: 16px; }
          .mob-waitlist-section { background: #0a0a0a; padding: 32px 18px; border-top: 1px solid #111; }
          .mob-city-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 16px; -webkit-overflow-scrolling: touch; scrollbar-width: none; margin-bottom: 18px; }
          .mob-city-scroll::-webkit-scrollbar { display: none; }
          .mob-city-chip { flex-shrink: 0; padding: 8px 16px; border-radius: 20px; font-family: 'Outfit', sans-serif; font-size: 13px; border: 1.5px solid #222; background: transparent; color: #888; cursor: pointer; transition: all 0.12s; white-space: nowrap; }
          .mob-city-chip.selected { border-color: #00E676; color: #00E676; background: rgba(0,230,118,0.1); font-weight: 600; }
          .mob-input { background: #111; border: 1.5px solid #222; color: #f0f0f0; font-family: 'Outfit', sans-serif; font-size: 15px; padding: 14px 16px; border-radius: 10px; outline: none; width: 100%; }
          .mob-input:focus { border-color: #00E676; }
          .mob-input::placeholder { color: #555; }
          .mob-bottom-cta { background: #00E676; padding: 32px 18px; text-align: center; }
          .mob-footer { background: #050505; border-top: 1px solid #111; padding: 20px 18px; text-align: center; }
        }
      `}</style>

      {/* ═══════════════════════════════════
          DESKTOP
      ═══════════════════════════════════ */}
      <div className="desktop-only" style={{ background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>

        {/* Pilot banner */}
        <div style={{ background: dark ? 'linear-gradient(90deg,#0f1a00,#050505,#0f1a00)' : '#fefce8', borderBottom: `1px solid ${dark ? 'rgba(255,230,0,0.15)' : 'rgba(200,150,0,0.2)'}`, padding: '9px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 15 }}>🚀</span>
            <span style={{ fontFamily: df, color: dark ? '#FFE000' : '#92400e', fontSize: 13, fontWeight: 500 }}>
              Founding Launch Pilot — First 3 months completely free · Now live in Philadelphia & South Jersey
            </span>
            <span style={{ background: dark ? 'rgba(255,230,0,0.12)' : 'rgba(180,150,0,0.1)', border: `1px solid ${dark ? 'rgba(255,230,0,0.25)' : 'rgba(180,150,0,0.2)'}`, color: dark ? '#FFE000' : '#92400e', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
              LIMITED SPOTS
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ background: t.navBg, backdropFilter: 'blur(16px)', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <LogoFull dark={dark} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button onClick={() => setDark(p => !p)}
                style={{ background: t.bgCard, border: `1px solid ${t.border}`, color: t.textSub, fontFamily: df, fontSize: 12, padding: '7px 13px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.15s' }}>
                {dark ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>Light mode</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Dark mode</>
                )}
              </button>
              <Link href="/board" style={{ color: t.textSub, fontSize: 14, textDecoration: 'none', fontFamily: df, padding: '0 8px' }}>Browse slots</Link>
              <Link href="/apply" className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>List your business</Link>
            </div>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ background: t.heroBg, padding: '88px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          {dark && <div style={{ position: 'absolute', inset: 0, background: t.heroGlow, pointerEvents: 'none' }} />}
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', gap: 64, alignItems: 'center' }}>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <span className="live-dot" />
                <span style={{ fontFamily: df, color: t.greenText, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>LIVE · PHILADELPHIA & SOUTH JERSEY</span>
              </div>
              <h1 style={{ fontFamily: df, fontSize: 'clamp(44px,5.5vw,70px)', fontWeight: 800, lineHeight: 1.02, color: t.text, marginBottom: 24 }}>
                Empty seat.<br />
                <span style={{ color: t.greenText }}>Someone nearby</span><br />
                wants it.
              </h1>
              <p style={{ fontFamily: df, color: t.textSub, fontSize: 17, lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
                Local businesses post last-minute open slots at a discount. Nearby people claim them instantly. No empty chairs. No missed revenue.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link href="/apply" className="btn-primary">List your business →</Link>
                <Link href="/board" className="btn-ghost">Browse open slots</Link>
              </div>
              <div style={{ display: 'flex', gap: 40, borderTop: `1px solid ${t.borderFaint}`, paddingTop: 32 }}>
                {[{ val: '5%', label: 'fee per claim only' }, { val: '$0', label: 'to post a slot' }, { val: '60s', label: 'to go live' }].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: df, fontSize: 30, fontWeight: 800, color: t.greenText }}>{s.val}</div>
                    <div style={{ fontFamily: df, color: t.textMuted, fontSize: 12, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live preview cards */}
            <div style={{ width: 350, flexShrink: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontFamily: df, color: t.textMuted, fontSize: 12 }}>Live board preview</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.greenDim, border: `1px solid ${t.greenText}30`, borderRadius: 20, padding: '3px 10px' }}>
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  <span style={{ fontFamily: df, color: t.greenText, fontSize: 11, fontWeight: 600 }}>3 open now</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {PREVIEW_SLOTS.map((s, i) => (
                  <div key={i} className={`prev-card`}>
                    <div className={`prev-stripe ${s.urgent ? 'urgent' : ''}`} />
                    <div style={{ display: 'flex', alignItems: 'stretch' }}>
                      <img
                        src={CATEGORY_PHOTOS[s.cat]}
                        alt={s.cat}
                        style={{ width: 72, height: 80, objectFit: 'cover', flexShrink: 0 }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                      />
                      <div style={{ padding: '12px 14px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span style={{ fontFamily: df, color: t.textMuted, fontSize: 10, letterSpacing: '0.5px', textTransform: 'uppercase' }}>{s.cat}</span>
                          <span style={{ background: t.greenDim, color: t.greenText, fontFamily: df, fontSize: 11, fontWeight: 700, padding: '1px 8px', borderRadius: 20 }}>{s.disc}% off</span>
                        </div>
                        <div style={{ fontFamily: df, color: t.text, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.biz}</div>
                        <div style={{ fontFamily: df, color: t.textSub, fontSize: 12, marginBottom: 8 }}>{s.svc}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                          <span style={{ fontFamily: df, color: t.text, fontSize: 20, fontWeight: 800 }}>${s.deal}</span>
                          <span style={{ fontFamily: df, color: t.textMuted, fontSize: 12, textDecoration: 'line-through' }}>${s.orig}</span>
                          <span style={{ fontFamily: df, color: t.greenText, fontSize: 11, fontWeight: 600, marginLeft: 'auto' }}>{s.time}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Social proof bar */}
        <div style={{ background: dark ? '#080808' : '#f1f5f9', borderTop: `1px solid ${t.borderFaint}`, borderBottom: `1px solid ${t.borderFaint}`, padding: '18px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {[
              { val: stats.claimsThisWeek || 47, label: 'slots claimed this week' },
              { val: stats.totalBusinesses || 8, label: 'local businesses live' },
              { val: stats.totalSlots || 24, label: 'slots posted total' },
              { val: '41%', label: 'average discount' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 24px', borderLeft: i > 0 ? `1px solid ${t.borderFaint}` : 'none' }}>
                <div style={{ fontFamily: df, color: t.greenText, fontSize: 28, fontWeight: 800, lineHeight: 1 }}>{s.val}</div>
                <div style={{ fontFamily: df, color: t.textMuted, fontSize: 12, marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee */}
        <div style={{ background: t.greenText, padding: '10px 0', overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden' }}>
            <div className="marquee-track">
              {[...Array(2)].map((_, ri) =>
                ['Salons & Barbershops','Golf Courses','Fitness Studios','Spas & Massage','Restaurants','Tax Services','Yoga Studios','Nail Salons','Personal Trainers','Tattoo Artists'].map((c, i) => (
                  <span key={`${ri}-${i}`} style={{ fontFamily: df, fontWeight: 700, fontSize: 12, color: '#050505', letterSpacing: '0.5px', whiteSpace: 'nowrap', padding: '0 20px' }}>
                    {c} ·
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Active markets + Waitlist */}
        <section style={{ background: t.bg, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontFamily: df, color: t.greenText, fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 10 }}>WHERE WE'RE LIVE</div>
              <h2 style={{ fontFamily: df, fontSize: 40, fontWeight: 800, color: t.text, lineHeight: 1.05, marginBottom: 12 }}>Now open in two markets.</h2>
              <p style={{ fontFamily: df, color: t.textSub, fontSize: 16, maxWidth: 520 }}>More cities launching soon. Drop your email to be first in line when Open Slot hits your area.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.1fr', gap: 16, alignItems: 'start' }}>

              {/* Philadelphia */}
              <div className="market-card">
                <img
                  src="https://images.unsplash.com/photo-1569428034239-f9565e32e224?auto=format&fit=crop&w=600&q=80"
                  alt="Philadelphia skyline"
                  className="market-photo"
                  style={{ height: 200 }}
                />
                <div className="market-overlay" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 20, padding: '3px 10px', marginBottom: 8 }}>
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    <span style={{ fontFamily: df, color: '#00E676', fontSize: 11, fontWeight: 600 }}>LIVE NOW</span>
                  </div>
                  <div style={{ fontFamily: df, fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>Philadelphia, PA</div>
                  <div style={{ fontFamily: df, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Greater Philadelphia area</div>
                </div>
              </div>

              {/* South Jersey */}
              <div className="market-card">
                <img
                  src="https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80"
                  alt="South Jersey neighborhood"
                  className="market-photo"
                  style={{ height: 200 }}
                />
                <div className="market-overlay" />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.4)', borderRadius: 20, padding: '3px 10px', marginBottom: 8 }}>
                    <span className="live-dot" style={{ width: 5, height: 5 }} />
                    <span style={{ fontFamily: df, color: '#00E676', fontSize: 11, fontWeight: 600 }}>LIVE NOW</span>
                  </div>
                  <div style={{ fontFamily: df, fontSize: 22, fontWeight: 800, color: '#fff', marginBottom: 4 }}>South Jersey, NJ</div>
                  <div style={{ fontFamily: df, color: 'rgba(255,255,255,0.65)', fontSize: 13 }}>Gloucester, Camden & Burlington counties</div>
                </div>
              </div>

              {/* Waitlist */}
              <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 14, padding: 28 }}>
                <div style={{ fontFamily: df, fontSize: 13, fontWeight: 600, color: t.textMuted, letterSpacing: '0.5px', marginBottom: 12 }}>COMING SOON TO YOUR CITY</div>
                <h3 style={{ fontFamily: df, fontSize: 22, fontWeight: 800, color: t.text, lineHeight: 1.15, marginBottom: 8 }}>Not in your area yet?</h3>
                <p style={{ fontFamily: df, color: t.textSub, fontSize: 14, lineHeight: 1.6, marginBottom: 20 }}>Join the waitlist and we'll email you the moment Open Slot launches in your city.</p>

                {waitlistDone ? (
                  <div style={{ background: t.greenDim, border: `1px solid ${t.greenText}40`, borderRadius: 10, padding: '14px 16px', fontFamily: df, color: t.greenText, fontSize: 14, fontWeight: 500 }}>
                    ✓ You're on the list! We'll let you know when we launch near you.
                  </div>
                ) : (
                  <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
                      {WAITLIST_CITIES.map(c => (
                        <button key={c} type="button"
                          className={`city-chip ${waitlistCity === c ? 'selected' : ''}`}
                          onClick={() => setWaitlistCity(c)}
                        >{c}</button>
                      ))}
                    </div>
                    <input
                      type="email"
                      required
                      placeholder="your@email.com"
                      value={waitlistEmail}
                      onChange={e => setWaitlistEmail(e.target.value)}
                      className="waitlist-input"
                      style={{ width: '100%' }}
                    />
                    <button type="submit" disabled={waitlistLoading || !waitlistCity}
                      className="btn-primary"
                      style={{ justifyContent: 'center', opacity: !waitlistCity ? 0.5 : 1 }}
                    >
                      {waitlistLoading ? 'Joining...' : 'Notify me when you launch →'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Two sides */}
        <section style={{ background: t.bgAlt, borderTop: `1px solid ${t.borderFaint}`, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Business */}
            <div style={{ background: t.greenText, borderRadius: 16, padding: 36 }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: df, fontWeight: 600, fontSize: 11, color: '#050505', letterSpacing: '1px', background: 'rgba(0,0,0,0.12)', padding: '4px 12px', borderRadius: 20 }}>FOR BUSINESSES</span>
              </div>
              <h2 style={{ fontFamily: df, fontSize: 34, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 14 }}>Stop leaving money on the table.</h2>
              <p style={{ fontFamily: df, color: 'rgba(0,0,0,0.6)', fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Every unfilled appointment is revenue gone forever. Post your open slot in 60 seconds and get a real customer through the door today.
              </p>

              {/* Category photos grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginBottom: 24, borderRadius: 10, overflow: 'hidden' }}>
                {['Salon & barber','Fitness','Spa','Golf','Dining','Services'].map(cat => (
                  <div key={cat} style={{ position: 'relative', height: 56, overflow: 'hidden' }}>
                    <img src={CATEGORY_PHOTOS[cat]} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: df, color: '#fff', fontSize: 10, fontWeight: 600, textAlign: 'center', padding: '0 4px', lineHeight: 1.2 }}>{cat}</span>
                    </div>
                  </div>
                ))}
              </div>

              {['Vetted businesses only', 'Post in 60 seconds', 'Email when claimed', '5% fee on claims only'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 14 }}>✓</span>
                  <span style={{ fontFamily: df, color: 'rgba(0,0,0,0.7)', fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <Link href="/apply" style={{ marginTop: 20, display: 'inline-block', background: '#050505', color: '#fff', fontFamily: df, fontWeight: 600, padding: '13px 24px', borderRadius: 8, textDecoration: 'none', fontSize: 14 }}>Apply as a business →</Link>
            </div>

            {/* Consumer */}
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 36 }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: df, fontWeight: 600, fontSize: 11, color: t.textMuted, letterSpacing: '1px', background: t.bgAlt, border: `1px solid ${t.border}`, padding: '4px 12px', borderRadius: 20 }}>FOR CONSUMERS</span>
              </div>
              <h2 style={{ fontFamily: df, fontSize: 34, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 14 }}>Get more for less, on your schedule.</h2>
              <p style={{ fontFamily: df, color: t.textSub, fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                Browse live discounted slots from vetted local businesses. Post what you need. Set a price watch on your favorites.
              </p>

              {/* Real photos */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 24, borderRadius: 10, overflow: 'hidden' }}>
                {[
                  { photo: CATEGORY_PHOTOS['Salon & barber'], label: 'Haircuts from $15' },
                  { photo: CATEGORY_PHOTOS['Spa'], label: 'Massages from $45' },
                  { photo: CATEGORY_PHOTOS['Golf'], label: '9 holes from $22' },
                  { photo: CATEGORY_PHOTOS['Dining'], label: 'Dining from $35' },
                ].map((item, i) => (
                  <div key={i} style={{ position: 'relative', height: 70, overflow: 'hidden' }}>
                    <img src={item.photo} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <span style={{ fontFamily: df, color: '#fff', fontSize: 12, fontWeight: 600 }}>{item.label}</span>
                    </div>
                  </div>
                ))}
              </div>

              {['Real-time board of deals near you', '"I need" requests — businesses come to you', 'Price watch alerts for your favorites', 'Always completely free for consumers'].map(f => (
                <div key={f} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: t.greenText, fontSize: 14 }}>✓</span>
                  <span style={{ fontFamily: df, color: t.textSub, fontSize: 14 }}>{f}</span>
                </div>
              ))}
              <Link href="/board" className="btn-ghost" style={{ marginTop: 20, fontSize: 14, padding: '12px 24px' }}>Browse open slots →</Link>
            </div>
          </div>
        </section>

        {/* Pilot section */}
        <section style={{ background: t.bg, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ background: dark ? 'linear-gradient(135deg,#0a1800,#050d00)' : 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: `1px solid ${dark ? 'rgba(0,230,118,0.15)' : 'rgba(5,150,105,0.2)'}`, borderRadius: 20, padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(255,230,0,0.08)' : 'rgba(180,150,0,0.08)', border: `1px solid ${dark ? 'rgba(255,230,0,0.2)' : 'rgba(180,150,0,0.2)'}`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
                  <span>🚀</span>
                  <span style={{ fontFamily: df, color: dark ? '#FFE000' : '#92400e', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>FOUNDING LAUNCH PILOT</span>
                </div>
                <h2 style={{ fontFamily: df, fontSize: 36, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 12 }}>
                  First 3 months.<br /><span style={{ color: t.greenText }}>Completely free.</span>
                </h2>
                <p style={{ fontFamily: df, color: t.textSub, fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                  Open Slot is in its founding launch phase. We're onboarding our first businesses in Philadelphia and South Jersey right now — and for the first 3 months, there are zero fees for everyone.
                </p>
                <p style={{ fontFamily: df, color: t.textMuted, fontSize: 13 }}>After the pilot, businesses pay 5% when a slot is claimed. Consumers are always free.</p>
              </div>
              <div>
                {[
                  { text: 'Free to list your business', sub: 'No credit card, no commitment' },
                  { text: 'Zero fees for 3 months', sub: 'Keep 100% of every claim during pilot' },
                  { text: 'Free for all consumers', sub: 'No account needed to browse and claim' },
                  { text: 'Founding member status', sub: 'Early businesses get priority placement forever' },
                  { text: 'Direct access to the builder', sub: 'Real support while we grow together' },
                ].map((f, i) => (
                  <div key={i} className="feat-row">
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.greenDim, border: `1px solid ${t.greenText}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: t.greenText, fontSize: 11, fontWeight: 700 }}>✓</span>
                    </div>
                    <div>
                      <div style={{ fontFamily: df, color: t.text, fontSize: 14, fontWeight: 600 }}>{f.text}</div>
                      <div style={{ fontFamily: df, color: t.textMuted, fontSize: 12 }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
                <Link href="/apply" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Join the pilot →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section style={{ background: t.bgAlt, borderTop: `1px solid ${t.borderFaint}`, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ fontFamily: df, color: t.greenText, fontSize: 12, fontWeight: 600, letterSpacing: '1px', marginBottom: 10 }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: df, fontSize: 40, fontWeight: 800, color: t.text, lineHeight: 1.05 }}>Two sides.<br />One simple exchange.</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { n: '01', title: 'Business posts a slot', body: 'An approved local business has a 2 PM opening. They post it in 60 seconds — service, time, deal price.', photo: CATEGORY_PHOTOS['Salon & barber'] },
                { n: '02', title: 'Nearby consumer sees it', body: 'People nearby see it on the live board instantly. Price watch users get an email the moment it matches.', photo: CATEGORY_PHOTOS['Fitness'] },
                { n: '03', title: 'Slot claimed. Chair filled.', body: "Consumer pays the deal price. Business fills revenue they'd have lost. Zero waste on both sides.", photo: CATEGORY_PHOTOS['Spa'] },
              ].map(s => (
                <div key={s.n} className="how-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', height: 120 }}>
                    <img src={s.photo} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', padding: '12px 16px' }}>
                      <div style={{ fontFamily: df, fontWeight: 800, fontSize: 36, color: 'rgba(0,230,118,0.6)', lineHeight: 1 }}>{s.n}</div>
                    </div>
                  </div>
                  <div style={{ padding: '20px 22px' }}>
                    <h3 style={{ fontFamily: df, color: t.text, fontSize: 18, fontWeight: 700, marginBottom: 8, lineHeight: 1.2 }}>{s.title}</h3>
                    <p style={{ fontFamily: df, color: t.textSub, fontSize: 14, lineHeight: 1.7 }}>{s.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section style={{ background: t.greenText, padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: df, fontSize: 44, fontWeight: 800, color: '#050505', lineHeight: 1.05, marginBottom: 16 }}>Ready to fill your empty slots?</h2>
            <p style={{ fontFamily: df, color: 'rgba(0,0,0,0.55)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Join the founding businesses going live in Philadelphia & South Jersey. First 3 months completely free.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/apply" style={{ background: '#050505', color: '#fff', fontFamily: df, fontWeight: 600, padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 15 }}>Apply as a business →</Link>
              <Link href="/board" style={{ background: 'transparent', color: '#050505', fontFamily: df, fontWeight: 500, padding: '14px 28px', borderRadius: 8, textDecoration: 'none', fontSize: 15, border: '2px solid rgba(0,0,0,0.2)' }}>Browse open slots</Link>
            </div>
          </div>
        </section>

        <footer style={{ background: t.bg, borderTop: `1px solid ${t.borderFaint}`, padding: '24px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 6 }}>
            <LogoMark size={20} />
            <span style={{ fontFamily: df, color: t.textMuted, fontSize: 13 }}>Open Slot · Philadelphia & South Jersey · Founding Launch 2026</span>
          </div>
        </footer>
      </div>

      {/* ═══════════════════════════════════
          MOBILE VERSION — always dark
      ═══════════════════════════════════ */}
      <div className="mobile-only" style={{ background: '#050505', minHeight: '100vh' }}>

        {/* Pilot bar */}
        <div className="mob-pilot">
          <span style={{ fontFamily: 'Outfit, sans-serif', color: '#FFE000', fontSize: 12, fontWeight: 500 }}>
            🚀 Founding Pilot — First 3 months free · Philly & South Jersey
          </span>
        </div>

        {/* Nav */}
        <div className="mob-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <LogoMark size={30} />
            <span style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f0f0', fontSize: 16, fontWeight: 700 }}>Open Slot</span>
          </div>
          <Link href="/apply" style={{ background: '#00E676', color: '#050505', fontFamily: 'Outfit, sans-serif', fontWeight: 700, padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>
            List biz →
          </Link>
        </div>

        {/* Hero */}
        <div className="mob-hero">
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 20 }}>
            <span className="live-dot" />
            <span style={{ fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>LIVE · PHILLY & SOUTH JERSEY</span>
          </div>
          <h1 className="mob-h1">
            Empty seat.<br />
            <span style={{ color: '#00E676' }}>Fill it now.</span>
          </h1>
          <p className="mob-sub">Last-minute deals from vetted local businesses. Claim in seconds, no account needed.</p>
          <div className="mob-cta-col">
            <Link href="/board" className="mob-btn-g">Browse open slots near me →</Link>
            <Link href="/apply" className="mob-btn-o">List your business — 3 months free</Link>
          </div>

          {/* Stats */}
          <div className="mob-stats">
            <div className="mob-stat">
              <div className="mob-stat-val">{stats.claimsThisWeek || 47}</div>
              <div className="mob-stat-label">claimed this week</div>
            </div>
            <div className="mob-stat">
              <div className="mob-stat-val">{stats.totalBusinesses || 8}</div>
              <div className="mob-stat-label">businesses live</div>
            </div>
            <div className="mob-stat">
              <div className="mob-stat-val">41%</div>
              <div className="mob-stat-label">avg discount</div>
            </div>
            <div className="mob-stat">
              <div className="mob-stat-val">$0</div>
              <div className="mob-stat-label">to post a slot</div>
            </div>
          </div>

          {/* Live slot previews */}
          <div style={{ fontFamily: 'Outfit, sans-serif', color: '#666', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 10 }}>LIVE SLOTS RIGHT NOW</div>
          {PREVIEW_SLOTS.slice(0,2).map((s, i) => (
            <div key={i} className="mob-slot-preview">
              <img
                src={CATEGORY_PHOTOS[s.cat]}
                alt={s.cat}
                className="mob-slot-img"
                onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <div className="mob-slot-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f0f0', fontSize: 15, fontWeight: 700, marginBottom: 2 }}>{s.biz}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#888', fontSize: 12 }}>{s.svc}</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f0f0', fontSize: 22, fontWeight: 800, lineHeight: 1 }}>${s.deal}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#555', fontSize: 11, textDecoration: 'line-through' }}>${s.orig}</div>
                    <div style={{ fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 11, fontWeight: 700 }}>{s.disc}% off</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <Link href="/board" style={{ fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 14, textDecoration: 'none', display: 'block', textAlign: 'center', paddingTop: 12, fontWeight: 500 }}>
            See all open slots →
          </Link>
        </div>

        {/* Markets */}
        <div className="mob-section mob-section-bg">
          <div className="mob-section-title">Now live in 2 cities</div>
          <div className="mob-section-sub">Launching in more cities soon.</div>
          {[
            { city: 'Philadelphia, PA', desc: 'Greater Philadelphia area', photo: 'https://images.unsplash.com/photo-1569428034239-f9565e32e224?auto=format&fit=crop&w=600&q=80' },
            { city: 'South Jersey, NJ', desc: 'Gloucester, Camden & Burlington counties', photo: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&w=600&q=80' },
          ].map(m => (
            <div key={m.city} className="mob-market-card">
              <img src={m.photo} alt={m.city} className="mob-market-img" />
              <div className="mob-market-overlay">
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(0,230,118,0.2)', border: '1px solid rgba(0,230,118,0.35)', borderRadius: 20, padding: '3px 10px', marginBottom: 6, width: 'fit-content' }}>
                  <span className="live-dot" style={{ width: 5, height: 5 }} />
                  <span style={{ fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 10, fontWeight: 600 }}>LIVE NOW</span>
                </div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 20, fontWeight: 800, color: '#fff' }}>{m.city}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{m.desc}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Waitlist */}
        <div className="mob-waitlist-section">
          <div className="mob-section-title">Not in your city yet?</div>
          <div className="mob-section-sub">Join the waitlist and be first when we launch near you.</div>

          {waitlistDone ? (
            <div style={{ background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: 12, padding: 16, fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 15, fontWeight: 500, textAlign: 'center' }}>
              ✓ You're on the list! We'll email you when we launch near you.
            </div>
          ) : (
            <form onSubmit={handleWaitlist} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="mob-city-scroll">
                {WAITLIST_CITIES.map(c => (
                  <button key={c} type="button"
                    className={`mob-city-chip ${waitlistCity === c ? 'selected' : ''}`}
                    onClick={() => setWaitlistCity(c)}
                  >{c}</button>
                ))}
              </div>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={waitlistEmail}
                onChange={e => setWaitlistEmail(e.target.value)}
                className="mob-input"
              />
              <button type="submit" disabled={waitlistLoading || !waitlistCity}
                style={{ padding: '15px', background: !waitlistCity ? '#222' : '#00E676', color: !waitlistCity ? '#555' : '#050505', fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: 16, border: 'none', borderRadius: 10, cursor: waitlistCity ? 'pointer' : 'default' }}>
                {waitlistLoading ? 'Joining...' : 'Notify me when you launch →'}
              </button>
            </form>
          )}
        </div>

        {/* For businesses */}
        <div className="mob-section" style={{ background: '#080808' }}>
          <div className="mob-section-title">For businesses</div>
          <div className="mob-section-sub">Zero fees for your first 3 months. 60 seconds to post.</div>

          {/* Category photo strip */}
          <div style={{ display: 'flex', gap: 8, overflow: 'hidden', borderRadius: 12, marginBottom: 20, height: 80 }}>
            {['Salon & barber','Fitness','Spa','Golf'].map(cat => (
              <div key={cat} style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <img src={CATEGORY_PHOTOS[cat]} alt={cat} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)' }} />
              </div>
            ))}
          </div>

          {[
            { icon: '⏱', title: 'Post in 60 seconds', sub: 'Service, time, price. That\'s it.' },
            { icon: '💰', title: 'Zero fees, 3 months', sub: 'Keep everything during the pilot.' },
            { icon: '📧', title: 'Email when claimed', sub: 'Know instantly when someone books.' },
            { icon: '📍', title: 'Hyperlocal reach', sub: 'Consumers already looking nearby.' },
          ].map((f, i) => (
            <div key={i} className="mob-feat-card">
              <div style={{ fontSize: 24, flexShrink: 0, marginTop: 2 }}>{f.icon}</div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f0f0', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', color: '#777', fontSize: 14 }}>{f.sub}</div>
              </div>
            </div>
          ))}
          <Link href="/apply" style={{ display: 'block', marginTop: 6, background: '#00E676', color: '#050505', fontFamily: 'Outfit, sans-serif', fontWeight: 700, padding: '15px', borderRadius: 12, textDecoration: 'none', fontSize: 16, textAlign: 'center' }}>
            Apply as a business — free →
          </Link>
        </div>

        {/* How it works */}
        <div className="mob-section">
          <div className="mob-section-title">How it works</div>
          <div className="mob-section-sub">Simple on both sides.</div>
          {[
            { n: '01', title: 'Business posts', body: 'Approved business posts empty time in 60 seconds with a deal price.', photo: CATEGORY_PHOTOS['Salon & barber'] },
            { n: '02', title: 'Consumer finds it', body: 'Shows on the live board instantly. Price watch gets you an email alert.', photo: CATEGORY_PHOTOS['Fitness'] },
            { n: '03', title: 'Both sides win', body: 'Consumer saves money. Business fills revenue they\'d have lost.', photo: CATEGORY_PHOTOS['Dining'] },
          ].map(s => (
            <div key={s.n} className="mob-step">
              <div style={{ width: 56, height: 56, borderRadius: 12, overflow: 'hidden', flexShrink: 0, position: 'relative' }}>
                <img src={s.photo} alt={s.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontFamily: 'Outfit, sans-serif', color: '#00E676', fontSize: 16, fontWeight: 800 }}>{s.n}</span>
                </div>
              </div>
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', color: '#f0f0f0', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', color: '#777', fontSize: 13, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mob-bottom-cta">
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 32, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 10 }}>
            Ready to find a deal?
          </h2>
          <p style={{ fontFamily: 'Outfit, sans-serif', color: 'rgba(0,0,0,0.55)', fontSize: 14, marginBottom: 20 }}>
            Browse live slots from vetted local businesses near you.
          </p>
          <Link href="/board" style={{ display: 'block', background: '#050505', color: '#fff', fontFamily: 'Outfit, sans-serif', fontWeight: 700, padding: '16px', borderRadius: 12, textDecoration: 'none', fontSize: 16, textAlign: 'center' }}>
            Browse open slots →
          </Link>
        </div>

        <div className="mob-footer">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <LogoMark size={18} />
            <span style={{ fontFamily: 'Outfit, sans-serif', color: '#444', fontSize: 11 }}>Open Slot · Philadelphia & South Jersey · 2026</span>
          </div>
        </div>
      </div>
    </>
  )
}