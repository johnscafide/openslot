'use client'
import { useState, useEffect, useCallback } from 'react'
import clsx from 'clsx'

const TABS = ['Overview', 'Slots', 'Businesses', 'Applications', 'Needs', 'Watches', 'Claims']

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span className={clsx('text-xs font-medium px-2 py-0.5 rounded-full', color)}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    active: 'bg-emerald-50 text-emerald-700',
    claimed: 'bg-blue-50 text-blue-700',
    expired: 'bg-gray-100 text-gray-500',
    approved: 'bg-emerald-50 text-emerald-700',
    pending: 'bg-amber-50 text-amber-700',
    rejected: 'bg-red-50 text-red-700',
  }
  return <Badge label={status} color={colors[status] || 'bg-gray-100 text-gray-500'} />
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function AdminDashboard() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [authError, setAuthError] = useState('')
  const [activeTab, setActiveTab] = useState('Overview')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  const loadData = useCallback(async (s: string) => {
    setLoading(true)
    const res = await fetch(`/api/admin/data?secret=${s}`)
    if (res.status === 401) { setAuthError('Wrong password.'); setLoading(false); return }
    const json = await res.json()
    setData(json)
    setAuthed(true)
    setLoading(false)
  }, [])

  async function deleteRow(table: string, id: string, label: string) {
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return
    setDeleting(id)
    const res = await fetch('/api/admin/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, table, id }),
    })
    const json = await res.json()
    if (json.success) {
      setMsg(`Deleted: ${label}`)
      loadData(secret)
    } else {
      setMsg('Error: ' + json.error)
    }
    setDeleting(null)
    setTimeout(() => setMsg(''), 3000)
  }

  async function updateStatus(table: string, id: string, status: string) {
    await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret, table, id, updates: { status } }),
    })
    loadData(secret)
  }

  if (!authed) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" stroke="white" strokeWidth="1.4"/>
              <path d="M8 5v6M5 8h6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-semibold">Open Slot Admin</span>
        </div>
        <input
          type="password"
          placeholder="Admin password"
          value={secret}
          onChange={e => setSecret(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && loadData(secret)}
          className="input mb-3"
          autoFocus
        />
        {authError && <p className="text-red-500 text-sm mb-3">{authError}</p>}
        <button onClick={() => loadData(secret)} className="btn-primary w-full justify-center">
          Sign in →
        </button>
      </div>
    </div>
  )

  if (loading || !data) return (
    <div className="min-h-screen flex items-center justify-center text-gray-400">
      Loading...
    </div>
  )

  const stats = [
    { label: 'Active slots', value: data.slots.filter((s: any) => s.status === 'active').length, color: 'text-emerald-600' },
    { label: 'Total businesses', value: data.businesses.filter((b: any) => b.status === 'approved').length, color: 'text-emerald-600' },
    { label: 'Pending applications', value: data.applications.filter((a: any) => a.status === 'pending').length, color: 'text-amber-600' },
    { label: 'Open needs', value: data.needs.length, color: 'text-blue-600' },
    { label: 'Total claims', value: data.claims.length, color: 'text-purple-600' },
    { label: 'Price watches', value: data.watches.length, color: 'text-gray-600' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" stroke="white" strokeWidth="1.4"/>
                <path d="M8 5v6M5 8h6" stroke="white" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Open Slot</span>
            <span className="text-gray-300 mx-1">·</span>
            <span className="text-sm text-gray-500">Admin</span>
          </div>
          <div className="flex items-center gap-3">
            {msg && <span className="text-sm text-emerald-600 font-medium">{msg}</span>}
            <button onClick={() => loadData(secret)} className="btn-secondary text-xs px-3 py-1.5">
              Refresh
            </button>
          </div>
        </div>
        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 pb-0">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              {tab}
              {tab === 'Applications' && data.applications.filter((a: any) => a.status === 'pending').length > 0 && (
                <span className="ml-1.5 bg-amber-500 text-white text-xs rounded-full px-1.5 py-0.5">
                  {data.applications.filter((a: any) => a.status === 'pending').length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* OVERVIEW */}
        {activeTab === 'Overview' && (
          <div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-8">
              {stats.map(s => (
                <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
                  <div className={clsx('text-2xl font-bold mb-1', s.color)}>{s.value}</div>
                  <div className="text-xs text-gray-500">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="font-semibold text-gray-900 mb-3">Recent claims</div>
                {data.claims.slice(0, 5).map((c: any) => (
                  <div key={c.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-700">{c.slots?.service_name || '—'}</span>
                    <span className="text-gray-400">{c.consumer_email}</span>
                  </div>
                ))}
                {data.claims.length === 0 && <p className="text-sm text-gray-400">No claims yet.</p>}
              </div>
              <div className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="font-semibold text-gray-900 mb-3">Pending applications</div>
                {data.applications.filter((a: any) => a.status === 'pending').map((a: any) => (
                  <div key={a.id} className="flex justify-between py-2 border-b border-gray-50 last:border-0 text-sm">
                    <span className="text-gray-700">{a.business_name}</span>
                    <button onClick={() => setActiveTab('Applications')} className="text-emerald-600 text-xs">Review →</button>
                  </div>
                ))}
                {data.applications.filter((a: any) => a.status === 'pending').length === 0 && (
                  <p className="text-sm text-gray-400">No pending applications.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SLOTS */}
        {activeTab === 'Slots' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <div className="font-semibold text-gray-900">All slots <span className="text-gray-400 font-normal text-sm">({data.slots.length})</span></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Business', 'Service', 'Time', 'Price', 'Spots', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.slots.map((s: any) => (
                  <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.businesses?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.service_name}</td>
                    <td className="px-4 py-3 text-gray-500">{fmt(s.slot_time)}</td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-600 font-medium">${s.deal_price}</span>
                      <span className="text-gray-400 line-through ml-1 text-xs">${s.original_price}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{s.spots_remaining}/{s.spots_total}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {s.status === 'active' && (
                          <button
                            onClick={() => updateStatus('slots', s.id, 'expired')}
                            className="text-xs text-amber-600 hover:underline"
                          >
                            Expire
                          </button>
                        )}
                        <button
                          onClick={() => deleteRow('slots', s.id, s.service_name)}
                          disabled={deleting === s.id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {deleting === s.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.slots.length === 0 && <div className="p-8 text-center text-gray-400">No slots yet.</div>}
          </div>
        )}

        {/* BUSINESSES */}
        {activeTab === 'Businesses' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-gray-900">All businesses <span className="text-gray-400 font-normal text-sm">({data.businesses.length})</span></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Business', 'Category', 'Contact', 'Email', 'Address', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.businesses.map((b: any) => (
                  <tr key={b.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{b.name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.category}</td>
                    <td className="px-4 py-3 text-gray-500">{b.contact_name}</td>
                    <td className="px-4 py-3 text-gray-500">{b.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{b.address || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={b.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {b.status === 'approved' && (
                          <button
                            onClick={() => updateStatus('businesses', b.id, 'rejected')}
                            className="text-xs text-amber-600 hover:underline"
                          >
                            Suspend
                          </button>
                        )}
                        {b.status !== 'approved' && (
                          <button
                            onClick={() => updateStatus('businesses', b.id, 'approved')}
                            className="text-xs text-emerald-600 hover:underline"
                          >
                            Approve
                          </button>
                        )}
                        <button
                          onClick={() => deleteRow('businesses', b.id, b.name)}
                          disabled={deleting === b.id}
                          className="text-xs text-red-500 hover:underline disabled:opacity-50"
                        >
                          {deleting === b.id ? '...' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.businesses.length === 0 && <div className="p-8 text-center text-gray-400">No businesses yet.</div>}
          </div>
        )}

        {/* APPLICATIONS */}
        {activeTab === 'Applications' && (
          <div className="space-y-3">
            {data.applications.map((a: any) => (
              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900">{a.business_name}</span>
                      <StatusBadge status={a.status} />
                    </div>
                    <div className="text-sm text-gray-500">{a.category} · {a.contact_name} · {a.email}</div>
                    {a.website && <div className="text-xs text-gray-400 mt-1">{a.website}</div>}
                    <div className="text-xs text-gray-300 mt-1">Applied {fmtDate(a.created_at)}</div>
                  </div>
                  <div className="flex gap-2">
                    {a.status === 'pending' && (
                      <button
                        onClick={async () => {
                          const res = await fetch('/api/approve', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ applicationId: a.id, adminSecret: secret }),
                          })
                          const json = await res.json()
                          if (json.success) { setMsg('Approved & emailed!'); loadData(secret) }
                          else setMsg('Error: ' + json.error)
                          setTimeout(() => setMsg(''), 3000)
                        }}
                        className="btn-primary text-sm"
                      >
                        Approve & email →
                      </button>
                    )}
                    <button
                      onClick={() => deleteRow('applications', a.id, a.business_name)}
                      disabled={deleting === a.id}
                      className="btn-secondary text-sm text-red-500 border-red-100 hover:bg-red-50"
                    >
                      {deleting === a.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {data.applications.length === 0 && (
              <div className="text-center py-12 text-gray-400">No applications yet.</div>
            )}
          </div>
        )}

        {/* NEEDS */}
        {activeTab === 'Needs' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-gray-900">Consumer needs <span className="text-gray-400 font-normal text-sm">({data.needs.length})</span></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Service needed', 'Category', 'When', 'Budget', 'Email', 'Posted', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.needs.map((n: any) => (
                  <tr key={n.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{n.service_name}</td>
                    <td className="px-4 py-3 text-gray-500">{n.category}</td>
                    <td className="px-4 py-3 text-gray-500">{n.when_needed}</td>
                    <td className="px-4 py-3 text-gray-500">{n.budget ? `$${n.budget}` : '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{n.consumer_email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(n.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteRow('needs', n.id, n.service_name)}
                        disabled={deleting === n.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deleting === n.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.needs.length === 0 && <div className="p-8 text-center text-gray-400">No needs posted yet.</div>}
          </div>
        )}

        {/* WATCHES */}
        {activeTab === 'Watches' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-gray-900">Price watches <span className="text-gray-400 font-normal text-sm">({data.watches.length})</span></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Watching', 'Max price', 'Email', 'Active', 'Created', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.watches.map((w: any) => (
                  <tr key={w.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{w.search_term}</td>
                    <td className="px-4 py-3 text-gray-500">{w.max_price ? `$${w.max_price}` : 'Any'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{w.consumer_email}</td>
                    <td className="px-4 py-3">
                      <span className={clsx('text-xs font-medium', w.active ? 'text-emerald-600' : 'text-gray-400')}>
                        {w.active ? 'Yes' : 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmtDate(w.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteRow('watches', w.id, w.search_term)}
                        disabled={deleting === w.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deleting === w.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.watches.length === 0 && <div className="p-8 text-center text-gray-400">No price watches yet.</div>}
          </div>
        )}

        {/* CLAIMS */}
        {activeTab === 'Claims' && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <div className="font-semibold text-gray-900">All claims <span className="text-gray-400 font-normal text-sm">({data.claims.length})</span></div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Service', 'Business', 'Consumer email', 'Claimed at', 'Actions'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.claims.map((c: any) => (
                  <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-medium text-gray-900">{c.slots?.service_name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.slots?.businesses?.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-500">{c.consumer_email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{fmt(c.created_at)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteRow('claims', c.id, c.consumer_email)}
                        disabled={deleting === c.id}
                        className="text-xs text-red-500 hover:underline disabled:opacity-50"
                      >
                        {deleting === c.id ? '...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data.claims.length === 0 && <div className="p-8 text-center text-gray-400">No claims yet.</div>}
          </div>
        )}

      </div>
    </div>
  )
}