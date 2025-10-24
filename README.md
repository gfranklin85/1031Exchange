# 1031 Exchange Platform

AI-powered property exchange matching platform that finds opportunities traditional brokers miss. Built with Next.js, Supabase, and intelligent matching algorithms.

## 🎯 What We Built

### The Core Exchange Platform (Software Only)

This platform solves the 1031 exchange matching problem through AI-powered bidirectional inventory generation. Every property submission creates BOTH supply (what they're selling) and demand (what they're buying), populating the marketplace from both sides simultaneously.

## 🚀 Key Features

### 1. Playground Intake
- **Conversational 7-step questionnaire** captures everything needed:
  - Current property details (type, location, value, debt, NOI, expenses)
  - Tax basis information (original purchase price, depreciation taken)
  - Replacement property criteria (desired types, locations, financial constraints)
  - Exchange goals (stability, expansion, cash flow, appreciation, management burden)
  - Timeline urgency (flexible, moderate, urgent)
- **Zero jargon** - all translation built-in
- **5-minute completion** time
- Natural language → structured exchange profile

### 2. AI Matching Engine
Multi-dimensional fit scoring that discovers non-obvious opportunities:

**What AI Finds That Humans Miss:**
- **Cross-asset-class swaps**: Apartments → Industrial, Retail → NNN
- **Geographic arbitrage**: High-cost markets → tax-advantaged states
- **Debt structure optimization**: Expensive loans → assumable low-rate financing
- **Timing synergies**: Multi-party exchanges where deadlines align perfectly
- **Boot deployment combos**: Replacement property + performing note acquisition

**Scoring Algorithm:**
- Equity match (30% weight): Minimizes boot to manage
- Cash flow improvement (25% weight): NOI comparison and cap rate delta
- Goal alignment (35% weight): Matches stated objectives (stability, expansion, etc.)
- Timing compatibility (10% weight): Can the deal close in required timeframe?

**Result:** 3-7 instant matches with fit scores (0-100) and full reasoning.

### 3. Automated Offer Generation
System automatically creates multiple offer structures for each match:

**Offer Types:**
1. **Cash-Heavy Fast Close**: 30% down, 21-day close, minimal contingencies
2. **Debt-Replace Exact**: Matches debt precisely to eliminate boot entirely
3. **Seller-Carry Enhanced Net**: Premium price + seller financing = higher total net through interest income
4. **Value Arbitrage**: Buyer pays premium for operational upside they can capture

**Each Offer Includes:**
- Full financial breakdown (price, down payment, financing, seller carry)
- Net to seller calculation (after loan payoff and closing costs)
- Boot amount (cash boot + debt boot)
- Tax impact estimation (capital gains, depreciation recapture)
- AI-generated reasoning (why this structure makes sense)
- Interactive terms (adjust price, close days, financing in real-time)

### 4. Income-Focused Valuation
**This is critical:** All valuations use the income approach, not comps.

**Formula:** `Value = NOI / Cap Rate`

**Why this matters:**
- No arguments about Zillow estimates or comparable sales
- Pure math based on cash flow generation
- Low expenses become a SELLING POINT (operational upside for buyer)
- High NOI commands premium automatically
- Eliminates emotional pricing

## 📊 Database Schema

Comprehensive schema supporting full transaction lifecycle:

### Core Tables
- **Properties**: Relinquished properties (what owners are selling)
- **Replacement Criteria**: What owners want to buy (creates demand pool)
- **Matches**: AI-generated property pairings with fit scores
- **Offers**: Auto-generated offer structures with interactive terms
- **Deals**: Active exchanges in progress
- **Deal Milestones**: Checklist tracking (45/180 day deadlines)
- **Documents**: Auto-generated filings (45-day notices, Form 8824, LOIs)
- **Boot Strategies**: AI-recommended capital deployment paths

### Key Features
- **Row-Level Security (RLS)**: Multi-tenant data protection
- **Computed columns**: Equity, annual NOI, adjusted basis calculated automatically
- **JSONB fields**: Flexible storage for match reasoning, offer terms, strategy details
- **Timeline enforcement**: 45/180 day deadlines baked into schema with generated columns

## 🧠 How The Intelligence Works

### Bidirectional Inventory Generation
Every questionnaire submission creates:
1. **Supply**: Their relinquished property → matched against others' replacement criteria
2. **Demand**: Their replacement criteria → matched against others' relinquished properties

**Result:** With just 10 submissions, you have 10 properties FOR SALE and 10 sets of BUYER CRITERIA in the system. This solves the cold start problem.

### Match Discovery Examples

**Scenario 1: Geographic Arbitrage**
- Owner has: Fresno 12-plex, $800K, 5.2% cap, high management burden
- AI finds: Boise duplex, $820K, 6.8% cap, NNN lease (tenants pay everything)
- Human broker never suggests (different state, different door count)
- AI sees: Equity match + goal alignment (owner wanted "less hassle") + superior yield

**Scenario 2: Debt Optimization**
- Owner has: Visalia 6-plex, $650K, $200K debt at 7.5%
- AI finds: Clovis 4-plex, $680K, assumable FHA loan at 3.2%
- Human focuses on door count mismatch
- AI sees: $900/month cash flow improvement from interest savings alone

**Scenario 3: Boot Deployment**
- Owner selling $1.5M property, buying $1.3M replacement → $200K boot
- AI finds: Performing note at 9% yield from another exchange participant
- Boot deployed into income-generating asset instead of sitting idle or paying taxes

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** (App Router)
- **TypeScript** (full type safety)
- **Tailwind CSS** (utility-first styling)
- **Framer Motion** (smooth animations)

### Backend
- **Next.js API Routes** (serverless functions)
- **Supabase** (PostgreSQL database with real-time subscriptions)
- **Server Actions** (form submissions)

### AI/Matching
- Custom TypeScript matching engine (multi-dimensional fit scoring)
- Income-based valuation algorithms
- Boot calculation logic
- Tax impact estimation

### Planned Integrations
- **Claude API** (natural language offer generation and boot strategy recommendations)
- **Vapi Web SDK** (voice intake capability)
- **DocuSign/HelloSign** (eSignature for documents)
- **Major QI APIs** (IPX1031, Asset Preservation, Accruit)

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works fine)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/gfranklin85/1031Exchange.git
cd 1031Exchange
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**

Create a new Supabase project at https://supabase.com

Run the schema SQL:
```bash
# Copy the SQL from lib/supabase/schema.sql
# Paste into Supabase SQL Editor
# Execute to create all tables, indexes, RLS policies, and functions
```

4. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional (for future features)
ANTHROPIC_API_KEY=your_anthropic_api_key
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_vapi_public_key
VAPI_PRIVATE_KEY=your_vapi_private_key
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open http://localhost:3000**

## 📖 User Flow

### For Property Owners

1. **Visit `/intake`** - Start the 5-minute questionnaire
2. **Answer 7 steps:**
   - Property type (multifamily, retail, industrial, office, NNN, mixed-use)
   - Location (address, city, state)
   - Financials (value, debt, NOI, expenses, door count)
   - Tax basis (optional but recommended for accurate tax impact)
   - Replacement criteria (what you'd trade FOR)
   - Goals (stability, expansion, cash flow, appreciation, management)
   - Review and consent to list on exchange

3. **Submit** - AI instantly analyzes and generates matches
4. **View matches** - See 3-7 potential swaps with fit scores and financial breakdowns
5. **Generate offers** - Click to receive automated offer structures
6. **Review offers** - Interactive terms let you adjust price, close timeline, seller financing
7. **Accept/counter** - Negotiate in-platform or take offline to close

### What Happens Behind The Scenes

1. **Property created** in database with full financial profile
2. **Replacement criteria saved** creating demand in the marketplace
3. **AI matching runs** across all available properties (forward and reverse)
4. **Matches saved** with fit scores and reasoning
5. **Offers auto-generated** when user clicks "Generate Offers"
6. **Email notifications sent** to property owners when new matches appear

## 🧪 Testing Locally

Since this is a marketplace (requires multiple participants), you can test with seed data:

1. **Create seed properties** (add to Supabase directly or via API):
```sql
-- Example: Create some test properties
INSERT INTO profiles (id, email) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'test1@example.com'),
  ('550e8400-e29b-41d4-a716-446655440001', 'test2@example.com');

INSERT INTO properties (owner_id, property_type, address, city, state, estimated_value, current_debt, monthly_noi, annual_expenses, listed_on_exchange) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'multifamily', '123 Main St', 'Fresno', 'CA', 1700000, 420000, 8500, 48000, true),
  ('550e8400-e29b-41d4-a716-446655440001', 'industrial', '456 Oak Ave', 'Boise', 'ID', 820000, 200000, 5500, 22000, true);
```

2. **Submit intake form** - Will find matches against seed properties
3. **Generate offers** - Will create offer structures based on financial profiles

## 📁 Project Structure

```
1031Exchange/
├── app/
│   ├── api/
│   │   ├── intake/submit/        # Property submission endpoint
│   │   ├── matches/[propertyId]/ # Fetch matches for a property
│   │   ├── offers/generate/      # Auto-generate offer structures
│   │   └── properties/[id]/      # Fetch single property
│   ├── intake/                   # Questionnaire page
│   ├── matches/[propertyId]/     # Match results display
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Landing page
│   └── globals.css               # Global styles
├── components/
│   └── intake/
│       └── PlaygroundIntake.tsx  # 7-step questionnaire component
├── lib/
│   ├── ai/
│   │   ├── matching-engine.ts    # Multi-dimensional fit scoring
│   │   └── offer-generator.ts    # Automated offer creation
│   ├── supabase/
│   │   ├── client.ts             # Supabase client setup
│   │   ├── middleware.ts         # Auth middleware
│   │   └── schema.sql            # Database schema
│   └── types/
│       └── database.types.ts     # TypeScript types
├── .env.example                  # Environment variables template
├── package.json                  # Dependencies
├── tailwind.config.ts            # Tailwind configuration
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 Design Principles

1. **Income-First Valuation**: All property values calculated from NOI and cap rates, not comps
2. **AI Finds Non-Obvious**: System discovers matches humans would never suggest
3. **Bidirectional Inventory**: Every submission creates supply AND demand simultaneously
4. **Instant Gratification**: Matches appear in seconds, not days/weeks
5. **Interactive Terms**: Adjust offers in real-time to see financial impact
6. **Tax Transparency**: Boot calculations and tax impact shown upfront
7. **Zero Jargon**: Complex 1031 rules translated into plain English

## 🚧 What's Not Built Yet (Next Phase)

- **Exchange Board**: Live NYSE-style interface showing active demand
- **Deal Rooms**: Transaction workspaces with 45/180 day countdown timers
- **Boot Strategy Calculator**: AI-recommended deployment paths (performing notes, DST, cost seg, improvements)
- **Document Generation**: Auto-create 45-day identification notices, Form 8824 data, LOIs, exchange agreements
- **QI Integration**: Connect to qualified intermediaries for fund transfers
- **Payment Processing**: Stripe for success fees (1-2% per side)
- **Voice Intake**: Vapi integration for conversational questionnaire
- **Mobile App**: Native iOS/Android for on-the-go deal tracking

## 💡 Key Innovations

### 1. Bidirectional Marketplace
Traditional model: List property, wait for buyers
Our model: Every submission creates listing AND buyer profile simultaneously

### 2. AI Match Discovery
Traditional: Broker searches MLS for "similar" properties
Our AI: Finds cross-asset-class swaps, geographic arbitrage, debt optimizations, timing synergies

### 3. Automated Offers
Traditional: Wait days for buyer to submit offer
Our system: 3-5 complete offer structures generated instantly with interactive terms

### 4. Income-Based Valuation
Traditional: Arguments about comps and appraisals
Our approach: Pure math (NOI / Cap Rate = Value), no negotiation about methodology

### 5. Boot as Feature, Not Bug
Traditional: Boot is tax liability to minimize
Our approach: Boot = capital to deploy strategically (performing notes, value-add, expansion)

## 📈 Revenue Model

**Success Fee Structure:**
- 1-2% per side on closed exchanges
- No subscription fees until proof of concept
- Volume pricing for repeat users

**Why This Works:**
- Only pay on successful close (aligned incentives)
- Significantly cheaper than traditional broker commissions (4-6%)
- Platform provides value humans can't deliver (AI matching, instant offers, boot optimization)

## 🔒 Security & Privacy

- **Row-Level Security (RLS)**: Users can only access their own properties and deals
- **Anonymous Listings**: Properties visible but owner identity protected until mutual interest
- **Encrypted Data**: All sensitive information encrypted at rest and in transit
- **Audit Trail**: Activity log tracks all actions for compliance

## 🙏 Acknowledgments

Built with Claude Code - AI-powered development assistant that helped architect and implement this platform.

---

**Ready to revolutionize 1031 exchanges?** Start with `npm run dev` and submit your first property at `/intake`.
