# Claude API Integration Guide

The 1031 Exchange Platform uses **Claude AI** to power intelligent match reasoning, creative offer generation, and boot deployment strategies. This integration makes the platform truly "intelligent" rather than just rule-based.

## 🤖 What Claude Powers

### 1. Enhanced Match Reasoning
Instead of generic rule-based explanations, Claude generates:
- **Natural language insights** explaining why matches are strong
- **Non-obvious opportunities** (asset class arbitrage, debt optimization, geographic benefits)
- **Goal-aligned recommendations** specific to the investor's stated objectives
- **Financial impact analysis** with specific numbers and projections

**Example Without Claude** (rule-based):
> "Strong financial alignment with excellent goal fit across all dimensions."

**Example With Claude** (AI-powered):
> "This swap delivers the stability you're seeking through a triple-net structure, eliminating 90% of management burden while improving cash flow by $18K annually. The Phoenix market offers 30% lower property taxes than California, adding $12K/year to your net. Buyer's assumable 3.2% loan saves you $900/month vs current 7.5% financing."

### 2. Creative Offer Structures
Beyond standard offers (cash, debt-replace, seller-carry), Claude generates:
- **Innovative deal structures** based on property characteristics
- **Lease-back arrangements** for sellers needing transition time
- **Hybrid financing** combining multiple capital sources
- **Value-sharing mechanisms** aligning buyer/seller interests

**Standard Offers (Always Generated)**:
1. Cash-Heavy Fast Close
2. Debt-Replace Exact (Zero Boot)
3. Seller-Carry Enhanced Net
4. Value Arbitrage

**Claude-Generated Offers** (Additional 2-3):
5. "Graduate Lease-Back" - Seller becomes tenant for 6 months, buyer pays premium
6. "Deferred Close with Rent Credit" - Delays exchange deadline, credits rent to purchase
7. "Performance Earnout" - Price adjusts based on NOI during due diligence

### 3. Boot Deployment Strategies
When exchanges generate boot (taxable proceeds), Claude recommends:
- **Goal-aligned strategies** matching investor objectives
- **Tax-efficient structures** generating offsetting deductions
- **Specific implementation steps** with timelines and capital requirements
- **ROI projections** for each strategy

**Examples**:
- **Performing Note Acquisition**: Deploy $200K boot into 9% yielding note, passive income, zero management
- **Cost Segregation Study**: $15K investment accelerates $180K depreciation to offset boot tax
- **DST Investment**: $150K into institutional-grade property, complete passivity
- **Value-Add Improvements**: Deploy into property upgrades generating higher NOI

## 🔑 Getting Your Claude API Key

### Step 1: Sign Up for Anthropic

1. Go to **https://console.anthropic.com**
2. Sign up or log in
3. You'll get **$5 free credits** to start (enough for ~50K matches)

### Step 2: Create API Key

1. Navigate to **"API Keys"** in left sidebar
2. Click **"Create Key"**
3. Give it a name: `1031-exchange-platform`
4. Copy the key (starts with `sk-ant-api03-...`)
5. ⚠️ **Save it somewhere safe** - you can't view it again!

### Step 3: Add to Environment Variables

In your `.env` file:
```env
ANTHROPIC_API_KEY=sk-ant-api03-your_actual_key_here_xxxxxxxxxxxxx
```

**That's it!** Restart your dev server and Claude powers will activate.

## 💰 Pricing

Claude API uses the **Sonnet 3.5** model (best balance of speed, cost, and quality):

**Current Rates** (as of Jan 2025):
- **Input**: $3 per million tokens
- **Output**: $15 per million tokens

**Real-World Costs**:

| Operation | Tokens (approx) | Cost | Description |
|-----------|----------------|------|-------------|
| Match Reasoning | ~2K in + 500 out | $0.01 | Per property match |
| Creative Offers | ~3K in + 1K out | $0.02 | Per offer generation |
| Boot Strategy | ~2K in + 1K out | $0.02 | Per strategy set |

**Platform Economics**:
- **Per Property Submission**: ~7 matches × $0.01 = **$0.07**
- **Per Offer Generation**: 2-3 creative offers × $0.02 = **$0.04-0.06**
- **Total per transaction**: **~$0.15** in API costs

**If you charge 1-2% success fee** ($15K-$30K per transaction), API costs are **0.001% of revenue**.

### Free Tier
Anthropic gives **$5 free credits** when you sign up:
- ~70 property submissions
- ~350 match reasonings
- ~125 creative offer generations

Perfect for testing and early users!

## 🔄 Fallback Behavior

The platform works **with or without** Claude API:

### Without Claude API (No Key Set)
```
⚠️ ANTHROPIC_API_KEY not set - AI features will use fallback logic
```
- Uses **rule-based matching** (still pretty good!)
- Generates **standard 4 offer types** only
- No boot strategy recommendations
- Match reasoning is generic but functional

### With Claude API (Key Configured)
```
✅ Claude API available - using AI-powered features
```
- Uses **AI-powered reasoning** (much better!)
- Generates **6-7 offer types** (standard + creative)
- AI-recommended boot strategies
- Match reasoning is specific and insightful

**Key Point**: Platform never breaks. If Claude API is unavailable (network issue, rate limit, etc.), it automatically falls back to rule-based logic.

## 📊 Monitoring Usage

### Check Console Logs
When Claude API is used, you'll see:
```bash
# Success
✅ Claude reasoning generated for match <match-id>

# Fallback
⚠️ Claude API error, using fallback logic
```

### Check Anthropic Dashboard
1. Go to **https://console.anthropic.com/dashboard**
2. View **Usage** tab
3. See costs by day/month
4. Set spending limits to avoid surprises

### Set Spending Limit
1. Go to **Settings → Billing**
2. Set **Monthly Budget**: e.g., $50/month
3. Enable **Alerts** at 50%, 75%, 90%

## 🧪 Testing Claude Integration

### Verify Claude is Active

1. **Check build output**:
   ```bash
   npm run dev
   ```
   - If no key: `⚠️ ANTHROPIC_API_KEY not set`
   - If key set: No warning = active!

2. **Submit a test property**:
   - Go to `/intake`
   - Fill out questionnaire
   - Submit
   - Check match reasoning in results

3. **Compare reasoning quality**:

**Without Claude** (generic):
> "Strong match with notable benefits in key areas."

**With Claude** (specific):
> "This Phoenix NNN retail property eliminates your management burden entirely while delivering 6.8% cap rate vs your current 5.2%. Tenants on 15-year corporate lease handle all expenses, taxes, and maintenance. Arizona's zero income tax saves 13.3% vs California on your NOI. Trade your 12 units requiring active management for a single institutional-grade asset with mailbox money."

## 🛠️ Advanced Configuration

### Use Different Model

Want to use **Opus** (highest quality, slower, more expensive)?

Edit `lib/ai/claude-client.ts`:
```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-opus-20240229', // was: claude-3-5-sonnet-20241022
  max_tokens: 2048,
  messages: [...]
})
```

**Opus Pricing**:
- Input: $15/million tokens (5× more than Sonnet)
- Output: $75/million tokens (5× more than Sonnet)

**When to use Opus**:
- High-value transactions ($10M+ properties)
- Complex multi-party exchanges
- Legal/compliance-sensitive situations

### Adjust Token Limits

Control max response length:
```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-5-sonnet-20241022',
  max_tokens: 2048, // Increase for longer responses
  messages: [...]
})
```

**Token Guidelines**:
- Match reasoning: 1024 tokens (default)
- Creative offers: 2048 tokens (default)
- Boot strategies: 2048 tokens (default)

### Add Streaming (Coming Soon)

For real-time response display:
```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-3-5-sonnet-20241022',
  messages: [...]
})

for await (const chunk of stream) {
  // Display reasoning as it's generated
}
```

## 📈 Performance Optimization

### Caching (Anthropic Feature)

Claude automatically caches repeated prompts. If you're matching the same property against multiple candidates:

**First match**: Full API call (~2K tokens in)
**Subsequent matches**: Cached (~200 tokens in, 90% cheaper!)

This happens automatically - no code changes needed.

### Batch Processing

For high-volume scenarios (100+ properties), batch match generation:

```typescript
// Instead of one-by-one
for (const property of properties) {
  await generateMatchReasoning(property) // Slow
}

// Batch them
const promises = properties.map(p => generateMatchReasoning(p))
const results = await Promise.all(promises) // Fast
```

Anthropic allows up to **50 concurrent requests**.

## 🔒 Security Best Practices

1. **Never commit API key** to git
   - ✅ Keep in `.env`
   - ❌ Never in source code
   - Already in `.gitignore`

2. **Use environment-specific keys**
   - Development: One key
   - Production: Different key
   - Allows separate billing/monitoring

3. **Rotate keys periodically**
   - Generate new key every 90 days
   - Delete old keys in Anthropic Console

4. **Monitor for unusual usage**
   - Set spending alerts
   - Check dashboard weekly
   - If costs spike unexpectedly, investigate

## 🐛 Troubleshooting

### "API key not found" Error
```bash
Error: API key not found
```
**Solution**: Check `.env` file has `ANTHROPIC_API_KEY=sk-ant-...`

### "Rate limit exceeded" Error
```bash
Error: Rate limit exceeded
```
**Solution**:
- Free tier: 5 requests/minute
- Paid tier (credit card on file): 50 requests/minute
- Upgrade at https://console.anthropic.com/settings/billing

### "Invalid request" Error
```bash
Error: Invalid request
```
**Solution**: Check your API key is correct and active in Anthropic Console

### Responses Seem Generic
**Check**:
1. Is Claude API actually being called? Check console logs
2. Is the prompt detailed enough? See `lib/ai/claude-client.ts`
3. Try increasing `max_tokens` for longer responses

## 📚 Further Reading

- **Anthropic Docs**: https://docs.anthropic.com
- **Claude API Reference**: https://docs.anthropic.com/claude/reference
- **Pricing**: https://www.anthropic.com/pricing
- **Rate Limits**: https://docs.anthropic.com/claude/reference/rate-limits
- **Best Practices**: https://docs.anthropic.com/claude/docs/intro-to-claude

---

## ✅ Quick Start Checklist

- [ ] Sign up at https://console.anthropic.com
- [ ] Create API key
- [ ] Add to `.env` file: `ANTHROPIC_API_KEY=sk-ant-...`
- [ ] Restart dev server: `npm run dev`
- [ ] Verify no warnings in console
- [ ] Submit test property
- [ ] Check match reasoning quality (should be specific and insightful)
- [ ] Generate offers (should see 6-7 instead of 4)
- [ ] Set spending limit in Anthropic Console
- [ ] Monitor usage weekly

**Cost Estimate for Testing**: $0.50 - $1.00 (covered by free credits)

**Cost Estimate for 100 Transactions**: ~$15 in API costs (vs $150K-$300K in revenue)

---

🎉 **You're all set!** Claude will now power intelligent reasoning throughout the platform.
