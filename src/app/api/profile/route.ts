import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/profile - Get user profile
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !user) {
    return NextResponse.json({ error: error?.message || 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ user });
}

// PATCH /api/profile - Update user profile
export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { userId, ...updateData } = body;
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }
  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();
  if (error || !user) {
    return NextResponse.json({ error: error?.message || 'Update failed' }, { status: 500 });
  }
  return NextResponse.json({ user });
} 