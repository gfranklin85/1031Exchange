import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase/client'
import { findMatches } from '@/lib/ai/matching-engine'
import type { PropertyIntakeForm, Property, ReplacementCriteria } from '@/lib/types/database.types'

export async function POST(request: NextRequest) {
  try {
    const formData: PropertyIntakeForm = await request.json()
    const supabase = getServiceSupabase()

    // For MVP, create a temporary user ID (in production, use auth)
    // In production: const { data: { user } } = await supabase.auth.getUser()
    const tempUserId = crypto.randomUUID()

    // Create user profile
    const { error: profileError } = await supabase.from('profiles').insert({
      id: tempUserId,
      email: `temp_${tempUserId}@example.com`, // In production, use real email
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error('Profile creation error:', profileError)
      // If profile already exists, that's ok for this MVP
    }

    // 1. Create the relinquished property record
    const propertyData = {
      owner_id: tempUserId,
      property_type: formData.propertyType,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      estimated_value: formData.estimatedValue,
      current_debt: formData.currentDebt || 0,
      monthly_noi: formData.monthlyNOI,
      annual_expenses: formData.annualExpenses,
      cap_rate: formData.monthlyNOI ? ((formData.monthlyNOI * 12) / formData.estimatedValue) * 100 : null,
      original_basis: formData.originalBasis,
      depreciation_taken: formData.depreciationTaken || 0,
      door_count: formData.doorCount,
      square_feet: formData.squareFeet,
      year_built: formData.yearBuilt,
      occupancy_rate: formData.occupancyRate,
      debt_service: formData.debtService,
      interest_rate: formData.interestRate,
      status: 'active',
      listed_on_exchange: formData.listOnExchange,
    }

    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert(propertyData)
      .select()
      .single()

    if (propertyError) {
      console.error('Property creation error:', propertyError)
      return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }

    // 2. Create replacement criteria (what they want to buy)
    const criteriaData = {
      owner_id: tempUserId,
      property_id: property.id,
      desired_types: formData.desiredTypes,
      preferred_states: formData.preferredStates,
      preferred_cities: formData.preferredCities,
      goal_stability: formData.goals.stability,
      goal_expansion: formData.goals.expansion,
      goal_cash_flow: formData.goals.cashFlow,
      goal_appreciation: formData.goals.appreciation,
      goal_less_management: formData.goals.lessManagement,
      timeline_urgency: formData.timeline,
      needs_close_by: formData.needsCloseBy,
    }

    const { data: criteria, error: criteriaError } = await supabase
      .from('replacement_criteria')
      .insert(criteriaData)
      .select()
      .single()

    if (criteriaError) {
      console.error('Criteria creation error:', criteriaError)
      return NextResponse.json({ error: 'Failed to create replacement criteria' }, { status: 500 })
    }

    // 3. Fetch all available properties for matching
    const { data: availableProperties, error: fetchError } = await supabase
      .from('properties')
      .select('*')
      .eq('listed_on_exchange', true)
      .neq('owner_id', tempUserId)
      .eq('status', 'active')

    if (fetchError) {
      console.error('Properties fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }

    // 4. Run AI matching engine (now with Claude API integration)
    const matches = await findMatches(
      property as Property,
      criteria as ReplacementCriteria,
      (availableProperties || []) as Property[],
      7 // Top 7 matches
    )

    // 5. Save matches to database
    const matchRecords = matches.map((match) => ({
      relinquished_property_id: match.relinquished_property_id,
      replacement_property_id: match.replacement_property_id,
      fit_score: match.fit_score,
      equity_match_score: match.equity_match_score,
      cash_flow_match_score: match.cash_flow_match_score,
      goal_alignment_score: match.goal_alignment_score,
      timing_compatibility_score: match.timing_compatibility_score,
      estimated_cash_boot: match.estimated_cash_boot,
      estimated_debt_boot: match.estimated_debt_boot,
      estimated_total_boot: match.estimated_total_boot,
      match_reasoning: match.match_reasoning,
      status: 'suggested',
    }))

    if (matchRecords.length > 0) {
      const { error: matchError } = await supabase.from('matches').insert(matchRecords)

      if (matchError) {
        console.error('Match creation error:', matchError)
        // Don't fail the request if match saving fails
      }
    }

    // 6. Also find reverse matches (their property as replacement for others)
    // This populates BOTH sides of the marketplace
    const { data: seekers, error: seekersError } = await supabase
      .from('replacement_criteria')
      .select('*, profiles(*)')
      .neq('owner_id', tempUserId)

    if (!seekersError && seekers) {
      const reverseMatches = []

      for (const seeker of seekers) {
        // Get the seeker's relinquished property
        const { data: seekerProperty } = await supabase
          .from('properties')
          .select('*')
          .eq('owner_id', seeker.owner_id)
          .single()

        if (seekerProperty) {
          // Check if our new property matches their criteria
          const scores = await findMatches(
            seekerProperty as Property,
            seeker as ReplacementCriteria,
            [property as Property],
            1
          )

          if (scores.length > 0) {
            reverseMatches.push({
              relinquished_property_id: seekerProperty.id,
              replacement_property_id: property.id,
              fit_score: scores[0].fit_score,
              equity_match_score: scores[0].equity_match_score,
              cash_flow_match_score: scores[0].cash_flow_match_score,
              goal_alignment_score: scores[0].goal_alignment_score,
              timing_compatibility_score: scores[0].timing_compatibility_score,
              estimated_cash_boot: scores[0].estimated_cash_boot,
              estimated_debt_boot: scores[0].estimated_debt_boot,
              estimated_total_boot: scores[0].estimated_total_boot,
              match_reasoning: scores[0].match_reasoning,
              status: 'suggested',
            })
          }
        }
      }

      if (reverseMatches.length > 0) {
        await supabase.from('matches').insert(reverseMatches)
      }
    }

    // 7. Return success with property ID and match count
    return NextResponse.json({
      success: true,
      propertyId: property.id,
      matchCount: matches.length,
      message: `Found ${matches.length} potential matches`,
    })
  } catch (error) {
    console.error('Intake submission error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
