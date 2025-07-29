import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// GET /api/calls - Get all call requests for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('call_requests')
      .select(`
        *,
        sender:users!call_requests_sender_id_fkey (
          id,
          name,
          avatar,
          role
        ),
        receiver:users!call_requests_receiver_id_fkey (
          id,
          name,
          avatar,
          role
        )
      `)
      .or(`sender_id.eq.${session.user.id},receiver_id.eq.${session.user.id}`);

    if (status && status !== 'all') {
      query = query.eq('status', status.toUpperCase());
    }

    const { data: calls, error } = await query.order('scheduled_at', { ascending: true });

    if (error) {
      console.error('Error fetching calls:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ calls: calls || [] });
  } catch (error) {
    console.error('Error fetching calls:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
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