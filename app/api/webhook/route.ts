import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendSlotClaimedEmail, sendClaimConfirmedEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const { slotId, consumerEmail, businessEmail, businessName, serviceName } = session.metadata!

    const supabase = getSupabaseAdmin()

    // Decrement spots
    const { data: slot } = await supabase
      .from('slots')
      .select('spots_remaining, original_price, deal_price, slot_time')
      .eq('id', slotId)
      .single()

    if (slot) {
      const newSpots = slot.spots_remaining - 1
      await supabase
        .from('slots')
        .update({ spots_remaining: newSpots, status: newSpots === 0 ? 'claimed' : 'active' })
        .eq('id', slotId)

      await supabase.from('claims').insert({ slot_id: slotId, consumer_email: consumerEmail })

      const platformFee = parseFloat((slot.deal_price * 0.05).toFixed(2))
      const slotTimeStr = new Date(slot.slot_time).toLocaleString('en-US', {
        timeZone: 'America/New_York',
        weekday: 'short', month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
      })

      sendSlotClaimedEmail({
        businessEmail,
        businessName,
        serviceName,
        slotTime: slotTimeStr,
        dealPrice: slot.deal_price,
        platformFee,
      }).catch(console.error)

      sendClaimConfirmedEmail({
        consumerEmail,
        businessName,
        serviceName,
        slotTime: slotTimeStr,
        address: 'See your confirmation email',
        dealPrice: slot.deal_price,
        originalPrice: slot.original_price,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ received: true })
}