'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, animate } from 'framer-motion'

interface iPhoneNumberPickerProps {
  label: string
  value: number
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  min?: number
  max?: number
  step?: number
  helpText?: string
}

/**
 * iPhone-style number picker with smooth wheel scrolling
 * Features: touch-optimized, momentum scrolling, manual entry, numeric keyboard
 */
export default function IPhoneNumberPicker({
  label,
  value,
  onChange,
  prefix = '$',
  suffix = '',
  min = 0,
  max = 50000000, // $50M default max
  step = 100000, // $100K steps
  helpText,
}: iPhoneNumberPickerProps) {
  const [isWheelOpen, setIsWheelOpen] = useState(false)
  const [isManualEntry, setIsManualEntry] = useState(false)
  const [manualValue, setManualValue] = useState(formatNumber(value))

  // Generate wheel values based on step
  const generateWheelValues = () => {
    const values: number[] = []

    // Smart step sizing based on range
    let currentStep = step
    if (max > 10000000) currentStep = 500000 // $500K steps for large numbers
    else if (max > 5000000) currentStep = 250000 // $250K steps
    else if (max > 1000000) currentStep = 100000 // $100K steps
    else if (max > 100000) currentStep = 25000 // $25K steps
    else currentStep = 10000 // $10K steps

    for (let i = min; i <= max; i += currentStep) {
      values.push(i)
    }

    // Always include the current value if it's not in the list
    if (!values.includes(value)) {
      values.push(value)
      values.sort((a, b) => a - b)
    }

    return values
  }

  const wheelValues = generateWheelValues()
  const currentIndex = wheelValues.findIndex(v => v >= value)
  const y = useMotionValue(0)

  const constraintsRef = useRef<HTMLDivElement>(null)
  const ITEM_HEIGHT = 50

  useEffect(() => {
    // Scroll to current value when wheel opens
    if (isWheelOpen) {
      const targetY = -(currentIndex * ITEM_HEIGHT - ITEM_HEIGHT)
      animate(y, targetY, { type: 'spring', stiffness: 300, damping: 30 })
    }
  }, [isWheelOpen, currentIndex, y])

  const handleWheelDrag = () => {
    const currentY = y.get()
    const index = Math.round(-currentY / ITEM_HEIGHT) + 1
    const clampedIndex = Math.max(0, Math.min(index, wheelValues.length - 1))

    if (wheelValues[clampedIndex] !== undefined) {
      onChange(wheelValues[clampedIndex])
    }
  }

  const handleManualChange = (inputValue: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = inputValue.replace(/[^0-9.]/g, '')
    setManualValue(cleaned)

    const num = parseFloat(cleaned.replace(/,/g, ''))
    if (!isNaN(num) && num >= min && num <= max) {
      onChange(Math.round(num))
    }
  }

  const handleManualBlur = () => {
    const num = parseFloat(manualValue.replace(/,/g, ''))
    if (!isNaN(num)) {
      onChange(Math.min(Math.max(Math.round(num), min), max))
      setManualValue(formatNumber(Math.min(Math.max(Math.round(num), min), max)))
    } else {
      setManualValue(formatNumber(value))
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-200">
        {label}
      </label>

      {/* Display value / trigger button */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setIsWheelOpen(!isWheelOpen)}
          className={`
            flex-1 px-4 py-3.5 bg-gray-800/50 backdrop-blur border rounded-xl
            transition-all duration-200 text-left
            ${isWheelOpen
              ? 'border-blue-500 ring-2 ring-blue-500/20'
              : 'border-gray-700 hover:border-gray-600'}
          `}
        >
          <div className="flex items-center justify-between">
            <span className="text-white font-semibold text-lg">
              {prefix}{formatNumber(value)}{suffix}
            </span>
            <motion.div
              animate={{ rotate: isWheelOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="text-gray-400"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>

        {/* Manual entry toggle */}
        <button
          type="button"
          onClick={() => {
            setIsManualEntry(!isManualEntry)
            setIsWheelOpen(false)
          }}
          className={`
            px-4 py-3.5 bg-gray-800/50 backdrop-blur border rounded-xl
            transition-all duration-200
            ${isManualEntry
              ? 'border-blue-500 ring-2 ring-blue-500/20 text-blue-400'
              : 'border-gray-700 hover:border-gray-600 text-gray-400'}
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>
      </div>

      {/* Manual entry input */}
      {isManualEntry && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2"
        >
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              {prefix}
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={manualValue}
              onChange={(e) => handleManualChange(e.target.value)}
              onBlur={handleManualBlur}
              placeholder="Enter amount"
              className="w-full pl-8 pr-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg
                         focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                         transition-all text-white font-mono text-lg"
              autoFocus
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Numeric keyboard for quick entry
          </p>
        </motion.div>
      )}

      {/* iPhone-style wheel picker */}
      {isWheelOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mt-2 overflow-hidden rounded-xl bg-gray-900/50 border border-gray-700"
        >
          <div className="relative h-[250px] overflow-hidden">
            {/* Selection highlight bar */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[50px]
                           bg-blue-600/10 border-y-2 border-blue-500/30 pointer-events-none z-10" />

            {/* Gradient overlays (top and bottom fade) */}
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-gray-900 to-transparent pointer-events-none z-20" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-20" />

            {/* Scrollable wheel */}
            <div ref={constraintsRef} className="h-full overflow-hidden">
              <motion.div
                drag="y"
                dragConstraints={{ top: -(wheelValues.length - 3) * ITEM_HEIGHT, bottom: ITEM_HEIGHT }}
                dragElastic={0.1}
                dragMomentum={true}
                onDragEnd={handleWheelDrag}
                style={{ y }}
                className="py-[100px]"
              >
                {wheelValues.map((wheelValue, index) => {
                  return (
                    <div
                      key={wheelValue}
                      className="h-[50px] flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        onChange(wheelValue)
                        animate(y, -(index * ITEM_HEIGHT - ITEM_HEIGHT), {
                          type: 'spring',
                          stiffness: 300,
                          damping: 30,
                        })
                      }}
                    >
                      <span className={`
                        text-xl font-semibold transition-all
                        ${wheelValue === value ? 'text-white scale-110' : 'text-gray-500'}
                      `}>
                        {prefix}{formatNumber(wheelValue)}{suffix}
                      </span>
                    </div>
                  )
                })}
              </motion.div>
            </div>
          </div>

          {/* Done button */}
          <button
            type="button"
            onClick={() => setIsWheelOpen(false)}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium
                       transition-colors border-t border-gray-700"
          >
            Done
          </button>
        </motion.div>
      )}

      {helpText && (
        <p className="text-xs text-gray-500 mt-2">{helpText}</p>
      )}
    </div>
  )
}

// Helper function to format numbers with commas
function formatNumber(num: number): string {
  return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
}
