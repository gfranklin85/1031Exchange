import { NextRequest, NextResponse } from 'next/server'
import { getServiceSupabase } from '@/lib/supabase/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ propertyId: string }> }
) {
  const { propertyId } = await params
  try {
    const supabase = getServiceSupabase()

    // Fetch matches where this property is the relinquished property
    const { data: matches, error } = await supabase
      .from('matches')
      .select(
        `
        *,
        property:replacement_property_id (*)
      `
      )
      .eq('relinquished_property_id', propertyId)
      .order('fit_score', { ascending: false })

    if (error) {
      console.error('Matches fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch matches' }, { status: 500 })
    }

    return NextResponse.json(matches || [])
  } catch (error) {
    console.error('Matches API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
