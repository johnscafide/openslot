import Link from 'next/link'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .os-hero { background: #050505; position: relative; overflow: hidden; }
        .os-hero::before {
          content: '';
          position: absolute; inset: 0;
          background: radial-gradient(ellipse 80% 60% at 60% 0%, rgba(0,230,118,0.12) 0%, transparent 70%),
                      radial-gradient(ellipse 40% 40% at 10% 80%, rgba(0,230,118,0.06) 0%, transparent 60%);
        }
        .os-display { font-family: 'Syne', sans-serif; }
        .os-body { font-family: 'DM Sans', sans-serif; }
        .os-green { color: #00E676; }
        .os-btn-primary {
          background: #00E676; color: #050505;
          font-family: 'DM Sans', sans-serif; font-weight: 500;
          padding: 14px 28px; border-radius: 6px;
          border: none; cursor: pointer; font-size: 15px;
          transition: transform 0.15s, box-shadow 0.15s;
          display: inline-flex; align-items: center; gap: 8px;
        }
        .os-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 32px rgba(0,230,118,0.3); }
        .os-btn-ghost {
          background: transparent; color: #fff;
          font-family: 'DM Sans', sans-serif; font-weight: 400;
          padding: 14px 28px; border-radius: 6px;
          border: 1px solid rgba(255,255,255,0.15); cursor: pointer; font-size: 15px;
          transition: border-color 0.15s, background 0.15s;
          display: inline-flex; align-items: center; gap: 8px;
          text-decoration: none;
        }
        .os-btn-ghost:hover { border-color: rgba(255,255,255,0.4); background: rgba(255,255,255,0.04); }
        .slot-card {
          background: #111; border: 1px solid #1e1e1e;
          border-radius: 12px; padding: 20px 20px 20px 24px;
          position: relative; overflow: hidden;
        }
        .slot-card::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
          background: #00E676;
        }
        .slot-card.urgent::before { background: #FF5252; }
        .slot-card.warn::before { background: #FFB300; }
        .pill {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 500;
          font-family: 'DM Sans', sans-serif;
        }
        .pill-green { background: rgba(0,230,118,0.1); color: #00E676; border: 1px solid rgba(0,230,118,0.2); }
        .pill-red { background: rgba(255,82,82,0.1); color: #FF5252; border: 1px solid rgba(255,82,82,0.2); }
        .pill-amber { background: rgba(255,179,0,0.1); color: #FFB300; border: 1px solid rgba(255,179,0,0.2); }
        .pill-gray { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); border: 1px solid rgba(255,255,255,0.08); }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #00E676; animation: pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }
        .float-card { animation: floatUp 0.6s ease forwards; opacity: 0; }
        .float-card:nth-child(1) { animation-delay: 0.1s; }
        .float-card:nth-child(2) { animation-delay: 0.3s; }
        .float-card:nth-child(3) { animation-delay: 0.5s; }
        @keyframes floatUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-num { font-family: 'Syne', sans-serif; font-weight: 800; }
        .section-dark { background: #050505; }
        .section-dim { background: #080808; }
        .divider { border: none; border-top: 1px solid #161616; }
        .feature-card {
          background: #0c0c0c; border: 1px solid #1a1a1a;
          border-radius: 12px; padding: 28px;
          transition: border-color 0.2s;
        }
        .feature-card:hover { border-color: rgba(0,230,118,0.2); }
        .step-num {
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 56px; color: rgba(0,230,118,0.12);
          line-height: 1; margin-bottom: 4px;
        }
        .marquee-wrap { overflow: hidden; position: relative; }
        .marquee-wrap::before, .marquee-wrap::after {
          content: ''; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2;
        }
        .marquee-wrap::before { left: 0; background: linear-gradient(90deg, #050505, transparent); }
        .marquee-wrap::after { right: 0; background: linear-gradient(-90deg, #050505, transparent); }
        .marquee-track { display: flex; gap: 12px; width: max-content; animation: marquee 22s linear infinite; }
        @keyframes marquee { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        .category-tag {
          background: #111; border: 1px solid #1e1e1e;
          border-radius: 6px; padding: 8px 16px;
          font-family: 'DM Sans', sans-serif; font-size: 13px; color: rgba(255,255,255,0.5);
          white-space: nowrap;
        }
        .dual-card {
          border-radius: 16px; padding: 36px; position: relative; overflow: hidden;
        }
        .dual-card-biz { background: #00E676; }
        .dual-card-con { background: #0f0f0f; border: 1px solid #1e1e1e; }
        .os-nav { background: rgba(5,5,5,0.9); backdrop-filter: blur(12px); border-bottom: 1px solid #111; }
      `}</style>

      {/* NAV */}
      <nav className="os-nav sticky top-0 z-50">
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 58, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: '#00E676', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" stroke="#050505" strokeWidth="1.6"/>
                <path d="M8 5v6M5 8h6" stroke="#050505" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="os-display" style={{ color: '#fff', fontSize: 17, fontWeight: 700 }}>Open Slot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link href="/board" style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, textDecoration: 'none', fontFamily: 'DM Sans, sans-serif' }}>
              Browse slots
            </Link>
            <Link href="/apply" className="os-btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>
              List your business
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="os-hero" style={{ padding: '90px 24px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: 60, alignItems: 'center' }}>

            {/* Left */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
                <div className="live-dot" />
                <span className="os-body" style={{ color: '#00E676', fontSize: 12, fontWeight: 500, letterSpacing: '0.5px' }}>
                  LIVE · SOUTH JERSEY
                </span>
              </div>

              <h1 className="os-display" style={{ fontSize: 'clamp(42px, 5.5vw, 68px)', fontWeight: 800, lineHeight: 1.05, color: '#fff', marginBottom: 24 }}>
                Empty seat.<br />
                <span className="os-green">Someone nearby</span><br />
                wants it.
              </h1>

              <p className="os-body" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 17, lineHeight: 1.7, maxWidth: 460, marginBottom: 36 }}>
                Local businesses post last-minute open slots at a discount. 
                Nearby people claim them instantly. No empty chairs. No missed revenue.
              </p>

              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link href="/apply" className="os-btn-primary">
                  List your business →
                </Link>
                <Link href="/board" className="os-btn-ghost">
                  Browse open slots
                </Link>
              </div>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 36, borderTop: '1px solid #161616', paddingTop: 32 }}>
                {[
                  { val: '5%', label: 'fee per claim only' },
                  { val: '$0', label: 'to post a slot' },
                  { val: '60s', label: 'to go live' },
                ].map(s => (
                  <div key={s.label}>
                    <div className="stat-num os-green" style={{ fontSize: 28 }}>{s.val}</div>
                    <div className="os-body" style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Live board preview */}
            <div style={{ width: 340, flexShrink: 0 }}>
              <div style={{ marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="os-body" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>Live board preview</span>
                <span className="pill pill-green"><span className="live-dot" style={{ width: 5, height: 5 }} />3 open now</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { biz: "Mario's Barbershop", svc: "Men's cut + fade", time: "Today · 2:30 PM", orig: 35, deal: 20, disc: 43, cat: 'SALON', urgent: true },
                  { biz: "Serenity Spa", svc: "60-min deep tissue", time: "Today · 3:00 PM", orig: 95, deal: 60, disc: 37, cat: 'SPA', warn: true },
                  { biz: "Iron Body Fitness", svc: "Evening spin class", time: "Today · 5:30 PM", orig: 28, deal: 14, disc: 50, cat: 'FITNESS', urgent: false },
                ].map((s, i) => (
                  <div key={i} className={`slot-card float-card ${s.urgent ? 'urgent' : s.warn ? 'warn' : ''}`}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <span className="os-body" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11, letterSpacing: '0.5px' }}>{s.cat}</span>
                      <span className="pill pill-green" style={{ fontSize: 11 }}>{s.disc}% off</span>
                    </div>
                    <div className="os-display" style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{s.biz}</div>
                    <div className="os-body" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginBottom: 10 }}>{s.svc}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                        <span className="os-display" style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>${s.deal}</span>
                        <span className="os-body" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12, textDecoration: 'line-through' }}>${s.orig}</span>
                      </div>
                      <span className="os-body" style={{ color: 'rgba(255,255,255,0.3)', fontSize: 11 }}>{s.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div style={{ background: '#00E676', padding: '11px 0', overflow: 'hidden' }}>
        <div className="marquee-wrap" style={{ background: 'none' }}>
          <div className="marquee-track">
            {[...Array(2)].map((_, ri) => (
              ['Salons & Barbershops', 'Golf Courses', 'Fitness Studios', 'Spas & Massage', 'Restaurants', 'Tax Services', 'Yoga Studios', 'Nail Salons', 'Personal Trainers', 'Tattoo Artists'].map((c, i) => (
                <span key={`${ri}-${i}`} style={{ fontFamily: 'Syne, sans-serif', fontWeight: 700, fontSize: 12, color: '#050505', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
                  {c} &nbsp;&nbsp;·&nbsp;&nbsp;
                </span>
              ))
            ))}
          </div>
        </div>
      </div>

      {/* FOR BUSINESSES */}
      <section className="section-dark" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Biz card */}
            <div className="dual-card dual-card-biz">
              <div style={{ marginBottom: 24 }}>
                <span style={{ fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 11, color: '#050505', letterSpacing: '1px', background: 'rgba(0,0,0,0.12)', padding: '4px 10px', borderRadius: 20 }}>
                  FOR BUSINESSES
                </span>
              </div>
              <h2 className="os-display" style={{ fontSize: 34, fontWeight: 800, color: '#050505', lineHeight: 1.1, marginBottom: 16 }}>
                Stop leaving money<br />on the table.
              </h2>
              <p className="os-body" style={{ color: 'rgba(0,0,0,0.55)', fontSize: 16, lineHeight: 1.65, marginBottom: 28 }}>
                Every unfilled appointment is revenue gone forever. Post your open slot in 60 seconds and get a real customer in the door today.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Vetted businesses only — keeps the board trusted',
                  'Post in under 60 seconds, any time',
                  'Email alert the moment your slot is claimed',
                  '5% fee only when someone actually pays',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ fontSize: 14, marginTop: 2 }}>✓</span>
                    <span className="os-body" style={{ color: 'rgba(0,0,0,0.65)', fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/apply" style={{ background: '#050505', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '13px 24px', borderRadius: 6, textDecoration: 'none', fontSize: 14, display: 'inline-block' }}>
                Apply as a business →
              </Link>
            </div>

            {/* Consumer card */}
            <div className="dual-card dual-card-con">
              <div style={{ marginBottom: 24 }}>
                <span className="pill pill-gray" style={{ fontSize: 11, letterSpacing: '1px', textTransform: 'uppercase' }}>
                  For consumers
                </span>
              </div>
              <h2 className="os-display" style={{ fontSize: 34, fontWeight: 800, color: '#fff', lineHeight: 1.1, marginBottom: 16 }}>
                Get more for less,<br />on your schedule.
              </h2>
              <p className="os-body" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, lineHeight: 1.65, marginBottom: 28 }}>
                Browse live discounted slots from local businesses. Post what you need. Set a price watch on your favorites.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Real-time board of deals near you',
                  'Post an "I need" — businesses come to you',
                  'Price watch alerts for your favorite spots',
                  'Always free for consumers',
                ].map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span className="os-green" style={{ fontSize: 14, marginTop: 2 }}>✓</span>
                    <span className="os-body" style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, lineHeight: 1.5 }}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link href="/board" className="os-btn-ghost" style={{ fontSize: 14, padding: '12px 24px' }}>
                Browse open slots →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* HOW IT WORKS */}
      <section className="section-dark" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ marginBottom: 52 }}>
            <div className="os-body" style={{ color: '#00E676', fontSize: 12, fontWeight: 500, letterSpacing: '1px', marginBottom: 10 }}>HOW IT WORKS</div>
            <h2 className="os-display" style={{ fontSize: 40, fontWeight: 800, color: '#fff', lineHeight: 1.05 }}>
              Two sides.<br />One simple exchange.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { n: '01', title: 'Business posts a slot', body: 'An approved local business has a 2 PM opening. They post it in 60 seconds — service, time, their deal price.' },
              { n: '02', title: 'Consumer gets notified', body: 'Nearby people see it on the live board instantly. Price watch users get an email alert the moment it drops.' },
              { n: '03', title: 'Slot claimed. Chair filled.', body: 'Consumer pays the deal price. Business fills revenue they\'d have lost. Zero waste on both sides.' },
            ].map(s => (
              <div key={s.n} className="feature-card">
                <div className="step-num">{s.n}</div>
                <h3 className="os-display" style={{ color: '#fff', fontSize: 19, fontWeight: 700, marginBottom: 10, lineHeight: 1.2 }}>{s.title}</h3>
                <p className="os-body" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 14, lineHeight: 1.7 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <hr className="divider" />

      {/* SOCIAL PROOF / STATS */}
      <section className="section-dark" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
          {[
            { val: '60s', label: 'Average time to post a slot', sub: 'From signup to live' },
            { val: '40%', label: 'Average consumer discount', sub: 'Real savings, real fast' },
            { val: '5%', label: 'Only fee — on claims', sub: 'Zero monthly cost' },
            { val: '0', label: 'Accounts needed', sub: 'To browse and claim' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '32px 28px', borderLeft: i > 0 ? '1px solid #111' : 'none' }}>
              <div className="stat-num os-green" style={{ fontSize: 48, lineHeight: 1, marginBottom: 8 }}>{s.val}</div>
              <div className="os-display" style={{ color: '#fff', fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{s.label}</div>
              <div className="os-body" style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ background: '#00E676', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="os-display" style={{ fontSize: 44, fontWeight: 800, color: '#050505', lineHeight: 1.05, marginBottom: 16 }}>
            Ready to fill your empty slots?
          </h2>
          <p className="os-body" style={{ color: 'rgba(0,0,0,0.5)', fontSize: 16, lineHeight: 1.6, marginBottom: 32 }}>
            Join the first businesses going live in South Jersey. Application takes two minutes. No commitment.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/apply" style={{ background: '#050505', color: '#fff', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '14px 28px', borderRadius: 6, textDecoration: 'none', fontSize: 15 }}>
              Apply as a business →
            </Link>
            <Link href="/board" style={{ background: 'transparent', color: '#050505', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, padding: '14px 28px', borderRadius: 6, textDecoration: 'none', fontSize: 15, border: '1.5px solid rgba(0,0,0,0.2)' }}>
              Browse open slots
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: '#050505', borderTop: '1px solid #111', padding: '24px', textAlign: 'center' }}>
        <p className="os-body" style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>
          Open Slot · South Jersey · Built for local businesses
        </p>
      </footer>
    </>
  )
}