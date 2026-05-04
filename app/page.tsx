'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const FONTS = [
  { label: 'Syne (Current)', value: 'Syne' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Bebas Neue', value: 'Bebas Neue' },
  { label: 'Outfit', value: 'Outfit' },
  { label: 'Raleway', value: 'Raleway' },
]

interface Stats {
  claimsThisWeek: number
  totalBusinesses: number
  totalSlots: number
  totalClaims: number
}

export default function Home() {
  const [dark, setDark] = useState(true)
  const [font, setFont] = useState('Syne')
  const [showFontMenu, setShowFontMenu] = useState(false)
  const [stats, setStats] = useState<Stats>({ claimsThisWeek: 0, totalBusinesses: 0, totalSlots: 0, totalClaims: 0 })

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats).catch(() => {})
  }, [])

  // Theme tokens
  const t = {
    bg:        dark ? '#050505' : '#ffffff',
    bgAlt:     dark ? '#0c0c0c' : '#f8f9fa',
    bgCard:    dark ? '#111111' : '#ffffff',
    border:    dark ? '#1e1e1e' : '#e5e7eb',
    borderFaint: dark ? '#161616' : '#f3f4f6',
    text:      dark ? '#ffffff' : '#0a0a0a',
    textSub:   dark ? 'rgba(255,255,255,0.45)' : '#4b5563',
    textMuted: dark ? 'rgba(255,255,255,0.25)' : '#9ca3af',
    green:     '#00E676',
    greenBg:   dark ? 'rgba(0,230,118,0.1)' : 'rgba(0,180,90,0.08)',
    greenText: dark ? '#00E676' : '#059669',
    navBg:     dark ? 'rgba(5,5,5,0.92)' : 'rgba(255,255,255,0.95)',
    pilotBg:   dark ? 'linear-gradient(135deg,#1a1a00,#0d1a00)' : 'linear-gradient(135deg,#fefce8,#f0fdf4)',
    pilotBorder: dark ? 'rgba(255,230,0,0.2)' : 'rgba(180,150,0,0.25)',
    pilotText: dark ? '#FFE000' : '#92400e',
  }

  const df = `'${font}', sans-serif`

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Playfair+Display:wght@700;800&family=Bebas+Neue&family=Outfit:wght@700;800&family=Raleway:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: ${t.bg}; transition: background 0.3s; }
        .os-body { font-family: 'DM Sans', sans-serif; }

        /* Slot preview card */
        .prev-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 12px; padding: 18px 18px 18px 22px; position: relative; overflow: hidden; transition: all 0.3s; }
        .prev-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${t.greenText}; }
        .prev-card.urgent::before { background: #FF5252; }
        .prev-card.warn::before { background: #FFB300; }

        /* Marquee */
        .marquee-track { display: flex; gap: 12px; width: max-content; animation: marquee 22s linear infinite; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }

        /* How it works cards */
        .how-card { background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 12px; padding: 28px; transition: border-color 0.2s, background 0.3s; }
        .how-card:hover { border-color: ${t.greenText}40; }

        /* Feature list */
        .feat-item { display: flex; align-items: flex-start; gap: 10px; padding: 10px 0; border-bottom: 1px solid ${t.borderFaint}; }
        .feat-item:last-child { border-bottom: none; }

        /* Font switcher */
        .font-menu { position: absolute; top: calc(100% + 8px); right: 0; background: ${t.bgCard}; border: 1px solid ${t.border}; border-radius: 10px; padding: 6px; z-index: 200; min-width: 180px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
        .font-opt { padding: 8px 12px; border-radius: 6px; cursor: pointer; font-size: 13px; color: ${t.text}; font-family: 'DM Sans', sans-serif; transition: background 0.12s; }
        .font-opt:hover { background: ${t.greenBg}; }
        .font-opt.active { color: ${t.greenText}; font-weight: 600; }

        /* Buttons */
        .btn-primary { background: ${t.greenText}; color: ${dark ? '#050505' : '#fff'}; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 13px 26px; border-radius: 6px; border: none; cursor: pointer; font-size: 15px; transition: transform 0.15s, box-shadow 0.15s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px ${t.greenText}40; }
        .btn-ghost { background: transparent; color: ${t.text}; font-family: 'DM Sans', sans-serif; font-weight: 400; padding: 13px 26px; border-radius: 6px; border: 1px solid ${t.border}; cursor: pointer; font-size: 15px; transition: all 0.15s; display: inline-flex; align-items: center; gap: 8px; text-decoration: none; }
        .btn-ghost:hover { border-color: ${t.textSub}; background: ${t.greenBg}; }

        /* Live dot */
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: ${t.greenText}; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

        /* ─── MOBILE ONLY ─── */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mob-hero { background: ${dark ? '#050505' : '#0a0a0a'}; padding: 0; min-height: 100vh; display: flex; flex-direction: column; }
          .mob-nav { background: ${dark ? 'rgba(5,5,5,0.95)' : 'rgba(10,10,10,0.95)'}; padding: 14px 20px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); position: sticky; top: 0; z-index: 50; }
          .mob-pilot-bar { background: rgba(255,230,0,0.1); border-bottom: 1px solid rgba(255,230,0,0.15); padding: 8px 20px; text-align: center; }
          .mob-hero-content { flex: 1; padding: 32px 20px 24px; display: flex; flex-direction: column; justify-content: space-between; }
          .mob-headline { font-family: ${df}; font-size: clamp(38px, 11vw, 54px); font-weight: 800; color: #fff; line-height: 1.0; margin-bottom: 16px; }
          .mob-sub { font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.45); font-size: 15px; line-height: 1.65; margin-bottom: 28px; }
          .mob-cta-row { display: flex; flex-direction: column; gap: 10px; margin-bottom: 32px; }
          .mob-btn-primary { background: ${t.greenText}; color: #050505; font-family: 'DM Sans', sans-serif; font-weight: 700; padding: 16px; border-radius: 10px; border: none; cursor: pointer; font-size: 16px; text-align: center; text-decoration: none; display: block; }
          .mob-btn-ghost { background: rgba(255,255,255,0.06); color: #fff; font-family: 'DM Sans', sans-serif; font-weight: 500; padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.12); cursor: pointer; font-size: 15px; text-align: center; text-decoration: none; display: block; }
          .mob-stats-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 28px; }
          .mob-stat { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.07); border-radius: 12px; padding: 14px; }
          .mob-stat-val { font-family: ${df}; font-size: 28px; font-weight: 800; color: ${t.greenText}; line-height: 1; margin-bottom: 4px; }
          .mob-stat-label { font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.3); font-size: 11px; }
          .mob-live-slots { margin-bottom: 20px; }
          .mob-slot-card { background: #111; border: 1px solid #1e1e1e; border-radius: 12px; padding: 16px; margin-bottom: 10px; position: relative; overflow: hidden; }
          .mob-slot-card::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${t.greenText}; }
          .mob-slot-card.urgent::before { background: #FF5252; }
          .mob-section { background: #0a0a0a; padding: 36px 20px; border-top: 1px solid #111; }
          .mob-section-title { font-family: ${df}; font-size: 28px; font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 8px; }
          .mob-section-sub { font-family: 'DM Sans', sans-serif; color: rgba(255,255,255,0.4); font-size: 14px; margin-bottom: 20px; }
          .mob-feature-card { background: #111; border: 1px solid #1e1e1e; border-radius: 14px; padding: 20px; margin-bottom: 10px; }
          .mob-step { display: flex; gap: 14px; padding: 16px 0; border-bottom: 1px solid #111; }
          .mob-step:last-child { border-bottom: none; }
          .mob-step-num { font-family: ${df}; font-size: 40px; font-weight: 800; color: rgba(0,230,118,0.15); line-height: 1; flex-shrink: 0; width: 44px; }
          .mob-footer { background: #050505; border-top: 1px solid #111; padding: 20px; text-align: center; }
          .mob-bottom-cta { background: ${t.greenText}; margin: 0; padding: 28px 20px; text-align: center; }
        }

        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

      {/* ═══════════════════════════════════════
          DESKTOP VERSION
      ═══════════════════════════════════════ */}
      <div className="desktop-only" style={{ background: t.bg, minHeight: '100vh', transition: 'background 0.3s' }}>

        {/* Pilot banner */}
        <div style={{ background: t.pilotBg, borderBottom: `1px solid ${t.pilotBorder}`, padding: '10px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <span style={{ fontSize: 15 }}>🚀</span>
            <span className="os-body" style={{ color: t.pilotText, fontSize: 13, fontWeight: 500 }}>
              Founding Launch Pilot — First 3 months completely free for businesses & consumers · South Jersey
            </span>
            <span style={{ background: dark ? 'rgba(255,230,0,0.15)' : 'rgba(180,150,0,0.12)', border: `1px solid ${t.pilotBorder}`, color: t.pilotText, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>
              LIMITED SPOTS
            </span>
          </div>
        </div>

        {/* NAV */}
        <nav style={{ background: t.navBg, backdropFilter: 'blur(12px)', borderBottom: `1px solid ${t.border}`, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, background: t.greenText, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" stroke={dark ? '#050505' : '#fff'} strokeWidth="1.6"/>
                  <path d="M8 5v6M5 8h6" stroke={dark ? '#050505' : '#fff'} strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
              </div>
              <span style={{ fontFamily: df, color: t.text, fontSize: 17, fontWeight: 700 }}>Open Slot</span>
            </div>

            {/* Right controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

              {/* Font switcher */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowFontMenu(p => !p)}
                  style={{ background: t.bgCard, border: `1px solid ${t.border}`, color: t.textSub, fontFamily: 'DM Sans, sans-serif', fontSize: 12, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
                  Font
                </button>
                {showFontMenu && (
                  <div className="font-menu">
                    {FONTS.map(f => (
                      <div key={f.value}
                        className={`font-opt ${font === f.value ? 'active' : ''}`}
                        style={{ fontFamily: `'${f.value}', sans-serif` }}
                        onClick={() => { setFont(f.value); setShowFontMenu(false) }}
                      >
                        {f.label}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dark/light toggle */}
              <button
                onClick={() => setDark(p => !p)}
                style={{ background: t.bgCard, border: `1px solid ${t.border}`, color: t.textSub, fontFamily: 'DM Sans, sans-serif', fontSize: 12, padding: '6px 12px', borderRadius: 6, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
              >
                {dark ? (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>Light</>
                ) : (
                  <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>Dark</>
                )}
              </button>

              <Link href="/board" style={{ color: t.textSub, fontSize: 14, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif', padding: '0 8px' }}>Browse slots</Link>
              <Link href="/apply" className="btn-primary" style={{ padding: '8px 16px', fontSize: 13 }}>List your business</Link>
            </div>
          </div>
        </nav>

        {/* HERO */}
        <section style={{ background: dark ? '#050505' : '#f8f9fa', padding: '90px 24px 80px', position: 'relative', overflow: 'hidden' }}>
          {dark && (
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 60% at 60% 0%, rgba(0,230,118,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
          )}
          <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', gap: 60, alignItems: 'center' }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <div className="live-dot" />
                <span className="os-body" style={{ color: t.greenText, fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>LIVE · SOUTH JERSEY</span>
              </div>
              <h1 style={{ fontFamily: df, fontSize: 'clamp(42px,5.5vw,68px)', fontWeight: 800, lineHeight: 1.05, color: t.text, marginBottom: 24 }}>
                Empty seat.<br />
                <span style={{ color: t.greenText }}>Someone nearby</span><br />
                wants it.
              </h1>
              <p className="os-body" style={{ color: t.textSub, fontSize: 17, lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
                Local businesses post last-minute open slots at a discount. Nearby people claim them instantly. No empty chairs. No missed revenue.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link href="/apply" className="btn-primary">List your business →</Link>
                <Link href="/board" className="btn-ghost">Browse open slots</Link>
              </div>
              <div style={{ display: 'flex', gap: 36, borderTop: `1px solid ${t.borderFaint}`, paddingTop: 32 }}>
                {[{ val: '5%', label: 'fee per claim only' }, { val: '$0', label: 'to post a slot' }, { val: '60s', label: 'to go live' }].map(s => (
                  <div key={s.label}>
                    <div style={{ fontFamily: df, fontSize: 28, fontWeight: 800, color: t.greenText }}>{s.val}</div>
                    <div className="os-body" style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — live preview */}
            <div style={{ width: 340, flexShrink: 0 }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="os-body" style={{ color: t.textMuted, fontSize: 12 }}>Live board preview</span>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: t.greenBg, border: `1px solid ${t.greenText}30`, borderRadius: 20, padding: '3px 10px' }}>
                  <div className="live-dot" style={{ width: 5, height: 5 }} />
                  <span className="os-body" style={{ color: t.greenText, fontSize: 11, fontWeight: 500 }}>3 open now</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { biz: "Mario's Barbershop", svc: "Men's cut + fade", time: "Today · 2:30 PM", orig: 35, deal: 20, disc: 43, cat: 'SALON', urgent: true },
                  { biz: "Serenity Spa", svc: "60-min deep tissue", time: "Today · 3:00 PM", orig: 95, deal: 60, disc: 37, cat: 'SPA', warn: true },
                  { biz: "Iron Body Fitness", svc: "Evening spin class", time: "Today · 5:30 PM", orig: 28, deal: 14, disc: 50, cat: 'FITNESS', urgent: false },
                ].map((s, i) => (
                  <div key={i} className={`prev-card ${s.urgent ? 'urgent' : s.warn ? 'warn' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span className="os-body" style={{ color: t.textMuted, fontSize: 11, letterSpacing: '0.5px' }}>{s.cat}</span>
                      <span className="os-body" style={{ background: t.greenBg, color: t.greenText, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{s.disc}% off</span>
                    </div>
                    <div style={{ fontFamily: df, color: t.text, fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.biz}</div>
                    <div className="os-body" style={{ color: t.textSub, fontSize: 12, marginBottom: 10 }}>{s.svc}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span style={{ fontFamily: df, color: t.text, fontSize: 22, fontWeight: 800 }}>${s.deal}</span>
                        <span className="os-body" style={{ color: t.textMuted, fontSize: 12, textDecoration: 'line-through' }}>${s.orig}</span>
                      </div>
                      <span className="os-body" style={{ color: t.textMuted, fontSize: 11 }}>{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* SOCIAL PROOF */}
        <div style={{ background: dark ? '#050505' : '#f1f5f9', borderTop: `1px solid ${t.borderFaint}`, borderBottom: `1px solid ${t.borderFaint}`, padding: '20px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {[
              { icon: '⚡', val: stats.claimsThisWeek, label: 'slots claimed this week' },
              { icon: '🏪', val: stats.totalBusinesses, label: 'local businesses live' },
              { icon: '📋', val: stats.totalSlots, label: 'slots posted total' },
              { icon: '🎯', val: stats.totalClaims, label: 'total claims made' },
            ].map((s, i) => (
              <div key={i} style={{ padding: '0 28px', borderLeft: i > 0 ? `1px solid ${t.borderFaint}` : 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 22 }}>{s.icon}</span>
                <div>
                  <div style={{ fontFamily: df, color: t.greenText, fontSize: 26, lineHeight: 1, fontWeight: 800 }}>{s.val}</div>
                  <div className="os-body" style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* MARQUEE */}
        <div style={{ background: t.greenText, padding: '11px 0', overflow: 'hidden' }}>
          <div style={{ overflow: 'hidden', position: 'relative' }}>
            <div className="marquee-track">
              {[...Array(2)].map((_, ri) =>
                ['Salons & Barbershops','Golf Courses','Fitness Studios','Spas & Massage','Restaurants','Tax Services','Yoga Studios','Nail Salons','Personal Trainers','Tattoo Artists'].map((c, i) => (
                  <span key={`${ri}-${i}`} style={{ fontFamily: df, fontWeight: 700, fontSize: 12, color: '#050505', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                    {c} &nbsp;&nbsp;·&nbsp;&nbsp;
                  </span>
                ))
              )}
            </div>
          </div>
        </div>

        {/* TWO SIDES */}
        <section style={{ background: t.bg, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Business */}
            <div style={{ background: t.greenText, borderRadius: 16, padding: 36 }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 11, color: '#050505', letterSpacing: '1px', background: 'rgba(0,0,0,0.12)', padding: '4px 10px', borderRadius: 20 }}>FOR BUSINESSES</span>
              </div>
              <h2 style={{ fontFamily: df, fontSize: 34, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 16 }}>Stop leaving money<br />on the table.</h2>
              <p className="os-body" style={{ color: 'rgba(0,0,0,0.55)', fontSize: 16, lineHeight: 1.65, marginBottom: 28 }}>
                Every unfilled appointment is revenue gone forever. Post your open slot in 60 seconds and get a real customer in the door today.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Vetted businesses only — keeps the board trusted','Post in under 60 seconds, any time','Email alert the moment your slot is claimed','5% fee only when someone actually pays'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: 14, marginTop: 2 }}>✓</span>
                    <span className="os-body" style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/apply" style={{ background: '#050505', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '13px 24px', borderRadius: 6, textDecoration: 'none', fontSize: 14, display: 'inline-block' }}>Apply as a business →</Link>
            </div>

            {/* Consumer */}
            <div style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 16, padding: 36 }}>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 11, color: t.textMuted, letterSpacing: '1px', background: t.bgAlt, border: `1px solid ${t.border}`, padding: '4px 10px', borderRadius: 20 }}>FOR CONSUMERS</span>
              </div>
              <h2 style={{ fontFamily: df, fontSize: 34, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 16 }}>Get more for less,<br />on your schedule.</h2>
              <p className="os-body" style={{ color: t.textSub, fontSize: 16, lineHeight: 1.65, marginBottom: 28 }}>
                Browse live discounted slots from local businesses. Post what you need. Set a price watch on your favorites.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {['Real-time board of deals near you','Post an "I need" — businesses come to you','Price watch alerts for your favorite spots','Always free for consumers'].map(f => (
                  <li key={f} style={{ display: 'flex', gap: 10 }}>
                    <span style={{ color: t.greenText, fontSize: 14, marginTop: 2 }}>✓</span>
                    <span className="os-body" style={{ color: t.textSub, fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/board" className="btn-ghost" style={{ fontSize: 14, padding: '12px 24px' }}>Browse open slots →</Link>
            </div>
          </div>
        </section>

        {/* PILOT SECTION */}
        <section style={{ background: t.bg, padding: '0 24px 80px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ background: dark ? 'linear-gradient(135deg,#0a1a00,#050d00)' : 'linear-gradient(135deg,#f0fdf4,#ecfdf5)', border: `1px solid ${dark ? 'rgba(0,230,118,0.2)' : 'rgba(5,150,105,0.2)'}`, borderRadius: 20, padding: 48, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: dark ? 'rgba(255,230,0,0.1)' : 'rgba(180,150,0,0.08)', border: `1px solid ${t.pilotBorder}`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
                  <span style={{ fontSize: 14 }}>🚀</span>
                  <span className="os-body" style={{ color: t.pilotText, fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>FOUNDING LAUNCH PILOT</span>
                </div>
                <h2 style={{ fontFamily: df, fontSize: 36, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 12 }}>
                  First 3 months.<br /><span style={{ color: t.greenText }}>Completely free.</span>
                </h2>
                <p className="os-body" style={{ color: t.textSub, fontSize: 15, lineHeight: 1.7, marginBottom: 20 }}>
                  Open Slot is in its founding launch phase in South Jersey. We're onboarding our first local businesses right now — and for the first 3 months, there are zero fees for everyone.
                </p>
                <p className="os-body" style={{ color: t.textMuted, fontSize: 13 }}>
                  After the pilot, businesses pay just 5% when a slot is claimed. Consumers are always free.
                </p>
              </div>
              <div>
                {[
                  { text: 'Free to list your business', sub: 'No credit card, no commitment' },
                  { text: 'Zero fees for 3 months', sub: 'Keep 100% of every claim during pilot' },
                  { text: 'Free for all consumers', sub: 'Browse and claim with no account needed' },
                  { text: 'Founding member status', sub: 'Early businesses get priority placement forever' },
                  { text: 'Direct access to the builder', sub: 'Real support while we grow together' },
                ].map((f, i) => (
                  <div key={i} className="feat-item">
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: t.greenBg, border: `1px solid ${t.greenText}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: t.greenText, fontSize: 11, fontWeight: 700 }}>✓</span>
                    </div>
                    <div>
                      <div className="os-body" style={{ color: t.text, fontSize: 14, fontWeight: 500 }}>{f.text}</div>
                      <div className="os-body" style={{ color: t.textMuted, fontSize: 12 }}>{f.sub}</div>
                    </div>
                  </div>
                ))}
                <Link href="/apply" className="btn-primary" style={{ marginTop: 24, display: 'inline-flex' }}>Join the pilot →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section style={{ background: t.bgAlt, borderTop: `1px solid ${t.borderFaint}`, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ marginBottom: 48 }}>
              <div className="os-body" style={{ color: t.greenText, fontSize: 12, fontWeight: 500, letterSpacing: '1px', marginBottom: 10 }}>HOW IT WORKS</div>
              <h2 style={{ fontFamily: df, fontSize: 40, fontWeight: 800, color: t.text, lineHeight: 1.05 }}>Two sides.<br />One simple exchange.</h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
              {[
                { n: '01', title: 'Business posts a slot', body: 'An approved local business has a 2 PM opening. They post it in 60 seconds — service, time, their deal price.' },
                { n: '02', title: 'Consumer gets notified', body: 'Nearby people see it on the live board instantly. Price watch users get an email the moment it matches.' },
                { n: '03', title: 'Slot claimed. Chair filled.', body: "Consumer pays the deal price. Business fills revenue they'd have lost. Zero waste on both sides." },
              ].map(s => (
                <div key={s.n} className="how-card">
                  <div style={{ fontFamily: df, fontWeight: 800, fontSize: 56, color: `${t.greenText}20`, lineHeight: 1, marginBottom: 4 }}>{s.n}</div>
                  <h3 style={{ fontFamily: df, color: t.text, fontSize: 19, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>{s.title}</h3>
                  <p className="os-body" style={{ color: t.textSub, fontSize: 14, lineHeight: 1.7 }}>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* REFERRAL */}
        <section style={{ background: t.bg, borderTop: `1px solid ${t.borderFaint}`, padding: '80px 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ background: t.bgCard, border: `1px solid ${dark ? 'rgba(0,230,118,0.15)' : 'rgba(5,150,105,0.2)'}`, borderRadius: 16, padding: '36px 48px', display: 'grid', gridTemplateColumns: '1fr auto', gap: 48, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 36, marginBottom: 16 }}>🎁</div>
                <h2 style={{ fontFamily: df, fontSize: 32, fontWeight: 800, color: t.text, lineHeight: 1.1, marginBottom: 12 }}>Know someone who'd love this?</h2>
                <p className="os-body" style={{ color: t.textSub, fontSize: 15, lineHeight: 1.7, maxWidth: 480 }}>
                  Share your referral link. When a friend claims their first slot, you both get <span style={{ color: t.greenText, fontWeight: 600 }}>$5 credit</span> toward a future claim. Max $25 per person. Credits apply after the pilot period.
                </p>
              </div>
              <div style={{ textAlign: 'center', minWidth: 200 }}>
                <div style={{ background: t.bgAlt, borderRadius: 16, padding: '32px 28px' }}>
                  <div style={{ fontFamily: df, fontSize: 56, fontWeight: 800, color: t.greenText, lineHeight: 1, marginBottom: 4 }}>$5</div>
                  <div className="os-body" style={{ color: t.textSub, fontSize: 14, marginBottom: 20 }}>per referral</div>
                  <Link href="/board" className="btn-primary" style={{ fontSize: 13, padding: '10px 18px' }}>Claim a slot →</Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section style={{ background: t.greenText, padding: '72px 24px', textAlign: 'center' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <h2 style={{ fontFamily: df, fontSize: 44, fontWeight: 800, color: '#050505', lineHeight: 1.05, marginBottom: 16 }}>Ready to fill your empty slots?</h2>
            <p className="os-body" style={{ color: 'rgba(0,0,0,0.5)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
              Join the founding businesses going live in South Jersey. First 3 months completely free.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/apply" style={{ background: '#050505', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '14px 28px', borderRadius: 6, textDecoration: 'none', fontSize: 15 }}>Apply as a business →</Link>
              <Link href="/board" style={{ background: 'transparent', color: '#050505', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '14px 28px', borderRadius: 6, textDecoration: 'none', fontSize: 15, border: '1.5px solid rgba(0,0,0,0.2)' }}>Browse open slots</Link>
            </div>
          </div>
        </section>

        <footer style={{ background: t.bg, borderTop: `1px solid ${t.borderFaint}`, padding: '24px', textAlign: 'center' }}>
          <p className="os-body" style={{ color: t.textMuted, fontSize: 12 }}>Open Slot · South Jersey · Founding Launch Pilot 2026</p>
        </footer>
      </div>

      {/* ═══════════════════════════════════════
          MOBILE VERSION — bold, direct, dark
      ═══════════════════════════════════════ */}
      <div className="mobile-only">

        {/* Pilot bar */}
        <div className="mob-pilot-bar">
          <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#FFE000', fontSize: 12, fontWeight: 500 }}>
            🚀 Founding Pilot — First 3 months free
          </span>
        </div>

        {/* Nav */}
        <div className="mob-nav">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: '#00E676', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" stroke="#050505" strokeWidth="1.6"/>
                <path d="M8 5v6M5 8h6" stroke="#050505" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{ fontFamily: `'${font}', sans-serif`, color: '#fff', fontSize: 16, fontWeight: 700 }}>Open Slot</span>
          </div>
          <Link href="/apply" style={{ background: '#00E676', color: '#050505', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, padding: '8px 14px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>
            List biz →
          </Link>
        </div>

        {/* Hero */}
        <div className="mob-hero">
          <div className="mob-hero-content">

            {/* Headline */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
                <div className="live-dot" />
                <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#00E676', fontSize: 12, fontWeight: 600, letterSpacing: '0.5px' }}>LIVE · SOUTH JERSEY</span>
              </div>
              <h1 className="mob-headline">
                Empty seat.<br />
                <span style={{ color: '#00E676' }}>Fill it now.</span>
              </h1>
              <p className="mob-sub">
                Last-minute deals from local businesses. Browse, claim, save — no account needed.
              </p>

              {/* CTAs */}
              <div className="mob-cta-row">
                <Link href="/board" className="mob-btn-primary">Browse open slots near me →</Link>
                <Link href="/apply" className="mob-btn-ghost">List your business — free pilot</Link>
              </div>
            </div>

            {/* Live slot previews */}
            <div className="mob-live-slots">
              <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.3)', fontSize: 11, fontWeight: 600, letterSpacing: '0.5px', marginBottom: 10 }}>LIVE SLOTS RIGHT NOW</div>
              {[
                { biz: "Mario's Barbershop", svc: "Men's cut + fade", deal: 20, orig: 35, disc: 43, urgent: true },
                { biz: "Serenity Spa", svc: "60-min massage", deal: 60, orig: 95, disc: 37, urgent: false },
              ].map((s, i) => (
                <div key={i} className={`mob-slot-card ${s.urgent ? 'urgent' : ''}`}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontFamily: `'${font}', sans-serif`, color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{s.biz}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.45)', fontSize: 13 }}>{s.svc}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: `'${font}', sans-serif`, color: '#fff', fontSize: 26, fontWeight: 800, lineHeight: 1 }}>${s.deal}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.3)', fontSize: 12, textDecoration: 'line-through' }}>${s.orig}</div>
                      <div style={{ fontFamily: 'DM Sans, sans-serif', color: '#00E676', fontSize: 11, fontWeight: 600 }}>{s.disc}% off</div>
                    </div>
                  </div>
                </div>
              ))}
              <Link href="/board" style={{ fontFamily: 'DM Sans, sans-serif', color: '#00E676', fontSize: 13, textDecoration: 'none', display: 'block', textAlign: 'center', paddingTop: 12, fontWeight: 500 }}>
                See all {stats.totalSlots || '10'}+ open slots →
              </Link>
            </div>

            {/* Stats */}
            <div className="mob-stats-row">
              <div className="mob-stat">
                <div className="mob-stat-val">{stats.claimsThisWeek || '47'}</div>
                <div className="mob-stat-label">claimed this week</div>
              </div>
              <div className="mob-stat">
                <div className="mob-stat-val">{stats.totalBusinesses || '8'}</div>
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
          </div>
        </div>

        {/* For businesses */}
        <div className="mob-section">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(255,230,0,0.1)', border: '1px solid rgba(255,230,0,0.2)', borderRadius: 20, padding: '4px 12px', marginBottom: 16 }}>
            <span style={{ fontFamily: 'DM Sans, sans-serif', color: '#FFE000', fontSize: 11, fontWeight: 600 }}>🚀 FOUNDING PILOT</span>
          </div>
          <div className="mob-section-title">For businesses</div>
          <div className="mob-section-sub">Zero fees for your first 3 months. Just post your empty slots.</div>
          {[
            { title: 'Post in 60 seconds', sub: 'Service, time, price. Done.' },
            { title: 'Zero fees during pilot', sub: 'Keep 100% of every claim for 3 months' },
            { title: 'Email when claimed', sub: 'Get notified the moment someone books' },
            { title: 'See live demand nearby', sub: 'Real people posting what they need' },
          ].map((f, i) => (
            <div key={i} className="mob-feature-card">
              <div style={{ fontFamily: `'${font}', sans-serif`, color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{f.title}</div>
              <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{f.sub}</div>
            </div>
          ))}
          <Link href="/apply" style={{ display: 'block', marginTop: 16, background: '#00E676', color: '#050505', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, padding: '15px', borderRadius: 12, textDecoration: 'none', fontSize: 15, textAlign: 'center' }}>
            Apply as a business — it's free →
          </Link>
        </div>

        {/* How it works */}
        <div style={{ background: '#050505', padding: '36px 20px', borderTop: '1px solid #111' }}>
          <div className="mob-section-title" style={{ color: '#fff', marginBottom: 6 }}>How it works</div>
          <div className="mob-section-sub">Three steps. Both sides win.</div>
          {[
            { n: '01', title: 'Business posts a slot', body: 'Approved local business posts their open time in 60 seconds with a discount.' },
            { n: '02', title: 'Nearby consumer sees it', body: 'It appears on the live board instantly. Price watch users get emailed.' },
            { n: '03', title: 'Slot claimed. Chair filled.', body: 'Consumer saves money. Business fills revenue they\'d have lost.' },
          ].map(s => (
            <div key={s.n} className="mob-step">
              <div className="mob-step-num">{s.n}</div>
              <div>
                <div style={{ fontFamily: `'${font}', sans-serif`, color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6 }}>{s.body}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Referral */}
        <div style={{ background: '#0c0c0c', padding: '28px 20px', borderTop: '1px solid #111' }}>
          <div style={{ fontSize: 28, marginBottom: 10 }}>🎁</div>
          <div className="mob-section-title" style={{ color: '#fff', marginBottom: 8 }}>Refer a friend, get $5</div>
          <div style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.4)', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            When a friend claims their first slot with your link, you both get $5 credit. Max $25 per person.
          </div>
          <Link href="/board" style={{ display: 'block', background: 'rgba(0,230,118,0.1)', border: '1px solid rgba(0,230,118,0.2)', color: '#00E676', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, padding: '14px', borderRadius: 12, textDecoration: 'none', fontSize: 15, textAlign: 'center' }}>
            Claim a slot to get your link →
          </Link>
        </div>

        {/* Bottom CTA */}
        <div className="mob-bottom-cta">
          <h2 style={{ fontFamily: `'${font}', sans-serif`, fontSize: 32, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 10 }}>
            Ready to find a deal?
          </h2>
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(0,0,0,0.5)', fontSize: 14, marginBottom: 20 }}>
            Browse live slots from vetted local businesses near you.
          </p>
          <Link href="/board" style={{ display: 'block', background: '#050505', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 700, padding: '16px', borderRadius: 12, textDecoration: 'none', fontSize: 16, textAlign: 'center' }}>
            Browse open slots →
          </Link>
        </div>

        <div className="mob-footer">
          <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'rgba(255,255,255,0.2)', fontSize: 11 }}>
            Open Slot · South Jersey · 2026
          </p>
        </div>
      </div>
    </>
  )
}