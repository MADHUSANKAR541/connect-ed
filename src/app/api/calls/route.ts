import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/calls - Get all call requests (optionally filter by user)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  let query = supabase.from('call_requests').select('*');
  if (userId) {
    query = query.or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
  }
  const { data: calls, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ calls });
}

// POST /api/calls - Create a new call request
export async function POST(request: NextRequest) {
  const body = await request.json();
  const { senderId, receiverId, title, description, scheduledAt, duration, type } = body;
  if (!senderId || !receiverId || !title || !scheduledAt || !duration || !type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const { data: call, error } = await supabase
    .from('call_requests')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      title,
      description,
      scheduled_at: scheduledAt,
      duration,
      type,
      status: 'PENDING',
    })
    .select()
    .single();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ call });
} 