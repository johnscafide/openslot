import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const { email, city } = await req.json()
  if (!email || !city) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.from('waitlist').insert({ email, city })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Confirm to the user
  resend.emails.send({
    from: 'Open Slot <onboarding@resend.dev>',
    to: email,
    subject: `You're on the list — Open Slot is coming to ${city}`,
    html: `
      <p>Hey!</p>
      <p>You're on the waitlist for Open Slot in <strong>${city}</strong>.</p>
      <p>We'll email you the moment we launch in your area with the best local deals.</p>
      <p>In the meantime, check out what's live in <a href="${process.env.NEXT_PUBLIC_BASE_URL}/board">South Jersey & Philadelphia</a>.</p>
      <p>— The Open Slot Team</p>
    `,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}