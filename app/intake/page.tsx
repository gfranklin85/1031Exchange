'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PlaygroundIntake from '@/components/intake/PlaygroundIntake'
import type { PropertyIntakeForm } from '@/lib/types/database.types'

export default function IntakePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleComplete = async (data: PropertyIntakeForm) => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Submit to API endpoint that will:
      // 1. Create property record
      // 2. Create replacement criteria
      // 3. Run AI matching
      // 4. Return instant matches
      const response = await fetch('/api/intake/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        // Try to get detailed error message from API response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()

      // Redirect to matches page with the property ID
      router.push(`/matches/${result.propertyId}`)
    } catch (err) {
      console.error('Intake submission error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong'

      // Show detailed error message
      setError(`${errorMessage}\n\n💡 Have you set up Supabase yet? Check the README for setup instructions.`)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Property Exchange Intake</h1>
          <p className="text-gray-400">5 minutes to discover opportunities you didn't know existed</p>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
            <p className="font-semibold">Error submitting property:</p>
            <p className="text-sm mt-1 whitespace-pre-line">{error}</p>
          </div>
        )}

        <PlaygroundIntake onComplete={handleComplete} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
