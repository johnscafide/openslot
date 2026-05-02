'use client'
import { useState } from 'react'
import Nav from '@/components/Nav'
import { CATEGORIES } from '@/lib/types'

export default function ApplyPage() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const data = Object.fromEntries(new FormData(form))

    const res = await fetch('/api/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })

    if (res.ok) setSubmitted(true)
    else alert('Something went wrong. Try again.')
    setLoading(false)
  }

  return (
    <>
      <Nav />
      <main className="max-w-xl mx-auto px-4 py-12">

        {submitted ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-emerald-600">
                <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Application received</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              We'll review your application within 1 business day. Once approved,
              you'll receive an email with your posting link — no account setup required.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <div className="inline-block text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full mb-4">
                For businesses
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Apply to list your business</h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                We review every application to keep the board trustworthy for consumers.
                Usually takes us 1 business day. Once approved you can start posting slots immediately.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Business name</label>
                  <input name="business_name" required placeholder="Mario's Barbershop" className="input" />
                </div>
                <div>
                  <label className="label">Business type</label>
                  <select name="category" className="input">
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Your name</label>
                  <input name="contact_name" required placeholder="First and last" className="input" />
                </div>
                <div>
                  <label className="label">Business email</label>
                  <input name="email" type="email" required placeholder="you@yourbusiness.com" className="input" />
                </div>
              </div>

              <div>
                <label className="label">Business address</label>
                <input name="address" placeholder="123 Main St, Williamstown NJ" className="input" />
              </div>

              <div>
                <label className="label">
                  Website or social link{' '}
                  <span className="font-normal text-gray-400">(optional, helps verification)</span>
                </label>
                <input name="website" placeholder="yoursite.com or @yourhandle" className="input" />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <p className="text-xs text-gray-400">No credit card. No commitment.</p>
                <button type="submit" disabled={loading} className="btn-primary">
                  {loading ? 'Submitting...' : 'Submit application →'}
                </button>
              </div>
            </form>
          </>
        )}

      </main>
    </>
  )
}
