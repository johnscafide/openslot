'use client'
import { useEffect, useState, useCallback } from 'react'
import Nav from '@/components/Nav'
import { Slot } from '@/lib/types'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Salon & barber', 'Fitness', 'Golf', 'Spa', 'Dining', 'Services']

const MOCK_COORDS: Record<string, [number, number]> = {
  'Williamstown':        [39.6854, -74.9993],
  'Sicklerville':        [39.7251, -74.9882],
  'Glassboro':           [39.7026, -75.1116],
  'Turnersville':        [39.7651, -75.0552],
  'Washington Township': [39.6887, -75.0552],
}

function getBizCoords(address: string): [number, number] {
  const match = Object.keys(MOCK_COORDS).find(k => address?.includes(k))
  return match ? MOCK_COORDS[match] : [39.7, -75.0]
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)
  const isToday = d.toDateString() === today.toDateString()
  const isTomorrow = d.toDateString() === tomorrow.toDateString()
  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York',
  })
  return `${label} · ${time}`
}

function minsUntil(iso: string) {
  return Math.max(0, Math.round((new Date(iso).getTime() - Date.now()) / 60000))
}

function formatExpiry(mins: number) {
  if (mins < 60) return `${mins}m left`
  const h = Math.floor(mins / 60), m = mins % 60
  return m === 0 ? `${h}h left` : `${h}h ${m}m`
}

function getRating(name: string) {
  const ratings: Record<string, { score: number; count: number }> = {
    "Mario's Barbershop":     { score: 4.9, count: 312 },
    "Peak Flow Yoga":          { score: 4.7, count: 156 },
    "Eagle Ridge Golf Club":   { score: 4.6, count: 427 },
    "Serenity Spa & Wellness": { score: 4.8, count: 203 },
    "The Rusty Fork":          { score: 4.8, count: 512 },
  }
  return ratings[name] || { score: 4.5, count: 89 }
}

function Stars({ score }: { score: number }) {
  return (
    <div style={{ display: 'flex', gap: 1 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path
            d="M6 1l1.27 2.57 2.83.41-2.05 2 .48 2.83L6 7.5 3.47 8.81l.48-2.83-2.05-2 2.83-.41z"
            fill={i <= Math.round(score) ? '#F59E0B' : '#E5E7EB'}
            stroke={i <= Math.round(score) ? '#F59E0B' : '#E5E7EB'}
            strokeWidth="0.5"
          />
        </svg>
      ))}
    </div>
  )
}

function MiniMap({ slots, hoveredId, onHover }: {
  slots: Slot[]
  hoveredId: string | null
  onHover: (id: string | null) => void
}) {
  const minLat = 39.62, maxLat = 39.78, minLng = -75.18, maxLng = -74.95
  const W = 340, H = 220

  function project(lat: number, lng: number): [number, number] {
    const x = ((lng - minLng) / (maxLng - minLng)) * W
    const y = ((maxLat - lat) / (maxLat - minLat)) * H
    return [x, y]
  }

  const seen = new Set<string>()
  const pins = slots.filter(s => {
    const key = s.business_name || ''
    if (seen.has(key)) return false
    seen.add(key)
    return true
  }).map(s => {
    const coords = getBizCoords(s.business_address || '')
    const [x, y] = project(coords[0], coords[1])
    return { ...s, x, y }
  })

  return (
    <div style={{ background: '#f0f4f8', borderRadius: 12, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
      <div style={{ padding: '10px 14px', background: '#fff', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>South Jersey</span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>{slots.length} open slots</span>
      </div>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
        <rect width={W} height={H} fill="#e8f0e9" />
        <line x1="0" y1="110" x2={W} y2="110" stroke="#d1d5db" strokeWidth="1.5" />
        <line x1="170" y1="0" x2="170" y2={H} stroke="#d1d5db" strokeWidth="1.5" />
        <line x1="0" y1="60" x2={W} y2="160" stroke="#d1d5db" strokeWidth="1" strokeDasharray="4,4" />
        {pins.map(pin => {
          const disc = Math.round((pin.original_price - pin.deal_price) / pin.original_price * 100)
          const isHovered = hoveredId === pin.id
          return (
            <g key={pin.id} style={{ cursor: 'pointer' }}
              onMouseEnter={() => onHover(pin.id)}
              onMouseLeave={() => onHover(null)}
            >
              <ellipse cx={pin.x} cy={pin.y + 16} rx={8} ry={3} fill="rgba(0,0,0,0.12)" />
              <circle cx={pin.x} cy={pin.y} r={isHovered ? 18 : 14}
                fill={isHovered ? '#059669' : '#10b981'}
                stroke="#fff" strokeWidth={isHovered ? 2.5 : 2}
                style={{ transition: 'all 0.15s' }}
              />
              <text x={pin.x} y={pin.y + 1}
                textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={isHovered ? 9 : 8} fontWeight="700" fontFamily="system-ui"
              >
                {disc}%
              </text>
              {isHovered && (
                <g>
                  <rect x={pin.x - 50} y={pin.y - 42} width="100" height="22" rx="4" fill="#111827" opacity="0.92" />
                  <text x={pin.x} y={pin.y - 27}
                    textAnchor="middle" fill="white" fontSize="9" fontFamily="system-ui" fontWeight="500"
                  >
                    {pin.business_name?.split(' ').slice(0, 3).join(' ')}
                  </text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ padding: '6px 14px', background: '#fff', borderTop: '1px solid #f1f5f9', fontSize: 10, color: '#9ca3af' }}>
        Hover a pin to preview · Williamstown area
      </div>
    </div>
  )
}

export default function BoardPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [claimedIds, setClaimedIds] = useState<string[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [maxPrice, setMaxPrice] = useState(200)
  const [minDiscount, setMinDiscount] = useState(0)
  const [showSavedOnly, setShowSavedOnly] = useState(false)
  const [sortBy, setSortBy] = useState<'time' | 'discount' | 'price'>('time')
  const [needForm, setNeedForm] = useState(false)
  const [needSubmitted, setNeedSubmitted] = useState(false)
  const [copyMsg, setCopyMsg] = useState<string | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [sharedSlotId, setSharedSlotId] = useState<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setReferralCode(params.get('ref'))
    setSharedSlotId(params.get('slot'))
  }, [])

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/slots/active', { cache: 'no-store' })
      const data = await res.json()
      if (data.slots) setSlots(data.slots as Slot[])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlots()
    const iv = setInterval(fetchSlots, 10000)
    return () => clearInterval(iv)
  }, [fetchSlots])

  useEffect(() => {
    if (sharedSlotId && !loading) {
      setTimeout(() => {
        const el = document.getElementById(`slot-${sharedSlotId}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [sharedSlotId, loading])

  const toggleSave = (id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const shareSlot = (slotId: string) => {
    const url = `${window.location.origin}/board?slot=${slotId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(slotId)
      setTimeout(() => setCopyMsg(null), 2000)
    })
  }

  async function handleClaim(slotId: string) {
    const email = prompt('Enter your email to claim this slot:')
    if (!email || !email.includes('@')) return
    setClaimingId(slotId)

    if (referralCode) {
      await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ referralCode, referredEmail: email, slotId }),
      }).catch(() => {})
    }

    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, consumerEmail: email }),
    })
    const data = await res.json()

    if (data.checkoutUrl) {
      window.location.href = data.checkoutUrl
    } else if (data.success || res.ok) {
      setClaimedIds(prev => [...prev, slotId])
      fetchSlots()
    } else {
      alert('Something went wrong. Please try again.')
    }
    setClaimingId(null)
  }

  async function handleNeedSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget))
    await fetch('/api/need', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setNeedSubmitted(true)
    setNeedForm(false)
  }

  let filtered = slots
    .filter(s => activeCategory === 'All' || s.business_category === activeCategory)
    .filter(s => s.deal_price <= maxPrice)
    .filter(s => {
      const disc = Math.round((s.original_price - s.deal_price) / s.original_price * 100)
      return disc >= minDiscount
    })
    .filter(s => !showSavedOnly || savedIds.includes(s.id))

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'time') return new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime()
    if (sortBy === 'price') return a.deal_price - b.deal_price
    if (sortBy === 'discount') {
      const da = (a.original_price - a.deal_price) / a.original_price
      const db = (b.original_price - b.deal_price) / b.original_price
      return db - da
    }
    return 0
  })

  const catEmoji: Record<string, string> = {
    'Salon & barber': '✂️',
    'Fitness': '🏃',
    'Golf': '⛳',
    'Spa': '💆',
    'Dining': '🍽️',
    'Services': '📋',
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&display=swap');

        * { font-family: 'DM Sans', sans-serif; box-sizing: border-box; }

        /* ─── SHARED ─── */
        .icon-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 50%; transition: background 0.15s; display: flex; align-items: center; justify-content: center; }
        .icon-btn:hover { background: #f3f4f6; }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* ─── DESKTOP ─── */
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
          .slot-row { display: flex; gap: 0; border-bottom: 1px solid #f3f4f6; transition: background 0.1s; }
          .slot-row:hover { background: #fafafa; }
          .slot-row.hovered { background: #f0fdf4; }
          .slot-row.shared-highlight { background: #fffbeb; }
          .claim-btn { padding: 9px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; border: none; transition: all 0.15s; }
          .claim-btn-active { background: #10b981; color: white; }
          .claim-btn-active:hover { background: #059669; transform: translateY(-1px); }
          .claim-btn-claimed { background: #d1fae5; color: #065f46; cursor: default; }
          .filter-label { font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; display: block; }
          .range-input { width: 100%; accent-color: #10b981; }
          .cat-chip { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #e5e7eb; background: white; color: #6b7280; transition: all 0.12s; white-space: nowrap; }
          .cat-chip.active { background: #10b981; border-color: #10b981; color: white; }
          .cat-chip:hover:not(.active) { border-color: #10b981; color: #10b981; }
          .sort-btn { padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #e5e7eb; background: white; color: #6b7280; transition: all 0.12s; }
          .sort-btn.active { background: #111827; border-color: #111827; color: white; }
          .desktop-layout { display: flex; max-width: 1200px; margin: 0 auto; padding: 0 16px; gap: 24px; padding-top: 24px; padding-bottom: 40px; }
          .desktop-sidebar { width: 260px; flex-shrink: 0; position: sticky; top: 72px; height: fit-content; }
          .desktop-main { flex: 1; min-width: 0; }
          .mobile-layout { display: none; }
        }

        /* ─── MOBILE ─── */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .desktop-layout { display: none !important; }
          .mobile-layout { display: block; }

          /* Mobile header */
          .mob-header {
            background: #111827;
            padding: 16px 16px 0;
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .mob-header-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 14px;
          }
          .mob-title {
            font-size: 22px;
            font-weight: 700;
            color: white;
            line-height: 1.1;
          }
          .mob-live-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            background: rgba(16,185,129,0.15);
            border: 1px solid rgba(16,185,129,0.3);
            border-radius: 20px;
            padding: 5px 12px;
          }

          /* Mobile category scroll */
          .mob-cats {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            padding-bottom: 14px;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mob-cats::-webkit-scrollbar { display: none; }
          .mob-cat-btn {
            flex-shrink: 0;
            padding: 7px 14px;
            border-radius: 20px;
            font-size: 13px;
            font-weight: 500;
            border: 1px solid rgba(255,255,255,0.15);
            background: transparent;
            color: rgba(255,255,255,0.6);
            cursor: pointer;
            transition: all 0.12s;
            white-space: nowrap;
          }
          .mob-cat-btn.active {
            background: #10b981;
            border-color: #10b981;
            color: white;
          }

          /* Mobile slot card — HotelTonight style */
          .mob-card {
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 2px 12px rgba(0,0,0,0.08);
            margin: 0 16px 14px;
            position: relative;
          }
          .mob-card.shared { border: 2px solid #f59e0b; }
          .mob-card-top {
            padding: 18px 18px 14px;
            display: flex;
            align-items: flex-start;
            gap: 14px;
          }
          .mob-emoji-box {
            width: 52px;
            height: 52px;
            border-radius: 14px;
            background: #f0fdf4;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            flex-shrink: 0;
          }
          .mob-biz-name {
            font-size: 17px;
            font-weight: 700;
            color: #111827;
            line-height: 1.2;
            margin-bottom: 2px;
          }
          .mob-svc-name {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 6px;
          }
          .mob-card-price-row {
            padding: 0 18px 18px;
            display: flex;
            align-items: flex-end;
            justify-content: space-between;
          }
          .mob-price-big {
            font-size: 38px;
            font-weight: 800;
            color: #111827;
            line-height: 1;
          }
          .mob-price-orig {
            font-size: 14px;
            color: #9ca3af;
            text-decoration: line-through;
            margin-left: 6px;
          }
          .mob-save {
            font-size: 12px;
            color: #10b981;
            font-weight: 600;
            margin-top: 3px;
          }
          .mob-disc-badge {
            font-size: 13px;
            font-weight: 800;
            padding: 5px 12px;
            border-radius: 20px;
          }
          .mob-card-footer {
            border-top: 1px solid #f3f4f6;
            padding: 12px 18px;
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          .mob-meta {
            font-size: 12px;
            color: #9ca3af;
            display: flex;
            flex-direction: column;
            gap: 3px;
          }
          .mob-claim-btn {
            padding: 12px 22px;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            border: none;
            cursor: pointer;
            transition: all 0.15s;
            min-width: 120px;
            text-align: center;
          }
          .mob-claim-active { background: #10b981; color: white; }
          .mob-claim-active:active { background: #059669; transform: scale(0.97); }
          .mob-claim-done { background: #d1fae5; color: #065f46; cursor: default; }
          .mob-actions-row {
            position: absolute;
            top: 14px;
            right: 14px;
            display: flex;
            gap: 4px;
          }
          .mob-urgent-bar {
            height: 3px;
            width: 100%;
          }

          /* Mobile sort bar */
          .mob-sort-bar {
            display: flex;
            gap: 8px;
            padding: 12px 16px;
            overflow-x: auto;
            background: #f9fafb;
            border-bottom: 1px solid #f3f4f6;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
          }
          .mob-sort-bar::-webkit-scrollbar { display: none; }
          .mob-sort-chip {
            flex-shrink: 0;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 500;
            border: 1px solid #e5e7eb;
            background: white;
            color: #6b7280;
            cursor: pointer;
          }
          .mob-sort-chip.active { background: #111827; border-color: #111827; color: white; }

          /* Mobile filter drawer */
          .mob-filter-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
          }
          .mob-filter-drawer {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white; border-radius: 20px 20px 0 0;
            padding: 24px; z-index: 101;
            max-height: 70vh; overflow-y: auto;
          }

          /* Mobile bottom bar */
          .mob-bottom-bar {
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: white;
            border-top: 1px solid #f3f4f6;
            padding: 12px 16px;
            display: flex;
            gap: 10px;
            z-index: 50;
          }
          .mob-bottom-need-btn {
            flex: 1;
            padding: 13px;
            border-radius: 10px;
            border: 1.5px dashed #d1d5db;
            background: transparent;
            color: #6b7280;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
          }
          .mob-bottom-filter-btn {
            padding: 13px 18px;
            border-radius: 10px;
            border: 1.5px solid #e5e7eb;
            background: white;
            color: #374151;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
          }
          .mob-content { padding-top: 12px; padding-bottom: 90px; background: #f9fafb; min-height: 100vh; }

          /* Mobile need form */
          .mob-need-overlay {
            position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100;
          }
          .mob-need-drawer {
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white; border-radius: 20px 20px 0 0;
            padding: 24px; z-index: 101;
            max-height: 85vh; overflow-y: auto;
          }
          .mob-input {
            width: 100%;
            padding: 12px 14px;
            border: 1.5px solid #e5e7eb;
            border-radius: 10px;
            font-size: 15px;
            font-family: 'DM Sans', sans-serif;
            outline: none;
          }
          .mob-input:focus { border-color: #10b981; }
          .mob-label {
            font-size: 13px;
            font-weight: 600;
            color: #374151;
            display: block;
            margin-bottom: 6px;
          }
        }
      `}</style>

      <Nav />

      {/* Referral banner */}
      {referralCode && (
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #a7f3d0', padding: '10px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
            🎁 You were referred! Claim a slot and you both get $5 credit.
          </span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════
          DESKTOP LAYOUT (unchanged from before)
      ═══════════════════════════════════════════════════ */}
      <div className="desktop-layout">

        {/* SIDEBAR */}
        <aside className="desktop-sidebar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{filtered.length} open slots</span>
            <span style={{ fontSize: 12, color: '#9ca3af' }}>· Williamstown, NJ</span>
          </div>
          <div style={{ marginBottom: 20 }}>
            <MiniMap slots={filtered} hoveredId={hoveredId} onHover={setHoveredId} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="filter-label">Category</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} className={clsx('cat-chip', activeCategory === cat && 'active')}
                  onClick={() => setActiveCategory(cat)}>{cat}</button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="filter-label">Max price</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>$0</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${maxPrice}</span>
            </div>
            <input type="range" min={5} max={200} value={maxPrice}
              onChange={e => setMaxPrice(parseInt(e.target.value))} className="range-input" />
          </div>
          <div style={{ marginBottom: 20 }}>
            <span className="filter-label">Min discount</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#6b7280' }}>Any</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{minDiscount}%+ off</span>
            </div>
            <input type="range" min={0} max={70} step={5} value={minDiscount}
              onChange={e => setMinDiscount(parseInt(e.target.value))} className="range-input" />
          </div>
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Saved only</span>
            <div onClick={() => setShowSavedOnly(p => !p)}
              style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: showSavedOnly ? '#10b981' : '#e5e7eb', position: 'relative', transition: 'background 0.2s' }}>
              <div style={{ position: 'absolute', top: 3, left: showSavedOnly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 16 }}>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>
              Don't see what you need? Post a request and let businesses come to you.
            </p>
            <button onClick={() => setNeedForm(p => !p)}
              style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px dashed #d1d5db', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>
              + Post an "I need"
            </button>
          </div>
        </aside>

        {/* DESKTOP MAIN */}
        <main className="desktop-main">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
              {filtered.length} slot{filtered.length !== 1 ? 's' : ''} available
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 4 }}>Sort:</span>
              {(['time', 'discount', 'price'] as const).map(s => (
                <button key={s} className={clsx('sort-btn', sortBy === s && 'active')}
                  onClick={() => setSortBy(s)}>
                  {s === 'time' ? 'Soonest' : s === 'discount' ? 'Best deal' : 'Lowest price'}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Loading slots...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 6 }}>No slots match your filters</div>
              <div style={{ fontSize: 13, color: '#9ca3af' }}>Try adjusting the price or category filters</div>
            </div>
          ) : (
            <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
              {filtered.map((slot, idx) => {
                const disc = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
                const mins = minsUntil(slot.slot_time)
                const isUrgent = mins < 90 || slot.spots_remaining === 1
                const isSaved = savedIds.includes(slot.id)
                const isClaimed = claimedIds.includes(slot.id)
                const isShared = sharedSlotId === slot.id
                const rating = getRating(slot.business_name || '')

                return (
                  <div key={slot.id} id={`slot-${slot.id}`}
                    className={clsx('slot-row', hoveredId === slot.id && 'hovered', isShared && 'shared-highlight')}
                    onMouseEnter={() => setHoveredId(slot.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ borderTop: idx === 0 ? 'none' : undefined }}
                  >
                    <div style={{ width: 4, flexShrink: 0, background: isUrgent ? '#ef4444' : disc >= 45 ? '#f59e0b' : '#10b981' }} />
                    <div style={{ flex: 1, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                        {catEmoji[slot.business_category || ''] || '📌'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 3 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', lineHeight: 1.3 }}>{slot.business_name}</div>
                          {isUrgent && <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '2px 7px', borderRadius: 20, flexShrink: 0, marginTop: 1 }}>HOT</span>}
                          {isShared && <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#d97706', padding: '2px 7px', borderRadius: 20, flexShrink: 0, marginTop: 1 }}>SHARED</span>}
                        </div>
                        <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{slot.service_name}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
                          <Stars score={rating.score} />
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{rating.score}</span>
                          <span style={{ fontSize: 11, color: '#9ca3af' }}>({rating.count})</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap' }}>
                          <span>🕐 {formatTime(slot.slot_time)}</span>
                          {slot.business_address && <span>📍 {slot.business_address.split(',')[0]}</span>}
                          <span style={{ color: isUrgent ? '#ef4444' : '#9ca3af', fontWeight: isUrgent ? 600 : 400 }}>
                            {slot.spots_remaining === 1 ? '🔥 Last spot' : `${slot.spots_remaining} spots`} · {formatExpiry(mins)}
                          </span>
                        </div>
                        {slot.notes && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5, fontStyle: 'italic' }}>"{slot.notes}"</div>}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: disc >= 50 ? '#fee2e2' : disc >= 35 ? '#fef3c7' : '#d1fae5', color: disc >= 50 ? '#dc2626' : disc >= 35 ? '#d97706' : '#065f46' }}>
                          {disc}% OFF
                        </span>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1 }}>${slot.deal_price}</div>
                          <div style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through' }}>${slot.original_price}</div>
                          <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>save ${(slot.original_price - slot.deal_price).toFixed(0)}</div>
                        </div>
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                          <button className="icon-btn" title="Copy share link" onClick={() => shareSlot(slot.id)}>
                            {copyMsg === slot.id ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                            )}
                          </button>
                          <button className="icon-btn" onClick={() => toggleSave(slot.id)}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : '#9ca3af'} strokeWidth="2">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                          </button>
                          <button
                            className={clsx('claim-btn', isClaimed ? 'claim-btn-claimed' : 'claim-btn-active')}
                            onClick={() => !isClaimed && handleClaim(slot.id)}
                            disabled={claimingId === slot.id || isClaimed}
                          >
                            {isClaimed ? '✓ Claimed' : claimingId === slot.id ? '...' : 'Claim →'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {needForm && !needSubmitted && (
            <div style={{ marginTop: 24, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
              <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 4 }}>Post what you need</div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Matching businesses will be notified.</p>
              <form onSubmit={handleNeedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>What do you need?</label>
                    <input name="service_name" required placeholder="e.g. Women's cut + color" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
                    <select name="category" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}>
                      {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>When</label>
                    <select name="when_needed" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}>
                      <option>Today</option><option>Tomorrow</option><option>This week</option><option>Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Budget ($)</label>
                    <input name="budget" type="number" placeholder="50" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Within</label>
                    <select name="radius_miles" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }}>
                      <option value="2">2 miles</option><option value="5">5 miles</option><option value="10">10 miles</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Your email</label>
                  <input name="consumer_email" type="email" required placeholder="you@email.com" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13 }} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={{ padding: '9px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Post request →</button>
                  <button type="button" onClick={() => setNeedForm(false)} style={{ padding: '9px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>
          )}

          {needSubmitted && (
            <div style={{ marginTop: 24, background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: 16, fontSize: 14, color: '#065f46' }}>
              ✓ Request posted. Matching businesses have been notified.
            </div>
          )}
        </main>
      </div>

      {/* ═══════════════════════════════════════════════════
          MOBILE LAYOUT — HotelTonight style
      ═══════════════════════════════════════════════════ */}
      <div className="mobile-layout">

        {/* Sticky dark header with categories */}
        <div className="mob-header">
          <div className="mob-header-top">
            <div>
              <div className="mob-title">Open Slots</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Williamstown, NJ</div>
            </div>
            <div className="mob-live-badge">
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{filtered.length} live</span>
            </div>
          </div>
          {/* Category scroll */}
          <div className="mob-cats">
            {CATEGORIES.map(cat => (
              <button key={cat}
                className={clsx('mob-cat-btn', activeCategory === cat && 'active')}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'All' ? '⚡ All' : `${catEmoji[cat] || ''} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Sort bar */}
        <div className="mob-sort-bar">
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, flexShrink: 0, paddingRight: 4, lineHeight: '28px' }}>SORT:</span>
          {(['time', 'discount', 'price'] as const).map(s => (
            <button key={s}
              className={clsx('mob-sort-chip', sortBy === s && 'active')}
              onClick={() => setSortBy(s)}
            >
              {s === 'time' ? '🕐 Soonest' : s === 'discount' ? '🔥 Best deal' : '💰 Lowest price'}
            </button>
          ))}
        </div>

        {/* Slot cards */}
        <div className="mob-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: '#9ca3af' }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
              <div style={{ fontWeight: 600, color: '#6b7280' }}>Finding deals near you...</div>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 16px' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <div style={{ fontWeight: 600, color: '#374151', fontSize: 17, marginBottom: 6 }}>No slots right now</div>
              <div style={{ color: '#9ca3af', fontSize: 14 }}>Check back soon or post what you need below</div>
            </div>
          ) : (
            filtered.map(slot => {
              const disc = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
              const mins = minsUntil(slot.slot_time)
              const isUrgent = mins < 90 || slot.spots_remaining === 1
              const isSaved = savedIds.includes(slot.id)
              const isClaimed = claimedIds.includes(slot.id)
              const isShared = sharedSlotId === slot.id
              const rating = getRating(slot.business_name || '')

              return (
                <div key={slot.id} id={`slot-${slot.id}`} className={clsx('mob-card', isShared && 'shared')}>

                  {/* Urgency bar at top of card */}
                  <div className="mob-urgent-bar" style={{
                    background: isUrgent ? '#ef4444' : disc >= 45 ? '#f59e0b' : '#10b981'
                  }} />

                  {/* Heart + Share — top right */}
                  <div className="mob-actions-row">
                    <button className="icon-btn" onClick={() => shareSlot(slot.id)}>
                      {copyMsg === slot.id ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                      )}
                    </button>
                    <button className="icon-btn" onClick={() => toggleSave(slot.id)}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : '#9ca3af'} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card top */}
                  <div className="mob-card-top">
                    <div className="mob-emoji-box">
                      {catEmoji[slot.business_category || ''] || '📌'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="mob-biz-name">{slot.business_name}</div>
                      <div className="mob-svc-name">{slot.service_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Stars score={rating.score} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{rating.score}</span>
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>({rating.count})</span>
                      </div>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="mob-card-price-row">
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span className="mob-price-big">${slot.deal_price}</span>
                        <span className="mob-price-orig">${slot.original_price}</span>
                      </div>
                      <div className="mob-save">You save ${(slot.original_price - slot.deal_price).toFixed(0)}</div>
                    </div>
                    <div>
                      <div className="mob-disc-badge" style={{
                        background: disc >= 50 ? '#fee2e2' : disc >= 35 ? '#fef3c7' : '#d1fae5',
                        color: disc >= 50 ? '#dc2626' : disc >= 35 ? '#d97706' : '#065f46',
                      }}>
                        {disc}% OFF
                      </div>
                    </div>
                  </div>

                  {/* Footer: meta + claim */}
                  <div className="mob-card-footer">
                    <div className="mob-meta">
                      <span>🕐 {formatTime(slot.slot_time)}</span>
                      <span style={{ color: isUrgent ? '#ef4444' : '#9ca3af', fontWeight: isUrgent ? 600 : 400 }}>
                        {slot.spots_remaining === 1 ? '🔥 Last spot!' : `${slot.spots_remaining} spots`} · {formatExpiry(mins)}
                      </span>
                      {slot.business_address && (
                        <span>📍 {slot.business_address.split(',')[0]}</span>
                      )}
                    </div>
                    <button
                      className={clsx('mob-claim-btn', isClaimed ? 'mob-claim-done' : 'mob-claim-active')}
                      onClick={() => !isClaimed && handleClaim(slot.id)}
                      disabled={claimingId === slot.id || isClaimed}
                    >
                      {isClaimed ? '✓ Claimed' : claimingId === slot.id ? '...' : 'Claim →'}
                    </button>
                  </div>

                </div>
              )
            })
          )}
        </div>

        {/* Mobile filter drawer */}
        {showMobileFilters && (
          <>
            <div className="mob-filter-overlay" onClick={() => setShowMobileFilters(false)} />
            <div className="mob-filter-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Filters</div>
                <button onClick={() => setShowMobileFilters(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer' }}>✕</button>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Max price: <span style={{ color: '#10b981' }}>${maxPrice}</span></div>
                <input type="range" min={5} max={200} value={maxPrice}
                  onChange={e => setMaxPrice(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Min discount: <span style={{ color: '#10b981' }}>{minDiscount}%+ off</span></div>
                <input type="range" min={0} max={70} step={5} value={minDiscount}
                  onChange={e => setMinDiscount(parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#10b981' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Saved only</div>
                <div onClick={() => setShowSavedOnly(p => !p)}
                  style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: showSavedOnly ? '#10b981' : '#e5e7eb', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: showSavedOnly ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              <button onClick={() => setShowMobileFilters(false)}
                style={{ width: '100%', padding: '14px', background: '#111827', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
                Show {filtered.length} slots
              </button>
            </div>
          </>
        )}

        {/* Mobile "I need" drawer */}
        {needForm && !needSubmitted && (
          <>
            <div className="mob-need-overlay" onClick={() => setNeedForm(false)} />
            <div className="mob-need-drawer">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Post what you need</div>
                <button onClick={() => setNeedForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleNeedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label className="mob-label">What do you need?</label>
                  <input name="service_name" required placeholder="e.g. Women's cut + color" className="mob-input" />
                </div>
                <div>
                  <label className="mob-label">Category</label>
                  <select name="category" className="mob-input">
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="mob-label">When</label>
                    <select name="when_needed" className="mob-input">
                      <option>Today</option><option>Tomorrow</option><option>This week</option><option>Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label className="mob-label">Budget ($)</label>
                    <input name="budget" type="number" placeholder="50" className="mob-input" />
                  </div>
                </div>
                <div>
                  <label className="mob-label">Your email</label>
                  <input name="consumer_email" type="email" required placeholder="you@email.com" className="mob-input" />
                </div>
                <input type="hidden" name="radius_miles" value="5" />
                <button type="submit"
                  style={{ padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer' }}>
                  Post my request →
                </button>
              </form>
            </div>
          </>
        )}

        {needSubmitted && (
          <div style={{ margin: '0 16px', background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 12, padding: 16, fontSize: 14, color: '#065f46', textAlign: 'center' }}>
            ✓ Posted! Matching businesses have been notified.
          </div>
        )}

        {/* Sticky bottom bar */}
        <div className="mob-bottom-bar">
          <button className="mob-bottom-need-btn" onClick={() => setNeedForm(true)}>
            + Post an "I need"
          </button>
          <button className="mob-bottom-filter-btn" onClick={() => setShowMobileFilters(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" />
            </svg>
            Filters {(minDiscount > 0 || maxPrice < 200 || showSavedOnly) ? '●' : ''}
          </button>
        </div>

      </div>
    </>
  )
}