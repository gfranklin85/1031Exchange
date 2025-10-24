import type { Property, Match, OfferStructure } from '@/lib/types/database.types'
import { generateCreativeOffers, isClaudeAvailable } from './claude-client'

interface OfferGenerationParams {
  property: Property
  buyerEquity: number
  match: Match
  marketData?: {
    avgClosingCostPercent: number
    marketCapRate: number
  }
}

/**
 * Generate multiple offer structures automatically
 * Each offer is a complete financial package
 * Uses Claude API for creative offers if available
 */
export async function generateOffers(params: OfferGenerationParams): Promise<OfferStructure[]> {
  const { property, buyerEquity, match, marketData } = params

  const closingCostPercent = marketData?.avgClosingCostPercent || 0.02 // 2% default
  const offers: OfferStructure[] = []

  // Offer 1: Cash-Heavy Fast Close
  const cashHeavyOffer = generateCashHeavyOffer(property, buyerEquity, closingCostPercent)
  if (cashHeavyOffer) offers.push(cashHeavyOffer)

  // Offer 2: Debt-Replace Exact (Zero Boot)
  const debtReplaceOffer = generateDebtReplaceOffer(property, buyerEquity, closingCostPercent)
  if (debtReplaceOffer) offers.push(debtReplaceOffer)

  // Offer 3: Seller-Carry Enhanced Net
  const sellerCarryOffer = generateSellerCarryOffer(property, buyerEquity, closingCostPercent)
  if (sellerCarryOffer) offers.push(sellerCarryOffer)

  // Offer 4: Value Arbitrage (if property has operational upside)
  const valueArbitrageOffer = generateValueArbitrageOffer(property, buyerEquity, closingCostPercent, match)
  if (valueArbitrageOffer) offers.push(valueArbitrageOffer)

  // Offer 5+: Claude-generated creative structures (if API available)
  if (isClaudeAvailable() && match) {
    try {
      const creativeOffers = await generateCreativeOffers({
        property,
        buyerEquity,
        matchScore: match.fit_score || 75,
      })

      // Convert Claude's creative offers to our format
      for (const creativeOffer of creativeOffers) {
        offers.push({
          type: creativeOffer.type,
          title: creativeOffer.title,
          structure: {
            price: creativeOffer.structure.price,
            downPayment: creativeOffer.structure.downPayment,
            financing: creativeOffer.structure.price - creativeOffer.structure.downPayment,
            closeDays: creativeOffer.structure.closeDays,
            contingencies: [creativeOffer.structure.uniqueTerms],
          },
          sellerNet: {
            grossProceeds: creativeOffer.structure.price,
            loanPayoff: property.current_debt,
            closingCosts: creativeOffer.structure.price * closingCostPercent,
            netCash:
              creativeOffer.structure.price -
              property.current_debt -
              creativeOffer.structure.price * closingCostPercent,
            boot: 0,
          },
          reasoning: creativeOffer.reasoning,
        })
      }
    } catch (error) {
      console.error('Claude creative offers failed:', error)
      // Continue with standard offers
    }
  }

  return offers
}

/**
 * Offer Structure 1: Cash-Heavy Fast Close
 * Maximum cash down, minimal financing, fast timeline
 */
function generateCashHeavyOffer(
  property: Property,
  buyerEquity: number,
  closingCostPercent: number
): OfferStructure | null {
  const price = property.estimated_value
  const downPaymentPercent = 0.3 // 30% down
  const downPayment = price * downPaymentPercent
  const financing = price - downPayment

  // Can buyer afford this?
  if (downPayment > buyerEquity * 1.1) return null

  const closingCosts = price * closingCostPercent
  const loanPayoff = property.current_debt
  const netCash = price - loanPayoff - closingCosts
  const boot = 0 // Assuming equal-or-up exchange

  return {
    type: 'cash_heavy',
    title: 'Cash-Heavy Fast Close',
    structure: {
      price,
      downPayment,
      financing,
      closeDays: 21,
      contingencies: ['inspection only'],
    },
    sellerNet: {
      grossProceeds: price,
      loanPayoff,
      closingCosts,
      netCash,
      boot,
      taxImpact: 0, // Deferred via 1031
    },
    reasoning:
      'Strong cash position enables rapid closing. Minimal contingencies reduce execution risk. Perfect for sellers with tight 45-day identification window.',
  }
}

/**
 * Offer Structure 2: Debt-Replace Exact (Zero Boot)
 * Matches debt exactly to minimize taxable boot
 */
function generateDebtReplaceOffer(
  property: Property,
  buyerEquity: number,
  closingCostPercent: number
): OfferStructure | null {
  const price = property.estimated_value
  const debtToMatch = property.current_debt
  const cashToSeller = price - debtToMatch

  // Can buyer afford the cash portion?
  if (cashToSeller > buyerEquity * 1.1) return null

  const closingCosts = price * closingCostPercent
  const netCash = price - debtToMatch - closingCosts
  const boot = 0 // Debt exactly replaced

  return {
    type: 'debt_replace',
    title: 'Debt-Replace Exact (Zero Boot)',
    structure: {
      price,
      downPayment: cashToSeller,
      financing: debtToMatch,
      closeDays: 30,
      contingencies: ['inspection', 'financing'],
    },
    sellerNet: {
      grossProceeds: price,
      loanPayoff: debtToMatch,
      closingCosts,
      netCash,
      boot: 0,
      taxImpact: 0,
    },
    reasoning:
      'Debt-for-debt replacement eliminates boot entirely. Clean 1031 structure maximizes tax deferral. Ideal for sellers prioritizing tax efficiency over speed.',
  }
}

/**
 * Offer Structure 3: Seller-Carry Enhanced Net
 * Seller financing creates higher total net through interest income
 */
function generateSellerCarryOffer(
  property: Property,
  buyerEquity: number,
  closingCostPercent: number
): OfferStructure | null {
  const price = property.estimated_value * 1.03 // 3% premium for seller carry
  const downPaymentPercent = 0.5 // 50% down
  const downPayment = price * downPaymentPercent
  const sellerFinancing = price - downPayment

  // Can buyer afford 50% down?
  if (downPayment > buyerEquity * 1.2) return null

  const noteTermMonths = 120 // 10 years
  const noteRate = 0.075 // 7.5%
  const monthlyPayment = calculateLoanPayment(sellerFinancing, noteRate, noteTermMonths)
  const totalInterest = monthlyPayment * noteTermMonths - sellerFinancing

  const closingCosts = price * closingCostPercent
  const loanPayoff = property.current_debt
  const immediateNet = downPayment - loanPayoff - closingCosts
  const totalNet = immediateNet + (monthlyPayment * noteTermMonths)

  return {
    type: 'seller_carry',
    title: 'Seller-Carry Enhanced Net',
    structure: {
      price,
      downPayment,
      financing: 0,
      sellerFinancing,
      closeDays: 14,
      contingencies: ['inspection'],
    },
    sellerNet: {
      grossProceeds: price,
      loanPayoff,
      closingCosts,
      netCash: immediateNet,
      boot: 0,
      taxImpact: totalInterest, // Note: seller financing has different 1031 treatment
    },
    reasoning: `Convert equity to passive income stream. Earn $${totalInterest.toLocaleString()} in interest over ${noteTermMonths / 12} years. Monthly income: $${Math.round(monthlyPayment).toLocaleString()}. Note: Seller financing may require installment sale treatment (consult CPA).`,
  }
}

/**
 * Offer Structure 4: Value Arbitrage
 * Premium price justified by operational upside buyer can capture
 */
function generateValueArbitrageOffer(
  property: Property,
  buyerEquity: number,
  closingCostPercent: number,
  match: Match
): OfferStructure | null {
  // Only generate this offer if property has upside potential
  const expenseRatio = property.annual_expenses / (property.annual_noi + property.annual_expenses)
  const lowExpenses = expenseRatio < 0.35
  const lowOccupancy = (property.occupancy_rate || 100) < 85
  const hasUpside = lowExpenses || lowOccupancy

  if (!hasUpside) return null

  const premium = property.estimated_value * 0.06 // 6% premium
  const price = property.estimated_value + premium
  const downPayment = price * 0.3
  const financing = price - downPayment

  if (downPayment > buyerEquity * 1.1) return null

  const closingCosts = price * closingCostPercent
  const loanPayoff = property.current_debt
  const netCash = price - loanPayoff - closingCosts

  let upsideExplanation = ''
  if (lowExpenses) {
    upsideExplanation =
      'Low expense ratio indicates operational efficiency. Buyer can raise rents without increasing expenses, capturing pure profit margin.'
  } else if (lowOccupancy) {
    const occupancyUpside = (100 - (property.occupancy_rate || 100)) * 0.01
    const noiUpside = property.annual_noi * occupancyUpside
    upsideExplanation = `${Math.round(100 - (property.occupancy_rate || 100))}% vacancy represents $${Math.round(noiUpside).toLocaleString()} annual NOI upside at full occupancy.`
  }

  return {
    type: 'value_arbitrage',
    title: 'Value Arbitrage Play',
    structure: {
      price,
      downPayment,
      financing,
      closeDays: 45,
      contingencies: ['inspection', 'financing', 'buyer provides repositioning plan'],
    },
    sellerNet: {
      grossProceeds: price,
      loanPayoff,
      closingCosts,
      netCash,
      boot: 0,
      taxImpact: 0,
    },
    reasoning: `Premium price justified by operational upside. ${upsideExplanation} Buyer willing to pay for inefficiency they can fix.`,
  }
}

/**
 * Calculate monthly loan payment
 */
function calculateLoanPayment(principal: number, annualRate: number, months: number): number {
  const monthlyRate = annualRate / 12
  if (monthlyRate === 0) return principal / months
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
}

/**
 * Calculate tax impact of a sale/exchange
 */
export function calculateTaxImpact(
  property: Property,
  salePrice: number,
  bootAmount: number
): {
  capitalGain: number
  depreciationRecapture: number
  totalTax: number
} {
  const adjustedBasis = (property.original_basis || property.estimated_value) - property.depreciation_taken

  // Capital gain = sale price - adjusted basis
  const capitalGain = Math.max(0, salePrice - adjustedBasis)

  // Depreciation recapture taxed at 25%
  const depreciationRecapture = property.depreciation_taken * 0.25

  // Long-term capital gains taxed at 15-20% (using 15% for simplicity)
  const capitalGainsTax = (capitalGain - property.depreciation_taken) * 0.15

  // If boot exists, tax is calculated on boot amount (not full gain)
  const taxableAmount = bootAmount > 0 ? Math.min(bootAmount, capitalGain) : capitalGain
  const totalTax = bootAmount > 0
    ? taxableAmount * 0.15 + (Math.min(bootAmount, property.depreciation_taken) * 0.25)
    : capitalGainsTax + depreciationRecapture

  return {
    capitalGain,
    depreciationRecapture,
    totalTax: Math.round(totalTax),
  }
}

/**
 * Adjust offer terms interactively
 * Returns updated offer with recalculated financials
 */
export function adjustOfferTerms(
  offer: OfferStructure,
  property: Property,
  adjustments: {
    price?: number
    downPayment?: number
    closeDays?: number
    sellerFinancing?: number
  }
): OfferStructure {
  const newPrice = adjustments.price || offer.structure.price
  const newDownPayment = adjustments.downPayment || offer.structure.downPayment || 0
  const newCloseDays = adjustments.closeDays || offer.structure.closeDays
  const newSellerFinancing = adjustments.sellerFinancing || offer.structure.sellerFinancing || 0

  const newFinancing = newPrice - newDownPayment - newSellerFinancing
  const closingCosts = newPrice * 0.02

  let sellerNet = {
    grossProceeds: newPrice,
    loanPayoff: property.current_debt,
    closingCosts,
    netCash: newPrice - property.current_debt - closingCosts,
    boot: 0,
    taxImpact: 0,
  }

  // Recalculate seller financing income if applicable
  if (newSellerFinancing > 0) {
    const monthlyPayment = calculateLoanPayment(newSellerFinancing, 0.075, 120)
    const totalIncome = monthlyPayment * 120
    sellerNet.netCash = newDownPayment - property.current_debt - closingCosts
    sellerNet.taxImpact = totalIncome - newSellerFinancing // Interest income
  }

  return {
    ...offer,
    structure: {
      ...offer.structure,
      price: newPrice,
      downPayment: newDownPayment,
      financing: newFinancing,
      closeDays: newCloseDays,
      sellerFinancing: newSellerFinancing,
    },
    sellerNet,
  }
}
