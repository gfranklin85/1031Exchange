'use client'

import { useState, useEffect } from 'react'

interface SmartNumberInputProps {
  label: string
  value: number | undefined
  onChange: (value: number) => void
  placeholder?: string
  helpText?: string
  prefix?: string
  ranges?: { label: string; value: number }[]
  step?: number
  min?: number
  max?: number
}

/**
 * Smart number input with dropdown presets + manual entry
 * No annoying scroll-by-one behavior
 */
export default function SmartNumberInput({
  label,
  value,
  onChange,
  placeholder = '0',
  helpText,
  prefix = '$',
  ranges,
  step = 1000,
  min = 0,
  max,
}: SmartNumberInputProps) {
  const [mode, setMode] = useState<'dropdown' | 'manual'>('dropdown')
  const [manualValue, setManualValue] = useState('')

  // Format number with commas
  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  // Parse formatted number
  const parseNumber = (str: string): number => {
    return parseInt(str.replace(/[^0-9]/g, '')) || 0
  }

  // Default ranges if not provided
  const defaultRanges = ranges || generateDefaultRanges(step, min, max)

  // Switch to manual mode if value doesn't match any preset
  useEffect(() => {
    if (value && !defaultRanges.find((r) => r.value === value)) {
      setMode('manual')
      setManualValue(value.toString())
    }
  }, [value, defaultRanges])

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      <div className="flex gap-2">
        {/* Dropdown for quick selection */}
        {mode === 'dropdown' ? (
          <select
            value={value || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value)
              if (e.target.value === 'manual') {
                setMode('manual')
                setManualValue(value?.toString() || '')
              } else if (val) {
                onChange(val)
              }
            }}
            className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select {label.toLowerCase()}</option>
            {defaultRanges.map((range) => (
              <option key={range.value} value={range.value}>
                {prefix}{formatNumber(range.value)} {range.label && `(${range.label})`}
              </option>
            ))}
            <option value="manual">✏️ Enter custom amount</option>
          </select>
        ) : (
          <>
            {/* Manual entry */}
            <div className="flex-1 relative">
              <span className="absolute left-4 top-3 text-gray-400">{prefix}</span>
              <input
                type="text"
                value={manualValue ? formatNumber(parseNumber(manualValue)) : ''}
                onChange={(e) => {
                  const numericValue = parseNumber(e.target.value)
                  setManualValue(numericValue.toString())
                  onChange(numericValue)
                }}
                placeholder={placeholder}
                className="w-full pl-8 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button
              onClick={() => setMode('dropdown')}
              className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
            >
              ⬇️ Presets
            </button>
          </>
        )}
      </div>

      {helpText && <p className="text-xs text-gray-500 mt-1">{helpText}</p>}
    </div>
  )
}

/**
 * Generate default ranges based on step size
 */
function generateDefaultRanges(
  step: number,
  min: number = 0,
  max?: number
): { label: string; value: number }[] {
  const ranges: { label: string; value: number }[] = []

  // For property values (large numbers)
  if (step >= 100000) {
    // $500K, $750K, $1M, $1.5M, $2M, $3M, $5M, $10M
    const values = [500000, 750000, 1000000, 1500000, 2000000, 3000000, 5000000, 10000000]
    values.forEach((val) => {
      if (val >= min && (!max || val <= max)) {
        ranges.push({
          value: val,
          label: val >= 1000000 ? `${val / 1000000}M` : `${val / 1000}K`,
        })
      }
    })
  } else if (step >= 10000) {
    // For expenses/NOI (medium numbers)
    // $25K, $50K, $75K, $100K, $150K, $200K
    const values = [25000, 50000, 75000, 100000, 150000, 200000, 300000]
    values.forEach((val) => {
      if (val >= min && (!max || val <= max)) {
        ranges.push({ value: val, label: `${val / 1000}K` })
      }
    })
  } else {
    // For small numbers (door count, percentage, etc.)
    for (let i = min; i <= (max || 100); i += step) {
      ranges.push({ value: i, label: '' })
    }
  }

  return ranges
}
