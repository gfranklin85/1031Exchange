'use client'

import { useEffect, useRef, useState } from 'react'
import { useLoadScript } from '@react-google-maps/api'

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

/**
 * Google Places Autocomplete for address entry
 * Auto-fills city, state, zip from selected address
 */
export default function AddressAutocomplete({ onAddressSelect, initialValue }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [address, setAddress] = useState(initialValue || '')

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY!,
    libraries,
  })

  useEffect(() => {
    if (!isLoaded || !inputRef.current) return

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Limit to US addresses
      fields: ['address_components', 'formatted_address'],
    })

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()

      if (!place.address_components) return

      // Extract address components
      let streetNumber = ''
      let streetName = ''
      let city = ''
      let state = ''
      let zip = ''

      place.address_components.forEach((component) => {
        const types = component.types

        if (types.includes('street_number')) {
          streetNumber = component.long_name
        }
        if (types.includes('route')) {
          streetName = component.long_name
        }
        if (types.includes('locality')) {
          city = component.long_name
        }
        if (types.includes('administrative_area_level_1')) {
          state = component.short_name // CA, TX, etc.
        }
        if (types.includes('postal_code')) {
          zip = component.long_name
        }
      })

      const fullAddress = `${streetNumber} ${streetName}`.trim()

      setAddress(fullAddress)

      // Call parent callback with structured address
      onAddressSelect({
        address: fullAddress,
        city,
        state,
        zip,
      })
    })
  }, [isLoaded, onAddressSelect])

  if (loadError) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
        <p className="text-red-400 text-sm">
          Error loading Google Places. Check your API key or enter address manually.
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
    <div>
      <label className="block text-sm font-medium mb-2">Street Address</label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Start typing address..."
          className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-blue-500 focus:outline-none"
        />
        <div className="absolute right-3 top-3 text-gray-500 text-xs">
          🔍 Powered by Google
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        Start typing and select from suggestions - city/state/zip will auto-fill
      </p>
    </div>
  )
}
