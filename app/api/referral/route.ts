import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET — get or create a referral code for an email
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email) return NextResponse.json({ error: 'No email' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  // Check if they already have a code
  const { data: existing } = await supabase
    .from('referrals')
    .select('referral_code')
    .eq('referrer_email', email)
    .is('referred_email', null)
    .limit(1)
    .single()

  if (existing) return NextResponse.json({ code: existing.referral_code })

  // Create a new one
  const { data: newRef } = await supabase
    .from('referrals')
    .insert({ referrer_email: email })
    .select('referral_code')
    .single()

  return NextResponse.json({ code: newRef?.referral_code })
}

// POST — apply a referral code when someone claims a slot
export async function POST(req: NextRequest) {
  const { referralCode, referredEmail, slotId } = await req.json()
  if (!referralCode || !referredEmail) return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: ref } = await supabase
    .from('referrals')
    .select('*')
    .eq('referral_code', referralCode)
    .is('referred_email', null) // not yet used
    .single()

  if (!ref) return NextResponse.json({ error: 'Invalid or already used code' }, { status: 404 })

  // Can't refer yourself
  if (ref.referrer_email === referredEmail) {
    return NextResponse.json({ error: 'Cannot refer yourself' }, { status: 400 })
  }

  // Apply the referral
  await supabase
    .from('referrals')
    .update({ referred_email: referredEmail, slot_id: slotId })
    .eq('referral_code', referralCode)

  return NextResponse.json({ success: true, credit: 5.00 })
}