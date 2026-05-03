import { NextRequest, NextResponse } from 'next/server'

// Claims now go through Stripe checkout
// This route kept for backward compatibility — redirects to checkout
export async function POST(req: NextRequest) {
  const { slotId, consumerEmail } = await req.json()

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const res = await fetch(`${baseUrl}/api/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slotId, consumerEmail }),
  })

  const data = await res.json()
  if (data.url) return NextResponse.json({ checkoutUrl: data.url })
  return NextResponse.json({ error: data.error }, { status: 400 })
}