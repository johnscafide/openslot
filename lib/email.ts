import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY!)
const FROM = 'Open Slot <notify@openslot.co>'

// 1. Business: your slot was claimed
export async function sendSlotClaimedEmail(opts: {
  businessEmail: string
  businessName: string
  serviceName: string
  slotTime: string
  dealPrice: number
  platformFee: number
}) {
  const net = (opts.dealPrice - opts.platformFee).toFixed(2)
  return resend.emails.send({
    from: FROM,
    to: opts.businessEmail,
    subject: `Someone claimed your slot — ${opts.serviceName}`,
    html: `
      <p>Hi ${opts.businessName},</p>
      <p>Your open slot was just claimed. Here's what to expect:</p>
      <table>
        <tr><td>Service</td><td>${opts.serviceName}</td></tr>
        <tr><td>Time</td><td>${opts.slotTime}</td></tr>
        <tr><td>Collected</td><td>$${opts.dealPrice.toFixed(2)}</td></tr>
        <tr><td>Platform fee (5%)</td><td>-$${opts.platformFee.toFixed(2)}</td></tr>
        <tr><td><strong>You receive</strong></td><td><strong>$${net}</strong></td></tr>
      </table>
      <p>The customer has your address. Show up ready at the listed time.</p>
      <p>— Open Slot</p>
    `,
  })
}

// 2. Consumer: claim confirmed
export async function sendClaimConfirmedEmail(opts: {
  consumerEmail: string
  businessName: string
  serviceName: string
  slotTime: string
  address: string
  dealPrice: number
  originalPrice: number
}) {
  const saved = (opts.originalPrice - opts.dealPrice).toFixed(2)
  const pct = Math.round((opts.originalPrice - opts.dealPrice) / opts.originalPrice * 100)
  return resend.emails.send({
    from: FROM,
    to: opts.consumerEmail,
    subject: `You're booked — ${opts.businessName}`,
    html: `
      <p>You're all set. Show this email when you arrive.</p>
      <table>
        <tr><td>Business</td><td>${opts.businessName}</td></tr>
        <tr><td>Service</td><td>${opts.serviceName}</td></tr>
        <tr><td>Time</td><td>${opts.slotTime}</td></tr>
        <tr><td>Address</td><td>${opts.address}</td></tr>
        <tr><td>You paid</td><td>$${opts.dealPrice.toFixed(2)}</td></tr>
        <tr><td><strong>You saved</strong></td><td><strong>$${saved} (${pct}% off)</strong></td></tr>
      </table>
      <p>Need to cancel? Please do so at least 2 hours before your slot so the business can re-list it.</p>
      <p>— Open Slot</p>
    `,
  })
}

// 3. Consumer: price watch matched
export async function sendPriceWatchEmail(opts: {
  consumerEmail: string
  searchTerm: string
  businessName: string
  serviceName: string
  slotTime: string
  dealPrice: number
  originalPrice: number
  spotsLeft: number
  claimUrl: string
}) {
  const pct = Math.round((opts.originalPrice - opts.dealPrice) / opts.originalPrice * 100)
  return resend.emails.send({
    from: FROM,
    to: opts.consumerEmail,
    subject: `Price watch: ${opts.businessName} just dropped to $${opts.dealPrice}`,
    html: `
      <p>Your price watch for <strong>${opts.searchTerm}</strong> just matched.</p>
      <table>
        <tr><td>Business</td><td>${opts.businessName}</td></tr>
        <tr><td>Service</td><td>${opts.serviceName}</td></tr>
        <tr><td>Time</td><td>${opts.slotTime}</td></tr>
        <tr><td>Normal price</td><td><s>$${opts.originalPrice.toFixed(2)}</s></td></tr>
        <tr><td><strong>Open Slot price</strong></td><td><strong>$${opts.dealPrice.toFixed(2)} (${pct}% off)</strong></td></tr>
        <tr><td>Spots left</td><td>${opts.spotsLeft}</td></tr>
      </table>
      <p><a href="${opts.claimUrl}">Claim this slot now →</a></p>
      <p>— Open Slot</p>
    `,
  })
}

// 4. Business: new "I need" nearby
export async function sendNeedNearbyEmail(opts: {
  businessEmail: string
  businessName: string
  serviceName: string
  whenNeeded: string
  budget: number
  postUrl: string
}) {
  return resend.emails.send({
    from: FROM,
    to: opts.businessEmail,
    subject: `Someone nearby needs ${opts.serviceName} ${opts.whenNeeded.toLowerCase()}`,
    html: `
      <p>Hi ${opts.businessName},</p>
      <p>A consumer near you just posted a request that matches your business.</p>
      <table>
        <tr><td>Looking for</td><td>${opts.serviceName}</td></tr>
        <tr><td>When</td><td>${opts.whenNeeded}</td></tr>
        <tr><td>Budget</td><td>Up to $${opts.budget}</td></tr>
      </table>
      <p>If you have an opening, post a slot in 60 seconds and we'll notify consumers in your area automatically.</p>
      <p><a href="${opts.postUrl}">Post a slot →</a></p>
      <p>— Open Slot</p>
    `,
  })
}

// 5. Business: application received (to John/admin)
export async function sendApplicationAlertEmail(opts: {
  businessName: string
  category: string
  contactName: string
  email: string
  website?: string
}) {
  return resend.emails.send({
    from: FROM,
    to: process.env.ADMIN_EMAIL!,
    subject: `New business application: ${opts.businessName}`,
    html: `
      <p>New application to review:</p>
      <table>
        <tr><td>Business</td><td>${opts.businessName}</td></tr>
        <tr><td>Category</td><td>${opts.category}</td></tr>
        <tr><td>Contact</td><td>${opts.contactName}</td></tr>
        <tr><td>Email</td><td>${opts.email}</td></tr>
        <tr><td>Website</td><td>${opts.website || 'Not provided'}</td></tr>
      </table>
      <p>Log in to your Supabase dashboard to approve or reject this application.</p>
    `,
  })
}
