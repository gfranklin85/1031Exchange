import type { Property, ReplacementCriteria, Match } from '@/lib/types/database.types'

interface FitScoreComponents {
  equityMatch: number
  cashFlowMatch: number
  goalAlignment: number
  timingCompatibility: number
  overall: number
}

interface MatchWithDetails extends Match {
  replacementProperty: Property
  reasoning: {
    why: string
    keyBenefits: string[]
    considerations: string[]
    financialImpact: {
      cashFlowChange: number
      capRateChange: number
      equityPosition: string
    }
  }
}

/**
 * Multi-dimensional fit scoring algorithm
 * Finds non-obvious matches that humans would miss
 */
export function calculateFitScore(
  relinquishedProperty: Property,
  replacementProperty: Property,
  criteria: ReplacementCriteria
): FitScoreComponents {
  // 1. Equity Match Score (0-100)
  // How closely does the replacement property match the equity position?
  const relinquishedEquity = relinquishedProperty.equity
  const replacementEquity = replacementProperty.equity
  const equityDelta = Math.abs(relinquishedEquity - replacementEquity) / relinquishedEquity
  const equityMatch = Math.max(0, 100 - equityDelta * 100)

  // 2. Cash Flow Match Score (0-100)
  // Does the replacement property improve or maintain cash flow?
  const relinquishedNOI = relinquishedProperty.annual_noi
  const replacementNOI = replacementProperty.annual_noi
  const cashFlowRatio = replacementNOI / relinquishedNOI

  // Weighted: maintaining is good (100), improving is great (110), decreasing is bad
  let cashFlowMatch = 0
  if (cashFlowRatio >= 1.0) {
    cashFlowMatch = Math.min(100, 90 + cashFlowRatio * 10)
  } else {
    cashFlowMatch = cashFlowRatio * 90
  }

  // 3. Goal Alignment Score (0-100)
  // How well does this property align with stated goals?
  let goalAlignment = 0

  // Stability: longer leases, lower vacancy, NNN structure
  if (criteria.goal_stability > 5) {
    const stabilityScore =
      (replacementProperty.property_type === 'nnn' ? 30 : 0) +
      ((replacementProperty.occupancy_rate || 0) > 90 ? 20 : 0) +
      (replacementProperty.property_type === 'industrial' ? 15 : 0)
    goalAlignment += stabilityScore * (criteria.goal_stability / 10)
  }

  // Expansion: more units, more doors
  if (criteria.goal_expansion > 5 && replacementProperty.door_count && relinquishedProperty.door_count) {
    const doorRatio = replacementProperty.door_count / relinquishedProperty.door_count
    const expansionScore = doorRatio >= 1.2 ? 25 : 0
    goalAlignment += expansionScore * (criteria.goal_expansion / 10)
  }

  // Cash flow: higher NOI, better cap rate
  if (criteria.goal_cash_flow > 5) {
    const cashFlowImprovement = replacementNOI > relinquishedNOI ? 25 : 0
    const capRateBonus =
      replacementProperty.cap_rate && relinquishedProperty.cap_rate
        ? replacementProperty.cap_rate > relinquishedProperty.cap_rate
          ? 15
          : 0
        : 0
    goalAlignment += (cashFlowImprovement + capRateBonus) * (criteria.goal_cash_flow / 10)
  }

  // Appreciation: value-add markets, newer construction
  if (criteria.goal_appreciation > 5) {
    const appreciationScore =
      (replacementProperty.year_built && replacementProperty.year_built > 2000 ? 15 : 0) +
      ((replacementProperty.occupancy_rate || 0) < 85 ? 20 : 0) // vacancy = value-add opportunity
    goalAlignment += appreciationScore * (criteria.goal_appreciation / 10)
  }

  // Less management: NNN, professional management, newer property
  if (criteria.goal_less_management > 5) {
    const managementScore =
      (replacementProperty.property_type === 'nnn' ? 40 : 0) +
      (replacementProperty.property_type === 'industrial' ? 20 : 0) +
      (replacementProperty.year_built && replacementProperty.year_built > 2010 ? 10 : 0)
    goalAlignment += managementScore * (criteria.goal_less_management / 10)
  }

  goalAlignment = Math.min(100, goalAlignment)

  // 4. Timing Compatibility (0-100)
  // Can this deal close in time? (For MVP, assume all properties are available)
  const timingCompatibility = criteria.timeline_urgency === 'urgent' ? 80 : 95

  // 5. Property Type Match (bonus/penalty)
  const typeMatch = criteria.desired_types.includes(replacementProperty.property_type) ? 1.0 : 0.7

  // 6. Geographic Preference (bonus if matches)
  const geoMatch =
    criteria.preferred_states && criteria.preferred_states.length > 0
      ? criteria.preferred_states.includes(replacementProperty.state)
        ? 1.1
        : 0.9
      : 1.0

  // Overall score (weighted average)
  const rawScore =
    equityMatch * 0.3 +
    cashFlowMatch * 0.25 +
    goalAlignment * 0.35 +
    timingCompatibility * 0.1

  const overall = Math.min(100, Math.round(rawScore * typeMatch * geoMatch))

  return {
    equityMatch: Math.round(equityMatch),
    cashFlowMatch: Math.round(cashFlowMatch),
    goalAlignment: Math.round(goalAlignment),
    timingCompatibility: Math.round(timingCompatibility),
    overall,
  }
}

/**
 * Generate human-readable reasoning for why this is a good match
 */
export function generateMatchReasoning(
  relinquishedProperty: Property,
  replacementProperty: Property,
  criteria: ReplacementCriteria,
  scores: FitScoreComponents
): MatchWithDetails['reasoning'] {
  const keyBenefits: string[] = []
  const considerations: string[] = []

  // Equity analysis
  const equityDelta = replacementProperty.equity - relinquishedProperty.equity
  if (Math.abs(equityDelta) < relinquishedProperty.equity * 0.1) {
    keyBenefits.push('Near-perfect equity match - minimal boot to manage')
  } else if (equityDelta > 0) {
    keyBenefits.push(`Trade up: $${equityDelta.toLocaleString()} more equity to deploy`)
  } else {
    considerations.push(`Boot generated: $${Math.abs(equityDelta).toLocaleString()} - can be strategically deployed`)
  }

  // Cash flow analysis
  const noiDelta = replacementProperty.annual_noi - relinquishedProperty.annual_noi
  if (noiDelta > 0) {
    keyBenefits.push(`Cash flow improvement: +$${noiDelta.toLocaleString()}/year`)
  } else if (noiDelta < 0) {
    considerations.push(`Lower NOI by $${Math.abs(noiDelta).toLocaleString()}/year`)
  }

  // Cap rate comparison
  if (replacementProperty.cap_rate && relinquishedProperty.cap_rate) {
    const capDelta = replacementProperty.cap_rate - relinquishedProperty.cap_rate
    if (capDelta > 0.5) {
      keyBenefits.push(`Superior cap rate: ${replacementProperty.cap_rate}% vs ${relinquishedProperty.cap_rate}%`)
    }
  }

  // Asset class arbitrage
  if (replacementProperty.property_type !== relinquishedProperty.property_type) {
    keyBenefits.push(
      `Cross-asset-class swap: ${relinquishedProperty.property_type} → ${replacementProperty.property_type}`
    )
  }

  // Management burden
  if (replacementProperty.property_type === 'nnn' && criteria.goal_less_management > 7) {
    keyBenefits.push('NNN structure eliminates management burden - tenant pays everything')
  }

  // Expense ratio
  const relinquishedExpenseRatio =
    relinquishedProperty.annual_expenses / (relinquishedProperty.annual_noi + relinquishedProperty.annual_expenses)
  const replacementExpenseRatio =
    replacementProperty.annual_expenses / (replacementProperty.annual_noi + replacementProperty.annual_expenses)

  if (replacementExpenseRatio < relinquishedExpenseRatio * 0.8) {
    keyBenefits.push('Significantly lower expense ratio - more operational efficiency')
  }

  // Scale change
  if (replacementProperty.door_count && relinquishedProperty.door_count) {
    const doorDelta = replacementProperty.door_count - relinquishedProperty.door_count
    if (doorDelta > 0 && criteria.goal_expansion > 6) {
      keyBenefits.push(`Portfolio expansion: +${doorDelta} units`)
    } else if (doorDelta < 0 && criteria.goal_less_management > 6) {
      keyBenefits.push('Consolidation play: fewer units, less complexity')
    }
  }

  // Generate summary reasoning
  let why = ''
  if (scores.overall >= 80) {
    why = 'Exceptional match across all dimensions: equity alignment, cash flow improvement, and perfect goal fit.'
  } else if (scores.overall >= 65) {
    why = 'Strong match with notable benefits in cash flow and operational efficiency.'
  } else if (scores.overall >= 50) {
    why = 'Solid opportunity with good equity match and strategic alignment to your goals.'
  } else {
    why = 'Viable option worth exploring despite some trade-offs.'
  }

  // Financial impact summary
  const cashFlowChange = replacementProperty.annual_noi - relinquishedProperty.annual_noi
  const capRateChange =
    replacementProperty.cap_rate && relinquishedProperty.cap_rate
      ? replacementProperty.cap_rate - relinquishedProperty.cap_rate
      : 0

  let equityPosition = 'maintained'
  if (equityDelta > relinquishedProperty.equity * 0.1) {
    equityPosition = 'increased significantly'
  } else if (equityDelta < -relinquishedProperty.equity * 0.1) {
    equityPosition = 'decreased (boot opportunity)'
  }

  return {
    why,
    keyBenefits,
    considerations,
    financialImpact: {
      cashFlowChange,
      capRateChange,
      equityPosition,
    },
  }
}

/**
 * Calculate boot amount for a potential exchange
 */
export function calculateBoot(
  relinquishedProperty: Property,
  replacementProperty: Property
): {
  cashBoot: number
  debtBoot: number
  totalBoot: number
} {
  const cashBoot = relinquishedProperty.estimated_value - replacementProperty.estimated_value
  const debtBoot = relinquishedProperty.current_debt - replacementProperty.current_debt

  // Total taxable boot is the GREATER of cash boot or debt boot (simplified)
  // In reality it's more complex, but this is a good approximation
  const totalBoot = Math.max(cashBoot, debtBoot, 0)

  return {
    cashBoot,
    debtBoot,
    totalBoot,
  }
}

/**
 * Find all matches for a given property
 * Returns top N matches sorted by fit score
 */
export function findMatches(
  relinquishedProperty: Property,
  criteria: ReplacementCriteria,
  availableProperties: Property[],
  topN: number = 7
): MatchWithDetails[] {
  const matches: MatchWithDetails[] = []

  for (const replacementProperty of availableProperties) {
    // Don't match with self
    if (replacementProperty.id === relinquishedProperty.id) continue

    // Don't match with properties from same owner
    if (replacementProperty.owner_id === relinquishedProperty.owner_id) continue

    // Only match with listed properties
    if (!replacementProperty.listed_on_exchange) continue

    // Calculate fit score
    const scores = calculateFitScore(relinquishedProperty, replacementProperty, criteria)

    // Only include matches above threshold (50+)
    if (scores.overall < 50) continue

    // Calculate boot
    const boot = calculateBoot(relinquishedProperty, replacementProperty)

    // Generate reasoning
    const reasoning = generateMatchReasoning(relinquishedProperty, replacementProperty, criteria, scores)

    matches.push({
      id: '', // Will be generated when saved to DB
      relinquished_property_id: relinquishedProperty.id,
      replacement_property_id: replacementProperty.id,
      fit_score: scores.overall,
      equity_match_score: scores.equityMatch,
      cash_flow_match_score: scores.cashFlowMatch,
      goal_alignment_score: scores.goalAlignment,
      timing_compatibility_score: scores.timingCompatibility,
      estimated_cash_boot: boot.cashBoot,
      estimated_debt_boot: boot.debtBoot,
      estimated_total_boot: boot.totalBoot,
      status: 'suggested',
      match_reasoning: reasoning,
      replacementProperty,
      reasoning,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  // Sort by fit score descending and return top N
  return matches.sort((a, b) => b.fit_score - a.fit_score).slice(0, topN)
}
