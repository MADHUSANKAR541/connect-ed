import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const userId = params.id;
  if (!userId) {
    return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
  }
  const { error } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('id', userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ message: 'User approved' });
} 