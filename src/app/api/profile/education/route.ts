import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/profile/education - Get user educations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const { data: educations, error } = await supabase
    .from('educations')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ educations });
}

// POST /api/profile/education - Add user education
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, degree, institution, location, duration, gpa, description, isPublic } = body;
  if (!userId || !degree || !institution || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data: education, error } = await supabase
    .from('educations')
    .insert({
      user_id: userId,
      degree,
      institution,
      location,
      duration,
      gpa,
      description,
      is_public: isPublic ?? true,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ education });
} 