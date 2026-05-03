'use client'
import { useEffect, useState } from 'react'
import { getSupabaseAdmin } from '@/lib/supabase'

// Simple password gate
export default function AdminPage() {
  const [secret, setSecret] = useState('')
  const [authed, setAuthed] = useState(false)
  const [apps, setApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function loadApps() {
    const res = await fetch('/api/admin/applications?secret=' + secret)
    const data = await res.json()
    setApps(data.applications || [])
    setAuthed(true)
  }

  async function approve(id: string) {
    setLoading(true)
    const res = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ applicationId: id, adminSecret: secret }),
    })
    const data = await res.json()
    if (data.success) {
      setMsg('Approved! Business emailed their posting link.')
      loadApps()
    } else {
      setMsg('Error: ' + data.error)
    }
    setLoading(false)
  }

  if (!authed) return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-xl font-bold mb-4">Admin</h1>
      <input
        type="password"
        placeholder="Admin secret"
        value={secret}
        onChange={e => setSecret(e.target.value)}
        className="input mb-3"
      />
      <button onClick={loadApps} className="btn-primary w-full">Enter</button>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Pending Applications</h1>
      {msg && <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm text-emerald-700 mb-4">{msg}</div>}
      {apps.length === 0 ? (
        <p className="text-gray-400">No pending applications.</p>
      ) : apps.map(app => (
        <div key={app.id} className="card mb-4">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold text-gray-900">{app.business_name}</div>
              <div className="text-sm text-gray-500">{app.category} · {app.contact_name} · {app.email}</div>
              {app.website && <div className="text-xs text-gray-400 mt-1">{app.website}</div>}
              <div className="text-xs text-gray-300 mt-1">{new Date(app.created_at).toLocaleDateString()}</div>
            </div>
            <button
              onClick={() => approve(app.id)}
              disabled={loading}
              className="btn-primary text-sm"
            >
              Approve & email them
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}