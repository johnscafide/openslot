import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)

export async function POST(req: NextRequest) {
  const { applicationId, adminSecret } = await req.json()

  if (adminSecret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabaseAdmin()

  const { data: app } = await supabase
    .from('applications')
    .select('*')
    .eq('id', applicationId)
    .single()

  if (!app) return NextResponse.json({ error: 'Application not found' }, { status: 404 })

  await supabase
    .from('applications')
    .update({ status: 'approved' })
    .eq('id', applicationId)

  const { data: business } = await supabase
    .from('businesses')
    .insert({
      name: app.business_name,
      category: app.category,
      email: app.email,
      contact_name: app.contact_name,
      website: app.website,
      status: 'approved',
    })
    .select()
    .single()

  if (!business) return NextResponse.json({ error: 'Failed to create business' }, { status: 500 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
  const postUrl = `${baseUrl}/post?token=${business.post_token}`

  await resend.emails.send({
    from: 'Open Slot <onboarding@resend.dev>',
    to: business.email,
    subject: `You're approved — here's your Open Slot posting link`,
    html: `
      <p>Hi ${app.contact_name},</p>
      <p><strong>${app.business_name}</strong> has been approved on Open Slot!</p>
      <p>Bookmark this link — it's all you need to post open slots:</p>
      <p><a href="${postUrl}">${postUrl}</a></p>
      <p>Takes 60 seconds to post. You'll get an email the moment someone claims a slot.</p>
      <p>— Open Slot</p>
    `,
  })

  return NextResponse.json({ success: true, postUrl })
}