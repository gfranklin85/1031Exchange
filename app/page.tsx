import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            1031 Exchange Platform
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Find your perfect property swap in seconds. AI-powered matching, instant offers, zero jargon.
          </p>

          <div className="flex gap-4 justify-center mb-16">
            <Link
              href="/intake"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold text-lg transition-colors"
            >
              Start Exchange
            </Link>
            <Link
              href="/exchange-board"
              className="px-8 py-4 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold text-lg transition-colors"
            >
              View Opportunities
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">5-Minute Intake</h3>
              <p className="text-gray-400">
                Conversational AI captures your property details and exchange goals. No jargon, instant clarity.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Instant Matches</h3>
              <p className="text-gray-400">
                AI finds opportunities humans miss. Cross-asset-class swaps, timing synergies, tax optimization.
              </p>
            </div>

            <div className="p-6 bg-gray-800/50 rounded-lg">
              <h3 className="text-2xl font-bold mb-3">Auto-Generated Offers</h3>
              <p className="text-gray-400">
                Multiple offer structures appear instantly. Interactive terms, real-time tax math, complete transparency.
              </p>
            </div>
          </div>

          <div className="mt-16 p-8 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-lg border border-blue-500/30">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
            <div className="space-y-4 text-left max-w-2xl mx-auto">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">1</div>
                <div>
                  <h4 className="font-semibold">Submit Your Property</h4>
                  <p className="text-gray-400">5-minute questionnaire captures everything: current property, exchange goals, timeline.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">2</div>
                <div>
                  <h4 className="font-semibold">Get Instant Matches</h4>
                  <p className="text-gray-400">AI scans the network and surfaces 3-7 swap opportunities you didn't know existed.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">3</div>
                <div>
                  <h4 className="font-semibold">Review Interactive Offers</h4>
                  <p className="text-gray-400">Each offer shows full financial breakdown, tax impact, and net to seller. Adjust terms in real-time.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">4</div>
                <div>
                  <h4 className="font-semibold">Execute the Exchange</h4>
                  <p className="text-gray-400">Deal room tracks 45/180 day deadlines, auto-generates required filings, manages boot deployment.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
