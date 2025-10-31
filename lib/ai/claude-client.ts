import Anthropic from '@anthropic-ai/sdk'

// Initialize Claude client
const apiKey = process.env.ANTHROPIC_API_KEY

if (!apiKey) {
  console.warn('⚠️ ANTHROPIC_API_KEY not set - AI features will use fallback logic')
}

export const anthropic = apiKey
  ? new Anthropic({
      apiKey,
    })
  : null

/**
 * Check if Claude API is available
 */
export function isClaudeAvailable(): boolean {
  return !!anthropic
}

/**
 * Generate enhanced match reasoning using Claude
 * Takes property details and generates human-readable explanation
 */
export async function generateMatchReasoning(params: {
  relinquishedProperty: any
  replacementProperty: any
  criteria: any
  scores: {
    equityMatch: number
    cashFlowMatch: number
    goalAlignment: number
    overall: number
  }
}): Promise<{
  why: string
  keyBenefits: string[]
  considerations: string[]
  financialImpact: {
    cashFlowChange: number
    capRateChange: number
    equityPosition: string
  }
}> {
  if (!anthropic) {
    // Fallback to basic reasoning if Claude not available
    return generateFallbackReasoning(params)
  }

  const { relinquishedProperty, replacementProperty, criteria, scores } = params

  const prompt = `You are an expert 1031 exchange advisor analyzing a property match for a real estate investor.

CURRENT PROPERTY (What they own):
- Type: ${relinquishedProperty.property_type}
- Location: ${relinquishedProperty.city}, ${relinquishedProperty.state}
- Value: $${relinquishedProperty.estimated_value.toLocaleString()}
- Debt: $${relinquishedProperty.current_debt.toLocaleString()}
- Equity: $${relinquishedProperty.equity.toLocaleString()}
- Monthly NOI: $${relinquishedProperty.monthly_noi.toLocaleString()}
- Annual Expenses: $${relinquishedProperty.annual_expenses.toLocaleString()}
- Cap Rate: ${relinquishedProperty.cap_rate}%
${relinquishedProperty.door_count ? `- Units: ${relinquishedProperty.door_count}` : ''}

REPLACEMENT PROPERTY (Potential match):
- Type: ${replacementProperty.property_type}
- Location: ${replacementProperty.city}, ${replacementProperty.state}
- Value: $${replacementProperty.estimated_value.toLocaleString()}
- Debt: $${replacementProperty.current_debt.toLocaleString()}
- Equity: $${replacementProperty.equity.toLocaleString()}
- Monthly NOI: $${replacementProperty.monthly_noi.toLocaleString()}
- Annual Expenses: $${replacementProperty.annual_expenses.toLocaleString()}
- Cap Rate: ${replacementProperty.cap_rate}%
${replacementProperty.door_count ? `- Units: ${replacementProperty.door_count}` : ''}

INVESTOR'S GOALS (0-10 scale):
- Stability: ${criteria.goal_stability}/10
- Expansion: ${criteria.goal_expansion}/10
- Cash Flow: ${criteria.goal_cash_flow}/10
- Appreciation: ${criteria.goal_appreciation}/10
- Less Management: ${criteria.goal_less_management}/10

MATCH SCORES:
- Equity Match: ${scores.equityMatch}/100
- Cash Flow Match: ${scores.cashFlowMatch}/100
- Goal Alignment: ${scores.goalAlignment}/100
- Overall Fit: ${scores.overall}/100

Generate a compelling match analysis in JSON format:
{
  "why": "One clear sentence explaining why this is a strong/good/viable match",
  "keyBenefits": ["3-5 specific benefits this swap provides"],
  "considerations": ["1-3 trade-offs or things to consider"],
  "cashFlowChange": <annual NOI change in dollars>,
  "capRateChange": <cap rate delta>,
  "equityPosition": "increased" | "maintained" | "decreased (boot opportunity)"
}

Focus on:
1. Non-obvious opportunities (asset class arbitrage, geographic benefits, debt optimization)
2. How this aligns with their stated goals
3. Financial impact (cash flow, cap rate, equity)
4. Operational benefits (management burden, tenant quality, lease structure)

Be concise and specific. Use numbers. Highlight what makes this match special.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      // Parse JSON response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          why: parsed.why,
          keyBenefits: parsed.keyBenefits,
          considerations: parsed.considerations || [],
          financialImpact: {
            cashFlowChange: parsed.cashFlowChange,
            capRateChange: parsed.capRateChange,
            equityPosition: parsed.equityPosition,
          },
        }
      }
    }

    // Fallback if parsing fails
    return generateFallbackReasoning(params)
  } catch (error) {
    console.error('Claude API error:', error)
    return generateFallbackReasoning(params)
  }
}

/**
 * Generate creative offer structures using Claude
 */
export async function generateCreativeOffers(params: {
  property: any
  buyerEquity: number
  matchScore: number
}): Promise<
  Array<{
    type: string
    title: string
    reasoning: string
    structure: any
  }>
> {
  if (!anthropic) {
    return [] // Return empty, will use fallback offer generator
  }

  const { property, buyerEquity, matchScore } = params

  const prompt = `You are a creative real estate deal structuring expert. Generate innovative offer structures for a 1031 exchange property acquisition.

PROPERTY FOR SALE:
- Type: ${property.property_type}
- Location: ${property.city}, ${property.state}
- Price: $${property.estimated_value.toLocaleString()}
- Current Debt: $${property.current_debt.toLocaleString()}
- Monthly NOI: $${property.monthly_noi.toLocaleString()}
- Annual Expenses: $${property.annual_expenses.toLocaleString()}

BUYER PROFILE:
- Available Equity: $${buyerEquity.toLocaleString()}
- Match Score: ${matchScore}/100

Generate 2-3 creative offer structures beyond standard cash deals. Consider:
- Seller financing options
- Debt assumption strategies
- Lease-back arrangements
- Value-add premium pricing
- Fast close incentives
- Boot minimization tactics

Return JSON array:
[
  {
    "type": "creative_identifier",
    "title": "Catchy offer name",
    "reasoning": "Why this structure benefits both parties (2-3 sentences)",
    "structure": {
      "price": <number>,
      "downPayment": <number>,
      "closeDays": <number>,
      "uniqueTerms": "What makes this special"
    }
  }
]

Be innovative but realistic. Focus on win-win structures.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }

    return []
  } catch (error) {
    console.error('Claude API error:', error)
    return []
  }
}

/**
 * Generate boot deployment strategies using Claude
 */
export async function generateBootStrategies(params: {
  bootAmount: number
  ownerGoals: {
    stability: number
    expansion: number
    cashFlow: number
    appreciation: number
    lessManagement: number
  }
  currentProperty: any
}): Promise<
  Array<{
    strategy_type: string
    description: string
    capital_required: number
    expected_roi: number
    alignment_score: number
    implementation_steps: string[]
  }>
> {
  if (!anthropic) {
    return [] // Fallback strategies
  }

  const { bootAmount, ownerGoals, currentProperty } = params

  const prompt = `You are a 1031 exchange tax strategist. An investor has boot (taxable proceeds) from an exchange and needs strategic deployment recommendations.

BOOT AMOUNT: $${bootAmount.toLocaleString()}

INVESTOR GOALS (0-10 scale):
- Stability: ${ownerGoals.stability}/10
- Expansion: ${ownerGoals.expansion}/10
- Cash Flow: ${ownerGoals.cashFlow}/10
- Appreciation: ${ownerGoals.appreciation}/10
- Less Management: ${ownerGoals.lessManagement}/10

CURRENT PROPERTY CONTEXT:
- Type: ${currentProperty.property_type}
- Location: ${currentProperty.city}, ${currentProperty.state}

Generate 3-5 creative boot deployment strategies as JSON array:
[
  {
    "strategy_type": "performing_note" | "dst_investment" | "value_add_improvements" | "cost_segregation" | "additional_acquisition",
    "description": "Detailed explanation of this strategy (2-3 sentences)",
    "capital_required": <amount of boot to deploy>,
    "expected_roi": <expected return percentage>,
    "alignment_score": <0-100, how well this aligns with their goals>,
    "implementation_steps": ["Step 1", "Step 2", "Step 3"]
  }
]

Prioritize strategies that:
1. Align with their stated goals
2. Generate offsetting deductions where possible
3. Are realistic and actionable
4. Minimize idle capital

Be specific with numbers and timelines.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type === 'text') {
      const jsonMatch = content.text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    }

    return []
  } catch (error) {
    console.error('Claude API error:', error)
    return []
  }
}

/**
 * Fallback reasoning generator (used when Claude API not available)
 */
function generateFallbackReasoning(params: any): any {
  const { relinquishedProperty, replacementProperty, scores } = params

  const cashFlowChange = replacementProperty.annual_noi - relinquishedProperty.annual_noi
  const capRateChange =
    (replacementProperty.cap_rate || 0) - (relinquishedProperty.cap_rate || 0)
  const equityDelta = replacementProperty.equity - relinquishedProperty.equity

  let equityPosition = 'maintained'
  if (equityDelta > relinquishedProperty.equity * 0.1) {
    equityPosition = 'increased'
  } else if (equityDelta < -relinquishedProperty.equity * 0.1) {
    equityPosition = 'decreased (boot opportunity)'
  }

  const keyBenefits = []
  if (cashFlowChange > 0) {
    keyBenefits.push(`Cash flow improvement: +$${cashFlowChange.toLocaleString()}/year`)
  }
  if (capRateChange > 0.5) {
    keyBenefits.push(`Superior cap rate: ${replacementProperty.cap_rate}% vs ${relinquishedProperty.cap_rate}%`)
  }
  if (replacementProperty.property_type !== relinquishedProperty.property_type) {
    keyBenefits.push(`Asset class diversification: ${relinquishedProperty.property_type} → ${replacementProperty.property_type}`)
  }

  const why =
    scores.overall >= 80
      ? 'Strong financial alignment with excellent goal fit across all dimensions.'
      : scores.overall >= 65
        ? 'Good match with notable benefits in key areas.'
        : 'Viable opportunity with strategic advantages.'

  return {
    why,
    keyBenefits: keyBenefits.length > 0 ? keyBenefits : ['Equity match', 'Financial alignment'],
    considerations: [],
    financialImpact: {
      cashFlowChange,
      capRateChange,
      equityPosition,
    },
  }
}
