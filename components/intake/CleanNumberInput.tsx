'use client'

interface CleanNumberInputProps {
  label: string
  value: number | undefined
  onChange: (value: number) => void
  prefix?: string
  suffix?: string
  helpText?: string
  placeholder?: string
}

/**
 * Clean, simple number input with mobile numeric keypad
 * No complexity, just works
 */
export default function CleanNumberInput({
  label,
  value,
  onChange,
  prefix = '$',
  suffix = '',
  helpText,
  placeholder = '0',
}: CleanNumberInputProps) {
  const handleChange = (inputValue: string) => {
    // Remove non-numeric characters except decimal point
    const cleaned = inputValue.replace(/[^0-9.]/g, '')

    const num = parseFloat(cleaned || '0')
    if (!isNaN(num)) {
      onChange(Math.round(num))
    }
  }

  const formatDisplay = (num: number | undefined): string => {
    if (num === undefined || num === 0) return ''
    return num.toLocaleString('en-US', { maximumFractionDigits: 0 })
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-200">
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-lg">
            {prefix}
          </span>
        )}
        <input
          type="text"
          inputMode="numeric"
          value={formatDisplay(value)}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`
            w-full ${prefix ? 'pl-8' : 'pl-4'} pr-4 py-3.5
            bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl
            focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
            transition-all duration-200 text-white font-mono text-lg
            placeholder-gray-600
          `}
        />
        {suffix && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
            {suffix}
          </span>
        )}
      </div>

      {helpText && (
        <p className="text-xs text-gray-500 mt-2">{helpText}</p>
      )}
    </div>
  )
}
