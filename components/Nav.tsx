import Link from 'next/link'

export default function Nav() {
  return (
    <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-emerald-600 rounded-md flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z"
                stroke="white" strokeWidth="1.4" />
              <path d="M8 5v6M5 8h6" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="font-semibold text-gray-900">Open Slot</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/board" className="btn-secondary text-xs px-3 py-1.5">
            Browse slots
          </Link>
          <Link href="/apply" className="btn-primary text-xs px-3 py-1.5">
            Apply as a business
          </Link>
        </div>

      </div>
    </nav>
  )
}
