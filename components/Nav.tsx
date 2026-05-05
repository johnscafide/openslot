import Link from 'next/link'

function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <rect width="40" height="40" rx="10" fill="#00E676"/>
      <rect x="8" y="10" width="24" height="3" rx="1.5" fill="#050505"/>
      <rect x="8" y="17" width="15" height="3" rx="1.5" fill="#050505"/>
      <rect x="8" y="24" width="19" height="3" rx="1.5" fill="#050505"/>
      <circle cx="30" cy="30" r="7" fill="#050505"/>
      <rect x="29" y="26" width="2" height="5" rx="1" fill="#00E676"/>
      <rect x="29" y="32" width="2" height="2" rx="1" fill="#00E676"/>
    </svg>
  )
}

export default function Nav() {
  return (
    <nav style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <LogoMark size={30} />
          <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 16, color: '#111827' }}>Open Slot</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/board" style={{ fontFamily: "'Outfit', sans-serif", color: '#6b7280', fontSize: 14, textDecoration: 'none', padding: '0 8px' }}>
            Browse slots
          </Link>
          <Link href="/apply" style={{ background: '#10b981', color: 'white', fontFamily: "'Outfit', sans-serif", fontWeight: 600, padding: '8px 16px', borderRadius: 8, textDecoration: 'none', fontSize: 13 }}>
            Apply as a business
          </Link>
        </div>
      </div>
    </nav>
  )
}