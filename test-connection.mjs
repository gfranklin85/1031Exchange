// Direct test of Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key (first 30 chars):', serviceKey?.substring(0, 30) + '...')

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Try a simple query
const { data, error } = await supabase
  .from('profiles')
  .select('count')
  .limit(1)

if (error) {
  console.log('\n❌ ERROR:', error)
  console.log('Message:', error.message)
  console.log('Code:', error.code)
  console.log('Details:', error.details)
  console.log('Hint:', error.hint)
} else {
  console.log('\n✅ SUCCESS! Connected to Supabase')
  console.log('Data:', data)
}

// Try inserting a test profile
console.log('\n\nTrying to insert test profile...')
const testId = crypto.randomUUID()
const { data: insertData, error: insertError } = await supabase
  .from('profiles')
  .insert({
    id: testId,
    email: 'test@example.com',
  })
  .select()

if (insertError) {
  console.log('❌ INSERT ERROR:', insertError.message)
  console.log('Code:', insertError.code)
  console.log('Details:', insertError.details)
} else {
  console.log('✅ INSERT SUCCESS!')
  console.log('Created:', insertData)

  // Clean up
  await supabase.from('profiles').delete().eq('id', testId)
  console.log('Test profile cleaned up')
}
