// Database types matching Supabase schema

export type PropertyType = 'multifamily' | 'retail' | 'industrial' | 'office' | 'nnn' | 'mixed-use'
export type PropertyStatus = 'active' | 'under_contract' | 'disposed' | 'archived'
export type MatchStatus = 'suggested' | 'viewed' | 'interested' | 'offer_made' | 'accepted' | 'rejected'
export type OfferStatus = 'pending' | 'countered' | 'accepted' | 'rejected' | 'expired'
export type DealStage = 'exploring' | 'disposed' | 'identifying' | 'identified' | 'acquiring' | 'closing' | 'closed' | 'boot_deployment'
export type DealStatus = 'active' | 'completed' | 'failed' | 'cancelled'

export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface Property {
  id: string
  owner_id: string

  // Property basics
  property_type: PropertyType
  address: string
  city: string
  state: string
  zip?: string

  // Financial details
  estimated_value: number
  current_debt: number
  equity: number // computed
  monthly_noi: number
  annual_expenses: number
  annual_noi: number // computed
  cap_rate?: number

  // Tax basis
  original_basis?: number
  depreciation_taken: number
  adjusted_basis?: number // computed

  // Property specifics
  door_count?: number
  square_feet?: number
  year_built?: number
  occupancy_rate?: number

  // Debt details
  debt_service?: number
  interest_rate?: number
  loan_maturity_date?: string

  // Status
  status: PropertyStatus
  listed_on_exchange: boolean
  disposition_date?: string

  created_at: string
  updated_at: string
}

export interface ReplacementCriteria {
  id: string
  owner_id: string
  property_id?: string

  // Desired properties
  desired_types: PropertyType[]
  preferred_states?: string[]
  preferred_cities?: string[]

  // Financial constraints
  min_value?: number
  max_value?: number
  min_cap_rate?: number
  max_cap_rate?: number

  // Goals (0-10 scale)
  goal_stability: number
  goal_expansion: number
  goal_cash_flow: number
  goal_appreciation: number
  goal_less_management: number

  // Timing
  timeline_urgency?: 'flexible' | 'moderate' | 'urgent'
  needs_close_by?: string

  // Requirements
  min_door_count?: number
  max_door_count?: number
  must_be_nnn: boolean

  created_at: string
  updated_at: string
}

export interface Match {
  id: string
  relinquished_property_id: string
  replacement_property_id: string

  // Scoring
  fit_score: number
  equity_match_score?: number
  cash_flow_match_score?: number
  goal_alignment_score?: number
  timing_compatibility_score?: number

  match_reasoning?: Record<string, any>

  // Boot
  estimated_cash_boot?: number
  estimated_debt_boot?: number
  estimated_total_boot?: number

  status: MatchStatus
  viewed_at?: string

  created_at: string
  updated_at: string
}

export interface Offer {
  id: string
  match_id: string
  from_user_id: string
  to_user_id: string
  property_id: string

  offer_type: 'cash_heavy' | 'debt_replace' | 'seller_carry' | 'value_arbitrage'
  price: number
  down_payment?: number
  financing_amount?: number
  seller_financing: number

  // Seller financing terms
  seller_note_term_months?: number
  seller_note_rate?: number
  seller_note_payment?: number

  close_days: number
  contingencies?: string[]

  // Calculated
  net_to_seller?: number
  estimated_closing_costs?: number
  boot_amount?: number
  tax_impact?: number

  offer_reasoning?: Record<string, any>
  interactive_terms?: Record<string, any>

  status: OfferStatus
  expires_at?: string

  created_at: string
  updated_at: string
}

export interface Deal {
  id: string
  buyer_id: string
  seller_id: string
  relinquished_property_id: string
  replacement_property_id?: string
  accepted_offer_id?: string

  // Deadlines
  disposition_date: string
  identification_deadline: string // computed: disposition_date + 45 days
  exchange_deadline: string // computed: disposition_date + 180 days

  stage: DealStage

  // Milestones
  identified_properties?: Record<string, any>
  identification_notice_signed: boolean
  identification_notice_sent_date?: string

  // Parties
  qi_name?: string
  qi_contact?: Record<string, any>
  attorney_contact?: Record<string, any>
  lender_contact?: Record<string, any>

  // Boot
  actual_cash_boot?: number
  actual_debt_boot?: number
  total_taxable_boot?: number
  boot_deployed: number
  boot_deployment_strategy?: Record<string, any>

  status: DealStatus

  created_at: string
  updated_at: string
}

export interface DealMilestone {
  id: string
  deal_id: string
  milestone_type: string
  description: string
  required: boolean
  completed: boolean
  completed_at?: string
  due_date?: string
  created_at: string
}

export interface Document {
  id: string
  deal_id: string
  document_type: string
  file_name: string
  file_url?: string
  file_data?: Record<string, any>
  generated_by: string
  signed: boolean
  signed_at?: string
  created_at: string
}

export interface BootStrategy {
  id: string
  deal_id: string
  strategy_type: string
  capital_required: number
  expected_roi?: number
  expected_yield?: number
  timeline_to_implement?: string
  alignment_score?: number
  goal_alignment?: Record<string, any>
  generates_deductions: boolean
  estimated_tax_benefit?: number
  description: string
  implementation_steps?: Record<string, any>
  status: 'recommended' | 'selected' | 'implementing' | 'completed'
  created_at: string
}

// Form types for intake
export interface PropertyIntakeForm {
  // Current property
  propertyType: PropertyType
  address: string
  city: string
  state: string
  zip?: string

  estimatedValue: number
  currentDebt: number
  monthlyNOI: number
  annualExpenses: number

  originalBasis?: number
  depreciationTaken: number

  doorCount?: number
  squareFeet?: number
  yearBuilt?: number
  occupancyRate?: number

  debtService?: number
  interestRate?: number

  // Replacement criteria
  desiredTypes: PropertyType[]
  preferredStates?: string[]
  preferredCities?: string[]

  // Goals
  goals: {
    stability: number
    expansion: number
    cashFlow: number
    appreciation: number
    lessManagement: number
  }

  // Timing
  timeline: 'flexible' | 'moderate' | 'urgent'
  needsCloseBy?: string

  // Consent
  listOnExchange: boolean
}

// AI response types
export interface MatchInsight {
  why: string
  keyBenefits: string[]
  risks?: string[]
  financialImpact: {
    cashFlowChange: number
    capRateChange: number
    equityPosition: number
  }
}

export interface OfferStructure {
  type: string
  title: string
  structure: {
    price: number
    downPayment?: number
    financing?: number
    sellerFinancing?: number
    closeDays: number
    contingencies?: string[]
  }
  sellerNet: {
    grossProceeds: number
    loanPayoff: number
    closingCosts: number
    netCash: number
    boot: number
    taxImpact?: number
  }
  reasoning: string
}
