'use client'
import { useState } from 'react'

interface Application {
  id: string
  business_name: string
  category: string
  contact_name: string
  email: string
  website?: string
  created_at: string
}

export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(false)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Record<string, string>>({})
  const [error, setError] = useState('')

  async function loadApps(s: string) {
    setError('')
    const res = await fetch(`/api/admin/applications?secret=${s}`)
    if (res.status === 401) {
      setError('Wrong password.')
      return
    }
    const data = await res.json()
    setApps(data.applications || [])
    setAuthed(true)
  }

  async function approve(id: string) {
    setApprovingId(id)
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id, adminSecret: secret }),
      })
      const data = await res.json()
      if (data.success) {
        setMsgs(prev => ({ ...prev, [id]: '✓ Approved — business emailed their link' }))
        setApps(prev => prev.filter(a => a.id !== id))
      } else {
        setMsgs(prev => ({ ...prev, [id]: 'Error: ' + (data.error || 'unknown') }))
      }
    } catch (e) {
      setMsgs(prev => ({ ...prev, [id]: 'Network error — check console' }))
      console.error(e)
    }
    setApprovingId(null)
  }

  if (!authed) return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-xl font-bold mb-6">Open Slot Admin</h1>
      <input
        type="password"
        placeholder="Admin password"
        value={secret}
        onChange={e => setSecret(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && loadApps(secret)}
        className="input mb-3"
      />
      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
      <button
        onClick={() => loadApps(secret)}
        className="btn-primary w-full justify-center"
      >
        Enter
      </button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pending Applications</h1>
        <button onClick={() => loadApps(secret)} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {apps.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          No pending applications right now.
        </div>
      ) : (
        apps.map(app => (
          <div key={app.id} className="card mb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <div className="font-semibold text-gray-900 text-lg">{app.business_name}</div>
                <div className="text-sm text-gray-500 mt-1">
                  {app.category} · {app.contact_name} · {app.email}
                </div>
                {app.website && (
                  <div className="text-xs text-gray-400 mt-1">{app.website}</div>
                )}
                <div className="text-xs text-gray-300 mt-1">
                  Applied {new Date(app.created_at).toLocaleDateString()}
                </div>
                {msgs[app.id] && (
                  <div className="mt-2 text-sm text-emerald-600 font-medium">
                    {msgs[app.id]}
                  </div>
                )}
              </div>
              <button
                onClick={() => approve(app.id)}
                disabled={approvingId === app.id}
                className="btn-primary text-sm shrink-0"
              >
                {approvingId === app.id ? 'Approving...' : 'Approve & email them'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}