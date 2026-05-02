import Link from 'next/link'
import Nav from '@/components/Nav'

export default function Home() {
  return (
    <>
      <Nav />

      <main className="max-w-5xl mx-auto px-4">

        {/* Hero */}
        <section className="py-16 text-center">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full mb-6">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Live · South Jersey
          </div>

          <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-4">
            Fill your empty slots.<br />
            <span className="text-emerald-600">Find last-minute deals.</span>
          </h1>

          <p className="text-lg text-gray-500 max-w-xl mx-auto mb-8 leading-relaxed">
            Local businesses post their open appointment slots. Nearby people
            claim them at a discount. No empty chairs. No missed revenue. No hunting.
          </p>

          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/apply" className="btn-primary">
              Apply as a business →
            </Link>
            <Link href="/board" className="btn-secondary">
              Browse open slots
            </Link>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mb-16">
          {[
            { label: 'Open slots today', value: '14' },
            { label: 'Claimed this week', value: '83' },
            { label: 'Avg. discount', value: '41%' },
            { label: 'Local businesses', value: '8' },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-xl p-4">
              <div className="text-2xl font-bold text-emerald-600 mb-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Two sides */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">

          {/* Business */}
          <div className="border-2 border-emerald-200 rounded-2xl p-6 bg-emerald-50/30">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                For businesses
              </span>
              <span className="text-xs text-gray-400">Application required</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Stop losing money on empty time
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Every unfilled appointment is revenue gone forever. Post your open slot
              in 60 seconds and get a real customer through the door today.
            </p>

            <ul className="space-y-3 mb-6">
              {[
                ['Vetted businesses only', 'One-time approval keeps the board trustworthy.'],
                ['Post in under 60 seconds', 'Name, service, time, price. Done.'],
                ['See live consumer demand', 'Real people nearby posting what they need.'],
                ['Free to post', 'Small fee only when a slot is actually claimed.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/apply" className="btn-primary w-full justify-center">
              Apply to join →
            </Link>
          </div>

          {/* Consumer */}
          <div className="border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                For consumers
              </span>
              <span className="text-xs text-gray-400">Always free</span>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Get more for less, on your schedule
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Browse live discounted slots nearby, post what you need, or set a
              price watch on your favorites. No app required.
            </p>

            <ul className="space-y-3 mb-6">
              {[
                ['Browse the live board', 'Discounted slots from vetted local businesses.'],
                ['Post an "I need" request', 'Tell businesses what you\'re looking for.'],
                ['Price watch & alerts', 'Get notified when your favorite spot drops in price.'],
                ['No account needed', 'Browse and claim without signing up.'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 shrink-0" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{title}</div>
                    <div className="text-xs text-gray-500">{desc}</div>
                  </div>
                </li>
              ))}
            </ul>

            <Link href="/board" className="btn-secondary w-full justify-center border-blue-200 text-blue-600 hover:bg-blue-50">
              Browse open slots →
            </Link>
          </div>
        </div>

        {/* How it works */}
        <section className="pb-20 border-t border-gray-100 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">How it works</h2>
          <p className="text-gray-500 mb-8">Two sides. One simple exchange.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Business posts an open slot',
                body: 'Approved businesses post their empty appointment time in 60 seconds — service, time, and optional discount.',
              },
              {
                step: '02',
                title: 'Nearby consumers see it',
                body: 'People nearby see the slot appear on the live board. Price watch users get an instant email alert.',
              },
              {
                step: '03',
                title: 'Slot claimed. Chair filled.',
                body: 'Consumer pays the deal price. Business recovers revenue they\'d have lost. Zero waste on both sides.',
              },
            ].map((s) => (
              <div key={s.step} className="bg-gray-50 rounded-xl p-5">
                <div className="text-xs font-bold text-emerald-600 tracking-widest mb-3">{s.step}</div>
                <div className="font-semibold text-gray-900 mb-2">{s.title}</div>
                <div className="text-sm text-gray-500 leading-relaxed">{s.body}</div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-100 py-6 text-center text-xs text-gray-400">
        Open Slot · South Jersey · Built for local businesses
      </footer>
    </>
  )
}
