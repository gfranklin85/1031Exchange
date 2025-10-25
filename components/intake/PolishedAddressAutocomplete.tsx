'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'
import { motion, AnimatePresence } from 'framer-motion'

const libraries: ('places')[] = ['places']

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    address: string
    city: string
    state: string
    zip: string
  }) => void
  initialValue?: string
}

interface Suggestion {
  description: string
  place_id: string
}

/**
 * Polished Google Places Autocomplete with sleek UI
 * Features: smooth animations, visual hierarchy, mobile-optimized
 */
export default function PolishedAddressAutocomplete({ onAddressSelect, initialValue }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [address, setAddress] = useState(initialValue || '')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
    libraries,
  })

  useEffect(() => {
    if (!isLoaded) return

    // Initialize services
    autocompleteService.current = new google.maps.places.AutocompleteService()

    // Create a temporary div for PlacesService (it requires a map or div)
    const div = document.createElement('div')
    placesService.current = new google.maps.places.PlacesService(div)
  }, [isLoaded])

  const handleInputChange = (value: string) => {
    setAddress(value)

    if (value.length < 3 || !autocompleteService.current) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    // Fetch suggestions
    autocompleteService.current.getPlacePredictions(
      {
        input: value,
        types: ['address'],
        componentRestrictions: { country: 'us' },
      },
      (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSuggestions(predictions.map(p => ({
            description: p.description,
            place_id: p.place_id,
          })))
          setShowSuggestions(true)
        } else {
          setSuggestions([])
          setShowSuggestions(false)
        }
      }
    )
  }

  const selectSuggestion = (placeId: string) => {
    if (!placesService.current) return

    placesService.current.getDetails(
      {
        placeId,
        fields: ['address_components', 'formatted_address'],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
          let streetNumber = ''
          let streetName = ''
          let city = ''
          let state = ''
          let zip = ''

          place.address_components.forEach((component) => {
            const types = component.types
            if (types.includes('street_number')) streetNumber = component.long_name
            if (types.includes('route')) streetName = component.long_name
            if (types.includes('locality')) city = component.long_name
            if (types.includes('administrative_area_level_1')) state = component.short_name
            if (types.includes('postal_code')) zip = component.long_name
          })

          const fullAddress = `${streetNumber} ${streetName}`.trim()
          setAddress(fullAddress)
          setShowSuggestions(false)

          onAddressSelect({ address: fullAddress, city, state, zip })
        }
      }
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          selectSuggestion(suggestions[selectedIndex].place_id)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Fallback to manual entry if Google Places fails
  if (loadError) {
    return (
      <div>
        <label className="block text-sm font-medium mb-2">Street Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value)
            onAddressSelect({ address: e.target.value, city: '', state: '', zip: '' })
          }}
          placeholder="123 Main Street"
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
        />
        <p className="text-xs text-yellow-400 mt-1">
          Using manual entry (Google Places unavailable)
        </p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="animate-pulse">
        <div className="h-12 bg-gray-800 rounded-lg"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <label className="block text-sm font-medium mb-2 text-gray-200">
        Street Address
      </label>

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          placeholder="Start typing address..."
          className="w-full px-4 py-3.5 bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl
                     focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none
                     transition-all duration-200 text-white placeholder-gray-500"
        />

        {/* Search icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Polished suggestions dropdown */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-2 bg-gray-800/95 backdrop-blur-xl border border-gray-700
                       rounded-xl shadow-2xl overflow-hidden"
          >
            <div className="max-h-72 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.place_id}
                  type="button"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                  onClick={() => selectSuggestion(suggestion.place_id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`
                    w-full px-4 py-3.5 text-left transition-all duration-150
                    ${selectedIndex === index
                      ? 'bg-blue-600/20 border-l-4 border-blue-500'
                      : 'hover:bg-gray-700/50 border-l-4 border-transparent'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    {/* Location pin icon */}
                    <div className={`mt-0.5 transition-colors ${
                      selectedIndex === index ? 'text-blue-400' : 'text-gray-500'
                    }`}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium truncate">
                        {suggestion.description.split(',')[0]}
                      </p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">
                        {suggestion.description.split(',').slice(1).join(',')}
                      </p>
                    </div>

                    {/* Arrow icon on selected */}
                    {selectedIndex === index && (
                      <motion.div
                        initial={{ opacity: 0, x: -5 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-blue-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>

            {/* Powered by Google badge */}
            <div className="px-4 py-2 bg-gray-900/50 border-t border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Use ↑↓ to navigate, Enter to select
              </span>
              <span className="text-xs text-gray-500">Powered by Google</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
