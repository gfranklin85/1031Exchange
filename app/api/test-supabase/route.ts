import { NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = getServiceSupabase()

    console.log('Testing Supabase connection from Next.js API...')

    // Try a simple query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      })
    }

    console.log('Supabase connection successful!')
    return NextResponse.json({
      success: true,
      message: 'Connected to Supabase successfully',
      data,
    })
  } catch (err: any) {
    console.error('Exception:', err)
    return NextResponse.json({
      success: false,
      error: err.message,
      stack: err.stack,
    })
  }
}
