import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = getSupabaseAdmin()

  const oneWeekAgo = new Date()
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

  const [claimsWeek, businesses, slotsTotal, claimsTotal] = await Promise.all([
    supabase
      .from('claims')
      .select('id', { count: 'exact' })
      .gte('created_at', oneWeekAgo.toISOString()),
    supabase
      .from('businesses')
      .select('id', { count: 'exact' })
      .eq('status', 'approved'),
    supabase
      .from('slots')
      .select('id', { count: 'exact' }),
    supabase
      .from('claims')
      .select('id', { count: 'exact' }),
  ])

  return NextResponse.json({
    claimsThisWeek: claimsWeek.count || 0,
    totalBusinesses: businesses.count || 0,
    totalSlots: slotsTotal.count || 0,
    totalClaims: claimsTotal.count || 0,
  })
}