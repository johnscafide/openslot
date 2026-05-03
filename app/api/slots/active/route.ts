import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from('active_slots')
    .select('*')

  if (error) {
    console.error('Error fetching slots:', error)
    return NextResponse.json({ slots: [] })
  }

  return NextResponse.json({ slots: data || [] }, { headers: { 'Cache-Control': 'no-store' } })

}