import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

function isDST(date: Date): boolean {
  const jan = new Date(date.getFullYear(), 0, 1).getTimezoneOffset()
  const jul = new Date(date.getFullYear(), 6, 1).getTimezoneOffset()
  return Math.min(jan, jul) === date.getTimezoneOffset()
}

// GET /api/slots?token=xxx — verify business token for posting page
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

// POST /api/slots — business posts a new slot
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { token, service_name, slot_date, slot_time, original_price, deal_price, spots_total, notes } = body

  if (!token || !service_name || !slot_date || !slot_time) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Verify token → get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, email')
    .eq('post_token', token)
    .eq('status', 'approved')
    .single()

  if (!business) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

 // Interpret entered time as Eastern Time (EDT = UTC-4, EST = UTC-5)
// Auto-detect based on time of year
const easternOffset = isDST(new Date()) ? '-04:00' : '-05:00'
const slotTime = new Date(`${slot_date}T${slot_time}:00${easternOffset}`)
  if (isNaN(slotTime.getTime())) {
    return NextResponse.json({ error: 'Invalid date/time' }, { status: 400 })
  }

  const origPrice = parseFloat(original_price)
  const dealPrice = parseFloat(deal_price)

  if (dealPrice >= origPrice) {
    return NextResponse.json({ error: 'Deal price must be less than original price' }, { status: 400 })
  }

  // Insert slot
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

  // Check for matching price watches and notify consumers
  const { data: watches } = await supabase
    .from('watches')
    .select('*')
    .eq('active', true)
    .lte('max_price', dealPrice)

  if (watches && watches.length > 0) {
    const { sendPriceWatchEmail } = await import('@/lib/email')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    for (const watch of watches) {
      const termMatch = service_name.toLowerCase().includes(watch.search_term.toLowerCase())
        || business.name.toLowerCase().includes(watch.search_term.toLowerCase())
      if (termMatch) {
        await sendPriceWatchEmail({
          consumerEmail: watch.consumer_email,
          searchTerm: watch.search_term,
          businessName: business.name,
          serviceName: service_name,
          slotTime: slotTime.toLocaleString('en-US'),
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
