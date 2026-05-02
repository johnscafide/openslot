import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sendApplicationAlertEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { business_name, category, contact_name, email, website, address } = body

  if (!business_name || !category || !contact_name || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  const { error } = await supabase.from('applications').insert({
    business_name, category, contact_name, email,
    website: website || null,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Alert admin (you) that a new application came in
  sendApplicationAlertEmail({
    businessName: business_name, category, contactName: contact_name,
    email, website,
  }).catch(console.error)

  return NextResponse.json({ success: true })
}
