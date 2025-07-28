import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/profile/experience - Get user experiences
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const { data: experiences, error } = await supabase
    .from('experiences')
    .select('*')
    .eq('user_id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ experiences });
}

// POST /api/profile/experience - Add user experience
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, title, company, location, duration, description, isPublic } = body;
  if (!userId || !title || !company || !duration) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data: experience, error } = await supabase
    .from('experiences')
    .insert({
      user_id: userId,
      title,
      company,
      location,
      duration,
      description,
      is_public: isPublic ?? true,
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ experience });
} 