import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

  const supabase = getSupabaseAdmin()
  const { data } = await supabase
    .from('businesses')
    .select('id, name, category')
    .eq('post_token', token)
    .eq('status', 'approved')
    .single()

  if (!data) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  return NextResponse.json({ business: data })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, service_name, slot_date, slot_time, original_price, deal_price, spots_total, notes } = body

  if (!token || !service_name || !slot_date || !slot_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, email')
    .eq('post_token', token)
    .eq('status', 'approved')
    .single()

  if (!business) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Force Eastern Time interpretation (EDT = UTC-4, EST = UTC-5)
  const now = new Date()
  const jan = new Date(now.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(now.getFullYear(), 6, 1).getTimezoneOffset()
  const isDST = Math.min(jan, jul) === now.getTimezoneOffset()
  const offset = isDST ? '-04:00' : '-05:00'
  const slotTime = new Date(`${slot_date}T${slot_time}:00${offset}`)

  if (isNaN(slotTime.getTime())) {
    return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 })
  }

  const origPrice = parseFloat(original_price)
  const dealPrice = parseFloat(deal_price)

  if (dealPrice >= origPrice) {
    return NextResponse.json({ error: 'Deal price must be less than original price' }, { status: 400 })
  }

  const { data: slot, error } = await supabase
    .from('slots')
    .insert({
      business_id: business.id,
      service_name,
      slot_time: slotTime.toISOString(),
      original_price: origPrice,
      deal_price: dealPrice,
      spots_total: parseInt(spots_total) || 1,
      spots_remaining: parseInt(spots_total) || 1,
      notes: notes || null,
      status: 'active',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Check price watches
  const { data: watches } = await supabase
    .from('watches')
    .select('*')
    .eq('active', true)

  if (watches && watches.length > 0) {
    const { sendPriceWatchEmail } = await import('@/lib/email')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    for (const watch of watches) {
      const termMatch = service_name.toLowerCase().includes(watch.search_term.toLowerCase())
        || business.name.toLowerCase().includes(watch.search_term.toLowerCase())
      const priceMatch = !watch.max_price || dealPrice <= watch.max_price
      if (termMatch && priceMatch) {
        await sendPriceWatchEmail({
          consumerEmail: watch.consumer_email,
          searchTerm: watch.search_term,
          businessName: business.name,
          serviceName: service_name,
          slotTime: slotTime.toLocaleString('en-US', { timeZone: 'America/New_York' }),
          dealPrice,
          originalPrice: origPrice,
          spotsLeft: parseInt(spots_total) || 1,
          claimUrl: `${baseUrl}/board`,
        }).catch(console.error)
      }
    }
  }

  return NextResponse.json({ slot })
}