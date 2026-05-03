'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Nav from '@/components/Nav'
import Link from 'next/link'
import clsx from 'clsx'

function fmt(iso: string) {
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/New_York',
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
}

function Dashboard() {
  const params = useSearchParams()
  const token = params.get('token')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) { setError('No token provided.'); setLoading(false); return }
    fetch(`/api/my-slots?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
        setLoading(false)
      })
  }, [token])

  if (loading) return <div className="text-center py-20 text-gray-400">Loading your dashboard...</div>
  if (error) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <div className="text-gray-900 font-semibold mb-2">Invalid link</div>
      <div className="text-gray-500 text-sm">Check your approval email for the correct link.</div>
    </div>
  )

  const activeSlots = data.slots.filter((s: any) => s.status === 'active')
  const pastSlots = data.slots.filter((s: any) => s.status !== 'active')
  const totalRevenue = data.claims.reduce((sum: number, c: any) => sum + (c.slots?.deal_price || 0), 0)
  const totalEarned = totalRevenue * 0.95

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{data.business.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{data.business.category} · {data.business.address}</p>
        </div>
        <Link
          href={`/post?token=${token}`}
          className="btn-primary"
        >
          + Post a slot
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Active slots', value: activeSlots.length, color: 'text-emerald-600' },
          { label: 'Total claims', value: data.claims.length, color: 'text-blue-600' },
          { label: 'Revenue generated', value: `$${totalRevenue.toFixed(0)}`, color: 'text-purple-600' },
          { label: 'Your earnings (95%)', value: `$${totalEarned.toFixed(0)}`, color: 'text-gray-900' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-xl p-4">
            <div className={clsx('text-2xl font-bold mb-1', s.color)}>{s.value}</div>
            <div className="text-xs text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Active slots */}
      <div className="bg-white border border-gray-100 rounded-xl mb-4 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="font-semibold text-gray-900">Active slots</div>
          <Link href={`/post?token=${token}`} className="text-sm text-emerald-600 hover:underline">
            + Add new
          </Link>
        </div>
        {activeSlots.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No active slots. <Link href={`/post?token=${token}`} className="text-emerald-600 underline">Post one now →</Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Service', 'Time', 'Deal price', 'Discount', 'Spots left'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {activeSlots.map((s: any) => {
                const disc = Math.round((s.original_price - s.deal_price) / s.original_price * 100)
                return (
                  <tr key={s.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.service_name}</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(s.slot_time)}</td>
                    <td className="px-4 py-3 text-emerald-600 font-medium">${s.deal_price}</td>
                    <td className="px-4 py-3">
                      <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
                        {disc}% off
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.spots_remaining}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Recent claims */}
      <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="font-semibold text-gray-900">Recent claims</div>
        </div>
        {data.claims.length === 0 ? (
          <div className="p-8 text-center text-gray-400">No claims yet. Post a slot to get started.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Service', 'Customer email', 'Amount', 'Your cut', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.claims.map((c: any) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{c.slots?.service_name || '—'}</td>
                  <td className="px-4 py-3 text-gray-500">{c.consumer_email}</td>
                  <td className="px-4 py-3 text-gray-700">${c.slots?.deal_price?.toFixed(2) || '—'}</td>
                  <td className="px-4 py-3 text-emerald-600 font-medium">
                    ${((c.slots?.deal_price || 0) * 0.95).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{fmt(c.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Past slots */}
      {pastSlots.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden mt-4">
          <div className="p-4 border-b border-gray-100">
            <div className="font-semibold text-gray-900 text-sm text-gray-500">Past & expired slots</div>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Service', 'Time', 'Price', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pastSlots.map((s: any) => (
                <tr key={s.id} className="border-b border-gray-50 last:border-0 opacity-60">
                  <td className="px-4 py-3 text-gray-700">{s.service_name}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(s.slot_time)}</td>
                  <td className="px-4 py-3 text-gray-500">${s.deal_price}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{s.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default function MySlotsPage() {
  return (
    <>
      <Nav />
      <Suspense fallback={<div className="text-center py-20 text-gray-400">Loading...</div>}>
        <Dashboard />
      </Suspense>
    </>
  )
}