import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase/client'
import { generateOffers } from '@/lib/ai/offer-generator'
import type { Property, Match } from '@/lib/types/database.types'

export async function POST(request: NextRequest) {
  try {
    const { matchId, buyerPropertyId } = await request.json()

    if (!matchId || !buyerPropertyId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 })
    }

    const supabase = getServiceSupabase()

    // 1. Fetch the match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .single()

    if (matchError || !match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 })
    }

    // 2. Fetch the property being offered on (replacement property in the match)
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', match.replacement_property_id)
      .single()

    if (propertyError || !property) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 })
    }

    // 3. Fetch buyer's property to determine their equity
    const { data: buyerProperty, error: buyerError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', buyerPropertyId)
      .single()

    if (buyerError || !buyerProperty) {
      return NextResponse.json({ error: 'Buyer property not found' }, { status: 404 })
    }

    const buyerEquity = buyerProperty.equity

    // 4. Generate offer structures using AI (with Claude API integration)
    const offers = await generateOffers({
      property: property as Property,
      buyerEquity,
      match: match as Match,
    })

    // 5. Save offers to database
    const offerRecords = offers.map((offer) => ({
      match_id: matchId,
      from_user_id: buyerProperty.owner_id,
      to_user_id: property.owner_id,
      property_id: property.id,
      offer_type: offer.type,
      price: offer.structure.price,
      down_payment: offer.structure.downPayment,
      financing_amount: offer.structure.financing,
      seller_financing: offer.structure.sellerFinancing || 0,
      close_days: offer.structure.closeDays,
      contingencies: offer.structure.contingencies,
      net_to_seller: offer.sellerNet.netCash,
      estimated_closing_costs: offer.sellerNet.closingCosts,
      boot_amount: offer.sellerNet.boot,
      tax_impact: offer.sellerNet.taxImpact,
      offer_reasoning: { reasoning: offer.reasoning },
      interactive_terms: {
        adjustable: ['price', 'downPayment', 'closeDays', 'sellerFinancing'],
      },
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
    }))

    const { data: savedOffers, error: saveError } = await supabase
      .from('offers')
      .insert(offerRecords)
      .select()

    if (saveError) {
      console.error('Offer save error:', saveError)
      return NextResponse.json({ error: 'Failed to save offers' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      offers: savedOffers,
      count: savedOffers.length,
    })
  } catch (error) {
    console.error('Offer generation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
