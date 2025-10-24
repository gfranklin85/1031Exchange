// Quick test script to verify Supabase connection
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Service Key (first 20 chars):', supabaseServiceKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Try to query the profiles table
const test = async () => {
  console.log('\nAttempting to query profiles table...')
  const { data, error } = await supabase.from('profiles').select('*').limit(1)

  if (error) {
    console.error('❌ Error:', error)
    console.error('Code:', error.code)
    console.error('Message:', error.message)
    console.error('Details:', error.details)
    console.error('Hint:', error.hint)
  } else {
    console.log('✅ Success! Connected to Supabase')
    console.log('Data:', data)
  }
}

test()
