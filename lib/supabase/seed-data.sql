-- Seed data for testing the 1031 Exchange Platform
-- Run this AFTER running schema.sql

-- Step 1: Create test user profiles
-- Note: In production, these would be created via Supabase Auth
-- For testing, we're creating them directly

INSERT INTO profiles (id, email, full_name, created_at, updated_at) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test1@example.com', 'John Property Owner', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440001', 'test2@example.com', 'Jane Investor', NOW(), NOW()),
  ('550e8400-e29b-41d4-a716-446655440002', 'test3@example.com', 'Bob Developer', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create test properties

-- Property 1: Fresno Multifamily (12-plex)
INSERT INTO properties (
  id,
  owner_id,
  property_type,
  address,
  city,
  state,
  zip,
  estimated_value,
  current_debt,
  monthly_noi,
  annual_expenses,
  cap_rate,
  original_basis,
  depreciation_taken,
  door_count,
  square_feet,
  year_built,
  occupancy_rate,
  listed_on_exchange,
  status
) VALUES (
  '660e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  'multifamily',
  '123 Main Street',
  'Fresno',
  'CA',
  '93721',
  1700000,
  420000,
  8500,
  48000,
  6.0,
  600000,
  180000,
  12,
  9600,
  1995,
  92.0,
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Property 2: Boise Industrial Warehouse
INSERT INTO properties (
  id,
  owner_id,
  property_type,
  address,
  city,
  state,
  zip,
  estimated_value,
  current_debt,
  monthly_noi,
  annual_expenses,
  cap_rate,
  original_basis,
  depreciation_taken,
  square_feet,
  year_built,
  occupancy_rate,
  listed_on_exchange,
  status
) VALUES (
  '660e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  'industrial',
  '456 Oak Avenue',
  'Boise',
  'ID',
  '83702',
  820000,
  200000,
  5500,
  22000,
  8.0,
  400000,
  120000,
  25000,
  2010,
  100.0,
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Property 3: Phoenix NNN Retail
INSERT INTO properties (
  id,
  owner_id,
  property_type,
  address,
  city,
  state,
  zip,
  estimated_value,
  current_debt,
  monthly_noi,
  annual_expenses,
  cap_rate,
  original_basis,
  depreciation_taken,
  square_feet,
  year_built,
  occupancy_rate,
  listed_on_exchange,
  status
) VALUES (
  '660e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  'nnn',
  '789 Desert Road',
  'Phoenix',
  'AZ',
  '85001',
  1850000,
  500000,
  9200,
  18000,
  6.0,
  950000,
  250000,
  12000,
  2015,
  100.0,
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Property 4: Sacramento Office Building
INSERT INTO properties (
  id,
  owner_id,
  property_type,
  address,
  city,
  state,
  zip,
  estimated_value,
  current_debt,
  monthly_noi,
  annual_expenses,
  cap_rate,
  original_basis,
  depreciation_taken,
  square_feet,
  year_built,
  occupancy_rate,
  listed_on_exchange,
  status
) VALUES (
  '660e8400-e29b-41d4-a716-446655440003',
  '550e8400-e29b-41d4-a716-446655440001',
  'office',
  '321 Capitol Boulevard',
  'Sacramento',
  'CA',
  '94203',
  2200000,
  800000,
  11000,
  55000,
  6.0,
  1200000,
  300000,
  18000,
  2005,
  88.0,
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Property 5: Austin Mixed-Use
INSERT INTO properties (
  id,
  owner_id,
  property_type,
  address,
  city,
  state,
  zip,
  estimated_value,
  current_debt,
  monthly_noi,
  annual_expenses,
  cap_rate,
  original_basis,
  depreciation_taken,
  door_count,
  square_feet,
  year_built,
  occupancy_rate,
  listed_on_exchange,
  status
) VALUES (
  '660e8400-e29b-41d4-a716-446655440004',
  '550e8400-e29b-41d4-a716-446655440002',
  'mixed-use',
  '555 Congress Avenue',
  'Austin',
  'TX',
  '78701',
  3200000,
  1200000,
  16000,
  72000,
  6.0,
  1800000,
  400000,
  8,
  22000,
  2018,
  95.0,
  true,
  'active'
) ON CONFLICT (id) DO NOTHING;

-- Step 3: Create replacement criteria for test users

-- User 1 wants to trade Fresno multifamily for NNN or Industrial
INSERT INTO replacement_criteria (
  id,
  owner_id,
  property_id,
  desired_types,
  preferred_states,
  min_cap_rate,
  goal_stability,
  goal_expansion,
  goal_cash_flow,
  goal_appreciation,
  goal_less_management,
  timeline_urgency
) VALUES (
  '770e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440000',
  ARRAY['nnn', 'industrial'],
  ARRAY['ID', 'NV', 'TX', 'AZ'],
  5.5,
  9,  -- Very high stability goal
  3,  -- Low expansion goal
  7,  -- Good cash flow goal
  4,  -- Low appreciation goal
  10, -- Maximum less management goal (wants NNN)
  'moderate'
) ON CONFLICT (id) DO NOTHING;

-- User 2 wants to trade Industrial for multifamily or mixed-use
INSERT INTO replacement_criteria (
  id,
  owner_id,
  property_id,
  desired_types,
  preferred_states,
  goal_stability,
  goal_expansion,
  goal_cash_flow,
  goal_appreciation,
  goal_less_management,
  timeline_urgency
) VALUES (
  '770e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440001',
  ARRAY['multifamily', 'mixed-use'],
  ARRAY['CA', 'TX', 'AZ'],
  5,
  8,  -- High expansion goal (wants more units)
  8,  -- High cash flow goal
  6,  -- Moderate appreciation
  3,  -- Doesn't mind management
  'flexible'
) ON CONFLICT (id) DO NOTHING;

-- User 3 wants to trade NNN for multifamily
INSERT INTO replacement_criteria (
  id,
  owner_id,
  property_id,
  desired_types,
  preferred_states,
  goal_stability,
  goal_expansion,
  goal_cash_flow,
  goal_appreciation,
  goal_less_management,
  timeline_urgency
) VALUES (
  '770e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440002',
  ARRAY['multifamily', 'office'],
  ARRAY['CA', 'TX', 'WA', 'OR'],
  6,
  9,  -- High expansion goal
  9,  -- High cash flow goal
  7,  -- Good appreciation goal
  4,  -- Willing to manage
  'urgent'
) ON CONFLICT (id) DO NOTHING;

-- Verify data was inserted
SELECT
  'Properties inserted:' as info,
  COUNT(*) as count
FROM properties;

SELECT
  'Replacement criteria inserted:' as info,
  COUNT(*) as count
FROM replacement_criteria;

-- Show summary of what we have
SELECT
  p.property_type,
  p.city,
  p.state,
  p.estimated_value,
  p.monthly_noi,
  p.listed_on_exchange
FROM properties p
WHERE p.listed_on_exchange = true
ORDER BY p.property_type, p.city;
