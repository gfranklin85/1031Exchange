'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import type { Match, Property } from '@/lib/types/database.types'

interface MatchWithProperty extends Match {
  property: Property
}

export default function MatchesPage() {
  const params = useParams()
  const propertyId = params.propertyId as string

  const [matches, setMatches] = useState<MatchWithProperty[]>([])
  const [userProperty, setUserProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProperty | null>(null)

  useEffect(() => {
    async function fetchMatches() {
      try {
        // Fetch user's property
        const propertyRes = await fetch(`/api/properties/${propertyId}`)
        const propertyData = await propertyRes.json()
        setUserProperty(propertyData)

        // Fetch matches
        const matchesRes = await fetch(`/api/matches/${propertyId}`)
        const matchesData = await matchesRes.json()
        setMatches(matchesData)
      } catch (error) {
        console.error('Error fetching matches:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMatches()
  }, [propertyId])

  const handleGenerateOffers = async (match: MatchWithProperty) => {
    try {
      const response = await fetch('/api/offers/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          matchId: match.id,
          buyerPropertyId: propertyId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Generated ${data.count} offer structures!`)
      }
    } catch (error) {
      console.error('Error generating offers:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl text-gray-400">Finding your perfect matches...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Your Exchange Matches</h1>
          <p className="text-gray-400">
            AI found {matches.length} opportunities based on your property and goals
          </p>
        </div>

        {/* User's Property Summary */}
        {userProperty && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-lg border border-blue-500/30">
            <h2 className="text-xl font-bold mb-3">Your Property</h2>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-400">Type</p>
                <p className="font-semibold capitalize">{userProperty.property_type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-semibold">
                  {userProperty.city}, {userProperty.state}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Value</p>
                <p className="font-semibold">${userProperty.estimated_value.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Equity</p>
                <p className="font-semibold text-emerald-400">${userProperty.equity.toLocaleString()}</p>
              </div>
            </div>
          </div>
        )}

        {/* Matches Grid */}
        {matches.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-400">No matches found yet.</p>
            <p className="text-sm text-gray-500 mt-2">
              As more properties are listed, we'll automatically find matches for you.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {matches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden hover:border-blue-500/50 transition-all"
              >
                {/* Fit Score Badge */}
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Match Score</span>
                    <span className="text-3xl font-bold">{Math.round(match.fit_score)}</span>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <span className="bg-white/20 px-2 py-1 rounded">
                      Equity: {Math.round(match.equity_match_score || 0)}
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded">
                      Cash Flow: {Math.round(match.cash_flow_match_score || 0)}
                    </span>
                    <span className="bg-white/20 px-2 py-1 rounded">
                      Goals: {Math.round(match.goal_alignment_score || 0)}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-3 capitalize">{match.property.property_type}</h3>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-400">Location</p>
                      <p className="font-semibold">
                        {match.property.city}, {match.property.state}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Value</p>
                      <p className="font-semibold">${match.property.estimated_value.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Annual NOI</p>
                      <p className="font-semibold text-emerald-400">
                        ${match.property.annual_noi.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Cap Rate</p>
                      <p className="font-semibold">{match.property.cap_rate?.toFixed(2)}%</p>
                    </div>
                  </div>

                  {/* Boot Calculation */}
                  {match.estimated_total_boot !== undefined && match.estimated_total_boot !== 0 && (
                    <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded">
                      <p className="text-sm text-gray-400">Estimated Boot</p>
                      <p className="font-semibold text-orange-400">
                        ${Math.abs(match.estimated_total_boot).toLocaleString()}
                        {match.estimated_total_boot > 0 ? ' (deploy strategically)' : ' (trade up)'}
                      </p>
                    </div>
                  )}

                  {/* Match Reasoning */}
                  {match.match_reasoning && (
                    <div className="mb-4">
                      <p className="text-sm text-gray-400 mb-2">Why This Match?</p>
                      <p className="text-sm">{(match.match_reasoning as any).why}</p>

                      {(match.match_reasoning as any).keyBenefits &&
                        (match.match_reasoning as any).keyBenefits.length > 0 && (
                          <ul className="mt-2 space-y-1">
                            {(match.match_reasoning as any).keyBenefits.map((benefit: string, i: number) => (
                              <li key={i} className="text-xs text-emerald-400 flex items-start gap-2">
                                <span className="mt-1">✓</span>
                                <span>{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleGenerateOffers(match)}
                      className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
                    >
                      Generate Offers
                    </button>
                    <button
                      onClick={() => setSelectedMatch(match)}
                      className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        {matches.length > 0 && (
          <div className="mt-12 text-center p-8 bg-gradient-to-r from-blue-900/30 to-emerald-900/30 rounded-lg border border-blue-500/30">
            <h3 className="text-2xl font-bold mb-3">Ready to Move Forward?</h3>
            <p className="text-gray-400 mb-6">
              Click "Generate Offers" on any match to receive 3-5 automated offer structures with full financial
              breakdowns and interactive terms.
            </p>
            <div className="flex gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors">
                View All Properties
              </button>
              <button className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg font-semibold transition-colors">
                Invite Other Owners
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
