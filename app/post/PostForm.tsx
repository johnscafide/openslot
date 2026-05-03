'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Nav from '@/components/Nav'

interface Business {
  id: string
  name: string
  category: string
}

export default function PostForm() {
  const params = useSearchParams()
  const token = params.get('token')

  const [business, setBusiness] = useState<Business | null>(null)
  const [invalid, setInvalid] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [posted, setPosted] = useState(false)

  useEffect(() => {
    if (!token) { setInvalid(true); setLoading(false); return }

    fetch(`/api/slots?token=${token}`)
      .then(r => r.json())
      .then(data => {
        if (data.business) setBusiness(data.business)
        else setInvalid(true)
        setLoading(false)
      })
  }, [token])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSubmitting(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const res = await fetch('/api/slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, token }),
    })

    if (res.ok) setPosted(true)
    else alert('Something went wrong. Try again.')
    setSubmitting(false)
  }

  if (loading) return <><Nav /><div className="text-center py-20 text-gray-400">Verifying your link...</div></>

  if (invalid) return (
    <>
      <Nav />
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invalid or expired link</h1>
        <p className="text-sm text-gray-500">
          This posting link isn't valid. If you're an approved business,
          check your approval email for the correct link.
        </p>
      </div>
    </>
  )

  return (
    <>
      <Nav />
      <main className="max-w-xl mx-auto px-4 py-10">

        {posted ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Slot posted!</h1>
            <p className="text-sm text-gray-500 mb-6">
              Your slot is live on the board. We'll email you the moment someone claims it.
            </p>
            <button onClick={() => setPosted(false)} className="btn-secondary text-sm">
              Post another slot
            </button>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-4">
                Posting as {business?.name}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Post an open slot</h1>
              <p className="text-sm text-gray-500">Takes about 60 seconds. You'll be emailed as soon as it's claimed.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Service name</label>
                <p className="text-xs text-gray-400 mb-1.5">Be specific — it helps customers decide fast.</p>
                <input name="service_name" required placeholder="e.g. Men's haircut + fade" className="input" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Date</label>
                  <input name="slot_date" type="date" required className="input" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <label className="label">Time</label>
                  <input name="slot_time" type="time" required className="input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Normal price ($)</label>
                  <input name="original_price" type="number" min="1" step="0.01" required placeholder="35" className="input" />
                </div>
                <div>
                  <label className="label">Your open slot price ($)</label>
                  <input name="deal_price" type="number" min="1" step="0.01" required placeholder="20" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Number of spots</label>
                <select name="spots_total" className="input">
                  {[1, 2, 3, 4, 5].map(n => (
                    <option key={n} value={n}>{n} spot{n > 1 ? 's' : ''}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">
                  Add a note{' '}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  name="notes"
                  placeholder="e.g. Great for first-time clients. Parking available out front."
                  className="input resize-none h-20"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">Free to post · 5% fee on claims only</p>
                <button type="submit" disabled={submitting} className="btn-primary">
                  {submitting ? 'Posting...' : 'Post this slot →'}
                </button>
              </div>
            </form>
          </>
        )}

      </main>
    </>
  )
}
