'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PropertyIntakeForm, PropertyType } from '@/lib/types/database.types'
import IPhoneNumberPicker from './iPhoneNumberPicker'
import PolishedAddressAutocomplete from './PolishedAddressAutocomplete'

const PROPERTY_TYPES: { value: PropertyType; label: string; description: string }[] = [
  { value: 'multifamily', label: 'Multifamily', description: 'Apartments, duplexes, triplexes' },
  { value: 'retail', label: 'Retail', description: 'Shopping centers, storefronts' },
  { value: 'industrial', label: 'Industrial', description: 'Warehouses, manufacturing' },
  { value: 'office', label: 'Office', description: 'Office buildings, medical' },
  { value: 'nnn', label: 'Triple Net (NNN)', description: 'Single-tenant, low management' },
  { value: 'mixed-use', label: 'Mixed-Use', description: 'Combination of types' },
]

const STATES = [
  'CA', 'TX', 'FL', 'NY', 'PA', 'IL', 'OH', 'GA', 'NC', 'MI',
  'NJ', 'VA', 'WA', 'AZ', 'MA', 'TN', 'IN', 'MO', 'MD', 'WI'
]

interface PlaygroundIntakeProps {
  onComplete: (data: PropertyIntakeForm) => void
  isSubmitting?: boolean
}

export default function PlaygroundIntake({ onComplete, isSubmitting = false }: PlaygroundIntakeProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<Partial<PropertyIntakeForm>>({
    goals: {
      stability: 5,
      expansion: 5,
      cashFlow: 5,
      appreciation: 5,
      lessManagement: 5,
    },
    desiredTypes: [],
    timeline: 'moderate',
    listOnExchange: true,
    depreciationTaken: 0,
    currentDebt: 0,
  })

  const totalSteps = 7

  const updateFormData = (updates: Partial<PropertyIntakeForm>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const nextStep = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const prevStep = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    onComplete(formData as PropertyIntakeForm)
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.propertyType
      case 2:
        return formData.address && formData.city && formData.state
      case 3:
        return formData.estimatedValue && formData.monthlyNOI && formData.annualExpenses
      case 4:
        return true // Optional tax basis
      case 5:
        return formData.desiredTypes && formData.desiredTypes.length > 0
      case 6:
        return true // Goals have defaults
      case 7:
        return true // Review
      default:
        return false
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-400">
            Step {step} of {totalSteps}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round((step / totalSteps) * 100)}% Complete
          </span>
        </div>
        <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Step 1: Property Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">What type of property do you own?</h2>
                <p className="text-gray-400">Tell us about your current investment</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {PROPERTY_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => updateFormData({ propertyType: type.value })}
                    className={`p-6 rounded-lg border-2 text-left transition-all ${
                      formData.propertyType === type.value
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <h3 className="text-xl font-semibold mb-1">{type.label}</h3>
                    <p className="text-sm text-gray-400">{type.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Location with Google Places Autocomplete */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Where is the property located?</h2>
                <p className="text-gray-400">Start typing the address - we'll auto-fill the rest</p>
              </div>

              <div className="space-y-4">
                {/* Polished Google Places Autocomplete */}
                <PolishedAddressAutocomplete
                  initialValue={formData.address}
                  onAddressSelect={(addressData) => {
                    updateFormData({
                      address: addressData.address,
                      city: addressData.city,
                      state: addressData.state,
                      zip: addressData.zip,
                    })
                  }}
                />

                {/* City, State, ZIP (auto-filled from Google Places) */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City</label>
                    <input
                      type="text"
                      value={formData.city || ''}
                      onChange={(e) => updateFormData({ city: e.target.value })}
                      placeholder="Auto-filled"
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">State</label>
                    <input
                      type="text"
                      value={formData.state || ''}
                      onChange={(e) => updateFormData({ state: e.target.value })}
                      placeholder="Auto-filled"
                      maxLength={2}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">ZIP Code</label>
                    <input
                      type="text"
                      value={formData.zip || ''}
                      onChange={(e) => updateFormData({ zip: e.target.value })}
                      placeholder="Auto-filled"
                      maxLength={5}
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Financial Details with Smart Inputs */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">What are the financials?</h2>
                <p className="text-gray-400">Income-based valuation - this is what matters</p>
              </div>

              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <IPhoneNumberPicker
                    label="Estimated Value"
                    value={formData.estimatedValue || 0}
                    onChange={(val) => updateFormData({ estimatedValue: val })}
                    step={100000}
                    max={50000000}
                    helpText="Current market value of the property"
                  />

                  <IPhoneNumberPicker
                    label="Current Debt"
                    value={formData.currentDebt || 0}
                    onChange={(val) => updateFormData({ currentDebt: val })}
                    step={100000}
                    max={50000000}
                    helpText="Total mortgage/loan balance"
                  />
                </div>

                {formData.estimatedValue && formData.currentDebt !== undefined && (
                  <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Your Equity</p>
                    <p className="text-2xl font-bold text-blue-400">
                      ${(formData.estimatedValue - formData.currentDebt).toLocaleString()}
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <IPhoneNumberPicker
                    label="Monthly NOI (Net Operating Income)"
                    value={formData.monthlyNOI || 0}
                    onChange={(val) => updateFormData({ monthlyNOI: val })}
                    step={1000}
                    max={500000}
                    helpText="Gross rent - expenses (not including debt service)"
                  />

                  <IPhoneNumberPicker
                    label="Annual Operating Expenses"
                    value={formData.annualExpenses || 0}
                    onChange={(val) => updateFormData({ annualExpenses: val })}
                    step={10000}
                    max={2000000}
                    helpText="Property tax, insurance, utilities, maintenance"
                  />
                </div>

                {formData.monthlyNOI && formData.annualExpenses && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Annual NOI</p>
                      <p className="text-xl font-bold text-emerald-400">
                        ${(formData.monthlyNOI * 12).toLocaleString()}
                      </p>
                    </div>

                    <div className="p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                      <p className="text-sm text-gray-400 mb-1">Expense Ratio</p>
                      <p className="text-xl font-bold text-purple-400">
                        {Math.round((formData.annualExpenses / (formData.monthlyNOI * 12 + formData.annualExpenses)) * 100)}%
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {((formData.annualExpenses / (formData.monthlyNOI * 12 + formData.annualExpenses)) * 100) < 40
                          ? 'Excellent - operational upside for buyers'
                          : 'Room for improvement'}
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-3 gap-4">
                  <IPhoneNumberPicker
                    label="Door Count (optional)"
                    value={formData.doorCount || 0}
                    onChange={(val) => updateFormData({ doorCount: val })}
                    step={1}
                    min={1}
                    max={200}
                    prefix=""
                    suffix=" units"
                  />

                  <IPhoneNumberPicker
                    label="Square Feet (optional)"
                    value={formData.squareFeet || 0}
                    onChange={(val) => updateFormData({ squareFeet: val })}
                    step={1000}
                    min={500}
                    max={500000}
                    prefix=""
                    suffix=" sq ft"
                  />

                  <IPhoneNumberPicker
                    label="Occupancy % (optional)"
                    value={formData.occupancyRate || 0}
                    onChange={(val) => updateFormData({ occupancyRate: val })}
                    step={5}
                    min={0}
                    max={100}
                    prefix=""
                    suffix="%"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Tax Basis with Smart Inputs */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Tax basis information</h2>
                <p className="text-gray-400">Optional but helps calculate accurate boot and tax impact</p>
              </div>

              <div className="space-y-4">
                <IPhoneNumberPicker
                  label="Original Purchase Price / Basis"
                  value={formData.originalBasis || 0}
                  onChange={(val) => updateFormData({ originalBasis: val })}
                  step={100000}
                  max={50000000}
                  helpText="What you paid + improvements"
                />

                <IPhoneNumberPicker
                  label="Depreciation Taken"
                  value={formData.depreciationTaken || 0}
                  onChange={(val) => updateFormData({ depreciationTaken: val })}
                  step={10000}
                  max={5000000}
                  helpText="Check your tax returns or ask your CPA"
                />

                {formData.originalBasis && formData.depreciationTaken !== undefined && (
                  <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Adjusted Basis</p>
                    <p className="text-2xl font-bold text-orange-400">
                      ${(formData.originalBasis - formData.depreciationTaken).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      If you sell for ${formData.estimatedValue?.toLocaleString()}, your taxable gain would be approximately $
                      {formData.estimatedValue
                        ? (formData.estimatedValue - (formData.originalBasis - formData.depreciationTaken)).toLocaleString()
                        : '0'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Replacement Property Criteria */}
          {step === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">What would you trade FOR?</h2>
                <p className="text-gray-400">This is where AI finds opportunities humans miss</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-3">
                    Desired Property Types (select all that interest you)
                  </label>
                  <div className="grid md:grid-cols-2 gap-3">
                    {PROPERTY_TYPES.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => {
                          const current = formData.desiredTypes || []
                          const updated = current.includes(type.value)
                            ? current.filter((t) => t !== type.value)
                            : [...current, type.value]
                          updateFormData({ desiredTypes: updated })
                        }}
                        className={`p-4 rounded-lg border-2 text-left transition-all ${
                          formData.desiredTypes?.includes(type.value)
                            ? 'border-emerald-500 bg-emerald-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <h4 className="font-semibold">{type.label}</h4>
                        <p className="text-xs text-gray-400 mt-1">{type.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Preferred States (optional - leave empty for nationwide)
                  </label>
                  <select
                    multiple
                    value={formData.preferredStates || []}
                    onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions, (option) => option.value)
                      updateFormData({ preferredStates: selected })
                    }}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none h-32"
                  >
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Goals */}
          {step === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">What are your exchange goals?</h2>
                <p className="text-gray-400">AI will prioritize matches based on these objectives</p>
              </div>

              <div className="space-y-6">
                {[
                  { key: 'stability', label: 'Stability & Predictability', description: 'Long-term tenants, predictable income' },
                  { key: 'expansion', label: 'Portfolio Expansion', description: 'More units, more doors, scale up' },
                  { key: 'cashFlow', label: 'Maximize Cash Flow', description: 'Higher NOI, better yield' },
                  { key: 'appreciation', label: 'Appreciation Potential', description: 'Value-add, growing markets' },
                  { key: 'lessManagement', label: 'Less Management Burden', description: 'NNN, professional management' },
                ].map((goal) => (
                  <div key={goal.key}>
                    <div className="flex justify-between mb-2">
                      <div>
                        <label className="block text-sm font-semibold">{goal.label}</label>
                        <p className="text-xs text-gray-500">{goal.description}</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">
                        {formData.goals?.[goal.key as keyof typeof formData.goals] || 5}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      value={formData.goals?.[goal.key as keyof typeof formData.goals] || 5}
                      onChange={(e) => {
                        updateFormData({
                          goals: {
                            ...formData.goals!,
                            [goal.key]: Number(e.target.value),
                          },
                        })
                      }}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Not important</span>
                      <span>Critical</span>
                    </div>
                  </div>
                ))}

                <div className="mt-6">
                  <label className="block text-sm font-medium mb-2">Timeline</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'flexible', label: 'Flexible', desc: '6+ months' },
                      { value: 'moderate', label: 'Moderate', desc: '3-6 months' },
                      { value: 'urgent', label: 'Urgent', desc: 'ASAP' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateFormData({ timeline: option.value as 'flexible' | 'moderate' | 'urgent' })}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          formData.timeline === option.value
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                        }`}
                      >
                        <p className="font-semibold">{option.label}</p>
                        <p className="text-xs text-gray-400 mt-1">{option.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Review & Consent */}
          {step === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-2">Review & List Your Property</h2>
                <p className="text-gray-400">You'll get instant matches as soon as you submit</p>
              </div>

              <div className="space-y-4 p-6 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Property Type</p>
                    <p className="font-semibold">{formData.propertyType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Location</p>
                    <p className="font-semibold">
                      {formData.city}, {formData.state}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Value</p>
                    <p className="font-semibold">${formData.estimatedValue?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Equity</p>
                    <p className="font-semibold text-emerald-400">
                      ${((formData.estimatedValue || 0) - (formData.currentDebt || 0)).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Monthly NOI</p>
                    <p className="font-semibold">${formData.monthlyNOI?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Seeking</p>
                    <p className="font-semibold">{formData.desiredTypes?.join(', ')}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.listOnExchange || false}
                    onChange={(e) => updateFormData({ listOnExchange: e.target.checked })}
                    className="mt-1 w-5 h-5 rounded border-gray-600 text-blue-500 focus:ring-blue-500"
                  />
                  <div>
                    <p className="font-semibold">List my property on the 1031 Exchange Platform</p>
                    <p className="text-sm text-gray-400 mt-1">
                      You'll instantly see potential matches and may receive offers from qualified buyers seeking exactly
                      what you're selling. All listings are based on income analysis and financial fit.
                    </p>
                  </div>
                </label>
              </div>

              <div className="text-sm text-gray-500 space-y-2">
                <p>
                  <strong>How it works:</strong> Your property becomes visible to buyers whose replacement criteria match
                  your property profile. Their properties become visible to you based on what you're seeking.
                </p>
                <p>
                  <strong>Privacy:</strong> Listings are anonymous until mutual interest is established. Financial details
                  are visible but personal information is protected.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-8 pt-6 border-t border-gray-800">
        <button
          onClick={prevStep}
          disabled={step === 1}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
        >
          Previous
        </button>

        {step < totalSteps ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors"
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isSubmitting}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-emerald-700 transition-all"
          >
            {isSubmitting ? 'Finding Matches...' : 'Submit & Get Matches'}
          </button>
        )}
      </div>
    </div>
  )
}
