'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Nav from '@/components/Nav'
import SlotCard from '@/components/SlotCard'
import { Slot } from '@/lib/types'
import clsx from 'clsx'

const CATEGORIES = ['All', 'Salon & barber', 'Fitness', 'Golf', 'Spa', 'Dining', 'Services']

export default function BoardPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [claimedIds, setClaimedIds] = useState<string[]>([])
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [needForm, setNeedForm] = useState(false)
  const [needSubmitted, setNeedSubmitted] = useState(false)

  useEffect(() => {
    fetchSlots()
    // Re-fetch every 10 seconds so the board stays fresh
    const interval = setInterval(fetchSlots, 10000)
    return () => clearInterval(interval)
  }, [])

  async function fetchSlots() {
  const res = await fetch('/api/slots/active', { cache: 'no-store' })
  const data = await res.json()
  if (data.slots) setSlots(data.slots as Slot[])
  setLoading(false)
}

  const filtered = activeCategory === 'All'
    ? slots
    : slots.filter(s => s.business_category === activeCategory)

  async function handleClaim(slotId: string, email: string) {
    setClaimingId(slotId)
    const res = await fetch('/api/claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slotId, consumerEmail: email }),
    })
    if (res.ok) {
      setClaimedIds(prev => [...prev, slotId])
      fetchSlots()
    } else {
      alert('Sorry, that slot may have just been claimed. Refreshing...')
      fetchSlots()
    }
    setClaimingId(null)
  }

  async function handleNeedSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))
    await fetch('/api/need', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setNeedSubmitted(true)
  }

  return (
    <>
      <Nav />
      <main className="max-w-5xl mx-auto px-4 pb-16">

        {/* Header */}
        <div className="py-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">Open slots near you</h1>
            <div className="flex items-center gap-2 text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              {slots.length} live · Williamstown, NJ
            </div>
            <button onClick={fetchSlots} className="text-xs text-gray-400 hover:text-gray-600 underline">Refresh</button>
          </div>
          <p className="text-sm text-gray-500">From vetted local businesses. Updated in real time.</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-6">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={clsx(
                'px-3 py-1.5 rounded-full text-sm transition-colors border',
                activeCategory === cat
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Slot grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading slots...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-2">No open slots in this category right now.</div>
            <div className="text-sm text-gray-300">New slots are posted throughout the day.</div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
            {filtered.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onClaim={handleClaim}
                claimed={claimedIds.includes(slot.id)}
                loading={claimingId === slot.id}
              />
            ))}
          </div>
        )}

        {/* "I Need" section */}
        <div className="border-t border-gray-100 pt-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-gray-900">Don't see what you need?</h2>
              <p className="text-sm text-gray-500">Post a request — businesses near you will be notified.</p>
            </div>
            {!needForm && !needSubmitted && (
              <button onClick={() => setNeedForm(true)} className="btn-secondary text-sm">
                Post an "I need" →
              </button>
            )}
          </div>

          {needSubmitted && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-700">
              Request posted. Matching businesses in your area have been notified.
            </div>
          )}

          {needForm && !needSubmitted && (
            <form onSubmit={handleNeedSubmit} className="bg-gray-50 rounded-xl p-5 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="label">What do you need?</label>
                  <input name="service_name" required placeholder="e.g. Women's cut + color" className="input" />
                </div>
                <div>
                  <label className="label">Category</label>
                  <select name="category" className="input">
                    <option>Salon & barber</option>
                    <option>Fitness</option>
                    <option>Spa</option>
                    <option>Golf</option>
                    <option>Dining</option>
                    <option>Services</option>
                  </select>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="label">When</label>
                  <select name="when_needed" className="input">
                    <option>Today</option>
                    <option>Tomorrow</option>
                    <option>This week</option>
                    <option>Flexible</option>
                  </select>
                </div>
                <div>
                  <label className="label">Budget (up to $)</label>
                  <input name="budget" type="number" placeholder="50" className="input" />
                </div>
                <div>
                  <label className="label">Within</label>
                  <select name="radius_miles" className="input">
                    <option value="2">2 miles</option>
                    <option value="5">5 miles</option>
                    <option value="10">10 miles</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Your email (for notifications)</label>
                <input name="consumer_email" type="email" required placeholder="you@email.com" className="input" />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">Post my request →</button>
                <button type="button" onClick={() => setNeedForm(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          )}
        </div>

      </main>
    </>
  )
}
