-- 1031 Exchange Platform Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Properties table (relinquished properties - what owners are selling)
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Property basics
  property_type TEXT NOT NULL, -- 'multifamily', 'retail', 'industrial', 'office', 'nnn', 'mixed-use'
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  zip TEXT,

  -- Financial details
  estimated_value DECIMAL(12, 2) NOT NULL,
  current_debt DECIMAL(12, 2) DEFAULT 0,
  equity DECIMAL(12, 2) GENERATED ALWAYS AS (estimated_value - current_debt) STORED,
  monthly_noi DECIMAL(10, 2) NOT NULL, -- Net Operating Income
  annual_expenses DECIMAL(10, 2) NOT NULL,
  annual_noi DECIMAL(10, 2) GENERATED ALWAYS AS (monthly_noi * 12) STORED,
  cap_rate DECIMAL(5, 2), -- calculated or market

  -- Tax basis
  original_basis DECIMAL(12, 2),
  depreciation_taken DECIMAL(12, 2) DEFAULT 0,
  adjusted_basis DECIMAL(12, 2) GENERATED ALWAYS AS (original_basis - depreciation_taken) STORED,

  -- Property specifics
  door_count INT,
  square_feet INT,
  year_built INT,
  occupancy_rate DECIMAL(5, 2),

  -- Debt details
  debt_service DECIMAL(10, 2), -- monthly payment
  interest_rate DECIMAL(5, 2),
  loan_maturity_date DATE,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'under_contract', 'disposed', 'archived'
  listed_on_exchange BOOLEAN DEFAULT false,
  disposition_date DATE, -- when property sold (triggers Day 0)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Replacement criteria (what owners want to buy)
CREATE TABLE replacement_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE, -- links to relinquished property

  -- Desired property types (can have multiple)
  desired_types TEXT[] NOT NULL, -- ['multifamily', 'industrial']

  -- Geography
  preferred_states TEXT[],
  preferred_cities TEXT[],

  -- Financial constraints
  min_value DECIMAL(12, 2),
  max_value DECIMAL(12, 2),
  min_cap_rate DECIMAL(5, 2),
  max_cap_rate DECIMAL(5, 2),

  -- Goals (weighted for matching)
  goal_stability INT DEFAULT 0, -- 0-10 scale
  goal_expansion INT DEFAULT 0,
  goal_cash_flow INT DEFAULT 0,
  goal_appreciation INT DEFAULT 0,
  goal_less_management INT DEFAULT 0,

  -- Timing
  timeline_urgency TEXT, -- 'flexible', 'moderate', 'urgent'
  needs_close_by DATE,

  -- Requirements
  min_door_count INT,
  max_door_count INT,
  must_be_nnn BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches (AI-generated property matches)
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- The match pair
  relinquished_property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  replacement_property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

  -- Fit scoring (0-100)
  fit_score DECIMAL(5, 2) NOT NULL,
  equity_match_score DECIMAL(5, 2),
  cash_flow_match_score DECIMAL(5, 2),
  goal_alignment_score DECIMAL(5, 2),
  timing_compatibility_score DECIMAL(5, 2),

  -- Match insights (AI-generated reasoning)
  match_reasoning JSONB, -- stores why this is a good match

  -- Boot calculation
  estimated_cash_boot DECIMAL(12, 2),
  estimated_debt_boot DECIMAL(12, 2),
  estimated_total_boot DECIMAL(12, 2),

  -- Status
  status TEXT DEFAULT 'suggested', -- 'suggested', 'viewed', 'interested', 'offer_made', 'accepted', 'rejected'
  viewed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Prevent duplicate matches
  UNIQUE(relinquished_property_id, replacement_property_id)
);

-- Offers (auto-generated offer structures)
CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,

  -- Parties
  from_user_id UUID NOT NULL REFERENCES profiles(id),
  to_user_id UUID NOT NULL REFERENCES profiles(id),
  property_id UUID NOT NULL REFERENCES properties(id), -- property being offered on

  -- Offer structure
  offer_type TEXT NOT NULL, -- 'cash_heavy', 'debt_replace', 'seller_carry', 'value_arbitrage'
  price DECIMAL(12, 2) NOT NULL,
  down_payment DECIMAL(12, 2),
  financing_amount DECIMAL(12, 2),
  seller_financing DECIMAL(12, 2) DEFAULT 0,

  -- Seller financing terms (if applicable)
  seller_note_term_months INT,
  seller_note_rate DECIMAL(5, 2),
  seller_note_payment DECIMAL(10, 2),

  -- Timeline
  close_days INT NOT NULL,
  contingencies TEXT[],

  -- Financial summary (calculated)
  net_to_seller DECIMAL(12, 2),
  estimated_closing_costs DECIMAL(12, 2),
  boot_amount DECIMAL(12, 2),
  tax_impact DECIMAL(12, 2),

  -- Offer details
  offer_reasoning JSONB, -- AI-generated explanation
  interactive_terms JSONB, -- adjustable parameters

  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'countered', 'accepted', 'rejected', 'expired'
  expires_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deals (active exchanges in progress)
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core relationship
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  relinquished_property_id UUID NOT NULL REFERENCES properties(id),
  replacement_property_id UUID REFERENCES properties(id), -- may not be identified yet
  accepted_offer_id UUID REFERENCES offers(id),

  -- Timeline tracking (THE NUCLEAR DEADLINES)
  disposition_date DATE NOT NULL, -- Day 0 - when relinquished property closes
  identification_deadline DATE GENERATED ALWAYS AS (disposition_date + INTERVAL '45 days') STORED,
  exchange_deadline DATE GENERATED ALWAYS AS (disposition_date + INTERVAL '180 days') STORED,

  -- Current stage
  stage TEXT NOT NULL DEFAULT 'exploring',
  -- Stages: 'exploring', 'disposed', 'identifying', 'identified', 'acquiring', 'closing', 'closed', 'boot_deployment'

  -- Key milestones
  identified_properties JSONB, -- up to 3 properties formally identified
  identification_notice_signed BOOLEAN DEFAULT false,
  identification_notice_sent_date DATE,

  -- Parties involved
  qi_name TEXT, -- Qualified Intermediary
  qi_contact JSONB,
  attorney_contact JSONB,
  lender_contact JSONB,

  -- Boot tracking
  actual_cash_boot DECIMAL(12, 2),
  actual_debt_boot DECIMAL(12, 2),
  total_taxable_boot DECIMAL(12, 2),
  boot_deployed DECIMAL(12, 2) DEFAULT 0,
  boot_deployment_strategy JSONB,

  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'failed', 'cancelled'

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deal milestones (checklist items with timestamps)
CREATE TABLE deal_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  milestone_type TEXT NOT NULL,
  -- Types: 'property_listed', 'under_contract', 'disposed', 'replacement_identified',
  --        'escrow_opened', 'loan_approved', 'contingencies_removed', 'final_walkthrough', 'closed'

  description TEXT NOT NULL,
  required BOOLEAN DEFAULT false,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  due_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents (generated filings and agreements)
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  document_type TEXT NOT NULL,
  -- Types: '45_day_notice', 'exchange_agreement', 'assignment_psa', 'form_8824', 'loi', 'closing_instructions'

  file_name TEXT NOT NULL,
  file_url TEXT, -- if stored in Supabase Storage
  file_data JSONB, -- for generated docs

  generated_by TEXT DEFAULT 'system', -- 'system' or user_id
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Boot deployment strategies (AI-generated recommendations)
CREATE TABLE boot_strategies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,

  strategy_type TEXT NOT NULL,
  -- Types: 'performing_note', 'dst_investment', 'cost_segregation', 'improvements',
  --        'additional_acquisition', 'value_add'

  capital_required DECIMAL(12, 2) NOT NULL,
  expected_roi DECIMAL(5, 2),
  expected_yield DECIMAL(5, 2),
  timeline_to_implement TEXT,

  -- Goal alignment (how well does this match owner's goals)
  alignment_score DECIMAL(5, 2),
  goal_alignment JSONB,

  -- Tax implications
  generates_deductions BOOLEAN DEFAULT false,
  estimated_tax_benefit DECIMAL(12, 2),

  description TEXT NOT NULL,
  implementation_steps JSONB,

  -- Status
  status TEXT DEFAULT 'recommended', -- 'recommended', 'selected', 'implementing', 'completed'

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity log (audit trail)
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  deal_id UUID REFERENCES deals(id),
  property_id UUID REFERENCES properties(id),

  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_properties_owner ON properties(owner_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_listed ON properties(listed_on_exchange);
CREATE INDEX idx_matches_relinquished ON matches(relinquished_property_id);
CREATE INDEX idx_matches_replacement ON matches(replacement_property_id);
CREATE INDEX idx_matches_score ON matches(fit_score DESC);
CREATE INDEX idx_offers_match ON offers(match_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_deals_buyer ON deals(buyer_id);
CREATE INDEX idx_deals_seller ON deals(seller_id);
CREATE INDEX idx_deals_stage ON deals(stage);
CREATE INDEX idx_deal_milestones_deal ON deal_milestones(deal_id);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE replacement_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE boot_strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies: Users can read their own data
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: Properties
CREATE POLICY "Users can view own properties" ON properties FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can view listed properties" ON properties FOR SELECT USING (listed_on_exchange = true);
CREATE POLICY "Users can insert own properties" ON properties FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own properties" ON properties FOR UPDATE USING (auth.uid() = owner_id);

-- Policies: Matches (users can see matches for their properties)
CREATE POLICY "Users can view matches for their properties" ON matches FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM properties p
      WHERE (p.id = matches.relinquished_property_id OR p.id = matches.replacement_property_id)
      AND p.owner_id = auth.uid()
    )
  );

-- Policies: Offers (users can see offers they made or received)
CREATE POLICY "Users can view relevant offers" ON offers FOR SELECT
  USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);
CREATE POLICY "Users can create offers" ON offers FOR INSERT WITH CHECK (auth.uid() = from_user_id);
CREATE POLICY "Users can update own offers" ON offers FOR UPDATE USING (auth.uid() = from_user_id);

-- Policies: Deals (users can see deals they're part of)
CREATE POLICY "Users can view their deals" ON deals FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);
CREATE POLICY "Users can update their deals" ON deals FOR UPDATE
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- Functions for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_replacement_criteria_updated_at BEFORE UPDATE ON replacement_criteria FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON offers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
