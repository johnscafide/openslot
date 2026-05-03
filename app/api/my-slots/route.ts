import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'No token' }, { status: 400 })

  const supabase = getSupabaseAdmin()

  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('post_token', token)
    .eq('status', 'approved')
    .single()

  if (!business) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

  const [slots, claims] = await Promise.all([
    supabase
      .from('slots')
      .select('*')
      .eq('business_id', business.id)
      .order('slot_time', { ascending: false }),
    supabase
      .from('claims')
      .select('*, slots(service_name, deal_price)')
      .in(
        'slot_id',
        (await supabase.from('slots').select('id').eq('business_id', business.id)).data?.map(s => s.id) || []
      )
      .order('created_at', { ascending: false })
  ])

  return NextResponse.json({
    business,
    slots: slots.data || [],
    claims: claims.data || [],
  })
}