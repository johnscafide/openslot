'use client'
import { useEffect, useState, useCallback, useRef } from 'react'
import dynamic from 'next/dynamic'
import Nav from '@/components/Nav'
import { Slot } from '@/lib/types'
import clsx from 'clsx'

// Dynamically import map to avoid SSR issues
const MapClient = dynamic(() => import('@/components/MapClient'), { ssr: false })

const CATEGORIES = ['All', 'Salon & barber', 'Fitness', 'Golf', 'Spa', 'Dining', 'Services']
const SAVED_KEY = 'openslot_saved'
const VIEWERS_KEY = 'openslot_viewers'

function formatTime(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const tomorrow = new Date(); tomorrow.setDate(today.getDate() + 1)
  const isToday = d.toDateString() === today.toDateString()
  const isTomorrow = d.toDateString() === tomorrow.toDateString()
  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' })
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

function isNew(created_at: string) {
  return Date.now() - new Date(created_at).getTime() < 30 * 60 * 1000 // 30 min
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
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="11" height="11" viewBox="0 0 12 12" fill="none">
          <path d="M6 1l1.27 2.57 2.83.41-2.05 2 .48 2.83L6 7.5 3.47 8.81l.48-2.83-2.05-2 2.83-.41z"
            fill={i <= Math.round(score) ? '#F59E0B' : '#E5E7EB'}
            stroke={i <= Math.round(score) ? '#F59E0B' : '#E5E7EB'} strokeWidth="0.5" />
        </svg>
      ))}
    </div>
  )
}

// Toast notification
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'info'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: type === 'success' ? '#10b981' : '#111827',
      color: 'white', padding: '12px 18px', borderRadius: 10,
      fontFamily: "'Outfit', sans-serif", fontSize: 14, fontWeight: 500,
      boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 10,
      animation: 'slideIn 0.2s ease',
    }}>
      <span>{type === 'success' ? '✓' : 'ℹ'}</span>
      {message}
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '0 4px' }}>×</button>
    </div>
  )
}

// Viewers count — fun social proof
function useViewers(slotId: string) {
  const [viewers, setViewers] = useState(0)
  useEffect(() => {
    const seed = slotId.charCodeAt(0) + slotId.charCodeAt(1)
    setViewers(1 + (seed % 4)) // 1-4 viewers, consistent per slot
    const interval = setInterval(() => {
      setViewers(1 + Math.floor(Math.random() * 4))
    }, 25000)
    return () => clearInterval(interval)
  }, [slotId])
  return viewers
}

// Individual slot row
function SlotRow({ slot, isSaved, isClaimed, isShared, isHovered, claimingId, copyMsg, onClaim, onSave, onShare, onHoverChange }: {
  slot: Slot
  isSaved: boolean
  isClaimed: boolean
  isShared: boolean
  isHovered: boolean
  claimingId: string | null
  copyMsg: string | null
  onClaim: (id: string) => void
  onSave: (id: string) => void
  onShare: (id: string) => void
  onHoverChange: (id: string | null) => void
}) {
  const disc = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
  const mins = minsUntil(slot.slot_time)
  const isUrgent = mins < 90 || slot.spots_remaining === 1
  const rating = getRating(slot.business_name || '')
  const viewers = useViewers(slot.id)
  const slotIsNew = isNew(slot.created_at)

  const catEmoji: Record<string, string> = {
    'Salon & barber': '✂️', 'Fitness': '🏃', 'Golf': '⛳',
    'Spa': '💆', 'Dining': '🍽️', 'Services': '📋',
  }

  return (
    <div
      onMouseEnter={() => onHoverChange(slot.id)}
      onMouseLeave={() => onHoverChange(null)}
      style={{
        display: 'flex', borderBottom: '1px solid #f3f4f6',
        background: isHovered ? '#f9fafb' : isShared ? '#fffbeb' : 'white',
        transition: 'background 0.1s',
      }}
    >
      {/* Urgency stripe */}
      <div style={{ width: 4, flexShrink: 0, background: isUrgent ? '#ef4444' : disc >= 45 ? '#f59e0b' : '#10b981' }} />

      <div style={{ flex: 1, padding: '16px 18px', display: 'flex', gap: 16, alignItems: 'flex-start' }}>

        {/* Icon */}
        <div style={{ width: 44, height: 44, borderRadius: 10, flexShrink: 0, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
          {catEmoji[slot.business_category || ''] || '📌'}
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 600, fontSize: 15, color: '#111827', fontFamily: "'Outfit', sans-serif" }}>{slot.business_name}</span>
            {isUrgent && <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '2px 7px', borderRadius: 20 }}>HOT</span>}
            {slotIsNew && <span style={{ fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 7px', borderRadius: 20 }}>NEW</span>}
            {isShared && <span style={{ fontSize: 10, fontWeight: 700, background: '#fef3c7', color: '#d97706', padding: '2px 7px', borderRadius: 20 }}>SHARED</span>}
          </div>
          <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6, fontFamily: "'Outfit', sans-serif" }}>{slot.service_name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 6 }}>
            <Stars score={rating.score} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#374151', fontFamily: "'Outfit', sans-serif" }}>{rating.score}</span>
            <span style={{ fontSize: 11, color: '#9ca3af', fontFamily: "'Outfit', sans-serif" }}>({rating.count})</span>
            {viewers > 1 && (
              <span style={{ fontSize: 11, color: '#6b7280', background: '#f3f4f6', padding: '1px 7px', borderRadius: 10, marginLeft: 4, fontFamily: "'Outfit', sans-serif" }}>
                👁 {viewers} viewing
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 14, fontSize: 12, color: '#9ca3af', flexWrap: 'wrap', fontFamily: "'Outfit', sans-serif" }}>
            <span>🕐 {formatTime(slot.slot_time)}</span>
            {slot.business_address && <span>📍 {slot.business_address.split(',')[0]}</span>}
            <span style={{ color: isUrgent ? '#ef4444' : '#9ca3af', fontWeight: isUrgent ? 600 : 400 }}>
              {slot.spots_remaining === 1 ? '🔥 Last spot' : `${slot.spots_remaining} spots`} · {formatExpiry(mins)}
            </span>
          </div>
          {slot.notes && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 5, fontStyle: 'italic', fontFamily: "'Outfit', sans-serif" }}>"{slot.notes}"</div>}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 20, background: disc >= 50 ? '#fee2e2' : disc >= 35 ? '#fef3c7' : '#d1fae5', color: disc >= 50 ? '#dc2626' : disc >= 35 ? '#d97706' : '#065f46', fontFamily: "'Outfit', sans-serif" }}>
            {disc}% OFF
          </span>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827', lineHeight: 1, fontFamily: "'Outfit', sans-serif" }}>${slot.deal_price}</div>
            <div style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'line-through', fontFamily: "'Outfit', sans-serif" }}>${slot.original_price}</div>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>save ${(slot.original_price - slot.deal_price).toFixed(0)}</div>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {/* Share */}
            <button onClick={() => onShare(slot.id)} title="Share" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {copyMsg === slot.id
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
              }
            </button>
            {/* Save */}
            <button onClick={() => onSave(slot.id)} title={isSaved ? 'Remove from saved' : 'Save'} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : '#9ca3af'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            {/* Claim */}
            <button
              onClick={() => !isClaimed && onClaim(slot.id)}
              disabled={claimingId === slot.id || isClaimed}
              style={{
                padding: '9px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: isClaimed ? 'default' : 'pointer', border: 'none',
                background: isClaimed ? '#d1fae5' : '#10b981',
                color: isClaimed ? '#065f46' : 'white',
                fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s',
              }}
            >
              {isClaimed ? '✓ Claimed' : claimingId === slot.id ? '...' : 'Claim →'}
            </button>
          </div>
        </div>
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
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [sharedSlotId, setSharedSlotId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null)
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  // Load saved IDs from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(SAVED_KEY)
      if (stored) setSavedIds(JSON.parse(stored))
    } catch {}

    const params = new URLSearchParams(window.location.search)
    setReferralCode(params.get('ref'))
    setSharedSlotId(params.get('slot'))

    // Force light mode on board page — override landing page dark styles
    document.body.style.background = '#f9fafb'
    return () => { document.body.style.background = '' }
  }, [])

  // Persist saved IDs to localStorage whenever they change
  useEffect(() => {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds)) } catch {}
  }, [savedIds])

  const fetchSlots = useCallback(async () => {
    try {
      const res = await fetch('/api/slots/active', { cache: 'no-store' })
      const data = await res.json()
      if (data.slots) setSlots(data.slots as Slot[])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
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
    setSavedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      setToast({ message: prev.includes(id) ? 'Removed from saved' : 'Saved! Persisted on this device.', type: 'info' })
      return next
    })
  }

  const shareSlot = (slotId: string) => {
    const url = `${window.location.origin}/board?slot=${slotId}`
    navigator.clipboard.writeText(url).then(() => {
      setCopyMsg(slotId)
      setToast({ message: 'Link copied to clipboard!', type: 'info' })
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
      setToast({ message: 'Slot claimed! Check your email for confirmation.', type: 'success' })
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
    setToast({ message: 'Request posted! Businesses in your area notified.', type: 'success' })
  }

  let filtered = slots
    .filter(s => activeCategory === 'All' || s.business_category === activeCategory)
    .filter(s => s.deal_price <= maxPrice)
    .filter(s => Math.round((s.original_price - s.deal_price) / s.original_price * 100) >= minDiscount)
    .filter(s => !showSavedOnly || savedIds.includes(s.id))

  filtered = [...filtered].sort((a, b) => {
    if (sortBy === 'time') return new Date(a.slot_time).getTime() - new Date(b.slot_time).getTime()
    if (sortBy === 'price') return a.deal_price - b.deal_price
    const da = (a.original_price - a.deal_price) / a.original_price
    const db = (b.original_price - b.deal_price) / b.original_price
    return db - da
  })

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; font-family: 'Outfit', sans-serif; }
        body { background: #f9fafb !important; }

        .filter-label { font-size: 11px; font-weight: 600; color: #6b7280; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 8px; display: block; }
        .range-input { width: 100%; accent-color: #10b981; }
        .cat-chip { padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #e5e7eb; background: white; color: #6b7280; transition: all 0.12s; white-space: nowrap; font-family: 'Outfit', sans-serif; }
        .cat-chip.active { background: #10b981; border-color: #10b981; color: white; }
        .cat-chip:hover:not(.active) { border-color: #10b981; color: #10b981; }
        .sort-btn { padding: 5px 12px; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; border: 1px solid #e5e7eb; background: white; color: #6b7280; transition: all 0.12s; font-family: 'Outfit', sans-serif; }
        .sort-btn.active { background: #111827; border-color: #111827; color: white; }
        @keyframes slideIn { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

        /* Mobile */
        @media (max-width: 768px) {
          .desktop-only { display: none !important; }
          .mob-header { background: #111827; padding: 16px 16px 0; position: sticky; top: 0; z-index: 40; }
          .mob-cats { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 14px; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
          .mob-cats::-webkit-scrollbar { display: none; }
          .mob-cat-btn { flex-shrink: 0; padding: 7px 14px; border-radius: 20px; font-size: 13px; font-weight: 500; border: 1px solid rgba(255,255,255,0.15); background: transparent; color: rgba(255,255,255,0.6); cursor: pointer; white-space: nowrap; font-family: 'Outfit', sans-serif; }
          .mob-cat-btn.active { background: #10b981; border-color: #10b981; color: white; }
          .mob-card { background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 12px rgba(0,0,0,0.08); margin: 0 16px 14px; }
          .mob-claim-btn { padding: 12px 22px; border-radius: 10px; font-size: 15px; font-weight: 700; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; }
          .mob-bottom-bar { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-top: 1px solid #f3f4f6; padding: 12px 16px; display: flex; gap: 10px; z-index: 50; }
          .mob-filter-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 100; }
          .mob-filter-drawer { position: fixed; bottom: 0; left: 0; right: 0; background: white; border-radius: 20px 20px 0 0; padding: 24px; z-index: 101; max-height: 70vh; overflow-y: auto; }
          .mob-content { padding-top: 12px; padding-bottom: 90px; background: #f9fafb; min-height: 100vh; }
        }
        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>

      <Nav />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Referral banner */}
      {referralCode && (
        <div style={{ background: '#f0fdf4', borderBottom: '1px solid #a7f3d0', padding: '10px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#065f46', fontWeight: 500 }}>
            🎁 You were referred! Claim a slot and you both get $5 credit.
          </span>
        </div>
      )}

      {/* Saved count banner */}
      {savedIds.length > 0 && !showSavedOnly && (
        <div style={{ background: '#fffbeb', borderBottom: '1px solid #fde68a', padding: '8px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: '#92400e' }}>
            ❤️ You have {savedIds.length} saved slot{savedIds.length > 1 ? 's' : ''} —{' '}
            <button onClick={() => setShowSavedOnly(true)} style={{ background: 'none', border: 'none', color: '#d97706', fontWeight: 600, cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
              view them
            </button>
          </span>
        </div>
      )}

      {/* ═══ DESKTOP ═══ */}
      <div className="desktop-only">
        <div style={{ display: 'flex', maxWidth: 1200, margin: '0 auto', padding: '0 16px', gap: 24, paddingTop: 24, paddingBottom: 40 }}>

          {/* Sidebar */}
          <aside style={{ width: 280, flexShrink: 0, position: 'sticky', top: 80, height: 'fit-content' }}>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{filtered.length} open slots</span>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>· Greater Philadelphia</span>
            </div>

            {/* Leaflet Map */}
            <div style={{ marginBottom: 20 }}>
              <MapClient slots={filtered} hoveredId={hoveredId} onHover={setHoveredId} />
            </div>

            {/* Categories */}
            <div style={{ marginBottom: 18 }}>
              <span className="filter-label">Category</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {CATEGORIES.map(cat => (
                  <button key={cat} className={clsx('cat-chip', activeCategory === cat && 'active')} onClick={() => setActiveCategory(cat)}>{cat}</button>
                ))}
              </div>
            </div>

            {/* Max price */}
            <div style={{ marginBottom: 18 }}>
              <span className="filter-label">Max price</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>$0</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>${maxPrice}</span>
              </div>
              <input type="range" min={5} max={200} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="range-input" />
            </div>

            {/* Min discount */}
            <div style={{ marginBottom: 18 }}>
              <span className="filter-label">Min discount</span>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Any</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{minDiscount}%+ off</span>
              </div>
              <input type="range" min={0} max={70} step={5} value={minDiscount} onChange={e => setMinDiscount(parseInt(e.target.value))} className="range-input" />
            </div>

            {/* Saved toggle */}
            <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Saved only</span>
                {savedIds.length > 0 && <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>({savedIds.length})</span>}
              </div>
              <div onClick={() => setShowSavedOnly(p => !p)} style={{ width: 40, height: 22, borderRadius: 11, cursor: 'pointer', background: showSavedOnly ? '#10b981' : '#e5e7eb', position: 'relative', transition: 'background 0.2s' }}>
                <div style={{ position: 'absolute', top: 3, left: showSavedOnly ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
              </div>
            </div>

            {/* Saves note */}
            <div style={{ background: '#f0fdf4', border: '1px solid #a7f3d0', borderRadius: 8, padding: '10px 12px', marginBottom: 16, fontSize: 12, color: '#065f46' }}>
              ❤️ Saves are stored on this device. Account sign-in coming soon.
            </div>

            {/* Post a need */}
            <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: 14 }}>
              <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>Don't see what you need? Post a request and businesses come to you.</p>
              <button onClick={() => setNeedForm(p => !p)} style={{ width: '100%', padding: '9px', borderRadius: 8, border: '1px dashed #d1d5db', background: 'transparent', color: '#6b7280', fontSize: 13, cursor: 'pointer', fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
                + Post an "I need"
              </button>
            </div>
          </aside>

          {/* Main */}
          <main style={{ flex: 1, minWidth: 0 }}>

            {/* Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
                {filtered.length} slot{filtered.length !== 1 ? 's' : ''} available
                {showSavedOnly && <span style={{ fontSize: 12, color: '#d97706', marginLeft: 8, background: '#fef3c7', padding: '2px 8px', borderRadius: 20 }}>saved only</span>}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#9ca3af', marginRight: 4 }}>Sort:</span>
                {(['time', 'discount', 'price'] as const).map(s => (
                  <button key={s} className={clsx('sort-btn', sortBy === s && 'active')} onClick={() => setSortBy(s)}>
                    {s === 'time' ? 'Soonest' : s === 'discount' ? 'Best deal' : 'Lowest price'}
                  </button>
                ))}
              </div>
            </div>

            {/* Slots */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>Loading slots...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ fontSize: 15, color: '#6b7280', marginBottom: 6 }}>No slots match your filters</div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {showSavedOnly ? <><button onClick={() => setShowSavedOnly(false)} style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>Browse all slots</button></> : 'Try adjusting the price or category filters'}
                </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 12, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                {filtered.map((slot, idx) => (
                  <div key={slot.id} id={`slot-${slot.id}`} style={{ borderTop: idx === 0 ? 'none' : undefined }}>
                    <SlotRow
                      slot={slot}
                      isSaved={savedIds.includes(slot.id)}
                      isClaimed={claimedIds.includes(slot.id)}
                      isShared={sharedSlotId === slot.id}
                      isHovered={hoveredId === slot.id}
                      claimingId={claimingId}
                      copyMsg={copyMsg}
                      onClaim={handleClaim}
                      onSave={toggleSave}
                      onShare={shareSlot}
                      onHoverChange={setHoveredId}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* I Need form */}
            {needForm && (
              <div style={{ marginTop: 24, background: 'white', borderRadius: 12, border: '1px solid #e5e7eb', padding: 24 }}>
                <div style={{ fontWeight: 600, fontSize: 15, color: '#111827', marginBottom: 4 }}>Post what you need</div>
                <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>Matching businesses will be notified.</p>
                <form onSubmit={handleNeedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>What do you need?</label>
                      <input name="service_name" required placeholder="e.g. Women's cut + color" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Category</label>
                      <select name="category" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                        {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>When</label>
                      <select name="when_needed" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                        <option>Today</option><option>Tomorrow</option><option>This week</option><option>Flexible</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Budget ($)</label>
                      <input name="budget" type="number" placeholder="50" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }} />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Within</label>
                      <select name="radius_miles" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }}>
                        <option value="5">5 miles</option><option value="10">10 miles</option><option value="20">20 miles</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 4 }}>Your email</label>
                    <input name="consumer_email" type="email" required placeholder="you@email.com" style={{ width: '100%', padding: '8px 10px', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, fontFamily: "'Outfit', sans-serif" }} />
                  </div>
                  <input type="hidden" name="radius_miles" value="10" />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button type="submit" style={{ padding: '9px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Post request →</button>
                    <button type="button" onClick={() => setNeedForm(false)} style={{ padding: '9px 20px', background: 'white', border: '1px solid #e5e7eb', borderRadius: 8, fontSize: 13, color: '#6b7280', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ═══ MOBILE ═══ */}
      <div className="mobile-only">
        <div className="mob-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'white' }}>Open Slots</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Greater Philadelphia</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '5px 12px' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 13, color: '#10b981', fontWeight: 600 }}>{filtered.length} live</span>
            </div>
          </div>
          <div className="mob-cats">
            {CATEGORIES.map(cat => (
              <button key={cat} className={clsx('mob-cat-btn', activeCategory === cat && 'active')} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Mobile sort */}
        <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflow: 'auto', background: '#f9fafb', borderBottom: '1px solid #f3f4f6' }}>
          <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, flexShrink: 0, lineHeight: '28px' }}>SORT:</span>
          {(['time', 'discount', 'price'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)}
              style={{ flexShrink: 0, padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 500, border: `1px solid ${sortBy === s ? '#111827' : '#e5e7eb'}`, background: sortBy === s ? '#111827' : 'white', color: sortBy === s ? 'white' : '#6b7280', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
              {s === 'time' ? '🕐 Soonest' : s === 'discount' ? '🔥 Best deal' : '💰 Lowest'}
            </button>
          ))}
        </div>

        <div className="mob-content">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 16px', color: '#9ca3af' }}>Loading slots...</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 16px' }}>
              <div style={{ fontSize: 15, color: '#6b7280' }}>No slots right now</div>
              <div style={{ fontSize: 13, color: '#9ca3af', marginTop: 4 }}>Check back soon or post what you need below</div>
            </div>
          ) : (
            filtered.map(slot => {
              const disc = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
              const mins = minsUntil(slot.slot_time)
              const isUrgent = mins < 90 || slot.spots_remaining === 1
              const isSaved = savedIds.includes(slot.id)
              const isClaimed = claimedIds.includes(slot.id)
              const rating = getRating(slot.business_name || '')
              const slotIsNew = isNew(slot.created_at)
              const catEmoji: Record<string, string> = { 'Salon & barber': '✂️', 'Fitness': '🏃', 'Golf': '⛳', 'Spa': '💆', 'Dining': '🍽️', 'Services': '📋' }

              return (
                <div key={slot.id} className="mob-card">
                  <div style={{ height: 3, background: isUrgent ? '#ef4444' : disc >= 45 ? '#f59e0b' : '#10b981' }} />
                  <div style={{ position: 'absolute', top: 14, right: 14, display: 'flex', gap: 4 }}>
                    <button onClick={() => shareSlot(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                    </button>
                    <button onClick={() => toggleSave(slot.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 6, borderRadius: '50%' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isSaved ? '#ef4444' : 'none'} stroke={isSaved ? '#ef4444' : '#9ca3af'} strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>
                  <div style={{ padding: '16px 18px 14px', display: 'flex', gap: 12, alignItems: 'flex-start', position: 'relative' }}>
                    <div style={{ width: 52, height: 52, borderRadius: 14, background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>
                      {catEmoji[slot.business_category || ''] || '📌'}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginBottom: 2 }}>
                        <span style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>{slot.business_name}</span>
                        {isUrgent && <span style={{ fontSize: 10, fontWeight: 700, background: '#fee2e2', color: '#dc2626', padding: '2px 6px', borderRadius: 20 }}>HOT</span>}
                        {slotIsNew && <span style={{ fontSize: 10, fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '2px 6px', borderRadius: 20 }}>NEW</span>}
                      </div>
                      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{slot.service_name}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Stars score={rating.score} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{rating.score}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '0 18px 16px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'baseline' }}>
                        <span style={{ fontSize: 36, fontWeight: 800, color: '#111827', lineHeight: 1 }}>${slot.deal_price}</span>
                        <span style={{ fontSize: 14, color: '#9ca3af', textDecoration: 'line-through', marginLeft: 6 }}>${slot.original_price}</span>
                      </div>
                      <div style={{ fontSize: 12, color: '#10b981', fontWeight: 600, marginTop: 2 }}>You save ${(slot.original_price - slot.deal_price).toFixed(0)}</div>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, padding: '5px 12px', borderRadius: 20, background: disc >= 50 ? '#fee2e2' : disc >= 35 ? '#fef3c7' : '#d1fae5', color: disc >= 50 ? '#dc2626' : disc >= 35 ? '#d97706' : '#065f46' }}>
                      {disc}% OFF
                    </span>
                  </div>
                  <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: 12, color: '#9ca3af', display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span>🕐 {formatTime(slot.slot_time)}</span>
                      <span style={{ color: isUrgent ? '#ef4444' : '#9ca3af', fontWeight: isUrgent ? 600 : 400 }}>
                        {slot.spots_remaining === 1 ? '🔥 Last spot!' : `${slot.spots_remaining} spots`} · {formatExpiry(mins)}
                      </span>
                    </div>
                    <button
                      className="mob-claim-btn"
                      onClick={() => !isClaimed && handleClaim(slot.id)}
                      disabled={claimingId === slot.id || isClaimed}
                      style={{ background: isClaimed ? '#d1fae5' : '#10b981', color: isClaimed ? '#065f46' : 'white', minWidth: 110 }}
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
                <input type="range" min={5} max={200} value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 10 }}>Min discount: <span style={{ color: '#10b981' }}>{minDiscount}%+ off</span></div>
                <input type="range" min={0} max={70} step={5} value={minDiscount} onChange={e => setMinDiscount(parseInt(e.target.value))} style={{ width: '100%', accentColor: '#10b981' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Saved only ({savedIds.length})</div>
                <div onClick={() => setShowSavedOnly(p => !p)} style={{ width: 44, height: 24, borderRadius: 12, cursor: 'pointer', background: showSavedOnly ? '#10b981' : '#e5e7eb', position: 'relative', transition: 'background 0.2s' }}>
                  <div style={{ position: 'absolute', top: 3, left: showSavedOnly ? 23 : 3, width: 18, height: 18, borderRadius: '50%', background: 'white', transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>
              <button onClick={() => setShowMobileFilters(false)} style={{ width: '100%', padding: '14px', background: '#111827', color: 'white', border: 'none', borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                Show {filtered.length} slots
              </button>
            </div>
          </>
        )}

        {/* Mobile bottom bar */}
        <div className="mob-bottom-bar">
          <button onClick={() => setNeedForm(true)} style={{ flex: 1, padding: '13px', borderRadius: 10, border: '1.5px dashed #d1d5db', background: 'transparent', color: '#6b7280', fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
            + Post an "I need"
          </button>
          <button onClick={() => setShowMobileFilters(true)} style={{ padding: '13px 18px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontFamily: "'Outfit', sans-serif" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="11" y1="18" x2="13" y2="18" /></svg>
            Filters {(minDiscount > 0 || maxPrice < 200 || showSavedOnly) ? '●' : ''}
          </button>
        </div>

        {/* Mobile I Need drawer */}
        {needForm && (
          <>
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100 }} onClick={() => setNeedForm(false)} />
            <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'white', borderRadius: '20px 20px 0 0', padding: 24, zIndex: 101, maxHeight: '85vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Post what you need</div>
                <button onClick={() => setNeedForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, color: '#6b7280', cursor: 'pointer' }}>✕</button>
              </div>
              <form onSubmit={handleNeedSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>What do you need?</label>
                  <input name="service_name" required placeholder="e.g. Gel manicure" style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: 'none' }} />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Category</label>
                  <select name="category" style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>
                    {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>When</label>
                    <select name="when_needed" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontFamily: "'Outfit', sans-serif" }}>
                      <option>Today</option><option>Tomorrow</option><option>This week</option><option>Flexible</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Budget ($)</label>
                    <input name="budget" type="number" placeholder="50" style={{ width: '100%', padding: '12px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontFamily: "'Outfit', sans-serif" }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', display: 'block', marginBottom: 6 }}>Your email</label>
                  <input name="consumer_email" type="email" required placeholder="you@email.com" style={{ width: '100%', padding: '13px 14px', border: '1.5px solid #e5e7eb', borderRadius: 10, fontSize: 15, fontFamily: "'Outfit', sans-serif", outline: 'none' }} />
                </div>
                <input type="hidden" name="radius_miles" value="10" />
                <button type="submit" style={{ padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}>
                  Post my request →
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </>
  )
}