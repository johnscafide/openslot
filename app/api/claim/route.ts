import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendSlotClaimedEmail, sendClaimConfirmedEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const { slotId, consumerEmail } = await req.json()

  if (!slotId || !consumerEmail) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Get the slot + business info
  const { data: slot } = await supabase
    .from('slots')
    .select('*, businesses(name, email, address)')
    .eq('id', slotId)
    .eq('status', 'active')
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot not found or already claimed' }, { status: 404 })
  if (slot.spots_remaining < 1) return NextResponse.json({ error: 'No spots remaining' }, { status: 409 })

  // Decrement spots
  const newSpots = slot.spots_remaining - 1
  const newStatus = newSpots === 0 ? 'claimed' : 'active'

  const { error: updateError } = await supabase
    .from('slots')
    .update({ spots_remaining: newSpots, status: newStatus })
    .eq('id', slotId)

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  // Record the claim
  await supabase.from('claims').insert({ slot_id: slotId, consumer_email: consumerEmail })

  const business = slot.businesses as { name: string; email: string; address: string }
  const slotTimeStr = new Date(slot.slot_time).toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  })
  const platformFee = parseFloat((slot.deal_price * 0.05).toFixed(2))

  // Send emails (fire and forget — don't let email failure block the claim)
  sendSlotClaimedEmail({
    businessEmail: business.email,
    businessName: business.name,
    serviceName: slot.service_name,
    slotTime: slotTimeStr,
    dealPrice: slot.deal_price,
    platformFee,
  }).catch(console.error)

  sendClaimConfirmedEmail({
    consumerEmail,
    businessName: business.name,
    serviceName: slot.service_name,
    slotTime: slotTimeStr,
    address: business.address || 'Address in your email',
    dealPrice: slot.deal_price,
    originalPrice: slot.original_price,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
