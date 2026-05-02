'use client'
import clsx from 'clsx'
import { Slot } from '@/lib/types'

function formatTime(isoString: string) {
  const d = new Date(isoString)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  const isToday = d.toDateString() === today.toDateString()
  const isTomorrow = d.toDateString() === tomorrow.toDateString()

  const label = isToday ? 'Today' : isTomorrow ? 'Tomorrow'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  return `${label} · ${time}`
}

function minsUntil(isoString: string) {
  return Math.max(0, Math.round((new Date(isoString).getTime() - Date.now()) / 60000))
}

function formatExpiry(mins: number) {
  if (mins < 60) return `${mins}m left`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m === 0 ? `${h}h left` : `${h}h ${m}m left`
}

interface Props {
  slot: Slot
  onClaim: (slotId: string, email: string) => void
  claimed: boolean
  loading: boolean
}

export default function SlotCard({ slot, onClaim, claimed, loading }: Props) {
  const discountPct = Math.round((slot.original_price - slot.deal_price) / slot.original_price * 100)
  const savings = (slot.original_price - slot.deal_price).toFixed(2)
  const mins = minsUntil(slot.slot_time)
  const isUrgent = mins < 60 || slot.spots_remaining === 1
  const isWarn = !isUrgent && mins < 180

  const stripeColor = isUrgent ? 'bg-red-500' : isWarn ? 'bg-amber-400' : 'bg-emerald-500'
  const discBg = discountPct >= 50 ? 'bg-red-50 text-red-700' :
    discountPct >= 40 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'

  function handleClaim() {
    const email = prompt('Enter your email to claim this slot:')
    if (!email || !email.includes('@')) return
    onClaim(slot.id, email)
  }

  return (
    <div className="relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">

      {/* Urgency stripe */}
      <div className={clsx('absolute left-0 top-0 bottom-0 w-1', stripeColor)} />

      <div className="p-4 pl-5">

        {/* Top row */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400 uppercase tracking-wide">
            {slot.business_category}
          </span>
          <span className={clsx('text-xs font-semibold px-2 py-0.5 rounded-full', discBg)}>
            {discountPct}% off
          </span>
        </div>

        {/* Business + service */}
        <div className="mb-2">
          <div className="font-semibold text-gray-900">{slot.business_name}</div>
          <div className="text-sm text-gray-500">{slot.service_name}</div>
        </div>

        {/* Time + distance */}
        <div className="flex gap-4 text-xs text-gray-500 mb-3">
          <span>🕐 {formatTime(slot.slot_time)}</span>
          {slot.business_address && <span>📍 {slot.business_address}</span>}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">${slot.deal_price}</span>
          <span className="text-sm text-gray-400 line-through">${slot.original_price}</span>
          <span className="text-xs text-emerald-600 font-medium">save ${savings}</span>
        </div>

        {/* Action row */}
        <div className="flex items-center gap-2">
          {claimed ? (
            <div className="flex-1 text-center py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              ✓ Claimed — check your email
            </div>
          ) : (
            <button
              onClick={handleClaim}
              disabled={loading}
              className="flex-1 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Claiming...' : 'Claim this slot →'}
            </button>
          )}

          <div className="text-right shrink-0 min-w-[64px]">
            <div className={clsx('text-xs font-semibold', isUrgent ? 'text-red-500' : 'text-gray-400')}>
              {slot.spots_remaining === 1 ? '🔥 Last spot' : `${slot.spots_remaining} left`}
            </div>
            <div className="text-xs text-gray-300">{formatExpiry(mins)}</div>
          </div>
        </div>

      </div>
    </div>
  )
}
