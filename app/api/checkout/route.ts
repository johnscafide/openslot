import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: NextRequest) {
  const { slotId, consumerEmail } = await req.json()

  const supabase = getSupabaseAdmin()
  const { data: slot } = await supabase
    .from('slots')
    .select('*, businesses(name, email)')
    .eq('id', slotId)
    .single()

  if (!slot) return NextResponse.json({ error: 'Slot not found' }, { status: 404 })
  if (slot.spots_remaining < 1) return NextResponse.json({ error: 'No spots left' }, { status: 409 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const business = slot.businesses as any

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    customer_email: consumerEmail,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: slot.service_name,
          description: `${business.name} · Open Slot deal`,
        },
        unit_amount: Math.round(slot.deal_price * 100), // cents
      },
      quantity: 1,
    }],
    metadata: {
      slotId,
      consumerEmail,
      businessEmail: business.email,
      businessName: business.name,
      serviceName: slot.service_name,
    },
    success_url: `${baseUrl}/board?claimed=true`,
    cancel_url: `${baseUrl}/board`,
  })

  return NextResponse.json({ url: session.url })
}