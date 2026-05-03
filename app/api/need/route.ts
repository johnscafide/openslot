import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendNeedNearbyEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { service_name, category, when_needed, budget, radius_miles, consumer_email } = body

  if (!service_name || !category || !when_needed || !consumer_email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Save the need
  await supabase.from('needs').insert({
    service_name, category, when_needed,
    budget: budget ? parseFloat(budget) : null,
    radius_miles: parseInt(radius_miles) || 5,
    consumer_email,
  })

  // Notify all approved businesses in the matching category
const { data: businesses } = await supabase
  .from('businesses')
  .select('name, email, post_token')
  .eq('status', 'approved')
  .ilike('category', category)  // ← ilike instead of eq (case-insensitive)
  console.log('Need posted for category:', category)
console.log('Matching businesses found:', businesses?.length ?? 0)

  if (businesses && businesses.length > 0) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    for (const biz of businesses) {
      await sendNeedNearbyEmail({
        businessEmail: biz.email,
        businessName: biz.name,
        serviceName: service_name,
        whenNeeded: when_needed,
        budget: parseFloat(budget) || 0,
        postUrl: `${baseUrl}/post?token=${biz.post_token}`,
      }).catch(console.error)
    }
  }

  return NextResponse.json({ success: true })
}
