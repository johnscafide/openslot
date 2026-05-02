import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { search_term, max_price, consumer_email } = await req.json()

  if (!search_term || !consumer_email) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('watches').insert({
    search_term,
    max_price: max_price ? parseFloat(max_price) : null,
    consumer_email,
    active: true,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
