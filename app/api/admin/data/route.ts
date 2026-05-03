import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const [slots, businesses, applications, needs, watches, claims] = await Promise.all([
    supabase.from('slots').select('*, businesses(name, category)').order('created_at', { ascending: false }),
    supabase.from('businesses').select('*').order('created_at', { ascending: false }),
    supabase.from('applications').select('*').order('created_at', { ascending: false }),
    supabase.from('needs').select('*').order('created_at', { ascending: false }),
    supabase.from('watches').select('*').order('created_at', { ascending: false }),
    supabase.from('claims').select('*, slots(service_name, businesses(name))').order('created_at', { ascending: false }),
  ])

  return NextResponse.json({
    slots: slots.data || [],
    businesses: businesses.data || [],
    applications: applications.data || [],
    needs: needs.data || [],
    watches: watches.data || [],
    claims: claims.data || [],
  })
}